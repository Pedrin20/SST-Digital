import type { Metadata } from "next";
import {
  InspectionIcon,
  ShieldCheckIcon,
  TrendUpIcon,
} from "@/app/components/icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar — SST Digital",
  description:
    "Acesse o painel de gestão de Segurança e Saúde do Trabalho do SST Digital.",
};

const recursos = [
  {
    icon: ShieldCheckIcon,
    titulo: "Conformidade NR-01",
    descricao: "GRO, PGR e evidências organizados em um só lugar.",
  },
  {
    icon: InspectionIcon,
    titulo: "Inspeções e planos de ação",
    descricao: "Não conformidades acompanhadas até a conclusão.",
  },
  {
    icon: TrendUpIcon,
    titulo: "Indicadores por setor",
    descricao: "Riscos priorizados com base em dados atualizados.",
  },
];

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-cream">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-cream-200/70 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-brand-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1040px] flex-1 items-center px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
        <div className="w-full overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_50px_-30px_rgba(6,78,59,0.35)] lg:grid lg:grid-cols-[1.05fr_1fr]">
          {/* Painel de marca (desktop) */}
          <section
            aria-label="Sobre a plataforma SST Digital"
            className="relative hidden flex-col justify-between bg-brand-900 p-8 lg:flex xl:p-10"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-brand-700/50 blur-3xl" />
              <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-brand-800/60 blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-brand-900 shadow-logo">
                  <ShieldCheckIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[17px] leading-tight font-semibold tracking-tight text-white">
                    SST Digital
                  </span>
                  <span className="mt-0.5 block text-[8.5px] leading-[1.4] tracking-[0.09em] text-cream/60 uppercase">
                    Gestão de Segurança do Trabalho
                  </span>
                </span>
              </div>

              <div className="mt-11">
                <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] text-cream/75 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7b7]" />
                  Plataforma corporativa
                </p>
                <h2 className="mt-4 text-[26px] leading-[1.15] font-semibold tracking-tight text-white xl:text-[28px]">
                  Segurança do trabalho,
                  <br />
                  sob controle.
                </h2>
                <p className="mt-3 max-w-[320px] text-[11.5px] leading-relaxed text-cream/65">
                  Indicadores, inspeções, riscos e ações preventivas centralizados
                  para decisões mais rápidas e conformidade contínua.
                </p>
              </div>

              <ul className="mt-9 space-y-4">
                {recursos.map(({ icon: Icon, titulo, descricao }) => (
                  <li key={titulo} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.07] text-cream/85">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[11.5px] font-semibold text-white">
                        {titulo}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-relaxed text-cream/55">
                        {descricao}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-10 rounded-lg border border-white/10 bg-white/[0.06] px-3.5 py-3">
              <p className="text-[10px] leading-relaxed text-cream/60">
                Acesso pessoal e intransferível. As ações realizadas na plataforma
                são registradas para auditoria de SST.
              </p>
            </div>
          </section>

          {/* Formulário */}
          <section className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-11">
            <div className="mx-auto w-full max-w-[360px] lg:mx-0">
              <div className="mb-7 flex items-center gap-2.5 lg:hidden">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-cream shadow-button">
                  <ShieldCheckIcon className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] leading-tight font-semibold tracking-tight text-brand-900">
                    SST Digital
                  </span>
                  <span className="mt-0.5 block text-[8.5px] tracking-[0.09em] text-muted uppercase">
                    Gestão de Segurança do Trabalho
                  </span>
                </span>
              </div>

              <p className="text-[9.5px] font-semibold tracking-[0.14em] text-brand-700 uppercase">
                Acesso restrito
              </p>
              <h1 className="mt-1.5 text-[22px] leading-tight font-semibold tracking-tight text-brand-900 sm:text-[26px]">
                Entrar na plataforma
              </h1>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                Use o e-mail corporativo e a senha fornecidos pelo administrador de
                SST.
              </p>

              <LoginForm />

              <div className="mt-6 border-t border-line pt-4">
                <p className="text-[10px] leading-relaxed text-muted">
                  <span className="font-semibold text-ink">
                    Problemas para acessar?
                  </span>{" "}
                  Fale com o administrador de SST da sua empresa para redefinir a
                  senha ou liberar o acesso.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="relative mx-auto flex w-full max-w-[1040px] flex-col gap-1.5 px-4 pb-6 text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>SST Digital © 2026 · Gestão de Segurança do Trabalho</p>
        <p className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
          Sessão protegida · expira em 8 horas
        </p>
      </footer>
    </main>
  );
}
