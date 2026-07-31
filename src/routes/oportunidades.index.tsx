import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import type { InventoryItem } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";
import { InventoryCard } from "@/components/cards/InventoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { siteSettings } from "@/data/site-settings";
import { inventoryRepository } from "@/services/repositories";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { whatsappMessages } from "@/services/whatsapp";

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

const sortOptions = [
  { value: "relevancia", label: "Disponíveis primeiro" },
  { value: "recentes", label: "Atualizados recentemente" },
  { value: "preco_asc", label: "Menor preço" },
  { value: "preco_desc", label: "Maior preço" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

interface InventorySearch {
  q: string;
  familia: string;
  condicao: string;
  ordem: SortValue;
}

/** Ordem de exibição por status — disponíveis antes de reservados/vendidos. */
const statusWeight: Record<InventoryItem["status"], number> = {
  disponivel: 0,
  sob_consulta: 1,
  reservado: 2,
  campanha_encerrada: 3,
  vendido: 4,
};

function asOption(value: unknown, allowed: string[], fallback: string) {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

export const Route = createFileRoute("/oportunidades/")({
  validateSearch: (search: Record<string, unknown>): InventorySearch => ({
    q: typeof search.q === "string" ? search.q.slice(0, 80) : "",
    familia: asOption(
      search.familia,
      familyFilters.map((option) => option.value),
      "todos",
    ),
    condicao: asOption(
      search.condicao,
      conditionFilters.map((option) => option.value),
      "todos",
    ),
    ordem: asOption(
      search.ordem,
      sortOptions.map((option) => option.value),
      "relevancia",
    ) as SortValue,
  }),
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
  const { q, familia, condicao, ordem } = Route.useSearch();
  const navigate = Route.useNavigate();

  /** Filtros vivem na URL: o resultado é compartilhável e sobrevive ao refresh. */
  const setSearch = (patch: Partial<InventorySearch>) =>
    navigate({
      search: (previous: InventorySearch) => ({ ...previous, ...patch }),
      replace: true,
    });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const result = (items as InventoryItem[]).filter((item) => {
      if (familia !== "todos" && item.familySlug !== familia) return false;
      if (condicao !== "todos" && item.condition !== condicao) return false;
      if (term) {
        const haystack = [item.model, item.version, item.configuration, item.application]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    const byPrice = (direction: 1 | -1) => (a: InventoryItem, b: InventoryItem) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * direction;
    };

    switch (ordem) {
      case "recentes":
        return [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      case "preco_asc":
        return [...result].sort(byPrice(1));
      case "preco_desc":
        return [...result].sort(byPrice(-1));
      default:
        return [...result].sort(
          (a, b) =>
            statusWeight[a.status] - statusWeight[b.status] ||
            b.updatedAt.localeCompare(a.updatedAt),
        );
    }
  }, [items, q, familia, condicao, ordem]);

  const availableCount = filtered.filter((item) => item.status === "disponivel").length;
  const activeFilters = [
    familia !== "todos"
      ? {
          key: "familia" as const,
          label: familyFilters.find((option) => option.value === familia)?.label ?? familia,
          reset: "todos",
        }
      : null,
    condicao !== "todos"
      ? {
          key: "condicao" as const,
          label: conditionFilters.find((option) => option.value === condicao)?.label ?? condicao,
          reset: "todos",
        }
      : null,
    q.trim() ? { key: "q" as const, label: `“${q.trim()}”`, reset: "" } : null,
  ].filter((entry) => entry !== null);

  return (
    <>
      <section className="grid-lines border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Oportunidades" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Estoque e oportunidades"
            title="Veículos acompanhados por Christiano"
            description="A disponibilidade muda com frequência. O que estiver aqui é confirmado no primeiro contato, antes de qualquer proposta."
          />
          {updatedAt && (
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
          )}
        </div>
      </section>

      <section className="container-content py-12 sm:py-16">
        {items.length === 0 ? (
          <EmptyState
            title="Nenhuma oportunidade publicada no momento"
            description="O estoque de caminhões novos e seminovos muda com frequência e é confirmado diretamente no atendimento. Isso inclui veículos que ainda não entraram no site. Fale pelo WhatsApp ou preencha o diagnóstico para receber opções adequadas à sua operação."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <WhatsAppButton
                  message={whatsappMessages.general}
                  label="Consultar disponibilidade"
                  context={{ placement: "inventory_empty_state" }}
                />
                <Button asChild variant="quiet">
                  <Link to="/diagnostico">Preencher diagnóstico</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label htmlFor="busca" className="text-sm font-medium text-foreground">
                    Buscar
                  </label>
                  <Input
                    id="busca"
                    value={q}
                    onChange={(event) => setSearch({ q: event.target.value })}
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
                        aria-pressed={familia === option.value}
                        variant={familia === option.value ? "institutional" : "quiet"}
                        onClick={() => setSearch({ familia: option.value })}
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
                        aria-pressed={condicao === option.value}
                        variant={condicao === option.value ? "institutional" : "quiet"}
                        onClick={() => setSearch({ condicao: option.value })}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <SlidersHorizontal
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <label htmlFor="ordem" className="sr-only">
                    Ordenar resultados
                  </label>
                  <select
                    id="ordem"
                    value={ordem}
                    onChange={(event) => setSearch({ ordem: event.target.value as SortValue })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:border-engineering/50"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p aria-live="polite" className="text-technical text-sm text-muted-foreground">
                  <strong className="text-foreground">{filtered.length}</strong>{" "}
                  {filtered.length === 1 ? "veículo" : "veículos"}
                  {availableCount > 0 && <> · {availableCount} disponível(is) agora</>}
                </p>
              </div>

              {activeFilters.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() =>
                        setSearch({ [filter.key]: filter.reset } as Partial<InventorySearch>)
                      }
                      className="group"
                      aria-label={`Remover filtro ${filter.label}`}
                    >
                      <Badge
                        variant="outline"
                        className="gap-1 border-engineering/40 text-engineering transition-colors group-hover:bg-engineering/10"
                      >
                        {filter.label}
                        <X className="size-3" aria-hidden />
                      </Badge>
                    </button>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="quiet"
                    onClick={() => setSearch({ q: "", familia: "todos", condicao: "todos" })}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-10">
              {filtered.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index, 5) * 70} className="flex">
                      <InventoryCard item={item} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nenhum veículo com esses filtros"
                  description="Ajuste a busca ou fale diretamente: muitas oportunidades são confirmadas antes de entrar no site."
                  action={
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        type="button"
                        variant="institutional"
                        onClick={() => setSearch({ q: "", familia: "todos", condicao: "todos" })}
                      >
                        Limpar filtros
                      </Button>
                      <Button asChild variant="quiet">
                        <Link to="/contato">Falar com Christiano</Link>
                      </Button>
                    </div>
                  }
                />
              )}
            </div>
          </>
        )}

        <CommercialDisclaimer className="mt-10">
          {siteSettings.commercialDisclaimer}
        </CommercialDisclaimer>
      </section>

      <CTASection />
    </>
  );
}
