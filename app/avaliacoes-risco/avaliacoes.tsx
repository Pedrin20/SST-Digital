"use client";
import { SeletorRelacionamento, useOpcoesRelacionamento } from "@/src/components/seletor-relacionamento";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, Select, PageHeader } from "@/src/components/ui";
import { ClassificacaoRisco, gruposDeRisco } from "@/src/components/classificacao-risco";
import { tiposDeRisco, rotulosTipo, niveisDeRisco, rotulosNivel, paginaDeAvaliacoes } from "@/src/lib/avaliacoes-risco/risco";
import { avaliacaoPayload, lerDetalhe, lerLista, type Avaliacao } from "@/src/lib/avaliacoes-risco/schema";
const vazio = { perigo_id: "", probabilidade: "", severidade: "" };
const filtrosVazios = { perigo: "", nivel: "", tipo: "" };
const colunas = ["Avaliação (ID)", "Perigo (ID)", "Probabilidade", "Severidade", "Pontuação / Nível", "Tipo de risco"] as const;
const opcoesNivel = niveisDeRisco.map(nome => <option key={nome} value={nome}>{rotulosNivel[nome]}</option>);
const opcoesTipo = tiposDeRisco.map(nome => <option key={nome} value={nome}>{rotulosTipo[nome]}</option>);
const numero = (value: number) => value.toLocaleString("pt-BR", { maximumFractionDigits: 20 });
class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) { super(message); }
}
async function request(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options); const data = await response.json().catch(() => null);
  if (!response.ok) throw new RequestError(response.status === 401 ? "Sua sessão expirou. Entre novamente." : data?.message ?? "Não foi possível concluir a operação.", data?.fields ?? {});
  return data;
}
export function Avaliacoes() {
  const [rows, setRows] = useState<Avaliacao[]>([]), [loading, setLoading] = useState(true), [erro, setErro] = useState("");
  const [entrada, setEntrada] = useState(filtrosVazios), [filtro, setFiltro] = useState(filtrosVazios);
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [form, setForm] = useState(vazio), [detalhe, setDetalhe] = useState<Avaliacao | null>(null);
  const [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [exclusao, setExclusao] = useState<Avaliacao | null>(null), [erroExclusao, setErroExclusao] = useState("");
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  const opcoesPerigos = useOpcoesRelacionamento("perigos");
  useEffect(() => {
    const controller = new AbortController();
    paginaDeAvaliacoes(offset, filtro, async inicio => {
      const query = new URLSearchParams({ limit: "50", offset: String(inicio) });
      if (filtro.perigo) query.set("perigo_id", filtro.perigo);
      const data = await request(`/api/avaliacoes-risco?${query}`, { signal: controller.signal });
      try { return lerLista(data); }
      catch { throw new Error("A resposta da API não corresponde aos dados esperados de avaliações de risco."); }
    }).then(pagina => { if (!controller.signal.aborted) setRows(pagina); }).catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
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
    const valores = { perigo_id: Number(form.perigo_id), probabilidade: Number(form.probabilidade), severidade: Number(form.severidade) };
    const parsed = avaliacaoPayload.safeParse(valores);
    if (!parsed.success) {
      const errors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      for (const key of ["probabilidade", "severidade"] as const) if (errors[key]) errors[key] = ["Selecione um valor de 1 a 5."];
      setFields(errors); setFormErro("Revise os campos destacados."); return;
    }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      await request("/api/avaliacoes-risco", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Avaliação cadastrada com sucesso."); setOffset(0); recarregar();
    } catch (error) {
      setFormErro(error instanceof Error ? error.message : "Não foi possível cadastrar.");
      if (error instanceof RequestError) setFields(error.fields);
    }
    finally { setSalvando(false); }
  }
  async function excluir() {
    if (!exclusao || salvando) return;
    setSalvando(true); setErroExclusao("");
    try { await request(`/api/avaliacoes-risco/${exclusao.id}`, { method: "DELETE" }); setExclusao(null); setAviso("Avaliação excluída com sucesso."); setOffset(0); recarregar(); }
    catch (error) { setErroExclusao(error instanceof Error ? error.message : "Não foi possível excluir a avaliação."); }
    finally { setSalvando(false); }
  }
  return <>
    <PageHeader title="Avaliações de risco" description="Registre a avaliação de cada perigo conforme o método adotado pela empresa." actions={<Button disabled={consultando !== null} onClick={() => { setForm({ ...vazio, perigo_id: filtro.perigo }); setFields({}); setFormErro(""); setModal(true); }}>Nova avaliação</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <Card className="overflow-hidden">
      <form className="grid min-w-0 items-end gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.5fr)_auto]" onSubmit={e => { e.preventDefault(); setOffset(0); setFiltro(entrada); recarregar(); }}>
        <SeletorRelacionamento label="Perigo" fonte={opcoesPerigos} value={entrada.perigo} onChange={id => setEntrada({ ...entrada, perigo: id })} placeholder="Todos os perigos" />
        <Select label="Pontuação / Nível" value={entrada.nivel} onChange={e => setEntrada({ ...entrada, nivel: e.target.value })}><option value="">Todos os níveis</option>{opcoesNivel}</Select>
        <Select label="Tipo de risco" value={entrada.tipo} onChange={e => setEntrada({ ...entrada, tipo: e.target.value })}><option value="">Todos os tipos</option>{opcoesTipo}</Select>
        <div className="flex flex-wrap gap-2"><Button type="submit" variant="secondary">Aplicar filtro</Button><Button variant="ghost" onClick={() => { setEntrada(filtrosVazios); setFiltro(filtrosVazios); setOffset(0); recarregar(); }}>Limpar</Button></div>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando avaliações...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : rows.length === 0 ? <EmptyState title="Nenhuma avaliação encontrada" description="Ajuste o filtro ou cadastre uma avaliação." /> : <table className="block w-full text-left text-sm xl:table">
        <caption className="sr-only">Avaliações de risco cadastradas</caption>
        <thead className="sr-only bg-cream-50 text-xs text-muted xl:not-sr-only xl:table-header-group"><tr>
          {[...colunas, "Ações"].map(t =>
            <th key={t} scope="col" className="px-3 py-4">{t}</th>)}
        </tr></thead>
        <tbody className="block divide-y divide-line xl:table-row-group">{rows.map(item =>
          <tr key={item.id} className="grid grid-cols-2 gap-3 p-4 align-top xl:table-row">
            {valoresAvaliacao(item).map(([label, value]) =>
              <td key={label} className="min-w-0 [overflow-wrap:anywhere] xl:px-3 xl:py-4">
                <span aria-hidden="true" className="mb-1 block text-xs text-muted xl:hidden">{label}</span>{value}
              </td>)}
            <td className="col-span-2 self-end xl:col-span-1 xl:px-3 xl:py-4"><div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={consultando !== null}
                onClick={() => void consultar(item.id)} aria-label={`Consultar avaliação ${item.id}`}>
                {consultando === item.id ? "Carregando..." : "Detalhes"}
              </Button>
              <Button variant="ghost" onClick={() => { setErroExclusao(""); setExclusao(item); }} aria-label={`Excluir avaliação ${item.id}`}>Excluir</Button>
            </div></td>
          </tr>)}</tbody>
      </table>}
      <nav aria-label="Paginação de avaliações" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {offset / 50 + 1} · {loading ? "Carregando..." : `${rows.length} avaliações`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || offset === 0} onClick={() => { setOffset(v => Math.max(0, v - 50)); recarregar(); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || rows.length < 50} onClick={() => { setOffset(v => v + 50); recarregar(); }}>Próxima</Button></div></nav>
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title="Nova avaliação de risco">
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <SeletorRelacionamento label="Perigo" fonte={opcoesPerigos} required disabled={salvando} value={form.perigo_id} error={fields.perigo_id?.[0]} onChange={id => setForm({ ...form, perigo_id: id })} />
        <div className="grid gap-4 sm:grid-cols-2">
          {(["probabilidade", "severidade"] as const).map(key =>
            <Select key={key} label={key === "probabilidade" ? "Probabilidade" : "Severidade"} required
              disabled={salvando} value={form[key]} error={fields[key]?.[0]} onChange={e => setForm({ ...form, [key]: e.target.value })}>
              <option value="">Selecione de 1 a 5</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </Select>)}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Cadastrar avaliação"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={detalhe !== null} onClose={() => setDetalhe(null)} title={`Avaliação de risco #${detalhe?.id ?? ""}`}>
      {detalhe && <dl className="grid gap-4 text-sm">{valoresAvaliacao(detalhe).slice(1).map(([label, value]) => <div key={label}><dt className="text-muted">{label}</dt><dd className="whitespace-pre-wrap break-words font-medium">{value}</dd></div>)}</dl>}
      <Button variant="secondary" className="mt-5" onClick={() => setDetalhe(null)}>Fechar</Button>
    </Dialog>
    <Dialog open={exclusao !== null} onClose={() => { if (!salvando) setExclusao(null); }} title="Excluir avaliação de risco">
      <p className="text-sm">Deseja excluir permanentemente a avaliação #{exclusao?.id} do perigo #{exclusao?.perigo_id}? Esta operação não pode ser desfeita.</p>
      {erroExclusao && <p role="alert" className="mt-3 text-sm text-critical-text">{erroExclusao}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setExclusao(null)}>Voltar</Button><Button disabled={salvando} onClick={() => void excluir()}>{salvando ? "Excluindo..." : "Confirmar exclusão"}</Button></div>
    </Dialog>
  </>;
}

function valoresAvaliacao(item: Avaliacao): [string, React.ReactNode][] {
  const grupo = item.tipo_risco && gruposDeRisco[item.tipo_risco];
  return [
    [colunas[0], `#${item.id}`],
    [colunas[1], `#${item.perigo_id}`],
    [colunas[2], numero(item.probabilidade)],
    [colunas[3], numero(item.severidade)],
    [colunas[4], <span key="nivel" className="inline-flex items-center gap-2">{item.pontuacao_risco} <ClassificacaoRisco avaliacao={item} /></span>],
    [colunas[5], grupo && item.tipo_risco ? <span key="grupo" style={{ backgroundColor: grupo.fundo }} className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold"><span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: grupo.cor }} />{rotulosTipo[item.tipo_risco]}</span> : "Não informado"],
  ];
}
