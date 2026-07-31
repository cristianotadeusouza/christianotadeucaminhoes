/**
 * Camada de analytics desacoplada.
 *
 * Nesta versão nenhum provedor é instalado. Os eventos são despachados para
 * `window.dataLayer` (quando existir) e para um provedor opcional registrado
 * em runtime. Se o analytics estiver desativado, nada quebra.
 *
 * Para conectar Cloudflare Web Analytics ou alternativa compatível com
 * privacidade, ver docs/CLOUDFLARE-DEPLOYMENT.md.
 */
import { analyticsEnabled } from "@/config/site";

export type AnalyticsEvent =
  | "whatsapp_click"
  | "diagnostic_started"
  | "diagnostic_step_completed"
  | "diagnostic_completed"
  | "financing_contact"
  | "inventory_view"
  | "inventory_contact"
  | "truck_family_view"
  | "contact_form_submit"
  | "content_view";

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

type AnalyticsProvider = (event: AnalyticsEvent, payload?: AnalyticsPayload) => void;

let provider: AnalyticsProvider | null = null;

/** Permite plugar um provedor real no futuro sem tocar nos componentes. */
export function registerAnalyticsProvider(next: AnalyticsProvider) {
  provider = next;
}

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (!analyticsEnabled) return;
  try {
    provider?.(event, payload);
    const globalWindow = window as unknown as { dataLayer?: unknown[] };
    globalWindow.dataLayer?.push({ event, ...payload });
  } catch {
    /* analytics nunca deve interromper a navegação */
  }
}
