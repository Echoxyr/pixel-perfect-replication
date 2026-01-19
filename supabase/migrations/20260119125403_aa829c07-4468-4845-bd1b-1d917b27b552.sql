-- DEMO MODE: Accesso pubblico completo per tutte le tabelle
-- Questa configurazione sarà rimossa quando il prodotto andrà in produzione

-- Funzione helper per applicare policy pubbliche
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    -- Drop tutte le policy esistenti
    EXECUTE format('DROP POLICY IF EXISTS "Public read %I" ON public.%I', t.tablename, t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Public write %I" ON public.%I', t.tablename, t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Public update %I" ON public.%I', t.tablename, t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Public delete %I" ON public.%I', t.tablename, t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated write %I" ON public.%I', t.tablename, t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated update %I" ON public.%I', t.tablename, t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated delete %I" ON public.%I', t.tablename, t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users manage %I" ON public.%I', t.tablename, t.tablename);
    
    -- Crea policy di accesso pubblico completo
    EXECUTE format('CREATE POLICY "Demo full access %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t.tablename, t.tablename);
  END LOOP;
END $$;

-- Storage: accesso pubblico completo al bucket documenti
DROP POLICY IF EXISTS "Allow public uploads to documenti" ON storage.objects;
DROP POLICY IF EXISTS "Public read documenti storage" ON storage.objects;
DROP POLICY IF EXISTS "Public update documenti storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete documenti storage" ON storage.objects;
DROP POLICY IF EXISTS "Demo full access storage" ON storage.objects;

CREATE POLICY "Demo full access storage"
ON storage.objects
FOR ALL
USING (bucket_id = 'documenti')
WITH CHECK (bucket_id = 'documenti');