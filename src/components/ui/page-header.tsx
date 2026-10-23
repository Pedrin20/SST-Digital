import type { ReactNode } from "react";
export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-4 py-5"><div><h1 className="text-[22px] font-semibold tracking-tight text-brand-900 sm:text-[26px]">{title}</h1>{description && <div className="mt-1.5 text-[11.5px] text-muted">{description}</div>}</div>{actions && <div className="flex gap-2">{actions}</div>}</header>;
}
