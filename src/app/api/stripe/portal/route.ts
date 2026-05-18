import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // ── Demo mode ─────────────────────────────────────────────────────────────
    if (!stripe) {
      return NextResponse.json({
        url: `/dashboard/paciente?demo=portal`,
        demo: true,
      });
    }

    // ── Buscar customer_id ────────────────────────────────────────────────────
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "Sin suscripción activa" }, { status: 404 });
    }

    // ── Crear sesión del portal ───────────────────────────────────────────────
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/dashboard/paciente`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json({ error: "Error al abrir portal" }, { status: 500 });
  }
}
