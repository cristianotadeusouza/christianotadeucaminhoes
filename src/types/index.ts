/**
 * Entidades do domínio.
 *
 * Estas interfaces são a fonte de verdade compartilhada entre os dados
 * simulados (src/data) e a futura integração com Supabase (ver
 * docs/SUPABASE-MIGRATION.md e supabase/migrations/0001_initial_schema.sql).
 */

export type UUID = string;
/** ISO 8601 */
export type ISODate = string;

export interface Auditable {
  id: UUID;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Comercial                                                           */
/* ------------------------------------------------------------------ */

export type LeadStatus =
  | "novo"
  | "em_contato"
  | "qualificado"
  | "proposta"
  | "negociacao"
  | "ganho"
  | "perdido";

export type LeadSource =
  | "diagnostico"
  | "contato"
  | "financiamento"
  | "oportunidade"
  | "whatsapp"
  | "conteudo";

export type PurchaseGoal = "primeiro_caminhao" | "ampliacao" | "renovacao" | "avaliando";
export type RouteProfile = "urbana" | "regional" | "rodoviaria" | "mista";
export type PurchaseHorizon = "imediato" | "ate_3_meses" | "ate_6_meses" | "estudando";

export interface OperationProfile {
  activity?: string;
  cargoType?: string;
  approximateLoad?: string;
  routeProfile?: RouteProfile;
  averageDistance?: string;
  usageFrequency?: string;
  bodyworkType?: string;
}

export interface FleetProfile {
  currentTruck?: string;
  fleetSize?: string;
  purchaseGoal?: PurchaseGoal;
  tradeInVehicle?: string;
  mainPainPoint?: string;
}

export interface PurchaseIntent {
  horizon?: PurchaseHorizon;
  quantity?: string;
  financingInterest?: boolean;
  bestContactTime?: string;
  notes?: string;
}

export interface Lead extends Auditable {
  name: string;
  companyName?: string;
  city?: string;
  state?: string;
  whatsapp: string;
  email?: string;
  source: LeadSource;
  status: LeadStatus;
  operation?: OperationProfile;
  fleet?: FleetProfile;
  purchase?: PurchaseIntent;
  consentGivenAt?: ISODate;
  ownerNotes?: string;
}

export interface Company extends Auditable {
  legalName: string;
  tradeName?: string;
  segment?: string;
  city?: string;
  state?: string;
  fleetSize?: number;
}

export interface Customer extends Auditable {
  name: string;
  companyId?: UUID;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
}

export type InteractionChannel = "whatsapp" | "telefone" | "visita" | "email" | "site";

export interface ContactInteraction extends Auditable {
  leadId?: UUID;
  customerId?: UUID;
  channel: InteractionChannel;
  occurredAt: ISODate;
  summary: string;
}

export interface FollowUpTask extends Auditable {
  leadId?: UUID;
  title: string;
  dueAt: ISODate;
  done: boolean;
  notes?: string;
}

export interface FinancingOpportunity extends Auditable {
  leadId?: UUID;
  estimatedVehicleValue?: string;
  availableDownPayment?: string;
  desiredTermMonths?: string;
  includesBodywork?: boolean;
  status: "solicitada" | "em_analise" | "proposta_enviada" | "concluida" | "cancelada";
}

/* ------------------------------------------------------------------ */
/* Produto                                                             */
/* ------------------------------------------------------------------ */

export type TruckFamilySlug = "delivery" | "constellation" | "meteor";

export interface SpecField {
  label: string;
  /** `null` quando o dado real ainda não foi fornecido — nunca inventar. */
  value: string | null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TruckFamily {
  slug: TruckFamilySlug;
  name: string;
  tagline: string;
  intro: string;
  usageProfile: string[];
  recommendedOperations: string[];
  reasonsToConsider: { title: string; description: string }[];
  /** Configurações reais entram aqui; `specs` com valor null = pendente. */
  configurations: {
    name: string;
    summary: string;
    specs: SpecField[];
  }[];
  gallery: ImageSlot[];
  faq: FaqItem[];
}

export interface Vehicle extends Auditable {
  familySlug: TruckFamilySlug;
  model: string;
  version?: string;
  modelYear?: string;
  configuration?: string;
  application?: string;
  specs?: SpecField[];
}

export type InventoryStatus =
  | "disponivel"
  | "sob_consulta"
  | "reservado"
  | "vendido"
  | "campanha_encerrada";

export type InventoryCondition = "novo" | "seminovo";

export interface InventoryItem {
  id: string;
  /** Marca explicitamente registros demonstrativos. */
  isDemo: boolean;
  familySlug: TruckFamilySlug;
  model: string;
  version: string | null;
  modelYear: string | null;
  configuration: string | null;
  application: string | null;
  condition: InventoryCondition;
  status: InventoryStatus;
  /** `null` quando não há preço real publicado. Nunca inventar valores. */
  price: number | null;
  note: string | null;
  validUntil: ISODate | null;
  image: ImageSlot;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Conteúdo e prova                                                    */
/* ------------------------------------------------------------------ */

export interface ImageSlot {
  /** Caminho da foto real quando disponível. */
  src?: string;
  alt: string;
  /** Descrição da foto que deverá ocupar o espaço (usado no placeholder). */
  caption: string;
  aspect: "16/9" | "4/3" | "3/2" | "1/1";
}

export interface CaseStudy {
  id: string;
  isPublished: boolean;
  hasMediaAuthorization: boolean;
  title: string;
  customerLabel: string;
  city: string | null;
  segment: string;
  initialSituation: string;
  need: string;
  chosenVehicle: string | null;
  reasonForChoice: string;
  purchaseMode: string | null;
  result: string | null;
  media: ImageSlot[];
  testimonialId?: string;
}

export interface Testimonial {
  id: string;
  isPublished: boolean;
  hasMediaAuthorization: boolean;
  quote: string;
  author: string;
  role?: string;
  city?: string;
}

export type ContentCategory =
  | "escolha-do-caminhao"
  | "operacao"
  | "manutencao"
  | "produtividade"
  | "financiamento"
  | "renovacao-de-frota"
  | "mercado-de-transporte"
  | "bastidores";

export interface ContentPost {
  slug: string;
  isPublished: boolean;
  title: string;
  description: string;
  category: ContentCategory;
  author: string;
  publishedAt: ISODate;
  readingMinutes: number;
  cover: ImageSlot;
  /** Parágrafos e subtítulos em estrutura simples (sem HTML bruto). */
  body: { type: "heading" | "paragraph" | "list"; text?: string; items?: string[] }[];
}

/* ------------------------------------------------------------------ */
/* Operações                                                           */
/* ------------------------------------------------------------------ */

export interface OperationCategory {
  slug: string;
  name: string;
  shortLabel: string;
  context: string;
  challenges: string[];
  selectionCriteria: string[];
  relatedFamilies: TruckFamilySlug[];
  questionsBeforeProposal: string[];
  featuredOnHome: boolean;
}

/* ------------------------------------------------------------------ */
/* Configurações do site                                               */
/* ------------------------------------------------------------------ */

export interface SiteSettings {
  signature: string;
  serviceAreaNote: string;
  commercialDisclaimer: string;
  brandDisclosure: string;
  specificationDisclaimer: string;
  financingDisclaimer: string;
}
