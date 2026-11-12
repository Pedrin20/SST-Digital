"use client";
import { SeletorRelacionamento, useOpcoesRelacionamento } from "@/src/components/seletor-relacionamento";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, Input, PageHeader, Select } from "@/src/components/ui";
import { equipamentoPayload, lerDetalhe, lerLista, type Equipamento } from "@/src/lib/equipamentos/schema";

const opcoesStatus = <>
  <option value="ATIVO">Ativo</option>
  <option value="EM_MANUTENCAO">Em manutenção</option>
  <option value="INATIVO">Inativo</option>
</>;

const vazio = { setor_id: "", nome: "", tipo: "", patrimonio: "", status: "ATIVO", proxima_inspecao: "" };
const filtrosVazios = { setor_id: "", status: "" };
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Equipamentos() {
  const [rows, setRows] = useState<Equipamento[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [entrada, setEntrada] = useState(filtrosVazios), [filtros, setFiltros] = useState(filtrosVazios);
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<number | null>(null), [form, setForm] = useState(vazio);
  const [inativacao, setInativacao] = useState<Equipamento | null>(null), [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  const opcoesSetores = useOpcoesRelacionamento("setores");
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    for (const [key, value] of Object.entries(filtros)) if (value.trim()) query.set(key, value.trim());
    request(`/api/equipamentos?${query}`, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      try { setRows(lerLista(data)); } catch { setRows([]); setErro("A resposta da API não corresponde aos dados esperados de equipamentos."); }
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtros, offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function abrir(id?: number) {
    if (consultando !== null) return;
    setFormErro(""); setFields({}); setAviso("");
    if (id !== undefined) {
      setConsultando(id);
      try { const item = lerDetalhe(await request(`/api/equipamentos/${id}`)); setForm({ setor_id: String(item.setor_id), nome: item.nome, tipo: item.tipo, patrimonio: item.patrimonio, status: item.status, proxima_inspecao: item.proxima_inspecao }); setEditando(id); setModal(true); }
      catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados do equipamento."); }
      finally { setConsultando(null); }
    } else { setForm({ ...vazio, setor_id: filtros.setor_id }); setEditando(null); setModal(true); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = equipamentoPayload.safeParse({ ...form, setor_id: Number(form.setor_id), patrimonio: form.patrimonio.trim() || null });
    if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request(editando === null ? "/api/equipamentos" : `/api/equipamentos/${editando}`, { method: editando === null ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Equipamento salvo com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  async function inativar() {
    if (!inativacao || salvando) return;
    setSalvando(true); setFormErro("");
    try { await request(`/api/equipamentos/${inativacao.id}`, { method: "DELETE" }); setInativacao(null); setAviso("Equipamento inativado com sucesso. O histórico foi preservado."); recarregar(); }
    catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível inativar o equipamento."); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Equipamentos" description="Cadastre equipamentos e acompanhe sua situação e próximas inspeções." actions={<Button disabled={consultando !== null} onClick={() => void abrir()}>Novo equipamento</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="grid grid-cols-1 items-end gap-3 border-b border-line p-5 sm:grid-cols-2 xl:flex xl:flex-wrap" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltros(entrada); recarregar(); }}>
        <SeletorRelacionamento label="Setor" fonte={opcoesSetores} value={entrada.setor_id} onChange={id => setEntrada({ ...entrada, setor_id: id })} placeholder="Todos os setores" />
        <Select label="Status" value={entrada.status} onChange={e => setEntrada({ ...entrada, status: e.target.value })}><option value="">Todos</option>{opcoesStatus}</Select>
        <Button type="submit" variant="secondary">Aplicar filtros</Button><Button variant="ghost" onClick={() => { setEntrada(filtrosVazios); setFiltros(filtrosVazios); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando equipamentos...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhum equipamento encontrado" description="Ajuste os filtros ou cadastre um equipamento." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Equipamentos cadastrados</caption><thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Equipamento", "Setor", "Tipo", "Patrimônio", "Status", "Próxima inspeção", "Opções"].map(t => <th scope="col" key={t} className="p-4">{t}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id} className="align-top hover:bg-cream-50"><td className="max-w-sm break-words p-4"><strong>{item.nome}</strong><p className="text-xs text-muted">ID {item.id}</p></td><td className="p-4">ID {item.setor_id}</td><td className="p-4">{item.tipo}</td><td className="p-4">{item.patrimonio || "Não informado"}</td><td className="p-4">{item.status.replaceAll("_", " ")}</td><td className="p-4">{item.proxima_inspecao.split("-").reverse().join("/")}</td><td className="p-4"><div className="flex gap-2"><Button variant="secondary" disabled={consultando !== null} onClick={() => void abrir(item.id)} aria-label={`Editar equipamento ${item.id}`}>{consultando === item.id ? "Carregando..." : "Editar"}</Button>{item.status !== "INATIVO" && <Button variant="ghost" onClick={() => { setFormErro(""); setInativacao(item); }} aria-label={`Excluir equipamento ${item.id}`}>Excluir</Button>}</div></td></tr>)}</tbody></table></div>}
      <nav aria-label="Paginação de equipamentos" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} equipamentos`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando === null ? "Novo equipamento" : "Editar equipamento"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <SeletorRelacionamento label="Setor" fonte={opcoesSetores} required disabled={salvando} value={form.setor_id} error={fields.setor_id?.[0]} onChange={id => setForm({ ...form, setor_id: id })} />
        <Input label="Nome do equipamento" required disabled={salvando} value={form.nome} error={fields.nome?.[0]} onChange={e => setForm({ ...form, nome: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Tipo" required disabled={salvando} value={form.tipo} error={fields.tipo?.[0]} onChange={e => setForm({ ...form, tipo: e.target.value })} /><Input label="Patrimônio" disabled={salvando} value={form.patrimonio} error={fields.patrimonio?.[0]} onChange={e => setForm({ ...form, patrimonio: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><Select label="Status" required disabled={salvando} value={form.status} error={fields.status?.[0]} onChange={e => setForm({ ...form, status: e.target.value })}>{opcoesStatus}</Select><Input label="Próxima inspeção" type="date" required disabled={salvando} value={form.proxima_inspecao} error={fields.proxima_inspecao?.[0]} onChange={e => setForm({ ...form, proxima_inspecao: e.target.value })} /></div>
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar equipamento"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={inativacao !== null} onClose={() => { if (!salvando) setInativacao(null); }} title="Inativar equipamento">
      <p className="text-sm">Deseja excluir o equipamento {inativacao?.nome} (ID {inativacao?.id})? O histórico será preservado.</p>
      {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setInativacao(null)}>Voltar</Button><Button disabled={salvando} onClick={() => void inativar()}>{salvando ? "Inativando..." : "Confirmar exclução"}</Button></div>
    </Dialog>
  </>;
}
