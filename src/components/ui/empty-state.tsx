import type { ReactNode } from "react";
export function EmptyState({ title = "Nenhum registro encontrado", description = "Tente ajustar os filtros.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div role="status" className="space-y-2 p-8 text-center text-[11px] text-muted"><p className="font-semibold text-ink">{title}</p><p>{description}</p>{action}</div>;
}
