-- Abilita upload pubblico sul bucket 'documenti' per demo mode
-- Prima verifica che le policy esistenti vengano rimosse

-- Policy per INSERT (upload)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public upload documenti" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to documenti" ON storage.objects;

CREATE POLICY "Allow public uploads to documenti"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documenti');

-- Policy per SELECT (lettura/download)
DROP POLICY IF EXISTS "Public read documenti storage" ON storage.objects;

CREATE POLICY "Public read documenti storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documenti');

-- Policy per UPDATE
DROP POLICY IF EXISTS "Public update documenti storage" ON storage.objects;

CREATE POLICY "Public update documenti storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'documenti');

-- Policy per DELETE
DROP POLICY IF EXISTS "Public delete documenti storage" ON storage.objects;

CREATE POLICY "Public delete documenti storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documenti');