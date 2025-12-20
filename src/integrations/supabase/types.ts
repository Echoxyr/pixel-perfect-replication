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
      [_ in never]: never
    }
    Enums: {
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
