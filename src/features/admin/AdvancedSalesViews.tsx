import {
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileArchive,
  FileDown,
  FileSpreadsheet,
  FileText,
  Gauge,
  LocateFixed,
  Mail,
  MapPinned,
  MessageCircle,
  Mic,
  PackageCheck,
  Paperclip,
  Phone,
  Plus,
  Route,
  Search,
  Sparkles,
  Trash2,
  Truck,
  Upload,
  UserRoundSearch,
} from "lucide-react";
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { PwaInstallButton } from "@/components/common/PwaManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DocumentUploadInput, InteractionInput } from "./cloud";
import {
  downloadTextFile,
  exportContacts,
  exportInventory,
  exportProposals,
  importContactsFromCsv,
  importInventoryFromCsv,
  openProposalDocument,
  proposalGmailUrl,
  proposalWhatsAppUrl,
  rankVehicleMatches,
  technicalSheetHref,
  toCsv,
} from "./sales-tools";
import {
  interactionOutcomes,
  proposalStatuses,
  type InteractionOutcome,
  type SalesContact,
  type SalesDocument,
  type SalesInteraction,
  type SalesProposal,
  type SalesTask,
  type SalesWorkspace,
  type StockVehicle,
} from "./types";

const labelClass = "text-technical text-xs font-bold uppercase tracking-[0.11em] text-road";
const fieldClass = "mt-2 h-11 bg-white";
const selectClass =
  "mt-2 h-11 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const channelLabels: Record<SalesInteraction["channel"], string> = {
  whatsapp: "WhatsApp",
  phone: "Ligação",
  email: "E-mail",
  visit: "Visita",
  other: "Outro",
};

const outcomeLabels = Object.fromEntries(
  interactionOutcomes.map((outcome) => [outcome.value, outcome.label]),
) as Record<InteractionOutcome, string>;

function dateLabel(value: string, withTime = false) {
  if (!value) return "Sem data";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(
    "pt-BR",
    withTime ? { dateStyle: "short", timeStyle: "short" } : { dateStyle: "short" },
  ).format(date);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function mapsUrl(value: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

export type QuickRecordInput = InteractionInput & {
  createTask: boolean;
  taskTitle: string;
  priority: SalesTask["priority"];
};

export function QuickInteractionDialog({
  contacts,
  onRecord,
  trigger,
  defaultContactId = "",
}: {
  contacts: SalesContact[];
  onRecord: (input: QuickRecordInput) => Promise<void>;
  trigger?: ReactNode;
  defaultContactId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextActionDate = String(form.get("nextActionDate") || "");
    const nextAction = String(form.get("nextAction") || "").trim();
    setBusy(true);
    try {
      await onRecord({
        contactId: String(form.get("contactId") || ""),
        channel: String(form.get("channel")) as SalesInteraction["channel"],
        notes: String(form.get("notes") || "").trim(),
        outcome: String(form.get("outcome")) as InteractionOutcome,
        nextAction,
        nextActionDate,
        location: String(form.get("location") || "").trim(),
        createTask: Boolean(nextAction || nextActionDate),
        taskTitle: nextAction || "Retornar contato",
        priority: String(form.get("priority")) as SalesTask["priority"],
      });
      event.currentTarget.reset();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="action">
            <Phone /> Registrar contato
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar contato em poucos segundos</DialogTitle>
          <DialogDescription>
            Guarde o resultado da ligação, mensagem, e-mail ou visita e já deixe o próximo passo
            agendado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-3 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Cliente *</span>
            <select
              className={selectClass}
              name="contactId"
              defaultValue={defaultContactId}
              required
            >
              <option value="">Selecione o cliente</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                  {contact.company ? ` · ${contact.company}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Canal</span>
            <select className={selectClass} name="channel" defaultValue="phone">
              <option value="phone">Ligação</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E-mail</option>
              <option value="visit">Visita</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Resultado</span>
            <select className={selectClass} name="outcome" defaultValue="atendeu">
              {interactionOutcomes.map((outcome) => (
                <option key={outcome.value} value={outcome.value}>
                  {outcome.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Resumo da conversa *</span>
            <Textarea
              className="mt-2 min-h-24 bg-white"
              name="notes"
              placeholder="Ex.: confirmou carga de 18 toneladas e pediu proposta para terça-feira"
              required
            />
          </label>
          <label>
            <span className={labelClass}>Próxima ação</span>
            <Input className={fieldClass} name="nextAction" placeholder="Ex.: enviar simulação" />
          </label>
          <label>
            <span className={labelClass}>Data</span>
            <Input className={fieldClass} name="nextActionDate" type="date" />
          </label>
          <label>
            <span className={labelClass}>Prioridade</span>
            <select className={selectClass} name="priority" defaultValue="normal">
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Local, se for visita</span>
            <Input className={fieldClass} name="location" placeholder="Endereço ou empresa" />
          </label>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" variant="action" disabled={busy || !contacts.length}>
              {busy ? "Registrando..." : "Salvar e organizar próximo passo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MatchCenter({
  workspace,
  onCreateProposal,
}: {
  workspace: SalesWorkspace;
  onCreateProposal: (contact: SalesContact, vehicle: StockVehicle) => void;
}) {
  const [contactId, setContactId] = useState(workspace.contacts[0]?.id ?? "");
  const contact = workspace.contacts.find((item) => item.id === contactId);
  const matches = useMemo(
    () => (contact ? rankVehicleMatches(contact, workspace.inventory) : []),
    [contact, workspace.inventory],
  );

  if (!workspace.contacts.length || !workspace.inventory.length) {
    return (
      <EmptyFeature
        icon={UserRoundSearch}
        title="O cruzamento precisa de cliente e estoque"
        description="Cadastre ao menos um atendimento e uma unidade de estoque para comparar necessidade, disponibilidade e orçamento."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-road p-6 text-white shadow-raised sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="eyebrow text-action">Encaixe comercial</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Qual unidade faz mais sentido agora?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
              A pontuação cruza modelo, família, operação, palavras-chave, orçamento e
              disponibilidade. É apoio à conversa, não substitui a validação técnica.
            </p>
          </div>
          <label>
            <span className="text-technical text-xs font-bold uppercase tracking-[0.11em] text-silver">
              Cliente analisado
            </span>
            <select
              className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-white px-4 text-sm text-road"
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
            >
              {workspace.contacts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.company ? ` · ${item.company}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {contact && (
        <section className="grid gap-3 rounded-xl border border-border bg-white p-5 shadow-card sm:grid-cols-4">
          {[
            ["Interesse", contact.interest || "Não informado"],
            ["Operação", contact.operation || "Não informada"],
            ["Orçamento", contact.budget || "Não informado"],
            ["Prazo", contact.purchaseWindow.replaceAll("_", " ")],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-surface p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-bold capitalize text-road">{value}</p>
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map(({ vehicle, score, reasons }, index) => (
          <article
            key={vehicle.id}
            className="overflow-hidden rounded-xl border border-border bg-white shadow-card"
          >
            <div className="flex items-start justify-between gap-5 bg-road p-5 text-white">
              <div>
                <p className="text-technical text-xs uppercase tracking-[0.12em] text-silver">
                  {index === 0 ? "Melhor encaixe" : `Alternativa ${index + 1}`}
                </p>
                <h3 className="mt-2 text-xl font-bold">
                  VW {vehicle.family} {vehicle.model}
                </h3>
              </div>
              <span className="grid size-14 place-items-center rounded-full border border-white/15 bg-white/10 text-technical text-lg font-bold text-action">
                {score}
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{vehicle.status}</Badge>
                {vehicle.traction && <Badge variant="outline">{vehicle.traction}</Badge>}
                {vehicle.price && <Badge variant="outline">{vehicle.price}</Badge>}
              </div>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {(reasons.length ? reasons : ["Unidade disponível para avaliação manual"]).map(
                  (reason) => (
                    <li key={reason} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-result" /> {reason}
                    </li>
                  ),
                )}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant="action"
                  onClick={() => contact && onCreateProposal(contact, vehicle)}
                >
                  Criar proposta <ArrowUpRight />
                </Button>
                <Button asChild variant="quiet">
                  <a href={technicalSheetHref(vehicle.model)} target="_blank" rel="noreferrer">
                    Ficha técnica <FileText />
                  </a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProposalDialog({
  contacts,
  inventory,
  onAdd,
  trigger,
}: {
  contacts: SalesContact[];
  inventory: StockVehicle[];
  onAdd: (proposal: SalesProposal) => void;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const vehicleId = String(form.get("vehicleId") || "");
    const vehicle = inventory.find((item) => item.id === vehicleId);
    const now = new Date().toISOString();
    onAdd({
      id: crypto.randomUUID(),
      contactId: String(form.get("contactId") || ""),
      vehicleId,
      title: String(form.get("title") || "Proposta comercial").trim(),
      model: String(form.get("model") || vehicle?.model || "").trim(),
      value: String(form.get("value") || vehicle?.price || "").trim(),
      status: "rascunho",
      validUntil: String(form.get("validUntil") || ""),
      conditions: String(form.get("conditions") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
      sentAt: "",
      createdAt: now,
      updatedAt: now,
    });
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="action">
            <Plus /> Nova proposta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preparar proposta</DialogTitle>
          <DialogDescription>
            Organize a condição comercial. A formalização continua sendo feita pelos processos
            oficiais da Belcar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-3 grid gap-5 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Cliente *</span>
            <select className={selectClass} name="contactId" required defaultValue="">
              <option value="">Selecione</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Unidade do estoque</span>
            <select className={selectClass} name="vehicleId" defaultValue="">
              <option value="">Sem unidade vinculada</option>
              {inventory.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  VW {vehicle.family} {vehicle.model}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Título</span>
            <Input
              className={fieldClass}
              name="title"
              defaultValue="Proposta comercial Belcar Caminhões"
            />
          </label>
          <label>
            <span className={labelClass}>Modelo</span>
            <Input className={fieldClass} name="model" placeholder="Ex.: Meteor 29.530" />
          </label>
          <label>
            <span className={labelClass}>Valor de referência</span>
            <Input className={fieldClass} name="value" inputMode="decimal" placeholder="R$ 0,00" />
          </label>
          <label>
            <span className={labelClass}>Validade</span>
            <Input className={fieldClass} name="validUntil" type="date" />
          </label>
          <label>
            <span className={labelClass}>Condição</span>
            <Input
              className={fieldClass}
              name="conditions"
              placeholder="Entrada, prazo ou observação"
            />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Notas internas</span>
            <Textarea
              className="mt-2 min-h-24 bg-white"
              name="notes"
              placeholder="Troca, implemento, campanha, documentação..."
            />
          </label>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" variant="action">
              Criar rascunho
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProposalsCenter({
  workspace,
  onAdd,
  onUpdate,
}: {
  workspace: SalesWorkspace;
  onAdd: (proposal: SalesProposal) => void;
  onUpdate: (proposal: SalesProposal) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = workspace.proposals.filter((proposal) => {
    const contact = workspace.contacts.find((item) => item.id === proposal.contactId);
    return [proposal.title, proposal.model, proposal.status, contact?.name, contact?.company]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 bg-white pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente, modelo ou status"
          />
        </div>
        <ProposalDialog
          contacts={workspace.contacts}
          inventory={workspace.inventory}
          onAdd={onAdd}
        />
      </div>

      {!workspace.proposals.length ? (
        <EmptyFeature
          icon={FileText}
          title="Nenhuma proposta criada"
          description="Crie o primeiro rascunho e acompanhe envio, revisão, aprovação, validade e motivo de perda."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((proposal) => {
            const contact = workspace.contacts.find((item) => item.id === proposal.contactId);
            const vehicle = workspace.inventory.find((item) => item.id === proposal.vehicleId);
            const expired = Boolean(
              proposal.validUntil &&
              proposal.validUntil < today() &&
              !["aprovada", "perdida"].includes(proposal.status),
            );
            return (
              <article
                key={proposal.id}
                className="overflow-hidden rounded-xl border border-border bg-white shadow-card"
              >
                <div className="flex items-start justify-between gap-4 border-b border-border bg-surface p-5">
                  <div>
                    <p className="text-xs font-semibold text-engineering">
                      {contact?.name || "Cliente"}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-road">
                      {proposal.model || proposal.title}
                    </h3>
                  </div>
                  <Badge variant={expired ? "destructive" : "outline"}>
                    {expired
                      ? "Expirada"
                      : proposalStatuses.find((item) => item.value === proposal.status)?.label}
                  </Badge>
                </div>
                <div className="p-5">
                  <p className="text-technical text-2xl font-bold text-road">
                    {proposal.value || "Valor a confirmar"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Validade: {dateLabel(proposal.validUntil)}
                  </p>
                  <select
                    className={selectClass}
                    aria-label={`Status da proposta ${proposal.title}`}
                    value={expired ? "expirada" : proposal.status}
                    onChange={(event) => {
                      const status = event.target.value as SalesProposal["status"];
                      onUpdate({
                        ...proposal,
                        status,
                        sentAt:
                          status === "enviada" && !proposal.sentAt
                            ? new Date().toISOString()
                            : proposal.sentAt,
                        updatedAt: new Date().toISOString(),
                      });
                    }}
                  >
                    {proposalStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button
                      variant="institutional"
                      onClick={() => contact && openProposalDocument(proposal, contact, vehicle)}
                    >
                      <FileDown /> Abrir
                    </Button>
                    {contact?.whatsapp && (
                      <Button asChild variant="whatsapp">
                        <a
                          href={proposalWhatsAppUrl(proposal, contact)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle /> WhatsApp
                        </a>
                      </Button>
                    )}
                    {contact?.email && (
                      <Button asChild variant="quiet">
                        <a
                          href={proposalGmailUrl(proposal, contact)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Mail /> Gmail
                        </a>
                      </Button>
                    )}
                    <Button asChild variant="quiet">
                      <a href={technicalSheetHref(proposal.model)} target="_blank" rel="noreferrer">
                        <FileText /> Ficha
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  SpeechRecognition?: new () => SpeechRecognitionLike;
};

function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);

  function start() {
    const SpeechRecognition =
      (window as SpeechWindow).SpeechRecognition ??
      (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("O reconhecimento de voz não está disponível neste navegador.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => onTranscript(event.results[0]?.[0]?.transcript ?? "");
    recognition.onerror = () => toast.error("Não foi possível entender a anotação.");
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  return (
    <Button type="button" variant={listening ? "action" : "quiet"} size="sm" onClick={start}>
      <Mic /> {listening ? "Ouvindo..." : "Anotar por voz"}
    </Button>
  );
}

function VisitCheckInDialog({
  task,
  contact,
  storageMode,
  onRecord,
  onUpload,
}: {
  task?: SalesTask;
  contact: SalesContact;
  storageMode: "cloud" | "local";
  onRecord: (input: QuickRecordInput) => Promise<void>;
  onUpload: (input: DocumentUploadInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(task?.location || contact.address || contact.city);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  function locate() {
    if (!navigator.geolocation) {
      toast.error("Localização indisponível neste aparelho.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(
          `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        );
        toast.success("Local da visita registrado.");
      },
      () => toast.error("Não foi possível obter a localização."),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await onRecord({
        contactId: contact.id,
        channel: "visit",
        outcome: String(form.get("outcome")) as InteractionOutcome,
        notes,
        nextAction: String(form.get("nextAction") || "").trim(),
        nextActionDate: String(form.get("nextActionDate") || ""),
        location,
        createTask: Boolean(form.get("nextAction") || form.get("nextActionDate")),
        taskTitle: String(form.get("nextAction") || "Retornar após visita").trim(),
        priority: "alta",
      });
      if (photo && storageMode === "cloud") {
        await onUpload({ file: photo, contactId: contact.id, category: "foto_visita" });
      }
      setNotes("");
      setPhoto(null);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="action">
          <LocateFixed /> Fazer check-in
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Visita a {contact.name}</DialogTitle>
          <DialogDescription>
            Registre o que aconteceu ainda no local e saia com o próximo passo definido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-3 space-y-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className={labelClass}>Resumo da visita *</span>
              <VoiceButton
                onTranscript={(text) =>
                  setNotes((current) => `${current}${current ? " " : ""}${text}`)
                }
              />
            </div>
            <Textarea
              className="mt-2 min-h-28 bg-white"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Necessidade, frota atual, objeções e decisões"
              required
            />
          </div>
          <label className="block">
            <span className={labelClass}>Resultado</span>
            <select className={selectClass} name="outcome" defaultValue="atendeu">
              {interactionOutcomes.map((outcome) => (
                <option key={outcome.value} value={outcome.value}>
                  {outcome.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className={labelClass}>Local</span>
              <Button type="button" variant="quiet" size="sm" onClick={locate}>
                <LocateFixed /> Usar GPS
              </Button>
            </div>
            <Input
              className={fieldClass}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Endereço ou coordenadas"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Próxima ação</span>
              <Input className={fieldClass} name="nextAction" placeholder="Ex.: enviar proposta" />
            </label>
            <label>
              <span className={labelClass}>Data</span>
              <Input className={fieldClass} name="nextActionDate" type="date" />
            </label>
          </div>
          {storageMode === "cloud" && (
            <label className="block rounded-lg border border-dashed border-border bg-surface p-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-road">
                <Camera className="size-4" /> Foto autorizada da visita
              </span>
              <Input
                className="mt-3 bg-white"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              />
              <span className="mt-2 block text-xs text-muted-foreground">
                Use somente com autorização do cliente e sem documentos sensíveis aparecendo.
              </span>
            </label>
          )}
          <DialogFooter>
            <Button type="submit" variant="action" disabled={busy}>
              {busy ? "Salvando visita..." : "Concluir visita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VisitCenter({
  workspace,
  storageMode,
  onRecord,
  onUpload,
}: {
  workspace: SalesWorkspace;
  storageMode: "cloud" | "local";
  onRecord: (input: QuickRecordInput) => Promise<void>;
  onUpload: (input: DocumentUploadInput) => Promise<void>;
}) {
  const visitTasks = workspace.tasks
    .filter((task) => task.kind === "visita" && !task.completed)
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));

  if (!visitTasks.length) {
    return (
      <EmptyFeature
        icon={Route}
        title="Nenhuma visita agendada"
        description="Crie uma tarefa do tipo visita na Agenda. Ela aparecerá aqui com rota, contato e check-in."
      />
    );
  }

  return (
    <div className="space-y-4">
      {visitTasks.map((task) => {
        const contact = workspace.contacts.find((item) => item.id === task.contactId);
        if (!contact) return null;
        const location = task.location || contact.address || contact.city;
        return (
          <article
            key={task.id}
            className="grid gap-5 rounded-xl border border-border bg-white p-5 shadow-card lg:grid-cols-[1fr_auto] lg:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={task.dueDate < today() ? "destructive" : "outline"}>
                  {task.dueDate < today() ? "Atrasada" : dateLabel(task.dueDate)}
                </Badge>
                <Badge variant="outline">{contact.temperature}</Badge>
              </div>
              <h2 className="mt-3 text-xl font-bold text-road">{task.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {contact.name}
                {contact.company ? ` · ${contact.company}` : ""}
              </p>
              {location && (
                <p className="mt-3 flex items-center gap-2 text-sm text-engineering">
                  <MapPinned className="size-4" /> {location}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {contact.whatsapp && (
                <Button asChild variant="whatsapp">
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              )}
              {location && (
                <Button asChild variant="quiet">
                  <a href={mapsUrl(location)} target="_blank" rel="noreferrer">
                    <Route /> Abrir rota
                  </a>
                </Button>
              )}
              <VisitCheckInDialog
                task={task}
                contact={contact}
                storageMode={storageMode}
                onRecord={onRecord}
                onUpload={onUpload}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

type TimelineItem = {
  id: string;
  contactId: string;
  at: string;
  title: string;
  description: string;
  kind: "interacao" | "proposta" | "tarefa" | "documento";
};

export function TimelineCenter({ workspace }: { workspace: SalesWorkspace }) {
  const [contactId, setContactId] = useState("");
  const items = useMemo(() => {
    const all: TimelineItem[] = [
      ...workspace.interactions.map((interaction) => ({
        id: interaction.id,
        contactId: interaction.contactId,
        at: interaction.interactionAt,
        title: `${channelLabels[interaction.channel]} · ${outcomeLabels[interaction.outcome]}`,
        description: interaction.notes || interaction.nextAction,
        kind: "interacao" as const,
      })),
      ...workspace.proposals.map((proposal) => ({
        id: proposal.id,
        contactId: proposal.contactId,
        at: proposal.updatedAt,
        title: `Proposta ${proposalStatuses.find((status) => status.value === proposal.status)?.label ?? proposal.status}`,
        description: `${proposal.model || proposal.title}${proposal.value ? ` · ${proposal.value}` : ""}`,
        kind: "proposta" as const,
      })),
      ...workspace.tasks.map((task) => ({
        id: task.id,
        contactId: task.contactId,
        at: task.completedAt || task.createdAt,
        title: task.completed ? "Tarefa concluída" : "Próximo passo criado",
        description: task.title,
        kind: "tarefa" as const,
      })),
      ...workspace.documents.map((document) => ({
        id: document.id,
        contactId: document.contactId,
        at: document.createdAt,
        title: "Arquivo anexado",
        description: document.name,
        kind: "documento" as const,
      })),
    ];
    return all
      .filter((item) => !contactId || item.contactId === contactId)
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [contactId, workspace]);

  return (
    <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
      <aside className="h-fit rounded-xl border border-border bg-white p-5 shadow-card">
        <p className="eyebrow text-action">Memória da carteira</p>
        <h2 className="mt-2 text-xl font-bold text-road">Linha do tempo única</h2>
        <label className="mt-5 block">
          <span className={labelClass}>Filtrar por cliente</span>
          <select
            className={selectClass}
            value={contactId}
            onChange={(event) => setContactId(event.target.value)}
          >
            <option value="">Toda a carteira</option>
            {workspace.contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Ligações, mensagens, visitas, tarefas, propostas e arquivos aparecem na mesma sequência.
        </p>
      </aside>
      <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-7">
        {!items.length ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada neste filtro.
          </p>
        ) : (
          <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[0.7rem] before:top-2 before:w-px before:bg-border">
            {items.map((item) => {
              const contact = workspace.contacts.find(
                (candidate) => candidate.id === item.contactId,
              );
              return (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="relative grid grid-cols-[1.5rem_1fr] gap-4"
                >
                  <span
                    className={cn(
                      "relative z-10 mt-1 size-6 rounded-full border-4 border-white",
                      item.kind === "proposta"
                        ? "bg-action"
                        : item.kind === "documento"
                          ? "bg-result"
                          : "bg-engineering",
                    )}
                  />
                  <div className="rounded-lg border border-border bg-surface/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-road">{item.title}</p>
                        <p className="mt-1 text-xs text-engineering">
                          {contact?.name || "Sem cliente"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {dateLabel(item.at, true)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description || "Sem observação"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsCenter({
  workspace,
  storageMode,
  onUpload,
  onOpen,
  onRemove,
}: {
  workspace: SalesWorkspace;
  storageMode: "cloud" | "local";
  onUpload: (input: DocumentUploadInput) => Promise<void>;
  onOpen: (document: SalesDocument) => Promise<void>;
  onRemove: (document: SalesDocument) => Promise<void>;
}) {
  const [contactId, setContactId] = useState("");
  const [proposalId, setProposalId] = useState("");
  const [category, setCategory] = useState<SalesDocument["category"]>("documento");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    try {
      await onUpload({ file, contactId, proposalId, category });
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setBusy(false);
    }
  }

  if (storageMode === "local") {
    return (
      <EmptyFeature
        icon={FileArchive}
        title="Arquivos exigem o painel sincronizado"
        description="O armazenamento privado fica disponível quando o Supabase está configurado. O modo local continua com backup criptografado dos cadastros."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
      <aside className="h-fit rounded-xl border border-border bg-white p-5 shadow-card">
        <p className="eyebrow text-action">Cofre de arquivos</p>
        <h2 className="mt-2 text-xl font-bold text-road">Anexar com controle</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className={labelClass}>Cliente</span>
            <select
              className={selectClass}
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
            >
              <option value="">Arquivo geral</option>
              {workspace.contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Proposta</span>
            <select
              className={selectClass}
              value={proposalId}
              onChange={(event) => setProposalId(event.target.value)}
            >
              <option value="">Sem proposta</option>
              {workspace.proposals.map((proposal) => (
                <option key={proposal.id} value={proposal.id}>
                  {proposal.model || proposal.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Categoria</span>
            <select
              className={selectClass}
              value={category}
              onChange={(event) => setCategory(event.target.value as SalesDocument["category"])}
            >
              <option value="proposta">Proposta</option>
              <option value="foto_visita">Foto de visita</option>
              <option value="documento">Documento</option>
              <option value="outro">Outro</option>
            </select>
          </label>
          <label className="block rounded-lg border border-dashed border-border bg-surface p-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-road">
              <Upload className="size-4" /> Escolher arquivo
            </span>
            <Input
              ref={inputRef}
              className="mt-3 bg-white"
              type="file"
              accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.csv"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Evite armazenar CNH, documentos pessoais ou dados bancários sem necessidade e
            autorização.
          </p>
        </div>
      </aside>
      <section>
        {!workspace.documents.length ? (
          <EmptyFeature
            icon={Paperclip}
            title="Nenhum arquivo anexado"
            description="Propostas, fotos autorizadas de visitas e documentos comerciais aparecerão aqui."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {workspace.documents.map((document) => {
              const contact = workspace.contacts.find((item) => item.id === document.contactId);
              return (
                <article
                  key={document.id}
                  className="rounded-xl border border-border bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-road text-white">
                      <Paperclip className="size-5" />
                    </span>
                    <Badge variant="outline">{document.category.replaceAll("_", " ")}</Badge>
                  </div>
                  <h3 className="mt-4 line-clamp-2 text-sm font-bold text-road">{document.name}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {contact?.name || "Arquivo geral"} · {formatBytes(document.size)} ·{" "}
                    {dateLabel(document.createdAt)}
                  </p>
                  <div className="mt-5 flex gap-2">
                    <Button variant="institutional" size="sm" onClick={() => void onOpen(document)}>
                      <ExternalLink /> Abrir
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${document.name}`}
                      onClick={() => {
                        if (window.confirm(`Excluir ${document.name}?`)) void onRemove(document);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export function DataCenter({
  workspace,
  onImportContacts,
  onImportInventory,
}: {
  workspace: SalesWorkspace;
  onImportContacts: (contacts: SalesContact[]) => void;
  onImportInventory: (vehicles: StockVehicle[]) => void;
}) {
  const contactInput = useRef<HTMLInputElement>(null);
  const inventoryInput = useRef<HTMLInputElement>(null);

  async function importContacts(file: File) {
    const result = importContactsFromCsv(await file.text(), workspace.contacts);
    if (!result.imported.length) {
      toast.error(
        result.duplicates
          ? "Todos os contatos já existem no painel."
          : "Nenhum contato válido foi encontrado.",
      );
      return;
    }
    onImportContacts(result.imported);
    toast.success(
      `${result.imported.length} contatos importados. ${result.duplicates} duplicados ignorados.`,
    );
  }

  async function importInventory(file: File) {
    const result = importInventoryFromCsv(await file.text(), workspace.inventory);
    if (!result.imported.length) {
      toast.error(
        result.duplicates
          ? "Todas as unidades já existem no estoque."
          : "Nenhuma unidade válida foi encontrada.",
      );
      return;
    }
    onImportInventory(result.imported);
    toast.success(
      `${result.imported.length} unidades importadas. ${result.duplicates} duplicadas ignoradas.`,
    );
  }

  function downloadTemplates() {
    const contacts = toCsv([
      {
        nome: "Empresa Exemplo",
        empresa: "Transportadora",
        whatsapp: "5562999999999",
        email: "contato@empresa.com.br",
        cidade: "Goiânia / GO",
        interesse: "Constellation",
        operacao: "Distribuição",
        orcamento: "R$ 500.000",
        observacoes: "",
      },
    ]);
    const inventory = toCsv([
      {
        familia: "Constellation",
        modelo: "26.320",
        ano: "2026",
        tracao: "6x2",
        aplicacao: "Rodoviário",
        implemento: "Baú",
        cor: "Branco",
        quantidade: 1,
        status: "disponivel",
        preco: "",
        local: "Belcar",
        disponibilidade: "",
        observacoes: "",
      },
    ]);
    downloadTextFile(contacts, "modelo-importacao-clientes.csv");
    window.setTimeout(() => downloadTextFile(inventory, "modelo-importacao-estoque.csv"), 250);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DataCard
          icon={Upload}
          title="Importar clientes"
          description="Aceita CSV exportado de planilha, reconhece nomes de colunas comuns e ignora duplicados."
          action={
            <>
              <input
                ref={contactInput}
                className="hidden"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importContacts(file);
                  event.target.value = "";
                }}
              />
              <Button variant="institutional" onClick={() => contactInput.current?.click()}>
                <Upload /> Escolher CSV
              </Button>
            </>
          }
        />
        <DataCard
          icon={Truck}
          title="Importar estoque autorizado"
          description="Importe somente uma planilha oficial ou conferida. Nada é publicado automaticamente."
          action={
            <>
              <input
                ref={inventoryInput}
                className="hidden"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importInventory(file);
                  event.target.value = "";
                }}
              />
              <Button variant="institutional" onClick={() => inventoryInput.current?.click()}>
                <Upload /> Escolher CSV
              </Button>
            </>
          }
        />
        <DataCard
          icon={FileSpreadsheet}
          title="Modelos de planilha"
          description="Baixe modelos prontos de clientes e estoque para preencher sem erro de colunas."
          action={
            <Button variant="quiet" onClick={downloadTemplates}>
              <Download /> Baixar modelos
            </Button>
          }
        />
      </section>

      <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow text-action">Saída de segurança</p>
            <h2 className="mt-2 text-xl font-bold text-road">Exportar dados para planilha</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Arquivos CSV abrem no Excel, Google Sheets e LibreOffice.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="quiet" onClick={() => exportContacts(workspace)}>
              <Download /> Clientes
            </Button>
            <Button variant="quiet" onClick={() => exportInventory(workspace)}>
              <Download /> Estoque
            </Button>
            <Button variant="quiet" onClick={() => exportProposals(workspace)}>
              <Download /> Propostas
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <DataCard
          icon={PackageCheck}
          title="Instalar no celular"
          description="Adicione a central à tela inicial para abrir como aplicativo e acessar mais rápido durante ligações e visitas."
          action={<PwaInstallButton />}
        />
        <DataCard
          icon={ClipboardCheck}
          title="Rotina recomendada"
          description="Faça uma exportação mensal, confira duplicados após importações e mantenha no painel apenas dados necessários ao atendimento."
          action={<Badge variant="outline">Organização contínua</Badge>}
        />
      </section>
    </div>
  );
}

function DataCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Upload;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-card">
      <span className="grid size-11 place-items-center rounded-xl bg-road text-white">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-5 text-lg font-bold text-road">{title}</h2>
      <p className="mt-2 min-h-16 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-5">{action}</div>
    </article>
  );
}

function EmptyFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Gauge;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-silver/70 bg-white/70 p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-road text-white shadow-card">
          <Icon className="size-6" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-road">{title}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
