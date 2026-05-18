"use client";

import { useState } from "react";
import Link from "next/link";
import type { Subscription } from "@/types";

interface Props {
  subscription: Subscription | null;
}

export default function SubscriptionBanner({ subscription }: Props) {
  const [portalLoading, setPortalLoading] = useState(false);

  // Ya tiene plan activo — mostrar estado
  if (subscription && subscription.status === "active") {
    const isPremium = subscription.plan === "premium";
    const periodEnd = subscription.period_end
      ? new Date(subscription.period_end).toLocaleDateString("es-AR", { day: "numeric", month: "long" })
      : null;

    return (
      <div className={`rounded-2xl p-4 flex items-center gap-4 ${
        isPremium
          ? "bg-gradient-to-r from-blue-600 to-green-500 text-white"
          : "bg-white border border-slate-200"
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isPremium ? "bg-white/20" : "bg-green-100"
        }`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isPremium ? "#fff" : "#16a34a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isPremium ? "text-white" : "text-slate-900"}`}>
            Plan {isPremium ? "Premium" : "Basic"} activo
          </p>
          {periodEnd && (
            <p className={`text-xs ${isPremium ? "text-white/70" : "text-slate-400"}`}>
              Próximo cobro: {periodEnd}
            </p>
          )}
        </div>
        <button
          onClick={async () => {
            setPortalLoading(true);
            try {
              const res = await fetch("/api/stripe/portal", { method: "POST" });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            } finally {
              setPortalLoading(false);
            }
          }}
          disabled={portalLoading}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
            isPremium
              ? "bg-white/20 text-white hover:bg-white/30"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {portalLoading ? "..." : "Gestionar"}
        </button>
      </div>
    );
  }

  // Sin plan o cancelado — CTA para suscribirse
  return (
    <Link
      href="/pricing"
      className="bg-white border border-dashed border-blue-300 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50/30 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">Activá tu plan de salud</p>
        <p className="text-xs text-slate-400">14 días gratis · Cancelá cuando quieras</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </Link>
  );
}
