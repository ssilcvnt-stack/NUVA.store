/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

// Custom generated images
export const IMAGES = {
  hero: "https://i.imgur.com/AZbkPdE.png",
  heroImages: [
    "https://i.imgur.com/AZbkPdE.png",
    "https://i.imgur.com/ups420Q.jpg",
    "https://i.imgur.com/P7OiRJX.jpg",
    "https://i.imgur.com/7ruNhel.jpg"
  ],
  white: "/src/assets/images/nuva_white_t_1781200593520.jpg",
  black: "/src/assets/images/nuva_black_t_1781200608814.jpg",
  navy: "https://i.imgur.com/nsnXJ8P.jpg",
  beige: "/src/assets/images/nuva_beige_t_1781200658483.jpg",
};

export const PRODUCTS: Product[] = [
  {
    id: "nuva-essential-tee",
    name: "T-Shirt NUVA Essential",
    tagline: "O Essencial Nunca Sai de Moda • 220 GSM",
    price: 39000,
    description: "A nossa t-shirt essencial combina materiais premium, construção impecável e caimento perfeito. Simples na aparência, superior em tudo o que importa. Ref: 42331377036.",
    details: [
      "Algodão Premium: 100% algodão penteado de alta qualidade para máximo conforto e durabilidade.",
      "Gramagem Ideal: 220gsm - o equilíbrio perfeito entre leveza, estrutura e resistência.",
      "Caimento Perfeito: Modelagem regular com ombro alinhado e caimento moderno e atemporal.",
      "Acabamentos Reforçados: Gola canelada encorpada, costuras duplas e reforço nos ombros para maior durabilidade.",
      "Toque Superior: Tecido macio, respirável e pré-encolhido para manter o tamanho e o conforto após múltiplas lavagens."
    ],
    fabricInfo: {
      composition: "100% Algodão Penteado (Fio 30/1)",
      weight: "220 GSM (Malha Jersey Premium)",
      texture: "Tecido Macio, Respirável e Pré-encolhido",
      origin: "Produzido em Portugal (Guimarães)"
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    defaultColorId: "navy",
    colors: [
      {
        id: "navy",
        name: "Azul-Marinho (Navy)",
        hex: "#1D2331",
        image: "https://i.imgur.com/nsnXJ8P.jpg",
        images: [
          "https://i.imgur.com/nsnXJ8P.jpg",
          "https://i.imgur.com/sinO3Mg.jpg",
          "https://i.imgur.com/sXPmK1c.jpg"
        ]
      },
      {
        id: "white",
        name: "Branco Puro (White)",
        hex: "#FFFFFF",
        image: "https://i.imgur.com/OyqBECh.png",
        images: [
          "https://i.imgur.com/OyqBECh.png",
          "https://i.imgur.com/5MoRjuB.png"
        ],
        priceOverride: 41560,
        isPreOrder: true
      },
      {
        id: "lightblue",
        name: "Azul Sky",
        hex: "#5DBBEE",
        image: "https://i.imgur.com/nR1IAzR.png",
        images: [
          "https://i.imgur.com/nR1IAzR.png",
          "https://i.imgur.com/GIB6V9P.png",
          "https://i.imgur.com/Fo6Bvl8.png"
        ]
      }
    ]
  }
];

export const BRAND_VALUES = [
  {
    id: "intention",
    title: "Intenção",
    description: "Cada detalhe existe por uma razão. Nada é aleatório; desde as milimétricas costuras ocultas até o posicionamento da gola."
  },
  {
    id: "quality",
    title: "Qualidade",
    description: "Tecidos premium de algodão orgânico e acabamento impecável. Desenvolvemos peças pensadas para envelhecer com dignidade e resistir ao tempo."
  },
  {
    id: "simplicity",
    title: "Simplicidade",
    description: "Opção sofisticada. Eliminamos o excesso, os logótipos chamativos e as distrações estéticas para centrar a atenção no essencial: o caimento perfeito."
  },
  {
    id: "authenticity",
    title: "Autenticidade",
    description: "Garantimos valor real ao consumidor. Ocupamos o espaço premium honesto entre a moda descartável e marcas de luxo tradicionais."
  }
];

export const SIZE_TABLE = [
  { size: "XS", chest: "48cm", length: "68cm", sleeve: "20cm", height: "1.55m - 1.64m" },
  { size: "S", chest: "50cm", length: "70cm", sleeve: "21cm", height: "1.65m - 1.73m" },
  { size: "M", chest: "52cm", length: "72cm", sleeve: "22cm", height: "1.74m - 1.80m" },
  { size: "L", chest: "54cm", length: "74cm", sleeve: "23cm", height: "1.81m - 1.87m" },
  { size: "XL", chest: "56cm", length: "76cm", sleeve: "24cm", height: "1.88m - 1.94m" },
];

export function formatPrice(value: number): string {
  const intVal = Math.round(value);
  const formatted = intVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted} Kz`;
}

