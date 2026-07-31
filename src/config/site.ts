/**
 * Configuração central do site.
 *
 * Todos os dados sensíveis/reais vêm de variáveis de ambiente (.env.example).
 * Nenhum telefone, e-mail ou endereço fictício é embutido no código.
 */

const env = import.meta.env as Record<string, string | undefined>;

/** Número de WhatsApp em formato internacional apenas com dígitos (ex.: 5531999999999). */
export const WHATSAPP_NUMBER = env.VITE_WHATSAPP_NUMBER ?? "5562982689070";

export const siteConfig = {
  siteName: "Christiano Tadeu | Consultor Belcar Caminhões",
  shortName: "Christiano Tadeu",
  signature: "O caminhão certo para sua operação.",
  siteUrl: env.VITE_SITE_URL ?? "https://caminhoes.christianotadeu.workers.dev",
  title: "Christiano Tadeu | Consultor Belcar Caminhões",
  description:
    "Atendimento comercial de caminhões Volkswagen por Christiano Tadeu, consultor de vendas da Belcar Caminhões em Goiás.",
  phone: env.VITE_CONTACT_PHONE ?? "+55 62 98268-9070",
  whatsapp: WHATSAPP_NUMBER,
  email: env.VITE_CONTACT_EMAIL ?? "cristiano.tadeu.souza@gmail.com",
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
  jobTitle: "Consultor de vendas",
  employer: {
    name: "Belcar Caminhões",
    legalName: "Belcar Caminhões e Máquinas Ltda.",
    cnpj: "02.212.918/0001-20",
    website: "https://www.belcarcaminhoes.com.br/",
    officialContact: "https://www.belcarcaminhoes.com.br/fale-conosco",
  },
  /** Aviso obrigatório de vínculo profissional e uso das marcas. */
  dealershipDisclosure:
    "Este é o site profissional de Christiano Tadeu, consultor de vendas da Belcar Caminhões. Não é o site institucional da Belcar Caminhões nem da Volkswagen Caminhões e Ônibus. Propostas, pedidos, condições, disponibilidade, faturamento e documentação são confirmados e formalizados pela Belcar Caminhões e Máquinas Ltda. Marcas e modelos pertencem aos respectivos titulares.",
  commercialDisclaimer:
    "Disponibilidade, configurações, preços, prazos e condições de financiamento dependem do estoque, da campanha vigente e da análise de crédito. A confirmação ocorre na proposta oficial da Belcar Caminhões.",
} as const;

export const analyticsEnabled = (env.VITE_ANALYTICS_ENABLED ?? "false") === "true";

export type SiteConfig = typeof siteConfig;
