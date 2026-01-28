import { useState, useEffect, useMemo } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { FileAttachmentManager } from '@/components/workhub/FileAttachmentManager';
import PostCreationActions from '@/components/workhub/PostCreationActions';
import { useFileUpload } from '@/hooks/useFileUpload';
import { HtmlPreviewFrame } from '@/components/workhub/HtmlPreviewFrame';
import { FileViewerModal } from '@/components/workhub/FileViewerModal';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
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
  AlertCircle,
  Link,
  Paperclip,
  BarChart3,
  Send
} from 'lucide-react';

// Tipologie di moduli standard D.Lgs 81/2008 - basati sui moduli caricati dall'utente
const MODULI_STANDARD = [
  // Dichiarazioni
  { id: 'psc_accettazione', nome: 'Accettazione PSC', icon: FileSignature, categoria: 'dichiarazioni', descrizione: 'Presa visione e accettazione PSC (Art. 96, c.2 D.Lgs. 81/08)' },
  { id: 'idoneita_tecnico_professionale', nome: 'Idoneità Tecnico Professionale', icon: Building2, categoria: 'dichiarazioni', descrizione: 'Dichiarazione idoneità con INPS/INAIL/PAT/OMA (Art. 26, 90 D.Lgs. 81/08)' },
  { id: 'no_interdetti', nome: 'Dichiarazione Assenza Interdetti', icon: Users, categoria: 'dichiarazioni', descrizione: 'Assenza personale interdetto (Art. 14 D.Lgs. 81/08)' },
  { id: 'oma', nome: 'Dichiarazione OMA', icon: FileText, categoria: 'dichiarazioni', descrizione: 'Organico Medio Annuo (Art. 90, c.9, lett.b D.Lgs. 81/08)' },
  { id: 'dichiarazione_81', nome: 'Dichiarazione D.Lgs 81/2008', icon: Shield, categoria: 'dichiarazioni', descrizione: 'Ottemperanza obblighi sicurezza D.Lgs 81/08' },
  { id: 'antimafia', nome: 'Dichiarazione Antimafia', icon: FileText, categoria: 'dichiarazioni', descrizione: 'Familiari conviventi (Art. 85, c.3 D.Lgs. 159/2011)' },
  // Nomine
  { id: 'nomina_direttore', nome: 'Nomina Direttore Tecnico', icon: HardHat, categoria: 'nomine', descrizione: 'Direttore Tecnico di Cantiere (MOD 01.01)' },
  { id: 'nomina_antincendio', nome: 'Nomina Addetto Antincendio', icon: Flame, categoria: 'nomine', descrizione: 'Addetto antincendio e emergenze (Art. 18, 43 D.Lgs. 81/08)' },
  { id: 'nomina_primo_soccorso', nome: 'Nomina Addetto Primo Soccorso', icon: HeartPulse, categoria: 'nomine', descrizione: 'Addetto primo soccorso (Art. 45, D.M. 388/03)' },
  { id: 'nomina_rls', nome: 'Verbale Nomina RLS', icon: UserCheck, categoria: 'nomine', descrizione: 'Verbale riunione nomina RLS (Art. 47 D.Lgs. 81/08)' },
  { id: 'nomina_medico', nome: 'Nomina Medico Competente', icon: Stethoscope, categoria: 'nomine', descrizione: 'Medico Competente con protocollo sanitario (Art. 18 D.Lgs. 81/08)' },
  { id: 'nomina_rspp', nome: 'Nomina RSPP', icon: ShieldCheck, categoria: 'nomine', descrizione: 'Responsabile SPP (Artt. 17, 31-34 D.Lgs. 81/08)' },
  // Verbali
  { id: 'consegna_dpi', nome: 'Verbale Consegna DPI', icon: Shield, categoria: 'verbali', descrizione: 'Consegna DPI con tabella quantità/tipologia (MOD 01.08)' },
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
  allegati: FileAttachment[];
  inviato?: boolean;
  dataInvio?: string;
  destinatario?: string;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface ModuloCustom {
  id: string;
  nome: string;
  dataCaricamento: string;
  path?: string;
  url?: string;
  size?: number;
  mimeType?: string;
  // compatibilità vecchie versioni (URL.createObjectURL)
  fileUrl?: string;
}

const stripHtmlToText = (html: string) => {
  return html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "\n")
    .replace(/<\/?li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

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
    psc_accettazione: 'ai sensi art. 96, comma 2, D.Lgs. 81/08',
    idoneita_tecnico_professionale: 'Art. 26, c. 1; art. 90, c. 9; Allegato XVII D.Lgs. 81/2008',
    no_interdetti: 'Art. 14 del D.Lgs. 81/2008 e s.m.i.',
    oma: 'Art. 90, comma 9, lett. b) del D.Lgs. 81/2008',
    dichiarazione_81: 'D.Lgs. 81/2008 e s.m.i.',
    antimafia: 'Art. 85, comma 3, D.Lgs. n. 159/2011',
    nomina_direttore: 'Art. 90 e 97 del D.Lgs. 81/2008',
    nomina_antincendio: 'Art. 18, comma 1, lett. b) e Art. 43 D.Lgs. 81/2008',
    nomina_primo_soccorso: 'Art. 18, comma 1, lett. b) e Art. 45 D.Lgs. 81/2008 - D.M. 388/2003',
    nomina_rls: 'Art. 47 del D.Lgs. 81/2008',
    nomina_medico: 'Art. 18, comma 1, lett. a) D.Lgs. 81/2008',
    nomina_rspp: 'Artt. 17, 31, 32, 33, 34 del D.Lgs. 81/2008',
    consegna_dpi: 'Art. 18, comma 1, lett. d) e Art. 77 D.Lgs. 81/2008'
  };

  const getRiferimentoNormativo = () => {
    return RIFERIMENTI_NORMATIVI[modulo.tipoModulo as keyof typeof RIFERIMENTI_NORMATIVI] || 'D.Lgs. 81/2008 e s.m.i.';
  };

  // Generate module-specific content with justified text and proper legal formatting
  const generateModuleContent = () => {
    switch (modulo.tipoModulo) {
      case 'psc_accettazione':
        return `
          <p class="dichiarazione-corpo">
            Ai sensi e per gli effetti dell'art. 96 del Decreto legislativo 81/08, il sottoscritto <strong>${titolareNomeCompleto}</strong>, CF: <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong> nella qualità di Legale Rappresentante dell'Impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong> con sede in ${indirizzoCompleto || '_______________'}, P.IVA e C.F. <strong>${datiAzienda.partitaIva || '_______________'}</strong>, incaricata dell'esecuzione delle opere in riferimento:
          </p>

          <p class="dichiarazione-titolo">DICHIARA</p>

          <p class="dichiarazione-corpo">
            Di aver preso visione e di accettare i contenuti del Piano di Sicurezza e Coordinamento e di adeguare le attività lavorative alle prescrizioni in esso contenute, secondo quanto disposto dall'art. 96 del D.Lgs. 81/08 e ss.mm.ii. Si precisa che non si hanno proposte di integrazione da formulare.
          </p>

          ${modulo.datiForm.note ? `<p class="note-aggiuntive"><strong>Note:</strong> ${modulo.datiForm.note}</p>` : ''}
        `;

      case 'idoneita_tecnico_professionale':
        return `
          <p class="dichiarazione-corpo">
            Adempimenti in materia di sicurezza, salute e igiene negli ambienti di lavoro, ai sensi del D.Lgs. n. 81/2008 e s.m.i. (art. 26, c. 1; art. 90, c. 9; Allegato XVII). Trasmissione di informazioni e documenti per l'attestazione dell'idoneità tecnico-professionale.
          </p>

          <p class="dichiarazione-corpo">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> (${datiAzienda.provinciaNascitaTitolare || '__'}) il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong>, in qualità di Datore di Lavoro della scrivente <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, impresa appaltatrice, avente sede legale in ${indirizzoCompleto || '_______________'}, Tel. <strong>${datiAzienda.telefono || '_______________'}</strong>, Partita Iva <strong>${datiAzienda.partitaIva || '_______________'}</strong>, consapevole delle sanzioni previste dagli artt. 75 e 76 del D.P.R. 445/2000 per le ipotesi di falsità in atti e dichiarazioni mendaci,
          </p>

          <p class="dichiarazione-titolo">DICHIARA che:</p>

          <ol class="lista-dichiarazioni">
            <li>la ditta è regolarmente iscritta al Registro delle Imprese istituito della camera di commercio, industria e artigianato (CCIAA) di <strong>${datiAzienda.provincia || '_______________'}</strong> al n. <strong>${datiAzienda.partitaIva || '_______________'}</strong>;</li>
            <li>la ditta è in possesso di requisiti tecnico-professionali adeguati alla natura dei lavori/servizi affidati;</li>
            <li>è stata effettuata la valutazione dei rischi ed è stato elaborato il relativo Documento di Valutazione dei Rischi previsto dal D.Lgs. n. 81/2008 e s.m.i.;</li>
            <li>adempie agli obblighi assicurativi, previdenziali, antinfortunistici e contrattuali previsti dalle norme nazionali e locali vigenti, nonché dal CCNL <strong>${modulo.datiForm.ccnl || '_______________'}</strong> di Settore, applicato ai lavoratori dipendenti;</li>
            <li>la ditta è titolare delle seguenti posizioni previdenziali ed assicurative:
              <ul>
                <li>INPS sede di <strong>${modulo.datiForm.sedeInps || '_______________'}</strong>, Matricola <strong>${modulo.datiForm.matricolaInps || '_______________'}</strong>;</li>
                <li>INAIL sede di <strong>${modulo.datiForm.sedeInail || '_______________'}</strong>, matricola <strong>${modulo.datiForm.matricolaInail || '_______________'}</strong>;</li>
                <li>PAT nr. <strong>${modulo.datiForm.pat || '_______________'}</strong>;</li>
              </ul>
              ed è in possesso di specifico DURC (Documento unico di regolarità contributiva);</li>
            <li>la ditta non è oggetto di provvedimenti di sospensione o interdittivi di cui all'art. 14 del D.Lgs. n. 81/2008 e s.m.i.;</li>
            <li>le attrezzature, i macchinari, gli impianti e le opere provvisionali utilizzati sono conformi alle disposizioni del D.Lgs. n. 81/2008 e s.m.i.;</li>
            <li>l'organico medio annuo (OMA), distinto per qualifica e relativo all'ultimo anno è:
              <ul>
                <li>Impiegati: <strong>${modulo.datiForm.impiegati || '___'}</strong></li>
                <li>Operai: <strong>${modulo.datiForm.operai || '___'}</strong></li>
                <li>Totale: <strong>${modulo.datiForm.organicoMedio || '___'}</strong></li>
              </ul>
            </li>
          </ol>
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

      case 'antimafia':
        return `
          <p class="dichiarazione-titolo">DICHIARAZIONE SOSTITUTIVA DI CERTIFICAZIONE</p>
          <p class="dichiarazione-subtitle">(D.P.R. n. 445/2000)</p>

          <p class="dichiarazione-corpo">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong> nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> Prov. (${datiAzienda.provinciaNascitaTitolare || '__'}) il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong> residente a <strong>${datiAzienda.citta || '_______________'}</strong> (${datiAzienda.provincia || '__'}) via <strong>${datiAzienda.residenzaTitolare || '_______________'}</strong> Codice Fiscale <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong>, in qualità di Legale Rappresentante della società <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>
          </p>

          <p class="dichiarazione-corpo">
            consapevole delle sanzioni penali in caso di dichiarazioni false e della conseguente decadenza dai benefici eventualmente conseguiti (ai sensi degli artt. 75 e 76 del D.P.R. 445/2000) sotto la propria responsabilità
          </p>

          <p class="dichiarazione-titolo">DICHIARA</p>

          <p class="dichiarazione-corpo">
            ai sensi dell'art. 85, comma 3, del D.Lgs. n. 159/2011:
          </p>

          ${modulo.datiForm.haFamiliariConviventi ? `
          <p class="dichiarazione-corpo">
            ☒ di avere i seguenti familiari conviventi di maggiore età:
          </p>
          <table class="tabella-dati">
            <tr><td><strong>Nome:</strong></td><td>${modulo.datiForm.nomeFamiliare1 || '_______________'}</td></tr>
            <tr><td><strong>Cognome:</strong></td><td>${modulo.datiForm.cognomeFamiliare1 || '_______________'}</td></tr>
            <tr><td><strong>Luogo e data di nascita:</strong></td><td>${modulo.datiForm.nascitaFamiliare1 || '_______________'}</td></tr>
            <tr><td><strong>Residenza:</strong></td><td>${modulo.datiForm.residenzaFamiliare1 || '_______________'}</td></tr>
            <tr><td><strong>Codice fiscale:</strong></td><td>${modulo.datiForm.cfFamiliare1 || '_______________'}</td></tr>
          </table>
          ` : `
          <p class="dichiarazione-corpo">
            ☒ di NON avere familiari conviventi di maggiore età.
          </p>
          `}

          <p class="dichiarazione-corpo dichiarazione-footer">
            Il/la sottoscritto/a dichiara inoltre di essere informato/a, ai sensi del D.Lgs. n. 196/2003 (codice in materia di protezione di dati personali) che i dati personali raccolti saranno trattati, anche con strumenti informatici, esclusivamente nell'ambito del procedimento per il quale la presente dichiarazione viene resa.
          </p>
        `;

      case 'consegna_dpi':
        const dpiConsegnati = DPI_STANDARD.filter(dpi => modulo.datiForm[`dpi_${dpi.id}`]);

        return `
          <p class="dichiarazione-oggetto">
            <strong>OGGETTO:</strong> FORNITURA DEI DISPOSITIVI DI PROTEZIONE INDIVIDUALI (DPI) SECONDO QUANTO PREVISTO DAL DECRETO LEGISLATIVO 81/2008 IN MATERIA DI IGIENE E DI SICUREZZA NEI LUOGHI DI LAVORO.
          </p>

          <p class="dichiarazione-corpo">
            In relazione a quanto stabilito dall'art. 18, comma 1, lettera d) e dall'art. 77 del D. Lgs. 81/2008, a seguito della Valutazione dei Rischi in relazione allo svolgimento dell'attività lavorativa nonché alle mansioni a Lei assegnate, Le vengono forniti i sotto elencati dispositivi di protezione individuali.
          </p>

          <p class="dichiarazione-corpo">
            Secondo il dettato dell'art. 76, commi 1 e 2 del D. Lgs. 81/2008, i DPI a Sua disposizione sono conformi alle norme di cui al Titolo III - Capo II e dell'allegato VIII del D. Lgs. 81/08 e sue successive modificazioni e risultano:
          </p>

          <ul class="lista-puntata">
            <li>essere adeguati ai rischi da prevenire, senza comportare di per sé un rischio maggiore;</li>
            <li>essere adeguati alle condizioni esistenti sul luogo di lavoro;</li>
            <li>tenere conto delle esigenze ergonomiche o di salute;</li>
            <li>essere adattabili all'utilizzatore secondo le sue necessità.</li>
          </ul>

          <p class="dichiarazione-corpo">
            Inoltre, Le è fatto obbligo di (art. 78, D.Lgs. 81/2008):
          </p>

          <ul class="lista-puntata">
            <li>sottoporsi ai programmi di Formazione e Addestramento organizzati dall'Azienda;</li>
            <li>utilizzare in modo appropriato i DPI messi a disposizione conformemente all'Informazione, Formazione ed Addestramento ricevuto;</li>
            <li>provvedere alla cura dei DPI messi a disposizione;</li>
            <li>non apportare modifiche di propria iniziativa;</li>
            <li>al termine dell'utilizzo riconsegnare i DPI secondo la procedura aziendale;</li>
            <li>segnalare immediatamente al datore di lavoro o al dirigente o al preposto qualsiasi difetto o inconveniente rilevato nei DPI messi a disposizione.</li>
          </ul>

          <table class="tabella-dpi">
            <tr><th>QUANTITÀ</th><th>TIPOLOGIA DPI</th><th>SCADENZA/SPECIFICHE TECNICHE/NOTE</th></tr>
            ${dpiConsegnati.map(dpi => `<tr><td>${modulo.datiForm[`qty_${dpi.id}`] || '1'}</td><td>${dpi.nome} (${dpi.normativa})</td><td>${modulo.datiForm[`note_${dpi.id}`] || ''}</td></tr>`).join('')}
          </table>

          <p class="dichiarazione-corpo dichiarazione-footer">
            Il lavoratore sig. <strong>${lavoratore ? `${lavoratore.cognome} ${lavoratore.nome}` : '_______________'}</strong> dichiara di essere stato sufficientemente informato e formato su: l'utilizzo dei DPI; i rischi delle lavorazioni per le quali devono essere impiegati. Si impegna ad utilizzare i DPI conformemente all'informazione e alla formazione ricevuta, di conservarli con cura, non apporvi modifiche di propria iniziativa, di segnalare immediatamente qualsiasi difetto o inconveniente che venga rilevato. È consapevole sia delle sanzioni stabilite dal D.Lgs. 81/2008 e s.m.i., art. 59 (ammenda da € 200 a € 600) a carico di chi non utilizza o utilizza in modo non appropriato i DPI messi a disposizione, sia delle sanzioni disciplinari previste dal CCNL.
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
              riferimento: 'ai sensi dell\'art. 47 del D.Lgs. 81/2008',
              compiti: 'la rappresentanza dei lavoratori per quanto concerne gli aspetti della salute e della sicurezza durante il lavoro',
              isVerbale: true
            },
            medico: {
              titolo: 'MEDICO COMPETENTE',
              riferimento: 'ai sensi dell\'art. 18, comma 1, lettera a) del D.Lgs. 81/2008',
              compiti: 'la sorveglianza sanitaria dei lavoratori, la collaborazione con il Datore di Lavoro e con il Servizio di Prevenzione e Protezione, la visita degli ambienti di lavoro e tutte le attività di cui all\'art. 25 del D.Lgs. 81/2008',
              sorveglianzaSanitaria: true
            },
            rspp: {
              titolo: 'RESPONSABILE DEL SERVIZIO DI PREVENZIONE E PROTEZIONE (RSPP)',
              riferimento: 'ai sensi degli artt. 17, comma 1, lettera b), 31, 32, 33 e 34 del D.Lgs. 81/2008',
              compiti: 'il coordinamento del Servizio di Prevenzione e Protezione, l\'individuazione dei fattori di rischio, l\'elaborazione delle misure preventive e protettive, la predisposizione dei programmi di informazione e formazione, e tutte le attività di cui all\'art. 33 del D.Lgs. 81/2008'
            }
          }[tipoNomina] || { titolo: 'INCARICATO', riferimento: 'ai sensi del D.Lgs. 81/2008', compiti: 'lo svolgimento delle mansioni assegnate' };

          // Verbale per RLS (formato specifico come da documento)
          if (tipoNomina === 'rls') {
            return `
              <p class="dichiarazione-titolo">VERBALE DI NOMINA DEL RAPPRESENTANTE DEI LAVORATORI</p>
              <p class="dichiarazione-subtitle">${nominaConfig.riferimento}</p>

              <p class="dichiarazione-corpo">
                Il giorno <strong>${modulo.datiForm.dataRiunione ? formatDate(modulo.datiForm.dataRiunione) : formatDate(modulo.dataCompilazione)}</strong> alle ore <strong>${modulo.datiForm.oraRiunione || '___:___'}</strong> presso la sede della società <strong>${datiAzienda.ragioneSociale || '_______________'}</strong> sita a <strong>${datiAzienda.citta || '_______________'}</strong> in via <strong>${datiAzienda.sedeLegale || '_______________'}</strong>, si sono riuniti tutti i dipendenti della ditta medesima al fine di ottemperare gli obblighi previsti per l'elezione del rappresentante dei lavoratori per la sicurezza. Dopo approfondita discussione e confronto tra tutti gli intervenuti, si è giunti alla seguente conclusione:
              </p>

              <p class="dichiarazione-titolo">NOMINA DEL RAPPRESENTANTE DEI LAVORATORI PER LA SICUREZZA</p>

              <p class="dichiarazione-corpo">
                Quale R.L.S. è stato eletto il/la Sig./Sig.ra <strong>${lavoratore ? `${lavoratore.cognome} ${lavoratore.nome}` : '_______________'}</strong> residente in <strong>${modulo.datiForm.residenzaRls || '_______________'}</strong> (${modulo.datiForm.provinciaRls || '__'}) via <strong>${modulo.datiForm.viaRls || '_______________'}</strong> n° <strong>${modulo.datiForm.civicoRls || '___'}</strong>. Tale incarico sarà tacitamente rinnovato di anno in anno salvo disdetta da comunicarsi almeno 2 mesi prima della scadenza.
              </p>

              <p class="dichiarazione-corpo">
                Copia del presente verbale viene consegnato al datore di lavoro affinché provveda ad esporlo in visione a tutto il personale.
              </p>

              <p class="dichiarazione-firme"><strong>Firme dei partecipanti alla riunione, per conferma del contenuto del seguente verbale:</strong></p>
              
              <table class="tabella-firme">
                ${(modulo.datiForm.partecipanti || '').split('\n').filter((p: string) => p.trim()).map((p: string) => `<tr><td>${p.trim()}</td><td>________________</td></tr>`).join('')}
              </table>

              <p class="dichiarazione-corpo">
                <strong>Firma del RLS per accettazione dell'incarico:</strong>
              </p>
            `;
          }

          // Nomina Medico Competente (formato specifico)
          if (tipoNomina === 'medico') {
            return `
              <p class="dichiarazione-titolo">NOMINA DEL MEDICO COMPETENTE</p>
              <p class="dichiarazione-subtitle">${nominaConfig.riferimento}</p>

              <p class="dichiarazione-corpo">
                Il sottoscritto <strong>${titolareNomeCompleto}</strong>, legale rappresentante della ditta <strong>${datiAzienda.ragioneSociale || '_______________'}</strong> con sede legale in <strong>${indirizzoCompleto || '_______________'}</strong>, P.Iva <strong>${datiAzienda.partitaIva || '_______________'}</strong>, nomina in qualità di
              </p>

              <p class="dichiarazione-titolo">MEDICO COMPETENTE</p>

              <p class="dichiarazione-corpo">
                il/la Dott./Dott.ssa <strong>${modulo.datiForm.nomeMedico || '_______________'}</strong>, nato/a a <strong>${modulo.datiForm.luogoNascitaMedico || '_______________'}</strong> il <strong>${modulo.datiForm.dataNascitaMedico ? formatDate(modulo.datiForm.dataNascitaMedico) : '_______________'}</strong> in possesso dei titoli previsti dal D. Lgs. 81/2008 e successive modifiche ed integrazioni.
              </p>

              <p class="dichiarazione-corpo"><strong>La sorveglianza sanitaria comprende:</strong></p>

              <ol class="lista-numerata">
                <li>visita medica preventiva intesa a constatare l'assenza di controindicazioni al lavoro cui il lavoratore è destinato al fine di valutare la sua idoneità alla mansione specifica;</li>
                <li>visita medica periodica per controllare lo stato di salute dei lavoratori ed esprimere il giudizio di idoneità alla mansione specifica. La periodicità di tali accertamenti, qualora non prevista dalla relativa normativa, viene stabilita, di norma, in una volta l'anno;</li>
                <li>visita medica su richiesta del lavoratore, qualora sia ritenuta dal medico competente correlata ai rischi professionali;</li>
                <li>visita medica in occasione del cambio della mansione onde verificare l'idoneità alla mansione specifica;</li>
                <li>visita medica alla cessazione del rapporto di lavoro nei casi previsti dalla normativa vigente;</li>
                <li>visita medica preventiva in fase preassuntiva;</li>
                <li>visita medica precedente alla ripresa del lavoro, a seguito di assenza per motivi di salute di durata superiore ai sessanta giorni continuativi;</li>
                <li>sopralluoghi sui luoghi di lavoro, riunione periodica e quant'altro previsto dal D.Lgs. 81/2008 e successive modifiche ed integrazioni.</li>
              </ol>

              <p class="dichiarazione-corpo">
                La presente nomina ha validità dalla data di sottoscrizione fino alla revoca di una delle parti.
              </p>
            `;
          }

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

// Genera documento Word usando il template base caricato dall'utente
const generateWordFromTemplate = async (
  modulo: ModuloCompilato,
  moduloInfo: typeof MODULI_STANDARD[0] | undefined,
  datiAzienda: DatiAzienda,
  cantiere: any,
  impresa: any,
  lavoratore: any
) => {
  if (!datiAzienda.templateDocumentoBase) {
    throw new Error('Nessun template Word caricato');
  }

  const docData = generateProfessionalDocument(modulo, moduloInfo, datiAzienda, cantiere, impresa, lavoratore);
  const { riferimentoNormativo, titolareNomeCompleto, formatDate, content } = docData;

  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const docxParagraph = (
    text: string,
    opts: { align?: 'both' | 'center' | 'right' | 'left'; bold?: boolean; italic?: boolean; sizeHalfPt?: number } = {}
  ) => {
    const { align = 'both', bold = false, italic = false, sizeHalfPt = 20 } = opts;
    const safeText = escapeXml(text);
    return `
      <w:p>
        <w:pPr>
          <w:jc w:val="${align}"/>
          <w:spacing w:after="160" w:line="360" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
            <w:sz w:val="${sizeHalfPt}"/>
            <w:szCs w:val="${sizeHalfPt}"/>
            ${bold ? '<w:b/>' : ''}
            ${italic ? '<w:i/>' : ''}
          </w:rPr>
          <w:t xml:space="preserve">${safeText}</w:t>
        </w:r>
      </w:p>
    `;
  };

  const docxParagraphsFromText = (text: string) => {
    const normalized = (text || '').replace(/\r\n/g, '\n');
    const blocks = normalized
      .split(/\n\s*\n/g)
      .map((b) => b.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim());

    return blocks
      .flatMap((b) => (b ? [docxParagraph(b)] : [docxParagraph('')]))
      .join('');
  };

  const docxParagraphsFromLines = (text: string) => {
    const lines = (text || '').replace(/\r\n/g, '\n').split('\n');
    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return docxParagraph('');
        const isDateLine = /\b(lì|li)\b/i.test(trimmed) && /\d/.test(trimmed);
        return docxParagraph(trimmed, { align: isDateLine ? 'right' : 'left' });
      })
      .join('');
  };

  // Corpo documento: sempre incluso nel DOCX anche se il template non ha placeholder.
  const corpoTesto = stripHtmlToText(content);
  const firmaSezione = [
    '',
    `${datiAzienda.citta || '_______________'}, lì ${formatDate(modulo.dataCompilazione)}`,
    '',
    'Il Datore di Lavoro / Legale Rappresentante',
    `(${titolareNomeCompleto || '_______________'})`,
    'Firma: ________________________________',
    '',
    lavoratore ? 'Il Lavoratore / Nominato' : 'Per accettazione',
    lavoratore ? `(${lavoratore.cognome} ${lavoratore.nome})` : '(&nbsp;)',
    'Firma: ________________________________',
  ].join('\n');

  // Decode base64 template
  const base64Data = datiAzienda.templateDocumentoBase.split(',')[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const zip = new PizZip(bytes);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Prepara dati per il template - placeholders standard
  const templateData = {
    // Dati azienda
    ragione_sociale: datiAzienda.ragioneSociale || '',
    partita_iva: datiAzienda.partitaIva || '',
    codice_fiscale: datiAzienda.codiceFiscaleAzienda || '',
    sede_legale: datiAzienda.sedeLegale || '',
    cap: datiAzienda.cap || '',
    citta: datiAzienda.citta || '',
    provincia: datiAzienda.provincia || '',
    pec: datiAzienda.pec || '',
    email: datiAzienda.email || '',
    telefono: datiAzienda.telefono || '',
    rea: datiAzienda.iscrizioneREA || '',
    
    // Dati titolare
    nome_titolare: datiAzienda.nomeTitolare || '',
    cognome_titolare: datiAzienda.cognomeTitolare || '',
    titolare_completo: titolareNomeCompleto,
    cf_titolare: datiAzienda.codiceFiscaleTitolare || '',
    data_nascita_titolare: datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '',
    luogo_nascita_titolare: datiAzienda.luogoNascitaTitolare || '',
    prov_nascita_titolare: datiAzienda.provinciaNascitaTitolare || '',
    residenza_titolare: datiAzienda.residenzaTitolare || '',
    
    // Dati modulo
    tipo_modulo: moduloInfo?.nome || 'Documento',
    riferimento_normativo: riferimentoNormativo,
    data_compilazione: formatDate(modulo.dataCompilazione),
    data_firma: modulo.dataFirma ? formatDate(modulo.dataFirma) : '',
    
    // Dati cantiere
    cantiere_nome: cantiere?.nome || '',
    cantiere_codice: cantiere?.codiceCommessa || '',
    cantiere_indirizzo: cantiere?.indirizzo || '',
    committente: cantiere?.committente || '',
    
    // Dati impresa (se presente)
    impresa_nome: impresa?.ragioneSociale || '',
    impresa_piva: impresa?.partitaIva || '',
    
    // Dati lavoratore (se presente)
    lavoratore_nome: lavoratore?.nome || '',
    lavoratore_cognome: lavoratore?.cognome || '',
    lavoratore_cf: lavoratore?.codiceFiscale || '',
    lavoratore_mansione: lavoratore?.mansione || '',
    lavoratore_completo: lavoratore ? `${lavoratore.cognome} ${lavoratore.nome}` : '',
    
    // Dati form specifici
    ...modulo.datiForm,

    // Contenuto in testo (se il template include {contenuto_testo})
    contenuto_testo: corpoTesto,
    
    // Data odierna
    data_oggi: formatDate(new Date().toISOString().slice(0, 10)),
    luogo: datiAzienda.citta || '',
  };

  doc.render(templateData);

  // Se il template non contiene un placeholder per il contenuto, inseriamo comunque il corpo nel document.xml
  // (così il file non risulta “vuoto” con sola carta intestata).
  try {
    const zipOut = doc.getZip();
    const docXmlFile = zipOut.file('word/document.xml');
    if (docXmlFile) {
      const xml = docXmlFile.asText();

      // Evita duplicazioni se il contenuto è già finito nel documento via placeholder.
      const snippet = corpoTesto.replace(/\s+/g, ' ').trim().slice(0, 80);
      const snippetEscaped = escapeXml(snippet);
      const alreadyHasBody = snippet && xml.includes(snippetEscaped);

      if (!alreadyHasBody) {
        const insertAt = (() => {
          const sectIdx = xml.lastIndexOf('<w:sectPr');
          if (sectIdx > -1) return sectIdx;
          const bodyEnd = xml.lastIndexOf('</w:body>');
          return bodyEnd > -1 ? bodyEnd : xml.length;
        })();

        const injectedXml = [
          docxParagraph(moduloInfo?.nome || 'Documento', { align: 'center', bold: true, sizeHalfPt: 24 }),
          docxParagraph(riferimentoNormativo || '', { align: 'center', italic: true, sizeHalfPt: 18 }),
          docxParagraph(''),
          docxParagraphsFromText(corpoTesto),
          docxParagraph(''),
          docxParagraphsFromLines(firmaSezione),
        ].join('');

        const newXml = `${xml.slice(0, insertAt)}${injectedXml}${xml.slice(insertAt)}`;
        zipOut.file('word/document.xml', newXml);
      }
    }
  } catch (e) {
    // Non bloccare il download: in caso di template complesso, si mantiene l'output renderizzato.
    console.warn('DOCX inject warning:', e);
  }
  
  const out = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  
  return out;
};

// Generate professional PDF with letterhead - uses the document content generator
// Se templateDocumentoBase e presente, usa quello come base, altrimenti usa i dati azienda
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

  const hasHeaderImage = !!datiAzienda.cartaIntestataHeader;
  const hasFooterImage = !!datiAzienda.cartaIntestataFooter;
  const stampX = typeof datiAzienda.timbroPositionX === 'number' ? datiAzienda.timbroPositionX : null;
  const stampY = typeof datiAzienda.timbroPositionY === 'number' ? datiAzienda.timbroPositionY : null;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>${moduloInfo?.nome || 'Documento'}</title>
      <style>
        @page {
          size: A4;
          margin: 25mm 20mm 25mm 20mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
          text-align: justify;
        }
        .page-container {
          min-height: auto;
          max-height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0;
          position: relative;
          padding-bottom: 20mm;
        }
        .letterhead-image {
          width: 100%;
          max-height: 95px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .letterhead-footer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding-top: 10px;
        }
        .letterhead-footer img {
          width: 100%;
          max-height: 70px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          padding-bottom: 15px;
          border-bottom: 1px solid #333;
          margin-bottom: 25px;
        }
        .company-name {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .company-info {
          font-size: 9pt;
          color: #333;
          line-height: 1.3;
        }
        .document-title {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          margin: 30px 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .document-subtitle {
          text-align: center;
          font-size: 9pt;
          color: #444;
          margin-bottom: 25px;
          font-style: italic;
        }
        .content {
          flex: 1;
          text-align: justify;
        }
        .cantiere-info {
          background: #f8f8f8;
          padding: 12px 15px;
          border-left: 3px solid #333;
          margin-bottom: 25px;
        }
        .cantiere-info p {
          margin: 4px 0;
          font-size: 10pt;
        }
        .dichiarazione-intro, .dichiarazione-premessa, .dichiarazione-corpo {
          text-align: justify;
          margin-bottom: 15px;
          line-height: 1.6;
        }
        .dichiarazione-corpo {
          text-indent: 25px;
        }
        .dichiarazione-premessa {
          font-style: italic;
        }
        .dichiarazione-titolo {
          text-align: center;
          font-weight: bold;
          font-size: 12pt;
          margin: 25px 0;
          letter-spacing: 2px;
        }
        .date-place {
          text-align: right;
          margin: 30px 0;
          font-size: 10pt;
        }
        .signature-section {
          margin-top: 20px;
          page-break-inside: avoid;
          position: relative;
          padding-bottom: 15mm;
        }
        .signature-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .signature-box {
          width: 45%;
          text-align: center;
          position: relative;
          min-height: 140px;
        }
        .signature-label {
          font-size: 10pt;
          margin-bottom: 5px;
        }
        .signature-name {
          font-size: 9pt;
          color: #444;
          margin-bottom: 40px;
        }
        .signature-line {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          border-top: 1px solid #333;
          padding-top: 5px;
          font-size: 8pt;
          color: #666;
        }
        .stamp-container {
          position: absolute;
          width: 120px;
          height: 120px;
          left: 50%;
          bottom: 28px; /* sopra la riga firma */
          transform: translateX(-50%);
        }
        .stamp-image {
          max-width: 100px;
          max-height: 100px;
          object-fit: contain;
        }
        .footer {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 8pt;
          color: #666;
        }
        strong { font-weight: bold; }
        p { margin: 0 0 10px 0; }
        ol, ul { margin: 10px 0 10px 25px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="page-container">
        <!-- Header: usa immagine carta intestata se presente, altrimenti dati azienda -->
        ${hasHeaderImage ? `
          <img src="${datiAzienda.cartaIntestataHeader}" alt="Carta intestata" class="letterhead-image" />
          <div style="height: 10px;"></div>
        ` : `
          <div class="header">
            <div class="company-name">${datiAzienda.ragioneSociale || 'AZIENDA'}</div>
            <div class="company-info">
              ${indirizzoCompleto ? `${indirizzoCompleto}<br/>` : ''}
              ${datiAzienda.partitaIva ? `P.IVA: ${datiAzienda.partitaIva}` : ''} ${datiAzienda.codiceFiscaleAzienda ? `- C.F.: ${datiAzienda.codiceFiscaleAzienda}` : ''}<br/>
              ${datiAzienda.iscrizioneREA ? `REA: ${datiAzienda.iscrizioneREA}<br/>` : ''}
              ${datiAzienda.telefono ? `Tel: ${datiAzienda.telefono}` : ''} ${datiAzienda.email ? `- Email: ${datiAzienda.email}` : ''}<br/>
              ${datiAzienda.pec ? `PEC: ${datiAzienda.pec}` : ''}
            </div>
          </div>
        `}

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

        <!-- Signature Section - con firma e timbro posizionati correttamente -->
        <div class="signature-section">
          <div class="signature-row">
            <div class="signature-box">
              <p class="signature-label">Il Datore di Lavoro / Legale Rappresentante</p>
              <p class="signature-name">(${titolareNomeCompleto || '_______________'})</p>
              ${datiAzienda.timbro ? `
              <div class="stamp-container">
                <img src="${datiAzienda.timbro}" class="stamp-image" alt="Timbro aziendale" />
              </div>
              ` : ''}
              <div class="signature-line">Firma</div>
            </div>
            <div class="signature-box">
              <p class="signature-label">${lavoratore ? 'Il Lavoratore / Nominato' : 'Per accettazione'}</p>
              <p class="signature-name">${lavoratore ? `(${lavoratore.cognome} ${lavoratore.nome})` : '(&nbsp;)'}</p>
              <div class="signature-line">Firma</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        ${hasFooterImage ? `
          <div class="letterhead-footer">
            <img src="${datiAzienda.cartaIntestataFooter}" alt="Footer carta intestata" />
          </div>
        ` : `
          <div class="footer">
            <p>${datiAzienda.ragioneSociale || ''} ${datiAzienda.partitaIva ? `- P.IVA ${datiAzienda.partitaIva}` : ''}</p>
            <p>Documento generato il ${formatDate(new Date().toISOString().slice(0, 10))}</p>
          </div>
        `}
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

export default function SafetyFormsModule() {
  const { cantieri, imprese, lavoratori, datiAzienda } = useWorkHub();
  const { toast } = useToast();

  const { uploadFile: uploadCustomFile, deleteFile: deleteCustomFile } = useFileUpload({
    bucket: 'documenti',
    folder: 'compliance/sicurezza/moduli-custom',
  });

  const [activeModulo, setActiveModulo] = useState<string | null>(null);
  const [moduliCompilati, setModuliCompilati] = useState<ModuloCompilato[]>(() => {
    const saved = localStorage.getItem('safety_moduli_compilati');
    return saved ? JSON.parse(saved) : [];
  });
  const [moduliCustom, setModuliCustom] = useState<ModuloCustom[]>(() => {
    const saved = localStorage.getItem('safety_moduli_custom');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((m: any) => ({
            ...m,
            // migrazione: vecchio shape {fileUrl}
            url: m.url || m.fileUrl,
          }))
        : [];
    } catch {
      return [];
    }
  });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedCantiere, setSelectedCantiere] = useState('');
  const [selectedImpresa, setSelectedImpresa] = useState('');
  const [selectedLavoratore, setSelectedLavoratore] = useState('');
  const [viewingModulo, setViewingModulo] = useState<ModuloCompilato | null>(null);
  const [editingModuloId, setEditingModuloId] = useState<string | null>(null);
  
  // Post-creation actions state
  const [showPostCreationDialog, setShowPostCreationDialog] = useState(false);
  const [lastCreatedModulo, setLastCreatedModulo] = useState<ModuloCompilato | null>(null);
  
  // Allegati management state
  const [showAllegatiDialog, setShowAllegatiDialog] = useState(false);
  const [selectedModuloForAllegati, setSelectedModuloForAllegati] = useState<ModuloCompilato | null>(null);
  
  // Invio modulo state
  const [showInvioDialog, setShowInvioDialog] = useState(false);
  const [invioDestinatario, setInvioDestinatario] = useState('');
  
  // Custom module viewing/replacing
  const [viewingCustomModulo, setViewingCustomModulo] = useState<ModuloCustom | null>(null);
  const [replacingCustomModuloId, setReplacingCustomModuloId] = useState<string | null>(null);

  // Auto-save moduli compilati
  useEffect(() => {
    localStorage.setItem('safety_moduli_compilati', JSON.stringify(moduliCompilati));
  }, [moduliCompilati]);

  // Auto-save moduli custom
  useEffect(() => {
    localStorage.setItem('safety_moduli_custom', JSON.stringify(moduliCustom));
  }, [moduliCustom]);

  // Stats for dashboard integration
  const stats = useMemo(() => ({
    totaleModuli: moduliCompilati.length,
    firmati: moduliCompilati.filter(m => m.firmato).length,
    daFirmare: moduliCompilati.filter(m => !m.firmato).length,
    inviati: moduliCompilati.filter(m => m.inviato).length,
    perTipo: MODULI_STANDARD.map(tipo => ({
      tipo: tipo.id,
      nome: tipo.nome,
      count: moduliCompilati.filter(m => m.tipoModulo === tipo.id).length
    })).filter(t => t.count > 0)
  }), [moduliCompilati]);

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
    setEditingModuloId(null);
    setShowFormDialog(true);
  };

  const handleEditModulo = (modulo: ModuloCompilato) => {
    setActiveModulo(modulo.tipoModulo);
    setSelectedCantiere(modulo.cantiereId);
    setSelectedImpresa(modulo.impresaId || '');
    setSelectedLavoratore(modulo.lavoratoreId || '');
    setFormData({ ...modulo.datiForm });
    setEditingModuloId(modulo.id);
    setShowFormDialog(true);
  };

  const handleSaveForm = () => {
    if (!selectedCantiere) {
      toast({ title: 'Seleziona un cantiere', variant: 'destructive' });
      return;
    }

    if (editingModuloId) {
      const updated = moduliCompilati.map(m =>
        m.id === editingModuloId
          ? {
              ...m,
              cantiereId: selectedCantiere,
              impresaId: selectedImpresa || undefined,
              lavoratoreId: selectedLavoratore || undefined,
              datiForm: { ...formData },
            }
          : m
      );
      setModuliCompilati(updated);
      localStorage.setItem('safety_moduli_compilati', JSON.stringify(updated));
      toast({ title: 'Modulo aggiornato' });
      setShowFormDialog(false);
      resetForm();
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
      datiForm: { ...formData },
      allegati: []
    };

    const updated = [...moduliCompilati, newModulo];
    setModuliCompilati(updated);
    localStorage.setItem('safety_moduli_compilati', JSON.stringify(updated));
    
    // Show post-creation actions
    setLastCreatedModulo(newModulo);
    setShowPostCreationDialog(true);
    
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

  // Download come Word usando il template caricato
  const handleDownloadWord = async (modulo: ModuloCompilato) => {
    const moduloInfo = getModuloInfo(modulo.tipoModulo);
    const cantiere = getCantiere(modulo.cantiereId);
    const impresa = getImpresa(modulo.impresaId || '');
    const lavoratore = getLavoratore(modulo.lavoratoreId || '');

    if (!datiAzienda.templateDocumentoBase) {
      toast({ 
        title: 'Template Word non trovato', 
        description: 'Carica un template Word in Impostazioni → Dati Azienda per esportare in formato Word',
        variant: 'destructive' 
      });
      return;
    }

    try {
      const blob = await generateWordFromTemplate(modulo, moduloInfo, datiAzienda, cantiere, impresa, lavoratore);
      const fileName = `${moduloInfo?.nome || 'Documento'}_${cantiere?.codiceCommessa || ''}_${modulo.dataCompilazione}.docx`;
      saveAs(blob, fileName);
      toast({ title: 'Documento Word scaricato con successo' });
    } catch (error) {
      console.error('Errore generazione Word:', error);
      toast({ 
        title: 'Errore generazione Word', 
        description: 'Verifica che il template Word sia valido',
        variant: 'destructive' 
      });
    }
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

    // Nota: i .doc non sono supportati dal flusso di generazione/modifica.
    const isValid =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx');

    if (!isValid) {
      toast({ title: 'Formato non supportato', description: 'Carica solo PDF o Word .DOCX', variant: 'destructive' });
      return;
    }

    // upload su storage per mantenere visibile/modificabile anche dopo refresh
    (async () => {
      const result = await uploadCustomFile(file);
      if (!result) return;

      const newCustom: ModuloCustom = {
        id: generateId(),
        nome: result.name,
        dataCaricamento: new Date().toISOString().slice(0, 10),
        path: result.path,
        url: result.url,
        size: result.size,
        mimeType: result.type,
      };

      setModuliCustom(prev => [...prev, newCustom]);
      toast({ title: 'Modulo caricato con successo' });
      setShowUploadDialog(false);
    })();
  };

  // Sostituisci modulo custom (rimpiazza file)
  const handleReplaceCustom = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingCustomModuloId) return;

    const isValid =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx');

    if (!isValid) {
      toast({ title: 'Formato non supportato', description: 'Carica solo PDF o Word .DOCX', variant: 'destructive' });
      setReplacingCustomModuloId(null);
      return;
    }

    const result = await uploadCustomFile(file);
    if (!result) {
      setReplacingCustomModuloId(null);
      return;
    }

    setModuliCustom(prev => prev.map(m =>
      m.id === replacingCustomModuloId
        ? {
            ...m,
            nome: result.name,
            path: result.path,
            url: result.url,
            size: result.size,
            mimeType: result.type,
            dataCaricamento: new Date().toISOString().slice(0, 10),
          }
        : m
    ));
    toast({ title: 'Modulo sostituito con successo' });
    setReplacingCustomModuloId(null);
    e.target.value = '';
  };

  const resetForm = () => {
    setActiveModulo(null);
    setFormData({});
    setSelectedCantiere('');
    setSelectedImpresa('');
    setSelectedLavoratore('');
    setEditingModuloId(null);
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
                        {datiAzienda.templateDocumentoBase && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadWord(modulo)}
                            className="gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            Word
                          </Button>
                        )}
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
                        {modulo.mimeType?.includes('pdf') ? 'PDF' : modulo.mimeType?.includes('word') || modulo.mimeType?.includes('docx') ? 'DOCX' : 'FILE'} • {formatDateFull(modulo.dataCaricamento)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewingCustomModulo(modulo);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizza
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(modulo.url || modulo.fileUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Scarica
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setReplacingCustomModuloId(modulo.id);
                        document.getElementById('replace-custom-input')?.click();
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sostituisci
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

      {/* View Modulo Dialog - con preview HTML reale */}
      <Dialog open={!!viewingModulo} onOpenChange={(open) => !open && setViewingModulo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {viewingModulo && getModuloInfo(viewingModulo.tipoModulo)?.nome}
            </DialogTitle>
          </DialogHeader>
          {viewingModulo && (
            <div className="flex-1 overflow-auto space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              {/* Anteprima documento HTML */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Anteprima documento:</h4>
                <HtmlPreviewFrame
                  html={generateProfessionalPDF(
                    viewingModulo,
                    getModuloInfo(viewingModulo.tipoModulo),
                    datiAzienda,
                    getCantiere(viewingModulo.cantiereId),
                    getImpresa(viewingModulo.impresaId || ''),
                    getLavoratore(viewingModulo.lavoratoreId || '')
                  )}
                  className="h-[50vh]"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setViewingModulo(null)}>
              Chiudi
            </Button>
            {viewingModulo && (
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="secondary"
                  onClick={() => { 
                    handleEditModulo(viewingModulo); 
                    setViewingModulo(null); 
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica
                </Button>
                <Button onClick={() => { handleDownloadPDF(viewingModulo); }}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                {datiAzienda.templateDocumentoBase && (
                  <Button variant="secondary" onClick={() => { handleDownloadWord(viewingModulo); }}>
                    <FileText className="w-4 h-4 mr-2" />
                    Word
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allegati Dialog */}
      <Dialog open={showAllegatiDialog} onOpenChange={setShowAllegatiDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Allegati Modulo
            </DialogTitle>
          </DialogHeader>
          {selectedModuloForAllegati && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {getModuloInfo(selectedModuloForAllegati.tipoModulo)?.nome} - {getCantiere(selectedModuloForAllegati.cantiereId)?.nome}
              </div>
              
              <div className="space-y-2">
                {selectedModuloForAllegati.allegati.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nessun allegato</p>
                ) : (
                  selectedModuloForAllegati.allegati.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => window.open(file.url, '_blank')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const updated = moduliCompilati.map(m => 
                            m.id === selectedModuloForAllegati.id 
                              ? { ...m, allegati: m.allegati.filter(a => a.id !== file.id) }
                              : m
                          );
                          setModuliCompilati(updated);
                          setSelectedModuloForAllegati(updated.find(m => m.id === selectedModuloForAllegati.id) || null);
                        }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4">
                <Label>Aggiungi allegato</Label>
                <Input 
                  type="file"
                  className="mt-2"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const newAllegato: FileAttachment = {
                      id: generateId(),
                      name: file.name,
                      url: URL.createObjectURL(file),
                      type: file.type,
                      uploadedAt: new Date().toISOString()
                    };
                    
                    const updated = moduliCompilati.map(m => 
                      m.id === selectedModuloForAllegati.id 
                        ? { ...m, allegati: [...m.allegati, newAllegato] }
                        : m
                    );
                    setModuliCompilati(updated);
                    setSelectedModuloForAllegati(updated.find(m => m.id === selectedModuloForAllegati.id) || null);
                    toast({ title: 'Allegato aggiunto' });
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invio Modulo Dialog */}
      <Dialog open={showInvioDialog} onOpenChange={setShowInvioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Invia Modulo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Registra l'invio di questo modulo al destinatario.
            </p>
            <div>
              <Label>Destinatario</Label>
              <Select value={invioDestinatario} onValueChange={setInvioDestinatario}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona destinatario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cse">CSE - Coordinatore Sicurezza Esecuzione</SelectItem>
                  <SelectItem value="committente">Committente</SelectItem>
                  <SelectItem value="dl">Direttore Lavori</SelectItem>
                  <SelectItem value="impresa">Impresa Affidataria</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvioDialog(false)}>
              Annulla
            </Button>
            <Button onClick={() => {
              if (selectedModuloForAllegati && invioDestinatario) {
                setModuliCompilati(moduliCompilati.map(m => 
                  m.id === selectedModuloForAllegati.id 
                    ? { ...m, inviato: true, dataInvio: new Date().toISOString().slice(0, 10), destinatario: invioDestinatario }
                    : m
                ));
                toast({ title: 'Invio registrato', description: `Modulo inviato a ${invioDestinatario.toUpperCase()}` });
                setShowInvioDialog(false);
                setInvioDestinatario('');
              }
            }} className="gap-2">
              <Send className="w-4 h-4" />
              Registra Invio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden input for replacing custom modules */}
      <input
        id="replace-custom-input"
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleReplaceCustom}
      />

      {/* FileViewerModal for custom modules */}
      <FileViewerModal
        open={!!viewingCustomModulo}
        onOpenChange={(open) => !open && setViewingCustomModulo(null)}
        file={viewingCustomModulo ? {
          name: viewingCustomModulo.nome,
          url: viewingCustomModulo.url || viewingCustomModulo.fileUrl || '',
          size: viewingCustomModulo.size,
          type: viewingCustomModulo.mimeType,
          path: viewingCustomModulo.path,
        } : null}
        allowDelete={false}
      />

      {/* Post-Creation Actions - integrazione con ecosistema */}
      {lastCreatedModulo && (
        <PostCreationActions
          open={showPostCreationDialog}
          onOpenChange={(open) => {
            setShowPostCreationDialog(open);
            if (!open) setLastCreatedModulo(null);
          }}
          entityType="documento"
          entityId={lastCreatedModulo.id}
          entityName={getModuloInfo(lastCreatedModulo.tipoModulo)?.nome || 'Modulo Sicurezza'}
          availableActions={['link_cantiere', 'link_impresa', 'notify', 'upload']}
        />
      )}

      {/* Stats Summary Card for Dashboard Integration */}
      {stats.totaleModuli > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="p-3 bg-card border border-border rounded-xl shadow-lg">
            <div className="flex items-center gap-3 text-sm">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div>
                <span className="font-medium">{stats.totaleModuli}</span> moduli
                <span className="mx-1 text-muted-foreground">|</span>
                <span className="text-emerald-500">{stats.firmati} firmati</span>
                <span className="mx-1 text-muted-foreground">|</span>
                <span className="text-amber-500">{stats.daFirmare} da firmare</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
