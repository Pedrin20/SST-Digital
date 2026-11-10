/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { unidadesHref, setoresHref, lerContexto, buscarPagina } = require("../src/lib/estrutura.ts");
const empresa = { id: 7, nome: "Alfa & Cia" }, unidade = { id: 23, nome: "Fábrica A" };
const params = href => Object.fromEntries(new URL(href, "http://localhost").searchParams);
assert.deepEqual(lerContexto(params(unidadesHref(empresa)), "empresa"), empresa);
assert.deepEqual(lerContexto(params(setoresHref(unidade, empresa)), "unidade"), unidade);
assert.equal(lerContexto({ empresa_id: "-1" }, "empresa"), undefined);
(async () => {
  const chamadas = [];
  const itens = await buscarPagina("fabrica", 0, async offset => {
    chamadas.push(offset);
    return offset === 0 ? Array.from({length: 50}, () => ({nome: "Matriz"})) : [unidade];
  });
  assert.deepEqual(itens, [unidade]);
  assert.deepEqual(chamadas, [0, 50]);
  console.log("OK: contexto da estrutura e busca entre páginas.");
})().catch(error => { console.error(error); process.exitCode = 1; });
