"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, DataTable, Dialog, EmptyState, Input, PageHeader, Select, Tabs } from "@/src/components/ui";
import { SeletorRelacionamento, useOpcoesRelacionamento } from "@/src/components/seletor-relacionamento";
import { api, useConsulta, type Epi, type Pessoa, type Saldo, type Sessao, type Unidade } from "./dados";
import { Movimentar } from "./movimentar";
import { Historico } from "./historico";

export function ControleEpi() {
  const empresas = useOpcoesRelacionamento("empresas");
  const [escolha,setEscolha] = useState<string|null>(null);
  const [tentativa,setTentativa] = useState(0);
  const sessao = useConsulta<Sessao>("/api/epi/sessao",tentativa);
  const empresa = escolha ?? (empresas.lista?.opcoes.length === 1 ? empresas.lista.opcoes[0].id : "");
  const escreve = Boolean(sessao?.dados?.administrador || sessao?.dados?.vinculos?.some(v=>String(v.empresa_id)===empresa && ["ADMIN","GESTOR"].includes(v.perfil)));
  return <>
    <PageHeader title="Controle de EPI" description="Gerencie o estoque por unidade e acompanhe os EPIs entregues a cada trabalhador."/>
    <Card className="mb-4 p-4"><div className="max-w-lg"><SeletorRelacionamento label="Empresa" fonte={empresas} value={empresa} onChange={setEscolha} placeholder="Selecione a empresa"/></div></Card>
    {sessao?.erro && <p role="alert" className="mb-4 text-sm text-critical-text">{sessao.erro} <Button variant="secondary" onClick={()=>setTentativa(v=>v+1)}>Tentar novamente</Button></p>}
    {empresa ? <Painel key={empresa} empresa={empresa} escreve={escreve}/> : <Card><EmptyState title="Selecione uma empresa" description="O catálogo, os saldos e as fichas serão exibidos aqui."/></Card>}
  </>;
}
type Acao = { tipo:"cadastro"; item?:Epi } | { tipo:"excluir"; item:Epi } | { tipo:"pessoa" } | { tipo:"movimento" };
const abas = ["Catálogo","Estoque","Trabalhadores","Movimentações"];
function Painel({ empresa, escreve }: { empresa:string; escreve:boolean }) {
  const base = "/api/epi/"+empresa;
  const [aba,setAba] = useState(abas[0]);
  const [versao,setVersao] = useState(0);
  const [acao,setAcao] = useState<Acao|null>(null);
  const [titular,setTitular] = useState<number>();
  const [busca,setBusca] = useState("");
  const [unidade,setUnidade] = useState("");
  const [aviso,setAviso] = useState("");
  const catalogo = useConsulta<Epi[]>(base+"/catalogo",versao);
  const saldos = useConsulta<Saldo[]>(base+"/estoque",versao);
  const trabalhadores = useConsulta<Pessoa[]>(base+"/trabalhadores",versao);
  const locais = useConsulta<Unidade[]>("/api/unidades?empresa_id="+empresa,versao,true);
  const fontes = [catalogo,saldos,trabalhadores,locais];
  const erro = fontes.find(f=>f?.erro)?.erro;
  const carregando = fontes.some(f=>!f);
  const itens = catalogo?.dados ?? [], estoque = saldos?.dados ?? [], pessoas = trabalhadores?.dados ?? [], unidades = locais?.dados ?? [];
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  function concluir(mensagem:string) { setAcao(null);setAviso(mensagem);setVersao(v=>v+1); }
  function mudarAba(valor:string) { setAba(valor);setBusca("");setTitular(undefined); }
  const botoes = escreve && <Button disabled={carregando || !!erro} onClick={()=>setAcao({tipo:"movimento"})}>Registrar movimentação</Button>;
  const conteudo = <>
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line p-4">
      <h2 className="self-center font-semibold text-brand-900">{aba === "Catálogo" ? "Catálogo de EPIs" : aba === "Estoque" ? "Saldo por unidade" : aba === "Movimentações" ? "Histórico e fichas de EPI" : "Trabalhadores cadastrados"}</h2>
      {(aba==="Catálogo" || aba==="Trabalhadores") && <div className="flex flex-wrap items-end gap-2">
        <Input label={aba==="Catálogo" ? "Buscar por nome ou CA" : "Buscar por nome ou matrícula"} type="search" value={busca} onChange={e=>setBusca(e.target.value)}/>
        {escreve && <Button variant="secondary" onClick={()=>setAcao({tipo:aba==="Catálogo" ? "cadastro" : "pessoa"})}>{aba==="Catálogo" ? "Novo EPI" : "Novo trabalhador"}</Button>}
      </div>}
      {aba==="Estoque" && <Select label="Unidade" value={unidade} onChange={e=>setUnidade(e.target.value)}><option value="">Todas as unidades</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}</Select>}
    </div>
    {aba==="Catálogo" && <DataTable caption="Catálogo de EPIs" pageSize={10} rowKey={i=>String(i.id)} data={itens.filter(i=>(i.nome+" "+i.ca).toLowerCase().includes(termo))} columns={[
      {id:"nome",header:"EPI",cell:i=><strong>{i.nome}</strong>,sortValue:i=>i.nome},{id:"ca",header:"Certificado de Aprovação",cell:i=>i.ca},
      ...(escreve ? [{id:"acoes",header:"Ações",cell:(i:Epi)=><div className="flex gap-2"><Button variant="secondary" onClick={()=>setAcao({tipo:"cadastro",item:i})}>Editar</Button><Button variant="ghost" onClick={()=>setAcao({tipo:"excluir",item:i})}>Excluir</Button></div>}] : [])
    ]}/>}
    {aba==="Estoque" && <DataTable caption="Estoque por unidade" pageSize={10} rowKey={s=>s.unidade_id+"-"+s.epi_id} data={estoque.filter(s=>!unidade || String(s.unidade_id)===unidade)} columns={[
      {id:"epi",header:"EPI",cell:s=><strong>{s.nome}</strong>},{id:"ca",header:"CA",cell:s=>s.ca},{id:"unidade",header:"Unidade",cell:s=>unidades.find(u=>u.id===s.unidade_id)?.nome ?? s.unidade_id},
      {id:"saldo",header:"Quantidade disponível",cell:s=><strong className="tabular-nums">{s.saldo}</strong>,sortValue:s=>Number(s.saldo)}
    ]}/>}
    {aba==="Trabalhadores" && <DataTable caption="Trabalhadores" pageSize={10} rowKey={p=>String(p.id)} data={pessoas.filter(p=>(p.nome+" "+p.matricula).toLowerCase().includes(termo))} columns={[
      {id:"nome",header:"Trabalhador",cell:p=><strong>{p.nome}</strong>,sortValue:p=>p.nome},{id:"matricula",header:"Matrícula",cell:p=>p.matricula},
      {id:"ficha",header:"Ficha de EPI",cell:p=><Button variant="secondary" onClick={()=>{setTitular(p.id);setAba("Movimentações");}}>Ver ficha</Button>}
    ]}/>}
    {aba==="Movimentações" && <Historico base={base} pessoas={pessoas} unidades={unidades} trabalhador={titular} versao={versao}/>}
  </>;
  return <>
    {aviso && <p role="status" className="mb-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-900">{aviso}</p>}
    <div className="mb-3 flex justify-end">{botoes}</div>
    {erro ? <Card className="p-5"><p role="alert">{erro}</p><Button variant="secondary" onClick={()=>setVersao(v=>v+1)}>Tentar novamente</Button></Card> :
      carregando ? <Card className="p-5"><p role="status">Carregando dados de EPI…</p></Card> :
      <div className="min-w-0 overflow-x-auto"><Tabs label="Controle de EPI" value={aba} onChange={mudarAba} items={abas.map(id=>({id,label:id,content:id===aba ? <Card className="mt-3 overflow-hidden">{conteudo}</Card> : undefined}))}/></div>}
    {acao?.tipo==="movimento" && <Movimentar base={base} catalogo={itens} pessoas={pessoas} unidades={unidades} estoque={estoque} fechar={()=>setAcao(null)} concluir={concluir}/>}
    {acao && acao.tipo!=="movimento" && <Cadastro base={base} acao={acao} fechar={()=>setAcao(null)} concluir={concluir}/>}
  </>;
}

function Cadastro({ base,acao,fechar,concluir }: { base:string; acao:Exclude<Acao,{tipo:"movimento"}>; fechar:()=>void; concluir:(m:string)=>void }) {
  const [ocupado,setOcupado] = useState(false), [erro,setErro] = useState(""), [definitivo,setDefinitivo] = useState(false);
  const exclui = acao.tipo==="excluir", pessoa = acao.tipo==="pessoa";
  const item = "item" in acao ? acao.item : undefined;
  const titulo = exclui ? "Excluir EPI" : pessoa ? "Novo trabalhador" : item ? "Editar EPI" : "Novo EPI";
  async function enviar(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ocupado) return;
    const campos = new FormData(e.currentTarget);
    const nome = String(campos.get("nome") ?? "").trim();
    const ca = String(campos.get("ca") ?? "").trim();
    let body:Record<string,string> = pessoa ? {nome,matricula:String(campos.get("matricula")).trim()} : {nome,ca};
    let method = exclui ? "DELETE" : item ? "PUT" : "POST";
    if (item && !exclui && (nome===item.nome || ca===item.ca)) {
      method = "PATCH"; body = nome!==item.nome ? {nome} : {ca};
    }
    const path = pessoa ? "/trabalhadores" : "/catalogo"+(item ? "/"+item.id : "")+(definitivo ? "/definitivo" : "");
    setOcupado(true);setErro("");
    try {
      await api(base+path,{method,headers:{"Content-Type":"application/json"},body:exclui ? undefined : JSON.stringify(body)});
      concluir(exclui ? "EPI excluído." : pessoa ? "Trabalhador cadastrado." : "EPI salvo.");
    } catch(e) {setErro(e instanceof Error ? e.message : "Falha ao salvar.");}
    finally {setOcupado(false);}
  }
  return <Dialog open title={titulo} onClose={()=>{if(!ocupado) fechar();}}>
    <form onSubmit={enviar}><fieldset className="space-y-4" disabled={ocupado}>
      {exclui ? <><p className="text-sm">Excluir <strong>{item?.nome}</strong> (CA {item?.ca}) do catálogo?</p>
        <Select label="Forma de exclusão" value={definitivo ? "definitivo" : "comum"} onChange={e=>{setDefinitivo(e.target.value==="definitivo");setErro("");}}>
          <option value="comum">Excluir somente se estiver sem uso</option><option value="definitivo">Excluir mesmo com saldo ou movimentações</option>
        </Select>{definitivo && <p className="rounded-lg bg-cream p-3 text-sm">A exclusão definitiva apaga o cadastro e os saldos de todas as unidades. As fichas e os comprovantes anteriores continuam disponíveis.</p>}</> :
        <><Input label={pessoa ? "Nome do trabalhador" : "Nome do EPI"} name="nome" defaultValue={item?.nome} required maxLength={150}/>
          {pessoa ? <Input label="Matrícula" name="matricula" required maxLength={50}/> : <Input label="Certificado de Aprovação (CA)" name="ca" required defaultValue={item?.ca} maxLength={30}/>}</>}
      {erro && <p role="alert" className="text-sm text-critical-text">{erro}</p>}
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={fechar}>Cancelar</Button>
        <Button type="submit">{ocupado ? "Aguarde…" : exclui ? definitivo ? "Excluir definitivamente" : "Confirmar exclusão" : "Salvar"}</Button></div>
    </fieldset></form>
  </Dialog>;
}
