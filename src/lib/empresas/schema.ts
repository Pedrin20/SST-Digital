import { z } from "zod";

const textoOpcional = z
  .union([z.string(), z.null()])
  .optional()
  .transform(value => value ?? "");

const CNPJ_VALIDO = /^[A-Za-z0-9]{12}\d{2}$/;
const TELEFONE_VALIDO = /^[0-9()+\-.\s]+$/;
const CNAE_VALIDO = /^[0-9./ -]{7,10}$/;

export const empresaSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    nome: z.string(),
    cnpj: textoOpcional,
    nome_fantasia: textoOpcional,
    telefone: textoOpcional,
    email: textoOpcional,
    site: textoOpcional,
    cnae_principal: textoOpcional,
    ativo: z
      .union([z.boolean(), z.literal(0), z.literal(1)])
      .transform(value => value === true || value === 1),
    criado_em: z.string().optional(),
  })
  .strip();

export type Empresa = z.infer<typeof empresaSchema>;

export const empresaPayload = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe o nome da empresa (mínimo de 2 caracteres).")
      .max(150, "O nome deve ter no máximo 150 caracteres."),
    nome_fantasia: z.string().trim().max(150, "O nome fantasia deve ter no máximo 150 caracteres."),
    cnpj: z
      .string()
      .trim()
      .transform(value => value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
      .refine(value => value === "" || CNPJ_VALIDO.test(value), "Informe um CNPJ válido."),
    telefone: z
      .string()
      .trim()
      .refine(
        value => value === "" || (value.length >= 8 && value.length <= 20 && TELEFONE_VALIDO.test(value)),
        "Informe um telefone válido.",
      ),
    email: z
      .string()
      .trim()
      .max(254, "O e-mail deve ter no máximo 254 caracteres.")
      .refine(value => value === "" || z.email().safeParse(value).success, "Informe um e-mail válido."),
    site: z.string().trim().max(255, "O site deve ter no máximo 255 caracteres."),
    cnae_principal: z
      .string()
      .trim()
      .refine(value => value === "" || CNAE_VALIDO.test(value), "Informe um CNAE válido (7 a 10 caracteres)."),
    ativo: z.boolean(),
  })
  .strict();

export type EmpresaPayload = z.output<typeof empresaPayload>;

const camposAnulaveis = ["nome_fantasia", "telefone", "email", "site", "cnae_principal"] as const;

/**
 * Campos vazios são omitidos no cadastro. Na edição, null é enviado apenas quando o valor
 * existente está sendo limpo. O CNPJ não aceita null (o contrato só permite omiti-lo no PATCH).
 */
export function corpoDaEmpresa(dados: EmpresaPayload, original: Empresa | null): Record<string, unknown> {
  const corpo: Record<string, unknown> = { nome: dados.nome, ativo: dados.ativo };
  if (dados.cnpj) corpo.cnpj = dados.cnpj;
  for (const campo of camposAnulaveis) {
    const valor = dados[campo] || null;
    if (valor !== null) corpo[campo] = valor;
    else if (original?.[campo]) corpo[campo] = null;
  }
  return corpo;
}

// O Swagger não detalha o envelope das respostas. Mantém compatibilidade com as telas existentes.
export function lerLista(value: unknown): Empresa[] {
  const envelope = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rows = Array.isArray(value)
    ? value
    : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.empresas ?? envelope.results;
  return z.array(empresaSchema).parse(rows);
}

export function lerDetalhe(value: unknown): Empresa {
  const envelope = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return empresaSchema.parse(envelope.data ?? envelope.dados ?? envelope.empresa ?? value);
}

export const cnaeSecundarioPayload = z
  .object({
    codigo: z
      .string({ error: "Informe o código do CNAE." })
      .trim()
      .regex(/^[0-9./ -]{7,10}$/, "Informe um código CNAE válido (7 a 10 caracteres)."),
    descricao: z
      .union([z.string().trim().max(255, "A descrição deve ter no máximo 255 caracteres."), z.null()])
      .optional()
      .transform(value => value || undefined),
  })
  .strict();

const cnaeSecundarioSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    codigo: z.string().min(1),
    descricao: z
      .union([z.string(), z.null()])
      .optional()
      .transform(value => value ?? ""),
  })
  .strip();

export type CnaeSecundario = z.infer<typeof cnaeSecundarioSchema>;

function normalizarCnae(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const item = value as Record<string, unknown>;
  return {
    ...item,
    id: item.id ?? item.cnae_id ?? item.cnae_secundario_id,
    codigo: item.codigo ?? item.codigo_cnae ?? item.cnae,
    descricao: item.descricao ?? item.descricao_cnae ?? "",
  };
}

export function lerCnaes(value: unknown): CnaeSecundario[] {
  if (value == null) return [];
  const envelope = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rows = Array.isArray(value)
    ? value
    : envelope.data ?? envelope.dados ?? envelope.items ?? envelope.itens ?? envelope.cnaes ?? envelope.results;
  if (!Array.isArray(rows)) throw new Error("A resposta da API não corresponde à lista de CNAEs secundários.");
  return z.array(cnaeSecundarioSchema).parse(rows.map(normalizarCnae));
}
