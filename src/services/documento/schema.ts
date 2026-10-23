import { z } from "zod";
// PROVISORIO: contrato local; docs/api não existe neste repositório.
export const documentoSchema = z.object({ id: z.string().min(1), empresaId: z.string(), unidadeId: z.string(), titulo: z.string(), tipo: z.enum(["PGR", "PCMSO", "procedimento"]), revisao: z.string(), validade: z.iso.date() });
