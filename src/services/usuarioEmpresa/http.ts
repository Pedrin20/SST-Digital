import { createHttp } from "../shared";
import { usuarioEmpresaSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const usuarioEmpresaHttp = createHttp("/usuarios-empresas", usuarioEmpresaSchema);
