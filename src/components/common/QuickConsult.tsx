import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, MessageCircle, RotateCcw, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl, hasWhatsAppNumber } from "@/services/whatsapp";

const choices = {
  objective: [
    ["primeiro", "Primeiro caminhão"],
    ["renovar", "Renovar a frota"],
    ["expandir", "Aumentar capacidade"],
  ],
  operation: [
    ["urbana", "Distribuição urbana"],
    ["regional", "Operação regional"],
    ["rodoviaria", "Longa distância"],
    ["especial", "Aplicação especial"],
  ],
  horizon: [
    ["agora", "O mais rápido possível"],
    ["90dias", "Nos próximos 90 dias"],
    ["planejando", "Ainda estou planejando"],
  ],
} as const;

type Answers = {
  objective?: (typeof choices.objective)[number][0];
  operation?: (typeof choices.operation)[number][0];
  horizon?: (typeof choices.horizon)[number][0];
};

const labels = Object.fromEntries(Object.values(choices).flat()) as Record<string, string>;

export function QuickConsult() {
  const [answers, setAnswers] = useState<Answers>({});
  const step = !answers.objective
    ? "objective"
    : !answers.operation
      ? "operation"
      : !answers.horizon
        ? "horizon"
        : "done";
  const completed = Object.keys(answers).length;
  const message =
    answers.objective && answers.operation && answers.horizon
      ? `Olá, Christiano. Fiz a triagem rápida do site. Objetivo: ${labels[answers.objective]}. Operação: ${labels[answers.operation]}. Prazo: ${labels[answers.horizon]}. Gostaria de organizar o próximo passo.`
      : "";

  const questions = {
    objective: { title: "Qual é o objetivo desta compra?", options: choices.objective },
    operation: { title: "Onde o caminhão vai trabalhar mais?", options: choices.operation },
    horizon: { title: "Quando você pretende avançar?", options: choices.horizon },
  } as const;

  function choose(value: string) {
    if (step === "done") return;
    setAnswers((current) => ({ ...current, [step]: value }));
  }

  return (
    <section className="quick-consult relative overflow-hidden bg-road py-20 text-white sm:py-28">
      <div className="quick-consult__glow" aria-hidden="true" />
      <div className="container-content relative grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div>
          <p className="eyebrow flex items-center gap-3 text-silver">
            <Zap className="size-4 text-action" aria-hidden="true" /> Triagem expressa
          </p>
          <h2 className="mt-5 text-[clamp(2.2rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.045em]">
            Menos formulário. Mais contexto útil.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65">
            Responda três pontos e abra o WhatsApp com a conversa já organizada. Leva menos de um
            minuto e evita começar do zero.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="quick-consult__progress h-full rounded-full bg-action"
                style={{ width: `${(completed / 3) * 100}%` }}
              />
            </div>
            <span className="text-technical text-xs font-bold text-silver">{completed}/3</span>
          </div>
        </div>

        <div className="quick-consult__panel min-h-[420px] rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_30px_90px_-35px_rgb(0_0_0_/_0.8)] backdrop-blur-xl sm:p-8 lg:p-10">
          {step !== "done" ? (
            <div key={step} className="quick-consult__step">
              <div className="flex items-center justify-between gap-4">
                <span className="text-technical text-xs font-bold uppercase tracking-[0.12em] text-action">
                  Pergunta {completed + 1}
                </span>
                {completed > 0 && (
                  <button
                    type="button"
                    onClick={() => setAnswers({})}
                    className="inline-flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white"
                  >
                    <RotateCcw className="size-3.5" /> Recomeçar
                  </button>
                )}
              </div>
              <h3 className="mt-5 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
                {questions[step].title}
              </h3>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {questions[step].options.map(([value, label], index) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => choose(value)}
                    className={cn(
                      "group flex min-h-20 items-center justify-between gap-4 rounded-xl border border-white/12 bg-white/[0.055] px-5 py-4 text-left transition-[background-color,border-color,transform] duration-300",
                      "hover:-translate-y-1 hover:border-action/70 hover:bg-white/10",
                    )}
                  >
                    <span>
                      <span className="text-technical text-[0.65rem] font-bold text-white/35">
                        0{index + 1}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white sm:text-base">
                        {label}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-action transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="quick-consult__step grid min-h-[340px] place-items-center text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-result text-white shadow-[0_0_0_10px_rgb(27_157_90_/_0.12)]">
                  <Check className="size-6" />
                </span>
                <p className="eyebrow mt-7 text-result">Contexto organizado</p>
                <h3 className="mx-auto mt-3 max-w-xl text-3xl font-bold text-white">
                  A conversa já pode começar no ponto certo.
                </h3>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
                  Christiano receberá seu objetivo, tipo de operação e prazo. O modelo só será
                  definido depois de entender carga, rota e implemento.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  {hasWhatsAppNumber ? (
                    <Button asChild variant="whatsapp" size="xl">
                      <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer">
                        <MessageCircle /> Enviar pelo WhatsApp
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="action" size="xl">
                      <Link to="/diagnostico">
                        <Sparkles /> Continuar diagnóstico
                      </Link>
                    </Button>
                  )}
                  <Button variant="onDark" size="xl" onClick={() => setAnswers({})}>
                    <RotateCcw /> Refazer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
