# Perigos

Tela `/perigos`, no padrão Azul Confiança, com listagem, paginação de 50 registros, filtro por setor_id, cadastro e edição. Usa GET/POST `/perigos` e GET/PATCH `/perigos/{id}` via rotas de servidor autenticadas. Não envia ativo, categoria, norma ou nível: esses campos não pertencem ao Swagger fornecido. Sem exclusão.

Formulário: setor_id (inteiro positivo), descricao (texto não vazio), fonte e consequencias (texto). Fonte e consequências aceitam vazio pois o trecho recebido não informa campos obrigatórios. O ID do setor é obtido na tela Setores. Campos longos usam o Textarea compartilhado. Edição consulta o detalhe antes de abrir; salvar envia apenas os quatro campos documentados. PATCH aceita alterações parciais não vazias.

O Swagger não especifica o envelope de resposta. `src/lib/perigos/schema.ts` concentra a adaptação: lista direta ou em data/dados/items/itens/perigos/results; detalhe direto ou em data/dados/perigo. Espera id, setor_id, descricao, fonte e consequencias (os dois últimos também aceitam null na leitura). Campos extras são ignorados. Validar esse formato com uma resposta real do backend. Sem total documentado, Próxima é habilitada quando a página tem 50 registros e pode levar a uma página vazia.

Erros de validação e da API são exibidos, incluindo acesso negado, sessão expirada, referência inválida e registro duplicado. A API permanece responsável por autorização. A tela usa a integração real; os serviços mock legados de perigo permanecem independentes.
