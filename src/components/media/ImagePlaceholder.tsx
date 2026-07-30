import { cn } from "@/lib/utils";
import type { ImageSlot } from "@/types";
import { Camera } from "lucide-react";

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
 * uma superfície elegante.
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
        decoding="async"
        className={cn("w-full rounded-lg object-cover", aspectClass[slot.aspect], className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={slot.alt}
      className={cn(
        "road-lines relative w-full overflow-hidden rounded-lg border border-border bg-surface",
        aspectClass[slot.aspect],
        className,
      )}
    >
      <div className="absolute inset-0 grid place-items-center">
        <Camera className="size-6 text-silver" aria-hidden="true" />
      </div>
      <span className="absolute inset-x-0 bottom-0 h-1 bg-engineering/15" />
    </div>
  );
}
