/** Estrutura de navegação — mantida curta com agrupamento. */
export interface NavItem {
  label: string;
  to: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const primaryNav: NavItem[] = [
  { label: "Caminhões", to: "/caminhoes" },
  { label: "Operações", to: "/operacoes" },
  { label: "Oportunidades", to: "/oportunidades" },
  { label: "Financiamento", to: "/financiamento" },
];

export const navGroups: NavGroup[] = [
  {
    label: "Mais",
    items: [
      {
        label: "Diagnóstico da operação",
        to: "/diagnostico",
        description: "Um roteiro curto para chegar à proposta certa.",
      },
      {
        label: "Entregas e casos",
        to: "/entregas",
        description: "Como as operações foram resolvidas.",
      },
      { label: "Conteúdos", to: "/conteudos", description: "Escolha, operação e financiamento." },
      { label: "Sobre Christiano", to: "/sobre", description: "Atendimento consultivo em campo." },
      { label: "Contato", to: "/contato", description: "Fale direto pelos canais disponíveis." },
    ],
  },
];

export const footerNav: NavGroup[] = [
  {
    label: "Caminhões",
    items: [
      { label: "Todas as famílias", to: "/caminhoes" },
      { label: "Delivery", to: "/caminhoes/delivery" },
      { label: "Constellation", to: "/caminhoes/constellation" },
      { label: "Meteor", to: "/caminhoes/meteor" },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Caminhões por operação", to: "/operacoes" },
      { label: "Estoque e oportunidades", to: "/oportunidades" },
      { label: "Financiamento", to: "/financiamento" },
      { label: "Diagnóstico da operação", to: "/diagnostico" },
    ],
  },
  {
    label: "Institucional",
    items: [
      { label: "Sobre Christiano", to: "/sobre" },
      { label: "Entregas e casos", to: "/entregas" },
      { label: "Conteúdos", to: "/conteudos" },
      { label: "Contato", to: "/contato" },
      { label: "Política de privacidade", to: "/privacidade" },
    ],
  },
];
