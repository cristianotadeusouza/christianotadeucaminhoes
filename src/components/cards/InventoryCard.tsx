import { Link } from "@tanstack/react-router";
import type { InventoryItem, InventoryStatus } from "@/types";
import { ImagePlaceholder } from "@/components/media/ImagePlaceholder";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { whatsappMessages } from "@/services/whatsapp";
import { Button } from "@/components/ui/button";

export const inventoryStatusLabels: Record<InventoryStatus, string> = {
  disponivel: "Disponível",
  sob_consulta: "Sob consulta",
  reservado: "Reservado",
  vendido: "Vendido",
  campanha_encerrada: "Campanha encerrada",
};

/** Estado é comunicado por texto + cor (nunca só por cor). */
const statusClasses: Record<InventoryStatus, string> = {
  disponivel: "border-result/40 text-result",
  sob_consulta: "border-engineering/40 text-engineering",
  reservado: "border-action/40 text-action",
  vendido: "border-border text-muted-foreground",
  campanha_encerrada: "border-border text-muted-foreground",
};

export function InventoryCard({ item }: { item: InventoryItem }) {
  const identifier = [item.model, item.configuration].filter(Boolean).join(" · ");

  return (
    <article className="card-lift flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <ImagePlaceholder slot={item.image} className="rounded-none" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={statusClasses[item.status]}>
            {inventoryStatusLabels[item.status]}
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">
            {item.condition === "novo" ? "Novo" : "Seminovo"}
          </Badge>
          {item.isDemo && (
            <Badge variant="outline" className="border-silver text-muted-foreground">
              Estrutura demonstrativa
            </Badge>
          )}
        </div>

        <h3 className="text-technical mt-3 text-lg font-bold uppercase tracking-wide text-road">
          {item.model}
          {item.version ? ` ${item.version}` : ""}
        </h3>

        <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
          {item.modelYear && (
            <div className="flex gap-2">
              <dt className="text-foreground">Ano/modelo:</dt>
              <dd className="text-technical">{item.modelYear}</dd>
            </div>
          )}
          {item.configuration && (
            <div className="flex gap-2">
              <dt className="text-foreground">Configuração:</dt>
              <dd>{item.configuration}</dd>
            </div>
          )}
          {item.application && (
            <div className="flex gap-2">
              <dt className="text-foreground">Aplicação indicada:</dt>
              <dd>{item.application}</dd>
            </div>
          )}
        </dl>

        <p className="text-technical mt-4 text-base font-semibold text-road">
          {item.price === null
            ? "Valor sob consulta"
            : item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>

        {item.note && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <WhatsAppButton
            message={whatsappMessages.inventory(identifier)}
            label="Tenho interesse"
            context={{ placement: "inventory_card", item: item.id }}
            className="w-full"
          />
          <Button asChild variant="quiet" className="w-full">
            <Link to="/oportunidades/$id" params={{ id: item.id }}>
              Ver detalhes
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
