import { createHttp } from "../shared";
import { acaoSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const acaoHttp = createHttp("/acoes", acaoSchema);
