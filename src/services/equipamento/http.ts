import { createHttp } from "../shared";
import { equipamentoSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const equipamentoHttp = createHttp("/equipamentos", equipamentoSchema);
