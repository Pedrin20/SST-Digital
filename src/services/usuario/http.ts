import { createHttp } from "../shared";
import { usuarioSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const usuarioHttp = createHttp("/usuarios", usuarioSchema);
