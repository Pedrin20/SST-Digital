import "server-only";
import { selectService } from "../shared";
import { usuarioMock } from "./mock";
import { usuarioHttp } from "./http";
export const usuarioService = selectService(usuarioMock, usuarioHttp);
export { usuarioSchema } from "./schema";
export type { Usuario } from "./types";
