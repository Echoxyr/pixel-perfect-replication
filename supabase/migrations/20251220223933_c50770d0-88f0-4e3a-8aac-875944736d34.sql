-- Aggiorna tabella timbrature con campi avanzati
ALTER TABLE public.timbrature 
ADD COLUMN IF NOT EXISTS ora_fine time,
ADD COLUMN IF NOT EXISTS ore_lavorate numeric,
ADD COLUMN IF NOT EXISTS ore_straordinario numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pausa_minuti integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS metodo text DEFAULT 'manuale', -- 'manuale', 'gps', 'qr', 'badge'
ADD COLUMN IF NOT EXISTS stato_validazione text DEFAULT 'da_validare', -- 'da_validare', 'validata', 'rifiutata'
ADD COLUMN IF NOT EXISTS validata_da text,
ADD COLUMN IF NOT EXISTS data_validazione timestamp with time zone,
ADD COLUMN IF NOT EXISTS non_conformita_tipo text, -- 'ritardo', 'uscita_anticipata', 'assenza_ingiustificata', 'straordinario_non_autorizzato'
ADD COLUMN IF NOT EXISTS non_conformita_motivo text,
ADD COLUMN IF NOT EXISTS turno text DEFAULT 'ordinario', -- 'ordinario', 'notturno', 'festivo', 'reperibilità'
ADD COLUMN IF NOT EXISTS attivita text; -- descrizione attività svolta

-- Crea tabella scadenzario completo
CREATE TABLE IF NOT EXISTS public.scadenzario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL, -- 'documento', 'formazione', 'manutenzione', 'visita_medica', 'contratto', 'assicurazione', 'altro'
  titolo text NOT NULL,
  descrizione text,
  data_scadenza date NOT NULL,
  entita_tipo text, -- 'lavoratore', 'cantiere', 'attrezzatura', 'veicolo', 'azienda'
  entita_id uuid,
  entita_nome text,
  giorni_preavviso integer DEFAULT 30,
  stato text DEFAULT 'attiva', -- 'attiva', 'in_scadenza', 'scaduta', 'completata', 'archiviata'
  priorita text DEFAULT 'media', -- 'bassa', 'media', 'alta', 'critica'
  responsabile text,
  note text,
  allegati text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scadenzario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view scadenzario" ON public.scadenzario FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert scadenzario" ON public.scadenzario FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update scadenzario" ON public.scadenzario FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete scadenzario" ON public.scadenzario FOR DELETE TO authenticated USING (true);

-- Crea tabella contabilità analitica (centri di costo)
CREATE TABLE IF NOT EXISTS public.centri_costo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codice text NOT NULL UNIQUE,
  nome text NOT NULL,
  tipo text NOT NULL, -- 'cantiere', 'reparto', 'progetto', 'overhead'
  parent_id uuid REFERENCES public.centri_costo(id),
  budget_annuale numeric DEFAULT 0,
  responsabile text,
  attivo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.centri_costo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage centri_costo" ON public.centri_costo FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella movimenti contabili
CREATE TABLE IF NOT EXISTS public.movimenti_contabili (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL, -- 'costo', 'ricavo', 'trasferimento'
  centro_costo_id uuid REFERENCES public.centri_costo(id),
  descrizione text NOT NULL,
  importo numeric NOT NULL,
  categoria text, -- 'manodopera', 'materiali', 'attrezzature', 'subappalti', 'generali', 'altro'
  documento_tipo text, -- 'fattura', 'nota_spesa', 'ddt', 'altro'
  documento_id uuid,
  documento_numero text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.movimenti_contabili ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage movimenti" ON public.movimenti_contabili FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella rapportini giornalieri
CREATE TABLE IF NOT EXISTS public.rapportini (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data date NOT NULL DEFAULT CURRENT_DATE,
  cantiere_id uuid,
  cantiere_nome text,
  redatto_da text NOT NULL,
  condizioni_meteo text, -- 'sereno', 'nuvoloso', 'pioggia', 'neve', 'vento_forte'
  temperatura_min integer,
  temperatura_max integer,
  ore_lavorate_totali numeric DEFAULT 0,
  lavorazioni_eseguite text,
  materiali_utilizzati text,
  attrezzature_utilizzate text,
  problemi_riscontrati text,
  note_sicurezza text,
  foto_allegati text[] DEFAULT '{}',
  approvato boolean DEFAULT false,
  approvato_da text,
  data_approvazione timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rapportini ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage rapportini" ON public.rapportini FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella presenze rapportino
CREATE TABLE IF NOT EXISTS public.presenze_rapportino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rapportino_id uuid NOT NULL REFERENCES public.rapportini(id) ON DELETE CASCADE,
  lavoratore_nome text NOT NULL,
  lavoratore_id uuid,
  ore_ordinarie numeric DEFAULT 0,
  ore_straordinario numeric DEFAULT 0,
  mansione text,
  note text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.presenze_rapportino ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage presenze_rapportino" ON public.presenze_rapportino FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella contatti/rubrica aziendale
CREATE TABLE IF NOT EXISTS public.contatti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL, -- 'cliente', 'fornitore', 'subappaltatore', 'professionista', 'ente', 'altro'
  ragione_sociale text,
  nome text NOT NULL,
  cognome text,
  ruolo text,
  azienda text,
  email text,
  telefono text,
  cellulare text,
  pec text,
  indirizzo text,
  citta text,
  cap text,
  provincia text,
  partita_iva text,
  codice_fiscale text,
  codice_sdi text,
  iban text,
  note text,
  tags text[] DEFAULT '{}',
  preferito boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.contatti ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage contatti" ON public.contatti FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella listino prezzi
CREATE TABLE IF NOT EXISTS public.listino_prezzi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codice text NOT NULL,
  descrizione text NOT NULL,
  unita_misura text NOT NULL DEFAULT 'cad',
  prezzo_unitario numeric NOT NULL,
  categoria text, -- 'manodopera', 'materiale', 'attrezzatura', 'lavorazione', 'altro'
  sottocategoria text,
  fornitore text,
  costo_acquisto numeric,
  margine_percentuale numeric,
  iva_percentuale integer DEFAULT 22,
  note text,
  attivo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.listino_prezzi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage listino" ON public.listino_prezzi FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella magazzino
CREATE TABLE IF NOT EXISTS public.magazzino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codice text NOT NULL UNIQUE,
  descrizione text NOT NULL,
  categoria text,
  unita_misura text DEFAULT 'pz',
  quantita_disponibile numeric DEFAULT 0,
  quantita_minima numeric DEFAULT 0,
  prezzo_medio numeric DEFAULT 0,
  ubicazione text,
  fornitore_preferito text,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.magazzino ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage magazzino" ON public.magazzino FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella movimenti magazzino
CREATE TABLE IF NOT EXISTS public.movimenti_magazzino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  articolo_id uuid NOT NULL REFERENCES public.magazzino(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  tipo text NOT NULL, -- 'carico', 'scarico', 'rettifica', 'trasferimento'
  quantita numeric NOT NULL,
  cantiere_id uuid,
  cantiere_nome text,
  documento_tipo text, -- 'ddt', 'fattura', 'ordine', 'altro'
  documento_numero text,
  note text,
  eseguito_da text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.movimenti_magazzino ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage movimenti_magazzino" ON public.movimenti_magazzino FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella check-in sicurezza cantiere
CREATE TABLE IF NOT EXISTS public.checkin_sicurezza (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cantiere_id uuid,
  cantiere_nome text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  ora time NOT NULL DEFAULT CURRENT_TIME,
  eseguito_da text NOT NULL,
  ruolo text,
  dpi_verificati boolean DEFAULT false,
  dpi_mancanti text,
  briefing_effettuato boolean DEFAULT false,
  argomenti_briefing text,
  condizioni_meteo_ok boolean DEFAULT true,
  segnalazioni_pericoli text,
  area_lavoro_delimitata boolean DEFAULT false,
  mezzi_verificati boolean DEFAULT false,
  primo_soccorso_ok boolean DEFAULT false,
  estintori_ok boolean DEFAULT false,
  note text,
  foto_allegati text[] DEFAULT '{}',
  firma_responsabile text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.checkin_sicurezza ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage checkin_sicurezza" ON public.checkin_sicurezza FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Crea tabella budget cantiere
CREATE TABLE IF NOT EXISTS public.budget_cantiere (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cantiere_id uuid,
  cantiere_nome text NOT NULL,
  voce text NOT NULL,
  categoria text NOT NULL, -- 'manodopera', 'materiali', 'attrezzature', 'subappalti', 'generali', 'imprevisti'
  importo_previsto numeric NOT NULL DEFAULT 0,
  importo_consuntivo numeric DEFAULT 0,
  data_prevista date,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.budget_cantiere ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage budget_cantiere" ON public.budget_cantiere FOR ALL TO authenticated USING (true) WITH CHECK (true);