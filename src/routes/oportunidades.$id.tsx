import { createFileRoute, notFound } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { Badge } from "@/components/ui/badge";
import { inventoryStatusLabels } from "@/components/cards/InventoryCard";
import { whatsappMessages } from "@/services/whatsapp";
import { siteSettings } from "@/data/site-settings";
import { inventoryRepository } from "@/services/repositories";

export const Route = createFileRoute("/oportunidades/$id")({
  loader: async ({ params }) => {
    const item = await inventoryRepository.getById(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Oportunidade indisponível" }, { name: "robots", content: "noindex" }],
      };
    }
    const { item } = loaderData;
    const title = `${item.model}${item.version ? ` ${item.version}` : ""} | Oportunidade`;
    const description =
      item.note ??
      `Detalhes de configuração e aplicação indicada para ${item.model}. Disponibilidade confirmada no atendimento.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: InventoryDetail,
});

function InventoryDetail() {
  const { item } = Route.useLoaderData();
  const identifier = [item.model, item.configuration].filter(Boolean).join(" · ");

  const rows: { label: string; value: string }[] = [
    { label: "Modelo", value: item.model },
    { label: "Versão", value: item.version ?? "A confirmar" },
    { label: "Ano/modelo", value: item.modelYear ?? "A confirmar" },
    { label: "Configuração", value: item.configuration ?? "A confirmar" },
    { label: "Aplicação indicada", value: item.application ?? "A confirmar" },
    { label: "Condição", value: item.condition === "novo" ? "Novo" : "Seminovo" },
    { label: "Situação", value: inventoryStatusLabels[item.status] },
    {
      label: "Valor",
      value:
        item.price === null
          ? "Sob consulta"
          : item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
  ];

  return (
    <>
      <section className="border-b border-border bg-surface py-8">
        <div className="container-content">
          <Breadcrumbs
            items={[
              { label: "Início", to: "/" },
              { label: "Oportunidades", to: "/oportunidades" },
              { label: item.model },
            ]}
          />
        </div>
      </section>

      <section className="container-content grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_0.9fr]">
        <ImagePlaceholder priority slot={item.image} />

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-engineering/40 text-engineering">
              {inventoryStatusLabels[item.status]}
            </Badge>
            {item.isDemo && (
              <Badge variant="outline" className="border-silver text-muted-foreground">
                Estrutura demonstrativa
              </Badge>
            )}
          </div>

          <h1 className="text-technical mt-4 text-3xl font-bold uppercase tracking-wide text-road sm:text-4xl">
            {item.model}
            {item.version ? ` ${item.version}` : ""}
          </h1>

          <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-3">
                <dt className="text-foreground">{row.label}</dt>
                <dd className="text-technical text-right text-muted-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>

          {item.note && (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
          )}

          <div className="mt-8">
            <WhatsAppButton
              size="xl"
              message={whatsappMessages.inventory(identifier)}
              label="Verificar disponibilidade"
              context={{ placement: "inventory_detail", item: item.id }}
            />
          </div>

          <CommercialDisclaimer className="mt-6">
            {siteSettings.commercialDisclaimer}
          </CommercialDisclaimer>
        </div>
      </section>

      <CTASection />
    </>
  );
}
