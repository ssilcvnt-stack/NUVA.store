import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Product, ProductColor, CartItem } from "../types";
import { formatPrice } from "../data";

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  color?: ProductColor;
  size?: string;
  quantity?: number;
  cartItems?: CartItem[];
}

export function WhatsAppOrderModal({
  isOpen,
  onClose,
  product,
  color,
  size,
  quantity,
  cartItems
}: WhatsAppOrderModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const orderItems = cartItems || [
      {
        product: product!,
        selectedColor: color!,
        selectedSize: size!,
        quantity: quantity!
      }
    ];

    const subtotal = orderItems.reduce(
      (sum, item) => sum + (item.selectedColor.priceOverride || item.product.price) * item.quantity,
      0
    );

    const isLuanda = city.trim().toLowerCase() === "luanda" || city.trim() === "";
    const shipping = isLuanda ? 0 : subtotal * 0.25;
    const total = subtotal + shipping;

    const orderId = `WA-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderData = {
      id: orderId,
      createdAt: new Date().toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      customerInfo: {
        firstName,
        lastName,
        email: email || "N/A",
        phone,
        address,
        city,
        country: "Angola",
        paymentMethod: "whatsapp"
      },
      items: orderItems,
      total: total
    };

    try {
      await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
    } catch (err) {
      console.error("Failed to send order data:", err);
    } finally {
      setIsLoading(false);
      
      const itemsText = orderItems.map(item => `- ${item.quantity}x ${item.product.name} (${item.selectedColor.name}, Tam: ${item.selectedSize})`).join('\n');
      const message = `Olá! Gostaria de fazer uma encomenda:\n${itemsText}\n\nNome: ${firstName} ${lastName}\nMorada: ${address}, ${city}\n\nTotal estimado: ${formatPrice(total)}`;
      
      window.open(`https://wa.me/244941429171?text=${encodeURIComponent(message)}`, '_blank');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-mono text-xs uppercase tracking-widest font-semibold text-black">
            Pedido via WhatsApp
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-neutral-500 mb-6 font-sans">
            Para agilizar o seu pedido via WhatsApp, por favor forneça os dados de entrega.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Nome <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-b border-neutral-200 py-2 text-sm focus:border-black focus:outline-none transition-colors bg-transparent rounded-none"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Apelido <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-b border-neutral-200 py-2 text-sm focus:border-black focus:outline-none transition-colors bg-transparent rounded-none"
                  placeholder="Seu apelido"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Telefone <span className="text-red-500">*</span></label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border-b border-neutral-200 py-2 text-sm focus:border-black focus:outline-none transition-colors bg-transparent rounded-none"
                placeholder="Nº de telemóvel"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Email <span className="text-neutral-400 font-sans lowercase text-[10px] tracking-normal">(opcional)</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-neutral-200 py-2 text-sm focus:border-black focus:outline-none transition-colors bg-transparent rounded-none"
                placeholder="Seu email"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Morada de Entrega <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-b border-neutral-200 py-2 text-sm focus:border-black focus:outline-none transition-colors bg-transparent rounded-none"
                placeholder="Rua, bairro, ponto de referência"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Cidade / Província <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-b border-neutral-200 py-2 text-sm focus:border-black focus:outline-none transition-colors bg-transparent rounded-none"
                placeholder="Ex: Luanda"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 text-[11px] uppercase tracking-widest font-mono font-medium transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    <span>Continuar para o WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
