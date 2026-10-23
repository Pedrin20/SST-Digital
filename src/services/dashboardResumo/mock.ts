import { createMock } from "../shared";
import { dashboardResumoSchema } from "./schema";
import type { DashboardResumo } from "./types";
export const dashboardResumoFixtures: DashboardResumo[] = [
  {
    "id": "res-1",
    "empresaId": "emp-1",
    "unidadeId": "uni-1",
    "referencia": "2026-10",
    "setores": 4,
    "perigos": 4,
    "acoesAbertas": 3,
    "acoesConcluidas": 1
  }
];
export const dashboardResumoMock = createMock("dashboardResumo", dashboardResumoSchema, dashboardResumoFixtures);
