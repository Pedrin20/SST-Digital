import type { HTMLAttributes } from "react";
export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-xl border border-line bg-white shadow-card ${className}`} {...props} />;
}
