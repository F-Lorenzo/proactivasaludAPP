import type { HealthMetric } from "@/types";

interface Props {
  latestMetric: HealthMetric | null;
}

export default function HealthStatus({ latestMetric }: Props) {
  const score = latestMetric?.health_score ?? 82;

  const getScoreColor = (s: number) =>
    s >= 80 ? "text-green-500" : s >= 60 ? "text-amber-500" : "text-red-500";

  const getMetricColor = (val: number | null, type: "glucose" | "cholesterol" | "imc") => {
    if (!val) return "text-slate-400";
    if (type === "glucose") return val <= 100 ? "text-green-500" : val <= 125 ? "text-amber-500" : "text-red-500";
    if (type === "cholesterol") return val < 200 ? "text-green-500" : val < 240 ? "text-amber-500" : "text-red-500";
    if (type === "imc") return val >= 18.5 && val < 25 ? "text-green-500" : val < 30 ? "text-amber-500" : "text-red-500";
    return "text-slate-900";
  };

  const lastDate = latestMetric
    ? new Date(latestMetric.recorded_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[12.5px] font-semibold text-slate-900">Estado de salud</p>
          <p className="text-[11px] text-slate-400">Calculado en base a estudios + IMC</p>
        </div>
        <div className="text-right">
          <p className={`text-[28px] font-bold leading-none ${getScoreColor(score)}`}>{score}</p>
          <p className="text-[10.5px] text-slate-400">/ 100</p>
        </div>
      </div>

      {/* Último análisis */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M9 13h6M9 17h4"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11.5px] font-semibold text-slate-900">
            {lastDate ? `Último análisis: ${lastDate}` : "Sin análisis registrados"}
          </p>
          <p className="text-[10.5px] text-slate-500 mt-0.5">Hemograma · Lipidograma · Glucemia</p>
        </div>
        <button className="text-[11.5px] text-white bg-green-500 hover:bg-green-600 transition rounded-lg px-3 py-1.5 font-semibold flex-shrink-0">
          + Subir
        </button>
      </div>

      {/* Métricas */}
      <div className="flex gap-2">
        <div className="flex-1 bg-slate-50 rounded-lg p-2">
          <p className="text-[10.5px] text-slate-400">IMC</p>
          <p className={`text-[13px] font-semibold mt-1 ${getMetricColor(latestMetric?.imc ?? null, "imc")}`}>
            {latestMetric?.imc?.toFixed(1) ?? "24.9"}
          </p>
        </div>
        <div className="flex-1 bg-slate-50 rounded-lg p-2">
          <p className="text-[10.5px] text-slate-400">Glucosa</p>
          <p className={`text-[13px] font-semibold mt-1 ${getMetricColor(latestMetric?.glucose ?? null, "glucose")}`}>
            {latestMetric?.glucose ? `${latestMetric.glucose} mg/dL` : "98 mg/dL"}
          </p>
        </div>
        <div className="flex-1 bg-slate-50 rounded-lg p-2">
          <p className="text-[10.5px] text-slate-400">Colesterol</p>
          <p className={`text-[13px] font-semibold mt-1 ${getMetricColor(latestMetric?.cholesterol ?? null, "cholesterol")}`}>
            {latestMetric?.cholesterol ?? "205"}
          </p>
        </div>
      </div>
    </div>
  );
}
