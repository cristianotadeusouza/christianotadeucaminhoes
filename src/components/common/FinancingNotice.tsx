import { CommercialDisclaimer } from "@/components/common/CommercialDisclaimer";
import { siteSettings } from "@/data/site-settings";

/** FinancingNotice — aviso padrão de financiamento (sem promessa de aprovação). */
export function FinancingNotice({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <CommercialDisclaimer tone={tone}>{siteSettings.financingDisclaimer}</CommercialDisclaimer>
  );
}
