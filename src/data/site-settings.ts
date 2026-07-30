import type { SiteSettings } from "@/types";
import { siteConfig } from "@/config/site";

export const siteSettings: SiteSettings = {
  signature: siteConfig.signature,
  serviceAreaNote:
    "Atendimento presencial e por WhatsApp. A região atendida é confirmada no primeiro contato.",
  commercialDisclaimer: siteConfig.commercialDisclaimer,
  brandDisclosure: siteConfig.dealershipDisclosure,
  specificationDisclaimer:
    "As especificações podem variar conforme versão, configuração, ano/modelo e aplicação. Confirme os dados na proposta e na documentação oficial do veículo.",
  financingDisclaimer:
    "As condições dependem do perfil do cliente, do veículo, da campanha vigente e da análise de crédito. Christiano acompanha o processo e ajuda a organizar uma proposta adequada à realidade da empresa.",
};
