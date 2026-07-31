/**
 * Configuração central do site.
 *
 * Todos os dados sensíveis/reais vêm de variáveis de ambiente (.env.example).
 * Nenhum telefone, e-mail ou endereço fictício é embutido no código.
 */

const env = import.meta.env as Record<string, string | undefined>;

/** Número de WhatsApp em formato internacional apenas com dígitos (ex.: 5531999999999). */
export const WHATSAPP_NUMBER = env.VITE_WHATSAPP_NUMBER ?? "";

export const siteConfig = {
  siteName: "Christiano Tadeu — Caminhões Volkswagen",
  shortName: "Christiano Tadeu",
  signature: "O caminhão certo para sua operação.",
  siteUrl: env.VITE_SITE_URL ?? "",
  title: "Christiano Tadeu | Caminhões Volkswagen",
  description:
    "Venda consultiva de caminhões Volkswagen: análise da operação, indicação de configuração, financiamento e acompanhamento até a entrega.",
  phone: env.VITE_CONTACT_PHONE ?? "",
  whatsapp: WHATSAPP_NUMBER,
  email: env.VITE_CONTACT_EMAIL ?? "",
  city: env.VITE_CITY ?? "",
  state: env.VITE_STATE ?? "",
  /** Região de atendimento — confirmar com Christiano antes de publicar. */
  serviceArea: env.VITE_SERVICE_AREA ?? "",
  socialLinks: {
    instagram: env.VITE_INSTAGRAM_URL ?? "",
    linkedin: env.VITE_LINKEDIN_URL ?? "",
    youtube: env.VITE_YOUTUBE_URL ?? "",
  },
  googleSiteVerification: env.VITE_GOOGLE_SITE_VERIFICATION ?? "",
  legalName: "Christiano Tadeu",
  /** Aviso obrigatório de relação com a marca Volkswagen. */
  dealershipDisclosure:
    "Este site representa a atuação profissional de Christiano Tadeu na venda consultiva de caminhões. Não se trata de site oficial da Volkswagen Caminhões e Ônibus. Marcas, nomes e modelos citados pertencem aos respectivos titulares.",
  commercialDisclaimer:
    "Disponibilidade, configurações, condições comerciais e de financiamento estão sujeitas a estoque, campanha vigente e análise de crédito.",
} as const;

export const analyticsEnabled = (env.VITE_ANALYTICS_ENABLED ?? "false") === "true";

export type SiteConfig = typeof siteConfig;
