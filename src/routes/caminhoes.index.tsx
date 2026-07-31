import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import type { TruckFamily } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { TruckFamilyCard } from "@/components/cards/TruckFamilyCard";
import { siteSettings } from "@/data/site-settings";
import { truckFamilyRepository } from "@/services/repositories";
import { Button } from "@/components/ui/button";

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
        <h2 className="sr-only">Famílias de caminhões disponíveis</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {families.map((family: TruckFamily) => (
            <TruckFamilyCard key={family.slug} family={family} />
          ))}
        </div>
        <CommercialDisclaimer className="mt-10">
          {siteSettings.specificationDisclaimer}
        </CommercialDisclaimer>
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-engineering/20 bg-engineering/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-road text-white">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-road">Fichas técnicas e cores</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Consulte 23 modelos e 34 códigos de cores recebidos para referência.
              </p>
            </div>
          </div>
          <Button asChild variant="institutional" className="shrink-0">
            <Link to="/fichas-tecnicas">Abrir documentação</Link>
          </Button>
        </div>
      </section>

      <CTASection />
    </>
  );
}
