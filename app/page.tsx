import type { ComponentType, SVGProps } from "react";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";
import { KpiCard, MiniProgress } from "./components/kpi-card";
import { NonConformitiesTable } from "./components/non-conformities-table";
import { SeverityBadge, severityBar } from "./components/severity-badge";
import { riskSectors, rootCauses } from "./lib/dashboard-data";
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileIcon,
  InspectionIcon,
  LightbulbIcon,
  MatrixIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrendUpIcon,
} from "./components/icons";

function QuickAction({
  icon: Icon,
  children,
  className = "",
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] font-medium text-brand-900 shadow-[0_1px_1px_rgba(6,78,59,0.04)] transition-colors hover:border-brand-200 hover:bg-cream-50 ${className}`}
    >
      <Icon className="h-3.5 w-3.5 text-brand-700" />
      {children}
    </button>
  );
}

export default function DashboardPage() {
  return (
    <div id="dashboard" className="min-h-screen bg-cream">
      <Sidebar />

      <div className="lg:pl-[264px]">
        <Topbar />

        <main className="mx-auto w-full max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8">
          {/* Trilha e ações rápidas */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5 text-[11px]">
              <span className="font-medium text-brand-900">SST Digital</span>
              <ChevronRightIcon className="h-3 w-3 text-muted/60" />
              <a href="#dashboard" className="text-muted transition-colors hover:text-brand-900">
                Gestão de SST
              </a>
              <ChevronRightIcon className="h-3 w-3 text-muted/60" />
              <span aria-current="page" className="text-ink">
                Dashboard Geral
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <QuickAction icon={AlertTriangleIcon} className="hidden sm:inline-flex">
                Registrar quase-acidente
              </QuickAction>
              <QuickAction icon={FileIcon} className="hidden md:inline-flex">
                Emitir CAT
              </QuickAction>
              <QuickAction icon={DownloadIcon}>Relatório mensal</QuickAction>
            </div>
          </div>

          {/* Cabeçalho do painel */}
          <div className="mt-4 flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-brand-900 sm:text-[26px]">
                Dashboard Geral de SST &amp; Indicadores
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  Atualizado há 2 minutos
                </span>
                <span aria-hidden="true" className="text-cream-300">
                  •
                </span>
                <span>Outubro de 2026</span>
                <span aria-hidden="true" className="text-cream-300">
                  •
                </span>
                <span>Base consolidada NR-01 (GRO/PGR)</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] font-medium text-ink transition-colors hover:border-brand-200"
              >
                <CalendarIcon className="h-3.5 w-3.5 text-brand-700" />
                Out 2026
                <ChevronDownIcon className="h-3 w-3 text-muted" />
              </button>
              <a
                href="#inspecoes"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-2 text-[11px] font-semibold text-cream transition-colors hover:bg-brand-800"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Nova inspeção
              </a>
            </div>
          </div>

          {/* Indicadores */}
          <section aria-label="Indicadores de segurança do trabalho">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-5">
              <KpiCard
                className="lg:col-span-2 2xl:col-span-1"
                label="Dias sem afastamento"
                value="342"
                unit="dias"
                icon={ShieldCheckIcon}
                delta="+18 dias"
                deltaNote="vs. mês anterior"
                tone="positive"
                trend="up"
                footer={
                  <>
                    <MiniProgress
                      value={(342 / 365) * 100}
                      label="Meta anual de dias sem afastamento"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-muted">
                      <span>Meta anual</span>
                      <span className="font-medium text-ink">342 / 365</span>
                    </div>
                  </>
                }
              />

              <KpiCard
                className="lg:col-span-2 2xl:col-span-1"
                label="Taxa de frequência (TF)"
                value="1,42"
                icon={ActivityIcon}
                delta="−0,36"
                deltaNote="vs. mês anterior"
                tone="positive"
                trend="down"
                footer={
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9.5px] text-muted">Gravidade (TG)</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-ink">18,5</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] text-muted">Absenteísmo</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-ink">1,8%</p>
                    </div>
                  </div>
                }
              />

              <KpiCard
                className="lg:col-span-2 2xl:col-span-1"
                label="Inspeções do mês"
                value="48"
                unit="/ 52"
                icon={InspectionIcon}
                delta="92,3%"
                deltaNote="de conclusão"
                tone="neutral"
                trend="flat"
                footer={
                  <>
                    <MiniProgress value={(48 / 52) * 100} label="Inspeções concluídas no mês" />
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-muted">
                      <span>48 de 52 inspeções</span>
                      <span className="font-medium text-ink">4 restantes</span>
                    </div>
                  </>
                }
              />

              <KpiCard
                className="lg:col-span-3 2xl:col-span-1"
                label="Não conformidades"
                value="7"
                unit="abertas"
                icon={AlertTriangleIcon}
                delta="2 críticas"
                deltaNote="vencem hoje"
                tone="negative"
                trend="up"
                footer={
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded border border-[#efd7a4] bg-[#fdf3dc] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#85500d]">
                      3 altas
                    </span>
                    <span className="rounded border border-cream-300 bg-cream-100 px-1.5 py-0.5 text-[9.5px] font-medium text-[#7d5a12]">
                      4 médias
                    </span>
                    <span className="text-[9.5px] font-medium text-[#97281c]">2 em atraso</span>
                  </div>
                }
              />

              <KpiCard
                className="lg:col-span-3 2xl:col-span-1"
                label="Conformidade NR-01"
                value="96,4"
                unit="%"
                icon={BadgeCheckIcon}
                delta="+1,2 p.p."
                deltaNote="no trimestre"
                tone="positive"
                trend="up"
                footer={
                  <>
                    <MiniProgress value={96.4} label="Índice de conformidade NR-01" />
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-muted">
                      <span>1.240 aptos</span>
                      <span className="font-medium text-ink">45 pendentes</span>
                    </div>
                  </>
                }
              />
            </div>
          </section>

          {/* Matriz de riscos + causa raiz */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <section
              id="matriz"
              className="flex scroll-mt-24 flex-col rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,78,59,0.05)] xl:col-span-7"
            >
              <div className="flex items-start justify-between gap-3 p-4 pb-3.5 sm:p-5 sm:pb-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-brand-900">
                    <MatrixIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[14px] leading-snug font-semibold tracking-tight text-ink">
                      Matriz de Riscos &amp; Vulnerabilidade por Setor
                    </h2>
                    <p className="mt-0.5 text-[11px] text-muted">
                      Probabilidade × Severidade · Ciclo NR-01 (GRO/PGR)
                    </p>
                  </div>
                </div>
                <span className="hidden items-center gap-1 rounded border border-line bg-cream-50 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-wide text-muted sm:inline-flex">
                  NR-01
                </span>
              </div>

              <div className="hidden grid-cols-[1fr_auto] items-center gap-4 border-y border-line bg-cream-50/60 px-5 py-1.5 text-[8.5px] font-semibold tracking-[0.1em] text-muted uppercase sm:grid">
                <span>Setor / perigo identificado</span>
                <span>Exposição · Score · Tendência</span>
              </div>

              <ul className="divide-y divide-line">
                {riskSectors.map((risk) => (
                  <li key={risk.sector} className="px-4 py-3.5 sm:px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[12px] font-semibold text-ink">{risk.sector}</h3>
                          <SeverityBadge level={risk.severity} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-muted">
                          {risk.hazard}
                        </p>
                        <div className="mt-2 h-1 w-full max-w-[260px] overflow-hidden rounded-full bg-cream-100">
                          <div
                            className={`h-full rounded-full ${severityBar[risk.severity]}`}
                            style={{ width: `${Number(risk.score.replace(",", ".")) * 10}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-[76px]">
                          <p className="text-[8.5px] tracking-wide text-muted uppercase">Exposição</p>
                          <p className="mt-0.5 text-[11.5px] font-semibold text-ink">
                            {risk.exposed}{" "}
                            <span className="text-[9px] font-normal text-muted">colab.</span>
                          </p>
                        </div>
                        <div className="w-[42px]">
                          <p className="text-[8.5px] tracking-wide text-muted uppercase">Score</p>
                          <p className="mt-0.5 text-[11.5px] font-semibold text-ink">
                            {risk.score}
                            <span className="text-[9px] font-normal text-muted">/10</span>
                          </p>
                        </div>
                        <div
                          className={`flex w-[74px] items-center gap-1 text-[10px] font-medium ${
                            risk.trend === "Alta"
                              ? "text-[#97281c]"
                              : risk.trend === "Estável"
                                ? "text-[#85500d]"
                                : "text-brand-700"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {risk.trend}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3 rounded-b-xl border-t border-line bg-cream-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        "conic-gradient(#064E3B 0 83.8%, #F2E1C2 83.8% 100%)",
                    }}
                  >
                    <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-white text-[8.5px] font-bold text-brand-900">
                      8,4
                    </span>
                  </span>
                  <div>
                    <p className="text-[8.5px] font-semibold tracking-[0.09em] text-muted uppercase">
                      Índice geral de gravidade do perigo
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-semibold text-ink">
                      8,38 <span className="font-normal text-muted">/ 10</span>{" "}
                      <span className="ml-1 text-[10px] font-medium text-[#97281c]">
                        Classificação: crítico
                      </span>
                    </p>
                  </div>
                </div>
                <a
                  href="#matriz"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-900 underline-offset-4 hover:underline"
                >
                  Ver matriz completa
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </section>

            <section
              id="planos"
              className="flex scroll-mt-24 flex-col rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,78,59,0.05)] xl:col-span-5"
            >
              <div className="flex items-start justify-between gap-3 p-4 pb-3.5 sm:p-5 sm:pb-3.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-brand-900">
                    <TrendUpIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[14px] leading-snug font-semibold tracking-tight text-ink">
                      Causa Raiz de Quase-Acidentes
                    </h2>
                    <p className="mt-0.5 text-[11px] text-muted">
                      Últimos 6 meses · 381 eventos classificados
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3 px-4 py-4 sm:px-5">
                {rootCauses.map((cause) => (
                  <div key={cause.cause}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[11px] font-medium text-ink/90">{cause.cause}</p>
                      <p className="text-[11px] font-semibold text-brand-900">{cause.percent}%</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-900 to-brand-600"
                        style={{ width: `${cause.percent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[9px] text-muted">{cause.events} eventos</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-b-xl border-t border-cream-200 bg-cream-50 px-4 py-3.5 sm:px-5">
                <LightbulbIcon className="mt-px h-4 w-4 shrink-0 text-[#85500d]" />
                <p className="text-[10px] leading-relaxed text-muted">
                  <span className="font-semibold text-ink">Recomendação:</span> reforçar a
                  inspeção semanal e a reciclagem de EPI no setor de Caldeiraria &amp; Soldagem.
                </p>
              </div>
            </section>
          </div>

          {/* Não conformidades */}
          <div className="mt-4">
            <NonConformitiesTable />
          </div>

          <footer className="mt-5 flex flex-col gap-2 border-t border-line pt-4 pb-1 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              SST Digital © 2026 · Dados consolidados de demonstração · Base NR-01, NR-06, NR-12
            </p>
            <div className="flex items-center gap-4">
              <a href="#configuracoes" className="transition-colors hover:text-brand-900">
                Privacidade
              </a>
              <a href="#documentos" className="transition-colors hover:text-brand-900">
                Documentação
              </a>
              <a href="#suporte" className="transition-colors hover:text-brand-900">
                Suporte
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
