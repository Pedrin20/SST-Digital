import type { HTMLAttributes } from "react";
export const badgeVariants = {
  critical: "border-critical-border bg-critical-bg text-critical-text",
  high: "border-high-border bg-high-bg text-high-text",
  medium: "border-cream-300 bg-cream-100 text-medium-text",
  low: "border-brand-200 bg-brand-50 text-brand-800",
  success: "border-brand-100 bg-brand-50 text-brand-700",
  neutral: "border-line bg-cream-50 text-muted",
};
const dots = { critical: "bg-critical", high: "bg-high", medium: "bg-medium", low: "bg-brand-600", success: "bg-brand-600", neutral: "bg-muted" };
export function Badge({ variant = "neutral", className = "", children, ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof badgeVariants }) {
  return <span className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${badgeVariants[variant]} ${className}`} {...props}><span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} />{children}</span>;
}
