import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { TruckFamily } from "@/types";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";

export function TruckFamilyCard({ family }: { family: TruckFamily }) {
  return (
    <article className="card-lift group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <ImagePlaceholder slot={family.gallery[0]} className="rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-technical text-xl font-bold uppercase tracking-wide text-road">
          {family.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{family.tagline}</p>

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
          className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-engineering hover:underline"
        >
          Conhecer a família {family.name}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
