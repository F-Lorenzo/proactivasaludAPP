export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function MedicoDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "medico") redirect(`/dashboard/${userData?.role}`);

  const { data: patients } = await supabase
    .from("patient_profiles")
    .select("*, users(*)")
    .eq("assigned_doctor_id", user.id);

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", user.id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M5 7h8M3 11h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-slate-900">Proactiva Salud — Panel Médico</span>
        <div className="flex-1" />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-xs font-bold">
          {userData?.full_name?.charAt(0) ?? "M"}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Pacientes activos</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{patients?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Turnos hoy</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{todayAppointments?.length ?? 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-xl p-5 text-white cursor-pointer">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Iniciar videoconsulta</p>
          <p className="text-lg font-bold mt-1">Nueva consulta →</p>
        </div>

        {/* Próximos turnos */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Agenda del día</h2>
          {todayAppointments && todayAppointments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="text-center w-14">
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(apt.scheduled_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{apt.specialty ?? "Consulta general"}</p>
                    <p className="text-xs text-slate-400">{apt.modality}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    apt.status === "confirmado" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>{apt.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No hay turnos programados hoy.</p>
          )}
        </div>

        {/* Lista de pacientes */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Mis pacientes</h2>
          {patients && patients.length > 0 ? (
            <div className="flex flex-col gap-2">
              {patients.slice(0, 8).map((p: Record<string, unknown>) => {
                const u = p.users as Record<string, unknown> | null;
                return (
                  <div key={p.id as string} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                      {(u?.full_name as string)?.charAt(0) ?? "P"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{(u?.full_name as string) ?? "Paciente"}</p>
                      <p className="text-xs text-slate-400">{u?.email as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No tenés pacientes asignados.</p>
          )}
        </div>
      </main>
    </div>
  );
}
