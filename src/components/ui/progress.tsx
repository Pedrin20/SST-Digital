export function Progress({ value, label = "Progresso", tone = "brand" }: { value: number; label?: string; tone?: "brand" | "critical" | "warning" }) {
  const clamped = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return <div role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200"><div className={`h-full rounded-full ${tone === "critical" ? "bg-critical" : tone === "warning" ? "bg-high" : "bg-brand-900"}`} style={{ width: `${clamped}%` }} /></div>;
}
