import type { PurchaseHorizon, RouteProfile, TruckFamilySlug } from "@/types";

export interface FamilySuggestion {
  slug: TruckFamilySlug;
  label: string;
  /** Por que essa família aparece — sempre baseado nas respostas dadas. */
  reasons: string[];
  /** Nível de confiança da indicação preliminar. */
  confidence: "baixa" | "média" | "alta";
}

const familyLabels: Record<TruckFamilySlug, string> = {
  delivery: "Delivery",
  constellation: "Constellation",
  meteor: "Meteor",
};

/** Extrai um peso aproximado em toneladas de um texto livre ("12t", "8 toneladas", "15000 kg"). */
export function parseApproximateTons(input: string): number | null {
  const normalized = input.toLowerCase().replace(/\./g, "").replace(",", ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;

  if (/kg|quilo/.test(normalized)) return value / 1000;
  return value;
}

/**
 * Indicação preliminar de família a partir das respostas do diagnóstico.
 *
 * Não substitui a análise do consultor: serve para o visitante entender
 * o raciocínio técnico enquanto preenche o roteiro.
 */
export function suggestFamily(input: {
  routeProfile: RouteProfile;
  approximateLoad: string;
  averageDistance: string;
  cargoType: string;
}): FamilySuggestion | null {
  const tons = parseApproximateTons(input.approximateLoad);
  const reasons: string[] = [];
  let score: Record<TruckFamilySlug, number> = { delivery: 0, constellation: 0, meteor: 0 };

  switch (input.routeProfile) {
    case "urbana":
      score.delivery += 3;
      reasons.push("Rota urbana pede manobrabilidade e cabine compacta.");
      break;
    case "regional":
      score.constellation += 3;
      score.delivery += 1;
      reasons.push("Rota regional combina volume de carga com deslocamento diário.");
      break;
    case "rodoviaria":
      score.meteor += 3;
      score.constellation += 2;
      reasons.push("Rota rodoviária exige conforto de cabine e desempenho em longa distância.");
      break;
    case "mista":
      score.constellation += 2;
      score.delivery += 1;
      score.meteor += 1;
      reasons.push("Perfil misto costuma pedir uma configuração intermediária.");
      break;
  }

  if (tons !== null) {
    if (tons <= 10) {
      score.delivery += 3;
      reasons.push(`Carga aproximada de ${tons}t se enquadra na faixa leve/semipesada.`);
    } else if (tons <= 25) {
      score.constellation += 3;
      reasons.push(`Carga aproximada de ${tons}t indica configuração semipesada/pesada.`);
    } else {
      score.meteor += 3;
      reasons.push(`Carga aproximada de ${tons}t indica cavalo mecânico pesado.`);
    }
  }

  const distance = parseApproximateTons(input.averageDistance);
  if (distance !== null && /km/i.test(input.averageDistance)) {
    if (distance >= 400) {
      score.meteor += 2;
      reasons.push("Distância média alta reforça a necessidade de cabine leito.");
    } else if (distance <= 80) {
      score.delivery += 1;
      reasons.push("Distâncias curtas favorecem ciclos urbanos de entrega.");
    }
  }

  if (/friorif|refriger|congel/i.test(input.cargoType)) {
    reasons.push("Carga refrigerada muda o cálculo de PBT por causa do implemento.");
  }
  if (/granel|areia|entulho|basculan/i.test(input.cargoType)) {
    score.constellation += 1;
    reasons.push("Carga a granel costuma exigir chassi reforçado e tração adequada.");
  }

  const entries = Object.entries(score) as [TruckFamilySlug, number][];
  const [best, bestScore] = entries.sort((a, b) => b[1] - a[1])[0];
  if (bestScore === 0) return null;

  const runnerUp = entries[1]?.[1] ?? 0;
  const gap = bestScore - runnerUp;

  return {
    slug: best,
    label: familyLabels[best],
    reasons: reasons.slice(0, 3),
    confidence: bestScore >= 5 && gap >= 2 ? "alta" : gap >= 1 ? "média" : "baixa",
  };
}

/** Peso relativo do prazo — usado apenas para ordenar o texto de retorno. */
export const horizonUrgency: Record<PurchaseHorizon, number> = {
  imediato: 3,
  ate_3_meses: 2,
  ate_6_meses: 1,
  estudando: 0,
};
