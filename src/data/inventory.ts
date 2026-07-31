import type { InventoryItem } from "@/types";

/**
 * Estoque publicado.
 *
 * Nenhum item demonstrativo é exposto ao visitante: enquanto não houver
 * veículos reais confirmados (modelo, condição e disponibilidade), a lista
 * permanece vazia e a página exibe um estado vazio explicando que o estoque
 * é confirmado no atendimento.
 *
 * A arquitetura e os tipos seguem prontos: para publicar, basta inserir
 * itens reais aqui (ou trocar pela fonte Supabase em `repositories.ts`).
 */
export const inventoryItems: InventoryItem[] = [];

/** `null` enquanto não houver item real publicado — nunca inventar uma data. */
export const inventoryUpdatedAt: string | null = inventoryItems.reduce<string | null>(
  (latest, item) => (latest === null || item.updatedAt > latest ? item.updatedAt : latest),
  null,
);
