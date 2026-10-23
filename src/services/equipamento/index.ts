import "server-only";
import { selectService } from "../shared";
import { equipamentoMock } from "./mock";
import { equipamentoHttp } from "./http";
export const equipamentoService = selectService(equipamentoMock, equipamentoHttp);
export { equipamentoSchema } from "./schema";
export type { Equipamento } from "./types";
