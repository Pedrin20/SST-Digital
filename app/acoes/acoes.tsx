"use client";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, Input, PageHeader, Textarea } from "@/src/components/ui";
import { acaoPayload, lerDetalhe, lerLista, type Acao } from "@/src/lib/acoes/schema";

const vazio = { perigo_id: "", descricao: "", responsavel_id: "", prazo: "", status: "PENDENTE" };
const filtrosVazios = { perigo_id: "", responsavel_id: "", status: "" };
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Acoes() {
  const [rows, setRows] = useState<Acao[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [entrada, setEntrada] = useState(filtrosVazios), [filtros, setFiltros] = useState(filtrosVazios);
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<number | null>(null), [form, setForm] = useState(vazio);
  const [cancelamento, setCancelamento] = useState<Acao | null>(null), [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    for (const [key, value] of Object.entries(filtros)) if (value.trim()) query.set(key, value.trim());
    request(`/api/acoes?${query}`, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      try { setRows(lerLista(data)); } catch { setRows([]); setErro("A resposta da API não corresponde aos dados esperados de ações."); }
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtros, offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function abrir(id?: number) {
    if (consultando !== null) return;
    setFormErro(""); setFields({}); setAviso("");
    if (id !== undefined) {
      setConsultando(id);
      try { const acao = lerDetalhe(await request(`/api/acoes/${id}`)); setForm({ perigo_id: String(acao.perigo_id), descricao: acao.descricao, responsavel_id: String(acao.responsavel_id), prazo: acao.prazo, status: acao.status }); setEditando(id); setModal(true); }
      catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados da ação."); }
      finally { setConsultando(null); }
    } else { setForm({ ...vazio, perigo_id: filtros.perigo_id, responsavel_id: filtros.responsavel_id }); setEditando(null); setModal(true); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = acaoPayload.safeParse({ ...form, perigo_id: Number(form.perigo_id), responsavel_id: Number(form.responsavel_id) });
    if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request(editando === null ? "/api/acoes" : `/api/acoes/${editando}`, { method: editando === null ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Ação salva com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  async function cancelar() {
    if (!cancelamento || salvando) return;
    setSalvando(true); setFormErro("");
    try { await request(`/api/acoes/${cancelamento.id}`, { method: "DELETE" }); setCancelamento(null); setAviso("Ação cancelada com sucesso. O histórico foi preservado."); recarregar(); }
    catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível cancelar a ação."); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Ações" description="Acompanhe as ações relacionadas aos perigos, seus responsáveis e prazos." actions={<Button disabled={consultando !== null} onClick={() => void abrir()}>Nova ação</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="flex flex-wrap items-end gap-3 border-b border-line p-5" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltros(entrada); recarregar(); }}>
        <Input label="ID do perigo" type="number" min="1" step="1" value={entrada.perigo_id} onChange={e => setEntrada({ ...entrada, perigo_id: e.target.value })} placeholder="Todos" />
        <Input label="ID do responsável" type="number" min="1" step="1" value={entrada.responsavel_id} onChange={e => setEntrada({ ...entrada, responsavel_id: e.target.value })} placeholder="Todos" />
        <Input label="Status" value={entrada.status} onChange={e => setEntrada({ ...entrada, status: e.target.value })} placeholder="Todos" />
        <Button type="submit" variant="secondary">Aplicar filtros</Button><Button variant="ghost" onClick={() => { setEntrada(filtrosVazios); setFiltros(filtrosVazios); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando ações...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhuma ação encontrada" description="Ajuste os filtros ou cadastre uma ação." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Ações cadastradas</caption><thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Descrição", "Perigo", "Responsável", "Prazo", "Status", "Opções"].map(t => <th scope="col" key={t} className="p-4">{t}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id} className="align-top hover:bg-cream-50"><td className="max-w-sm whitespace-pre-wrap break-words p-4"><strong>{item.descricao}</strong><p className="text-xs text-muted">ID {item.id}</p></td><td className="p-4">ID {item.perigo_id}</td><td className="p-4">ID {item.responsavel_id}</td><td className="p-4">{item.prazo.split("-").reverse().join("/")}</td><td className="p-4">{item.status.replaceAll("_", " ")}</td><td className="p-4"><div className="flex gap-2"><Button variant="secondary" disabled={consultando !== null} onClick={() => void abrir(item.id)} aria-label={`Editar ação ${item.id}`}>{consultando === item.id ? "Carregando..." : "Editar"}</Button>{item.status !== "CANCELADA" && <Button variant="ghost" onClick={() => { setFormErro(""); setCancelamento(item); }} aria-label={`Cancelar ação ${item.id}`}>Cancelar ação</Button>}</div></td></tr>)}</tbody></table></div>}
      <nav aria-label="Paginação de ações" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} ações`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando === null ? "Nova ação" : "Editar ação"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <div className="grid gap-4 sm:grid-cols-2"><Input label="ID do perigo" type="number" min="1" step="1" required disabled={salvando} value={form.perigo_id} error={fields.perigo_id?.[0]} onChange={e => setForm({ ...form, perigo_id: e.target.value })} /><Input label="ID do responsável" type="number" min="1" step="1" required disabled={salvando} value={form.responsavel_id} error={fields.responsavel_id?.[0]} onChange={e => setForm({ ...form, responsavel_id: e.target.value })} /></div>
        <p className="text-xs text-muted">Use os identificadores dos cadastros de Perigos e Usuários.</p>
        <Textarea label="Descrição da ação" required disabled={salvando} value={form.descricao} error={fields.descricao?.[0]} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva a medida a ser executada" />
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Prazo" type="date" required disabled={salvando} value={form.prazo} error={fields.prazo?.[0]} onChange={e => setForm({ ...form, prazo: e.target.value })} /><Input label="Status" required disabled={salvando} value={form.status} error={fields.status?.[0]} onChange={e => setForm({ ...form, status: e.target.value })} /></div>
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar ação"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={cancelamento !== null} onClose={() => { if (!salvando) setCancelamento(null); }} title="Cancelar ação">
      <p className="text-sm">Deseja cancelar a ação #{cancelamento?.id}? O histórico será preservado.</p>
      {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setCancelamento(null)}>Voltar</Button><Button disabled={salvando} onClick={() => void cancelar()}>{salvando ? "Cancelando..." : "Confirmar cancelamento"}</Button></div>
    </Dialog>
  </>;
}
