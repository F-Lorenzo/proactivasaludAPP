import { NextRequest, NextResponse } from "next/server";
import { getMPClient, PLANS, PreApproval, type PlanKey } from "@/lib/mercadopago";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { plan } = (await req.json()) as { plan: PlanKey };
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    // ── Demo mode (sin credenciales) ─────────────────────────────────────────
    const client = getMPClient();
    if (!client) {
      return NextResponse.json({
        init_point: `/dashboard/paciente?demo=subscription&plan=${plan}`,
        demo: true,
      });
    }

    // ── Datos del usuario ─────────────────────────────────────────────────────
    const { data: userData } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const selectedPlan = PLANS[plan];
    const origin = req.nextUrl.origin;

    // ── Crear suscripción con preapproval ─────────────────────────────────────
    // Si tiene plan_id configurado en MP Dashboard, usamos ese plan
    // Si no, creamos suscripción ad-hoc con auto_recurring
    const preApproval = new PreApproval(client);

    const body = selectedPlan.planId
      ? {
          // Suscripción basada en plan pre-creado en MP Dashboard
          preapproval_plan_id: selectedPlan.planId,
          payer_email: userData?.email ?? user.email!,
          external_reference: `${user.id}|${plan}`,
          back_url: `${origin}/dashboard/paciente?success=true&plan=${plan}`,
          status: "pending" as const,
        }
      : {
          // Suscripción ad-hoc (sin plan pre-creado)
          reason: `Plan ${selectedPlan.name} — Proactiva Salud`,
          payer_email: userData?.email ?? user.email!,
          external_reference: `${user.id}|${plan}`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months" as const,
            transaction_amount: selectedPlan.priceARS,
            currency_id: "ARS" as const,
          },
          back_url: `${origin}/dashboard/paciente?success=true&plan=${plan}`,
          status: "pending" as const,
        };

    const result = await preApproval.create({ body });

    if (!result.init_point) {
      throw new Error("MercadoPago no devolvió init_point");
    }

    return NextResponse.json({ init_point: result.init_point });
  } catch (err) {
    console.error("[mp/checkout]", err);
    return NextResponse.json({ error: "Error al crear suscripción" }, { status: 500 });
  }
}
