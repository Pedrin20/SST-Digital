import "server-only";
import { z } from "zod";
import { apiFetch, ApiError } from "@/src/lib/api/client";

const tokenSchema = z.string().min(1);

/** PROVISORIO: aceita os nomes de token mais comuns até o backend documentar o envelope do login. */
const loginRespostaSchema = z.object({
  token: tokenSchema.optional(),
  accessToken: tokenSchema.optional(),
  access_token: tokenSchema.optional(),
  jwt: tokenSchema.optional(),
  data: z.object({
    token: tokenSchema.optional(),
    accessToken: tokenSchema.optional(),
    access_token: tokenSchema.optional(),
  }).optional(),
});

/** Autentica no backend e devolve o token de acesso. Chamada exclusiva do servidor. */
export async function autenticar(email: string, senha: string): Promise<string> {
  const resposta = await apiFetch(
    "/auth/login",
    loginRespostaSchema,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
      // O backend no Render pode acordar lentamente após períodos ocioso.
      signal: AbortSignal.timeout(45000),
    },
    { accessErrors: false },
  );

  const token =
    resposta.token ??
    resposta.accessToken ??
    resposta.access_token ??
    resposta.jwt ??
    resposta.data?.token ??
    resposta.data?.accessToken ??
    resposta.data?.access_token;

  if (!token) throw new ApiError(502, "A autenticação foi aceita, mas a API não retornou um token de acesso.");
  return token;
}
