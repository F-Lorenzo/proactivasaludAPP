import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from "mercadopago";

// ─── Cliente MercadoPago ───────────────────────────────────────────────────────
export function getMPClient(): MercadoPagoConfig | null {
  if (!process.env.MP_ACCESS_TOKEN) return null;
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 10000 },
  });
}

export function isMPConfigured(): boolean {
  return !!process.env.MP_ACCESS_TOKEN;
}

// ─── Países soportados en LATAM ───────────────────────────────────────────────
export const LATAM_COUNTRIES = [
  { code: "AR", name: "Argentina",        currency: "ARS", flag: "🇦🇷" },
  { code: "BR", name: "Brasil",           currency: "BRL", flag: "🇧🇷" },
  { code: "MX", name: "México",           currency: "MXN", flag: "🇲🇽" },
  { code: "CL", name: "Chile",            currency: "CLP", flag: "🇨🇱" },
  { code: "CO", name: "Colombia",         currency: "COP", flag: "🇨🇴" },
  { code: "UY", name: "Uruguay",          currency: "UYU", flag: "🇺🇾" },
  { code: "PE", name: "Perú",             currency: "PEN", flag: "🇵🇪" },
  { code: "BO", name: "Bolivia",          currency: "BOB", flag: "🇧🇴" },
  { code: "PY", name: "Paraguay",         currency: "PYG", flag: "🇵🇾" },
  { code: "EC", name: "Ecuador",          currency: "USD", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela",        currency: "USD", flag: "🇻🇪" },
  { code: "DO", name: "Rep. Dominicana",  currency: "USD", flag: "🇩🇴" },
] as const;

// ─── Planes de suscripción ────────────────────────────────────────────────────
// Precios en USD — MercadoPago convierte a moneda local automáticamente
export const PLANS = {
  basic: {
    name: "Basic",
    priceUSD: 15,
    // Precio en ARS de referencia (se actualiza según paridad)
    priceARS: 15000,
    planId: process.env.MP_PLAN_BASIC ?? "",
    features: [
      "1 consulta médica/mes",
      "Chat con IA ilimitado",
      "Historial clínico digital",
      "Recordatorios de medicación",
    ],
  },
  premium: {
    name: "Premium",
    priceUSD: 29,
    priceARS: 29000,
    planId: process.env.MP_PLAN_PREMIUM ?? "",
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

// ─── Re-exportar helpers del SDK ─────────────────────────────────────────────
export { PreApproval, PreApprovalPlan, Payment };
