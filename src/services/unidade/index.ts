import "server-only";
import { selectService } from "../shared";
import { unidadeMock } from "./mock";
import { unidadeHttp } from "./http";
export const unidadeService = selectService(unidadeMock, unidadeHttp);
export { unidadeSchema } from "./schema";
export type { Unidade } from "./types";
