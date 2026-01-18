
-- Aggiorna RLS per permettere lettura pubblica (demo mode)
-- Le scritture rimangono protette per utenti autenticati

-- CANTIERI
DROP POLICY IF EXISTS "Authenticated users manage cantieri" ON public.cantieri;
CREATE POLICY "Public read cantieri" ON public.cantieri FOR SELECT USING (true);
CREATE POLICY "Authenticated write cantieri" ON public.cantieri FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update cantieri" ON public.cantieri FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete cantieri" ON public.cantieri FOR DELETE USING (auth.role() = 'authenticated');

-- IMPRESE
DROP POLICY IF EXISTS "Authenticated users manage imprese" ON public.imprese;
CREATE POLICY "Public read imprese" ON public.imprese FOR SELECT USING (true);
CREATE POLICY "Authenticated write imprese" ON public.imprese FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update imprese" ON public.imprese FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete imprese" ON public.imprese FOR DELETE USING (auth.role() = 'authenticated');

-- LAVORATORI
DROP POLICY IF EXISTS "Authenticated users manage lavoratori" ON public.lavoratori;
CREATE POLICY "Public read lavoratori" ON public.lavoratori FOR SELECT USING (true);
CREATE POLICY "Authenticated write lavoratori" ON public.lavoratori FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update lavoratori" ON public.lavoratori FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete lavoratori" ON public.lavoratori FOR DELETE USING (auth.role() = 'authenticated');

-- DOCUMENTI
DROP POLICY IF EXISTS "Authenticated users manage documenti" ON public.documenti;
CREATE POLICY "Public read documenti" ON public.documenti FOR SELECT USING (true);
CREATE POLICY "Authenticated write documenti" ON public.documenti FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update documenti" ON public.documenti FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete documenti" ON public.documenti FOR DELETE USING (auth.role() = 'authenticated');

-- FORMAZIONI
DROP POLICY IF EXISTS "Authenticated users manage formazioni" ON public.formazioni;
CREATE POLICY "Public read formazioni" ON public.formazioni FOR SELECT USING (true);
CREATE POLICY "Authenticated write formazioni" ON public.formazioni FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update formazioni" ON public.formazioni FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete formazioni" ON public.formazioni FOR DELETE USING (auth.role() = 'authenticated');

-- DPI
DROP POLICY IF EXISTS "Authenticated users manage dpi" ON public.dpi;
CREATE POLICY "Public read dpi" ON public.dpi FOR SELECT USING (true);
CREATE POLICY "Authenticated write dpi" ON public.dpi FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update dpi" ON public.dpi FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete dpi" ON public.dpi FOR DELETE USING (auth.role() = 'authenticated');

-- TASKS
DROP POLICY IF EXISTS "Authenticated users manage tasks" ON public.tasks;
CREATE POLICY "Public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated write tasks" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update tasks" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete tasks" ON public.tasks FOR DELETE USING (auth.role() = 'authenticated');

-- VISITE_MEDICHE
DROP POLICY IF EXISTS "Authenticated users manage visite_mediche" ON public.visite_mediche;
CREATE POLICY "Public read visite_mediche" ON public.visite_mediche FOR SELECT USING (true);
CREATE POLICY "Authenticated write visite_mediche" ON public.visite_mediche FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update visite_mediche" ON public.visite_mediche FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete visite_mediche" ON public.visite_mediche FOR DELETE USING (auth.role() = 'authenticated');

-- CANTIERI_IMPRESE (relazione)
DROP POLICY IF EXISTS "Authenticated users manage cantieri_imprese" ON public.cantieri_imprese;
CREATE POLICY "Public read cantieri_imprese" ON public.cantieri_imprese FOR SELECT USING (true);
CREATE POLICY "Authenticated write cantieri_imprese" ON public.cantieri_imprese FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete cantieri_imprese" ON public.cantieri_imprese FOR DELETE USING (auth.role() = 'authenticated');

-- LAVORATORI_CANTIERI (relazione)
DROP POLICY IF EXISTS "Authenticated users manage lavoratori_cantieri" ON public.lavoratori_cantieri;
CREATE POLICY "Public read lavoratori_cantieri" ON public.lavoratori_cantieri FOR SELECT USING (true);
CREATE POLICY "Authenticated write lavoratori_cantieri" ON public.lavoratori_cantieri FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete lavoratori_cantieri" ON public.lavoratori_cantieri FOR DELETE USING (auth.role() = 'authenticated');

-- TIMBRATURE
DROP POLICY IF EXISTS "Authenticated users manage timbrature" ON public.timbrature;
CREATE POLICY "Public read timbrature" ON public.timbrature FOR SELECT USING (true);
CREATE POLICY "Authenticated write timbrature" ON public.timbrature FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update timbrature" ON public.timbrature FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete timbrature" ON public.timbrature FOR DELETE USING (auth.role() = 'authenticated');

-- SCADENZARIO
DROP POLICY IF EXISTS "Authenticated users manage scadenzario" ON public.scadenzario;
CREATE POLICY "Public read scadenzario" ON public.scadenzario FOR SELECT USING (true);
CREATE POLICY "Authenticated write scadenzario" ON public.scadenzario FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update scadenzario" ON public.scadenzario FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete scadenzario" ON public.scadenzario FOR DELETE USING (auth.role() = 'authenticated');

-- CHECKIN_SICUREZZA
DROP POLICY IF EXISTS "Authenticated users manage checkin_sicurezza" ON public.checkin_sicurezza;
CREATE POLICY "Public read checkin_sicurezza" ON public.checkin_sicurezza FOR SELECT USING (true);
CREATE POLICY "Authenticated write checkin_sicurezza" ON public.checkin_sicurezza FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update checkin_sicurezza" ON public.checkin_sicurezza FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete checkin_sicurezza" ON public.checkin_sicurezza FOR DELETE USING (auth.role() = 'authenticated');

-- RAPPORTINI
DROP POLICY IF EXISTS "Authenticated users manage rapportini" ON public.rapportini;
CREATE POLICY "Public read rapportini" ON public.rapportini FOR SELECT USING (true);
CREATE POLICY "Authenticated write rapportini" ON public.rapportini FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update rapportini" ON public.rapportini FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete rapportini" ON public.rapportini FOR DELETE USING (auth.role() = 'authenticated');

-- CONTRATTI
DROP POLICY IF EXISTS "Authenticated users manage contratti" ON public.contratti;
CREATE POLICY "Public read contratti" ON public.contratti FOR SELECT USING (true);
CREATE POLICY "Authenticated write contratti" ON public.contratti FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update contratti" ON public.contratti FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete contratti" ON public.contratti FOR DELETE USING (auth.role() = 'authenticated');
