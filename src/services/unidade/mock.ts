import { createMock } from "../shared";
import { unidadeSchema } from "./schema";
import type { Unidade } from "./types";
export const unidadeFixtures: Unidade[] = [
  {
    "id": "uni-1",
    "empresaId": "emp-1",
    "nome": "Unidade Industrial Maracanaú",
    "cidade": "Maracanaú",
    "uf": "CE"
  }
];
export const unidadeMock = createMock("unidade", unidadeSchema, unidadeFixtures);
