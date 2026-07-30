import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Compass } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { suggestFamily } from "@/services/recommendation";


import type { PurchaseGoal, PurchaseHorizon, RouteProfile } from "@/types";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { leadRepository } from "@/services/repositories";
import { openWhatsApp } from "@/services/whatsapp";
import { trackEvent } from "@/services/analytics";
import { hasWhatsAppNumber } from "@/services/whatsapp";
import { siteSettings } from "@/data/site-settings";

const title = "Diagnóstico da operação | Christiano Tadeu";
const description =
  "Responda um roteiro curto sobre carga, rota e objetivo da compra para chegar à configuração de caminhão adequada.";

const routeProfiles: { value: RouteProfile; label: string }[] = [
  { value: "urbana", label: "Urbana" },
  { value: "regional", label: "Regional" },
  { value: "rodoviaria", label: "Rodoviária" },
  { value: "mista", label: "Mista" },
];

const goals: { value: PurchaseGoal; label: string }[] = [
  { value: "primeiro_caminhao", label: "Primeiro caminhão" },
  { value: "ampliacao", label: "Ampliação da frota" },
  { value: "renovacao", label: "Renovação" },
  { value: "avaliando", label: "Ainda avaliando" },
];

const horizons: { value: PurchaseHorizon; label: string }[] = [
  { value: "imediato", label: "Imediato" },
  { value: "ate_3_meses", label: "Até 3 meses" },
  { value: "ate_6_meses", label: "Até 6 meses" },
  { value: "estudando", label: "Estudando" },
];

const initialState = {
  name: "",
  companyName: "",
  city: "",
  whatsapp: "",
  email: "",
  cargoType: "",
  approximateLoad: "",
  routeProfile: "urbana" as RouteProfile,
  averageDistance: "",
  bodyworkType: "",
  fleetSize: "",
  purchaseGoal: "primeiro_caminhao" as PurchaseGoal,
  mainPainPoint: "",
  horizon: "imediato" as PurchaseHorizon,
  financingInterest: false,
  notes: "",
  consent: false,
};

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DiagnosticPage,
});

function labelOf<T extends string>(options: { value: T; label: string }[], value: T) {
  return options.find((option) => option.value === value)?.label ?? value;
}

const DRAFT_KEY = "ct-diagnostico-rascunho";

/** Campos considerados no indicador de completude do roteiro. */
const progressFields: (keyof typeof initialState)[] = [
  "name",
  "whatsapp",
  "city",
  "cargoType",
  "approximateLoad",
  "averageDistance",
  "bodyworkType",
  "fleetSize",
  "mainPainPoint",
];

function DiagnosticPage() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  /** Rascunho local: o roteiro é longo e ninguém deve perder o que digitou. */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<typeof initialState>;
      setForm((previous) => ({ ...previous, ...parsed, consent: false }));
      setDraftRestored(true);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, consent: false }));
      } catch {
        /* armazenamento indisponível — o formulário segue funcionando */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form]);

  const update = <K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const completion = useMemo(() => {
    const filled = progressFields.filter((field) => String(form[field] ?? "").trim().length > 0);
    return Math.round((filled.length / progressFields.length) * 100);
  }, [form]);

  const suggestion = useMemo(
    () =>
      suggestFamily({
        routeProfile: form.routeProfile,
        approximateLoad: form.approximateLoad,
        averageDistance: form.averageDistance,
        cargoType: form.cargoType,
      }),
    [form.routeProfile, form.approximateLoad, form.averageDistance, form.cargoType],
  );



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.consent) {
      toast.error("É necessário autorizar o contato para enviar o diagnóstico.");
      return;
    }

    setSubmitting(true);
    trackEvent("diagnostic_started", { source: "diagnostico" });

    await leadRepository.create({
      name: form.name,
      companyName: form.companyName || undefined,
      city: form.city || undefined,
      whatsapp: form.whatsapp,
      email: form.email || undefined,
      source: "diagnostico",
      status: "novo",
      operation: {
        cargoType: form.cargoType || undefined,
        approximateLoad: form.approximateLoad || undefined,
        routeProfile: form.routeProfile,
        averageDistance: form.averageDistance || undefined,
        bodyworkType: form.bodyworkType || undefined,
      },
      fleet: {
        fleetSize: form.fleetSize || undefined,
        purchaseGoal: form.purchaseGoal,
        mainPainPoint: form.mainPainPoint || undefined,
      },
      purchase: {
        horizon: form.horizon,
        financingInterest: form.financingInterest,
        notes: form.notes || undefined,
      },
      consentGivenAt: new Date().toISOString(),
    });

    const message = [
      "Olá, Christiano. Preenchi o diagnóstico da operação no site.",
      "",
      `Nome: ${form.name}`,
      form.companyName ? `Empresa: ${form.companyName}` : null,
      form.city ? `Cidade: ${form.city}` : null,
      form.whatsapp ? `WhatsApp: ${form.whatsapp}` : null,
      "",
      "OPERAÇÃO",
      form.cargoType ? `Tipo de carga: ${form.cargoType}` : null,
      form.approximateLoad ? `Peso aproximado: ${form.approximateLoad}` : null,
      `Perfil de rota: ${labelOf(routeProfiles, form.routeProfile)}`,
      form.averageDistance ? `Distância média: ${form.averageDistance}` : null,
      form.bodyworkType ? `Implemento: ${form.bodyworkType}` : null,
      "",
      "FROTA E COMPRA",
      form.fleetSize ? `Tamanho da frota: ${form.fleetSize}` : null,
      `Objetivo: ${labelOf(goals, form.purchaseGoal)}`,
      form.mainPainPoint ? `Principal dificuldade: ${form.mainPainPoint}` : null,
      `Prazo: ${labelOf(horizons, form.horizon)}`,
      `Interesse em financiamento: ${form.financingInterest ? "sim" : "não"}`,
      form.notes ? `Observações: ${form.notes}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    trackEvent("diagnostic_completed", { source: "diagnostico" });

    if (hasWhatsAppNumber) {
      openWhatsApp(message, { placement: "diagnostic_form" });
      toast.success("Diagnóstico pronto — é só enviar a mensagem no WhatsApp.");
    } else {
      await navigator.clipboard?.writeText(message).catch(() => undefined);
      toast.success("Resumo copiado. Envie para Christiano pelo canal de contato.");
    }

    setSubmitting(false);
  }

  return (
    <>
      <section className="border-b border-border bg-surface py-10 sm:py-14">
        <div className="container-content">
          <Breadcrumbs items={[{ label: "Início", to: "/" }, { label: "Diagnóstico" }]} />
          <SectionHeader
            as="h1"
            className="mt-6 max-w-3xl"
            eyebrow="Diagnóstico"
            title="Um roteiro curto para chegar à configuração certa"
            description="Leva poucos minutos. Ao final, o resumo é montado para você enviar pelo WhatsApp — nada é publicado nem compartilhado."
          />
        </div>
      </section>

      <section className="container-content py-14 sm:py-20">
        <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-10">
            <fieldset className="rounded-lg border border-border bg-card p-6 shadow-card">
              <legend className="text-technical px-2 text-sm font-bold uppercase tracking-wide text-road">
                1. Identificação
              </legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    required
                    inputMode="tel"
                    value={form.whatsapp}
                    onChange={(event) => update("whatsapp", event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Empresa</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(event) => update("companyName", event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-lg border border-border bg-card p-6 shadow-card">
              <legend className="text-technical px-2 text-sm font-bold uppercase tracking-wide text-road">
                2. Operação
              </legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cargoType">Tipo de carga</Label>
                  <Input
                    id="cargoType"
                    value={form.cargoType}
                    onChange={(event) => update("cargoType", event.target.value)}
                    placeholder="Bebidas, alimentos, materiais..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="approximateLoad">Peso aproximado por viagem</Label>
                  <Input
                    id="approximateLoad"
                    value={form.approximateLoad}
                    onChange={(event) => update("approximateLoad", event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="averageDistance">Distância média por rota</Label>
                  <Input
                    id="averageDistance"
                    value={form.averageDistance}
                    onChange={(event) => update("averageDistance", event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="bodyworkType">Implemento previsto</Label>
                  <Input
                    id="bodyworkType"
                    value={form.bodyworkType}
                    onChange={(event) => update("bodyworkType", event.target.value)}
                    placeholder="Baú, graneleiro, basculante..."
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="mt-5">
                <p className="text-sm font-medium text-foreground">Perfil de rota</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {routeProfiles.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={form.routeProfile === option.value ? "institutional" : "quiet"}
                      aria-pressed={form.routeProfile === option.value}
                      onClick={() => update("routeProfile", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-lg border border-border bg-card p-6 shadow-card">
              <legend className="text-technical px-2 text-sm font-bold uppercase tracking-wide text-road">
                3. Frota e intenção de compra
              </legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fleetSize">Quantos caminhões você tem hoje?</Label>
                  <Input
                    id="fleetSize"
                    value={form.fleetSize}
                    onChange={(event) => update("fleetSize", event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="mainPainPoint">Principal dificuldade hoje</Label>
                  <Input
                    id="mainPainPoint"
                    value={form.mainPainPoint}
                    onChange={(event) => update("mainPainPoint", event.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-foreground">Objetivo da compra</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {goals.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={form.purchaseGoal === option.value ? "institutional" : "quiet"}
                      aria-pressed={form.purchaseGoal === option.value}
                      onClick={() => update("purchaseGoal", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-foreground">Prazo pretendido</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {horizons.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant={form.horizon === option.value ? "institutional" : "quiet"}
                      aria-pressed={form.horizon === option.value}
                      onClick={() => update("horizon", option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3">
                <Checkbox
                  id="financingInterest"
                  checked={form.financingInterest}
                  onCheckedChange={(checked) => update("financingInterest", checked === true)}
                />
                <Label htmlFor="financingInterest" className="text-sm font-normal leading-relaxed">
                  Tenho interesse em avaliar financiamento
                </Label>
              </div>

              <div className="mt-5">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  className="mt-2"
                />
              </div>
            </fieldset>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={form.consent}
                onCheckedChange={(checked) => update("consent", checked === true)}
              />
              <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
                Autorizo o contato de Christiano Tadeu sobre esta solicitação. Os dados são usados
                apenas no atendimento.
              </Label>
            </div>

            <Button type="submit" variant="action" size="xl" disabled={submitting}>
              {submitting ? "Preparando resumo..." : "Gerar resumo e enviar"}
            </Button>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-road">Roteiro preenchido</h2>
                <span className="text-technical text-sm font-bold text-engineering">
                  {completion}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso do diagnóstico"
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong"
              >
                <div
                  className="h-full rounded-full bg-engineering transition-[width] duration-500 ease-out"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {draftRestored
                  ? "Recuperamos o que você já havia digitado neste navegador."
                  : "O que você digita fica salvo neste navegador enquanto preenche."}
              </p>
            </div>

            {suggestion && (
              <Reveal className="rounded-xl border border-engineering/30 bg-surface p-6">
                <p className="eyebrow flex items-center gap-2 text-engineering">
                  <Compass className="size-4" aria-hidden />
                  Direção preliminar
                </p>
                <h2 className="text-technical mt-3 text-xl font-bold uppercase tracking-wide text-road">
                  Família {suggestion.label}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confiança {suggestion.confidence} · indicação automática, confirmada por Christiano
                  no atendimento.
                </p>
                <ul className="mt-4 space-y-2">
                  {suggestion.reasons.map((reason) => (
                    <li key={reason} className="flex gap-2 text-sm leading-relaxed text-foreground">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-result"
                        aria-hidden
                      />
                      {reason}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="quiet" size="sm" className="mt-4">
                  <Link to="/caminhoes/$family" params={{ family: suggestion.slug }}>
                    Ver a família {suggestion.label}
                  </Link>
                </Button>
              </Reveal>
            )}

            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-base font-semibold text-road">Por que essas perguntas</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Carga, rota e implemento definem PBT, configuração de eixos e o tipo de cabine. Sem
                esses dados, qualquer recomendação seria palpite.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Nenhum dado é publicado no site</li>
                <li>Você envia o resumo pelo seu próprio WhatsApp</li>
                <li>Sem compromisso de compra</li>
              </ul>
            </div>
            <CommercialDisclaimer>{siteSettings.commercialDisclaimer}</CommercialDisclaimer>
          </aside>

        </form>
      </section>
    </>
  );
}
