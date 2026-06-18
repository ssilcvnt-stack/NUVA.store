import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate sending
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ nome: "", email: "", mensagem: "" });
      
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <section className="max-w-3xl mx-auto px-4 mt-20 md:mt-32 mb-20" id="contato">
      <h2 className="text-center text-xl md:text-2xl font-sans tracking-[0.3em] lowercase mb-12">
        contato
      </h2>
      
      {submitted ? (
        <div className="text-center py-12 border border-neutral-100 bg-neutral-50">
          <p className="text-sm text-neutral-600 tracking-wider">Obrigado. A sua mensagem foi enviada com sucesso.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Nome"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full border border-neutral-200 p-4 text-sm font-sans focus:outline-none focus:border-black transition-colors placeholder:text-neutral-400"
            />
            <input
              type="email"
              placeholder="E-mail"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-neutral-200 p-4 text-sm font-sans focus:outline-none focus:border-black transition-colors placeholder:text-neutral-400"
            />
          </div>
          
          <textarea
            placeholder="Mensagem"
            required
            rows={5}
            value={formData.mensagem}
            onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
            className="w-full border border-neutral-200 p-4 text-sm font-sans focus:outline-none focus:border-black transition-colors placeholder:text-neutral-400 resize-y"
          />
          
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.nome || !formData.email || !formData.mensagem}
              className="text-xs md:text-sm tracking-[0.2em] lowercase text-neutral-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "enviando..." : "enviar mensagem"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
