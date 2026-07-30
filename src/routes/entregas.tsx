import { createFileRoute, Link } from "@tanstack/react-router";

import type { CaseStudy } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { EmptyState } from "@/components/common/EmptyState";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { Button } from "@/components/ui/button";
import { caseStudyRepository } from "@/services/repositories";
import type { Testimonial } from "@/types";

const title = "Entregas e casos de clientes | Christiano Tadeu";
const description =
  "Casos de operação e depoimentos publicados apenas com autorização por escrito dos clientes atendidos.";

export const Route = createFileRoute("/entregas")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  loader: async () => ({
    cases: await caseStudyRepository.listPublished(),
    testimonials: await caseStudyRepository.listTestimonials(),
  }),
  component: DeliveriesPage,
});

function DeliveriesPage() {
  const { cases, testimonials } = Route.useLoaderData();

  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Entregas e casos" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Prova"
            title="Entregas, casos e depoimentos"
            description="Cada caso registra a situação inicial, a necessidade identificada e o motivo técnico da configuração escolhida."
          />
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        {cases.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {cases.map((item: CaseStudy) => (
              <CaseStudyCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Casos em preparação"
            description="Nenhum caso é publicado sem autorização por escrito do cliente, incluindo o uso das fotos. À medida que as autorizações forem coletadas, as entregas aparecem aqui."
            action={
              <Button asChild variant="institutional">
                <Link to="/diagnostico">Analisar minha operação</Link>
              </Button>
            }
          />
        )}

        {testimonials.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-semibold text-road sm:text-2xl">Depoimentos</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {testimonials.map((item: Testimonial) => (
                <TestimonialCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>

      <CTASection />
    </>
  );
}
