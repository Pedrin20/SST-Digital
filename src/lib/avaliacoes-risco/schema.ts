import { z } from "zod";
const escala = z.number().int().min(1).max(5);
export const avaliacaoPayload = z.object({
  perigo_id: z.number().int().positive("Informe um ID de perigo válido."),
  probabilidade: escala, severidade: escala,
}).strict();
const textoLegado = z.string().trim().min(1, "Preencha este campo.").max(100, "Use até 100 caracteres.");
export const avaliacaoLegadaPayload = avaliacaoPayload.extend({
  classificacao: textoLegado, metodo_versao: textoLegado,
});
export function exigeCamposLegados(fields?: Record<string, unknown>) {
  return [fields?.classificacao, fields?.metodo_versao].every(value =>
    Array.isArray(value) && value.some(message => typeof message === "string" && message.includes("expected string, received undefined")));
}
const decimalResposta = z.union([z.number(), z.string().trim().regex(/^-?\d+(\.\d+)?$/).transform(Number)]).pipe(z.number().finite());
export const avaliacaoSchema = avaliacaoPayload.extend({
  id: z.coerce.number().int().positive(), perigo_id: z.coerce.number().int().positive(),
  probabilidade: decimalResposta, severidade: decimalResposta,
  classificacao: z.string().nullish(), metodo_versao: z.string().nullish(),
  pontuacao_risco: decimalResposta.pipe(z.number().int().min(1).max(25)).nullish(),
  classificacao_nome: z.string().nullish(), classificacao_cor: z.string().nullish(),
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
