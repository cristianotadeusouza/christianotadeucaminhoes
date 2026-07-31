import { requireSupabase } from "@/lib/supabase";
import {
  createEmptyWorkspace,
  pipelineStages,
  type InventoryStatus,
  type PipelineStage,
  type SalesContact,
  type SalesInteraction,
  type SalesTask,
  type SalesWorkspace,
  type StockVehicle,
} from "./types";

type JsonRecord = Record<string, unknown>;

function parseMetadata(value: unknown): JsonRecord {
  if (typeof value !== "string" || !value.trim().startsWith("{")) return {};
  try {
    const parsed = JSON.parse(value) as JsonRecord;
    return parsed.ctPanel === 1 ? parsed : {};
  } catch {
    return {};
  }
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function validStage(value: unknown): PipelineStage {
  return pipelineStages.some((stage) => stage.value === value) ? (value as PipelineStage) : "novo";
}

function validInventoryStatus(value: unknown): InventoryStatus {
  const statuses: InventoryStatus[] = ["disponivel", "reservado", "vendido", "encomenda"];
  return statuses.includes(value as InventoryStatus) ? (value as InventoryStatus) : "disponivel";
}

function validSource(value: unknown): SalesContact["source"] {
  const sources: SalesContact["source"][] = ["indicacao", "prospeccao", "site", "retorno", "outro"];
  return sources.includes(value as SalesContact["source"])
    ? (value as SalesContact["source"])
    : "outro";
}

function validTemperature(value: unknown): SalesContact["temperature"] {
  const temperatures: SalesContact["temperature"][] = ["frio", "morno", "quente"];
  return temperatures.includes(value as SalesContact["temperature"])
    ? (value as SalesContact["temperature"])
    : "morno";
}

function validFamily(value: unknown): StockVehicle["family"] {
  const families: StockVehicle["family"][] = ["Delivery", "Constellation", "Meteor", "Outro"];
  return families.includes(value as StockVehicle["family"])
    ? (value as StockVehicle["family"])
    : "Outro";
}

function validTaskKind(value: unknown): SalesTask["kind"] {
  const kinds: SalesTask["kind"][] = [
    "retorno",
    "ligacao",
    "whatsapp",
    "email",
    "visita",
    "proposta",
  ];
  return kinds.includes(value as SalesTask["kind"]) ? (value as SalesTask["kind"]) : "retorno";
}

function validChannel(value: unknown): SalesInteraction["channel"] {
  const channels: SalesInteraction["channel"][] = ["whatsapp", "phone", "email", "visit", "other"];
  return channels.includes(value as SalesInteraction["channel"])
    ? (value as SalesInteraction["channel"])
    : "other";
}

function priceNumber(value: string): number | null {
  if (!/\d/.test(value)) return null;
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replaceAll(".", "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function loadCloudWorkspace(): Promise<SalesWorkspace> {
  const client = requireSupabase();
  const [leadsResult, inventoryResult, tasksResult, interactionsResult] = await Promise.all([
    client.from("leads").select("*").order("updated_at", { ascending: false }),
    client.from("inventory_items").select("*").order("updated_at", { ascending: false }),
    client.from("follow_up_tasks").select("*").order("due_at", { ascending: true }),
    client
      .from("contact_interactions")
      .select("*")
      .order("interaction_at", { ascending: false })
      .limit(150),
  ]);

  const error =
    leadsResult.error || inventoryResult.error || tasksResult.error || interactionsResult.error;
  if (error) throw error;

  const contacts: SalesContact[] = (leadsResult.data ?? []).map((row) => {
    const metadata = parseMetadata(row.notes);
    return {
      id: row.id,
      name: row.name,
      company: row.company_name ?? "",
      whatsapp: row.phone ?? "",
      email: row.email ?? "",
      city: asText(metadata.city),
      interest: row.truck_interest ?? "",
      stage: validStage(row.status),
      nextAction: asText(metadata.nextAction),
      nextActionDate: asText(metadata.nextActionDate),
      source: validSource(asText(metadata.source) || row.source),
      temperature: validTemperature(asText(metadata.temperature)),
      lastContactAt: asText(metadata.lastContactAt),
      notes: asText(metadata.notes) || (Object.keys(metadata).length ? "" : (row.notes ?? "")),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  const inventory: StockVehicle[] = (inventoryResult.data ?? []).map((row) => {
    const details = (row.details ?? {}) as JsonRecord;
    return {
      id: row.id,
      family: validFamily(asText(details.family)),
      model: row.model ?? row.title,
      year: asText(details.year) || (row.model_year ? String(row.model_year) : ""),
      status: validInventoryStatus(row.status),
      price: asText(details.priceText) || (row.price ? String(row.price) : ""),
      location: asText(details.location),
      notes: asText(details.notes),
      updatedAt: row.updated_at,
    };
  });

  const tasks: SalesTask[] = (tasksResult.data ?? []).map((row) => {
    const metadata = parseMetadata(row.notes);
    return {
      id: row.id,
      title: row.title,
      dueDate: row.due_at ? row.due_at.slice(0, 10) : "",
      contactId: row.lead_id ?? "",
      priority: row.priority === "alta" || row.priority === "high" ? "alta" : "normal",
      kind: validTaskKind(asText(metadata.kind)),
      location: asText(metadata.location),
      completed: row.status === "completed" || row.status === "concluida",
      createdAt: row.created_at,
    };
  });

  const interactions: SalesInteraction[] = (interactionsResult.data ?? []).map((row) => ({
    id: row.id,
    contactId: row.lead_id ?? row.customer_id ?? "",
    channel: validChannel(row.channel),
    notes: row.notes ?? "",
    interactionAt: row.interaction_at,
  }));

  return {
    ...createEmptyWorkspace(),
    contacts,
    inventory,
    tasks,
    interactions,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveCloudWorkspace(workspace: SalesWorkspace) {
  const client = requireSupabase();
  const operations: Array<PromiseLike<{ error: unknown }>> = [];

  if (workspace.contacts.length) {
    operations.push(
      client.from("leads").upsert(
        workspace.contacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          company_name: contact.company || null,
          phone: contact.whatsapp || null,
          email: contact.email || null,
          source: contact.source,
          status: contact.stage,
          truck_interest: contact.interest || null,
          notes: JSON.stringify({
            ctPanel: 1,
            city: contact.city,
            nextAction: contact.nextAction,
            nextActionDate: contact.nextActionDate,
            source: contact.source,
            temperature: contact.temperature,
            lastContactAt: contact.lastContactAt,
            notes: contact.notes,
          }),
        })),
      ),
    );
  }

  if (workspace.inventory.length) {
    operations.push(
      client.from("inventory_items").upsert(
        workspace.inventory.map((vehicle) => ({
          id: vehicle.id,
          title: `Volkswagen ${vehicle.family} ${vehicle.model}`.trim(),
          model: vehicle.model || null,
          model_year: Number(vehicle.year.match(/\d{4}/)?.[0]) || null,
          price: priceNumber(vehicle.price),
          status: vehicle.status,
          is_public: false,
          details: {
            family: vehicle.family,
            year: vehicle.year,
            priceText: vehicle.price,
            location: vehicle.location,
            notes: vehicle.notes,
          },
        })),
      ),
    );
  }

  if (workspace.tasks.length) {
    operations.push(
      client.from("follow_up_tasks").upsert(
        workspace.tasks.map((task) => ({
          id: task.id,
          lead_id: task.contactId || null,
          title: task.title,
          due_at: task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toISOString() : null,
          status: task.completed ? "completed" : "pending",
          priority: task.priority,
          notes: JSON.stringify({ ctPanel: 1, kind: task.kind, location: task.location }),
        })),
      ),
    );
  }

  const results = await Promise.all(operations);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

export async function saveInteraction(
  contactId: string,
  channel: SalesInteraction["channel"],
  notes: string,
) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("contact_interactions")
    .insert({ lead_id: contactId, channel, notes: notes || null })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    contactId: data.lead_id,
    channel: data.channel,
    notes: data.notes ?? "",
    interactionAt: data.interaction_at,
  } as SalesInteraction;
}
