import { requireSupabase } from "@/lib/supabase";
import {
  createEmptyWorkspace,
  interactionOutcomes,
  pipelineStages,
  proposalStatuses,
  type InteractionOutcome,
  type InventoryStatus,
  type PipelineStage,
  type ProposalStatus,
  type SalesContact,
  type SalesDocument,
  type SalesInteraction,
  type SalesProposal,
  type SalesTask,
  type SalesWorkspace,
  type StockVehicle,
} from "./types";

type JsonRecord = Record<string, unknown>;

export type InteractionInput = {
  contactId: string;
  channel: SalesInteraction["channel"];
  notes: string;
  outcome: InteractionOutcome;
  nextAction: string;
  nextActionDate: string;
  location: string;
};

export type DocumentUploadInput = {
  file: File;
  contactId?: string;
  proposalId?: string;
  category: SalesDocument["category"];
};

const DOCUMENT_BUCKET = "sales-private";

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

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asTextArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function validPortfolioCategory(value: unknown): SalesContact["portfolioCategory"] {
  const categories: SalesContact["portfolioCategory"][] = [
    "manual",
    "atendimento_em_andamento",
    "retomar_com_prioridade",
    "reativar_carteira",
    "higienizar_dados",
    "pos_venda",
    "arquivado_historico",
  ];
  return categories.includes(value as SalesContact["portfolioCategory"])
    ? (value as SalesContact["portfolioCategory"])
    : "manual";
}

function validContactPriority(value: unknown): SalesContact["priority"] {
  return value === "alta" || value === "media" || value === "baixa" ? value : "media";
}

function validStage(value: unknown): PipelineStage {
  return pipelineStages.some((stage) => stage.value === value) ? (value as PipelineStage) : "novo";
}

function validProposalStatus(value: unknown): ProposalStatus {
  return proposalStatuses.some((status) => status.value === value)
    ? (value as ProposalStatus)
    : "rascunho";
}

function validOutcome(value: unknown): InteractionOutcome {
  return interactionOutcomes.some((outcome) => outcome.value === value)
    ? (value as InteractionOutcome)
    : "outro";
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

function validPurchaseWindow(value: unknown): SalesContact["purchaseWindow"] {
  const windows: SalesContact["purchaseWindow"][] = [
    "imediato",
    "30_dias",
    "90_dias",
    "futuro",
    "indefinido",
  ];
  return windows.includes(value as SalesContact["purchaseWindow"])
    ? (value as SalesContact["purchaseWindow"])
    : "indefinido";
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

function legacyChannel(notes: string): SalesInteraction["channel"] {
  if (/whats|mensagem|msg|wpp/i.test(notes)) return "whatsapp";
  if (/e-?mail/i.test(notes)) return "email";
  if (/visita|estive com|reuni[aã]o/i.test(notes)) return "visit";
  if (/liguei|liga[cç][aã]o|telefone|contato telef/i.test(notes)) return "phone";
  return "other";
}

function validDocumentCategory(value: unknown): SalesDocument["category"] {
  const categories: SalesDocument["category"][] = ["proposta", "foto_visita", "documento", "outro"];
  return categories.includes(value as SalesDocument["category"])
    ? (value as SalesDocument["category"])
    : "outro";
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

function amountText(value: number | null) {
  if (value === null) return "";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export async function loadCloudWorkspace(): Promise<SalesWorkspace> {
  const client = requireSupabase();
  const [
    leadsResult,
    inventoryResult,
    tasksResult,
    interactionsResult,
    legacyEventsResult,
    proposalsResult,
    documentsResult,
  ] = await Promise.all([
    client.from("leads").select("*").order("updated_at", { ascending: false }),
    client.from("inventory_items").select("*").order("updated_at", { ascending: false }),
    client.from("follow_up_tasks").select("*").order("due_at", { ascending: true }),
    client
      .from("contact_interactions")
      .select("*")
      .order("interaction_at", { ascending: false })
      .limit(500),
    client.from("legacy_crm_events").select("*").order("last_contact_at", { ascending: false }),
    client.from("sales_proposals").select("*").order("updated_at", { ascending: false }),
    client.from("sales_documents").select("*").order("created_at", { ascending: false }),
  ]);

  const error =
    leadsResult.error ||
    inventoryResult.error ||
    tasksResult.error ||
    interactionsResult.error ||
    legacyEventsResult.error ||
    proposalsResult.error ||
    documentsResult.error;
  if (error) throw error;

  const contacts: SalesContact[] = (leadsResult.data ?? []).map((row) => {
    const metadata = parseMetadata(row.notes);
    const portfolioMetadata = (row.metadata ?? {}) as JsonRecord;
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
      temperature: validTemperature(row.temperature || metadata.temperature),
      lastContactAt: row.last_contact_at ?? asText(metadata.lastContactAt),
      operation: asText(metadata.operation),
      budget: asText(metadata.budget),
      purchaseWindow: validPurchaseWindow(metadata.purchaseWindow),
      address: asText(metadata.address),
      lossReason: asText(metadata.lossReason),
      winReason: asText(metadata.winReason),
      notes: asText(metadata.notes) || (Object.keys(metadata).length ? "" : (row.notes ?? "")),
      sourceSystem:
        row.external_source ||
        asText(portfolioMetadata.sourceSystem) ||
        asText(metadata.sourceSystem),
      externalKey: row.external_key ?? asText(metadata.externalKey),
      segment: row.segment || asText(metadata.segment) || "nao_identificado",
      portfolioCategory: validPortfolioCategory(
        row.portfolio_category || portfolioMetadata.portfolioCategory || metadata.portfolioCategory,
      ),
      priority: validContactPriority(row.priority || metadata.priority),
      personType:
        row.person_type === "pessoa_fisica" || row.person_type === "pessoa_juridica"
          ? row.person_type
          : "nao_informado",
      documentMasked: row.document_masked ?? asText(metadata.documentMasked),
      eventCount: asNumber(portfolioMetadata.eventCount) || asNumber(metadata.eventCount),
      eventIds: asTextArray(portfolioMetadata.eventIds).length
        ? asTextArray(portfolioMetadata.eventIds)
        : asTextArray(metadata.eventIds),
      phones: asTextArray(portfolioMetadata.phones).length
        ? asTextArray(portfolioMetadata.phones)
        : asTextArray(metadata.phones),
      needsRequalification: row.needs_requalification,
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
      price: asText(details.priceText) || amountText(row.price),
      location: asText(details.location),
      traction: asText(details.traction),
      application: asText(details.application),
      bodyType: asText(details.bodyType),
      color: asText(details.color),
      quantity: asNumber(details.quantity, 1),
      availabilityDate: asText(details.availabilityDate),
      source: details.source === "importado" ? "importado" : "manual",
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
      completedAt: asText(metadata.completedAt),
      createdAt: row.created_at,
    };
  });

  const currentInteractions: SalesInteraction[] = (interactionsResult.data ?? []).map((row) => {
    const metadata = (row.metadata ?? {}) as JsonRecord;
    return {
      id: row.id,
      contactId: row.lead_id ?? row.customer_id ?? "",
      channel: validChannel(row.channel),
      notes: row.notes ?? "",
      outcome: validOutcome(metadata.outcome),
      nextAction: asText(metadata.nextAction),
      nextActionDate: asText(metadata.nextActionDate),
      location: asText(metadata.location),
      interactionAt: row.interaction_at,
    };
  });

  const legacyInteractions: SalesInteraction[] = (legacyEventsResult.data ?? []).flatMap((row) => {
    const history = Array.isArray(row.history) ? row.history : [];
    const entries = history.length
      ? history
      : row.summary
        ? [{ at: row.last_contact_at ?? row.included_at, actor: "", notes: row.summary }]
        : [];
    return entries.flatMap((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
      const actor = asText(entry.actor);
      const notes = asText(entry.notes);
      const interactionAt = asText(entry.at) || row.last_contact_at || row.included_at;
      if (!interactionAt || !notes) return [];
      return [
        {
          id: `legacy-${row.id}-${index}`,
          contactId: row.lead_id,
          channel: legacyChannel(notes),
          notes: `${actor && actor !== "Sistema" ? `${actor}: ` : ""}${notes}`,
          outcome: "outro",
          nextAction: row.next_action ?? "",
          nextActionDate: "",
          location: "",
          interactionAt,
        } satisfies SalesInteraction,
      ];
    });
  });

  const interactions = [...currentInteractions, ...legacyInteractions].sort((left, right) =>
    right.interactionAt.localeCompare(left.interactionAt),
  );

  const proposals: SalesProposal[] = (proposalsResult.data ?? []).map((row) => ({
    id: row.id,
    contactId: row.lead_id,
    vehicleId: row.inventory_item_id ?? "",
    title: row.title,
    model: row.model ?? "",
    value: amountText(row.amount),
    status: validProposalStatus(row.status),
    validUntil: row.valid_until ?? "",
    conditions: row.conditions ?? "",
    notes: row.notes ?? "",
    sentAt: row.sent_at ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const documents: SalesDocument[] = (documentsResult.data ?? []).map((row) => ({
    id: row.id,
    contactId: row.lead_id ?? "",
    proposalId: row.proposal_id ?? "",
    name: row.name,
    storagePath: row.storage_path,
    mimeType: row.mime_type ?? "application/octet-stream",
    size: row.size_bytes,
    category: validDocumentCategory(row.category),
    createdAt: row.created_at,
  }));

  return {
    ...createEmptyWorkspace(),
    contacts,
    inventory,
    tasks,
    interactions,
    proposals,
    documents,
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
          external_source: contact.sourceSystem || null,
          external_key: contact.externalKey || null,
          segment: contact.segment,
          portfolio_category: contact.portfolioCategory,
          priority: contact.priority,
          temperature: contact.temperature,
          person_type: contact.personType === "nao_informado" ? null : contact.personType,
          document_masked: contact.documentMasked || null,
          last_contact_at: contact.lastContactAt || null,
          needs_requalification: contact.needsRequalification,
          updated_at: contact.updatedAt,
          notes: JSON.stringify({
            ctPanel: 1,
            city: contact.city,
            nextAction: contact.nextAction,
            nextActionDate: contact.nextActionDate,
            source: contact.source,
            temperature: contact.temperature,
            lastContactAt: contact.lastContactAt,
            operation: contact.operation,
            budget: contact.budget,
            purchaseWindow: contact.purchaseWindow,
            address: contact.address,
            lossReason: contact.lossReason,
            winReason: contact.winReason,
            notes: contact.notes,
            sourceSystem: contact.sourceSystem,
            externalKey: contact.externalKey,
            segment: contact.segment,
            portfolioCategory: contact.portfolioCategory,
            priority: contact.priority,
            documentMasked: contact.documentMasked,
            eventCount: contact.eventCount,
            eventIds: contact.eventIds,
            phones: contact.phones,
            needsRequalification: contact.needsRequalification,
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
          updated_at: vehicle.updatedAt,
          details: {
            family: vehicle.family,
            year: vehicle.year,
            priceText: vehicle.price,
            location: vehicle.location,
            traction: vehicle.traction,
            application: vehicle.application,
            bodyType: vehicle.bodyType,
            color: vehicle.color,
            quantity: vehicle.quantity,
            availabilityDate: vehicle.availabilityDate,
            source: vehicle.source,
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
          updated_at: task.completedAt || task.createdAt,
          notes: JSON.stringify({
            ctPanel: 1,
            kind: task.kind,
            location: task.location,
            completedAt: task.completedAt,
          }),
        })),
      ),
    );
  }

  if (workspace.proposals.length) {
    operations.push(
      client.from("sales_proposals").upsert(
        workspace.proposals.map((proposal) => ({
          id: proposal.id,
          lead_id: proposal.contactId,
          inventory_item_id: proposal.vehicleId || null,
          title: proposal.title,
          model: proposal.model || null,
          amount: priceNumber(proposal.value),
          status: proposal.status,
          valid_until: proposal.validUntil || null,
          conditions: proposal.conditions || null,
          notes: proposal.notes || null,
          sent_at: proposal.sentAt || null,
          updated_at: proposal.updatedAt,
        })),
      ),
    );
  }

  const results = await Promise.all(operations);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

export async function saveInteraction(input: InteractionInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("contact_interactions")
    .insert({
      lead_id: input.contactId,
      channel: input.channel,
      notes: input.notes || null,
      metadata: {
        outcome: input.outcome,
        nextAction: input.nextAction,
        nextActionDate: input.nextActionDate,
        location: input.location,
      },
    })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    contactId: data.lead_id ?? "",
    channel: validChannel(data.channel),
    notes: data.notes ?? "",
    outcome: input.outcome,
    nextAction: input.nextAction,
    nextActionDate: input.nextActionDate,
    location: input.location,
    interactionAt: data.interaction_at,
  } satisfies SalesInteraction;
}

export async function uploadSalesDocument(input: DocumentUploadInput): Promise<SalesDocument> {
  const client = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user) throw userError ?? new Error("Sessão expirada.");

  const safeName = input.file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-");
  const folder = input.contactId || "geral";
  const storagePath = `${user.id}/${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await client.storage
    .from(DOCUMENT_BUCKET)
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data, error } = await client
    .from("sales_documents")
    .insert({
      lead_id: input.contactId || null,
      proposal_id: input.proposalId || null,
      name: input.file.name,
      storage_path: storagePath,
      mime_type: input.file.type || null,
      size_bytes: input.file.size,
      category: input.category,
    })
    .select("*")
    .single();

  if (error) {
    await client.storage.from(DOCUMENT_BUCKET).remove([storagePath]);
    throw error;
  }

  return {
    id: data.id,
    contactId: data.lead_id ?? "",
    proposalId: data.proposal_id ?? "",
    name: data.name,
    storagePath: data.storage_path,
    mimeType: data.mime_type ?? "application/octet-stream",
    size: data.size_bytes,
    category: validDocumentCategory(data.category),
    createdAt: data.created_at,
  };
}

export async function openSalesDocument(document: SalesDocument) {
  const client = requireSupabase();
  const { data, error } = await client.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(document.storagePath, 60);
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export async function removeSalesDocument(document: SalesDocument) {
  const client = requireSupabase();
  const { error: storageError } = await client.storage
    .from(DOCUMENT_BUCKET)
    .remove([document.storagePath]);
  if (storageError) throw storageError;
  const { error } = await client.from("sales_documents").delete().eq("id", document.id);
  if (error) throw error;
}
