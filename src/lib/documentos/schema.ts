import { z } from "zod";

export const documentoPayload = z.object({
  unidade_id: z.number().int().positive("Informe um ID de unidade válido."),
  titulo: z.string().trim().min(1, "Informe o título."),
  tipo: z.string().trim().min(1, "Informe o tipo."),
  versao: z.string().trim().nullable().optional(),
  arquivo_chave: z.string().trim().nullable().optional(),
  validade: z.iso.date("Informe uma data válida.").nullable().optional(),
}).strict();
export const documentoPatch = documentoPayload.partial().refine(value => Object.keys(value).length > 0, "Informe ao menos um campo.");
const textoOpcional = z.string().nullish().transform(value => value ?? "");
export const documentoSchema = z.object({
  id: z.coerce.number().int().positive(), unidade_id: z.coerce.number().int().positive(),
  titulo: z.string(), tipo: textoOpcional, versao: textoOpcional, arquivo_chave: textoOpcional,
  validade: z.iso.date().nullish().transform(value => value ?? ""),
}).strip();
export type Documento = z.infer<typeof documentoSchema>;
// O Swagger não descreve a estrutura da resposta.
export function lerLista(value: unknown): Documento[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(documentoSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.documentos ?? envelope.results);
}
export function lerDetalhe(value: unknown): Documento {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return documentoSchema.parse(envelope.data ?? envelope.dados ?? envelope.documento ?? value);
}
