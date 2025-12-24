-- User profiles table for user-specific data
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT 'Utente',
  cognome TEXT DEFAULT '',
  ruolo TEXT DEFAULT 'Operatore',
  email TEXT,
  telefono TEXT,
  avatar_url TEXT,
  theme_color TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User personal tasks
CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  priorita TEXT DEFAULT 'media',
  stato TEXT DEFAULT 'da_fare',
  data_scadenza DATE,
  completata BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User personal calendar events
CREATE TABLE public.user_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  data_inizio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fine TIMESTAMP WITH TIME ZONE,
  tutto_il_giorno BOOLEAN DEFAULT false,
  colore TEXT DEFAULT 'primary',
  promemoria_minuti INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User notebook/notes
CREATE TABLE public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  titolo TEXT NOT NULL,
  contenuto TEXT,
  categoria TEXT DEFAULT 'generale',
  pinned BOOLEAN DEFAULT false,
  colore TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User preferences table for theme and settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  theme_color TEXT DEFAULT 'blue',
  sidebar_collapsed BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'it',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- SAL Excel uploads table for tracking imported files
CREATE TABLE public.sal_excel_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cantiere_id UUID,
  cantiere_nome TEXT,
  file_name TEXT NOT NULL,
  rows_imported INTEGER DEFAULT 0,
  total_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing',
  error_message TEXT,
  imported_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SAL detailed rows from Excel
CREATE TABLE public.sal_voci_dettaglio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sal_id UUID,
  import_id UUID REFERENCES public.sal_excel_imports(id) ON DELETE CASCADE,
  codice TEXT,
  descrizione TEXT NOT NULL,
  unita_misura TEXT DEFAULT 'cad',
  quantita_contratto NUMERIC DEFAULT 0,
  prezzo_unitario NUMERIC DEFAULT 0,
  importo_contratto NUMERIC DEFAULT 0,
  quantita_precedente NUMERIC DEFAULT 0,
  quantita_periodo NUMERIC DEFAULT 0,
  quantita_totale NUMERIC DEFAULT 0,
  importo_precedente NUMERIC DEFAULT 0,
  importo_periodo NUMERIC DEFAULT 0,
  importo_totale NUMERIC DEFAULT 0,
  percentuale_avanzamento NUMERIC DEFAULT 0,
  categoria TEXT,
  capitolo TEXT,
  note TEXT,
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sal_excel_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sal_voci_dettaglio ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all for now (no auth required)
CREATE POLICY "Anyone can manage user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage user_tasks" ON public.user_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage user_calendar_events" ON public.user_calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage user_notes" ON public.user_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage user_preferences" ON public.user_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage sal_excel_imports" ON public.sal_excel_imports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage sal_voci_dettaglio" ON public.sal_voci_dettaglio FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_sal_voci_dettaglio_sal_id ON public.sal_voci_dettaglio(sal_id);
CREATE INDEX idx_sal_voci_dettaglio_import_id ON public.sal_voci_dettaglio(import_id);
CREATE INDEX idx_user_tasks_stato ON public.user_tasks(stato);
CREATE INDEX idx_user_calendar_events_date ON public.user_calendar_events(data_inizio);