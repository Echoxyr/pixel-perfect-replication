-- Tabella documenti mezzi/risorse
CREATE TABLE public.documenti_risorse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risorsa_id UUID NOT NULL REFERENCES public.risorse(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'assicurazione', 'revisione', 'bollo', 'patente', 'libretto', 'altro'
  titolo TEXT NOT NULL,
  data_emissione DATE,
  data_scadenza DATE,
  allegato_url TEXT,
  note TEXT,
  stato TEXT NOT NULL DEFAULT 'valido', -- 'valido', 'scaduto', 'in_scadenza'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella report km e attività mezzi
CREATE TABLE public.attivita_risorse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risorsa_id UUID NOT NULL REFERENCES public.risorse(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_attivita TEXT NOT NULL, -- 'km', 'rifornimento', 'manutenzione', 'utilizzo', 'controllo'
  cantiere_id UUID,
  cantiere_nome TEXT,
  km_iniziali NUMERIC,
  km_finali NUMERIC,
  km_percorsi NUMERIC,
  litri_carburante NUMERIC,
  costo NUMERIC,
  ore_utilizzo NUMERIC,
  eseguito_da TEXT,
  descrizione TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella scadenze manutenzioni programmate
CREATE TABLE public.manutenzioni_risorse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risorsa_id UUID NOT NULL REFERENCES public.risorse(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'ordinaria', 'straordinaria', 'tagliando', 'controllo'
  descrizione TEXT NOT NULL,
  data_programmata DATE,
  data_esecuzione DATE,
  km_programmati NUMERIC,
  km_esecuzione NUMERIC,
  costo NUMERIC,
  eseguito_da TEXT,
  officina TEXT,
  stato TEXT NOT NULL DEFAULT 'programmata', -- 'programmata', 'completata', 'in_ritardo'
  allegati TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.documenti_risorse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attivita_risorse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutenzioni_risorse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage documenti_risorse" ON public.documenti_risorse FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage attivita_risorse" ON public.attivita_risorse FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage manutenzioni_risorse" ON public.manutenzioni_risorse FOR ALL USING (true) WITH CHECK (true);