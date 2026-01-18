// Tutorial step definitions for interactive guided tours

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for element to highlight
  route?: string; // Navigate to this route before showing step
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'type' | 'scroll' | 'hover' | 'wait';
  actionDelay?: number; // ms to wait before simulating action
  highlightPadding?: number;
  cursorOffset?: { x: number; y: number };
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  steps: TutorialStep[];
}

export const tutorials: Tutorial[] = [
  {
    id: 'create-commessa',
    title: 'Come Creare una Commessa',
    description: 'Guida passo-passo per creare e configurare una nuova commessa nel sistema',
    icon: 'Construction',
    estimatedTime: '3 minuti',
    steps: [
      {
        id: 'intro',
        title: 'Benvenuto! 👋',
        description: 'In questo tutorial imparerai come creare una nuova commessa in E-gest. Seguimi passo dopo passo!',
        position: 'center',
      },
      {
        id: 'nav-cantieri',
        title: 'Naviga verso Cantieri',
        description: 'Prima di tutto, clicca sulla voce "Cantieri" nel menu laterale per accedere alla gestione commesse.',
        targetSelector: '[data-tutorial="nav-cantieri"]',
        route: '/dashboard',
        position: 'right',
        action: 'click',
        actionDelay: 1500,
      },
      {
        id: 'cantieri-page',
        title: 'Pagina Cantieri',
        description: 'Questa è la pagina dove puoi vedere tutte le tue commesse attive, in corso e concluse.',
        route: '/cantieri',
        position: 'center',
      },
      {
        id: 'click-new',
        title: 'Crea Nuova Commessa',
        description: 'Clicca sul pulsante "Nuovo Cantiere" per aprire il modulo di creazione.',
        targetSelector: '[data-tutorial="btn-nuovo-cantiere"]',
        position: 'bottom',
        action: 'click',
        actionDelay: 1500,
      },
      {
        id: 'fill-form-intro',
        title: 'Compila i Dati',
        description: 'Ora compila il form con i dati della commessa. I campi obbligatori sono contrassegnati con *.',
        targetSelector: '[data-tutorial="form-cantiere"]',
        position: 'left',
        highlightPadding: 20,
      },
      {
        id: 'field-nome',
        title: 'Nome Commessa',
        description: 'Inserisci un nome descrittivo per la commessa, ad esempio "Ristrutturazione Villa Rossi".',
        targetSelector: '[data-tutorial="field-nome"]',
        position: 'right',
        action: 'hover',
      },
      {
        id: 'field-codice',
        title: 'Codice Commessa',
        description: 'Assegna un codice univoco alla commessa (es. "COM-2024-001"). Questo codice sarà usato in tutti i documenti.',
        targetSelector: '[data-tutorial="field-codice"]',
        position: 'right',
        action: 'hover',
      },
      {
        id: 'field-committente',
        title: 'Committente',
        description: 'Indica il nome del cliente o committente del lavoro.',
        targetSelector: '[data-tutorial="field-committente"]',
        position: 'right',
        action: 'hover',
      },
      {
        id: 'field-date',
        title: 'Date Inizio e Fine',
        description: 'Imposta la data di inizio lavori e la data prevista di fine. Queste date appariranno nel Gantt e nel calendario.',
        targetSelector: '[data-tutorial="field-date"]',
        position: 'right',
        action: 'hover',
      },
      {
        id: 'field-importo',
        title: 'Importo Contratto',
        description: 'Inserisci l\'importo totale del contratto. Questo valore sarà usato per calcolare SAL e avanzamento.',
        targetSelector: '[data-tutorial="field-importo"]',
        position: 'right',
        action: 'hover',
      },
      {
        id: 'save-form',
        title: 'Salva la Commessa',
        description: 'Quando hai completato tutti i campi, clicca su "Crea Cantiere" per salvare.',
        targetSelector: '[data-tutorial="btn-salva-cantiere"]',
        position: 'top',
        action: 'hover',
      },
      {
        id: 'complete',
        title: 'Complimenti! 🎉',
        description: 'Hai imparato a creare una nuova commessa! La troverai ora nell\'elenco e potrai aggiungere lavoratori, documenti e monitorare l\'avanzamento.',
        position: 'center',
      },
    ],
  },
  {
    id: 'hse-overview',
    title: 'Panoramica HSE & Sicurezza',
    description: 'Scopri come gestire la sicurezza, formazioni, DPI e visite mediche',
    icon: 'ShieldCheck',
    estimatedTime: '4 minuti',
    steps: [
      {
        id: 'intro',
        title: 'Modulo HSE',
        description: 'Il modulo HSE ti permette di gestire tutti gli aspetti della sicurezza sul lavoro secondo il D.Lgs 81/08.',
        position: 'center',
      },
      {
        id: 'nav-hse',
        title: 'Accedi a HSE',
        description: 'Clicca su "HSE Dashboard" nel menu Sicurezza & HSE.',
        targetSelector: '[data-tutorial="nav-hse"]',
        route: '/dashboard',
        position: 'right',
        action: 'click',
        actionDelay: 1500,
      },
      {
        id: 'hse-dashboard',
        title: 'Dashboard HSE',
        description: 'Qui vedi a colpo d\'occhio lo stato di conformità: documenti scaduti, formazioni in scadenza, visite mediche da rinnovare.',
        route: '/hse',
        position: 'center',
      },
      {
        id: 'nav-formazione',
        title: 'Gestione Formazione',
        description: 'Nella sezione Formazione puoi tracciare tutti i corsi di sicurezza dei lavoratori.',
        targetSelector: '[data-tutorial="nav-formazione"]',
        position: 'right',
        action: 'click',
        actionDelay: 1500,
      },
      {
        id: 'formazione-page',
        title: 'Elenco Formazioni',
        description: 'Qui vedi tutte le formazioni registrate. I colori indicano lo stato: verde = valido, giallo = in scadenza, rosso = scaduto.',
        route: '/formazione',
        position: 'center',
      },
      {
        id: 'nav-dpi',
        title: 'Gestione DPI',
        description: 'La sezione DPI traccia la consegna dei dispositivi di protezione individuale.',
        targetSelector: '[data-tutorial="nav-dpi"]',
        position: 'right',
        action: 'click',
        actionDelay: 1500,
      },
      {
        id: 'dpi-page',
        title: 'Registro DPI',
        description: 'Registra ogni consegna di DPI con data, tipo e firma del lavoratore. Tieni traccia delle scadenze.',
        route: '/dpi',
        position: 'center',
      },
      {
        id: 'complete',
        title: 'Ottimo lavoro! 🎉',
        description: 'Ora conosci le basi del modulo HSE. Esplora anche Sorveglianza Sanitaria e Check-in Sicurezza per una gestione completa.',
        position: 'center',
      },
    ],
  },
  {
    id: 'dashboard-tour',
    title: 'Tour della Dashboard',
    description: 'Scopri tutte le funzionalità della dashboard principale',
    icon: 'LayoutDashboard',
    estimatedTime: '2 minuti',
    steps: [
      {
        id: 'intro',
        title: 'La tua Dashboard',
        description: 'La Dashboard è il centro di controllo di E-gest. Da qui monitora tutto il tuo lavoro.',
        position: 'center',
        route: '/dashboard',
      },
      {
        id: 'stat-cards',
        title: 'Statistiche Rapide',
        description: 'Queste card mostrano i numeri chiave: commesse attive, task da completare, alert sicurezza.',
        targetSelector: '[data-tutorial="stat-cards"]',
        position: 'bottom',
      },
      {
        id: 'sidebar',
        title: 'Menu Laterale',
        description: 'Il menu laterale ti dà accesso a tutti i moduli. Puoi personalizzare quali voci visualizzare dalle Impostazioni.',
        targetSelector: '[data-tutorial="sidebar"]',
        position: 'right',
      },
      {
        id: 'search',
        title: 'Ricerca Globale',
        description: 'Premi Ctrl+K per aprire la ricerca globale e trovare rapidamente qualsiasi cosa nel sistema.',
        targetSelector: '[data-tutorial="global-search"]',
        position: 'bottom',
      },
      {
        id: 'notifications',
        title: 'Notifiche',
        description: 'L\'icona campanella mostra le notifiche e gli alert. Cliccala per vedere i dettagli.',
        targetSelector: '[data-tutorial="notifications"]',
        position: 'bottom',
      },
      {
        id: 'complete',
        title: 'Perfetto! ✨',
        description: 'Ora conosci la Dashboard. Esplora gli altri tutorial per approfondire ogni modulo.',
        position: 'center',
      },
    ],
  },
];

export const getTutorialById = (id: string): Tutorial | undefined => {
  return tutorials.find(t => t.id === id);
};
