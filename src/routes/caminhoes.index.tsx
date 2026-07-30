import { createFileRoute } from "@tanstack/react-router";

import type { TruckFamily } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { TruckFamilyCard } from "@/components/cards/TruckFamilyCard";
import { siteSettings } from "@/data/site-settings";
import { truckFamilyRepository } from "@/services/repositories";

const title = "Caminhões Volkswagen: Delivery, Constellation e Meteor";
const description =
  "Conheça as famílias de caminhões Volkswagen e os critérios técnicos que definem a configuração certa para cada operação.";

export const Route = createFileRoute("/caminhoes/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  loader: async () => ({ families: await truckFamilyRepository.list() }),
  component: FamiliesPage,
});

function FamiliesPage() {
  const { families } = Route.useLoaderData();

  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Caminhões" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Famílias"
            title="Caminhões Volkswagen por perfil de aplicação"
            description="A família é o ponto de partida; a configuração final depende da carga real, da rota e do implemento previsto."
          />
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {families.map((family: TruckFamily) => (
            <TruckFamilyCard key={family.slug} family={family} />
          ))}
        </div>
        <CommercialDisclaimer className="mt-10">
          {siteSettings.specificationDisclaimer}
        </CommercialDisclaimer>
      </section>

      <CTASection />
    </>
  );
}
