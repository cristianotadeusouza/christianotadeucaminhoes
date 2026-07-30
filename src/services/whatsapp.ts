/**
 * Montagem de links de WhatsApp com mensagem contextual.
 *
 * O número vem exclusivamente de `VITE_WHATSAPP_NUMBER`. Nenhum número
 * fictício é embutido no código. Quando a variável não estiver configurada,
 * os componentes exibem um estado alternativo em vez de um link quebrado.
 */
import { WHATSAPP_NUMBER } from "@/config/site";
import { trackEvent, type AnalyticsPayload } from "@/services/analytics";

export const hasWhatsAppNumber = WHATSAPP_NUMBER.replace(/\D/g, "").length >= 10;

export function buildWhatsAppUrl(message: string): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  if (!digits) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${digits}?text=${text}`;
}

export const whatsappMessages = {
  general: "Olá, Christiano. Vim pelo site e gostaria de conversar sobre um caminhão Volkswagen.",
  family: (familyName: string) =>
    `Olá, Christiano. Vi no site a família ${familyName} e quero entender se ela atende minha operação.`,
  operation: (operationName: string) =>
    `Olá, Christiano. Minha operação é de ${operationName.toLowerCase()} e quero avaliar qual caminhão faz sentido.`,
  inventory: (identifier: string) =>
    `Olá, Christiano. Tenho interesse na oportunidade ${identifier}. Ela ainda está disponível?`,
  financing:
    "Olá, Christiano. Gostaria de solicitar uma análise inicial de financiamento para aquisição de caminhão.",
  content: (title: string) =>
    `Olá, Christiano. Li o conteúdo "${title}" no site e gostaria de conversar sobre minha operação.`,
} as const;

/** Abre o WhatsApp registrando o evento de analytics. */
export function openWhatsApp(message: string, payload: AnalyticsPayload = {}) {
  trackEvent("whatsapp_click", payload);
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}
