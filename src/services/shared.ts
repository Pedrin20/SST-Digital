import "server-only";
import { z } from "zod";
import { apiFetch, ApiError } from "@/src/lib/api/client";
import { handleAccessError } from "@/src/lib/api/context";
export type ServiceOptions = { forceError?: number };
export type ResourceService<T> = { list: (options?: ServiceOptions) => Promise<T[]>; get: (id: string, options?: ServiceOptions) => Promise<T> };
export function createMock<T extends { id: string }>(name: string, schema: z.ZodType<T>, rows: T[]): ResourceService<T> {
  async function wait(options?: ServiceOptions) {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.floor(Math.random() * 301)));
    const status = options?.forceError ?? ((process.env.MOCK_API_ERROR === "all" || process.env.MOCK_API_ERROR === name) ? 500 : undefined);
    if (status) { handleAccessError(status); throw new ApiError(status, `Falha simulada ao carregar ${name}.`, status === 422 ? { nome: ["Campo inválido (simulação)."] } : {}); }
  }
  return {
    async list(options) { await wait(options); return z.array(schema).parse(structuredClone(rows)); },
    async get(id, options) { await wait(options); const row = rows.find(item => item.id === id); if (!row) throw new ApiError(404, "Registro não encontrado."); return schema.parse(structuredClone(row)); },
  };
}
export function createHttp<T>(path: string, schema: z.ZodType<T>): ResourceService<T> {
  return { list: () => apiFetch(path, z.array(schema)), get: id => apiFetch(`${path}/${encodeURIComponent(id)}`, schema) };
}
export function selectService<T>(mock: ResourceService<T>, http: ResourceService<T>): ResourceService<T> {
  function active() { const mode = process.env.API_MODE ?? "mock"; if (mode !== "mock" && mode !== "http") throw new ApiError(0, "API_MODE deve ser mock ou http."); return mode === "http" ? http : mock; }
  return { list: options => active().list(options), get: (id, options) => active().get(id, options) };
}
