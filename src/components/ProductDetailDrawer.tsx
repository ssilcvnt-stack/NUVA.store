/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Check, ShieldCheck, Truck, RefreshCw, Sparkles } from "lucide-react";
import { Product, ProductColor } from "../types";
import { formatPrice } from "../data";

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor: ProductColor, selectedSize: string) => void;
  openSizeGuide: () => void;
}

export function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  onAddToCart,
  openSizeGuide
}: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"details" | "fabric" | "shipping">("details");
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  // Sync color with product
  useEffect(() => {
    if (product) {
      const defaultColor = product.colors.find(c => c.id === product.defaultColorId) || product.colors[0];
      setSelectedColor(defaultColor);
      setSelectedSize("");
      setSizeError(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (!selectedColor) return;
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    onAddToCart(product, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in" id="product-detail-drawer-overlay">
      {/* Backdrop closer */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Main Drawer Shell */}
      <div className="bg-white text-black w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-y-auto animate-slide-left border-l border-black/10" id="product-detail-drawer">
        {/* Header toolbar */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 flex justify-between items-center px-6 py-4 border-b border-neutral-100">
          <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
            {product.tagline}
          </span>
          <button 
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-black hover:rotate-90 transition-all duration-200 p-1"
            id="close-drawer-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body content */}
        <div className="p-6 md:p-8 space-y-8 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Product Image Showcase */}
            <div className="space-y-4">
              <div className="relative aspect-3/4 w-full bg-brand-offwhite border border-neutral-100 overflow-hidden group">
                <img
                  src={selectedColor?.image || product.colors[0].image}
                  alt={`${product.name} - ${selectedColor?.name}`}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Genuine Product Label watermark */}
                <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-xs border border-neutral-200/50 px-2 py-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
                    Puro Algodão Orgânico
                  </span>
                </div>
              </div>

              {/* Core palette previews */}
              <div className="grid grid-cols-4 gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={`aspect-3/4 border overflow-hidden relative transition-all ${selectedColor?.id === color.id ? "border-black scale-95" : "border-neutral-200 hover:border-black/50"}`}
                  >
                    <img 
                      src={color.image} 
                      alt={color.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white py-0.5 text-center font-mono truncate">
                      {color.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info & Pricing & Color/Size Pickers */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-4xl font-sans tracking-normal text-neutral-950 font-light">
                    {product.name}
                  </h2>
                  {selectedColor?.isPreOrder && (
                    <span className="bg-black text-white px-2.5 py-1 text-[9px] uppercase tracking-widest font-mono font-bold mt-1">
                      BREVEMENTE
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2 text-[12px] uppercase tracking-widest text-black mb-1 mt-3">
                  <span>Preço</span>
                  <span className="font-semibold">{formatPrice(selectedColor?.priceOverride || product.price)}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2 text-[12px] uppercase tracking-widest text-black/55">
                  <span>Material</span>
                  <span>100% Algodão Penteado</span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 font-sans leading-relaxed italic border-l border-neutral-200 pl-3">
                {product.description}
              </p>

              {/* Color list selector */}
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-black/50 mb-2">
                  Cor: <strong className="text-black">{selectedColor?.name}</strong>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`h-7 w-7 rounded-none border border-black/10 transition-transform ${selectedColor?.id === color.id ? "ring-1 ring-black scale-110" : "hover:scale-105"}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size selectors with guide link */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-black/50">
                    Tamanho Selecionado
                  </span>
                  <button
                    type="button"
                    onClick={openSizeGuide}
                    className="text-[10px] font-mono uppercase tracking-widest text-black/40 hover:text-black underline transition-colors"
                  >
                    Calcular o meu tamanho
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`py-3 px-1 text-[11px] font-mono border text-center transition-all cursor-pointer ${selectedSize === size ? "bg-black text-white border-black font-semibold" : "border-neutral-200 hover:border-black text-neutral-700 bg-white"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-[10px] font-semibold text-red-500 animate-pulse mt-1 font-sans">
                    * Por favor, selecione o seu tamanho ideal de T-Shirt para adicionar.
                  </p>
                )}
              </div>

              {/* Add to basket Action */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className={`w-full py-5 text-[11px] uppercase tracking-[0.4em] transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${addedAnimation ? "bg-emerald-600 text-white" : "bg-black hover:bg-neutral-900 text-white"}`}
                id="add-to-cart-drawer-btn"
              >
                {addedAnimation ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Adicionado</span>
                  </>
                ) : (
                  <>
                    <span>{selectedColor?.isPreOrder ? "Reservar (Stock Limitado)" : "Adicionar à Coleção"}</span>
                  </>
                )}
              </button>

              {/* Quality assurances pills */}
              <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-[10px] font-mono text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-neutral-400" />
                  <span>Costuras Ocultas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-neutral-400" />
                  <span>Entrega em 48 Horas</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <RefreshCw className="h-4 w-4 text-neutral-400" />
                  <span>Troca Grátis Simplificada em Angola</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Technical specifications tabs */}
          <div className="pt-6 border-t border-neutral-100">
            {/* Tab selector */}
            <div className="flex border-b border-neutral-100 text-xs font-mono text-neutral-400">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 pr-4 border-b transition-all uppercase ${activeTab === "details" ? "border-black text-black font-semibold" : "border-transparent hover:text-black"}`}
              >
                Guia de Detalhes
              </button>
              <button
                onClick={() => setActiveTab("fabric")}
                className={`py-2 px-4 border-b transition-all uppercase ${activeTab === "fabric" ? "border-black text-black font-semibold" : "border-transparent hover:text-black"}`}
              >
                Ficha do Tecido
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`py-2 px-4 border-b transition-all uppercase ${activeTab === "shipping" ? "border-black text-black font-semibold" : "border-transparent hover:text-black"}`}
              >
                Envio Consciente
              </button>
            </div>

            {/* Tab content screens */}
            <div className="py-4">
              {activeTab === "details" && (
                <ul className="space-y-2 text-xs text-neutral-600 font-sans leading-relaxed">
                  {product.details.map((item, id) => (
                    <li key={id} className="flex items-start gap-2">
                      <span className="text-black font-mono font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "fabric" && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-brand-sand p-3 border border-neutral-100 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Composição</span>
                    <p className="font-sans text-neutral-800">{product.fabricInfo.composition}</p>
                  </div>
                  <div className="bg-brand-sand p-3 border border-neutral-100 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Gramagem / Densidade</span>
                    <p className="font-sans text-neutral-800 font-semibold">{product.fabricInfo.weight}</p>
                  </div>
                  <div className="bg-brand-sand p-3 border border-neutral-100 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Sensação de Toque</span>
                    <p className="font-sans text-neutral-800">{product.fabricInfo.texture}</p>
                  </div>
                  <div className="bg-brand-sand p-3 border border-neutral-100 space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Origem de Fabrico</span>
                    <p className="font-sans text-neutral-800">{product.fabricInfo.origin}</p>
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="text-xs text-neutral-600 font-sans leading-relaxed space-y-2">
                  <p>
                    Acreditamos em <strong>produzir menos, mas fazer melhor.</strong> Todas as nossas encomendas são expedidas em caixas de craft reciclado e biodegradável, sem qualquer utilização de plástico descartável.
                  </p>
                  <p>
                    <strong>Portes Gratuitos:</strong> Para Luanda (Angola) em compras de valor igual ou superior a {formatPrice(75000)}. Para outros valores ou províncias de Angola, acresce taxa de distribuição simples de {formatPrice(3500)}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
