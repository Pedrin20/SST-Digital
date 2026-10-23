import { createMock } from "../shared";
import { setorSchema } from "./schema";
import type { Setor } from "./types";
export const setorFixtures: Setor[] = [
  {
    "id": "set-1",
    "unidadeId": "uni-1",
    "nome": "Usinagem Pesada & CNC",
    "colaboradores": 14
  },
  {
    "id": "set-2",
    "unidadeId": "uni-1",
    "nome": "Caldeiraria & Soldagem",
    "colaboradores": 82
  },
  {
    "id": "set-3",
    "unidadeId": "uni-1",
    "nome": "Pintura Eletrostática",
    "colaboradores": 38
  },
  {
    "id": "set-4",
    "unidadeId": "uni-1",
    "nome": "Pátio de Carga & Logística",
    "colaboradores": 42
  }
];
export const setorMock = createMock("setor", setorSchema, setorFixtures);
