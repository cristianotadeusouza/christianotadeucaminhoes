import type { ContentPost } from "@/types";

/**
 * Conteúdos editoriais.
 *
 * Textos autorais e conservadores: nenhum dado técnico, número de mercado
 * ou afirmação verificável foi inventado. São artigos de raciocínio comercial,
 * escritos no tom consultivo da marca.
 */
export const contentPosts: ContentPost[] = [
  {
    slug: "antes-de-escolher-o-modelo-defina-a-operacao",
    isPublished: true,
    title: "Antes de escolher o modelo, defina a operação",
    description:
      "A configuração certa nasce da carga, da rota e do implemento. Começar pelo modelo costuma custar caro depois.",
    category: "escolha-do-caminhao",
    author: "Christiano Tadeu",
    publishedAt: "2026-01-12T09:00:00.000Z",
    readingMinutes: 4,
    cover: {
      alt: "Caminhão sendo avaliado antes da definição de configuração",
      caption: "Christiano analisando a operação junto ao cliente. Foto real necessária.",
      aspect: "16/9",
    },
    body: [
      {
        type: "paragraph",
        text: "A conversa sobre um caminhão novo quase sempre começa pelo modelo. É natural: o modelo é o que se vê no pátio, no anúncio e na conversa com outro transportador. Só que a decisão que realmente afeta o resultado vem antes disso.",
      },
      { type: "heading", text: "O que define a configuração" },
      {
        type: "list",
        items: [
          "O tipo de carga e o peso realmente transportado no dia a dia",
          "A rota: urbana, regional, rodoviária ou uma combinação",
          "O implemento previsto, porque ele muda peso, comprimento e distribuição",
          "A frequência de uso e a quilometragem mensal",
          "O objetivo da compra: primeiro caminhão, ampliação ou renovação",
        ],
      },
      {
        type: "paragraph",
        text: "Quando esses pontos estão claros, a lista de configurações possíveis diminui bastante. A conversa deixa de ser sobre preferência e passa a ser sobre adequação.",
      },
      { type: "heading", text: "O erro mais comum" },
      {
        type: "paragraph",
        text: "Comprar para a exceção. Um caminhão dimensionado para a carga mais pesada que aparece três vezes por ano acaba rodando o resto do tempo com capacidade ociosa, custo maior e retorno menor. O caminho mais seguro é dimensionar para a operação habitual e planejar a exceção de outra forma.",
      },
      {
        type: "paragraph",
        text: "Se você está avaliando uma compra, vale começar pela operação. É a parte que ninguém consegue responder por você.",
      },
    ],
  },
  {
    slug: "o-custo-de-manter-um-caminhao-alem-do-ponto",
    isPublished: true,
    title: "O custo de manter um caminhão além do ponto de troca",
    description:
      "Manutenção crescente, dias parado e frete não realizado raramente entram na conta, mas aparecem no caixa.",
    category: "renovacao-de-frota",
    author: "Christiano Tadeu",
    publishedAt: "2026-01-26T09:00:00.000Z",
    readingMinutes: 4,
    cover: {
      alt: "Caminhão em manutenção no pátio de uma transportadora",
      caption: "Veículo em manutenção ou pátio de frota. Foto real necessária.",
      aspect: "16/9",
    },
    body: [
      {
        type: "paragraph",
        text: "A pergunta mais frequente na renovação é direta: vale trocar agora ou esperar mais um ano? Não existe resposta genérica, mas existe uma forma honesta de montar a conta.",
      },
      { type: "heading", text: "O que entra na comparação" },
      {
        type: "list",
        items: [
          "Gasto com manutenção nos últimos doze meses, incluindo o que foi feito fora de programação",
          "Dias em que o caminhão ficou parado e o frete que deixou de ser feito",
          "Consumo médio comparado ao restante da frota",
          "Valor de mercado atual do veículo e a tendência dessa curva",
          "Impacto da parcela no fluxo de caixa mensal",
        ],
      },
      {
        type: "paragraph",
        text: "Colocados lado a lado, esses números costumam mudar a percepção. Em muitos casos, o custo de manter já se aproxima do custo de renovar. A diferença está em previsibilidade, não em economia.",
      },
      { type: "heading", text: "Quando esperar faz sentido" },
      {
        type: "paragraph",
        text: "Quando o veículo ainda está estável, a manutenção é programada e o caixa está comprometido com outro investimento. Trocar por trocar não melhora operação nenhuma. A decisão precisa ter um motivo mensurável.",
      },
    ],
  },
  {
    slug: "financiamento-de-caminhao-o-que-observar-antes-de-assinar",
    isPublished: true,
    title: "Financiamento de caminhão: o que observar antes de assinar",
    description:
      "Prazo, entrada e parcela precisam conversar com a receita que o caminhão gera. O resto é consequência.",
    category: "financiamento",
    author: "Christiano Tadeu",
    publishedAt: "2026-02-09T09:00:00.000Z",
    readingMinutes: 3,
    cover: {
      alt: "Análise de proposta comercial de aquisição de caminhão",
      caption: "Atendimento com cliente analisando proposta. Foto real necessária.",
      aspect: "16/9",
    },
    body: [
      {
        type: "paragraph",
        text: "Financiamento não é detalhe burocrático do fim da negociação. Ele define se a compra cabe na operação ou se vai apertar o caixa nos meses de frete mais fraco.",
      },
      { type: "heading", text: "Pontos que merecem atenção" },
      {
        type: "list",
        items: [
          "A parcela em relação ao faturamento que o caminhão gera, considerando o mês mais fraco do ano",
          "A entrada disponível hoje, sem comprometer o capital de giro",
          "O prazo pretendido e o que ele significa em custo total",
          "Se o implemento entra ou não na mesma estrutura",
          "Se há veículo usado para compor a negociação",
        ],
      },
      {
        type: "paragraph",
        text: "As condições variam conforme o perfil do cliente, o veículo, a campanha vigente e a análise de crédito. Por isso, não há taxa ou aprovação prometida antes da análise. O que existe é organização para a proposta chegar coerente com a realidade da empresa.",
      },
      {
        type: "paragraph",
        text: "O papel do atendimento aqui é simples: organizar os dados, explicar o que está sendo assinado e acompanhar o processo até a entrega.",
      },
    ],
  },
];

export const publishedPosts = contentPosts.filter((post) => post.isPublished);

export const getPost = (slug: string): ContentPost | undefined =>
  publishedPosts.find((post) => post.slug === slug);

export const contentCategoryLabels: Record<string, string> = {
  "escolha-do-caminhao": "Escolha do caminhão",
  operacao: "Operação",
  manutencao: "Manutenção",
  produtividade: "Produtividade",
  financiamento: "Financiamento",
  "renovacao-de-frota": "Renovação de frota",
  "mercado-de-transporte": "Mercado de transporte",
  bastidores: "Bastidores e entregas",
};
