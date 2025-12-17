// ============================================
// WorkHub Type Definitions
// Comprehensive types for project, construction site, 
// subcontractor, and safety management
// ============================================

// === DATI AZIENDA ===

export interface DatiAzienda {
  // Dati Azienda
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscaleAzienda: string;
  iscrizioneREA: string;
  sedeLegale: string;
  cap: string;
  citta: string;
  provincia: string;
  pec: string;
  email: string;
  telefono: string;
  
  // Dati Titolare/Legale Rappresentante
  nomeTitolare: string;
  cognomeTitolare: string;
  codiceFiscaleTitolare: string;
  dataNascitaTitolare: string;
  luogoNascitaTitolare: string;
  provinciaNascitaTitolare: string;
  residenzaTitolare: string;
  ciTitolare: string; // Carta d'identità
  cellulareTitolare: string;
  
  // Carta Intestata e Timbro
  cartaIntestataHeader?: string; // Base64 o URL immagine
  cartaIntestataFooter?: string; // Base64 o URL immagine
  timbro?: string; // Base64 o URL immagine
  timbroPositionX?: number; // Posizione X in %
  timbroPositionY?: number; // Posizione Y in %
}

// === ENUMS ===

export type TaskStatus = 'da_iniziare' | 'in_corso' | 'in_attesa' | 'bloccato' | 'fatto';
export type TaskPriority = 'nessuna' | 'bassa' | 'media' | 'alta' | 'critica' | 'urgente';
export type DocumentStatus = 'da_richiedere' | 'in_verifica' | 'approvato' | 'in_scadenza' | 'scaduto';
export type TipoImpresa = 'subappaltatore' | 'distacco' | 'autonomo' | 'nolo_caldo' | 'consorzio';
export type TipoLavoratore = 'dipendente' | 'distaccato' | 'autonomo' | 'socio_lavoratore' | 'amministratore';
export type StatoFormazione = 'da_fare' | 'programmato' | 'fatto' | 'in_scadenza' | 'scaduto';
export type GiudizioIdoneita = 'idoneo' | 'idoneo_limitazioni' | 'non_idoneo' | 'in_attesa';

// SAL Types
export type TipoLavorazione = 'elettrico' | 'meccanico' | 'idraulico' | 'edile' | 'impiantistico' | 'finiture' | 'altro';
export type StatoSAL = 'in_preparazione' | 'presentato' | 'approvato' | 'pagato' | 'contestato';

// === LABELS & COLORS ===

export const STATUS_LABELS: Record<TaskStatus, string> = {
  da_iniziare: 'Da iniziare',
  in_corso: 'In corso',
  in_attesa: 'In attesa',
  bloccato: 'Bloccato',
  fatto: 'Completato'
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  nessuna: 'Nessuna',
  bassa: 'Bassa',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
  urgente: 'Urgente'
};

export const DOC_STATUS_LABELS: Record<DocumentStatus, string> = {
  da_richiedere: 'Da richiedere',
  in_verifica: 'In verifica',
  approvato: 'Approvato',
  in_scadenza: 'In scadenza',
  scaduto: 'Scaduto'
};

export const TIPO_IMPRESA_LABELS: Record<TipoImpresa, string> = {
  subappaltatore: 'Subappaltatore',
  distacco: 'Distacco',
  autonomo: 'Lavoratore autonomo',
  nolo_caldo: 'Nolo a caldo',
  consorzio: 'Consorzio'
};

export const TIPO_LAVORATORE_LABELS: Record<TipoLavoratore, string> = {
  dipendente: 'Dipendente',
  distaccato: 'Distaccato',
  autonomo: 'Autonomo',
  socio_lavoratore: 'Socio lavoratore',
  amministratore: 'Amministratore'
};

export const TIPO_LAVORAZIONE_LABELS: Record<TipoLavorazione, string> = {
  elettrico: 'Impianti Elettrici',
  meccanico: 'Impianti Meccanici',
  idraulico: 'Impianti Idraulici',
  edile: 'Opere Edili',
  impiantistico: 'Impiantistico Generale',
  finiture: 'Finiture',
  altro: 'Altro'
};

export const STATO_SAL_LABELS: Record<StatoSAL, string> = {
  in_preparazione: 'In preparazione',
  presentato: 'Presentato',
  approvato: 'Approvato',
  pagato: 'Pagato',
  contestato: 'Contestato'
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  da_iniziare: 'bg-gray-500',
  in_corso: 'bg-blue-500',
  in_attesa: 'bg-amber-500',
  bloccato: 'bg-red-500',
  fatto: 'bg-emerald-500'
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  nessuna: 'bg-gray-400',
  bassa: 'bg-teal-500',
  media: 'bg-yellow-500',
  alta: 'bg-orange-500',
  critica: 'bg-rose-500',
  urgente: 'bg-purple-500'
};

export const DOC_STATUS_COLORS: Record<DocumentStatus, string> = {
  da_richiedere: 'bg-gray-500',
  in_verifica: 'bg-blue-500',
  approvato: 'bg-emerald-500',
  in_scadenza: 'bg-amber-500',
  scaduto: 'bg-red-500'
};

export const STATO_SAL_COLORS: Record<StatoSAL, string> = {
  in_preparazione: 'bg-gray-500',
  presentato: 'bg-blue-500',
  approvato: 'bg-emerald-500',
  pagato: 'bg-green-600',
  contestato: 'bg-red-500'
};

// === INTERFACES ===

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
}

export interface TaskUpdate {
  id: string;
  text: string;
  createdAt: string;
  userId?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  parentId?: string; // For nested subtasks
  title: string;
  description?: string;
  cantiereId?: string;
  impresaId?: string;
  lavoratoreId?: string;
  assignedTeam?: string[];
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  note?: string;
  updates: TaskUpdate[];
  comments?: TaskComment[];
  fileInfo?: string;
  fileLink?: string;
  files?: FileAttachment[];
  check: boolean;
  tags: string[];
  subtasks: Subtask[];
  isFavorite?: boolean;
  color?: string; // Custom color
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cantiere {
  id: string;
  nome: string;
  codiceCommessa: string;
  indirizzo: string;
  committente: string;
  direttoreLavori?: string;
  cse?: string;
  csp?: string;
  rup?: string;
  rsppAffidataria?: string;
  prepostoCantiere?: string;
  dataApertura?: string;
  dataChiusuraPrevista?: string;
  dataChiusuraEffettiva?: string;
  stato: 'attivo' | 'sospeso' | 'chiuso';
  importoContratto?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Impresa {
  id: string;
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale?: string;
  sedeLegale: string;
  sedeOperativa?: string;
  referenteNome: string;
  referenteRuolo?: string;
  referenteTelefono?: string;
  referenteEmail?: string;
  ccnlApplicato?: string;
  tipo: TipoImpresa;
  lavorazioniPrincipali: string[];
  cantieriIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Documento {
  id: string;
  tipo: string;
  nome: string;
  impresaId?: string;
  cantiereId?: string;
  lavoratoreId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  dataEmissione?: string;
  dataScadenza?: string;
  stato: DocumentStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lavoratore {
  id: string;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  dataNascita?: string;
  impresaId: string;
  tipo: TipoLavoratore;
  mansione: string;
  qualifica?: string;
  cantieriIds: string[];
  medicoCompetente?: string;
  dataVisitaMedica?: string;
  giudizioIdoneita?: GiudizioIdoneita;
  dataScadenzaIdoneita?: string;
  certificatoIdoneita?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Formazione {
  id: string;
  lavoratoreId: string;
  tipoCorso: string;
  categoria: string;
  dataCorso?: string;
  durataOre?: number;
  dataScadenza?: string;
  esito?: string;
  certificatoUrl?: string;
  fileName?: string;
  stato: StatoFormazione;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DPI {
  id: string;
  lavoratoreId: string;
  tipo: string;
  dataConsegna: string;
  firmaRicevuta?: string;
  stato: 'consegnato' | 'da_sostituire' | 'scaduto';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// === SAL (Stato Avanzamento Lavori) ===

export interface VoceSAL {
  id: string;
  descrizione: string;
  unitaMisura: string;
  quantitaContrattuale: number;
  prezzoUnitario: number;
  quantitaEseguita: number;
  importoEseguito: number;
  percentualeAvanzamento: number;
}

export interface SAL {
  id: string;
  cantiereId: string;
  numeroSAL: number;
  mese: string; // YYYY-MM
  tipoLavorazione: TipoLavorazione;
  stato: StatoSAL;
  importoContratto: number;
  importoLavoriEseguiti: number;
  importoLavoriPrecedenti: number;
  importoLavoriPeriodo: number;
  percentualeAvanzamento: number;
  vociSAL: VoceSAL[];
  dataEmissione?: string;
  dataApprovazione?: string;
  dataPagamento?: string;
  note?: string;
  allegatiUrl?: string[];
  createdAt: string;
  updatedAt: string;
}

// === SAL PREVISIONE (Forecast) ===

export interface PrevisioneSAL {
  id: string;
  cantiereId: string;
  tipoLavorazione: TipoLavorazione;
  mese: string; // YYYY-MM
  importoPrevisto: number;
  percentualePrevista: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type StatoContratto = 'attivo' | 'sospeso' | 'completato' | 'annullato';

export const STATO_CONTRATTO_LABELS: Record<StatoContratto, string> = {
  attivo: 'Attivo',
  sospeso: 'Sospeso',
  completato: 'Completato',
  annullato: 'Annullato'
};

export interface ContrattoLavorazione {
  id: string;
  codiceContratto: string;
  cantiereId: string;
  impresaId: string;
  tipoLavorazione: TipoLavorazione;
  descrizione: string;
  importoContratto: number;
  importoVarianti: number;
  importoTotale: number;
  ritenute: number; // % ritenuta garanzia
  anticipi: number; // importo anticipo
  stato: StatoContratto;
  dataInizio?: string;
  dataFine?: string;
  percentualeAvanzamento: number;
  note?: string;
  allegatiUrl?: string[];
  createdAt: string;
  updatedAt: string;
}

// === PRESENZE ===

export interface Presenza {
  id: string;
  cantiereId: string;
  lavoratoreId: string;
  data: string; // YYYY-MM-DD
  oraIngresso?: string;
  oraUscita?: string;
  oreTotali?: number;
  straordinario?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// === TIPI DOCUMENTI PREDEFINITI ===

export const TIPI_DOCUMENTI_IMPRESA = [
  'DURC',
  'Visura camerale',
  'Polizza RCT/RCO',
  'Polizza assicurativa integrativa',
  'Dichiarazione idoneità tecnico-professionale',
  'POS (Piano Operativo di Sicurezza)',
  'DVR (Documento Valutazione Rischi)',
  'DUVRI',
  'Nomina Medico Competente',
  'Elenco attrezzature e macchinari',
  'Dichiarazioni CE macchinari',
  'Libretti macchinari',
  'Verifiche periodiche attrezzature',
  'Patente a Crediti',
  'Certificazione ISO 9001',
  'Certificazione ISO 14001',
  'Certificazione ISO 45001',
  'SOA',
  'Unilav (per distacco)',
  'Altro'
];

export const TIPI_DOCUMENTI_CANTIERE = [
  'PSC (Piano Sicurezza Coordinamento)',
  'PSS (Piano Sostitutivo di Sicurezza)',
  'POS Ditta Affidataria',
  'POS Subappaltatori',
  'Verbale coordinamento',
  'Verbale riunione periodica',
  'Verbale ispezione CSE',
  'Notifica preliminare',
  'Registro presenze',
  'Registro accessi',
  'Verbale infortunio',
  'Verbale near miss',
  'Non conformità',
  'Checklist sicurezza mensile',
  'Altro'
];

export const TIPI_DOCUMENTI_LAVORATORE = [
  'Carta identità',
  'Codice fiscale',
  'Permesso di soggiorno',
  'Certificato idoneità',
  'Unilav',
  'Attestato formazione',
  'Verbale consegna DPI',
  'Altro'
];

export const TIPI_FORMAZIONE = [
  { categoria: 'sicurezza_generale', nome: 'Formazione generale 4h', durataStandard: 4 },
  { categoria: 'sicurezza_specifica', nome: 'Formazione specifica rischio basso 4h', durataStandard: 4 },
  { categoria: 'sicurezza_specifica', nome: 'Formazione specifica rischio medio 8h', durataStandard: 8 },
  { categoria: 'sicurezza_specifica', nome: 'Formazione specifica rischio alto 12h', durataStandard: 12 },
  { categoria: 'sicurezza_aggiornamento', nome: 'Aggiornamento quinquennale 6h', durataStandard: 6 },
  { categoria: 'ruolo', nome: 'Preposto', durataStandard: 8 },
  { categoria: 'ruolo', nome: 'RSPP/ASPP', durataStandard: 0 },
  { categoria: 'ruolo', nome: 'RLS', durataStandard: 32 },
  { categoria: 'emergenza', nome: 'Addetto antincendio rischio basso', durataStandard: 4 },
  { categoria: 'emergenza', nome: 'Addetto antincendio rischio medio', durataStandard: 8 },
  { categoria: 'emergenza', nome: 'Addetto antincendio rischio elevato', durataStandard: 16 },
  { categoria: 'emergenza', nome: 'Primo soccorso gruppo A', durataStandard: 16 },
  { categoria: 'emergenza', nome: 'Primo soccorso gruppo B/C', durataStandard: 12 },
  { categoria: 'attrezzature', nome: 'Carrelli elevatori', durataStandard: 12 },
  { categoria: 'attrezzature', nome: 'PLE', durataStandard: 10 },
  { categoria: 'attrezzature', nome: 'Gru a torre', durataStandard: 14 },
  { categoria: 'attrezzature', nome: 'Gru mobile', durataStandard: 14 },
  { categoria: 'attrezzature', nome: 'Escavatori', durataStandard: 10 },
  { categoria: 'attrezzature', nome: 'Pale caricatrici', durataStandard: 10 },
  { categoria: 'attrezzature', nome: 'Terne', durataStandard: 10 },
  { categoria: 'altro', nome: 'Lavori in quota', durataStandard: 8 },
  { categoria: 'altro', nome: 'DPI III categoria (anticaduta)', durataStandard: 8 },
  { categoria: 'altro', nome: 'Ambienti confinati', durataStandard: 8 },
  { categoria: 'altro', nome: 'Saldatura', durataStandard: 0 },
];

export const TIPI_DPI = [
  'Casco',
  'Scarpe antinfortunistiche',
  'Guanti',
  'Occhiali protettivi',
  'Imbracatura anticaduta',
  'Cordino',
  'Otoprotettori',
  'Mascherina FFP2',
  'Mascherina FFP3',
  'Semimaschera',
  'Tuta protettiva',
  'Gilet alta visibilità',
  'Altro'
];

// === UTILITY TYPES ===

export interface TrafficLightStatus {
  color: 'green' | 'yellow' | 'red';
  documentiOk: number;
  documentiInScadenza: number;
  documentiScaduti: number;
  totaleDocumenti: number;
}

export interface HSEStats {
  impreseTotal: number;
  impreseOk: number;
  impreseWarning: number;
  impreseCritical: number;
  lavoratoriTotal: number;
  lavoratoriOk: number;
  lavoratoriWarning: number;
  lavoratoriCritical: number;
  documentiScaduti: number;
  documentiInScadenza: number;
  formazioniScadute: number;
  formazioniInScadenza: number;
  visiteMedicheScadute: number;
  visiteMedicheInScadenza: number;
}

// === HELPER FUNCTIONS ===

export const generateId = (): string => 
  Date.now().toString(36) + Math.random().toString(36).substr(2);

export const formatDate = (d?: string): string => 
  d ? new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : '-';

export const formatDateFull = (d?: string): string => 
  d ? new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

export const daysUntil = (date?: string): number | null => {
  if (!date) return null;
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getDocumentStatusFromDate = (dataScadenza?: string, thresholdDays = 30): DocumentStatus => {
  if (!dataScadenza) return 'da_richiedere';
  const days = daysUntil(dataScadenza);
  if (days === null) return 'da_richiedere';
  if (days < 0) return 'scaduto';
  if (days <= thresholdDays) return 'in_scadenza';
  return 'approvato';
};

export const calculateTrafficLight = (documenti: Documento[]): TrafficLightStatus => {
  const totale = documenti.length;
  const ok = documenti.filter(d => d.stato === 'approvato').length;
  const inScadenza = documenti.filter(d => d.stato === 'in_scadenza').length;
  const scaduti = documenti.filter(d => d.stato === 'scaduto' || d.stato === 'da_richiedere').length;

  let color: 'green' | 'yellow' | 'red' = 'green';
  if (scaduti > 0) color = 'red';
  else if (inScadenza > 0) color = 'yellow';

  return {
    color,
    documentiOk: ok,
    documentiInScadenza: inScadenza,
    documentiScaduti: scaduti,
    totaleDocumenti: totale
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
