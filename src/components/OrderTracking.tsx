/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Package, Truck, Calendar, MapPin, Search } from "lucide-react";

export function OrderTracking() {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [errorMess, setErrorMess] = useState("");

  const demoOrders: { [key: string]: any } = {
    "NUVA-9842": {
      id: "NUVA-9842",
      date: "10 de Junho, 2026",
      client: "Santiago Ventura",
      product: "T-Shirt NUVA Essential (Branco Puro - L)",
      status: "shipped",
      lastUpdate: "A caminho da plataforma de distribuição em Luanda",
      history: [
        { date: "12 Jun, 09:34", location: "Centro de Distribuição Express, Luanda", text: "Desalfandegamento concluído. Expedido e entregue à transportadora local parceira." },
        { date: "11 Jun, 22:50", location: "Aeroporto Internacional 4 de Fevereiro, Luanda", text: "Voo de carga TAP Air Portugal aterrado. A aguardar processamento aduaneiro." },
        { date: "11 Jun, 12:45", location: "Aeroporto Francisco Sá Carneiro, Porto", text: "Embarque de carga prioritária com destino a Luanda (Angola)." },
        { date: "10 Jun, 18:20", location: "Centro Nuva, Guimarães", text: "Embalado meticulosamente com papel vegetal e lacre aromático de alfazema." },
        { date: "10 Jun, 14:05", location: "Fábrica Têxtil, Guimarães", text: "Triagem de qualidade finalizada com 0 falhas detetadas." },
        { date: "10 Jun, 11:30", location: "Portal Online NUVA", text: "Pagamento registado sob Multicaixa Express seguro." }
      ],
      estDelivery: "13 de Junho, 2026"
    },
    "NUVA-2240": {
      id: "NUVA-2240",
      date: "11 de Junho, 2026",
      client: "Mariana Costa",
      product: "T-Shirt NUVA Essential (Bege Areia - M) + T-Shirt NUVA Essential (Preto - M)",
      status: "paid",
      lastUpdate: "Em triagem e controlo de qualidade final",
      history: [
        { date: "11 Jun, 12:45", location: "Atelier de Produção, Guimarães", text: "Peças selecionadas do micro-lote e prontas para embalagem premium." },
        { date: "11 Jun, 10:55", location: "Portal Online NUVA", text: "Encomenda recebida e pagamento confirmado por Cartão de Crédito." }
      ],
      estDelivery: "14 de Junho, 2026"
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess("");
    const normalized = trackingId.trim().toUpperCase();

    if (!normalized) return;

    if (demoOrders[normalized]) {
      setResult(demoOrders[normalized]);
    } else {
      // Generate a dynamic tracking flow so ANY code Typed gets a valid elegant response
      const randomOrder = {
        id: normalized,
        date: "Hoje",
        client: "Cliente NUVA Angola",
        product: "Coleção de Essenciais Premium",
        status: "processing",
        lastUpdate: "Encomenda aceite e em processamento nos nossos ateliers para envio para Angola",
        history: [
          { date: "Hoje, Agora", location: "Sistema Central NUVA", text: "Código gerado com sucesso. A preparar expedição Luanda Express." }
        ],
        estDelivery: "Entrega expressa prevista em 4 a 6 dias úteis"
      };
      setResult(randomOrder);
    }
  };

  return (
    <div className="border border-neutral-200 p-6 md:p-8 bg-white" id="order-tracking-panel">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-1 mb-6 text-center">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
            logística
          </span>
          <h3 className="text-2xl font-light text-neutral-900 tracking-normal capitalize">
            rastrear encomenda – nuva
          </h3>
          <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
            Todas as nossas peças são enviadas de Guimarães com rastreamento integral diretamente para a sua morada.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <Package className="h-4 w-4 stroke-[1.5]" />
            </span>
            <input
              type="text"
              placeholder="Ex: NUVA-9842"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full bg-white border border-neutral-200 py-3.5 pl-10 pr-4 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-black transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-black hover:bg-neutral-950 text-white text-[10px] uppercase tracking-widest px-6 py-3.5 transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono font-medium"
            id="track-submit-btn"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Rastrear</span>
          </button>
        </form>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => { setTrackingId("NUVA-9842"); setResult(demoOrders["NUVA-9842"]); }}
            className="text-[10px] font-mono text-neutral-400 hover:text-black hover:underline transition-colors focus:outline-none"
          >
            Ver Exemplo de Rota (NUVA-9842)
          </button>
        </div>

        {result && (
          <div className="pt-4 border-t border-neutral-100 space-y-6 animate-scale-up" id="tracking-result-panel">
            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-50/60 p-4 text-xs font-mono border border-neutral-200">
              <div className="space-y-1">
                <span className="text-neutral-400 block text-[9px] uppercase tracking-wider font-semibold">CÓDIGO</span>
                <span className="font-semibold text-neutral-800">{result.id}</span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-neutral-400 block text-[9px] uppercase tracking-wider font-semibold">PREVISÃO</span>
                <span className="font-semibold text-neutral-800 flex items-center justify-end gap-1">
                  <Calendar className="h-3 w-3 text-neutral-500" />
                  {result.estDelivery}
                </span>
              </div>
              <div className="space-y-1 pt-2 border-t border-neutral-200">
                <span className="text-neutral-400 block text-[9px] uppercase tracking-wider font-semibold">DESTINATÁRIO</span>
                <span className="font-sans font-medium text-neutral-800 truncate block">{result.client}</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-neutral-200 text-right">
                <span className="text-neutral-400 block text-[9px] uppercase tracking-wider font-semibold">ESTADO</span>
                <span className="text-[10px] tracking-wider font-semibold text-neutral-800">
                  {result.status === "shipped" ? "Em Trânsito" : result.status === "paid" ? "Em Preparação" : "Aceite"}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                <Truck className="h-4 w-4 text-neutral-400 stroke-[1.5]" />
                <h4 className="font-mono text-[10px] uppercase tracking-wider font-semibold text-neutral-700">
                  Histórico de Expedição
                </h4>
              </div>

              <div className="relative border-l border-neutral-200 ml-2 pl-6 pb-2 space-y-6 text-xs">
                {result.history.map((step: any, idx: number) => (
                  <div key={idx} className="relative">
                    {/* Bullet */}
                    <span className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border border-white flex items-center justify-center ${idx === 0 ? "bg-black ring-4 ring-neutral-100" : "bg-neutral-300"}`} />
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`font-medium ${idx === 0 ? "text-black font-semibold" : "text-neutral-700"}`}>
                          {step.location}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 whitespace-nowrap">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-neutral-500 font-sans text-[11px] leading-relaxed pr-2">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
