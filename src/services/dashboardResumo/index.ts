import "server-only";
import { selectService } from "../shared";
import { dashboardResumoMock } from "./mock";
import { dashboardResumoHttp } from "./http";
export const dashboardResumoService = selectService(dashboardResumoMock, dashboardResumoHttp);
export { dashboardResumoSchema } from "./schema";
export type { DashboardResumo } from "./types";
