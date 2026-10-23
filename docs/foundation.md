# Fundação de UI e serviços

O dashboard conserva Geist e Geist Mono (next/font), as escalas brand/cream e os status originais. `app/globals.css` registra tokens CSS; `tailwind.config.ts`, carregado via `@config` do Tailwind 4, os expõe como utilitários. Raios: 4, 6, 8, 12px e pill; sombras: card, button e logo. Escala tipográfica original: 8.5–28px, pesos 400/500/600/700. `/design-system` é uma rota temporária de demonstração, sem dados reais.

Componentes em `src/components/ui` aceitam conteúdo e classes. DataTable faz ordenação e paginação locais: não passar somente uma página de um resultado paginado no servidor. Use `sortValue` para ordenar números/datas pelos valores originais. Dialog/Sheet usam dialog modal nativo (foco contido, Escape, retorno de foco); Tabs e DropdownMenu oferecem navegação por teclado.

## API e contratos provisórios

Não existe `docs/api`. Todos os schemas, endpoints REST e envelopes são **PROVISORIO**: listas retornam arrays JSON e consultas por ID retornam um objeto. Cada serviço oferece `list()` e `get(id)`; não foram inventadas operações de escrita. Avaliações usam matriz 1–5 × 1–5 (score 1–25); o score ilustrativo 0–10 do dashboard antigo permanece separado até definição do backend.

Copie `.env.example` para `.env.local`. `API_MODE=mock` usa dados fictícios relacionados, com 200–500ms por consulta; `API_MODE=http` exige `API_BASE_URL`. Os serviços e o cliente só podem ser importados no servidor. Importações de tipos e schemas são independentes. O dashboard estático mantém seus dados ilustrativos; os serviços formam a base para as próximas telas.

```ts
import { perigoService } from '@/src/services/perigo';
const perigos = await perigoService.list();
// Em mock, provoca falha determinística por chamada:
await perigoService.list({ forceError: 422 });
```

`MOCK_API_ERROR=all` ou `perigo` força status 500; vazio desativa. Também podem ser simulados 401/403/404/422 via `forceError`. Todos produzem ApiError com status, message e fields. Mocks devolvem cópias independentes. O resumo corresponde aos quatro setores/perigos e quatro ações (três abertas, uma concluída).

`src/lib/api/context.ts` concentra **todas** as suposições de autenticação e empresa ativa: por enquanto não há sessão nem empresa automática. Substituir `getApiContext()` por resolução por requisição; nunca usar variável global de usuário/empresa. O cabeçalho X-Empresa-Id e Bearer são provisórios. 401/403 geram erros centralizados, sem assumir rota de login. Fetch não usa cache compartilhado, não segue redirecionamentos e tem timeout de 15s por padrão.

`permissions.ts` centraliza perfis provisórios e nega valores desconhecidos. `can()` controla apresentação; autorização e isolamento de empresas precisam ser validados no backend.
