export const niveisDeRisco = ["BAIXO", "MEDIO", "ALTO", "MUITO_ALTO"] as const;
export const tiposDeRisco = ["FISICO", "QUIMICO", "BIOLOGICO", "ERGONOMICO", "ACIDENTE"] as const;
export const rotulosNivel = { BAIXO: "Baixo", MEDIO: "Médio", ALTO: "Alto", MUITO_ALTO: "Muito alto" };
export const rotulosTipo = { FISICO: "Físico", QUIMICO: "Químico", BIOLOGICO: "Biológico", ERGONOMICO: "Ergonômico", ACIDENTE: "Acidente (Mecânico)" };

type DadosDeRisco = { nivel_risco: string; tipo_risco: typeof tiposDeRisco[number] | null };

export async function paginaDeAvaliacoes<T extends DadosDeRisco>(
  offset: number, filtros: { nivel: string; tipo: string }, carregar: (inicio: number) => Promise<T[]>,
) {
  if (!filtros.nivel && !filtros.tipo) return carregar(offset);
  const resultado: T[] = [];
  let encontrados = 0;
  for (let inicio = 0; ; inicio += 50) {
    const pagina = await carregar(inicio);
    for (const item of pagina) {
      if (filtros.nivel && item.nivel_risco !== filtros.nivel) continue;
      if (filtros.tipo && item.tipo_risco !== filtros.tipo) continue;
      if (encontrados++ >= offset) resultado.push(item);
      if (resultado.length === 50) return resultado;
    }
    if (pagina.length < 50) return resultado;
  }
}
