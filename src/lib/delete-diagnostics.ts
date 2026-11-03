/** Diagnóstico temporário das exclusões iniciadas pela interface. */
export async function fetchComDiagnosticoDelete(url: string, options?: RequestInit): Promise<Response> {
  if (options?.method?.toUpperCase() !== "DELETE") return fetch(url, options);

  console.log("[DELETE diagnóstico] Enviando requisição", { url, corpoEnviado: options.body != null });
  try {
    const response = await fetch(url, options);
    const data: unknown = await response.clone().json().catch(() => null);
    const resultado = data && typeof data === "object" ? data as Record<string, unknown> : {};
    console.log("[DELETE diagnóstico] Resposta", {
      url,
      status: response.status,
      sucesso: response.ok,
      mensagem: resultado.message ?? resultado.erro ?? resultado.mensagem,
      campos: resultado.fields ?? resultado.detalhes,
    });
    return response;
  } catch (error) {
    console.error("[DELETE diagnóstico] Falha de conexão", { url, erro: error instanceof Error ? error.message : "Erro desconhecido" });
    throw error;
  }
}
