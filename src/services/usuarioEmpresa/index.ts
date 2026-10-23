import "server-only";
import { selectService } from "../shared";
import { usuarioEmpresaMock } from "./mock";
import { usuarioEmpresaHttp } from "./http";
export const usuarioEmpresaService = selectService(usuarioEmpresaMock, usuarioEmpresaHttp);
export { usuarioEmpresaSchema } from "./schema";
export type { UsuarioEmpresa } from "./types";
