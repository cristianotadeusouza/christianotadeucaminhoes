import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { footerNav } from "@/components/layout/navigation";
import { siteConfig } from "@/config/site";
import { siteSettings } from "@/data/site-settings";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { whatsappMessages } from "@/services/whatsapp";

/** Rodapé institucional — versão negativa da marca sobre Azul Estrada. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-road">
      <div className="container-content py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div>
            <BrandLogo variant="dark" size="md" withSignature />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-silver">
              Venda consultiva de caminhões Volkswagen: análise da operação, indicação de
              configuração, apoio no financiamento e acompanhamento até a entrega.
            </p>

            <div className="mt-6 space-y-2 text-sm text-silver">
              {siteConfig.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  <a href={`tel:${siteConfig.phone.replace(/\D/g, "")}`} className="hover:underline">
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
          <p>{siteSettings.commercialDisclaimer}</p>
          <p>{siteSettings.brandDisclosure}</p>
          <p className="text-silver/80">
            © {year} {siteConfig.legalName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
