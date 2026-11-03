"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { Sidebar } from "@/app/components/sidebar";
import { Topbar } from "@/app/components/topbar";
import { Card } from "@/src/components/ui";
import { AlertTriangleIcon, ArrowRightIcon, FileIcon, HelmetIcon, MatrixIcon, PlanIcon } from "@/app/components/icons";
import { carregarLista } from "@/app/lib/dashboard-lista";
import { lerLista as lerPerigos, type Perigo } from "@/src/lib/perigos/schema";
import { lerLista as lerAvaliacoes, type Avaliacao } from "@/src/lib/avaliacoes-risco/schema";
import { lerLista as lerAcoes, type Acao } from "@/src/lib/acoes/schema";
import { lerLista as lerEquipamentos, type Equipamento } from "@/src/lib/equipamentos/schema";
import { lerLista as lerDocumentos, type Documento } from "@/src/lib/documentos/schema";

type Resultado<T> = { estado: "carregando"; dados: null } | { estado: "erro"; dados: null } | { estado: "pronto"; dados: T[] };
const inicial = { estado: "carregando", dados: null } as const;

function Indicador({ titulo, href, icon: Icon, resultado }: { titulo: string; href: string; icon: ComponentType<SVGProps<SVGSVGElement>>; resultado: Resultado<unknown> }) {
  return <a href={href} className="flex min-h-[135px] flex-col rounded-xl border border-line bg-white p-4 shadow-card transition-colors hover:border-brand-500">
    <div className="flex items-start justify-between gap-2"><h2 className="text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">{titulo}</h2><span className="rounded-md bg-cream-100 p-2 text-brand-900"><Icon className="h-4 w-4" /></span></div>
    <p className="mt-3 text-[28px] leading-none font-semibold text-ink">{resultado.estado === "pronto" ? resultado.dados.length : "—"}</p>
    <p className="mt-auto pt-3 text-[10.5px] text-muted">{resultado.estado === "carregando" ? "Carregando..." : resultado.estado === "erro" ? "Não foi possível consultar" : resultado.dados.length === 50 ? "50 registros consultados · podem existir mais" : "Registros consultados"}</p>
  </a>;
}

function Painel({ titulo, descricao, href, children }: { titulo: string; descricao: string; href: string; children: React.ReactNode }) {
  return <Card className="flex flex-col overflow-hidden"><div className="flex items-start justify-between gap-3 border-b border-line p-5"><div><h2 className="text-sm font-semibold text-ink">{titulo}</h2><p className="mt-1 text-[11px] text-muted">{descricao}</p></div><a href={href} className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-900 hover:underline">Ver cadastro <ArrowRightIcon className="h-3.5 w-3.5" /></a></div>{children}</Card>;
}

function Mensagem({ estado, vazio }: { estado: "carregando" | "erro" | "vazio"; vazio: string }) {
  return <p role={estado === "erro" ? "alert" : "status"} className="p-5 text-sm text-muted">{estado === "carregando" ? "Carregando registros..." : estado === "erro" ? "Não foi possível carregar os dados. Atualize a página para tentar novamente." : vazio}</p>;
}

export default function DashboardPage() {
  const [perigos, setPerigos] = useState<Resultado<Perigo>>(inicial);
  const [avaliacoes, setAvaliacoes] = useState<Resultado<Avaliacao>>(inicial);
  const [acoes, setAcoes] = useState<Resultado<Acao>>(inicial);
  const [equipamentos, setEquipamentos] = useState<Resultado<Equipamento>>(inicial);
  const [documentos, setDocumentos] = useState<Resultado<Documento>>(inicial);

  useEffect(() => {
    const controller = new AbortController();
    function consultar<T>(url: string, ler: (value: unknown) => T[], atualizar: (resultado: Resultado<T>) => void) {
      carregarLista(url, ler, fetch, controller.signal).then(dados => { if (!controller.signal.aborted) atualizar({ estado: "pronto", dados }); }).catch(() => { if (!controller.signal.aborted) atualizar({ estado: "erro", dados: null }); });
    }
    consultar("/api/perigos", lerPerigos, setPerigos);
    consultar("/api/avaliacoes-risco", lerAvaliacoes, setAvaliacoes);
    consultar("/api/acoes", lerAcoes, setAcoes);
    consultar("/api/equipamentos", lerEquipamentos, setEquipamentos);
    consultar("/api/documentos", lerDocumentos, setDocumentos);
    return () => controller.abort();
  }, []);

  return <div className="min-h-screen bg-cream"><Sidebar /><div className="lg:pl-[264px]"><Topbar /><main className="mx-auto w-full max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8">
    <nav aria-label="Trilha de navegação" className="pt-5 text-[11px] text-muted"><span className="font-medium text-brand-900">SST Digital</span><span className="mx-2">/</span><span aria-current="page">Dashboard Geral</span></nav>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-4 pb-5"><div><h1 className="text-[22px] font-semibold tracking-tight text-brand-900 sm:text-[26px]">Dashboard Geral de SST &amp; Indicadores</h1><p className="mt-1.5 text-xs text-muted">Visão dos registros disponíveis nos cadastros · até 50 registros por categoria</p></div><a href="/acoes" className="rounded-lg bg-brand-900 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800">Acessar ações</a></div>
    <section aria-label="Indicadores dos cadastros" className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <Indicador titulo="Perigos" href="/perigos" icon={AlertTriangleIcon} resultado={perigos} /><Indicador titulo="Avaliações de risco" href="/avaliacoes-risco" icon={MatrixIcon} resultado={avaliacoes} /><Indicador titulo="Ações" href="/acoes" icon={PlanIcon} resultado={acoes} /><Indicador titulo="Equipamentos" href="/equipamentos" icon={HelmetIcon} resultado={equipamentos} /><Indicador titulo="Documentos" href="/documentos" icon={FileIcon} resultado={documentos} />
    </section>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Painel titulo="Avaliações de risco" descricao="Probabilidade, severidade e classificação registradas" href="/avaliacoes-risco">{avaliacoes.estado !== "pronto" ? <Mensagem estado={avaliacoes.estado} vazio="" /> : avaliacaoLista(avaliacoes.dados)}</Painel>
      <Painel titulo="Ações cadastradas" descricao="Medidas, responsáveis e prazos registrados" href="/acoes">{acoes.estado !== "pronto" ? <Mensagem estado={acoes.estado} vazio="" /> : acaoLista(acoes.dados)}</Painel>
    </div>
    <div className="mt-4"><Painel titulo="Perigos identificados" descricao="Registros associados aos setores" href="/perigos">{perigos.estado !== "pronto" ? <Mensagem estado={perigos.estado} vazio="" /> : perigos.dados.length === 0 ? <Mensagem estado="vazio" vazio="Nenhum perigo cadastrado até o momento." /> : <ul className="divide-y divide-line">{perigos.dados.slice(0, 5).map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"><span className="text-xs font-medium text-ink">{item.descricao}</span><span className="text-[11px] text-muted">Setor #{item.setor_id}</span></li>)}</ul>}</Painel></div>
    <footer className="mt-5 border-t border-line pt-4 text-[10px] text-muted">SST Digital · Dados dos cadastros disponíveis</footer>
  </main></div></div>;
}

function avaliacaoLista(dados: Avaliacao[]) {
  if (!dados.length) return <Mensagem estado="vazio" vazio="Nenhuma avaliação de risco cadastrada até o momento." />;
  return <ul className="divide-y divide-line">{dados.slice(0, 5).map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><div><p className="text-xs font-semibold text-ink">Avaliação #{item.id} · Perigo #{item.perigo_id}</p><p className="mt-1 text-[11px] text-muted">Probabilidade: {item.probabilidade.toLocaleString("pt-BR")} · Severidade: {item.severidade.toLocaleString("pt-BR")}</p></div><span className="rounded border border-line bg-cream-50 px-2 py-1 text-[10px] font-medium text-brand-900">{item.classificacao || "Sem classificação"}</span></li>)}</ul>;
}
function acaoLista(dados: Acao[]) {
  if (!dados.length) return <Mensagem estado="vazio" vazio="Nenhuma ação cadastrada até o momento." />;
  return <ul className="divide-y divide-line">{dados.slice(0, 5).map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><div className="min-w-0"><p className="break-words text-xs font-semibold text-ink">{item.descricao}</p><p className="mt-1 text-[11px] text-muted">Responsável #{item.responsavel_id} · Prazo {item.prazo.split("-").reverse().join("/")}</p></div><span className="rounded border border-line bg-cream-50 px-2 py-1 text-[10px] font-medium text-brand-900">{item.status.replaceAll("_", " ")}</span></li>)}</ul>;
}
