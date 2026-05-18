import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PacienteDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "paciente") redirect(`/dashboard/${userData?.role}`);

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", user.id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(14);

  const { data: medications } = await supabase
    .from("medications_reminders")
    .select("*")
    .eq("patient_id", user.id)
    .eq("active", true);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Topbar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M5 7h8M3 11h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-slate-900">Proactiva Salud</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-600 font-semibold">En vivo</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold ml-3">
          {userData?.full_name?.charAt(0) ?? "P"}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-200 min-h-[calc(100vh-56px)] flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {userData?.full_name?.charAt(0) ?? "P"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{userData?.full_name ?? "Paciente"}</p>
              <p className="text-xs text-slate-400">Paciente activa</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Plan Premium</span>
            </div>
          </div>
          {profile && (
            <div className="p-4 border-b border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Indicadores</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-base font-bold text-slate-900">{profile.weight ?? "—"}</p>
                  <p className="text-[9px] text-slate-400">kg</p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-base font-bold text-slate-900">{profile.height ?? "—"}</p>
                  <p className="text-[9px] text-slate-400">m</p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-base font-bold text-slate-900">{profile.imc ?? "—"}</p>
                  <p className="text-[9px] text-slate-400">IMC</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* CTA Pedir Turno */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-5 text-white flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M12 14v4M10 16h4"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">Pedir turno</p>
              <p className="text-sm opacity-90">Reservá una consulta con tu equipo · Disponibilidad inmediata</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>

          {/* Próximos turnos */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Próximos turnos</h2>
            {appointments && appointments.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {appointments.map((apt) => {
                  const d = new Date(apt.scheduled_at);
                  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
                  return (
                    <div key={apt.id} className="flex-shrink-0 w-14 bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                      <p className="text-[9px] text-slate-400">{days[d.getDay()]}</p>
                      <p className="text-base font-bold text-slate-900">{d.getDate()}</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mx-auto mt-1" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No hay turnos próximos. ¡Agendá uno!</p>
            )}
          </div>

          {/* Medicamentos del día */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Pastillero de hoy</h2>
            {medications && medications.length > 0 ? (
              <div className="flex flex-col gap-2">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{med.medication_name}</p>
                      <p className="text-xs text-slate-400">{med.times.join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No hay medicamentos registrados.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
