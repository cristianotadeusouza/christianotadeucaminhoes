export type PipelineStage =
  "novo" | "contato" | "diagnostico" | "proposta" | "negociacao" | "ganho" | "perdido";

export type InventoryStatus = "disponivel" | "reservado" | "vendido" | "encomenda";

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
  createdAt: string;
}

export interface SalesInteraction {
  id: string;
  contactId: string;
  channel: "whatsapp" | "phone" | "email" | "visit" | "other";
  notes: string;
  interactionAt: string;
}

export interface SalesWorkspace {
  version: 1;
  contacts: SalesContact[];
  inventory: StockVehicle[];
  tasks: SalesTask[];
  interactions: SalesInteraction[];
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

export function createEmptyWorkspace(): SalesWorkspace {
  return {
    version: 1,
    contacts: [],
    inventory: [],
    tasks: [],
    interactions: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeWorkspace(workspace: Partial<SalesWorkspace>): SalesWorkspace {
  const empty = createEmptyWorkspace();
  return {
    ...empty,
    ...workspace,
    version: 1,
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
          notes: contact.notes ?? "",
          createdAt: contact.createdAt ?? new Date().toISOString(),
          updatedAt: contact.updatedAt ?? new Date().toISOString(),
        }))
      : [],
    inventory: Array.isArray(workspace.inventory) ? workspace.inventory : [],
    tasks: Array.isArray(workspace.tasks)
      ? workspace.tasks.map((task) => ({
          ...task,
          kind: task.kind ?? "retorno",
          location: task.location ?? "",
        }))
      : [],
    interactions: Array.isArray(workspace.interactions) ? workspace.interactions : [],
  };
}
