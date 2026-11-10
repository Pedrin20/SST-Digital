import Link from "next/link";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { unidadesHref, type VinculoEstrutura } from "@/src/lib/estrutura";
import type { ReactNode } from "react";

export function Estrutura({ nivel, empresa, unidade, children }: {
  nivel: "Empresas" | "Unidades" | "Setores";
  empresa?: VinculoEstrutura;
  unidade?: VinculoEstrutura;
  children: ReactNode;
}) {
  return <div className="min-h-screen bg-cream">
    <Sidebar active="Estrutura organizacional" />
    <div className="lg:pl-[264px]"><Topbar />
      <main className="mx-auto max-w-[1500px] px-4 pb-10 sm:px-6 lg:px-8">
        <nav aria-label="Listas da estrutura organizacional" className="grid grid-cols-3 gap-1 border-b border-line pt-4 sm:flex">
          {(["Empresas", "Unidades", "Setores"] as const).map(label => <Link key={label} href={`/${label.toLowerCase()}`}
            aria-current={label === nivel ? "page" : undefined}
            className={`flex min-h-11 items-center justify-center border-b-2 px-3 text-sm font-semibold sm:px-6 ${label === nivel ? "border-brand-900 text-brand-900" : "border-transparent text-muted hover:bg-brand-50"}`}>{label}</Link>)}
        </nav>
        {(empresa || unidade) && <nav aria-label="Caminho na estrutura" className="flex flex-wrap items-center gap-x-2 pt-4 text-sm text-muted">
          <Link className="text-brand-900 underline" href="/empresas">Empresas</Link>
          {empresa && <><span aria-hidden="true">›</span><Link className="break-all text-brand-900 underline" href={unidadesHref(empresa)}>{empresa.nome}</Link></>}
          {unidade && <><span aria-hidden="true">›</span><span className="break-all">{unidade.nome}</span></>}
          <span aria-hidden="true">›</span><span aria-current="page">{nivel}</span>
        </nav>}
        {children}
      </main>
    </div>
  </div>;
}
