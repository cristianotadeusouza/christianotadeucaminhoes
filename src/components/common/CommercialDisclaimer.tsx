import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

/**
 * CommercialDisclaimer — aviso comercial neutro e obrigatório.
 * Usado em oportunidades, financiamento e rodapé.
 */
export function CommercialDisclaimer({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <p
      className={cn(
        "flex gap-2 rounded-md border px-3 py-2.5 text-xs leading-relaxed",
        isDark
          ? "border-silver/20 bg-road-foreground/5 text-silver"
          : "border-border bg-surface text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
