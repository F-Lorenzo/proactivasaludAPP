"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const SPECIALTIES = [
  {
    key: "psi",
    tag: "Salud mental",
    title: "Asistencia psicológica de alto impacto",
    desc: "Sesiones intensivas con psicólogos especializados en crisis, ansiedad aguda, duelo y trauma. Atención en menos de 24h.",
    wait: "Hasta 24h",
    profs: 8,
    accent: "#8b5cf6",
    soft: "#f3eeff",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
    doctors: [
      { name: "Dra. Lucía Méndez", sub: "Crisis y ansiedad" },
      { name: "Dr. Martín Ortiz", sub: "Trauma y duelo" },
      { name: "Lic. Paula Vidal", sub: "Terapia EMDR" },
      { name: "Dr. Andrés Ruiz", sub: "Cognitivo-conductual" },
    ],
  },
  {
    key: "nut",
    tag: "Alimentación",
    title: "Nutricionista personalizado",
    desc: "Plan de alimentación adaptado a tus objetivos: pérdida de peso, control de glucosa, deportiva o vegetariana.",
    wait: "2-3 días",
    profs: 5,
    accent: "#22c55e",
    soft: "#dcfce7",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
      </svg>
    ),
    doctors: [
      { name: "Lic. Carla Torres", sub: "Pérdida de peso" },
      { name: "Lic. Diego Pérez", sub: "Nutrición deportiva" },
      { name: "Lic. Sofía Romero", sub: "Diabetes y glucosa" },
      { name: "Lic. Tomás Báez", sub: "Vegetariana / vegana" },
    ],
  },
  {
    key: "fis",
    tag: "Movimiento",
    title: "Preparación física",
    desc: "Entrenadores certificados que diseñan rutinas personalizadas: fuerza, cardio, movilidad o rehabilitación deportiva.",
    wait: "1-2 días",
    profs: 6,
    accent: "#f59e0b",
    soft: "#fef3c7",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/>
        <path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
      </svg>
    ),
    doctors: [
      { name: "Prof. Diego Salas", sub: "Fuerza e hipertrofia" },
      { name: "Prof. Laura Vega", sub: "Cardio y resistencia" },
      { name: "Lic. Ramiro Costa", sub: "Rehabilitación" },
      { name: "Prof. Inés Galván", sub: "Movilidad y postura" },
    ],
  },
  {
    key: "cro",
    tag: "Seguimiento clínico",
    title: "Tratamientos crónicos",
    desc: "Control y seguimiento médico para diabetes, hipertensión, asma, EPOC, tiroides y otras condiciones de largo plazo.",
    wait: "3-5 días",
    profs: 12,
    accent: "#3b82f6",
    soft: "#dbeafe",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    doctors: [
      { name: "Dra. Ramírez", sub: "Endocrinología" },
      { name: "Dr. Vega", sub: "Cardiología" },
      { name: "Dra. Soto", sub: "Neumología" },
      { name: "Dr. Salgado", sub: "Medicina interna" },
    ],
  },
];

type ModalState = { specialty: (typeof SPECIALTIES)[number]; step: "form" | "success" } | null;

export default function PedirTurnoPage() {
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedProf, setSelectedProf] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [modality, setModality] = useState("Videoconsulta");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function openModal(spec: (typeof SPECIALTIES)[number]) {
    setModal({ specialty: spec, step: "form" });
    setSelectedProf(0);
    setDate("");
    setTime("");
    setReason("");
  }

  async function confirm() {
    if (!date || !time) { alert("Seleccioná fecha y horario"); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("appointments").insert({
        patient_id: user.id,
        doctor_id: user.id, // placeholder — en Fase 4 se asigna el médico real
        scheduled_at: `${date}T${time}:00`,
        specialty: modal!.specialty.title,
        modality: modality === "Videoconsulta" ? "videoconsulta" : "presencial",
        notes: reason || null,
        status: "pendiente",
      });
    }
    setLoading(false);
    setModal((prev) => prev ? { ...prev, step: "success" } : null);
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Topbar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
        <Link
          href="/dashboard/paciente"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition text-[13px] font-medium"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver al dashboard
        </Link>
        <div className="w-px h-6 bg-slate-200" />
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M5 7h8M3 11h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-[15px] font-bold text-slate-900">Proactiva Salud</span>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-9">
        <div className="mb-7">
          <span className="inline-block text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            Pedir turno
          </span>
          <h1 className="text-[34px] font-bold text-slate-900 tracking-tight leading-tight">
            ¿Qué tipo de atención necesitás?
          </h1>
          <p className="text-[15px] text-slate-500 mt-2 max-w-xl leading-relaxed">
            Seleccioná la especialidad y reservaremos un turno con el profesional disponible más pronto.
            Tu plan Premium cubre todas estas consultas.
          </p>
        </div>

        {/* Specialty grid */}
        <div className="grid grid-cols-2 gap-4">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec.key}
              onClick={() => openModal(spec)}
              className="text-left bg-white border border-slate-100 rounded-2xl p-7 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-transparent transition-all duration-200 group flex flex-col gap-3.5 relative overflow-hidden"
              style={{ ["--accent" as string]: spec.accent, ["--accent-soft" as string]: spec.soft }}
            >
              {/* top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-t-2xl"
                style={{ background: spec.accent }}
              />
              {/* bg circle */}
              <div
                className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
                style={{ background: spec.accent }}
              />

              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 group-hover:-rotate-3"
                  style={{ background: spec.soft, color: spec.accent }}
                >
                  {spec.icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: spec.accent }}>
                    {spec.tag}
                  </p>
                  <p className="text-[20px] font-bold text-slate-900 leading-tight mt-0.5">{spec.title}</p>
                </div>
              </div>

              <p className="text-[13.5px] text-slate-500 leading-relaxed">{spec.desc}</p>

              <div className="flex gap-4 pt-3.5 border-t border-dashed border-slate-100">
                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={spec.accent} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {spec.wait}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={spec.accent} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {spec.profs} profesionales
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={spec.accent} strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Cubierto
                </span>
              </div>

              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl mt-1 transition-colors text-[13.5px] font-semibold"
                style={{ background: spec.soft, color: spec.accent }}
              >
                Reservar turno
                <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Help card */}
        <div className="mt-7 bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-white">¿No sabés qué especialidad necesitás?</p>
            <p className="text-[13px] text-white/60 mt-1">Hablá con tu acompañante digital y te orientará en menos de un minuto</p>
          </div>
          <Link
            href="/dashboard/paciente"
            className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 transition text-white text-[13px] font-semibold"
          >
            Hablar con IA
          </Link>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-white rounded-2xl w-[560px] max-w-full max-h-[88vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)] animate-[modalIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            {/* Head */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: modal.specialty.soft, color: modal.specialty.accent }}>
                  {modal.specialty.icon}
                </div>
                <div>
                  <p className="text-[17px] font-bold text-slate-900">{modal.specialty.title}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">Seleccioná profesional, fecha y horario</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 transition flex items-center justify-center text-slate-400 text-base">
                ✕
              </button>
            </div>

            {modal.step === "form" ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                  {/* Profesional */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Profesional</label>
                    <div className="grid grid-cols-2 gap-2">
                      {modal.specialty.doctors.map((doc, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedProf(i)}
                          className={`text-left p-3 rounded-xl border transition ${
                            selectedProf === i
                              ? "border-green-500 bg-green-50"
                              : "border-slate-200 bg-white hover:border-green-300"
                          }`}
                        >
                          <p className="text-[13px] font-semibold text-slate-900">{doc.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{doc.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fecha y hora */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Fecha</label>
                      <input
                        type="date"
                        value={date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13.5px] bg-slate-50 outline-none focus:border-green-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Horario</label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13.5px] bg-slate-50 outline-none focus:border-green-500 focus:bg-white transition"
                      >
                        <option value="">Seleccionar…</option>
                        {["09:00","10:30","11:45","14:00","15:30","17:00","18:30"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Modalidad</label>
                    <select
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13.5px] bg-slate-50 outline-none focus:border-green-500 focus:bg-white transition"
                    >
                      <option>Videoconsulta</option>
                      <option>Presencial</option>
                    </select>
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Motivo (opcional)</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder="Describí brevemente el motivo de la consulta"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13.5px] bg-slate-50 outline-none focus:border-green-500 focus:bg-white transition resize-none"
                    />
                  </div>

                  {/* Coverage notice */}
                  <div className="flex gap-3 p-3.5 rounded-xl" style={{ background: modal.specialty.soft }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={modal.specialty.accent} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <p className="text-[12px] leading-relaxed" style={{ color: modal.specialty.accent }}>
                      Tu <strong>Plan Premium</strong> cubre esta consulta sin costo adicional.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                  <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-[13px] font-semibold hover:bg-slate-200 transition">
                    Cancelar
                  </button>
                  <button
                    onClick={confirm}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-green-500 text-white text-[13px] font-semibold hover:bg-green-600 transition disabled:opacity-60"
                  >
                    {loading ? "Confirmando…" : "Confirmar turno"}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: modal.specialty.soft }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={modal.specialty.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-slate-900">¡Turno confirmado!</p>
                  <p className="text-[13.5px] text-slate-500 mt-1">
                    {modal.specialty.doctors[selectedProf].name} · {modal.specialty.title}
                  </p>
                  <p className="text-[13px] font-semibold text-slate-900 mt-2">{date} a las {time}</p>
                  <p className="text-[12px] text-slate-400 mt-3">Recibirás un recordatorio 24h antes por email y WhatsApp</p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-green-500 text-white text-[13px] font-semibold hover:bg-green-600 transition"
                >
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(0.96) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}
