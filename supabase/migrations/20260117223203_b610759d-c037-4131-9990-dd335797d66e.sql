-- Tabella per gestire i documenti dei fornitori (DURC, Visura, Polizze, ecc.)
CREATE TABLE public.documenti_fornitori (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fornitore_id UUID NOT NULL REFERENCES public.fornitori(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(100) NOT NULL,
  -- Tipi: DURC, VISURA_CAMERALE, CERT_ISO_9001, CERT_ISO_14001, CERT_ISO_45001, POLIZZA_RCT_RCO, DICH_ANTIMAFIA, ATTESTAZIONE_SOA, DUVRI, ALTRO
  numero_documento VARCHAR(100),
  data_emissione DATE,
  data_scadenza DATE,
  ente_emittente VARCHAR(255),
  file_url TEXT,
  note TEXT,
  stato VARCHAR(50) DEFAULT 'valido' CHECK (stato IN ('valido', 'in_scadenza', 'scaduto', 'da_verificare')),
  obbligatorio BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.documenti_fornitori ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica (senza auth per ora)
CREATE POLICY "Tutti possono leggere documenti fornitori"
ON public.documenti_fornitori FOR SELECT USING (true);

CREATE POLICY "Tutti possono inserire documenti fornitori"
ON public.documenti_fornitori FOR INSERT WITH CHECK (true);

CREATE POLICY "Tutti possono aggiornare documenti fornitori"
ON public.documenti_fornitori FOR UPDATE USING (true);

CREATE POLICY "Tutti possono eliminare documenti fornitori"
ON public.documenti_fornitori FOR DELETE USING (true);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_documenti_fornitori_updated_at
BEFORE UPDATE ON public.documenti_fornitori
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indice per ricerche veloci
CREATE INDEX idx_documenti_fornitori_fornitore ON public.documenti_fornitori(fornitore_id);
CREATE INDEX idx_documenti_fornitori_tipo ON public.documenti_fornitori(tipo_documento);
CREATE INDEX idx_documenti_fornitori_scadenza ON public.documenti_fornitori(data_scadenza);