import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Building2,
  Globe2,
  Instagram,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl, whatsappMessages } from "@/services/whatsapp";

const title = "Links diretos | Christiano Tadeu";
const description =
  "Acesse o site, WhatsApp, Instagram e e-mail de Christiano Tadeu na Belcar Caminhões.";

export const Route = createFileRoute("/links")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LinkHubPage,
});

function LinkHubPage() {
  const whatsappUrl = buildWhatsAppUrl(whatsappMessages.general);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteConfig.email)}&su=${encodeURIComponent("Atendimento sobre caminhões Volkswagen")}`;

  return (
    <div className="link-hub relative isolate min-h-screen overflow-hidden bg-road px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="link-hub__grid absolute inset-0" aria-hidden="true" />
      <div className="link-hub__glow link-hub__glow--one" aria-hidden="true" />
      <div className="link-hub__glow link-hub__glow--two" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center sm:min-h-[calc(100vh-6rem)]">
        <header className="link-hub__intro text-center">
          <BrandLogo
            variant="dark"
            lockup="full"
            size="lg"
            asLink={false}
            className="mx-auto max-w-[18rem]"
          />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3.5 py-2 text-xs font-semibold text-white/75 backdrop-blur-xl">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-result opacity-55" />
              <span className="relative inline-flex size-2 rounded-full bg-result" />
            </span>
            Consultor de vendas na Belcar Caminhões
          </div>
          <h1 className="mt-7 text-[clamp(2.35rem,9vw,4.5rem)] font-bold leading-[0.96] tracking-[-0.055em]">
            Vamos falar do caminhão certo para a sua operação?
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/62 sm:text-base">
            Escolha o canal mais rápido para você. O atendimento é feito diretamente por Christiano,
            com propostas e processos comerciais pela Belcar.
          </p>
        </header>

        <nav className="link-hub__links mt-8 space-y-3" aria-label="Canais de atendimento">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-hub-action link-hub-action--whatsapp"
          >
            <span className="link-hub-action__icon">
              <MessageCircle aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <strong>Falar agora pelo WhatsApp</strong>
              <small>Conversa direta sobre operação, modelo e disponibilidade</small>
            </span>
            <ArrowUpRight className="link-hub-action__arrow" aria-hidden="true" />
          </a>

          <a href="/" className="link-hub-action">
            <span className="link-hub-action__icon">
              <Globe2 aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <strong>Conhecer o site completo</strong>
              <small>Caminhões, fichas técnicas, soluções e conteúdos</small>
            </span>
            <ArrowUpRight className="link-hub-action__arrow" aria-hidden="true" />
          </a>

          <a
            href={siteConfig.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-hub-action"
          >
            <span className="link-hub-action__icon">
              <Instagram aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <strong>Acompanhar no Instagram</strong>
              <small>Dicas, entregas, caminhões e rotina comercial</small>
            </span>
            <ArrowUpRight className="link-hub-action__arrow" aria-hidden="true" />
          </a>

          <a href={gmailUrl} target="_blank" rel="noopener noreferrer" className="link-hub-action">
            <span className="link-hub-action__icon">
              <Mail aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <strong>Enviar um e-mail pelo Gmail</strong>
              <small>{siteConfig.email}</small>
            </span>
            <ArrowUpRight className="link-hub-action__arrow" aria-hidden="true" />
          </a>
        </nav>

        <aside className="link-hub__proof mt-6 rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/8 text-action">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                Atendimento comercial Belcar
                <ShieldCheck className="size-4 text-result" aria-hidden="true" />
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                Propostas, disponibilidade, crédito, pedidos e faturamento são confirmados pelos
                processos oficiais da concessionária.
              </p>
              <a
                href={siteConfig.employer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-silver transition-colors hover:text-white"
              >
                <Sparkles className="size-3.5 text-action" aria-hidden="true" />
                Conhecer a Belcar Caminhões
              </a>
            </div>
          </div>
        </aside>

        <p className="mt-6 text-center text-[0.68rem] leading-relaxed text-white/35">
          Canal profissional pessoal de Christiano Tadeu, vendedor vinculado à Belcar Caminhões. Não
          é o site institucional da Belcar ou da Volkswagen Caminhões e Ônibus.
        </p>
      </div>
    </div>
  );
}
