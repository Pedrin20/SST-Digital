import type { z } from "zod";
import type { dashboardResumoSchema } from "./schema";
export type DashboardResumo = z.infer<typeof dashboardResumoSchema>;
