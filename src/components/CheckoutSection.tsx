/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, PhoneCall, Landmark, ShieldCheck, Mail, Calendar, MapPin, Loader2, QrCode, Truck } from "lucide-react";
import { CartItem, CustomerInfo, Order } from "../types";
import { formatPrice } from "../data";

interface CheckoutSectionProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
}

export function CheckoutSection({
  cartItems,
  onBack,
  onOrderComplete
}: CheckoutSectionProps) {
  // Contact details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Angola");

  // Multi-step checkout state
  const [checkoutStep, setCheckoutStep] = useState<"delivery" | "payment">("delivery");
  const [iframeFinished, setIframeFinished] = useState(false);

  // Set up message listener for automated success detection from pay.vanqir.com
  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        const dataLower = event.data.toLowerCase();
        if (dataLower.includes('success') || dataLower.includes('complete') || dataLower.includes('paid')) {
          setIframeFinished(true);
        }
      } else if (event.data && typeof event.data === 'object') {
        if (event.data.status === 'success' || event.data.event === 'payment.success') {
          setIframeFinished(true);
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, []);

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState<"vanqir_mcx" | "transfer" | "delivery">("vanqir_mcx");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.selectedColor.priceOverride || item.product.price) * item.quantity, 0);
  const isLuanda = city.trim().toLowerCase() === "luanda" || city.trim() === "";
  const shipping = isLuanda ? 0 : subtotal * 0.25;
  // Assumes all prices have taxes included
  const total = subtotal + shipping;
  const tax = total - (total / 1.14);

  const isVanqir = paymentMethod === "vanqir_mcx";
  const iframeLinks: Record<string, string> = {
    navy: "https://pay.vanqir.com/checkout/6972a1fd-12bb-4ebf-b7ab-751bc367a666",
    white: "https://pay.vanqir.com/checkout/3c3a5dcd-3ada-4377-9e40-d96fefe04547",
    lightblue: "https://pay.vanqir.com/checkout/84d1ba1e-4b07-4bc4-9adb-69a88325adf2"
  };
  
  let mcxLink = "";
  if (isVanqir) {
    const firstCartItem = cartItems[0];
    const colorId = firstCartItem?.selectedColor.id || "navy";
    const baseLink = iframeLinks[colorId] || iframeLinks.navy;
    try {
      const checkoutUrl = new URL(baseLink);
      if (email) checkoutUrl.searchParams.set('email', email.trim());
      if (firstName || lastName) {
        checkoutUrl.searchParams.set('name', `${firstName} ${lastName}`.trim());
      }
      if (phone) checkoutUrl.searchParams.set('phone', phone.trim());
      mcxLink = checkoutUrl.toString();
    } catch (e) {
      mcxLink = baseLink;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!firstName || !lastName || !email || !address || !city) {
      setValidationError("Por favor preencha todos os dados de entrega obrigatórios.");
      return;
    }

    if (isVanqir && !iframeFinished) {
      setValidationError("Por favor, finalize o pagamento clicando no botão verde 'FINALIZAR COMPRA' da Vanqir acima e marque a caixa de confirmação para avançar.");
      return;
    }

    setIsLoading(true);
    setLoadingStep("A processar pedido...");

    setTimeout(() => {
      if (isVanqir) {
        setLoadingStep("A preparar ambiente de pagamento...");
      } else {
        setLoadingStep("A associar pedido ao lote de fabrico...");
      }

      setTimeout(() => {
        setLoadingStep("A gerar recibo eletrónico...");
        
        setTimeout(() => {
          setIsLoading(false);

          const customerInfo: CustomerInfo = {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            postalCode,
            country,
            paymentMethod
          };

          const orderId = `NUVA-${Math.floor(1000 + Math.random() * 9000)}`;
          const trackingNumber = `NV-${Math.floor(10000 + Math.random() * 90000)}`;

          const newOrder: Order = {
            id: orderId,
            items: [...cartItems],
            customerInfo,
            subtotal,
            shipping,
            tax,
            total,
            createdAt: new Date().toLocaleDateString("pt-PT", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }),
            status: paymentMethod === "transfer" ? "pending" : "paid",
            trackingNumber
          };

          // Trigger email via our internal secure express backend (no exposed secrets)
          fetch('/api/send-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
          }).catch(err => console.error("Failed to trigger email webhook behind proxy:", err));

          onOrderComplete(newOrder);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12" id="checkout-section-wrapper">
      {/* Back flow and top assurance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={checkoutStep === "payment" ? () => { setCheckoutStep("delivery"); window.scrollTo({ top: 0, behavior: "smooth" }); } : onBack}
          className="flex items-center space-x-1.5 text-xs font-mono uppercase text-neutral-500 hover:text-black transition-colors self-start"
          id="back-to-cart-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{checkoutStep === "payment" ? "Voltar para Dados de Entrega" : "Voltar ao Carrinho"}</span>
        </button>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-brand-sand px-3 py-1.5 border border-neutral-100">
          <ShieldCheck className="h-4 w-4 text-black" />
          <span>Servidor Seguro SSL Ativo com Encriptação AES-256</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${checkoutStep === "payment" ? "max-w-6xl" : "max-w-3xl"} mx-auto transition-all duration-300`}>
        {/* Main Column Card */}
        <div className="bg-white border border-neutral-200 p-6 md:p-8 space-y-8 shadow-sm rounded-sm">
          {/* Visual Progress Steps Bar */}
          <div className="flex items-center justify-start space-x-6 mb-8 border-b border-neutral-200 pb-[10px]">
            <button 
              type="button"
              disabled={checkoutStep === "delivery"}
              onClick={() => { setCheckoutStep("delivery"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className={`flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest pb-3 -mb-[12px] transition-all ${checkoutStep === "delivery" ? "text-black font-bold border-b border-black" : "text-neutral-400 hover:text-black cursor-pointer"}`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${checkoutStep === "delivery" ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"}`}>1</span>
              <span>Dados de Envio</span>
            </button>
            <div className="h-px bg-neutral-200 w-6"></div>
            <div className={`flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest pb-3 -mb-[12px] transition-all pb-3 ${checkoutStep === "payment" ? "text-black font-bold border-b border-black" : "text-neutral-400"}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${checkoutStep === "payment" ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"}`}>2</span>
              <span>Pagamento Seguro</span>
            </div>
          </div>

          <div className="space-y-8">
            {checkoutStep === "delivery" ? (
              /* Step 1: Delivery Data Entry */
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-black pb-2">
                  <span className="w-5 h-5 bg-black text-white text-[11px] font-mono flex items-center justify-center font-bold">
                    1
                  </span>
                  <h3 className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-neutral-900">
                    Dados de Entrega
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Santiago"
                      className="w-full bg-white border border-neutral-200 py-2.5 px-3 text-xs focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                      Apelido *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ex: Ventura"
                      className="w-full bg-white border border-neutral-200 py-2.5 px-3 text-xs focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: santiago@nuva.com"
                      className="w-full bg-white border border-neutral-200 py-2.5 px-3 text-xs focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                      Telemóvel *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 912 345 678"
                      className="w-full bg-white border border-neutral-200 py-2.5 px-3 text-xs focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                    Morada de Envio *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número de porta, andar ou habitação"
                    className="w-full bg-white border border-neutral-200 py-3 px-3 text-xs focus:outline-none focus:border-black transition-all mb-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                      Código Postal (Opcional)
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Ex: 1000"
                      className="w-full bg-white border border-neutral-200 py-2.5 px-3 text-xs focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                      Cidade / Província *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Luanda"
                      className="w-full bg-white border border-neutral-200 py-2.5 px-3 text-xs focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wide text-neutral-500 mb-1">
                      País *
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white border border-neutral-200 py-2.5 px-3 text-xs focus:outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Static Order Summary box in Step 1 */}
                <div className="p-4 border border-dashed border-neutral-200 bg-neutral-50/50 space-y-3 mt-4">
                  <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-neutral-400 block border-b border-neutral-100 pb-1.5">
                    Resumo do Pedido ({cartItems.length} {cartItems.length === 1 ? "Item" : "Itens"})
                  </span>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-neutral-700 font-sans">{item.product.name} ({item.selectedColor.name}, {item.selectedSize}) x{item.quantity}</span>
                        <span className="font-semibold text-neutral-800">{formatPrice((item.selectedColor.priceOverride || item.product.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-black border-t border-dashed border-neutral-200 pt-2.5 mt-2">
                    <span>Total Estimado</span>
                    <span className="font-mono text-neutral-900">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  {validationError && (
                    <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-mono text-center animate-fade-in">
                      {validationError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setValidationError(null);
                      if (!firstName || !lastName || !email || !phone || !address || !city) {
                        setValidationError("Por favor, preencha todos os dados de entrega obrigatórios para avançar.");
                        return;
                      }
                      setCheckoutStep("payment");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full bg-black hover:bg-neutral-900 text-white py-5 text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
                    id="goto-payment-btn"
                  >
                    <span>Avançar para o Pagamento</span>
                  </button>

                  <p className="text-[10px] text-neutral-400 text-center font-sans mt-3 leading-relaxed">
                    🔐 <strong>Métodos de Pagamento Disponíveis no Próximo Passo:</strong> Pagamento Automático por <strong>Multicaixa/Referência (via Vanqir Pay)</strong>, <strong>Transferência Bancária (IBAN)</strong>, ou <strong>Pagamento no Momento da Entrega</strong>.
                  </p>
                </div>
              </div>
            ) : (
              /* Step 2: Payment Execution */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                {/* Left Column: Active Payment Input Module (e.g. Vanqir Secure Iframe / Instructions) */}
                <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 rounded-sm space-y-6">
                  <div className="flex items-center space-x-2 border-b border-black pb-2">
                    <span className="w-5 h-5 bg-black text-white text-[11px] font-mono flex items-center justify-center font-bold">
                      2
                    </span>
                    <h3 className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-neutral-900">
                      {paymentMethod === "vanqir_mcx" ? "Módulo de Pagamento Seguro Vanqir" : paymentMethod === "transfer" ? "Dados para Transferência" : "Instruções de Pagamento na Entrega"}
                    </h3>
                  </div>

                  <div className="p-0 min-h-[140px] flex flex-col justify-center">
                    {paymentMethod === "vanqir_mcx" && (
                      <div className="w-full space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-mono text-[10px] uppercase font-semibold text-neutral-900">
                            PAGAMENTO DIRETO SEGURO (MCX EXPRESS)
                          </h4>
                          <span className="text-[9px] font-mono text-neutral-400">VIA VANQIR PAY</span>
                        </div>
                        <div className="p-3 bg-neutral-200/50 border border-neutral-300 text-neutral-800 text-[11px] font-mono text-center">
                          ℹ️ Os seus dados foram pré-preenchidos de forma totalmente segura no módulo abaixo.
                        </div>
                        <div className="w-full border border-neutral-200 bg-white h-[750px] rounded-sm relative shadow-sm overflow-hidden">
                          <iframe 
                            src={mcxLink} 
                            scrolling="no"
                            className="w-full h-full border-none bg-white absolute inset-0" 
                            style={{ overflow: "hidden" }}
                            title="Pagamento Seguro Vanqir"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "transfer" && (
                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-mono text-[10px] uppercase font-semibold text-neutral-900">
                            Transferência Bancária / IBAN
                          </h4>
                          <span className="text-[9px] font-mono text-neutral-400">PROCESSAMENTO MANUAL</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                          Efetue transferência bancária para o IBAN abaixo e envie o comprovativo para <strong>nuva2026@proton.me</strong>.
                        </p>
                        <div className="bg-white p-3 border border-neutral-200 space-y-1 text-[11px] font-mono selection:bg-neutral-100">
                          <div className="flex justify-between flex-wrap gap-2 py-1">
                            <span className="text-neutral-400">BANCO:</span>
                            <span className="font-semibold text-black text-right">BANCO MILLENNIUM ATLANTICO</span>
                          </div>
                          <div className="flex justify-between flex-wrap gap-2 py-1 border-t border-neutral-100">
                            <span className="text-neutral-400">IBAN:</span>
                            <span className="font-semibold text-black text-right tracking-[0.1em]">AO06 0055 0000 5957 4524 1017 7</span>
                          </div>
                          <div className="flex justify-between flex-wrap gap-2 py-1 border-t border-neutral-100">
                            <span className="text-neutral-400">BENEFICIÁRIO:</span>
                            <span className="font-semibold text-black text-right">AUGUSTO SOBRINHO DA SILVA COSTA</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "delivery" && (
                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-mono text-[10px] uppercase font-semibold text-neutral-900">
                            Pagamento na Entrega
                          </h4>
                          <span className="text-[9px] font-mono text-neutral-400">CONFIRMAR E AGUARDAR</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                          Efetue o pagamento apenas quando receber a encomenda na morada indicada. Aceitaremos pagamento em TPA ou através de transferência no momento da entrega do motorista.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: All NUVA Order Information & Checkout Action Triggers */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Elegant delivery details summary */}
                  <div className="bg-white border border-neutral-200 p-5 flex justify-between items-center rounded-sm shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase text-neutral-400 font-semibold tracking-wider block font-bold">Endereço de Entrega</span>
                      <p className="text-xs font-sans font-bold text-neutral-800">
                        {firstName} {lastName} • {phone}
                      </p>
                      <p className="text-[11px] font-sans text-neutral-500">
                        {address}, {city}, {country}
                      </p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setCheckoutStep("delivery"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="text-[10px] font-mono uppercase tracking-wider text-black underline hover:text-neutral-500 font-bold cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>

                  {/* Payment selection header and selector tabs */}
                  <div className="bg-white border border-neutral-200 p-5 rounded-sm space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-neutral-500 block">
                        Método de Pagamento NUVA
                      </span>
                    </div>
                    <div className="grid grid-cols-3 border border-neutral-200">
                      <button
                        type="button"
                        id="pay-vanqir-mcx-tab"
                        onClick={() => setPaymentMethod("vanqir_mcx")}
                        className={`py-3 text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all outline-none cursor-pointer ${paymentMethod === "vanqir_mcx" ? "bg-black text-white font-bold" : "hover:bg-neutral-50 text-neutral-600 bg-white"}`}
                      >
                        <div className="flex items-center gap-1 font-bold font-mono">MCX</div>
                        <span className="text-[9px] tracking-tight">MCX Express</span>
                      </button>
                      <button
                        type="button"
                        id="pay-transfer-tab"
                        onClick={() => setPaymentMethod("transfer")}
                        className={`py-3 text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all outline-none cursor-pointer ${paymentMethod === "transfer" ? "bg-black text-white font-bold" : "hover:bg-neutral-50 text-neutral-600 bg-white border-l border-neutral-200"}`}
                      >
                        <Landmark className="h-4 w-4" />
                        <span className="text-[9px] tracking-tight">TRF Bancária</span>
                      </button>
                      <button
                        type="button"
                        id="pay-delivery-tab"
                        onClick={() => setPaymentMethod("delivery")}
                        className={`py-3 text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all outline-none cursor-pointer ${paymentMethod === "delivery" ? "bg-black text-white font-bold" : "hover:bg-neutral-50 text-neutral-600 bg-white border-l border-neutral-200"}`}
                      >
                        <Truck className="h-4 w-4" />
                        <span className="text-[9px] tracking-tight">Na Entrega</span>
                      </button>
                    </div>
                  </div>

                  {/* Faturação/Detailed billing summary */}
                  <div className="bg-neutral-50/50 border border-neutral-200 p-5 rounded-sm space-y-4">
                    <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-neutral-500 block border-b border-neutral-200 pb-2">
                      Faturação NUVA
                    </span>
                    <div className="divide-y divide-neutral-100 max-h-[180px] overflow-y-auto space-y-2 pb-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 pt-2 items-center justify-between text-xs">
                          <div className="flex gap-2 items-center">
                            <span className="font-sans text-neutral-800">{item.product.name} ({item.selectedColor.name}, {item.selectedSize})</span>
                            <span className="font-mono text-[10px] text-neutral-400">x{item.quantity}</span>
                          </div>
                          <span className="font-mono font-semibold text-neutral-800">{formatPrice((item.selectedColor.priceOverride || item.product.price) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-dashed border-neutral-200 space-y-2 text-xs font-mono text-neutral-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-neutral-800">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distribuição Expresso</span>
                        <span className="font-semibold text-neutral-800">
                          {shipping === 0 ? "Grátis (Luanda)" : formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-neutral-400">
                        <span>Impostos Locais (Incluídos)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-black border-t border-neutral-100 pt-3 mt-1.5">
                        <span>TOTAL DO INVESTIMENTO</span>
                        <span className="text-black text-md font-sans">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reassurance */}
                  <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-2 rounded-sm">
                    <span className="text-[9px] font-mono tracking-widest font-bold block text-black">
                      COMO RECEBERÁ A ENCOMENDA
                    </span>
                    <p className="font-sans text-[11px] text-neutral-500 leading-relaxed">
                      "A nossa embalagem foi premiada pelo design ecológico duraluxe. Cada t-shirt é devidamente engomada por sopro a vapor de carvalho, envolvida em papel vegetal sem cloro e acondicionada numa caixa rígida de kraft para proteger totalmente a textura da gola premium. Entregue pessoalmente na sua morada em Luanda em viatura climatizada."
                    </p>
                  </div>

                  {/* Action Trigger button block */}
                  <div className="space-y-4">
                    {validationError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono text-center">
                        {validationError}
                      </div>
                    )}

                    {isVanqir ? (
                      <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-4 text-center shadow-sm">
                        <p className="text-[11px] text-neutral-600 font-sans leading-relaxed text-left">
                          👉 <strong>Etapa Final:</strong> Após clicar no botão verde <strong>"FINALIZAR COMPRA"</strong> no formulário Vanqir ao lado para efetuar a transação, confirme o seu pedido abaixo para obter o seu recibo premium.
                        </p>

                        {/* Interactive Checkbox */}
                        <div className="flex items-start space-x-3 bg-neutral-50 p-3 border border-neutral-200 rounded-sm text-left shadow-sm">
                          <input
                            type="checkbox"
                            id="iframe-payment-checkbox"
                            checked={iframeFinished}
                            onChange={(e) => {
                              setIframeFinished(e.target.checked);
                              setValidationError(null);
                            }}
                            className="mt-0.5 h-4.5 w-4.5 cursor-pointer accent-black"
                          />
                          <label htmlFor="iframe-payment-checkbox" className="text-[11px] text-neutral-700 leading-normal font-sans cursor-pointer select-none">
                            Confirmo que já cliquei em <strong>"FINALIZAR COMPRA"</strong> no formulário Vanqir ao lado e autorizei a transação.
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`w-full py-5 text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 cursor-pointer font-bold ${
                            iframeFinished 
                              ? "bg-black hover:bg-neutral-900 text-white cursor-pointer" 
                              : "bg-neutral-200 text-neutral-400 border border-neutral-300 cursor-not-allowed"
                          }`}
                          id="submit-payment-btn"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                              <span>{loadingStep}</span>
                            </>
                          ) : (
                            <span>CONFIRMAR COMPRA / VER RECIBO ({formatPrice(total)})</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black hover:bg-neutral-900 text-white py-5 text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-bold"
                        id="submit-payment-btn"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                            <span>{loadingStep}</span>
                          </>
                        ) : (
                          <span>CONFIRMAR E ENVIAR PEDIDO ({formatPrice(total)})</span>
                        )}
                      </button>
                    )}

                    <p className="text-[10px] text-neutral-400 text-center font-sans leading-relaxed">
                      Ao clicar em confirmar, aceita os Termos e Condições Premium da NUVA Labs e declara-se ciente que as peças básicas serão processadas sob rígido padrão de alfaiataria em Guimarães e expedidas com entrega expresso em Luanda.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
