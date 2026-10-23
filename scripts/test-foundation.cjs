/* eslint-disable @typescript-eslint/no-require-imports -- Runner CommonJS para transpilar os módulos TS no Node 22 sem dependência extra. */
// Executar: node --conditions=react-server scripts/test-foundation.cjs
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) { return resolve.call(this, id.startsWith('@/') ? path.join(root, id.slice(2)) : id, ...args); };
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
const { z } = require('zod');
const { apiFetch, ApiError } = require('../src/lib/api/client.ts');
const { can } = require('../src/lib/permissions.ts');
async function main() {
  process.env.API_MODE = 'mock'; delete process.env.MOCK_API_ERROR;
  const names = ['empresa','unidade','setor','perigo','avaliacaoRisco','acao','equipamento','documento','usuario','usuarioEmpresa','auditoria','dashboardResumo'];
  const services = Object.fromEntries(names.map(name => [name, require(`../src/services/${name}/index.ts`)[`${name}Service`]]));
  const rows = Object.fromEntries(await Promise.all(names.map(async name => [name, await services[name].list()])));
  const relates = (from, field, to) => rows[from].forEach(row => assert.ok(rows[to].some(target => target.id === row[field]), `${from}.${field} inválido`));
  relates('unidade','empresaId','empresa'); relates('setor','unidadeId','unidade'); relates('perigo','setorId','setor'); relates('acao','perigoId','perigo'); relates('acao','responsavelId','usuario'); relates('avaliacaoRisco','perigoId','perigo'); relates('avaliacaoRisco','avaliadorId','usuario'); relates('equipamento','setorId','setor'); relates('documento','empresaId','empresa'); relates('documento','unidadeId','unidade'); relates('usuarioEmpresa','usuarioId','usuario'); relates('usuarioEmpresa','empresaId','empresa'); relates('auditoria','usuarioId','usuario'); relates('auditoria','empresaId','empresa'); relates('auditoria','recursoId','acao');
  const summary = rows.dashboardResumo[0];
  assert.equal(summary.perigos, rows.perigo.length); assert.equal(summary.setores, rows.setor.length);
  assert.equal(summary.acoesAbertas, rows.acao.filter(row => row.status !== 'concluida').length);
  assert.equal(summary.acoesConcluidas, rows.acao.filter(row => row.status === 'concluida').length);
  rows.avaliacaoRisco.forEach(row => assert.equal(row.score, row.probabilidade * row.severidade));
  const original = rows.empresa[0].nome; rows.empresa[0].nome = 'Alterado';
  assert.equal((await services.empresa.get('emp-1')).nome, original);
  await assert.rejects(services.empresa.get('inexistente'), error => error instanceof ApiError && error.status === 404);
  await Promise.all([401,403,422,500].map(status => assert.rejects(services.perigo.list({ forceError: status }), error => error instanceof ApiError && error.status === status)));
  process.env.MOCK_API_ERROR = 'perigo'; await assert.rejects(services.perigo.list(), error => error.status === 500); delete process.env.MOCK_API_ERROR;
  process.env.API_MODE = 'invalido'; assert.throws(() => services.empresa.list(), /API_MODE/);
  assert.equal(can('administrador','gerenciarUsuarios'), true); assert.equal(can('leitor','gerenciarUsuarios'), false); assert.equal(can('toString','ler'), false); assert.equal(can(undefined,'ler'), false);
  process.env.API_MODE = 'http'; process.env.API_BASE_URL = 'https://api.example.test/api';
  let lastUrl; let lastOptions;
  global.fetch = async (url, options) => { lastUrl = url; lastOptions = options; return Response.json([{ id: 'emp-1', nome: original, cnpj: '12345678000195', ativa: true }]); };
  assert.equal((await services.empresa.list())[0].nome, original); assert.equal(lastUrl, 'https://api.example.test/api/empresas'); assert.equal(lastOptions.cache, 'no-store'); assert.equal(lastOptions.redirect, 'error'); assert.equal(lastOptions.headers.has('Authorization'), false);
  for (const status of [401,403,422,500]) {
    global.fetch = async () => Response.json({ mensagem: 'Erro esperado', fields: { nome: 'Obrigatório' } }, { status });
    await assert.rejects(apiFetch('/empresas', z.array(z.unknown())), error => error instanceof ApiError && error.status === status && (status !== 422 || error.fields.nome[0] === 'Obrigatório'));
  }
  global.fetch = async () => Response.json({ inesperado: true });
  await assert.rejects(apiFetch('/empresas', z.array(z.unknown())), /contrato/);
  global.fetch = async () => new Response('HTML indisponível', { status: 502 });
  await assert.rejects(apiFetch('/empresas', z.unknown()), error => error.status === 502);
  global.fetch = async () => { throw new TypeError('network'); };
  await assert.rejects(apiFetch('/empresas', z.unknown()), error => error.status === 0);
  console.log('OK: 12 contratos, relações, resumo, isolamento dos mocks, permissões, troca de modo e erros HTTP.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
