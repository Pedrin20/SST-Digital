import { createHttp } from "../shared";
import { empresaSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const empresaHttp = createHttp("/empresas", empresaSchema);
