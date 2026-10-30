import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "@/app/components/icons";

type Tone = "positive" | "negative" | "neutral";

const deltaStyles: Record<Tone, string> = {
  positive: "border-success-border bg-success-bg text-success-text",
  negative: "border-critical-border bg-critical-bg text-critical-text",
  neutral: "border-line bg-cream-50 text-muted",
};

export function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  delta,
  deltaNote,
  tone = "neutral",
  trend = "up",
  footer,
  className = "",
}: {
  label: string;
  value: string;
  unit?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  delta: string;
  deltaNote: string;
  tone?: Tone;
  trend?: "up" | "down" | "flat";
  footer: ReactNode;
  className?: string;
}) {
  const TrendIcon = trend === "down" ? ArrowDownRightIcon : ArrowUpRightIcon;

  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-line bg-white p-4 shadow-card ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] leading-snug font-semibold tracking-[0.09em] text-muted uppercase">
          {label}
        </p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cream-100 text-brand-900">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-[28px] leading-none font-semibold tracking-tight text-ink">
          {value}
        </span>
        {unit ? <span className="text-[13px] font-medium text-muted">{unit}</span> : null}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`inline-flex shrink-0 items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${deltaStyles[tone]}`}
        >
          {trend !== "flat" ? <TrendIcon className="h-3 w-3" /> : null}
          {delta}
        </span>
        <span className="truncate text-[10.5px] text-muted">{deltaNote}</span>
      </div>

      <div className="mt-auto border-t border-line/80 pt-3">
        <div className="pt-0.5">{footer}</div>
      </div>
    </article>
  );
}


