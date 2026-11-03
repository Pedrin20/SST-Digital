"use client";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, Input, PageHeader } from "@/src/components/ui";
import { documentoPayload, lerDetalhe, lerLista, type Documento } from "@/src/lib/documentos/schema";

const vazio = { unidade_id: "", titulo: "", tipo: "", versao: "", arquivo_chave: "", validade: "" };
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Documentos() {
  const [rows, setRows] = useState<Documento[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [unidade, setUnidade] = useState(""), [filtro, setFiltro] = useState("");
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<number | null>(null), [form, setForm] = useState(vazio);
  const [exclusao, setExclusao] = useState<Documento | null>(null), [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    if (filtro) query.set("unidade_id", filtro);
    request(`/api/documentos?${query}`, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      try { setRows(lerLista(data)); } catch { setRows([]); setErro("A resposta da API não corresponde aos dados esperados de documentos."); }
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtro, offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function abrir(id?: number) {
    if (consultando !== null) return;
    setFormErro(""); setFields({}); setAviso("");
    if (id !== undefined) {
      setConsultando(id);
      try { const item = lerDetalhe(await request(`/api/documentos/${id}`)); setForm({ unidade_id: String(item.unidade_id), titulo: item.titulo, tipo: item.tipo, versao: item.versao, arquivo_chave: item.arquivo_chave, validade: item.validade }); setEditando(id); setModal(true); }
      catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados do documento."); }
      finally { setConsultando(null); }
    } else { setForm({ ...vazio, unidade_id: filtro }); setEditando(null); setModal(true); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = documentoPayload.safeParse({ ...form, unidade_id: Number(form.unidade_id), versao: form.versao.trim() || null, arquivo_chave: form.arquivo_chave.trim() || null, validade: form.validade || null });
    if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request(editando === null ? "/api/documentos" : `/api/documentos/${editando}`, { method: editando === null ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Documento salvo com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  async function excluir() {
    if (!exclusao || salvando) return;
    setSalvando(true); setFormErro("");
    try { await request(`/api/documentos/${exclusao.id}`, { method: "DELETE" }); setExclusao(null); setAviso("Documento excluído com sucesso."); setOffset(0); recarregar(); }
    catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível excluir o documento."); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Documentos" description="Cadastre e acompanhe os documentos de cada unidade." actions={<Button disabled={consultando !== null} onClick={() => void abrir()}>Novo documento</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="flex flex-wrap items-end gap-3 border-b border-line p-5" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltro(unidade); recarregar(); }}>
        <Input label="Filtrar por ID da unidade" type="number" min="1" step="1" value={unidade} onChange={e => setUnidade(e.target.value)} placeholder="Todas as unidades" />
        <Button type="submit" variant="secondary">Aplicar filtro</Button><Button variant="ghost" onClick={() => { setUnidade(""); setFiltro(""); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando documentos...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhum documento encontrado" description="Ajuste o filtro ou cadastre um documento." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Documentos cadastrados</caption><thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Documento", "Unidade", "Tipo", "Versão", "Chave do arquivo", "Validade", "Opções"].map(t => <th scope="col" key={t} className="p-4">{t}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id} className="align-top hover:bg-cream-50"><td className="max-w-sm break-words p-4"><strong>{item.titulo}</strong><p className="text-xs text-muted">ID {item.id}</p></td><td className="p-4">ID {item.unidade_id}</td><td className="p-4">{item.tipo || "Não informado"}</td><td className="p-4">{item.versao || "Não informada"}</td><td className="max-w-xs break-all p-4">{item.arquivo_chave || "Não informada"}</td><td className="p-4">{item.validade ? item.validade.split("-").reverse().join("/") : "Não informada"}</td><td className="p-4"><div className="flex gap-2"><Button variant="secondary" disabled={consultando !== null} onClick={() => void abrir(item.id)} aria-label={`Editar documento ${item.id}`}>{consultando === item.id ? "Carregando..." : "Editar"}</Button><Button variant="ghost" onClick={() => { setFormErro(""); setExclusao(item); }} aria-label={`Excluir documento ${item.id}`}>Excluir</Button></div></td></tr>)}</tbody></table></div>}
      <nav aria-label="Paginação de documentos" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} documentos`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando === null ? "Novo documento" : "Editar documento"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <Input label="ID da unidade" type="number" min="1" step="1" required disabled={salvando} value={form.unidade_id} error={fields.unidade_id?.[0]} onChange={e => setForm({ ...form, unidade_id: e.target.value })} />
        <p className="text-xs text-muted">Use o identificador exibido no cadastro de Unidades.</p>
        <Input label="Título" required disabled={salvando} value={form.titulo} error={fields.titulo?.[0]} onChange={e => setForm({ ...form, titulo: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Tipo" required disabled={salvando} value={form.tipo} error={fields.tipo?.[0]} onChange={e => setForm({ ...form, tipo: e.target.value })} /><Input label="Versão" disabled={salvando} value={form.versao} error={fields.versao?.[0]} onChange={e => setForm({ ...form, versao: e.target.value })} /></div>
        <Input label="Chave do arquivo" disabled={salvando} value={form.arquivo_chave} error={fields.arquivo_chave?.[0]} onChange={e => setForm({ ...form, arquivo_chave: e.target.value })} />
        <Input label="Validade" type="date" disabled={salvando} value={form.validade} error={fields.validade?.[0]} onChange={e => setForm({ ...form, validade: e.target.value })} />
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar documento"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={exclusao !== null} onClose={() => { if (!salvando) setExclusao(null); }} title="Excluir documento">
      <p className="text-sm">Deseja excluir permanentemente o documento {exclusao?.titulo} (ID {exclusao?.id})? Esta operação não pode ser desfeita.</p>
      {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setExclusao(null)}>Voltar</Button><Button disabled={salvando} onClick={() => void excluir()}>{salvando ? "Excluindo..." : "Confirmar exclusão"}</Button></div>
    </Dialog>
  </>;
}
