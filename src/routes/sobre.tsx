import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { siteSettings } from "@/data/site-settings";

const title = "Sobre Christiano Tadeu | Venda consultiva de caminhões";
const description =
  "Atendimento consultivo em campo: análise da operação, indicação técnica de configuração e acompanhamento até a entrega do caminhão.";

const principles = [
  {
    title: "Diagnóstico antes da proposta",
    description:
      "Nenhuma recomendação sai sem entender carga, rota, implemento e frequência de uso. É o que evita comprar caminhão errado.",
  },
  {
    title: "Nada de dado inventado",
    description:
      "Especificação, prazo e condição comercial só aparecem quando podem ser confirmados na documentação oficial ou na proposta.",
  },
  {
    title: "Acompanhamento até a entrega",
    description:
      "Documentação, implemento e prazo continuam sendo acompanhados depois da assinatura — não só até a venda.",
  },
  {
    title: "Relação de longo prazo",
    description:
      "O objetivo é a próxima compra, a renovação e a indicação. Isso só acontece quando o primeiro caminhão trabalha bem.",
  },
];

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Sobre Christiano" }]} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <SectionHeader
              as="h1"
              eyebrow="Sobre"
              title="Christiano Tadeu, consultor de caminhões Volkswagen"
              description="Atuação consultiva em campo, junto de transportadores e empresas que dependem do caminhão para faturar. A conversa começa pela operação e termina no veículo que faz sentido para ela."
            />
            <ImagePlaceholder
              priority
              slot={{
                alt: "Christiano Tadeu em atendimento a um cliente transportador",
                caption: "Retrato profissional de Christiano em campo — foto real necessária.",
                aspect: "4/3",
              }}
            />
          </div>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <SectionHeader eyebrow="Como trabalho" title="Quatro compromissos que orientam o atendimento" />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-lg border border-border bg-card p-6 shadow-card"
            >
              <h3 className="text-lg font-semibold text-road">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="container-content max-w-3xl">
          <h2 className="text-xl font-semibold text-road sm:text-2xl">Atendimento e transparência</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {siteSettings.serviceAreaNote}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {siteSettings.brandDisclosure}
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
