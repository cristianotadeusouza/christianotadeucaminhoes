import { BarChart3, Mail, MessageCircle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { portfolioCategoryLabels, segmentLabels } from "./portfolio-labels";
import type { SalesContact } from "./types";

const lossReasonLabels: Record<string, string> = {
  nao_informado: "Motivo não informado",
  sem_contato: "Sem contato",
  sem_previsao_de_compra: "Sem previsão de compra",
  cadastro_inativo: "Cadastro inativo",
  duplicidade_no_sistema: "Duplicidade no sistema",
  fora_da_area: "Fora da área",
};

function whatsappUrl(contact: SalesContact) {
  const digits = contact.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá, ${contact.name}. Aqui é o Christiano, consultor de vendas da Belcar Caminhões. Quero atualizar seu atendimento e entender como está sua operação hoje. Podemos conversar?`,
  );
  return `https://wa.me/${digits}?text=${message}`;
}

function gmailUrl(contact: SalesContact) {
  const subject = encodeURIComponent("Atualização de atendimento | Belcar Caminhões");
  const body = encodeURIComponent(
    `Olá, ${contact.name}.\n\nAqui é o Christiano, consultor de vendas da Belcar Caminhões. Estou atualizando seu atendimento para entender sua operação e o momento de renovação da frota. Podemos conversar?\n\nChristiano Tadeu\nConsultor de vendas | Belcar Caminhões\n${siteConfig.phone}`,
  );
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}&su=${subject}&body=${body}`;
}

function EmptyPortfolio() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center shadow-card">
      <BarChart3 className="mx-auto size-8 text-engineering" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-bold text-road">Carteira importada ainda vazia</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Quando dados de um sistema anterior forem consolidados, as filas, segmentos e indicadores de
        qualidade aparecerão aqui.
      </p>
    </div>
  );
}

export function PortfolioAnalysis({ contacts }: { contacts: SalesContact[] }) {
  const imported = contacts.filter((contact) => contact.sourceSystem.toLowerCase() === "syonet");
  if (!imported.length) return <EmptyPortfolio />;

  const countCategory = (category: SalesContact["portfolioCategory"]) =>
    imported.filter((contact) => contact.portfolioCategory === category).length;
  const withPhone = imported.filter((contact) => contact.whatsapp).length;
  const withEmail = imported.filter((contact) => contact.email).length;
  const withDocument = imported.filter((contact) => contact.documentMasked).length;
  const duplicateGroups = imported.filter((contact) => contact.eventCount > 1).length;
  const eventTotal = imported.reduce((sum, contact) => sum + contact.eventCount, 0);
  const segmentCounts = Object.entries(
    imported.reduce<Record<string, number>>((result, contact) => {
      result[contact.segment] = (result[contact.segment] ?? 0) + 1;
      return result;
    }, {}),
  ).sort((left, right) => right[1] - left[1]);
  const lossCounts = Object.entries(
    imported.reduce<Record<string, number>>((result, contact) => {
      if (contact.stage === "perdido") {
        result[contact.lossReason || "nao_informado"] =
          (result[contact.lossReason || "nao_informado"] ?? 0) + 1;
      }
      return result;
    }, {}),
  ).sort((left, right) => right[1] - left[1]);
  const priorityValue: Record<SalesContact["priority"], number> = {
    alta: 3,
    media: 2,
    baixa: 1,
  };
  const priorityQueue = imported
    .filter((contact) =>
      ["atendimento_em_andamento", "retomar_com_prioridade"].includes(contact.portfolioCategory),
    )
    .sort((left, right) => {
      const priorityDifference = priorityValue[right.priority] - priorityValue[left.priority];
      if (priorityDifference) return priorityDifference;
      return right.lastContactAt.localeCompare(left.lastContactAt);
    })
    .slice(0, 12);

  const categoryCards = [
    ["retomar_com_prioridade", "Ação prioritária", "bg-action/8 text-action"],
    ["atendimento_em_andamento", "Em andamento", "bg-result/8 text-result"],
    ["reativar_carteira", "Reativar", "bg-engineering/8 text-engineering"],
    ["higienizar_dados", "Higienizar", "bg-warning/10 text-road"],
    ["arquivado_historico", "Somente histórico", "bg-surface-strong text-muted-foreground"],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-2xl border border-road bg-road p-5 text-white shadow-raised sm:p-7 lg:p-9">
        <div
          className="absolute -right-28 -top-28 size-72 rounded-full bg-engineering/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-action">Base histórica Syonet</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
              Carteira consolidada para agir, não apenas consultar
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
              {eventTotal} eventos válidos foram reunidos em {imported.length} fichas. Registros
              repetidos continuam no histórico de cada cliente, sem gerar cadastros duplicados.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {[
              [withPhone, "com telefone"],
              [withEmail, "com e-mail"],
              [duplicateGroups, "grupos consolidados"],
              [`${Math.round((withPhone / imported.length) * 100)}%`, "cobertura telefônica"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-white/8 bg-white/8 p-3">
                <strong className="text-technical text-2xl">{value}</strong>
                <p className="mt-1 text-[0.68rem] text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {categoryCards.map(([category, label, className]) => (
          <article
            key={category}
            className="rounded-xl border border-border bg-white p-4 shadow-card"
          >
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-1 text-[0.65rem] font-bold",
                className,
              )}
            >
              {label}
            </span>
            <p className="text-technical mt-4 text-3xl font-bold text-road">
              {countCategory(category)}
            </p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-action">Fila sugerida</p>
              <h2 className="mt-2 text-xl font-bold text-road">Quem merece revisão primeiro</h2>
            </div>
            <ShieldCheck className="size-5 text-result" aria-hidden="true" />
          </div>
          <div className="mt-5 divide-y divide-border">
            {priorityQueue.map((contact) => (
              <article
                key={contact.id}
                className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-road">{contact.name}</h3>
                    <Badge variant={contact.priority === "alta" ? "destructive" : "outline"}>
                      {portfolioCategoryLabels[contact.portfolioCategory]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {segmentLabels[contact.segment] ?? contact.segment} · {contact.nextAction}
                  </p>
                </div>
                <div className="flex gap-2">
                  {contact.email && (
                    <Button asChild variant="quiet" size="icon">
                      <a
                        href={gmailUrl(contact)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Enviar e-mail para ${contact.name}`}
                      >
                        <Mail />
                      </a>
                    </Button>
                  )}
                  {contact.whatsapp && (
                    <Button asChild variant="whatsapp" size="sm">
                      <a href={whatsappUrl(contact)} target="_blank" rel="noreferrer">
                        <MessageCircle /> WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-xl border border-border bg-white p-5 shadow-card">
            <p className="eyebrow text-action">Segmentos</p>
            <div className="mt-4 space-y-3">
              {segmentCounts.slice(0, 6).map(([segment, count]) => (
                <div key={segment} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{segmentLabels[segment] ?? segment}</span>
                  <strong className="text-technical text-road">{count}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-border bg-white p-5 shadow-card">
            <p className="eyebrow text-action">Motivos de perda</p>
            <div className="mt-4 space-y-3">
              {lossCounts.slice(0, 6).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {lossReasonLabels[reason] ?? reason}
                  </span>
                  <strong className="text-technical text-road">{count}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [withPhone, "telefones disponíveis"],
          [withEmail, "e-mails disponíveis"],
          [withDocument, "documentos mascarados"],
          [
            imported.filter((contact) => contact.needsRequalification).length,
            "fichas para conferir",
          ],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <strong className="text-technical text-xl text-road">{value}</strong>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <p className="rounded-lg border border-engineering/15 bg-engineering/5 p-4 text-xs leading-relaxed text-muted-foreground">
        As categorias são uma triagem inicial baseada no histórico importado. Antes de iniciar uma
        nova abordagem, confirme telefone, identidade, operação, região e interesse atual. Os dados
        permanecem na área autenticada do painel.
      </p>
    </div>
  );
}
