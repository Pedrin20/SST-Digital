# Avaliações de risco

Tela `/avaliacoes-risco` com listagem, filtro perigo_id, paginação de 50 registros, cadastro e detalhes somente leitura. Rotas autenticadas de servidor usam GET/POST `/avaliacoes-risco` e GET `/avaliacoes-risco/{id}`. O Swagger recebido não fornece PATCH nem DELETE; não há edição ou exclusão.

Payload: perigo_id inteiro positivo; probabilidade e severidade números finitos; classificacao e metodo_versao textos. Campos numéricos aceitam ponto ou vírgula decimal no formulário e enviam números JSON. Vazio é inválido, não é convertido em zero. O exemplo 999999.9999 não é tratado como limite, nem se presume escala 1–5, percentual, fórmula, score ou enum de classificação. Classificação e método aceitam texto vazio porque o trecho do Swagger não lista obrigatoriedade; confirmar regras com backend.

O formato das respostas não foi descrito. O adaptador em src/lib/avaliacoes-risco/schema.ts aceita lista direta ou data/dados/items/itens/avaliacoes/avaliacoes_risco/results e detalhe direto ou data/dados/avaliacao. Espera id, perigo_id e os cinco campos do contrato (perigo_id incluso); decimais podem chegar como números ou strings decimais com ponto. Campos extras são ignorados. Respostas incompatíveis geram erro visível. Homologar os envelopes na API real. Sem total documentado, uma página com 50 registros habilita Próxima, que pode levar a uma página vazia.

O serviço mock legado usa outro modelo e permanece independente desta tela real. Não reutilizar sua escala presumida para este contrato.
