-- ============================================
-- SECURITY FIX: Update all RLS policies to require authentication
-- ============================================

-- Drop all existing overly permissive policies and create authenticated-only policies

-- =============================================
-- 1. USER-SPECIFIC TABLES (user_id ownership)
-- =============================================

-- user_profiles
DROP POLICY IF EXISTS "Anyone can manage user_profiles" ON public.user_profiles;
CREATE POLICY "Users manage own profile" ON public.user_profiles
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- user_roles (admin only for write, anyone auth can read own)
DROP POLICY IF EXISTS "Anyone can manage user_roles" ON public.user_roles;
CREATE POLICY "Users can view roles" ON public.user_roles
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins can manage roles" ON public.user_roles
FOR ALL USING (auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'))
WITH CHECK (auth.role() = 'authenticated' AND has_role(auth.uid(), 'admin'));

-- user_tasks
DROP POLICY IF EXISTS "Anyone can manage user_tasks" ON public.user_tasks;
CREATE POLICY "Authenticated users manage user_tasks" ON public.user_tasks
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- user_calendar_events
DROP POLICY IF EXISTS "Anyone can manage user_calendar_events" ON public.user_calendar_events;
CREATE POLICY "Authenticated users manage user_calendar_events" ON public.user_calendar_events
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- user_notes
DROP POLICY IF EXISTS "Anyone can manage user_notes" ON public.user_notes;
CREATE POLICY "Authenticated users manage user_notes" ON public.user_notes
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- user_preferences
DROP POLICY IF EXISTS "Anyone can manage user_preferences" ON public.user_preferences;
CREATE POLICY "Authenticated users manage user_preferences" ON public.user_preferences
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- user_favorites - fix the NULL bypass bug
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_favorites;
CREATE POLICY "Users manage own favorites" ON public.user_favorites
FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() = user_id)
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- =============================================
-- 2. BUSINESS DATA TABLES (authenticated access)
-- =============================================

-- fornitori
DROP POLICY IF EXISTS "Anyone can manage fornitori" ON public.fornitori;
CREATE POLICY "Authenticated users manage fornitori" ON public.fornitori
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- timbrature
DROP POLICY IF EXISTS "Anyone can manage timbrature" ON public.timbrature;
CREATE POLICY "Authenticated users manage timbrature" ON public.timbrature
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- notifiche
DROP POLICY IF EXISTS "Anyone can manage notifiche" ON public.notifiche;
CREATE POLICY "Authenticated users manage notifiche" ON public.notifiche
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- rapportini
DROP POLICY IF EXISTS "Anyone can manage rapportini" ON public.rapportini;
CREATE POLICY "Authenticated users manage rapportini" ON public.rapportini
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- checkin_sicurezza
DROP POLICY IF EXISTS "Authenticated users can manage checkin_sicurezza" ON public.checkin_sicurezza;
CREATE POLICY "Authenticated users manage checkin_sicurezza" ON public.checkin_sicurezza
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- risorse
DROP POLICY IF EXISTS "Anyone can manage risorse" ON public.risorse;
CREATE POLICY "Authenticated users manage risorse" ON public.risorse
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- documenti_risorse
DROP POLICY IF EXISTS "Anyone can manage documenti_risorse" ON public.documenti_risorse;
CREATE POLICY "Authenticated users manage documenti_risorse" ON public.documenti_risorse
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- attivita_risorse
DROP POLICY IF EXISTS "Anyone can manage attivita_risorse" ON public.attivita_risorse;
CREATE POLICY "Authenticated users manage attivita_risorse" ON public.attivita_risorse
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- manutenzioni_risorse
DROP POLICY IF EXISTS "Anyone can manage manutenzioni_risorse" ON public.manutenzioni_risorse;
CREATE POLICY "Authenticated users manage manutenzioni_risorse" ON public.manutenzioni_risorse
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- cantieri
DROP POLICY IF EXISTS "Allow all access to cantieri" ON public.cantieri;
CREATE POLICY "Authenticated users manage cantieri" ON public.cantieri
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- imprese
DROP POLICY IF EXISTS "Allow all access to imprese" ON public.imprese;
CREATE POLICY "Authenticated users manage imprese" ON public.imprese
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- lavoratori
DROP POLICY IF EXISTS "Allow all access to lavoratori" ON public.lavoratori;
CREATE POLICY "Authenticated users manage lavoratori" ON public.lavoratori
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- cantieri_imprese
DROP POLICY IF EXISTS "Allow all access to cantieri_imprese" ON public.cantieri_imprese;
CREATE POLICY "Authenticated users manage cantieri_imprese" ON public.cantieri_imprese
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- lavoratori_cantieri
DROP POLICY IF EXISTS "Allow all access to lavoratori_cantieri" ON public.lavoratori_cantieri;
CREATE POLICY "Authenticated users manage lavoratori_cantieri" ON public.lavoratori_cantieri
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- documenti
DROP POLICY IF EXISTS "Allow all access to documenti" ON public.documenti;
CREATE POLICY "Authenticated users manage documenti" ON public.documenti
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- documenti_fornitori
DROP POLICY IF EXISTS "Anyone can manage documenti_fornitori" ON public.documenti_fornitori;
CREATE POLICY "Authenticated users manage documenti_fornitori" ON public.documenti_fornitori
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- documenti_azienda
DROP POLICY IF EXISTS "Allow all access to documenti_azienda" ON public.documenti_azienda;
CREATE POLICY "Authenticated users manage documenti_azienda" ON public.documenti_azienda
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- formazioni
DROP POLICY IF EXISTS "Allow all access to formazioni" ON public.formazioni;
CREATE POLICY "Authenticated users manage formazioni" ON public.formazioni
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- dpi
DROP POLICY IF EXISTS "Allow all access to dpi" ON public.dpi;
CREATE POLICY "Authenticated users manage dpi" ON public.dpi
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- visite_mediche
DROP POLICY IF EXISTS "Allow all access to visite_mediche" ON public.visite_mediche;
CREATE POLICY "Authenticated users manage visite_mediche" ON public.visite_mediche
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- tasks
DROP POLICY IF EXISTS "Allow all access to tasks" ON public.tasks;
CREATE POLICY "Authenticated users manage tasks" ON public.tasks
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- pos_templates
DROP POLICY IF EXISTS "Anyone can manage pos_templates" ON public.pos_templates;
CREATE POLICY "Authenticated users manage pos_templates" ON public.pos_templates
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- sal_excel_imports
DROP POLICY IF EXISTS "Anyone can manage sal_excel_imports" ON public.sal_excel_imports;
CREATE POLICY "Authenticated users manage sal_excel_imports" ON public.sal_excel_imports
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- sal_voci_dettaglio
DROP POLICY IF EXISTS "Anyone can manage sal_voci_dettaglio" ON public.sal_voci_dettaglio;
CREATE POLICY "Authenticated users manage sal_voci_dettaglio" ON public.sal_voci_dettaglio
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- prenotazioni_risorse
DROP POLICY IF EXISTS "Anyone can manage prenotazioni_risorse" ON public.prenotazioni_risorse;
CREATE POLICY "Authenticated users manage prenotazioni_risorse" ON public.prenotazioni_risorse
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- organigramma
DROP POLICY IF EXISTS "Authenticated users can manage organigramma" ON public.organigramma;
CREATE POLICY "Authenticated users manage organigramma" ON public.organigramma
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 3. FINANCIAL TABLES (authenticated access)
-- =============================================

-- fatture
DROP POLICY IF EXISTS "Authenticated users can manage fatture" ON public.fatture;
CREATE POLICY "Authenticated users manage fatture" ON public.fatture
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- note_spesa
DROP POLICY IF EXISTS "Authenticated users can manage note_spesa" ON public.note_spesa;
CREATE POLICY "Authenticated users manage note_spesa" ON public.note_spesa
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- richieste_dipendenti
DROP POLICY IF EXISTS "Authenticated users can manage richieste_dipendenti" ON public.richieste_dipendenti;
CREATE POLICY "Authenticated users manage richieste_dipendenti" ON public.richieste_dipendenti
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ddt
DROP POLICY IF EXISTS "Authenticated users can manage ddt" ON public.ddt;
CREATE POLICY "Authenticated users manage ddt" ON public.ddt
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- righe_ddt
DROP POLICY IF EXISTS "Authenticated users can manage righe_ddt" ON public.righe_ddt;
CREATE POLICY "Authenticated users manage righe_ddt" ON public.righe_ddt
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- impostazioni_azienda
DROP POLICY IF EXISTS "Authenticated users can manage impostazioni_azienda" ON public.impostazioni_azienda;
CREATE POLICY "Authenticated users manage impostazioni_azienda" ON public.impostazioni_azienda
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- scadenzario
DROP POLICY IF EXISTS "Authenticated users can manage scadenzario" ON public.scadenzario;
CREATE POLICY "Authenticated users manage scadenzario" ON public.scadenzario
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- centri_costo
DROP POLICY IF EXISTS "Authenticated users can manage centri_costo" ON public.centri_costo;
CREATE POLICY "Authenticated users manage centri_costo" ON public.centri_costo
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- movimenti_contabili
DROP POLICY IF EXISTS "Authenticated users can manage movimenti_contabili" ON public.movimenti_contabili;
CREATE POLICY "Authenticated users manage movimenti_contabili" ON public.movimenti_contabili
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- contatti
DROP POLICY IF EXISTS "Authenticated users can manage contatti" ON public.contatti;
CREATE POLICY "Authenticated users manage contatti" ON public.contatti
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- listino_prezzi
DROP POLICY IF EXISTS "Authenticated users can manage listino_prezzi" ON public.listino_prezzi;
CREATE POLICY "Authenticated users manage listino_prezzi" ON public.listino_prezzi
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- magazzino
DROP POLICY IF EXISTS "Authenticated users can manage magazzino" ON public.magazzino;
CREATE POLICY "Authenticated users manage magazzino" ON public.magazzino
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- movimenti_magazzino
DROP POLICY IF EXISTS "Authenticated users can manage movimenti_magazzino" ON public.movimenti_magazzino;
CREATE POLICY "Authenticated users manage movimenti_magazzino" ON public.movimenti_magazzino
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- budget_cantiere
DROP POLICY IF EXISTS "Authenticated users can manage budget_cantiere" ON public.budget_cantiere;
CREATE POLICY "Authenticated users manage budget_cantiere" ON public.budget_cantiere
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ordini_fornitori
DROP POLICY IF EXISTS "Authenticated users can manage ordini_fornitori" ON public.ordini_fornitori;
CREATE POLICY "Authenticated users manage ordini_fornitori" ON public.ordini_fornitori
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- righe_ordine
DROP POLICY IF EXISTS "Authenticated users can manage righe_ordine" ON public.righe_ordine;
CREATE POLICY "Authenticated users manage righe_ordine" ON public.righe_ordine
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- contratti
DROP POLICY IF EXISTS "Authenticated users can manage contratti" ON public.contratti;
CREATE POLICY "Authenticated users manage contratti" ON public.contratti
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- preventivi_fornitori
DROP POLICY IF EXISTS "Authenticated users can manage preventivi_fornitori" ON public.preventivi_fornitori;
CREATE POLICY "Authenticated users manage preventivi_fornitori" ON public.preventivi_fornitori
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- listini_fornitori
DROP POLICY IF EXISTS "Authenticated users can manage listini_fornitori" ON public.listini_fornitori;
CREATE POLICY "Authenticated users manage listini_fornitori" ON public.listini_fornitori
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- articoli_listino
DROP POLICY IF EXISTS "Authenticated users can manage articoli_listino" ON public.articoli_listino;
CREATE POLICY "Authenticated users manage articoli_listino" ON public.articoli_listino
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 4. BUSINESS INTELLIGENCE TABLES
-- =============================================

-- report_bi
DROP POLICY IF EXISTS "Authenticated users can manage report_bi" ON public.report_bi;
CREATE POLICY "Authenticated users manage report_bi" ON public.report_bi
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- kpi_finanziari
DROP POLICY IF EXISTS "Authenticated users can manage kpi_finanziari" ON public.kpi_finanziari;
CREATE POLICY "Authenticated users manage kpi_finanziari" ON public.kpi_finanziari
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- analisi_predittive
DROP POLICY IF EXISTS "Authenticated users can manage analisi_predittive" ON public.analisi_predittive;
CREATE POLICY "Authenticated users manage analisi_predittive" ON public.analisi_predittive
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 5. SALES TABLES
-- =============================================

-- leads
DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Authenticated users manage leads" ON public.leads
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- preventivi
DROP POLICY IF EXISTS "Authenticated users can manage preventivi" ON public.preventivi;
CREATE POLICY "Authenticated users manage preventivi" ON public.preventivi
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- voci_preventivo
DROP POLICY IF EXISTS "Authenticated users can manage voci_preventivo" ON public.voci_preventivo;
CREATE POLICY "Authenticated users manage voci_preventivo" ON public.voci_preventivo
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- computi_metrici
DROP POLICY IF EXISTS "Authenticated users can manage computi_metrici" ON public.computi_metrici;
CREATE POLICY "Authenticated users manage computi_metrici" ON public.computi_metrici
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- voci_computo
DROP POLICY IF EXISTS "Authenticated users can manage voci_computo" ON public.voci_computo;
CREATE POLICY "Authenticated users manage voci_computo" ON public.voci_computo
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- presenze_rapportino
DROP POLICY IF EXISTS "Anyone can manage presenze_rapportino" ON public.presenze_rapportino;
CREATE POLICY "Authenticated users manage presenze_rapportino" ON public.presenze_rapportino
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');