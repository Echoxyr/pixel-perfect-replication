-- Create enum types
CREATE TYPE public.tipo_fattura AS ENUM ('attiva', 'passiva');
CREATE TYPE public.stato_fattura AS ENUM ('emessa', 'pagata', 'scaduta', 'in_attesa', 'contestata');
CREATE TYPE public.stato_nota_spesa AS ENUM ('presentata', 'approvata', 'rimborsata', 'rifiutata');
CREATE TYPE public.categoria_nota_spesa AS ENUM ('trasferta', 'materiale', 'vitto', 'alloggio', 'altro');
CREATE TYPE public.tipo_richiesta AS ENUM ('ferie', 'permesso', 'malattia', 'straordinario', 'anticipo', 'rimborso', 'altro');
CREATE TYPE public.stato_richiesta AS ENUM ('in_attesa', 'approvata', 'rifiutata', 'completata');
CREATE TYPE public.stato_preventivo AS ENUM ('bozza', 'inviato', 'approvato', 'rifiutato', 'scaduto');
CREATE TYPE public.stato_lead AS ENUM ('nuovo', 'contattato', 'qualificato', 'proposta', 'negoziazione', 'chiuso_vinto', 'chiuso_perso');

-- Fatture table
CREATE TABLE public.fatture (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  tipo tipo_fattura NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  scadenza DATE NOT NULL,
  cliente_fornitore TEXT NOT NULL,
  descrizione TEXT,
  commessa_id UUID,
  imponibile DECIMAL(12,2) NOT NULL DEFAULT 0,
  aliquota_iva INTEGER NOT NULL DEFAULT 22,
  iva DECIMAL(12,2) GENERATED ALWAYS AS (imponibile * aliquota_iva / 100) STORED,
  totale DECIMAL(12,2) GENERATED ALWAYS AS (imponibile * (1 + aliquota_iva::decimal / 100)) STORED,
  stato stato_fattura NOT NULL DEFAULT 'emessa',
  metodo_pagamento TEXT,
  data_pagamento DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Note Spesa table
CREATE TABLE public.note_spesa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  dipendente_id UUID,
  dipendente_nome TEXT NOT NULL,
  commessa_id UUID,
  descrizione TEXT NOT NULL,
  importo DECIMAL(10,2) NOT NULL,
  stato stato_nota_spesa NOT NULL DEFAULT 'presentata',
  categoria categoria_nota_spesa NOT NULL DEFAULT 'altro',
  allegati TEXT[] DEFAULT '{}',
  note TEXT,
  approvato_da TEXT,
  data_approvazione DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Richieste Dipendenti table
CREATE TABLE public.richieste_dipendenti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  dipendente_id UUID,
  dipendente_nome TEXT NOT NULL,
  tipo tipo_richiesta NOT NULL,
  descrizione TEXT NOT NULL,
  data_inizio DATE,
  data_fine DATE,
  importo DECIMAL(10,2),
  stato stato_richiesta NOT NULL DEFAULT 'in_attesa',
  note TEXT,
  approvato_da TEXT,
  data_approvazione DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organigramma table
CREATE TABLE public.organigramma (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ruolo TEXT NOT NULL,
  reparto TEXT NOT NULL,
  superiore_id UUID REFERENCES public.organigramma(id) ON DELETE SET NULL,
  livello INTEGER NOT NULL DEFAULT 0,
  email TEXT,
  telefono TEXT,
  foto_url TEXT,
  dipendente_id UUID,
  ordine INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leads/Clienti potenziali table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  azienda TEXT,
  email TEXT,
  telefono TEXT,
  indirizzo TEXT,
  fonte TEXT,
  stato stato_lead NOT NULL DEFAULT 'nuovo',
  valore_stimato DECIMAL(12,2),
  probabilita INTEGER DEFAULT 50,
  note TEXT,
  assegnato_a TEXT,
  prossimo_contatto DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Preventivi table
CREATE TABLE public.preventivi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  validita_giorni INTEGER NOT NULL DEFAULT 30,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  oggetto TEXT NOT NULL,
  descrizione TEXT,
  imponibile DECIMAL(12,2) NOT NULL DEFAULT 0,
  sconto_percentuale DECIMAL(5,2) DEFAULT 0,
  aliquota_iva INTEGER NOT NULL DEFAULT 22,
  totale DECIMAL(12,2),
  stato stato_preventivo NOT NULL DEFAULT 'bozza',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voci Preventivo table
CREATE TABLE public.voci_preventivo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preventivo_id UUID NOT NULL REFERENCES public.preventivi(id) ON DELETE CASCADE,
  descrizione TEXT NOT NULL,
  unita_misura TEXT NOT NULL DEFAULT 'corpo',
  quantita DECIMAL(10,3) NOT NULL DEFAULT 1,
  prezzo_unitario DECIMAL(12,2) NOT NULL,
  importo DECIMAL(12,2) GENERATED ALWAYS AS (quantita * prezzo_unitario) STORED,
  ordine INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Computi Metrici table
CREATE TABLE public.computi_metrici (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descrizione TEXT,
  cantiere_id UUID,
  data_creazione DATE NOT NULL DEFAULT CURRENT_DATE,
  stato TEXT NOT NULL DEFAULT 'bozza',
  totale_computo DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voci Computo table
CREATE TABLE public.voci_computo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  computo_id UUID NOT NULL REFERENCES public.computi_metrici(id) ON DELETE CASCADE,
  codice TEXT,
  descrizione TEXT NOT NULL,
  unita_misura TEXT NOT NULL,
  quantita DECIMAL(12,4) NOT NULL,
  prezzo_unitario DECIMAL(12,4) NOT NULL,
  importo DECIMAL(14,2) GENERATED ALWAYS AS (quantita * prezzo_unitario) STORED,
  categoria TEXT,
  capitolo TEXT,
  ordine INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.fatture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_spesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.richieste_dipendenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organigramma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventivi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voci_preventivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.computi_metrici ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voci_computo ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth yet - will be updated when auth is added)
CREATE POLICY "Allow all access to fatture" ON public.fatture FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to note_spesa" ON public.note_spesa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to richieste_dipendenti" ON public.richieste_dipendenti FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to organigramma" ON public.organigramma FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to preventivi" ON public.preventivi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to voci_preventivo" ON public.voci_preventivo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to computi_metrici" ON public.computi_metrici FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to voci_computo" ON public.voci_computo FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_fatture_updated_at BEFORE UPDATE ON public.fatture FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_note_spesa_updated_at BEFORE UPDATE ON public.note_spesa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_richieste_dipendenti_updated_at BEFORE UPDATE ON public.richieste_dipendenti FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organigramma_updated_at BEFORE UPDATE ON public.organigramma FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_preventivi_updated_at BEFORE UPDATE ON public.preventivi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_computi_metrici_updated_at BEFORE UPDATE ON public.computi_metrici FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create sequence generators
CREATE OR REPLACE FUNCTION public.generate_numero_fattura()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    NEW.numero := CASE 
      WHEN NEW.tipo = 'attiva' THEN 'FA-' 
      ELSE 'FP-' 
    END || to_char(CURRENT_DATE, 'YYYY') || '-' || LPAD((SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 3) AS INTEGER)), 0) + 1 FROM public.fatture WHERE tipo = NEW.tipo AND numero LIKE '%' || to_char(CURRENT_DATE, 'YYYY') || '%')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_fattura_numero BEFORE INSERT ON public.fatture FOR EACH ROW EXECUTE FUNCTION public.generate_numero_fattura();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.fatture;
ALTER PUBLICATION supabase_realtime ADD TABLE public.note_spesa;
ALTER PUBLICATION supabase_realtime ADD TABLE public.richieste_dipendenti;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.preventivi;