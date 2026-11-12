"use client";
import { SeletorRelacionamento, useOpcoesRelacionamento } from "@/src/components/seletor-relacionamento";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, PageHeader, Select } from "@/src/components/ui";
import { lerLista, vinculoPayload, type Vinculo } from "@/src/lib/usuarios-empresas/schema";

const vazio = { usuario_id: "", empresa_id: "", perfil: "ADMIN" };
class RequestError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : response.status === 403 ? "O acesso aos vínculos é restrito ao administrador do sistema." : data?.message ?? "Não foi possível concluir a operação.", response.status, data?.fields ?? {});
  return data;
}
export function Vinculos() {
  const [rows, setRows] = useState<Vinculo[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState(""), [autorizado, setAutorizado] = useState(false);
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<Vinculo | null>(null), [form, setForm] = useState(vazio);
  const [remocao, setRemocao] = useState<Vinculo | null>(null), [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  const opcoesUsuarios = useOpcoesRelacionamento("usuarios", modal);
  const opcoesEmpresas = useOpcoesRelacionamento("empresas", modal);
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    request(`/api/usuarios-empresas?${query}`, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      try { setRows(lerLista(data)); setAutorizado(true); } catch { setRows([]); setAutorizado(false); setErro("A resposta da API não corresponde aos dados esperados de vínculos."); }
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setAutorizado(false); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  function abrir(item?: Vinculo) {
    setEditando(item ?? null); setForm(item ? { usuario_id: String(item.usuario_id), empresa_id: String(item.empresa_id), perfil: item.perfil } : vazio); setFields({}); setFormErro(""); setAviso(""); setModal(true);
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = vinculoPayload.safeParse({ ...form, usuario_id: Number(form.usuario_id), empresa_id: Number(form.empresa_id) });
    if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request(editando ? `/api/usuarios-empresas/${editando.usuario_id}/${editando.empresa_id}` : "/api/usuarios-empresas", { method: editando ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editando ? { perfil: parsed.data.perfil } : parsed.data) });
      setModal(false); setAviso(editando ? "Perfil atualizado com sucesso." : "Vínculo criado com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  async function remover() {
    if (!remocao || salvando) return;
    setSalvando(true); setFormErro("");
    try { await request(`/api/usuarios-empresas/${remocao.usuario_id}/${remocao.empresa_id}`, { method: "DELETE" }); setRemocao(null); setAviso("Vínculo removido com sucesso."); setOffset(0); recarregar(); }
    catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível remover o vínculo."); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Vínculos de usuários" description="Gerencie o acesso de usuários às empresas. Acesso restrito ao administrador do sistema." actions={autorizado && !loading ? <Button onClick={() => abrir()}>Novo vínculo</Button> : undefined} />
    <p className="mb-4 text-sm"><a href="/usuarios" className="font-medium text-brand-900 underline">Voltar para usuários</a></p>
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando vínculos...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhum vínculo encontrado" description="Cadastre um vínculo para começar." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Vínculos cadastrados</caption><thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Usuário", "Empresa", "Perfil", "Opções"].map(t => <th scope="col" key={t} className="p-4">{t}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map(item => <tr key={`${item.usuario_id}-${item.empresa_id}`} className="hover:bg-cream-50"><td className="p-4">ID {item.usuario_id}</td><td className="p-4">ID {item.empresa_id}</td><td className="p-4">{item.perfil}</td><td className="p-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => abrir(item)} aria-label={`Editar perfil do usuário ${item.usuario_id} na empresa ${item.empresa_id}`}>Editar perfil</Button><Button variant="ghost" onClick={() => { setFormErro(""); setRemocao(item); }} aria-label={`Desvincular usuário ${item.usuario_id} da empresa ${item.empresa_id}`}>Desvincular</Button></div></td></tr>)}</tbody></table></div>}
      {autorizado && <nav aria-label="Paginação de vínculos" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} vínculos`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>}
    </Card>
    <Dialog open={modal && autorizado} onClose={() => { if (!salvando) setModal(false); }} title={editando ? "Alterar perfil do vínculo" : "Novo vínculo"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <div className="grid gap-4 sm:grid-cols-2"><SeletorRelacionamento label="Usuário" fonte={opcoesUsuarios} required disabled={salvando || !!editando} value={form.usuario_id} error={fields.usuario_id?.[0]} onChange={id => setForm({ ...form, usuario_id: id })} /><SeletorRelacionamento label="Empresa" fonte={opcoesEmpresas} required disabled={salvando || !!editando} value={form.empresa_id} error={fields.empresa_id?.[0]} onChange={id => setForm({ ...form, empresa_id: id })} /></div>
        <Select label="Perfil" required disabled={salvando} value={form.perfil} error={fields.perfil?.[0]} onChange={e => setForm({ ...form, perfil: e.target.value })}>
          <option value="ADMIN">Administrador</option>
          <option value="GESTOR">Gestor</option>
          <option value="LEITOR">Leitor</option>
        </Select>
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar vínculo"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={remocao !== null && autorizado} onClose={() => { if (!salvando) setRemocao(null); }} title="Desvincular usuário">
      <p className="text-sm">Deseja remover o vínculo do usuário ID {remocao?.usuario_id} com a empresa ID {remocao?.empresa_id}?</p>
      {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setRemocao(null)}>Voltar</Button><Button disabled={salvando} onClick={() => void remover()}>{salvando ? "Removendo..." : "Confirmar desvinculação"}</Button></div>
    </Dialog>
  </>;
}
