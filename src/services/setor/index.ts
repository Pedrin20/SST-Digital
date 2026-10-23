import "server-only";
import { selectService } from "../shared";
import { setorMock } from "./mock";
import { setorHttp } from "./http";
export const setorService = selectService(setorMock, setorHttp);
export { setorSchema } from "./schema";
export type { Setor } from "./types";
