-- Create storage bucket for documents (fatture, note spesa, DDT, allegati)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'documenti', 
  'documenti', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for documenti bucket
CREATE POLICY "Allow authenticated users to read own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documenti' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documenti' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documenti' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documenti' AND auth.role() = 'authenticated');

-- Add allegati column to fatture if not exists
ALTER TABLE public.fatture ADD COLUMN IF NOT EXISTS allegati text[] DEFAULT '{}';

-- Create DDT (Documenti di Trasporto) table
CREATE TABLE public.ddt (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL DEFAULT 'uscita', -- 'entrata' | 'uscita'
  mittente TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  indirizzo_destinazione TEXT,
  causale_trasporto TEXT DEFAULT 'Vendita',
  aspetto_beni TEXT,
  peso_kg NUMERIC,
  colli INTEGER DEFAULT 1,
  vettore TEXT,
  note TEXT,
  stato TEXT NOT NULL DEFAULT 'emesso', -- 'bozza' | 'emesso' | 'consegnato' | 'annullato'
  commessa_id UUID,
  allegati TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DDT items table
CREATE TABLE public.righe_ddt (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ddt_id UUID NOT NULL REFERENCES public.ddt(id) ON DELETE CASCADE,
  codice TEXT,
  descrizione TEXT NOT NULL,
  quantita NUMERIC NOT NULL DEFAULT 1,
  unita_misura TEXT DEFAULT 'pz',
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ddt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.righe_ddt ENABLE ROW LEVEL SECURITY;

-- DDT policies
CREATE POLICY "Allow all access to ddt"
ON public.ddt FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to righe_ddt"
ON public.righe_ddt FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_ddt_updated_at
BEFORE UPDATE ON public.ddt
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add carta_intestata table for company letterhead
CREATE TABLE public.impostazioni_azienda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  codice_fiscale TEXT,
  indirizzo TEXT,
  cap TEXT,
  citta TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  pec TEXT,
  sito_web TEXT,
  logo_url TEXT,
  intestazione_personalizzata TEXT,
  footer_documento TEXT,
  iban TEXT,
  banca TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.impostazioni_azienda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to impostazioni_azienda"
ON public.impostazioni_azienda FOR ALL
USING (true)
WITH CHECK (true);

CREATE TRIGGER update_impostazioni_azienda_updated_at
BEFORE UPDATE ON public.impostazioni_azienda
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default company settings
INSERT INTO public.impostazioni_azienda (ragione_sociale, email)
VALUES ('La Tua Azienda SRL', 'info@azienda.it');

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.ddt;
ALTER PUBLICATION supabase_realtime ADD TABLE public.righe_ddt;