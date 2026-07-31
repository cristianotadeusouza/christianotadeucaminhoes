import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  CloudOff,
  ContactRound,
  Download,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  MapPinned,
  MessageCircle,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  Phone,
  Truck,
  Upload,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
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
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";
import {
  createEmptyWorkspace,
  inventoryStatuses,
  pipelineStages,
  type InventoryStatus,
  type PipelineStage,
  type SalesContact,
  type SalesInteraction,
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
import { loadCloudWorkspace, saveCloudWorkspace, saveInteraction } from "./cloud";

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

const interactionChannelLabels: Record<SalesInteraction["channel"], string> = {
  whatsapp: "WhatsApp",
  phone: "Ligação",
  email: "E-mail",
  visit: "Visita",
  other: "Outro",
};

function contactWhatsAppUrl(contact: SalesContact) {
  const digits = contact.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá, ${contact.name}. Aqui é o Christiano. Podemos continuar a conversa sobre ${contact.interest || "seu próximo caminhão"}?`,
  );
  return digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`;
}

function contactGmailUrl(contact: SalesContact) {
  const subject = encodeURIComponent(`Caminhão Volkswagen - ${contact.interest || "atendimento"}`);
  const body = encodeURIComponent(
    `Olá, ${contact.name}.\n\nConforme nossa conversa, seguimos à disposição para organizar a melhor configuração Volkswagen para sua operação.\n\nChristiano Tadeu\n${siteConfig.phone}`,
  );
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}&su=${subject}&body=${body}`;
}

function taskCalendarUrl(task: SalesTask, contact?: SalesContact) {
  const startDate = new Date(`${task.dueDate || todayString()}T12:00:00`);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  const compactDate = (date: Date) => date.toISOString().slice(0, 10).replaceAll("-", "");
  const details = encodeURIComponent(
    [contact ? `Cliente: ${contact.name}` : "", task.location ? `Local: ${task.location}` : ""]
      .filter(Boolean)
      .join("\n"),
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${compactDate(startDate)}/${compactDate(endDate)}&details=${details}&location=${encodeURIComponent(task.location)}`;
}

function mapsUrl(value: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
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

function SupabaseGate({ onReady }: { onReady: (workspace: SalesWorkspace) => void }) {
  const [email, setEmail] = useState(siteConfig.email);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const client = requireSupabase();
    let active = true;

    async function restoreSession() {
      try {
        const { data } = await client.auth.getClaims();
        if (data?.claims && active) {
          onReady(await loadCloudWorkspace());
        }
      } catch {
        if (active) toast.error("Não foi possível consultar a sessão do painel.");
      } finally {
        if (active) setChecking(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [onReady]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const client = requireSupabase();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onReady(await loadCloudWorkspace());
      toast.success("Painel sincronizado com segurança.");
    } catch {
      toast.error("E-mail ou senha incorretos.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink() {
    setBusy(true);
    try {
      const { error } = await requireSupabase().auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/painel`,
          shouldCreateUser: false,
        },
      });
      if (error) throw error;
      toast.success("Link de acesso enviado para o Gmail.");
    } catch {
      toast.error("Não foi possível enviar o link de acesso.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-road text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-action" />
          <p className="mt-4 text-sm text-white/65">Conectando à central comercial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-vault relative isolate grid min-h-screen overflow-hidden bg-road px-5 py-10 text-white lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-16">
      <div className="admin-orbit admin-orbit--one" aria-hidden="true" />
      <div className="admin-orbit admin-orbit--two" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-2xl py-8 lg:pr-16">
        <p className="eyebrow flex items-center gap-3 text-silver">
          <span className="h-px w-8 bg-action" /> Central comercial sincronizada
        </p>
        <h1 className="mt-6 text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.055em]">
          A venda continua onde você estiver.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Clientes, ligações, WhatsApp, visitas, estoque e próximos passos disponíveis no celular e
          no computador.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            [ShieldCheck, "Acesso autenticado"],
            [Cloud, "Sincronização online"],
            [Phone, "Feito para o celular"],
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
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow text-action">Painel do Christiano</p>
            <h2 className="mt-3 text-2xl font-bold text-road">Entrar na central</h2>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-road text-white">
            <Lock className="size-5" />
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Use a senha cadastrada ou receba um link seguro diretamente no Gmail.
        </p>

        <form onSubmit={signIn} className="mt-7 space-y-5">
          <label className="block">
            <span className={labelClass}>E-mail</span>
            <Input
              className={fieldClass}
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>Senha</span>
            <Input
              className={fieldClass}
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha do painel"
              required
            />
          </label>
          <Button className="h-12 w-full" variant="action" disabled={busy}>
            {busy ? "Entrando..." : "Entrar e sincronizar"}
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </form>

        <div className="mt-5 border-t border-border pt-5">
          <Button
            type="button"
            variant="quiet"
            className="h-11 w-full"
            disabled={busy || !email}
            onClick={() => void sendMagicLink()}
          >
            <Mail /> Receber link no Gmail
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
      email: String(form.get("email") || "").trim(),
      city: String(form.get("city") || "").trim(),
      interest: String(form.get("interest") || "").trim(),
      stage: String(form.get("stage") || "novo") as PipelineStage,
      nextAction: String(form.get("nextAction") || "").trim(),
      nextActionDate: String(form.get("nextActionDate") || ""),
      source: String(form.get("source") || "outro") as SalesContact["source"],
      temperature: String(form.get("temperature") || "morno") as SalesContact["temperature"],
      lastContactAt: "",
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
              placeholder="55 62 99999-9999"
            />
          </label>
          <label>
            <span className={labelClass}>Cidade / UF</span>
            <Input className={fieldClass} name="city" placeholder="Ex.: Goiânia / GO" />
          </label>
          <label>
            <span className={labelClass}>E-mail</span>
            <Input
              className={fieldClass}
              name="email"
              type="email"
              placeholder="cliente@empresa.com.br"
            />
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
          <label>
            <span className={labelClass}>Origem</span>
            <select className={nativeSelectClass} name="source" defaultValue="prospeccao">
              <option value="prospeccao">Prospecção ativa</option>
              <option value="indicacao">Indicação</option>
              <option value="site">Site</option>
              <option value="retorno">Cliente da carteira</option>
              <option value="outro">Outro</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Temperatura</span>
            <select className={nativeSelectClass} name="temperature" defaultValue="morno">
              <option value="quente">Quente - agir agora</option>
              <option value="morno">Morno - acompanhar</option>
              <option value="frio">Frio - nutrir</option>
            </select>
          </label>
          <label>
            <span className={labelClass}>Próxima ação</span>
            <Input
              className={fieldClass}
              name="nextAction"
              placeholder="Ex.: confirmar peso da carga na sexta-feira"
            />
          </label>
          <label>
            <span className={labelClass}>Data do retorno</span>
            <Input className={fieldClass} name="nextActionDate" type="date" />
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
      kind: String(form.get("kind") || "retorno") as SalesTask["kind"],
      location: String(form.get("location") || "").trim(),
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
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Tipo de ação</span>
              <select className={nativeSelectClass} name="kind" defaultValue="retorno">
                <option value="retorno">Retorno geral</option>
                <option value="ligacao">Ligação</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="visita">Visita</option>
                <option value="proposta">Preparar proposta</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>Local / endereço</span>
              <Input
                className={fieldClass}
                name="location"
                placeholder="Útil para visitas e rotas"
              />
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
  const overdueTasks = pendingTasks.filter(isOverdue);
  const hotContacts = active.filter((contact) => contact.temperature === "quente");
  const withoutNextStep = active.filter(
    (contact) => !contact.nextAction && !contact.nextActionDate,
  );
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
          detail={
            overdueTasks.length ? `${overdueTasks.length} ações atrasadas` : "Retornos em dia"
          }
        />
      </div>

      <section className="grid gap-3 rounded-xl border border-border bg-white p-4 shadow-card sm:grid-cols-3 sm:p-5">
        <div className="rounded-lg bg-action/7 p-4">
          <p className="text-technical text-2xl font-bold text-action">{overdueTasks.length}</p>
          <p className="mt-1 text-xs font-semibold text-road">Ações atrasadas</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Resolver antes de iniciar novas prospecções.
          </p>
        </div>
        <div className="rounded-lg bg-result/8 p-4">
          <p className="text-technical text-2xl font-bold text-result">{hotContacts.length}</p>
          <p className="mt-1 text-xs font-semibold text-road">Oportunidades quentes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clientes com maior urgência comercial.
          </p>
        </div>
        <div className="rounded-lg bg-engineering/7 p-4">
          <p className="text-technical text-2xl font-bold text-engineering">
            {withoutNextStep.length}
          </p>
          <p className="mt-1 text-xs font-semibold text-road">Sem próximo passo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Atendimentos que precisam de uma ação definida.
          </p>
        </div>
      </section>

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

      <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-action">Memória comercial</p>
            <h2 className="mt-2 text-xl font-bold text-road">Últimos contatos registrados</h2>
          </div>
          <span className="text-technical text-xs text-muted-foreground">
            {workspace.interactions.length} atividades
          </span>
        </div>
        {workspace.interactions.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspace.interactions.slice(0, 6).map((interaction) => {
              const contact = workspace.contacts.find((item) => item.id === interaction.contactId);
              return (
                <article
                  key={interaction.id}
                  className="rounded-lg border border-border bg-surface/50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-road">{contact?.name || "Contato"}</p>
                    <Badge variant="outline">{interactionChannelLabels[interaction.channel]}</Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {interaction.notes || "Atividade registrada"}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-surface p-4 text-sm text-muted-foreground">
            Abra a ficha de um cliente para registrar ligações, mensagens, e-mails e visitas.
          </p>
        )}
      </section>
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

function ContactDetailsDialog({
  contact,
  interactions,
  onInteraction,
  onUpdate,
}: {
  contact: SalesContact;
  interactions: SalesInteraction[];
  onInteraction: (
    contact: SalesContact,
    channel: SalesInteraction["channel"],
    notes: string,
  ) => Promise<void>;
  onUpdate: (contact: SalesContact) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await onInteraction(
        contact,
        String(form.get("channel")) as SalesInteraction["channel"],
        String(form.get("notes") || "").trim(),
      );
      event.currentTarget.reset();
    } finally {
      setBusy(false);
    }
  }

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onUpdate({
      ...contact,
      temperature: String(form.get("temperature")) as SalesContact["temperature"],
      source: String(form.get("source")) as SalesContact["source"],
      nextAction: String(form.get("nextAction") || "").trim(),
      nextActionDate: String(form.get("nextActionDate") || ""),
      notes: String(form.get("notes") || "").trim(),
      updatedAt: new Date().toISOString(),
    });
    toast.success("Acompanhamento atualizado.");
  }

  const recent = interactions
    .filter((interaction) => interaction.contactId === contact.id)
    .slice(0, 6);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="quiet" size="sm">
          Ver ficha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{contact.name}</DialogTitle>
          <DialogDescription>
            {[contact.company, contact.city, contact.interest].filter(Boolean).join(" · ") ||
              "Atendimento comercial"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {contact.whatsapp && (
            <Button asChild variant="whatsapp" className="w-full">
              <a href={contactWhatsAppUrl(contact)} target="_blank" rel="noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          )}
          {contact.whatsapp && (
            <Button asChild variant="institutional" className="w-full">
              <a href={`tel:${contact.whatsapp.replace(/\D/g, "")}`}>
                <Phone /> Ligar
              </a>
            </Button>
          )}
          {contact.email && (
            <Button asChild variant="quiet" className="w-full">
              <a href={contactGmailUrl(contact)} target="_blank" rel="noreferrer">
                <Mail /> Gmail
              </a>
            </Button>
          )}
          {contact.city && (
            <Button asChild variant="quiet" className="w-full">
              <a href={mapsUrl(contact.city)} target="_blank" rel="noreferrer">
                <MapPinned /> Mapa
              </a>
            </Button>
          )}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5">
            <p className="eyebrow text-action">Resumo comercial</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-5">
                <dt className="text-muted-foreground">Temperatura</dt>
                <dd className="font-semibold capitalize text-road">{contact.temperature}</dd>
              </div>
              <div className="flex justify-between gap-5">
                <dt className="text-muted-foreground">Próxima ação</dt>
                <dd className="max-w-[60%] text-right font-semibold text-road">
                  {contact.nextAction || "A definir"}
                </dd>
              </div>
              <div className="flex justify-between gap-5">
                <dt className="text-muted-foreground">Data</dt>
                <dd className="font-semibold text-road">{formatDate(contact.nextActionDate)}</dd>
              </div>
              <div className="border-t border-border pt-3">
                <dt className="text-muted-foreground">Observações</dt>
                <dd className="mt-2 whitespace-pre-wrap leading-relaxed text-road">
                  {contact.notes || "Sem observações registradas."}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-white p-5">
            <p className="eyebrow text-action">Registrar atividade</p>
            <form onSubmit={submit} className="mt-4 space-y-4">
              <label className="block">
                <span className={labelClass}>Canal</span>
                <select className={nativeSelectClass} name="channel" defaultValue="phone">
                  <option value="phone">Ligação</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="visit">Visita</option>
                  <option value="other">Outro</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Resultado / próximo passo</span>
                <Textarea
                  className="mt-2 min-h-20"
                  name="notes"
                  placeholder="Ex.: cliente pediu retorno com simulação na terça"
                  required
                />
              </label>
              <Button type="submit" variant="institutional" className="w-full" disabled={busy}>
                {busy ? "Registrando..." : "Salvar atividade"}
              </Button>
            </form>
          </section>
        </div>

        <section className="mt-5 rounded-xl border border-border bg-surface p-5">
          <p className="eyebrow text-action">Atualizar acompanhamento</p>
          <form
            key={contact.updatedAt}
            onSubmit={submitUpdate}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <label>
              <span className={labelClass}>Temperatura</span>
              <select
                className={nativeSelectClass}
                name="temperature"
                defaultValue={contact.temperature}
              >
                <option value="quente">Quente - agir agora</option>
                <option value="morno">Morno - acompanhar</option>
                <option value="frio">Frio - nutrir</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>Origem</span>
              <select className={nativeSelectClass} name="source" defaultValue={contact.source}>
                <option value="prospeccao">Prospecção ativa</option>
                <option value="indicacao">Indicação</option>
                <option value="site">Site</option>
                <option value="retorno">Cliente da carteira</option>
                <option value="outro">Outro</option>
              </select>
            </label>
            <label>
              <span className={labelClass}>Próxima ação</span>
              <Input
                className={fieldClass}
                name="nextAction"
                defaultValue={contact.nextAction}
                placeholder="Ex.: ligar com a simulação"
              />
            </label>
            <label>
              <span className={labelClass}>Data do retorno</span>
              <Input
                className={fieldClass}
                name="nextActionDate"
                type="date"
                defaultValue={contact.nextActionDate}
              />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Observações</span>
              <Textarea
                className="mt-2 min-h-24 bg-white"
                name="notes"
                defaultValue={contact.notes}
                placeholder="Operação, objeções, entrada, troca e contexto importante"
              />
            </label>
            <div className="sm:col-span-2 sm:flex sm:justify-end">
              <Button type="submit" variant="institutional" className="w-full sm:w-auto">
                Salvar próximo passo
              </Button>
            </div>
          </form>
        </section>

        <section className="mt-5 rounded-xl border border-border bg-white p-5">
          <p className="eyebrow text-action">Histórico recente</p>
          {recent.length ? (
            <ol className="mt-4 divide-y divide-border">
              {recent.map((interaction) => (
                <li
                  key={interaction.id}
                  className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[8rem_1fr]"
                >
                  <p className="text-technical text-xs font-bold text-engineering">
                    {interactionChannelLabels[interaction.channel]}
                  </p>
                  <div>
                    <p className="text-sm leading-relaxed text-road">{interaction.notes}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(interaction.interactionAt))}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma ligação, mensagem, e-mail ou visita registrada ainda.
            </p>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

function ContactList({
  contacts,
  interactions,
  onStageChange,
  onInteraction,
  onUpdate,
}: {
  contacts: SalesContact[];
  interactions: SalesInteraction[];
  onStageChange: (id: string, stage: PipelineStage) => void;
  onInteraction: (
    contact: SalesContact,
    channel: SalesInteraction["channel"],
    notes: string,
  ) => Promise<void>;
  onUpdate: (contact: SalesContact) => void;
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
              <ContactDetailsDialog
                contact={contact}
                interactions={interactions}
                onInteraction={onInteraction}
                onUpdate={onUpdate}
              />
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
                  {task.location ? ` · ${task.location}` : ""}
                </p>
              </div>
              {!task.completed && (
                <div className="flex shrink-0 gap-2">
                  <a
                    href={taskCalendarUrl(task, contact)}
                    target="_blank"
                    rel="noreferrer"
                    className="grid size-9 place-items-center rounded-md border border-border bg-white text-engineering hover:bg-surface"
                    aria-label={`Adicionar ${task.title} ao Google Agenda`}
                  >
                    <CalendarDays className="size-4" />
                  </a>
                  {task.location && (
                    <a
                      href={mapsUrl(task.location)}
                      target="_blank"
                      rel="noreferrer"
                      className="grid size-9 place-items-center rounded-md border border-border bg-white text-engineering hover:bg-surface"
                      aria-label={`Abrir rota para ${task.location}`}
                    >
                      <MapPinned className="size-4" />
                    </a>
                  )}
                </div>
              )}
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
  saveWorkspace,
  storageMode,
  onLock,
}: {
  initialWorkspace: SalesWorkspace;
  saveWorkspace: (workspace: SalesWorkspace) => Promise<void>;
  storageMode: "cloud" | "local";
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
        await saveWorkspace(updated);
        setSaved(true);
      } catch {
        toast.error("Não foi possível salvar a última alteração.");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [saveWorkspace, workspace]);

  useEffect(() => {
    const inactivityLimit = storageMode === "cloud" ? 4 * 60 * 60 * 1000 : 15 * 60 * 1000;
    let timer = window.setTimeout(onLock, inactivityLimit);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onLock, inactivityLimit);
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown"];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [onLock, storageMode]);

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

  function updateContact(contact: SalesContact) {
    setWorkspace((current) => ({
      ...current,
      contacts: current.contacts.map((item) => (item.id === contact.id ? contact : item)),
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

  async function recordInteraction(
    contact: SalesContact,
    channel: SalesInteraction["channel"],
    notes: string,
  ) {
    try {
      const interaction =
        storageMode === "cloud"
          ? await saveInteraction(contact.id, channel, notes)
          : {
              id: crypto.randomUUID(),
              contactId: contact.id,
              channel,
              notes,
              interactionAt: new Date().toISOString(),
            };
      setWorkspace((current) => ({
        ...current,
        interactions: [interaction, ...current.interactions],
        contacts: current.contacts.map((item) =>
          item.id === contact.id
            ? {
                ...item,
                lastContactAt: interaction.interactionAt,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      }));
      toast.success("Atividade adicionada ao histórico.");
    } catch {
      toast.error("Não foi possível registrar essa atividade.");
    }
  }

  const navigation = [
    ["dashboard", "Visão geral", LayoutDashboard],
    ["pipeline", "Funil", Gauge],
    ["clientes", "Clientes", UsersRound],
    ["estoque", "Estoque", Truck],
    ["agenda", "Agenda", CalendarDays],
  ] as const;

  return (
    <div className="min-h-screen bg-surface pb-20 text-foreground lg:grid lg:grid-cols-[17rem_1fr] lg:pb-0">
      <aside className="admin-sidebar relative overflow-hidden bg-road px-4 py-4 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-5 lg:py-7">
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
        <nav className="mt-10 hidden space-y-1 lg:block" aria-label="Navegação do painel">
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
            <ShieldCheck className="size-4 text-result" />
            {storageMode === "cloud" ? "Supabase protegido por RLS" : "Cofre local ativo"}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            {storageMode === "cloud"
              ? "Dados sincronizados entre celular e computador."
              : "Bloqueio automático após 15 minutos sem atividade."}
          </p>
        </div>
        <div className="mt-auto hidden space-y-1 pt-5 lg:block">
          {storageMode === "local" && (
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/60 hover:bg-white/7 hover:text-white"
              onClick={() => downloadVaultBackup()}
            >
              <Download className="size-4" /> Baixar backup
            </button>
          )}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/60 hover:bg-white/7 hover:text-white"
            onClick={onLock}
          >
            {storageMode === "cloud" ? <LogOut className="size-4" /> : <Lock className="size-4" />}
            {storageMode === "cloud" ? "Sair do painel" : "Bloquear painel"}
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-7 sm:py-4 lg:px-10">
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
                {saved
                  ? storageMode === "cloud"
                    ? "Sincronizado na nuvem"
                    : "Salvo e criptografado"
                  : "Salvando..."}
              </span>
              {storageMode === "local" && (
                <Button
                  size="icon"
                  variant="quiet"
                  onClick={() => downloadVaultBackup()}
                  aria-label="Baixar backup"
                >
                  <Download />
                </Button>
              )}
              <Button size="icon" variant="quiet" onClick={onLock} aria-label="Sair do painel">
                {storageMode === "cloud" ? <LogOut /> : <Lock />}
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[100rem] p-4 sm:p-7 lg:p-10">
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
            <ContactList
              contacts={workspace.contacts}
              interactions={workspace.interactions}
              onStageChange={updateContactStage}
              onInteraction={recordInteraction}
              onUpdate={updateContact}
            />
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
              {storageMode === "cloud" ? (
                <Cloud className="mt-0.5 size-4 shrink-0 text-engineering" />
              ) : (
                <CloudOff className="mt-0.5 size-4 shrink-0 text-engineering" />
              )}
              {storageMode === "cloud"
                ? "Central online: alterações sincronizadas com o Supabase e protegidas por usuário."
                : "Modo local seguro: use o backup para levar os dados a outro computador."}
            </p>
            {storageMode === "local" && (
              <>
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
                      toast.success(
                        "Backup importado. O painel será bloqueado para validar o PIN.",
                      );
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
              </>
            )}
          </div>
        </div>
      </main>

      <nav
        aria-label="Navegação móvel do painel"
        className="admin-mobile-nav fixed inset-x-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-road/95 p-1.5 text-white shadow-[0_18px_50px_-12px_rgb(0_0_0_/_0.55)] backdrop-blur-xl lg:hidden"
      >
        {navigation.map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.62rem] font-semibold transition-colors",
              view === value ? "bg-white text-road" : "text-white/55",
            )}
          >
            <Icon className={cn("size-4", view === value && "text-action")} />
            <span className="max-w-full truncate">{label.replace("Visão geral", "Início")}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export function PainelApp() {
  const [localSession, setLocalSession] = useState<{
    key: CryptoKey;
    workspace: SalesWorkspace;
  } | null>(null);
  const [cloudWorkspace, setCloudWorkspace] = useState<SalesWorkspace | null>(null);

  const handleCloudReady = useCallback((workspace: SalesWorkspace) => {
    setCloudWorkspace(workspace);
  }, []);

  const saveLocalWorkspace = useCallback(
    async (workspace: SalesWorkspace) => {
      if (!localSession) throw new Error("Sessão local encerrada.");
      await saveVault(localSession.key, workspace);
    },
    [localSession],
  );

  const signOutCloud = useCallback(async () => {
    await requireSupabase().auth.signOut();
    setCloudWorkspace(null);
  }, []);

  if (isSupabaseConfigured) {
    if (!cloudWorkspace) return <SupabaseGate onReady={handleCloudReady} />;

    return (
      <WorkspacePanel
        initialWorkspace={cloudWorkspace}
        saveWorkspace={saveCloudWorkspace}
        storageMode="cloud"
        onLock={() => void signOutCloud()}
      />
    );
  }

  if (!localSession) {
    return <VaultGate onUnlock={(key, workspace) => setLocalSession({ key, workspace })} />;
  }

  return (
    <WorkspacePanel
      initialWorkspace={localSession.workspace}
      saveWorkspace={saveLocalWorkspace}
      storageMode="local"
      onLock={() => setLocalSession(null)}
    />
  );
}
