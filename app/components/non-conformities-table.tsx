"use client";
import { useState } from "react";
import { nonConformities, type NonConformity } from "@/app/lib/dashboard-data";
import { SeverityBadge } from "./severity-badge";
import { CheckIcon, ClockIcon, DownloadIcon } from "./icons";
import { Button, Card, DataTable, Tabs, Tag } from "@/src/components/ui";
type Filter = "all" | "critical" | "overdue";
const filters: { id: Filter; label: string }[] = [{ id: "all", label: "Todas" }, { id: "critical", label: "Críticas" }, { id: "overdue", label: "Atrasadas" }];
function toCsvValue(value: string | number | boolean) { return '"' + String(value).replace(/"/g, '""') + '"'; }
const columns = [{ id: "col-0", header: "ID / Registro", sortValue: (nc: NonConformity) => nc.id, cell: (nc: NonConformity) => <>
                  <span className="font-mono text-[11px] font-semibold whitespace-nowrap text-brand-900">
                    {nc.id}
                  </span>
                  <p className="mt-0.5 text-[10px] text-muted">Registro digital</p>
                </> },
{ id: "col-1", header: "Data / Turno", sortValue: (nc: NonConformity) => nc.date, cell: (nc: NonConformity) => <>
                  <p className="text-[11.5px] font-medium text-ink">{nc.date}</p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {nc.time} · {nc.shift}
                  </p>
                </> },
{ id: "col-2", header: "Setor & Equipamento", sortValue: (nc: NonConformity) => nc.sector, cell: (nc: NonConformity) => <>
                  <p className="max-w-[170px] text-[11.5px] font-medium text-ink">{nc.sector}</p>
                  <p className="mt-0.5 max-w-[170px] text-[10px] text-muted">{nc.equipment}</p>
                </> },
{ id: "col-3", header: "Perigo detectado", sortValue: (nc: NonConformity) => nc.hazard, cell: (nc: NonConformity) => <>
                  <p className="max-w-[210px] text-[11.5px] leading-snug text-ink/90">{nc.hazard}</p>
                </> },
{ id: "col-4", header: "Norma", sortValue: (nc: NonConformity) => nc.norm, cell: (nc: NonConformity) => <>
                  <Tag>
                    {nc.norm}
                  </Tag>
                </> },
{ id: "col-5", header: "Criticidade", sortValue: (nc: NonConformity) => ({ BAIXO: 1, MÉDIO: 2, ALTO: 3, CRÍTICO: 4 })[nc.severity], cell: (nc: NonConformity) => <>
                  <SeverityBadge level={nc.severity} />
                </> },
{ id: "col-6", header: "Responsável", sortValue: (nc: NonConformity) => nc.owner, cell: (nc: NonConformity) => <>
                  <p className="max-w-[130px] text-[11.5px] font-medium text-ink">{nc.owner}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{nc.role}</p>
                </> },
{ id: "col-7", header: "Prazo resolução", cell: (nc: NonConformity) => <>
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
                </> },
{ id: "col-8", header: "Ação imediata",  cell: (nc: NonConformity) => <>
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
                </> }];
export function NonConformitiesTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const counts = { all: nonConformities.length, critical: nonConformities.filter(nc => nc.severity === "CRÍTICO").length, overdue: nonConformities.filter(nc => nc.overdue).length };
  const filtered = nonConformities.filter(nc => filter === "critical" ? nc.severity === "CRÍTICO" : filter === "overdue" ? nc.overdue : true);
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

  return <Card id="nao-conformidades" className="scroll-mt-24 overflow-hidden"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5"><div><h2 className="text-[15px] font-semibold tracking-tight">Não Conformidades e Alertas Críticos Recentes</h2><p className="mt-0.5 text-[11.5px] text-muted">Registros que demandam intervenção imediata, com prazo de encerramento parcial.</p></div><div className="flex flex-wrap items-center gap-2"><Tabs label="Filtrar não conformidades" value={filter} onChange={id => setFilter(id as Filter)} items={filters.map(item => ({ id: item.id, label: item.label + " " + counts[item.id] }))} /><Button variant="secondary" onClick={exportCsv}><DownloadIcon className="h-3.5 w-3.5" />Exportar CSV</Button></div></div><DataTable key={filter} data={filtered} columns={columns} rowKey={nc => nc.id} caption="Não conformidades e alertas críticos recentes de SST" /><p className="px-4 pb-3 text-[10.5px] text-muted">{counts.overdue} com prazo vencido</p></Card>;
}
