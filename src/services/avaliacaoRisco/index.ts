import "server-only";
import { selectService } from "../shared";
import { avaliacaoRiscoMock } from "./mock";
import { avaliacaoRiscoHttp } from "./http";
export const avaliacaoRiscoService = selectService(avaliacaoRiscoMock, avaliacaoRiscoHttp);
export { avaliacaoRiscoSchema } from "./schema";
export type { AvaliacaoRisco } from "./types";
