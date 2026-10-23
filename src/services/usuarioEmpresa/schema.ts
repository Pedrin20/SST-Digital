import { z } from "zod";
import { profiles } from "@/src/lib/permissions";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const usuarioEmpresaSchema = z.object({ id: z.string().min(1), usuarioId: z.string(), empresaId: z.string(), perfil: z.enum(profiles), ativo: z.boolean() });
