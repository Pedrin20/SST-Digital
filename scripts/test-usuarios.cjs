const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { usuarioSchema } = require('../app/api/usuarios/schema.ts');
const perfil = { tipo_profissional: 'TECNICO_SST', cpf: '123.456.789-09', telefone: '(85) 99999-0000', data_nascimento: '1990-05-21', registro_profissional: 'CREA-CE 123456', foto_chave: 'foto', documento_profissional_chave: 'documento' };
assert.deepEqual(usuarioSchema.parse({ nome: 'Teste', email: 'teste@example.com', senha: '1234567890', ativo: true, perfil_profissional: perfil }).perfil_profissional, perfil);
console.log('Contrato de perfil profissional preservado.');
