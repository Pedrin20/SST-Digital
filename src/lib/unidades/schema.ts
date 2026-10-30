import { z } from "zod";
export const unidadePayload = z.object({ empresa_id: z.number().int().positive(), nome: z.string().trim().min(1, "Informe o nome."), endereco: z.string().trim(), ativo: z.boolean() }).strict();
export const unidadeSchema = unidadePayload.extend({ id: z.coerce.number().int().positive(), empresa_id: z.coerce.number().int().positive(), endereco: z.string().nullable().transform(value => value ?? ""), ativo: z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(value => value === true || value === 1) }).strip();
export type Unidade = z.infer<typeof unidadeSchema>;
// O Swagger não especifica o envelope de resposta. Compatibilidade com as telas existentes.
export function lerLista(value: unknown): Unidade[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(unidadeSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.unidades ?? envelope.results);
}
export function lerDetalhe(value: unknown): Unidade {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return unidadeSchema.parse(envelope.data ?? envelope.dados ?? envelope.unidade ?? value);
}

