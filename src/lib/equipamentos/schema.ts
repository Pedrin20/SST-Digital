import { z } from "zod";

export const equipamentoPayload = z.object({
  setor_id: z.number().int().positive("Informe um ID de setor válido."),
  nome: z.string().trim().min(1, "Informe o nome do equipamento."),
  tipo: z.string().trim().min(1, "Informe o tipo do equipamento."),
  patrimonio: z.string().trim().nullable(),
  status: z.string().trim().min(1, "Informe o status."),
  proxima_inspecao: z.iso.date("Informe uma data válida."),
}).strict();
export const equipamentoPatch = equipamentoPayload.partial().refine(value => Object.keys(value).length > 0, "Informe ao menos um campo.");
export const equipamentoSchema = equipamentoPayload.extend({ id: z.coerce.number().int().positive(), setor_id: z.coerce.number().int().positive(), patrimonio: z.string().nullable().transform(value => value ?? "") }).strip();
export type Equipamento = z.infer<typeof equipamentoSchema>;
// O Swagger não especifica o envelope das respostas.
export function lerLista(value: unknown): Equipamento[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(equipamentoSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.equipamentos ?? envelope.results);
}
export function lerDetalhe(value: unknown): Equipamento {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return equipamentoSchema.parse(envelope.data ?? envelope.dados ?? envelope.equipamento ?? value);
}
