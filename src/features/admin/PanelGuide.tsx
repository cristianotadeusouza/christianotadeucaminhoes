import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Cloud,
  Download,
  FileText,
  Files,
  Gauge,
  History,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PanelView =
  | "dashboard"
  | "pipeline"
  | "clientes"
  | "historico"
  | "encaixes"
  | "propostas"
  | "estoque"
  | "agenda"
  | "visitas"
  | "arquivos"
  | "dados"
  | "guia";

export type GuideTarget = Exclude<PanelView, "guia">;

type GuideGroup = "rotina" | "vendas" | "campo" | "dados";

type GuideSection = {
  id: GuideTarget;
  label: string;
  group: GuideGroup;
  icon: LucideIcon;
  purpose: string;
  steps: string[];
  tip: string;
};

const guideGroups: Array<{ value: "todos" | GuideGroup; label: string }> = [
  { value: "todos", label: "Todas" },
  { value: "rotina", label: "Rotina" },
  { value: "vendas", label: "Vendas" },
  { value: "campo", label: "Campo" },
  { value: "dados", label: "Dados" },
];

const panelGuides: GuideSection[] = [
  {
    id: "dashboard",
    label: "Hoje",
    group: "rotina",
    icon: LayoutDashboard,
    purpose:
      "É a abertura da rotina. Mostra atrasos, oportunidades quentes, propostas com validade próxima, agenda imediata e as últimas conversas registradas.",
    steps: [
      "Comece pelos cartões de alerta antes de abrir novas prospecções.",
      "Resolva ações atrasadas e atendimentos sem próximo passo.",
      "Use Registrar contato para guardar uma ligação, mensagem, e-mail ou visita em poucos segundos.",
      "Confira a agenda imediata e o histórico recente antes de encerrar o dia.",
    ],
    tip: "Uma carteira organizada começa quando nenhuma conversa termina sem um próximo passo.",
  },
  {
    id: "pipeline",
    label: "Funil",
    group: "vendas",
    icon: Gauge,
    purpose:
      "Organiza cada oportunidade entre novo contato, diagnóstico, proposta, negociação, venda concluída ou atendimento que não avançou.",
    steps: [
      "Cadastre o cliente e confirme em qual etapa a conversa está.",
      "Mude a etapa no cartão sempre que houver avanço real.",
      "Use temperatura e próxima ação na ficha do cliente para definir prioridade.",
      "Registre motivo de ganho ou perda para aprender com a carteira.",
    ],
    tip: "Etapa do funil descreve o que já aconteceu. Próxima ação descreve o que precisa acontecer.",
  },
  {
    id: "clientes",
    label: "Clientes",
    group: "vendas",
    icon: UsersRound,
    purpose:
      "É a ficha completa da carteira, com empresa, canais de contato, operação, interesse, orçamento, prazo, endereço, observações e histórico.",
    steps: [
      "Busque por nome, empresa, cidade ou caminhão de interesse.",
      "Abra a ficha para ligar, chamar no WhatsApp, escrever pelo Gmail ou abrir o mapa.",
      "Atualize operação, orçamento, prazo de compra e temperatura.",
      "Salve o resumo da conversa e a data do próximo retorno.",
    ],
    tip: "Preencha primeiro carga, rota, implemento e prazo. Esses campos tornam o encaixe de estoque mais útil.",
  },
  {
    id: "historico",
    label: "Histórico",
    group: "rotina",
    icon: History,
    purpose:
      "Reúne ligações, mensagens, visitas, tarefas, propostas e arquivos em uma única linha do tempo por cliente.",
    steps: [
      "Escolha um cliente no filtro ou visualize toda a carteira.",
      "Revise o que foi combinado antes de fazer um novo contato.",
      "Confirme datas, condições e documentos já enviados.",
      "Use a sequência para retomar uma negociação sem depender da memória.",
    ],
    tip: "Antes de ligar, leia as duas últimas atividades. A conversa fica mais pessoal e objetiva.",
  },
  {
    id: "encaixes",
    label: "Encaixes",
    group: "vendas",
    icon: Sparkles,
    purpose:
      "Cruza o perfil do cliente com as unidades cadastradas no estoque e ordena alternativas por interesse, operação, orçamento, prazo e disponibilidade.",
    steps: [
      "Preencha a operação e o interesse na ficha do cliente.",
      "Mantenha tração, aplicação, preço e disponibilidade do estoque atualizados.",
      "Selecione o cliente e confira os motivos da pontuação de cada unidade.",
      "Valide tecnicamente a configuração e use Criar proposta quando houver um bom encaixe.",
    ],
    tip: "A pontuação ajuda a priorizar. A ficha técnica e a validação comercial da Belcar continuam obrigatórias.",
  },
  {
    id: "propostas",
    label: "Propostas",
    group: "vendas",
    icon: FileText,
    purpose:
      "Controla rascunhos, envios, revisões, aprovações, perdas e validades sem confundir versões ou condições.",
    steps: [
      "Vincule a proposta ao cliente e, quando possível, a uma unidade do estoque.",
      "Registre modelo, valor de referência, condição e validade.",
      "Gere o resumo comercial e compartilhe pelo canal adequado.",
      "Atualize o status e revise propostas expiradas antes de retomar o cliente.",
    ],
    tip: "O painel organiza o acompanhamento. A proposta válida é sempre a emitida e confirmada pelos processos oficiais da Belcar.",
  },
  {
    id: "estoque",
    label: "Estoque",
    group: "vendas",
    icon: Truck,
    purpose:
      "Mantém uma visão interna de unidades disponíveis, reservadas, vendidas ou sob encomenda, com modelo, ano, tração, aplicação, cor e localização.",
    steps: [
      "Cadastre manualmente uma unidade ou importe uma planilha autorizada.",
      "Preencha somente informações conferidas e a quantidade disponível.",
      "Altere o status assim que houver reserva, venda ou mudança de disponibilidade.",
      "Use os dados atualizados na tela Encaixes e nas propostas.",
    ],
    tip: "Nada cadastrado aqui é publicado automaticamente no site para clientes.",
  },
  {
    id: "agenda",
    label: "Agenda",
    group: "rotina",
    icon: CalendarDays,
    purpose:
      "Transforma retornos, ligações, mensagens, propostas e visitas em tarefas com data, prioridade, cliente e local.",
    steps: [
      "Crie a tarefa no fim da conversa ou deixe o registro rápido fazer isso por você.",
      "Marque prioridade alta somente para o que realmente precisa passar na frente.",
      "Use o atalho do Google Agenda para levar o compromisso ao calendário.",
      "Abra a rota quando houver endereço e marque a tarefa ao concluir.",
    ],
    tip: "No início da manhã, resolva primeiro o que está atrasado e depois siga a ordem de datas.",
  },
  {
    id: "visitas",
    label: "Visitas",
    group: "campo",
    icon: Route,
    purpose:
      "Concentra as visitas agendadas, acesso ao WhatsApp, rota no mapa e registro de check-in com resumo e fotos autorizadas.",
    steps: [
      "Crie uma tarefa do tipo Visita e informe cliente, data e endereço.",
      "Na tela Visitas, abra a rota e confirme o atendimento pelo WhatsApp.",
      "Depois da conversa, registre resultado, observações e próximo passo.",
      "Anexe fotos somente quando houver autorização e necessidade comercial.",
    ],
    tip: "Registre o check-in logo após sair do cliente, enquanto nomes, objeções e compromissos ainda estão frescos.",
  },
  {
    id: "arquivos",
    label: "Arquivos",
    group: "dados",
    icon: Files,
    purpose:
      "Guarda propostas, documentos comerciais e fotos autorizadas em área privada, vinculando cada item ao cliente e à proposta certa.",
    steps: [
      "Escolha o cliente, a proposta e a categoria antes do envio.",
      "Anexe PDF, foto, documento ou planilha necessária ao atendimento.",
      "Abra o arquivo por acesso temporário quando precisar consultar.",
      "Exclua versões antigas ou materiais que não precisam mais ser armazenados.",
    ],
    tip: "Evite guardar documentos pessoais, bancários ou sensíveis sem necessidade e autorização.",
  },
  {
    id: "dados",
    label: "Dados",
    group: "dados",
    icon: Download,
    purpose:
      "Importa clientes e estoque por CSV, ignora duplicados, fornece modelos de planilha, exporta a carteira e orienta a instalação no celular.",
    steps: [
      "Baixe os modelos de planilha antes da primeira importação.",
      "Revise nomes de colunas e importe apenas dados autorizados.",
      "Confira a quantidade importada e os duplicados ignorados.",
      "Exporte cópias periódicas para auditoria ou análise em planilha.",
    ],
    tip: "Importação economiza digitação, mas não substitui a conferência dos dados comerciais.",
  },
];

const quickStart = [
  {
    number: "01",
    title: "Cadastre o cliente",
    description: "Nome, empresa, WhatsApp, operação, interesse e prazo de compra.",
    view: "clientes" as const,
  },
  {
    number: "02",
    title: "Registre a conversa",
    description: "Resultado, resumo, próxima ação e data do retorno.",
    view: "dashboard" as const,
  },
  {
    number: "03",
    title: "Atualize o funil",
    description: "Mova a oportunidade somente quando a negociação realmente avançar.",
    view: "pipeline" as const,
  },
  {
    number: "04",
    title: "Cruze e acompanhe",
    description: "Compare estoque, prepare a proposta e deixe tudo programado na agenda.",
    view: "encaixes" as const,
  },
];

const workflows = [
  {
    title: "Novo cliente",
    path: "Clientes → Registrar contato → Agenda → Funil",
    description: "Do primeiro cadastro ao retorno marcado, sem perder o contexto da conversa.",
  },
  {
    title: "Caminhão certo",
    path: "Diagnóstico → Estoque → Encaixes → Propostas",
    description: "Organiza a necessidade antes de comparar unidades e montar condição comercial.",
  },
  {
    title: "Atendimento em campo",
    path: "Agenda → Visitas → Rota → Check-in → Histórico",
    description: "Leva endereço, contato e memória comercial para dentro da visita.",
  },
  {
    title: "Revisão semanal",
    path: "Hoje → Funil → Propostas → Dados",
    description: "Revisa atrasos, negociações paradas, validades e uma cópia da carteira.",
  },
];

export function PanelGuide({
  storageMode,
  focusView,
  onNavigate,
}: {
  storageMode: "cloud" | "local";
  focusView: GuideTarget;
  onNavigate: (view: GuideTarget) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"todos" | GuideGroup>("todos");
  const focusedGuide = panelGuides.find((guide) => guide.id === focusView);

  const filteredGuides = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return [...panelGuides]
      .sort((left, right) => {
        if (left.id === focusView) return -1;
        if (right.id === focusView) return 1;
        return 0;
      })
      .filter((guide) => group === "todos" || guide.group === group)
      .filter((guide) =>
        [guide.label, guide.purpose, guide.tip, ...guide.steps]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery),
      );
  }, [focusView, group, query]);

  return (
    <div className="space-y-8">
      <section className="admin-guide-hero relative isolate overflow-hidden rounded-2xl bg-road p-6 text-white shadow-raised sm:p-9 lg:p-11">
        <div className="admin-guide-hero__grid absolute inset-0" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.48fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3 py-2 text-xs font-semibold text-silver backdrop-blur-xl">
              <CircleHelp className="size-4 text-action" /> Tutorial completo do painel
            </span>
            <h2 className="mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Tudo o que o painel faz, explicado na ordem em que a venda acontece.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base">
              Use este guia para aprender uma tela específica ou seguir um fluxo completo, do
              primeiro contato ao acompanhamento depois da proposta.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/7 p-5 backdrop-blur-xl">
            <p className="text-technical text-xs font-bold uppercase tracking-[0.12em] text-action">
              Ajuda contextual
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              Você veio da tela {focusedGuide?.label ?? "Hoje"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              O tutorial dessa função aparece primeiro na lista abaixo.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow text-action">Primeiros 10 minutos</p>
            <h2 className="mt-2 text-2xl font-bold text-road">
              O caminho mais simples para começar
            </h2>
          </div>
          <ListChecks className="hidden size-7 text-engineering sm:block" aria-hidden="true" />
        </div>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStart.map((item) => (
            <li
              key={item.number}
              className="group rounded-xl border border-border bg-white p-5 shadow-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-raised"
            >
              <span className="text-technical text-3xl font-bold text-action/30">
                {item.number}
              </span>
              <h3 className="mt-4 text-base font-bold text-road">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <button
                type="button"
                onClick={() => onNavigate(item.view)}
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-engineering"
              >
                Abrir função
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-action">Mapa completo</p>
            <h2 className="mt-2 text-2xl font-bold text-road">Tutorial de todas as funções</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Pesquise uma dúvida ou filtre pela parte do trabalho que você está fazendo agora.
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 bg-surface pl-10"
              placeholder="Ex.: proposta, visita, planilha"
              aria-label="Pesquisar no tutorial"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar tutorial">
          {guideGroups.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setGroup(item.value)}
              aria-pressed={group === item.value}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                group === item.value
                  ? "border-road bg-road text-white"
                  : "border-border bg-white text-muted-foreground hover:border-engineering/35 hover:text-road",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {filteredGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <details
                key={guide.id}
                className={cn(
                  "group overflow-hidden rounded-xl border bg-surface/55",
                  guide.id === focusView ? "border-action/40" : "border-border",
                )}
                open={guide.id === focusView && !query}
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-road text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-road">{guide.label}</h3>
                      {guide.id === focusView && (
                        <span className="rounded-full bg-action/10 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-action">
                          tela consultada
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block truncate text-sm text-muted-foreground">
                      {guide.purpose}
                    </span>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="border-t border-border bg-white p-5 sm:p-6">
                  <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
                    {guide.purpose}
                  </p>
                  <ol className="mt-5 grid gap-3 md:grid-cols-2">
                    {guide.steps.map((step, index) => (
                      <li key={step} className="flex gap-3 rounded-lg bg-surface p-4">
                        <span className="text-technical grid size-6 shrink-0 place-items-center rounded-full bg-road text-[0.65rem] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm leading-relaxed text-road">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 flex flex-col gap-4 rounded-lg border border-engineering/15 bg-engineering/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-engineering" />
                      {guide.tip}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="institutional"
                      className="shrink-0"
                      onClick={() => onNavigate(guide.id)}
                    >
                      Abrir {guide.label} <ArrowRight />
                    </Button>
                  </div>
                </div>
              </details>
            );
          })}

          {!filteredGuides.length && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Search className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-road">Nenhum tópico encontrado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tente outra palavra ou selecione Todas.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <p className="eyebrow text-action">Fluxos prontos</p>
        <h2 className="mt-2 text-2xl font-bold text-road">Como as funções trabalham juntas</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {workflows.map((workflow) => (
            <article
              key={workflow.title}
              className="rounded-xl border border-border bg-white p-5 shadow-card"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-action/10 text-action">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-road">{workflow.title}</h3>
                  <p className="text-technical mt-2 text-xs font-bold text-engineering">
                    {workflow.path}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {workflow.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-engineering/15 bg-engineering/5 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <span className="grid size-13 place-items-center rounded-2xl bg-road text-white">
          {storageMode === "cloud" ? (
            <Cloud className="size-6" aria-hidden="true" />
          ) : (
            <ShieldCheck className="size-6" aria-hidden="true" />
          )}
        </span>
        <div>
          <h2 className="text-xl font-bold text-road">
            {storageMode === "cloud" ? "Painel sincronizado" : "Painel em modo local"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {storageMode === "cloud"
              ? "Clientes, tarefas, propostas e arquivos ficam disponíveis nos dispositivos autorizados. Saia do painel ao usar um aparelho de terceiros."
              : "Os cadastros ficam criptografados neste navegador. Baixe backups frequentes para não depender de um único aparelho."}
          </p>
        </div>
        <Button type="button" variant="quiet" onClick={() => onNavigate("dados")}>
          Ver cuidados com dados <ArrowRight />
        </Button>
      </section>
    </div>
  );
}
