import type { Appointment } from "@/types";

interface Props {
  appointments: Appointment[];
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function AppointmentCalendar({ appointments }: Props) {
  const today = new Date();

  // Construir los 14 días
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  // Set de fechas con turno (solo año-mes-día)
  const appointmentDates = new Set(
    appointments.map((a) => {
      const d = new Date(a.scheduled_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-[12.5px] font-semibold text-slate-900">Calendario de turnos</p>
          <p className="text-[11px] text-slate-400">Próximas consultas y citas</p>
        </div>
        <button className="text-[11.5px] text-green-600 bg-green-50 border-none rounded-lg px-3 py-1 font-medium hover:bg-green-100 transition">
          Ver todo
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {days.map((d, i) => {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const isToday = i === 0;
          const hasEvent = appointmentDates.has(key);

          return (
            <div
              key={key}
              className={`flex-shrink-0 w-[50px] rounded-xl p-1.5 text-center cursor-pointer border transition hover:-translate-y-0.5 ${
                isToday
                  ? "bg-green-500 border-green-500"
                  : hasEvent
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <p className={`text-[9.5px] font-medium ${isToday ? "text-white/75" : "text-slate-400"}`}>
                {DAY_NAMES[d.getDay()]}
              </p>
              <p className={`text-[15px] font-bold ${isToday ? "text-white" : "text-slate-900"}`}>
                {d.getDate()}
              </p>
              <p className={`text-[9px] ${isToday ? "text-white/65" : "text-slate-400"}`}>
                {MONTH_NAMES[d.getMonth()]}
              </p>
              {hasEvent && !isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mx-auto mt-1" />
              )}
              {isToday && (
                <p className="text-[8.5px] text-white/90 font-bold mt-0.5">HOY</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
