export const dynamic = "force-dynamic";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { User, PatientProfile, Appointment, MedicationReminder, HealthMetric, CoachingSession, Subscription } from "@/types";

import PatientTopbar from "@/components/patient/PatientTopbar";
import PatientSidebar from "@/components/patient/PatientSidebar";
import AppointmentCalendar from "@/components/patient/AppointmentCalendar";
import HealthStatus from "@/components/patient/HealthStatus";
import AIChat from "@/components/patient/AIChat";
import CoachingCard from "@/components/patient/CoachingCard";
import PillOrganizer from "@/components/patient/PillOrganizer";
import WellnessPrograms from "@/components/patient/WellnessPrograms";
import ClinicalHistory from "@/components/patient/ClinicalHistory";
import SubscriptionBanner from "@/components/patient/SubscriptionBanner";

export default async function PacienteDashboard() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  // Datos del usuario
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!userData || userData.role !== "paciente") {
    redirect(`/dashboard/${userData?.role ?? "paciente"}`);
  }

  // Fetch paralelo de todo lo necesario
  const [
    { data: profile },
    { data: appointments },
    { data: medications },
    { data: metrics },
    { data: coachingSessions },
    { data: subscription },
  ] = await Promise.all([
    supabase.from("patient_profiles").select("*").eq("user_id", authUser.id).single(),
    supabase.from("appointments").select("*").eq("patient_id", authUser.id).order("scheduled_at", { ascending: true }),
    supabase.from("medications_reminders").select("*").eq("patient_id", authUser.id).eq("active", true),
    supabase.from("health_metrics").select("*").eq("patient_id", authUser.id).order("recorded_at", { ascending: false }).limit(1),
    supabase.from("coaching_sessions").select("*").gte("scheduled_at", new Date().toISOString()).order("scheduled_at", { ascending: true }).limit(5),
    supabase.from("subscriptions").select("*").eq("user_id", authUser.id).maybeSingle(),
  ]);

  const upcomingAppointments = (appointments ?? []).filter(
    (a: Appointment) => new Date(a.scheduled_at) >= new Date()
  );

  return (
    <div className="h-screen flex flex-col bg-[#f0f4f8] overflow-hidden">
      <PatientTopbar userName={userData.full_name ?? "Paciente"} />

      <div className="flex flex-1 overflow-hidden">
        <PatientSidebar
          user={userData as User}
          profile={profile as PatientProfile | null}
          medications={(medications ?? []) as MedicationReminder[]}
        />

        {/* Main scroll area */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">

          {/* ── CTA Pedir Turno ── */}
          <Link
            href="/pedir-turno"
            className="bg-gradient-to-r from-green-500 via-green-400 to-blue-500 rounded-2xl p-[18px] text-white flex items-center gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform shadow-[0_8px_24px_rgba(34,197,94,0.25)] relative overflow-hidden group"
          >
            {/* decorative circles */}
            <div className="absolute -top-1/2 -right-5 w-48 h-48 rounded-full bg-white/[0.07] pointer-events-none" />
            <div className="absolute -bottom-1/2 right-16 w-44 h-44 rounded-full bg-white/[0.05] pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 relative z-10">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M12 14v4M10 16h4"/>
              </svg>
            </div>
            <div className="flex-1 relative z-10">
              <p className="text-[18px] font-bold tracking-tight">Pedir turno</p>
              <p className="text-[13px] opacity-90 mt-0.5">Reservá una consulta con tu equipo de salud · Disponibilidad inmediata</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10 transition-transform group-hover:translate-x-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>

          {/* ── Suscripción ── */}
          <SubscriptionBanner subscription={(subscription ?? null) as Subscription | null} />

          {/* ── Calendario ── */}
          <AppointmentCalendar appointments={upcomingAppointments} />

          {/* ── Row: Estado de salud + Chat IA ── */}
          <div className="grid grid-cols-2 gap-3.5">
            <HealthStatus latestMetric={(metrics?.[0] ?? null) as HealthMetric | null} />
            <AIChat patientName={userData.full_name ?? "Paciente"} />
          </div>

          {/* ── Row: Coaching + Pastillero + Programas ── */}
          <div className="grid grid-cols-[1fr_1fr_200px] gap-3.5">
            <CoachingCard sessions={(coachingSessions ?? []) as CoachingSession[]} />
            <PillOrganizer medications={(medications ?? []) as MedicationReminder[]} />
            <WellnessPrograms />
          </div>

          {/* ── Historial clínico ── */}
          <ClinicalHistory appointments={(appointments ?? []) as Appointment[]} />

        </main>
      </div>
    </div>
  );
}
