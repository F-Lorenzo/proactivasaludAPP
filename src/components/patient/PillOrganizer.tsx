"use client";

import { useState } from "react";
import type { MedicationReminder } from "@/types";

interface Props {
  medications: MedicationReminder[];
}

export default function PillOrganizer({ medications }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const todayDow = new Date().getDay();
  const todayMeds = medications.filter((m) => m.days.includes(todayDow));

  // Agrupar por horario
  const slots: Record<string, MedicationReminder[]> = {};
  todayMeds.forEach((m) => {
    m.times.forEach((t) => {
      if (!slots[t]) slots[t] = [];
      slots[t].push(m);
    });
  });
  const sortedTimes = Object.keys(slots).sort();

  // Fallback: si no hay meds en BD, mostrar los del mockup
  const showFallback = todayMeds.length === 0;

  const fallback = [
    { time: "08:00", names: ["Metformina", "Ác. fólico"], done: true },
    { time: "12:00", names: ["Vitamina D3"], done: false },
    { time: "20:00", names: ["Omega-3", "Magnesio"], done: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex justify-between items-center mb-3">
        <p className="text-[12.5px] font-semibold text-slate-900">Pastillero digital</p>
        <span className="text-[11px] text-green-600 font-semibold cursor-pointer">+ Gestionar</span>
      </div>

      <div className="flex gap-2">
        {showFallback
          ? fallback.map((slot) => (
              <div
                key={slot.time}
                className={`flex-1 rounded-xl p-2 text-center border ${
                  slot.done ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100"
                }`}
              >
                <p className={`text-[11.5px] font-bold ${slot.done ? "text-green-700" : "text-slate-900"}`}>
                  {slot.time}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight mt-1">{slot.names.join("\n")}</p>
                <div className={`w-5 h-5 rounded-full border-2 mx-auto mt-2 flex items-center justify-center ${
                  slot.done ? "bg-green-500 border-green-500" : "border-slate-200"
                }`}>
                  {slot.done && (
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            ))
          : sortedTimes.map((time) => {
              const meds = slots[time];
              const allDone = meds.every((m) => checked.has(`${m.id}-${time}`));
              return (
                <div
                  key={time}
                  onClick={() => {
                    const next = new Set(checked);
                    meds.forEach((m) => {
                      const k = `${m.id}-${time}`;
                      allDone ? next.delete(k) : next.add(k);
                    });
                    setChecked(next);
                  }}
                  className={`flex-1 rounded-xl p-2 text-center border cursor-pointer transition ${
                    allDone ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100 hover:border-green-200"
                  }`}
                >
                  <p className={`text-[11.5px] font-bold ${allDone ? "text-green-700" : "text-slate-900"}`}>{time}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-1">
                    {meds.map((m) => m.medication_name.split(" ")[0]).join("\n")}
                  </p>
                  <div className={`w-5 h-5 rounded-full border-2 mx-auto mt-2 flex items-center justify-center ${
                    allDone ? "bg-green-500 border-green-500" : "border-slate-200"
                  }`}>
                    {allDone && (
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
