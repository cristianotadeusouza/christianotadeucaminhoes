import { cn } from "@/lib/utils";
import type { ImageSlot } from "@/types";

const aspectClass: Record<ImageSlot["aspect"], string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-4/3",
  "3/2": "aspect-3/2",
  "1/1": "aspect-square",
};

/**
 * ImagePlaceholder — espaço reservado profissional para fotografia real.
 *
 * Quando `slot.src` existe, renderiza a foto (lazy, com dimensão reservada
 * para evitar layout shift). Quando não existe, renderiza uma superfície
 * sóbria da marca. A legenda descritiva (`caption`) NÃO é exibida ao
 * visitante — ela serve à documentação e ao alt text; o público vê apenas
 * uma superfície editorial da marca, sem simular fotografia.
 */
export function ImagePlaceholder({
  slot,
  className,
  priority = false,
}: {
  slot: ImageSlot;
  className?: string;
  priority?: boolean;
}) {
  if (slot.src) {
    return (
      <img
        src={slot.src}
        alt={slot.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={cn(
          "w-full rounded-lg",
          slot.fit === "contain" ? "bg-surface object-contain p-4" : "object-cover",
          aspectClass[slot.aspect],
          className,
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={slot.alt}
      className={cn(
        "road-lines relative w-full overflow-hidden rounded-lg border border-road/15 bg-road",
        aspectClass[slot.aspect],
        className,
      )}
    >
      <div className="absolute inset-0 grid place-items-center p-8">
        <img
          src="/brand/christiano-tadeu-logo-negativa.webp?v=20260801"
          alt=""
          width={1516}
          height={497}
          loading="lazy"
          decoding="async"
          className="w-full max-w-64 object-contain opacity-90"
          aria-hidden="true"
        />
      </div>
      <span className="absolute bottom-0 left-0 h-1 w-20 bg-action" />
    </div>
  );
}
