import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CloudOff,
  ContactRound,
  Download,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Lock,
  MessageCircle,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  Upload,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  createEmptyWorkspace,
  inventoryStatuses,
  pipelineStages,
  type InventoryStatus,
  type PipelineStage,
  type SalesContact,
  type SalesTask,
  type SalesWorkspace,
  type StockVehicle,
} from "./types";
import {
  createVault,
  downloadVaultBackup,
  hasVault,
  importVaultBackup,
  saveVault,
  unlockVault,
} from "./vault";

const labelClass = "text-technical text-xs font-bold uppercase tracking-[0.11em] text-road";
const fieldClass = "mt-2 h-11 bg-white";
const nativeSelectClass =
  "mt-2 h-11 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function formatDate(value: string) {
  if (!value) return "Sem data";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(task: SalesTask) {
  return !task.completed && Boolean(task.dueDate) && task.dueDate < todayString();
}

function contactWhatsAppUrl(contact: SalesContact) {
  const digits = contact.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá, ${contact.name}. Aqui é o Christiano. Podemos continuar a conversa sobre ${contact.interest || "seu próximo caminhão"}?`,
  );
  return digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`;
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ContactRound;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-xl border border-dashed border-silver/70 bg-white/70 p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-road text-white shadow-card">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-road">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function VaultGate({
  onUnlock,
}: {
  onUnlock: (key: CryptoKey, workspace: SalesWorkspace) => void;
}) {
  const [existingVault, setExistingVault] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setExistingVault(hasVault()), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pin.length < 6) {
      toast.error("Use um PIN com pelo menos 6 caracteres.");
      return;
    }
    if (!existingVault && pin !== confirmPin) {
      toast.error("Os dois PINs precisam ser iguais.");
      return;
    }

    setBusy(true);
    try {
      if (existingVault) {
        const result = await unlockVault(pin);
        onUnlock(result.key, result.workspace);
      } else {
        const workspace = createEmptyWorkspace();
        const key = await createVault(pin, workspace);
        onUnlock(key, workspace);
      }
    } catch {
      toast.error("PIN incorreto ou cofre inválido.");
    } finally {
      setBusy(false);
    }
  }

  async function restore(file: File) {
    if (
      existingVault &&
      !window.confirm(
        "Restaurar este arquivo substituirá o cofre salvo neste navegador. Deseja continuar?",
      )
    ) {
      return;
    }
    try {
      await importVaultBackup(file);
      setExistingVault(true);
      setPin("");
      setConfirmPin("");
      toast.success("Backup restaurado. Digite o PIN usado no arquivo.");
    } catch {
      toast.error("Não foi possível ler esse backup.");
    }
  }

  return (
    <div className="admin-vault relative isolate grid min-h-screen overflow-hidden bg-road px-5 py-12 text-white lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-16">
      <div className="admin-orbit admin-orbit--one" aria-hidden="true" />
      <div className="admin-orbit admin-orbit--two" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-2xl py-8 lg:pr-16">
        <p className="eyebrow flex items-center gap-3 text-silver">
          <span className="h-px w-8 bg-action" /> Central comercial privada
        </p>
        <h1 className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.055em]">
          A operação de vendas em uma só cabine.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Clientes, etapas de atendimento, estoque e agenda organizados para Christiano agir sem
          perder o próximo passo.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            [ShieldCheck, "Dados criptografados"],
            [Gauge, "Visão da operação"],
            [CloudOff, "Funciona sem servidor"],
          ].map(([Icon, text]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return (
              <div
                key={text as string}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <ItemIcon className="size-5 text-action" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-white">{text as string}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-white p-6 text-foreground shadow-[0_32px_100px_-28px_rgb(0_0_0_/_0.65)] sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow text-action">Painel do Christiano</p>
            <h2 className="mt-3 text-2xl font-bold text-road">
              {existingVault ? "Desbloquear painel" : "Criar acesso privado"}
            </h2>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-road text-white">
            {existingVault ? <Lock className="size-5" /> : <KeyRound className="size-5" />}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {existingVault
            ? "Digite seu PIN. Ele não é enviado para nenhuma empresa ou servidor."
            : "Escolha um PIN. Os dados serão guardados criptografados somente neste navegador."}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block">
            <span className={labelClass}>PIN de acesso</span>
            <Input
              className={fieldClass}
              type="password"
              value={pin}
              minLength={6}
              autoComplete={existingVault ? "current-password" : "new-password"}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              autoFocus
            />
          </label>
          {!existingVault && (
            <label className="block">
              <span className={labelClass}>Confirmar PIN</span>
              <Input
                className={fieldClass}
                type="password"
                value={confirmPin}
                minLength={6}
                autoComplete="new-password"
                onChange={(event) => setConfirmPin(event.target.value)}
                placeholder="Digite novamente"
              />
            </label>
          )}
          <Button className="h-12 w-full" variant="action" disabled={busy}>
            {busy ? "Protegendo dados..." : existingVault ? "Entrar no painel" : "Criar painel"}
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5">
          <input
            ref={fileRef}
            className="hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void restore(file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => fileRef.current?.click()}
          >
            <Upload aria-hidden="true" /> Restaurar backup criptografado
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof UsersRound;
  label: string;
  value: number;
  detail: string;
  accent?: boolean;
}) {
  return (
    <article
      className={cn(
        "admin-metric relative overflow-hidden rounded-xl border p-5 shadow-card",
        accent ? "border-road bg-road text-white" : "border-border bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              accent ? "text-white/65" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          <p className="text-technical mt-3 text-4xl font-bold tracking-tight">{value}</p>
        </div>
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            accent ? "bg-white/10 text-action" : "bg-surface text-engineering",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className={cn("mt-5 text-xs", accent ? "text-white/55" : "text-muted-foreground")}>
        {detail}
      </p>
    </article>
  );
}

function ContactDialog({ onAdd }: { onAdd: (contact: SalesContact) => void }) {
  const [open, setOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = new Date().toISOString();
    onAdd({
      id: crypto.randomUUID(),
      name: String(form.get("name") || "").trim(),
      company: String(form.get("company") || "").trim(),
      whatsapp: String(form.get("whatsapp") || "").trim(),
      city: String(form.get("city") || "").trim(),
      interest: String(form.get("interest") || "").trim(),
      stage: String(form.get("stage") || "novo") as PipelineStage,
      nextAction: String(form.get("nextAction") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
      createdAt: now,
      updatedAt: now,
    });
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="action">
          <Plus aria-hidden="true" /> Novo cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo atendimento</DialogTitle>
          <DialogDescription>
            Registre o essencial agora. Os detalhes podem ser completados durante a conversa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-3 grid gap-5 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Nome *</span>
            <Input className={fieldClass} name="name" required placeholder="Nome do cliente" />
          </label>
          <label>
            <span className={labelClass}>Empresa</span>
            <Input className={fieldClass} name="company" placeholder="Transportadora ou negócio" />
          </label>
          <label>
            <span className={labelClass}>WhatsApp</span>
            <Input
              className={fieldClass}
              name="whatsapp"
              inputMode="tel"
              placeholder="55 31 99999-9999"
            />
          </label>
          <label>
            <span className={labelClass}>Cidade / UF</span>
            <Input className={fieldClass} name="city" placeholder="Ex.: Belo Horizonte / MG" />
          </label>
          <label>
            <span className={labelClass}>Interesse</span>
            <Input className={fieldClass} name="interest" placeholder="Ex.: Meteor para carreta" />
          </label>
          <label>
            <span className={labelClass}>Etapa</span>
            <select className={nativeSelectClass} name="stage" defaultValue="novo">
              {pipelineStages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Próxima ação</span>
            <Input
              className={fieldClass}
              name="nextAction"
              placeholder="Ex.: confirmar peso da carga na sexta-feira"
            />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Observações</span>
            <Textarea
              className="mt-2 min-h-24 bg-white"
              name="notes"
              placeholder="Operação, prazo, troca, entrada, objeções..."
            />
          </label>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" variant="action">
              Salvar atendimento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InventoryDialog({ onAdd }: { onAdd: (vehicle: StockVehicle) => void }) {
  const [open, setOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onAdd({
      id: crypto.randomUUID(),
      family: String(form.get("family")) as StockVehicle["family"],
      model: String(form.get("model") || "").trim(),
      year: String(form.get("year") || "").trim(),
      status: String(form.get("status")) as InventoryStatus,
      price: String(form.get("price") || "").trim(),
      location: String(form.get("location") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
      updatedAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="institutional">
          <Plus /> Adicionar caminhão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo item de estoque</DialogTitle>
          <DialogDescription>
            Controle comercial interno. Nada é publicado automaticamente no site.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-3 grid gap-5 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Família *</span>
            <select className={nativeSelectClass} name="family" required defaultValue="Delivery">
              {(["Delivery", "Constellation", "Meteor", "Outro"] as const).map((family) => (
                <option key={family}>{family}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Modelo / versão *</span>
            <Input className={fieldClass} name="model" required placeholder="Ex.: 29.530 6x4" />
          </label>
          <label>
            <span className={labelClass}>Ano / modelo</span>
            <Input className={fieldClass} name="year" placeholder="Ex.: 2026/2026" />
          </label>
          <label>
            <span className={labelClass}>Situação</span>
            <select className={nativeSelectClass} name="status" defaultValue="disponivel">
              {inventoryStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelClass}>Referência de preço</span>
            <Input className={fieldClass} name="price" placeholder="Opcional" />
          </label>
          <label>
            <span className={labelClass}>Localização</span>
            <Input className={fieldClass} name="location" placeholder="Pátio / concessionária" />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Observações</span>
            <Textarea
              className="mt-2 min-h-20"
              name="notes"
              placeholder="Cor, cabine, condição ou prazo..."
            />
          </label>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" variant="institutional">
              Salvar no estoque
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskDialog({
  contacts,
  onAdd,
}: {
  contacts: SalesContact[];
  onAdd: (task: SalesTask) => void;
}) {
  const [open, setOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onAdd({
      id: crypto.randomUUID(),
      title: String(form.get("title") || "").trim(),
      dueDate: String(form.get("dueDate") || ""),
      contactId: String(form.get("contactId") || ""),
      priority: String(form.get("priority")) as SalesTask["priority"],
      completed: false,
      createdAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="institutional">
          <Plus /> Nova tarefa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar próximo passo</DialogTitle>
          <DialogDescription>
            Transforme uma conversa em ação concreta e com prazo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-3 space-y-5">
          <label className="block">
            <span className={labelClass}>Tarefa *</span>
            <Input
              className={fieldClass}
              name="title"
              required
              placeholder="Ex.: retornar com simulação"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Data</span>
              <Input className={fieldClass} name="dueDate" type="date" />
            </label>
            <label>
              <span className={labelClass}>Prioridade</span>
              <select className={nativeSelectClass} name="priority" defaultValue="normal">
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className={labelClass}>Cliente relacionado</span>
            <select className={nativeSelectClass} name="contactId" defaultValue="">
              <option value="">Sem cliente relacionado</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>
          <DialogFooter>
            <Button type="submit" variant="institutional">
              Adicionar à agenda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Dashboard({ workspace }: { workspace: SalesWorkspace }) {
  const active = workspace.contacts.filter(
    (contact) => !["ganho", "perdido"].includes(contact.stage),
  );
  const proposals = workspace.contacts.filter((contact) =>
    ["proposta", "negociacao"].includes(contact.stage),
  );
  const available = workspace.inventory.filter((vehicle) => vehicle.status === "disponivel");
  const pendingTasks = workspace.tasks.filter((task) => !task.completed);
  const nextTasks = [...pendingTasks]
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Atendimentos ativos"
          value={active.length}
          detail="Em andamento no funil"
          accent
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Propostas em jogo"
          value={proposals.length}
          detail="Proposta ou negociação"
        />
        <MetricCard
          icon={Truck}
          label="Unidades disponíveis"
          value={available.length}
          detail="Marcadas como disponíveis"
        />
        <MetricCard
          icon={CalendarDays}
          label="Ações pendentes"
          value={pendingTasks.length}
          detail="Retornos e compromissos"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow text-action">Pulso comercial</p>
              <h2 className="mt-2 text-xl font-bold text-road">Funil de atendimento</h2>
            </div>
            <span className="text-technical text-xs text-muted-foreground">
              {workspace.contacts.length} contatos
            </span>
          </div>
          <div className="mt-7 space-y-4">
            {pipelineStages.slice(0, 6).map((stage) => {
              const count = workspace.contacts.filter(
                (contact) => contact.stage === stage.value,
              ).length;
              const percentage = workspace.contacts.length
                ? (count / workspace.contacts.length) * 100
                : 0;
              return (
                <div
                  key={stage.value}
                  className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {stage.shortLabel}
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className="admin-progress h-full rounded-full bg-engineering"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <strong className="text-technical text-right text-sm text-road">{count}</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
          <p className="eyebrow text-action">Próximas ações</p>
          <h2 className="mt-2 text-xl font-bold text-road">Agenda imediata</h2>
          {nextTasks.length ? (
            <ul className="mt-5 divide-y divide-border">
              {nextTasks.map((task) => (
                <li key={task.id} className="flex gap-3 py-4 first:pt-0">
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      isOverdue(task) ? "bg-action" : "bg-engineering",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-road">{task.title}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isOverdue(task) ? "font-semibold text-action" : "text-muted-foreground",
                      )}
                    >
                      {isOverdue(task) ? "Atrasada · " : ""}
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-lg bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Nenhuma ação pendente. Use a aba Agenda para programar retornos.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Pipeline({
  contacts,
  onStageChange,
}: {
  contacts: SalesContact[];
  onStageChange: (id: string, stage: PipelineStage) => void;
}) {
  return (
    <div className="admin-kanban grid gap-4 overflow-x-auto pb-3 lg:grid-cols-4 2xl:grid-cols-7">
      {pipelineStages.map((stage) => {
        const stageContacts = contacts.filter((contact) => contact.stage === stage.value);
        return (
          <section
            key={stage.value}
            className="min-w-[260px] rounded-xl border border-border bg-surface/70 p-3 lg:min-w-0"
          >
            <div className="flex items-center justify-between gap-3 px-1 py-2">
              <h3 className="text-technical text-xs font-bold uppercase tracking-[0.1em] text-road">
                {stage.shortLabel}
              </h3>
              <span className="grid size-6 place-items-center rounded-full bg-white text-technical text-xs font-bold text-road shadow-sm">
                {stageContacts.length}
              </span>
            </div>
            <div className="mt-2 space-y-3">
              {stageContacts.map((contact) => (
                <article
                  key={contact.id}
                  className="admin-deal-card rounded-lg border border-border bg-white p-4 shadow-sm"
                >
                  <p className="text-sm font-bold text-road">{contact.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {contact.company || contact.city || "Contato direto"}
                  </p>
                  {contact.interest && (
                    <p className="mt-4 text-xs font-medium text-engineering">{contact.interest}</p>
                  )}
                  {contact.nextAction && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      Próximo: {contact.nextAction}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    {contact.whatsapp && (
                      <a
                        href={contactWhatsAppUrl(contact)}
                        target="_blank"
                        rel="noreferrer"
                        className="grid size-9 place-items-center rounded-md bg-result text-white transition-transform hover:-translate-y-0.5"
                        aria-label={`Abrir WhatsApp de ${contact.name}`}
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    )}
                    <select
                      aria-label={`Alterar etapa de ${contact.name}`}
                      className="h-9 min-w-0 flex-1 rounded-md border border-input bg-white px-2 text-xs"
                      value={contact.stage}
                      onChange={(event) =>
                        onStageChange(contact.id, event.target.value as PipelineStage)
                      }
                    >
                      {pipelineStages.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.shortLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
              {!stageContacts.length && (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Nenhum contato
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ContactList({
  contacts,
  onStageChange,
}: {
  contacts: SalesContact[];
  onStageChange: (id: string, stage: PipelineStage) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = contacts.filter((contact) =>
    [contact.name, contact.company, contact.city, contact.interest]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  if (!contacts.length) {
    return (
      <EmptyState
        icon={ContactRound}
        title="Sua carteira começa aqui"
        description="Adicione o primeiro cliente para acompanhar interesse, etapa e próxima ação sem depender da memória."
      />
    );
  }

  return (
    <div>
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 bg-white pl-10"
          placeholder="Buscar cliente, empresa, cidade ou interesse"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.8fr_auto] gap-4 border-b border-border bg-surface px-5 py-3 text-technical text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground lg:grid">
          <span>Cliente</span>
          <span>Interesse</span>
          <span>Próxima ação</span>
          <span>Etapa</span>
          <span>Contato</span>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((contact) => (
            <article
              key={contact.id}
              className="grid gap-4 px-5 py-5 transition-colors hover:bg-surface/60 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto] lg:items-center"
            >
              <div>
                <h3 className="text-sm font-bold text-road">{contact.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[contact.company, contact.city].filter(Boolean).join(" · ") || "Contato direto"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{contact.interest || "A definir"}</p>
              <p className="text-sm text-muted-foreground">
                {contact.nextAction || "Definir próximo passo"}
              </p>
              <select
                className="h-9 rounded-md border border-input bg-white px-2 text-xs"
                value={contact.stage}
                onChange={(event) => onStageChange(contact.id, event.target.value as PipelineStage)}
              >
                {pipelineStages.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.shortLabel}
                  </option>
                ))}
              </select>
              {contact.whatsapp ? (
                <a
                  href={contactWhatsAppUrl(contact)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-result px-3 text-xs font-bold text-white"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              ) : (
                <Badge variant="outline" className="justify-center">
                  Sem número
                </Badge>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Inventory({
  inventory,
  onStatusChange,
}: {
  inventory: StockVehicle[];
  onStatusChange: (id: string, status: InventoryStatus) => void;
}) {
  if (!inventory.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Estoque interno sem itens"
        description="Cadastre unidades, pedidos e oportunidades para cruzar rapidamente disponibilidade com a necessidade do cliente."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {inventory.map((vehicle) => (
        <article
          key={vehicle.id}
          className="admin-stock-card overflow-hidden rounded-xl border border-border bg-white shadow-card"
        >
          <div className="flex items-start justify-between gap-5 bg-road p-5 text-white">
            <div>
              <p className="text-technical text-xs font-semibold uppercase tracking-[0.12em] text-silver">
                Volkswagen {vehicle.family}
              </p>
              <h3 className="mt-2 text-xl font-bold">{vehicle.model}</h3>
            </div>
            <Truck className="size-6 text-action" />
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Ano / modelo</p>
                <p className="text-technical mt-1 font-semibold text-road">
                  {vehicle.year || "A confirmar"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Localização</p>
                <p className="mt-1 font-semibold text-road">{vehicle.location || "A confirmar"}</p>
              </div>
            </div>
            {vehicle.price && (
              <p className="text-technical mt-5 border-t border-border pt-4 text-lg font-bold text-road">
                {vehicle.price}
              </p>
            )}
            {vehicle.notes && (
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {vehicle.notes}
              </p>
            )}
            <select
              className="mt-5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={vehicle.status}
              onChange={(event) =>
                onStatusChange(vehicle.id, event.target.value as InventoryStatus)
              }
            >
              {inventoryStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}

function Agenda({
  tasks,
  contacts,
  onToggle,
}: {
  tasks: SalesTask[];
  contacts: SalesContact[];
  onToggle: (id: string) => void;
}) {
  const ordered = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
  });

  if (!tasks.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Agenda limpa"
        description="Crie retornos, visitas e pendências para cada oportunidade continuar avançando no tempo certo."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="divide-y divide-border">
        {ordered.map((task) => {
          const contact = contacts.find((item) => item.id === task.contactId);
          return (
            <article
              key={task.id}
              className={cn(
                "flex items-start gap-4 p-5 transition-colors hover:bg-surface/60",
                task.completed && "opacity-55",
              )}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggle(task.id)}
                className="mt-1"
                aria-label={`Marcar ${task.title} como ${task.completed ? "pendente" : "concluída"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={cn("text-sm font-bold text-road", task.completed && "line-through")}
                  >
                    {task.title}
                  </h3>
                  {task.priority === "alta" && !task.completed && (
                    <Badge variant="destructive">Alta prioridade</Badge>
                  )}
                  {isOverdue(task) && (
                    <Badge className="border-action bg-action/10 text-action" variant="outline">
                      Atrasada
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(task.dueDate)}
                  {contact ? ` · ${contact.name}` : ""}
                </p>
              </div>
              {task.completed && <Check className="size-5 text-result" aria-hidden="true" />}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function WorkspacePanel({
  initialWorkspace,
  vaultKey,
  onLock,
}: {
  initialWorkspace: SalesWorkspace;
  vaultKey: CryptoKey;
  onLock: () => void;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [view, setView] = useState("dashboard");
  const [saved, setSaved] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(async () => {
      const updated = { ...workspace, updatedAt: new Date().toISOString() };
      try {
        await saveVault(vaultKey, updated);
        setSaved(true);
      } catch {
        toast.error("Não foi possível salvar a última alteração.");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [vaultKey, workspace]);

  useEffect(() => {
    let timer = window.setTimeout(onLock, 15 * 60 * 1000);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onLock, 15 * 60 * 1000);
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown"];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [onLock]);

  function addContact(contact: SalesContact) {
    setWorkspace((current) => ({ ...current, contacts: [contact, ...current.contacts] }));
    toast.success("Cliente adicionado ao funil.");
  }

  function updateContactStage(id: string, stage: PipelineStage) {
    setWorkspace((current) => ({
      ...current,
      contacts: current.contacts.map((contact) =>
        contact.id === id ? { ...contact, stage, updatedAt: new Date().toISOString() } : contact,
      ),
    }));
  }

  function addInventory(vehicle: StockVehicle) {
    setWorkspace((current) => ({ ...current, inventory: [vehicle, ...current.inventory] }));
    toast.success("Caminhão adicionado ao estoque interno.");
  }

  function addTask(task: SalesTask) {
    setWorkspace((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    toast.success("Próxima ação adicionada à agenda.");
  }

  const navigation = [
    ["dashboard", "Visão geral", LayoutDashboard],
    ["pipeline", "Funil", Gauge],
    ["clientes", "Clientes", UsersRound],
    ["estoque", "Estoque", Truck],
    ["agenda", "Agenda", CalendarDays],
  ] as const;

  return (
    <div className="min-h-screen bg-surface text-foreground lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="admin-sidebar relative overflow-hidden bg-road px-4 py-5 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-5 lg:py-7">
        <div className="flex items-center justify-between gap-4 px-2">
          <div>
            <p className="text-technical text-xs font-semibold uppercase tracking-[0.13em] text-silver">
              Christiano Tadeu
            </p>
            <p className="mt-1 text-lg font-bold">Central de vendas</p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5">
            <Truck className="size-5 text-action" />
          </span>
        </div>
        <nav
          className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:mt-10 lg:block lg:space-y-1 lg:overflow-visible"
          aria-label="Navegação do painel"
        >
          {navigation.map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors lg:w-full",
                view === value
                  ? "bg-white text-road shadow-sm"
                  : "text-white/65 hover:bg-white/7 hover:text-white",
              )}
            >
              <Icon className={cn("size-4", view === value && "text-action")} /> {label}
            </button>
          ))}
        </nav>
        <div className="mt-5 hidden rounded-xl border border-white/10 bg-white/5 p-4 lg:block">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <ShieldCheck className="size-4 text-result" /> Cofre local ativo
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            Bloqueio automático após 15 minutos sem atividade.
          </p>
        </div>
        <div className="mt-auto hidden space-y-1 pt-5 lg:block">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/60 hover:bg-white/7 hover:text-white"
            onClick={() => downloadVaultBackup()}
          >
            <Download className="size-4" /> Baixar backup
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/60 hover:bg-white/7 hover:text-white"
            onClick={onLock}
          >
            <Lock className="size-4" /> Bloquear painel
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-5">
            <div>
              <p className="eyebrow text-action">Operação comercial</p>
              <h1 className="mt-1 text-xl font-bold text-road sm:text-2xl">
                {navigation.find(([value]) => value === view)?.[1]}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                {saved ? (
                  <CheckCircle2 className="size-4 text-result" />
                ) : (
                  <Archive className="size-4" />
                )}
                {saved ? "Salvo e criptografado" : "Salvando..."}
              </span>
              <Button
                size="icon"
                variant="quiet"
                onClick={() => downloadVaultBackup()}
                aria-label="Baixar backup"
              >
                <Download />
              </Button>
              <Button size="icon" variant="quiet" onClick={onLock} aria-label="Bloquear painel">
                <Lock />
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[100rem] p-5 sm:p-7 lg:p-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {view === "dashboard" &&
                  "Prioridades, ritmo do funil e disponibilidade para decidir o próximo movimento."}
                {view === "pipeline" &&
                  "Mova cada oportunidade conforme a conversa evolui e enxergue onde agir."}
                {view === "clientes" &&
                  "Carteira organizada para localizar informação e retomar uma conversa em segundos."}
                {view === "estoque" &&
                  "Visão interna de unidades e encomendas; nenhum item é publicado automaticamente."}
                {view === "agenda" &&
                  "Retornos, visitas e pendências que não podem ficar apenas na memória."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(view === "dashboard" || view === "pipeline" || view === "clientes") && (
                <ContactDialog onAdd={addContact} />
              )}
              {view === "estoque" && <InventoryDialog onAdd={addInventory} />}
              {view === "agenda" && <TaskDialog contacts={workspace.contacts} onAdd={addTask} />}
            </div>
          </div>

          {view === "dashboard" && <Dashboard workspace={workspace} />}
          {view === "pipeline" &&
            (workspace.contacts.length ? (
              <Pipeline contacts={workspace.contacts} onStageChange={updateContactStage} />
            ) : (
              <EmptyState
                icon={Gauge}
                title="Funil pronto para receber oportunidades"
                description="Cadastre o primeiro cliente; depois, mova o cartão pelas etapas conforme o atendimento avançar."
              />
            ))}
          {view === "clientes" && (
            <ContactList contacts={workspace.contacts} onStageChange={updateContactStage} />
          )}
          {view === "estoque" && (
            <Inventory
              inventory={workspace.inventory}
              onStatusChange={(id, status) =>
                setWorkspace((current) => ({
                  ...current,
                  inventory: current.inventory.map((vehicle) =>
                    vehicle.id === id
                      ? { ...vehicle, status, updatedAt: new Date().toISOString() }
                      : vehicle,
                  ),
                }))
              }
            />
          )}
          {view === "agenda" && (
            <Agenda
              tasks={workspace.tasks}
              contacts={workspace.contacts}
              onToggle={(id) =>
                setWorkspace((current) => ({
                  ...current,
                  tasks: current.tasks.map((task) =>
                    task.id === id ? { ...task, completed: !task.completed } : task,
                  ),
                }))
              }
            />
          )}

          <div className="mt-8 flex flex-col gap-3 rounded-xl border border-engineering/15 bg-engineering/5 p-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <CloudOff className="mt-0.5 size-4 shrink-0 text-engineering" /> Modo local seguro:
              use o backup para levar os dados a outro computador.
            </p>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              accept="application/json,.json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (
                  !window.confirm(
                    "Importar este backup substituirá o cofre atual. Você já baixou uma cópia de segurança?",
                  )
                ) {
                  event.target.value = "";
                  return;
                }
                try {
                  await importVaultBackup(file);
                  toast.success("Backup importado. O painel será bloqueado para validar o PIN.");
                  onLock();
                } catch {
                  toast.error("Esse arquivo não contém um backup válido.");
                } finally {
                  event.target.value = "";
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload /> Importar backup
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export function PainelApp() {
  const [session, setSession] = useState<{ key: CryptoKey; workspace: SalesWorkspace } | null>(
    null,
  );

  if (!session) {
    return <VaultGate onUnlock={(key, workspace) => setSession({ key, workspace })} />;
  }

  return (
    <WorkspacePanel
      initialWorkspace={session.workspace}
      vaultKey={session.key}
      onLock={() => setSession(null)}
    />
  );
}
