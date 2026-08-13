import { siteConfig } from "@/config/site";
import { technicalSheetFiles, technicalSheets } from "@/data/technical-sheets";
import type { SalesContact, SalesProposal, SalesWorkspace, StockVehicle } from "./types";

export type VehicleMatch = {
  vehicle: StockVehicle;
  score: number;
  reasons: string[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseMoney(value: string) {
  if (!/\d/.test(value)) return null;
  const parsed = Number(
    value
      .replace(/[^\d,.-]/g, "")
      .replaceAll(".", "")
      .replace(",", "."),
  );
  return Number.isFinite(parsed) ? parsed : null;
}

export function rankVehicleMatches(
  contact: SalesContact,
  inventory: StockVehicle[],
): VehicleMatch[] {
  const need = normalize(
    [contact.interest, contact.operation, contact.notes, contact.city].filter(Boolean).join(" "),
  );
  const needTokens = new Set(need.split(" ").filter((token) => token.length >= 3));
  const budget = parseMoney(contact.budget);

  return inventory
    .map((vehicle) => {
      const reasons: string[] = [];
      let score = 0;
      const vehicleText = normalize(
        [
          vehicle.family,
          vehicle.model,
          vehicle.traction,
          vehicle.application,
          vehicle.bodyType,
          vehicle.notes,
        ].join(" "),
      );

      const familyMentioned = normalize(contact.interest).includes(normalize(vehicle.family));
      if (familyMentioned) {
        score += 32;
        reasons.push(`Família ${vehicle.family} citada no interesse`);
      }

      const modelTokens = normalize(vehicle.model)
        .split(" ")
        .filter((token) => token.length >= 3);
      if (modelTokens.some((token) => needTokens.has(token))) {
        score += 24;
        reasons.push("Modelo compatível com a busca do cliente");
      }

      const overlap = [...needTokens].filter((token) => vehicleText.includes(token)).length;
      if (overlap) {
        score += Math.min(overlap * 6, 24);
        reasons.push(`${overlap} característica${overlap > 1 ? "s" : ""} em comum`);
      }

      if (vehicle.status === "disponivel") {
        score += 12;
        reasons.push("Unidade disponível");
      } else if (vehicle.status === "encomenda") {
        score += 4;
        reasons.push("Disponível sob encomenda");
      }

      const price = parseMoney(vehicle.price);
      if (budget && price && price <= budget) {
        score += 8;
        reasons.push("Dentro do orçamento informado");
      }

      if (contact.purchaseWindow === "imediato" && vehicle.status === "disponivel") score += 8;
      return { vehicle, score: Math.min(score, 100), reasons };
    })
    .filter((match) => match.score > 0 || inventory.length <= 5)
    .sort((a, b) => b.score - a.score || a.vehicle.model.localeCompare(b.vehicle.model));
}

export function technicalSheetHref(model: string) {
  const normalizedModel = normalize(model).replace(/^vw /, "");
  const sheet = technicalSheets.find((item) => {
    const candidate = normalize(item.model).replace(/^vw /, "");
    return candidate.includes(normalizedModel) || normalizedModel.includes(candidate);
  });
  return sheet
    ? `${technicalSheetFiles[sheet.family].href}#page=${sheet.page}`
    : "/fichas-tecnicas";
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvEscape).join(";"),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(";")),
  ].join("\r\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  type = "text/csv;charset=utf-8",
) {
  const blob = new Blob(["\uFEFF", content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportContacts(workspace: SalesWorkspace) {
  const rows = workspace.contacts.map((contact) => ({
    nome: contact.name,
    empresa: contact.company,
    whatsapp: contact.whatsapp,
    email: contact.email,
    cidade: contact.city,
    endereco: contact.address,
    interesse: contact.interest,
    operacao: contact.operation,
    orcamento: contact.budget,
    prazo_compra: contact.purchaseWindow,
    etapa: contact.stage,
    temperatura: contact.temperature,
    proxima_acao: contact.nextAction,
    data_retorno: contact.nextActionDate,
    observacoes: contact.notes,
  }));
  downloadTextFile(toCsv(rows), `clientes-belcar-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportInventory(workspace: SalesWorkspace) {
  const rows = workspace.inventory.map((vehicle) => ({
    familia: vehicle.family,
    modelo: vehicle.model,
    ano: vehicle.year,
    tracao: vehicle.traction,
    aplicacao: vehicle.application,
    implemento: vehicle.bodyType,
    cor: vehicle.color,
    quantidade: vehicle.quantity,
    status: vehicle.status,
    preco: vehicle.price,
    local: vehicle.location,
    disponibilidade: vehicle.availabilityDate,
    observacoes: vehicle.notes,
  }));
  downloadTextFile(toCsv(rows), `estoque-belcar-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportProposals(workspace: SalesWorkspace) {
  const rows = workspace.proposals.map((proposal) => ({
    cliente: workspace.contacts.find((contact) => contact.id === proposal.contactId)?.name ?? "",
    titulo: proposal.title,
    modelo: proposal.model,
    valor: proposal.value,
    status: proposal.status,
    validade: proposal.validUntil,
    condicoes: proposal.conditions,
    criada_em: proposal.createdAt,
    enviada_em: proposal.sentAt,
  }));
  downloadTextFile(toCsv(rows), `propostas-belcar-${new Date().toISOString().slice(0, 10)}.csv`);
}

function detectDelimiter(line: string) {
  const candidates = [";", ",", "\t"];
  return candidates.sort((a, b) => line.split(b).length - line.split(a).length)[0];
}

export function parseCsv(content: string) {
  const delimiter = detectDelimiter(content.split(/\r?\n/, 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const next = content[index + 1];
    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return [];

  const headers = rows[0].map((header) => normalize(header).replaceAll(" ", "_"));
  return rows
    .slice(1)
    .map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
    );
}

function field(row: Record<string, string>, aliases: string[]) {
  const key = aliases.find((alias) => row[alias] !== undefined);
  return key ? row[key].trim() : "";
}

export function importContactsFromCsv(content: string, existing: SalesContact[]) {
  const rows = parseCsv(content);
  const fingerprints = new Set(
    existing.map((contact) =>
      normalize(
        contact.whatsapp.replace(/\D/g, "") ||
          contact.email ||
          `${contact.name}-${contact.company}`,
      ),
    ),
  );
  const now = new Date().toISOString();
  const imported: SalesContact[] = [];
  let duplicates = 0;

  rows.forEach((row) => {
    const name = field(row, ["nome", "name", "cliente"]);
    if (!name) return;
    const company = field(row, ["empresa", "company", "company_name"]);
    const whatsapp = field(row, ["whatsapp", "telefone", "phone", "celular"]);
    const email = field(row, ["email", "e_mail"]);
    const fingerprint = normalize(whatsapp.replace(/\D/g, "") || email || `${name}-${company}`);
    if (fingerprints.has(fingerprint)) {
      duplicates += 1;
      return;
    }
    fingerprints.add(fingerprint);
    imported.push({
      id: crypto.randomUUID(),
      name,
      company,
      whatsapp,
      email,
      city: field(row, ["cidade", "city", "cidade_uf"]),
      address: field(row, ["endereco", "address"]),
      interest: field(row, ["interesse", "interest", "caminhao", "modelo"]),
      operation: field(row, ["operacao", "operation", "aplicacao"]),
      budget: field(row, ["orcamento", "budget", "valor"]),
      purchaseWindow: "indefinido",
      stage: "novo",
      nextAction: "Fazer primeiro contato",
      nextActionDate: "",
      source: "outro",
      temperature: "morno",
      lastContactAt: "",
      lossReason: "",
      winReason: "",
      notes: field(row, ["observacoes", "notes", "anotacoes"]),
      sourceSystem: "",
      externalKey: "",
      segment: "nao_identificado",
      portfolioCategory: "manual",
      priority: "media",
      personType: "nao_informado",
      documentMasked: "",
      eventCount: 0,
      eventIds: [],
      phones: [],
      needsRequalification: false,
      createdAt: now,
      updatedAt: now,
    });
  });
  return { imported, duplicates, total: rows.length };
}

export function importInventoryFromCsv(content: string, existing: StockVehicle[]) {
  const rows = parseCsv(content);
  const fingerprints = new Set(
    existing.map((vehicle) =>
      normalize(`${vehicle.family}-${vehicle.model}-${vehicle.year}-${vehicle.color}`),
    ),
  );
  const imported: StockVehicle[] = [];
  let duplicates = 0;

  rows.forEach((row) => {
    const model = field(row, ["modelo", "model", "caminhao"]);
    if (!model) return;
    const familyValue = field(row, ["familia", "family"]);
    const family: StockVehicle["family"] =
      (["Delivery", "Constellation", "Meteor"].find(
        (item) => normalize(item) === normalize(familyValue),
      ) as StockVehicle["family"] | undefined) ?? "Outro";
    const year = field(row, ["ano", "year", "ano_modelo"]);
    const color = field(row, ["cor", "color"]);
    const fingerprint = normalize(`${family}-${model}-${year}-${color}`);
    if (fingerprints.has(fingerprint)) {
      duplicates += 1;
      return;
    }
    fingerprints.add(fingerprint);
    imported.push({
      id: crypto.randomUUID(),
      family,
      model,
      year,
      status: "disponivel",
      price: field(row, ["preco", "price", "valor"]),
      location: field(row, ["local", "location", "filial"]),
      traction: field(row, ["tracao", "traction"]),
      application: field(row, ["aplicacao", "application", "operacao"]),
      bodyType: field(row, ["implemento", "carroceria", "body_type"]),
      color,
      quantity: Number(field(row, ["quantidade", "quantity", "qtd"])) || 1,
      availabilityDate: field(row, ["disponibilidade", "availability", "data"]),
      source: "importado",
      notes: field(row, ["observacoes", "notes"]),
      updatedAt: new Date().toISOString(),
    });
  });
  return { imported, duplicates, total: rows.length };
}

function htmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function openProposalDocument(
  proposal: SalesProposal,
  contact: SalesContact,
  vehicle?: StockVehicle,
) {
  const created = new Intl.DateTimeFormat("pt-BR").format(new Date(proposal.createdAt));
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${htmlEscape(proposal.title)}</title><style>
body{font-family:Arial,sans-serif;color:#071a2f;margin:0;background:#eef2f6}main{max-width:820px;margin:24px auto;background:white;padding:52px;box-shadow:0 16px 60px #071a2f22}.top{border-bottom:5px solid #e6332a;padding-bottom:22px}.eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0a3d7b;font-weight:700}h1{font-size:32px;margin:10px 0 0}h2{font-size:18px;margin-top:34px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.box{border:1px solid #dce2e8;border-radius:8px;padding:16px}.label{font-size:11px;color:#617083;text-transform:uppercase}.value{font-size:16px;font-weight:700;margin-top:6px}.notes{white-space:pre-wrap;line-height:1.6}.legal{margin-top:42px;border-top:1px solid #dce2e8;padding-top:18px;font-size:10px;line-height:1.55;color:#617083}@media print{body{background:white}main{margin:0;box-shadow:none;max-width:none}.actions{display:none}}@media(max-width:640px){main{margin:0;padding:28px}.grid{grid-template-columns:1fr}}
</style></head><body><main><div class="top"><div class="eyebrow">Belcar Caminhões · Atendimento comercial</div><h1>${htmlEscape(proposal.title)}</h1><p>Proposta preparada por Christiano Tadeu em ${created}.</p></div>
<h2>Cliente</h2><div class="grid"><div class="box"><div class="label">Nome / empresa</div><div class="value">${htmlEscape([contact.name, contact.company].filter(Boolean).join(" · "))}</div></div><div class="box"><div class="label">Contato</div><div class="value">${htmlEscape(contact.whatsapp || contact.email || "Não informado")}</div></div></div>
<h2>Veículo e condição</h2><div class="grid"><div class="box"><div class="label">Modelo</div><div class="value">${htmlEscape(proposal.model || vehicle?.model || "A confirmar")}</div></div><div class="box"><div class="label">Valor de referência</div><div class="value">${htmlEscape(proposal.value || "Sob consulta")}</div></div><div class="box"><div class="label">Validade</div><div class="value">${htmlEscape(proposal.validUntil || "Confirmar no atendimento")}</div></div><div class="box"><div class="label">Disponibilidade</div><div class="value">${htmlEscape(vehicle?.status || "Confirmar na Belcar")}</div></div></div>
<h2>Condições e observações</h2><p class="notes">${htmlEscape([proposal.conditions, proposal.notes].filter(Boolean).join("\n\n") || "Condições finais serão formalizadas pela Belcar Caminhões.")}</p>
<div class="legal">${htmlEscape(siteConfig.dealershipDisclosure)}<br><br>${htmlEscape(siteConfig.commercialDisclaimer)}<br><br>${htmlEscape(siteConfig.employer.legalName)} · CNPJ ${htmlEscape(siteConfig.employer.cnpj)} · ${htmlEscape(siteConfig.phone)} · ${htmlEscape(siteConfig.email)}</div>
<p class="actions"><button onclick="window.print()">Imprimir ou salvar como PDF</button></p></main></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
}

export function proposalWhatsAppUrl(proposal: SalesProposal, contact: SalesContact) {
  const digits = contact.whatsapp.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá, ${contact.name}. Aqui é o Christiano, da Belcar Caminhões. Preparei a proposta de ${proposal.model || proposal.title}${proposal.value ? ` no valor de referência de ${proposal.value}` : ""}. Posso confirmar os detalhes com você?`,
  );
  return `https://wa.me/${digits}?text=${message}`;
}

export function proposalGmailUrl(proposal: SalesProposal, contact: SalesContact) {
  const subject = encodeURIComponent(
    `Proposta Belcar Caminhões | ${proposal.model || proposal.title}`,
  );
  const body = encodeURIComponent(
    `Olá, ${contact.name}.\n\nPreparei a proposta de ${proposal.model || proposal.title}. ${proposal.value ? `Valor de referência: ${proposal.value}.` : ""}\n\nAs condições finais, disponibilidade e faturamento serão confirmados na proposta oficial da Belcar Caminhões.\n\nChristiano Tadeu\nConsultor de vendas | Belcar Caminhões\n${siteConfig.phone}`,
  );
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}&su=${subject}&body=${body}`;
}
