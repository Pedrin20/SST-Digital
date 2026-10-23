import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const usuarioSchema = z.object({ id: z.string().min(1), nome: z.string(), email: z.email(), ativo: z.boolean() });
