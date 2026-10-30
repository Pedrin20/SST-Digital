import {
  AlertTriangleIcon,
  BellIcon,
  ChevronDownIcon,
  HelpIcon,
  SearchIcon,
} from "./icons";

function TopStat({
  label,
  value,
  note,
  className = "",
}: {
  label: string;
  value: string;
  note: string;
  className?: string;
}) {
  return (
    <div className={`border-l border-line pl-4 ${className}`}>
      <p className="text-[9.5px] font-medium tracking-[0.08em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-0.5 flex items-baseline gap-1 text-[13px] font-semibold text-ink">
        {value}
        <span className="text-[10px] font-normal whitespace-nowrap text-muted">{note}</span>
      </p>
    </div>
  );
}

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream-50">
      <div className="flex h-[60px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <label className="relative hidden w-full max-w-[300px] md:block">
          <span className="sr-only">Buscar no SST Digital</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Buscar NC, NR, EPI ou colaborador"
            className="h-9 w-full rounded-lg border border-line bg-white pr-14 pl-9 text-[12.5px] text-ink transition-colors placeholder:text-muted/80 hover:border-cream-300 focus:border-brand-600 focus:outline-none"
          />
          <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-line bg-cream-50 px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ⌘K
          </kbd>
        </label>

        <div className="hidden items-center gap-5 2xl:flex">
          <TopStat label="Inspeções" value="342" note="abertas" />
          <TopStat label="Planos de ação" value="128" note="em andamento" />
          <TopStat label="Treinamentos" value="14" note="esta semana" className="hidden 2xl:block" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="#nao-conformidades"
            className="hidden items-center gap-1.5 rounded-full border border-critical-border bg-critical-bg px-3 py-1.5 text-[11px] font-medium whitespace-nowrap text-critical-text transition-colors hover:bg-critical-border sm:flex"
          >
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            2 NCs críticas
          </a>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-cream-300 hover:text-brand-900 md:hidden"
            aria-label="Buscar"
          >
            <SearchIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-cream-300 hover:text-brand-900"
            aria-label="Notificações (3 não lidas)"
          >
            <BellIcon className="h-4 w-4" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-critical ring-2 ring-white" />
          </button>

          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-cream-300 hover:text-brand-900 sm:flex"
            aria-label="Central de ajuda"
          >
            <HelpIcon className="h-4 w-4" />
          </button>

          <span className="mx-1 hidden h-7 w-px bg-line sm:block" />

          <button
            type="button"
            className="flex items-center gap-2.5 rounded-lg p-1 text-left transition-colors hover:bg-white/70"
            aria-label="Conta de Marina Rocha"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-[11px] font-semibold text-cream">
              MR
            </span>
            <span className="hidden sm:block">
              <span className="block text-[12px] leading-tight font-semibold whitespace-nowrap text-ink">
                Marina Rocha
              </span>
              <span className="block text-[10px] leading-tight whitespace-nowrap text-muted">
                Coordenadora de SST
              </span>
            </span>
            <ChevronDownIcon className="hidden h-3.5 w-3.5 text-muted sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}

