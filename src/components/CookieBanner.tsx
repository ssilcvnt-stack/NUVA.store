import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("nuva-cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("nuva-cookie-consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-white border border-neutral-200 shadow-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex-1 pr-4">
            <h4 className="text-xs font-mono uppercase tracking-widest font-semibold text-black mb-2">
              Política de Cookies
            </h4>
            <p className="text-xs font-sans text-neutral-500 leading-relaxed max-w-2xl">
              Utilizamos cookies para melhorar a sua experiência, personalizar conteúdos e analisar o nosso tráfego. Ao continuar a navegar, concorda com a nossa política de cookies e privacidade.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsVisible(false)}
              className="px-4 py-2 text-xs font-mono tracking-widest text-neutral-500 hover:text-black transition-colors"
            >
              RECUSAR
            </button>
            <button
              onClick={acceptCookies}
              className="bg-black text-white px-6 py-2 text-xs font-mono tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            >
              ACEITAR
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 -mr-2 text-neutral-400 hover:text-black md:hidden"
            >
               <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
