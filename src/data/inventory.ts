import type { InventoryItem } from "@/types";

/**
 * DADOS DEMONSTRATIVOS (mock).
 *
 * Nenhum preço, campanha ou disponibilidade real é publicado aqui.
 * Todos os registros carregam `isDemo: true` e a interface exibe isso de forma
 * explícita ao visitante. Substituir por dados reais / Supabase antes de publicar.
 */
export const inventoryItems: InventoryItem[] = [
  {
    id: "demo-delivery-01",
    isDemo: true,
    familySlug: "delivery",
    model: "Delivery",
    version: null,
    modelYear: null,
    configuration: "Chassi para implemento urbano",
    application: "Distribuição urbana",
    condition: "novo",
    status: "sob_consulta",
    price: null,
    note: "Estrutura demonstrativa: os dados de versão, ano/modelo e condição comercial serão preenchidos com o estoque real.",
    validUntil: null,
    image: {
      alt: "Caminhão Delivery disponível para distribuição urbana",
      caption: "Foto do veículo em pátio, three-quarter frontal — foto real necessária.",
      aspect: "3/2",
    },
    updatedAt: "2026-01-05T12:00:00.000Z",
  },
  {
    id: "demo-constellation-01",
    isDemo: true,
    familySlug: "constellation",
    model: "Constellation",
    version: null,
    modelYear: null,
    configuration: "Aplicação regional",
    application: "Transporte regional",
    condition: "novo",
    status: "sob_consulta",
    price: null,
    note: "Estrutura demonstrativa: configuração e disponibilidade a confirmar conforme estoque.",
    validUntil: null,
    image: {
      alt: "Caminhão Constellation disponível para transporte regional",
      caption: "Foto do veículo em pátio, lateral — foto real necessária.",
      aspect: "3/2",
    },
    updatedAt: "2026-01-05T12:00:00.000Z",
  },
  {
    id: "demo-constellation-02",
    isDemo: true,
    familySlug: "constellation",
    model: "Constellation",
    version: null,
    modelYear: null,
    configuration: "Aplicação fora de estrada",
    application: "Agronegócio",
    condition: "seminovo",
    status: "sob_consulta",
    price: null,
    note: "Estrutura demonstrativa para seminovos. Avaliação de estado, quilometragem e documentação é feita caso a caso.",
    validUntil: null,
    image: {
      alt: "Caminhão Constellation seminovo para operação no agronegócio",
      caption: "Foto do seminovo em pátio, com identificação de estado — foto real necessária.",
      aspect: "3/2",
    },
    updatedAt: "2026-01-05T12:00:00.000Z",
  },
  {
    id: "demo-meteor-01",
    isDemo: true,
    familySlug: "meteor",
    model: "Meteor",
    version: null,
    modelYear: null,
    configuration: "Aplicação rodoviária",
    application: "Transporte rodoviário",
    condition: "novo",
    status: "sob_consulta",
    price: null,
    note: "Estrutura demonstrativa: composição e condição comercial dependem de campanha vigente e análise.",
    validUntil: null,
    image: {
      alt: "Caminhão Meteor disponível para transporte rodoviário",
      caption: "Foto do cavalo mecânico em pátio, three-quarter — foto real necessária.",
      aspect: "3/2",
    },
    updatedAt: "2026-01-05T12:00:00.000Z",
  },
];

export const inventoryUpdatedAt = "2026-01-05T12:00:00.000Z";
