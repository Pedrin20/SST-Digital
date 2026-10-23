import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const acaoSchema = z.object({ id: z.string().min(1), perigoId: z.string(), responsavelId: z.string(), titulo: z.string(), prazo: z.iso.date(), status: z.enum(["pendente", "em_andamento", "concluida"]) });
