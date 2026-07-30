import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/types";

export function FAQ({ items, title = "Dúvidas frequentes" }: { items: FaqItem[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="text-xl font-semibold text-road sm:text-2xl">{title}</h2>
      <Accordion type="single" collapsible className="mt-4">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium text-road">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
