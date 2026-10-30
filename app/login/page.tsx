import type { Metadata } from "next";
import { ShieldCheckIcon } from "@/app/components/icons";
import { LoginForm } from "./login-form";
import "./login.css";
export const metadata: Metadata = { title: "Entrar — SST Digital" };
export default function LoginPage() {
  return <main className="login-page">
    <section className="login-brand" aria-label="SST Digital — Segurança do trabalho">
      <div className="login-logo"><span><ShieldCheckIcon className="h-5 w-5" /></span>SST Digital</div>
      <div className="login-pitch"><div className="login-stripes" aria-hidden="true" /><h2>Segurança do trabalho<br />organizada em um só lugar.</h2><p>Saiba o que está pendente, quem é responsável e quais<br className="hidden xl:block" /> medidas já foram executadas — sem planilhas espalhadas.</p><ul>{["Inspeções", "Perigos e riscos", "Ações preventivas", "EPIs e documentos"].map(label => <li key={label}>{label}</li>)}</ul></div>
    </section>
    <section className="login-access" aria-labelledby="login-title"><div className="login-content"><div className="login-mobile-logo"><ShieldCheckIcon className="h-6 w-6" /> SST Digital</div><h1 id="login-title">Acesse sua conta</h1><p className="login-intro">Entre para acompanhar inspeções, riscos e ações da sua empresa.</p><LoginForm /><p className="login-contact">Sua empresa ainda não usa? <a href="#login-support">Fale com a equipe</a></p><details id="login-support"><summary>Orientações de acesso</summary><p>Para contratar a plataforma, recuperar sua senha ou obter ajuda, entre em contato com o administrador de SST da sua empresa.</p></details></div><footer><span>© 2026 SST Digital</span><a href="#login-support">Precisa de ajuda?</a></footer></section>
  </main>;
}
