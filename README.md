# Christiano Tadeu | Caminhões Volkswagen

Site comercial e painel privado de vendas de Christiano Tadeu, vendedor de caminhões Volkswagen na Belcar Caminhões.

O projeto é independente do Lovable: o código vive no GitHub, a aplicação roda no Cloudflare Workers e os dados privados são armazenados no Supabase com autenticação e Row Level Security (RLS).

## Endereços

- Produção: <https://caminhoes.christianotadeu.workers.dev>
- Painel privado: <https://caminhoes.christianotadeu.workers.dev/painel>

## Principais recursos

### Site público

- apresentação profissional e vínculo comercial claro com a Belcar Caminhões;
- catálogo das famílias Delivery, Constellation e Meteor;
- fichas técnicas e cores de fábrica;
- diagnóstico de operação e contato rápido por WhatsApp;
- oportunidades, financiamento, conteúdos e páginas institucionais;
- sitemap, metadados, acessibilidade e layout responsivo.

### Painel do vendedor

- visão “Hoje” com pendências, retornos, propostas e prioridades;
- funil comercial e cadastro detalhado de clientes;
- registro rápido de ligação, WhatsApp, e-mail e visita;
- histórico unificado de interações, tarefas, propostas e documentos;
- encaixe entre necessidade do cliente e estoque disponível;
- criação, impressão e envio de propostas;
- agenda e modo visita com mapa, localização, ditado e foto autorizada;
- estoque, arquivos privados, importação, exportação e deduplicação em CSV;
- instalação como PWA no celular, com atalho na tela inicial.

## Tecnologias

- React 19, TypeScript, TanStack Start e Vite;
- Tailwind CSS e componentes Radix UI;
- Cloudflare Workers;
- Supabase Auth, Postgres e Storage privado.

## Desenvolvimento local

Requisitos: Node.js 22+ e npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Preencha `VITE_SUPABASE_PUBLISHABLE_KEY` em `.env.local` com uma chave publicável do projeto. Nunca use uma chave `service_role` ou secreta no frontend.

Validações antes de publicar:

```bash
npm run typecheck
npm run lint
npm run build
```

## Variáveis de ambiente

O arquivo [.env.example](./.env.example) documenta todas as variáveis aceitas. Para o painel funcionar em produção, configure no ambiente de build do Cloudflare:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_PUBLISHABLE_KEY`;
- `VITE_SITE_URL`.

As demais variáveis controlam contato, área de atendimento, redes sociais, Analytics e validação do Google Search Console.

## Banco de dados

As migrações versionadas estão em [`supabase/migrations`](./supabase/migrations) e refletem o esquema aplicado no projeto de produção:

- contatos, clientes, estoque, tarefas e interações;
- propostas comerciais e documentos;
- índices de relacionamento;
- RLS por usuário autenticado;
- bucket privado `sales-private` com limite de 20 MB.

Para trabalhar com Supabase CLI, vincule o projeto apenas no seu ambiente local e mantenha credenciais fora do Git.

## Publicação

A branch de produção é `main`. O Cloudflare conectado ao GitHub deve compilar e publicar cada commit aprovado nessa branch. Para uma publicação manual, use uma sessão autenticada do Wrangler e preserve as variáveis configuradas no painel:

```bash
npm run build
npx wrangler deploy --keep-vars
```

O `wrangler.jsonc` mantém somente configuração pública do Worker; chaves de build continuam no ambiente do Cloudflare.

## Monitoramento automático

O workflow [`.github/workflows/availability.yml`](./.github/workflows/availability.yml) roda após
cada publicação na `main` e diariamente às 8h17 no horário de São Paulo. Ele:

- verifica a página inicial, a página reservada de links, o painel, o sitemap e o robots.txt;
- executa uma leitura mínima no Supabase usando a chave publicável e respeitando as políticas RLS;
- falha de forma visível no GitHub Actions caso uma rota ou o banco não responda.

O Supabase pode pausar projetos gratuitos com pouca atividade em sete dias. Em repositórios públicos,
o GitHub também pode desativar workflows agendados depois de 60 dias sem atividade no repositório;
novos commits na `main` mantêm o agendamento ativo.

## Aviso institucional

Este é um canal profissional pessoal de Christiano Tadeu, vendedor vinculado à Belcar Caminhões. Não é o site institucional da Belcar, da Volkswagen Caminhões e Ônibus nem da Volkswagen. Marcas e modelos citados pertencem aos respectivos titulares.
