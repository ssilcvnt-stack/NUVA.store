import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="border border-neutral-200 p-6 md:p-8 bg-white" id="newsletter-panel">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-1 mb-6 text-center">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold block">
            newsletter
          </span>
          <h3 className="text-2xl font-light text-neutral-900 tracking-normal capitalize">
            Acesso Exclusivo – Nuva
          </h3>
          <p className="text-[11px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Junte-se ao nosso círculo íntimo. Receba convites para pré-lançamentos limitados, edições de arquivo e notas do nosso atelier. Prometemos nunca enviar spam.
          </p>
        </div>

        {isSubscribed ? (
          <div className="flex flex-col items-center justify-center p-6 bg-brand-sand border border-neutral-100 text-center animate-fade-in space-y-2">
             <CheckCircle2 className="h-6 w-6 text-black mb-2" />
             <h4 className="font-sans font-semibold text-sm uppercase tracking-wider text-black">
               Bem-vindo(a) ao Editorial
             </h4>
             <p className="text-xs font-sans text-neutral-600">
               O seu email foi adicionado à lista restrita da NUVA Labs.
             </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Mail className="h-4 w-4 stroke-[1.5]" />
              </span>
              <input
                type="email"
                placeholder="Insira o seu endereço de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-neutral-200 py-3.5 pl-10 pr-4 text-xs font-mono tracking-wide focus:outline-none focus:border-black transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white px-6 py-0 font-mono text-[10px] uppercase font-semibold tracking-widest flex items-center gap-2 hover:bg-neutral-800 transition-colors"
            >
              <span className="hidden sm:inline">Subscrever</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
