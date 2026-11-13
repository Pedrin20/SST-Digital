import { useRef, useState, type FormEvent } from "react";
import { Button, Dialog, Input, Select } from "@/src/components/ui";
import { CampoAssinatura } from "./assinatura";
import { api, tipos, useConsulta, dataHora, type Assinatura, type Epi, type Movimento, type Pessoa, type Saldo, type Tipo, type Unidade } from "./dados";

type Props = { base: string; catalogo: Epi[]; pessoas: Pessoa[]; unidades: Unidade[]; estoque: Saldo[]; fechar: () => void; concluir: (mensagem: string) => void };
export function Movimentar({ base, catalogo, pessoas, unidades, estoque, fechar, concluir }: Props) {
  const [tipo,setTipo] = useState<Tipo>("entrega");
  const [unidade,setUnidade] = useState("");
  const [pessoa,setPessoa] = useState("");
  const [epi,setEpi] = useState("");
  const [origem,setOrigem] = useState("");
  const [assinatura,setAssinatura] = useState<Assinatura>([]);
  const [erro,setErro] = useState("");
  const [ocupado,setOcupado] = useState(false);
  const [tentativa,setTentativa] = useState(0);
  const envio = useRef<{ corpo: string; chave: string } | null>(null);
  const devolve = tipo === "troca" || tipo === "devolucao";
  const assina = tipo === "troca" || tipo === "entrega";
  const ficha = useConsulta<Movimento[]>(devolve && pessoa ? base+"/trabalhadores/"+pessoa+"/ficha" : null,tentativa,true);
  const movimentos = ficha?.dados ?? [];
  const recolhidos = new Map<number,number>();
  for (const m of movimentos) if (m.origem_id) recolhidos.set(m.origem_id,(recolhidos.get(m.origem_id) ?? 0)+m.quantidade);
  const opcoes = movimentos.filter(m => String(m.unidade_id)===unidade && ["entrega","troca"].includes(m.tipo) && m.quantidade>(recolhidos.get(m.id) ?? 0));
  const anterior = opcoes.find(m => String(m.id)===origem);
  const epiId = tipo === "devolucao" ? anterior?.epi_id : Number(epi);
  const saldo = estoque.find(s => s.epi_id===epiId && String(s.unidade_id)===unidade)?.saldo ?? 0;
  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ocupado) return;
    setErro("");
    const campos = new FormData(e.currentTarget);
    if (assina && !assinatura.some(l => l.length>=2 && l.some(([x,y]) => x!==l[0][0] || y!==l[0][1]))) { setErro("Peça ao trabalhador que assine antes de confirmar."); return; }
    const dados = { tipo, unidade_id:Number(unidade), epi_id:epiId, quantidade:Number(campos.get("quantidade")),
      ...(tipo !== "entrada" && { trabalhador_id:Number(pessoa) }), ...(assina && { assinatura }),
      ...(devolve && { origem_id:Number(origem), destino:campos.get("destino") }) };
    setOcupado(true);
    try {
      const corpo = JSON.stringify(dados);
      if (envio.current?.corpo !== corpo) envio.current = { corpo, chave:crypto.randomUUID() };
      await api(base+"/movimentos",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...dados,chave:envio.current.chave}) });
      concluir(tipos[tipo]+" registrada com sucesso.");
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao registrar."); }
    finally { setOcupado(false); }
  }
  return <Dialog open title="Registrar movimentação" onClose={() => { if (!ocupado) fechar(); }}>
    <form onSubmit={salvar}><fieldset disabled={ocupado} className="space-y-4">
      <Select label="Movimentação" value={tipo} onChange={e => {setTipo(e.target.value as Tipo);setOrigem("");setAssinatura([]);setErro("");}}>
        {Object.entries(tipos).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
      <Select required label="Unidade" value={unidade} onChange={e => {setUnidade(e.target.value);setOrigem("");}}>
        <option value="">Selecione a unidade</option>{unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
      </Select>
      {tipo !== "entrada" && <Select required label="Trabalhador" value={pessoa} onChange={e => {setPessoa(e.target.value);setOrigem("");setAssinatura([]);}}>
        <option value="">Selecione o trabalhador</option>{pessoas.map(p => <option key={p.id} value={p.id}>{p.nome} · {p.matricula}</option>)}
      </Select>}
      {devolve && <><Select required label="Entrega de origem" value={origem} onChange={e => setOrigem(e.target.value)}>
        <option value="">{!pessoa || !unidade ? "Selecione unidade e trabalhador" : !ficha ? "Carregando ficha…" : opcoes.length ? "Selecione a entrega" : "Nenhuma entrega pendente"}</option>
        {opcoes.map(m => <option key={m.id} value={m.id}>#{m.id} · {m.epi} · {dataHora(m.criado_em)} · restantes: {m.quantidade-(recolhidos.get(m.id) ?? 0)}</option>)}
      </Select>{ficha?.erro && <p role="alert">{ficha.erro} <Button onClick={() => setTentativa(v=>v+1)}>Tentar novamente</Button></p>}
      <Select label="Destino do item recolhido" name="destino" required><option value="descarte">Descarte</option><option value="estoque">Retornar ao estoque</option></Select></>}
      {tipo !== "devolucao" && <Select required label={tipo === "troca" ? "Novo EPI" : "EPI"} value={epi} onChange={e=>setEpi(e.target.value)}>
        <option value="">Selecione o EPI</option>{catalogo.map(i=><option key={i.id} value={i.id}>{i.nome} · CA {i.ca}</option>)}
      </Select>}
      <Input type="number" name="quantidade" label="Quantidade" min={1} step={1} required defaultValue={1} max={anterior ? anterior.quantidade-(recolhidos.get(anterior.id) ?? 0) : undefined} />
      {assina && unidade && epi && <p className="text-sm text-muted">Disponível na unidade: {saldo}</p>}
      {assina && <CampoAssinatura key={tipo+pessoa} valor={assinatura} mudar={setAssinatura} />}
      {erro && <p role="alert" className="text-sm text-critical-text">{erro}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={fechar}>Cancelar</Button><Button type="submit">{ocupado ? "Registrando…" : "Confirmar "+tipos[tipo].toLowerCase()}</Button></div>
    </fieldset></form>
  </Dialog>;
}
