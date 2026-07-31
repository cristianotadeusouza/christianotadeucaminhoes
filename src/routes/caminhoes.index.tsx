import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  FileText,
  MapPinned,
  PackageCheck,
  Route as RouteIcon,
  Scale,
  Search,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { TruckFamily } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CTASection } from "@/components/common/CTASection";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { TruckFamilyCard } from "@/components/cards/TruckFamilyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteSettings } from "@/data/site-settings";
import {
  technicalSheetFiles,
  technicalSheets,
  truckPaints,
  type TechnicalSheetFamily,
} from "@/data/technical-sheets";
import { truckFamilyRepository } from "@/services/repositories";

const title = "Caminhões Volkswagen: Delivery, Constellation e Meteor";
const description =
  "Compare famílias, modelos e trações documentadas de caminhões Volkswagen e entenda os critérios para escolher a configuração da operação.";

type FamilyFilter = "Todas" | TechnicalSheetFamily;

const catalogFamilies: TechnicalSheetFamily[] = ["Delivery", "Constellation", "Meteor"];
const familyFilters: FamilyFilter[] = ["Todas", ...catalogFamilies];

const decisionCriteria = [
  {
    icon: Boxes,
    title: "Carga e implemento",
    description:
      "Tipo de mercadoria, peso, volume, baú, carroceria, tanque ou semirreboque mudam o chassi necessário.",
  },
  {
    icon: RouteIcon,
    title: "Rota e frequência",
    description:
      "Cidade, rodovia, número de paradas, distância mensal, rampas e piso definem prioridades diferentes.",
  },
  {
    icon: Scale,
    title: "Peso e distribuição",
    description:
      "PBT, CMT, número de eixos e distância entre eixos precisam conversar com o implemento e a legislação.",
  },
  {
    icon: PackageCheck,
    title: "Prazo e disponibilidade",
    description:
      "Unidade, cor, configuração, implementador e data de início da operação entram na mesma decisão.",
  },
  {
    icon: MapPinned,
    title: "Custo no trabalho real",
    description:
      "Aquisição é uma parte da conta. Quilometragem, manutenção, disponibilidade e adequação à rota completam a análise.",
  },
];

const comparisonRows: Array<{
  label: string;
  values: Record<TechnicalSheetFamily, string>;
}> = [
  {
    label: "Ponto de partida",
    values: {
      Delivery: "Distribuição urbana e regional, muitas paradas e acesso mais restrito",
      Constellation: "Operações urbanas, regionais, rodoviárias e vocacionais",
      Meteor: "Transporte rodoviário de longa distância e carga pesada",
    },
  },
  {
    label: "Trações documentadas",
    values: {
      Delivery: "4x2, 4x4, 6x2 e versões elétricas",
      Constellation: "4x2, 6x2, 6x4 e 8x2",
      Meteor: "6x2 e 6x4",
    },
  },
  {
    label: "Pergunta decisiva",
    values: {
      Delivery: "Quantas entregas, restrições e paradas acontecem por dia?",
      Constellation: "Qual peso, implemento, piso e frequência de uso?",
      Meteor: "Qual composição, rota e quilometragem mensal?",
    },
  },
];

export const Route = createFileRoute("/caminhoes/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  loader: async () => ({ families: await truckFamilyRepository.list() }),
  component: FamiliesPage,
});

function FamiliesPage() {
  const { families } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState<FamilyFilter>("Todas");

  const filteredModels = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return technicalSheets.filter((sheet) => {
      const matchesFamily = familyFilter === "Todas" || sheet.family === familyFilter;
      const matchesQuery = [sheet.model, sheet.family, sheet.traction]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery);
      return matchesFamily && matchesQuery;
    });
  }, [familyFilter, query]);

  const familyCounts = useMemo(
    () =>
      catalogFamilies.reduce<Record<TechnicalSheetFamily, number>>(
        (counts, family) => ({
          ...counts,
          [family]: technicalSheets.filter((sheet) => sheet.family === family).length,
        }),
        { Delivery: 0, Constellation: 0, Meteor: 0 },
      ),
    [],
  );

  return (
    <>
      <section className="surface-road road-lines relative overflow-hidden">
        <div className="container-content grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:py-20">
          <div>
            <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Caminhões" }]} />
            <p className="eyebrow mt-7 text-action">Linha Volkswagen</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
              Não existe caminhão certo sem entender o trabalho que ele vai fazer.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver sm:text-lg">
              Compare Delivery, Constellation e Meteor, consulte os modelos documentados e veja
              quais dados precisam estar claros antes de definir a configuração.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="action" size="lg">
                <a href="#modelos-documentados">
                  Ver modelos e trações <ArrowRight />
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="border-white/15 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/diagnostico">Analisar minha operação</Link>
              </Button>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/7 p-6 text-white shadow-raised backdrop-blur-xl sm:p-8">
            <p className="text-technical text-xs font-bold uppercase tracking-[0.13em] text-action">
              Catálogo organizado
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                [families.length, "famílias"],
                [technicalSheets.length, "fichas"],
                [truckPaints.length, "cores"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-white/6 p-4 text-center"
                >
                  <strong className="text-technical text-3xl font-bold text-white">{value}</strong>
                  <span className="mt-1 block text-[0.68rem] uppercase tracking-wide text-white/45">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <ol className="mt-7 space-y-4">
              {[
                "Entender carga, rota e implemento",
                "Comparar família, tração e configuração",
                "Confirmar ficha, disponibilidade e condição na Belcar",
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="text-technical grid size-7 shrink-0 place-items-center rounded-full bg-action text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <SectionHeader
          eyebrow="Famílias"
          title="Três linhas, trabalhos muito diferentes"
          description="A família reduz o campo de busca. O modelo só deve ser definido depois de cruzar aplicação, peso, implemento, rota e prazo."
        />
        <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {families.map((family: TruckFamily) => (
            <TruckFamilyCard key={family.slug} family={family} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-14 sm:py-20">
        <div className="container-content">
          <SectionHeader
            eyebrow="Antes do modelo"
            title="Cinco pontos que mudam a recomendação"
            description="Duas empresas podem transportar a mesma carga e ainda precisar de caminhões diferentes por causa da rota, do ciclo e do implemento."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {decisionCriteria.map(({ icon: Icon, title: criterionTitle, description: text }) => (
              <article
                key={criterionTitle}
                className="rounded-xl border border-border bg-white p-5 shadow-card"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-road text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-base font-bold text-road">{criterionTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modelos-documentados" className="container-content scroll-mt-24 py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeader
            eyebrow="Documentação disponível"
            title="Modelos e trações para consulta"
            description="A relação abaixo vem das fichas técnicas enviadas para o site. Abra o documento correspondente para conferir a configuração completa."
          />
          <div className="rounded-xl border border-border bg-white px-5 py-4 shadow-card">
            <p className="text-technical text-2xl font-bold text-road">{filteredModels.length}</p>
            <p className="text-xs text-muted-foreground">resultados na seleção</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white p-4 shadow-card sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 bg-surface pl-10"
                placeholder="Buscar modelo, família ou tração, como 6x4"
                aria-label="Buscar modelos de caminhão"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por família">
              {familyFilters.map((family) => (
                <button
                  key={family}
                  type="button"
                  onClick={() => setFamilyFilter(family)}
                  aria-pressed={familyFilter === family}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    familyFilter === family
                      ? "border-road bg-road text-white"
                      : "border-border bg-white text-muted-foreground hover:border-engineering/35 hover:text-road"
                  }`}
                >
                  {family}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredModels.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredModels.map((sheet) => (
              <article
                key={`${sheet.family}-${sheet.model}-${sheet.traction}`}
                className="group rounded-xl border border-border bg-white p-5 shadow-card transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-engineering/30 hover:shadow-raised"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-road text-white">
                    <Truck className="size-5" aria-hidden="true" />
                  </span>
                  <Badge variant="outline">{sheet.traction}</Badge>
                </div>
                <p className="mt-5 text-xs font-semibold text-engineering">
                  Família {sheet.family}
                </p>
                <h3 className="mt-1 text-lg font-bold text-road">{sheet.model}</h3>
                <a
                  href={`${technicalSheetFiles[sheet.family].href}#page=${sheet.page}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-engineering"
                >
                  Abrir ficha na página {sheet.page}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-border p-10 text-center">
            <Search className="mx-auto size-6 text-muted-foreground" />
            <h3 className="mt-3 text-base font-bold text-road">Nenhum modelo encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente outra busca ou selecione Todas as famílias.
            </p>
          </div>
        )}

        <CommercialDisclaimer className="mt-8">
          {siteSettings.specificationDisclaimer}
        </CommercialDisclaimer>
      </section>

      <section className="bg-road py-14 text-white sm:py-20">
        <div className="container-content">
          <SectionHeader
            tone="dark"
            eyebrow="Comparativo rápido"
            title="O que muda de uma família para outra"
            description="Resumo para orientar a primeira conversa. Versão, capacidade e aplicação final dependem da ficha e da análise técnica."
          />
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse text-left">
                <thead className="bg-white/8">
                  <tr>
                    <th className="p-5 text-xs font-semibold uppercase tracking-wide text-silver">
                      Critério
                    </th>
                    {catalogFamilies.map((family) => (
                      <th key={family} className="p-5 text-lg font-bold text-white">
                        {family}
                        <span className="mt-1 block text-xs font-normal text-white/40">
                          {familyCounts[family]} fichas documentadas
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="align-top">
                      <th className="p-5 text-sm font-semibold text-action">{row.label}</th>
                      {catalogFamilies.map((family) => (
                        <td key={family} className="p-5 text-sm leading-relaxed text-white/65">
                          {row.values[family]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <div className="grid gap-8 rounded-2xl border border-engineering/20 bg-engineering/5 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-road text-white">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-road">Fichas técnicas, páginas e cores</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Consulte os PDFs por família, pesquise modelo e tração e confira os{" "}
                {truckPaints.length} códigos de cores organizados no site.
              </p>
            </div>
          </div>
          <Button asChild variant="institutional" className="shrink-0">
            <Link to="/fichas-tecnicas">
              Abrir documentação completa <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <CTASection
        title="Quer reduzir a lista para os modelos que realmente atendem sua operação?"
        description="Informe carga, rota, implemento e prazo. Christiano organiza a conversa e confirma as opções pelos processos comerciais da Belcar Caminhões."
      />
    </>
  );
}
