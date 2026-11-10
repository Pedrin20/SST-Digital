import { z } from "zod";

export const prioridadeSchema = z.enum(["P1", "P2", "P3"]);
export const prioridades = { P1: "Crítica", P2: "Alta", P3: "Média" } as const;
export const acaoPayload = z.object({
  prioridade: prioridadeSchema.optional(),
  perigo_id: z.number().int().positive("Informe um ID de perigo válido."),
  descricao: z.string().trim().min(1, "Informe a descrição da ação."),
  responsavel_id: z.number().int().positive("Informe um ID de responsável válido."),
  prazo: z.iso.date("Informe uma data válida."),
  status: z.string().trim().min(1, "Informe o status."),
}).strict();
export const acaoPatch = acaoPayload.partial().extend({ prioridade: prioridadeSchema.nullish() }).refine(value => Object.keys(value).length > 0, "Informe ao menos um campo.");
export const acaoSchema = acaoPayload.extend({ prioridade: prioridadeSchema.nullish(), id: z.coerce.number().int().positive(), perigo_id: z.coerce.number().int().positive(), responsavel_id: z.coerce.number().int().positive() }).strip();
export type Acao = z.infer<typeof acaoSchema>;
// O Swagger não especifica o envelope das respostas.
export function lerLista(value: unknown): Acao[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(acaoSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.acoes ?? envelope.results);
}
export function lerDetalhe(value: unknown): Acao {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return acaoSchema.parse(envelope.data ?? envelope.dados ?? envelope.acao ?? value);
}
