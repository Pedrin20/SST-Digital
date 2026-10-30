import {
  DashboardIcon,
  FileIcon,
  HelmetIcon,
  InspectionIcon,
  LifeBuoyIcon,
  MatrixIcon,
  PlanIcon,
  PlusIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "./icons";

const navigation = [
  { label: "Dashboard Geral", href: "/dashboard", icon: DashboardIcon },
  { label: "Empresas", href: "/empresas", icon: ShieldCheckIcon },
  { label: "Unidades", href: "/unidades", icon: ShieldCheckIcon },
  { label: "Setores", href: "/setores", icon: PlanIcon },
  { label: "Perigos", href: "/perigos", icon: MatrixIcon },
  { label: "Avaliações de risco", href: "/avaliacoes-risco", icon: MatrixIcon },
  { label: "Usuários", href: "/usuarios", icon: SettingsIcon },
  { label: "Inspeções & Auditorias", href: "/dashboard#inspecoes", icon: InspectionIcon, badge: "8" },
  { label: "Matriz de Riscos", href: "/dashboard#matriz", icon: MatrixIcon, badge: "4" },
  { label: "Planos de Ação", href: "/dashboard#planos", icon: PlanIcon, badge: "12" },
  { label: "EPIs & Equipamentos", href: "#epis", icon: HelmetIcon },
  { label: "Documentos & NRs", href: "#documentos", icon: FileIcon },
  { label: "Configurações", href: "/dashboard#configuracoes", icon: SettingsIcon },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-brand-900 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
        <ShieldCheckIcon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] leading-tight font-semibold tracking-tight text-white">
          SST Digital
        </span>
        <span className="mt-0.5 block text-[8.5px] leading-[1.4] tracking-[0.09em] text-cream/60 uppercase">
          Gestão de Segurança
          <br />
          do Trabalho
        </span>
      </span>
    </div>
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
            href="#inspecoes"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-brand-900"
            aria-label="Nova inspeção"
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
            href="#inspecoes"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cream px-3 py-2.5 text-[13px] font-semibold text-brand-900 transition-colors hover:bg-cream-100"
          >
            <PlusIcon className="h-4 w-4" />
            Nova Inspeção
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
                    {item.badge ? (
                      <span
                        className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          item.label === active
                            ? "bg-brand-900/10 text-brand-900"
                            : "bg-white/10 text-cream/80"
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto px-3 pt-8">
          <a
            href="#suporte"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LifeBuoyIcon className="h-[17px] w-[17px] text-cream/50" />
            Suporte Técnico
          </a>

          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.06] p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6ee7b7] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6ee7b7]" />
              </span>
              <p className="text-[11px] font-medium text-white">Sistema operacional</p>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-cream/55">
              Licença ativa · renova em dez/2026
              <br />
              Base NR-01 sincronizada há 2 min
            </p>
          </div>

          <p className="px-1 pt-4 pb-5 text-[10px] text-white/30">
            SST Digital © 2026 · v2.4.1
          </p>
        </div>
      </aside>
    </>
  );
}




