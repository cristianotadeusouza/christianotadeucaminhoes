import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildWhatsAppUrl, hasWhatsAppNumber } from "@/services/whatsapp";
import { trackEvent, type AnalyticsPayload } from "@/services/analytics";
import { cn } from "@/lib/utils";

/**
 * WhatsAppButton — botão de conversa com mensagem contextual.
 * Verde Resultado é usado exclusivamente aqui.
 */
export function WhatsAppButton({
  message,
  label = "Conversar pelo WhatsApp",
  context,
  className,
  size = "lg",
  variant = "whatsapp",
}: {
  message: string;
  label?: string;
  context?: AnalyticsPayload;
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}) {
  if (!hasWhatsAppNumber) {
    // Sem VITE_WHATSAPP_NUMBER configurado não publicamos link quebrado.
    return (
      <Button variant="quiet" size={size} className={className} disabled>
        <MessageCircle aria-hidden="true" />
        WhatsApp em configuração
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={buildWhatsAppUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("whatsapp_click", context)}
      >
        <MessageCircle aria-hidden="true" />
        {label}
      </a>
    </Button>
  );
}

/**
 * FloatingWhatsApp — botão flutuante discreto, respeitando safe-area do
 * celular e sem cobrir CTAs de conteúdo.
 */
export function FloatingWhatsApp({ message }: { message: string }) {
  if (!hasWhatsAppNumber) return null;

  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com Christiano pelo WhatsApp"
      onClick={() => trackEvent("whatsapp_click", { placement: "floating" })}
      className={cn(
        "fixed right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full",
        "bg-result text-result-foreground shadow-raised transition-transform duration-200",
        "hover:scale-105 focus-visible:scale-105 sm:h-14 sm:w-14",
      )}
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <MessageCircle className="size-6" aria-hidden="true" />
    </a>
  );
}
