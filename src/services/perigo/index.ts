import "server-only";
import { selectService } from "../shared";
import { perigoMock } from "./mock";
import { perigoHttp } from "./http";
export const perigoService = selectService(perigoMock, perigoHttp);
export { perigoSchema } from "./schema";
export type { Perigo } from "./types";
