import type { User, PatientProfile, MedicationReminder } from "@/types";

interface Props {
  user: User;
  profile: PatientProfile | null;
  medications: MedicationReminder[];
}

export default function PatientSidebar({ user, profile, medications }: Props) {
  const initials = (user.full_name ?? "P")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const todayDow = new Date().getDay();
  const todayMeds = medications.filter((m) => m.days.includes(todayDow));

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col overflow-y-auto flex-shrink-0">
      {/* Perfil */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-900 truncate">{user.full_name ?? "Paciente"}</p>
          <p className="text-[11px] text-slate-400">Paciente activa</p>
          <span className="inline-block mt-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            Plan Premium
          </span>
        </div>
      </div>

      {/* Indicadores vitales */}
      {profile && (
        <div className="p-4 border-b border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Indicadores</p>
          <div className="flex gap-1.5">
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-slate-900">{profile.weight ?? "—"}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">kg</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-slate-900">{profile.height ?? "—"}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">m</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-slate-900">{profile.imc?.toFixed(1) ?? "—"}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">IMC</p>
              {profile.imc && (
                <p className="text-[8px] font-semibold text-green-600 mt-0.5">
                  {profile.imc < 18.5 ? "Bajo" : profile.imc < 25 ? "Normal" : profile.imc < 30 ? "Sobrepeso" : "Obesidad"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medicamentos hoy */}
      <div className="p-4 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Tratamientos hoy</p>
        {todayMeds.length > 0 ? (
          <div className="flex flex-col gap-2">
            {todayMeds.map((med, i) => (
              <div key={med.id} className="flex items-center gap-2">
                <div className={`w-[18px] h-[18px] rounded-full flex-shrink-0 border-2 flex items-center justify-center ${
                  i === 0 ? "bg-green-500 border-green-500" : "border-slate-200"
                }`}>
                  {i === 0 && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-[12px] ${i === 0 ? "text-slate-400 line-through" : "text-slate-900"}`}>
                    {med.medication_name}
                  </p>
                  <p className="text-[10px] text-slate-400">{med.times[0]}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">Sin medicamentos hoy</p>
        )}
      </div>

      {/* Progreso planes */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[12px] font-semibold text-slate-900">Plan de nutrición</p>
          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">72%</span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">Próx. consulta en 5 días</p>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: "72%" }} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[12px] font-semibold text-slate-900">Bienestar físico</p>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">45%</span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">Próx. consulta en 12 días</p>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }} />
        </div>
      </div>
    </aside>
  );
}
