/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, Download, AlertCircle, ShoppingBag, Truck, Printer } from "lucide-react";
import { Order } from "../types";
import { formatPrice } from "../data";

interface OrderSuccessProps {
  order: Order;
  onContinueShopping: () => void;
  onTrackOrder: (trackingNo: string) => void;
}

export function OrderSuccessState({
  order,
  onContinueShopping,
  onTrackOrder
}: OrderSuccessProps) {
  
  const downloadReceipt = async () => {
    try {
      window.print();
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro ao gerar o documento.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 text-center space-y-8 animate-scale-up" id="order-success-screen">
      {/* Visual Success Indicator Check */}
      <div className="flex flex-col items-center space-y-4">
        <div className="h-14 w-14 bg-black text-white flex items-center justify-center rounded-full">
          <Check className="h-6 w-6 text-white stroke-[2]" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
            sucesso
          </span>
          <h2 className="text-2xl font-light text-neutral-900 tracking-normal capitalize">
            obrigado pelo seu apoio – nuva
          </h2>
          <p className="font-sans font-light italic text-[11px] text-neutral-500 max-w-md mx-auto">
            "Acreditamos que o verdadeiro luxo reside na intenção de possuir menos coisas, porém com integridade superior."
          </p>
        </div>
      </div>

      {/* Primary specs box */}
      <div className="bg-white border border-neutral-200 p-6 md:p-8 text-left space-y-6">
        <div className="flex justify-between items-baseline border-b border-neutral-200 pb-3">
          <span className="font-mono text-[9px] text-neutral-400 font-semibold tracking-wider">ENCOMENDA Nº</span>
          <span className="font-mono text-sm font-bold text-black">{order.id}</span>
        </div>

        {/* Live dynamic eta estimation */}
        <div className="flex gap-4 items-start text-xs text-neutral-600">
          <Truck className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5 stroke-[1.5]" />
          <div>
            <span className="font-mono text-[10px] uppercase font-semibold text-black tracking-wider block">
              Previsão de Entrega Dedicada
            </span>
            <span className="text-[11px] text-neutral-500 leading-relaxed block mt-1">
              As suas peças básicas serão encaminhadas do nosso atelier de Guimarães (Portugal) e distribuídas com serviço expresso prioritário em {order.customerInfo.city} (Angola). Receberá notificações SMS para o número {order.customerInfo.phone}.
            </span>
          </div>
        </div>

        {/* Order items mini lists */}
        <div className="space-y-3">
          <h4 className="font-mono text-[9px] uppercase tracking-wider font-semibold text-neutral-400">
            Artigos Adquiridos
          </h4>
          <div className="divide-y divide-neutral-200 font-mono text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between">
                <div>
                  <span className="font-sans font-medium text-neutral-900">{item.product.name}</span>
                  <p className="text-[10px] text-neutral-400">
                    Tamanho {item.selectedSize} — Cor {item.selectedColor.name} | Qtd: {item.quantity}
                  </p>
                </div>
                <span>{formatPrice((item.selectedColor.priceOverride || item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Costing values list */}
        <div className="pt-4 border-t border-dashed border-neutral-200 space-y-2 text-xs font-mono text-neutral-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Portes de Envio</span>
            <span>{order.shipping === 0 ? "GRÁTIS" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-black font-semibold text-sm pt-2 border-t border-neutral-200">
            <span>Total Investido</span>
            <span className="text-black">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Button workflows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={downloadReceipt}
          className="bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-mono text-[10px] uppercase tracking-widest py-3 px-4 transition-all flex items-center justify-center gap-2"
          id="download-receipt-btn"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Baixar Recibo Digital (.pdf)</span>
        </button>

        <button
          type="button"
          onClick={() => onTrackOrder(order.trackingNumber)}
          className="bg-black hover:bg-neutral-800 text-white font-mono text-[10px] uppercase tracking-widest py-3 px-4 transition-all flex items-center justify-center gap-2 cursor-pointer"
          id="track-on-success-btn"
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Rastrear Localização ({order.trackingNumber})</span>
        </button>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onContinueShopping}
          className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-black underline transition-colors"
          id="success-back-home-btn"
        >
          Ver Mais Básicos de Alfaiataria
        </button>
      </div>
    </div>
  );
}
