import { useState } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { formatDateFull, generateId } from '@/types/workhub';
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
  Eye
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

export default function SafetyFormsModule() {
  const { cantieri, imprese, lavoratori } = useWorkHub();
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

  const getModuloInfo = (id: string) => MODULI_STANDARD.find(m => m.id === id);
  const getCantiere = (id: string) => cantieri.find(c => c.id === id);
  const getImpresa = (id: string) => imprese.find(i => i.id === id);
  const getLavoratore = (id: string) => lavoratori.find(l => l.id === id);

  const handleOpenForm = (moduloId: string) => {
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
    // Generate PDF content
    const moduloInfo = getModuloInfo(modulo.tipoModulo);
    const cantiere = getCantiere(modulo.cantiereId);
    const impresa = getImpresa(modulo.impresaId || '');
    const lavoratore = getLavoratore(modulo.lavoratoreId || '');

    // Create printable content
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${moduloInfo?.nome}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; }
          .title { font-size: 18px; margin-top: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .field { margin-bottom: 8px; }
          .field-label { font-weight: 500; }
          .signature-area { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; border-top: 1px solid #333; padding-top: 10px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${impresa?.ragioneSociale || 'AZIENDA'}</div>
          <div class="title">${moduloInfo?.nome?.toUpperCase()}</div>
          <div>ai sensi del D.Lgs 81/2008 e s.m.i.</div>
        </div>
        
        <div class="section">
          <div class="section-title">DATI CANTIERE</div>
          <div class="field"><span class="field-label">Cantiere:</span> ${cantiere?.nome || '-'}</div>
          <div class="field"><span class="field-label">Codice Commessa:</span> ${cantiere?.codiceCommessa || '-'}</div>
          <div class="field"><span class="field-label">Indirizzo:</span> ${cantiere?.indirizzo || '-'}</div>
        </div>

        ${impresa ? `
        <div class="section">
          <div class="section-title">DATI IMPRESA</div>
          <div class="field"><span class="field-label">Ragione Sociale:</span> ${impresa.ragioneSociale}</div>
          <div class="field"><span class="field-label">P.IVA:</span> ${impresa.partitaIva}</div>
          <div class="field"><span class="field-label">Sede Legale:</span> ${impresa.sedeLegale}</div>
        </div>
        ` : ''}

        ${lavoratore ? `
        <div class="section">
          <div class="section-title">DATI LAVORATORE</div>
          <div class="field"><span class="field-label">Nome e Cognome:</span> ${lavoratore.nome} ${lavoratore.cognome}</div>
          <div class="field"><span class="field-label">Codice Fiscale:</span> ${lavoratore.codiceFiscale}</div>
          <div class="field"><span class="field-label">Mansione:</span> ${lavoratore.mansione}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">CONTENUTO DEL MODULO</div>
          ${Object.entries(modulo.datiForm).map(([key, value]) => `
            <div class="field"><span class="field-label">${key.replace(/_/g, ' ')}:</span> ${value}</div>
          `).join('')}
        </div>

        <div class="signature-area">
          <div class="signature-box">
            <p>Il Datore di Lavoro / Legale Rappresentante</p>
            <p style="margin-top: 40px;">_________________________</p>
          </div>
          <div class="signature-box">
            <p>${lavoratore ? 'Il Lavoratore' : 'Per accettazione'}</p>
            <p style="margin-top: 40px;">_________________________</p>
          </div>
        </div>

        <div class="footer">
          <p>Data compilazione: ${formatDateFull(modulo.dataCompilazione)}</p>
          <p>Documento generato da E-gest - Sistema Gestione Cantieri</p>
        </div>
      </body>
      </html>
    `;

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
    toast({ title: 'Modulo firmato digitalmente' });
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
                        {c.codiceCommessa} - {c.nome}
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
                      <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Module-specific fields */}
            {renderFormFields()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowFormDialog(false); resetForm(); }}>
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
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Trascina qui il file o clicca per selezionare
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Formati supportati: PDF, DOC, DOCX
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleUploadCustom}
                className="max-w-xs mx-auto"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modulo Dialog */}
      <Dialog open={!!viewingModulo} onOpenChange={() => setViewingModulo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewingModulo && getModuloInfo(viewingModulo.tipoModulo)?.nome}
            </DialogTitle>
          </DialogHeader>
          {viewingModulo && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cantiere</p>
                  <p className="font-medium">{getCantiere(viewingModulo.cantiereId)?.nome}</p>
                </div>
                {viewingModulo.impresaId && (
                  <div>
                    <p className="text-muted-foreground">Impresa</p>
                    <p className="font-medium">{getImpresa(viewingModulo.impresaId)?.ragioneSociale}</p>
                  </div>
                )}
                {viewingModulo.lavoratoreId && (
                  <div>
                    <p className="text-muted-foreground">Lavoratore</p>
                    <p className="font-medium">
                      {getLavoratore(viewingModulo.lavoratoreId)?.cognome} {getLavoratore(viewingModulo.lavoratoreId)?.nome}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Stato</p>
                  <Badge className={viewingModulo.firmato ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}>
                    {viewingModulo.firmato ? 'Firmato' : 'Da firmare'}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Dati del modulo:</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(viewingModulo.datiForm).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingModulo(null)}>
              Chiudi
            </Button>
            {viewingModulo && (
              <Button onClick={() => { handleDownloadPDF(viewingModulo); setViewingModulo(null); }} className="gap-2">
                <Download className="w-4 h-4" />
                Scarica PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
