"use client";
import { useDataLocal } from "@/src/lib/use-data-local";
import { SeletorRelacionamento, useOpcoesRelacionamento } from "@/src/components/seletor-relacionamento";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Dialog, EmptyState, Input, PageHeader, Select, Textarea } from "@/src/components/ui";
import { acaoPatch, acaoPayload, prioridades, tiposAcao, lerDetalhe, lerLista, type Acao } from "@/src/lib/acoes/schema";

import { Historico } from "./historico";
import { diasAtePrazo, Visoes } from "./visoes";

const opcoesStatus = <>
  <option value="PENDENTE">A fazer</option>
  <option value="EM_ANDAMENTO">Em andamento</option>
  <option value="CONCLUIDA">Concluída</option>
  <option value="CANCELADA">Cancelada</option>
</>;

const vazio = { tipo_acao: "", prioridade: "", perigo_id: "", descricao: "", responsavel_id: "", prazo: "", status: "PENDENTE" };
const filtrosVazios = { busca: "", inicio: "", fim: "", prioridade: "", perigo_id: "", responsavel_id: "", status: "" };
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
  const [quadro, setQuadro] = useState(true);
  const [original, setOriginal] = useState(vazio);
  const [destaque, setDestaque] = useState("");
  const [obs, setObs] = useState(""), [motivo, setMotivo] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [offset, setOffset] = useState(0), [versao, setVersao] = useState(0);
  const [modal, setModal] = useState(false), [editando, setEditando] = useState<number | null>(null), [form, setForm] = useState(vazio);
  const [cancelamento, setCancelamento] = useState<Acao | null>(null), [salvando, setSalvando] = useState(false), [consultando, setConsultando] = useState<number | null>(null);
  const [formErro, setFormErro] = useState(""), [fields, setFields] = useState<Record<string, string[]>>({}), [aviso, setAviso] = useState("");
  const opcoesPerigos = useOpcoesRelacionamento("perigos");
  const opcoesUsuarios = useOpcoesRelacionamento("usuarios");
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ limit: "50", offset: "0" });
    for (const [key, value] of Object.entries(filtros)) if (!["busca","inicio","fim"].includes(key) && value.trim()) query.set(key, value.trim());
    async function carregar() {
      const itens = new Map<number, Acao>();
      for (let inicio = 0; ; inicio += 50) {
        query.set("offset", String(inicio));
        const pagina = lerLista(await request(`/api/acoes?${query}`, { signal: controller.signal }));
        const anterior = itens.size;
        for (const item of pagina) itens.set(item.id, item);
        if (pagina.length < 50) break;
        if (anterior === itens.size) throw new Error("A API repetiu uma página de ações.");
      }
      if (!controller.signal.aborted) setRows([...itens.values()]);
    }
    carregar().catch(error => { if (!controller.signal.aborted) { setRows([]); setErro(error.message); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filtros, versao]);
  function recarregar() { setErro(""); setLoading(true); setVersao(v => v + 1); }
  async function abrir(id?: number, status = "PENDENTE") {
    if (consultando !== null || salvando) return;
    setArquivo(null); setObs(""); setMotivo("");
    setFormErro(""); setFields({}); setAviso("");
    if (id !== undefined) {
      setConsultando(id);
      try { const acao = lerDetalhe(await request(`/api/acoes/${id}`)); const dados = { tipo_acao: acao.tipo_acao ?? "", prioridade: acao.prioridade ?? "", perigo_id: String(acao.perigo_id), descricao: acao.descricao, responsavel_id: String(acao.responsavel_id ?? ""), prazo: acao.prazo ?? "", status: acao.status }; setForm(dados); setOriginal(dados); setEditando(id); setModal(true); }
      catch (error) { setAviso(error instanceof RequestError ? error.message : "Não foi possível consultar os dados da ação."); }
      finally { setConsultando(null); }
    } else { setForm({ ...vazio, status, perigo_id: filtros.perigo_id, responsavel_id: filtros.responsavel_id }); setEditando(null); setModal(true); }
  }
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (salvando) return;
    const valores = { ...form, tipo_acao: form.tipo_acao || null, prioridade: form.prioridade || null, perigo_id: Number(form.perigo_id), responsavel_id: Number(form.responsavel_id) };
    const dados: Record<string, unknown> = editando === null ? { ...valores, prioridade: form.prioridade || undefined, tipo_acao: form.tipo_acao || undefined } :
      Object.fromEntries((Object.keys(form) as (keyof typeof form)[]).filter(k => form[k] !== original[k]).map(k => [k, valores[k]]));
    if (obs.trim()) dados.observacao = obs.trim();
    if (dados.status === "CANCELADA") dados.motivo_cancelamento = motivo.trim();
    if (!Object.keys(dados).length && !arquivo) { setModal(false); return; }
    setSalvando(true); setFormErro(""); setFields({});
    try {
      if (arquivo) {
        if (!["image/jpeg","image/png","application/pdf"].includes(arquivo.type) || !arquivo.size || arquivo.size > 5 * 1024 * 1024) throw new Error("Escolha um PDF, JPG ou PNG de até 5 MB.");
        const dados64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = () => reject(new Error("Não foi possível ler o anexo."));
          reader.readAsDataURL(arquivo);
        });
        dados.evidencia = { nome: arquivo.name, tipo: arquivo.type, dados: dados64 };
      }
      const parsed = (editando === null ? acaoPayload : acaoPatch).safeParse(dados);
      if (!parsed.success) { setFields(parsed.error.flatten().fieldErrors); setFormErro("Revise os campos destacados."); return; }
      await request(editando === null ? "/api/acoes" : `/api/acoes/${editando}`, { method: editando === null ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      setModal(false); setAviso("Ação salva com sucesso."); setOffset(0); recarregar();
    } catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível salvar."); if (error instanceof RequestError) setFields(error.fields); }
    finally { setSalvando(false); }
  }
  async function cancelar() {
    if (!cancelamento || salvando || !motivo.trim()) return;
    setSalvando(true); setFormErro("");
    try { await request(`/api/acoes/${cancelamento.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELADA", motivo_cancelamento: motivo.trim() }) }); setCancelamento(null); setAviso("Ação cancelada com sucesso. O histórico foi preservado."); recarregar(); }
    catch (error) { setFormErro(error instanceof Error ? error.message : "Não foi possível cancelar a ação."); }
    finally { setSalvando(false); }
  }
  function confirmarCancelamento(item: Acao) { setFormErro(""); setMotivo(""); setCancelamento(item); }
  async function mover(item: Acao, status: string) {
    if (salvando || consultando !== null || status === item.status) return;
    if (status === "CANCELADA") { confirmarCancelamento(item); return; }
    setSalvando(true);
    try {
      await request(`/api/acoes/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      setAviso("Status atualizado."); recarregar();
    } catch (error) { setAviso(error instanceof Error ? error.message : "Não foi possível mover a ação."); }
    finally { setSalvando(false); }
  }
  function opcoes(item: Acao) {
    return <div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={salvando || consultando !== null} onClick={() => void abrir(item.id)} aria-label={`Editar ação ${item.id}`}>{consultando === item.id ? "Carregando..." : "Editar"}</Button>{item.status !== "CANCELADA" && <Button variant="ghost" className="ml-auto text-xs font-normal text-muted" disabled={salvando || consultando !== null} onClick={() => confirmarCancelamento(item)} aria-label={`Cancelar ação ${item.id}`}>Cancelar ação</Button>}</div>;
  }
  const hoje = Date.parse(useDataLocal());
  const perigos = new Map(opcoesPerigos.lista?.opcoes.map(p => [Number(p.id), p.nome]));
  const usuarios = new Map(opcoesUsuarios.lista?.opcoes.map(p => [Number(p.id), p.nome]));
  const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const base = rows.filter(r => {
    if (filtros.inicio && (!r.prazo || r.prazo < filtros.inicio)) return false;
    if (filtros.fim && (!r.prazo || r.prazo > filtros.fim)) return false;
    return normalizar([r.descricao, r.perigo_nome ?? perigos.get(r.perigo_id), r.responsavel_nome ?? usuarios.get(r.responsavel_id ?? 0)].join(" ")).includes(normalizar(filtros.busca.trim()));
  });
  const corresponde = (r: Acao, valor: string) => valor === "atrasadas" ? (diasAtePrazo(r, hoje) ?? 0) < 0 : (r.prioridade ?? "sem") === valor;
  const visiveis = destaque ? base.filter(r => corresponde(r, destaque)) : base;
  const inicioPagina = Math.min(offset, Math.max(0, Math.floor((visiveis.length - 1) / 50) * 50));
  const opcoesPrioridade = Object.entries(prioridades).map(([valor, nome]) => <option key={valor} value={valor}>{valor} · {nome}</option>);
  return <>
    <PageHeader title="Planos de ação" description="Acompanhe as ações relacionadas aos perigos, seus responsáveis e prazos." actions={<Button disabled={salvando || consultando !== null} onClick={() => void abrir()}>Nova ação</Button>} />
    {aviso && <p role="status" className="mb-4 text-sm">{aviso}</p>}
    <section aria-label="Resumo das ações filtradas" className="mb-5">
      <h2 className="mb-2 text-sm font-semibold text-muted">Resumo das ações</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[
        ["P1 · Crítica", "P1", "border-l-critical"], ["P2 · Alta", "P2", "border-l-high"],
        ["P3 · Média", "P3", "border-l-medium"], ["Sem classificação", "sem", "border-l-line"], ["Atrasadas", "atrasadas", "border-l-critical"],
      ].map(([nome, valor, cor]) => <button key={nome} type="button" aria-pressed={destaque === valor} onClick={() => { setDestaque(destaque === valor ? "" : valor); setOffset(0); }} className={`text-left aria-pressed:ring-2 aria-pressed:ring-brand-600 rounded-lg border border-line border-l-4 bg-white px-4 py-3 ${cor}`}>
        <p className="text-sm text-muted">{nome}</p><strong className="text-2xl">{loading || erro ? "—" : base.filter(r => corresponde(r, valor)).length}</strong>
      </button>)}</div>
    </section>
    <div className="mb-3 flex gap-2" role="group" aria-label="Visualização">
      <Button variant={quadro ? "primary" : "secondary"} aria-pressed={quadro} onClick={() => setQuadro(true)}>Quadro Kanban</Button>
      <Button variant={quadro ? "secondary" : "primary"} aria-pressed={!quadro} onClick={() => setQuadro(false)}>Lista tabular</Button>
    </div>
    <Card className="overflow-hidden">
      <form className="grid grid-cols-1 items-end gap-3 border-b border-line p-5 sm:grid-cols-2 xl:flex xl:flex-wrap" onSubmit={e => { e.preventDefault(); setOffset(0); setDestaque(""); setFiltros(entrada); recarregar(); }}>
        <SeletorRelacionamento label="Perigo" fonte={opcoesPerigos} value={entrada.perigo_id} onChange={id => setEntrada({ ...entrada, perigo_id: id })} placeholder="Todos" />
        <SeletorRelacionamento label="Responsável" fonte={opcoesUsuarios} value={entrada.responsavel_id} onChange={id => setEntrada({ ...entrada, responsavel_id: id })} placeholder="Todos" />
        <Select label="Prioridade" value={entrada.prioridade} onChange={e => setEntrada({ ...entrada, prioridade: e.target.value })}><option value="">Todas</option>{opcoesPrioridade}</Select>
        <Select label="Status" value={entrada.status} onChange={e => setEntrada({ ...entrada, status: e.target.value })}><option value="">Todos</option>{opcoesStatus}</Select>
        <Input label="Buscar ação" placeholder="Descrição, perigo ou responsável" value={entrada.busca} onChange={e => setEntrada({ ...entrada, busca: e.target.value })} />
        <Input label="Prazo de" type="date" max={entrada.fim || undefined} value={entrada.inicio} onChange={e => setEntrada({ ...entrada, inicio: e.target.value })} />
        <Input label="Prazo até" type="date" min={entrada.inicio || undefined} value={entrada.fim} onChange={e => setEntrada({ ...entrada, fim: e.target.value })} />
        <Button type="submit" variant="secondary">Aplicar filtros</Button><Button variant="ghost" onClick={() => { setDestaque(""); setEntrada(filtrosVazios); setFiltros(filtrosVazios); setOffset(0); recarregar(); }}>Limpar</Button>
      </form>
      {loading ? <p role="status" className="p-6 text-sm text-muted">Carregando ações...</p> : erro ? <div role="alert" className="space-y-3 p-6 text-sm text-critical-text"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : !visiveis.length && !quadro ? <EmptyState title="Nenhuma ação encontrada" description="Ajuste os filtros ou cadastre uma ação." /> : <Visoes rows={quadro ? visiveis : visiveis.slice(inicioPagina, inicioPagina + 50)} hoje={hoje} perigos={perigos} usuarios={usuarios} ocupado={salvando || consultando !== null} criar={s => void abrir(undefined, s)} mover={mover} quadro={quadro} opcoes={opcoes} />}
      {!quadro && <nav aria-label="Paginação de ações" className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className="text-xs text-muted">Página {inicioPagina / 50 + 1} · {loading ? "Carregando..." : `${visiveis.length} ações`}</span><div className="flex gap-2"><Button variant="secondary" disabled={loading || inicioPagina === 0} onClick={() => { setOffset(inicioPagina - 50); }}>Anterior</Button><Button variant="secondary" disabled={loading || !!erro || inicioPagina + 50 >= visiveis.length} onClick={() => { setOffset(inicioPagina + 50); }}>Próxima</Button></div></nav>}
    </Card>
    <Dialog open={modal} onClose={() => { if (!salvando) setModal(false); }} title={editando === null ? "Nova ação" : "Editar ação"}>
      <form onSubmit={salvar} className="space-y-4">
        {formErro && <p role="alert" className="text-sm text-critical-text">{formErro}</p>}
        <p className="text-xs text-muted">* Campo obrigatório</p>
        <div className="grid gap-4 sm:grid-cols-2"><SeletorRelacionamento label="Perigo *" fonte={opcoesPerigos} required disabled={salvando || editando !== null} value={form.perigo_id} error={fields.perigo_id?.[0]} onChange={id => setForm({ ...form, perigo_id: id })} /><SeletorRelacionamento label="Responsável *" fonte={opcoesUsuarios} required disabled={salvando} value={form.responsavel_id} error={fields.responsavel_id?.[0]} onChange={id => setForm({ ...form, responsavel_id: id })} /></div>
        <Select label="Prioridade" value={form.prioridade} disabled={salvando} error={fields.prioridade?.[0]} onChange={e => setForm({ ...form, prioridade: e.target.value })}><option value="">Sem classificação</option>{opcoesPrioridade}</Select>
        <p className="text-xs text-muted">P1 · risco grave que exige ação imediata. P2 · risco alto. P3 · risco médio.</p>
        <Select label="Tipo de ação" value={form.tipo_acao} disabled={salvando} onChange={e => setForm({ ...form, tipo_acao: e.target.value })}><option value="">Não informado</option>{Object.entries(tiposAcao).map(([v,n]) => <option key={v} value={v}>{n}</option>)}</Select>
        <Textarea label="Descrição da ação *" required disabled={salvando} value={form.descricao} error={fields.descricao?.[0]} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Instalar sinalização de saída de emergência no corredor B" />
        <p className="text-xs text-muted">Comece com um verbo e descreva a medida em uma frase curta.</p>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Prazo *" type="date" required disabled={salvando} value={form.prazo} error={fields.prazo?.[0]} onChange={e => setForm({ ...form, prazo: e.target.value })} /><Select label="Status *" required disabled={salvando} value={form.status} error={fields.status?.[0]} onChange={e => setForm({ ...form, status: e.target.value })}>{opcoesStatus}</Select></div>
        {form.status === "CANCELADA" && (editando === null || original.status !== "CANCELADA") && <Textarea label="Motivo do cancelamento *" required maxLength={2000} disabled={salvando} value={motivo} onChange={e => setMotivo(e.target.value)} />}
        <Textarea label="Adicionar observação" disabled={salvando} maxLength={4000} value={obs} onChange={e => setObs(e.target.value)} placeholder="O que foi feito?" />
        <Input key={String(modal) + String(editando)} label="Anexar evidência (PDF, JPG ou PNG, até 5 MB)" disabled={salvando} type="file" accept="image/jpeg,image/png,application/pdf" onChange={e => setArquivo(e.target.files?.[0] ?? null)} />
        {modal && editando !== null && <Historico key={editando} id={editando}/>}
        <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setModal(false)}>Cancelar</Button><Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : form.status === "CANCELADA" && (editando === null || original.status !== "CANCELADA") ? "Confirmar cancelamento" : "Salvar ação"}</Button></div>
      </form>
    </Dialog>
    <Dialog open={cancelamento !== null} onClose={() => { if (!salvando) setCancelamento(null); }} title="Cancelar ação">
      <p className="text-sm">Cancelar “{cancelamento?.descricao}”? A justificativa ficará no histórico.</p>
      {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
      <Textarea label="Motivo do cancelamento *" required maxLength={2000} value={motivo} disabled={salvando} onChange={e => setMotivo(e.target.value)} />
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" disabled={salvando} onClick={() => setCancelamento(null)}>Voltar</Button><Button disabled={salvando || !motivo.trim()} onClick={() => void cancelar()}>{salvando ? "Cancelando..." : "Confirmar cancelamento"}</Button></div>
    </Dialog>
  </>;
}
