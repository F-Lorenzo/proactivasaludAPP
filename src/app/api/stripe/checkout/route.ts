import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { plan } = (await req.json()) as { plan: PlanKey };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    // ── Demo mode (sin Stripe key) ─────────────────────────────────────────────
    if (!stripe) {
      return NextResponse.json({
        url: `/dashboard/paciente?demo=subscription&plan=${plan}`,
        demo: true,
      });
    }

    // ── Buscar o crear customer en Stripe ─────────────────────────────────────
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id;

    if (!customerId) {
      const { data: userData } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      const customer = await stripe.customers.create({
        email: userData?.email ?? user.email!,
        name: userData?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // ── Crear sesión de checkout ───────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/dashboard/paciente?success=true&plan=${plan}`,
      cancel_url: `${req.nextUrl.origin}/pricing?canceled=true`,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
      },
      locale: "es-419",
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Error al crear sesión de pago" }, { status: 500 });
  }
}
