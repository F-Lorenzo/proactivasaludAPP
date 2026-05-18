"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, formatPrice } from "@/lib/stripe";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"basic" | "premium" | null>(null);

  async function handleSubscribe(plan: "basic" | "premium") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        router.push(data.url);
      } else {
        alert("Error al procesar el pago. Intentá de nuevo.");
      }
    } catch {
      alert("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M5 7h8M3 11h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-slate-900">Proactiva Salud</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-4">
            14 días gratis · Sin tarjeta requerida
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Elegí tu plan de salud
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Accedé a tu equipo médico, IA de salud y coaching de bienestar. Cancelá cuando quieras.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Basic */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Basic</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">
                  {formatPrice(PLANS.basic.price)}
                </span>
                <span className="text-slate-400 text-sm">/mes</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Para empezar tu camino de salud</p>
            </div>

            <ul className="flex flex-col gap-3 flex-1 mb-8">
              {PLANS.basic.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe("basic")}
              disabled={!!loading}
              className="w-full py-3 rounded-xl border-2 border-slate-900 text-slate-900 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-50"
            >
              {loading === "basic" ? "Procesando..." : "Empezar con Basic"}
            </button>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-xl shadow-blue-500/20">
            {/* decorative */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white/05" />

            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Premium</p>
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">Recomendado</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {formatPrice(PLANS.premium.price)}
                </span>
                <span className="text-white/70 text-sm">/mes</span>
              </div>
              <p className="text-sm text-white/80 mt-2">Todo lo que necesitás para vivir mejor</p>
            </div>

            <ul className="flex flex-col gap-3 flex-1 mb-8 relative z-10">
              {PLANS.premium.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white">
                  <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe("premium")}
              disabled={!!loading}
              className="w-full py-3 rounded-xl bg-white text-blue-600 font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-50 relative z-10"
            >
              {loading === "premium" ? "Procesando..." : "Empezar con Premium"}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-8 max-w-md">
          Al suscribirte aceptás los{" "}
          <a href="#" className="underline hover:text-slate-600">términos de servicio</a>
          {" "}y la{" "}
          <a href="#" className="underline hover:text-slate-600">política de privacidad</a>.
          Podés cancelar tu suscripción en cualquier momento desde tu cuenta.
        </p>
      </main>
    </div>
  );
}
