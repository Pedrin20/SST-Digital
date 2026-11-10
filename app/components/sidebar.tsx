import {
  DashboardIcon,
  FileIcon,
  HelmetIcon,
  MatrixIcon,
  PlanIcon,
  PlusIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "./icons";
import Image from "next/image";

const navigation = [
  { label: "Dashboard Geral", href: "/dashboard", icon: DashboardIcon },
  { label: "Estrutura organizacional", href: "/empresas", icon: ShieldCheckIcon },
  { label: "Perigos", href: "/perigos", icon: MatrixIcon },
  { label: "Avaliações de risco", href: "/avaliacoes-risco", icon: MatrixIcon },
  { label: "Ações", href: "/acoes", icon: PlanIcon },
  { label: "Equipamentos", href: "/equipamentos", icon: HelmetIcon },
  { label: "Documentos", href: "/documentos", icon: FileIcon },
  { label: "Usuários", href: "/usuarios", icon: SettingsIcon },
];

function BrandMark() {
  return (
    <Image src="/marca/logo-escuro.svg" alt="SST Digital" width={210} height={50} className="h-auto w-[190px] max-w-full" priority />
  );
}

export function Sidebar({ active = "Dashboard Geral" }: { active?: string }) {
  return (
    <>
      {/* Barra superior (mobile / tablet) */}
      <header className="bg-brand-900 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-4">
          <BrandMark />
          <a
            href="/acoes"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-brand-900"
            aria-label="Acessar ações"
          >
            <PlusIcon className="h-4.5 w-4.5" />
          </a>
        </div>
        <nav aria-label="Navegação principal" className="scrollbar-thin overflow-x-auto px-3 pt-3 pb-3">
          <ul className="flex w-max items-center gap-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    aria-current={item.label === active ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                      item.label === active
                        ? "bg-cream text-brand-900"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col overflow-y-auto bg-brand-900 text-white lg:flex">
        <div className="border-b border-white/10 px-5 pt-6 pb-5">
          <BrandMark />
          <a
            href="/acoes"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cream px-3 py-2.5 text-[13px] font-semibold text-brand-900 transition-colors hover:bg-cream-100"
          >
            <PlusIcon className="h-4 w-4" />
            Acessar ações
          </a>
        </div>

        <nav aria-label="Navegação principal" className="px-3 pt-5">
          <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-white/35 uppercase">
            Painel principal
          </p>
          <ul className="mt-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    aria-current={item.label === active ? "page" : undefined}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${
                      item.label === active
                        ? "bg-cream font-semibold text-brand-900 shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-[17px] w-[17px] shrink-0 ${
                        item.label === active ? "text-brand-900" : "text-cream/60 group-hover:text-cream"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto px-3 pt-8">
          <p className="px-1 pt-4 pb-5 text-[10px] text-white/30">
            SST Digital · Gestão de Segurança do Trabalho
          </p>
        </div>
      </aside>
    </>
  );
}




