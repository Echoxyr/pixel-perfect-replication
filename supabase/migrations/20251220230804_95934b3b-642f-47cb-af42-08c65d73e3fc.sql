-- Tabella Fornitori
CREATE TABLE IF NOT EXISTS public.fornitori (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  codice_fiscale TEXT,
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  provincia TEXT,
  telefono TEXT,
  cellulare TEXT,
  email TEXT,
  pec TEXT,
  categoria TEXT,
  sconto_base NUMERIC DEFAULT 0,
  condizioni_pagamento TEXT,
  iban TEXT,
  note TEXT,
  stato TEXT NOT NULL DEFAULT 'attivo',
  rating INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.fornitori ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage fornitori" ON public.fornitori FOR ALL USING (true) WITH CHECK (true);

-- Tabella Ordini Fornitori
CREATE TABLE IF NOT EXISTS public.ordini_fornitori (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  fornitore_id UUID REFERENCES public.fornitori(id),
  fornitore_nome TEXT NOT NULL,
  cantiere_id UUID,
  cantiere_nome TEXT,
  importo NUMERIC NOT NULL DEFAULT 0,
  stato TEXT NOT NULL DEFAULT 'bozza',
  data_consegna_prevista DATE,
  data_consegna_effettiva DATE,
  note TEXT,
  allegati TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ordini_fornitori ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage ordini_fornitori" ON public.ordini_fornitori FOR ALL USING (true) WITH CHECK (true);

-- Righe Ordini
CREATE TABLE IF NOT EXISTS public.righe_ordine (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordine_id UUID NOT NULL REFERENCES public.ordini_fornitori(id) ON DELETE CASCADE,
  codice TEXT,
  descrizione TEXT NOT NULL,
  quantita NUMERIC NOT NULL DEFAULT 1,
  unita_misura TEXT DEFAULT 'pz',
  prezzo_unitario NUMERIC NOT NULL DEFAULT 0,
  sconto NUMERIC DEFAULT 0,
  importo NUMERIC,
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.righe_ordine ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage righe_ordine" ON public.righe_ordine FOR ALL USING (true) WITH CHECK (true);

-- Tabella Contratti
CREATE TABLE IF NOT EXISTS public.contratti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  titolo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'appalto',
  contraente TEXT NOT NULL,
  contraente_id UUID,
  importo NUMERIC NOT NULL DEFAULT 0,
  data_inizio DATE NOT NULL,
  data_fine DATE NOT NULL,
  stato TEXT NOT NULL DEFAULT 'attivo',
  rinnovo_automatico BOOLEAN DEFAULT false,
  preavviso_giorni INTEGER DEFAULT 30,
  descrizione TEXT,
  clausole TEXT,
  penali TEXT,
  allegati TEXT[] DEFAULT '{}',
  cantiere_id UUID,
  cantiere_nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.contratti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage contratti" ON public.contratti FOR ALL USING (true) WITH CHECK (true);

-- Preventivi Fornitori (richieste di preventivo ai fornitori)
CREATE TABLE IF NOT EXISTS public.preventivi_fornitori (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  fornitore_id UUID REFERENCES public.fornitori(id),
  fornitore_nome TEXT NOT NULL,
  oggetto TEXT NOT NULL,
  importo NUMERIC DEFAULT 0,
  stato TEXT NOT NULL DEFAULT 'richiesto',
  scadenza DATE,
  cantiere_id UUID,
  cantiere_nome TEXT,
  note TEXT,
  allegati TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.preventivi_fornitori ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage preventivi_fornitori" ON public.preventivi_fornitori FOR ALL USING (true) WITH CHECK (true);

-- Listini Fornitori
CREATE TABLE IF NOT EXISTS public.listini_fornitori (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fornitore_id UUID REFERENCES public.fornitori(id),
  fornitore_nome TEXT NOT NULL,
  nome TEXT NOT NULL,
  valido_dal DATE NOT NULL,
  valido_al DATE,
  sconto_applicato NUMERIC DEFAULT 0,
  note TEXT,
  allegato_url TEXT,
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.listini_fornitori ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage listini_fornitori" ON public.listini_fornitori FOR ALL USING (true) WITH CHECK (true);

-- Articoli Listino
CREATE TABLE IF NOT EXISTS public.articoli_listino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listino_id UUID NOT NULL REFERENCES public.listini_fornitori(id) ON DELETE CASCADE,
  codice TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  unita_misura TEXT DEFAULT 'cad',
  prezzo_listino NUMERIC NOT NULL DEFAULT 0,
  prezzo_scontato NUMERIC,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.articoli_listino ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage articoli_listino" ON public.articoli_listino FOR ALL USING (true) WITH CHECK (true);

-- Report BI
CREATE TABLE IF NOT EXISTS public.report_bi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  tipo_report TEXT NOT NULL DEFAULT 'executive',
  filtri JSONB DEFAULT '{}',
  formato TEXT DEFAULT 'pdf',
  frequenza TEXT DEFAULT 'mensile',
  destinatari TEXT[] DEFAULT '{}',
  prossima_esecuzione DATE,
  attivo BOOLEAN DEFAULT true,
  ultima_esecuzione TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.report_bi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage report_bi" ON public.report_bi FOR ALL USING (true) WITH CHECK (true);

-- KPI Finanziari
CREATE TABLE IF NOT EXISTS public.kpi_finanziari (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo TEXT NOT NULL,
  ricavi_previsti NUMERIC DEFAULT 0,
  ricavi_effettivi NUMERIC DEFAULT 0,
  costi_previsti NUMERIC DEFAULT 0,
  costi_effettivi NUMERIC DEFAULT 0,
  margine NUMERIC DEFAULT 0,
  margine_previsto NUMERIC DEFAULT 0,
  cash_flow_operativo NUMERIC DEFAULT 0,
  dso INTEGER DEFAULT 0,
  wip NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kpi_finanziari ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage kpi_finanziari" ON public.kpi_finanziari FOR ALL USING (true) WITH CHECK (true);

-- Analisi Predittive
CREATE TABLE IF NOT EXISTS public.analisi_predittive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cantiere_id UUID,
  cantiere_nome TEXT,
  data_analisi DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_previsione TEXT NOT NULL,
  probabilita INTEGER DEFAULT 0,
  impatto TEXT DEFAULT 'medio',
  fattori_rischio TEXT[] DEFAULT '{}',
  raccomandazioni TEXT[] DEFAULT '{}',
  azioni_mitigazione TEXT[] DEFAULT '{}',
  stato TEXT DEFAULT 'aperta',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.analisi_predittive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage analisi_predittive" ON public.analisi_predittive FOR ALL USING (true) WITH CHECK (true);