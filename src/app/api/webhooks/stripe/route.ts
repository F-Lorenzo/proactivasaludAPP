import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/utils/supabase/service";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ received: true, demo: true });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Sin firma de webhook" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Firma inválida:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Manejar eventos ────────────────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan ?? "basic";
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId) break;

      // Guardar suscripción — period_end se actualiza vía subscription.updated
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan,
        status: "active",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription & {
        current_period_end: number;
      };
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;

      const status: "active" | "canceled" | "past_due" | "trialing" =
        sub.status === "active" ? "active"
        : sub.status === "canceled" ? "canceled"
        : sub.status === "past_due" ? "past_due"
        : sub.status === "trialing" ? "trialing"
        : "canceled";

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        status,
        ...(periodEnd ? { period_end: periodEnd } : {}),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", customerId);

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
