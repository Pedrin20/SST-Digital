import { useState } from "react";
import { Button, DataTable, Dialog, Input, Select } from "@/src/components/ui";
import { Tracos } from "./assinatura";
import { dataHora, tipos, useConsulta, type Comprovante, type Movimento, type Pessoa, type Unidade } from "./dados";

function baixarEntregas(rows: Movimento[], unidades: Unidade[]) {
  const celula = (valor: unknown) => {
    let texto = String(valor ?? "");
    if (/^[=+@\-\t\r]/.test(texto)) texto = "'"+texto;
    return '"'+texto.replaceAll('"','""')+'"';
  };
  const linhas = [["Movimento","Data","Trabalhador","ID do trabalhador","Unidade","Tipo","EPI","CA","Quantidade","ID do operador"],
    ...rows.filter(m=>m.tipo==="entrega" || m.tipo==="troca").map(m=>[m.id,dataHora(m.criado_em),m.trabalhador,m.trabalhador_id,unidades.find(u=>u.id===m.unidade_id)?.nome ?? m.unidade_id,tipos[m.tipo],m.epi,m.ca,m.quantidade,m.operador_id])];
  const blob = new Blob(["\uFEFF",linhas.map(l=>l.map(celula).join(";")).join("\r\n")],{type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "entregas-de-epi.csv"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
export function Historico({ base, pessoas, unidades, trabalhador, versao }: { base:string; pessoas:Pessoa[]; unidades:Unidade[]; trabalhador?:number; versao:number }) {
  const [pessoa,setPessoa] = useState(String(trabalhador ?? ""));
  const [inicio,setInicio] = useState("");
  const [fim,setFim] = useState("");
  const [tentativa,setTentativa] = useState(0);
  const [id,setId] = useState<number|null>(null);
  const consulta = new URLSearchParams();
  if (inicio) consulta.set("inicio",inicio);
  if (fim) consulta.set("fim",fim);
  const invalido = Boolean(inicio && fim && fim<inicio);
  const caminho = pessoa ? "/trabalhadores/"+pessoa+"/ficha" : "/movimentos";
  const lista = useConsulta<Movimento[]>(invalido ? null : base+caminho+"?"+consulta,versao+tentativa,true);
  const recibo = useConsulta<Comprovante>(id ? base+"/movimentos/"+id+"/comprovante" : null,tentativa);
  const nomeUnidade = (id:number) => unidades.find(u=>u.id===id)?.nome ?? "Unidade "+id;
  const r = recibo?.dados;
  return <>
    <div className="grid items-end gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
      <Select label="Ficha do trabalhador" value={pessoa} onChange={e=>setPessoa(e.target.value)}><option value="">Todos os trabalhadores</option>{pessoas.map(p=><option key={p.id} value={p.id}>{p.nome} · {p.matricula}</option>)}</Select>
      <Input type="date" label="Data inicial" max={fim || undefined} value={inicio} onChange={e=>setInicio(e.target.value)}/>
      <Input type="date" label="Data final" min={inicio || undefined} value={fim} onChange={e=>setFim(e.target.value)}/>
      <Button variant="secondary" disabled={!lista?.dados?.some(m=>m.tipo==="entrega" || m.tipo==="troca")} onClick={()=>baixarEntregas(lista?.dados ?? [],unidades)}>Exportar entregas (CSV)</Button>
    </div>
    {invalido ? <p role="alert" className="p-4 text-critical-text">A data final deve ser igual ou posterior à inicial.</p> :
    <DataTable key={caminho+consulta} caption={pessoa ? "Ficha individual de EPI" : "Histórico de movimentações"} data={lista?.dados ?? []} state={!lista ? "loading" : lista.erro ? "error" : "ready"} error={lista?.erro} onRetry={()=>setTentativa(v=>v+1)} pageSize={10} rowKey={m=>String(m.id)} columns={[
      {id:"data",header:"Data",cell:m=>dataHora(m.criado_em)},
      {id:"tipo",header:"Movimentação",cell:m=><><strong>{tipos[m.tipo]}</strong><div>#{m.id}{m.origem_id && " · origem #"+m.origem_id}</div>{m.destino && <div>{m.destino==="estoque" ? "Reposição no estoque" : "Descarte"}</div>}</>},
      {id:"epi",header:"EPI",cell:m=><>{m.epi}<div className="text-muted">CA {m.ca}</div></>},
      {id:"qtd",header:"Qtd.",cell:m=>m.quantidade},{id:"pessoa",header:"Trabalhador",cell:m=>m.trabalhador ?? "—"},
      {id:"unidade",header:"Unidade",cell:m=>nomeUnidade(m.unidade_id)},
      {id:"assinatura",header:"Comprovante",cell:m=>Number(m.possui_assinatura) ? <Button variant="ghost" onClick={()=>setId(m.id)}>Ver comprovante</Button> : "—"}
    ]}/>}
    {id && <Dialog open title={"Comprovante #"+id} onClose={()=>setId(null)}>
      {r ? <div className="space-y-4 text-sm"><div><strong>{r.nome}</strong><p>Matrícula {r.matricula}</p></div>
        <dl className="grid grid-cols-2 gap-3">{Object.entries({"EPI":r.epi,"CA":r.ca,"Quantidade":r.quantidade,"Data":dataHora(r.criado_em),"Unidade":nomeUnidade(r.unidade_id),"Operador":r.operador_id ?? "Indisponível"}).map(([k,v])=><div key={k}><dt className="text-xs text-muted">{k}</dt><dd>{v}</dd></div>)}</dl>
        <figure><figcaption>Assinatura do trabalhador</figcaption><svg aria-label="Assinatura registrada" role="img" viewBox="0 0 600 180" className="w-full rounded-lg border border-line bg-cream-50 text-brand-900"><Tracos valor={r.assinatura}/></svg></figure>
      </div> : recibo?.erro ? <p role="alert">{recibo.erro} <Button onClick={()=>setTentativa(v=>v+1)}>Tentar novamente</Button></p> : <p role="status">Carregando comprovante…</p>}
    </Dialog>}
  </>;
}
