import type { TruckFamily } from "@/types";

/**
 * Conteúdo editorial das famílias de caminhões.
 *
 * REGRA: nenhuma especificação técnica é inventada. Campos com `value: null`
 * aguardam dados oficiais (ver docs/PROJECT-STATUS.md).
 */
export const truckFamilies: TruckFamily[] = [
  {
    slug: "delivery",
    name: "Delivery",
    tagline: "Distribuição urbana e regional com agilidade no trânsito e no ciclo de entregas.",
    intro:
      "A família Delivery é o ponto de partida para operações que fazem muitas paradas, circulam em vias urbanas e dependem de agilidade para cumprir a janela de entrega. É a linha mais escolhida por quem trabalha com distribuição, bebidas, alimentos, materiais e serviços que exigem manobra em espaço reduzido.",
    usageProfile: [
      "Rotas urbanas com muitas paradas por dia",
      "Distribuição regional de curta e média distância",
      "Operações com janela de entrega e restrição de circulação",
      "Primeiro caminhão ou ampliação de frota leve",
    ],
    recommendedOperations: [
      "Distribuição urbana",
      "Bebidas e alimentos",
      "Materiais de construção em centros urbanos",
      "Logística de última milha",
    ],
    reasonsToConsider: [
      {
        title: "Manobra e acesso",
        description:
          "Dimensões e configurações pensadas para ruas estreitas, docas apertadas e centros urbanos com restrição.",
      },
      {
        title: "Ciclo de entrega",
        description:
          "Quando o caminhão faz dezenas de paradas por dia, a facilidade de entrar, sair e carregar pesa mais do que o número de potência.",
      },
      {
        title: "Escolha do implemento",
        description:
          "Baú, carroceria, refrigerado ou tanque mudam completamente a configuração ideal. A definição do implemento vem antes da definição do modelo.",
      },
    ],
    configurations: [
      {
        name: "Configuração leve",
        summary:
          "Indicada para cargas fracionadas e alto número de paradas. Definição de PBT e distância entre eixos conforme o implemento.",
        specs: [
          { label: "Motor", value: null },
          { label: "Potência", value: null },
          { label: "Transmissão", value: null },
          { label: "PBT", value: null },
          { label: "Distância entre eixos", value: null },
          { label: "Tipo de cabine", value: null },
        ],
      },
      {
        name: "Configuração média",
        summary:
          "Para volumes maiores e rotas regionais, mantendo boa capacidade de manobra em área urbana.",
        specs: [
          { label: "Motor", value: null },
          { label: "Potência", value: null },
          { label: "Transmissão", value: null },
          { label: "PBT", value: null },
          { label: "CMT", value: null },
          { label: "Aplicação", value: null },
        ],
      },
    ],
    gallery: [
      {
        alt: "Caminhão Delivery em operação de distribuição urbana",
        caption: "Delivery em rota urbana, com implemento carregado — foto real necessária.",
        aspect: "4/3",
      },
      {
        alt: "Cabine do caminhão Delivery",
        caption: "Interior da cabine, posição de dirigir — foto real necessária.",
        aspect: "4/3",
      },
      {
        alt: "Detalhe do implemento instalado em caminhão Delivery",
        caption: "Detalhe do implemento (baú ou carroceria) — foto real necessária.",
        aspect: "4/3",
      },
    ],
    faq: [
      {
        question: "O Delivery atende operação regional, ou só urbana?",
        answer:
          "Atende as duas situações, dependendo da configuração escolhida. O que define é a carga transportada, a distância média e o implemento. Esse é exatamente o ponto que avaliamos antes de indicar uma versão.",
      },
      {
        question: "Consigo definir o modelo antes de escolher o implemento?",
        answer:
          "O caminho mais seguro é o contrário. O implemento determina peso, comprimento e distribuição de carga, e isso influencia diretamente a configuração do chassi.",
      },
      {
        question: "Serve como primeiro caminhão?",
        answer:
          "É uma das linhas mais procuradas por quem está comprando o primeiro caminhão. Vale conversar sobre rota, carga e o retorno esperado antes de fechar a configuração.",
      },
    ],
  },
  {
    slug: "constellation",
    name: "Constellation",
    tagline: "Versatilidade para transporte regional, rodoviário e aplicações fora de estrada.",
    intro:
      "A família Constellation cobre a maior amplitude de aplicações: transporte regional e rodoviário, agronegócio, construção e operações que combinam estrada e piso irregular. É a linha escolhida por quem precisa de um caminhão que sustente rotina intensa e diferentes tipos de implemento.",
    usageProfile: [
      "Transporte regional e rodoviário",
      "Agronegócio, grãos e insumos",
      "Construção civil e movimentação de materiais",
      "Frotas em renovação que precisam de versatilidade",
    ],
    recommendedOperations: [
      "Transporte regional",
      "Agronegócio",
      "Construção",
      "Logística e transferência entre unidades",
    ],
    reasonsToConsider: [
      {
        title: "Amplitude de configurações",
        description:
          "Diferentes arranjos de eixos, cabines e aplicações permitem ajustar o caminhão ao trabalho real, e não o contrário.",
      },
      {
        title: "Rotina intensa",
        description:
          "Operações que rodam muito exigem análise de disponibilidade, manutenção e rede de atendimento na região onde o veículo trabalha.",
      },
      {
        title: "Composição com implemento",
        description:
          "Basculante, graneleiro, sider, tanque ou prancha alteram PBT, CMT e distribuição de peso. A escolha precisa ser feita em conjunto.",
      },
    ],
    configurations: [
      {
        name: "Aplicação rodoviária",
        summary:
          "Para percursos longos e carga constante, com definição de eixos e cabine conforme a rota.",
        specs: [
          { label: "Motor", value: null },
          { label: "Potência", value: null },
          { label: "Transmissão", value: null },
          { label: "PBT", value: null },
          { label: "CMT", value: null },
          { label: "Tipo de cabine", value: null },
        ],
      },
      {
        name: "Aplicação fora de estrada",
        summary:
          "Para agronegócio e construção, com atenção a tração, piso e ciclo de carregamento.",
        specs: [
          { label: "Configuração de eixos", value: null },
          { label: "Tração", value: null },
          { label: "PBT", value: null },
          { label: "Distância entre eixos", value: null },
          { label: "Implementos compatíveis", value: null },
        ],
      },
    ],
    gallery: [
      {
        alt: "Caminhão Constellation em rodovia",
        caption: "Constellation em operação rodoviária — foto real necessária.",
        aspect: "4/3",
      },
      {
        alt: "Caminhão Constellation em operação no agronegócio",
        caption: "Constellation em pátio agrícola ou carregamento de grãos — foto real necessária.",
        aspect: "4/3",
      },
      {
        alt: "Painel e posto de trabalho do Constellation",
        caption: "Painel e posto de trabalho — foto real necessária.",
        aspect: "4/3",
      },
    ],
    faq: [
      {
        question: "Constellation ou Delivery para transporte regional?",
        answer:
          "Depende do peso transportado, do tipo de implemento e da frequência das viagens. Rotas regionais com carga mais pesada e uso constante costumam pedir Constellation; distribuição fracionada tende ao Delivery.",
      },
      {
        question: "A mesma configuração serve para estrada e para pátio de fazenda?",
        answer:
          "Nem sempre. Piso irregular, rampa e ciclo de carregamento influenciam a escolha de eixos e tração. Vale mapear onde o caminhão passa a maior parte do tempo.",
      },
      {
        question: "Consigo usar meu caminhão atual na negociação?",
        answer:
          "Sim, a avaliação do usado pode entrar na composição. O valor depende de estado, quilometragem, documentação e mercado no momento da negociação.",
      },
    ],
  },
  {
    slug: "meteor",
    name: "Meteor",
    tagline: "Carga pesada e transporte rodoviário de alto desempenho e longa distância.",
    intro:
      "A família Meteor é voltada a operações rodoviárias exigentes e carga pesada, onde disponibilidade, conforto do motorista e desempenho em longas distâncias afetam diretamente o resultado da viagem. É a linha considerada por transportadoras e frotas que rodam muito por mês.",
    usageProfile: [
      "Transporte rodoviário de longa distância",
      "Carga pesada e composições de maior CMT",
      "Operações com alta quilometragem mensal",
      "Frotas que precisam reter motoristas",
    ],
    recommendedOperations: [
      "Transporte rodoviário",
      "Carga pesada",
      "Operadores logísticos",
      "Transferência de longa distância",
    ],
    reasonsToConsider: [
      {
        title: "Custo por quilômetro",
        description:
          "Em operações de longa distância, consumo, disponibilidade e intervalo de manutenção pesam mais no resultado do que o preço de compra.",
      },
      {
        title: "Conforto do motorista",
        description:
          "Cabine e posto de trabalho influenciam a permanência do motorista na frota — um custo real e muitas vezes ignorado na conta.",
      },
      {
        title: "Composição da carreta",
        description:
          "O tipo de implemento e o CMT pretendido determinam a configuração. A definição precisa considerar a operação completa, não só o cavalo.",
      },
    ],
    configurations: [
      {
        name: "Longa distância",
        summary:
          "Para rotas rodoviárias contínuas, com definição de cabine e relação conforme o perfil de viagem.",
        specs: [
          { label: "Motor", value: null },
          { label: "Potência", value: null },
          { label: "Transmissão", value: null },
          { label: "CMT", value: null },
          { label: "Tipo de cabine", value: null },
        ],
      },
      {
        name: "Carga pesada",
        summary:
          "Para composições de maior peso bruto, com atenção a eixos, relação de transmissão e topografia da rota.",
        specs: [
          { label: "Configuração de eixos", value: null },
          { label: "CMT", value: null },
          { label: "PBT", value: null },
          { label: "Implementos compatíveis", value: null },
        ],
      },
    ],
    gallery: [
      {
        alt: "Caminhão Meteor em rodovia de longa distância",
        caption: "Meteor em rodovia, com composição acoplada — foto real necessária.",
        aspect: "4/3",
      },
      {
        alt: "Cabine leito do Meteor",
        caption: "Cabine leito e área de descanso — foto real necessária.",
        aspect: "4/3",
      },
      {
        alt: "Detalhe do quinta-roda e engate do Meteor",
        caption: "Detalhe técnico do engate e quinta-roda — foto real necessária.",
        aspect: "4/3",
      },
    ],
    faq: [
      {
        question: "Meteor faz sentido para quem tem um caminhão só?",
        answer:
          "Pode fazer, quando a operação é rodoviária, contínua e com carga pesada. O que define é a quilometragem mensal, o tipo de carga e o retorno esperado por viagem.",
      },
      {
        question: "Vale trocar um caminhão antigo que ainda roda?",
        answer:
          "A conta não é só o valor da parcela. Entram manutenção crescente, dias parado, consumo e o frete que deixa de ser feito. Vale colocar esses números lado a lado antes de decidir.",
      },
      {
        question: "Quais dados vocês precisam para montar uma proposta?",
        answer:
          "Rota, carga, quilometragem mensal, implemento pretendido, prazo de aquisição e se há veículo na troca. Com isso já dá para trabalhar uma configuração coerente.",
      },
    ],
  },
];

export const getTruckFamily = (slug: string): TruckFamily | undefined =>
  truckFamilies.find((family) => family.slug === slug);
