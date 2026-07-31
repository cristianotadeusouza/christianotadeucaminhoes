/**
 * Camada de acesso a dados.
 *
 * A interface pública NUNCA importa arquivos de `src/data` diretamente.
 * Ela consome os repositórios abaixo. Para migrar ao Supabase, basta trocar
 * a implementação interna de cada função (ver docs/SUPABASE-MIGRATION.md),
 * mantendo as assinaturas assíncronas.
 */
import { truckFamilies, getTruckFamily } from "@/data/truck-families";
import { operationCategories, getOperation, homeOperations } from "@/data/operations";
import { inventoryItems, inventoryUpdatedAt } from "@/data/inventory";
import { publishedCaseStudies, publishedTestimonials } from "@/data/case-studies";
import { publishedPosts, getPost } from "@/data/content-posts";
import { siteSettings } from "@/data/site-settings";
import type {
  CaseStudy,
  ContentPost,
  InventoryItem,
  Lead,
  OperationCategory,
  SiteSettings,
  Testimonial,
  TruckFamily,
} from "@/types";

export interface InventoryFilters {
  family?: string;
  application?: string;
  condition?: string;
  status?: string;
  search?: string;
}

export const truckFamilyRepository = {
  async list(): Promise<TruckFamily[]> {
    return truckFamilies;
  },
  async getBySlug(slug: string): Promise<TruckFamily | null> {
    return getTruckFamily(slug) ?? null;
  },
};

export const operationRepository = {
  async list(): Promise<OperationCategory[]> {
    return operationCategories;
  },
  async listFeatured(): Promise<OperationCategory[]> {
    return homeOperations;
  },
  async getBySlug(slug: string): Promise<OperationCategory | null> {
    return getOperation(slug) ?? null;
  },
};

export const inventoryRepository = {
  async list(filters: InventoryFilters = {}): Promise<InventoryItem[]> {
    const term = filters.search?.trim().toLowerCase() ?? "";
    return inventoryItems.filter((item) => {
      if (filters.family && filters.family !== "todos" && item.familySlug !== filters.family)
        return false;
      if (
        filters.application &&
        filters.application !== "todos" &&
        item.application !== filters.application
      )
        return false;
      if (
        filters.condition &&
        filters.condition !== "todos" &&
        item.condition !== filters.condition
      )
        return false;
      if (filters.status && filters.status !== "todos" && item.status !== filters.status)
        return false;
      if (term) {
        const haystack = [item.model, item.version, item.configuration, item.application]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  },
  async getById(id: string): Promise<InventoryItem | null> {
    return inventoryItems.find((item) => item.id === id) ?? null;
  },
  /** `null` quando não há item real publicado. */
  async lastUpdatedAt(): Promise<string | null> {
    return inventoryUpdatedAt;
  },
};

export const caseStudyRepository = {
  async listPublished(): Promise<CaseStudy[]> {
    return publishedCaseStudies;
  },
  async listTestimonials(): Promise<Testimonial[]> {
    return publishedTestimonials;
  },
};

export const contentRepository = {
  async list(): Promise<ContentPost[]> {
    return [...publishedPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  async getBySlug(slug: string): Promise<ContentPost | null> {
    return getPost(slug) ?? null;
  },
};

export const settingsRepository = {
  async get(): Promise<SiteSettings> {
    return siteSettings;
  },
};

/**
 * Repositório de leads.
 *
 * Nesta versão o lead NÃO é persistido: os dados são apenas formatados e
 * enviados ao WhatsApp pelo próprio visitante. Quando o Supabase for
 * conectado, `create` deve inserir na tabela `leads` ANTES de abrir o
 * WhatsApp, mantendo a mesma assinatura.
 */
export const leadRepository = {
  async create(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<{ ok: boolean }> {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[leadRepository] lead capturado (sem persistência nesta versão)", lead.source);
    }
    return { ok: true };
  },
};
