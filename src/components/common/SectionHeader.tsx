import { cn } from "@/lib/utils";

/**
 * SectionHeader — cabeçalho padrão de seção (eyebrow + título + apoio).
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-3", isDark ? "text-silver" : "text-engineering")}>{eyebrow}</p>
      )}
      <Heading
        className={cn(
          "text-2xl font-semibold sm:text-3xl lg:text-[2rem]",
          isDark ? "text-road-foreground" : "text-road",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            isDark ? "text-silver" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
