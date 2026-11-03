/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { carregarLista } = require('../app/lib/dashboard-lista.ts');

async function main() {
  const chamada = [];
  const fetcher = async (url) => { chamada.push(url); return Response.json([{ id: 1 }]); };
  const resultado = await carregarLista('/api/acoes', value => value, fetcher);
  assert.deepEqual(resultado, [{ id: 1 }]);
  assert.equal(chamada[0], '/api/acoes?limit=50&offset=0');
  await assert.rejects(carregarLista('/api/acoes', value => value, async () => Response.json({}, { status: 403 })), /403/);
  await assert.rejects(carregarLista('/api/acoes', () => { throw new Error('contrato'); }, fetcher), /contrato/);
  console.log('OK: consulta do dashboard, limite e tratamento de erros.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
