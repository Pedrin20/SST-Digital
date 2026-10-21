import type { Severity } from "@/app/lib/dashboard-data";

const badgeStyles: Record<Severity, string> = {
  CRÍTICO: "border-[#efc4bd] bg-[#fbecea] text-[#97281c]",
  ALTO: "border-[#efd7a4] bg-[#fdf3dc] text-[#85500d]",
  MÉDIO: "border-cream-300 bg-cream-100 text-[#7d5a12]",
  BAIXO: "border-brand-200 bg-brand-50 text-brand-800",
};

const dotStyles: Record<Severity, string> = {
  CRÍTICO: "bg-[#b42318]",
  ALTO: "bg-[#d18b12]",
  MÉDIO: "bg-[#c9a227]",
  BAIXO: "bg-brand-600",
};

export function SeverityBadge({
  level,
  className = "",
}: {
  level: Severity;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${badgeStyles[level]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[level]}`} />
      {level}
    </span>
  );
}


export const severityBar: Record<Severity, string> = {
  CRÍTICO: "bg-[#b42318]",
  ALTO: "bg-[#d18b12]",
  MÉDIO: "bg-[#c9a227]",
  BAIXO: "bg-brand-600",
};
