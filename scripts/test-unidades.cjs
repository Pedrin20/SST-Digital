/* eslint-disable @typescript-eslint/no-require-imports -- Runner CommonJS para módulos TypeScript. */
const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { unidadePayload, lerDetalhe } = require('../src/lib/unidades/schema.ts');
const dados = { empresa_id: 1, nome: 'Matriz', endereco: 'Rua A', ativo: true, numero: '12', complemento: null, bairro: 'Centro', cidade: 'Fortaleza', uf: 'CE', cep: '60000-000', telefone: null, cnpj_estabelecimento: null, quantidade_empregados: 0, quantidade_atualizada_em: '2026-11-06', cnae_preponderante: null, grau_risco: 4 };
assert.deepEqual(unidadePayload.parse(dados), dados);
assert.equal(lerDetalhe({ id: 1, ...dados, ativo: 0 }).bairro, 'Centro');
assert.equal(unidadePayload.safeParse({ ...dados, quantidade_empregados: -1 }).success, false);
assert.equal(unidadePayload.safeParse({ ...dados, grau_risco: 5 }).success, false);
console.log('OK: contrato de unidades');

