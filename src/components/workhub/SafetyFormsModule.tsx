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

// Generate professional PDF with letterhead
const generateProfessionalPDF = (
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
  const indirizzoCompleto = [datiAzienda.sedeLegale, datiAzienda.cap, datiAzienda.citta, datiAzienda.provincia ? `(${datiAzienda.provincia})` : ''].filter(Boolean).join(' ');

  // Generate module-specific content
  const generateModuleContent = () => {
    switch (modulo.tipoModulo) {
      case 'psc_accettazione':
        return `
          <p style="margin-bottom: 20px; line-height: 1.8;">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> (${datiAzienda.provinciaNascitaTitolare || '__'}) 
            il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong>, 
            C.F. <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong>, 
            in qualità di Legale Rappresentante dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>,
          </p>
          <p style="text-align: center; font-weight: bold; font-size: 14px; margin: 30px 0;">DICHIARA</p>
          <ul style="line-height: 2; margin-left: 20px;">
            <li>di aver preso visione del Piano di Sicurezza e Coordinamento (PSC) ${modulo.datiForm.revisionePSC ? `Rev. ${modulo.datiForm.revisionePSC}` : ''} ${modulo.datiForm.dataPSC ? `del ${formatDate(modulo.datiForm.dataPSC)}` : ''};</li>
            <li>di accettarne integralmente i contenuti;</li>
            <li>di impegnarsi a rispettare tutte le prescrizioni in esso contenute;</li>
            <li>di aver trasmesso il PSC ai propri lavoratori prima dell'inizio dei lavori.</li>
          </ul>
          ${modulo.datiForm.note ? `<p style="margin-top: 20px;"><strong>Note:</strong> ${modulo.datiForm.note}</p>` : ''}
        `;

      case 'no_interdetti':
        return `
          <p style="margin-bottom: 20px; line-height: 1.8;">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> (${datiAzienda.provinciaNascitaTitolare || '__'}) 
            il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong>, 
            C.F. <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong>, 
            in qualità di Legale Rappresentante dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>,
            consapevole delle sanzioni penali previste dall'art. 76 del D.P.R. 445/2000 in caso di dichiarazioni mendaci,
          </p>
          <p style="text-align: center; font-weight: bold; font-size: 14px; margin: 30px 0;">DICHIARA</p>
          <p style="line-height: 1.8;">
            che l'impresa non ha alle proprie dipendenze personale sottoposto a provvedimenti interdittivi o di sospensione 
            ai sensi dell'art. 14 del D.Lgs. 81/2008 e s.m.i.
          </p>
        `;

      case 'oma':
        return `
          <p style="margin-bottom: 20px; line-height: 1.8;">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, in qualità di Legale Rappresentante dell'impresa 
            <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, P.IVA <strong>${datiAzienda.partitaIva || '_______________'}</strong>,
          </p>
          <p style="text-align: center; font-weight: bold; font-size: 14px; margin: 30px 0;">DICHIARA</p>
          <p style="margin-bottom: 15px;">che l'Organico Medio Annuo dell'impresa per l'anno <strong>${modulo.datiForm.annoRiferimento || new Date().getFullYear()}</strong> è il seguente:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="border: 1px solid #333; padding: 10px; width: 50%;"><strong>Organico Medio Annuo Complessivo</strong></td>
              <td style="border: 1px solid #333; padding: 10px; text-align: center;">${modulo.datiForm.organicoMedio || '___'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #333; padding: 10px;">di cui Operai</td>
              <td style="border: 1px solid #333; padding: 10px; text-align: center;">${modulo.datiForm.operai || '___'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #333; padding: 10px;">di cui Impiegati</td>
              <td style="border: 1px solid #333; padding: 10px; text-align: center;">${modulo.datiForm.impiegati || '___'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #333; padding: 10px;"><strong>CCNL Applicato</strong></td>
              <td style="border: 1px solid #333; padding: 10px; text-align: center;">${modulo.datiForm.ccnl || '___'}</td>
            </tr>
          </table>
        `;

      case 'dichiarazione_81':
        const checks = [
          { key: 'check_0', label: 'Aver effettuato la valutazione dei rischi (DVR)' },
          { key: 'check_1', label: 'Aver nominato il RSPP' },
          { key: 'check_2', label: 'Aver nominato il Medico Competente (ove previsto)' },
          { key: 'check_3', label: 'Aver designato gli addetti alle emergenze' },
          { key: 'check_4', label: 'Aver formato i lavoratori secondo normativa' },
          { key: 'check_5', label: 'Aver fornito i DPI necessari' },
        ];
        return `
          <p style="margin-bottom: 20px; line-height: 1.8;">
            Il sottoscritto <strong>${titolareNomeCompleto}</strong>, nato a <strong>${datiAzienda.luogoNascitaTitolare || '_______________'}</strong> (${datiAzienda.provinciaNascitaTitolare || '__'}) 
            il <strong>${datiAzienda.dataNascitaTitolare ? formatDate(datiAzienda.dataNascitaTitolare) : '_______________'}</strong>, 
            C.F. <strong>${datiAzienda.codiceFiscaleTitolare || '_______________'}</strong>, 
            in qualità di Datore di Lavoro dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>,
          </p>
          <p style="text-align: center; font-weight: bold; font-size: 14px; margin: 30px 0;">DICHIARA</p>
          <p style="margin-bottom: 15px;">di ottemperare a tutti gli obblighi previsti dal D.Lgs. 81/2008 e successive modifiche e integrazioni in materia di tutela della salute e sicurezza nei luoghi di lavoro.</p>
          <p style="margin-bottom: 15px;"><strong>In particolare dichiara di:</strong></p>
          <ul style="line-height: 2; margin-left: 20px;">
            ${checks.map(c => `<li>${modulo.datiForm[c.key] ? '☑' : '☐'} ${c.label}</li>`).join('')}
          </ul>
        `;

      case 'consegna_dpi':
        const dpiConsegnati = DPI_STANDARD.filter(dpi => modulo.datiForm[`dpi_${dpi.id}`]);
        return `
          <p style="margin-bottom: 20px; line-height: 1.8;">
            In data <strong>${modulo.datiForm.dataConsegna ? formatDate(modulo.datiForm.dataConsegna) : formatDate(modulo.dataCompilazione)}</strong>, 
            presso il cantiere <strong>${cantiere?.nome || '_______________'}</strong>,
          </p>
          <p style="margin-bottom: 15px;">il Datore di Lavoro <strong>${titolareNomeCompleto}</strong> dell'impresa <strong>${datiAzienda.ragioneSociale || '_______________'}</strong> 
          ha consegnato al lavoratore <strong>${lavoratore ? `${lavoratore.cognome} ${lavoratore.nome}` : '_______________'}</strong>, 
          C.F. <strong>${lavoratore?.codiceFiscale || '_______________'}</strong>, mansione <strong>${lavoratore?.mansione || '_______________'}</strong>,
          i seguenti Dispositivi di Protezione Individuale:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #333; padding: 10px; text-align: left;">DPI</th>
              <th style="border: 1px solid #333; padding: 10px; text-align: center;">Normativa</th>
              <th style="border: 1px solid #333; padding: 10px; text-align: center;">Qtà</th>
            </tr>
            ${dpiConsegnati.map(dpi => `
              <tr>
                <td style="border: 1px solid #333; padding: 10px;">${dpi.nome}</td>
                <td style="border: 1px solid #333; padding: 10px; text-align: center;">${dpi.normativa}</td>
                <td style="border: 1px solid #333; padding: 10px; text-align: center;">${modulo.datiForm[`qty_${dpi.id}`] || '1'}</td>
              </tr>
            `).join('')}
          </table>
          
          <p style="margin-top: 20px; line-height: 1.8;">
            Il lavoratore dichiara di aver ricevuto i DPI sopra elencati e di essere stato informato sulle corrette modalità di utilizzo, 
            manutenzione e conservazione degli stessi, nonché sui rischi dai quali il DPI lo protegge.
          </p>
        `;

      default:
        // Nomine
        if (modulo.tipoModulo.startsWith('nomina_')) {
          const tipoNomina = modulo.tipoModulo.replace('nomina_', '');
          const titoloNomina = {
            direttore: 'Direttore Tecnico di Cantiere',
            antincendio: 'Addetto alla Lotta Antincendio e Gestione Emergenze',
            primo_soccorso: 'Addetto al Primo Soccorso',
            rls: 'Rappresentante dei Lavoratori per la Sicurezza (RLS)',
            medico: 'Medico Competente',
            rspp: 'Responsabile del Servizio di Prevenzione e Protezione (RSPP)'
          }[tipoNomina] || 'Incaricato';

          return `
            <p style="margin-bottom: 20px; line-height: 1.8;">
              Il sottoscritto <strong>${titolareNomeCompleto}</strong>, in qualità di Datore di Lavoro dell'impresa 
              <strong>${datiAzienda.ragioneSociale || '_______________'}</strong>, P.IVA <strong>${datiAzienda.partitaIva || '_______________'}</strong>,
            </p>
            <p style="text-align: center; font-weight: bold; font-size: 14px; margin: 30px 0;">NOMINA</p>
            <p style="margin-bottom: 20px; line-height: 1.8;">
              il Sig./Sig.ra <strong>${lavoratore ? `${lavoratore.cognome} ${lavoratore.nome}` : '_______________'}</strong>,
              C.F. <strong>${lavoratore?.codiceFiscale || '_______________'}</strong>,
            </p>
            <p style="text-align: center; font-weight: bold; margin: 20px 0;">${titoloNomina}</p>
            <p style="margin-bottom: 15px;">con decorrenza dal <strong>${modulo.datiForm.dataDecorrenza ? formatDate(modulo.datiForm.dataDecorrenza) : '_______________'}</strong></p>
            ${cantiere ? `<p style="margin-bottom: 15px;">per il cantiere: <strong>${cantiere.nome}</strong> - ${cantiere.indirizzo}</p>` : ''}
            ${modulo.datiForm.compiti ? `<p style="margin-top: 20px;"><strong>Compiti e responsabilità:</strong><br/>${modulo.datiForm.compiti}</p>` : ''}
          `;
        }
        return '<p>Contenuto del modulo</p>';
    }
  };

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${moduloInfo?.nome || 'Documento'}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm 20mm 25mm 20mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12px;
          line-height: 1.5;
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
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
          margin-bottom: 30px;
        }
        .header-image {
          max-width: 100%;
          max-height: 100px;
          object-fit: contain;
        }
        .header-text {
          margin-top: 10px;
        }
        .company-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .company-info {
          font-size: 10px;
          color: #444;
        }
        .document-title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 30px 0 10px 0;
          text-transform: uppercase;
        }
        .document-subtitle {
          text-align: center;
          font-size: 11px;
          color: #666;
          margin-bottom: 30px;
        }
        .content {
          flex: 1;
          text-align: justify;
        }
        .cantiere-info {
          background: #f8f8f8;
          padding: 15px;
          border-left: 3px solid #333;
          margin-bottom: 25px;
        }
        .cantiere-info p {
          margin: 5px 0;
        }
        .signature-area {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .signature-box {
          width: 45%;
          text-align: center;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 50px;
          padding-top: 5px;
        }
        .footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 10px;
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
          right: 60px;
          bottom: 150px;
          max-width: 150px;
          max-height: 150px;
          opacity: 0.9;
        }
        .date-place {
          text-align: right;
          margin: 30px 0;
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
                  ${datiAzienda.telefono ? `Tel: ${datiAzienda.telefono}` : ''} ${datiAzienda.email ? `- Email: ${datiAzienda.email}` : ''} ${datiAzienda.pec ? `- PEC: ${datiAzienda.pec}` : ''}
                </div>
              </div>`
          }
        </div>

        <!-- Document Title -->
        <div class="document-title">${moduloInfo?.nome || 'DICHIARAZIONE'}</div>
        <div class="document-subtitle">ai sensi del D.Lgs 81/2008 e s.m.i.</div>

        <!-- Cantiere Info -->
        ${cantiere ? `
        <div class="cantiere-info">
          <p><strong>Cantiere:</strong> ${cantiere.nome}</p>
          <p><strong>Codice Commessa:</strong> ${cantiere.codiceCommessa}</p>
          <p><strong>Indirizzo:</strong> ${cantiere.indirizzo}</p>
        </div>
        ` : ''}

        <!-- Content -->
        <div class="content">
          ${generateModuleContent()}
        </div>

        <!-- Date and Place -->
        <div class="date-place">
          ${datiAzienda.citta || '_______________'}, lì ${formatDate(modulo.dataCompilazione)}
        </div>

        <!-- Signatures -->
        <div class="signature-area">
          <div class="signature-box">
            <p>Il Datore di Lavoro / Legale Rappresentante</p>
            <p style="font-size: 10px;">(${titolareNomeCompleto || '_______________'})</p>
            <div class="signature-line">Firma</div>
          </div>
          <div class="signature-box">
            <p>${lavoratore ? 'Il Lavoratore' : 'Per accettazione'}</p>
            ${lavoratore ? `<p style="font-size: 10px;">(${lavoratore.cognome} ${lavoratore.nome})</p>` : '<p style="font-size: 10px;">&nbsp;</p>'}
            <div class="signature-line">Firma</div>
          </div>
        </div>

        ${modulo.firmato && datiAzienda.timbro ? `
        <img src="${datiAzienda.timbro}" class="stamp" alt="Timbro" style="right: ${datiAzienda.timbroPositionX || 60}px; bottom: ${datiAzienda.timbroPositionY || 150}px;" />
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

  return content;
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
