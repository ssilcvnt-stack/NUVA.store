import React, { useState } from "react";
import { X, Rss, Loader2, Check } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { db, auth } from "../lib/firebase";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isHoveringReCaptcha, setIsHoveringReCaptcha] = useState(false);
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !isCaptchaChecked) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      await addDoc(collection(db, "newsletter"), {
        name,
        email,
        createdAt: serverTimestamp()
      });
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        setEmail("");
        setIsCaptchaChecked(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      setErrorMsg("Ocorreu um erro. Tente novamente mais tarde.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Auto-fill form
      setName(user.displayName || "");
      setEmail(user.email || "");
    } catch (error: any) {
      console.error("Login errorMessage:", error);
      if (error.code === 'auth/popup-blocked') {
        alert('Popup blocked! Please allow popups or open this app in a new tab to login.');
      } else if (error.message && error.message.includes("INTERNAL ASSERTION FAILED")) {
        alert("Ocorreu um erro interno de autenticação, possivelmente devido à execução em um iframe. Por favor, abra o aplicativo em uma nova aba para fazer o login.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] transition-opacity">
      <div 
        className="bg-[#FAF9F6] w-full max-w-2xl relative shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ... */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-600 hover:text-black transition-colors"
        >
          <X className="h-5 w-5 font-bold" />
        </button>

        <div className="p-10 md:p-14 mb-4">
          <div className="text-center mb-10">
            <h4 className="text-neutral-500 font-sans text-sm mb-2">
              Boletim informativo oficial
            </h4>
            <h2 className="text-4xl font-serif text-neutral-900 tracking-tight">
              Inscreva-se
            </h2>
          </div>

          {isSuccess ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-serif mb-2">Obrigado por subscrever!</h3>
              <p className="text-neutral-500 font-sans text-sm">Em breve receberá as nossas novidades.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-sans text-neutral-600">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-sans text-neutral-600">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              {/* Mock ReCaptcha */}
              <div 
                className="border border-neutral-300 bg-[#f9f9f9] p-3 rounded-sm flex items-center justify-between shadow-sm cursor-pointer w-72"
                onClick={() => setIsCaptchaChecked(true)}
                onMouseEnter={() => setIsHoveringReCaptcha(true)}
                onMouseLeave={() => setIsHoveringReCaptcha(false)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 border-2 rounded-sm flex items-center justify-center transition-colors ${isCaptchaChecked ? 'border-green-600 bg-green-50' : (isHoveringReCaptcha ? 'border-neutral-400' : 'border-neutral-300 bg-white')}`}>
                    {isCaptchaChecked && <div className="w-3 h-3 border-b-2 border-r-2 border-green-600 transform rotate-45 mb-1" />}
                  </div>
                  <span className="text-[13px] font-sans text-neutral-700">Não sou um robô</span>
                </div>
                <div className="flex flex-col items-center">
                  <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 mb-1" />
                  <span className="text-[8px] text-neutral-500 font-sans">reCAPTCHA</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !name || !email || !isCaptchaChecked}
                  className="w-full border border-neutral-800 bg-black hover:bg-neutral-800 text-white px-5 py-2.5 text-[13px] font-sans flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Rss className="h-3.5 w-3.5" />
                  )}
                  Inscreva-se
                </button>
                
                <div className="relative border-b flex items-center justify-center mt-2 mb-2">
                  <span className="absolute bg-[#FAF9F6] px-2 text-[11px] font-sans text-neutral-400">ou</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 px-5 py-2.5 text-[13px] font-sans flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Preencher dados com o Google
                </button>
              </div>
            </form>
          )}

          {/* Bottom fixed close button based on image reference */}
          {!isSuccess && (
            <div className="mt-16 flex justify-center border-t border-transparent pt-4">
              <button 
                onClick={onClose}
                className="flex items-center gap-1 border border-neutral-400 px-4 py-1.5 text-[13px] font-sans hover:bg-neutral-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
