import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const unidadeSchema = z.object({ id: z.string().min(1), empresaId: z.string(), nome: z.string(), cidade: z.string(), uf: z.string().length(2) });
