import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const perigoSchema = z.object({ id: z.string().min(1), setorId: z.string(), descricao: z.string(), categoria: z.enum(["acidente", "fisico", "quimico", "biologico", "ergonomico"]), norma: z.string(), nivel: z.enum(["critical", "high", "medium", "low"]) });
