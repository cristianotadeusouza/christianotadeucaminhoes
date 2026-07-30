import { createFileRoute } from "@tanstack/react-router";

import type { OperationCategory, TruckFamilySlug } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { whatsappMessages } from "@/services/whatsapp";
import { operationRepository } from "@/services/repositories";

const title = "Caminhões por operação | Christiano Tadeu";
const description =
  "Distribuição urbana, bebidas, alimentos, construção, agronegócio e mais: os critérios técnicos que definem o caminhão certo para cada operação.";

export const Route = createFileRoute("/operacoes")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  loader: async () => ({ operations: await operationRepository.list() }),
  component: OperationsPage,
});

function OperationsPage() {
  const { operations } = Route.useLoaderData();

  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Operações" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Operações"
            title="A escolha começa pela operação, não pelo modelo"
            description="Cada perfil abaixo tem desafios e critérios próprios. Use como referência antes de conversar sobre configuração."
          />
          <nav aria-label="Operações listadas" className="mt-8 flex flex-wrap gap-2">
            {operations.map((operation: OperationCategory) => (
              <a
                key={operation.slug}
                href={`#${operation.slug}`}
                className="text-technical rounded-md border border-border bg-card px-3 py-1.5 text-xs uppercase tracking-wide text-foreground hover:border-engineering/40 hover:text-engineering"
              >
                {operation.shortLabel}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="container-content space-y-14 py-14 sm:py-20">
        {operations.map((operation: OperationCategory) => (
          <section
            key={operation.slug}
            id={operation.slug}
            className="scroll-mt-28 border-t border-border pt-10 first:border-t-0 first:pt-0"
          >
            <h2 className="text-2xl font-semibold text-road">{operation.name}</h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {operation.context}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-5 shadow-card">
                <h3 className="text-technical text-sm font-bold uppercase tracking-wide text-road">
                  Desafios comuns
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {operation.challenges.map((item: string) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-action" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-card">
                <h3 className="text-technical text-sm font-bold uppercase tracking-wide text-road">
                  Critérios de escolha
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {operation.selectionCriteria.map((item: string) => (
                    <li key={item} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-px w-3 shrink-0 bg-engineering"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5">
                <h3 className="text-technical text-sm font-bold uppercase tracking-wide text-road">
                  Perguntas antes da proposta
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {operation.questionsBeforeProposal.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <WhatsAppButton
                message={whatsappMessages.operation(operation.name)}
                label="Conversar sobre esta operação"
                context={{ placement: "operation_section", operation: operation.slug }}
              />
              {operation.relatedFamilies.map((slug: TruckFamilySlug) => (
                <Button key={slug} asChild variant="quiet">
                  <Link to="/caminhoes/$family" params={{ family: slug }}>
                    Ver família {slug}
                  </Link>
                </Button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <CTASection />
    </>
  );
}
