"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  userName: string;
}

export default function PatientTopbar({ userName }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3 flex-shrink-0 z-40">
      {/* Logo */}
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path d="M9 3v12M5 7h8M3 11h12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="text-[15px] font-bold text-slate-900">Proactiva Salud</span>
      <span className="text-xs text-slate-400 hidden sm:block">· {today}</span>

      <div className="flex-1" />

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mr-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] text-green-600 font-semibold hidden sm:block">En vivo</span>
      </div>

      {/* Notificaciones */}
      <button
        onClick={() => setNotifOpen(!notifOpen)}
        className="relative w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
      </button>

      {/* Avatar + logout */}
      <div className="relative group">
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </button>
        <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40 hidden group-hover:block z-50">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
