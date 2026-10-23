import "server-only";
import { selectService } from "../shared";
import { empresaMock } from "./mock";
import { empresaHttp } from "./http";
export const empresaService = selectService(empresaMock, empresaHttp);
export { empresaSchema } from "./schema";
export type { Empresa } from "./types";
