export async function carregarLista<T>(url: string, ler: (value: unknown) => T[], fetcher: typeof fetch = fetch, signal?: AbortSignal): Promise<T[]> {
  const response = await fetcher(`${url}?limit=50&offset=0`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`Consulta indisponível (${response.status})`);
  return ler(await response.json());
}
