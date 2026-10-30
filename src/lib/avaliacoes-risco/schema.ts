import { z } from "zod";
export const avaliacaoPayload = z.object({
  perigo_id: z.number().int().positive("Informe um ID de perigo válido."),
  probabilidade: z.number().finite(), severidade: z.number().finite(),
  classificacao: z.string().trim(), metodo_versao: z.string().trim(),
}).strict();
const decimalResposta = z.union([z.number(), z.string().trim().regex(/^-?\d+(\.\d+)?$/).transform(Number)]).pipe(z.number().finite());
export const avaliacaoSchema = avaliacaoPayload.extend({
  id: z.coerce.number().int().positive(), perigo_id: z.coerce.number().int().positive(),
  probabilidade: decimalResposta, severidade: decimalResposta,
}).strip();
export type Avaliacao = z.infer<typeof avaliacaoSchema>;
// O Swagger fornecido não especifica o envelope de resposta.
export function lerLista(value: unknown): Avaliacao[] {
  const e = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(avaliacaoSchema).parse(Array.isArray(value) ? value : e.data ?? e.dados ?? e.items ?? e.itens ?? e.avaliacoes ?? e.avaliacoes_risco ?? e.results);
}
export function lerDetalhe(value: unknown): Avaliacao {
  const e = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return avaliacaoSchema.parse(e.data ?? e.dados ?? e.avaliacao ?? value);
}
/** Aceita ponto ou vírgula decimal; vazio não se transforma em zero. */
export function lerDecimal(value: string): number {
  const text = value.trim();
  return /^-?\d+(?:[.,]\d+)?$/.test(text) ? Number(text.replace(",", ".")) : NaN;
}
