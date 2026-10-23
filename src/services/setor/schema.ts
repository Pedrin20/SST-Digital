import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const setorSchema = z.object({ id: z.string().min(1), unidadeId: z.string(), nome: z.string(), colaboradores: z.number().int().nonnegative() });
