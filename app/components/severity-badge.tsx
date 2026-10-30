import type { Severity } from "@/app/lib/dashboard-data";
import { Badge } from "@/src/components/ui/badge";
const variants = { CRÍTICO: "critical", ALTO: "high", MÉDIO: "medium", BAIXO: "low" } as const;
export function SeverityBadge({ level, className }: { level: Severity; className?: string }) { return <Badge variant={variants[level]} className={className}>{level}</Badge>; }
export const severityBar: Record<Severity, string> = { CRÍTICO: "bg-critical", ALTO: "bg-high", MÉDIO: "bg-medium", BAIXO: "bg-success" };

