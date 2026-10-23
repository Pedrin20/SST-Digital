import { createHttp } from "../shared";
import { setorSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const setorHttp = createHttp("/setores", setorSchema);
