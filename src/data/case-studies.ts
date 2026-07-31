import type { CaseStudy, Testimonial } from "@/types";

/**
 * Casos e depoimentos.
 *
 * REGRA: nenhum cliente, entrega, cidade ou depoimento é inventado.
 * Os registros abaixo existem apenas como ESTRUTURA e estão com
 * `isPublished: false` — a interface pública só exibe itens publicados
 * E com autorização de mídia. Enquanto não houver casos reais, o site
 * mostra um estado editorial elegante.
 */
export const caseStudies: CaseStudy[] = [
  {
    id: "case-template-01",
    isPublished: false,
    hasMediaAuthorization: false,
    title: "Modelo de caso: renovação de frota em distribuição regional",
    customerLabel: "Cliente a definir",
    city: null,
    segment: "Distribuição",
    initialSituation:
      "Descrever a situação encontrada: idade da frota, custo de manutenção, dias parados e impacto na operação.",
    need: "Descrever a necessidade identificada durante a análise da operação.",
    chosenVehicle: null,
    reasonForChoice: "Registrar o motivo técnico e comercial da configuração escolhida.",
    purchaseMode: null,
    result: null,
    media: [
      {
        alt: "Entrega do caminhão ao cliente",
        caption: "Foto da entrega com autorização do cliente. Foto real necessária.",
        aspect: "3/2",
      },
    ],
    testimonialId: "testimonial-template-01",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-template-01",
    isPublished: false,
    hasMediaAuthorization: false,
    quote: "Depoimento real do cliente, coletado e autorizado por escrito.",
    author: "Cliente a definir",
  },
];

/** Somente casos publicados E autorizados chegam à interface pública. */
export const publishedCaseStudies = caseStudies.filter(
  (item) => item.isPublished && item.hasMediaAuthorization,
);

export const publishedTestimonials = testimonials.filter(
  (item) => item.isPublished && item.hasMediaAuthorization,
);
