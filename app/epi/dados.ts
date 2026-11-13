import { useEffect, useState } from "react";

export type Epi = { id: number; nome: string; ca: string };
export type Pessoa = { id: number; nome: string; matricula: string };
export type Unidade = { id: number; nome: string };
export type Saldo = { unidade_id: number; epi_id: number; nome: string; ca: string; saldo: number };
export const tipos = { entrada: "Entrada", entrega: "Entrega", troca: "Troca", devolucao: "Devolução" };
export type Tipo = keyof typeof tipos;
export type Movimento = { id: number; tipo: Tipo; criado_em: string; unidade_id: number; trabalhador_id: number | null; trabalhador: string | null; epi_id: number; epi: string; ca: string; quantidade: number; operador_id: number | null; origem_id: number | null; destino: string | null; possui_assinatura: number };
export type Assinatura = [number, number][][];
export type Comprovante = Pick<Movimento,"id"|"epi"|"ca"|"criado_em"|"quantidade"|"unidade_id"|"operador_id"> & { nome: string; matricula: string; assinatura: Assinatura };
export type Sessao = { administrador: boolean; vinculos: { empresa_id: number; perfil: string }[] };

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const resposta = await fetch(url, { cache: "no-store", ...options });
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok || dados === null) throw new Error(resposta.status === 401 ? "Sua sessão expirou. Entre novamente." : dados?.erro ?? dados?.message ?? "Não foi possível concluir a operação.");
  return dados as T;
}

export async function paginas<T extends { id: number }>(url: string, signal: AbortSignal): Promise<T[]> {
  const itens: T[] = [];
  const vistos = new Set<number>();
  for (let offset = 0; ; offset += 50) {
    const caminho = url + (url.includes("?") ? "&" : "?") + "limit=50&offset="+offset;
    const dados = await api<T[] | { data: T[] }>(caminho, { signal });
    const lista = Array.isArray(dados) ? dados : dados.data;
    if (!Array.isArray(lista)) throw new Error("A API retornou uma lista inválida.");
    const novos = lista.filter(item => !vistos.has(item.id));
    for (const item of novos) vistos.add(item.id);
    itens.push(...novos);
    if (lista.length < 50) return itens;
    if (!novos.length) throw new Error("Não foi possível avançar a consulta.");
  }
}
export function useConsulta<T>(url: string | null, versao = 0, paginar = false) {
  const [resultado, setResultado] = useState<{ chave: string; dados?: T; erro?: string }>();
  const chave = JSON.stringify([url, versao, paginar]);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const tarefa = paginar ? paginas(url, controller.signal) : api<T>(url,{ signal: controller.signal });
    tarefa.then(dados => { if (!controller.signal.aborted) setResultado({ chave, dados: dados as T }); })
      .catch(e => { if (!controller.signal.aborted) setResultado({ chave, erro: e.message }); });
    return () => controller.abort();
  }, [chave, url, paginar]);
  return resultado?.chave === chave ? resultado : undefined;
}
export function dataHora(valor: string) {
  const partes = valor.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/);
  return partes ? partes[3]+"/"+partes[2]+"/"+partes[1]+" "+partes[4] : valor;
}
