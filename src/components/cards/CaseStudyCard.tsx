import type { CaseStudy } from "@/types";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { Badge } from "@/components/ui/badge";

export function CaseStudyCard({ item }: { item: CaseStudy }) {
  return (
    <article className="card-lift flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {item.media[0] && <ImagePlaceholder slot={item.media[0]} className="rounded-none" />}
      <div className="flex flex-1 flex-col p-5">
        <Badge variant="outline" className="w-fit border-engineering/40 text-engineering">
          {item.segment}
        </Badge>
        <h3 className="mt-3 text-lg font-semibold text-road">{item.title}</h3>
        {item.city && <p className="text-technical mt-1 text-sm text-muted-foreground">{item.city}</p>}
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-foreground">Situação inicial</dt>
            <dd className="mt-1 leading-relaxed text-muted-foreground">{item.initialSituation}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Solução indicada</dt>
            <dd className="mt-1 leading-relaxed text-muted-foreground">{item.reasonForChoice}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
