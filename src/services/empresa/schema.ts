import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const empresaSchema = z.object({ id: z.string().min(1), nome: z.string().min(1), cnpj: z.string().regex(/^\d{14}$/), ativa: z.boolean() });
