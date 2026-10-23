import "server-only";
import { selectService } from "../shared";
import { acaoMock } from "./mock";
import { acaoHttp } from "./http";
export const acaoService = selectService(acaoMock, acaoHttp);
export { acaoSchema } from "./schema";
export type { Acao } from "./types";
