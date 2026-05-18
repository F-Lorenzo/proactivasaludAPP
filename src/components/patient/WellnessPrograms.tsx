const PROGRAMS = [
  { name: "Bienestar Físico", weeks: "8 semanas", pct: 45, color: "#22c55e" },
  { name: "Nutrición Activa", weeks: "12 semanas", pct: 72, color: "#3b82f6" },
  { name: "Mente Sana", weeks: "6 semanas", pct: 30, color: "#f59e0b" },
];

export default function WellnessPrograms() {
  return (
    <div className="flex flex-col gap-2">
      {PROGRAMS.map((prog) => (
        <div key={prog.name} className="bg-white rounded-xl border border-slate-100 px-3 py-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <div>
              <p className="text-[12px] font-semibold text-slate-900">{prog.name}</p>
              <p className="text-[10px] text-slate-400">{prog.weeks}</p>
            </div>
            <span className="text-[13px] font-bold" style={{ color: prog.color }}>
              {prog.pct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${prog.pct}%`, backgroundColor: prog.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
