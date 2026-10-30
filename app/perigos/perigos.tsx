"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, Input, PageHeader, Textarea } from "@/src/components/ui";
import { lerDetalhe, lerLista, perigoPayload, type Perigo } from "@/src/lib/perigos/schema";
const vazio = { setor_id: "", descricao: "", fonte: "", consequencias: "" };
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Perigos() {
  const [rows, setRows] = useState<Perigo[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [setor, setSetor] = useState(""), [filtros, setFiltros] = useState({ setor: "" });
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<number | null>(null), [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    if (filtros.setor) query.set("setor_id", filtros.setor);
    request(`/api/perigos?${query}`, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      try { setRows(lerLista(data)); } catch { setRows([]); setErro("A resposta da API não corresponde aos dados esperados de perigos."); }
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtros, offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function abrir(id?: number) {
    if (consultando !== null) return;
    setFormErro(""); setFields({});
    if (id !== undefined) {
      setConsultando(id);
      try { const perigo = lerDetalhe(await request(`/api/perigos/${id}`)); setForm({ descricao: perigo.descricao, fonte: perigo.fonte, consequencias: perigo.consequencias, setor_id: String(perigo.setor_id) }); setEditando(id); setModal(true); }
      catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados do perigo."); }
      finally { setConsultando(null); }
    } else { setForm({ ...vazio, setor_id: filtros.setor }); setEditando(null); setModal(true); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = perigoPayload.safeParse({ ...form, setor_id: Number(form.setor_id) });
    if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request(editando === null ? "/api/perigos" : `/api/perigos/${editando}`, { method: editando === null ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Perigo salvo com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Perigos" description="Identifique os perigos, suas fontes e possíveis consequências em cada setor." actions={<Button disabled={consultando !== null} onClick={() => void abrir()}>Novo perigo</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="flex flex-wrap items-end gap-3 border-b border-line p-5" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltros({ setor }); recarregar(); }}>
        <Input label="Filtrar por ID do setor" type="number" min="1" step="1" value={setor} onChange={e => setSetor(e.target.value)} placeholder="Todos os setores" />
        <Button type="submit" variant="secondary">Aplicar filtro</Button>
        <Button variant="ghost" onClick={() => { setSetor(""); setFiltros({ setor: "" }); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando perigos...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhum perigo encontrado" description="Ajuste o filtro ou cadastre um perigo." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Perigos cadastrados</caption><thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Descrição", "Setor", "Fonte", "Consequências", "Ações"].map(t => <th scope="col" key={t} className="p-4">{t}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id} className="align-top hover:bg-cream-50"><td className="max-w-sm whitespace-pre-wrap break-words p-4"><strong>{item.descricao}</strong><p className="text-xs text-muted">ID {item.id}</p></td><td className="p-4">ID {item.setor_id}</td><td className="max-w-sm whitespace-pre-wrap break-words p-4">{item.fonte || "Não informada"}</td><td className="max-w-sm whitespace-pre-wrap break-words p-4">{item.consequencias || "Não informadas"}</td><td className="p-4"><Button variant="secondary" disabled={consultando !== null} onClick={() => void abrir(item.id)} aria-label={`Editar perigo ${item.id}`}>{consultando === item.id ? "Carregando..." : "Editar"}</Button></td></tr>)}</tbody></table></div>}
      <nav aria-label="Paginação de perigos" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} perigos`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando === null ? "Novo perigo" : "Editar perigo"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <Input label="ID do setor" type="number" min="1" step="1" required disabled={salvando} value={form.setor_id} error={fields.setor_id?.[0]} onChange={e => setForm({ ...form, setor_id: e.target.value })} />
        <p className="text-xs text-muted">Use o identificador exibido no cadastro de Setores.</p>
        <Textarea label="Descrição do perigo" required disabled={salvando} value={form.descricao} error={fields.descricao?.[0]} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Partes móveis de máquina sem proteção" />
        <Textarea label="Fonte" disabled={salvando} value={form.fonte} error={fields.fonte?.[0]} onChange={e => setForm({ ...form, fonte: e.target.value })} placeholder="Ex.: Prensa hidráulica na linha de produção" />
        <Textarea label="Consequências" disabled={salvando} value={form.consequencias} error={fields.consequencias?.[0]} onChange={e => setForm({ ...form, consequencias: e.target.value })} placeholder="Descreva os possíveis danos associados ao perigo" />
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar perigo"}</Button></div>
      </form>
    </Dialog>
  </>;
}
