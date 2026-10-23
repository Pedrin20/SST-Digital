import { createHttp } from "../shared";
import { dashboardResumoSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const dashboardResumoHttp = createHttp("/dashboard-resumos", dashboardResumoSchema);
