import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") redirect(`/dashboard/${userData?.role}`);

  const [
    { count: totalPacientes },
    { count: totalMedicos },
    { count: totalAppointments },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "paciente"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "medico"),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M5 7h8M3 11h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-slate-900">Proactiva Salud — Admin</span>
        <div className="flex-1" />
        <span className="text-xs bg-slate-900 text-white px-3 py-1 rounded-full font-medium">Admin</span>
      </header>

      <main className="max-w-6xl mx-auto p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Pacientes activos</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{totalPacientes ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Médicos</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{totalMedicos ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Consultas totales</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{totalAppointments ?? 0}</p>
          </div>
        </div>

        {/* Usuarios recientes */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Usuarios recientes</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left pb-3">Nombre</th>
                <th className="text-left pb-3">Email</th>
                <th className="text-left pb-3">Rol</th>
                <th className="text-left pb-3">Registro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers?.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-medium text-slate-900">{u.full_name ?? "—"}</td>
                  <td className="py-3 text-slate-500">{u.email}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.role === "admin" ? "bg-slate-900 text-white" :
                      u.role === "medico" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
