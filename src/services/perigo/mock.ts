import { createMock } from "../shared";
import { perigoSchema } from "./schema";
import type { Perigo } from "./types";
export const perigoFixtures: Perigo[] = [
  {
    "id": "per-1",
    "setorId": "set-1",
    "descricao": "Máquina sem proteção no ponto de operação",
    "categoria": "acidente",
    "norma": "NR-12",
    "nivel": "critical"
  },
  {
    "id": "per-2",
    "setorId": "set-2",
    "descricao": "Ventilação insuficiente na soldagem",
    "categoria": "fisico",
    "norma": "NR-33",
    "nivel": "high"
  },
  {
    "id": "per-3",
    "setorId": "set-3",
    "descricao": "Exposição a solventes e tintas epóxi",
    "categoria": "quimico",
    "norma": "NR-06",
    "nivel": "medium"
  },
  {
    "id": "per-4",
    "setorId": "set-4",
    "descricao": "Circulação de empilhadeiras sem faixa exclusiva",
    "categoria": "acidente",
    "norma": "NR-11",
    "nivel": "high"
  }
];
export const perigoMock = createMock("perigo", perigoSchema, perigoFixtures);
