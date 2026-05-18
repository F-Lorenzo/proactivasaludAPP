import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Si ya está logueado, redirigir al dashboard correspondiente
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role) {
        redirect(`/dashboard/${userData.role}`);
      }
    }
  } catch {
    // Sin env vars configuradas — mostrar landing igual
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M5 7h8M3 11h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-base font-bold text-slate-900">Proactiva Salud</span>
        </div>
        <div className="flex-1" />
        <Link
          href="/login"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mr-4"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/pricing"
          className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-green-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          Empezar gratis
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-6">
          Piloto · Mayo 2025 · 100 personas seleccionadas
        </span>

        <h1 className="text-5xl font-bold text-slate-900 max-w-2xl leading-tight mb-5">
          Tu salud, acompañada{" "}
          <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            de por vida
          </span>
        </h1>

        <p className="text-xl text-slate-500 max-w-xl mb-10 leading-relaxed">
          Videoconsultas médicas, seguimiento personalizado y coaching de bienestar
          diseñado especialmente para mayores de 50 años.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/pricing"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold text-base rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
          >
            Empezar 14 días gratis →
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-slate-900 font-semibold text-base rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mt-20 text-left">
          {[
            {
              icon: "🩺",
              title: "Videoconsultas",
              desc: "Médicos especializados disponibles para vos, cuando los necesitás.",
            },
            {
              icon: "🤖",
              title: "IA de salud 24/7",
              desc: "Consultá síntomas, recordatorios y seguimiento inteligente.",
            },
            {
              icon: "💊",
              title: "Pastillero digital",
              desc: "Recordatorios de medicación y control de adherencia.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        © 2025 Proactiva Salud — Prevent360 · Todos los derechos reservados
      </footer>
    </div>
  );
}
