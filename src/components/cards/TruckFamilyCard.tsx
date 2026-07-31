import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { TruckFamily } from "@/types";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";

export function TruckFamilyCard({ family }: { family: TruckFamily }) {
  return (
    <article className="card-lift group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative overflow-hidden border-b border-border bg-[linear-gradient(160deg,var(--color-background),var(--color-surface))]">
        <span className="absolute left-5 top-5 z-10 text-technical text-[0.65rem] font-bold uppercase tracking-[0.16em] text-engineering">
          Família Volkswagen
        </span>
        <ImagePlaceholder
          slot={family.gallery[0]}
          className="rounded-none px-5 pb-3 pt-10 transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-[1.025]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-technical text-2xl font-bold uppercase tracking-wide text-road">
          {family.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{family.tagline}</p>

        <ul className="mt-4 space-y-1.5 text-sm text-foreground">
          {family.recommendedOperations.slice(0, 3).map((operation) => (
            <li key={operation} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-action" />
              {operation}
            </li>
          ))}
        </ul>

        <Link
          to="/caminhoes/$family"
          params={{ family: family.slug }}
          className="mt-7 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-engineering"
        >
          Conhecer a família {family.name}
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
