import { z } from "zod";
export const perigoPayload = z.object({
  setor_id: z.number().int().positive("Informe um ID de setor válido."),
  descricao: z.string().trim().min(1, "Informe a descrição do perigo."),
  fonte: z.string().trim(),
  consequencias: z.string().trim(),
}).strict();
export const perigoPatch = perigoPayload.partial().refine(value => Object.keys(value).length > 0, "Informe ao menos um campo.");
export const perigoSchema = perigoPayload.extend({
  id: z.coerce.number().int().positive(), setor_id: z.coerce.number().int().positive(),
  fonte: z.string().nullable().transform(value => value ?? ""),
  consequencias: z.string().nullable().transform(value => value ?? ""),
}).strip();
export type Perigo = z.infer<typeof perigoSchema>;
// Envelopes provisórios: o Swagger não descreve a estrutura das respostas.
export function lerLista(value: unknown): Perigo[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(perigoSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.perigos ?? envelope.results);
}
export function lerDetalhe(value: unknown): Perigo {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return perigoSchema.parse(envelope.data ?? envelope.dados ?? envelope.perigo ?? value);
}
