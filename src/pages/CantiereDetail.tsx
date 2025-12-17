import { useState, useRef, useMemo } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { StatCard } from '@/components/workhub/StatCard';
import { TrafficLight, StatusPill } from '@/components/workhub/StatusPill';
import { TaskTableInline } from '@/components/workhub/TaskTableInline';
import { formatDateFull, daysUntil, calculateTrafficLight, TIPI_DOCUMENTI_CANTIERE, generateId, formatDate } from '@/types/workhub';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
import {
  Construction,
  Building2,
  HardHat,
  FileText,
  FolderKanban,
  MapPin,
  Calendar,
  ChevronLeft,
  Plus,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  ShieldCheck,
  Upload,
  Download,
  Users,
  Camera,
  Clock,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function CantiereDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    cantieri,
    imprese,
    lavoratori,
    tasks,
    documenti,
    presenze,
    addDocumento,
    updateDocumento,
    deleteDocumento,
    addPresenza,
    updatePresenza,
    deletePresenza,
    getImpreseCantiere,
    getLavoratoriCantiere,
    getTasksCantiere,
    getDocumentiCantiere,
    getDocumentiImpresa,
    getPresenzeCantiere
  } = useWorkHub();

  const cantiere = cantieri.find(c => c.id === id);
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);
  const [showAddPresenzaDialog, setShowAddPresenzaDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [docForm, setDocForm] = useState({
    tipo: '',
    nome: '',
    dataEmissione: '',
    dataScadenza: '',
    note: ''
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const docFileRef = useRef<HTMLInputElement>(null);

  const [presenzaForm, setPresenzaForm] = useState({
    lavoratoreId: '',
    data: new Date().toISOString().split('T')[0],
    oraIngresso: '08:00',
    oraUscita: '17:00',
    note: ''
  });

  if (!cantiere) {
    return <Navigate to="/cantieri" replace />;
  }

  const cantiereImprese = getImpreseCantiere(cantiere.id);
  const cantiereLavoratori = getLavoratoriCantiere(cantiere.id);
  const cantiereTasks = getTasksCantiere(cantiere.id);
  const cantiereDocumenti = getDocumentiCantiere(cantiere.id);
  const cantierePresenze = getPresenzeCantiere(cantiere.id, selectedDate);

  // Separate documents by type
  const docsSicurezza = cantiereDocumenti.filter(d => 
    ['PSC (Piano Sicurezza Coordinamento)', 'PSS (Piano Sostitutivo di Sicurezza)', 'POS Ditta Affidataria', 'POS Subappaltatori', 'DUVRI', 'Verbale coordinamento', 'Verbale ispezione CSE'].includes(d.tipo)
  );
  const docsGenerali = cantiereDocumenti.filter(d => !docsSicurezza.includes(d));

  const tasksDone = cantiereTasks.filter(t => t.status === 'fatto').length;
  const tasksProgress = cantiereTasks.length > 0 
    ? Math.round((tasksDone / cantiereTasks.length) * 100) 
    : 0;

  // Calculate HSE status
  const docsStatus = calculateTrafficLight(cantiereDocumenti);
  
  // Check imprese docs
  let impreseOk = 0, impreseWarning = 0, impreseCritical = 0;
  cantiereImprese.forEach(imp => {
    const docs = getDocumentiImpresa(imp.id);
    const status = calculateTrafficLight(docs);
    if (status.color === 'green') impreseOk++;
    else if (status.color === 'yellow') impreseWarning++;
    else impreseCritical++;
  });

  const overallStatus = impreseCritical > 0 || docsStatus.color === 'red' ? 'red' :
    impreseWarning > 0 || docsStatus.color === 'yellow' ? 'yellow' : 'green';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      toast({ title: "File selezionato", description: file.name });
    }
  };

  const handleAddDocument = () => {
    if (!docForm.tipo || !docForm.nome) {
      toast({ title: "Errore", description: "Tipo e nome sono obbligatori", variant: "destructive" });
      return;
    }

    addDocumento({
      tipo: docForm.tipo,
      nome: docForm.nome,
      cantiereId: cantiere.id,
      dataEmissione: docForm.dataEmissione || undefined,
      dataScadenza: docForm.dataScadenza || undefined,
      stato: docForm.dataScadenza ? (daysUntil(docForm.dataScadenza)! < 0 ? 'scaduto' : daysUntil(docForm.dataScadenza)! <= 30 ? 'in_scadenza' : 'approvato') : 'approvato',
      note: docForm.note || undefined,
      fileName: uploadedFileName || undefined
    });

    toast({ title: "Documento aggiunto", description: `"${docForm.nome}" è stato caricato` });
    setDocForm({ tipo: '', nome: '', dataEmissione: '', dataScadenza: '', note: '' });
    setUploadedFileName('');
    setShowNewDocDialog(false);
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm('Eliminare questo documento?')) {
      deleteDocumento(docId);
      toast({ title: "Documento eliminato" });
    }
  };

  const handleAddPresenza = () => {
    if (!presenzaForm.lavoratoreId) {
      toast({ title: "Errore", description: "Seleziona un lavoratore", variant: "destructive" });
      return;
    }

    // Calculate hours
    const ingresso = presenzaForm.oraIngresso.split(':').map(Number);
    const uscita = presenzaForm.oraUscita.split(':').map(Number);
    const oreTotali = (uscita[0] + uscita[1]/60) - (ingresso[0] + ingresso[1]/60);

    addPresenza({
      cantiereId: cantiere.id,
      lavoratoreId: presenzaForm.lavoratoreId,
      data: presenzaForm.data,
      oraIngresso: presenzaForm.oraIngresso,
      oraUscita: presenzaForm.oraUscita,
      oreTotali: Math.round(oreTotali * 100) / 100,
      note: presenzaForm.note || undefined
    });

    toast({ title: "Presenza registrata" });
    setPresenzaForm({
      lavoratoreId: '',
      data: new Date().toISOString().split('T')[0],
      oraIngresso: '08:00',
      oraUscita: '17:00',
      note: ''
    });
    setShowAddPresenzaDialog(false);
  };

  // Subappalto vs Distacco
  const impreseSubappalto = cantiereImprese.filter(i => i.tipo === 'subappaltatore' || i.tipo === 'autonomo' || i.tipo === 'nolo_caldo' || i.tipo === 'consorzio');
  const impreseDistacco = cantiereImprese.filter(i => i.tipo === 'distacco');

  // All workers (internal + external) for presenze
  const allWorkers = [...cantiereLavoratori];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back & Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/cantieri"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Torna ai cantieri
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Construction className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{cantiere.nome}</h1>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  cantiere.stato === 'attivo' ? 'bg-emerald-500/20 text-emerald-500' :
                  cantiere.stato === 'sospeso' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-gray-500/20 text-gray-500'
                )}>
                  {cantiere.stato}
                </span>
              </div>
              <p className="text-muted-foreground">{cantiere.codiceCommessa} • {cantiere.committente}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrafficLight status={overallStatus} size="lg" />
          <span className={cn(
            'text-sm font-medium',
            overallStatus === 'green' ? 'text-emerald-500' :
            overallStatus === 'yellow' ? 'text-amber-500' : 'text-red-500'
          )}>
            {overallStatus === 'green' ? 'Conforme' :
             overallStatus === 'yellow' ? 'Attenzione' : 'Critico'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Imprese</span>
          </div>
          <p className="text-2xl font-bold">{cantiereImprese.length}</p>
          {impreseCritical > 0 && <p className="text-xs text-red-500">{impreseCritical} con problemi</p>}
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <HardHat className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Lavoratori</span>
          </div>
          <p className="text-2xl font-bold">{cantiereLavoratori.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Task</span>
          </div>
          <p className="text-2xl font-bold">{cantiereTasks.length}</p>
          <p className="text-xs text-emerald-500">{tasksDone} completati</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Documenti</span>
          </div>
          <p className="text-2xl font-bold">{cantiereDocumenti.length}</p>
          {docsStatus.documentiScaduti > 0 && <p className="text-xs text-red-500">{docsStatus.documentiScaduti} scaduti</p>}
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sicurezza</span>
          </div>
          <p className="text-2xl font-bold">{docsSicurezza.length}</p>
          <p className="text-xs text-muted-foreground">doc. sicurezza</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground mb-2">Avanzamento</p>
          <p className="text-2xl font-bold mb-2">{tasksProgress}%</p>
          <Progress value={tasksProgress} className="h-2" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info">Informazioni</TabsTrigger>
          <TabsTrigger value="documenti">Documenti ({cantiereDocumenti.length})</TabsTrigger>
          <TabsTrigger value="sicurezza">Sicurezza ({docsSicurezza.length})</TabsTrigger>
          <TabsTrigger value="dipendenti">Dipendenti ({cantiereLavoratori.length})</TabsTrigger>
          <TabsTrigger value="ditte">Ditte ({cantiereImprese.length})</TabsTrigger>
          <TabsTrigger value="presenze">Presenze</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Info */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-4">Dati Generali</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Indirizzo</p>
                    <p className="font-medium">{cantiere.indirizzo || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Committente</p>
                    <p className="font-medium">{cantiere.committente || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {formatDateFull(cantiere.dataApertura)} → {formatDateFull(cantiere.dataChiusuraPrevista)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Figure */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-4">Figure di Cantiere</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Direttore Lavori', value: cantiere.direttoreLavori },
                  { label: 'CSE', value: cantiere.cse },
                  { label: 'CSP', value: cantiere.csp },
                  { label: 'RUP', value: cantiere.rup },
                  { label: 'RSPP Affidataria', value: cantiere.rsppAffidataria },
                  { label: 'Preposto', value: cantiere.prepostoCantiere }
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value || '-'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Tab - Quick View */}
            <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Task Cantiere</h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/progetti')}>
                  Gestisci Task
                </Button>
              </div>
              <TaskTableInline tasks={cantiereTasks.slice(0, 5)} showCantiere={false} />
            </div>
          </div>
        </TabsContent>

        {/* Documenti Tab */}
        <TabsContent value="documenti" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Documenti Cantiere</h3>
            <Button onClick={() => setShowNewDocDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Aggiungi Documento
            </Button>
          </div>
          <div className="space-y-3">
            {docsGenerali.map(doc => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  doc.stato === 'scaduto' ? 'border-red-500/30 bg-red-500/5' :
                  doc.stato === 'in_scadenza' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-border bg-card'
                )}
              >
                <div className="flex items-center gap-4">
                  <FileText className={cn(
                    "w-5 h-5",
                    doc.stato === 'scaduto' ? 'text-red-500' :
                    doc.stato === 'in_scadenza' ? 'text-amber-500' :
                    'text-muted-foreground'
                  )} />
                  <div>
                    <p className="font-medium">{doc.tipo}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.nome}
                      {doc.fileName && <span className="ml-2">📎 {doc.fileName}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.dataScadenza && (
                    <span className="text-sm text-muted-foreground">
                      Scade: {formatDateFull(doc.dataScadenza)}
                    </span>
                  )}
                  <StatusPill type="document" value={doc.stato} size="sm" />
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteDocument(doc.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {docsGenerali.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nessun documento generale caricato</p>
                <Button onClick={() => setShowNewDocDialog(true)} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Carica primo documento
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Sicurezza Tab */}
        <TabsContent value="sicurezza" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Documenti Sicurezza</h3>
            <Button onClick={() => setShowNewDocDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Aggiungi Documento
            </Button>
          </div>
          
          {/* Status Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-xs text-emerald-500">Completi</p>
              <p className="text-xl font-bold text-emerald-500">
                {docsSicurezza.filter(d => d.stato === 'approvato').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-500">In Scadenza</p>
              <p className="text-xl font-bold text-amber-500">
                {docsSicurezza.filter(d => d.stato === 'in_scadenza').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-xs text-red-500">Scaduti</p>
              <p className="text-xl font-bold text-red-500">
                {docsSicurezza.filter(d => d.stato === 'scaduto').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
              <p className="text-xs text-muted-foreground">Mancanti</p>
              <p className="text-xl font-bold text-muted-foreground">
                {docsSicurezza.filter(d => d.stato === 'da_richiedere').length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {docsSicurezza.map(doc => (
              <div
                key={doc.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border',
                  doc.stato === 'scaduto' ? 'border-red-500/30 bg-red-500/5' :
                  doc.stato === 'in_scadenza' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-border bg-card'
                )}
              >
                <div className="flex items-center gap-4">
                  <ShieldCheck className={cn(
                    'w-5 h-5',
                    doc.stato === 'scaduto' ? 'text-red-500' :
                    doc.stato === 'in_scadenza' ? 'text-amber-500' :
                    'text-emerald-500'
                  )} />
                  <div>
                    <p className="font-medium">{doc.tipo}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.nome}
                      {doc.fileName && <span className="ml-2">📎 {doc.fileName}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.dataScadenza && (
                    <span className="text-sm text-muted-foreground">
                      Scade: {formatDateFull(doc.dataScadenza)}
                    </span>
                  )}
                  <StatusPill type="document" value={doc.stato} size="sm" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteDocument(doc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {docsSicurezza.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nessun documento di sicurezza caricato</p>
                <Button onClick={() => setShowNewDocDialog(true)} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Carica documento sicurezza
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Dipendenti Tab */}
        <TabsContent value="dipendenti" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Dipendenti Presenti in Cantiere</h3>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-2">Nominativo</div>
              <div>Impresa</div>
              <div>Mansione</div>
              <div>Formazione</div>
              <div>Visita Medica</div>
            </div>
            <div className="divide-y divide-border">
              {cantiereLavoratori.map(lav => {
                const impresa = imprese.find(i => i.id === lav.impresaId);
                const visitaDays = lav.dataScadenzaIdoneita ? daysUntil(lav.dataScadenzaIdoneita) : null;
                const visitaStatus = visitaDays === null ? 'none' :
                  visitaDays < 0 ? 'expired' : visitaDays <= 30 ? 'expiring' : 'ok';

                return (
                  <div 
                    key={lav.id} 
                    className="grid grid-cols-6 gap-2 px-4 py-3 items-center hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate('/lavoratori')}
                  >
                    <div className="col-span-2">
                      <p className="font-medium">{lav.cognome} {lav.nome}</p>
                      <p className="text-xs text-muted-foreground">CF: {lav.codiceFiscale}</p>
                    </div>
                    <div className="text-sm">{impresa?.ragioneSociale || '-'}</div>
                    <div className="text-sm">{lav.mansione}</div>
                    <div>
                      <span className="flex items-center gap-1 text-xs text-emerald-500">
                        <CheckCircle className="w-4 h-4" /> OK
                      </span>
                    </div>
                    <div>
                      {visitaStatus === 'ok' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-500">
                          <CheckCircle className="w-4 h-4" /> OK
                        </span>
                      )}
                      {visitaStatus === 'expiring' && (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <AlertCircle className="w-4 h-4" /> Scade tra {visitaDays}gg
                        </span>
                      )}
                      {visitaStatus === 'expired' && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-4 h-4" /> Scaduta
                        </span>
                      )}
                      {visitaStatus === 'none' && (
                        <span className="text-xs text-muted-foreground">N/D</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {cantiereLavoratori.length === 0 && (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  Nessun lavoratore associato a questo cantiere
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Ditte Tab */}
        <TabsContent value="ditte" className="mt-6">
          <div className="space-y-6">
            {/* Subappalto Section */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Ditte in Subappalto ({impreseSubappalto.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {impreseSubappalto.map(impresa => {
                  const docs = getDocumentiImpresa(impresa.id);
                  const status = calculateTrafficLight(docs);
                  const impLavoratori = lavoratori.filter(l => l.impresaId === impresa.id && l.cantieriIds.includes(cantiere.id));

                  return (
                    <div
                      key={impresa.id}
                      onClick={() => navigate('/imprese')}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer card-hover"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TrafficLight status={status.color} />
                          <div>
                            <h4 className="font-semibold">{impresa.ragioneSociale}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{impresa.tipo.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HardHat className="w-4 h-4" />
                          {impLavoratori.length} lavoratori
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {docs.length} documenti
                        </span>
                      </div>
                      {(status.documentiScaduti > 0 || status.documentiInScadenza > 0) && (
                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                          {status.documentiScaduti > 0 && (
                            <span className="flex items-center gap-1 text-xs text-red-500">
                              <AlertCircle className="w-3 h-3" />
                              {status.documentiScaduti} scaduti
                            </span>
                          )}
                          {status.documentiInScadenza > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <AlertCircle className="w-3 h-3" />
                              {status.documentiInScadenza} in scadenza
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {impreseSubappalto.length === 0 && (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    Nessuna ditta in subappalto
                  </div>
                )}
              </div>
            </div>

            {/* Distacco Section */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Ditte in Distacco ({impreseDistacco.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {impreseDistacco.map(impresa => {
                  const docs = getDocumentiImpresa(impresa.id);
                  const status = calculateTrafficLight(docs);
                  const impLavoratori = lavoratori.filter(l => l.impresaId === impresa.id && l.cantieriIds.includes(cantiere.id));

                  return (
                    <div
                      key={impresa.id}
                      onClick={() => navigate('/imprese')}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer card-hover"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TrafficLight status={status.color} />
                          <div>
                            <h4 className="font-semibold">{impresa.ragioneSociale}</h4>
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-500">DISTACCO</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HardHat className="w-4 h-4" />
                          {impLavoratori.length} lavoratori
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {docs.length} documenti
                        </span>
                      </div>
                    </div>
                  );
                })}
                {impreseDistacco.length === 0 && (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    Nessuna ditta in distacco
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Presenze Tab */}
        <TabsContent value="presenze" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Registro Presenze</h3>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
            <Button onClick={() => setShowAddPresenzaDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Registra Presenza
            </Button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-7 gap-2 px-4 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-2">Lavoratore</div>
              <div>Impresa</div>
              <div>Ingresso</div>
              <div>Uscita</div>
              <div>Ore</div>
              <div>Azioni</div>
            </div>
            <div className="divide-y divide-border">
              {cantierePresenze.map(p => {
                const lav = lavoratori.find(l => l.id === p.lavoratoreId);
                const impresa = lav ? imprese.find(i => i.id === lav.impresaId) : null;
                
                return (
                  <div key={p.id} className="grid grid-cols-7 gap-2 px-4 py-3 items-center">
                    <div className="col-span-2">
                      <p className="font-medium">{lav?.cognome} {lav?.nome}</p>
                      <p className="text-xs text-muted-foreground">{lav?.mansione}</p>
                    </div>
                    <div className="text-sm">{impresa?.ragioneSociale || '-'}</div>
                    <div className="text-sm">{p.oraIngresso}</div>
                    <div className="text-sm">{p.oraUscita}</div>
                    <div className="text-sm font-medium">{p.oreTotali}h</div>
                    <div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500"
                        onClick={() => {
                          deletePresenza(p.id);
                          toast({ title: "Presenza eliminata" });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {cantierePresenze.length === 0 && (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nessuna presenza registrata per {formatDateFull(selectedDate)}</p>
                  <Button onClick={() => setShowAddPresenzaDialog(true)} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Registra prima presenza
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Document Dialog */}
      <Dialog open={showNewDocDialog} onOpenChange={setShowNewDocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo Documento *</label>
              <Select value={docForm.tipo} onValueChange={(v) => setDocForm({ ...docForm, tipo: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_DOCUMENTI_CANTIERE.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nome/Descrizione *</label>
              <Input
                value={docForm.nome}
                onChange={(e) => setDocForm({ ...docForm, nome: e.target.value })}
                placeholder="es. PSC Cantiere UNIPD rev.2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Emissione</label>
                <Input
                  type="date"
                  value={docForm.dataEmissione}
                  onChange={(e) => setDocForm({ ...docForm, dataEmissione: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Scadenza</label>
                <Input
                  type="date"
                  value={docForm.dataScadenza}
                  onChange={(e) => setDocForm({ ...docForm, dataScadenza: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">File</label>
              <div className="flex gap-2">
                <input
                  ref={docFileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => docFileRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  {uploadedFileName || 'Carica file'}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cantiere-doc-camera"
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('cantiere-doc-camera')?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Note</label>
              <Input
                value={docForm.note}
                onChange={(e) => setDocForm({ ...docForm, note: e.target.value })}
                placeholder="Note opzionali..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDocDialog(false)}>Annulla</Button>
            <Button onClick={handleAddDocument}>Aggiungi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Presenza Dialog */}
      <Dialog open={showAddPresenzaDialog} onOpenChange={setShowAddPresenzaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registra Presenza</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Lavoratore *</label>
              <Select value={presenzaForm.lavoratoreId} onValueChange={(v) => setPresenzaForm({ ...presenzaForm, lavoratoreId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona lavoratore" />
                </SelectTrigger>
                <SelectContent>
                  {allWorkers.map(lav => (
                    <SelectItem key={lav.id} value={lav.id}>{lav.cognome} {lav.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data</label>
              <Input
                type="date"
                value={presenzaForm.data}
                onChange={(e) => setPresenzaForm({ ...presenzaForm, data: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Ora Ingresso</label>
                <Input
                  type="time"
                  value={presenzaForm.oraIngresso}
                  onChange={(e) => setPresenzaForm({ ...presenzaForm, oraIngresso: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ora Uscita</label>
                <Input
                  type="time"
                  value={presenzaForm.oraUscita}
                  onChange={(e) => setPresenzaForm({ ...presenzaForm, oraUscita: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Note</label>
              <Input
                value={presenzaForm.note}
                onChange={(e) => setPresenzaForm({ ...presenzaForm, note: e.target.value })}
                placeholder="Note opzionali..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPresenzaDialog(false)}>Annulla</Button>
            <Button onClick={handleAddPresenza}>Registra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
