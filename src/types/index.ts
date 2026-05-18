// ─── Roles ──────────────────────────────────────────────────
export type UserRole = "paciente" | "medico" | "admin";

// ─── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Patient Profile ─────────────────────────────────────────
export interface PatientProfile {
  id: string;
  user_id: string;
  weight: number | null;
  height: number | null;
  imc: number | null;
  conditions: string[];
  medications: string[];
  assigned_doctor_id: string | null;
}

// ─── Appointment ─────────────────────────────────────────────
export type AppointmentStatus = "pendiente" | "confirmado" | "cancelado" | "completado";
export type Modality = "videoconsulta" | "presencial";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  specialty: string | null;
  modality: Modality;
  zoom_session_id: string | null;
  notes: string | null;
}

// ─── Medication Reminder ─────────────────────────────────────
export interface MedicationReminder {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string | null;
  times: string[];
  days: number[];
  active: boolean;
}

// ─── Health Metric ───────────────────────────────────────────
export interface HealthMetric {
  id: string;
  patient_id: string;
  recorded_at: string;
  weight: number | null;
  blood_pressure: string | null;
  glucose: number | null;
  cholesterol: number | null;
  imc: number | null;
  health_score: number | null;
  notes: string | null;
  file_url: string | null;
}

// ─── AI Conversation ─────────────────────────────────────────
export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  patient_id: string;
  messages: AIMessage[];
  escalated_to_doctor: boolean;
  escalated_doctor_id: string | null;
}

// ─── Coaching Session ─────────────────────────────────────────
export interface CoachingSession {
  id: string;
  doctor_id: string;
  title: string;
  description: string | null;
  type: string | null;
  zoom_link: string | null;
  scheduled_at: string;
  duration_min: number;
  capacity: number;
  status: "confirmada" | "pendiente" | "cancelada";
}

// ─── Subscription ─────────────────────────────────────────────
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "basic" | "premium";
  status: "active" | "canceled" | "past_due" | "trialing";
  period_end: string | null;
}

// ─── Medical Record ───────────────────────────────────────────
export interface MedicalRecord {
  id: string;
  patient_id: string;
  file_url: string;
  file_type: string | null;
  description: string | null;
  created_at: string;
}
