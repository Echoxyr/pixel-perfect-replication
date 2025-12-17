import {
  Task,
  Cantiere,
  Impresa,
  Lavoratore,
  Documento,
  Formazione,
  DPI,
  generateId
} from '@/types/workhub';

// Sample Cantieri - Solo UNIPD
export const sampleCantieri: Cantiere[] = [
  {
    id: 'cant-001',
    nome: 'UNIPD - Nuovo Polo Scientifico',
    codiceCommessa: '2550_25',
    indirizzo: 'Via Marzolo 9, Padova',
    committente: 'Universita degli Studi di Padova',
    direttoreLavori: 'Ing. Marco Rossi',
    cse: 'Ing. Laura Bianchi',
    csp: 'Ing. Laura Bianchi',
    rup: 'Dott. Giovanni Verdi',
    rsppAffidataria: 'Ing. Paolo Neri',
    prepostoCantiere: 'Sig. Antonio Gialli',
    dataApertura: '2025-01-15',
    dataChiusuraPrevista: '2026-06-30',
    stato: 'attivo',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Imprese - Solo quelle del cantiere UNIPD
export const sampleImprese: Impresa[] = [
  {
    id: 'imp-001',
    ragioneSociale: 'Ediltech S.r.l.',
    partitaIva: '03456789012',
    codiceFiscale: '03456789012',
    sedeLegale: 'Via Roma 45, Milano',
    sedeOperativa: 'Via Industriale 12, Monza',
    referenteNome: 'Mario Bianchi',
    referenteRuolo: 'Direttore Tecnico',
    referenteTelefono: '+39 02 1234567',
    referenteEmail: 'mbianchi@ediltech.it',
    ccnlApplicato: 'CCNL Edilizia',
    tipo: 'subappaltatore',
    lavorazioniPrincipali: ['Strutture', 'Finiture', 'Cartongesso'],
    cantieriIds: ['cant-001'],
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'imp-002',
    ragioneSociale: 'Termoidraulica Veneto S.p.A.',
    partitaIva: '04567890123',
    codiceFiscale: '04567890123',
    sedeLegale: 'Via dell\'Artigianato 8, Treviso',
    referenteNome: 'Giuseppe Rossi',
    referenteRuolo: 'Responsabile Cantieri',
    referenteTelefono: '+39 0422 987654',
    referenteEmail: 'grossi@termoidraulica.it',
    ccnlApplicato: 'CCNL Metalmeccanici',
    tipo: 'subappaltatore',
    lavorazioniPrincipali: ['Impianti idraulici', 'Riscaldamento', 'Climatizzazione'],
    cantieriIds: ['cant-001'],
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'imp-003',
    ragioneSociale: 'Elettroservice di Neri Paolo',
    partitaIva: '05678901234',
    sedeLegale: 'Via Garibaldi 22, Padova',
    referenteNome: 'Paolo Neri',
    referenteRuolo: 'Titolare',
    referenteTelefono: '+39 049 876543',
    referenteEmail: 'pneri@elettroservice.it',
    ccnlApplicato: 'CCNL Artigiani',
    tipo: 'autonomo',
    lavorazioniPrincipali: ['Impianti elettrici', 'Domotica'],
    cantieriIds: ['cant-001'],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Lavoratori - Solo quelli del cantiere UNIPD
export const sampleLavoratori: Lavoratore[] = [
  {
    id: 'lav-001',
    nome: 'Marco',
    cognome: 'Verdi',
    codiceFiscale: 'VRDMRC85A01A001A',
    dataNascita: '1985-01-01',
    impresaId: 'imp-001',
    tipo: 'dipendente',
    mansione: 'Muratore specializzato',
    qualifica: 'Operaio 4 livello',
    cantieriIds: ['cant-001'],
    medicoCompetente: 'Dr. Luigi Medici',
    dataVisitaMedica: '2025-06-15',
    giudizioIdoneita: 'idoneo',
    dataScadenzaIdoneita: '2026-06-15',
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lav-002',
    nome: 'Luca',
    cognome: 'Bianchi',
    codiceFiscale: 'BNCLCU90B02B002B',
    dataNascita: '1990-02-02',
    impresaId: 'imp-001',
    tipo: 'dipendente',
    mansione: 'Carpentiere',
    qualifica: 'Operaio 3 livello',
    cantieriIds: ['cant-001'],
    medicoCompetente: 'Dr. Luigi Medici',
    dataVisitaMedica: '2025-03-10',
    giudizioIdoneita: 'idoneo',
    dataScadenzaIdoneita: '2026-03-10',
    createdAt: new Date(Date.now() - 86400000 * 80).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lav-003',
    nome: 'Giovanni',
    cognome: 'Rossi',
    codiceFiscale: 'RSSGVN88C03C003C',
    dataNascita: '1988-03-03',
    impresaId: 'imp-002',
    tipo: 'dipendente',
    mansione: 'Idraulico',
    qualifica: 'Tecnico specializzato',
    cantieriIds: ['cant-001'],
    medicoCompetente: 'Dr. Anna Salute',
    dataVisitaMedica: '2025-01-20',
    giudizioIdoneita: 'idoneo_limitazioni',
    dataScadenzaIdoneita: '2025-07-20',
    createdAt: new Date(Date.now() - 86400000 * 70).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lav-004',
    nome: 'Paolo',
    cognome: 'Neri',
    codiceFiscale: 'NREPLA75D04D004D',
    dataNascita: '1975-04-04',
    impresaId: 'imp-003',
    tipo: 'autonomo',
    mansione: 'Elettricista',
    qualifica: 'Artigiano titolare',
    cantieriIds: ['cant-001'],
    medicoCompetente: 'Dr. Marco Controllo',
    dataVisitaMedica: '2024-11-15',
    giudizioIdoneita: 'idoneo',
    dataScadenzaIdoneita: '2025-11-15',
    createdAt: new Date(Date.now() - 86400000 * 100).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Documenti - Solo cantiere UNIPD
export const sampleDocumenti: Documento[] = [
  {
    id: 'doc-001',
    tipo: 'DURC',
    nome: 'DURC Ediltech',
    impresaId: 'imp-001',
    dataEmissione: '2025-09-01',
    dataScadenza: '2026-01-01',
    stato: 'approvato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-002',
    tipo: 'Visura camerale',
    nome: 'Visura CCIAA Ediltech',
    impresaId: 'imp-001',
    dataEmissione: '2025-10-15',
    dataScadenza: '2026-04-15',
    stato: 'approvato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-003',
    tipo: 'Polizza RCT/RCO',
    nome: 'Polizza assicurativa Ediltech',
    impresaId: 'imp-001',
    dataEmissione: '2025-01-01',
    dataScadenza: '2025-12-31',
    stato: 'in_scadenza',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-004',
    tipo: 'POS (Piano Operativo di Sicurezza)',
    nome: 'POS Cantiere UNIPD',
    impresaId: 'imp-001',
    cantiereId: 'cant-001',
    dataEmissione: '2025-01-10',
    stato: 'approvato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-005',
    tipo: 'DURC',
    nome: 'DURC Termoidraulica',
    impresaId: 'imp-002',
    dataEmissione: '2025-06-01',
    dataScadenza: '2025-10-01',
    stato: 'scaduto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-006',
    tipo: 'DVR (Documento Valutazione Rischi)',
    nome: 'DVR Termoidraulica',
    impresaId: 'imp-002',
    dataEmissione: '2024-03-01',
    stato: 'approvato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-007',
    tipo: 'PSC (Piano Sicurezza Coordinamento)',
    nome: 'PSC Cantiere UNIPD',
    cantiereId: 'cant-001',
    dataEmissione: '2025-01-10',
    stato: 'approvato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-008',
    tipo: 'Notifica preliminare',
    nome: 'Notifica ASL Cantiere UNIPD',
    cantiereId: 'cant-001',
    dataEmissione: '2025-01-05',
    stato: 'approvato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Formazioni - Solo lavoratori UNIPD
export const sampleFormazioni: Formazione[] = [
  {
    id: 'form-001',
    lavoratoreId: 'lav-001',
    tipoCorso: 'Formazione generale 4h',
    categoria: 'sicurezza_generale',
    dataCorso: '2023-05-15',
    durataOre: 4,
    dataScadenza: '2028-05-15',
    esito: 'Superato',
    stato: 'fatto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'form-002',
    lavoratoreId: 'lav-001',
    tipoCorso: 'Formazione specifica rischio alto 12h',
    categoria: 'sicurezza_specifica',
    dataCorso: '2023-05-20',
    durataOre: 12,
    dataScadenza: '2028-05-20',
    esito: 'Superato',
    stato: 'fatto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'form-003',
    lavoratoreId: 'lav-001',
    tipoCorso: 'Lavori in quota',
    categoria: 'altro',
    dataCorso: '2024-02-10',
    durataOre: 8,
    dataScadenza: '2029-02-10',
    esito: 'Superato',
    stato: 'fatto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'form-004',
    lavoratoreId: 'lav-002',
    tipoCorso: 'Formazione generale 4h',
    categoria: 'sicurezza_generale',
    dataCorso: '2022-03-10',
    durataOre: 4,
    dataScadenza: '2027-03-10',
    stato: 'fatto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'form-005',
    lavoratoreId: 'lav-003',
    tipoCorso: 'Addetto antincendio rischio medio',
    categoria: 'emergenza',
    dataCorso: '2023-09-01',
    durataOre: 8,
    dataScadenza: '2025-09-01',
    stato: 'in_scadenza',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'form-006',
    lavoratoreId: 'lav-004',
    tipoCorso: 'PES PAV PEI',
    categoria: 'altro',
    dataCorso: '2020-06-01',
    durataOre: 16,
    dataScadenza: '2025-06-01',
    stato: 'scaduto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample DPI - Solo lavoratori UNIPD
export const sampleDPI: DPI[] = [
  {
    id: 'dpi-001',
    lavoratoreId: 'lav-001',
    tipo: 'Casco',
    dataConsegna: '2025-01-15',
    stato: 'consegnato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dpi-002',
    lavoratoreId: 'lav-001',
    tipo: 'Scarpe antinfortunistiche',
    dataConsegna: '2025-01-15',
    stato: 'consegnato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dpi-003',
    lavoratoreId: 'lav-001',
    tipo: 'Imbracatura anticaduta',
    dataConsegna: '2024-06-01',
    stato: 'da_sostituire',
    note: 'Verificare stato cinghie',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dpi-004',
    lavoratoreId: 'lav-002',
    tipo: 'Casco',
    dataConsegna: '2025-02-01',
    stato: 'consegnato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dpi-005',
    lavoratoreId: 'lav-003',
    tipo: 'Guanti',
    dataConsegna: '2025-08-01',
    stato: 'consegnato',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Tasks - Solo cantiere UNIPD
export const sampleTasks: Task[] = [
  {
    id: generateId(),
    title: 'SAM TUBO ANTINCENDIO',
    description: 'Preparazione schema tubazioni antincendio per edificio A',
    cantiereId: 'cant-001',
    impresaId: 'imp-002',
    status: 'in_corso',
    priority: 'alta',
    startDate: '2025-11-25',
    dueDate: '2025-12-05',
    note: 'Attendere conferma materiali',
    updates: [
      { id: generateId(), text: 'Richiesta conferma a fornitore', createdAt: new Date().toISOString() }
    ],
    fileInfo: '2 PDF schema',
    check: false,
    tags: ['urgente', 'SAM'],
    subtasks: [
      { id: generateId(), title: 'Verifica misure', done: true },
      { id: generateId(), title: 'Ordine materiali', done: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    title: 'FARE SAM RADIATORE ALLUMINIO ASSE 800 MM',
    cantiereId: 'cant-001',
    impresaId: 'imp-002',
    status: 'da_iniziare',
    priority: 'media',
    startDate: '2025-12-01',
    dueDate: '2025-12-10',
    updates: [],
    check: false,
    tags: ['SAM'],
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: generateId(),
    title: 'OFFERTA IRSAP',
    cantiereId: 'cant-001',
    status: 'fatto',
    priority: 'bassa',
    startDate: '2025-11-20',
    dueDate: '2025-11-28',
    note: 'Offerta inviata',
    updates: [
      { id: generateId(), text: 'Offerta approvata dal cliente', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ],
    fileInfo: '1 PDF offerta',
    fileLink: 'https://drive.google.com',
    check: true,
    tags: ['offerta'],
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: generateId(),
    title: 'Verifica documenti imprese subappalto',
    cantiereId: 'cant-001',
    status: 'in_corso',
    priority: 'alta',
    dueDate: '2025-12-01',
    updates: [],
    check: false,
    tags: ['sicurezza', 'documenti'],
    subtasks: [
      { id: generateId(), title: 'Ediltech S.r.l.', done: true },
      { id: generateId(), title: 'Termoidraulica Veneto', done: false },
      { id: generateId(), title: 'Elettroservice', done: false }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];
