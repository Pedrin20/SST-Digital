"use client";

import { useEffect, useState, type ChangeEventHandler } from "react";
import { Button, Input, Select } from "./ui";

type Recurso = "empresas" | "unidades" | "setores" | "perigos" | "usuarios";
type Opcao = { id: string; nome: string };
type Lista = { opcoes: Opcao[]; erro?: string; semPermissao?: boolean };

export async function carregarOpcoes(recurso: Recurso, signal: AbortSignal): Promise<Lista> {
  const opcoes = new Map<string, Opcao>();
  for (let offset = 0; ; offset += 50) {
    const resposta = await fetch(`/api/${recurso}?limit=50&offset=${offset}`, { signal });
    if (resposta.status === 403) return { opcoes: [], semPermissao: true };
    if (!resposta.ok) throw new Error(resposta.status === 401
      ? "Sua sessão expirou. Entre novamente."
      : "Não foi possível carregar as opções.");
    const dados = await resposta.json();
    const pagina = Array.isArray(dados) ? dados : dados?.data ?? dados?.dados ?? dados?.items ?? dados?.itens ?? dados?.[recurso] ?? dados?.results;
    if (!Array.isArray(pagina)) throw new Error("A API retornou uma lista inválida.");

    const totalAnterior = opcoes.size;
    for (const item of pagina) {
      const nome = recurso === "perigos" ? item?.descricao : item?.nome;
      if (!/^[1-9]\d*$/.test(String(item?.id)) || typeof nome !== "string") {
        throw new Error("A API retornou uma opção inválida.");
      }
      const id = String(item.id);
      opcoes.set(id, { id, nome });
    }
    if (pagina.length < 50) return { opcoes: [...opcoes.values()] };
    if (opcoes.size === totalAnterior) throw new Error("Não foi possível avançar na lista de opções.");
  }
}

export function useOpcoesRelacionamento(recurso: Recurso, ativo = true) {
  const [lista, setLista] = useState<Lista | null>(null);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    if (!ativo) return;
    const controller = new AbortController();
    carregarOpcoes(recurso, controller.signal).then(resultado => {
      if (!controller.signal.aborted) setLista(resultado);
    }).catch(erro => {
      if (!controller.signal.aborted) setLista({ opcoes: [], erro: erro instanceof Error ? erro.message : "Falha ao carregar opções." });
    });
    return () => controller.abort();
  }, [recurso, tentativa, ativo]);

  return { lista, tentarNovamente() { setLista(null); setTentativa(n => n + 1); } };
}

type Props = {
  label: string;
  fonte: ReturnType<typeof useOpcoesRelacionamento>;
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

export function SeletorRelacionamento({ label, fonte, value, onChange, placeholder = "Selecione", ...props }: Props) {
  const { lista, tentarNovamente } = fonte;
  const alterar: ChangeEventHandler<HTMLSelectElement | HTMLInputElement> = e => onChange(e.target.value);
  if (lista?.semPermissao) return <div>
    <Input {...props} label={`${label} (ID)`} type="number" min="1" step="1" value={value} onChange={alterar} />
    <p className="text-xs text-muted">Seu perfil não tem acesso à lista de opções.</p>
  </div>;
  return <div>
    <Select {...props} label={label} value={value} onChange={alterar} error={props.error ?? lista?.erro}>
      <option value="">{!lista ? "Carregando opções…" : lista.erro ? "Opções indisponíveis" : !lista.opcoes.length && props.required ? "Nenhum registro disponível" : placeholder}</option>
      {value && !lista?.opcoes.some(item => item.id === value) && <option value={value}>ID {value} (vínculo atual)</option>}
      {lista?.opcoes.map(item => <option key={item.id} value={item.id}>{item.id} — {item.nome}</option>)}
    </Select>
    {lista?.erro && <Button type="button" variant="ghost" onClick={tentarNovamente}>Tentar novamente</Button>}
  </div>;
}
