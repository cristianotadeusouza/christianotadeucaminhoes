import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { siteSettings } from "@/data/site-settings";
import { BelcarAffiliation } from "@/components/common/BelcarAffiliation";
import { siteConfig } from "@/config/site";

const title = "Sobre Christiano Tadeu | Venda consultiva de caminhões";
const description =
  "Conheça o trabalho de Christiano Tadeu, consultor de vendas da Belcar Caminhões em Goiás.";

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
      "Documentação, implemento e prazo continuam sendo acompanhados depois da assinatura e até a entrega.",
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
              title="Christiano Tadeu, consultor de vendas na Belcar Caminhões"
              description="Atendimento a transportadores e empresas que dependem do caminhão para trabalhar. A conversa começa pela operação e segue pelos processos comerciais oficiais da Belcar."
            />
            <aside className="surface-road road-lines relative overflow-hidden rounded-2xl border border-white/10 p-8 shadow-raised sm:p-10">
              <BrandLogo
                variant="dark"
                lockup="full"
                size="lg"
                asLink={false}
                className="max-w-[19rem]"
              />
              <p className="mt-9 text-xl font-semibold leading-snug text-white sm:text-2xl">
                “Conhecimento de caminhão é importante. Conhecimento da operação é o que orienta uma
                compra adequada.”
              </p>
              <div className="mt-8 border-t border-white/15 pt-5 text-sm leading-relaxed text-silver">
                Atendimento próximo, informação confirmada e responsabilidade até o caminhão começar
                a trabalhar.
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-content py-10 sm:py-14">
        <BelcarAffiliation />
      </section>

      <section className="container-content pb-14 sm:pb-20">
        <SectionHeader
          eyebrow="Como trabalho"
          title="Quatro compromissos que orientam o atendimento"
        />
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
          <h2 className="text-xl font-semibold text-road sm:text-2xl">
            Atendimento e transparência
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {siteSettings.serviceAreaNote}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {siteSettings.brandDisclosure}
          </p>
          <p className="mt-4 text-sm font-medium text-road">
            {siteConfig.employer.legalName} | CNPJ {siteConfig.employer.cnpj}
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
