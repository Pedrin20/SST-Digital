import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import { Card } from "@/src/components/ui/card";
import { LoginForm } from "./login-form";
import "./login.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: "800", display: "swap" });
export const metadata: Metadata = { title: "Entrar — SST Digital" };

export default function LoginPage() {
  return (
    <main className="login-stage relative isolate grid min-h-svh items-center overflow-hidden">

      <div className="mx-auto grid w-full max-w-6xl items-center justify-items-center gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <header className="text-center lg:justify-self-start lg:text-left">
          <h1 className={display.className + " text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.82] font-extrabold tracking-tight text-brand-900 uppercase"}>SST<br />Digital</h1>
          <p className="mt-5 font-semibold text-ink md:text-lg">Cada risco mapeado. Cada ação no prazo.</p>
        </header>
        <Card aria-label="Acesso à conta" className="w-full max-w-[420px] px-7 py-10 md:px-10 lg:justify-self-end">
          <LoginForm />
          <p className="mt-8 text-center text-xs leading-relaxed text-muted">Contas criadas pelo administrador da sua empresa.<br />Para solicitar acesso, fale com ele.</p>
        </Card>
      </div>
    </main>
  );
}