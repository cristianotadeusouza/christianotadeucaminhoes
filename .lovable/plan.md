# Auditoria somente-leitura — Christiano Tadeu | Caminhões Volkswagen

Commit auditado: `95df236 Work in progress`. Nenhum arquivo do projeto foi alterado; nenhum commit criado.

## Comandos executados e resultados exatos

| Comando | Resultado |
| --- | --- |
| `bun run lint` (`eslint .`) | **FALHA — exit 1.** 46 problemas: 38 erros, 8 avisos. |
| `npx tsgo --noEmit` (typecheck manual) | **OK — exit 0.** Nenhum erro de tipo. |
| `bun run build` (`vite build`) | **OK — exit 0.** `✓ built in 585ms`, saída em `dist/client` + `dist/server`, com `dist/server/wrangler.json`, `.wrangler/deploy/config.json`, `dist/nitro.json`. |
| `git log --oneline -3` | `95df236`, `f35699c`, `fdcd334`. |

Não existe script `typecheck` nem `test` em `package.json` (scripts presentes: `dev`, `build`, `build:dev`, `preview`, `lint`, `format`). O typecheck acima foi rodado manualmente, fora do projeto.

Detalhe dos erros de lint: a esmagadora maioria é `prettier/prettier` (formatação) em `BrandLogo.tsx`, `CaseStudyCard.tsx`, `TruckFamilyCard.tsx`, `FinancingNotice.tsx`, `SectionHeader.tsx`, `Footer.tsx`, `Header.tsx`, `button.tsx`, `__root.tsx`, `conteudos.$slug.tsx`, `diagnostico.tsx`, `financiamento.tsx`, `index.tsx`, `oportunidades.index.tsx`, `sobre.tsx`, `types/index.ts`. Erros não-formatação: `prefer-const` em `src/services/recommendation.ts:45`; diretiva `eslint-disable` inútil em `src/services/repositories.ts:128`; 7 avisos `react-refresh/only-export-components` em componentes shadcn.

## Pontos fortes confirmados (lidos no código)

- **Disciplina de dados**: `src/data/truck-families.ts` traz todas as specs como `value: null` com comentário explícito de "nenhuma especificação técnica é inventada". `src/data/inventory.ts` marca cada item com `isDemo: true`, `price: null`, `status: "sob_consulta"`.
- **Camada de repositório real**: `src/services/repositories.ts` expõe `truckFamilyRepository`, `operationRepository`, `inventoryRepository`, `caseStudyRepository`, `contentRepository`, `settingsRepository`, `leadRepository` com assinaturas assíncronas — a UI nunca importa `src/data` diretamente. Migração futura é troca de implementação.
- **Zero segredos hardcoded**: a busca por chaves, tokens, telefones e e-mails em `src/` e `public/` não retornou nenhum valor real. Todo dado sensível vem de `import.meta.env` em `src/config/site.ts`.
- **WhatsApp centralizado**: `VITE_WHATSAPP_NUMBER` é lido só em `src/config/site.ts` e consumido por `src/services/whatsapp.ts`. `hasWhatsAppNumber` degrada para um botão desabilitado em vez de link quebrado (`WhatsAppButton.tsx:26`). Mensagens contextuais centralizadas em `whatsappMessages`.
- **Marca**: `BrandLogo.tsx` é tipográfico, não reproduz nem redesenha símbolo Volkswagen, e o rodapé exibe `brandDisclosure` + `commercialDisclaimer` em toda página.
- **Rotas e erro**: `__root.tsx` define `notFoundComponent` e `errorComponent` com retry via `router.invalidate()`. As 14 rotas de `src/routes/` batem com `routeTree.gen.ts`.
- **SEO por rota**: todas as 13 rotas de conteúdo têm `head()` próprio com `title`, `description`, `og:title`, `og:description`.
- **Acessibilidade base**: skip-link para `#conteudo-principal`, um único `<main>`, `SheetTitle` sr-only no menu mobile, `aria-label` nos botões-ícone, `aria-hidden` nos ícones decorativos.
- **Analytics desacoplado**: `trackEvent` é no-op quando `VITE_ANALYTICS_ENABLED` não é `"true"`; nenhum provedor pago instalado.

## Problemas confirmados

### 1. Consórcio presente no site — violação direta do README seção 2
`src/routes/financiamento.tsx:32-35` publica um card:
```
name: "Consórcio",
points: ["Sem juros de financiamento, com taxa de administração",
         "Contemplação por sorteio ou lance", "Planejamento de médio prazo"]
```
O README declara consórcio "completamente fora do escopo". Única ocorrência no projeto (busca por `consórcio|contemplação|sorteio|lance|carta de crédito` em `src/` e `public/`).

### 2. Build não é estático e não serve Cloudflare Pages como o README exige
O README pede build estático, saída `dist`, SPA com arquivo de redirecionamento. O build real produz `dist/client` (estático, 757K) **mais** `dist/server` (1,5M, Worker SSR) e gera `wrangler.json` + `.wrangler/deploy/config.json`. É um deploy Cloudflare **Workers** via nitro, não Pages estático. Não existe `_redirects` (o `dist/client/_headers` gerado não substitui). Publicar só `dist/client` quebraria o SSR.

### 3. Acoplamento ao Lovable — contrário ao princípio de portabilidade
- `vite.config.ts` depende inteiramente de `@lovable.dev/vite-tanstack-config` (pin `2.8.3`) — plugins, aliases, target Cloudflare e injeção de env estão todos dentro desse pacote fechado.
- `src/lib/lovable-error-reporting.ts` e a chamada em `__root.tsx:47`.
- `src/routes/__root.tsx:94-95`: `og:image` e `twitter:image` apontam para `storage.googleapis.com/gpt-engineer-file-uploads/...`. Se o projeto sair do Lovable, o preview social quebra.
- Também no stack: React Router foi trocado por TanStack Router (o README pedia React Router). Não é defeito técnico, mas é desvio do princípio declarado.

### 4. Documentos obrigatórios ausentes — e referenciados pelo código
Nenhum destes existe, embora comentários no código apontem para eles:
- `docs/SUPABASE-MIGRATION.md` (citado em `repositories.ts:6` e `types/index.ts:6`) — exigido pelo README seção 6.
- `supabase/migrations/0001_initial_schema.sql` — exigido pelo README seção 6. Diretório `supabase/` não existe.
- `docs/CLOUDFLARE-DEPLOYMENT.md` (citado em `analytics.ts:9`).
- `docs/PROJECT-STATUS.md` (citado em `truck-families.ts:7`).
- `docs/BRAND-IMPLEMENTATION.md` (citado em `button.tsx:19`).
- `.env.example` — ausente, apesar de `src/config/site.ts:4` afirmar que os dados vêm de `.env.example`. Um integrador novo não tem como saber quais das 11 variáveis `VITE_*` configurar.
- `public/sitemap.xml` — ausente. `robots.txt` existe mas não declara `Sitemap:`.
- `README.md` é o prompt original de 2368 linhas, não documentação de instalação/deploy. Não há instruções de build, env ou publicação.

### 5. Ausência de typecheck e de qualquer teste
Sem script `typecheck`, sem `test`, sem vitest/playwright instalados, sem nenhum arquivo `*.test.*` ou `*.spec.*`. O CI possível hoje é só `lint` — que falha.

### 6. Lint quebrado no commit atual
`bun run lint` sai com código 1. Isso bloqueia qualquer CI e mascara os dois erros reais (`prefer-const`, diretiva inútil) num mar de ruído de formatação. `bun run format` não foi executado (auditoria somente-leitura).

### 7. Acessibilidade: dropdown do menu desktop é hover-only
`src/components/layout/Header.tsx:56-63`: o `<button>` que abre cada grupo de navegação não tem `onClick`, não tem `aria-expanded`, não tem `aria-controls`, e o painel abre por `group-hover` / `group-focus-within`. Em toque e em navegação por teclado o comportamento é inconsistente — o botão recebe foco mas clicar nele não faz nada. O menu mobile (Sheet/Radix) está correto: fecha ao navegar, tem título sr-only e botão de fechar rotulado.

### 8. SEO: sem `canonical` e sem `og:url` em nenhuma rota
Busca por `canonical|og:url` em `src/` não retornou nada. Sem sitemap. `og:image` só existe no `__root`, o que faz toda rota compartilhar a mesma imagem de preview.

### 9. Formulário de diagnóstico: rascunho local sem aviso de privacidade no ponto de coleta
`src/routes/diagnostico.tsx:104-124` grava todo o formulário — nome, WhatsApp, e-mail, cidade, empresa — em `localStorage` sob `ct-diagnostico-rascunho`, com debounce de 400ms. O `consent` é corretamente excluído da persistência e o rascunho é limpo no envio (`:229`). Mas não há aviso visível ao usuário de que os dados ficam gravados no navegador, e nenhuma expiração. Em dispositivo compartilhado isso expõe dados pessoais.

### 10. Lead não é persistido em lugar nenhum
`leadRepository.create` não grava: formata e entrega ao WhatsApp. Se o visitante não concluir o envio no WhatsApp, a oportunidade é perdida sem rastro. É uma escolha consciente e documentada no código, mas é uma lacuna comercial real.

### 11. `/contato` não tem formulário
A página só lista canais e um botão de WhatsApp. Com `VITE_CONTACT_PHONE` e `VITE_CONTACT_EMAIL` vazios, o visitante vê "Telefone a ser informado." e "E-mail a ser informado." — texto de obra em uma página comercial.

### 12. Peso e dependências não usadas
- `dist/client/assets/index-CXUYM_dk.js` = **438 KB** não comprimido, num site institucional. `styles-DYhAEpGx.css` = 89 KB. Cliente total 757 KB, servidor 1,5 MB.
- `zod`, `date-fns` e `@hookform/resolvers` estão em `dependencies` e **não são importados em nenhum arquivo de `src/`**. `react-hook-form` aparece em 1 arquivo só (`src/components/ui/form.tsx`, que não é usado por nenhuma página). Ou seja: os formulários são feitos à mão, sem validação por schema.
- 36 dos 46 componentes em `src/components/ui/` não são referenciados fora da própria pasta (`table`, `chart`, `carousel`, `sidebar`, `command`, `calendar`, `menubar`, `resizable`, etc.), arrastando `recharts`, `embla-carousel-react`, `react-day-picker`, `input-otp`, `cmdk`, `vaul`, `react-resizable-panels` e ~20 pacotes Radix.

## Riscos

- **Jurídico/comercial (alto)**: o card de consórcio contradiz a restrição fundamental do briefing e pode ser lido como oferta de produto que Christiano não comercializa.
- **Marca (médio-alto)**: o logotipo é um placeholder tipográfico ("CT" + faixa vermelha) construído sem os arquivos oficiais. Se o site for ao ar assim, publica-se uma marca que não é a marca — e `BrandLogo.tsx` avisa isso em comentário. Aparece em cabeçalho, rodapé e menu mobile, ou seja, em 100% das páginas.
- **Portabilidade (médio-alto)**: sair do Lovable hoje exige reescrever `vite.config.ts`, remover o reporter de erro e reospedar a imagem social. O README exigia migração sem reescrita estrutural.
- **Publicação prematura (alto)**: com as variáveis de ambiente vazias, o site publica um WhatsApp desabilitado, telefone e e-mail como "a ser informado", área de atendimento genérica e 4 oportunidades marcadas como demonstrativas.
- **Confiança do visitante (médio)**: todas as imagens são `ImagePlaceholder` com legenda "foto real necessária". Nenhuma foto real de caminhão no site.
- **Qualidade contínua (médio)**: lint vermelho + zero testes + zero typecheck automatizado significa que a próxima alteração não tem rede de proteção.

## Plano de correção

### P0 — bloqueia publicação
1. Remover o card "Consórcio" de `src/routes/financiamento.tsx` e substituir por uma modalidade dentro do escopo (ex.: renovação de frota com veículo na troca), revisando o texto da página para não deixar resíduo.
2. Criar `.env.example` com as 11 variáveis `VITE_*` e comentário do formato esperado de cada uma; preencher os valores reais de WhatsApp, telefone, e-mail, cidade/estado e área de atendimento antes de qualquer publicação.
3. Decidir e documentar o alvo de deploy: manter Cloudflare Workers (SSR, como o build já produz) **ou** converter para estático. Se estático, definir prerender e `_redirects`. Escrever `docs/CLOUDFLARE-DEPLOYMENT.md` com o comando, a saída e as variáveis.
4. Substituir o logotipo provisório pelos arquivos oficiais (versão principal e negativa), trocando apenas o bloco do símbolo em `BrandLogo.tsx` — a API do componente já foi desenhada para isso.
5. Rodar `bun run format` e corrigir `prefer-const` em `recommendation.ts:45` e a diretiva inútil em `repositories.ts:128` até `bun run lint` sair com 0.

### P1 — qualidade e conformidade
6. Escrever `docs/SUPABASE-MIGRATION.md` e `supabase/migrations/0001_initial_schema.sql` (tabelas `leads`, `vehicles`, `inventory_items`, `case_studies`, `testimonials`, `content_posts`, `contact_interactions`, `follow_up_tasks`, `site_settings`, com UUID, timestamps, status e notas de RLS).
7. Adicionar `canonical` e `og:url` auto-referentes em cada rota-folha e criar `public/sitemap.xml`, declarando-o no `robots.txt`.
8. Corrigir o dropdown desktop: `onClick` com estado, `aria-expanded`, `aria-controls` e fechamento por `Escape` — ou substituir pelo `navigation-menu` do Radix já instalado.
9. Adicionar script `typecheck` (`tsc --noEmit`) ao `package.json` e um workflow de CI rodando `lint` + `typecheck` + `build`.
10. Adicionar aviso curto no `/diagnostico` informando que o rascunho fica salvo no navegador, com botão "limpar rascunho"; adicionar expiração ao registro.
11. Substituir o README (prompt) por documentação real de projeto, movendo o briefing para `docs/BRIEFING.md`, e criar `docs/PROJECT-STATUS.md` e `docs/BRAND-IMPLEMENTATION.md`, já citados pelo código.

### P2 — redução de risco e peso
12. Remover `zod`, `date-fns` e `@hookform/resolvers` **ou** passar a usá-los: validar os formulários de diagnóstico com schema zod é o caminho preferível (hoje a validação é manual).
13. Apagar os 36 componentes `src/components/ui/*` não utilizados e as dependências que só eles arrastam; medir novamente `dist/client`.
14. Reospedar a imagem social em `public/` e apontar `og:image` para a URL própria, eliminando a dependência de `storage.googleapis.com`.
15. Substituir os `ImagePlaceholder` por fotografias reais, com `loading="lazy"` e `aspect-*` já previstos no componente.
16. Isolar o acoplamento ao Lovable: documentar em `docs/PORTABILITY.md` exatamente o que trocar em `vite.config.ts` e quais arquivos remover ao migrar.

### P3 — evolução
17. Persistir leads (Supabase ou endpoint próprio) **antes** de abrir o WhatsApp, conforme o comentário já previsto em `leadRepository.create`.
18. Adicionar formulário curto em `/contato` com o mesmo destino do diagnóstico.
19. Introduzir testes: vitest para `recommendation.ts` e os filtros de `inventoryRepository`; um smoke test de rotas com Playwright.
20. Ligar analytics compatível com privacidade (Cloudflare Web Analytics) via `registerAnalyticsProvider`, sem tocar nos componentes.

## Observações de método

Foram lidos: `package.json`, `README.md`, `vite.config.ts`, `src/routeTree.gen.ts`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/diagnostico.tsx`, `src/routes/contato.tsx`, `src/routes/financiamento.tsx`, `src/config/site.ts`, `src/services/{whatsapp,analytics,repositories}.ts`, `src/data/{site-settings,inventory,truck-families}.ts`, `src/components/layout/{Header,Footer}.tsx`, `src/components/brand/BrandLogo.tsx`, `src/components/common/{WhatsAppButton,FinancingNotice}.tsx`, `src/server.ts`, `src/start.ts`, `src/router.tsx`, `public/robots.txt`.

Não foram executados: teste de navegador/Playwright, Lighthouse, medição real de LCP, verificação de contraste automatizada, nem scanner de segurança. As afirmações sobre responsividade e performance acima se limitam ao que é verificável por leitura de código e por tamanho de artefato de build.
