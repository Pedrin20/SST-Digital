export type VinculoEstrutura = { id: number; nome: string };
export type ParametrosEstrutura = Record<string, string | string[] | undefined>;

export function lerContexto(params: ParametrosEstrutura, tipo: "empresa" | "unidade"): VinculoEstrutura | undefined {
  const valor = params[`${tipo}_id`];
  if (typeof valor !== "string" || !/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(Number(valor))) return;
  const nome = params[tipo];
  return { id: Number(valor), nome: typeof nome === "string" && nome.trim() ? nome : `${tipo === "empresa" ? "Empresa" : "Unidade"} #${valor}` };
}

export function unidadesHref(empresa: VinculoEstrutura) {
  return "/unidades?" + new URLSearchParams({ empresa_id: String(empresa.id), empresa: empresa.nome });
}

export function setoresHref(unidade: VinculoEstrutura, empresa: VinculoEstrutura) {
  return "/setores?" + new URLSearchParams({
    unidade_id: String(unidade.id), unidade: unidade.nome, empresa_id: String(empresa.id), empresa: empresa.nome,
  });
}

const normalizar = (nome: string) => nome.trim().normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");

// A API filtra o vínculo e a situação. A busca por nome percorre essas páginas sob demanda.
export async function buscarPagina<T extends { nome: string }>(nome: string, offset: number, carregar: (inicio: number) => Promise<T[]>) {
  const termo = normalizar(nome);
  if (!termo) return carregar(offset);
  const resultados: T[] = [];
  let encontrados = 0;
  for (let inicio = 0; ; inicio += 50) {
    const pagina = await carregar(inicio);
    for (const item of pagina) {
      if (!normalizar(item.nome).includes(termo)) continue;
      if (encontrados >= offset) resultados.push(item);
      encontrados++;
      if (resultados.length === 50) return resultados;
    }
    if (pagina.length < 50) return resultados;
  }
}
