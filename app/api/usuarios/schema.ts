import { z } from "zod";

export const usuarioSchema = z.object({ nome: z.string().trim().min(1), email: z.email(), senha: z.string().min(1), ativo: z.boolean() });
