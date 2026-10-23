import { createMock } from "../shared";
import { acaoSchema } from "./schema";
import type { Acao } from "./types";
export const acaoFixtures: Acao[] = [
  {
    "id": "aca-1",
    "perigoId": "per-1",
    "responsavelId": "usr-2",
    "titulo": "Instalar proteção fixa na fresadora",
    "prazo": "2026-10-24",
    "status": "em_andamento"
  },
  {
    "id": "aca-2",
    "perigoId": "per-2",
    "responsavelId": "usr-1",
    "titulo": "Revisar exaustão da bancada de soldagem",
    "prazo": "2026-10-25",
    "status": "pendente"
  },
  {
    "id": "aca-3",
    "perigoId": "per-3",
    "responsavelId": "usr-2",
    "titulo": "Substituir filtros respiratórios",
    "prazo": "2026-10-26",
    "status": "concluida"
  },
  {
    "id": "aca-4",
    "perigoId": "per-4",
    "responsavelId": "usr-1",
    "titulo": "Demarcar faixa exclusiva de pedestres",
    "prazo": "2026-10-27",
    "status": "pendente"
  }
];
export const acaoMock = createMock("acao", acaoSchema, acaoFixtures);
