-- ============================================
-- MIGRAZIONE COMPLETA: 10 FUNZIONALITÀ
-- ============================================

-- 1. SISTEMA NOTIFICHE
CREATE TABLE public.notifiche (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('scadenza', 'avviso', 'urgente', 'info')),
  titolo TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  entita_tipo TEXT, -- 'fattura', 'documento', 'formazione', 'visita_medica'
  entita_id UUID,
  letta BOOLEAN NOT NULL DEFAULT false,
  data_scadenza DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifiche ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notifiche" ON public.notifiche FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifiche" ON public.notifiche FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifiche" ON public.notifiche FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete notifiche" ON public.notifiche FOR DELETE USING (true);

-- 5. TIMBRATURE LAVORATORI
CREATE TABLE public.timbrature (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lavoratore_nome TEXT NOT NULL,
  lavoratore_id UUID,
  cantiere_id UUID,
  cantiere_nome TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  ora TIME NOT NULL DEFAULT CURRENT_TIME,
  note TEXT,
  posizione_gps TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.timbrature ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view timbrature" ON public.timbrature FOR SELECT USING (true);
CREATE POLICY "Anyone can insert timbrature" ON public.timbrature FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update timbrature" ON public.timbrature FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete timbrature" ON public.timbrature FOR DELETE USING (true);

-- 8. SISTEMA RUOLI RBAC (pronto per quando riattiverai l'auth)
CREATE TYPE public.app_role AS ENUM ('admin', 'capo_cantiere', 'contabile', 'hse_manager', 'viewer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user_roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user_roles" ON public.user_roles FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete user_roles" ON public.user_roles FOR DELETE USING (true);

-- Funzione per verificare ruoli (security definer per evitare ricorsione RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 9. CALENDARIO RISORSE (mezzi, attrezzature)
CREATE TABLE public.risorse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('mezzo', 'attrezzatura', 'macchinario')),
  descrizione TEXT,
  stato TEXT NOT NULL DEFAULT 'disponibile' CHECK (stato IN ('disponibile', 'in_uso', 'manutenzione', 'guasto')),
  targa TEXT,
  matricola TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.prenotazioni_risorse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risorsa_id UUID NOT NULL REFERENCES public.risorse(id) ON DELETE CASCADE,
  cantiere_id UUID,
  cantiere_nome TEXT,
  data_inizio DATE NOT NULL,
  data_fine DATE NOT NULL,
  note TEXT,
  stato TEXT NOT NULL DEFAULT 'confermata' CHECK (stato IN ('richiesta', 'confermata', 'annullata')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.risorse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenotazioni_risorse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view risorse" ON public.risorse FOR SELECT USING (true);
CREATE POLICY "Anyone can insert risorse" ON public.risorse FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update risorse" ON public.risorse FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete risorse" ON public.risorse FOR DELETE USING (true);

CREATE POLICY "Anyone can view prenotazioni_risorse" ON public.prenotazioni_risorse FOR SELECT USING (true);
CREATE POLICY "Anyone can insert prenotazioni_risorse" ON public.prenotazioni_risorse FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update prenotazioni_risorse" ON public.prenotazioni_risorse FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete prenotazioni_risorse" ON public.prenotazioni_risorse FOR DELETE USING (true);

-- Trigger per update timestamp
CREATE TRIGGER update_risorse_updated_at
  BEFORE UPDATE ON public.risorse
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. GENERAZIONE POS - Template salvati
CREATE TABLE public.pos_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  contenuto JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pos_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pos_templates" ON public.pos_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pos_templates" ON public.pos_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pos_templates" ON public.pos_templates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pos_templates" ON public.pos_templates FOR DELETE USING (true);

CREATE TRIGGER update_pos_templates_updated_at
  BEFORE UPDATE ON public.pos_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();