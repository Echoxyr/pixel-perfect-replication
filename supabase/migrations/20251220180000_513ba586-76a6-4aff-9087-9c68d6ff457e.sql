-- Drop existing permissive policies and create proper authentication-based policies for all tables

-- FATTURE
DROP POLICY IF EXISTS "Allow all access to fatture" ON public.fatture;
CREATE POLICY "Authenticated users can view fatture" ON public.fatture FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fatture" ON public.fatture FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update fatture" ON public.fatture FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete fatture" ON public.fatture FOR DELETE TO authenticated USING (true);

-- DDT
DROP POLICY IF EXISTS "Allow all access to ddt" ON public.ddt;
CREATE POLICY "Authenticated users can view ddt" ON public.ddt FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ddt" ON public.ddt FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ddt" ON public.ddt FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete ddt" ON public.ddt FOR DELETE TO authenticated USING (true);

-- RIGHE_DDT
DROP POLICY IF EXISTS "Allow all access to righe_ddt" ON public.righe_ddt;
CREATE POLICY "Authenticated users can view righe_ddt" ON public.righe_ddt FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert righe_ddt" ON public.righe_ddt FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update righe_ddt" ON public.righe_ddt FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete righe_ddt" ON public.righe_ddt FOR DELETE TO authenticated USING (true);

-- NOTE_SPESA
DROP POLICY IF EXISTS "Allow all access to note_spesa" ON public.note_spesa;
CREATE POLICY "Authenticated users can view note_spesa" ON public.note_spesa FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert note_spesa" ON public.note_spesa FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update note_spesa" ON public.note_spesa FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete note_spesa" ON public.note_spesa FOR DELETE TO authenticated USING (true);

-- RICHIESTE_DIPENDENTI
DROP POLICY IF EXISTS "Allow all access to richieste_dipendenti" ON public.richieste_dipendenti;
CREATE POLICY "Authenticated users can view richieste_dipendenti" ON public.richieste_dipendenti FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert richieste_dipendenti" ON public.richieste_dipendenti FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update richieste_dipendenti" ON public.richieste_dipendenti FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete richieste_dipendenti" ON public.richieste_dipendenti FOR DELETE TO authenticated USING (true);

-- ORGANIGRAMMA
DROP POLICY IF EXISTS "Allow all access to organigramma" ON public.organigramma;
CREATE POLICY "Authenticated users can view organigramma" ON public.organigramma FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert organigramma" ON public.organigramma FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update organigramma" ON public.organigramma FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete organigramma" ON public.organigramma FOR DELETE TO authenticated USING (true);

-- PREVENTIVI
DROP POLICY IF EXISTS "Allow all access to preventivi" ON public.preventivi;
CREATE POLICY "Authenticated users can view preventivi" ON public.preventivi FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert preventivi" ON public.preventivi FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update preventivi" ON public.preventivi FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete preventivi" ON public.preventivi FOR DELETE TO authenticated USING (true);

-- VOCI_PREVENTIVO
DROP POLICY IF EXISTS "Allow all access to voci_preventivo" ON public.voci_preventivo;
CREATE POLICY "Authenticated users can view voci_preventivo" ON public.voci_preventivo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert voci_preventivo" ON public.voci_preventivo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update voci_preventivo" ON public.voci_preventivo FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete voci_preventivo" ON public.voci_preventivo FOR DELETE TO authenticated USING (true);

-- COMPUTI_METRICI
DROP POLICY IF EXISTS "Allow all access to computi_metrici" ON public.computi_metrici;
CREATE POLICY "Authenticated users can view computi_metrici" ON public.computi_metrici FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert computi_metrici" ON public.computi_metrici FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update computi_metrici" ON public.computi_metrici FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete computi_metrici" ON public.computi_metrici FOR DELETE TO authenticated USING (true);

-- VOCI_COMPUTO
DROP POLICY IF EXISTS "Allow all access to voci_computo" ON public.voci_computo;
CREATE POLICY "Authenticated users can view voci_computo" ON public.voci_computo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert voci_computo" ON public.voci_computo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update voci_computo" ON public.voci_computo FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete voci_computo" ON public.voci_computo FOR DELETE TO authenticated USING (true);

-- IMPOSTAZIONI_AZIENDA
DROP POLICY IF EXISTS "Allow all access to impostazioni_azienda" ON public.impostazioni_azienda;
CREATE POLICY "Authenticated users can view impostazioni_azienda" ON public.impostazioni_azienda FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert impostazioni_azienda" ON public.impostazioni_azienda FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update impostazioni_azienda" ON public.impostazioni_azienda FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete impostazioni_azienda" ON public.impostazioni_azienda FOR DELETE TO authenticated USING (true);