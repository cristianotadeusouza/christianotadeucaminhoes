export type TechnicalSheetFamily = "Delivery" | "Constellation" | "Meteor";

export type TechnicalSheet = {
  model: string;
  family: TechnicalSheetFamily;
  traction: string;
  page: number;
};

export const technicalSheetFiles: Record<
  TechnicalSheetFamily,
  { href: string; pages: number; description: string }
> = {
  Delivery: {
    href: "/fichas/fichas-tecnicas-delivery.pdf",
    pages: 18,
    description: "Delivery, e-Delivery e Delivery Express",
  },
  Constellation: {
    href: "/fichas/fichas-tecnicas-constellation.pdf",
    pages: 26,
    description: "Modelos rodoviários, urbanos e vocacionais",
  },
  Meteor: {
    href: "/fichas/fichas-tecnicas-meteor.pdf",
    pages: 4,
    description: "Meteor 28.480 e 29.530",
  },
};

export const technicalSheets: TechnicalSheet[] = [
  { family: "Delivery", model: "VW Delivery 14.180", traction: "6x2", page: 1 },
  { family: "Delivery", model: "VW e-Delivery 14", traction: "Elétrico", page: 3 },
  { family: "Delivery", model: "VW Delivery 11.180", traction: "4x4", page: 5 },
  { family: "Delivery", model: "VW Delivery 11.180", traction: "4x2", page: 7 },
  { family: "Delivery", model: "VW e-Delivery 11", traction: "Elétrico", page: 9 },
  { family: "Delivery", model: "VW Delivery 9.180", traction: "4x2", page: 11 },
  { family: "Delivery", model: "VW Delivery 6.170", traction: "4x2", page: 13 },
  { family: "Delivery", model: "VW Delivery Express", traction: "4x2", page: 15 },
  { family: "Constellation", model: "VW Constellation 20.480", traction: "4x2", page: 1 },
  { family: "Constellation", model: "VW Constellation 33.480", traction: "6x4", page: 3 },
  { family: "Constellation", model: "VW Constellation 18.320", traction: "4x2", page: 5 },
  { family: "Constellation", model: "VW Constellation 18.260", traction: "4x2", page: 7 },
  { family: "Constellation", model: "VW Constellation 18.210", traction: "4x2", page: 9 },
  { family: "Constellation", model: "VW Constellation 17.210", traction: "4x2", page: 11 },
  { family: "Constellation", model: "VW Constellation 14.210", traction: "4x2", page: 13 },
  { family: "Constellation", model: "VW Constellation 32.380", traction: "6x4", page: 15 },
  { family: "Constellation", model: "VW Constellation 31.320", traction: "6x4", page: 17 },
  { family: "Constellation", model: "VW Constellation 30.320", traction: "8x2", page: 19 },
  { family: "Constellation", model: "VW Constellation 27.260", traction: "6x4", page: 21 },
  { family: "Constellation", model: "VW Constellation 26.320", traction: "6x2", page: 23 },
  { family: "Constellation", model: "VW Constellation 26.260", traction: "6x2", page: 25 },
  { family: "Meteor", model: "VW Meteor 29.530", traction: "6x4", page: 1 },
  { family: "Meteor", model: "VW Meteor 28.480", traction: "6x2", page: 3 },
];

export type TruckPaint = {
  name: string;
  code: string;
  finish: "Sólida" | "Metálica" | "Perolizada";
  /** Aproximação digital individual, conferida na tabela recebida. */
  sample: `#${string}`;
};

export const truckPaints: TruckPaint[] = [
  { name: "Amarelo Bem-Te-Vi", code: "2633", finish: "Sólida", sample: "#d9b400" },
  { name: "Azul Ambev", code: "2322", finish: "Sólida", sample: "#1b2b39" },
  { name: "Azul Biscay", code: "7Q7Q", finish: "Metálica", sample: "#6370a6" },
  { name: "Azul Ibiza", code: "2327", finish: "Sólida", sample: "#435384" },
  { name: "Azul Norway", code: "5T5T", finish: "Metálica", sample: "#6977a6" },
  { name: "Azul Noturno", code: "2351", finish: "Sólida", sample: "#1e2933" },
  { name: "Azul Paragas", code: "2316", finish: "Sólida", sample: "#243844" },
  { name: "Azul Pepsi", code: "2317", finish: "Sólida", sample: "#1d2b70" },
  { name: "Azul Safira", code: "4X4X", finish: "Metálica", sample: "#2045a7" },
  { name: "Azul Unique", code: "5D5D", finish: "Perolizada", sample: "#2e2d80" },
  { name: "Bege Ágata", code: "K0K0", finish: "Metálica", sample: "#786a47" },
  { name: "Bege Júpiter", code: "7K7K", finish: "Metálica", sample: "#d7d094" },
  { name: "Branco Albino", code: "2810", finish: "Sólida", sample: "#f4f3f0" },
  { name: "Branco Geada", code: "3B3B", finish: "Sólida", sample: "#dedfd9" },
  { name: "Bronze Namíbia", code: "9N9N", finish: "Metálica", sample: "#5c2a22" },
  { name: "Cinza Cosmos", code: "4F4F", finish: "Metálica", sample: "#332b2b" },
  { name: "Cinza Moonstone", code: "C2C2", finish: "Sólida", sample: "#c4c8db" },
  { name: "Laranja Energetic", code: "4M4M", finish: "Metálica", sample: "#ee9d98" },
  { name: "Laranja Nepal", code: "2704", finish: "Sólida", sample: "#d54713" },
  { name: "Laranja Premium (Molten Lava)", code: "K3K3", finish: "Metálica", sample: "#f26a17" },
  { name: "Prata Imperial", code: "3E3E", finish: "Metálica", sample: "#a69ec1" },
  { name: "Prata Pyrit", code: "K2K2", finish: "Metálica", sample: "#bdb6c7" },
  { name: "Prata Tungsten", code: "K5K5", finish: "Metálica", sample: "#d0cad2" },
  { name: "Preto Universal", code: "A1A1", finish: "Metálica", sample: "#161a1d" },
  { name: "Verde Ecovias", code: "2872", finish: "Sólida", sample: "#70875a" },
  { name: "Verde Menta", code: "2870", finish: "Sólida", sample: "#b6c3ae" },
  { name: "Verde Oceano", code: "2U2U", finish: "Metálica", sample: "#51b075" },
  { name: "Verde Primavera", code: "I4I4", finish: "Metálica", sample: "#36a75b" },
  { name: "Verde Turquesa", code: "E5E5", finish: "Metálica", sample: "#52c5b5" },
  { name: "Vermelho Daytona", code: "2545", finish: "Sólida", sample: "#d32620" },
  { name: "Vermelho FEMSA", code: "0S0S", finish: "Sólida", sample: "#e0261f" },
  { name: "Vermelho Nobre", code: "2517", finish: "Sólida", sample: "#7e2223" },
  { name: "Vermelho Pétrus", code: "2767", finish: "Metálica", sample: "#c0686b" },
  { name: "Vermelho Rubi", code: "A0A0", finish: "Metálica", sample: "#b54c34" },
];
