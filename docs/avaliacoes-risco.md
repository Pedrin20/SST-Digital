# Avaliações de risco

O cadastro envia apenas `perigo_id`, `probabilidade` e `severidade`. Os dois valores da matriz são inteiros de 1 a 5. A API calcula a pontuação e determina o nível conforme as faixas da empresa.

A lista e os detalhes exibem `pontuacao_risco`, `nivel_risco` e o `tipo_risco` do perigo. Os quatro níveis são Baixo, Médio, Alto e Muito alto. O tipo aparece como “Não informado” para perigos antigos sem tipo cadastrado.

O filtro por perigo é encaminhado à API. Os filtros de nível e tipo percorrem os resultados paginados para compor páginas de até 50 avaliações correspondentes.
