# Setores

Tela `/setores`, padrão Azul Confiança, acessível no menu e protegida pela sessão existente. Integração por rotas de servidor `/api/setores` e `/api/setores/{id}` com o mesmo encaminhamento autenticado de Empresas e Unidades.

Contrato fornecido: GET com limit=50, offset=0, unidade_id e ativo opcionais; POST com unidade_id (inteiro positivo), nome (não vazio), ativo (booleano); GET por ID antes de editar; PATCH parcial com pelo menos um campo. Não há operação de exclusão no Swagger.

O formulário recebe o ID da unidade exibido em Unidades. Usa validação no navegador e no servidor, bloqueio durante salvamento, erros de campo, confirmação de sucesso e recarga da listagem. Filtros e paginação cancelam leituras anteriores. Erros 400, 401, 403, 404 e 409 são encaminhados pela camada autenticada; permissões finais pertencem à API.

O Swagger não especifica o envelope de resposta. O adaptador em `src/lib/setores/schema.ts` espera registros com id, unidade_id, nome e ativo, em lista direta ou data/dados/items/itens/setores/results. Detalhes aceitam objeto direto ou data/dados/setor. Campos extras são ignorados. Contratos incompatíveis exibem erro sem preencher a edição. Sem total documentado, Próxima fica habilitada ao receber 50 registros e pode chegar a uma página vazia.

O serviço mock legado de setor é independente desta tela integrada ao backend real. Validar os envelopes contra uma resposta real da API antes de considerar a integração homologada.
