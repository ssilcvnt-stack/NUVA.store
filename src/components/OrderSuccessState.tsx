/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, Download, AlertCircle, ShoppingBag, Truck, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
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
  
  const isVanqir = order.customerInfo.paymentMethod === "vanqir_mcx" || order.customerInfo.paymentMethod === "vanqir_ref";
  const iframeLinks: Record<string, string> = {
    navy: "https://pay.vanqir.com/checkout/6972a1fd-12bb-4ebf-b7ab-751bc367a666",
    white: "https://pay.vanqir.com/checkout/3c3a5dcd-3ada-4377-9e40-d96fefe04547",
    lightblue: "https://pay.vanqir.com/checkout/84d1ba1e-4b07-4bc4-9adb-69a88325adf2"
  };
  
  let mcxLink = "";
  if (isVanqir) {
    const firstCartItem = order.items[0];
    const colorId = firstCartItem?.selectedColor.id || "navy";
    const baseLink = iframeLinks[colorId] || iframeLinks.navy;
    try {
      const checkoutUrl = new URL(baseLink);
      checkoutUrl.searchParams.set('email', order.customerInfo.email);
      checkoutUrl.searchParams.set('name', `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.trim());
      checkoutUrl.searchParams.set('phone', order.customerInfo.phone);
      mcxLink = checkoutUrl.toString();
    } catch (e) {
      mcxLink = baseLink;
    }
  }

  const downloadReceipt = () => {
    const doc = new jsPDF();
    
    // Configurações de layout
    const margin = 20;
    let currentY = 20;
    
    // Helper function for adding left & right text on the same line
    const addRow = (label: string, value: string, yPos: number, isBold: boolean = false) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(isBold ? 11 : 10);
      doc.text(label, margin, yPos);
      const valueWidth = doc.getTextWidth(value);
      doc.text(value, doc.internal.pageSize.width - margin - valueWidth, yPos);
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NUVA", margin, currentY);
    currentY += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Less. Better.", margin, currentY);
    currentY += 15;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, doc.internal.pageSize.width - margin, currentY);
    currentY += 15;

    // Resumo do recibo
    doc.setTextColor(0, 0, 0);
    addRow("RECIBO:", order.id, currentY, true);
    currentY += 7;
    addRow("DATA:", order.createdAt, currentY);
    currentY += 7;
    let paymentMethodLabel = "TRANSFERÊNCIA BANCÁRIA";
    if (order.customerInfo.paymentMethod === "vanqir_mcx") paymentMethodLabel = "MCX EXPRESS";
    if (order.customerInfo.paymentMethod === "vanqir_ref") paymentMethodLabel = "REFERÊNCIA";
    if (order.customerInfo.paymentMethod === "delivery") paymentMethodLabel = "PAGAMENTO NA ENTREGA";

    addRow("PAGAMENTO:", paymentMethodLabel, currentY);
    currentY += 7;
    addRow("LOGÍSTICA:", order.trackingNumber, currentY);
    currentY += 15;

    // Line separator
    doc.line(margin, currentY, doc.internal.pageSize.width - margin, currentY);
    currentY += 15;

    // Informação do cliente
    doc.setFont("helvetica", "bold");
    doc.text("INFORMAÇÕES DO CLIENTE", margin, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Nome: ${order.customerInfo.firstName} ${order.customerInfo.lastName}`, margin, currentY);
    currentY += 6;
    doc.text(`Email: ${order.customerInfo.email}`, margin, currentY);
    currentY += 6;
    doc.text(`Telefone: ${order.customerInfo.phone}`, margin, currentY);
    currentY += 6;
    doc.text(`Morada: ${order.customerInfo.address}, ${order.customerInfo.city}, ${order.customerInfo.country}`, margin, currentY);
    currentY += 15;

    // Line separator
    doc.line(margin, currentY, doc.internal.pageSize.width - margin, currentY);
    currentY += 15;

    // Items Header
    doc.setFont("helvetica", "bold");
    doc.text("ARTIGOS ADQUIRIDOS", margin, currentY);
    currentY += 10;
    
    // Items
    doc.setFont("helvetica", "normal");
    order.items.forEach((item) => {
      const itemPrice = item.selectedColor.priceOverride || item.product.price;
      const itemName = `${item.quantity}x ${item.product.name}`;
      const itemOptions = `(Cor: ${item.selectedColor.name} | Tam: ${item.selectedSize})`;
      const itemTotal = formatPrice(itemPrice * item.quantity);
      
      doc.text(itemName, margin, currentY);
      doc.text(itemTotal, doc.internal.pageSize.width - margin - doc.getTextWidth(itemTotal), currentY);
      currentY += 6;
      doc.setTextColor(100, 100, 100);
      doc.text(itemOptions, margin + 5, currentY);
      doc.setTextColor(0, 0, 0);
      currentY += 8;
    });

    currentY += 5;
    // Line separator
    doc.line(margin, currentY, doc.internal.pageSize.width - margin, currentY);
    currentY += 15;

    // Valores financeiros
    addRow("Subtotal:", formatPrice(order.subtotal), currentY);
    currentY += 7;
    addRow("Portes de Envio:", order.shipping === 0 ? "GRATUITO" : formatPrice(order.shipping), currentY);
    currentY += 7;
    addRow("Impostos Locais:", formatPrice(order.tax), currentY);
    currentY += 10;
    
    // Total Line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    addRow("TOTAL INVESTIDO:", formatPrice(order.total), currentY, true);
    currentY += 15;

    // Footer
    currentY += 10;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const footerText = "O essencial nunca sai de moda. Obrigado por apoiar a produção consciente.";
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (doc.internal.pageSize.width - footerWidth) / 2, currentY);

    currentY += 10;
    doc.setFont("helvetica", "normal");
    const contactText = "Apoio ao Cliente: nuva2026@proton.me  |  +244 941429171";
    const contactWidth = doc.getTextWidth(contactText);
    doc.text(contactText, (doc.internal.pageSize.width - contactWidth) / 2, currentY);

    currentY += 6;
    const socialText = "IG: @brancodiamante.joalheria  |  FB: /nuva.sho";
    const socialWidth = doc.getTextWidth(socialText);
    doc.text(socialText, (doc.internal.pageSize.width - socialWidth) / 2, currentY);

    // Save PDF
    doc.save(`receita-nuva-${order.id}.pdf`);
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

      {isVanqir && (
        <div className="w-full bg-white border border-neutral-200 overflow-hidden shadow-sm animate-scale-up">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
             <h3 className="font-mono text-[10px] uppercase font-semibold tracking-wider text-neutral-900">
               Pagamento Seguro - {order.customerInfo.paymentMethod === 'vanqir_mcx' ? 'MCX Express' : 'Referência'}
             </h3>
             <span className="text-[9px] font-mono text-neutral-400">VIA VANQIR PAY</span>
          </div>
          <iframe 
            src={mcxLink} 
            className="w-full h-[650px] border-none bg-white" 
            title="Vanqir Checkout"
          />
        </div>
      )}

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
