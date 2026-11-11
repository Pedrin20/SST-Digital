# Avaliações de risco

A tela usa GET e POST em `/api/avaliacoes-risco` e GET em `/api/avaliacoes-risco/{id}`. A lista aceita filtro por ID do perigo e paginação de 50 registros.

O cadastro solicita `perigo_id` (inteiro positivo), `probabilidade` e `severidade` (inteiros de 1 a 5). A prévia da pontuação multiplica os dois fatores. Na API com matriz por empresa, o servidor determina a classe e a versão do método.

Quando a API responde 400 indicando que faltam os textos `classificacao` e `metodo_versao`, o formulário mantém os valores e solicita os dois campos. No envio seguinte, o proxy só encaminha esses textos se o backend ainda devolver a mesma recusa de validação ao receber o payload automático.

A lista e os detalhes exibem a pontuação e a classificação retornadas. O dashboard usa o mesmo indicador. As quatro classes da matriz são Baixo (verde), Médio (amarelo), Alto (laranja) e Muito alto (vermelho). As faixas são configuráveis por empresa. Registros históricos conservam a classificação e o método gravados, inclusive texto livre e valores decimais.
