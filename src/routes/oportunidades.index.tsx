import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import type { InventoryItem } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { EmptyState } from "@/components/common/EmptyState";
import { InventoryCard } from "@/components/cards/InventoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteSettings } from "@/data/site-settings";
import { inventoryRepository } from "@/services/repositories";

const title = "Oportunidades e estoque de caminhões | Christiano Tadeu";
const description =
  "Veículos e oportunidades acompanhadas por Christiano Tadeu. Disponibilidade e condições confirmadas no atendimento.";

const familyFilters = [
  { value: "todos", label: "Todas as famílias" },
  { value: "delivery", label: "Delivery" },
  { value: "constellation", label: "Constellation" },
  { value: "meteor", label: "Meteor" },
];

const conditionFilters = [
  { value: "todos", label: "Novos e seminovos" },
  { value: "novo", label: "Novos" },
  { value: "seminovo", label: "Seminovos" },
];

export const Route = createFileRoute("/oportunidades/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  loader: async () => ({
    items: await inventoryRepository.list(),
    updatedAt: await inventoryRepository.lastUpdatedAt(),
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { items, updatedAt } = Route.useLoaderData();
  const [family, setFamily] = useState("todos");
  const [condition, setCondition] = useState("todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (items as InventoryItem[]).filter((item) => {
      if (family !== "todos" && item.familySlug !== family) return false;
      if (condition !== "todos" && item.condition !== condition) return false;
      if (term) {
        const haystack = [item.model, item.version, item.configuration, item.application]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [items, family, condition, search]);

  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Oportunidades" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Estoque e oportunidades"
            title="Veículos acompanhados por Christiano"
            description="A disponibilidade muda com frequência. O que estiver aqui é confirmado no primeiro contato, antes de qualquer proposta."
          />
          <p className="text-technical mt-6 text-xs text-muted-foreground">
            Última atualização:{" "}
            <time dateTime={updatedAt}>
              {new Date(updatedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
        </div>
      </section>

      <section className="container-content py-12 sm:py-16">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-card lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="busca" className="text-sm font-medium text-foreground">
              Buscar
            </label>
            <Input
              id="busca"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Modelo, configuração ou aplicação"
              className="mt-2"
            />
          </div>
          <fieldset className="flex-1">
            <legend className="text-sm font-medium text-foreground">Família</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {familyFilters.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={family === option.value ? "institutional" : "quiet"}
                  onClick={() => setFamily(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex-1">
            <legend className="text-sm font-medium text-foreground">Condição</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {conditionFilters.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={condition === option.value ? "institutional" : "quiet"}
                  onClick={() => setCondition(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-10">
          {filtered.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <InventoryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum veículo com esses filtros"
              description="Ajuste a busca ou fale diretamente: muitas oportunidades são confirmadas antes de entrar no site."
              action={
                <Button asChild variant="quiet">
                  <Link to="/contato">Falar com Christiano</Link>
                </Button>
              }
            />
          )}
        </div>

        <CommercialDisclaimer className="mt-10">
          {siteSettings.commercialDisclaimer}
        </CommercialDisclaimer>
      </section>

      <CTASection />
    </>
  );
}
