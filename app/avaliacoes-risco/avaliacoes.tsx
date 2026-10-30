"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, Input, PageHeader } from "@/src/components/ui";
import { avaliacaoPayload, lerDecimal, lerDetalhe, lerLista, type Avaliacao } from "@/src/lib/avaliacoes-risco/schema";
const vazio = { perigo_id: "", probabilidade: "", severidade: "", classificacao: "", metodo_versao: "" };
const numero = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 20 });
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetch(url, options); const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Avaliacoes() {
  const [rows, setRows] = useState<Avaliacao[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [perigo, setPerigo] = useState(""), [filtro, setFiltro] = useState("");
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [form, setForm] = useState(vazio), [detalhe, setDetalhe] = useState<Avaliacao | null>(null);
  const [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: String(offset) });
    if (filtro) query.set("perigo_id", filtro);
    request(`/api/avaliacoes-risco?${query}`, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      try { setRows(lerLista(data)); } catch { setRows([]); setErro("A resposta da API não corresponde aos dados esperados de avaliações de risco."); }
    }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtro, offset, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function consultar(id: number) {
    if (consultando !== null) return;
    setConsultando(id); setAviso("");
    try { setDetalhe(lerDetalhe(await request(`/api/avaliacoes-risco/${id}`))); }
    catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados da avaliação."); }
    finally { setConsultando(null); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const parsed = avaliacaoPayload.safeParse({ ...form, perigo_id: Number(form.perigo_id), probabilidade: lerDecimal(form.probabilidade), severidade: lerDecimal(form.severidade) });
    if (!parsed.success) {
      const errors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      for (const key of ["probabilidade", "severidade"] as const) if (errors[key]) errors[key] = ["Informe um número válido, com ponto ou vírgula decimal."];
      setFields(errors); setFormErro("Revise os campos destacados."); return;
    }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request("/api/avaliacoes-risco", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Avaliação cadastrada com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível cadastrar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Avaliações de risco" description="Registre a avaliação de cada perigo conforme o método adotado pela empresa." actions={<Button disabled={consultando !== null} onClick={() => { setForm({ ...vazio, perigo_id: filtro }); setFields({}); setFormErro(""); setModal(true); }}>Nova avaliação</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="flex flex-wrap items-end gap-3 border-b border-line p-5" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltro(perigo); recarregar(); }}>
        <Input label="Filtrar por ID do perigo" type="number" min="1" step="1" value={perigo} onChange={e => setPerigo(e.target.value)} placeholder="Todos os perigos" />
        <Button type="submit" variant="secondary">Aplicar filtro</Button><Button variant="ghost" onClick={() => { setPerigo(""); setFiltro(""); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando avaliações...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhuma avaliação encontrada" description="Ajuste o filtro ou cadastre uma avaliação." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Avaliações de risco cadastradas</caption><thead className="bg-cream-50 text-xs uppercase text-muted"><tr>{["Avaliação", "Perigo", "Probabilidade", "Severidade", "Classificação", "Método / versão", "Ações"].map(t => <th scope="col" key={t} className="p-4">{t}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map(item => <tr key={item.id} className="align-top hover:bg-cream-50"><td className="p-4">#{item.id}</td><td className="p-4">#{item.perigo_id}</td><td className="p-4">{numero(item.probabilidade)}</td><td className="p-4">{numero(item.severidade)}</td><td className="max-w-xs break-words p-4">{item.classificacao || "Não informada"}</td><td className="max-w-xs break-words p-4">{item.metodo_versao || "Não informado"}</td><td className="p-4"><Button variant="secondary" disabled={consultando !== null} onClick={() => void consultar(item.id)} aria-label={`Consultar avaliação ${item.id}`}>{consultando === item.id ? "Carregando..." : "Detalhes"}</Button></td></tr>)}</tbody></table></div>}
      <nav aria-label="Paginação de avaliações" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} avaliações`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title="Nova avaliação de risco">
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <Input label="ID do perigo" type="number" min="1" step="1" required disabled={salvando} value={form.perigo_id} error={fields.perigo_id?.[0]} onChange={e => setForm({ ...form, perigo_id: e.target.value })} />
        <p className="text-xs text-muted">Use o identificador exibido no cadastro de Perigos.</p>
        <div className="grid gap-4 sm:grid-cols-2">{(["probabilidade", "severidade"] as const).map(key => <Input key={key} label={key === "probabilidade" ? "Probabilidade" : "Severidade"} inputMode="decimal" required disabled={salvando} value={form[key]} error={fields[key]?.[0]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder="Ex.: 2,5" />)}</div>
        <p className="text-xs text-muted">Informe os valores e a classificação conforme a escala do método utilizado.</p>
        <Input label="Classificação" disabled={salvando} value={form.classificacao} error={fields.classificacao?.[0]} onChange={e => setForm({ ...form, classificacao: e.target.value })} />
        <Input label="Método / versão" disabled={salvando} value={form.metodo_versao} error={fields.metodo_versao?.[0]} onChange={e => setForm({ ...form, metodo_versao: e.target.value })} />
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Cadastrar avaliação"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={detalhe !== null} onClose={() => setDetalhe(null)} title={`Avaliação de risco #${detalhe?.id ?? ""}`}>
      {detalhe && <dl className="grid gap-4 text-sm">{[["Perigo", `#${detalhe.perigo_id}`], ["Probabilidade", numero(detalhe.probabilidade)], ["Severidade", numero(detalhe.severidade)], ["Classificação", detalhe.classificacao || "Não informada"], ["Método / versão", detalhe.metodo_versao || "Não informado"]].map(([label, value]) => <div key={label}><dt className="text-muted">{label}</dt><dd className="whitespace-pre-wrap break-words font-medium">{value}</dd></div>)}</dl>}
      <Button variant="secondary" className="mt-5" onClick={() => setDetalhe(null)}>Fechar</Button>
    </Dialog>
  </>;
}
