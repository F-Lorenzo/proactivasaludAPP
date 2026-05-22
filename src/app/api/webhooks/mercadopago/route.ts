import { NextRequest, NextResponse } from "next/server";
import { getMPClient, PreApproval } from "@/lib/mercadopago";
import { createServiceClient } from "@/utils/supabase/service";

/**
 * Webhook de MercadoPago — Suscripciones (Preapproval)
 *
 * Configurar en: https://www.mercadopago.com.ar/developers/panel/webhooks
 * URL: https://proactivasalud-app.vercel.app/api/webhooks/mercadopago
 * Eventos a escuchar: subscription_preapproval
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP envía: { action, api_version, data: { id }, type }
    const { type, data, action } = body as {
      type: string;
      action: string;
      data: { id: string };
    };

    // Solo procesar suscripciones
    if (type !== "subscription_preapproval") {
      return NextResponse.json({ received: true, skipped: true });
    }

    const client = getMPClient();
    if (!client || !data?.id) {
      return NextResponse.json({ received: true, demo: true });
    }

    // ── Obtener detalles de la suscripción desde MP ────────────────────────────
    const preApproval = new PreApproval(client);
    const sub = await preApproval.get({ id: data.id });

    if (!sub || !sub.external_reference) {
      return NextResponse.json({ received: true, no_ref: true });
    }

    // external_reference = "userId|plan"
    const [userId, plan] = sub.external_reference.split("|");
    if (!userId) return NextResponse.json({ received: true, no_user: true });

    // ── Mapear estado de MP a nuestro modelo ──────────────────────────────────
    const mpStatus = sub.status;
    const status: "active" | "canceled" | "past_due" | "pending" =
      mpStatus === "authorized" ? "active"
      : mpStatus === "cancelled" ? "canceled"
      : mpStatus === "paused" ? "past_due"
      : mpStatus === "pending" ? "pending"
      : "canceled";

    const periodEnd = sub.next_payment_date
      ? new Date(sub.next_payment_date).toISOString()
      : null;

    // ── Guardar en Supabase ───────────────────────────────────────────────────
    const supabase = createServiceClient();

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      mp_subscription_id: sub.id,
      plan: plan ?? "basic",
      status,
      ...(periodEnd ? { period_end: periodEnd } : {}),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    console.log(`[mp/webhook] ${action} → user=${userId} plan=${plan} status=${status}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[mp/webhook]", err);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}
