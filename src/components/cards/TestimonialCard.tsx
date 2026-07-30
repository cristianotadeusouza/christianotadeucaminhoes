import type { Testimonial } from "@/types";
import { Quote } from "lucide-react";

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="card-lift w-full rounded-xl border border-border bg-card p-6 shadow-card">
      <Quote className="size-5 text-action" aria-hidden="true" />
      <blockquote className="mt-4 text-base leading-relaxed text-foreground">
        {item.quote}
      </blockquote>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        <span className="font-medium text-road">{item.author}</span>
        {item.role && <span> · {item.role}</span>}
        {item.city && <span> · {item.city}</span>}
      </figcaption>
    </figure>
  );
}
