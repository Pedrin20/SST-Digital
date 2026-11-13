"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/button";
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from "@/app/components/icons";

type CampoDoFormulario = "email" | "senha" | "form";
type ErrosDeCampo = Partial<Record<CampoDoFormulario, string[]>>;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rotulo = "block text-sm font-medium text-ink";
function classesDoCampo(invalido: boolean, paddingDireita = "pr-3") {
  return `h-11 w-full rounded-lg border bg-card pl-3 text-sm text-ink placeholder:text-muted focus-visible:border-brand-600 disabled:opacity-60 ${paddingDireita} ${invalido ? "border-critical" : "border-line hover:border-brand-200"}`;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<ErrosDeCampo>({});

  const erroEmail = erros.email?.[0];
  const erroSenha = erros.senha?.[0];

  function alterarEmail(valor: string) {
    setEmail(valor);
    if (erros.email) setErros((atual) => ({ ...atual, email: undefined }));
  }

  function alterarSenha(valor: string) {
    setSenha(valor);
    if (erros.senha) setErros((atual) => ({ ...atual, senha: undefined }));
  }

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    const emailNormalizado = email.trim();
    const validacao: ErrosDeCampo = {};
    if (!emailNormalizado) validacao.email = ["Informe seu e-mail."];
    else if (!FORMATO_EMAIL.test(emailNormalizado)) validacao.email = ["Informe um e-mail válido."];
    if (!senha) validacao.senha = ["Informe sua senha."];

    setErro(null);
    setErros(validacao);
    if (validacao.email) {
      document.getElementById("email")?.focus();
      return;
    }
    if (validacao.senha) {
      document.getElementById("senha")?.focus();
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailNormalizado, senha, manterConectado }),
      });
      const dados = (await resposta.json().catch(() => null)) as
        | { message?: string; fields?: ErrosDeCampo }
        | null;

      if (!resposta.ok) {
        setErros(dados?.fields ?? {});
        setErro(dados?.message ?? "Não foi possível entrar. Tente novamente.");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="space-y-6" noValidate onSubmit={entrar}>
      {erro ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-critical-border bg-critical-bg px-3 py-2.5 text-[11px] leading-relaxed text-critical-text"
        >
          <AlertTriangleIcon className="mt-px h-4 w-4 shrink-0" />
          <span>{erro}</span>
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className={rotulo}>
          E-mail
        </label>
        <div className="relative mt-1.5">
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            spellCheck={false}
            placeholder="voce@empresa.com.br"
            value={email}
            disabled={enviando}
            aria-invalid={Boolean(erroEmail)}
            aria-describedby={erroEmail ? "email-error" : undefined}
            onChange={(event) => alterarEmail(event.target.value)}
            className={classesDoCampo(Boolean(erroEmail))}
          />
        </div>
        {erroEmail ? (
          <p id="email-error" className="mt-1.5 text-[10px] font-medium text-critical-text">
            {erroEmail}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <label htmlFor="senha" className={rotulo}>
          Senha
        </label>
        <div className="relative mt-1.5">
          <input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            disabled={enviando}
            aria-invalid={Boolean(erroSenha)}
            aria-describedby={erroSenha ? "senha-error" : undefined}
            onChange={(event) => alterarSenha(event.target.value)}
            className={classesDoCampo(Boolean(erroSenha), "pr-11")}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((atual) => !atual)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={mostrarSenha}
            className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-cream-100 hover:text-brand-900"
          >
            {mostrarSenha ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>
        {erroSenha ? (
          <p id="senha-error" className="mt-1.5 text-[10px] font-medium text-critical-text">
            {erroSenha}
          </p>
        ) : null}
      </div>

      <details className="text-right text-xs text-muted"><summary className="cursor-pointer font-medium text-brand-900 hover:underline">Esqueceu sua senha?</summary><p className="mt-2">Para recuperar o acesso, entre em contato com o administrador de SST da sua empresa.</p></details>
      <label className="flex items-center gap-2 text-xs text-muted"><input className="accent-brand-900" type="checkbox" checked={manterConectado} onChange={e => setManterConectado(e.target.checked)} />Manter conectado neste dispositivo</label>
      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream"
            />
            Entrando...
          </>
        ) : (
          <>
            Entrar
          </>
        )}
      </Button>
    </form>
  );
}

