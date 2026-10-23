"use client";
import { useId, useState, type ReactNode } from "react";
export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  const id = useId(); const [dismissed, setDismissed] = useState(false);
  return <span className="group relative inline-flex" tabIndex={0} aria-describedby={dismissed ? undefined : id} onKeyDown={e => { if (e.key === "Escape") setDismissed(true); }} onFocus={() => setDismissed(false)} onMouseEnter={() => setDismissed(false)}>{children}{!dismissed && <span id={id} role="tooltip" className="invisible absolute bottom-full left-0 z-20 mb-2 w-max max-w-64 rounded-md bg-brand-900 p-2 text-[11px] text-cream group-hover:visible group-focus-within:visible">{content}</span>}</span>;
}
