import { z } from "zod";

export const perfilProfissionalSchema = z.object({ tipo_profissional: z.string().optional(), data_nascimento: z.string().optional(), cpf: z.string().optional(), telefone: z.string().optional(), registro_profissional: z.string().optional(), foto_chave: z.string().optional(), documento_profissional_chave: z.string().optional() });
export const usuarioSchema = z.object({ nome: z.string().trim().min(1), email: z.email(), senha: z.string().min(1), ativo: z.boolean(), perfil_profissional: perfilProfissionalSchema.optional() });
