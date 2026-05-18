import type { CoachingSession } from "@/types";

interface Props {
  sessions: CoachingSession[];
}

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function CoachingCard({ sessions }: Props) {
  const upcoming = sessions.slice(0, 2);

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex justify-between items-center mb-3">
        <p className="text-[12.5px] font-semibold text-slate-900">Charlas de coaching</p>
        <button className="text-[11px] text-green-600 font-medium hover:underline">Ver todo</button>
      </div>

      <div className="flex flex-col gap-2">
        {upcoming.length > 0 ? (
          upcoming.map((session) => {
            const d = new Date(session.scheduled_at);
            const isToday = new Date().toDateString() === d.toDateString();
            const timeStr = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={session.id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isToday ? "bg-green-100" : "bg-blue-100"
                }`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isToday ? "#16a34a" : "#1d4ed8"} strokeWidth="1.8" strokeLinecap="round">
                    <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium text-slate-900 truncate">{session.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {isToday ? "Hoy" : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`} {timeStr} · {session.duration_min} min
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  isToday ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {isToday ? "Hoy" : "Próxima"}
                </span>
              </div>
            );
          })
        ) : (
          <>
            {/* Placeholder data cuando no hay sesiones en BD aún */}
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] font-medium text-slate-900">Manejo del estrés</p>
                <p className="text-[11px] text-slate-400">Hoy 17:00 · 45 min</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Hoy</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] font-medium text-slate-900">Nutrición emocional</p>
                <p className="text-[11px] text-slate-400">Jue 10:00 · 30 min</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Pendiente</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
