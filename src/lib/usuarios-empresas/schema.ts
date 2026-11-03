import { z } from "zod";
const id = z.number().int().positive();
export const vinculoPayload = z.object({ usuario_id: id, empresa_id: id, perfil: z.string().trim().min(1, "Informe o perfil.") }).strict();
export const perfilPayload = vinculoPayload.pick({ perfil: true });
export const vinculoSchema = vinculoPayload.extend({ usuario_id: z.coerce.number().int().positive(), empresa_id: z.coerce.number().int().positive() }).strip();
export type Vinculo = z.infer<typeof vinculoSchema>;
export function lerLista(value: unknown): Vinculo[] {
  const envelope = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return z.array(vinculoSchema).parse(Array.isArray(value) ? value : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.vinculos ?? envelope.results);
}
