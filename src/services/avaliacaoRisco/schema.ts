import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const avaliacaoRiscoSchema = z.object({ id: z.string().min(1), perigoId: z.string(), avaliadorId: z.string(), data: z.iso.date(), probabilidade: z.number().int().min(1).max(5), severidade: z.number().int().min(1).max(5), score: z.number().min(1).max(25) });
