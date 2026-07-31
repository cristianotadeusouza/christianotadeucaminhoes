import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  MapPinned,
  Route as RouteIcon,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import type { ContentPost, OperationCategory, TruckFamily } from "@/types";
import { ContentCard } from "@/components/cards/ContentCard";
import { OperationCard } from "@/components/cards/OperationCard";
import { TruckFamilyCard } from "@/components/cards/TruckFamilyCard";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { Reveal } from "@/components/common/Reveal";
import { QuickConsult } from "@/components/common/QuickConsult";
import { SectionHeader } from "@/components/common/SectionHeader";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { siteSettings } from "@/data/site-settings";
import {
  contentRepository,
  operationRepository,
  truckFamilyRepository,
} from "@/services/repositories";
import { whatsappMessages } from "@/services/whatsapp";

export const Route = createFileRoute("/")({
  loader: async () => ({
    families: await truckFamilyRepository.list(),
    operations: (await operationRepository.listFeatured()).slice(0, 6),
    posts: (await contentRepository.list()).slice(0, 3),
  }),
  component: Index,
});

const decisionPoints = [
  {
    icon: ClipboardCheck,
    label: "Carga",
    description: "Peso, volume e frequência definem o ponto de partida.",
  },
  {
    icon: RouteIcon,
    label: "Rota",
    description: "Cidade, rodovia, piso e topografia mudam a configuração.",
  },
  {
    icon: Settings2,
    label: "Implemento",
    description: "O chassi precisa nascer compatível com o trabalho previsto.",
  },
  {
    icon: ShieldCheck,
    label: "Aquisição",
    description: "Proposta e financiamento entram depois da escolha técnica.",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Entender a operação",
    description: "Carga, rota, implemento, frequência de uso e o que hoje limita a produtividade.",
  },
  {
    number: "02",
    title: "Definir a configuração",
    description:
      "Família, eixos, cabine e composição avaliados em conjunto, sem começar pelo estoque.",
  },
  {
    number: "03",
    title: "Organizar a proposta",
    description:
      "Condições, alternativas de financiamento e prazos com premissas claras e confirmadas.",
  },
  {
    number: "04",
    title: "Acompanhar até trabalhar",
    description: "Documentação, implemento, entrega e continuidade no relacionamento comercial.",
  },
] as const;

const commitments = [
  "Recomendação orientada pela aplicação",
  "Informação comercial confirmada antes de publicar",
  "Contato direto e acompanhamento pessoal",
] as const;

function Index() {
  const { families, operations, posts } = Route.useLoaderData();

  return (
    <>
      <section className="home-hero relative isolate overflow-hidden bg-road text-road-foreground">
        <img
          src="/media/meteor-estrada.webp"
          alt="Caminhão Volkswagen Meteor em operação rodoviária"
          width={2400}
          height={1600}
          fetchPriority="high"
          decoding="async"
          className="home-hero__image absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="home-hero__scrim absolute inset-0 -z-10" aria-hidden="true" />
        <div className="home-hero__signal absolute inset-0 -z-[5]" aria-hidden="true" />
        <div className="container-content flex min-h-[650px] items-center py-16 sm:min-h-[700px] sm:py-24 lg:min-h-[740px]">
          <div className="home-hero__content max-w-3xl">
            <p className="eyebrow flex items-center gap-3 text-silver">
              <span className="h-px w-8 bg-action" aria-hidden="true" />
              Venda consultiva de caminhões Volkswagen
            </p>
            <h1 className="home-hero__title mt-6 max-w-3xl text-[clamp(2.65rem,7vw,5.8rem)] font-bold leading-[0.96] tracking-[-0.045em] text-white">
              O caminhão certo começa pela operação certa.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg lg:text-xl">
              Christiano Tadeu ajuda a transformar carga, rota e implemento em uma escolha mais
              segura — da configuração à proposta, com acompanhamento até a entrega.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="action" size="xl" className="group">
                <Link to="/diagnostico">
                  Analisar minha operação
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <WhatsAppButton
                message={whatsappMessages.general}
                label="Falar com Christiano"
                size="xl"
                variant="onDark"
                context={{ placement: "home_hero" }}
              />
            </div>
            <ul className="mt-9 grid max-w-2xl gap-3 text-sm text-white/75 sm:grid-cols-3">
              {commitments.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-result" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 bg-road/85 backdrop-blur-md">
          <div className="container-content flex flex-col gap-3 py-4 text-sm text-white/75 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 font-medium text-white">
              <MapPinned className="size-4 text-action" aria-hidden="true" />
              Atendimento consultivo, presencial e por WhatsApp
            </span>
            <Link
              to="/sobre"
              className="group inline-flex items-center gap-2 font-semibold text-white hover:text-silver"
            >
              Conheça o método de atendimento
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-border bg-background">
        <div className="container-content -mt-px grid gap-px overflow-hidden border-x border-b border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {decisionPoints.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group bg-background p-6 transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-road text-road-foreground transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h2 className="text-technical text-sm font-bold uppercase tracking-[0.12em] text-road">
                    {item.label}
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <QuickConsult />

      <section className="container-content py-20 sm:py-28">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <SectionHeader
              eyebrow="Comece pela necessidade"
              title="O trabalho do caminhão vem antes do modelo"
            />
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground lg:justify-self-end lg:text-lg">
              A mesma família pode atender operações muito diferentes. Por isso, a conversa começa
              nos pontos que realmente alteram produtividade, disponibilidade e custo por viagem.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {operations.map((operation: OperationCategory, index: number) => (
            <Reveal key={operation.slug} delay={index * 70} className="flex">
              <OperationCard operation={operation} index={index + 1} />
            </Reveal>
          ))}
        </div>
        <div className="mt-9">
          <Button asChild variant="quiet" size="lg" className="group">
            <Link to="/operacoes">
              Explorar todas as operações
              <ArrowRight
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid-lines border-y border-border bg-surface py-20 sm:py-28">
        <div className="container-content">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <SectionHeader
                eyebrow="Portfólio Volkswagen"
                title="Três famílias. Uma escolha orientada pela operação."
                description="Delivery, Constellation e Meteor cobrem perfis distintos. O modelo e a configuração final são confirmados depois do diagnóstico."
              />
              <Button asChild variant="institutional" size="lg" className="group lg:mb-1">
                <Link to="/caminhoes">
                  Ver famílias
                  <ArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {families.map((family: TruckFamily, index: number) => (
              <Reveal key={family.slug} delay={index * 90} className="flex">
                <TruckFamilyCard family={family} />
              </Reveal>
            ))}
          </div>
          <CommercialDisclaimer className="mt-10">
            {siteSettings.specificationDisclaimer}
          </CommercialDisclaimer>
        </div>
      </section>

      <section className="overflow-hidden bg-road text-road-foreground">
        <div className="container-content grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[420px] lg:min-h-[680px]">
            <img
              src="/media/meteor-estrada.webp"
              alt="Caminhão Volkswagen Meteor percorrendo uma rodovia"
              width={2400}
              height={1600}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[48%_center]"
            />
            <div className="absolute inset-0 bg-road/25" aria-hidden="true" />
            <div className="absolute bottom-6 left-6 right-6 border-l-4 border-action bg-road/90 p-5 backdrop-blur sm:bottom-10 sm:left-10 sm:right-auto sm:max-w-sm">
              <p className="text-technical text-sm font-semibold uppercase tracking-[0.12em] text-white">
                A ideia central
              </p>
              <p className="mt-2 text-sm leading-relaxed text-silver">
                Antes de falar apenas em preço, precisamos entender o trabalho que o caminhão deverá
                realizar.
              </p>
            </div>
          </div>
          <div className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <Reveal>
              <SectionHeader
                eyebrow="Do primeiro contato à entrega"
                title="Um processo claro para uma decisão de alto valor"
                description="Cada etapa reduz incerteza e organiza as informações que realmente precisam entrar na proposta."
                tone="dark"
              />
            </Reveal>
            <ol className="mt-10 space-y-8">
              {steps.map((step, index) => (
                <Reveal
                  as="li"
                  key={step.number}
                  delay={index * 80}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-t border-white/15 pt-6"
                >
                  <span className="text-technical text-sm font-bold text-action">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-silver">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Button asChild variant="onDark" size="lg" className="group mt-10">
              <Link to="/diagnostico">
                Iniciar diagnóstico
                <ArrowRight
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-content py-20 sm:py-28">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionHeader
              eyebrow="Conteúdo que ajuda a decidir"
              title="Critério comercial também se constrói com informação"
              description="Leituras diretas sobre configuração, operação, renovação e financiamento — sem promessas ou atalhos fáceis."
            />
            <Button asChild variant="quiet" size="lg" className="group lg:mb-1">
              <Link to="/conteudos">
                Ver todos os conteúdos
                <ArrowRight
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: ContentPost, index: number) => (
            <Reveal key={post.slug} delay={index * 80} className="flex">
              <ContentCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection
        title="Vamos entender o que o seu próximo caminhão precisa entregar?"
        description="Conte a rota, a carga e o objetivo da compra. Christiano organiza o próximo passo com você."
        context={{ placement: "home_final_cta" }}
      />
    </>
  );
}
