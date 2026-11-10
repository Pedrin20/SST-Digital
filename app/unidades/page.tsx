import { Suspense } from "react";
import { Estrutura } from "@/app/components/estrutura";
import { lerContexto, type ParametrosEstrutura } from "@/src/lib/estrutura";
import { Unidades } from "./unidades";

type Props = { searchParams: Promise<ParametrosEstrutura> };

export default function UnidadesPage(props: Props) {
  return <Suspense fallback={<Estrutura nivel="Unidades"><p role="status" className="py-5 text-sm text-muted">Carregando unidades...</p></Estrutura>}>
    <ListaComContexto {...props} />
  </Suspense>;
}

async function ListaComContexto({ searchParams }: Props) {
  const params = await searchParams;
  const empresa = lerContexto(params, "empresa");
  return <Estrutura nivel="Unidades" empresa={empresa}>
    <Unidades key={empresa?.id ?? "todos"} contexto={empresa} />
  </Estrutura>;
}
