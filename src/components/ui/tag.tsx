import type { HTMLAttributes } from "react";
export function Tag({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-block rounded border border-line bg-cream-50 px-1.5 py-0.5 font-mono text-[10px] font-medium whitespace-nowrap text-ink/70 ${className}`} {...props} />;
}
