import { tiposDeRisco } from "./risco";
import { z } from "zod";
const escala = z.number().int().min(1).max(5);
export const avaliacaoPayload = z.object({
  perigo_id: z.number().int().positive("Informe um ID de perigo válido."),
  probabilidade: escala, severidade: escala,
}).strict();
const decimalResposta = z.union([z.number(), z.string().trim().regex(/^-?\d+(\.\d+)?$/).transform(Number)]).pipe(z.number().finite());
export const avaliacaoSchema = avaliacaoPayload.extend({
  id: z.coerce.number().int().positive(), perigo_id: z.coerce.number().int().positive(),
  probabilidade: decimalResposta.pipe(escala), severidade: decimalResposta.pipe(escala),
  // A API também retorna o texto gravado em avaliações anteriores à matriz.
  nivel_risco: z.string().min(1),
  pontuacao_risco: decimalResposta.pipe(z.number().int().min(1).max(25)),
  tipo_risco: z.enum(tiposDeRisco).nullable(),
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
