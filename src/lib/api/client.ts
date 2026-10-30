import "server-only";
import { z } from "zod";
import { ApiError } from "./error";
import { contextHeaders, getApiContext, handleAccessError } from "./context";
export { ApiError } from "./error";
const errorBody = z.object({ erro: z.string().optional(), message: z.string().optional(), mensagem: z.string().optional(), fields: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(), detalhes: z.array(z.object({ path: z.array(z.union([z.string(), z.number()])).optional(), message: z.string().optional() }).passthrough()).optional() });
/** accessErrors: false mantém erros de acesso para inspeção (ex.: 401 de credenciais no login). */
export async function apiFetch<T>(path: string, schema: z.ZodType<T>, options: RequestInit = {}, config: { accessErrors?: boolean } = {}): Promise<T> {
  const base = process.env.API_BASE_URL;
  if (!base) throw new ApiError(0, "API_BASE_URL não configurada.");
  if (!path.startsWith("/") || path.startsWith("//")) throw new ApiError(0, "Caminho de API inválido.");
  const headers = new Headers(options.headers); headers.set("Accept", "application/json");
  const authHeaders = contextHeaders(await getApiContext()); authHeaders.forEach((value, key) => headers.set(key, value));
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let response: Response;
  try { response = await fetch(`${base.replace(/\/$/, "")}${path}`, { ...options, headers, cache: "no-store", redirect: "error", signal: options.signal ?? AbortSignal.timeout(15000) }); }
  catch { throw new ApiError(0, "Não foi possível conectar à API ou a requisição foi interrompida."); }
  if (config.accessErrors !== false) handleAccessError(response.status);
  let body: unknown;
  try { body = response.status === 204 ? undefined : await response.json(); }
  catch { throw new ApiError(response.status, "A API retornou uma resposta inválida."); }
  if (!response.ok) {
    const parsed = errorBody.safeParse(body); const data = parsed.success ? parsed.data : undefined;
    const fields: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(data?.fields ?? {})) fields[key] = Array.isArray(value) ? value : [value];
    for (const detalhe of data?.detalhes ?? []) { if (!detalhe.message) continue; const key = String(detalhe.path?.[0] ?? "form"); (fields[key] ??= []).push(detalhe.message); }
    throw new ApiError(response.status, data?.erro ?? data?.mensagem ?? data?.message ?? "Não foi possível concluir a operação.", fields);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError(response.status, "Resposta da API incompatível com o contrato esperado.");
  return parsed.data;
}

