import type { SalesContact } from "./types";

export const portfolioCategoryLabels: Record<SalesContact["portfolioCategory"], string> = {
  manual: "Cadastro atual",
  atendimento_em_andamento: "Em atendimento",
  retomar_com_prioridade: "Retomar primeiro",
  reativar_carteira: "Reativar carteira",
  higienizar_dados: "Higienizar dados",
  pos_venda: "Pós-venda",
  arquivado_historico: "Histórico arquivado",
};

export const segmentLabels: Record<string, string> = {
  nao_identificado: "Segmento a confirmar",
  transporte_logistica: "Transporte e logística",
  alimentos_distribuicao: "Alimentos e distribuição",
  construcao: "Construção",
  agronegocio: "Agronegócio",
  automotivo: "Automotivo",
  eventos: "Eventos",
  setor_publico: "Setor público",
};
