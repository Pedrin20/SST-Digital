import { z } from "zod";
export const setorPayload = z.object({
  unidade_id: z.number().int().positive("Informe um ID de unidade válido."),
  nome: z.string().trim().min(1, "Informe o nome do setor."),
  ativo: z.boolean(),
}).strict();
export const setorSchema = setorPayload.extend({
  id: z.coerce.number().int().positive(),
  unidade_id: z.coerce.number().int().positive(),
  ativo: z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(value => value === true || value === 1),
}).strip();
export type Setor = z.infer<typeof setorSchema>;
// O Swagger fornecido não detalha os envelopes. Mantém compatibilidade com as outras telas.
export function lerLista(value: unknown): Setor[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(setorSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.setores ?? envelope.results);
}
export function lerDetalhe(value: unknown): Setor {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return setorSchema.parse(envelope.data ?? envelope.dados ?? envelope.setor ?? value);
}
