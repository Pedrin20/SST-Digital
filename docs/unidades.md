# Unidades

A tela `/unidades` usa as rotas autenticadas `/api/unidades` e `/api/unidades/{id}`. A listagem aceita `limit`, `offset`, `empresa_id` e `ativo`; o cadastro e a edição enviam os campos do contrato, incluindo endereço detalhado, contato, CNPJ do estabelecimento, quantidade e data de atualização de empregados, CNAE e grau de risco. Os novos campos são opcionais; valores vazios são enviados como nulos. A quantidade deve ser um inteiro não negativo e o grau de risco, de 1 a 4.

A consulta por ID preenche os campos para edição. O adaptador aceita a lista direta ou os envelopes usados nas demais telas e normaliza o estado ativo retornado como booleano ou 0/1. A paginação usa 50 itens por página.

A ação Desativar utiliza DELETE e preserva histórico e relações, conforme o contrato. A API determina as permissões e informa eventuais impedimentos. Os formulários se adaptam à largura disponível e o diálogo permite rolagem em telas pequenas.
