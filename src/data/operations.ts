import type { OperationCategory } from "@/types";

/**
 * Categorias de operação — a navegação primária do site é orientada pela
 * necessidade do cliente, não pelo modelo do caminhão.
 */
export const operationCategories: OperationCategory[] = [
  {
    slug: "distribuicao-urbana",
    name: "Distribuição urbana",
    shortLabel: "Distribuição urbana",
    context:
      "Rotas dentro da cidade, muitas paradas por dia e janelas de entrega apertadas. O caminhão precisa entrar, carregar, descarregar e sair rápido.",
    challenges: [
      "Restrição de circulação e acesso a determinadas vias",
      "Manobra em docas e ruas estreitas",
      "Alto número de paradas afetando o ciclo de entrega",
      "Tempo parado que compromete a rota do dia",
    ],
    selectionCriteria: [
      "Dimensão do implemento em relação ao acesso das entregas",
      "PBT compatível com a carga real transportada",
      "Facilidade de carga e descarga",
      "Disponibilidade do veículo na rotina diária",
    ],
    relatedFamilies: ["delivery", "constellation"],
    questionsBeforeProposal: [
      "Quantas entregas o caminhão faz por dia?",
      "Qual o peso e o volume médio por entrega?",
      "Existe restrição de horário ou de porte do veículo na região?",
      "Qual implemento será usado?",
    ],
    featuredOnHome: true,
  },
  {
    slug: "bebidas",
    name: "Bebidas",
    shortLabel: "Bebidas",
    context:
      "Carga densa, paletizada ou em engradados, com rota fixa e alto número de paradas. Peso chega perto do limite antes do volume.",
    challenges: [
      "Distribuição de peso concentrada",
      "Carga e descarga lateral frequente",
      "Rotas repetitivas com alto desgaste",
    ],
    selectionCriteria: [
      "Capacidade real de carga considerando o peso do implemento",
      "Tipo de carroceria adequado ao método de descarga",
      "Robustez para uso diário contínuo",
    ],
    relatedFamilies: ["delivery", "constellation"],
    questionsBeforeProposal: [
      "A carga é paletizada ou manual?",
      "Qual o peso médio transportado por viagem?",
      "A descarga é lateral, traseira ou mista?",
    ],
    featuredOnHome: false,
  },
  {
    slug: "alimentos",
    name: "Alimentos",
    shortLabel: "Alimentos",
    context:
      "Operações com exigência sanitária, controle de temperatura em parte dos casos e prazos rígidos de entrega.",
    challenges: [
      "Necessidade de implemento específico (baú, refrigerado, isotérmico)",
      "Janela de entrega curta em centros de distribuição",
      "Rotas que combinam trecho urbano e regional",
    ],
    selectionCriteria: [
      "Definição do implemento antes da configuração do chassi",
      "Autonomia compatível com a rota",
      "Disponibilidade para não comprometer a entrega",
    ],
    relatedFamilies: ["delivery", "constellation"],
    questionsBeforeProposal: [
      "A carga exige refrigeração?",
      "Qual a distância média por rota?",
      "Quantas entregas por dia?",
    ],
    featuredOnHome: false,
  },
  {
    slug: "materiais-de-construcao",
    name: "Materiais de construção",
    shortLabel: "Construção",
    context:
      "Carga pesada, piso irregular em obra e necessidade de descarga em locais sem estrutura. Uso severo em boa parte do tempo.",
    challenges: [
      "Acesso a obras sem pavimentação",
      "Desgaste acelerado por uso severo",
      "Necessidade de basculante, munck ou carroceria reforçada",
    ],
    selectionCriteria: [
      "Configuração de eixos adequada ao piso",
      "PBT compatível com a carga real",
      "Implemento adequado ao tipo de descarga",
    ],
    relatedFamilies: ["constellation", "delivery"],
    questionsBeforeProposal: [
      "Qual o percentual de rodagem fora de asfalto?",
      "Qual material é transportado e em que peso?",
      "Qual implemento está previsto?",
    ],
    featuredOnHome: true,
  },
  {
    slug: "agronegocio",
    name: "Agronegócio",
    shortLabel: "Agronegócio",
    context:
      "Sazonalidade forte, pátios de fazenda, estradas vicinais e picos de safra em que a disponibilidade do veículo vale muito.",
    challenges: [
      "Trechos não pavimentados até o carregamento",
      "Concentração de demanda na safra",
      "Distância até assistência técnica",
    ],
    selectionCriteria: [
      "Tração e configuração de eixos para o piso da propriedade",
      "Capacidade coerente com o ciclo de carregamento",
      "Rede de atendimento na região de operação",
    ],
    relatedFamilies: ["constellation", "meteor"],
    questionsBeforeProposal: [
      "Qual a distância do carregamento até o asfalto?",
      "O caminhão roda o ano todo ou concentra na safra?",
      "Qual implemento será acoplado?",
    ],
    featuredOnHome: true,
  },
  {
    slug: "graos",
    name: "Grãos",
    shortLabel: "Grãos",
    context:
      "Volume alto, peso próximo ao limite legal e rotas que combinam vicinal e rodovia até armazém ou porto.",
    challenges: [
      "Peso e cubagem no limite",
      "Fila em armazém e terminal",
      "Rotas longas com topografia variada",
    ],
    selectionCriteria: [
      "CMT compatível com a composição pretendida",
      "Relação de transmissão adequada à topografia",
      "Custo por quilômetro na rota real",
    ],
    relatedFamilies: ["constellation", "meteor"],
    questionsBeforeProposal: [
      "Qual composição está prevista (graneleiro, bitrem, outra)?",
      "Qual a distância média por viagem?",
      "Quantas viagens por mês na safra?",
    ],
    featuredOnHome: false,
  },
  {
    slug: "transporte-regional",
    name: "Transporte regional",
    shortLabel: "Transporte regional",
    context:
      "Trajetos entre cidades da mesma região, com combinação de trecho urbano e rodoviário e rotina previsível.",
    challenges: [
      "Equilíbrio entre capacidade e manobra",
      "Retorno com carga parcial ou vazio",
      "Custo de manutenção com rotina intensa",
    ],
    selectionCriteria: [
      "Capacidade dimensionada para a carga habitual, não para a exceção",
      "Conforto adequado à jornada diária",
      "Disponibilidade e previsibilidade de manutenção",
    ],
    relatedFamilies: ["constellation", "delivery"],
    questionsBeforeProposal: [
      "Qual a quilometragem mensal aproximada?",
      "O caminhão volta carregado?",
      "Qual a carga máxima em uso normal?",
    ],
    featuredOnHome: true,
  },
  {
    slug: "transporte-rodoviario",
    name: "Transporte rodoviário",
    shortLabel: "Transporte rodoviário",
    context:
      "Longa distância, alta quilometragem e operação em que cada dia parado tem impacto direto no faturamento.",
    challenges: [
      "Custo por quilômetro em rota longa",
      "Permanência do motorista na frota",
      "Manutenção programada sem perder viagem",
    ],
    selectionCriteria: [
      "Consumo e desempenho na topografia real da rota",
      "Conforto e cabine adequados à jornada",
      "Rede de atendimento no trajeto",
    ],
    relatedFamilies: ["meteor", "constellation"],
    questionsBeforeProposal: [
      "Quais são as rotas principais?",
      "Qual a quilometragem mensal por veículo?",
      "Qual composição e CMT pretendidos?",
    ],
    featuredOnHome: true,
  },
  {
    slug: "logistica",
    name: "Logística",
    shortLabel: "Logística",
    context:
      "Operadores que atendem contratos com nível de serviço definido, muitas vezes com frota mista e indicadores de disponibilidade.",
    challenges: [
      "Compromisso contratual de nível de serviço",
      "Padronização da frota para manutenção e motoristas",
      "Planejamento de renovação por ciclo",
    ],
    selectionCriteria: [
      "Padronização que simplifique manutenção e treinamento",
      "Ciclo de troca alinhado ao contrato",
      "Disponibilidade acima de tudo",
    ],
    relatedFamilies: ["constellation", "meteor", "delivery"],
    questionsBeforeProposal: [
      "Qual o prazo de contrato que o veículo vai atender?",
      "Existe padrão de frota já definido?",
      "Qual o ciclo de renovação praticado?",
    ],
    featuredOnHome: true,
  },
  {
    slug: "carga-pesada",
    name: "Carga pesada",
    shortLabel: "Carga pesada",
    context:
      "Composições de maior peso bruto, muitas vezes com implemento especial e exigência de desempenho em rampa.",
    challenges: [
      "Definição correta de CMT",
      "Topografia exigente na rota",
      "Implemento especial que altera toda a configuração",
    ],
    selectionCriteria: [
      "CMT e eixos coerentes com a composição",
      "Relação de transmissão para a rota",
      "Análise conjunta de caminhão e implemento",
    ],
    relatedFamilies: ["meteor", "constellation"],
    questionsBeforeProposal: [
      "Qual o peso bruto total pretendido?",
      "Qual o implemento e quem fará a montagem?",
      "Como é a topografia da rota principal?",
    ],
    featuredOnHome: true,
  },
  {
    slug: "pequenas-frotas",
    name: "Pequenas frotas",
    shortLabel: "Pequenas frotas",
    context:
      "Empresas com poucos veículos, em que cada compra tem peso relevante no caixa e um caminhão parado afeta a operação inteira.",
    challenges: [
      "Impacto da parcela no fluxo de caixa",
      "Ausência de veículo reserva",
      "Decisão entre renovar e manter o atual",
    ],
    selectionCriteria: [
      "Parcela compatível com a geração de receita do veículo",
      "Disponibilidade e previsibilidade de manutenção",
      "Momento certo para a troca",
    ],
    relatedFamilies: ["delivery", "constellation"],
    questionsBeforeProposal: [
      "Quantos veículos existem hoje na frota?",
      "Qual o faturamento médio gerado por caminhão?",
      "Há veículo para entrar na troca?",
    ],
    featuredOnHome: false,
  },
  {
    slug: "transportadores-autonomos",
    name: "Transportadores autônomos",
    shortLabel: "Autônomos",
    context:
      "O caminhão é a ferramenta de trabalho e a fonte de renda. A decisão precisa considerar frete disponível, custo mensal e tempo de operação.",
    challenges: [
      "Entrada disponível e comprovação de renda",
      "Variação do frete ao longo do ano",
      "Escolher configuração que amplie as cargas possíveis",
    ],
    selectionCriteria: [
      "Configuração que atenda o maior número de fretes da região",
      "Custo mensal sustentável em mês fraco",
      "Valor de revenda futuro",
    ],
    relatedFamilies: ["constellation", "delivery", "meteor"],
    questionsBeforeProposal: [
      "Quais cargas você costuma pegar?",
      "Qual entrada está disponível hoje?",
      "Qual o prazo pretendido para a aquisição?",
    ],
    featuredOnHome: false,
  },
];

export const homeOperations = operationCategories.filter((operation) => operation.featuredOnHome);

export const getOperation = (slug: string): OperationCategory | undefined =>
  operationCategories.find((operation) => operation.slug === slug);
