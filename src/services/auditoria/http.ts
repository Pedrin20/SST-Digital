import { createHttp } from "../shared";
import { auditoriaSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const auditoriaHttp = createHttp("/auditorias", auditoriaSchema);
