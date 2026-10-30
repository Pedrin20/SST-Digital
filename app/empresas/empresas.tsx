"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, Input, Select } from "@/src/components/ui";
import { PlusIcon } from "@/app/components/icons";

type Empresa = { id: number; nome: string; cnpj: string | null; ativo: boolean };
type Formulario = { nome: string; cnpj: string; ativo: boolean };
const vazio: Formulario = { nome: "", cnpj: "", ativo: true };
const limite = 50;

function empresa(value: unknown): Empresa | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const id = typeof item.id === "string" && /^\d+$/.test(item.id) ? Number(item.id) : item.id;
  if (typeof id !== "number" || !Number.isInteger(id) || typeof item.nome !== "string" || (item.cnpj !== null && typeof item.cnpj !== "string") || ![true, false, 0, 1].includes(item.ativo as boolean | number)) return null;
  return { id, nome: item.nome, cnpj: item.cnpj, ativo: item.ativo === true || item.ativo === 1 };
}
function lista(value: unknown): Empresa[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const rows = Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.empresas ?? envelope.results;
  if (!Array.isArray(rows)) throw new Error("A API retornou uma lista em formato desconhecido. Verifique o contrato de resposta de GET /empresas.");
  const parsed = rows.map(empresa);
  if (parsed.some(item => !item)) throw new Error("A API retornou uma empresa em formato desconhecido. Verifique o contrato de resposta.");
  return parsed as Empresa[];
}
function formatarCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}
async function requisicao(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetch(url, options);
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) throw new Error("Sua sessão expirou. Acesse a página de login para entrar novamente.");
    const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : "Não foi possível concluir a operação.";
    throw new Error(message);
  }
  return data;
}

export function Empresas() {
  const [rows, setRows] = useState<Empresa[]>([]);
  const [filtro, setFiltro] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [form, setForm] = useState<Formulario>(vazio);
  const [formErro, setFormErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [versao, setVersao] = useState(0);

  const carregar = useCallback(async (signal: AbortSignal) => {
    const query = new URLSearchParams({ limit: String(limite), offset: String(offset) });
    if (filtro) query.set("ativo", filtro);
    try { const data = await requisicao(`/api/empresas?${query}`, { signal }); if (!signal.aborted) setRows(lista(data)); }
    catch (error) { if (!signal.aborted) { setRows([]); setErro(error instanceof Error ? error.message : "Não foi possível carregar as empresas."); } }
    finally { if (!signal.aborted) setLoading(false); }
  }, [filtro, offset]);
  // A leitura acompanha os filtros e é cancelada quando eles mudam.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const controller = new AbortController(); void carregar(controller.signal); return () => controller.abort(); }, [carregar, versao]);

  async function abrir(item?: Empresa) {
    if (item) {
      try {
        const data = await requisicao(`/api/empresas/${item.id}`);
        const value = data && typeof data === "object" && "data" in data ? data.data : data;
        const detalhe = empresa(value);
        if (!detalhe) throw new Error("A API retornou os dados da empresa em formato desconhecido.");
        item = detalhe;
      } catch (error) { setErro(error instanceof Error ? error.message : "Não foi possível consultar a empresa."); return; }
    }
    setEditando(item ?? null); setForm(item ? { nome: item.nome, cnpj: formatarCnpj(item.cnpj ?? ""), ativo: item.ativo } : vazio); setFormErro(""); setModal(true);
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cnpj = form.cnpj.replace(/\D/g, "");
    if (!form.nome.trim() || (cnpj.length !== 14 && !(editando?.cnpj === null && cnpj.length === 0))) { setFormErro("Informe o nome e um CNPJ com 14 dígitos."); return; }
    setSalvando(true); setFormErro("");
    try {
      await requisicao(editando ? `/api/empresas/${editando.id}` : "/api/empresas", { method: editando ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: form.nome.trim(), ...(cnpj ? { cnpj } : {}), ativo: form.ativo }) });
      setModal(false); setLoading(true); setErro(""); setOffset(0); setVersao(v => v + 1);
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setSalvando(false); }
  }

  return <>
    <nav aria-label="Trilha de navegação" className="pt-5 text-[11px] text-muted"><a href="/dashboard" className="font-medium text-brand-900 hover:underline">SST Digital</a><span className="mx-2">/</span><span aria-current="page">Empresas</span></nav>
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold tracking-[0.12em] text-brand-700 uppercase">Cadastros</p><h1 className="mt-1 text-[26px] font-semibold tracking-tight text-brand-900">Empresas</h1><p className="mt-1 text-[12px] text-muted">Consulte e gerencie as empresas cadastradas na plataforma.</p></div><Button onClick={() => abrir()} className="px-4"><PlusIcon className="h-4 w-4" /> Nova empresa</Button></div>
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5"><div><h2 className="text-[14px] font-semibold text-ink">Empresas cadastradas</h2><p className="mt-1 text-[11px] text-muted">Acompanhe os dados e a situação de cada empresa.</p></div><div className="w-full sm:w-44"><Select label="Situação" value={filtro} onChange={e => { setLoading(true); setErro(""); setFiltro(e.target.value); setOffset(0); }}><option value="">Todas</option><option value="true">Ativas</option><option value="false">Inativas</option></Select></div></div>
      {loading ? <p className="p-6 text-[12px] text-muted" role="status">Carregando empresas...</p> : erro ? <div role="alert" className="p-6 text-[12px] text-critical-text"><p>{erro}</p><Button variant="secondary" className="mt-3" onClick={() => { setLoading(true); setErro(""); setVersao(v => v + 1); }}>Tentar novamente</Button></div> : rows.length === 0 ? <div className="p-8 text-center"><p className="text-[13px] font-semibold">Nenhuma empresa encontrada</p><p className="mt-1 text-[11px] text-muted">Altere o filtro ou cadastre uma nova empresa.</p></div> : <ul className="divide-y divide-line">{rows.map(item => <li key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="break-words text-[13px] font-semibold text-ink">{item.nome}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.ativo ? "bg-success-bg text-success-text" : "bg-cream-100 text-muted"}`}>{item.ativo ? "Ativa" : "Inativa"}</span></div><p className="mt-1 text-[11px] text-muted">CNPJ {item.cnpj ? formatarCnpj(item.cnpj) : "não informado"} <span className="mx-1">·</span> ID {item.id}</p></div><Button variant="secondary" onClick={() => abrir(item)} aria-label={`Editar ${item.nome}`}>Editar</Button></li>)}</ul>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-cream-50/70 px-4 py-3 sm:px-5"><p className="text-[11px] text-muted">{loading ? "Carregando..." : `${rows.length} empresa(s) nesta página`}</p><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setLoading(true); setOffset(v => Math.max(0, v - limite)); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < limite} onClick={() => { setLoading(true); setOffset(v => v + limite); }}>Próxima</Button></div></div>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando ? "Editar empresa" : "Nova empresa"}><form onSubmit={salvar} className="space-y-4"><p className="text-[11px] text-muted">{editando ? "Atualize os dados da empresa." : "Preencha os dados para cadastrar uma empresa. Apenas administradores podem cadastrar."}</p>{formErro && <p role="alert" className="rounded-lg border border-critical-border bg-critical-bg p-3 text-[11px] text-critical-text">{formErro}</p>}<Input label="Nome da empresa" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required disabled={salvando} /><Input label="CNPJ" value={form.cnpj} onChange={e => setForm({ ...form, cnpj: formatarCnpj(e.target.value) })} placeholder="00.000.000/0000-00" inputMode="numeric" required={editando?.cnpj !== null} disabled={salvando} /><Select label="Situação" value={String(form.ativo)} onChange={e => setForm({ ...form, ativo: e.target.value === "true" })} disabled={salvando}><option value="true">Ativa</option><option value="false">Inativa</option></Select><div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar empresa"}</Button></div></form></Dialog>
  </>;
}

