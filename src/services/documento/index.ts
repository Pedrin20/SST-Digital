import "server-only";
import { selectService } from "../shared";
import { documentoMock } from "./mock";
import { documentoHttp } from "./http";
export const documentoService = selectService(documentoMock, documentoHttp);
export { documentoSchema } from "./schema";
export type { Documento } from "./types";
