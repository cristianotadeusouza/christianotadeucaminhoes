import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * BrandLogo — lockup da marca Christiano Tadeu | Caminhões Volkswagen.
 *
 * IMPORTANTE: os arquivos oficiais da logomarca (versão principal e versão
 * negativa) ainda não foram recebidos no repositório. Este componente
 * reproduz a estrutura do lockup (símbolo CT + nome + descritor + assinatura)
 * de forma tipográfica e é o ÚNICO ponto de troca: ao receber os arquivos,
 * substitua o bloco do símbolo por <img src={...} /> mantendo a API.
 *
 * Nenhum símbolo oficial da Volkswagen é reproduzido, redesenhado ou criado.
 */
export interface BrandLogoProps {
  /** `light` = fundos claros (versão principal) · `dark` = fundo azul escuro (versão negativa) */
  variant?: "light" | "dark";
  /** Exibe a assinatura da marca abaixo do nome. */
  withSignature?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Envolve em link para a home (padrão: true). */
  asLink?: boolean;
}

const sizes = {
  sm: { mark: "h-8 w-8 text-[0.68rem]", name: "text-sm", descriptor: "text-[0.6rem]" },
  md: { mark: "h-11 w-11 text-sm", name: "text-base", descriptor: "text-[0.65rem]" },
  lg: { mark: "h-14 w-14 text-lg", name: "text-xl", descriptor: "text-xs" },
};

export function BrandLogo({
  variant = "light",
  withSignature = false,
  size = "md",
  className,
  asLink = true,
}: BrandLogoProps) {
  const isDark = variant === "dark";
  const s = sizes[size];

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "relative grid shrink-0 place-items-center rounded-md font-bold text-technical",
          s.mark,
          isDark
            ? "bg-road-foreground text-road"
            : "bg-road text-road-foreground",
        )}
      >
        CT
        {/* Faixa inferior em Vermelho Ação — referência ao chassi/estrada do lockup */}
        <span className="absolute inset-x-1.5 bottom-1 h-[2px] rounded-full bg-action" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "truncate font-semibold tracking-tight",
            s.name,
            isDark ? "text-road-foreground" : "text-road",
          )}
        >
          Christiano Tadeu
        </span>
        <span
          className={cn(
            "eyebrow truncate",
            s.descriptor,
            isDark ? "text-silver" : "text-engineering",
          )}
        >
          Caminhões Volkswagen
        </span>
        {withSignature && (
          <span
            className={cn(
              "mt-1 text-xs",
              isDark ? "text-silver" : "text-muted-foreground",
            )}
          >
            {siteConfig.signature}
          </span>
        )}
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link to="/" aria-label={`${siteConfig.shortName} — página inicial`} className="rounded-md">
      {content}
    </Link>
  );
}
