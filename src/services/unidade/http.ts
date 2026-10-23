import { createHttp } from "../shared";
import { unidadeSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const unidadeHttp = createHttp("/unidades", unidadeSchema);
