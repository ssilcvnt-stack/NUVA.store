/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductColor {
  name: string;      // e.g. "Branco Puro"
  hex: string;       // e.g. "#FFFFFF"
  image: string;     // URL or generated path
  id: string;        // e.g. "white"
  images?: string[]; // Optional sub-images/views for this color
  priceOverride?: number; // Added: custom price for this color variant
  isPreOrder?: boolean;   // Added: represents if the item is backordered/pre-order
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  description: string;
  details: string[];
  fabricInfo: {
    composition: string;
    weight: string;      // e.g. "240 GSM (Heavyweight)"
    texture: string;     // e.g. "Toque Encorpado & Macio"
    origin: string;      // e.g. "Produzido em Portugal"
  };
  sizes: string[];       // e.g. ["S", "M", "L", "XL"]
  colors: ProductColor[];
  defaultColorId: string;
}

export interface CartItem {
  id: string;           // unique cart item ID: product_id + color_id + size
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: "vanqir" | "transfer" | "cash";
  mbwayPhone?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: string;
  status: "pending" | "paid" | "shipped" | "delivered";
  trackingNumber: string;
}
