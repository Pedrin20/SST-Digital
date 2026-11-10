import { Suspense } from "react";
import { Estrutura } from "@/app/components/estrutura";
import { lerContexto, type ParametrosEstrutura } from "@/src/lib/estrutura";
import { Setores } from "./setores";

type Props = { searchParams: Promise<ParametrosEstrutura> };

export default function SetoresPage(props: Props) {
  return <Suspense fallback={<Estrutura nivel="Setores"><p role="status" className="py-5 text-sm text-muted">Carregando setores...</p></Estrutura>}>
    <ListaComContexto {...props} />
  </Suspense>;
}

async function ListaComContexto({ searchParams }: Props) {
  const params = await searchParams;
  const empresa = lerContexto(params, "empresa");
  const unidade = lerContexto(params, "unidade");
  return <Estrutura nivel="Setores" empresa={unidade ? empresa : undefined} unidade={unidade}>
    <Setores key={unidade?.id ?? "todos"} contexto={unidade} />
  </Estrutura>;
}

