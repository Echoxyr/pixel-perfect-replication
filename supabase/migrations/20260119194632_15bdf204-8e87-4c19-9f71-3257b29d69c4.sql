-- ============================================
-- RFQ (Request for Quote) System
-- ============================================

-- RFQ Requests table
CREATE TABLE public.rfq_richieste (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(50) NOT NULL,
  oggetto TEXT NOT NULL,
  descrizione TEXT,
  cantiere_id UUID REFERENCES public.cantieri(id),
  lavorazione TEXT,
  importo_stimato DECIMAL(15,2),
  data_emissione DATE NOT NULL DEFAULT CURRENT_DATE,
  data_scadenza DATE NOT NULL,
  stato VARCHAR(30) NOT NULL DEFAULT 'aperta' CHECK (stato IN ('bozza', 'aperta', 'in_valutazione', 'assegnata', 'annullata', 'scaduta')),
  urgenza VARCHAR(20) DEFAULT 'normale' CHECK (urgenza IN ('bassa', 'normale', 'alta', 'urgente')),
  allegati_tecnici JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  solleciti_inviati INTEGER DEFAULT 0,
  ultimo_sollecito TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RFQ Responses/Offers table
CREATE TABLE public.rfq_risposte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfq_richieste(id) ON DELETE CASCADE,
  fornitore_id UUID REFERENCES public.fornitori(id),
  fornitore_nome VARCHAR(255),
  data_ricezione DATE NOT NULL DEFAULT CURRENT_DATE,
  importo_offerto DECIMAL(15,2) NOT NULL,
  tempi_consegna VARCHAR(100),
  condizioni_pagamento TEXT,
  validita_offerta DATE,
  note_tecniche TEXT,
  allegati JSONB DEFAULT '[]'::jsonb,
  valutazione INTEGER CHECK (valutazione >= 1 AND valutazione <= 5),
  punteggio_tecnico DECIMAL(5,2),
  punteggio_economico DECIMAL(5,2),
  punteggio_totale DECIMAL(5,2),
  selezionata BOOLEAN DEFAULT false,
  motivo_selezione TEXT,
  motivo_esclusione TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RFQ Comparison Records
CREATE TABLE public.rfq_comparazioni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfq_richieste(id) ON DELETE CASCADE,
  data_comparazione DATE NOT NULL DEFAULT CURRENT_DATE,
  criteri_valutazione JSONB DEFAULT '{"prezzo": 40, "tempi": 30, "qualita": 30}'::jsonb,
  risposta_vincente_id UUID REFERENCES public.rfq_risposte(id),
  motivazione_scelta TEXT NOT NULL,
  note_commissione TEXT,
  approvato_da VARCHAR(255),
  data_approvazione DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Subappalti (Subcontract) Management
-- ============================================

CREATE TABLE public.subappalti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_contratto VARCHAR(50) NOT NULL,
  impresa_id UUID REFERENCES public.imprese(id),
  impresa_nome VARCHAR(255),
  cantiere_id UUID REFERENCES public.cantieri(id),
  lotto VARCHAR(100),
  oggetto TEXT NOT NULL,
  importo_contratto DECIMAL(15,2) NOT NULL,
  importo_autorizzato DECIMAL(15,2),
  percentuale_ribasso DECIMAL(5,2),
  stato VARCHAR(30) NOT NULL DEFAULT 'bozza' CHECK (stato IN ('bozza', 'in_approvazione', 'affidato', 'in_corso', 'sospeso', 'chiuso', 'risolto')),
  data_contratto DATE,
  data_inizio_lavori DATE,
  data_fine_prevista DATE,
  data_fine_effettiva DATE,
  condizioni_pagamento TEXT,
  penali TEXT,
  referente_nome VARCHAR(255),
  referente_telefono VARCHAR(50),
  referente_email VARCHAR(255),
  documenti_obbligatori JSONB DEFAULT '[]'::jsonb,
  documenti_ricevuti JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  allegati JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subappalto Document Checklist
CREATE TABLE public.subappalti_documenti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subappalto_id UUID NOT NULL REFERENCES public.subappalti(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  nome_documento VARCHAR(255),
  stato VARCHAR(30) NOT NULL DEFAULT 'richiesto' CHECK (stato IN ('richiesto', 'ricevuto', 'in_verifica', 'verificato', 'respinto', 'scaduto')),
  data_richiesta DATE DEFAULT CURRENT_DATE,
  data_ricezione DATE,
  data_verifica DATE,
  data_scadenza DATE,
  verificato_da VARCHAR(255),
  note TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Varianti e Change Orders
-- ============================================

CREATE TABLE public.varianti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_variante VARCHAR(50) NOT NULL,
  tipo_riferimento VARCHAR(30) NOT NULL CHECK (tipo_riferimento IN ('ordine', 'contratto', 'subappalto')),
  riferimento_id UUID NOT NULL,
  riferimento_numero VARCHAR(100),
  cantiere_id UUID REFERENCES public.cantieri(id),
  tipo_variante VARCHAR(50) NOT NULL CHECK (tipo_variante IN ('addizionale', 'riduttiva', 'suppletiva', 'sostitutiva', 'rettifica')),
  oggetto TEXT NOT NULL,
  descrizione TEXT,
  importo_originale DECIMAL(15,2),
  importo_variante DECIMAL(15,2) NOT NULL,
  importo_nuovo_totale DECIMAL(15,2),
  percentuale_variazione DECIMAL(8,2),
  motivazione TEXT NOT NULL,
  stato VARCHAR(30) NOT NULL DEFAULT 'proposta' CHECK (stato IN ('proposta', 'in_valutazione', 'approvata', 'respinta', 'implementata', 'annullata')),
  richiesto_da VARCHAR(255),
  data_richiesta DATE NOT NULL DEFAULT CURRENT_DATE,
  approvato_da VARCHAR(255),
  data_approvazione DATE,
  note_approvazione TEXT,
  allegati JSONB DEFAULT '[]'::jsonb,
  versione INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Varianti History (storicizzazione)
CREATE TABLE public.varianti_storico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variante_id UUID NOT NULL REFERENCES public.varianti(id) ON DELETE CASCADE,
  versione INTEGER NOT NULL,
  dati_snapshot JSONB NOT NULL,
  modificato_da VARCHAR(255),
  data_modifica TIMESTAMPTZ NOT NULL DEFAULT now(),
  note_modifica TEXT
);

-- ============================================
-- Non Conformità e CAPA Avanzato
-- ============================================

CREATE TABLE public.non_conformita (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codice VARCHAR(50) NOT NULL UNIQUE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('fornitore', 'materiale', 'lavorazione', 'processo', 'servizio', 'sicurezza', 'ambientale')),
  origine VARCHAR(50) CHECK (origine IN ('interna', 'cliente', 'audit', 'ispezione', 'reclamo', 'fornitore')),
  gravita VARCHAR(20) NOT NULL CHECK (gravita IN ('minore', 'maggiore', 'critica')),
  cantiere_id UUID REFERENCES public.cantieri(id),
  fornitore_id UUID REFERENCES public.fornitori(id),
  subappalto_id UUID REFERENCES public.subappalti(id),
  oggetto TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  causa_radice TEXT,
  impatto TEXT,
  costo_stimato DECIMAL(15,2),
  data_rilevazione DATE NOT NULL DEFAULT CURRENT_DATE,
  rilevato_da VARCHAR(255),
  stato VARCHAR(30) NOT NULL DEFAULT 'aperta' CHECK (stato IN ('aperta', 'in_analisi', 'in_trattamento', 'in_verifica', 'chiusa', 'riaperta')),
  responsabile_trattamento VARCHAR(255),
  data_scadenza_trattamento DATE,
  trattamento_immediato TEXT,
  data_chiusura DATE,
  chiuso_da VARCHAR(255),
  esito_verifica TEXT,
  efficacia_verificata BOOLEAN,
  allegati JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CAPA (Corrective and Preventive Actions)
CREATE TABLE public.capa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codice VARCHAR(50) NOT NULL UNIQUE,
  nc_id UUID REFERENCES public.non_conformita(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('correttiva', 'preventiva', 'miglioramento')),
  oggetto TEXT NOT NULL,
  descrizione TEXT NOT NULL,
  analisi_causa TEXT,
  azione_proposta TEXT NOT NULL,
  risultato_atteso TEXT,
  responsabile VARCHAR(255) NOT NULL,
  data_apertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_scadenza DATE NOT NULL,
  data_completamento DATE,
  stato VARCHAR(30) NOT NULL DEFAULT 'aperta' CHECK (stato IN ('aperta', 'in_corso', 'completata', 'in_verifica', 'chiusa', 'annullata')),
  priorita VARCHAR(20) DEFAULT 'media' CHECK (priorita IN ('bassa', 'media', 'alta', 'critica')),
  verificato_da VARCHAR(255),
  data_verifica DATE,
  esito_verifica TEXT,
  efficace BOOLEAN,
  costo_implementazione DECIMAL(15,2),
  allegati JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Enable RLS on all new tables
-- ============================================

ALTER TABLE public.rfq_richieste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_risposte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_comparazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subappalti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subappalti_documenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.varianti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.varianti_storico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capa ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (will be refined when auth is implemented)
CREATE POLICY "Allow all operations on rfq_richieste" ON public.rfq_richieste FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on rfq_risposte" ON public.rfq_risposte FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on rfq_comparazioni" ON public.rfq_comparazioni FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on subappalti" ON public.subappalti FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on subappalti_documenti" ON public.subappalti_documenti FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on varianti" ON public.varianti FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on varianti_storico" ON public.varianti_storico FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on non_conformita" ON public.non_conformita FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on capa" ON public.capa FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Triggers for updated_at
-- ============================================

CREATE TRIGGER update_rfq_richieste_updated_at BEFORE UPDATE ON public.rfq_richieste FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rfq_risposte_updated_at BEFORE UPDATE ON public.rfq_risposte FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subappalti_updated_at BEFORE UPDATE ON public.subappalti FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subappalti_documenti_updated_at BEFORE UPDATE ON public.subappalti_documenti FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_varianti_updated_at BEFORE UPDATE ON public.varianti FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_non_conformita_updated_at BEFORE UPDATE ON public.non_conformita FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capa_updated_at BEFORE UPDATE ON public.capa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Add Note and Date columns to ordini_fornitori and preventivi tables
-- ============================================

ALTER TABLE public.ordini_fornitori 
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS data_consegna_prevista DATE,
ADD COLUMN IF NOT EXISTS data_consegna_effettiva DATE,
ADD COLUMN IF NOT EXISTS condizioni_pagamento TEXT,
ADD COLUMN IF NOT EXISTS penali TEXT,
ADD COLUMN IF NOT EXISTS documenti_richiesti JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.preventivi
ADD COLUMN IF NOT EXISTS note TEXT;