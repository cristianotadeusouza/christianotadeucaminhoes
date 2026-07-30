import { createFileRoute, notFound } from "@tanstack/react-router";

import type { ImageSlot, SpecField } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { FAQ } from "@/components/common/FAQ";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { whatsappMessages } from "@/services/whatsapp";
import { siteSettings } from "@/data/site-settings";
import { truckFamilyRepository } from "@/services/repositories";

export const Route = createFileRoute("/caminhoes/$family")({
  loader: async ({ params }) => {
    const family = await truckFamilyRepository.getBySlug(params.family);
    if (!family) throw notFound();
    return { family };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Família indisponível" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.family.name} | Caminhões Volkswagen`;
    const description = loaderData.family.tagline;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: FamilyPage,
});

function FamilyPage() {
  const { family } = Route.useLoaderData();

  return (
    <>
      <section className="surface-road road-lines">
        <div className="container-content grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Breadcrumbs
              items={[
                { label: "Início", to: "/" },
                { label: "Caminhões", to: "/caminhoes" },
                { label: family.name },
              ]}
            />
            <h1 className="text-technical mt-6 text-4xl font-bold uppercase tracking-wide text-road-foreground sm:text-5xl">
              {family.name}
            </h1>
            <p className="mt-3 text-lg text-silver">{family.tagline}</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-silver">{family.intro}</p>
            <div className="mt-8">
              <WhatsAppButton
                size="xl"
                message={whatsappMessages.family(family.name)}
                label={`Falar sobre o ${family.name}`}
                context={{ placement: "family_hero", family: family.slug }}
              />
            </div>
          </div>
          <ImagePlaceholder priority slot={family.gallery[0]} />
        </div>
      </section>

      <section className="container-content grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-road sm:text-2xl">Perfil de uso</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {family.usageProfile.map((item: string) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-action" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-road sm:text-2xl">Operações indicadas</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {family.recommendedOperations.map((item: string) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-engineering" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="container-content">
          <SectionHeader eyebrow="Critérios" title="Pontos que merecem atenção na escolha" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {family.reasonsToConsider.map((reason: { title: string; description: string }) => (
              <div
                key={reason.title}
                className="rounded-lg border border-border bg-card p-5 shadow-card"
              >
                <h3 className="text-base font-semibold text-road">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <SectionHeader
          eyebrow="Configurações"
          title="Como as versões costumam ser organizadas"
          description="Os campos técnicos são preenchidos com dados oficiais confirmados na proposta. Nada é estimado aqui."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {family.configurations.map(
            (configuration: { name: string; summary: string; specs: SpecField[] }) => (
              <div
                key={configuration.name}
                className="rounded-lg border border-border bg-card p-6 shadow-card"
              >
                <h3 className="text-technical text-lg font-bold uppercase tracking-wide text-road">
                  {configuration.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {configuration.summary}
                </p>
                <dl className="mt-5 divide-y divide-border border-t border-border text-sm">
                  {configuration.specs.map((spec: SpecField) => (
                    <div key={spec.label} className="flex justify-between gap-4 py-2.5">
                      <dt className="text-foreground">{spec.label}</dt>
                      <dd className="text-technical text-right text-muted-foreground">
                        {spec.value ?? "A confirmar"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ),
          )}
        </div>
        <CommercialDisclaimer className="mt-8">
          {siteSettings.specificationDisclaimer}
        </CommercialDisclaimer>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="container-content">
          <SectionHeader eyebrow="Galeria" title={`${family.name} em operação`} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {family.gallery.map((slot: ImageSlot) => (
              <ImagePlaceholder key={slot.alt} slot={slot} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <FAQ items={family.faq} />
      </section>

      <CTASection
        title={`Quer avaliar se o ${family.name} atende sua operação?`}
        message={whatsappMessages.family(family.name)}
        context={{ placement: "family_cta", family: family.slug }}
      />
    </>
  );
}
