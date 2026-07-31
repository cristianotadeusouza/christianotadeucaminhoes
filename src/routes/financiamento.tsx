import { createFileRoute, Link } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { FinancingNotice } from "@/components/common/FinancingNotice";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { FAQ } from "@/components/common/FAQ";
import { Button } from "@/components/ui/button";
import { whatsappMessages } from "@/services/whatsapp";
import { siteSettings } from "@/data/site-settings";

const title = "Financiamento de caminhões | Christiano Tadeu";
const description =
  "Como organizar a aquisição de um caminhão: entrada, prazo, documentação e análise de crédito, com acompanhamento em cada etapa.";

const modalities = [
  {
    name: "Financiamento bancário",
    summary:
      "Modalidade mais comum na aquisição de veículos pesados, com entrada, prazo e garantia definidos conforme o perfil da empresa.",
    points: [
      "Entrada e prazo variam por perfil",
      "Análise de crédito obrigatória",
      "Alienação do veículo como garantia",
    ],
  },
  {
    name: "Linhas de financiamento para máquinas e equipamentos",
    summary:
      "Dependem de enquadramento, do tipo de operação e de campanha vigente. A elegibilidade é confirmada caso a caso.",
    points: [
      "Enquadramento precisa ser verificado",
      "Documentação específica",
      "Prazos costumam ser mais longos",
    ],
  },
  {
    name: "Recursos próprios",
    summary:
      "Pagamento direto, sem operação de crédito. Simplifica o processo e depende apenas da disponibilidade de capital da empresa.",
    points: [
      "Sem análise de crédito",
      "Negociação mais simples",
      "Impacto direto no capital de giro",
    ],
  },
  {
    name: "Veículo usado na negociação",
    summary:
      "O caminhão atual pode entrar na composição do negócio. O valor considerado depende da avaliação do veículo e da documentação.",
    points: [
      "Avaliação presencial do veículo",
      "Documentação do usado precisa estar regular",
      "Pode ser combinado com financiamento",
    ],
  },
];

const documents = [
  "Documentos da empresa (contrato social e cartão CNPJ)",
  "Documentos dos sócios",
  "Comprovante de endereço da empresa",
  "Faturamento dos últimos meses",
  "Informações sobre o veículo pretendido e o implemento",
  "Dados do veículo de troca, quando houver",
];

const faq = [
  {
    question: "Vocês garantem a aprovação do crédito?",
    answer:
      "Não. A aprovação depende exclusivamente da instituição financeira e da análise do perfil da empresa. O que fazemos é organizar a documentação e apresentar a operação da forma mais clara possível.",
  },
  {
    question: "Qual entrada costuma ser pedida?",
    answer:
      "Varia conforme o perfil de crédito, o veículo, o prazo e a campanha vigente. Esse número só faz sentido depois da análise — antes disso, qualquer percentual seria chute.",
  },
  {
    question: "O implemento pode entrar no financiamento?",
    answer:
      "Em algumas operações sim, em outras não. Depende da linha escolhida e do fornecedor do implemento. É um dos pontos que avaliamos antes de fechar a configuração.",
  },
];

export const Route = createFileRoute("/financiamento")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FinancingPage,
});

function FinancingPage() {
  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Financiamento" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Aquisição"
            title="Financiamento sem promessa fácil"
            description="A conversa sobre pagamento vem depois de definir o caminhão certo. Aqui está o caminho que costuma funcionar, com o que precisa ser confirmado em cada etapa."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton
              size="lg"
              message={whatsappMessages.financing}
              label="Solicitar análise inicial"
              context={{ placement: "financing_hero" }}
            />
            <Button asChild variant="quiet" size="lg">
              <Link to="/diagnostico">Preencher diagnóstico</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <SectionHeader eyebrow="Modalidades" title="Formas usuais de viabilizar a compra" />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {modalities.map((modality) => (
            <div
              key={modality.name}
              className="rounded-lg border border-border bg-card p-6 shadow-card"
            >
              <h3 className="text-lg font-semibold text-road">{modality.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {modality.summary}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {modality.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-engineering" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <FinancingNotice />
      </section>

      <section className="bg-surface py-14 sm:py-20">
        <div className="container-content grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-road sm:text-2xl">
              Documentos normalmente solicitados
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {documents.map((document) => (
                <li key={document} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-action" />
                  {document}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              A lista final depende da instituição e da modalidade escolhida.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-road sm:text-2xl">Como funciona a análise</h2>
            <ol className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-road">1. Contexto da operação.</span> Entender o
                veículo pretendido, o implemento e o objetivo da aquisição.
              </li>
              <li>
                <span className="font-semibold text-road">2. Organização da documentação.</span>{" "}
                Reunir o que a instituição vai pedir, evitando idas e vindas.
              </li>
              <li>
                <span className="font-semibold text-road">3. Envio e acompanhamento.</span> A
                análise é feita pela instituição financeira; acompanhamos o andamento.
              </li>
              <li>
                <span className="font-semibold text-road">4. Retorno e decisão.</span> Com as
                condições em mãos, comparamos alternativas antes de fechar.
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <FAQ items={faq} />
        <CommercialDisclaimer className="mt-10">
          {siteSettings.commercialDisclaimer}
        </CommercialDisclaimer>
      </section>

      <CTASection
        title="Quer entender as condições para o seu caso?"
        message={whatsappMessages.financing}
        context={{ placement: "financing_cta" }}
      />
    </>
  );
}
