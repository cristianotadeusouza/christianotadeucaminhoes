import { createFileRoute } from "@tanstack/react-router";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { siteConfig } from "@/config/site";
import { siteSettings } from "@/data/site-settings";

const title = "Política de privacidade | Christiano Tadeu";
const description =
  "Como os dados enviados por este site são usados, por quanto tempo são mantidos e como solicitar exclusão.";

const sections = [
  {
    heading: "Quais dados são coletados",
    body: "Somente os dados que você informa voluntariamente ao preencher o diagnóstico da operação ou ao iniciar uma conversa: nome, empresa, cidade, WhatsApp, e-mail opcional e as informações sobre a operação e a intenção de compra.",
  },
  {
    heading: "Como os dados são usados",
    body: "Exclusivamente para entender a operação, preparar a recomendação técnica, organizar a proposta comercial e manter o acompanhamento do atendimento. Não há venda ou compartilhamento com terceiros para fins de marketing.",
  },
  {
    heading: "Envio pelo WhatsApp",
    body: "Nesta versão do site, o formulário de diagnóstico monta uma mensagem e abre o WhatsApp no seu próprio aparelho. O envio é feito por você, e a conversa passa a ser regida também pelos termos do WhatsApp.",
  },
  {
    heading: "Cookies e medição",
    body: "O site não usa cookies de publicidade nem rastreamento entre sites. Se uma medição de audiência for ativada, será uma solução compatível com privacidade e sem identificação pessoal.",
  },
  {
    heading: "Retenção e exclusão",
    body: "Os dados de atendimento são mantidos enquanto durar a relação comercial e pelo prazo necessário ao cumprimento de obrigações legais. Você pode solicitar acesso, correção ou exclusão a qualquer momento pelos canais de contato.",
  },
  {
    heading: "Responsável pelo tratamento",
    body: "Christiano Tadeu é o responsável pelos dados recebidos por meio deste site. Pedidos relacionados à privacidade devem ser feitos pelos canais publicados na página de contato.",
  },
];

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs
            items={[{ label: "Início", to: "/" }, { label: "Política de privacidade" }]}
          />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Privacidade"
            title="Política de privacidade"
            description="Esta página é mantida por Christiano Tadeu e descreve o tratamento dado às informações enviadas por este site."
          />
        </div>
      </section>

      <section className="container-content max-w-3xl space-y-8 py-14 sm:py-20">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-lg font-semibold text-road">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </div>
        ))}

        <div className="rounded-lg border border-border bg-surface p-5 text-xs leading-relaxed text-muted-foreground">
          <p>{siteSettings.brandDisclosure}</p>
          <p className="mt-3">{siteConfig.commercialDisclaimer}</p>
        </div>
      </section>
    </>
  );
}
