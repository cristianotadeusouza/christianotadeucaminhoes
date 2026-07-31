import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Pencil } from "lucide-react";

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
import { openWhatsApp, hasWhatsAppNumber } from "@/services/whatsapp";
import { trackEvent } from "@/services/analytics";
import { siteSettings } from "@/data/site-settings";

const title = "Diagnóstico da operação | Christiano Tadeu";
const description =
  "Roteiro guiado sobre carga, rota, frota e intenção de compra. Ao final o resumo é organizado para você enviar a Christiano.";

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

/* ------------------------------------------------------------------ */
/* Opções                                                              */
/* ------------------------------------------------------------------ */

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

function labelOf<T extends string>(options: { value: T; label: string }[], value: T | "") {
  return options.find((option) => option.value === value)?.label ?? "";
}

/* ------------------------------------------------------------------ */
/* Estado                                                              */
/* ------------------------------------------------------------------ */

const initialState = {
  // 1 · Identificação
  name: "",
  companyName: "",
  city: "",
  state: "",
  whatsapp: "",
  email: "",
  // 2 · Operação
  activity: "",
  cargoType: "",
  approximateLoad: "",
  routeProfile: "" as RouteProfile | "",
  averageDistance: "",
  usageFrequency: "",
  bodyworkType: "",
  // 3 · Frota
  currentTruck: "",
  fleetSize: "",
  purchaseGoal: "" as PurchaseGoal | "",
  tradeInVehicle: "",
  mainPainPoint: "",
  // 4 · Intenção de compra
  horizon: "" as PurchaseHorizon | "",
  quantity: "",
  financingInterest: false,
  bestContactTime: "",
  notes: "",
};

type FormState = typeof initialState;
type FieldKey = keyof FormState;

const steps = [
  { id: "identificacao", label: "Identificação" },
  { id: "operacao", label: "Operação" },
  { id: "frota", label: "Frota" },
  { id: "intencao", label: "Intenção de compra" },
  { id: "revisao", label: "Revisão" },
  { id: "envio", label: "Envio" },
] as const;

/* ------------------------------------------------------------------ */
/* Rascunho local (versionado e com expiração)                         */
/* ------------------------------------------------------------------ */

const DRAFT_KEY = "ct-diagnostico-rascunho";
const DRAFT_VERSION = 2;
/** 7 dias. */
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface DraftEnvelope {
  version: number;
  expiresAt: number;
  data: Partial<FormState>;
}

function readDraft(): Partial<FormState> | null {
  try {
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as DraftEnvelope;
    if (parsed.version !== DRAFT_VERSION || !parsed.expiresAt || parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed.data ?? null;
  } catch {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* armazenamento indisponível */
    }
    return null;
  }
}

function writeDraft(data: FormState) {
  try {
    const envelope: DraftEnvelope = {
      version: DRAFT_VERSION,
      expiresAt: Date.now() + DRAFT_TTL_MS,
      data,
    };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(envelope));
  } catch {
    /* armazenamento indisponível — o formulário segue funcionando */
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* armazenamento indisponível */
  }
}

/* ------------------------------------------------------------------ */
/* WhatsApp — máscara brasileira tolerante                             */
/* ------------------------------------------------------------------ */

function maskWhatsApp(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/* ------------------------------------------------------------------ */
/* Validação por etapa                                                 */
/* ------------------------------------------------------------------ */

type Errors = Partial<Record<FieldKey | "consent", string>>;

function validateStep(step: number, form: FormState): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!form.name.trim()) errors.name = "Informe seu nome.";
    if (!form.city.trim()) errors.city = "Informe a cidade.";
    if (!form.state.trim()) errors.state = "Informe a UF.";
    const digits = form.whatsapp.replace(/\D/g, "");
    if (digits.length < 10) errors.whatsapp = "Informe o WhatsApp com DDD.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "E-mail inválido.";
    }
  }
  if (step === 1) {
    if (!form.activity.trim()) errors.activity = "Descreva a atividade da operação.";
    if (!form.cargoType.trim()) errors.cargoType = "Informe o tipo de carga.";
    if (!form.routeProfile) errors.routeProfile = "Selecione o perfil de rota.";
  }
  if (step === 2) {
    if (!form.purchaseGoal) errors.purchaseGoal = "Selecione o objetivo da compra.";
  }
  if (step === 3) {
    if (!form.horizon) errors.horizon = "Selecione o prazo pretendido.";
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

function DiagnosticPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const startedRef = useRef(false);
  const headingRef = useRef<HTMLDivElement | null>(null);

  /** Rascunho: o roteiro é longo e ninguém deve perder o que digitou. */
  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setForm((previous) => ({ ...previous, ...draft }));
      setDraftRestored(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => writeDraft(form), 400);
    return () => window.clearTimeout(timer);
  }, [form]);

  function update<K extends FieldKey>(key: K, value: FormState[K]) {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("diagnostic_started", { source: "diagnostico" });
    }
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function focusStep() {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  function goTo(next: number) {
    setErrors({});
    setStep(next);
    focusStep();
  }

  function goNext() {
    const found = validateStep(step, form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    trackEvent("diagnostic_step_completed", { source: "diagnostico", step: steps[step].id });
    setErrors({});
    setStep((previous) => Math.min(previous + 1, steps.length - 1));
    focusStep();
  }

  function goBack() {
    setErrors({});
    setStep((previous) => Math.max(previous - 1, 0));
    focusStep();
  }

  const summary: { label: string; value: string; step: number }[] = [
    { label: "Nome", value: form.name, step: 0 },
    { label: "Empresa", value: form.companyName, step: 0 },
    {
      label: "Cidade/UF",
      value: [form.city, form.state.toUpperCase()].filter(Boolean).join("/"),
      step: 0,
    },
    { label: "WhatsApp", value: form.whatsapp, step: 0 },
    { label: "E-mail", value: form.email, step: 0 },
    { label: "Atividade", value: form.activity, step: 1 },
    { label: "Carga", value: form.cargoType, step: 1 },
    { label: "Peso/volume aproximado", value: form.approximateLoad, step: 1 },
    { label: "Rota", value: labelOf(routeProfiles, form.routeProfile), step: 1 },
    { label: "Distância média", value: form.averageDistance, step: 1 },
    { label: "Frequência de uso", value: form.usageFrequency, step: 1 },
    { label: "Implemento", value: form.bodyworkType, step: 1 },
    { label: "Caminhão atual", value: form.currentTruck, step: 2 },
    { label: "Tamanho da frota", value: form.fleetSize, step: 2 },
    { label: "Objetivo", value: labelOf(goals, form.purchaseGoal), step: 2 },
    { label: "Usado na negociação", value: form.tradeInVehicle, step: 2 },
    { label: "Principal dificuldade", value: form.mainPainPoint, step: 2 },
    { label: "Prazo", value: labelOf(horizons, form.horizon), step: 3 },
    { label: "Quantidade", value: form.quantity, step: 3 },
    { label: "Interesse em financiamento", value: form.financingInterest ? "Sim" : "Não", step: 3 },
    { label: "Melhor período para contato", value: form.bestContactTime, step: 3 },
    { label: "Observações", value: form.notes, step: 3 },
  ].filter((entry) => entry.value.trim().length > 0);

  function buildMessage() {
    return [
      "Olá, Christiano. Fiz o diagnóstico pelo site.",
      "",
      `Nome: ${form.name}`,
      `Empresa: ${form.companyName || "—"}`,
      `Cidade: ${[form.city, form.state.toUpperCase()].filter(Boolean).join("/") || "—"}`,
      `Atividade: ${form.activity || "—"}`,
      `Carga: ${form.cargoType || "—"}`,
      `Rota: ${labelOf(routeProfiles, form.routeProfile) || "—"}`,
      `Caminhão atual: ${form.currentTruck || "—"}`,
      `Objetivo: ${labelOf(goals, form.purchaseGoal) || "—"}`,
      `Quantidade: ${form.quantity || "—"}`,
      `Prazo: ${labelOf(horizons, form.horizon) || "—"}`,
      `Financiamento: ${form.financingInterest ? "Sim" : "Não"}`,
      `Observações: ${form.notes || "—"}`,
    ].join("\n");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || submitted) return;

    if (!consent) {
      setErrors({ consent: "É necessário autorizar o contato para enviar o diagnóstico." });
      return;
    }

    setSubmitting(true);
    setErrors({});

    const message = buildMessage();

    try {
      const result = await leadRepository.create({
        name: form.name,
        companyName: form.companyName || undefined,
        city: form.city || undefined,
        state: form.state ? form.state.toUpperCase() : undefined,
        whatsapp: form.whatsapp,
        email: form.email || undefined,
        source: "diagnostico",
        status: "novo",
        operation: {
          activity: form.activity || undefined,
          cargoType: form.cargoType || undefined,
          approximateLoad: form.approximateLoad || undefined,
          routeProfile: form.routeProfile || undefined,
          averageDistance: form.averageDistance || undefined,
          usageFrequency: form.usageFrequency || undefined,
          bodyworkType: form.bodyworkType || undefined,
        },
        fleet: {
          currentTruck: form.currentTruck || undefined,
          fleetSize: form.fleetSize || undefined,
          purchaseGoal: form.purchaseGoal || undefined,
          tradeInVehicle: form.tradeInVehicle || undefined,
          mainPainPoint: form.mainPainPoint || undefined,
        },
        purchase: {
          horizon: form.horizon || undefined,
          quantity: form.quantity || undefined,
          financingInterest: form.financingInterest,
          bestContactTime: form.bestContactTime || undefined,
          notes: form.notes || undefined,
        },
        consentGivenAt: new Date().toISOString(),
      });

      if (!result.ok) {
        throw new Error("registro não confirmado");
      }

      if (hasWhatsAppNumber) {
        openWhatsApp(message, { placement: "diagnostic_form" });
        toast.success("Diagnóstico pronto — é só enviar a mensagem no WhatsApp.");
      } else {
        const copied = await navigator.clipboard
          ?.writeText(message)
          .then(() => true)
          .catch(() => false);
        toast.success(
          copied
            ? "Resumo copiado. Envie para Christiano pelo canal de contato."
            : "Copie o resumo abaixo e envie para Christiano pelo canal de contato.",
        );
      }

      trackEvent("diagnostic_completed", { source: "diagnostico" });
      setSubmitted(true);
      clearDraft();
    } catch {
      // Os dados NÃO são limpos: o visitante pode tentar de novo.
      setErrors({ consent: "Não foi possível concluir o envio. Tente novamente em instantes." });
      toast.error("Não foi possível concluir o envio agora.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = Math.round(((step + 1) / steps.length) * 100);

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
            description="São seis etapas rápidas. Ao final o resumo é organizado para você enviar pelo WhatsApp — nada é publicado nem compartilhado."
          />
        </div>
      </section>

      <section className="container-content py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Progresso */}
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-technical text-sm font-semibold text-road">
                Etapa {step + 1} de {steps.length} · {steps[step].label}
              </p>
              <p className="text-technical text-xs text-muted-foreground">{progress}%</p>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={step + 1}
              aria-valuetext={`Etapa ${step + 1} de ${steps.length}: ${steps[step].label}`}
            >
              <div
                className="h-full rounded-full bg-action transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {steps.map((item, index) => (
                <li
                  key={item.id}
                  aria-current={index === step ? "step" : undefined}
                  className={
                    index === step
                      ? "text-xs font-semibold text-engineering"
                      : index < step
                        ? "text-xs text-muted-foreground"
                        : "text-xs text-muted-foreground/60"
                  }
                >
                  {index < step && <Check className="mr-1 inline size-3" aria-hidden="true" />}
                  {item.label}
                </li>
              ))}
            </ol>
          </div>

          {draftRestored && !submitted && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-input bg-surface px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Rascunho salvo neste navegador (expira em 7 dias). Nada foi enviado ainda.
              </p>
              <Button
                type="button"
                size="sm"
                variant="quiet"
                onClick={() => {
                  clearDraft();
                  setForm(initialState);
                  setDraftRestored(false);
                  setStep(0);
                  setErrors({});
                }}
              >
                Limpar rascunho
              </Button>
            </div>
          )}

          <div ref={headingRef} tabIndex={-1} className="outline-none" />

          {submitted ? (
            <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-road">Diagnóstico concluído</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {hasWhatsAppNumber
                  ? "A conversa foi aberta no WhatsApp com o resumo das respostas. Se a janela não abrir, copie o texto abaixo."
                  : "O canal de WhatsApp ainda não está configurado neste site. Copie o resumo abaixo e envie pelo canal de contato."}
              </p>
              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-surface p-4 text-xs leading-relaxed text-foreground">
                {buildMessage()}
              </pre>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="institutional"
                  onClick={async () => {
                    const copied = await navigator.clipboard
                      ?.writeText(buildMessage())
                      .then(() => true)
                      .catch(() => false);
                    if (copied) toast.success("Resumo copiado.");
                    else toast.error("Não foi possível copiar automaticamente.");
                  }}
                >
                  Copiar resumo
                </Button>
                <Button asChild variant="quiet">
                  <Link to="/">Voltar ao início</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
              {step === 0 && (
                <Fieldset legend="Identificação">
                  <Field
                    id="name"
                    label="Nome"
                    required
                    error={errors.name}
                    autoComplete="name"
                    value={form.name}
                    onChange={(value) => update("name", value)}
                  />
                  <Field
                    id="companyName"
                    label="Empresa (opcional)"
                    autoComplete="organization"
                    value={form.companyName}
                    onChange={(value) => update("companyName", value)}
                  />
                  <Field
                    id="city"
                    label="Cidade"
                    required
                    error={errors.city}
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(value) => update("city", value)}
                  />
                  <Field
                    id="state"
                    label="UF"
                    required
                    error={errors.state}
                    autoComplete="address-level1"
                    maxLength={2}
                    value={form.state}
                    onChange={(value) =>
                      update("state", value.toUpperCase().replace(/[^A-Z]/g, ""))
                    }
                  />
                  <Field
                    id="whatsapp"
                    label="WhatsApp"
                    required
                    error={errors.whatsapp}
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(11) 90000-0000"
                    value={form.whatsapp}
                    onChange={(value) => update("whatsapp", maskWhatsApp(value))}
                  />
                  <Field
                    id="email"
                    label="E-mail (opcional)"
                    type="email"
                    error={errors.email}
                    autoComplete="email"
                    value={form.email}
                    onChange={(value) => update("email", value)}
                  />
                </Fieldset>
              )}

              {step === 1 && (
                <Fieldset legend="Operação">
                  <Field
                    id="activity"
                    label="Atividade da empresa"
                    required
                    error={errors.activity}
                    placeholder="Distribuição, construção, agronegócio..."
                    value={form.activity}
                    onChange={(value) => update("activity", value)}
                  />
                  <Field
                    id="cargoType"
                    label="Tipo de carga"
                    required
                    error={errors.cargoType}
                    placeholder="Bebidas, alimentos, materiais..."
                    value={form.cargoType}
                    onChange={(value) => update("cargoType", value)}
                  />
                  <Field
                    id="approximateLoad"
                    label="Peso ou volume aproximado (opcional)"
                    value={form.approximateLoad}
                    onChange={(value) => update("approximateLoad", value)}
                  />
                  <Field
                    id="averageDistance"
                    label="Distância média por rota (opcional)"
                    value={form.averageDistance}
                    onChange={(value) => update("averageDistance", value)}
                  />
                  <Field
                    id="usageFrequency"
                    label="Frequência de uso (opcional)"
                    placeholder="Diária, 3x por semana..."
                    value={form.usageFrequency}
                    onChange={(value) => update("usageFrequency", value)}
                  />
                  <Field
                    id="bodyworkType"
                    label="Implemento previsto (opcional)"
                    placeholder="Baú, graneleiro, basculante..."
                    value={form.bodyworkType}
                    onChange={(value) => update("bodyworkType", value)}
                  />
                  <ChoiceGroup
                    id="routeProfile"
                    label="Perfil de rota"
                    required
                    error={errors.routeProfile}
                    options={routeProfiles}
                    value={form.routeProfile}
                    onChange={(value) => update("routeProfile", value)}
                  />
                </Fieldset>
              )}

              {step === 2 && (
                <Fieldset legend="Frota">
                  <Field
                    id="currentTruck"
                    label="Caminhão atual (opcional)"
                    value={form.currentTruck}
                    onChange={(value) => update("currentTruck", value)}
                  />
                  <Field
                    id="fleetSize"
                    label="Tamanho da frota (opcional)"
                    value={form.fleetSize}
                    onChange={(value) => update("fleetSize", value)}
                  />
                  <Field
                    id="tradeInVehicle"
                    label="Veículo usado na negociação (opcional)"
                    placeholder="Modelo e ano do veículo de troca"
                    value={form.tradeInVehicle}
                    onChange={(value) => update("tradeInVehicle", value)}
                  />
                  <Field
                    id="mainPainPoint"
                    label="Principal dificuldade hoje (opcional)"
                    value={form.mainPainPoint}
                    onChange={(value) => update("mainPainPoint", value)}
                  />
                  <ChoiceGroup
                    id="purchaseGoal"
                    label="Objetivo da compra"
                    required
                    error={errors.purchaseGoal}
                    options={goals}
                    value={form.purchaseGoal}
                    onChange={(value) => update("purchaseGoal", value)}
                  />
                </Fieldset>
              )}

              {step === 3 && (
                <Fieldset legend="Intenção de compra">
                  <Field
                    id="quantity"
                    label="Quantidade de veículos (opcional)"
                    inputMode="numeric"
                    value={form.quantity}
                    onChange={(value) => update("quantity", value)}
                  />
                  <Field
                    id="bestContactTime"
                    label="Melhor período para contato (opcional)"
                    placeholder="Manhã, tarde, após as 18h..."
                    value={form.bestContactTime}
                    onChange={(value) => update("bestContactTime", value)}
                  />
                  <ChoiceGroup
                    id="horizon"
                    label="Prazo pretendido"
                    required
                    error={errors.horizon}
                    options={horizons}
                    value={form.horizon}
                    onChange={(value) => update("horizon", value)}
                  />
                  <div className="sm:col-span-2">
                    <label className="flex items-start gap-3 text-sm text-foreground">
                      <Checkbox
                        checked={form.financingInterest}
                        onCheckedChange={(checked) => update("financingInterest", checked === true)}
                      />
                      <span>Tenho interesse em avaliar financiamento</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      rows={4}
                      className="mt-2"
                      value={form.notes}
                      onChange={(event) => update("notes", event.target.value)}
                    />
                  </div>
                </Fieldset>
              )}

              {step === 4 && (
                <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                  <h2 className="text-technical text-sm font-bold uppercase tracking-wide text-road">
                    Revisão
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Confira as respostas antes de enviar. Você pode editar qualquer etapa.
                  </p>
                  <dl className="mt-5 divide-y divide-border">
                    {summary.map((entry) => (
                      <div
                        key={entry.label}
                        className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                      >
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:w-56 sm:shrink-0">
                          {entry.label}
                        </dt>
                        <dd className="min-w-0 flex-1 break-words text-sm text-foreground">
                          {entry.value}
                        </dd>
                        <Button
                          type="button"
                          size="sm"
                          variant="quiet"
                          className="self-start"
                          onClick={() => goTo(entry.step)}
                        >
                          <Pencil className="size-3" aria-hidden="true" />
                          Editar
                        </Button>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {step === 5 && (
                <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                  <h2 className="text-technical text-sm font-bold uppercase tracking-wide text-road">
                    Envio
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    O resumo será organizado para você enviar a Christiano. Disponibilidade,
                    configuração e condições comerciais são confirmadas no atendimento.
                  </p>
                  <label className="mt-5 flex items-start gap-3 text-sm text-foreground">
                    <Checkbox
                      checked={consent}
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? "consent-error" : undefined}
                      onCheckedChange={(checked) => {
                        setConsent(checked === true);
                        setErrors((previous) => ({ ...previous, consent: undefined }));
                      }}
                    />
                    <span>
                      Autorizo o contato sobre esta solicitação e li a{" "}
                      <Link to="/privacidade" className="underline hover:text-engineering">
                        política de privacidade
                      </Link>
                      .
                    </span>
                  </label>
                  {errors.consent && (
                    <p id="consent-error" role="alert" className="mt-2 text-sm text-destructive">
                      {errors.consent}
                    </p>
                  )}
                  <Button
                    type="submit"
                    variant="action"
                    size="lg"
                    className="mt-6"
                    disabled={submitting}
                  >
                    {submitting ? "Enviando..." : "Concluir diagnóstico"}
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="quiet" onClick={goBack} disabled={step === 0}>
                  Voltar
                </Button>
                {step < steps.length - 1 && (
                  <Button type="button" variant="institutional" onClick={goNext}>
                    Continuar
                  </Button>
                )}
              </div>
            </form>
          )}

          <CommercialDisclaimer className="mt-10">
            {siteSettings.commercialDisclaimer}
          </CommercialDisclaimer>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Campos                                                              */
/* ------------------------------------------------------------------ */

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-border bg-card p-6 shadow-card">
      <legend className="text-technical px-2 text-sm font-bold uppercase tracking-wide text-road">
        {legend}
      </legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  error,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  maxLength,
}: FieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceGroup<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  required,
  error,
}: {
  id: string;
  label: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div
      className="sm:col-span-2"
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <p id={`${id}-label`} className="text-sm font-medium text-foreground">
        {label}
        {required && " *"}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={value === option.value ? "institutional" : "quiet"}
            aria-pressed={value === option.value}
            aria-invalid={error ? true : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
