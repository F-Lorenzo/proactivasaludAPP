import Stripe from "stripe";

// ─── Cliente Stripe (server-only) ─────────────────────────────────────────────
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ─── Planes ───────────────────────────────────────────────────────────────────
export const PLANS = {
  basic: {
    name: "Basic",
    price: 4900, // ARS cents → $49
    priceId: process.env.STRIPE_PRICE_BASIC ?? "",
    features: [
      "1 consulta médica/mes",
      "Chat con IA ilimitado",
      "Historial clínico digital",
      "Recordatorios de medicación",
    ],
  },
  premium: {
    name: "Premium",
    price: 9900, // ARS cents → $99
    priceId: process.env.STRIPE_PRICE_PREMIUM ?? "",
    features: [
      "Consultas ilimitadas",
      "Chat con IA ilimitado",
      "Historial clínico digital",
      "Recordatorios de medicación",
      "Coaching grupal semanal",
      "Acceso a programas de bienestar",
      "Soporte prioritario 24/7",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
