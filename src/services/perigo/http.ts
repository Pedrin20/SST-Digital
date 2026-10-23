import { createHttp } from "../shared";
import { perigoSchema } from "./schema";
// PROVISORIO: confirmar rota e envelope com o backend.
export const perigoHttp = createHttp("/perigos", perigoSchema);
