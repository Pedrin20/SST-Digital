# Unidades

Tela `/unidades`, integrada via rotas de servidor `/api/unidades` e `/api/unidades/{id}` ao backend autenticado. Segue o Swagger fornecido: GET com limit (50), offset (0), empresa_id e ativo; POST; GET por ID; PATCH parcial. Não há exclusão no contrato.

Campos enviados: empresa_id (inteiro positivo), nome (não vazio), endereco (texto), ativo (booleano). O endereço aceita vazio, pois a documentação recebida não informa obrigatoriedade. Empresa é informada pelo ID visível em Empresas. Não são inferidos vínculos empresariais da sessão.

O Swagger não descreve o envelope nem os campos da resposta. `src/lib/unidades/schema.ts` concentra o adaptador: lista direta ou em data/dados/items/itens/unidades/results, detalhe direto ou em data/dados/unidade. Espera id, empresa_id, nome, endereco e ativo. Respostas incompatíveis mostram erro, sem preencher formulários com dados inválidos. Paginação usa 50 itens; sem total no contrato, uma página completa habilita Próxima (a seguinte pode estar vazia).

As rotas utilizam o encaminhamento autenticado já usado por Empresas. Erros 400/401/403/404/409 são preservados; permissões são verificadas pela API. Nenhuma alteração é enviada antes de Salvar. O serviço mock legado de unidade ainda é independente desta tela conectada ao contrato real.
