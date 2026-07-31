export type PipelineStage =
  "novo" | "contato" | "diagnostico" | "proposta" | "negociacao" | "ganho" | "perdido";

export type InventoryStatus = "disponivel" | "reservado" | "vendido" | "encomenda";

export interface SalesContact {
  id: string;
  name: string;
  company: string;
  whatsapp: string;
  city: string;
  interest: string;
  stage: PipelineStage;
  nextAction: string;
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
  completed: boolean;
  createdAt: string;
}

export interface SalesWorkspace {
  version: 1;
  contacts: SalesContact[];
  inventory: StockVehicle[];
  tasks: SalesTask[];
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
    updatedAt: new Date().toISOString(),
  };
}
