import { createMock } from "../shared";
import { equipamentoSchema } from "./schema";
import type { Equipamento } from "./types";
export const equipamentoFixtures: Equipamento[] = [
  {
    "id": "equ-1",
    "setorId": "set-1",
    "nome": "Fresadora P-414",
    "patrimonio": "PAT-001",
    "status": "interditado"
  },
  {
    "id": "equ-2",
    "setorId": "set-2",
    "nome": "Bancada de soldagem 03",
    "patrimonio": "PAT-002",
    "status": "operacional"
  },
  {
    "id": "equ-3",
    "setorId": "set-3",
    "nome": "Cabine de pintura 02",
    "patrimonio": "PAT-003",
    "status": "operacional"
  },
  {
    "id": "equ-4",
    "setorId": "set-4",
    "nome": "Empilhadeira Hyster 07",
    "patrimonio": "PAT-004",
    "status": "operacional"
  }
];
export const equipamentoMock = createMock("equipamento", equipamentoSchema, equipamentoFixtures);
