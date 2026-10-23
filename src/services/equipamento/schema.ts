import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const equipamentoSchema = z.object({ id: z.string().min(1), setorId: z.string(), nome: z.string(), patrimonio: z.string(), status: z.enum(["operacional", "manutencao", "interditado"]) });
