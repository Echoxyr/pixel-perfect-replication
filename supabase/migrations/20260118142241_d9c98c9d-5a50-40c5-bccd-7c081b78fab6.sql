-- =====================================================
-- MIGRAZIONE: Tracciabilità End-to-End Documenti
-- Preventivo → Ordine → DDT → Fattura → SAL
-- =====================================================

-- 1. Aggiungere campi di tracciabilità alla tabella preventivi_fornitori
ALTER TABLE public.preventivi_fornitori 
ADD COLUMN IF NOT EXISTS ordine_generato_id UUID REFERENCES ordini_fornitori(id),
ADD COLUMN IF NOT EXISTS convertito_in_ordine_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS computo_id UUID,
ADD COLUMN IF NOT EXISTS cantiere_id UUID REFERENCES cantieri(id);

-- 2. Aggiungere campi di tracciabilità alla tabella ordini_fornitori
ALTER TABLE public.ordini_fornitori
ADD COLUMN IF NOT EXISTS preventivo_origine_id UUID REFERENCES preventivi_fornitori(id),
ADD COLUMN IF NOT EXISTS ddt_generato_id UUID,
ADD COLUMN IF NOT EXISTS convertito_in_ddt_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cantiere_id UUID REFERENCES cantieri(id);

-- 3. Aggiungere campi di tracciabilità alla tabella ddt
ALTER TABLE public.ddt
ADD COLUMN IF NOT EXISTS ordine_origine_id UUID REFERENCES ordini_fornitori(id),
ADD COLUMN IF NOT EXISTS fattura_generata_id UUID,
ADD COLUMN IF NOT EXISTS convertito_in_fattura_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS fornitore_id UUID REFERENCES fornitori(id);

-- 4. Aggiungere campi di tracciabilità alla tabella fatture
ALTER TABLE public.fatture
ADD COLUMN IF NOT EXISTS ddt_origine_id UUID,
ADD COLUMN IF NOT EXISTS ordine_origine_id UUID,
ADD COLUMN IF NOT EXISTS preventivo_origine_id UUID,
ADD COLUMN IF NOT EXISTS sal_origine_id UUID,
ADD COLUMN IF NOT EXISTS cantiere_id UUID REFERENCES cantieri(id),
ADD COLUMN IF NOT EXISTS fornitore_id UUID REFERENCES fornitori(id);

-- 5. Creare tabella per notifiche di workflow
CREATE TABLE IF NOT EXISTS public.workflow_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'conversione', 'scadenza', 'alert', 'approvazione'
  entita_tipo TEXT NOT NULL, -- 'preventivo', 'ordine', 'ddt', 'fattura', 'documento'
  entita_id UUID NOT NULL,
  titolo TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  priorita TEXT DEFAULT 'media', -- 'bassa', 'media', 'alta', 'critica'
  stato TEXT DEFAULT 'non_letta', -- 'non_letta', 'letta', 'archiviata'
  azione_suggerita TEXT,
  link_azione TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  letta_at TIMESTAMPTZ
);

-- 6. Creare tabella per audit trail conversioni
CREATE TABLE IF NOT EXISTS public.document_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_origine_tipo TEXT NOT NULL,
  documento_origine_id UUID NOT NULL,
  documento_destinazione_tipo TEXT NOT NULL,
  documento_destinazione_id UUID NOT NULL,
  convertito_da TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Creare tabella per previsioni AI
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'ritardo_cantiere', 'cashflow', 'affidabilita_fornitore', 'scadenza_critica'
  entita_tipo TEXT,
  entita_id UUID,
  entita_nome TEXT,
  probabilita NUMERIC(5,2),
  impatto TEXT, -- 'basso', 'medio', 'alto', 'critico'
  previsione_dettaglio JSONB,
  raccomandazioni TEXT[],
  dati_input JSONB,
  modello_usato TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  valido_fino TIMESTAMPTZ
);

-- 8. Creare tabella per compliance check automatici
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornitore_id UUID REFERENCES fornitori(id),
  fornitore_nome TEXT,
  tipo_check TEXT NOT NULL, -- 'durc', 'visura', 'polizza', 'antimafia', 'dvr'
  stato TEXT DEFAULT 'valido', -- 'valido', 'in_scadenza', 'scaduto', 'mancante'
  data_scadenza DATE,
  giorni_rimanenti INTEGER,
  blocco_pagamento BOOLEAN DEFAULT false,
  ultimo_controllo TIMESTAMPTZ DEFAULT now(),
  note TEXT
);

-- 9. Abilitare RLS su nuove tabelle
ALTER TABLE public.workflow_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- 10. Creare policy pubbliche (no auth per ora)
CREATE POLICY "Allow all on workflow_notifications" ON public.workflow_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on document_conversions" ON public.document_conversions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ai_predictions" ON public.ai_predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on compliance_checks" ON public.compliance_checks FOR ALL USING (true) WITH CHECK (true);

-- 11. Creare indici per performance
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_stato ON public.workflow_notifications(stato);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_tipo ON public.workflow_notifications(tipo);
CREATE INDEX IF NOT EXISTS idx_document_conversions_origine ON public.document_conversions(documento_origine_tipo, documento_origine_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_tipo ON public.ai_predictions(tipo);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_fornitore ON public.compliance_checks(fornitore_id);

-- 12. Creare funzione per calcolare compliance fornitori
CREATE OR REPLACE FUNCTION public.calculate_supplier_compliance(p_fornitore_id UUID)
RETURNS TABLE (
  documenti_validi INTEGER,
  documenti_scadenza INTEGER,
  documenti_scaduti INTEGER,
  documenti_mancanti INTEGER,
  pagabile BOOLEAN,
  blocco_motivo TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_durc_ok BOOLEAN := false;
  v_visura_ok BOOLEAN := false;
  v_polizza_ok BOOLEAN := false;
  v_antimafia_ok BOOLEAN := false;
  v_dvr_ok BOOLEAN := false;
  v_validi INTEGER := 0;
  v_scadenza INTEGER := 0;
  v_scaduti INTEGER := 0;
  v_mancanti INTEGER := 0;
  v_blocco TEXT := '';
BEGIN
  -- Check each mandatory document
  SELECT COUNT(*) > 0 INTO v_durc_ok FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND tipo_documento = 'DURC' 
    AND data_scadenza >= CURRENT_DATE;
  
  SELECT COUNT(*) > 0 INTO v_visura_ok FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND tipo_documento = 'VISURA_CAMERALE' 
    AND data_scadenza >= CURRENT_DATE;
  
  SELECT COUNT(*) > 0 INTO v_polizza_ok FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND tipo_documento = 'POLIZZA_RCT_RCO' 
    AND data_scadenza >= CURRENT_DATE;
    
  SELECT COUNT(*) > 0 INTO v_antimafia_ok FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND tipo_documento = 'DICH_ANTIMAFIA' 
    AND data_scadenza >= CURRENT_DATE;
    
  SELECT COUNT(*) > 0 INTO v_dvr_ok FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND tipo_documento = 'DVR' 
    AND data_scadenza >= CURRENT_DATE;

  -- Count documents
  SELECT COUNT(*) INTO v_validi FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND data_scadenza >= CURRENT_DATE + INTERVAL '30 days';
    
  SELECT COUNT(*) INTO v_scadenza FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND data_scadenza >= CURRENT_DATE 
    AND data_scadenza < CURRENT_DATE + INTERVAL '30 days';
    
  SELECT COUNT(*) INTO v_scaduti FROM documenti_fornitori 
    WHERE fornitore_id = p_fornitore_id AND data_scadenza < CURRENT_DATE;

  -- Calculate missing mandatory docs
  v_mancanti := 0;
  IF NOT v_durc_ok THEN v_mancanti := v_mancanti + 1; v_blocco := v_blocco || 'DURC, '; END IF;
  IF NOT v_visura_ok THEN v_mancanti := v_mancanti + 1; v_blocco := v_blocco || 'Visura, '; END IF;
  IF NOT v_polizza_ok THEN v_mancanti := v_mancanti + 1; v_blocco := v_blocco || 'Polizza, '; END IF;
  IF NOT v_antimafia_ok THEN v_mancanti := v_mancanti + 1; v_blocco := v_blocco || 'Antimafia, '; END IF;
  IF NOT v_dvr_ok THEN v_mancanti := v_mancanti + 1; v_blocco := v_blocco || 'DVR, '; END IF;

  RETURN QUERY SELECT 
    v_validi,
    v_scadenza,
    v_scaduti,
    v_mancanti,
    (v_durc_ok AND v_visura_ok AND v_polizza_ok AND v_antimafia_ok AND v_dvr_ok),
    NULLIF(TRIM(TRAILING ', ' FROM v_blocco), '');
END;
$$;