/* eslint-disable @typescript-eslint/no-require-imports -- Runner CommonJS para telas TypeScript. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith("@/") ? path.resolve(__dirname, "..", name.slice(2)) : name, ...args);
};
for (const ext of [".ts", ".tsx"]) {
  require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
}

const casos = [
  ["acoes/acoes", "Acoes", "Status", [["", "PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"], ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"]]],
  ["equipamentos/equipamentos", "Equipamentos", "Status", [["", "ATIVO", "EM_MANUTENCAO", "INATIVO"], ["ATIVO", "EM_MANUTENCAO", "INATIVO"]]],
  ["usuarios-empresas/vinculos", "Vinculos", "Perfil", [["ADMIN", "GESTOR", "LEITOR"]]],
  ["usuarios/usuarios", "Usuarios", "Tipo profissional", [["", "TECNICO_SST", "ENGENHEIRO_SST", "RH"]]],
];
for (const [arquivo, nome, label, valores] of casos) {
  test(`${nome} oferece as opções da API para ${label}`, () => {
    const tela = require(`../app/${arquivo}.tsx`)[nome];
    const html = renderToStaticMarkup(React.createElement(tela));
    const seletores = [...html.matchAll(new RegExp(`>${label}(?: \\*)?</label><select[^>]*>(.*?)</select>`, "gs"))];
    assert.deepEqual(seletores.map(([, options]) => [...options.matchAll(/<option[^>]* value="([^"]*)"/g)].map(match => match[1])), valores);
  });
}

const { carregarOpcoes, SeletorRelacionamento } = require("../src/components/seletor-relacionamento.tsx");

test("perigos de páginas seguintes aparecem com ID e descrição", async t => {
  const paginas = [
    Array.from({ length: 50 }, (_, i) => ({ id: i + 1, descricao: "Ruído" })),
    [{ id: "51", descricao: "Queda de altura" }],
  ];
  const chamadas = [];
  t.mock.method(global, "fetch", async url => {
    chamadas.push(url);
    return Response.json({ perigos: paginas.shift() });
  });
  const lista = await carregarOpcoes("perigos", new AbortController().signal);
  assert.deepEqual(chamadas, ["/api/perigos?limit=50&offset=0", "/api/perigos?limit=50&offset=50"]);
  const html = renderToStaticMarkup(React.createElement(SeletorRelacionamento, {
    label: "Perigo", fonte: { lista }, value: "51", onChange() {},
  }));
  assert.match(html, /<option value="51" selected="">51 — Queda de altura<\/option>/);
});

test("edição preserva o ID atual quando o cadastro relacionado não está na lista", () => {
  const html = renderToStaticMarkup(React.createElement(SeletorRelacionamento, {
    label: "Setor", fonte: { lista: { opcoes: [{ id: "1", nome: "Produção" }] } },
    value: "7", onChange() {},
  }));
  assert.match(html, /<option value="7" selected="">ID 7 \(vínculo atual\)<\/option>/);
  assert.match(html, /<option value="1">1 — Produção<\/option>/);
});

test("avaliação oferece nível e tipo somente nos filtros", () => {
  const { Avaliacoes } = require("../app/avaliacoes-risco/avaliacoes.tsx");
  const html = renderToStaticMarkup(React.createElement(Avaliacoes));
  for (const [rotulo, valores] of [
    ["Pontuação / Nível", ["BAIXO", "MEDIO", "ALTO", "MUITO_ALTO"]],
    ["Tipo de risco", ["FISICO", "QUIMICO", "BIOLOGICO", "ERGONOMICO", "ACIDENTE"]],
  ]) {
    const selects = [...html.matchAll(new RegExp(`>${rotulo}</label><select[^>]*>(.*?)</select>`, "gs"))];
    assert.equal(selects.length, 1);
    for (const [, options] of selects) {
      assert.deepEqual([...options.matchAll(/value="([^"]+)"/g)].map(m => m[1]), valores);
    }
  }
});

test("filtros combinados distinguem Alto e Muito alto entre páginas", async () => {
  const { paginaDeAvaliacoes } = require("../src/lib/avaliacoes-risco/risco.ts");
  const registro = { tipo_risco: "QUIMICO", nivel_risco: "MUITO_ALTO" };
  const rows = await paginaDeAvaliacoes(0, { nivel: "MUITO_ALTO", tipo: "QUIMICO" }, async inicio =>
    inicio === 0 ? Array(50).fill({ tipo_risco: "QUIMICO", nivel_risco: "ALTO" }) : [
      { tipo_risco: null, nivel_risco: "MUITO_ALTO" }, registro,
    ]);
  assert.deepEqual(rows, [registro]);
});

test("cadastro aceita somente o perigo e dois inteiros da matriz", () => {
  const { avaliacaoPayload, lerDetalhe } = require("../src/lib/avaliacoes-risco/schema.ts");
  const payload = { perigo_id: 42, probabilidade: 5, severidade: 4 };
  assert.deepEqual(avaliacaoPayload.parse(payload), payload);
  for (const valor of [0, 6, 1.5, "5"]) {
    for (const campo of ["probabilidade", "severidade"]) {
      assert.equal(avaliacaoPayload.safeParse({ ...payload, [campo]: valor }).success, false);
    }
  }
  assert.equal(avaliacaoPayload.safeParse({ ...payload, nivel_risco: "ALTO" }).success, false);
  const resposta = { ...payload, id: 1, pontuacao_risco: 20, nivel_risco: "MUITO_ALTO", tipo_risco: null };
  assert.deepEqual(lerDetalhe({ data: resposta }), resposta);
});

test("lista mista preserva avaliações com texto histórico no nível", () => {
  const { lerLista, lerDetalhe } = require("../src/lib/avaliacoes-risco/schema.ts");
  const { ClassificacaoRisco } = require("../src/components/classificacao-risco.tsx");
  const resposta = [
    { id: 180002, perigo_id: 120002, probabilidade: 4, severidade: 5, tipo_risco: "FISICO", pontuacao_risco: 20, nivel_risco: "MUITO_ALTO" },
    { id: 90001, perigo_id: 60001, probabilidade: 2, severidade: 4, tipo_risco: null, pontuacao_risco: 8, nivel_risco: "Químico" },
    { id: 1, perigo_id: 1, probabilidade: 2, severidade: 3, tipo_risco: null, pontuacao_risco: 6, nivel_risco: "Exemplo didático" },
  ];
  const lista = lerLista(resposta);
  assert.deepEqual(lista, resposta);
  assert.deepEqual(lerDetalhe(resposta[1]), resposta[1]);
  const rotulos = lista.map(avaliacao => renderToStaticMarkup(React.createElement(ClassificacaoRisco, { avaliacao })));
  assert.match(rotulos[0], /Muito alto/);
  assert.match(rotulos[1], /Nível legado.*Químico/);
  assert.match(rotulos[2], /Nível legado.*Exemplo didático/);
});

test("perigo antigo aceita tipo nulo na leitura e permite definir o tipo na edição", () => {
  const { perigoPayload, perigoPatch, lerDetalhe } = require("../src/lib/perigos/schema.ts");
  const perigo = { setor_id: 1, descricao: "Ruído", fonte: "", consequencias: "", tipo_risco: null };
  assert.equal(lerDetalhe({ id: 42, ...perigo }).tipo_risco, null);
  assert.equal(perigoPayload.safeParse(perigo).success, false);
  assert.equal(perigoPayload.safeParse({ ...perigo, tipo_risco: "FISICO" }).success, true);
  assert.deepEqual(perigoPatch.parse({ tipo_risco: "FISICO" }), { tipo_risco: "FISICO" });
});

test("quadro resolve nomes, ordena o prazo e só alerta em ações abertas", () => {
  const { Visoes } = require("../app/acoes/visoes.tsx");
  const item = { id: 1, perigo_id: 42, responsavel_id: 7, perigo_nome: "Incêndio", responsavel_nome: "Carlos Silva", prioridade: "P1", status: "PENDENTE", descricao: "Sinalizar corredor", prazo: "2026-11-20" };
  const html = renderToStaticMarkup(React.createElement(Visoes, {
    rows: [item, { ...item, id: 2, descricao: "Reparar alarme", prazo: "2026-11-11" },
      { ...item, id: 3, status: "CONCLUIDA", prazo: "2026-11-01", concluida_em: "2026-11-02 11:00:00" },
      { ...item, id: 4, status: "CANCELADA", prazo: "2026-11-02" }],
    quadro: true, hoje: Date.UTC(2026,10,13), perigos: new Map(), usuarios: new Map(), opcoes: () => null,
  }));
  for (const texto of ["Incêndio", "Carlos Silva", ">CS<", "Vence em 7 dias", "Venceu há 2 dias", "02/11/2026"]) assert.ok(html.includes(texto), texto);
  assert.equal((html.match(/Venceu há/g) || []).length, 1);
  assert.ok(html.indexOf("Reparar alarme") < html.indexOf("Sinalizar corredor"));
});

test("cancelamento exige justificativa e permite anexar evidência junto com o status", () => {
  const { acaoPatch } = require("../src/lib/acoes/schema.ts");
  for (const motivo of [undefined, "", "   "]) assert.equal(acaoPatch.safeParse({ status: "CANCELADA", motivo_cancelamento: motivo }).success, false);
  const dados = { status: "CANCELADA", motivo_cancelamento: "Medida substituída", evidencia: { tipo: "application/pdf", nome: "laudo.pdf", dados: "JVBERg==" } };
  assert.deepEqual(acaoPatch.parse(dados), dados);
});
