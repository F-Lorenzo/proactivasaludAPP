import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isMPConfigured } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    // ── Demo mode ─────────────────────────────────────────────────────────────
    if (!isMPConfigured()) {
      return NextResponse.json({
        url: `/dashboard/paciente?demo=portal`,
        demo: true,
      });
    }

    // ── Obtener subscription_id ───────────────────────────────────────────────
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("mp_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.mp_subscription_id) {
      return NextResponse.json({ error: "Sin suscripción activa" }, { status: 404 });
    }

    // MercadoPago no tiene portal hosted como Stripe.
    // Redirigimos al panel de suscripciones de MP del usuario.
    const portalUrl = `https://www.mercadopago.com.ar/subscriptions`;

    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    console.error("[mp/portal]", err);
    return NextResponse.json({ error: "Error al abrir portal" }, { status: 500 });
  }
}
