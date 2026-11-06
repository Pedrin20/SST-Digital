"use client";
import { fetchComDiagnosticoDelete } from "@/src/lib/delete-diagnostics";
import { FRASE_EXCLUSAO_EMPRESA } from "@/src/lib/empresas/exclusao";
import {
  cnaeSecundarioPayload,
  corpoDaEmpresa,
  empresaPayload,
  lerCnaes,
  lerDetalhe,
  lerLista,
  type CnaeSecundario,
  type Empresa,
} from "@/src/lib/empresas/schema";

import { useCallback, useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Badge, Button, Card, Dialog, Input, Select } from "@/src/components/ui";
import { PlusIcon } from "@/app/components/icons";

type Formulario = {
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  email: string;
  site: string;
  cnaePrincipal: string;
  ativo: boolean;
};

const vazio: Formulario = {
  nome: "",
  nomeFantasia: "",
  cnpj: "",
  telefone: "",
  email: "",
  site: "",
  cnaePrincipal: "",
  ativo: true,
};

const limite = 50;

class RequestError extends Error {
  constructor(message: string, public fields: Record<string, string[]> = {}) {
    super(message);
    this.name = "RequestError";
  }
}

function formatarCnpj(value: string) {
  const chars = value.replace(/[^A-Za-z0-9]/g, "").slice(0, 14).toUpperCase();
  return chars
    .replace(/^(.{2})(.)/, "$1.$2")
    .replace(/^(.{2})\.(.{3})([A-Za-z0-9])/, "$1.$2.$3")
    .replace(/\.(.{3})([A-Za-z0-9])/, ".$1/$2")
    .replace(/([A-Za-z0-9]{4})([A-Za-z0-9])/, "$1-$2");
}

function linkDoSite(value: string): string | null {
  if (!value) return null;
  const comProtocolo = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(comProtocolo);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function dadosDoFormulario(item: Empresa): Formulario {
  return {
    nome: item.nome,
    nomeFantasia: item.nome_fantasia,
    cnpj: formatarCnpj(item.cnpj),
    telefone: item.telefone,
    email: item.email,
    site: item.site,
    cnaePrincipal: item.cnae_principal,
    ativo: item.ativo,
  };
}

function campos(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object") return {};
  const fields = (value as Record<string, unknown>).fields;
  if (!fields || typeof fields !== "object") return {};
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) result[key] = value.filter((item): item is string => typeof item === "string");
    else if (typeof value === "string") result[key] = [value];
  }
  return result;
}

function mensagem(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const data = value as Record<string, unknown>;
  for (const key of ["message", "erro", "mensagem"]) {
    if (typeof data[key] === "string") return data[key];
  }
  return undefined;
}

async function requisicao(url: string, options?: RequestInit): Promise<unknown> {
  const response = await fetchComDiagnosticoDelete(url, options);
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      throw new RequestError("Sua sessão expirou. Acesse a página de login para entrar novamente.");
    }
    if (response.status === 403) throw new RequestError("A operação é restrita ao administrador do sistema.");
    throw new RequestError(mensagem(data) ?? "Não foi possível concluir a operação.", campos(data));
  }
  return data;
}

export function Empresas() {
  const [rows, setRows] = useState<Empresa[]>([]);
  const [filtro, setFiltro] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [form, setForm] = useState<Formulario>(vazio);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [formErro, setFormErro] = useState("");
  const [exclusao, setExclusao] = useState<Empresa | null>(null);
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [versao, setVersao] = useState(0);

  const [cnaes, setCnaes] = useState<CnaeSecundario[]>([]);
  const [cnaesLoading, setCnaesLoading] = useState(false);
  const [cnaesErro, setCnaesErro] = useState("");
  const [novoCnae, setNovoCnae] = useState({ codigo: "", descricao: "" });
  const [cnaeFields, setCnaeFields] = useState<Record<string, string[]>>({});
  const [cnaeErro, setCnaeErro] = useState("");
  const [cnaeSalvando, setCnaeSalvando] = useState(false);
  const [cnaeRemovendo, setCnaeRemovendo] = useState<number | null>(null);
  const [confirmarCnae, setConfirmarCnae] = useState<CnaeSecundario | null>(null);

  const carregar = useCallback(
    async (signal: AbortSignal) => {
      const query = new URLSearchParams({ limit: String(limite), offset: String(offset) });
      if (filtro) query.set("ativo", filtro);
      try {
        const data = await requisicao(`/api/empresas?${query}`, { signal });
        if (!signal.aborted) {
          setRows(lerLista(data));
          setErro("");
        }
      } catch (error) {
        if (!signal.aborted) {
          setRows([]);
          setErro(
            error instanceof RequestError
              ? error.message
              : "A resposta da API não corresponde aos dados esperados de empresas.",
          );
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [filtro, offset],
  );

  // A leitura acompanha os filtros e é cancelada quando eles mudam.
  useEffect(() => {
    const controller = new AbortController();
    // A atualização de estado ocorre após a resposta da requisição, não de forma síncrona.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar(controller.signal);
    return () => controller.abort();
  }, [carregar, versao]);

  async function carregarCnaes(empresaId: number) {
    setCnaesLoading(true);
    setCnaesErro("");
    try {
      setCnaes(lerCnaes(await requisicao(`/api/empresas/${empresaId}/cnaes-secundarios`)));
    } catch (error) {
      setCnaes([]);
      setCnaesErro(
        error instanceof RequestError
          ? error.message
          : "A API retornou os CNAEs secundários em formato desconhecido.",
      );
    } finally {
      setCnaesLoading(false);
    }
  }

  async function abrir(item?: Empresa) {
    let empresa = item ?? null;
    if (empresa) {
      try {
        empresa = lerDetalhe(await requisicao(`/api/empresas/${empresa.id}`));
      } catch (error) {
        setAviso("");
        setErro(
          error instanceof RequestError
            ? error.message
            : "A API retornou os dados da empresa em formato desconhecido.",
        );
        return;
      }
    }
    setEditando(empresa);
    setForm(empresa ? dadosDoFormulario(empresa) : vazio);
    setFields({});
    setFormErro("");
    setAviso("");
    setCnaes([]);
    setCnaesErro("");
    setCnaeFields({});
    setCnaeErro("");
    setNovoCnae({ codigo: "", descricao: "" });
    setConfirmarCnae(null);
    setModal(true);
    if (empresa) void carregarCnaes(empresa.id);
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando || cnaeSalvando || cnaeRemovendo !== null) return;

    const parsed = empresaPayload.safeParse({
      nome: form.nome,
      nome_fantasia: form.nomeFantasia,
      cnpj: form.cnpj,
      telefone: form.telefone,
      email: form.email,
      site: form.site,
      cnae_principal: form.cnaePrincipal,
      ativo: form.ativo,
    });
    if (!parsed.success) {
      setFields(parsed.error.flatten().fieldErrors);
      setFormErro("Revise os campos destacados.");
      return;
    }
    if (editando === null && !parsed.data.cnpj) {
      setFields({ cnpj: ["Informe o CNPJ da empresa."] });
      setFormErro("Revise os campos destacados.");
      return;
    }
    if (editando?.cnpj && !parsed.data.cnpj) {
      setFields({ cnpj: ["O CNPJ não pode ser removido."] });
      setFormErro("Revise os campos destacados.");
      return;
    }

    setSalvando(true);
    setFormErro("");
    setFields({});
    setAviso("");
    try {
      await requisicao(editando ? `/api/empresas/${editando.id}` : "/api/empresas", {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpoDaEmpresa(parsed.data, editando)),
      });
      setModal(false);
      setAviso(editando ? "Empresa atualizada com sucesso." : "Empresa cadastrada com sucesso.");
      setLoading(true);
      setErro("");
      setOffset(0);
      setVersao(value => value + 1);
    } catch (error) {
      if (error instanceof RequestError) setFields(error.fields);
      setFormErro(error instanceof Error ? error.message : "Não foi possível salvar a empresa.");
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarCnae() {
    if (!editando || salvando || cnaeSalvando || cnaeRemovendo !== null) return;

    const parsed = cnaeSecundarioPayload.safeParse(novoCnae);
    if (!parsed.success) {
      setCnaeFields(parsed.error.flatten().fieldErrors);
      setCnaeErro("Revise os campos do CNAE.");
      return;
    }

    setCnaeSalvando(true);
    setCnaeErro("");
    setCnaeFields({});
    try {
      await requisicao(`/api/empresas/${editando.id}/cnaes-secundarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setNovoCnae({ codigo: "", descricao: "" });
      await carregarCnaes(editando.id);
    } catch (error) {
      if (error instanceof RequestError) setCnaeFields(error.fields);
      setCnaeErro(error instanceof Error ? error.message : "Não foi possível adicionar o CNAE secundário.");
    } finally {
      setCnaeSalvando(false);
    }
  }

  async function removerCnae() {
    if (!editando || !confirmarCnae || cnaeRemovendo !== null) return;

    setCnaeRemovendo(confirmarCnae.id);
    setCnaeErro("");
    try {
      await requisicao(`/api/empresas/${editando.id}/cnaes-secundarios/${confirmarCnae.id}`, {
        method: "DELETE",
      });
      setConfirmarCnae(null);
      await carregarCnaes(editando.id);
    } catch (error) {
      setCnaeErro(error instanceof Error ? error.message : "Não foi possível remover o CNAE secundário.");
    } finally {
      setCnaeRemovendo(null);
    }
  }

  function adicionarCnaeComEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void adicionarCnae();
  }

  async function excluir() {
    if (!exclusao || salvando) return;
    if (confirmacao !== FRASE_EXCLUSAO_EMPRESA) {
      setFormErro("Digite a frase de confirmação exatamente como indicada.");
      return;
    }
    setSalvando(true);
    setFormErro("");
    try {
      await requisicao(`/api/empresas/${exclusao.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmacao }),
      });
      setExclusao(null);
      setConfirmacao("");
      setAviso("Empresa excluída com sucesso.");
      setLoading(true);
      setErro("");
      setOffset(0);
      setVersao(value => value + 1);
    } catch (error) {
      setFormErro(error instanceof Error ? error.message : "Não foi possível excluir a empresa.");
    } finally {
      setSalvando(false);
    }
  }

  const ocupado = salvando || cnaeSalvando || cnaeRemovendo !== null;

  return (
    <>
      <nav aria-label="Trilha de navegação" className="pt-5 text-[11px] text-muted">
        <a href="/dashboard" className="font-medium text-brand-900 hover:underline">
          SST Digital
        </a>
        <span className="mx-2">/</span>
        <span aria-current="page">Empresas</span>
      </nav>

      <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-brand-700 uppercase">Cadastros</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-brand-900">Empresas</h1>
          <p className="mt-1 text-[12px] text-muted">
            Consulte e gerencie as empresas cadastradas na plataforma.
          </p>
        </div>
        <Button onClick={() => void abrir()} className="px-4">
          <PlusIcon className="h-4 w-4" /> Nova empresa
        </Button>
      </div>

      {aviso && (
        <p role="status" className="mb-4 rounded-lg border border-success-border bg-success-bg px-3 py-2 text-[12px] text-success-text">
          {aviso}
        </p>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div>
            <h2 className="text-[14px] font-semibold text-ink">Empresas cadastradas</h2>
            <p className="mt-1 text-[11px] text-muted">Acompanhe os dados e a situação de cada empresa.</p>
          </div>
          <div className="w-full sm:w-44">
            <Select
              label="Situação"
              value={filtro}
              onChange={event => {
                setLoading(true);
                setErro("");
                setFiltro(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">Todas</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-[12px] text-muted" role="status">Carregando empresas...</p>
        ) : erro ? (
          <div role="alert" className="p-6 text-[12px] text-critical-text">
            <p>{erro}</p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => {
                setLoading(true);
                setErro("");
                setVersao(value => value + 1);
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[13px] font-semibold">Nenhuma empresa encontrada</p>
            <p className="mt-1 text-[11px] text-muted">Altere o filtro ou cadastre uma nova empresa.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map(item => {
              const site = linkDoSite(item.site);
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="break-words text-[13px] font-semibold text-ink">{item.nome}</p>
                      <Badge variant={item.ativo ? "success" : "neutral"}>{item.ativo ? "Ativa" : "Inativa"}</Badge>
                    </div>
                    {item.nome_fantasia && (
                      <p className="mt-0.5 break-words text-[11px] text-muted">{item.nome_fantasia}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted">
                      CNPJ {item.cnpj ? formatarCnpj(item.cnpj) : "não informado"}
                      <span className="mx-1">·</span> ID {item.id}
                    </p>
                    {(item.telefone || item.email || item.site || item.cnae_principal) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                        {item.telefone && (
                          <a
                            href={`tel:${item.telefone.replace(/[^\d+]/g, "")}`}
                            className="hover:text-brand-900 hover:underline"
                          >
                            {item.telefone}
                          </a>
                        )}
                        {item.email && (
                          <a
                            href={`mailto:${item.email}`}
                            className="break-all hover:text-brand-900 hover:underline"
                          >
                            {item.email}
                          </a>
                        )}
                        {item.site &&
                          (site ? (
                            <a
                              href={site}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all hover:text-brand-900 hover:underline"
                            >
                              {item.site}
                            </a>
                          ) : (
                            <span className="break-all">{item.site}</span>
                          ))}
                        {item.cnae_principal && <span>CNAE principal {item.cnae_principal}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void abrir(item)} aria-label={`Editar ${item.nome}`}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFormErro("");
                        setConfirmacao("");
                        setExclusao(item);
                      }}
                      aria-label={`Excluir empresa ${item.id}`}
                    >
                      Excluir
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-cream-50/70 px-4 py-3 sm:px-5">
          <p className="text-[11px] text-muted">
            {loading ? "Carregando..." : `${rows.length} empresa(s) nesta página`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={loading || offset === 0}
              onClick={() => {
                setLoading(true);
                setOffset(value => Math.max(0, value - limite));
              }}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              disabled={loading || !!erro || rows.length < limite}
              onClick={() => {
                setLoading(true);
                setOffset(value => value + limite);
              }}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={modal}
        onClose={() => {
          if (!ocupado) setModal(false);
        }}
        title={editando ? "Editar empresa" : "Nova empresa"}
      >
        <form onSubmit={salvar} className="space-y-5" noValidate>
          <p className="text-[11px] text-muted">
            {editando
              ? "Atualize os dados cadastrais e os CNAEs secundários da empresa."
              : "Preencha os dados da empresa. Nome e CNPJ são obrigatórios."}
          </p>

          {formErro && (
            <p
              role="alert"
              className="rounded-lg border border-critical-border bg-critical-bg p-3 text-[11px] text-critical-text"
            >
              {formErro}
            </p>
          )}

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold tracking-[0.12em] text-brand-700 uppercase">Identificação</h3>
            <Input
              label="Nome da empresa"
              value={form.nome}
              onChange={event => setForm({ ...form, nome: event.target.value })}
              error={fields.nome?.[0]}
              disabled={salvando}
              minLength={2}
              maxLength={150}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nome fantasia"
                value={form.nomeFantasia}
                onChange={event => setForm({ ...form, nomeFantasia: event.target.value })}
                error={fields.nome_fantasia?.[0]}
                disabled={salvando}
                maxLength={150}
              />
              <Input
                label="CNPJ"
                value={form.cnpj}
                onChange={event => setForm({ ...form, cnpj: formatarCnpj(event.target.value) })}
                error={fields.cnpj?.[0]}
                placeholder="00.000.000/0000-00"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={18}
                required={editando === null || Boolean(editando.cnpj)}
                disabled={salvando}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold tracking-[0.12em] text-brand-700 uppercase">Contato</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Telefone"
                type="tel"
                value={form.telefone}
                onChange={event => setForm({ ...form, telefone: event.target.value })}
                error={fields.telefone?.[0]}
                placeholder="(00) 00000-0000"
                maxLength={20}
                disabled={salvando}
              />
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={event => setForm({ ...form, email: event.target.value })}
                error={fields.email?.[0]}
                placeholder="contato@empresa.com.br"
                maxLength={254}
                disabled={salvando}
              />
            </div>
            <Input
              label="Site"
              value={form.site}
              onChange={event => setForm({ ...form, site: event.target.value })}
              error={fields.site?.[0]}
              placeholder="https://www.empresa.com.br"
              inputMode="url"
              maxLength={255}
              disabled={salvando}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold tracking-[0.12em] text-brand-700 uppercase">Atividade</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="CNAE principal"
                value={form.cnaePrincipal}
                onChange={event => setForm({ ...form, cnaePrincipal: event.target.value })}
                error={fields.cnae_principal?.[0]}
                placeholder="0000-0/00"
                maxLength={10}
                disabled={salvando}
              />
              <Select
                label="Situação"
                value={String(form.ativo)}
                onChange={event => setForm({ ...form, ativo: event.target.value === "true" })}
                error={fields.ativo?.[0]}
                disabled={salvando}
              >
                <option value="true">Ativa</option>
                <option value="false">Inativa</option>
              </Select>
            </div>
          </div>

          {editando ? (
            <section className="space-y-3 rounded-xl border border-line bg-cream-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-[12px] font-semibold text-brand-900">CNAEs secundários</h3>
                  <p className="mt-0.5 text-[11px] text-muted">Códigos adicionais vinculados à empresa.</p>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
                  {cnaes.length} {cnaes.length === 1 ? "cadastrado" : "cadastrados"}
                </span>
              </div>

              {cnaesErro ? (
                <div role="alert" className="text-[11px] text-critical-text">
                  <p>{cnaesErro}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => void carregarCnaes(editando.id)}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : cnaesLoading ? (
                <p role="status" className="text-[11px] text-muted">Carregando CNAEs secundários...</p>
              ) : cnaes.length === 0 ? (
                <p className="text-[11px] text-muted">Nenhum CNAE secundário cadastrado.</p>
              ) : (
                <ul className="divide-y divide-line rounded-lg border border-line bg-white">
                  {cnaes.map(cnae => (
                    <li key={cnae.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-ink">{cnae.codigo}</p>
                        <p className="break-words text-[11px] text-muted">{cnae.descricao || "Sem descrição"}</p>
                      </div>
                      {confirmarCnae?.id === cnae.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-semibold tracking-[0.08em] text-critical-text uppercase">
                            Remover?
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={ocupado}
                            onClick={() => setConfirmarCnae(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            disabled={ocupado}
                            onClick={() => void removerCnae()}
                          >
                            {cnaeRemovendo === cnae.id ? "Removendo..." : "Remover"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={ocupado}
                          onClick={() => {
                            setCnaeErro("");
                            setConfirmarCnae(cnae);
                          }}
                          aria-label={`Remover CNAE ${cnae.codigo}`}
                        >
                          Remover
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Código do CNAE"
                  value={novoCnae.codigo}
                  onChange={event => setNovoCnae({ ...novoCnae, codigo: event.target.value })}
                  onKeyDown={adicionarCnaeComEnter}
                  error={cnaeFields.codigo?.[0]}
                  placeholder="0000-0/00"
                  maxLength={10}
                  required
                  disabled={ocupado || cnaesLoading}
                />
                <Input
                  label="Descrição (opcional)"
                  value={novoCnae.descricao}
                  onChange={event => setNovoCnae({ ...novoCnae, descricao: event.target.value })}
                  onKeyDown={adicionarCnaeComEnter}
                  error={cnaeFields.descricao?.[0]}
                  placeholder="Descrição da atividade secundária"
                  maxLength={255}
                  disabled={ocupado || cnaesLoading}
                />
              </div>
              {cnaeErro && (
                <p role="alert" className="text-[11px] text-critical-text">{cnaeErro}</p>
              )}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={ocupado || cnaesLoading}
                  onClick={() => void adicionarCnae()}
                >
                  {cnaeSalvando ? "Adicionando..." : "Adicionar CNAE"}
                </Button>
              </div>
            </section>
          ) : (
            <p className="rounded-lg border border-dashed border-line px-3 py-2.5 text-[11px] text-muted">
              Os CNAEs secundários podem ser adicionados depois de salvar a empresa.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" disabled={ocupado} onClick={() => setModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={ocupado}>
              {salvando ? "Salvando..." : "Salvar empresa"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={exclusao !== null}
        onClose={() => {
          if (!salvando) setExclusao(null);
        }}
        title="Excluir empresa"
      >
        <p className="text-sm">
          A empresa {exclusao?.nome} (ID {exclusao?.id}), seus dados operacionais e seus CNAEs secundários serão
          excluídos permanentemente. Esta operação não pode ser desfeita. As contas globais de usuários e os arquivos
          externos serão mantidos.
        </p>
        <div className="mt-4">
          <Input
            label={`Digite ${FRASE_EXCLUSAO_EMPRESA} para confirmar`}
            value={confirmacao}
            onChange={event => setConfirmacao(event.target.value)}
            disabled={salvando}
            autoComplete="off"
          />
        </div>
        {formErro && <p role="alert" className="mt-3 text-sm text-critical-text">{formErro}</p>}
        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="secondary" disabled={salvando} onClick={() => setExclusao(null)}>
            Voltar
          </Button>
          <Button
            disabled={salvando || confirmacao !== FRASE_EXCLUSAO_EMPRESA}
            onClick={() => void excluir()}
          >
            {salvando ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
