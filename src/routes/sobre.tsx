import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Handshake,
  Mail,
  MapPinned,
  MessageCircle,
  Phone,
  SearchCheck,
  Truck,
} from "lucide-react";

import { BelcarAffiliation } from "@/components/common/BelcarAffiliation";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CTASection } from "@/components/common/CTASection";
import { SectionHeader } from "@/components/common/SectionHeader";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { siteSettings } from "@/data/site-settings";
import { whatsappMessages } from "@/services/whatsapp";

const title = "Sobre Christiano Tadeu | Atendimento de caminhões Volkswagen";
const description =
  "Conheça a forma de trabalhar de Christiano Tadeu, vendedor de caminhões Volkswagen na Belcar Caminhões em Goiás.";

const workRhythm = [
  {
    icon: Phone,
    title: "Telefone para resolver",
    description:
      "Uma ligação direta ajuda a entender urgência, operação, objeção e quem participa da decisão.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp para dar agilidade",
    description:
      "Áudios, vídeos, documentos e retornos ficam organizados no canal que o cliente já usa no dia a dia.",
  },
  {
    icon: MapPinned,
    title: "Visita para conhecer a realidade",
    description:
      "Pátio, rota, implemento e rotina da empresa dizem muito mais do que uma escolha feita apenas por catálogo.",
  },
  {
    icon: ClipboardCheck,
    title: "Acompanhamento para não perder o fio",
    description:
      "Cada conversa termina com uma próxima ação clara, uma data e a informação que ainda precisa ser confirmada.",
  },
];

const serviceJourney = [
  {
    number: "01",
    icon: SearchCheck,
    title: "Entender o trabalho",
    description:
      "A conversa começa por carga, caminhão atual, rota, implemento, quilometragem e prazo de compra.",
  },
  {
    number: "02",
    icon: Truck,
    title: "Organizar as alternativas",
    description:
      "Família, modelo, tração e configuração são comparados com base na operação e na documentação disponível.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Confirmar pela Belcar",
    description:
      "Disponibilidade, condição, crédito, prazo, pedido e faturamento seguem os processos oficiais da concessionária.",
  },
  {
    number: "04",
    icon: Handshake,
    title: "Acompanhar até trabalhar",
    description:
      "O atendimento continua na documentação, no implemento, na entrega e na confirmação de que o caminhão entrou na operação.",
  },
];

const commitments = [
  {
    title: "Falar com clareza",
    description:
      "Se uma informação depende de estoque, campanha, análise de crédito ou validação técnica, isso é dito desde o começo.",
  },
  {
    title: "Recomendar com contexto",
    description:
      "O modelo precisa caber na carga, na rota, no implemento e na conta do cliente. Produto sem contexto não resolve a operação.",
  },
  {
    title: "Ser ágil sem atropelar a conferência",
    description:
      "Responder rápido importa. Confirmar corretamente ficha, condição e prazo também. O atendimento precisa fazer as duas coisas.",
  },
  {
    title: "Construir a próxima conversa",
    description:
      "Relacionamento não termina na entrega. O acompanhamento ajuda na renovação, na ampliação da frota e nas próximas decisões.",
  },
];

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: "/media/christiano-tadeu-encontro-vw.webp" },
      {
        property: "og:image:alt",
        content:
          "Christiano Tadeu no encontro Gigantes por Natureza da Volkswagen Caminhões e Ônibus",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.email)}&su=${encodeURIComponent("Atendimento sobre caminhões Volkswagen")}`;

  return (
    <>
      <section className="surface-road road-lines relative overflow-hidden">
        <div className="container-content grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:py-20">
          <div>
            <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Sobre Christiano" }]} />
            <p className="eyebrow mt-7 text-action">Sobre Christiano</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.03] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
              Caminhão é produto. Meu trabalho é entender o que precisa funcionar.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver sm:text-lg">
              Sou Christiano Tadeu e trabalho com vendas de caminhões Volkswagen na Belcar
              Caminhões. Atendo pelo telefone, WhatsApp e em visitas, sempre começando pela operação
              do cliente.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton
                size="xl"
                message={whatsappMessages.general}
                label="Falar com Christiano"
                context={{ placement: "about_hero" }}
              />
              <Button asChild variant="onDark" size="xl">
                <Link to="/diagnostico">Contar sobre a operação</Link>
              </Button>
            </div>
          </div>

          <aside className="group overflow-hidden rounded-2xl border border-white/10 bg-white/7 text-white shadow-raised backdrop-blur-xl">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/media/christiano-tadeu-encontro-vw.webp"
                  alt="Christiano Tadeu no encontro Gigantes por Natureza da Volkswagen Caminhões e Ônibus"
                  width="1280"
                  height="960"
                  decoding="async"
                  fetchPriority="high"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-road/65 via-transparent to-road/10"
                  aria-hidden="true"
                />
                <figcaption className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-road/70 px-3 py-1.5 text-[0.68rem] font-semibold text-white/85 backdrop-blur-md sm:bottom-5 sm:left-5">
                  Encontro profissional Volkswagen Caminhões e Ônibus
                </figcaption>
              </div>
            </figure>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-action">
                A primeira pergunta
              </p>
              <blockquote className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
                “Qual carga você transporta e qual caminhão utiliza hoje?”
              </blockquote>
              <p className="mt-5 border-t border-white/12 pt-5 text-sm leading-relaxed text-white/55">
                A partir dessa resposta, a conversa ganha direção. Entram rota, peso, implemento,
                prazo, condição e o que precisa melhorar na operação atual.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-content py-10 sm:py-14">
        <BelcarAffiliation />
      </section>

      <section className="container-content pb-14 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              eyebrow="Meu jeito de trabalhar"
              title="Direto na conversa e organizado no acompanhamento"
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Boa parte do meu dia acontece entre ligações, mensagens, visitas e retorno de
                proposta. É um trabalho de presença. O cliente precisa conseguir falar comigo,
                explicar a urgência e saber qual é o próximo passo.
              </p>
              <p>
                Antes de indicar um modelo, procuro entender onde o caminhão roda, o que carrega,
                qual implemento será usado e o que hoje gera custo ou atraso. Isso torna a conversa
                mais útil e evita comparar caminhões apenas pelo preço.
              </p>
              <p>
                Quando chega a hora de falar em condição, prazo e documentação, tudo é confirmado
                pelos processos comerciais da Belcar Caminhões. Meu papel é organizar as
                informações, dar agilidade e acompanhar o cliente sem prometer o que ainda precisa
                ser validado.
              </p>
            </div>
            <figure className="group relative mt-8 overflow-hidden rounded-2xl border border-border bg-road shadow-raised">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="/media/christiano-tadeu-visita-tecnica.webp"
                  alt="Christiano Tadeu durante uma visita técnica em uma instalação automotiva"
                  width="1400"
                  height="1050"
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-road via-road/80 to-transparent px-5 pb-5 pt-16 text-xs leading-relaxed text-white/75">
                Aprendizado técnico e contato próximo com o universo da Volkswagen Caminhões e
                Ônibus fazem parte da rotina profissional.
              </figcaption>
            </figure>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {workRhythm.map(({ icon: Icon, title: rhythmTitle, description: text }) => (
              <article
                key={rhythmTitle}
                className="rounded-xl border border-border bg-white p-6 shadow-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-raised"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-road text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-road">{rhythmTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-14 sm:py-20">
        <div className="container-content">
          <SectionHeader
            eyebrow="Do primeiro contato à operação"
            title="Um atendimento com começo, meio e continuidade"
            description="Cada etapa deixa uma pergunta respondida e um próximo passo combinado."
          />
          <ol className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceJourney.map(({ number, icon: Icon, title: stepTitle, description: text }) => (
              <li
                key={number}
                className="relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-card"
              >
                <span className="text-technical absolute right-4 top-2 text-5xl font-bold text-road/5">
                  {number}
                </span>
                <span className="grid size-11 place-items-center rounded-xl bg-action/10 text-action">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-road">{stepTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <SectionHeader
          eyebrow="O que você pode esperar"
          title="Quatro compromissos em toda negociação"
        />
        <div className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-2">
          {commitments.map((commitment) => (
            <article key={commitment.title} className="flex gap-4 border-t border-border pt-6">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-result" aria-hidden="true" />
              <div>
                <h3 className="text-base font-bold text-road">{commitment.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {commitment.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-road py-14 text-white sm:py-20">
        <div className="container-content grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-action">Fale do seu jeito</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-bold sm:text-3xl">
              Uma ligação rápida, uma mensagem ou uma visita podem ser o começo.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
              Escolha o canal mais confortável. Se já souber, envie carga, rota, implemento e prazo
              para a conversa começar com mais contexto.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <a
              href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/7 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/12"
            >
              <Phone className="size-4 text-action" /> {siteConfig.phone}
            </a>
            <a
              href={gmailUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/7 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/12"
            >
              <Mail className="size-4 text-action" /> Enviar e-mail
            </a>
            <Link
              to="/contato"
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/7 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/12"
            >
              <ArrowRight className="size-4 text-action" /> Ver todos os canais
            </Link>
          </div>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <div className="grid gap-8 rounded-2xl border border-engineering/15 bg-engineering/5 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-start">
          <span className="grid size-12 place-items-center rounded-xl bg-road text-white">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-road">
              Atendimento profissional vinculado à Belcar
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {siteSettings.serviceAreaNote}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {siteSettings.brandDisclosure}
            </p>
            <p className="mt-4 text-sm font-semibold text-road">
              {siteConfig.employer.legalName} | CNPJ {siteConfig.employer.cnpj}
            </p>
          </div>
        </div>
      </section>

      <CTASection
        title="Conte um pouco da operação e eu organizo os próximos passos."
        description="A conversa pode começar simples: carga, rota, caminhão atual e prazo. O restante é construído com calma e informação confirmada."
      />
    </>
  );
}
