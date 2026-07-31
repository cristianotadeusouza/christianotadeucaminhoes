import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { siteConfig } from "@/config/site";
import { siteSettings } from "@/data/site-settings";
import { whatsappMessages } from "@/services/whatsapp";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { BelcarAffiliation } from "@/components/common/BelcarAffiliation";

const title = "Contato | Christiano Tadeu, consultor Belcar Caminhões";
const description =
  "Fale com Christiano Tadeu, consultor de vendas da Belcar Caminhões, para avaliar a aquisição ou renovação de caminhões Volkswagen.";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Contato" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Contato"
            title="Fale com Christiano na Belcar Caminhões"
            description="O atendimento é pessoal e faz parte da operação comercial da Belcar. Conte o básico sobre carga e rota para agilizar a conversa."
          />
        </div>
      </section>

      <div className="container-content pt-10 sm:pt-12">
        <BelcarAffiliation />
      </div>

      <section className="container-content grid gap-10 py-10 sm:py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-road">Canais disponíveis</h2>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-4 text-result" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">WhatsApp do Christiano</p>
                <p className="text-muted-foreground">
                  Canal direto para o atendimento comercial Belcar Caminhões.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 text-engineering" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">Telefone</p>
                {siteConfig.phone ? (
                  <a
                    href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
                    className="text-technical text-muted-foreground hover:text-engineering hover:underline"
                  >
                    {siteConfig.phone}
                  </a>
                ) : (
                  <p className="text-technical text-muted-foreground">Telefone a ser informado.</p>
                )}
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-engineering" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">E-mail</p>
                {siteConfig.email ? (
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-muted-foreground hover:text-engineering hover:underline"
                  >
                    {siteConfig.email}
                  </a>
                ) : (
                  <p className="text-muted-foreground">E-mail a ser informado.</p>
                )}
              </div>
            </li>
          </ul>

          <div className="mt-8">
            <WhatsAppButton
              size="xl"
              message={whatsappMessages.general}
              context={{ placement: "contact_page" }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-road">Atendimento</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {siteSettings.serviceAreaNote}
          </p>
          {siteConfig.serviceArea && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Região atendida: {siteConfig.serviceArea}
            </p>
          )}
          <h3 className="mt-8 text-base font-semibold text-road">
            O que ajuda a acelerar a conversa
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>Tipo de carga e peso médio transportado</li>
            <li>Perfil de rota: urbana, regional ou rodoviária</li>
            <li>Implemento previsto</li>
            <li>Prazo pretendido para a aquisição</li>
          </ul>
          <CommercialDisclaimer className="mt-8">
            {siteSettings.commercialDisclaimer}
          </CommercialDisclaimer>
        </div>
      </section>
    </>
  );
}
