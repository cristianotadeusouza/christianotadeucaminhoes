import { createFileRoute, Link } from "@tanstack/react-router";

import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { EmptyState } from "@/components/common/EmptyState";
import { TruckFamilyCard } from "@/components/cards/TruckFamilyCard";
import { OperationCard } from "@/components/cards/OperationCard";
import { ContentCard } from "@/components/cards/ContentCard";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { Button } from "@/components/ui/button";
import { whatsappMessages } from "@/services/whatsapp";
import { siteSettings } from "@/data/site-settings";
import {
  truckFamilyRepository,
  operationRepository,
  contentRepository,
  caseStudyRepository,
} from "@/services/repositories";

export const Route = createFileRoute("/")({
  loader: async () => ({
    families: await truckFamilyRepository.list(),
    operations: await operationRepository.listFeatured(),
    posts: (await contentRepository.list()).slice(0, 3),
    testimonials: await caseStudyRepository.listTestimonials(),
  }),
  component: Index,
});

const steps = [
  {
    title: "1. Entender a operação",
    description:
      "Carga, rota, implemento e frequência de uso. É essa conversa que reduz a lista de configurações possíveis.",
  },
  {
    title: "2. Indicar a configuração",
    description:
      "A recomendação vem da adequação técnica ao seu dia a dia, não da preferência por um modelo específico.",
  },
  {
    title: "3. Organizar a proposta",
    description:
      "Condições comerciais, alternativas de financiamento e prazos, com o que for possível confirmar por escrito.",
  },
  {
    title: "4. Acompanhar até a entrega",
    description:
      "Documentação, implemento, prazo e entrega. O acompanhamento continua depois que o caminhão sai do pátio.",
  },
];

function Index() {
  const { families, operations, posts, testimonials } = Route.useLoaderData();

  return (
    <>
      <section className="surface-road road-lines">
        <div className="container-content grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow text-silver">Venda consultiva de caminhões Volkswagen</p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-road-foreground sm:text-4xl lg:text-5xl">
              {siteSettings.signature}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-silver sm:text-lg">
              Christiano Tadeu analisa a sua operação — carga, rota e implemento — antes de indicar
              qualquer configuração. A decisão fica técnica, e o caminhão passa a trabalhar a favor
              do seu resultado.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton
                message={whatsappMessages.general}
                size="xl"
                context={{ placement: "home_hero" }}
              />
              <Button asChild variant="onDark" size="xl">
                <Link to="/diagnostico">Analisar minha operação</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-silver">
              {siteSettings.serviceAreaNote}
            </p>
          </div>

          <ImagePlaceholder
            priority
            slot={{
              alt: "Caminhão Volkswagen em operação de transporte de cargas",
              caption: "Foto principal do caminhão em operação — foto real necessária.",
              aspect: "4/3",
            }}
          />
        </div>
      </section>

      <section className="container-content py-16 sm:py-20">
        <SectionHeader
          eyebrow="Comece pela operação"
          title="O caminhão certo depende do que ele precisa fazer todo dia"
          description="Cada operação tem restrições próprias. Veja os critérios que pesam na escolha para os perfis mais comuns."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {operations.map((operation) => (
            <OperationCard key={operation.slug} operation={operation} />
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="quiet" size="lg">
            <Link to="/operacoes">Ver todas as operações</Link>
          </Button>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="container-content">
          <SectionHeader
            eyebrow="Famílias"
            title="Delivery, Constellation e Meteor"
            description="Três famílias com aplicações distintas. A escolha entre elas começa pelo peso real transportado e pelo perfil de rota."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {families.map((family) => (
              <TruckFamilyCard key={family.slug} family={family} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-content py-16 sm:py-20">
        <SectionHeader
          eyebrow="Como funciona"
          title="Um método simples, do primeiro contato à entrega"
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.title} className="border-t-2 border-action pt-4">
              <h3 className="text-technical text-sm font-bold uppercase tracking-wide text-road">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface py-16 sm:py-20">
        <div className="container-content">
          <SectionHeader
            eyebrow="Entregas e clientes"
            title="Casos reais, publicados só com autorização"
            description="Nenhum caso ou depoimento é publicado sem a autorização por escrito do cliente."
          />
          <div className="mt-10">
            {testimonials.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {testimonials.map((item) => (
                  <TestimonialCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Casos em preparação"
                description="As entregas e depoimentos serão publicados aqui à medida que os clientes autorizarem o uso das informações e das imagens."
                action={
                  <Button asChild variant="quiet">
                    <Link to="/entregas">Ver a página de entregas</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="container-content py-16 sm:py-20">
        <SectionHeader
          eyebrow="Conteúdos"
          title="Material para decidir com critério"
          description="Textos curtos sobre escolha de configuração, operação e financiamento."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ContentCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="quiet" size="lg">
            <Link to="/conteudos">Ver todos os conteúdos</Link>
          </Button>
        </div>
        <CommercialDisclaimer className="mt-10">
          {siteSettings.commercialDisclaimer}
        </CommercialDisclaimer>
      </section>

      <CTASection />
    </>
  );
}
