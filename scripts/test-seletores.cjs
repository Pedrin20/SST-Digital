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
    const seletores = [...html.matchAll(new RegExp(`>${label}</label><select[^>]*>(.*?)</select>`, "gs"))];
    assert.deepEqual(seletores.map(([, options]) => [...options.matchAll(/<option[^>]* value="([^"]*)"/g)].map(match => match[1])), valores);
  });
}
