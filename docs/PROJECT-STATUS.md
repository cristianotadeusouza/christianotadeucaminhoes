# Estado do projeto

## Diagnóstico

### Pontos preservados

- Arquitetura tipada com TanStack Start, React e TypeScript.
- Rotas e dados separados por domínio, preparados para integração futura com Supabase.
- Diagnóstico comercial progressivo, com rascunho local e envio contextual ao WhatsApp.
- Política de não inventar preço, taxa, estoque, cliente, entrega ou especificação.
- Identidade oficial aplicada por tokens e ativos aprovados.
- Build Cloudflare funcional, typecheck sem erros e navegação acessível.

### Melhorias implementadas nesta etapa

- Home redesenhada com hierarquia premium, fotografia real e mensagem orientada à operação.
- Imagens reais e identificadas para Delivery, Constellation e Meteor.
- Jornada de decisão reorganizada em carga, rota, implemento e aquisição.
- Cards de operação e famílias refinados, com microinterações e foco comercial.
- Cabeçalho, botões e WhatsApp flutuante aprimorados para desktop e mobile.
- Fallbacks editoriais de imagem substituíram os antigos blocos com aparência de placeholder.
- Metadados sociais passaram a usar um ativo local e leve.
- Build desacoplado do pacote de configuração do Lovable.
- Preview migrado para o adaptador oficial Cloudflare e publicação validada com Wrangler em modo
  `dry-run`.
- Sitemap e robots dinâmicos, metatag de verificação do Google e hierarquia de títulos corrigida.
- Triagem expressa em três passos com conversa contextual pronta para o WhatsApp.
- Painel comercial em `/painel`, com autenticação Supabase, RLS, sincronização em nuvem, funil,
  clientes, histórico de contatos, estoque e agenda.
- Atalhos operacionais para WhatsApp, ligação, Gmail, Google Agenda e Google Maps.
- Contato público, URL canônica e acesso discreto ao painel atualizados com os dados reais.
- Navegação móvel do painel refeita com barra inferior, áreas de toque maiores e funil horizontal.

## Dados reais ainda necessários

- Cidade, estado e região real de atendimento.
- Links de redes sociais confirmados.
- Estoque e campanhas com validade e responsável pela atualização.
- Especificações técnicas oficiais por versão que o Christiano desejar destacar.
- Fotos próprias de Christiano em atendimento, entregas e clientes com autorização por escrito.
- Casos, depoimentos e resultados comprovados.

## Próximos passos

### Supabase

1. Manter `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente de produção.
2. Confirmar senha ou link mágico do usuário do Christiano e revisar os usuários autorizados.
3. Evoluir a captação do site para salvar leads somente após definir consentimento e política LGPD.
4. Adicionar trilha de auditoria e anexos de propostas quando o fluxo real de vendas exigir.

### Cloudflare

1. Manter as variáveis `VITE_*` configuradas no ambiente de produção.
2. Validar todas as rotas após cada publicação automática da `main`.
3. Configurar domínio definitivo, redirects, headers de segurança e cache dos ativos.
4. Ativar Web Analytics sem cookies invasivos após revisão da política de privacidade.

## Riscos controlados

- Imagens oficiais precisam de confirmação de autorização antes do lançamento definitivo.
- Estoque, condições comerciais e prova social permanecem vazios até receberem dados reais.
- O cofre local permanece apenas como fallback quando as variáveis do Supabase não estão presentes.
- Search Console só exibirá dados depois da verificação do domínio e do envio do sitemap na conta
  Google do responsável.
