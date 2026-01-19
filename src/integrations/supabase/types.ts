export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_predictions: {
        Row: {
          created_at: string | null
          dati_input: Json | null
          entita_id: string | null
          entita_nome: string | null
          entita_tipo: string | null
          id: string
          impatto: string | null
          modello_usato: string | null
          previsione_dettaglio: Json | null
          probabilita: number | null
          raccomandazioni: string[] | null
          tipo: string
          valido_fino: string | null
        }
        Insert: {
          created_at?: string | null
          dati_input?: Json | null
          entita_id?: string | null
          entita_nome?: string | null
          entita_tipo?: string | null
          id?: string
          impatto?: string | null
          modello_usato?: string | null
          previsione_dettaglio?: Json | null
          probabilita?: number | null
          raccomandazioni?: string[] | null
          tipo: string
          valido_fino?: string | null
        }
        Update: {
          created_at?: string | null
          dati_input?: Json | null
          entita_id?: string | null
          entita_nome?: string | null
          entita_tipo?: string | null
          id?: string
          impatto?: string | null
          modello_usato?: string | null
          previsione_dettaglio?: Json | null
          probabilita?: number | null
          raccomandazioni?: string[] | null
          tipo?: string
          valido_fino?: string | null
        }
        Relationships: []
      }
      analisi_predittive: {
        Row: {
          azioni_mitigazione: string[] | null
          cantiere_id: string | null
          cantiere_nome: string | null
          created_at: string | null
          data_analisi: string
          fattori_rischio: string[] | null
          id: string
          impatto: string | null
          probabilita: number | null
          raccomandazioni: string[] | null
          stato: string | null
          tipo_previsione: string
        }
        Insert: {
          azioni_mitigazione?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data_analisi?: string
          fattori_rischio?: string[] | null
          id?: string
          impatto?: string | null
          probabilita?: number | null
          raccomandazioni?: string[] | null
          stato?: string | null
          tipo_previsione: string
        }
        Update: {
          azioni_mitigazione?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data_analisi?: string
          fattori_rischio?: string[] | null
          id?: string
          impatto?: string | null
          probabilita?: number | null
          raccomandazioni?: string[] | null
          stato?: string | null
          tipo_previsione?: string
        }
        Relationships: []
      }
      articoli_listino: {
        Row: {
          categoria: string | null
          codice: string
          created_at: string | null
          descrizione: string
          id: string
          listino_id: string
          prezzo_listino: number
          prezzo_scontato: number | null
          unita_misura: string | null
        }
        Insert: {
          categoria?: string | null
          codice: string
          created_at?: string | null
          descrizione: string
          id?: string
          listino_id: string
          prezzo_listino?: number
          prezzo_scontato?: number | null
          unita_misura?: string | null
        }
        Update: {
          categoria?: string | null
          codice?: string
          created_at?: string | null
          descrizione?: string
          id?: string
          listino_id?: string
          prezzo_listino?: number
          prezzo_scontato?: number | null
          unita_misura?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articoli_listino_listino_id_fkey"
            columns: ["listino_id"]
            isOneToOne: false
            referencedRelation: "listini_fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      attivita_risorse: {
        Row: {
          cantiere_id: string | null
          cantiere_nome: string | null
          costo: number | null
          created_at: string
          data: string
          descrizione: string | null
          eseguito_da: string | null
          id: string
          km_finali: number | null
          km_iniziali: number | null
          km_percorsi: number | null
          litri_carburante: number | null
          note: string | null
          ore_utilizzo: number | null
          risorsa_id: string
          tipo_attivita: string
        }
        Insert: {
          cantiere_id?: string | null
          cantiere_nome?: string | null
          costo?: number | null
          created_at?: string
          data?: string
          descrizione?: string | null
          eseguito_da?: string | null
          id?: string
          km_finali?: number | null
          km_iniziali?: number | null
          km_percorsi?: number | null
          litri_carburante?: number | null
          note?: string | null
          ore_utilizzo?: number | null
          risorsa_id: string
          tipo_attivita: string
        }
        Update: {
          cantiere_id?: string | null
          cantiere_nome?: string | null
          costo?: number | null
          created_at?: string
          data?: string
          descrizione?: string | null
          eseguito_da?: string | null
          id?: string
          km_finali?: number | null
          km_iniziali?: number | null
          km_percorsi?: number | null
          litri_carburante?: number | null
          note?: string | null
          ore_utilizzo?: number | null
          risorsa_id?: string
          tipo_attivita?: string
        }
        Relationships: [
          {
            foreignKeyName: "attivita_risorse_risorsa_id_fkey"
            columns: ["risorsa_id"]
            isOneToOne: false
            referencedRelation: "risorse"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          azione: string
          created_at: string
          dettagli: Json | null
          entita_id: string | null
          entita_nome: string | null
          entita_tipo: string
          id: string
          ip_address: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          azione: string
          created_at?: string
          dettagli?: Json | null
          entita_id?: string | null
          entita_nome?: string | null
          entita_tipo: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          azione?: string
          created_at?: string
          dettagli?: Json | null
          entita_id?: string | null
          entita_nome?: string | null
          entita_tipo?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      budget_cantiere: {
        Row: {
          cantiere_id: string | null
          cantiere_nome: string
          categoria: string
          created_at: string | null
          data_prevista: string | null
          id: string
          importo_consuntivo: number | null
          importo_previsto: number
          note: string | null
          updated_at: string | null
          voce: string
        }
        Insert: {
          cantiere_id?: string | null
          cantiere_nome: string
          categoria: string
          created_at?: string | null
          data_prevista?: string | null
          id?: string
          importo_consuntivo?: number | null
          importo_previsto?: number
          note?: string | null
          updated_at?: string | null
          voce: string
        }
        Update: {
          cantiere_id?: string | null
          cantiere_nome?: string
          categoria?: string
          created_at?: string | null
          data_prevista?: string | null
          id?: string
          importo_consuntivo?: number | null
          importo_previsto?: number
          note?: string | null
          updated_at?: string | null
          voce?: string
        }
        Relationships: []
      }
      cantieri: {
        Row: {
          citta: string | null
          codice_commessa: string
          committente: string | null
          created_at: string | null
          cse: string | null
          csp: string | null
          data_fine_effettiva: string | null
          data_fine_prevista: string | null
          data_inizio: string | null
          direttore_lavori: string | null
          id: string
          importo_contratto: number | null
          indirizzo: string | null
          nome: string
          note: string | null
          provincia: string | null
          responsabile_sicurezza: string | null
          stato: string | null
          updated_at: string | null
        }
        Insert: {
          citta?: string | null
          codice_commessa: string
          committente?: string | null
          created_at?: string | null
          cse?: string | null
          csp?: string | null
          data_fine_effettiva?: string | null
          data_fine_prevista?: string | null
          data_inizio?: string | null
          direttore_lavori?: string | null
          id?: string
          importo_contratto?: number | null
          indirizzo?: string | null
          nome: string
          note?: string | null
          provincia?: string | null
          responsabile_sicurezza?: string | null
          stato?: string | null
          updated_at?: string | null
        }
        Update: {
          citta?: string | null
          codice_commessa?: string
          committente?: string | null
          created_at?: string | null
          cse?: string | null
          csp?: string | null
          data_fine_effettiva?: string | null
          data_fine_prevista?: string | null
          data_inizio?: string | null
          direttore_lavori?: string | null
          id?: string
          importo_contratto?: number | null
          indirizzo?: string | null
          nome?: string
          note?: string | null
          provincia?: string | null
          responsabile_sicurezza?: string | null
          stato?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cantieri_imprese: {
        Row: {
          cantiere_id: string
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          id: string
          importo_contratto: number | null
          impresa_id: string
          ruolo: string | null
        }
        Insert: {
          cantiere_id: string
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          id?: string
          importo_contratto?: number | null
          impresa_id: string
          ruolo?: string | null
        }
        Update: {
          cantiere_id?: string
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          id?: string
          importo_contratto?: number | null
          impresa_id?: string
          ruolo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cantieri_imprese_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cantieri_imprese_impresa_id_fkey"
            columns: ["impresa_id"]
            isOneToOne: false
            referencedRelation: "imprese"
            referencedColumns: ["id"]
          },
        ]
      }
      capa: {
        Row: {
          allegati: Json | null
          analisi_causa: string | null
          azione_proposta: string
          codice: string
          costo_implementazione: number | null
          created_at: string
          data_apertura: string
          data_completamento: string | null
          data_scadenza: string
          data_verifica: string | null
          descrizione: string
          efficace: boolean | null
          esito_verifica: string | null
          id: string
          nc_id: string | null
          note: string | null
          oggetto: string
          priorita: string | null
          responsabile: string
          risultato_atteso: string | null
          stato: string
          tipo: string
          updated_at: string
          verificato_da: string | null
        }
        Insert: {
          allegati?: Json | null
          analisi_causa?: string | null
          azione_proposta: string
          codice: string
          costo_implementazione?: number | null
          created_at?: string
          data_apertura?: string
          data_completamento?: string | null
          data_scadenza: string
          data_verifica?: string | null
          descrizione: string
          efficace?: boolean | null
          esito_verifica?: string | null
          id?: string
          nc_id?: string | null
          note?: string | null
          oggetto: string
          priorita?: string | null
          responsabile: string
          risultato_atteso?: string | null
          stato?: string
          tipo: string
          updated_at?: string
          verificato_da?: string | null
        }
        Update: {
          allegati?: Json | null
          analisi_causa?: string | null
          azione_proposta?: string
          codice?: string
          costo_implementazione?: number | null
          created_at?: string
          data_apertura?: string
          data_completamento?: string | null
          data_scadenza?: string
          data_verifica?: string | null
          descrizione?: string
          efficace?: boolean | null
          esito_verifica?: string | null
          id?: string
          nc_id?: string | null
          note?: string | null
          oggetto?: string
          priorita?: string | null
          responsabile?: string
          risultato_atteso?: string | null
          stato?: string
          tipo?: string
          updated_at?: string
          verificato_da?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capa_nc_id_fkey"
            columns: ["nc_id"]
            isOneToOne: false
            referencedRelation: "non_conformita"
            referencedColumns: ["id"]
          },
        ]
      }
      centri_costo: {
        Row: {
          attivo: boolean | null
          budget_annuale: number | null
          codice: string
          created_at: string | null
          id: string
          nome: string
          parent_id: string | null
          responsabile: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          attivo?: boolean | null
          budget_annuale?: number | null
          codice: string
          created_at?: string | null
          id?: string
          nome: string
          parent_id?: string | null
          responsabile?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          attivo?: boolean | null
          budget_annuale?: number | null
          codice?: string
          created_at?: string | null
          id?: string
          nome?: string
          parent_id?: string | null
          responsabile?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centri_costo_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "centri_costo"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_sicurezza: {
        Row: {
          area_lavoro_delimitata: boolean | null
          argomenti_briefing: string | null
          briefing_effettuato: boolean | null
          cantiere_id: string | null
          cantiere_nome: string
          condizioni_meteo_ok: boolean | null
          created_at: string | null
          data: string
          dpi_mancanti: string | null
          dpi_verificati: boolean | null
          eseguito_da: string
          estintori_ok: boolean | null
          firma_responsabile: string | null
          foto_allegati: string[] | null
          id: string
          mezzi_verificati: boolean | null
          note: string | null
          ora: string
          primo_soccorso_ok: boolean | null
          ruolo: string | null
          segnalazioni_pericoli: string | null
        }
        Insert: {
          area_lavoro_delimitata?: boolean | null
          argomenti_briefing?: string | null
          briefing_effettuato?: boolean | null
          cantiere_id?: string | null
          cantiere_nome: string
          condizioni_meteo_ok?: boolean | null
          created_at?: string | null
          data?: string
          dpi_mancanti?: string | null
          dpi_verificati?: boolean | null
          eseguito_da: string
          estintori_ok?: boolean | null
          firma_responsabile?: string | null
          foto_allegati?: string[] | null
          id?: string
          mezzi_verificati?: boolean | null
          note?: string | null
          ora?: string
          primo_soccorso_ok?: boolean | null
          ruolo?: string | null
          segnalazioni_pericoli?: string | null
        }
        Update: {
          area_lavoro_delimitata?: boolean | null
          argomenti_briefing?: string | null
          briefing_effettuato?: boolean | null
          cantiere_id?: string | null
          cantiere_nome?: string
          condizioni_meteo_ok?: boolean | null
          created_at?: string | null
          data?: string
          dpi_mancanti?: string | null
          dpi_verificati?: boolean | null
          eseguito_da?: string
          estintori_ok?: boolean | null
          firma_responsabile?: string | null
          foto_allegati?: string[] | null
          id?: string
          mezzi_verificati?: boolean | null
          note?: string | null
          ora?: string
          primo_soccorso_ok?: boolean | null
          ruolo?: string | null
          segnalazioni_pericoli?: string | null
        }
        Relationships: []
      }
      compliance_checks: {
        Row: {
          blocco_pagamento: boolean | null
          data_scadenza: string | null
          fornitore_id: string | null
          fornitore_nome: string | null
          giorni_rimanenti: number | null
          id: string
          note: string | null
          stato: string | null
          tipo_check: string
          ultimo_controllo: string | null
        }
        Insert: {
          blocco_pagamento?: boolean | null
          data_scadenza?: string | null
          fornitore_id?: string | null
          fornitore_nome?: string | null
          giorni_rimanenti?: number | null
          id?: string
          note?: string | null
          stato?: string | null
          tipo_check: string
          ultimo_controllo?: string | null
        }
        Update: {
          blocco_pagamento?: boolean | null
          data_scadenza?: string | null
          fornitore_id?: string | null
          fornitore_nome?: string | null
          giorni_rimanenti?: number | null
          id?: string
          note?: string | null
          stato?: string | null
          tipo_check?: string
          ultimo_controllo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      computi_metrici: {
        Row: {
          cantiere_id: string | null
          created_at: string
          data_creazione: string
          descrizione: string | null
          id: string
          nome: string
          stato: string
          totale_computo: number | null
          updated_at: string
        }
        Insert: {
          cantiere_id?: string | null
          created_at?: string
          data_creazione?: string
          descrizione?: string | null
          id?: string
          nome: string
          stato?: string
          totale_computo?: number | null
          updated_at?: string
        }
        Update: {
          cantiere_id?: string | null
          created_at?: string
          data_creazione?: string
          descrizione?: string | null
          id?: string
          nome?: string
          stato?: string
          totale_computo?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contatti: {
        Row: {
          azienda: string | null
          cap: string | null
          cellulare: string | null
          citta: string | null
          codice_fiscale: string | null
          codice_sdi: string | null
          cognome: string | null
          created_at: string | null
          email: string | null
          iban: string | null
          id: string
          indirizzo: string | null
          nome: string
          note: string | null
          partita_iva: string | null
          pec: string | null
          preferito: boolean | null
          provincia: string | null
          ragione_sociale: string | null
          ruolo: string | null
          tags: string[] | null
          telefono: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          azienda?: string | null
          cap?: string | null
          cellulare?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          codice_sdi?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          nome: string
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          preferito?: boolean | null
          provincia?: string | null
          ragione_sociale?: string | null
          ruolo?: string | null
          tags?: string[] | null
          telefono?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          azienda?: string | null
          cap?: string | null
          cellulare?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          codice_sdi?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          nome?: string
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          preferito?: boolean | null
          provincia?: string | null
          ragione_sociale?: string | null
          ruolo?: string | null
          tags?: string[] | null
          telefono?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contratti: {
        Row: {
          allegati: string[] | null
          cantiere_id: string | null
          cantiere_nome: string | null
          clausole: string | null
          contraente: string
          contraente_id: string | null
          created_at: string | null
          data_fine: string
          data_inizio: string
          descrizione: string | null
          id: string
          importo: number
          numero: string
          penali: string | null
          preavviso_giorni: number | null
          rinnovo_automatico: boolean | null
          stato: string
          tipo: string
          titolo: string
          updated_at: string | null
        }
        Insert: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          clausole?: string | null
          contraente: string
          contraente_id?: string | null
          created_at?: string | null
          data_fine: string
          data_inizio: string
          descrizione?: string | null
          id?: string
          importo?: number
          numero: string
          penali?: string | null
          preavviso_giorni?: number | null
          rinnovo_automatico?: boolean | null
          stato?: string
          tipo?: string
          titolo: string
          updated_at?: string | null
        }
        Update: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          clausole?: string | null
          contraente?: string
          contraente_id?: string | null
          created_at?: string | null
          data_fine?: string
          data_inizio?: string
          descrizione?: string | null
          id?: string
          importo?: number
          numero?: string
          penali?: string | null
          preavviso_giorni?: number | null
          rinnovo_automatico?: boolean | null
          stato?: string
          tipo?: string
          titolo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ddt: {
        Row: {
          allegati: string[] | null
          aspetto_beni: string | null
          causale_trasporto: string | null
          colli: number | null
          commessa_id: string | null
          convertito_in_fattura_at: string | null
          created_at: string
          data: string
          destinatario: string
          fattura_generata_id: string | null
          fornitore_id: string | null
          id: string
          indirizzo_destinazione: string | null
          mittente: string
          note: string | null
          numero: string
          ordine_origine_id: string | null
          peso_kg: number | null
          stato: string
          tipo: string
          updated_at: string
          vettore: string | null
        }
        Insert: {
          allegati?: string[] | null
          aspetto_beni?: string | null
          causale_trasporto?: string | null
          colli?: number | null
          commessa_id?: string | null
          convertito_in_fattura_at?: string | null
          created_at?: string
          data?: string
          destinatario: string
          fattura_generata_id?: string | null
          fornitore_id?: string | null
          id?: string
          indirizzo_destinazione?: string | null
          mittente: string
          note?: string | null
          numero: string
          ordine_origine_id?: string | null
          peso_kg?: number | null
          stato?: string
          tipo?: string
          updated_at?: string
          vettore?: string | null
        }
        Update: {
          allegati?: string[] | null
          aspetto_beni?: string | null
          causale_trasporto?: string | null
          colli?: number | null
          commessa_id?: string | null
          convertito_in_fattura_at?: string | null
          created_at?: string
          data?: string
          destinatario?: string
          fattura_generata_id?: string | null
          fornitore_id?: string | null
          id?: string
          indirizzo_destinazione?: string | null
          mittente?: string
          note?: string | null
          numero?: string
          ordine_origine_id?: string | null
          peso_kg?: number | null
          stato?: string
          tipo?: string
          updated_at?: string
          vettore?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ddt_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ddt_ordine_origine_id_fkey"
            columns: ["ordine_origine_id"]
            isOneToOne: false
            referencedRelation: "ordini_fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      document_conversions: {
        Row: {
          convertito_da: string | null
          created_at: string | null
          documento_destinazione_id: string
          documento_destinazione_tipo: string
          documento_origine_id: string
          documento_origine_tipo: string
          id: string
          note: string | null
        }
        Insert: {
          convertito_da?: string | null
          created_at?: string | null
          documento_destinazione_id: string
          documento_destinazione_tipo: string
          documento_origine_id: string
          documento_origine_tipo: string
          id?: string
          note?: string | null
        }
        Update: {
          convertito_da?: string | null
          created_at?: string | null
          documento_destinazione_id?: string
          documento_destinazione_tipo?: string
          documento_origine_id?: string
          documento_origine_tipo?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      documenti: {
        Row: {
          categoria: string | null
          created_at: string | null
          data_emissione: string | null
          data_scadenza: string | null
          entita_id: string | null
          entita_tipo: string
          file_url: string | null
          id: string
          note: string | null
          obbligatorio: boolean | null
          stato: string | null
          tipo: string
          titolo: string
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          entita_id?: string | null
          entita_tipo: string
          file_url?: string | null
          id?: string
          note?: string | null
          obbligatorio?: boolean | null
          stato?: string | null
          tipo: string
          titolo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          entita_id?: string | null
          entita_tipo?: string
          file_url?: string | null
          id?: string
          note?: string | null
          obbligatorio?: boolean | null
          stato?: string | null
          tipo?: string
          titolo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documenti_azienda: {
        Row: {
          attivo: boolean | null
          categoria: string
          created_at: string | null
          data_emissione: string | null
          data_scadenza: string | null
          descrizione: string | null
          file_url: string | null
          id: string
          note: string | null
          numero_documento: string | null
          tipo: string
          titolo: string
          updated_at: string | null
        }
        Insert: {
          attivo?: boolean | null
          categoria: string
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          file_url?: string | null
          id?: string
          note?: string | null
          numero_documento?: string | null
          tipo: string
          titolo: string
          updated_at?: string | null
        }
        Update: {
          attivo?: boolean | null
          categoria?: string
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          file_url?: string | null
          id?: string
          note?: string | null
          numero_documento?: string | null
          tipo?: string
          titolo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documenti_fornitori: {
        Row: {
          created_at: string | null
          data_emissione: string | null
          data_scadenza: string | null
          ente_emittente: string | null
          file_url: string | null
          fornitore_id: string
          id: string
          note: string | null
          numero_documento: string | null
          obbligatorio: boolean | null
          stato: string | null
          tipo_documento: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          ente_emittente?: string | null
          file_url?: string | null
          fornitore_id: string
          id?: string
          note?: string | null
          numero_documento?: string | null
          obbligatorio?: boolean | null
          stato?: string | null
          tipo_documento: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          ente_emittente?: string | null
          file_url?: string | null
          fornitore_id?: string
          id?: string
          note?: string | null
          numero_documento?: string | null
          obbligatorio?: boolean | null
          stato?: string | null
          tipo_documento?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_fornitori_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      documenti_risorse: {
        Row: {
          allegato_url: string | null
          created_at: string
          data_emissione: string | null
          data_scadenza: string | null
          id: string
          note: string | null
          risorsa_id: string
          stato: string
          tipo: string
          titolo: string
          updated_at: string
        }
        Insert: {
          allegato_url?: string | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza?: string | null
          id?: string
          note?: string | null
          risorsa_id: string
          stato?: string
          tipo: string
          titolo: string
          updated_at?: string
        }
        Update: {
          allegato_url?: string | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza?: string | null
          id?: string
          note?: string | null
          risorsa_id?: string
          stato?: string
          tipo?: string
          titolo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documenti_risorse_risorsa_id_fkey"
            columns: ["risorsa_id"]
            isOneToOne: false
            referencedRelation: "risorse"
            referencedColumns: ["id"]
          },
        ]
      }
      dpi: {
        Row: {
          created_at: string | null
          data_consegna: string
          data_scadenza: string | null
          id: string
          lavoratore_id: string | null
          marca: string | null
          modello: string | null
          note: string | null
          quantita: number | null
          stato: string | null
          taglia: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          data_consegna: string
          data_scadenza?: string | null
          id?: string
          lavoratore_id?: string | null
          marca?: string | null
          modello?: string | null
          note?: string | null
          quantita?: number | null
          stato?: string | null
          taglia?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          data_consegna?: string
          data_scadenza?: string | null
          id?: string
          lavoratore_id?: string | null
          marca?: string | null
          modello?: string | null
          note?: string | null
          quantita?: number | null
          stato?: string | null
          taglia?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "dpi_lavoratore_id_fkey"
            columns: ["lavoratore_id"]
            isOneToOne: false
            referencedRelation: "lavoratori"
            referencedColumns: ["id"]
          },
        ]
      }
      fatture: {
        Row: {
          aliquota_iva: number
          allegati: string[] | null
          cantiere_id: string | null
          cliente_fornitore: string
          commessa_id: string | null
          created_at: string
          data: string
          data_pagamento: string | null
          ddt_origine_id: string | null
          descrizione: string | null
          fornitore_id: string | null
          id: string
          imponibile: number
          iva: number | null
          metodo_pagamento: string | null
          numero: string
          ordine_origine_id: string | null
          preventivo_origine_id: string | null
          sal_origine_id: string | null
          scadenza: string
          stato: Database["public"]["Enums"]["stato_fattura"]
          tipo: Database["public"]["Enums"]["tipo_fattura"]
          totale: number | null
          updated_at: string
        }
        Insert: {
          aliquota_iva?: number
          allegati?: string[] | null
          cantiere_id?: string | null
          cliente_fornitore: string
          commessa_id?: string | null
          created_at?: string
          data?: string
          data_pagamento?: string | null
          ddt_origine_id?: string | null
          descrizione?: string | null
          fornitore_id?: string | null
          id?: string
          imponibile?: number
          iva?: number | null
          metodo_pagamento?: string | null
          numero: string
          ordine_origine_id?: string | null
          preventivo_origine_id?: string | null
          sal_origine_id?: string | null
          scadenza: string
          stato?: Database["public"]["Enums"]["stato_fattura"]
          tipo: Database["public"]["Enums"]["tipo_fattura"]
          totale?: number | null
          updated_at?: string
        }
        Update: {
          aliquota_iva?: number
          allegati?: string[] | null
          cantiere_id?: string | null
          cliente_fornitore?: string
          commessa_id?: string | null
          created_at?: string
          data?: string
          data_pagamento?: string | null
          ddt_origine_id?: string | null
          descrizione?: string | null
          fornitore_id?: string | null
          id?: string
          imponibile?: number
          iva?: number | null
          metodo_pagamento?: string | null
          numero?: string
          ordine_origine_id?: string | null
          preventivo_origine_id?: string | null
          sal_origine_id?: string | null
          scadenza?: string
          stato?: Database["public"]["Enums"]["stato_fattura"]
          tipo?: Database["public"]["Enums"]["tipo_fattura"]
          totale?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fatture_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatture_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      formazioni: {
        Row: {
          attestato_url: string | null
          created_at: string | null
          data_conseguimento: string
          data_scadenza: string | null
          ente_formatore: string | null
          id: string
          lavoratore_id: string
          note: string | null
          ore_durata: number | null
          stato: string | null
          tipo_corso: string
          titolo_corso: string
          updated_at: string | null
        }
        Insert: {
          attestato_url?: string | null
          created_at?: string | null
          data_conseguimento: string
          data_scadenza?: string | null
          ente_formatore?: string | null
          id?: string
          lavoratore_id: string
          note?: string | null
          ore_durata?: number | null
          stato?: string | null
          tipo_corso: string
          titolo_corso: string
          updated_at?: string | null
        }
        Update: {
          attestato_url?: string | null
          created_at?: string | null
          data_conseguimento?: string
          data_scadenza?: string | null
          ente_formatore?: string | null
          id?: string
          lavoratore_id?: string
          note?: string | null
          ore_durata?: number | null
          stato?: string | null
          tipo_corso?: string
          titolo_corso?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formazioni_lavoratore_id_fkey"
            columns: ["lavoratore_id"]
            isOneToOne: false
            referencedRelation: "lavoratori"
            referencedColumns: ["id"]
          },
        ]
      }
      fornitori: {
        Row: {
          cap: string | null
          categoria: string | null
          cellulare: string | null
          citta: string | null
          codice_fiscale: string | null
          condizioni_pagamento: string | null
          created_at: string | null
          email: string | null
          iban: string | null
          id: string
          indirizzo: string | null
          note: string | null
          partita_iva: string | null
          pec: string | null
          provincia: string | null
          ragione_sociale: string
          rating: number | null
          sconto_base: number | null
          stato: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          cap?: string | null
          categoria?: string | null
          cellulare?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          condizioni_pagamento?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale: string
          rating?: number | null
          sconto_base?: number | null
          stato?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          cap?: string | null
          categoria?: string | null
          cellulare?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          condizioni_pagamento?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale?: string
          rating?: number | null
          sconto_base?: number | null
          stato?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      impostazioni_azienda: {
        Row: {
          banca: string | null
          cap: string | null
          citta: string | null
          codice_fiscale: string | null
          created_at: string
          email: string | null
          footer_documento: string | null
          iban: string | null
          id: string
          indirizzo: string | null
          intestazione_personalizzata: string | null
          logo_url: string | null
          partita_iva: string | null
          pec: string | null
          provincia: string | null
          ragione_sociale: string
          sito_web: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          banca?: string | null
          cap?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          created_at?: string
          email?: string | null
          footer_documento?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          intestazione_personalizzata?: string | null
          logo_url?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale: string
          sito_web?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          banca?: string | null
          cap?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          created_at?: string
          email?: string | null
          footer_documento?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          intestazione_personalizzata?: string | null
          logo_url?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale?: string
          sito_web?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      imprese: {
        Row: {
          cap: string | null
          categoria_soa: string | null
          citta: string | null
          codice_fiscale: string | null
          created_at: string | null
          email: string | null
          id: string
          indirizzo: string | null
          note: string | null
          partita_iva: string | null
          pec: string | null
          provincia: string | null
          ragione_sociale: string
          rating: number | null
          telefono: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          cap?: string | null
          categoria_soa?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale: string
          rating?: number | null
          telefono?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          cap?: string | null
          categoria_soa?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale?: string
          rating?: number | null
          telefono?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kpi_finanziari: {
        Row: {
          cash_flow_operativo: number | null
          costi_effettivi: number | null
          costi_previsti: number | null
          created_at: string | null
          dso: number | null
          id: string
          margine: number | null
          margine_previsto: number | null
          periodo: string
          ricavi_effettivi: number | null
          ricavi_previsti: number | null
          wip: number | null
        }
        Insert: {
          cash_flow_operativo?: number | null
          costi_effettivi?: number | null
          costi_previsti?: number | null
          created_at?: string | null
          dso?: number | null
          id?: string
          margine?: number | null
          margine_previsto?: number | null
          periodo: string
          ricavi_effettivi?: number | null
          ricavi_previsti?: number | null
          wip?: number | null
        }
        Update: {
          cash_flow_operativo?: number | null
          costi_effettivi?: number | null
          costi_previsti?: number | null
          created_at?: string | null
          dso?: number | null
          id?: string
          margine?: number | null
          margine_previsto?: number | null
          periodo?: string
          ricavi_effettivi?: number | null
          ricavi_previsti?: number | null
          wip?: number | null
        }
        Relationships: []
      }
      lavoratori: {
        Row: {
          citta: string | null
          codice_fiscale: string | null
          cognome: string
          created_at: string | null
          data_assunzione: string | null
          data_cessazione: string | null
          data_nascita: string | null
          email: string | null
          foto_url: string | null
          id: string
          impresa_id: string | null
          indirizzo: string | null
          livello: string | null
          luogo_nascita: string | null
          mansione: string | null
          nome: string
          note: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          citta?: string | null
          codice_fiscale?: string | null
          cognome: string
          created_at?: string | null
          data_assunzione?: string | null
          data_cessazione?: string | null
          data_nascita?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          impresa_id?: string | null
          indirizzo?: string | null
          livello?: string | null
          luogo_nascita?: string | null
          mansione?: string | null
          nome: string
          note?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          citta?: string | null
          codice_fiscale?: string | null
          cognome?: string
          created_at?: string | null
          data_assunzione?: string | null
          data_cessazione?: string | null
          data_nascita?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          impresa_id?: string | null
          indirizzo?: string | null
          livello?: string | null
          luogo_nascita?: string | null
          mansione?: string | null
          nome?: string
          note?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lavoratori_impresa_id_fkey"
            columns: ["impresa_id"]
            isOneToOne: false
            referencedRelation: "imprese"
            referencedColumns: ["id"]
          },
        ]
      }
      lavoratori_cantieri: {
        Row: {
          attivo: boolean | null
          cantiere_id: string
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          id: string
          lavoratore_id: string
        }
        Insert: {
          attivo?: boolean | null
          cantiere_id: string
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          id?: string
          lavoratore_id: string
        }
        Update: {
          attivo?: boolean | null
          cantiere_id?: string
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          id?: string
          lavoratore_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lavoratori_cantieri_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lavoratori_cantieri_lavoratore_id_fkey"
            columns: ["lavoratore_id"]
            isOneToOne: false
            referencedRelation: "lavoratori"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assegnato_a: string | null
          azienda: string | null
          created_at: string
          email: string | null
          fonte: string | null
          id: string
          indirizzo: string | null
          nome: string
          note: string | null
          probabilita: number | null
          prossimo_contatto: string | null
          stato: Database["public"]["Enums"]["stato_lead"]
          telefono: string | null
          updated_at: string
          valore_stimato: number | null
        }
        Insert: {
          assegnato_a?: string | null
          azienda?: string | null
          created_at?: string
          email?: string | null
          fonte?: string | null
          id?: string
          indirizzo?: string | null
          nome: string
          note?: string | null
          probabilita?: number | null
          prossimo_contatto?: string | null
          stato?: Database["public"]["Enums"]["stato_lead"]
          telefono?: string | null
          updated_at?: string
          valore_stimato?: number | null
        }
        Update: {
          assegnato_a?: string | null
          azienda?: string | null
          created_at?: string
          email?: string | null
          fonte?: string | null
          id?: string
          indirizzo?: string | null
          nome?: string
          note?: string | null
          probabilita?: number | null
          prossimo_contatto?: string | null
          stato?: Database["public"]["Enums"]["stato_lead"]
          telefono?: string | null
          updated_at?: string
          valore_stimato?: number | null
        }
        Relationships: []
      }
      listini_fornitori: {
        Row: {
          allegato_url: string | null
          attivo: boolean | null
          created_at: string | null
          fornitore_id: string | null
          fornitore_nome: string
          id: string
          nome: string
          note: string | null
          sconto_applicato: number | null
          updated_at: string | null
          valido_al: string | null
          valido_dal: string
        }
        Insert: {
          allegato_url?: string | null
          attivo?: boolean | null
          created_at?: string | null
          fornitore_id?: string | null
          fornitore_nome: string
          id?: string
          nome: string
          note?: string | null
          sconto_applicato?: number | null
          updated_at?: string | null
          valido_al?: string | null
          valido_dal: string
        }
        Update: {
          allegato_url?: string | null
          attivo?: boolean | null
          created_at?: string | null
          fornitore_id?: string | null
          fornitore_nome?: string
          id?: string
          nome?: string
          note?: string | null
          sconto_applicato?: number | null
          updated_at?: string | null
          valido_al?: string | null
          valido_dal?: string
        }
        Relationships: [
          {
            foreignKeyName: "listini_fornitori_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      listino_prezzi: {
        Row: {
          attivo: boolean | null
          categoria: string | null
          codice: string
          costo_acquisto: number | null
          created_at: string | null
          descrizione: string
          fornitore: string | null
          id: string
          iva_percentuale: number | null
          margine_percentuale: number | null
          note: string | null
          prezzo_unitario: number
          sottocategoria: string | null
          unita_misura: string
          updated_at: string | null
        }
        Insert: {
          attivo?: boolean | null
          categoria?: string | null
          codice: string
          costo_acquisto?: number | null
          created_at?: string | null
          descrizione: string
          fornitore?: string | null
          id?: string
          iva_percentuale?: number | null
          margine_percentuale?: number | null
          note?: string | null
          prezzo_unitario: number
          sottocategoria?: string | null
          unita_misura?: string
          updated_at?: string | null
        }
        Update: {
          attivo?: boolean | null
          categoria?: string | null
          codice?: string
          costo_acquisto?: number | null
          created_at?: string | null
          descrizione?: string
          fornitore?: string | null
          id?: string
          iva_percentuale?: number | null
          margine_percentuale?: number | null
          note?: string | null
          prezzo_unitario?: number
          sottocategoria?: string | null
          unita_misura?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      magazzino: {
        Row: {
          categoria: string | null
          codice: string
          created_at: string | null
          descrizione: string
          fornitore_preferito: string | null
          id: string
          note: string | null
          prezzo_medio: number | null
          quantita_disponibile: number | null
          quantita_minima: number | null
          ubicazione: string | null
          unita_misura: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          codice: string
          created_at?: string | null
          descrizione: string
          fornitore_preferito?: string | null
          id?: string
          note?: string | null
          prezzo_medio?: number | null
          quantita_disponibile?: number | null
          quantita_minima?: number | null
          ubicazione?: string | null
          unita_misura?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          codice?: string
          created_at?: string | null
          descrizione?: string
          fornitore_preferito?: string | null
          id?: string
          note?: string | null
          prezzo_medio?: number | null
          quantita_disponibile?: number | null
          quantita_minima?: number | null
          ubicazione?: string | null
          unita_misura?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      manutenzioni_risorse: {
        Row: {
          allegati: string[] | null
          costo: number | null
          created_at: string
          data_esecuzione: string | null
          data_programmata: string | null
          descrizione: string
          eseguito_da: string | null
          id: string
          km_esecuzione: number | null
          km_programmati: number | null
          note: string | null
          officina: string | null
          risorsa_id: string
          stato: string
          tipo: string
          updated_at: string
        }
        Insert: {
          allegati?: string[] | null
          costo?: number | null
          created_at?: string
          data_esecuzione?: string | null
          data_programmata?: string | null
          descrizione: string
          eseguito_da?: string | null
          id?: string
          km_esecuzione?: number | null
          km_programmati?: number | null
          note?: string | null
          officina?: string | null
          risorsa_id: string
          stato?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          allegati?: string[] | null
          costo?: number | null
          created_at?: string
          data_esecuzione?: string | null
          data_programmata?: string | null
          descrizione?: string
          eseguito_da?: string | null
          id?: string
          km_esecuzione?: number | null
          km_programmati?: number | null
          note?: string | null
          officina?: string | null
          risorsa_id?: string
          stato?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutenzioni_risorse_risorsa_id_fkey"
            columns: ["risorsa_id"]
            isOneToOne: false
            referencedRelation: "risorse"
            referencedColumns: ["id"]
          },
        ]
      }
      movimenti_contabili: {
        Row: {
          categoria: string | null
          centro_costo_id: string | null
          created_at: string | null
          data: string
          descrizione: string
          documento_id: string | null
          documento_numero: string | null
          documento_tipo: string | null
          id: string
          importo: number
          tipo: string
        }
        Insert: {
          categoria?: string | null
          centro_costo_id?: string | null
          created_at?: string | null
          data?: string
          descrizione: string
          documento_id?: string | null
          documento_numero?: string | null
          documento_tipo?: string | null
          id?: string
          importo: number
          tipo: string
        }
        Update: {
          categoria?: string | null
          centro_costo_id?: string | null
          created_at?: string | null
          data?: string
          descrizione?: string
          documento_id?: string | null
          documento_numero?: string | null
          documento_tipo?: string | null
          id?: string
          importo?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimenti_contabili_centro_costo_id_fkey"
            columns: ["centro_costo_id"]
            isOneToOne: false
            referencedRelation: "centri_costo"
            referencedColumns: ["id"]
          },
        ]
      }
      movimenti_magazzino: {
        Row: {
          articolo_id: string
          cantiere_id: string | null
          cantiere_nome: string | null
          created_at: string | null
          data: string
          documento_numero: string | null
          documento_tipo: string | null
          eseguito_da: string | null
          id: string
          note: string | null
          quantita: number
          tipo: string
        }
        Insert: {
          articolo_id: string
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data?: string
          documento_numero?: string | null
          documento_tipo?: string | null
          eseguito_da?: string | null
          id?: string
          note?: string | null
          quantita: number
          tipo: string
        }
        Update: {
          articolo_id?: string
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data?: string
          documento_numero?: string | null
          documento_tipo?: string | null
          eseguito_da?: string | null
          id?: string
          note?: string | null
          quantita?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimenti_magazzino_articolo_id_fkey"
            columns: ["articolo_id"]
            isOneToOne: false
            referencedRelation: "magazzino"
            referencedColumns: ["id"]
          },
        ]
      }
      non_conformita: {
        Row: {
          allegati: Json | null
          cantiere_id: string | null
          causa_radice: string | null
          chiuso_da: string | null
          codice: string
          costo_stimato: number | null
          created_at: string
          data_chiusura: string | null
          data_rilevazione: string
          data_scadenza_trattamento: string | null
          descrizione: string
          efficacia_verificata: boolean | null
          esito_verifica: string | null
          fornitore_id: string | null
          gravita: string
          id: string
          impatto: string | null
          note: string | null
          oggetto: string
          origine: string | null
          responsabile_trattamento: string | null
          rilevato_da: string | null
          stato: string
          subappalto_id: string | null
          tipo: string
          trattamento_immediato: string | null
          updated_at: string
        }
        Insert: {
          allegati?: Json | null
          cantiere_id?: string | null
          causa_radice?: string | null
          chiuso_da?: string | null
          codice: string
          costo_stimato?: number | null
          created_at?: string
          data_chiusura?: string | null
          data_rilevazione?: string
          data_scadenza_trattamento?: string | null
          descrizione: string
          efficacia_verificata?: boolean | null
          esito_verifica?: string | null
          fornitore_id?: string | null
          gravita: string
          id?: string
          impatto?: string | null
          note?: string | null
          oggetto: string
          origine?: string | null
          responsabile_trattamento?: string | null
          rilevato_da?: string | null
          stato?: string
          subappalto_id?: string | null
          tipo: string
          trattamento_immediato?: string | null
          updated_at?: string
        }
        Update: {
          allegati?: Json | null
          cantiere_id?: string | null
          causa_radice?: string | null
          chiuso_da?: string | null
          codice?: string
          costo_stimato?: number | null
          created_at?: string
          data_chiusura?: string | null
          data_rilevazione?: string
          data_scadenza_trattamento?: string | null
          descrizione?: string
          efficacia_verificata?: boolean | null
          esito_verifica?: string | null
          fornitore_id?: string | null
          gravita?: string
          id?: string
          impatto?: string | null
          note?: string | null
          oggetto?: string
          origine?: string | null
          responsabile_trattamento?: string | null
          rilevato_da?: string | null
          stato?: string
          subappalto_id?: string | null
          tipo?: string
          trattamento_immediato?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_conformita_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "non_conformita_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "non_conformita_subappalto_id_fkey"
            columns: ["subappalto_id"]
            isOneToOne: false
            referencedRelation: "subappalti"
            referencedColumns: ["id"]
          },
        ]
      }
      note_spesa: {
        Row: {
          allegati: string[] | null
          approvato_da: string | null
          categoria: Database["public"]["Enums"]["categoria_nota_spesa"]
          commessa_id: string | null
          created_at: string
          data: string
          data_approvazione: string | null
          descrizione: string
          dipendente_id: string | null
          dipendente_nome: string
          id: string
          importo: number
          note: string | null
          numero: string
          stato: Database["public"]["Enums"]["stato_nota_spesa"]
          updated_at: string
        }
        Insert: {
          allegati?: string[] | null
          approvato_da?: string | null
          categoria?: Database["public"]["Enums"]["categoria_nota_spesa"]
          commessa_id?: string | null
          created_at?: string
          data?: string
          data_approvazione?: string | null
          descrizione: string
          dipendente_id?: string | null
          dipendente_nome: string
          id?: string
          importo: number
          note?: string | null
          numero: string
          stato?: Database["public"]["Enums"]["stato_nota_spesa"]
          updated_at?: string
        }
        Update: {
          allegati?: string[] | null
          approvato_da?: string | null
          categoria?: Database["public"]["Enums"]["categoria_nota_spesa"]
          commessa_id?: string | null
          created_at?: string
          data?: string
          data_approvazione?: string | null
          descrizione?: string
          dipendente_id?: string | null
          dipendente_nome?: string
          id?: string
          importo?: number
          note?: string | null
          numero?: string
          stato?: Database["public"]["Enums"]["stato_nota_spesa"]
          updated_at?: string
        }
        Relationships: []
      }
      notifiche: {
        Row: {
          created_at: string
          data_scadenza: string | null
          entita_id: string | null
          entita_tipo: string | null
          id: string
          letta: boolean
          messaggio: string
          tipo: string
          titolo: string
        }
        Insert: {
          created_at?: string
          data_scadenza?: string | null
          entita_id?: string | null
          entita_tipo?: string | null
          id?: string
          letta?: boolean
          messaggio: string
          tipo: string
          titolo: string
        }
        Update: {
          created_at?: string
          data_scadenza?: string | null
          entita_id?: string | null
          entita_tipo?: string | null
          id?: string
          letta?: boolean
          messaggio?: string
          tipo?: string
          titolo?: string
        }
        Relationships: []
      }
      ordini_fornitori: {
        Row: {
          allegati: string[] | null
          cantiere_id: string | null
          cantiere_nome: string | null
          condizioni_pagamento: string | null
          convertito_in_ddt_at: string | null
          created_at: string | null
          data: string
          data_consegna_effettiva: string | null
          data_consegna_prevista: string | null
          ddt_generato_id: string | null
          documenti_richiesti: Json | null
          fornitore_id: string | null
          fornitore_nome: string
          id: string
          importo: number
          note: string | null
          numero: string
          penali: string | null
          preventivo_origine_id: string | null
          stato: string
          updated_at: string | null
        }
        Insert: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          condizioni_pagamento?: string | null
          convertito_in_ddt_at?: string | null
          created_at?: string | null
          data?: string
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          ddt_generato_id?: string | null
          documenti_richiesti?: Json | null
          fornitore_id?: string | null
          fornitore_nome: string
          id?: string
          importo?: number
          note?: string | null
          numero: string
          penali?: string | null
          preventivo_origine_id?: string | null
          stato?: string
          updated_at?: string | null
        }
        Update: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          condizioni_pagamento?: string | null
          convertito_in_ddt_at?: string | null
          created_at?: string | null
          data?: string
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          ddt_generato_id?: string | null
          documenti_richiesti?: Json | null
          fornitore_id?: string | null
          fornitore_nome?: string
          id?: string
          importo?: number
          note?: string | null
          numero?: string
          penali?: string | null
          preventivo_origine_id?: string | null
          stato?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordini_fornitori_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordini_fornitori_preventivo_origine_id_fkey"
            columns: ["preventivo_origine_id"]
            isOneToOne: false
            referencedRelation: "preventivi_fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      organigramma: {
        Row: {
          created_at: string
          dipendente_id: string | null
          email: string | null
          foto_url: string | null
          id: string
          livello: number
          nome: string
          ordine: number
          reparto: string
          ruolo: string
          superiore_id: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dipendente_id?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          livello?: number
          nome: string
          ordine?: number
          reparto: string
          ruolo: string
          superiore_id?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dipendente_id?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string
          livello?: number
          nome?: string
          ordine?: number
          reparto?: string
          ruolo?: string
          superiore_id?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organigramma_superiore_id_fkey"
            columns: ["superiore_id"]
            isOneToOne: false
            referencedRelation: "organigramma"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_templates: {
        Row: {
          contenuto: Json
          created_at: string
          descrizione: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          contenuto?: Json
          created_at?: string
          descrizione?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          contenuto?: Json
          created_at?: string
          descrizione?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      prenotazioni_risorse: {
        Row: {
          cantiere_id: string | null
          cantiere_nome: string | null
          created_at: string
          data_fine: string
          data_inizio: string
          id: string
          note: string | null
          risorsa_id: string
          stato: string
        }
        Insert: {
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string
          data_fine: string
          data_inizio: string
          id?: string
          note?: string | null
          risorsa_id: string
          stato?: string
        }
        Update: {
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string
          data_fine?: string
          data_inizio?: string
          id?: string
          note?: string | null
          risorsa_id?: string
          stato?: string
        }
        Relationships: [
          {
            foreignKeyName: "prenotazioni_risorse_risorsa_id_fkey"
            columns: ["risorsa_id"]
            isOneToOne: false
            referencedRelation: "risorse"
            referencedColumns: ["id"]
          },
        ]
      }
      presenze_rapportino: {
        Row: {
          created_at: string | null
          id: string
          lavoratore_id: string | null
          lavoratore_nome: string
          mansione: string | null
          note: string | null
          ore_ordinarie: number | null
          ore_straordinario: number | null
          rapportino_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lavoratore_id?: string | null
          lavoratore_nome: string
          mansione?: string | null
          note?: string | null
          ore_ordinarie?: number | null
          ore_straordinario?: number | null
          rapportino_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lavoratore_id?: string | null
          lavoratore_nome?: string
          mansione?: string | null
          note?: string | null
          ore_ordinarie?: number | null
          ore_straordinario?: number | null
          rapportino_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presenze_rapportino_rapportino_id_fkey"
            columns: ["rapportino_id"]
            isOneToOne: false
            referencedRelation: "rapportini"
            referencedColumns: ["id"]
          },
        ]
      }
      preventivi: {
        Row: {
          aliquota_iva: number
          cliente_nome: string
          created_at: string
          data: string
          descrizione: string | null
          id: string
          imponibile: number
          lead_id: string | null
          note: string | null
          numero: string
          oggetto: string
          sconto_percentuale: number | null
          stato: Database["public"]["Enums"]["stato_preventivo"]
          totale: number | null
          updated_at: string
          validita_giorni: number
        }
        Insert: {
          aliquota_iva?: number
          cliente_nome: string
          created_at?: string
          data?: string
          descrizione?: string | null
          id?: string
          imponibile?: number
          lead_id?: string | null
          note?: string | null
          numero: string
          oggetto: string
          sconto_percentuale?: number | null
          stato?: Database["public"]["Enums"]["stato_preventivo"]
          totale?: number | null
          updated_at?: string
          validita_giorni?: number
        }
        Update: {
          aliquota_iva?: number
          cliente_nome?: string
          created_at?: string
          data?: string
          descrizione?: string | null
          id?: string
          imponibile?: number
          lead_id?: string | null
          note?: string | null
          numero?: string
          oggetto?: string
          sconto_percentuale?: number | null
          stato?: Database["public"]["Enums"]["stato_preventivo"]
          totale?: number | null
          updated_at?: string
          validita_giorni?: number
        }
        Relationships: [
          {
            foreignKeyName: "preventivi_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      preventivi_fornitori: {
        Row: {
          allegati: string[] | null
          cantiere_id: string | null
          cantiere_nome: string | null
          computo_id: string | null
          convertito_in_ordine_at: string | null
          created_at: string | null
          data: string
          fornitore_id: string | null
          fornitore_nome: string
          id: string
          importo: number | null
          note: string | null
          numero: string
          oggetto: string
          ordine_generato_id: string | null
          scadenza: string | null
          stato: string
          updated_at: string | null
        }
        Insert: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          computo_id?: string | null
          convertito_in_ordine_at?: string | null
          created_at?: string | null
          data?: string
          fornitore_id?: string | null
          fornitore_nome: string
          id?: string
          importo?: number | null
          note?: string | null
          numero: string
          oggetto: string
          ordine_generato_id?: string | null
          scadenza?: string | null
          stato?: string
          updated_at?: string | null
        }
        Update: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          computo_id?: string | null
          convertito_in_ordine_at?: string | null
          created_at?: string | null
          data?: string
          fornitore_id?: string | null
          fornitore_nome?: string
          id?: string
          importo?: number | null
          note?: string | null
          numero?: string
          oggetto?: string
          ordine_generato_id?: string | null
          scadenza?: string | null
          stato?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preventivi_fornitori_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventivi_fornitori_ordine_generato_id_fkey"
            columns: ["ordine_generato_id"]
            isOneToOne: false
            referencedRelation: "ordini_fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      rapportini: {
        Row: {
          approvato: boolean | null
          approvato_da: string | null
          attrezzature_utilizzate: string | null
          cantiere_id: string | null
          cantiere_nome: string | null
          condizioni_meteo: string | null
          created_at: string | null
          data: string
          data_approvazione: string | null
          foto_allegati: string[] | null
          id: string
          lavorazioni_eseguite: string | null
          materiali_utilizzati: string | null
          note_sicurezza: string | null
          ore_lavorate_totali: number | null
          problemi_riscontrati: string | null
          redatto_da: string
          temperatura_max: number | null
          temperatura_min: number | null
          updated_at: string | null
        }
        Insert: {
          approvato?: boolean | null
          approvato_da?: string | null
          attrezzature_utilizzate?: string | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          condizioni_meteo?: string | null
          created_at?: string | null
          data?: string
          data_approvazione?: string | null
          foto_allegati?: string[] | null
          id?: string
          lavorazioni_eseguite?: string | null
          materiali_utilizzati?: string | null
          note_sicurezza?: string | null
          ore_lavorate_totali?: number | null
          problemi_riscontrati?: string | null
          redatto_da: string
          temperatura_max?: number | null
          temperatura_min?: number | null
          updated_at?: string | null
        }
        Update: {
          approvato?: boolean | null
          approvato_da?: string | null
          attrezzature_utilizzate?: string | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          condizioni_meteo?: string | null
          created_at?: string | null
          data?: string
          data_approvazione?: string | null
          foto_allegati?: string[] | null
          id?: string
          lavorazioni_eseguite?: string | null
          materiali_utilizzati?: string | null
          note_sicurezza?: string | null
          ore_lavorate_totali?: number | null
          problemi_riscontrati?: string | null
          redatto_da?: string
          temperatura_max?: number | null
          temperatura_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_bi: {
        Row: {
          attivo: boolean | null
          created_at: string | null
          descrizione: string | null
          destinatari: string[] | null
          filtri: Json | null
          formato: string | null
          frequenza: string | null
          id: string
          nome: string
          prossima_esecuzione: string | null
          tipo_report: string
          ultima_esecuzione: string | null
          updated_at: string | null
        }
        Insert: {
          attivo?: boolean | null
          created_at?: string | null
          descrizione?: string | null
          destinatari?: string[] | null
          filtri?: Json | null
          formato?: string | null
          frequenza?: string | null
          id?: string
          nome: string
          prossima_esecuzione?: string | null
          tipo_report?: string
          ultima_esecuzione?: string | null
          updated_at?: string | null
        }
        Update: {
          attivo?: boolean | null
          created_at?: string | null
          descrizione?: string | null
          destinatari?: string[] | null
          filtri?: Json | null
          formato?: string | null
          frequenza?: string | null
          id?: string
          nome?: string
          prossima_esecuzione?: string | null
          tipo_report?: string
          ultima_esecuzione?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rfq_comparazioni: {
        Row: {
          approvato_da: string | null
          created_at: string
          criteri_valutazione: Json | null
          data_approvazione: string | null
          data_comparazione: string
          id: string
          motivazione_scelta: string
          note_commissione: string | null
          rfq_id: string
          risposta_vincente_id: string | null
        }
        Insert: {
          approvato_da?: string | null
          created_at?: string
          criteri_valutazione?: Json | null
          data_approvazione?: string | null
          data_comparazione?: string
          id?: string
          motivazione_scelta: string
          note_commissione?: string | null
          rfq_id: string
          risposta_vincente_id?: string | null
        }
        Update: {
          approvato_da?: string | null
          created_at?: string
          criteri_valutazione?: Json | null
          data_approvazione?: string | null
          data_comparazione?: string
          id?: string
          motivazione_scelta?: string
          note_commissione?: string | null
          rfq_id?: string
          risposta_vincente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_comparazioni_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfq_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_comparazioni_risposta_vincente_id_fkey"
            columns: ["risposta_vincente_id"]
            isOneToOne: false
            referencedRelation: "rfq_risposte"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_richieste: {
        Row: {
          allegati_tecnici: Json | null
          cantiere_id: string | null
          created_at: string
          created_by: string | null
          data_emissione: string
          data_scadenza: string
          descrizione: string | null
          id: string
          importo_stimato: number | null
          lavorazione: string | null
          note: string | null
          numero: string
          oggetto: string
          solleciti_inviati: number | null
          stato: string
          ultimo_sollecito: string | null
          updated_at: string
          urgenza: string | null
        }
        Insert: {
          allegati_tecnici?: Json | null
          cantiere_id?: string | null
          created_at?: string
          created_by?: string | null
          data_emissione?: string
          data_scadenza: string
          descrizione?: string | null
          id?: string
          importo_stimato?: number | null
          lavorazione?: string | null
          note?: string | null
          numero: string
          oggetto: string
          solleciti_inviati?: number | null
          stato?: string
          ultimo_sollecito?: string | null
          updated_at?: string
          urgenza?: string | null
        }
        Update: {
          allegati_tecnici?: Json | null
          cantiere_id?: string | null
          created_at?: string
          created_by?: string | null
          data_emissione?: string
          data_scadenza?: string
          descrizione?: string | null
          id?: string
          importo_stimato?: number | null
          lavorazione?: string | null
          note?: string | null
          numero?: string
          oggetto?: string
          solleciti_inviati?: number | null
          stato?: string
          ultimo_sollecito?: string | null
          updated_at?: string
          urgenza?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_richieste_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_risposte: {
        Row: {
          allegati: Json | null
          condizioni_pagamento: string | null
          created_at: string
          data_ricezione: string
          fornitore_id: string | null
          fornitore_nome: string | null
          id: string
          importo_offerto: number
          motivo_esclusione: string | null
          motivo_selezione: string | null
          note_tecniche: string | null
          punteggio_economico: number | null
          punteggio_tecnico: number | null
          punteggio_totale: number | null
          rfq_id: string
          selezionata: boolean | null
          stato_approvazione: string | null
          tempi_consegna: string | null
          updated_at: string
          validita_offerta: string | null
          valutazione: number | null
        }
        Insert: {
          allegati?: Json | null
          condizioni_pagamento?: string | null
          created_at?: string
          data_ricezione?: string
          fornitore_id?: string | null
          fornitore_nome?: string | null
          id?: string
          importo_offerto: number
          motivo_esclusione?: string | null
          motivo_selezione?: string | null
          note_tecniche?: string | null
          punteggio_economico?: number | null
          punteggio_tecnico?: number | null
          punteggio_totale?: number | null
          rfq_id: string
          selezionata?: boolean | null
          stato_approvazione?: string | null
          tempi_consegna?: string | null
          updated_at?: string
          validita_offerta?: string | null
          valutazione?: number | null
        }
        Update: {
          allegati?: Json | null
          condizioni_pagamento?: string | null
          created_at?: string
          data_ricezione?: string
          fornitore_id?: string | null
          fornitore_nome?: string | null
          id?: string
          importo_offerto?: number
          motivo_esclusione?: string | null
          motivo_selezione?: string | null
          note_tecniche?: string | null
          punteggio_economico?: number | null
          punteggio_tecnico?: number | null
          punteggio_totale?: number | null
          rfq_id?: string
          selezionata?: boolean | null
          stato_approvazione?: string | null
          tempi_consegna?: string | null
          updated_at?: string
          validita_offerta?: string | null
          valutazione?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_risposte_fornitore_id_fkey"
            columns: ["fornitore_id"]
            isOneToOne: false
            referencedRelation: "fornitori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_risposte_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfq_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      richieste_dipendenti: {
        Row: {
          approvato_da: string | null
          created_at: string
          data: string
          data_approvazione: string | null
          data_fine: string | null
          data_inizio: string | null
          descrizione: string
          dipendente_id: string | null
          dipendente_nome: string
          id: string
          importo: number | null
          note: string | null
          numero: string
          stato: Database["public"]["Enums"]["stato_richiesta"]
          tipo: Database["public"]["Enums"]["tipo_richiesta"]
          updated_at: string
        }
        Insert: {
          approvato_da?: string | null
          created_at?: string
          data?: string
          data_approvazione?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          descrizione: string
          dipendente_id?: string | null
          dipendente_nome: string
          id?: string
          importo?: number | null
          note?: string | null
          numero: string
          stato?: Database["public"]["Enums"]["stato_richiesta"]
          tipo: Database["public"]["Enums"]["tipo_richiesta"]
          updated_at?: string
        }
        Update: {
          approvato_da?: string | null
          created_at?: string
          data?: string
          data_approvazione?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          descrizione?: string
          dipendente_id?: string | null
          dipendente_nome?: string
          id?: string
          importo?: number | null
          note?: string | null
          numero?: string
          stato?: Database["public"]["Enums"]["stato_richiesta"]
          tipo?: Database["public"]["Enums"]["tipo_richiesta"]
          updated_at?: string
        }
        Relationships: []
      }
      righe_ddt: {
        Row: {
          codice: string | null
          created_at: string
          ddt_id: string
          descrizione: string
          id: string
          ordine: number | null
          quantita: number
          unita_misura: string | null
        }
        Insert: {
          codice?: string | null
          created_at?: string
          ddt_id: string
          descrizione: string
          id?: string
          ordine?: number | null
          quantita?: number
          unita_misura?: string | null
        }
        Update: {
          codice?: string | null
          created_at?: string
          ddt_id?: string
          descrizione?: string
          id?: string
          ordine?: number | null
          quantita?: number
          unita_misura?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "righe_ddt_ddt_id_fkey"
            columns: ["ddt_id"]
            isOneToOne: false
            referencedRelation: "ddt"
            referencedColumns: ["id"]
          },
        ]
      }
      righe_ordine: {
        Row: {
          codice: string | null
          created_at: string | null
          descrizione: string
          id: string
          importo: number | null
          ordine: number | null
          ordine_id: string
          prezzo_unitario: number
          quantita: number
          sconto: number | null
          unita_misura: string | null
        }
        Insert: {
          codice?: string | null
          created_at?: string | null
          descrizione: string
          id?: string
          importo?: number | null
          ordine?: number | null
          ordine_id: string
          prezzo_unitario?: number
          quantita?: number
          sconto?: number | null
          unita_misura?: string | null
        }
        Update: {
          codice?: string | null
          created_at?: string | null
          descrizione?: string
          id?: string
          importo?: number | null
          ordine?: number | null
          ordine_id?: string
          prezzo_unitario?: number
          quantita?: number
          sconto?: number | null
          unita_misura?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "righe_ordine_ordine_id_fkey"
            columns: ["ordine_id"]
            isOneToOne: false
            referencedRelation: "ordini_fornitori"
            referencedColumns: ["id"]
          },
        ]
      }
      risorse: {
        Row: {
          created_at: string
          descrizione: string | null
          id: string
          matricola: string | null
          nome: string
          stato: string
          targa: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descrizione?: string | null
          id?: string
          matricola?: string | null
          nome: string
          stato?: string
          targa?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descrizione?: string | null
          id?: string
          matricola?: string | null
          nome?: string
          stato?: string
          targa?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      sal_excel_imports: {
        Row: {
          cantiere_id: string | null
          cantiere_nome: string | null
          created_at: string
          error_message: string | null
          file_name: string
          id: string
          imported_by: string | null
          rows_imported: number | null
          status: string | null
          total_rows: number | null
        }
        Insert: {
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string
          error_message?: string | null
          file_name: string
          id?: string
          imported_by?: string | null
          rows_imported?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Update: {
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string
          id?: string
          imported_by?: string | null
          rows_imported?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Relationships: []
      }
      sal_voci_dettaglio: {
        Row: {
          capitolo: string | null
          categoria: string | null
          codice: string | null
          created_at: string
          descrizione: string
          id: string
          import_id: string | null
          importo_contratto: number | null
          importo_periodo: number | null
          importo_precedente: number | null
          importo_totale: number | null
          note: string | null
          ordine: number | null
          percentuale_avanzamento: number | null
          prezzo_unitario: number | null
          quantita_contratto: number | null
          quantita_periodo: number | null
          quantita_precedente: number | null
          quantita_totale: number | null
          sal_id: string | null
          unita_misura: string | null
        }
        Insert: {
          capitolo?: string | null
          categoria?: string | null
          codice?: string | null
          created_at?: string
          descrizione: string
          id?: string
          import_id?: string | null
          importo_contratto?: number | null
          importo_periodo?: number | null
          importo_precedente?: number | null
          importo_totale?: number | null
          note?: string | null
          ordine?: number | null
          percentuale_avanzamento?: number | null
          prezzo_unitario?: number | null
          quantita_contratto?: number | null
          quantita_periodo?: number | null
          quantita_precedente?: number | null
          quantita_totale?: number | null
          sal_id?: string | null
          unita_misura?: string | null
        }
        Update: {
          capitolo?: string | null
          categoria?: string | null
          codice?: string | null
          created_at?: string
          descrizione?: string
          id?: string
          import_id?: string | null
          importo_contratto?: number | null
          importo_periodo?: number | null
          importo_precedente?: number | null
          importo_totale?: number | null
          note?: string | null
          ordine?: number | null
          percentuale_avanzamento?: number | null
          prezzo_unitario?: number | null
          quantita_contratto?: number | null
          quantita_periodo?: number | null
          quantita_precedente?: number | null
          quantita_totale?: number | null
          sal_id?: string | null
          unita_misura?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sal_voci_dettaglio_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "sal_excel_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      scadenzario: {
        Row: {
          allegati: string[] | null
          created_at: string | null
          data_scadenza: string
          descrizione: string | null
          entita_id: string | null
          entita_nome: string | null
          entita_tipo: string | null
          giorni_preavviso: number | null
          id: string
          note: string | null
          priorita: string | null
          responsabile: string | null
          stato: string | null
          tipo: string
          titolo: string
          updated_at: string | null
        }
        Insert: {
          allegati?: string[] | null
          created_at?: string | null
          data_scadenza: string
          descrizione?: string | null
          entita_id?: string | null
          entita_nome?: string | null
          entita_tipo?: string | null
          giorni_preavviso?: number | null
          id?: string
          note?: string | null
          priorita?: string | null
          responsabile?: string | null
          stato?: string | null
          tipo: string
          titolo: string
          updated_at?: string | null
        }
        Update: {
          allegati?: string[] | null
          created_at?: string | null
          data_scadenza?: string
          descrizione?: string | null
          entita_id?: string | null
          entita_nome?: string | null
          entita_tipo?: string | null
          giorni_preavviso?: number | null
          id?: string
          note?: string | null
          priorita?: string | null
          responsabile?: string | null
          stato?: string | null
          tipo?: string
          titolo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subappalti: {
        Row: {
          allegati: Json | null
          cantiere_id: string | null
          condizioni_pagamento: string | null
          created_at: string
          data_contratto: string | null
          data_fine_effettiva: string | null
          data_fine_prevista: string | null
          data_inizio_lavori: string | null
          documenti_obbligatori: Json | null
          documenti_ricevuti: Json | null
          id: string
          importo_autorizzato: number | null
          importo_contratto: number
          impresa_id: string | null
          impresa_nome: string | null
          lotto: string | null
          note: string | null
          numero_contratto: string
          oggetto: string
          penali: string | null
          percentuale_ribasso: number | null
          referente_email: string | null
          referente_nome: string | null
          referente_telefono: string | null
          stato: string
          updated_at: string
        }
        Insert: {
          allegati?: Json | null
          cantiere_id?: string | null
          condizioni_pagamento?: string | null
          created_at?: string
          data_contratto?: string | null
          data_fine_effettiva?: string | null
          data_fine_prevista?: string | null
          data_inizio_lavori?: string | null
          documenti_obbligatori?: Json | null
          documenti_ricevuti?: Json | null
          id?: string
          importo_autorizzato?: number | null
          importo_contratto: number
          impresa_id?: string | null
          impresa_nome?: string | null
          lotto?: string | null
          note?: string | null
          numero_contratto: string
          oggetto: string
          penali?: string | null
          percentuale_ribasso?: number | null
          referente_email?: string | null
          referente_nome?: string | null
          referente_telefono?: string | null
          stato?: string
          updated_at?: string
        }
        Update: {
          allegati?: Json | null
          cantiere_id?: string | null
          condizioni_pagamento?: string | null
          created_at?: string
          data_contratto?: string | null
          data_fine_effettiva?: string | null
          data_fine_prevista?: string | null
          data_inizio_lavori?: string | null
          documenti_obbligatori?: Json | null
          documenti_ricevuti?: Json | null
          id?: string
          importo_autorizzato?: number | null
          importo_contratto?: number
          impresa_id?: string | null
          impresa_nome?: string | null
          lotto?: string | null
          note?: string | null
          numero_contratto?: string
          oggetto?: string
          penali?: string | null
          percentuale_ribasso?: number | null
          referente_email?: string | null
          referente_nome?: string | null
          referente_telefono?: string | null
          stato?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subappalti_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subappalti_impresa_id_fkey"
            columns: ["impresa_id"]
            isOneToOne: false
            referencedRelation: "imprese"
            referencedColumns: ["id"]
          },
        ]
      }
      subappalti_documenti: {
        Row: {
          created_at: string
          data_ricezione: string | null
          data_richiesta: string | null
          data_scadenza: string | null
          data_verifica: string | null
          file_url: string | null
          id: string
          nome_documento: string | null
          note: string | null
          stato: string
          subappalto_id: string
          tipo_documento: string
          updated_at: string
          verificato_da: string | null
        }
        Insert: {
          created_at?: string
          data_ricezione?: string | null
          data_richiesta?: string | null
          data_scadenza?: string | null
          data_verifica?: string | null
          file_url?: string | null
          id?: string
          nome_documento?: string | null
          note?: string | null
          stato?: string
          subappalto_id: string
          tipo_documento: string
          updated_at?: string
          verificato_da?: string | null
        }
        Update: {
          created_at?: string
          data_ricezione?: string | null
          data_richiesta?: string | null
          data_scadenza?: string | null
          data_verifica?: string | null
          file_url?: string | null
          id?: string
          nome_documento?: string | null
          note?: string | null
          stato?: string
          subappalto_id?: string
          tipo_documento?: string
          updated_at?: string
          verificato_da?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subappalti_documenti_subappalto_id_fkey"
            columns: ["subappalto_id"]
            isOneToOne: false
            referencedRelation: "subappalti"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          cantiere_id: string | null
          category: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          impresa_id: string | null
          note: string | null
          ordine: number | null
          parent_id: string | null
          priority: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee?: string | null
          cantiere_id?: string | null
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impresa_id?: string | null
          note?: string | null
          ordine?: number | null
          parent_id?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee?: string | null
          cantiere_id?: string | null
          category?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impresa_id?: string | null
          note?: string | null
          ordine?: number | null
          parent_id?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_impresa_id_fkey"
            columns: ["impresa_id"]
            isOneToOne: false
            referencedRelation: "imprese"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      timbrature: {
        Row: {
          attivita: string | null
          cantiere_id: string | null
          cantiere_nome: string | null
          created_at: string
          data: string
          data_validazione: string | null
          id: string
          lavoratore_id: string | null
          lavoratore_nome: string
          metodo: string | null
          non_conformita_motivo: string | null
          non_conformita_tipo: string | null
          note: string | null
          ora: string
          ora_fine: string | null
          ore_lavorate: number | null
          ore_straordinario: number | null
          pausa_minuti: number | null
          posizione_gps: string | null
          stato_validazione: string | null
          tipo: string
          turno: string | null
          validata_da: string | null
        }
        Insert: {
          attivita?: string | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string
          data?: string
          data_validazione?: string | null
          id?: string
          lavoratore_id?: string | null
          lavoratore_nome: string
          metodo?: string | null
          non_conformita_motivo?: string | null
          non_conformita_tipo?: string | null
          note?: string | null
          ora?: string
          ora_fine?: string | null
          ore_lavorate?: number | null
          ore_straordinario?: number | null
          pausa_minuti?: number | null
          posizione_gps?: string | null
          stato_validazione?: string | null
          tipo: string
          turno?: string | null
          validata_da?: string | null
        }
        Update: {
          attivita?: string | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string
          data?: string
          data_validazione?: string | null
          id?: string
          lavoratore_id?: string | null
          lavoratore_nome?: string
          metodo?: string | null
          non_conformita_motivo?: string | null
          non_conformita_tipo?: string | null
          note?: string | null
          ora?: string
          ora_fine?: string | null
          ore_lavorate?: number | null
          ore_straordinario?: number | null
          pausa_minuti?: number | null
          posizione_gps?: string | null
          stato_validazione?: string | null
          tipo?: string
          turno?: string | null
          validata_da?: string | null
        }
        Relationships: []
      }
      user_calendar_events: {
        Row: {
          colore: string | null
          created_at: string
          data_fine: string | null
          data_inizio: string
          descrizione: string | null
          id: string
          promemoria_minuti: number | null
          titolo: string
          tutto_il_giorno: boolean | null
          user_id: string | null
        }
        Insert: {
          colore?: string | null
          created_at?: string
          data_fine?: string | null
          data_inizio: string
          descrizione?: string | null
          id?: string
          promemoria_minuti?: number | null
          titolo: string
          tutto_il_giorno?: boolean | null
          user_id?: string | null
        }
        Update: {
          colore?: string | null
          created_at?: string
          data_fine?: string | null
          data_inizio?: string
          descrizione?: string | null
          id?: string
          promemoria_minuti?: number | null
          titolo?: string
          tutto_il_giorno?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          icona: string | null
          id: string
          ordine: number | null
          titolo: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          icona?: string | null
          id?: string
          ordine?: number | null
          titolo: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          icona?: string | null
          id?: string
          ordine?: number | null
          titolo?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          categoria: string | null
          colore: string | null
          contenuto: string | null
          created_at: string
          id: string
          pinned: boolean | null
          titolo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          categoria?: string | null
          colore?: string | null
          contenuto?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          titolo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          categoria?: string | null
          colore?: string | null
          contenuto?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          titolo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          keyboard_shortcuts: Json | null
          language: string | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          sidebar_collapsed: boolean | null
          sidebar_modules: Json | null
          theme_color: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          keyboard_shortcuts?: Json | null
          language?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          sidebar_collapsed?: boolean | null
          sidebar_modules?: Json | null
          theme_color?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          keyboard_shortcuts?: Json | null
          language?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          sidebar_collapsed?: boolean | null
          sidebar_modules?: Json | null
          theme_color?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          cognome: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          ruolo: string | null
          telefono: string | null
          theme_color: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          cognome?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          ruolo?: string | null
          telefono?: string | null
          theme_color?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          cognome?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          ruolo?: string | null
          telefono?: string | null
          theme_color?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          completata: boolean | null
          created_at: string
          data_scadenza: string | null
          descrizione: string | null
          id: string
          priorita: string | null
          stato: string | null
          titolo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completata?: boolean | null
          created_at?: string
          data_scadenza?: string | null
          descrizione?: string | null
          id?: string
          priorita?: string | null
          stato?: string | null
          titolo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completata?: boolean | null
          created_at?: string
          data_scadenza?: string | null
          descrizione?: string | null
          id?: string
          priorita?: string | null
          stato?: string | null
          titolo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      varianti: {
        Row: {
          allegati: Json | null
          approvato_da: string | null
          cantiere_id: string | null
          created_at: string
          data_approvazione: string | null
          data_richiesta: string
          descrizione: string | null
          id: string
          importo_nuovo_totale: number | null
          importo_originale: number | null
          importo_variante: number
          motivazione: string
          note_approvazione: string | null
          numero_variante: string
          oggetto: string
          percentuale_variazione: number | null
          richiesto_da: string | null
          riferimento_id: string
          riferimento_numero: string | null
          stato: string
          tipo_riferimento: string
          tipo_variante: string
          updated_at: string
          versione: number | null
        }
        Insert: {
          allegati?: Json | null
          approvato_da?: string | null
          cantiere_id?: string | null
          created_at?: string
          data_approvazione?: string | null
          data_richiesta?: string
          descrizione?: string | null
          id?: string
          importo_nuovo_totale?: number | null
          importo_originale?: number | null
          importo_variante: number
          motivazione: string
          note_approvazione?: string | null
          numero_variante: string
          oggetto: string
          percentuale_variazione?: number | null
          richiesto_da?: string | null
          riferimento_id: string
          riferimento_numero?: string | null
          stato?: string
          tipo_riferimento: string
          tipo_variante: string
          updated_at?: string
          versione?: number | null
        }
        Update: {
          allegati?: Json | null
          approvato_da?: string | null
          cantiere_id?: string | null
          created_at?: string
          data_approvazione?: string | null
          data_richiesta?: string
          descrizione?: string | null
          id?: string
          importo_nuovo_totale?: number | null
          importo_originale?: number | null
          importo_variante?: number
          motivazione?: string
          note_approvazione?: string | null
          numero_variante?: string
          oggetto?: string
          percentuale_variazione?: number | null
          richiesto_da?: string | null
          riferimento_id?: string
          riferimento_numero?: string | null
          stato?: string
          tipo_riferimento?: string
          tipo_variante?: string
          updated_at?: string
          versione?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "varianti_cantiere_id_fkey"
            columns: ["cantiere_id"]
            isOneToOne: false
            referencedRelation: "cantieri"
            referencedColumns: ["id"]
          },
        ]
      }
      varianti_storico: {
        Row: {
          data_modifica: string
          dati_snapshot: Json
          id: string
          modificato_da: string | null
          note_modifica: string | null
          variante_id: string
          versione: number
        }
        Insert: {
          data_modifica?: string
          dati_snapshot: Json
          id?: string
          modificato_da?: string | null
          note_modifica?: string | null
          variante_id: string
          versione: number
        }
        Update: {
          data_modifica?: string
          dati_snapshot?: Json
          id?: string
          modificato_da?: string | null
          note_modifica?: string | null
          variante_id?: string
          versione?: number
        }
        Relationships: [
          {
            foreignKeyName: "varianti_storico_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "varianti"
            referencedColumns: ["id"]
          },
        ]
      }
      visite_mediche: {
        Row: {
          certificato_url: string | null
          created_at: string | null
          data_scadenza: string | null
          data_visita: string
          esito: string | null
          id: string
          lavoratore_id: string
          limitazioni: string | null
          medico: string | null
          note: string | null
          prescrizioni: string | null
          stato: string | null
          tipo_visita: string
        }
        Insert: {
          certificato_url?: string | null
          created_at?: string | null
          data_scadenza?: string | null
          data_visita: string
          esito?: string | null
          id?: string
          lavoratore_id: string
          limitazioni?: string | null
          medico?: string | null
          note?: string | null
          prescrizioni?: string | null
          stato?: string | null
          tipo_visita: string
        }
        Update: {
          certificato_url?: string | null
          created_at?: string | null
          data_scadenza?: string | null
          data_visita?: string
          esito?: string | null
          id?: string
          lavoratore_id?: string
          limitazioni?: string | null
          medico?: string | null
          note?: string | null
          prescrizioni?: string | null
          stato?: string | null
          tipo_visita?: string
        }
        Relationships: [
          {
            foreignKeyName: "visite_mediche_lavoratore_id_fkey"
            columns: ["lavoratore_id"]
            isOneToOne: false
            referencedRelation: "lavoratori"
            referencedColumns: ["id"]
          },
        ]
      }
      voci_computo: {
        Row: {
          capitolo: string | null
          categoria: string | null
          codice: string | null
          computo_id: string
          created_at: string
          descrizione: string
          id: string
          importo: number | null
          ordine: number
          prezzo_unitario: number
          quantita: number
          unita_misura: string
        }
        Insert: {
          capitolo?: string | null
          categoria?: string | null
          codice?: string | null
          computo_id: string
          created_at?: string
          descrizione: string
          id?: string
          importo?: number | null
          ordine?: number
          prezzo_unitario: number
          quantita: number
          unita_misura: string
        }
        Update: {
          capitolo?: string | null
          categoria?: string | null
          codice?: string | null
          computo_id?: string
          created_at?: string
          descrizione?: string
          id?: string
          importo?: number | null
          ordine?: number
          prezzo_unitario?: number
          quantita?: number
          unita_misura?: string
        }
        Relationships: [
          {
            foreignKeyName: "voci_computo_computo_id_fkey"
            columns: ["computo_id"]
            isOneToOne: false
            referencedRelation: "computi_metrici"
            referencedColumns: ["id"]
          },
        ]
      }
      voci_preventivo: {
        Row: {
          created_at: string
          descrizione: string
          id: string
          importo: number | null
          ordine: number
          preventivo_id: string
          prezzo_unitario: number
          quantita: number
          unita_misura: string
        }
        Insert: {
          created_at?: string
          descrizione: string
          id?: string
          importo?: number | null
          ordine?: number
          preventivo_id: string
          prezzo_unitario: number
          quantita?: number
          unita_misura?: string
        }
        Update: {
          created_at?: string
          descrizione?: string
          id?: string
          importo?: number | null
          ordine?: number
          preventivo_id?: string
          prezzo_unitario?: number
          quantita?: number
          unita_misura?: string
        }
        Relationships: [
          {
            foreignKeyName: "voci_preventivo_preventivo_id_fkey"
            columns: ["preventivo_id"]
            isOneToOne: false
            referencedRelation: "preventivi"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_notifications: {
        Row: {
          azione_suggerita: string | null
          created_at: string | null
          entita_id: string
          entita_tipo: string
          id: string
          letta_at: string | null
          link_azione: string | null
          messaggio: string
          priorita: string | null
          stato: string | null
          tipo: string
          titolo: string
        }
        Insert: {
          azione_suggerita?: string | null
          created_at?: string | null
          entita_id: string
          entita_tipo: string
          id?: string
          letta_at?: string | null
          link_azione?: string | null
          messaggio: string
          priorita?: string | null
          stato?: string | null
          tipo: string
          titolo: string
        }
        Update: {
          azione_suggerita?: string | null
          created_at?: string | null
          entita_id?: string
          entita_tipo?: string
          id?: string
          letta_at?: string | null
          link_azione?: string | null
          messaggio?: string
          priorita?: string | null
          stato?: string | null
          tipo?: string
          titolo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_supplier_compliance: {
        Args: { p_fornitore_id: string }
        Returns: {
          blocco_motivo: string
          documenti_mancanti: number
          documenti_scadenza: number
          documenti_scaduti: number
          documenti_validi: number
          pagabile: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "capo_cantiere"
        | "contabile"
        | "hse_manager"
        | "viewer"
      categoria_nota_spesa:
        | "trasferta"
        | "materiale"
        | "vitto"
        | "alloggio"
        | "altro"
      stato_fattura:
        | "emessa"
        | "pagata"
        | "scaduta"
        | "in_attesa"
        | "contestata"
      stato_lead:
        | "nuovo"
        | "contattato"
        | "qualificato"
        | "proposta"
        | "negoziazione"
        | "chiuso_vinto"
        | "chiuso_perso"
      stato_nota_spesa: "presentata" | "approvata" | "rimborsata" | "rifiutata"
      stato_preventivo:
        | "bozza"
        | "inviato"
        | "approvato"
        | "rifiutato"
        | "scaduto"
      stato_richiesta: "in_attesa" | "approvata" | "rifiutata" | "completata"
      tipo_fattura: "attiva" | "passiva"
      tipo_richiesta:
        | "ferie"
        | "permesso"
        | "malattia"
        | "straordinario"
        | "anticipo"
        | "rimborso"
        | "altro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "capo_cantiere",
        "contabile",
        "hse_manager",
        "viewer",
      ],
      categoria_nota_spesa: [
        "trasferta",
        "materiale",
        "vitto",
        "alloggio",
        "altro",
      ],
      stato_fattura: ["emessa", "pagata", "scaduta", "in_attesa", "contestata"],
      stato_lead: [
        "nuovo",
        "contattato",
        "qualificato",
        "proposta",
        "negoziazione",
        "chiuso_vinto",
        "chiuso_perso",
      ],
      stato_nota_spesa: ["presentata", "approvata", "rimborsata", "rifiutata"],
      stato_preventivo: [
        "bozza",
        "inviato",
        "approvato",
        "rifiutato",
        "scaduto",
      ],
      stato_richiesta: ["in_attesa", "approvata", "rifiutata", "completata"],
      tipo_fattura: ["attiva", "passiva"],
      tipo_richiesta: [
        "ferie",
        "permesso",
        "malattia",
        "straordinario",
        "anticipo",
        "rimborso",
        "altro",
      ],
    },
  },
} as const
