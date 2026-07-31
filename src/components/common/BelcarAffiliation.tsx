import { BadgeCheck, Building2, ExternalLink } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BelcarAffiliationProps = {
  compact?: boolean;
  dark?: boolean;
  className?: string;
};

export function BelcarAffiliation({
  compact = false,
  dark = false,
  className,
}: BelcarAffiliationProps) {
  if (compact) {
    return (
      <a
        href={siteConfig.employer.website}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "group inline-flex items-center gap-2 text-xs font-semibold transition-colors",
          dark ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-engineering",
          className,
        )}
      >
        <BadgeCheck className="size-4 shrink-0 text-result" aria-hidden="true" />
        Consultor de vendas na {siteConfig.employer.name}
        <ExternalLink
          className="size-3 opacity-55 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </a>
    );
  }

  return (
    <aside
      className={cn(
        "rounded-xl border p-5 sm:p-6",
        dark
          ? "border-white/15 bg-white/7 text-white"
          : "border-engineering/20 bg-engineering/5 text-foreground",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl",
            dark ? "bg-white/10 text-white" : "bg-road text-white",
          )}
        >
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className={cn("eyebrow", dark ? "text-silver" : "text-engineering")}>
            Vínculo profissional
          </p>
          <h2 className="mt-2 text-lg font-bold">Atendimento comercial Belcar Caminhões</h2>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed",
              dark ? "text-white/70" : "text-muted-foreground",
            )}
          >
            Christiano Tadeu integra a equipe comercial da Belcar Caminhões, concessionária
            Volkswagen Caminhões e Ônibus em Goiás. Propostas, pedidos, crédito, estoque e
            faturamento seguem os canais e processos oficiais da concessionária.
          </p>
          <a
            href={siteConfig.employer.officialContact}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mt-4 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline",
              dark ? "text-white" : "text-engineering",
            )}
          >
            Confirmar dados oficiais da Belcar
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </aside>
  );
}
