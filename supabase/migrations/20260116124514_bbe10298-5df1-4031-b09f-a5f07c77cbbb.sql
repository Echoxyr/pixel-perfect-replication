-- Create core tables for WorkHub data (cantieri, imprese, lavoratori, documenti, formazioni, dpi, tasks)

-- Cantieri (Construction Sites)
CREATE TABLE IF NOT EXISTS public.cantieri (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codice_commessa TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  committente TEXT,
  indirizzo TEXT,
  citta TEXT,
  provincia TEXT,
  stato TEXT DEFAULT 'attivo' CHECK (stato IN ('attivo', 'sospeso', 'concluso', 'pianificato')),
  data_inizio DATE,
  data_fine_prevista DATE,
  data_fine_effettiva DATE,
  importo_contratto NUMERIC(15,2),
  direttore_lavori TEXT,
  responsabile_sicurezza TEXT,
  csp TEXT,
  cse TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Imprese (Companies/Subcontractors)
CREATE TABLE IF NOT EXISTS public.imprese (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  codice_fiscale TEXT,
  indirizzo TEXT,
  citta TEXT,
  provincia TEXT,
  cap TEXT,
  telefono TEXT,
  email TEXT,
  pec TEXT,
  tipo TEXT DEFAULT 'subappaltatrice' CHECK (tipo IN ('principale', 'subappaltatrice', 'consorzio', 'ATI')),
  categoria_soa TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Collegamento Cantieri-Imprese
CREATE TABLE IF NOT EXISTS public.cantieri_imprese (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cantiere_id UUID NOT NULL REFERENCES public.cantieri(id) ON DELETE CASCADE,
  impresa_id UUID NOT NULL REFERENCES public.imprese(id) ON DELETE CASCADE,
  ruolo TEXT DEFAULT 'subappaltatrice',
  importo_contratto NUMERIC(15,2),
  data_inizio DATE,
  data_fine DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cantiere_id, impresa_id)
);

-- Lavoratori (Workers)
CREATE TABLE IF NOT EXISTS public.lavoratori (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  codice_fiscale TEXT UNIQUE,
  data_nascita DATE,
  luogo_nascita TEXT,
  indirizzo TEXT,
  citta TEXT,
  telefono TEXT,
  email TEXT,
  impresa_id UUID REFERENCES public.imprese(id) ON DELETE SET NULL,
  mansione TEXT,
  livello TEXT,
  data_assunzione DATE,
  data_cessazione DATE,
  foto_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Collegamento Lavoratori-Cantieri
CREATE TABLE IF NOT EXISTS public.lavoratori_cantieri (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lavoratore_id UUID NOT NULL REFERENCES public.lavoratori(id) ON DELETE CASCADE,
  cantiere_id UUID NOT NULL REFERENCES public.cantieri(id) ON DELETE CASCADE,
  data_inizio DATE DEFAULT CURRENT_DATE,
  data_fine DATE,
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lavoratore_id, cantiere_id)
);

-- Documenti (Documents)
CREATE TABLE IF NOT EXISTS public.documenti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titolo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT,
  entita_tipo TEXT NOT NULL CHECK (entita_tipo IN ('cantiere', 'impresa', 'lavoratore', 'azienda')),
  entita_id UUID,
  data_emissione DATE,
  data_scadenza DATE,
  stato TEXT DEFAULT 'valido' CHECK (stato IN ('valido', 'in_scadenza', 'scaduto', 'da_verificare')),
  file_url TEXT,
  note TEXT,
  obbligatorio BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Formazioni (Training Records)
CREATE TABLE IF NOT EXISTS public.formazioni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lavoratore_id UUID NOT NULL REFERENCES public.lavoratori(id) ON DELETE CASCADE,
  tipo_corso TEXT NOT NULL,
  titolo_corso TEXT NOT NULL,
  ente_formatore TEXT,
  data_conseguimento DATE NOT NULL,
  data_scadenza DATE,
  ore_durata INTEGER,
  attestato_url TEXT,
  stato TEXT DEFAULT 'valido' CHECK (stato IN ('valido', 'in_scadenza', 'scaduto')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DPI (Personal Protective Equipment)
CREATE TABLE IF NOT EXISTS public.dpi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lavoratore_id UUID REFERENCES public.lavoratori(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  marca TEXT,
  modello TEXT,
  taglia TEXT,
  data_consegna DATE NOT NULL,
  data_scadenza DATE,
  quantita INTEGER DEFAULT 1,
  stato TEXT DEFAULT 'valido' CHECK (stato IN ('valido', 'in_scadenza', 'scaduto', 'sostituire')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks (Project Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cantiere_id UUID REFERENCES public.cantieri(id) ON DELETE SET NULL,
  impresa_id UUID REFERENCES public.imprese(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'da_iniziare' CHECK (status IN ('da_iniziare', 'in_corso', 'in_attesa', 'bloccato', 'fatto')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('bassa', 'media', 'alta', 'urgente', 'critica')),
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  assignee TEXT,
  category TEXT,
  tags TEXT[],
  note TEXT,
  parent_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Visite Mediche (Medical Visits) 
CREATE TABLE IF NOT EXISTS public.visite_mediche (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lavoratore_id UUID NOT NULL REFERENCES public.lavoratori(id) ON DELETE CASCADE,
  tipo_visita TEXT NOT NULL,
  data_visita DATE NOT NULL,
  data_scadenza DATE,
  esito TEXT CHECK (esito IN ('idoneo', 'idoneo_prescrizioni', 'idoneo_limitazioni', 'non_idoneo_temporaneo', 'non_idoneo_permanente')),
  medico TEXT,
  prescrizioni TEXT,
  limitazioni TEXT,
  certificato_url TEXT,
  stato TEXT DEFAULT 'valido' CHECK (stato IN ('valido', 'in_scadenza', 'scaduto')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documenti Azienda (Company Documents) for Azienda module
CREATE TABLE IF NOT EXISTS public.documenti_azienda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titolo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descrizione TEXT,
  data_emissione DATE,
  data_scadenza DATE,
  numero_documento TEXT,
  file_url TEXT,
  note TEXT,
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cantieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imprese ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cantieri_imprese ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lavoratori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lavoratori_cantieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visite_mediche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documenti_azienda ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables (adjust for auth later)
CREATE POLICY "Allow all access to cantieri" ON public.cantieri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to imprese" ON public.imprese FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to cantieri_imprese" ON public.cantieri_imprese FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lavoratori" ON public.lavoratori FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lavoratori_cantieri" ON public.lavoratori_cantieri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to documenti" ON public.documenti FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to formazioni" ON public.formazioni FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to dpi" ON public.dpi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to visite_mediche" ON public.visite_mediche FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to documenti_azienda" ON public.documenti_azienda FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cantieri_stato ON public.cantieri(stato);
CREATE INDEX IF NOT EXISTS idx_lavoratori_impresa ON public.lavoratori(impresa_id);
CREATE INDEX IF NOT EXISTS idx_documenti_entita ON public.documenti(entita_tipo, entita_id);
CREATE INDEX IF NOT EXISTS idx_documenti_scadenza ON public.documenti(data_scadenza);
CREATE INDEX IF NOT EXISTS idx_formazioni_lavoratore ON public.formazioni(lavoratore_id);
CREATE INDEX IF NOT EXISTS idx_formazioni_scadenza ON public.formazioni(data_scadenza);
CREATE INDEX IF NOT EXISTS idx_tasks_cantiere ON public.tasks(cantiere_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_visite_lavoratore ON public.visite_mediche(lavoratore_id);
CREATE INDEX IF NOT EXISTS idx_dpi_lavoratore ON public.dpi(lavoratore_id);