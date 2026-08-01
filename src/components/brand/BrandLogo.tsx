import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * BrandLogo — assinatura oficial Christiano Tadeu | Caminhões Volkswagen.
 *
 * Usa exclusivamente os arquivos oficiais em `public/brand/`. Nenhum elemento
 * da marca é redesenhado, recolorido, distorcido ou composto manualmente:
 * o lockup e o monograma são aplicados como imagem, com proporção preservada
 * (`object-contain`) e dimensões intrínsecas declaradas.
 */
export interface BrandLogoProps {
  /** `light` = superfícies claras · `dark` = rodapé e áreas escuras. */
  variant?: "light" | "dark";
  /**
   * `auto` (padrão) mostra o monograma em telas estreitas e o lockup completo
   * a partir de `sm`. `full` força a assinatura completa e `mark` o monograma.
   */
  lockup?: "auto" | "full" | "mark";
  /** Exibe a assinatura textual abaixo da marca (rodapé). */
  withSignature?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Envolve em link para a home (padrão: true). */
  asLink?: boolean;
}

const assets = {
  light: {
    full: {
      src: "/brand/christiano-tadeu-logo-clara.webp?v=20260801",
      width: 1515,
      height: 494,
    },
    mark: {
      src: "/brand/christiano-tadeu-monograma-claro.webp?v=20260801",
      width: 513,
      height: 446,
    },
  },
  dark: {
    full: {
      src: "/brand/christiano-tadeu-logo-negativa.webp?v=20260801",
      width: 1516,
      height: 497,
    },
    mark: {
      src: "/brand/christiano-tadeu-monograma-negativo.webp?v=20260801",
      width: 513,
      height: 446,
    },
  },
} as const;

const heights = {
  sm: { full: "h-9", mark: "h-9" },
  md: { full: "h-12", mark: "h-11" },
  lg: { full: "h-16", mark: "h-14" },
} as const;

const alt = "Christiano Tadeu | Consultor Belcar Caminhões";

export function BrandLogo({
  variant = "light",
  lockup = "auto",
  withSignature = false,
  size = "md",
  className,
  asLink = true,
}: BrandLogoProps) {
  const set = assets[variant];
  const height = heights[size];

  const content = (
    <span className={cn("inline-flex min-w-0 flex-col gap-1", className)}>
      {lockup !== "full" && (
        <img
          src={set.mark.src}
          width={set.mark.width}
          height={set.mark.height}
          alt={alt}
          loading="eager"
          decoding="async"
          className={cn("w-auto object-contain", height.mark, lockup === "auto" && "sm:hidden")}
        />
      )}
      {lockup !== "mark" && (
        <img
          src={set.full.src}
          width={set.full.width}
          height={set.full.height}
          alt={alt}
          loading="eager"
          decoding="async"
          className={cn(
            "w-auto max-w-full object-contain",
            height.full,
            lockup === "auto" && "hidden sm:block",
          )}
        />
      )}
      {withSignature && (
        <span
          className={cn("text-xs", variant === "dark" ? "text-silver" : "text-muted-foreground")}
        >
          {siteConfig.signature}
        </span>
      )}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      to="/"
      aria-label={`${siteConfig.shortName} | página inicial`}
      className="inline-flex rounded-md"
    >
      {content}
    </Link>
  );
}
