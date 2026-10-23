import "server-only";
import { selectService } from "../shared";
import { auditoriaMock } from "./mock";
import { auditoriaHttp } from "./http";
export const auditoriaService = selectService(auditoriaMock, auditoriaHttp);
export { auditoriaSchema } from "./schema";
export type { Auditoria } from "./types";
