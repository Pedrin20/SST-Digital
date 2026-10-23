import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const dashboardResumoSchema = z.object({ id: z.string().min(1), empresaId: z.string(), unidadeId: z.string(), referencia: z.string().regex(/^\d{4}-\d{2}$/), setores: z.number().int().nonnegative(), perigos: z.number().int().nonnegative(), acoesAbertas: z.number().int().nonnegative(), acoesConcluidas: z.number().int().nonnegative() });
