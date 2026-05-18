import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { message, patientName } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback si no hay API key configurada aún
    const fallbacks = [
      "Entiendo cómo te sentís. ¿Querés que programemos una consulta con tu médico para hablar mejor sobre esto?",
      "Gracias por compartirlo. Recordá seguir tus indicaciones médicas y ante cualquier duda, podés pedir un turno.",
      "Es importante que lo comentes con tu médico en la próxima consulta. ¿Te ayudo a agendar un turno?",
      "Eso es algo que vale la pena revisar con tu equipo de salud. ¿Querés que busquemos disponibilidad?",
    ];
    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return NextResponse.json({ reply });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: `Sos el acompañante digital de salud de Proactiva Salud, una plataforma de telemedicina preventiva para personas mayores de 50 años. Tu nombre es "Asistente Proactiva". Estás hablando con ${patientName}.

Tu rol es:
- Dar apoyo emocional y orientación de salud preventiva
- Recordar tomar medicamentos y asistir a turnos
- Sugerir consultar al médico ante síntomas
- Responder con calidez, claridad y lenguaje simple (sin jerga médica)
- NUNCA diagnosticar ni recetar medicamentos
- Ante emergencias, indicar llamar al 107 (SAME) inmediatamente

Respondé siempre en español rioplatense. Máximo 2 oraciones. Sé empático y útil.`,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? "No pude procesar tu consulta. Intentá de nuevo.";

    // Guardar conversación en Supabase
    await supabase.from("ai_conversations").insert({
      patient_id: user.id,
      messages: [
        { role: "user", content: message, timestamp: new Date().toISOString() },
        { role: "assistant", content: reply, timestamp: new Date().toISOString() },
      ],
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { reply: "Lo siento, no puedo responder en este momento. Si es urgente, llamá al 107." },
      { status: 200 }
    );
  }
}
