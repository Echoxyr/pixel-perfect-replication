-- Add stato_approvazione column to rfq_risposte for approve/reject workflow
ALTER TABLE public.rfq_risposte 
ADD COLUMN IF NOT EXISTS stato_approvazione TEXT DEFAULT 'in_valutazione';

-- Add comment
COMMENT ON COLUMN public.rfq_risposte.stato_approvazione IS 'Stato approvazione: in_valutazione, approvata, rifiutata, vincente';