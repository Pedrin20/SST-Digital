# SST Digital | Controle de EPI

Guia de integração para desenvolvimento e QA. Migrações do back-end: `007`, `008` e `009`. No Swagger da API (`/api/docs`), procure **Controle de EPI**.

O catálogo de equipamentos de proteção individual (EPIs) pertence à empresa. O saldo de cada EPI é apurado por unidade. Quem registra a movimentação é o usuário autenticado. Quem recebe o EPI é um trabalhador identificado por matrícula, que pode receber e assinar mesmo sem login. O módulo tem cadastro próprio, independente do inventário de Equipamentos.

## Acesso

Obtenha o token em `POST /api/v1/auth/login` com `email` e `senha`. Envie `Authorization: Bearer <token>` nas requisições e `Content-Type: application/json` quando houver corpo. O token de login tem validade de oito horas.

Use o prefixo **`/api/v1/empresas/{empresaId}/epi`** em todos os caminhos abaixo. Usuários vinculados à empresa ativa podem consultar os dados. Para gravar, o vínculo precisa ter perfil `ADMIN` ou `GESTOR`. O administrador do sistema também tem acesso.

## Rotas

| Método e caminho após o prefixo | O que faz | Resposta de sucesso |
|---|---|---|
| `GET /catalogo` | Lista os EPIs da empresa, ordenados por nome. | 200, lista com `id`, `nome`, `ca` |
| `POST /catalogo` | Cria um EPI com nome e número do Certificado de Aprovação (CA). | 201, cadastro criado |
| `PUT /catalogo/{id}` | Substitui o nome e o CA. Ambos são obrigatórios. | 200, cadastro atualizado |
| `PATCH /catalogo/{id}` | Altera nome, CA ou ambos. Exige ao menos um campo. | 200, cadastro atualizado |
| `DELETE /catalogo/{id}` | Exclui um EPI sem saldo positivo e sem movimentações. | 200, por exemplo `{"id":12,"excluido":true}` |
| `DELETE /catalogo/{id}/definitivo` | Apaga o cadastro e os saldos de todas as unidades, mesmo com movimentações. Preserva fichas, nomes, CAs e comprovantes anteriores. | 200, por exemplo `{"id":12,"excluido":true}` |
| `GET /trabalhadores` | Lista os trabalhadores da empresa por nome. | 200, lista com `id`, `nome`, `matricula` |
| `POST /trabalhadores` | Cadastra um trabalhador com nome e matrícula. | 201, cadastro criado |
| `GET /estoque` | Consulta os saldos registrados por unidade e EPI. | 200, lista com `unidade_id`, `epi_id`, `nome`, `ca`, `saldo` |
| `POST /movimentos` | Registra entrada, entrega, devolução ou troca. | 201, `{"id":101}`; 200 ao repetir a mesma operação |
| `GET /movimentos` | Consulta o histórico da empresa, com filtros e paginação. | 200, lista do mais recente ao mais antigo |
| `GET /trabalhadores/{id}/ficha` | Consulta o histórico individual, com período e paginação. | 200, lista de movimentações do trabalhador |
| `GET /movimentos/{id}/comprovante` | Recupera os dados da entrega ou troca e os traços da assinatura. | 200, objeto JSON |

### Regras de cadastro

Envie `nome` (até 150 caracteres), `ca` (texto de até 30) e `matricula` (texto de até 50) nos respectivos cadastros. Os campos obrigatórios precisam ter conteúdo. Por empresa, a combinação nome + CA do EPI e a matrícula do trabalhador são únicas.

Exemplo de criação ou substituição de um EPI: `{"nome":"Luva de proteção","ca":"12345"}`. Para corrigir apenas o nome, envie `{"nome":"Luva de proteção térmica"}` por PATCH. As fichas e os comprovantes anteriores preservam o nome e o CA da época da movimentação. O DELETE comum retorna 409 se houver qualquer movimento anterior, mesmo com saldo zero. Use o caminho `/definitivo` para apagar o cadastro nessa situação. Os saldos deixam de aparecer na consulta de estoque. O ID excluído continua disponível nas consultas históricas e deixa de ser aceito como EPI de uma nova movimentação.

## Como registrar as movimentações

Em `POST /movimentos`, sempre envie `tipo`, `chave` (UUID), `unidade_id`, `epi_id` e `quantidade` (inteiro positivo). Envie somente os campos previstos para o tipo escolhido.

| Tipo | Campos adicionais obrigatórios | Efeito |
|---|---|---|
| `entrada` | Nenhum | Soma a quantidade ao saldo da unidade. |
| `entrega` | `trabalhador_id`, `assinatura` | Baixa a quantidade do estoque e registra o recebimento. |
| `devolucao` | `trabalhador_id`, `origem_id`, `destino` | Recolhe o EPI da entrega ou troca de origem. O destino `estoque` repõe o saldo. O destino `descarte` apenas registra o recolhimento. |
| `troca` | `trabalhador_id`, `origem_id`, `destino`, `assinatura` | O campo `epi_id` identifica o EPI novo. A origem identifica o antigo. O sistema baixa o novo antes de repor ou descartar o recolhido. |

Empresa, unidade e trabalhador devem corresponder à operação de origem. Na devolução, o EPI também deve ser o mesmo. É possível devolver parte de uma entrega: o total devolvido ou trocado nunca pode ultrapassar o que o trabalhador ainda tem daquela origem. A movimentação e o saldo são gravados juntos.

### Exemplo de ponta a ponta

Os IDs, CAs e traços abaixo são fictícios. Considere o EPI `12`, o trabalhador `7` e a unidade `3` da mesma empresa.

1. **Receber dez unidades no estoque.** Envie a `POST /movimentos`:

   ```json
   {"tipo":"entrada","chave":"d61b02da-0013-40cf-bbc4-cf4d73144916","unidade_id":3,"epi_id":12,"quantidade":10}
   ```

2. **Entregar duas unidades e colher a assinatura.** Envie a `POST /movimentos`:

   ```json
   {"tipo":"entrega","chave":"acf42e7a-f837-432f-be97-ef508711dc39","unidade_id":3,"epi_id":12,"quantidade":2,"trabalhador_id":7,"assinatura":[[[0.1,0.2],[0.5,0.7],[0.8,0.3]]]}
   ```

   O saldo passa a **8**. Guarde o ID retornado: se a resposta for `{"id":101}`, esse é o ID do movimento para consultar o comprovante e referenciar uma devolução ou troca.

3. **Devolver uma unidade ao estoque.** Envie a `POST /movimentos`:

   ```json
   {"tipo":"devolucao","chave":"602ba671-f9df-4385-8d08-2f662eefc448","unidade_id":3,"epi_id":12,"quantidade":1,"trabalhador_id":7,"origem_id":101,"destino":"estoque"}
   ```

   O saldo passa a **9** e resta uma unidade daquela entrega com o trabalhador.

4. **Conferir o recebimento.** Use `GET /trabalhadores/7/ficha` para consultar o histórico e `GET /movimentos/101/comprovante` para obter a assinatura da entrega. A ficha informa `possui_assinatura` em cada registro.

**Reenvio após falha de conexão:** gere uma chave nova por operação e mantenha-a até receber a resposta. Se o mesmo operador reenviar a mesma chave e os mesmos dados, a API retorna o ID original sem alterar novamente o saldo. Reutilizar a chave com outros dados ou outro operador retorna 409.

**Formato da assinatura:** envie de 1 a 32 traços, cada um com 2 a 256 pontos `[x,y]`. As duas coordenadas vão de 0 a 1 em relação à área de assinatura. Pelo menos um traço deve ter deslocamento. O comprovante retorna esses traços em JSON. A versão descrita usa assinatura eletrônica desenhada e não implementa biometria facial.

## Ficha e relatório por trabalhador

Para consultar novembro inteiro, por exemplo, use:

```http
GET /api/v1/empresas/1/epi/trabalhadores/7/ficha?inicio=2026-11-01&fim=2026-11-30&limit=100&offset=0
```

`inicio` e `fim` aceitam datas `AAAA-MM-DD` e incluem os dois dias. A página padrão traz até 100 registros, e o limite máximo é 200. Avance `offset` pelo número de registros recebidos para buscar a próxima página. Em `GET /movimentos`, use também `trabalhador_id` para filtrar a empresa por pessoa.

Para montar um relatório dos EPIs **recebidos**, selecione os tipos `entrega` e `troca` no resultado. A ficha completa também inclui as devoluções. Cada linha traz data, unidade, EPI, CA, quantidade, operador e indicação de assinatura. O comprovante individual acrescenta matrícula e traços da assinatura. As consultas retornam JSON.

## Respostas de erro

| HTTP | Quando ocorre | Como tratar |
|---|---|---|
| 400 | Campo inválido, PATCH vazio, assinatura inválida ou período invertido. | Confira `erro` e, quando presente, `detalhes`. Corrija a requisição. |
| 401 | Token ausente, inválido ou expirado. | Faça login novamente. |
| 404 | Registro inexistente ou fora da permissão do usuário, ou movimento sem comprovante. | Confira empresa, perfil, ID e se o movimento tem assinatura. |
| 409 | Cadastro duplicado, saldo insuficiente, devolução acima do permitido, chave reutilizada indevidamente ou exclusão de EPI em uso. | Exiba a mensagem `erro` e consulte o cadastro, saldo ou movimento de origem. |
