"use client";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Badge, Button, Card, Dialog, EmptyState, Input, PageHeader, Select } from "@/src/components/ui";
import { lerDetalhe, lerLista, unidadePayload, type Unidade } from "@/src/lib/unidades/schema";
const vazio = { empresa_id: "", nome: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", cep: "", telefone: "", cnpj_estabelecimento: "", quantidade_empregados: "", quantidade_atualizada_em: "", cnae_preponderante: "", grau_risco: "", ativo: true };
const camposTexto = ["numero", "complemento", "bairro", "cidade", "uf", "cep", "telefone", "cnpj_estabelecimento", "quantidade_atualizada_em", "cnae_preponderante"] as const;
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Unidades() {
  const [rows, setRows] = useState<Unidade[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [empresa, setEmpresa] = useState(""), [situacao, setSituacao] = useState(""), [filtros, setFiltros] = useState({ empresa: "", situacao: "" });
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<number | null>(null), [form, setForm] = useState(vazio);
  const [exclusao, setExclusao] = useState<Unidade | null>(null);
  const [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    if (filtros.empresa) query.set("empresa_id", filtros.empresa);
    if (filtros.situacao) query.set("ativo", filtros.situacao);
    request(`/api/unidades?${query}`, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      try { setRows(lerLista(data)); } catch { setRows([]); setErro("A resposta da API não corresponde aos dados esperados de unidades."); }
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtros, offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function abrir(id?: number) {
    if (consultando !== null) return;
    setFormErro(""); setFields({});
    if (id !== undefined) {
      setConsultando(id);
      try { const unidade = lerDetalhe(await request(`/api/unidades/${id}`)); setForm({ ...vazio, ...Object.fromEntries(camposTexto.map(key => [key, unidade[key] ?? ""])), nome: unidade.nome, endereco: unidade.endereco, ativo: unidade.ativo, empresa_id: String(unidade.empresa_id), quantidade_empregados: unidade.quantidade_empregados == null ? "" : String(unidade.quantidade_empregados), grau_risco: unidade.grau_risco == null ? "" : String(unidade.grau_risco), quantidade_atualizada_em: unidade.quantidade_atualizada_em?.slice(0, 10) ?? "" }); setEditando(id); setModal(true); }
      catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados da unidade."); }
      finally { setConsultando(null); }
    } else { setForm({ ...vazio, empresa_id: filtros.empresa }); setEditando(null); setModal(true); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = unidadePayload.safeParse({ ...form, ...Object.fromEntries(camposTexto.map(key => [key, form[key].trim() || null])), empresa_id: Number(form.empresa_id), quantidade_empregados: form.quantidade_empregados === "" ? null : Number(form.quantidade_empregados), grau_risco: form.grau_risco === "" ? null : Number(form.grau_risco) });
    if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request(editando === null ? "/api/unidades" : `/api/unidades/${editando}`, { method: editando === null ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Unidade salva com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  async function excluir() {
    if (!exclusao || salvando) return;
    setSalvando(true); setFormErro("");
    try { await request(`/api/unidades/${exclusao.id}`, { method: "DELETE" }); setExclusao(null); setAviso("Unidade desativada com sucesso."); setOffset(0); recarregar(); }
    catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível desativar a unidade."); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Unidades" description="Cadastre e acompanhe as unidades de cada empresa." actions={<Button disabled={consultando !== null} onClick={() => void abrir()}>Nova unidade</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="flex flex-wrap items-end gap-3 border-b border-line p-5" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltros({ empresa, situacao }); recarregar(); }}>
        <Input label="Filtrar por ID da empresa" type="number" min="1" step="1" value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Todas as empresas" />
        <Select label="Situação" value={situacao} onChange={e => setSituacao(e.target.value)}><option value="">Todas</option><option value="true">Ativas</option><option value="false">Inativas</option></Select>
        <Button type="submit" variant="secondary">Aplicar filtros</Button>
        <Button variant="ghost" onClick={() => { setEmpresa(""); setSituacao(""); setFiltros({ empresa: "", situacao: "" }); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando unidades...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhuma unidade encontrada" description="Ajuste os filtros ou cadastre uma unidade." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Unidades cadastradas</caption><thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Unidade", "Empresa", "Endereço", "Situação", "Ações"].map(t => <th scope="col" key={t} className="p-4">{t}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id} className="hover:bg-cream-50"><td className="p-4"><strong>{item.nome}</strong><p className="text-xs text-muted">ID {item.id}</p></td><td className="p-4">ID {item.empresa_id}</td><td className="max-w-sm break-words p-4">{item.endereco || "Não informado"}</td><td className="p-4"><Badge variant={item.ativo ? "success" : "neutral"}>{item.ativo ? "Ativa" : "Inativa"}</Badge></td><td className="p-4"><div className="flex gap-2"><Button variant="secondary" disabled={consultando !== null} onClick={() => void abrir(item.id)} aria-label={`Editar ${item.nome}`}>{consultando === item.id ? "Carregando..." : "Editar"}</Button><Button variant="ghost" onClick={() => { setFormErro(""); setExclusao(item); }} disabled={!item.ativo} aria-label={`Desativar unidade ${item.id}`}>Desativar</Button></div></td></tr>)}</tbody></table></div>}
      <nav aria-label="Paginação de unidades" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} unidades`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando === null ? "Nova unidade" : "Editar unidade"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <Input label="ID da empresa" type="number" min="1" step="1" required disabled={salvando} value={form.empresa_id} error={fields.empresa_id?.[0]} onChange={e => setForm({ ...form, empresa_id: e.target.value })} />
        <p className="text-xs text-muted">Use o identificador exibido no cadastro de Empresas.</p>
        <Input label="Nome da unidade" required disabled={salvando} value={form.nome} error={fields.nome?.[0]} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Unidade Industrial Maracanaú" />
        <Input label="Endereço" disabled={salvando} value={form.endereco} error={fields.endereco?.[0]} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua ou avenida" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Número" disabled={salvando} value={form.numero} error={fields.numero?.[0]} onChange={e => setForm({ ...form, numero: e.target.value })} />
          <Input label="Complemento" disabled={salvando} value={form.complemento} error={fields.complemento?.[0]} onChange={e => setForm({ ...form, complemento: e.target.value })} />
          <Input label="Bairro" disabled={salvando} value={form.bairro} error={fields.bairro?.[0]} onChange={e => setForm({ ...form, bairro: e.target.value })} />
          <Input label="Cidade" disabled={salvando} value={form.cidade} error={fields.cidade?.[0]} onChange={e => setForm({ ...form, cidade: e.target.value })} />
          <Input label="UF" maxLength={2} disabled={salvando} value={form.uf} error={fields.uf?.[0]} onChange={e => setForm({ ...form, uf: e.target.value.toUpperCase() })} />
          <Input label="CEP" disabled={salvando} value={form.cep} error={fields.cep?.[0]} onChange={e => setForm({ ...form, cep: e.target.value })} />
          <Input label="Telefone" type="tel" disabled={salvando} value={form.telefone} error={fields.telefone?.[0]} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          <Input label="CNPJ do estabelecimento" disabled={salvando} value={form.cnpj_estabelecimento} error={fields.cnpj_estabelecimento?.[0]} onChange={e => setForm({ ...form, cnpj_estabelecimento: e.target.value })} />
          <Input label="Quantidade de empregados" type="number" min="0" step="1" disabled={salvando} value={form.quantidade_empregados} error={fields.quantidade_empregados?.[0]} onChange={e => setForm({ ...form, quantidade_empregados: e.target.value })} />
          <Input label="Quantidade atualizada em" type="date" disabled={salvando} value={form.quantidade_atualizada_em} error={fields.quantidade_atualizada_em?.[0]} onChange={e => setForm({ ...form, quantidade_atualizada_em: e.target.value })} />
          <Input label="CNAE preponderante" disabled={salvando} value={form.cnae_preponderante} error={fields.cnae_preponderante?.[0]} onChange={e => setForm({ ...form, cnae_preponderante: e.target.value })} />
          <Select label="Grau de risco" disabled={salvando} value={form.grau_risco} error={fields.grau_risco?.[0]} onChange={e => setForm({ ...form, grau_risco: e.target.value })}><option value="">Não informado</option>{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}</Select>
        </div>
        <Select label="Situação" disabled={salvando} value={String(form.ativo)} error={fields.ativo?.[0]} onChange={e => setForm({ ...form, ativo: e.target.value === "true" })}><option value="true">Ativa</option><option value="false">Inativa</option></Select>
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar unidade"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={exclusao !== null} onClose={() => { if (!salvando) setExclusao(null); }} title="Desativar unidade">
      <p className="text-sm">Deseja desativar a unidade {exclusao?.nome} (ID {exclusao?.id})? O histórico e as relações serão preservados.</p>
      {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setExclusao(null)}>Voltar</Button><Button disabled={salvando} onClick={() => void excluir()}>{salvando ? "Desativando..." : "Confirmar desativação"}</Button></div>
    </Dialog>
  </>;
}

