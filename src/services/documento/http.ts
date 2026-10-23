import { createHttp } from "../shared";
import { documentoSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const documentoHttp = createHttp("/documentos", documentoSchema);
