import { useState } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { formatDateFull, generateId, DatiAzienda } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  FileText,
  Download,
  Save,
  Edit,
  Plus,
  Upload,
  CheckCircle,
  Shield,
  HardHat,
  Flame,
  HeartPulse,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  Building2,
  FileSignature,
  Users,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';

// Tipologie di moduli standard D.Lgs 81/2008
const MODULI_STANDARD = [
  { id: 'psc_accettazione', nome: 'Presa Visione e Accettazione PSC', icon: FileSignature, categoria: 'dichiarazioni', descrizione: 'Dichiarazione di presa visione e accettazione del Piano di Sicurezza e Coordinamento' },
  { id: 'no_interdetti', nome: 'Dichiarazione Assenza Interdetti', icon: Users, categoria: 'dichiarazioni', descrizione: 'Dichiarazione di non avere alle proprie dipendenze personale interdetto' },
  { id: 'oma', nome: 'Dichiarazione OMA', icon: FileText, categoria: 'dichiarazioni', descrizione: 'Dichiarazione Organico Medio Annuo' },
  { id: 'dichiarazione_81', nome: 'Dichiarazione D.Lgs 81/2008', icon: Shield, categoria: 'dichiarazioni', descrizione: 'Dichiarazione di ottemperanza al D.Lgs 81/2008' },
  { id: 'nomina_direttore', nome: 'Nomina Direttore Cantiere', icon: HardHat, categoria: 'nomine', descrizione: 'Nomina del Direttore Tecnico di Cantiere' },
  { id: 'nomina_antincendio', nome: 'Nomina Addetto Antincendio', icon: Flame, categoria: 'nomine', descrizione: 'Nomina addetto alla lotta antincendio e gestione emergenze' },
  { id: 'nomina_primo_soccorso', nome: 'Nomina Addetto Primo Soccorso', icon: HeartPulse, categoria: 'nomine', descrizione: 'Nomina addetto al primo soccorso' },
  { id: 'nomina_rls', nome: 'Nomina RLS', icon: UserCheck, categoria: 'nomine', descrizione: 'Nomina Rappresentante dei Lavoratori per la Sicurezza' },
  { id: 'nomina_medico', nome: 'Nomina Medico Competente', icon: Stethoscope, categoria: 'nomine', descrizione: 'Nomina del Medico Competente aziendale' },
  { id: 'nomina_rspp', nome: 'Nomina RSPP', icon: ShieldCheck, categoria: 'nomine', descrizione: 'Nomina Responsabile Servizio Prevenzione e Protezione' },
  { id: 'consegna_dpi', nome: 'Verbale Consegna DPI', icon: Shield, categoria: 'verbali', descrizione: 'Verbale di consegna dei Dispositivi di Protezione Individuale' },
];

// Corsi obbligatori per tipologia nomina
const CORSI_OBBLIGATORI = {
  rls: ['Formazione RLS 32 ore', 'Aggiornamento annuale RLS'],
  rspp: ['Modulo A', 'Modulo B', 'Modulo C', 'Aggiornamento quinquennale'],
  medico: ['Specializzazione Medicina del Lavoro', 'Corso aggiornamento ECM'],
  antincendio: ['Corso Antincendio (basso/medio/alto rischio)', 'Aggiornamento triennale'],
  primo_soccorso: ['Corso Primo Soccorso Gruppo A/B/C', 'Aggiornamento triennale']
};

// DPI standard con icone
const DPI_STANDARD = [
  { id: 'casco', nome: 'Casco di protezione', normativa: 'EN 397' },
  { id: 'occhiali', nome: 'Occhiali protettivi', normativa: 'EN 166' },
  { id: 'guanti', nome: 'Guanti da lavoro', normativa: 'EN 388' },
  { id: 'scarpe', nome: 'Scarpe antinfortunistiche S3', normativa: 'EN ISO 20345' },
  { id: 'gilet', nome: 'Gilet alta visibilità', normativa: 'EN ISO 20471' },
  { id: 'cuffie', nome: 'Cuffie/Tappi antirumore', normativa: 'EN 352' },
  { id: 'mascherina', nome: 'Mascherina FFP2/FFP3', normativa: 'EN 149' },
  { id: 'imbracatura', nome: 'Imbracatura anticaduta', normativa: 'EN 361' },
];

interface ModuloCompilato {
  id: string;
  tipoModulo: string;
  cantiereId: string;
  impresaId?: string;
  lavoratoreId?: string;
  dataCompilazione: string;
  dataFirma?: string;
  firmato: boolean;
  datiForm: Record<string, any>;
  allegatiUrl?: string[];
}

interface ModuloCustom {
  id: string;
  nome: string;
  tipo: 'word' | 'pdf';
  dataCaricamento: string;
  fileUrl: string;
}

// Generate professional document content with proper legal formatting
const generateProfessionalDocument = (
  modulo: ModuloCompilato,
  moduloInfo: typeof MODULI_STANDARD[0] | undefined,
  datiAzienda: DatiAzienda,
  cantiere: any,
  impresa: any,
  lavoratore: any
) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const titolareNomeCompleto = `${datiAzienda.nomeTitolare} ${datiAzienda.cognomeTitolare}`.trim();
  const indirizzoCompleto = [datiAzienda.sedeLegale, datiAzienda.cap, datiAzienda.citta, datiAzienda.provincia ? `(${datiAzienda.provincia})` : ''].filter(Boolean).join(', ');

  // References normative per ogni tipo di modulo
  const RIFERIMENTI_NORMATIVI = {
    psc_accettazione: 'Art. 100, comma 3 e Allegato XV del D.Lgs. 81/2008 - Piano di Sicurezza e Coordinamento',
    no_interdetti: 'Art. 14 del D.Lgs. 81/2008 e s.m.i. - Provvedimenti degli organi di vigilanza',
    oma: 'Art. 90, comma 9, lett. b) del D.Lgs. 81/2008 - Obblighi del committente',
    dichiarazione_81: 'D.Lgs. 81/2008 e s.m.i. - Testo Unico sulla Sicurezza sul Lavoro',
    nomina_direttore: 'Art. 90 e 97 del D.Lgs. 81/2008 - Figure della sicurezza in cantiere',
    nomina_antincendio: 'Art. 18, comma 1, lett. b) e Art. 43 del D.Lgs. 81/2008 - D.M. 10 marzo 1998',
    nomina_primo_soccorso: 'Art. 18, comma 1, lett. b) e Art. 45 del D.Lgs. 81/2008 - D.M. 388/2003',
    nomina_rls: 'Art. 47, 48, 49 e 50 del D.Lgs. 81/2008 - Rappresentante dei Lavoratori per la Sicurezza',
    nomina_medico: 'Art. 18, comma 1, lett. a) e Artt. 38-42 del D.Lgs. 81/2008 - Sorveglianza sanitaria',
    nomina_rspp: 'Artt. 17, 31, 32, 33, 34 del D.Lgs. 81/2008 - Servizio di Prevenzione e Protezione',
    consegna_dpi: 'Art. 18, comma 1, lett. d) e Titolo III, Capo II del D.Lgs. 81/2008 - DPI'
  };

  const getRiferimentoNormativo = () => {
    return RIFERIMENTI_NORMATIVI[modulo.tipoModulo as keyof typeof RIFERIMENTI_NORMATIVI] || 'D.Lgs. 81/2008 e s.m.i.';
  };

  // Generate module-specific content with justified text and proper legal formatting
  const generateModuleContent = () => {
    switch (modulo.tipoModulo) {
      case 'psc_accettazione':
        return `
          <p class="dichiarazione-intro">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> (${datiAzienda.provinciaNascitaTitolare || '__'}) il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong>, codice fiscale <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong>, in qualità di Legale Rappresentante dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, con sede legale in ${indirizzoCompleto || '_______________'}, P.IVA <strong>${datiAzienda.partitaIva || '_______________'}</strong>,
          </p>
          
          <p class="dichiarazione-premessa">
            ai sensi e per gli effetti dell'Art. 100, comma 3 del D.Lgs. 81/2008 e s.m.i. e dell'Allegato XV del medesimo decreto, consapevole delle responsabilità civili e penali connesse al rilascio di dichiarazioni mendaci ai sensi degli artt. 75 e 76 del D.P.R. 445/2000,
          </p>

          <p class="dichiarazione-titolo">DICHIARA</p>

          <p class="dichiarazione-corpo">
            di aver ricevuto, letto e compreso integralmente il Piano di Sicurezza e Coordinamento (PSC) ${modulo.datiForm.revisionePSC ? `Rev. ${modulo.datiForm.revisionePSC}` : ''} ${modulo.datiForm.dataPSC ? `datato ${formatDate(modulo.datiForm.dataPSC)}` : ''} relativo al cantiere in oggetto, di accettarne senza riserve tutti i contenuti e le prescrizioni in esso contenute, impegnandosi a rispettarle e a farle rispettare dai propri dipendenti e collaboratori. Dichiara altresì di aver trasmesso copia del PSC a tutti i lavoratori che opereranno nel cantiere prima dell'inizio delle rispettive attività lavorative, fornendo loro adeguata formazione e informazione sui rischi specifici presenti.
          </p>

          ${modulo.datiForm.note ? `<p class="note-aggiuntive"><strong>Note:</strong> ${modulo.datiForm.note}</p>` : ''}
        `;

      case 'no_interdetti':
        return `
          <p class="dichiarazione-intro">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> (${datiAzienda.provinciaNascitaTitolare || '__'}) il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong>, codice fiscale <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong>, in qualità di Legale Rappresentante e Datore di Lavoro dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, con sede legale in ${indirizzoCompleto || '_______________'}, P.IVA <strong>${datiAzienda.partitaIva || '_______________'}</strong>,
          </p>

          <p class="dichiarazione-premessa">
            ai sensi e per gli effetti dell'art. 47 del D.P.R. 28 dicembre 2000, n. 445, consapevole delle sanzioni penali previste dall'art. 76 del medesimo decreto in caso di dichiarazioni mendaci e della decadenza dei benefici eventualmente conseguiti al provvedimento emanato sulla base di dichiarazioni non veritiere, ai sensi dell'art. 75 del citato D.P.R.,
          </p>

          <p class="dichiarazione-titolo">DICHIARA</p>

          <p class="dichiarazione-corpo">
            che l'impresa rappresentata non ha attualmente alle proprie dipendenze personale sottoposto a provvedimenti di sospensione o interdittivi di cui all'art. 14 del D.Lgs. 81/2008 e successive modificazioni e integrazioni, né risultano pendenti procedimenti per l'adozione di tali provvedimenti a carico dell'impresa medesima o dei suoi dipendenti. Dichiara inoltre che l'impresa non è stata destinataria, negli ultimi cinque anni, di provvedimenti di sospensione dell'attività imprenditoriale per gravi e reiterate violazioni in materia di tutela della salute e sicurezza sul lavoro.
          </p>
        `;

      case 'oma':
        return `
          <p class="dichiarazione-intro">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, in qualità di Legale Rappresentante dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, con sede legale in ${indirizzoCompleto || '_______________'}, P.IVA <strong>${datiAzienda.partitaIva || '_______________'}</strong>, C.F. <strong>${datiAzienda.codiceFiscaleAzienda || '_______________'}</strong>, iscritta alla Camera di Commercio di ${datiAzienda.provincia || '_______________'} al n. REA <strong>${datiAzienda.iscrizioneREA || '_______________'}</strong>,
          </p>

          <p class="dichiarazione-premessa">
            ai sensi dell'art. 90, comma 9, lettera b) del D.Lgs. 81/2008 e s.m.i., e ai sensi degli artt. 46 e 47 del D.P.R. 445/2000, consapevole delle responsabilità e delle sanzioni penali stabilite dalla legge per le false attestazioni e le dichiarazioni mendaci,
          </p>

          <p class="dichiarazione-titolo">DICHIARA</p>

          <p class="dichiarazione-corpo">
            che l'Organico Medio Annuo (OMA) dell'impresa per l'anno <strong>${modulo.datiForm.annoRiferimento || new Date().getFullYear()}</strong>, calcolato secondo i criteri previsti dalla normativa vigente, è pari a <strong>${modulo.datiForm.organicoMedio || '___'}</strong> unità lavorative, di cui <strong>${modulo.datiForm.operai || '___'}</strong> operai e <strong>${modulo.datiForm.impiegati || '___'}</strong> impiegati. Dichiara inoltre che ai dipendenti viene applicato il Contratto Collettivo Nazionale di Lavoro <strong>${modulo.datiForm.ccnl || '_______________'}</strong> e che l'impresa è in regola con i versamenti contributivi e assicurativi previsti dalla legge.
          </p>
        `;

      case 'dichiarazione_81':
        const adempimenti = [
          modulo.datiForm.check_0 && 'effettuato la valutazione di tutti i rischi per la salute e sicurezza dei lavoratori, elaborando il relativo Documento di Valutazione dei Rischi (DVR) ai sensi degli artt. 17 e 28 del D.Lgs. 81/2008',
          modulo.datiForm.check_1 && 'nominato il Responsabile del Servizio di Prevenzione e Protezione (RSPP) ai sensi dell\'art. 17, comma 1, lett. b)',
          modulo.datiForm.check_2 && 'nominato il Medico Competente ai sensi dell\'art. 18, comma 1, lett. a), ove previsto dalla valutazione dei rischi',
          modulo.datiForm.check_3 && 'designato preventivamente i lavoratori incaricati dell\'attuazione delle misure di prevenzione incendi, lotta antincendio, evacuazione, primo soccorso e gestione delle emergenze ai sensi dell\'art. 18, comma 1, lett. b)',
          modulo.datiForm.check_4 && 'adempiuto agli obblighi di informazione, formazione e addestramento dei lavoratori secondo quanto previsto dagli artt. 36 e 37',
          modulo.datiForm.check_5 && 'fornito ai lavoratori i necessari e idonei Dispositivi di Protezione Individuale (DPI) ai sensi dell\'art. 18, comma 1, lett. d)'
        ].filter(Boolean);

        return `
          <p class="dichiarazione-intro">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> (${datiAzienda.provinciaNascitaTitolare || '__'}) il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong>, codice fiscale <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong>, in qualità di Datore di Lavoro dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, con sede legale in ${indirizzoCompleto || '_______________'}, P.IVA <strong>${datiAzienda.partitaIva || '_______________'}</strong>,
          </p>

          <p class="dichiarazione-premessa">
            ai sensi del D.Lgs. 9 aprile 2008, n. 81 e successive modifiche e integrazioni (Testo Unico sulla Salute e Sicurezza sul Lavoro) e ai sensi degli artt. 46 e 47 del D.P.R. 445/2000, consapevole delle responsabilità e delle sanzioni penali stabilite dalla legge per le false attestazioni e le dichiarazioni mendaci,
          </p>

          <p class="dichiarazione-titolo">DICHIARA</p>

          <p class="dichiarazione-corpo">
            di ottemperare a tutti gli obblighi previsti dal D.Lgs. 81/2008 e successive modifiche e integrazioni in materia di tutela della salute e sicurezza nei luoghi di lavoro. In particolare, dichiara di aver ${adempimenti.join('; ')}.
          </p>

          <p class="dichiarazione-corpo">
            Il sottoscritto si impegna inoltre a comunicare tempestivamente eventuali variazioni rispetto a quanto sopra dichiarato e a mantenere costantemente aggiornata la documentazione relativa alla sicurezza sul lavoro.
          </p>
        `;

      case 'consegna_dpi':
        const dpiConsegnati = DPI_STANDARD.filter(dpi => modulo.datiForm[`dpi_${dpi.id}`]);
        const dpiList = dpiConsegnati.map(dpi => 
          `${dpi.nome} (norma ${dpi.normativa}) - quantità: ${modulo.datiForm[`qty_${dpi.id}`] || '1'}`
        ).join('; ');

        return `
          <p class="dichiarazione-premessa">
            Ai sensi dell'art. 18, comma 1, lettera d) e del Titolo III, Capo II (artt. 74-79) del D.Lgs. 81/2008 e s.m.i., relativo all'uso dei Dispositivi di Protezione Individuale,
          </p>

          <p class="dichiarazione-titolo">VERBALE DI CONSEGNA DPI</p>

          <p class="dichiarazione-corpo">
            In data <strong>${modulo.datiForm.dataConsegna ? formatDate(modulo.datiForm.dataConsegna) : formatDate(modulo.dataCompilazione)}</strong>, presso il cantiere <strong>${cantiere?.nome || '_______________'}</strong> sito in ${cantiere?.indirizzo || '_______________'}, il Datore di Lavoro <strong>${titolareNomeCompleto}</strong> dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong> ha consegnato al lavoratore <strong>${lavoratore ? `${lavoratore.cognome} ${lavoratore.nome}` : '_______________'}</strong>, codice fiscale <strong>${lavoratore?.codiceFiscale || '_______________'}</strong>, mansione <strong>${lavoratore?.mansione || '_______________'}</strong>, i seguenti Dispositivi di Protezione Individuale: ${dpiList || '_______________'}.
          </p>

          <p class="dichiarazione-corpo">
            Il lavoratore dichiara di aver ricevuto i DPI sopra elencati e di essere stato adeguatamente formato e informato ai sensi dell'art. 77, comma 4, del D.Lgs. 81/2008 circa le corrette modalità di utilizzo, manutenzione, conservazione e riconsegna dei dispositivi, nonché sui rischi specifici dai quali i DPI sono destinati a proteggerlo e sulle circostanze nelle quali il loro uso è necessario. Il lavoratore si impegna ad utilizzare i DPI conformemente alle istruzioni ricevute e a segnalare tempestivamente eventuali difetti o inconvenienti.
          </p>
        `;

      default:
        // Nomine
        if (modulo.tipoModulo.startsWith('nomina_')) {
          const tipoNomina = modulo.tipoModulo.replace('nomina_', '');
          const nominaConfig = {
            direttore: {
              titolo: 'DIRETTORE TECNICO DI CANTIERE',
              riferimento: 'ai sensi degli artt. 90 e 97 del D.Lgs. 81/2008',
              compiti: 'la direzione tecnica del cantiere, il coordinamento delle attività lavorative, la vigilanza sull\'osservanza delle disposizioni in materia di sicurezza e la gestione operativa delle maestranze'
            },
            antincendio: {
              titolo: 'ADDETTO ALLA PREVENZIONE INCENDI, LOTTA ANTINCENDIO E GESTIONE DELLE EMERGENZE',
              riferimento: 'ai sensi dell\'art. 18, comma 1, lettera b) e dell\'art. 43 del D.Lgs. 81/2008, nonché del D.M. 10 marzo 1998',
              compiti: 'l\'attuazione delle misure di prevenzione incendi, la lotta antincendio, l\'evacuazione dei luoghi di lavoro in caso di pericolo grave ed immediato e la gestione delle emergenze'
            },
            primo_soccorso: {
              titolo: 'ADDETTO AL PRIMO SOCCORSO',
              riferimento: 'ai sensi dell\'art. 18, comma 1, lettera b) e dell\'art. 45 del D.Lgs. 81/2008, nonché del D.M. 388/2003',
              compiti: 'l\'attuazione delle misure di primo soccorso, la gestione degli interventi di emergenza sanitaria e il coordinamento con i servizi di soccorso esterni'
            },
            rls: {
              titolo: 'RAPPRESENTANTE DEI LAVORATORI PER LA SICUREZZA (RLS)',
              riferimento: 'ai sensi degli artt. 47, 48, 49 e 50 del D.Lgs. 81/2008',
              compiti: 'la rappresentanza dei lavoratori per quanto concerne gli aspetti della salute e della sicurezza durante il lavoro, secondo le attribuzioni di cui all\'art. 50 del D.Lgs. 81/2008'
            },
            medico: {
              titolo: 'MEDICO COMPETENTE',
              riferimento: 'ai sensi dell\'art. 18, comma 1, lettera a) e degli artt. 38-42 del D.Lgs. 81/2008',
              compiti: 'la sorveglianza sanitaria dei lavoratori, la collaborazione con il Datore di Lavoro e con il Servizio di Prevenzione e Protezione, la visita degli ambienti di lavoro e tutte le attività di cui all\'art. 25 del D.Lgs. 81/2008'
            },
            rspp: {
              titolo: 'RESPONSABILE DEL SERVIZIO DI PREVENZIONE E PROTEZIONE (RSPP)',
              riferimento: 'ai sensi degli artt. 17, comma 1, lettera b), 31, 32, 33 e 34 del D.Lgs. 81/2008',
              compiti: 'il coordinamento del Servizio di Prevenzione e Protezione, l\'individuazione dei fattori di rischio, l\'elaborazione delle misure preventive e protettive, la predisposizione dei programmi di informazione e formazione, e tutte le attività di cui all\'art. 33 del D.Lgs. 81/2008'
            }
          }[tipoNomina] || { titolo: 'INCARICATO', riferimento: 'ai sensi del D.Lgs. 81/2008', compiti: 'lo svolgimento delle mansioni assegnate' };

          return `
            <p class="dichiarazione-intro">
              Il sottoscritto <strong>${titolareNomeCompleto}</strong>, in qualità di Datore di Lavoro dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, con sede legale in ${indirizzoCompleto || '_______________'}, P.IVA <strong>${datiAzienda.partitaIva || '_______________'}</strong>,
            </p>

            <p class="dichiarazione-premessa">
              ${nominaConfig.riferimento}, visti gli obblighi ivi previsti in materia di organizzazione della sicurezza aziendale,
            </p>

            <p class="dichiarazione-titolo">NOMINA</p>

            <p class="dichiarazione-corpo">
              il Sig./Sig.ra <strong>${lavoratore ? `${lavoratore.cognome} ${lavoratore.nome}` : '_______________'}</strong>, nato/a a <strong>_______________</strong> il <strong>_______________</strong>, codice fiscale <strong>${lavoratore?.codiceFiscale || '_______________'}</strong>, residente in <strong>_______________</strong>,
            </p>

            <p class="nomina-ruolo">${nominaConfig.titolo}</p>

            <p class="dichiarazione-corpo">
              con decorrenza dal <strong>${modulo.datiForm.dataDecorrenza ? formatDate(modulo.datiForm.dataDecorrenza) : '_______________'}</strong>${cantiere ? ` per il cantiere denominato <strong>${cantiere.nome}</strong> sito in ${cantiere.indirizzo}` : ''}, conferendo al medesimo/alla medesima ${nominaConfig.compiti}.
            </p>

            ${modulo.datiForm.compiti ? `<p class="dichiarazione-corpo"><strong>Compiti e responsabilità specifiche:</strong> ${modulo.datiForm.compiti}</p>` : ''}

            <p class="dichiarazione-corpo">
              Il/La nominato/a dichiara di accettare l'incarico conferitogli/le e di essere in possesso dei requisiti formativi e professionali previsti dalla normativa vigente per lo svolgimento delle funzioni attribuite.
            </p>
          `;
        }
        return '<p class="dichiarazione-corpo">Contenuto del modulo</p>';
    }
  };

  return {
    content: generateModuleContent(),
    riferimentoNormativo: getRiferimentoNormativo(),
    titolareNomeCompleto,
    indirizzoCompleto,
    formatDate
  };
};

// Generate professional PDF with letterhead - uses the document content generator
const generateProfessionalPDF = (
  modulo: ModuloCompilato,
  moduloInfo: typeof MODULI_STANDARD[0] | undefined,
  datiAzienda: DatiAzienda,
  cantiere: any,
  impresa: any,
  lavoratore: any
) => {
  const docData = generateProfessionalDocument(modulo, moduloInfo, datiAzienda, cantiere, impresa, lavoratore);
  const { content, riferimentoNormativo, titolareNomeCompleto, indirizzoCompleto, formatDate } = docData;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${moduloInfo?.nome || 'Documento'}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm 25mm 30mm 25mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          margin: 0;
          padding: 0;
        }
        .page-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
          margin-bottom: 30px;
        }
        .header-image {
          max-width: 100%;
          max-height: 120px;
          object-fit: contain;
        }
        .header-text {
          margin-top: 10px;
        }
        .company-name {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .company-info {
          font-size: 10pt;
          color: #333;
          line-height: 1.4;
        }
        .document-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          margin: 40px 0 15px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .document-subtitle {
          text-align: center;
          font-size: 10pt;
          color: #444;
          margin-bottom: 30px;
          font-style: italic;
        }
        .content {
          flex: 1;
          text-align: justify;
        }
        .cantiere-info {
          background: #f5f5f5;
          padding: 15px 20px;
          border-left: 4px solid #333;
          margin-bottom: 30px;
        }
        .cantiere-info p {
          margin: 5px 0;
          font-size: 11pt;
        }
        /* Dichiarazione styling */
        .dichiarazione-intro {
          text-align: justify;
          margin-bottom: 20px;
          line-height: 1.8;
        }
        .dichiarazione-premessa {
          text-align: justify;
          margin-bottom: 25px;
          line-height: 1.8;
          font-style: italic;
        }
        .dichiarazione-titolo {
          text-align: center;
          font-weight: bold;
          font-size: 14pt;
          margin: 35px 0;
          letter-spacing: 2px;
        }
        .dichiarazione-corpo {
          text-align: justify;
          margin-bottom: 20px;
          line-height: 1.8;
          text-indent: 30px;
        }
        .nomina-ruolo {
          text-align: center;
          font-weight: bold;
          font-size: 12pt;
          margin: 25px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .note-aggiuntive {
          margin-top: 25px;
          padding: 15px;
          background: #fafafa;
          border-left: 3px solid #666;
        }
        .signature-area {
          margin-top: 80px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .signature-box {
          width: 42%;
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 60px;
          padding-top: 8px;
          font-size: 10pt;
        }
        .date-place {
          text-align: right;
          margin: 40px 0;
          font-size: 11pt;
        }
        .footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 9pt;
          color: #666;
        }
        .footer-image {
          max-width: 100%;
          max-height: 60px;
          object-fit: contain;
          margin-bottom: 10px;
        }
        .stamp {
          position: absolute;
          right: 80px;
          bottom: 180px;
          max-width: 140px;
          max-height: 140px;
          opacity: 0.9;
        }
        strong {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="page-container">
        <!-- Header -->
        <div class="header">
          ${datiAzienda.cartaIntestataHeader 
            ? `<img src="${datiAzienda.cartaIntestataHeader}" class="header-image" alt="Intestazione" />`
            : `<div class="header-text">
                <div class="company-name">${datiAzienda.ragioneSociale || 'AZIENDA'}</div>
                <div class="company-info">
                  ${indirizzoCompleto ? `${indirizzoCompleto}<br/>` : ''}
                  ${datiAzienda.partitaIva ? `P.IVA: ${datiAzienda.partitaIva}` : ''} ${datiAzienda.codiceFiscaleAzienda ? `- C.F.: ${datiAzienda.codiceFiscaleAzienda}` : ''}<br/>
                  ${datiAzienda.iscrizioneREA ? `REA: ${datiAzienda.iscrizioneREA}<br/>` : ''}
                  ${datiAzienda.telefono ? `Tel: ${datiAzienda.telefono}` : ''} ${datiAzienda.email ? `- Email: ${datiAzienda.email}` : ''}<br/>
                  ${datiAzienda.pec ? `PEC: ${datiAzienda.pec}` : ''}
                </div>
              </div>`
          }
        </div>

        <!-- Document Title -->
        <div class="document-title">${moduloInfo?.nome || 'DICHIARAZIONE'}</div>
        <div class="document-subtitle">${riferimentoNormativo}</div>

        <!-- Cantiere Info -->
        ${cantiere ? `
        <div class="cantiere-info">
          <p><strong>Oggetto:</strong> Cantiere "${cantiere.nome}" - Commessa ${cantiere.codiceCommessa}</p>
          <p><strong>Ubicazione:</strong> ${cantiere.indirizzo}</p>
          ${cantiere.committente ? `<p><strong>Committente:</strong> ${cantiere.committente}</p>` : ''}
        </div>
        ` : ''}

        <!-- Content -->
        <div class="content">
          ${content}
        </div>

        <!-- Date and Place -->
        <div class="date-place">
          ${datiAzienda.citta || '_______________'}, lì ${formatDate(modulo.dataCompilazione)}
        </div>

        <!-- Signatures -->
        <div class="signature-area">
          <div class="signature-box">
            <p>Il Datore di Lavoro / Legale Rappresentante</p>
            <p style="font-size: 10pt;">(${titolareNomeCompleto || '_______________'})</p>
            <div class="signature-line">Firma</div>
          </div>
          <div class="signature-box">
            <p>${lavoratore ? 'Il Lavoratore / Nominato' : 'Per accettazione'}</p>
            ${lavoratore ? `<p style="font-size: 10pt;">(${lavoratore.cognome} ${lavoratore.nome})</p>` : '<p style="font-size: 10pt;">&nbsp;</p>'}
            <div class="signature-line">Firma</div>
          </div>
        </div>

        ${modulo.firmato && datiAzienda.timbro ? `
        <img src="${datiAzienda.timbro}" class="stamp" alt="Timbro" style="right: ${datiAzienda.timbroPositionX || 80}px; bottom: ${datiAzienda.timbroPositionY || 180}px;" />
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          ${datiAzienda.cartaIntestataFooter 
            ? `<img src="${datiAzienda.cartaIntestataFooter}" class="footer-image" alt="Footer" />`
            : `<p>${datiAzienda.ragioneSociale || ''} ${datiAzienda.partitaIva ? `- P.IVA ${datiAzienda.partitaIva}` : ''}</p>`
          }
          <p>Documento generato il ${formatDate(new Date().toISOString().slice(0, 10))}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

export default function SafetyFormsModule() {
  const { cantieri, imprese, lavoratori, datiAzienda } = useWorkHub();
  const { toast } = useToast();

  const [activeModulo, setActiveModulo] = useState<string | null>(null);
  const [moduliCompilati, setModuliCompilati] = useState<ModuloCompilato[]>([]);
  const [moduliCustom, setModuliCustom] = useState<ModuloCustom[]>([]);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedCantiere, setSelectedCantiere] = useState('');
  const [selectedImpresa, setSelectedImpresa] = useState('');
  const [selectedLavoratore, setSelectedLavoratore] = useState('');
  const [viewingModulo, setViewingModulo] = useState<ModuloCompilato | null>(null);

  const isAziendaConfigured = datiAzienda.ragioneSociale && datiAzienda.partitaIva;

  const getModuloInfo = (id: string) => MODULI_STANDARD.find(m => m.id === id);
  const getCantiere = (id: string) => cantieri.find(c => c.id === id);
  const getImpresa = (id: string) => imprese.find(i => i.id === id);
  const getLavoratore = (id: string) => lavoratori.find(l => l.id === id);

  const handleOpenForm = (moduloId: string) => {
    if (!isAziendaConfigured) {
      toast({ 
        title: 'Configura i dati aziendali', 
        description: 'Vai in Impostazioni > Dati Azienda per inserire i dati della tua azienda',
        variant: 'destructive' 
      });
      return;
    }
    setActiveModulo(moduloId);
    setFormData({});
    setShowFormDialog(true);
  };

  const handleSaveForm = () => {
    if (!selectedCantiere) {
      toast({ title: 'Seleziona un cantiere', variant: 'destructive' });
      return;
    }

    const newModulo: ModuloCompilato = {
      id: generateId(),
      tipoModulo: activeModulo!,
      cantiereId: selectedCantiere,
      impresaId: selectedImpresa || undefined,
      lavoratoreId: selectedLavoratore || undefined,
      dataCompilazione: new Date().toISOString().slice(0, 10),
      firmato: false,
      datiForm: { ...formData }
    };

    setModuliCompilati([...moduliCompilati, newModulo]);
    toast({ title: 'Modulo salvato con successo' });
    setShowFormDialog(false);
    resetForm();
  };

  const handleDownloadPDF = (modulo: ModuloCompilato) => {
    const moduloInfo = getModuloInfo(modulo.tipoModulo);
    const cantiere = getCantiere(modulo.cantiereId);
    const impresa = getImpresa(modulo.impresaId || '');
    const lavoratore = getLavoratore(modulo.lavoratoreId || '');

    const content = generateProfessionalPDF(modulo, moduloInfo, datiAzienda, cantiere, impresa, lavoratore);

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    toast({ title: 'Documento pronto per la stampa/download' });
  };

  const handleDeleteModulo = (id: string) => {
    setModuliCompilati(moduliCompilati.filter(m => m.id !== id));
    toast({ title: 'Modulo eliminato' });
  };

  const handleSignModulo = (id: string) => {
    setModuliCompilati(moduliCompilati.map(m =>
      m.id === id ? { ...m, firmato: true, dataFirma: new Date().toISOString().slice(0, 10) } : m
    ));
    toast({ title: 'Modulo firmato - il timbro verrà inserito nel documento' });
  };

  const handleUploadCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = file.type === 'application/pdf' || 
                    file.type === 'application/msword' || 
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isValid) {
      toast({ title: 'Formato non supportato', description: 'Carica solo file PDF o Word', variant: 'destructive' });
      return;
    }

    const newCustom: ModuloCustom = {
      id: generateId(),
      nome: file.name,
      tipo: file.type.includes('pdf') ? 'pdf' : 'word',
      dataCaricamento: new Date().toISOString().slice(0, 10),
      fileUrl: URL.createObjectURL(file)
    };

    setModuliCustom([...moduliCustom, newCustom]);
    toast({ title: 'Modulo caricato con successo' });
    setShowUploadDialog(false);
  };

  const resetForm = () => {
    setActiveModulo(null);
    setFormData({});
    setSelectedCantiere('');
    setSelectedImpresa('');
    setSelectedLavoratore('');
  };

  // Render form fields based on module type
  const renderFormFields = () => {
    const moduloInfo = getModuloInfo(activeModulo || '');
    if (!moduloInfo) return null;

    switch (activeModulo) {
      case 'psc_accettazione':
        return (
          <div className="space-y-4">
            <div>
              <Label>Data PSC</Label>
              <Input
                type="date"
                value={formData.dataPSC || ''}
                onChange={(e) => setFormData({ ...formData, dataPSC: e.target.value })}
              />
            </div>
            <div>
              <Label>Revisione PSC</Label>
              <Input
                placeholder="Es: Rev. 01"
                value={formData.revisionePSC || ''}
                onChange={(e) => setFormData({ ...formData, revisionePSC: e.target.value })}
              />
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="accetta_psc"
                checked={formData.accettaPSC || false}
                onCheckedChange={(checked) => setFormData({ ...formData, accettaPSC: checked })}
              />
              <Label htmlFor="accetta_psc" className="text-sm leading-relaxed">
                Il sottoscritto dichiara di aver preso visione del Piano di Sicurezza e Coordinamento (PSC) 
                e di accettarne integralmente i contenuti, impegnandosi a rispettarne le prescrizioni.
              </Label>
            </div>
            <Textarea
              placeholder="Note aggiuntive..."
              value={formData.note || ''}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
        );

      case 'no_interdetti':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2">
              <p className="font-medium">Il sottoscritto, in qualità di Datore di Lavoro dell'impresa, consapevole delle sanzioni penali in caso di dichiarazioni mendaci,</p>
              <p className="font-bold">DICHIARA</p>
              <p>che l'impresa non ha alle proprie dipendenze personale sottoposto a provvedimenti interdittivi o di sospensione ai sensi dell'art. 14 del D.Lgs. 81/2008.</p>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="conferma_interdetti"
                checked={formData.confermaInterdetti || false}
                onCheckedChange={(checked) => setFormData({ ...formData, confermaInterdetti: checked })}
              />
              <Label htmlFor="conferma_interdetti" className="text-sm">
                Confermo la veridicità della presente dichiarazione
              </Label>
            </div>
          </div>
        );

      case 'oma':
        return (
          <div className="space-y-4">
            <div>
              <Label>Anno di riferimento</Label>
              <Input
                type="number"
                placeholder={new Date().getFullYear().toString()}
                value={formData.annoRiferimento || ''}
                onChange={(e) => setFormData({ ...formData, annoRiferimento: e.target.value })}
              />
            </div>
            <div>
              <Label>Organico Medio Annuo</Label>
              <Input
                type="number"
                placeholder="Numero medio dipendenti"
                value={formData.organicoMedio || ''}
                onChange={(e) => setFormData({ ...formData, organicoMedio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Operai</Label>
                <Input
                  type="number"
                  value={formData.operai || ''}
                  onChange={(e) => setFormData({ ...formData, operai: e.target.value })}
                />
              </div>
              <div>
                <Label>Impiegati</Label>
                <Input
                  type="number"
                  value={formData.impiegati || ''}
                  onChange={(e) => setFormData({ ...formData, impiegati: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>CCNL Applicato</Label>
              <Input
                placeholder="Es: CCNL Edilizia Industria"
                value={formData.ccnl || ''}
                onChange={(e) => setFormData({ ...formData, ccnl: e.target.value })}
              />
            </div>
          </div>
        );

      case 'dichiarazione_81':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2">
              <p className="font-medium">Il sottoscritto, in qualità di Datore di Lavoro,</p>
              <p className="font-bold">DICHIARA</p>
              <p>di ottemperare a tutti gli obblighi previsti dal D.Lgs. 81/2008 e successive modifiche e integrazioni in materia di tutela della salute e sicurezza nei luoghi di lavoro.</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">In particolare dichiara di:</Label>
              {[
                'Aver effettuato la valutazione dei rischi (DVR)',
                'Aver nominato il RSPP',
                'Aver nominato il Medico Competente (ove previsto)',
                'Aver designato gli addetti alle emergenze',
                'Aver formato i lavoratori secondo normativa',
                'Aver fornito i DPI necessari'
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox
                    id={`check_${i}`}
                    checked={formData[`check_${i}`] || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, [`check_${i}`]: checked })}
                  />
                  <Label htmlFor={`check_${i}`} className="text-sm">{item}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'nomina_direttore':
      case 'nomina_antincendio':
      case 'nomina_primo_soccorso':
      case 'nomina_rls':
      case 'nomina_medico':
      case 'nomina_rspp':
        const corsiKey = activeModulo === 'nomina_rls' ? 'rls' :
                        activeModulo === 'nomina_rspp' ? 'rspp' :
                        activeModulo === 'nomina_medico' ? 'medico' :
                        activeModulo === 'nomina_antincendio' ? 'antincendio' :
                        activeModulo === 'nomina_primo_soccorso' ? 'primo_soccorso' : null;
        
        return (
          <div className="space-y-4">
            <div>
              <Label>Nominato</Label>
              <Select value={selectedLavoratore} onValueChange={setSelectedLavoratore}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona la persona nominata" />
                </SelectTrigger>
                <SelectContent>
                  {lavoratori.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.cognome} {l.nome} - {l.mansione}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Nomina</Label>
              <Input
                type="date"
                value={formData.dataNomina || new Date().toISOString().slice(0, 10)}
                onChange={(e) => setFormData({ ...formData, dataNomina: e.target.value })}
              />
            </div>
            <div>
              <Label>Decorrenza</Label>
              <Input
                type="date"
                value={formData.dataDecorrenza || ''}
                onChange={(e) => setFormData({ ...formData, dataDecorrenza: e.target.value })}
              />
            </div>
            
            {corsiKey && CORSI_OBBLIGATORI[corsiKey as keyof typeof CORSI_OBBLIGATORI] && (
              <div className="space-y-2">
                <Label className="font-medium">Corsi Obbligatori / Abilitazioni</Label>
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  {CORSI_OBBLIGATORI[corsiKey as keyof typeof CORSI_OBBLIGATORI].map((corso, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`corso_${i}`}
                          checked={formData[`corso_${corso}`] || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, [`corso_${corso}`]: checked })}
                        />
                        <Label htmlFor={`corso_${i}`} className="text-sm">{corso}</Label>
                      </div>
                      <Input
                        type="date"
                        className="w-40"
                        placeholder="Data conseguimento"
                        value={formData[`data_${corso}`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`data_${corso}`]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Textarea
              placeholder="Compiti e responsabilità specifiche..."
              value={formData.compiti || ''}
              onChange={(e) => setFormData({ ...formData, compiti: e.target.value })}
            />
          </div>
        );

      case 'consegna_dpi':
        return (
          <div className="space-y-4">
            <div>
              <Label>Lavoratore</Label>
              <Select value={selectedLavoratore} onValueChange={setSelectedLavoratore}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona lavoratore" />
                </SelectTrigger>
                <SelectContent>
                  {lavoratori.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.cognome} {l.nome} - {l.mansione}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Consegna</Label>
              <Input
                type="date"
                value={formData.dataConsegna || new Date().toISOString().slice(0, 10)}
                onChange={(e) => setFormData({ ...formData, dataConsegna: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">DPI Consegnati</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DPI_STANDARD.map((dpi) => (
                  <div key={dpi.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`dpi_${dpi.id}`}
                        checked={formData[`dpi_${dpi.id}`] || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, [`dpi_${dpi.id}`]: checked })}
                      />
                      <div>
                        <Label htmlFor={`dpi_${dpi.id}`} className="text-sm font-medium">{dpi.nome}</Label>
                        <p className="text-xs text-muted-foreground">{dpi.normativa}</p>
                      </div>
                    </div>
                    <Input
                      type="number"
                      className="w-16"
                      placeholder="Qty"
                      value={formData[`qty_${dpi.id}`] || ''}
                      onChange={(e) => setFormData({ ...formData, [`qty_${dpi.id}`]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
              <p className="font-medium text-amber-600">Istruzioni per il lavoratore:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Utilizzare i DPI secondo le istruzioni ricevute</li>
                <li>Avere cura dei DPI assegnati</li>
                <li>Segnalare immediatamente difetti o malfunzionamenti</li>
                <li>Non apportare modifiche ai DPI</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="accetta_dpi"
                checked={formData.accettaDPI || false}
                onCheckedChange={(checked) => setFormData({ ...formData, accettaDPI: checked })}
              />
              <Label htmlFor="accetta_dpi" className="text-sm leading-relaxed">
                Il lavoratore dichiara di aver ricevuto i DPI sopra elencati e di essere stato informato 
                sulle corrette modalità di utilizzo, manutenzione e conservazione degli stessi.
              </Label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            Modulo non configurato
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning if company data not configured */}
      {!isAziendaConfigured && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-medium text-amber-600">Dati aziendali non configurati</p>
            <p className="text-sm text-muted-foreground">
              Per generare documenti con carta intestata, vai in <strong>Impostazioni &gt; Dati Azienda</strong> e compila i dati della tua azienda.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="standard" className="w-full">
        <TabsList>
          <TabsTrigger value="standard">Moduli Standard</TabsTrigger>
          <TabsTrigger value="compilati">Moduli Compilati ({moduliCompilati.length})</TabsTrigger>
          <TabsTrigger value="custom">Moduli Personalizzati ({moduliCustom.length})</TabsTrigger>
        </TabsList>

        {/* Standard Forms */}
        <TabsContent value="standard" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['dichiarazioni', 'nomine', 'verbali'].map(categoria => (
              <div key={categoria} className="space-y-3">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                  {categoria === 'dichiarazioni' ? 'Dichiarazioni' : 
                   categoria === 'nomine' ? 'Nomine e Incarichi' : 'Verbali'}
                </h3>
                {MODULI_STANDARD.filter(m => m.categoria === categoria).map(modulo => {
                  const Icon = modulo.icon;
                  return (
                    <div
                      key={modulo.id}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => handleOpenForm(modulo.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{modulo.nome}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{modulo.descrizione}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Compiled Forms */}
        <TabsContent value="compilati" className="mt-6">
          {moduliCompilati.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">Nessun modulo compilato</h3>
              <p className="text-sm">Compila un modulo dalla sezione "Moduli Standard"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moduliCompilati.map(modulo => {
                const info = getModuloInfo(modulo.tipoModulo);
                const cantiere = getCantiere(modulo.cantiereId);
                const impresa = getImpresa(modulo.impresaId || '');
                const lavoratore = getLavoratore(modulo.lavoratoreId || '');
                const Icon = info?.icon || FileText;

                return (
                  <div key={modulo.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          modulo.firmato ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                        )}>
                          <Icon className={cn(
                            'w-5 h-5',
                            modulo.firmato ? 'text-emerald-500' : 'text-amber-500'
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{info?.nome}</h4>
                            <Badge className={modulo.firmato ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}>
                              {modulo.firmato ? 'Firmato' : 'Da firmare'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {cantiere?.nome} {impresa && `• ${impresa.ragioneSociale}`} {lavoratore && `• ${lavoratore.cognome} ${lavoratore.nome}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Compilato: {formatDateFull(modulo.dataCompilazione)}
                            {modulo.dataFirma && ` • Firmato: ${formatDateFull(modulo.dataFirma)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingModulo(modulo)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!modulo.firmato && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSignModulo(modulo.id)}
                            className="gap-1"
                          >
                            <FileSignature className="w-4 h-4" />
                            Firma
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(modulo)}
                          className="gap-1"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModulo(modulo.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Custom Forms */}
        <TabsContent value="custom" className="mt-6">
          <div className="mb-4">
            <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              Carica Modulo Word/PDF
            </Button>
          </div>
          
          {moduliCustom.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">Nessun modulo personalizzato</h3>
              <p className="text-sm">Carica i tuoi moduli in formato Word o PDF</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moduliCustom.map(modulo => (
                <div key={modulo.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-medium truncate">{modulo.nome}</h4>
                      <p className="text-xs text-muted-foreground">
                        {modulo.tipo.toUpperCase()} • {formatDateFull(modulo.dataCaricamento)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(modulo.fileUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Scarica
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setModuliCustom(moduliCustom.filter(m => m.id !== modulo.id))}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={(open) => { setShowFormDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeModulo && (() => {
                const info = getModuloInfo(activeModulo);
                const Icon = info?.icon || FileText;
                return (
                  <>
                    <Icon className="w-5 h-5 text-primary" />
                    {info?.nome}
                  </>
                );
              })()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cantiere *</Label>
                <Select value={selectedCantiere} onValueChange={setSelectedCantiere}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona cantiere" />
                  </SelectTrigger>
                  <SelectContent>
                    {cantieri.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome} ({c.codiceCommessa})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Impresa</Label>
                <Select value={selectedImpresa} onValueChange={setSelectedImpresa}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona impresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {imprese.map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.ragioneSociale}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dati Azienda Preview */}
            <div className="p-3 bg-muted/30 rounded-lg text-sm">
              <p className="font-medium mb-1">Dati Azienda (da Impostazioni)</p>
              <p className="text-muted-foreground">
                {datiAzienda.ragioneSociale || 'Non configurato'} 
                {datiAzienda.partitaIva && ` - P.IVA: ${datiAzienda.partitaIva}`}
              </p>
              <p className="text-muted-foreground">
                Legale Rapp.: {datiAzienda.nomeTitolare} {datiAzienda.cognomeTitolare || 'Non configurato'}
              </p>
            </div>

            {/* Module-specific fields */}
            {renderFormFields()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveForm} className="gap-2">
              <Save className="w-4 h-4" />
              Salva Modulo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carica Modulo Personalizzato</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUploadCustom}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Formati supportati: PDF, Word (.doc, .docx)
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modulo Dialog */}
      <Dialog open={!!viewingModulo} onOpenChange={(open) => !open && setViewingModulo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewingModulo && getModuloInfo(viewingModulo.tipoModulo)?.nome}
            </DialogTitle>
          </DialogHeader>
          {viewingModulo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cantiere:</span>
                  <p className="font-medium">{getCantiere(viewingModulo.cantiereId)?.nome || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data compilazione:</span>
                  <p className="font-medium">{formatDateFull(viewingModulo.dataCompilazione)}</p>
                </div>
                {viewingModulo.impresaId && (
                  <div>
                    <span className="text-muted-foreground">Impresa:</span>
                    <p className="font-medium">{getImpresa(viewingModulo.impresaId)?.ragioneSociale || '-'}</p>
                  </div>
                )}
                {viewingModulo.lavoratoreId && (
                  <div>
                    <span className="text-muted-foreground">Lavoratore:</span>
                    <p className="font-medium">
                      {(() => {
                        const l = getLavoratore(viewingModulo.lavoratoreId);
                        return l ? `${l.cognome} ${l.nome}` : '-';
                      })()}
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Dati del modulo:</h4>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-60">
                  {JSON.stringify(viewingModulo.datiForm, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingModulo(null)}>
              Chiudi
            </Button>
            {viewingModulo && (
              <Button onClick={() => { handleDownloadPDF(viewingModulo); setViewingModulo(null); }}>
                <Download className="w-4 h-4 mr-2" />
                Scarica PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
