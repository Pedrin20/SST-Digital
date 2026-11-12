"use client";
import { SeletorRelacionamento, useOpcoesRelacionamento } from "@/src/components/seletor-relacionamento";
import { buscarPagina, type VinculoEstrutura } from "@/src/lib/estrutura";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Badge, Button, Card, Dialog, EmptyState, Input, PageHeader, Select } from "@/src/components/ui";
import { lerDetalhe, lerLista, setorPayload, type Setor } from "@/src/lib/setores/schema";
const vazio = { unidade_id: "", nome: "", ativo: true };
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Setores({ contexto }: { contexto?: VinculoEstrutura }) {
  const idContexto = contexto ? String(contexto.id) : "";
  const [nome, setNome] = useState("");
  const [rows, setRows] = useState<Setor[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [unidade, setUnidade] = useState(idContexto), [situacao, setSituacao] = useState(""), [filtros, setFiltros] = useState({ unidade: idContexto, situacao: "", nome: "" });
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<number | null>(null), [form, setForm] = useState(vazio);
  const [exclusao, setExclusao] = useState<Setor | null>(null);
  const [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  const opcoesUnidades = useOpcoesRelacionamento("unidades", !contexto || (modal && editando !== null));
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    if (filtros.unidade) query.set("unidade_id", filtros.unidade);
    if (filtros.situacao) query.set("ativo", filtros.situacao);
    buscarPagina(filtros.nome, offset, async inicio => {
      query.set("offset", String(inicio));
      const data = await request(`/api/setores?${query}`, { signal: controller.signal });
      return lerLista(data);
    }).then(itens => {
      if (!controller.signal.aborted) setRows(itens);
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error instanceof RequestError ? error.message : "Não foi possível carregar a lista."); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtros, offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function abrir(id?: number) {
    if (consultando !== null) return;
    setFormErro(""); setFields({});
    if (id !== undefined) {
      setConsultando(id);
      try { const setor = lerDetalhe(await request(`/api/setores/${id}`)); setForm({ nome: setor.nome, ativo: setor.ativo, unidade_id: String(setor.unidade_id) }); setEditando(id); setModal(true); }
      catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados do setor."); }
      finally { setConsultando(null); }
    } else { setForm({ ...vazio, unidade_id: filtros.unidade }); setEditando(null); setModal(true); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = setorPayload.safeParse({ ...form, unidade_id: Number(form.unidade_id) });
    if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request(editando === null ? "/api/setores" : `/api/setores/${editando}`, { method: editando === null ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Setor salvo com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  async function excluir() {
    if (!exclusao || salvando) return;
    setSalvando(true); setFormErro("");
    try { await request(`/api/setores/${exclusao.id}`, { method: "DELETE" }); setExclusao(null); setAviso("Setor excluído com sucesso."); setOffset(0); recarregar(); }
    catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível excluir o setor."); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Setores" description="Cadastre e acompanhe os setores de cada unidade." actions={<Button disabled={consultando !== null} onClick={() => void abrir()}>Novo setor</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltros({ unidade, situacao, nome }); recarregar(); }}>
        <Input label="Buscar setor por nome" type="search" value={nome} onChange={e => setNome(e.target.value)} />
        {!contexto && <SeletorRelacionamento label="Unidade" fonte={opcoesUnidades} value={unidade} onChange={id => setUnidade(id)} placeholder="Todas as unidades" />}
        <Select label="Situação" value={situacao} onChange={e => setSituacao(e.target.value)}><option value="">Todas</option><option value="true">Ativos</option><option value="false">Inativos</option></Select>
        <Button type="submit" variant="secondary">Aplicar filtros</Button>
        <Button variant="ghost" onClick={() => { setUnidade(idContexto); setNome(""); setSituacao(""); setFiltros({ unidade: idContexto, situacao: "", nome: "" }); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando setores...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhum setor encontrado" description="Ajuste os filtros ou cadastre um setor." /> : <ul className="divide-y divide-line">
        {rows.map(item => <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><strong className="break-words text-sm">{item.nome}</strong>
              <Badge variant={item.ativo ? "success" : "neutral"}>{item.ativo ? "Ativo" : "Inativo"}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">ID {item.id} · Unidade {contexto?.nome ?? `#${item.unidade_id}`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={consultando !== null} onClick={() => void abrir(item.id)} aria-label={`Editar ${item.nome}`}>{consultando === item.id ? "Carregando..." : "Editar"}</Button>
            <Button variant="ghost" onClick={() => { setFormErro(""); setExclusao(item); }} aria-label={`Excluir setor ${item.id}`}>Excluir</Button>
          </div>
        </li>)}
      </ul>}
      <nav aria-label="Paginação de setores" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} setores`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando === null ? "Novo setor" : "Editar setor"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        {contexto && editando === null ? <Input label="Unidade" value={`${contexto.id} — ${contexto.nome}`} readOnly /> : <SeletorRelacionamento label="Unidade" fonte={opcoesUnidades} required disabled={salvando} value={form.unidade_id} error={fields.unidade_id?.[0]} onChange={id => setForm({ ...form, unidade_id: id })} />}
        <Input label="Nome do setor" required disabled={salvando} value={form.nome} error={fields.nome?.[0]} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Usinagem" />
        <Select label="Situação" disabled={salvando} value={String(form.ativo)} error={fields.ativo?.[0]} onChange={e => setForm({ ...form, ativo: e.target.value === "true" })}><option value="true">Ativa</option><option value="false">Inativa</option></Select>
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar setor"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={exclusao !== null} onClose={() => { if (!salvando) setExclusao(null); }} title="Excluir setor">
      <p className="text-sm">Deseja excluir o setor {exclusao?.nome} (ID {exclusao?.id})?</p>
      {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setExclusao(null)}>Voltar</Button><Button disabled={salvando} onClick={() => void excluir()}>{salvando ? "Excluindo..." : "Confirmar exclusão"}</Button></div>
    </Dialog>
  </>;
}


