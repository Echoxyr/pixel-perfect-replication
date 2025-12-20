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
          created_at: string
          data: string
          destinatario: string
          id: string
          indirizzo_destinazione: string | null
          mittente: string
          note: string | null
          numero: string
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
          created_at?: string
          data?: string
          destinatario: string
          id?: string
          indirizzo_destinazione?: string | null
          mittente: string
          note?: string | null
          numero: string
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
          created_at?: string
          data?: string
          destinatario?: string
          id?: string
          indirizzo_destinazione?: string | null
          mittente?: string
          note?: string | null
          numero?: string
          peso_kg?: number | null
          stato?: string
          tipo?: string
          updated_at?: string
          vettore?: string | null
        }
        Relationships: []
      }
      fatture: {
        Row: {
          aliquota_iva: number
          allegati: string[] | null
          cliente_fornitore: string
          commessa_id: string | null
          created_at: string
          data: string
          data_pagamento: string | null
          descrizione: string | null
          id: string
          imponibile: number
          iva: number | null
          metodo_pagamento: string | null
          numero: string
          scadenza: string
          stato: Database["public"]["Enums"]["stato_fattura"]
          tipo: Database["public"]["Enums"]["tipo_fattura"]
          totale: number | null
          updated_at: string
        }
        Insert: {
          aliquota_iva?: number
          allegati?: string[] | null
          cliente_fornitore: string
          commessa_id?: string | null
          created_at?: string
          data?: string
          data_pagamento?: string | null
          descrizione?: string | null
          id?: string
          imponibile?: number
          iva?: number | null
          metodo_pagamento?: string | null
          numero: string
          scadenza: string
          stato?: Database["public"]["Enums"]["stato_fattura"]
          tipo: Database["public"]["Enums"]["tipo_fattura"]
          totale?: number | null
          updated_at?: string
        }
        Update: {
          aliquota_iva?: number
          allegati?: string[] | null
          cliente_fornitore?: string
          commessa_id?: string | null
          created_at?: string
          data?: string
          data_pagamento?: string | null
          descrizione?: string | null
          id?: string
          imponibile?: number
          iva?: number | null
          metodo_pagamento?: string | null
          numero?: string
          scadenza?: string
          stato?: Database["public"]["Enums"]["stato_fattura"]
          tipo?: Database["public"]["Enums"]["tipo_fattura"]
          totale?: number | null
          updated_at?: string
        }
        Relationships: []
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
          created_at: string | null
          data: string
          data_consegna_effettiva: string | null
          data_consegna_prevista: string | null
          fornitore_id: string | null
          fornitore_nome: string
          id: string
          importo: number
          note: string | null
          numero: string
          stato: string
          updated_at: string | null
        }
        Insert: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data?: string
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          fornitore_id?: string | null
          fornitore_nome: string
          id?: string
          importo?: number
          note?: string | null
          numero: string
          stato?: string
          updated_at?: string | null
        }
        Update: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data?: string
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          fornitore_id?: string | null
          fornitore_nome?: string
          id?: string
          importo?: number
          note?: string | null
          numero?: string
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
          created_at: string | null
          data: string
          fornitore_id: string | null
          fornitore_nome: string
          id: string
          importo: number | null
          note: string | null
          numero: string
          oggetto: string
          scadenza: string | null
          stato: string
          updated_at: string | null
        }
        Insert: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data?: string
          fornitore_id?: string | null
          fornitore_nome: string
          id?: string
          importo?: number | null
          note?: string | null
          numero: string
          oggetto: string
          scadenza?: string | null
          stato?: string
          updated_at?: string | null
        }
        Update: {
          allegati?: string[] | null
          cantiere_id?: string | null
          cantiere_nome?: string | null
          created_at?: string | null
          data?: string
          fornitore_id?: string | null
          fornitore_nome?: string
          id?: string
          importo?: number | null
          note?: string | null
          numero?: string
          oggetto?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
