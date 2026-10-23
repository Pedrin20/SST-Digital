import { createMock } from "../shared";
import { auditoriaSchema } from "./schema";
import type { Auditoria } from "./types";
export const auditoriaFixtures: Auditoria[] = [
  {
    "id": "aud-1",
    "empresaId": "emp-1",
    "usuarioId": "usr-1",
    "recurso": "acao",
    "recursoId": "aca-1",
    "operacao": "alteracao",
    "dataHora": "2026-10-23T12:00:00Z",
    "descricao": "Iniciada instalação de proteção fixa na fresadora."
  }
];
export const auditoriaMock = createMock("auditoria", auditoriaSchema, auditoriaFixtures);
