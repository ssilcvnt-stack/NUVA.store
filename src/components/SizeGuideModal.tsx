/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, RefreshCw, Ruler } from "lucide-react";
import { SIZE_TABLE } from "../data";

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideProps) {
  const [height, setHeight] = useState<string>("178");
  const [weight, setWeight] = useState<string>("75");
  const [preference, setPreference] = useState<"classic" | "relaxed">("classic");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const hNum = parseFloat(height);
    const wNum = parseFloat(weight);

    if (isNaN(hNum) || isNaN(wNum)) return;

    // Sizing logic based on realistic metrics
    let baseSize = "M";

    if (wNum < 65) {
      baseSize = hNum < 172 ? "S" : "M";
    } else if (wNum >= 65 && wNum < 78) {
      baseSize = hNum < 180 ? "M" : "L";
    } else if (wNum >= 78 && wNum < 90) {
      baseSize = hNum < 185 ? "L" : "XL";
    } else {
      baseSize = hNum < 192 ? "XL" : "XXL";
    }

    // Apply fit preference adjustments
    if (preference === "relaxed") {
      if (baseSize === "S") baseSize = "M";
      else if (baseSize === "M") baseSize = "L";
      else if (baseSize === "L") baseSize = "XL";
      else if (baseSize === "XL") baseSize = "XXL";
    }

    setRecommendedSize(baseSize);
  };

  const handleReset = () => {
    setHeight("178");
    setWeight("75");
    setPreference("classic");
    setRecommendedSize(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" id="size-guide-modal-container">
      <div className="bg-white text-black w-full max-w-2xl overflow-hidden shadow-2xl border border-black/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center space-x-2">
            <Ruler className="h-4 w-4" />
            <h3 className="font-sans font-medium text-lg uppercase tracking-wider">
              Guia de Tamanhos NUVA
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-black transition-colors"
            id="close-size-guide-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* Sizing Advisor Wizard */}
          <div className="bg-brand-sand p-6 border border-neutral-100">
            <h4 className="font-sans text-sm uppercase tracking-wider mb-1 font-medium text-neutral-800">
              Assiste Virtual de Ajuste (Sizing)
            </h4>
            <p className="text-xs text-neutral-500 mb-4 font-sans italic">
              Insira as suas medidas para sabermos qual o tamanho ideal para a sua estrutura corporal.
            </p>

            <form onSubmit={calculateSize} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide font-mono text-neutral-500 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="140"
                    max="220"
                    required
                    className="w-full bg-white border border-neutral-200 py-2 px-3 text-sm focus:outline-none focus:border-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-mono text-neutral-500 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="40"
                    max="160"
                    required
                    className="w-full bg-white border border-neutral-200 py-2 px-3 text-sm focus:outline-none focus:border-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-mono text-neutral-500 mb-1">
                    Estilo de Caimento
                  </label>
                  <select
                    value={preference}
                    onChange={(e) => setPreference(e.target.value as "classic" | "relaxed")}
                    className="w-full bg-white border border-neutral-200 py-2 px-3 text-sm focus:outline-none focus:border-black transition-all"
                  >
                    <option value="classic">Justo / Clássico (Natural)</option>
                    <option value="relaxed">Mais Largo (Oversized vibe)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                {recommendedSize ? (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs flex items-center space-x-1.5 text-neutral-500 hover:text-black transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Recomeçar cálculo</span>
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-white font-mono text-xs uppercase px-5 py-2.5 transition-colors duration-150"
                >
                  Calcular Recomendação
                </button>
              </div>
            </form>

            {recommendedSize && (
              <div className="mt-6 p-4 bg-white border border-black flex items-center gap-4 animate-scale-up">
                <div className="flex-shrink-0 w-16 h-16 bg-black text-white flex items-center justify-center font-sans text-2xl font-bold">
                  {recommendedSize}
                </div>
                <div>
                  <h5 className="font-sans font-semibold text-sm">
                    Recomendamos o tamanho {recommendedSize}
                  </h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Com base no seu peso de {weight}kg e altura de {height}cm, o tamanho <strong className="text-black">{recommendedSize}</strong> garantirá o caimento ideal e sofisticação recomendados pela NUVA.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Measurements Table */}
          <div className="space-y-3">
            <h4 className="font-sans text-sm uppercase tracking-wider font-medium text-neutral-800">
              Tabela de Medidas (Peça Plana)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-black text-neutral-500">
                    <th className="py-2 pr-4 uppercase">Tamanho</th>
                    <th className="py-2 px-4 uppercase">Largura</th>
                    <th className="py-2 px-4 uppercase">Comprimento</th>
                    <th className="py-2 px-4 uppercase">Manga</th>
                    <th className="py-2 pl-4 uppercase">Sugestão Altura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {SIZE_TABLE.map((row) => (
                    <tr key={row.size} className={`${recommendedSize === row.size ? "bg-neutral-50 font-medium text-black" : "text-neutral-700"}`}>
                      <td className="py-3 pr-4 font-sans font-semibold">{row.size}</td>
                      <td className="py-3 px-4">{row.chest}</td>
                      <td className="py-3 px-4">{row.length}</td>
                      <td className="py-3 px-4">{row.sleeve}</td>
                      <td className="py-3 pl-4 text-neutral-500">{row.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-neutral-400 font-sans italic text-[11px] mt-2">
              * Nota: As nossas peças são pré-colhidas industrialmente. Estas dimensões podem ter variações ligeiras de até 1.5cm comuns a tecidos de algodão orgânico puro.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 flex justify-end bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="bg-black hover:bg-neutral-800 text-white font-mono text-xs uppercase px-6 py-3 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
