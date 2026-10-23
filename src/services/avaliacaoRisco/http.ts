import { createHttp } from "../shared";
import { avaliacaoRiscoSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const avaliacaoRiscoHttp = createHttp("/avaliacoes-risco", avaliacaoRiscoSchema);
