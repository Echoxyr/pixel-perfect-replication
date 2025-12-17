// ============================================
// COMPLIANCE TYPES - 8 Professional Proposals
// ============================================

import { TipoLavorazione, generateId } from './workhub';

// ============================================
// 1. GDPR & Privacy by Design
// ============================================
export interface ConsensoGDPR {
  id: string;
  entityType: 'lavoratore' | 'impresa';
  entityId: string;
  tipoConsenso: 'trattamento_dati' | 'comunicazione_terzi' | 'marketing' | 'profilazione';
  acconsentito: boolean;
  dataConsenso: string;
  dataRevoca?: string;
  ipAddress?: string;
  userAgent?: string;
  note?: string;
}

export interface RegistroTrattamento {
  id: string;
  finalita: string;
  categorieDati: string[];
  baseGiuridica: string;
  destinatari: string[];
  trasferimentoEstero: boolean;
  termineCancellazione: string;
  misureSicurezza: string[];
  responsabileTitolare: string;
  dataCreazione: string;
  dataUltimaModifica: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout';
  entityType: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

export interface RichiestaPortabilita {
  id: string;
  richiedenteId: string;
  richiedenteTipo: 'lavoratore' | 'impresa';
  richiedenteNome: string;
  dataRichiesta: string;
  dataEvasione?: string;
  stato: 'ricevuta' | 'in_elaborazione' | 'completata' | 'rifiutata';
  formatoExport: 'json' | 'csv' | 'pdf';
  note?: string;
}

// ============================================
// 2. BIM Standard ISO 19650
// ============================================
export interface ModelloBIM {
  id: string;
  cantiereId: string;
  nome: string;
  versione: string;
  formatoFile: 'ifc' | 'rvt' | 'nwd' | 'dwg';
  fileUrl: string;
  fileSize: number;
  lod: 'LOD100' | 'LOD200' | 'LOD300' | 'LOD350' | 'LOD400' | 'LOD500';
  disciplina: 'architettonico' | 'strutturale' | 'mep' | 'coordinato';
  dataCaricamento: string;
  caricatoDa: string;
  note?: string;
}

export interface ElementoBIM {
  id: string;
  modelloId: string;
  globalId: string;
  nome: string;
  categoria: string;
  piano: string;
  zona?: string;
  taskCollegate: string[];
  documentiCollegati: string[];
  proprieta: Record<string, any>;
}

export interface ClashDetection {
  id: string;
  cantiereId: string;
  modelloId: string;
  tipoClash: 'hard' | 'soft' | 'clearance';
  elemento1Id: string;
  elemento2Id: string;
  descrizione: string;
  stato: 'nuovo' | 'in_revisione' | 'risolto' | 'ignorato';
  priorita: 'bassa' | 'media' | 'alta' | 'critica';
  assegnatoA?: string;
  dataRilevamento: string;
  dataRisoluzione?: string;
  screenshot?: string;
}

export interface CDEDocument {
  id: string;
  cantiereId: string;
  nome: string;
  categoria: 'WIP' | 'Shared' | 'Published' | 'Archived';
  revisione: string;
  stato: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
  disciplina: string;
  fileUrl: string;
  dataUpload: string;
  uploadatoDa: string;
  approvazioni: { userId: string; userName: string; data: string; esito: 'approvato' | 'rifiutato' | 'con_commenti'; note?: string }[];
}

// ============================================
// 3. D.Lgs 81/2008 - Sicurezza Cantieri
// ============================================
export interface POSDigitale {
  id: string;
  cantiereId: string;
  impresaId: string;
  versione: string;
  dataEmissione: string;
  dataApprovazione?: string;
  firmaDigitale?: {
    firmatario: string;
    timestamp: string;
    certificato: string;
  };
  stato: 'bozza' | 'inviato' | 'approvato' | 'rifiutato' | 'da_aggiornare';
  allegatiUrl: string[];
  rischioGenerico: string[];
  rischioSpecifico: string[];
  misurePrevenzione: string[];
  dpiRichiesti: string[];
}

export interface DUVRI {
  id: string;
  cantiereId: string;
  impreseInterferenti: string[];
  dataRedazione: string;
  dataAggiornamento?: string;
  rischInterferenza: {
    descrizione: string;
    impreseCoinvolte: string[];
    misurePreviste: string[];
    responsabile: string;
  }[];
  costiSicurezza: number;
  firme: { impresaId: string; firmatario: string; data: string }[];
  stato: 'bozza' | 'in_firma' | 'approvato';
}

export interface RegistroInfortuni {
  id: string;
  cantiereId?: string;
  impresaId?: string;
  lavoratoreId: string;
  lavoratoreNome: string;
  dataInfortunio: string;
  oraInfortunio: string;
  luogo: string;
  descrizioneEvento: string;
  natureLesioni: string;
  sedeLesioni: string;
  giorniPrognosi: number;
  giorniAssenza: number;
  denunciaINAIL?: {
    numero: string;
    data: string;
    esito?: string;
  };
  testimoni: string[];
  misureCorrettive: string[];
  allegatiUrl: string[];
}

export interface ScadenzarioVisiteMediche {
  id: string;
  lavoratoreId: string;
  lavoratoreNome: string;
  tipoVisita: 'preventiva' | 'periodica' | 'cambio_mansione' | 'richiesta_lavoratore' | 'dopo_assenza';
  dataVisita: string;
  dataScadenza: string;
  medicoCompetente: string;
  idoneitaGiudizio: 'idoneo' | 'idoneo_con_prescrizioni' | 'idoneo_con_limitazioni' | 'non_idoneo_temporaneo' | 'non_idoneo_permanente';
  prescrizioni?: string;
  limitazioni?: string;
  note?: string;
}

// ============================================
// 4. ISO 9001:2015 - Sistema Qualità
// ============================================
export interface NonConformita {
  id: string;
  codice: string;
  cantiereId?: string;
  impresaId?: string;
  origine: 'interna' | 'cliente' | 'fornitore' | 'audit';
  tipoNC: 'prodotto' | 'processo' | 'servizio' | 'sistema';
  descrizione: string;
  rilevatore: string;
  dataRilevamento: string;
  gravita: 'minore' | 'maggiore' | 'critica';
  stato: 'aperta' | 'in_analisi' | 'in_trattamento' | 'chiusa' | 'verificata';
  azioneCorrettiva?: string;
  responsabileTrattamento?: string;
  dataChiusura?: string;
  verificaEfficacia?: {
    data: string;
    esito: 'positivo' | 'negativo';
    verificatore: string;
    note?: string;
  };
  allegatiUrl: string[];
}

export interface CAPA {
  id: string;
  nonConformitaId?: string;
  tipo: 'correttiva' | 'preventiva';
  codice: string;
  descrizioneProblema: string;
  analisicausaRadice: string;
  azioniPreviste: {
    descrizione: string;
    responsabile: string;
    dataScadenza: string;
    stato: 'pianificata' | 'in_corso' | 'completata';
    dataCompletamento?: string;
  }[];
  dataApertura: string;
  dataChiusura?: string;
  stato: 'aperta' | 'in_corso' | 'chiusa' | 'verificata';
  efficacia?: {
    verificata: boolean;
    data?: string;
    esito?: 'efficace' | 'non_efficace' | 'parzialmente_efficace';
    note?: string;
  };
}

export interface AuditInterno {
  id: string;
  codice: string;
  tipoAudit: 'sistema' | 'processo' | 'prodotto' | 'cantiere';
  areaAuditata: string;
  cantiereId?: string;
  auditorLead: string;
  teamAudit: string[];
  dataAudit: string;
  durataOre: number;
  checklist: {
    requisito: string;
    conforme: boolean | null;
    evidenza?: string;
    nota?: string;
  }[];
  findings: {
    tipo: 'osservazione' | 'nc_minore' | 'nc_maggiore' | 'opportunita_miglioramento';
    descrizione: string;
    riferimentoNorma?: string;
  }[];
  conclusioni: string;
  stato: 'pianificato' | 'in_corso' | 'completato' | 'report_emesso';
  reportUrl?: string;
}

export interface DocumentoControllato {
  id: string;
  codice: string;
  titolo: string;
  tipo: 'procedura' | 'istruzione' | 'modulo' | 'manuale' | 'specifica';
  revisione: string;
  dataEmissione: string;
  dataRevisione?: string;
  redattore: string;
  verificatore: string;
  approvatore: string;
  stato: 'bozza' | 'in_verifica' | 'in_approvazione' | 'vigente' | 'obsoleto';
  fileUrl: string;
  distribuzioneControlata: boolean;
  elencoDistribuzione: string[];
}

// ============================================
// 5. Fatturazione Elettronica SDI
// ============================================
export interface FatturaElettronica {
  id: string;
  numero: string;
  dataEmissione: string;
  tipoDocumento: 'TD01' | 'TD02' | 'TD04' | 'TD05' | 'TD06' | 'TD24' | 'TD25';
  cedentePrestatoreId: string;
  cessionarioCommittenteId: string;
  cantiereId?: string;
  salId?: string;
  importoImponibile: number;
  aliquotaIVA: number;
  importoIVA: number;
  importoTotale: number;
  condizionePagamento: 'TP01' | 'TP02' | 'TP03';
  modalitaPagamento: 'MP01' | 'MP02' | 'MP05' | 'MP08';
  scadenzaPagamento: string;
  stato: 'bozza' | 'generata' | 'inviata' | 'consegnata' | 'accettata' | 'rifiutata' | 'scartata';
  xmlContent?: string;
  identificativoSDI?: string;
  dataInvio?: string;
  dataNotifica?: string;
  notificaEsito?: {
    tipo: 'RC' | 'NS' | 'MC' | 'NE' | 'DT' | 'AT';
    descrizione: string;
    dataRicezione: string;
  };
}

export interface ConservazioneDigitale {
  id: string;
  fatturaId: string;
  dataConservazione: string;
  hashDocumento: string;
  marcaTemporale: string;
  firmaDigitale: string;
  formatoConservazione: 'XML' | 'PDF/A';
  periodoConservazione: number; // anni
  dataScadenzaConservazione: string;
  responsabileConservazione: string;
}

// ============================================
// 6. Business Intelligence & Reporting
// ============================================
export interface KPIFinanziario {
  id: string;
  cantiereId?: string;
  periodo: string; // YYYY-MM
  ricaviPrevisti: number;
  ricaviEffettivi: number;
  costiPrevisti: number;
  costiEffettivi: number;
  margine: number;
  marginePrevisto: number;
  cashFlowOperativo: number;
  dso: number; // Days Sales Outstanding
  wip: number; // Work in Progress
}

export interface ReportSchedulato {
  id: string;
  nome: string;
  descrizione: string;
  tipoReport: 'finanziario' | 'operativo' | 'hse' | 'qualita' | 'executive';
  templateId: string;
  filtri: Record<string, any>;
  formato: 'pdf' | 'excel' | 'csv';
  frequenza: 'giornaliero' | 'settimanale' | 'mensile' | 'trimestrale';
  destinatari: string[];
  prossimaEsecuzione: string;
  ultimaEsecuzione?: string;
  attivo: boolean;
}

export interface AnalisiPredittiva {
  id: string;
  cantiereId: string;
  dataAnalisi: string;
  tipoPrevisione: 'ritardo' | 'sovracosto' | 'rischio_sicurezza' | 'qualita';
  probabilita: number;
  impatto: 'basso' | 'medio' | 'alto' | 'critico';
  fattoriRischio: string[];
  raccomandazioni: string[];
  azioniMitigazione: string[];
}

// ============================================
// 7. Contabilità Industriale
// ============================================
export interface CentroCosto {
  id: string;
  codice: string;
  nome: string;
  tipo: 'commessa' | 'cantiere' | 'overhead' | 'struttura';
  cantiereId?: string;
  responsabile: string;
  budgetAnnuale: number;
  budgetResiduo: number;
  attivo: boolean;
}

export interface MovimentoCosto {
  id: string;
  centroCostoId: string;
  data: string;
  descrizione: string;
  categoria: 'materiali' | 'manodopera' | 'attrezzature' | 'subappalti' | 'servizi' | 'altro';
  importo: number;
  tipoMovimento: 'budget' | 'impegno' | 'consuntivo';
  documentoRiferimento?: string;
  fornitoreId?: string;
}

export interface WBS {
  id: string;
  cantiereId: string;
  codice: string;
  nome: string;
  livello: number;
  parentId?: string;
  budgetPrevisto: number;
  costoEffettivo: number;
  percentualeAvanzamento: number;
  dataInizio?: string;
  dataFine?: string;
  responsabile?: string;
}

export interface AnalisiMarginalita {
  id: string;
  cantiereId: string;
  periodo: string;
  ricaviContrattuali: number;
  ricaviVarianti: number;
  ricaviTotali: number;
  costiDiretti: number;
  costiIndiretti: number;
  costiTotali: number;
  margineOperativo: number;
  marginePercentuale: number;
  eac: number; // Estimate at Completion
  etc: number; // Estimate to Complete
  varianceAtCompletion: number;
}

// ============================================
// 8. Certificazioni Ambientali ISO 14001/EMAS
// ============================================
export interface RegistroRifiuti {
  id: string;
  cantiereId: string;
  dataRegistrazione: string;
  codiceCER: string;
  descrizioneRifiuto: string;
  statoFisico: 'solido' | 'liquido' | 'fangoso' | 'polvere';
  caratteristichePericolo: string[];
  quantitaKg: number;
  destinazione: 'recupero' | 'smaltimento';
  trasportatoreId: string;
  trasportatoreRagioneSociale: string;
  destinatarioId: string;
  destinatarioRagioneSociale: string;
  firNumero: string;
  firData: string;
  mudInviato: boolean;
}

export interface FIR {
  id: string;
  numero: string;
  data: string;
  registroRifiutiId: string;
  produttoreRagioneSociale: string;
  produttoreCF: string;
  trasportatoreRagioneSociale: string;
  trasportatoreAlboNumero: string;
  destinatarioRagioneSociale: string;
  destinatarioAutorizzazione: string;
  codiceCER: string;
  quantitaKg: number;
  stato: 'emesso' | 'in_transito' | 'consegnato' | 'confermato';
  dataConferimento?: string;
  allegatiUrl: string[];
}

export interface CarbonFootprint {
  id: string;
  cantiereId: string;
  periodo: string;
  scope1: number; // Emissioni dirette (combustibili, veicoli)
  scope2: number; // Emissioni indirette (energia elettrica)
  scope3: number; // Altre emissioni indirette
  totaleEmissioni: number;
  unitaMisura: 'tCO2e';
  dettaglioScope1: {
    fonte: string;
    quantita: number;
    fattoreEmissione: number;
    emissioni: number;
  }[];
  dettaglioScope2: {
    fonte: string;
    consumo: number;
    fattoreEmissione: number;
    emissioni: number;
  }[];
  azioniRiduzione: string[];
  target: number;
  dataCalcolo: string;
}

export interface ChecklistAmbientale {
  id: string;
  cantiereId: string;
  dataCompilazione: string;
  compilatore: string;
  voci: {
    categoria: 'rifiuti' | 'emissioni' | 'rumore' | 'polveri' | 'acque' | 'suolo';
    descrizione: string;
    conforme: boolean | null;
    evidenza?: string;
    azioneCorrettiva?: string;
  }[];
  esito: 'conforme' | 'non_conforme' | 'con_osservazioni';
  firmaResponsabile?: string;
  allegatiUrl: string[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const generateComplianceId = () => generateId();

export const TIPO_DOCUMENTO_FATTURA: Record<string, string> = {
  TD01: 'Fattura',
  TD02: 'Acconto/Anticipo su fattura',
  TD04: 'Nota di credito',
  TD05: 'Nota di debito',
  TD06: 'Parcella',
  TD24: 'Fattura differita',
  TD25: 'Fattura differita art. 21'
};

export const MODALITA_PAGAMENTO: Record<string, string> = {
  MP01: 'Contanti',
  MP02: 'Assegno',
  MP05: 'Bonifico',
  MP08: 'Carta di pagamento'
};

export const STATO_FATTURA_COLORS: Record<string, string> = {
  bozza: 'bg-gray-500/20 text-gray-500',
  generata: 'bg-blue-500/20 text-blue-500',
  inviata: 'bg-amber-500/20 text-amber-500',
  consegnata: 'bg-cyan-500/20 text-cyan-500',
  accettata: 'bg-emerald-500/20 text-emerald-500',
  rifiutata: 'bg-red-500/20 text-red-500',
  scartata: 'bg-red-600/20 text-red-600'
};

export const LOD_DESCRIPTIONS: Record<string, string> = {
  LOD100: 'Concept Design - Volume/forma approssimativa',
  LOD200: 'Schematic Design - Dimensioni e posizione generale',
  LOD300: 'Detailed Design - Dimensioni, forma, posizione precise',
  LOD350: 'Construction Documentation - Interfacce con altri sistemi',
  LOD400: 'Fabrication - Dettagli per la fabbricazione',
  LOD500: 'As-Built - Rappresentazione verificata'
};

export const CER_COMUNI_EDILIZIA: { codice: string; descrizione: string }[] = [
  { codice: '17 01 01', descrizione: 'Cemento' },
  { codice: '17 01 02', descrizione: 'Mattoni' },
  { codice: '17 01 03', descrizione: 'Mattonelle e ceramiche' },
  { codice: '17 01 07', descrizione: 'Miscugli di cemento, mattoni, mattonelle' },
  { codice: '17 02 01', descrizione: 'Legno' },
  { codice: '17 02 02', descrizione: 'Vetro' },
  { codice: '17 02 03', descrizione: 'Plastica' },
  { codice: '17 03 02', descrizione: 'Miscele bituminose' },
  { codice: '17 04 05', descrizione: 'Ferro e acciaio' },
  { codice: '17 04 07', descrizione: 'Metalli misti' },
  { codice: '17 05 04', descrizione: 'Terra e rocce' },
  { codice: '17 06 04', descrizione: 'Materiali isolanti' },
  { codice: '17 08 02', descrizione: 'Materiali da costruzione a base di gesso' },
  { codice: '17 09 04', descrizione: 'Rifiuti misti da costruzione' }
];
