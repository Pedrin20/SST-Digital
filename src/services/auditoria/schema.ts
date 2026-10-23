import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const auditoriaSchema = z.object({ id: z.string().min(1), empresaId: z.string(), usuarioId: z.string(), recurso: z.string(), recursoId: z.string(), operacao: z.enum(["criacao", "alteracao", "exclusao"]), dataHora: z.iso.datetime(), descricao: z.string() });
