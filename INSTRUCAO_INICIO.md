# INSTRUÇÃO — Projeto Iniciado: Product Admin Dashboard

**Status: PROJETO INICIADO**
**Data: 23/09/2026**
**Teste de empresa — Frontend Assignment (2 dias)**

Este arquivo registra formalmente que iniciamos o projeto. Toda implementação seguinte deve respeitar 100% das regras do PDF [PDF 1].

---

## 1. O que foi analisado no PDF

Stack obrigatória: **Next.js • React • Tailwind CSS • Axios**. API: **https://dummyjson.com**. Todas as chamadas via Axios, sem exceção.

### O que temos que construir (escopo fechado — tudo é viável)
1. **Login:** `POST /auth/login` com `emilys / emilyspass`. Erro visível para credencial errada. Rotas `/products*` protegidas. Botão logout.
2. **Lista de produtos:** image, title, category, price, rating, stock. Tabela no desktop, cards no mobile.
3. **Paginação server-side:** `limit` + `skip`. Números de página + Previous/Next + page size (10, 20, 50) + texto `Showing 21–40 of 194`.
4. **Busca:** `/products/search?q=`. Com debounce (só chama após parar de digitar). Volta para página 1 ao mudar busca.
5. **Filtro e ordenação:** filtro por categoria (`/products/categories`) + sort por price, rating ou title.
6. **Detalhes:** rota `/products/[id]` com imagens, description, price, reviews. Página `not-found` para id inválido.
7. **Add / Edit / Delete:** formulário com validação + popup de confirmação antes de deletar.
8. **Estados:** loader, empty (nada encontrado), erro com botão Retry.

### Regras inegociáveis (não quebrar em hipótese alguma)
- [ ] **R1 — Axios único:** um único arquivo `apiClient.ts` com interceptor que injeta o token em toda request e trata erro centralizado.
- [ ] **R2 — URL como fonte da verdade:** page, search, filter, sort ficam na URL. Refresh ou share link mostra mesmo resultado.
- [ ] **R3 — Sem atalhos:** proibido React Query, SWR, lib pronta de tabela/paginação. Lógica na mão.
- [ ] **R4 — Separação:** componentes pequenos + chamadas API em arquivos separados, nunca dentro do JSX.

### Pontos delicados (onde a empresa vai testar de verdade)
- [ ] **C1 — Race condition:** digitação rápida não pode deixar resultado velho sobrescrever o novo. Validar com `&delay=2000`. Solução: `AbortController` + requestId, só última resposta vale.
- [ ] **C2 — Search x Categoria:** a API não faz os dois juntos. Decisão adotada: **busca tem prioridade; ao buscar, o filtro de categoria é ignorado/limpo na UI com aviso explicativo**. Motivo: manter paginação server-side correta. Alternativa client-side quebraria `limit/skip/total`. Documentar no README + hint na UI.
- [ ] **C3 — CRUD fake:** API não persiste add/edit/delete. Abordagem: **overlay local** (Context + `addedProducts`, `editedMap`, `deletedIds`) mesclado à resposta da API + explicação no README. UI reflete a mudança mesmo após refetch.
- [ ] **C4 — URL inválida:** `?page=abc` ou `?page=999` não pode quebrar. Solução: sanitizar, fallback para defaults, clampar `1..totalPages`.
- [ ] **C5 — Duplo clique:** Save/Login clicado várias vezes não pode disparar N requests. Solução: flag `isSubmitting`, botão disabled, early-return + `loading` no Axios.

### Sobre IA + entrega
- Pode usar IA, mas **precisamos entender e explicar cada linha** — haverá walkthrough + mudança ao vivo.
- Entrega: repo público GitHub com **commits regulares** (nada de 1 commit gigante) + link live Vercel/Netlify + README com setup e checklist do que foi feito + nota curta (escolhas, 1 problema + solução, onde IA ajudou).

---

## 2. Verificação técnica — o que podemos fazer

Ambiente verificado em 23/09/2026:
- Node v24.16.0, npm 11.17.0, git 2.49.0 — OK para Next.js atual.
- Pasta `E:\PROJETOS\Frontend_Assignment` vazia — pronta para `create-next-app`.

Tudo do PDF é executável. Nenhum bloqueador.

---

## 3. Instrução de início (vale como ordem de execução)

> **INICIAMOS O PROJETO PRODUCT ADMIN DASHBOARD NESTA DATA.**
> A partir daqui, todo código deve seguir as regras R1–R4 e cuidados C1–C5 acima. Nenhuma lib proibida. Nenhuma chamada fora do Axios compartilhado. Nenhum estado de URL fora da URL. Antes de cada commit, revisar se alguma regra foi violada.

Arquitetura inicial obrigatória:
```
src/
  lib/apiClient.ts        # R1 — única instância Axios + token + erro central
  lib/authApi.ts          # POST /auth/login, /auth/me
  lib/productsApi.ts      # list, search, byCategory, byId, add, update, delete
  lib/categoriesApi.ts    # /products/categories
  lib/productStore.tsx    # C3 — overlay local (added/edited/deleted)
  components/             # pequenos: ProductTable, ProductCards, Pagination, SearchInput, CategoryFilter, SortSelect, ProductForm, ConfirmDialog, Loader, EmptyState, ErrorState
  hooks/useDebounce.ts    # busca com debounce
  hooks/useProducts.ts    # paginação/sort manual, com AbortController (C1) + guard isLoading (C5)
  app/(auth)/login/page.tsx
  app/products/page.tsx   # lê URL, valida C4
  app/products/[id]/page.tsx + not-found.tsx
```

Próximos passos (ordem):
1. `npx create-next-app` + Tailwind + Axios + ESLint.
2. `apiClient.ts` + auth + guarda de rota + login/logout.
3. Lista + paginação + URL sync + estados loading/empty/error.
4. Busca com debounce + race-safe + filtro/sort + decisão C2 documentada.
5. Detalhes + not-found.
6. Form add/edit com validação + delete com confirm + overlay C3 + anti-duplo-submit C5.
7. README + nota de escolhas + commits regulares + deploy Vercel.

Ordem de commit sugerida (para provar regularidade): setup → axios+auth → list+pagination → search → filter/sort → details → CRUD → polish/README.

---

**Assinatura desta instrução:** Projeto iniciado e regras aceitas. Próximo comando deve criar o scaffold Next.js respeitando este documento.
