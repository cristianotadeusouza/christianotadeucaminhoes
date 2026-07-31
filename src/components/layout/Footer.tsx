import { Link } from "@tanstack/react-router";
import { LockKeyhole, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { footerNav } from "@/components/layout/navigation";
import { siteConfig } from "@/config/site";
import { siteSettings } from "@/data/site-settings";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { whatsappMessages } from "@/services/whatsapp";
import { BelcarAffiliation } from "@/components/common/BelcarAffiliation";

/** Rodapé institucional — versão negativa da marca sobre Azul Estrada. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-road">
      <div className="container-content py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div>
            <BrandLogo
              variant="dark"
              size="lg"
              lockup="full"
              withSignature
              className="max-w-[18rem]"
            />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-silver">
              Atendimento de caminhões Volkswagen por Christiano Tadeu, consultor de vendas da
              Belcar Caminhões.
            </p>

            <BelcarAffiliation compact dark className="mt-4" />

            <div className="mt-6 space-y-2 text-sm text-silver">
              {siteConfig.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
                    className="hover:underline"
                  >
                    {siteConfig.phone}
                  </a>
                </p>
              )}
              {siteConfig.email && (
                <p className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${siteConfig.email}`} className="hover:underline">
                    {siteConfig.email}
                  </a>
                </p>
              )}
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{siteConfig.serviceArea || siteSettings.serviceAreaNote}</span>
              </p>
            </div>

            <WhatsAppButton
              message={whatsappMessages.general}
              context={{ placement: "footer" }}
              className="mt-6"
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <p className="eyebrow text-silver">{group.label}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="text-sm text-road-foreground/85 transition-colors hover:text-road-foreground hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-4 border-t border-silver/20 pt-8 text-xs leading-relaxed text-silver">
          <p className="font-semibold text-road-foreground">
            Vínculo profissional: {siteConfig.employer.legalName} | CNPJ {siteConfig.employer.cnpj}
          </p>
          <p>{siteSettings.commercialDisclaimer}</p>
          <p>{siteSettings.brandDisclosure}</p>
          <div className="flex flex-col gap-3 text-silver/80 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {siteConfig.legalName}. Todos os direitos reservados.
            </p>
            <Link
              to="/painel"
              className="inline-flex w-fit items-center gap-2 rounded-md px-2 py-1 text-silver/55 transition-colors hover:bg-white/5 hover:text-silver"
            >
              <LockKeyhole className="size-3.5" aria-hidden="true" /> Área de gestão
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
