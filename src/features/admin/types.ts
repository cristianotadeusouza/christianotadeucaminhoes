export type PipelineStage =
  "novo" | "contato" | "diagnostico" | "proposta" | "negociacao" | "ganho" | "perdido";

export type InventoryStatus = "disponivel" | "reservado" | "vendido" | "encomenda";

export type InteractionOutcome =
  | "atendeu"
  | "nao_atendeu"
  | "retornar"
  | "pediu_proposta"
  | "visita_agendada"
  | "sem_interesse"
  | "negociacao"
  | "outro";

export type ProposalStatus =
  "rascunho" | "enviada" | "revisao" | "aprovada" | "perdida" | "expirada";

export interface SalesContact {
  id: string;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  city: string;
  interest: string;
  stage: PipelineStage;
  nextAction: string;
  nextActionDate: string;
  source: "indicacao" | "prospeccao" | "site" | "retorno" | "outro";
  temperature: "frio" | "morno" | "quente";
  lastContactAt: string;
  operation: string;
  budget: string;
  purchaseWindow: "imediato" | "30_dias" | "90_dias" | "futuro" | "indefinido";
  address: string;
  lossReason: string;
  winReason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockVehicle {
  id: string;
  family: "Delivery" | "Constellation" | "Meteor" | "Outro";
  model: string;
  year: string;
  status: InventoryStatus;
  price: string;
  location: string;
  traction: string;
  application: string;
  bodyType: string;
  color: string;
  quantity: number;
  availabilityDate: string;
  source: "manual" | "importado";
  notes: string;
  updatedAt: string;
}

export interface SalesTask {
  id: string;
  title: string;
  dueDate: string;
  contactId: string;
  priority: "normal" | "alta";
  kind: "retorno" | "ligacao" | "whatsapp" | "email" | "visita" | "proposta";
  location: string;
  completed: boolean;
  completedAt: string;
  createdAt: string;
}

export interface SalesInteraction {
  id: string;
  contactId: string;
  channel: "whatsapp" | "phone" | "email" | "visit" | "other";
  notes: string;
  outcome: InteractionOutcome;
  nextAction: string;
  nextActionDate: string;
  location: string;
  interactionAt: string;
}

export interface SalesProposal {
  id: string;
  contactId: string;
  vehicleId: string;
  title: string;
  model: string;
  value: string;
  status: ProposalStatus;
  validUntil: string;
  conditions: string;
  notes: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesDocument {
  id: string;
  contactId: string;
  proposalId: string;
  name: string;
  storagePath: string;
  mimeType: string;
  size: number;
  category: "proposta" | "foto_visita" | "documento" | "outro";
  createdAt: string;
}

export interface SalesWorkspace {
  version: 2;
  contacts: SalesContact[];
  inventory: StockVehicle[];
  tasks: SalesTask[];
  interactions: SalesInteraction[];
  proposals: SalesProposal[];
  documents: SalesDocument[];
  updatedAt: string;
}

export const pipelineStages: Array<{
  value: PipelineStage;
  label: string;
  shortLabel: string;
}> = [
  { value: "novo", label: "Novo contato", shortLabel: "Novo" },
  { value: "contato", label: "Em contato", shortLabel: "Contato" },
  { value: "diagnostico", label: "Diagnóstico", shortLabel: "Diagnóstico" },
  { value: "proposta", label: "Proposta enviada", shortLabel: "Proposta" },
  { value: "negociacao", label: "Negociação", shortLabel: "Negociação" },
  { value: "ganho", label: "Venda concluída", shortLabel: "Ganho" },
  { value: "perdido", label: "Não avançou", shortLabel: "Perdido" },
];

export const inventoryStatuses: Array<{ value: InventoryStatus; label: string }> = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
  { value: "encomenda", label: "Sob encomenda" },
];

export const proposalStatuses: Array<{ value: ProposalStatus; label: string }> = [
  { value: "rascunho", label: "Rascunho" },
  { value: "enviada", label: "Enviada" },
  { value: "revisao", label: "Em revisão" },
  { value: "aprovada", label: "Aprovada" },
  { value: "perdida", label: "Perdida" },
  { value: "expirada", label: "Expirada" },
];

export const interactionOutcomes: Array<{ value: InteractionOutcome; label: string }> = [
  { value: "atendeu", label: "Atendeu" },
  { value: "nao_atendeu", label: "Não atendeu" },
  { value: "retornar", label: "Pediu retorno" },
  { value: "pediu_proposta", label: "Pediu proposta" },
  { value: "visita_agendada", label: "Visita agendada" },
  { value: "negociacao", label: "Negociação avançou" },
  { value: "sem_interesse", label: "Sem interesse agora" },
  { value: "outro", label: "Outro resultado" },
];

export function createEmptyWorkspace(): SalesWorkspace {
  return {
    version: 2,
    contacts: [],
    inventory: [],
    tasks: [],
    interactions: [],
    proposals: [],
    documents: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeWorkspace(workspace: Partial<SalesWorkspace>): SalesWorkspace {
  const empty = createEmptyWorkspace();
  return {
    ...empty,
    ...workspace,
    version: 2,
    contacts: Array.isArray(workspace.contacts)
      ? workspace.contacts.map((contact) => ({
          ...contact,
          company: contact.company ?? "",
          whatsapp: contact.whatsapp ?? "",
          email: contact.email ?? "",
          city: contact.city ?? "",
          interest: contact.interest ?? "",
          stage: contact.stage ?? "novo",
          nextAction: contact.nextAction ?? "",
          nextActionDate: contact.nextActionDate ?? "",
          source: contact.source ?? "outro",
          temperature: contact.temperature ?? "morno",
          lastContactAt: contact.lastContactAt ?? "",
          operation: contact.operation ?? "",
          budget: contact.budget ?? "",
          purchaseWindow: contact.purchaseWindow ?? "indefinido",
          address: contact.address ?? "",
          lossReason: contact.lossReason ?? "",
          winReason: contact.winReason ?? "",
          notes: contact.notes ?? "",
          createdAt: contact.createdAt ?? new Date().toISOString(),
          updatedAt: contact.updatedAt ?? new Date().toISOString(),
        }))
      : [],
    inventory: Array.isArray(workspace.inventory)
      ? workspace.inventory.map((vehicle) => ({
          ...vehicle,
          traction: vehicle.traction ?? "",
          application: vehicle.application ?? "",
          bodyType: vehicle.bodyType ?? "",
          color: vehicle.color ?? "",
          quantity: vehicle.quantity ?? 1,
          availabilityDate: vehicle.availabilityDate ?? "",
          source: vehicle.source ?? "manual",
        }))
      : [],
    tasks: Array.isArray(workspace.tasks)
      ? workspace.tasks.map((task) => ({
          ...task,
          kind: task.kind ?? "retorno",
          location: task.location ?? "",
          completedAt: task.completedAt ?? "",
        }))
      : [],
    interactions: Array.isArray(workspace.interactions)
      ? workspace.interactions.map((interaction) => ({
          ...interaction,
          outcome: interaction.outcome ?? "outro",
          nextAction: interaction.nextAction ?? "",
          nextActionDate: interaction.nextActionDate ?? "",
          location: interaction.location ?? "",
        }))
      : [],
    proposals: Array.isArray(workspace.proposals) ? workspace.proposals : [],
    documents: Array.isArray(workspace.documents) ? workspace.documents : [],
  };
}
