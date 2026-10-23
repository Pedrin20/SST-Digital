import { createMock } from "../shared";
import { avaliacaoRiscoSchema } from "./schema";
import type { AvaliacaoRisco } from "./types";
export const avaliacaoRiscoFixtures: AvaliacaoRisco[] = [
  {
    "id": "avr-1",
    "perigoId": "per-1",
    "avaliadorId": "usr-1",
    "data": "2026-10-20",
    "probabilidade": 5,
    "severidade": 5,
    "score": 25
  },
  {
    "id": "avr-2",
    "perigoId": "per-2",
    "avaliadorId": "usr-1",
    "data": "2026-10-20",
    "probabilidade": 4,
    "severidade": 4,
    "score": 16
  },
  {
    "id": "avr-3",
    "perigoId": "per-3",
    "avaliadorId": "usr-1",
    "data": "2026-10-20",
    "probabilidade": 3,
    "severidade": 3,
    "score": 9
  },
  {
    "id": "avr-4",
    "perigoId": "per-4",
    "avaliadorId": "usr-1",
    "data": "2026-10-20",
    "probabilidade": 4,
    "severidade": 4,
    "score": 16
  }
];
export const avaliacaoRiscoMock = createMock("avaliacaoRisco", avaliacaoRiscoSchema, avaliacaoRiscoFixtures);
