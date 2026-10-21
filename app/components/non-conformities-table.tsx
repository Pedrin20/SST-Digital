"use client";

import { useMemo, useState } from "react";
import { nonConformities } from "@/app/lib/dashboard-data";
import { SeverityBadge } from "./severity-badge";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ColumnsIcon,
  DownloadIcon,
} from "./icons";

type Filter = "all" | "critical" | "overdue";

const PAGE_SIZE = 5;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "critical", label: "Críticas" },
  { id: "overdue", label: "Atrasadas" },
];

function toCsvValue(value: string | number | boolean) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function NonConformitiesTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: nonConformities.length,
      critical: nonConformities.filter((nc) => nc.severity === "CRÍTICO").length,
      overdue: nonConformities.filter((nc) => nc.overdue).length,
    }),
    [],
  );

  const filtered = useMemo(() => {
    if (filter === "critical") {
      return nonConformities.filter((nc) => nc.severity === "CRÍTICO");
    }
    if (filter === "overdue") {
      return nonConformities.filter((nc) => nc.overdue);
    }
    return nonConformities;
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(1);
  }

  function exportCsv() {
    const header = [
      "ID",
      "Data",
      "Hora",
      "Turno",
      "Setor",
      "Equipamento",
      "Perigo detectado",
      "Norma",
      "Criticidade",
      "Responsável",
      "Função",
      "Prazo",
      "Prazo vencido",
      "Status",
      "Ação",
    ];

    const rows = filtered.map((nc) => [
      nc.id,
      nc.date,
      nc.time,
      nc.shift,
      nc.sector,
      nc.equipment,
      nc.hazard,
      nc.norm,
      nc.severity,
      nc.owner,
      nc.role,
      nc.deadline,
      nc.overdue ? "Sim" : "Não",
      nc.status,
      nc.action,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => toCsvValue(cell)).join(";"))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nao-conformidades-sst-2026-10.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      id="nao-conformidades"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(6,78,59,0.05)]"
    >
      <div className="flex flex-col gap-4 border-b border-line p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbecea] text-[#97281c]">
            <AlertTriangleIcon className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">
                Não Conformidades e Alertas Críticos Recentes
              </h2>
              <span className="rounded border border-line bg-cream-50 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                {nonConformities.length}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted">
              Registros que demandam intervenção imediata, com prazo de encerramento parcial.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Filtrar não conformidades"
            className="flex items-center rounded-lg border border-line bg-cream-50 p-0.5"
          >
            {filters.map((item) => {
              const isActive = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => changeFilter(item.id)}
                  className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    isActive
                      ? "bg-white text-brand-900 shadow-sm"
                      : "text-muted hover:text-brand-900"
                  }`}
                >
                  {item.label}
                  <span
                    className={`ml-1 text-[10px] ${isActive ? "text-brand-700" : "text-muted/70"}`}
                  >
                    {counts[item.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] font-medium text-brand-900 transition-colors hover:border-cream-300 hover:bg-cream-50"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Exportar CSV
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-2 text-[11px] font-medium text-muted transition-colors hover:border-cream-300 hover:text-brand-900"
          >
            <ColumnsIcon className="h-3.5 w-3.5" />
            Colunas
          </button>
        </div>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <caption className="sr-only">
            Não conformidades e alertas críticos recentes de SST
          </caption>
          <thead>
            <tr className="border-b border-line bg-cream-50/70 text-[9.5px] font-semibold tracking-[0.08em] text-muted uppercase">
              <th scope="col" className="px-4 py-2.5">ID / Registro</th>
              <th scope="col" className="px-4 py-2.5">Data / Turno</th>
              <th scope="col" className="px-4 py-2.5">Setor & Equipamento</th>
              <th scope="col" className="px-4 py-2.5">Perigo detectado</th>
              <th scope="col" className="px-3 py-2.5">Norma</th>
              <th scope="col" className="px-3 py-2.5">Criticidade</th>
              <th scope="col" className="px-4 py-2.5">Responsável</th>
              <th scope="col" className="px-4 py-2.5">Prazo resolução</th>
              <th scope="col" className="px-4 py-2.5 text-right">Ação imediata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((nc) => (
              <tr key={nc.id} className="group transition-colors hover:bg-cream-50/60">
                <td className="px-4 py-3.5 align-top">
                  <span className="font-mono text-[11px] font-semibold whitespace-nowrap text-brand-900">
                    {nc.id}
                  </span>
                  <p className="mt-0.5 text-[10px] text-muted">Registro digital</p>
                </td>
                <td className="px-4 py-3.5 align-top whitespace-nowrap">
                  <p className="text-[11.5px] font-medium text-ink">{nc.date}</p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {nc.time} · {nc.shift}
                  </p>
                </td>
                <td className="px-4 py-3.5 align-top">
                  <p className="max-w-[170px] text-[11.5px] font-medium text-ink">{nc.sector}</p>
                  <p className="mt-0.5 max-w-[170px] text-[10px] text-muted">{nc.equipment}</p>
                </td>
                <td className="px-4 py-3.5 align-top">
                  <p className="max-w-[210px] text-[11.5px] leading-snug text-ink/90">{nc.hazard}</p>
                </td>
                <td className="px-3 py-3.5 align-top">
                  <span className="inline-block rounded border border-line bg-cream-50 px-1.5 py-0.5 font-mono text-[10px] font-medium whitespace-nowrap text-ink/70">
                    {nc.norm}
                  </span>
                </td>
                <td className="px-3 py-3.5 align-top">
                  <SeverityBadge level={nc.severity} />
                </td>
                <td className="px-4 py-3.5 align-top">
                  <p className="max-w-[130px] text-[11.5px] font-medium text-ink">{nc.owner}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{nc.role}</p>
                </td>
                <td className="px-4 py-3.5 align-top whitespace-nowrap">
                  <p
                    className={`flex items-center gap-1 text-[11px] font-medium ${
                      nc.overdue
                        ? "text-[#97281c]"
                        : nc.status === "Concluída"
                          ? "text-brand-700"
                          : "text-ink"
                    }`}
                  >
                    {nc.overdue ? <ClockIcon className="h-3 w-3" /> : null}
                    {nc.deadline}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {nc.overdue
                      ? "Prazo vencido"
                      : nc.status === "Concluída"
                        ? "Encerrado no prazo"
                        : "Dentro do prazo"}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-right align-top">
                  {nc.status === "Concluída" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-[10.5px] font-semibold text-brand-700">
                      <CheckIcon className="h-3 w-3" />
                      Finalizada
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-[10.5px] font-semibold whitespace-nowrap transition-colors ${
                        nc.overdue
                          ? "bg-brand-900 text-cream hover:bg-brand-800"
                          : "border border-line bg-white text-brand-900 hover:border-brand-200 hover:bg-cream-50"
                      }`}
                    >
                      {nc.action}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
                  Nenhum registro encontrado para este filtro.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-[10.5px] text-muted">
          Mostrando <span className="font-medium text-ink">{filtered.length === 0 ? 0 : start + 1}–
          {Math.min(start + PAGE_SIZE, filtered.length)}</span> de{" "}
          <span className="font-medium text-ink">{filtered.length}</span> registros ·{" "}
          {counts.overdue} com prazo vencido
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-muted transition-colors hover:text-brand-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              className={`h-7 min-w-7 rounded-md px-2 text-[11px] font-medium transition-colors ${
                pageNumber === currentPage
                  ? "bg-brand-900 text-cream"
                  : "border border-line bg-white text-muted hover:text-brand-900"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Próxima página"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white text-muted transition-colors hover:text-brand-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
