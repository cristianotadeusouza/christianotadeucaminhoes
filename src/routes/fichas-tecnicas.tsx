import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FileText, Palette, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { CTASection } from "@/components/common/CTASection";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteSettings } from "@/data/site-settings";
import {
  technicalSheetFiles,
  technicalSheets,
  truckPaints,
  type TechnicalSheetFamily,
  type TruckPaint,
} from "@/data/technical-sheets";
import { whatsappMessages } from "@/services/whatsapp";

const title = "Fichas técnicas e cores | Caminhões Volkswagen";
const description =
  "Consulte fichas técnicas de modelos Volkswagen Delivery, Constellation e Meteor e a relação de cores recebida para referência comercial.";

const toneColors: Record<TruckPaint["tone"], string> = {
  amarelo: "#e4bd1a",
  azul: "#2f5296",
  bege: "#b6a57c",
  branco: "#f4f3ef",
  bronze: "#71412d",
  cinza: "#73777d",
  laranja: "#da5a1d",
  prata: "#b5bac3",
  preto: "#17191d",
  verde: "#39936a",
  vermelho: "#bd2d2d",
};

const families = Object.keys(technicalSheetFiles) as TechnicalSheetFamily[];

export const Route = createFileRoute("/fichas-tecnicas")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: TechnicalSheetsPage,
});

function TechnicalSheetsPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredSheets = useMemo(
    () =>
      technicalSheets.filter((sheet) =>
        [sheet.model, sheet.family, sheet.traction]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  const filteredPaints = useMemo(
    () =>
      truckPaints.filter((paint) =>
        [paint.name, paint.code, paint.finish]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );

  return (
    <>
      <section className="surface-road road-lines border-b border-white/10 py-10 text-white sm:py-16">
        <div className="container-content">
          <Breadcrumbs
            items={[{ label: "Início", to: "/" }, { label: "Fichas técnicas e cores" }]}
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <SectionHeader
              as="h1"
              eyebrow="Referência de produto"
              title="Fichas técnicas e cores em um só lugar"
              description="Abra a ficha do modelo, confira a edição do documento e leve as informações certas para a conversa com Christiano."
              className="[&_h1]:text-white [&_p]:text-white/70"
            />
            <div className="rounded-xl border border-white/15 bg-white/7 p-5 backdrop-blur-sm">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="size-4 text-result" aria-hidden="true" />
                Documentos técnicos recebidos
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                São 48 páginas, organizadas por família para abrir melhor no celular. Alterações de
                produto podem ocorrer sem aviso prévio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[74px] z-30 border-b border-border bg-background/92 py-4 backdrop-blur-xl sm:top-[86px]">
        <div className="container-content">
          <label className="relative block max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="sr-only">Buscar modelo, tração, cor ou código</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 bg-white pl-11"
              placeholder="Buscar modelo, tração, cor ou código"
            />
          </label>
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <SectionHeader
          eyebrow="Documentação"
          title="Fichas técnicas por modelo"
          description="Cada link abre diretamente na página inicial do modelo dentro do arquivo da família."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {families.map((family) => {
            const file = technicalSheetFiles[family];
            return (
              <article
                key={family}
                className="rounded-xl border border-border bg-road p-5 text-white shadow-card"
              >
                <FileText className="size-6 text-action" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold">Linha {family}</h2>
                <p className="mt-2 min-h-10 text-sm leading-relaxed text-white/65">
                  {file.description}
                </p>
                <p className="mt-5 text-technical text-xs uppercase tracking-[0.12em] text-silver">
                  {file.pages} páginas
                </p>
                <Button asChild variant="onDark" className="mt-5 w-full">
                  <a href={file.href} target="_blank" rel="noreferrer">
                    Abrir arquivo <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              </article>
            );
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-white shadow-card">
          <div className="hidden grid-cols-[1fr_10rem_8rem] gap-4 border-b border-border bg-surface px-5 py-3 text-technical text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground sm:grid">
            <span>Modelo</span>
            <span>Família</span>
            <span>Ficha</span>
          </div>
          <div className="divide-y divide-border">
            {filteredSheets.map((sheet) => (
              <article
                key={`${sheet.family}-${sheet.model}-${sheet.traction}`}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_10rem_8rem] sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-road">{sheet.model}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Tração {sheet.traction}</p>
                </div>
                <span className="text-sm text-muted-foreground">{sheet.family}</span>
                <a
                  href={`${technicalSheetFiles[sheet.family].href}#page=${sheet.page}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-engineering hover:underline"
                >
                  Abrir ficha <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          {!filteredSheets.length && (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhuma ficha encontrada para esta busca.
            </p>
          )}
        </div>

        <CommercialDisclaimer className="mt-8">
          {siteSettings.specificationDisclaimer}
        </CommercialDisclaimer>
      </section>

      <section className="border-y border-border bg-surface py-14 sm:py-20">
        <div className="container-content">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <SectionHeader
                eyebrow="Acabamentos"
                title="Cores de referência"
                description="Nomes, códigos e acabamentos foram transcritos da tabela enviada."
              />
              <figure className="mt-7 overflow-hidden rounded-xl border border-border bg-white p-3 shadow-card">
                <img
                  src="/media/cores-caminhoes-vw-referencia.jpeg"
                  alt="Tabela recebida com nomes, códigos e acabamentos de cores para caminhões"
                  width={849}
                  height={1280}
                  loading="lazy"
                  className="h-auto w-full rounded-lg"
                />
                <figcaption className="px-2 pb-1 pt-3 text-xs leading-relaxed text-muted-foreground">
                  Imagem original usada na conferência da transcrição.
                </figcaption>
              </figure>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-road text-white">
                  <Palette className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-road">
                    {filteredPaints.length} cores encontradas
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Use a busca acima para filtrar por nome, código ou acabamento.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {filteredPaints.map((paint) => (
                  <article
                    key={paint.code}
                    className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm"
                  >
                    <span
                      className="size-11 shrink-0 rounded-full border border-black/15 shadow-inner"
                      style={{ backgroundColor: toneColors[paint.tone] }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-road">{paint.name}</h3>
                      <p className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span className="text-technical font-bold text-engineering">
                          {paint.code}
                        </span>
                        <span>{paint.finish}</span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-action/20 bg-action/5 p-4 text-sm leading-relaxed text-muted-foreground">
                As bolinhas mostram apenas a família cromática e não reproduzem a tinta. Tela,
                iluminação, lote, modelo e disponibilidade alteram a percepção. Confirme o código e
                a amostra física na Belcar antes do pedido.
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Quer confirmar ficha, cor ou disponibilidade?"
        description="Envie o modelo e o código da cor. Christiano confere a informação pelos canais comerciais da Belcar."
        message={whatsappMessages.general}
        context={{ placement: "technical_sheets_cta" }}
      />
    </>
  );
}
