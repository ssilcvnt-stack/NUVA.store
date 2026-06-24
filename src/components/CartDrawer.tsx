/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Plus, Minus, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import { CartItem } from "../types";
import { formatPrice } from "../data";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.selectedColor.priceOverride || item.product.price) * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in" id="cart-drawer-overlay">
      {/* Backdrop clicks */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Cart Drawer layout */}
      <div className="bg-white text-black w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-black/10" id="cart-drawer-container">
        {/* Header bar */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center space-x-2">
            <h3 className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-neutral-900">
              O Seu Saco de Compras
            </h3>
            <span className="bg-black text-white text-[10px] font-mono h-5 w-5 rounded-full flex items-center justify-center font-bold">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-neutral-500 hover:text-black hover:rotate-90 transition-all duration-200"
            id="close-cart-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping logic progress */}
        {cartItems.length > 0 && (
          <div className="bg-brand-sand px-6 py-4 border-b border-neutral-100 text-xs text-neutral-700 font-sans">
              <p className="flex items-center gap-1.5 font-medium text-neutral-900">
                <ShieldCheck className="h-4.5 w-4.5 text-black" />
                <span>As suas peças têm <strong>Entrega Expressa Gratuita</strong> para a cidade de Luanda.</span>
              </p>
          </div>
        )}

        {/* Scrollable list items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-4xl">🏷️</span>
              <div className="space-y-1 text-center">
                <h4 className="font-sans font-semibold text-[11px] uppercase tracking-[0.2em] text-neutral-900">
                  O saco está vazio
                </h4>
                <p className="font-sans italic text-xs text-neutral-500 max-w-xs mx-auto">
                  Ainda não adicionou peças essenciais ao seu carrinho de compras.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 text-xs font-mono uppercase bg-black hover:bg-neutral-800 text-white py-2.5 px-5 transition-colors"
              >
                Explorar T-Shirts
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-3 border border-neutral-100 hover:border-neutral-200 transition-colors bg-brand-offwhite"
                id={`cart-item-${item.id}`}
              >
                {/* Image preview */}
                <div className="h-20 w-15 flex-shrink-0 overflow-hidden bg-white border border-neutral-100">
                  <img
                    src={item.selectedColor.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info and modifiers */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-sans text-[11px] font-semibold text-neutral-800 uppercase tracking-wider truncate max-w-[180px]">
                        {item.product.name}
                      </h4>
                      <span className="font-mono text-xs font-semibold">
                        {formatPrice((item.selectedColor.priceOverride || item.product.price) * item.quantity)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-2 text-[10px] font-mono text-neutral-500">
                      <span>Cor: {item.selectedColor.name}</span>
                      <span>•</span>
                      <span>Tam: {item.selectedSize}</span>
                    </div>
                  </div>

                  {/* Quantity and Delete layout */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-neutral-200 bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 px-2 text-neutral-600 hover:text-black hover:bg-neutral-50"
                        id={`decrease-qty-${item.id}`}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 font-mono text-xs font-semibold text-neutral-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 px-2 text-neutral-600 hover:text-black hover:bg-neutral-50"
                        id={`increase-qty-${item.id}`}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                      aria-label="Remover item"
                      id={`delete-item-${item.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions for checkout */}
        {cartItems.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-neutral-100 p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-500 font-mono">
                <span>SUBTOTAL</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500 font-mono">
                <span>PORTES ESTIMADOS</span>
                <span>GRÁTIS (LUANDA)</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-neutral-900 font-mono pt-1.5 border-t border-dashed border-neutral-200">
                <span>TOTAL ESTIMADO</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCheckout}
              className="w-full bg-black hover:bg-neutral-900 text-white py-5 text-[11px] uppercase tracking-[0.4em] transition-colors flex items-center justify-center gap-2 group cursor-pointer"
              id="begin-checkout-btn"
            >
              <span>Finalizar Compra</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => {
                const message = `Olá! Gostaria de fazer uma encomenda:\n\n` + 
                  cartItems.map(item => `- ${item.quantity}x ${item.product.name} (${item.selectedColor.name}, Tam: ${item.selectedSize}) - ${formatPrice((item.selectedColor.priceOverride || item.product.price) * item.quantity)}`).join('\n') +
                  `\n\nTotal estimado: ${formatPrice(subtotal)}`;
                window.open(`https://wa.me/244941429171?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 text-[11px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 font-semibold mt-3"
              id="whatsapp-checkout-btn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              <span>Encomendar pelo WhatsApp</span>
            </button>

            <div className="text-[10px] text-center text-neutral-400 font-sans italic">
              Pagamento 100% Seguro por Multicaixa Express, Cartão ou Transferência Bancária.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
