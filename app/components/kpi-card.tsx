import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "./icons";

type Tone = "positive" | "negative" | "neutral";

const deltaStyles: Record<Tone, string> = {
  positive: "border-brand-100 bg-brand-50 text-brand-700",
  negative: "border-[#efc4bd] bg-[#fbecea] text-[#97281c]",
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
      className={`flex h-full flex-col rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(6,78,59,0.05)] ${className}`}
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

export function MiniProgress({
  value,
  tone = "brand",
  label,
}: {
  value: number;
  tone?: "brand" | "critical" | "warning";
  label?: string;
}) {
  const bar =
    tone === "critical"
      ? "bg-[#b42318]"
      : tone === "warning"
        ? "bg-[#d18b12]"
        : "bg-brand-900";

  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200"
      >
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
