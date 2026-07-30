import { Link } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { whatsappMessages } from "@/services/whatsapp";
import { cn } from "@/lib/utils";

/**
 * CTASection — bloco de conversão reutilizável no fim das páginas.
 */
export function CTASection({
  title = "Vamos avaliar qual caminhão faz sentido para sua operação?",
  description = "A conversa começa pela sua carga, sua rota e o que o caminhão precisa entregar. A partir daí, montamos as alternativas.",
  message = whatsappMessages.general,
  context,
  className,
}: {
  title?: string;
  description?: string;
  message?: string;
  context?: Record<string, string>;
  className?: string;
}) {
  return (
    <section className={cn("surface-road road-lines", className)}>
      <div className="container-content py-14 sm:py-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-road-foreground sm:text-3xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-silver">{description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton message={message} context={context} size="xl" />
            <Button asChild variant="onDark" size="xl">
              <Link to="/diagnostico">Preencher diagnóstico</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
