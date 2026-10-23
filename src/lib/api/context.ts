import "server-only";
import { ApiError } from "./error";
/** PROVISORIO: único ponto para a futura sessão, token e empresa ativa por requisição.
 * Não encaminha cookies nem escolhe empresa automaticamente. Sem estado global de usuário.
 * Substituir pelo provedor de sessão quando a API definir autenticação e multitenancy.
 */
export async function getApiContext(): Promise<{ token?: string; empresaId?: string }> { return {}; }
export function contextHeaders(context: Awaited<ReturnType<typeof getApiContext>>): Headers {
  const headers = new Headers();
  if (context.token) headers.set("Authorization", `Bearer ${context.token}`);
  if (context.empresaId) headers.set("X-Empresa-Id", context.empresaId);
  return headers;
}
export function handleAccessError(status: number): void {
  if (status === 401) throw new ApiError(401, "Sua sessão expirou. Entre novamente.");
  if (status === 403) throw new ApiError(403, "Você não tem permissão para esta operação.");
}
