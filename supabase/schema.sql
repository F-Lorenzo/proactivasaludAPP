-- ============================================================
-- PROACTIVA SALUD — Schema de Base de Datos
-- Ejecutar en Supabase SQL Editor (en orden)
-- ============================================================

-- ─── Extensiones ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLA: users ───────────────────────────────────────────
-- Extiende auth.users de Supabase con datos de perfil y rol
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('paciente', 'medico', 'admin')) DEFAULT 'paciente',
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: patient_profiles ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  weight              NUMERIC(5,2),
  height              NUMERIC(5,2),
  imc                 NUMERIC(5,2),
  conditions          TEXT[] DEFAULT '{}',
  medications         TEXT[] DEFAULT '{}',
  assigned_doctor_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: availability_slots ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ NOT NULL,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: appointments ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('pendiente', 'confirmado', 'cancelado', 'completado')) DEFAULT 'pendiente',
  specialty       TEXT,
  modality        TEXT CHECK (modality IN ('videoconsulta', 'presencial')) DEFAULT 'videoconsulta',
  zoom_session_id TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: prescriptions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('nutrition', 'exercise', 'medication', 'treatment')),
  title       TEXT,
  content     JSONB NOT NULL DEFAULT '{}',
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: medications_reminders ───────────────────────────
CREATE TABLE IF NOT EXISTS public.medications_reminders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_name  TEXT NOT NULL,
  dosage           TEXT,
  times            TEXT[] NOT NULL DEFAULT '{}',  -- ej: ['08:00', '20:00']
  days             INT[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',  -- 0=Dom..6=Sáb
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: health_metrics ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  weight          NUMERIC(5,2),
  blood_pressure  TEXT,   -- ej: '120/80'
  glucose         NUMERIC(6,2),
  cholesterol     NUMERIC(6,2),
  imc             NUMERIC(5,2),
  health_score    INT CHECK (health_score BETWEEN 0 AND 100),
  notes           TEXT,
  file_url        TEXT    -- análisis adjunto
);

-- ─── TABLA: ai_conversations ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  messages              JSONB[] NOT NULL DEFAULT '{}',
  escalated_to_doctor   BOOLEAN NOT NULL DEFAULT FALSE,
  escalated_doctor_id   UUID REFERENCES public.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: coaching_sessions ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT,  -- 'nutricion', 'bienestar', 'movimiento'
  zoom_link     TEXT,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INT DEFAULT 45,
  capacity      INT DEFAULT 20,
  status        TEXT CHECK (status IN ('confirmada', 'pendiente', 'cancelada')) DEFAULT 'confirmada',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: subscriptions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  mp_subscription_id      TEXT UNIQUE,               -- ID de preapproval en MercadoPago
  plan                    TEXT CHECK (plan IN ('basic', 'premium')) DEFAULT 'basic',
  status                  TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'pending', 'trialing')) DEFAULT 'pending',
  period_end              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLA: medical_records ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_type   TEXT,  -- 'pdf', 'imagen', 'análisis'
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications_reminders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records        ENABLE ROW LEVEL SECURITY;

-- ─── Función helper: obtener rol del usuario actual ─────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── users ──────────────────────────────────────────────────
-- Cada usuario ve solo su propio perfil; admins ven todo
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.get_user_role() = 'admin');

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ─── patient_profiles ───────────────────────────────────────
CREATE POLICY "profiles_select" ON public.patient_profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR assigned_doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "profiles_insert_own" ON public.patient_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update" ON public.patient_profiles
  FOR UPDATE USING (
    user_id = auth.uid()
    OR assigned_doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ─── appointments ───────────────────────────────────────────
CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT USING (
    patient_id = auth.uid()
    OR doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT WITH CHECK (
    patient_id = auth.uid()
    OR public.get_user_role() IN ('medico', 'admin')
  );

CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE USING (
    patient_id = auth.uid()
    OR doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ─── availability_slots ─────────────────────────────────────
CREATE POLICY "slots_select_all" ON public.availability_slots
  FOR SELECT USING (TRUE);  -- cualquier usuario autenticado puede ver disponibilidad

CREATE POLICY "slots_manage_own" ON public.availability_slots
  FOR ALL USING (
    doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ─── prescriptions ──────────────────────────────────────────
CREATE POLICY "prescriptions_select" ON public.prescriptions
  FOR SELECT USING (
    patient_id = auth.uid()
    OR doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "prescriptions_insert" ON public.prescriptions
  FOR INSERT WITH CHECK (
    doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "prescriptions_update" ON public.prescriptions
  FOR UPDATE USING (
    doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ─── medications_reminders ──────────────────────────────────
CREATE POLICY "meds_select_own" ON public.medications_reminders
  FOR SELECT USING (
    patient_id = auth.uid()
    OR public.get_user_role() IN ('medico', 'admin')
  );

CREATE POLICY "meds_manage_own" ON public.medications_reminders
  FOR ALL USING (patient_id = auth.uid() OR public.get_user_role() = 'admin');

-- ─── health_metrics ─────────────────────────────────────────
CREATE POLICY "metrics_select" ON public.health_metrics
  FOR SELECT USING (
    patient_id = auth.uid()
    OR public.get_user_role() IN ('medico', 'admin')
  );

CREATE POLICY "metrics_insert_own" ON public.health_metrics
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- ─── ai_conversations ───────────────────────────────────────
CREATE POLICY "ai_select" ON public.ai_conversations
  FOR SELECT USING (
    patient_id = auth.uid()
    OR escalated_doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "ai_insert_own" ON public.ai_conversations
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "ai_update" ON public.ai_conversations
  FOR UPDATE USING (
    patient_id = auth.uid()
    OR escalated_doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ─── coaching_sessions ──────────────────────────────────────
CREATE POLICY "coaching_select_all" ON public.coaching_sessions
  FOR SELECT USING (TRUE);

CREATE POLICY "coaching_manage" ON public.coaching_sessions
  FOR ALL USING (
    doctor_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

-- ─── subscriptions ──────────────────────────────────────────
CREATE POLICY "subs_select_own" ON public.subscriptions
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "subs_manage_admin" ON public.subscriptions
  FOR ALL USING (public.get_user_role() = 'admin');

-- ─── medical_records ────────────────────────────────────────
CREATE POLICY "records_select" ON public.medical_records
  FOR SELECT USING (
    patient_id = auth.uid()
    OR public.get_user_role() IN ('medico', 'admin')
  );

CREATE POLICY "records_insert_own" ON public.medical_records
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- ============================================================
-- TRIGGER: auto-crear user en public.users al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_doctor_id ON public.patient_profiles(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_availability_doctor ON public.availability_slots(doctor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON public.medications_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_patient ON public.health_metrics(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conv_patient ON public.ai_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_coaching_scheduled ON public.coaching_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
