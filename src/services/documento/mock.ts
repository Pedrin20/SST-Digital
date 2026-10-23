import { createMock } from "../shared";
import { documentoSchema } from "./schema";
import type { Documento } from "./types";
export const documentoFixtures: Documento[] = [
  {
    "id": "doc-1",
    "empresaId": "emp-1",
    "unidadeId": "uni-1",
    "titulo": "Programa de Gerenciamento de Riscos — Maracanaú",
    "tipo": "PGR",
    "revisao": "03",
    "validade": "2027-10-01"
  }
];
export const documentoMock = createMock("documento", documentoSchema, documentoFixtures);
