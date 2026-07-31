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

## Dados reais ainda necessários

- `VITE_WHATSAPP_NUMBER` e telefone público.
- E-mail, cidade, estado e região real de atendimento.
- Links de redes sociais confirmados.
- Estoque e campanhas com validade e responsável pela atualização.
- Especificações técnicas oficiais por versão que o Christiano desejar destacar.
- Fotos próprias de Christiano em atendimento, entregas e clientes com autorização por escrito.
- Casos, depoimentos e resultados comprovados.

## Próximos passos

### Supabase

1. Criar tabelas para leads, perfis de operação, oportunidades, estoque, conteúdos e casos.
2. Manter os repositórios atuais como contratos de dados e trocar somente a implementação.
3. Aplicar RLS, validação no servidor e trilha de consentimento LGPD.
4. Salvar o lead antes de abrir o WhatsApp, com fallback para o fluxo atual.
5. Criar painel autenticado apenas depois da política de acesso estar definida.

### Cloudflare

1. Conectar este repositório ao projeto Cloudflare.
2. Configurar as variáveis `VITE_*` no ambiente de produção.
3. Publicar o Worker gerado pelo build Nitro e validar todas as rotas.
4. Configurar domínio, redirects, headers de segurança e cache dos ativos.
5. Ativar Web Analytics sem cookies invasivos após revisão da política de privacidade.

## Riscos controlados

- O projeto ainda sincroniza com o Lovable; não reescrever o histórico publicado.
- Imagens oficiais precisam de confirmação de autorização antes do lançamento definitivo.
- Sem WhatsApp real configurado, os botões ficam desativados para não abrir um contato incorreto.
- Estoque, condições comerciais e prova social permanecem vazios até receberem dados reais.
