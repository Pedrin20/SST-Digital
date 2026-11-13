import { z } from "zod";

export const prioridadeSchema = z.enum(["P1", "P2", "P3"]);
export const prioridades = { P1: "Crítica", P2: "Alta", P3: "Média" } as const;
export const tiposAcao = { CORRETIVA: "Corretiva", PREVENTIVA: "Preventiva", MELHORIA: "Melhoria" } as const;
const evidencia = z.object({ nome: z.string().trim().min(1).max(255), tipo: z.enum(["image/jpeg","image/png","application/pdf"]), dados: z.base64().min(4).max(6990508) });
const campos = z.object({
  prioridade: prioridadeSchema.optional(),
  perigo_id: z.number().int().positive("Selecione o perigo."),
  descricao: z.string().trim().min(1, "Informe a descrição da ação.").max(16000),
  responsavel_id: z.number().int().positive("Selecione o responsável."),
  prazo: z.iso.date("Informe uma data válida."),
  status: z.string().trim().min(1),
  tipo_acao: z.enum(tiposAcao).nullish(),
  observacao: z.string().trim().min(1).max(4000).optional(),
  motivo_cancelamento: z.string().trim().min(1).max(2000).optional(),
  evidencia: evidencia.optional(),
}).strict();
const motivoValido = (v: {status?: string; motivo_cancelamento?: string}) => v.status !== "CANCELADA" || !!v.motivo_cancelamento;
const mensagem = { message: "Informe o motivo do cancelamento.", path: ["motivo_cancelamento"] };
export const acaoPayload = campos.refine(motivoValido, mensagem);
export const acaoPatch = campos.partial().extend({ prioridade: prioridadeSchema.nullish() }).refine(motivoValido, mensagem).refine(v => Object.keys(v).length > 0, "Informe ao menos um campo.");
export const acaoSchema = campos.omit({ evidencia: true, motivo_cancelamento: true, observacao: true }).extend({
  id: z.coerce.number().int().positive(), perigo_id: z.coerce.number().int().positive(),
  responsavel_id: z.coerce.number().int().positive().nullable(), prazo: z.iso.date().nullable(),
  prioridade: prioridadeSchema.nullish(), concluida_em: z.string().nullish(),
  perigo_nome: z.string().nullish(), responsavel_nome: z.string().nullish(),
}).strip();
export type Acao = z.infer<typeof acaoSchema>;
export const historicoSchema = z.array(z.object({ id: z.coerce.number(), status: z.string().nullable(), observacao: z.string().nullable(), motivo_cancelamento: z.string().nullable(), autor: z.string().nullable(), criado_em: z.string(), arquivo_nome: z.string().nullable() }));
export function lerLista(value: unknown): Acao[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(acaoSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.acoes ?? envelope.results);
}
export function lerDetalhe(value: unknown): Acao {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return acaoSchema.parse(envelope.data ?? envelope.dados ?? envelope.acao ?? value);
}
