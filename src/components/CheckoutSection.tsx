/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, CreditCard, PhoneCall, Landmark, ShieldCheck, Mail, Calendar, MapPin, Loader2 } from "lucide-react";
import { CartItem, CustomerInfo, Order } from "../types";
import { formatPrice } from "../data";
import { auth } from "../lib/firebase";

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

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState<"vanqir" | "transfer" | "cash">("vanqir");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.selectedColor.priceOverride || item.product.price) * item.quantity, 0);
  const isLuanda = city.trim().toLowerCase() === "luanda" || city.trim() === "";
  const shipping = isLuanda ? 0 : subtotal * 0.25;
  // Assumes all prices have taxes included
  const total = subtotal + shipping;
  const tax = total - (total / 1.14);

  const getVanqirUrl = () => {
    const firstItem = cartItems[0];
    if (!firstItem) return "";
    if (firstItem.selectedColor.id === "lightblue") {
      return "https://pay.vanqir.com/checkout/9fcbf922-76d8-48d4-8102-8f9383fc096e";
    }
    return "https://pay.vanqir.com/checkout/7ebd4a79-d289-47a6-99b1-f799e8e35d76";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!firstName || !lastName || !email || !address || !city) {
      setValidationError("Por favor preencha todos os dados de entrega obrigatórios.");
      return;
    }

    if (paymentMethod === "vanqir") {
      setLoadingStep("A associar pedido ao portal Vanqir...");
    } else if (paymentMethod === "transfer") {
      setLoadingStep("A associar transferência ao lote de fabrico...");
    } else {
      setLoadingStep("A processar pedido para pagamento na entrega...");
    }

    setIsLoading(true);

    setTimeout(() => {
      setLoadingStep("A gerar recibo eletrónico certificado pela AGT (Angola)...");
      
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
          paymentMethod,
        };

        const checkoutData = {
          customerInfo,
          items: cartItems
        };

        const executeCheckout = async () => {
          try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (auth.currentUser) {
               headers["Authorization"] = `Bearer ${await auth.currentUser.getIdToken()}`;
            }

            const res = await fetch("/api/checkout", {
               method: "POST",
               headers,
               body: JSON.stringify(checkoutData)
            });
            const data = await res.json();
            
            if (data.success) {
               onOrderComplete(data.orderData);
            } else {
               setValidationError(data.error || "Ocorreu um erro no processamento.");
            }
          } catch (err) {
            console.error(err);
            setValidationError("Erro de conexão ao servidor seguro.");
          }
        };

        executeCheckout();

      }, 1500);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12" id="checkout-section-wrapper">
      {/* Back flow and top assurance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-mono uppercase text-neutral-500 hover:text-black transition-colors self-start"
          id="back-to-cart-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Carrinho</span>
        </button>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-brand-sand px-3 py-1.5 border border-neutral-100">
          <ShieldCheck className="h-4 w-4 text-black" />
          <span>Servidor Seguro SSL Ativo com Encriptação AES-256</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Checkout Inputs Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Address Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-black pb-2">
                <span className="w-5 h-5 bg-black text-white text-[11px] font-mono flex items-center justify-center font-bold">
                  1
                </span>
                <h3 className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-neutral-900">
                  Dados de Entrega
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

               <div className="grid grid-cols-3 gap-3">
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
            </div>

            {/* 2. Payment Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-black pb-2">
                <span className="w-5 h-5 bg-black text-white text-[11px] font-mono flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-neutral-900">
                  Método de Pagamento Seguro
                </h3>
              </div>

              {/* Payment Select tabs */}
              <div className="grid grid-cols-3 border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vanqir")}
                  className={`py-3 px-2 text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === "vanqir" ? "bg-black text-white" : "hover:bg-neutral-50 text-neutral-600 bg-white"}`}
                  id="pay-vanqir-tab"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pagamento Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`py-3 px-2 text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === "transfer" ? "bg-black text-white" : "hover:bg-neutral-50 text-neutral-600 bg-white"}`}
                  id="pay-transfer-tab"
                >
                  <Landmark className="h-4 w-4" />
                  <span>Transferência Bancária</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-3 px-2 text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === "cash" ? "bg-black text-white" : "hover:bg-neutral-50 text-neutral-600 bg-white"}`}
                  id="pay-cash-tab"
                >
                  <div className="flex items-center gap-1 font-bold font-mono">Kz</div>
                  <span>Pagamento na Entrega</span>
                </button>
              </div>

              {/* Payment Content panels */}
              <div className="p-0 border border-neutral-200 bg-neutral-50/70 min-h-[140px] flex items-center">
                {paymentMethod === "vanqir" && (
                  <div className="w-full h-[550px]">
                    <iframe 
                      src={getVanqirUrl()} 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      allow="payment"
                      title="Pagamento Seguro Vanqir"
                      className="bg-white"
                    />
                  </div>
                )}

                {paymentMethod === "transfer" && (
                  <div className="w-full space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-[10px] uppercase font-semibold text-neutral-900">
                        Transferência Bancária (Directa)
                      </h4>
                      <span className="text-[9px] font-mono text-neutral-400">PROCESSAMENTO EM 24H</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                      Efetue transferência bancária para o IBAN abaixo e envie o comprovativo para <strong>vendas@nuva.com</strong>.
                    </p>
                    <div className="bg-white p-3 border border-neutral-200 space-y-1 text-xs font-mono selection:bg-neutral-100">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400">BANCO:</span>
                        <span className="font-semibold text-black text-[10px]">BANCO MILLENNIUM ATLANTICO</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-100">
                        <span className="text-neutral-400">IBAN:</span>
                        <span className="font-semibold text-black tracking-wider text-[11px] select-all">AO06 0055 0000 5957 4524 101 77</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-100">
                        <span className="text-neutral-400">BENEFICIÁRIO:</span>
                        <span className="font-semibold text-black text-[10px]">AUGUSTO SOBRINHO DA SILVA COSTA</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="w-full space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono text-[10px] uppercase font-semibold text-neutral-900">
                        Pagamento no Acto da Entrega
                      </h4>
                      <span className="text-[9px] font-mono text-neutral-400">EM LUANDA</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                      Efectua o pagamento em dinheiro ou via TPA apenas quando receberes a tua encomenda. Esta opção é válida exclusivamente para a área da cidade de Luanda.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit checkout triggers */}
            <div>
              {validationError && (
                <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-mono text-center animate-fade-in">
                  {validationError}
                </div>
              )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-neutral-900 text-white py-5 text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="submit-payment-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                      <span>{loadingStep}</span>
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === "vanqir" ? "Registar Encomenda Nuva" : `Confirmar & Concluir Pedido ${formatPrice(total)}`}</span>
                    </>
                  )}
                </button>
              
              <p className="text-[10px] text-neutral-400 text-center font-sans mt-3 leading-relaxed">
                Ao clicar em confirmar, aceita os Termos e Condições Premium da NUVA Labs e declara-se ciente que as peças básicas serão processadas sob rígido padrão de alfaiataria em Guimarães e expedidas com entrega expresso em Luanda.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Order Cart Summary Checkout */}
        <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200 p-6 md:p-8 space-y-6">
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-200">
            Resumo do Pedido
          </h3>

          <div className="divide-y divide-neutral-200 max-h-[280px] overflow-y-auto space-y-3 pb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 pt-3 items-center justify-between">
                <div className="flex gap-3 items-center">
                  <div className="h-14 w-10 overflow-hidden bg-white border border-neutral-200 flex-shrink-0">
                    <img
                      src={item.selectedColor.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-sans text-[11px] font-semibold text-neutral-800 uppercase tracking-wider">
                      {item.product.name}
                    </h4>
                    <p className="font-mono text-[9px] text-neutral-500">
                      Tamanho: {item.selectedSize} | Cor: {item.selectedColor.name} | Qtd: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold">
                  {formatPrice((item.selectedColor.priceOverride || item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-dashed border-neutral-200 space-y-2.5 text-xs text-neutral-600 font-mono">
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
            <div className="flex justify-between text-sm font-bold text-black pt-3 border-t border-neutral-200">
              <span>TOTAL DO INVESTIMENTO</span>
              <span className="text-black text-md">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Premium package assurance quote */}
          <div className="bg-white p-4 border border-neutral-200 space-y-2">
            <span className="text-[9px] font-mono tracking-widest font-bold block text-black">
              COMO RECEBERÁ A ENCOMENDA
            </span>
            <p className="font-sans text-[11px] text-neutral-500 leading-relaxed">
              "A nossa embalagem foi premiada pelo design ecológico duraluxe. Cada t-shirt é devidamente engomada por sopro a vapor de carvalho, envolvida em papel vegetal sem cloro e acondicionada numa caixa rígida de kraft para proteger totalmente a textura da gola premium. Entregue pessoalmente na sua morada em Luanda em viatura climatizada."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
