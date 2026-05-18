import type { Appointment } from "@/types";

interface Props {
  appointments: Appointment[];
}

const BADGE_MAP: Record<string, { label: string; cls: string }> = {
  completado: { label: "Consulta", cls: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Confirmado", cls: "bg-green-100 text-green-700" },
  pendiente:  { label: "Pendiente", cls: "bg-amber-100 text-amber-700" },
  cancelado:  { label: "Cancelado", cls: "bg-red-100 text-red-700" },
};

const DOT_COLOR: Record<string, string> = {
  completado: "bg-blue-500",
  confirmado: "bg-green-500",
  pendiente:  "bg-amber-500",
  cancelado:  "bg-red-500",
};

// Historial demo para cuando la BD aún no tiene datos
const DEMO_HISTORY = [
  {
    id: "1",
    doctor: "Dra. Ramírez",
    specialty: "Endocrinología",
    detail: "Control de glucosa. Ajuste de dosis Metformina.",
    date: "24 Abr 2026",
    status: "completado",
  },
  {
    id: "2",
    doctor: "Lab. Central",
    specialty: "Bioquímica",
    detail: "Hemograma completo. Resultados dentro de rango normal.",
    date: "10 Abr 2026",
    status: "completado",
  },
  {
    id: "3",
    doctor: "Dr. Vega",
    specialty: "Cardiología",
    detail: "Revisión rutinaria. Presión arterial estable.",
    date: "28 Mar 2026",
    status: "completado",
  },
];

export default function ClinicalHistory({ appointments }: Props) {
  const pastAppointments = appointments
    .filter((a) => new Date(a.scheduled_at) < new Date())
    .slice(0, 5);

  const showDemo = pastAppointments.length === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex justify-between items-center mb-3">
        <p className="text-[12.5px] font-semibold text-slate-900">Historial clínico</p>
        <button className="text-[11px] text-green-600 bg-green-50 rounded-lg px-3 py-1 font-medium hover:bg-green-100 transition">
          Ver completo
        </button>
      </div>

      <div>
        {showDemo
          ? DEMO_HISTORY.map((item, i) => {
              const badge = BADGE_MAP[item.status];
              const dotColor = DOT_COLOR[item.status];
              const isLast = i === DEMO_HISTORY.length - 1;
              return (
                <div key={item.id} className={`flex gap-3 py-2.5 ${!isLast ? "border-b border-slate-50" : ""}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${dotColor}`} />
                    {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-slate-900">{item.doctor}</span>
                        {badge && (
                          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.specialty} · {item.detail}
                    </p>
                  </div>
                </div>
              );
            })
          : pastAppointments.map((apt, i) => {
              const badge = BADGE_MAP[apt.status] ?? { label: apt.status, cls: "bg-slate-100 text-slate-600" };
              const dotColor = DOT_COLOR[apt.status] ?? "bg-slate-400";
              const isLast = i === pastAppointments.length - 1;
              const d = new Date(apt.scheduled_at);
              const dateStr = d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
              return (
                <div key={apt.id} className={`flex gap-3 py-2.5 ${!isLast ? "border-b border-slate-50" : ""}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${dotColor}`} />
                    {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-slate-900">
                          {apt.specialty ?? "Consulta"}
                        </span>
                        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{dateStr}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {apt.modality} {apt.notes ? `· ${apt.notes}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
