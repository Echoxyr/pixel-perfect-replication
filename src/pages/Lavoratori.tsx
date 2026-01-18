import { useState, useMemo, useRef } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { DataTable, Column } from '@/components/workhub/DataTable';
import { TrafficLight } from '@/components/workhub/StatusPill';
import { Lavoratore, TIPO_LAVORATORE_LABELS, formatDateFull, daysUntil, TIPI_FORMAZIONE, TIPI_DPI, TIPI_DOCUMENTI_LAVORATORE, generateId } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Plus,
  Search,
  HardHat,
  GraduationCap,
  Stethoscope,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  Upload,
  FileText,
  Trash2,
  Edit,
  Download,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Lavoratori() {
  const {
    lavoratori,
    imprese,
    cantieri,
    formazioni,
    dpiList,
    documenti,
    addLavoratore,
    updateLavoratore,
    addFormazione,
    updateFormazione,
    deleteFormazione,
    addDPI,
    updateDPI,
    deleteDPI,
    addDocumento,
    deleteDocumento,
    getFormazioniLavoratore,
    getDPILavoratore,
    getDocumentiLavoratore
  } = useWorkHub();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterImpresa, setFilterImpresa] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedLavoratore, setSelectedLavoratore] = useState<Lavoratore | null>(null);

  // Form states for adding new items
  const [showAddFormazioneDialog, setShowAddFormazioneDialog] = useState(false);
  const [showAddDPIDialog, setShowAddDPIDialog] = useState(false);
  const [showAddDocDialog, setShowAddDocDialog] = useState(false);
  const [showEditVisitaDialog, setShowEditVisitaDialog] = useState(false);

  // Formazione form
  const [formazioneForm, setFormazioneForm] = useState({
    tipoCorso: '',
    categoria: '',
    dataCorso: '',
    durataOre: 0,
    dataScadenza: '',
    esito: 'positivo'
  });

  // DPI form
  const [dpiForm, setDpiForm] = useState({
    tipo: '',
    dataConsegna: new Date().toISOString().split('T')[0],
    stato: 'consegnato' as const
  });

  // Doc form
  const [docForm, setDocForm] = useState({
    tipo: '',
    nome: '',
    dataScadenza: ''
  });

  // Visita medica form
  const [visitaForm, setVisitaForm] = useState<{
    medicoCompetente: string;
    dataVisitaMedica: string;
    giudizioIdoneita: 'idoneo' | 'idoneo_limitazioni' | 'non_idoneo' | 'in_attesa';
    dataScadenzaIdoneita: string;
  }>({
    medicoCompetente: '',
    dataVisitaMedica: '',
    giudizioIdoneita: 'idoneo',
    dataScadenzaIdoneita: ''
  });

  // File upload refs
  const formazioneFileRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    codiceFiscale: '',
    dataNascita: '',
    impresaId: '',
    tipo: 'dipendente' as const,
    mansione: '',
    qualifica: '',
    cantieriIds: [] as string[]
  });

  // Calculate worker status
  const getLavoratoreStatus = (lavoratoreId: string, lavoratore: Lavoratore) => {
    const forms = getFormazioniLavoratore(lavoratoreId);
    const formsExpired = forms.filter(f => f.stato === 'scaduto').length;
    const formsExpiring = forms.filter(f => f.stato === 'in_scadenza').length;

    let visitaStatus: 'ok' | 'expiring' | 'expired' | 'none' = 'none';
    if (lavoratore.dataScadenzaIdoneita) {
      const days = daysUntil(lavoratore.dataScadenzaIdoneita);
      if (days !== null) {
        if (days < 0) visitaStatus = 'expired';
        else if (days <= 30) visitaStatus = 'expiring';
        else visitaStatus = 'ok';
      }
    }

    const dpis = getDPILavoratore(lavoratoreId);
    const dpiProblems = dpis.filter(d => d.stato !== 'consegnato').length;

    let color: 'green' | 'yellow' | 'red' = 'green';
    if (formsExpired > 0 || visitaStatus === 'expired') color = 'red';
    else if (formsExpiring > 0 || visitaStatus === 'expiring' || dpiProblems > 0) color = 'yellow';

    return {
      color,
      formazioniOk: forms.filter(f => f.stato === 'fatto').length,
      formazioniScadute: formsExpired,
      formazioniInScadenza: formsExpiring,
      visitaStatus,
      dpiProblems
    };
  };

  const filteredLavoratori = useMemo(() => {
    return lavoratori.filter(lav => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${lav.nome} ${lav.cognome}`.toLowerCase();
        if (!fullName.includes(query) && !lav.codiceFiscale.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterImpresa !== 'all' && lav.impresaId !== filterImpresa) {
        return false;
      }
      if (filterStatus !== 'all') {
        const status = getLavoratoreStatus(lav.id, lav);
        if (filterStatus === 'ok' && status.color !== 'green') return false;
        if (filterStatus === 'warning' && status.color !== 'yellow') return false;
        if (filterStatus === 'critical' && status.color !== 'red') return false;
      }
      return true;
    });
  }, [lavoratori, searchQuery, filterImpresa, filterStatus]);

  const handleCreate = () => {
    if (!formData.nome || !formData.cognome || !formData.codiceFiscale || !formData.impresaId) return;

    addLavoratore(formData);
    setFormData({
      nome: '',
      cognome: '',
      codiceFiscale: '',
      dataNascita: '',
      impresaId: '',
      tipo: 'dipendente',
      mansione: '',
      qualifica: '',
      cantieriIds: []
    });
    setShowNewDialog(false);
    toast({ title: "Lavoratore creato", description: `${formData.nome} ${formData.cognome} aggiunto` });
  };

  const handleAddFormazione = () => {
    if (!selectedLavoratore || !formazioneForm.tipoCorso) return;

    const stato = formazioneForm.dataScadenza ? 
      (daysUntil(formazioneForm.dataScadenza)! < 0 ? 'scaduto' : 
       daysUntil(formazioneForm.dataScadenza)! <= 30 ? 'in_scadenza' : 'fatto') : 'fatto';

    addFormazione({
      lavoratoreId: selectedLavoratore.id,
      tipoCorso: formazioneForm.tipoCorso,
      categoria: formazioneForm.categoria || 'altro',
      dataCorso: formazioneForm.dataCorso || undefined,
      durataOre: formazioneForm.durataOre || undefined,
      dataScadenza: formazioneForm.dataScadenza || undefined,
      esito: formazioneForm.esito,
      stato,
      fileName: uploadedFileName || undefined
    });

    toast({ title: "Formazione aggiunta", description: formazioneForm.tipoCorso });
    setFormazioneForm({ tipoCorso: '', categoria: '', dataCorso: '', durataOre: 0, dataScadenza: '', esito: 'positivo' });
    setUploadedFileName('');
    setShowAddFormazioneDialog(false);
  };

  const handleAddDPI = () => {
    if (!selectedLavoratore || !dpiForm.tipo) return;

    addDPI({
      lavoratoreId: selectedLavoratore.id,
      tipo: dpiForm.tipo,
      dataConsegna: dpiForm.dataConsegna,
      stato: dpiForm.stato
    });

    toast({ title: "DPI aggiunto", description: dpiForm.tipo });
    setDpiForm({ tipo: '', dataConsegna: new Date().toISOString().split('T')[0], stato: 'consegnato' });
    setShowAddDPIDialog(false);
  };

  const handleAddDocumento = () => {
    if (!selectedLavoratore || !docForm.tipo || !docForm.nome) return;

    const stato = docForm.dataScadenza ? 
      (daysUntil(docForm.dataScadenza)! < 0 ? 'scaduto' : 
       daysUntil(docForm.dataScadenza)! <= 30 ? 'in_scadenza' : 'approvato') : 'approvato';

    addDocumento({
      tipo: docForm.tipo,
      nome: docForm.nome,
      lavoratoreId: selectedLavoratore.id,
      dataScadenza: docForm.dataScadenza || undefined,
      stato,
      fileName: uploadedFileName || undefined
    });

    toast({ title: "Documento aggiunto", description: docForm.nome });
    setDocForm({ tipo: '', nome: '', dataScadenza: '' });
    setUploadedFileName('');
    setShowAddDocDialog(false);
  };

  const handleUpdateVisita = () => {
    if (!selectedLavoratore) return;

    updateLavoratore(selectedLavoratore.id, {
      medicoCompetente: visitaForm.medicoCompetente || undefined,
      dataVisitaMedica: visitaForm.dataVisitaMedica || undefined,
      giudizioIdoneita: visitaForm.giudizioIdoneita,
      dataScadenzaIdoneita: visitaForm.dataScadenzaIdoneita || undefined
    });

    // Update selected lavoratore state
    setSelectedLavoratore({
      ...selectedLavoratore,
      medicoCompetente: visitaForm.medicoCompetente || undefined,
      dataVisitaMedica: visitaForm.dataVisitaMedica || undefined,
      giudizioIdoneita: visitaForm.giudizioIdoneita,
      dataScadenzaIdoneita: visitaForm.dataScadenzaIdoneita || undefined
    });

    toast({ title: "Visita medica aggiornata" });
    setShowEditVisitaDialog(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      toast({ title: "File selezionato", description: file.name });
    }
  };

  const openEditVisita = () => {
    if (!selectedLavoratore) return;
    setVisitaForm({
      medicoCompetente: selectedLavoratore.medicoCompetente || '',
      dataVisitaMedica: selectedLavoratore.dataVisitaMedica || '',
      giudizioIdoneita: selectedLavoratore.giudizioIdoneita || 'idoneo',
      dataScadenzaIdoneita: selectedLavoratore.dataScadenzaIdoneita || ''
    });
    setShowEditVisitaDialog(true);
  };

  const getImpresaName = (id: string) => {
    const imp = imprese.find(i => i.id === id);
    return imp?.ragioneSociale || '-';
  };

  const columns: Column<Lavoratore>[] = [
    {
      key: 'status',
      header: '',
      width: '40px',
      render: (lav) => {
        const status = getLavoratoreStatus(lav.id, lav);
        return <TrafficLight status={status.color} />;
      }
    },
    {
      key: 'nome',
      header: 'Nominativo',
      sortable: true,
      render: (lav) => (
        <button onClick={() => setSelectedLavoratore(lav)} className="text-left hover:text-primary">
          <p className="font-medium">{lav.cognome} {lav.nome}</p>
          <p className="text-xs text-muted-foreground">CF: {lav.codiceFiscale}</p>
        </button>
      )
    },
    {
      key: 'impresa',
      header: 'Impresa',
      render: (lav) => (
        <span className="text-sm">{getImpresaName(lav.impresaId)}</span>
      )
    },
    {
      key: 'mansione',
      header: 'Mansione',
      render: (lav) => (
        <div>
          <p className="text-sm">{lav.mansione}</p>
          <p className="text-xs text-muted-foreground">{TIPO_LAVORATORE_LABELS[lav.tipo]}</p>
        </div>
      )
    },
    {
      key: 'formazione',
      header: 'Formazione',
      width: '120px',
      render: (lav) => {
        const status = getLavoratoreStatus(lav.id, lav);
        return (
          <div className="flex items-center gap-1">
            {status.formazioniScadute > 0 ? (
              <span className="flex items-center gap-1 text-red-500 text-xs">
                <XCircle className="w-4 h-4" /> {status.formazioniScadute}
              </span>
            ) : status.formazioniInScadenza > 0 ? (
              <span className="flex items-center gap-1 text-amber-500 text-xs">
                <AlertCircle className="w-4 h-4" /> {status.formazioniInScadenza}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500 text-xs">
                <CheckCircle className="w-4 h-4" /> OK
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'visitaMedica',
      header: 'Visita Medica',
      width: '130px',
      render: (lav) => {
        const status = getLavoratoreStatus(lav.id, lav);
        const visitaIcon = status.visitaStatus === 'expired' ? (
          <XCircle className="w-4 h-4 text-red-500" />
        ) : status.visitaStatus === 'expiring' ? (
          <AlertCircle className="w-4 h-4 text-amber-500" />
        ) : status.visitaStatus === 'ok' ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
          <span className="text-xs text-muted-foreground">N/D</span>
        );
        return (
          <div className="flex items-center gap-2">
            {visitaIcon}
            {lav.dataScadenzaIdoneita && (
              <span className="text-xs text-muted-foreground">
                {formatDateFull(lav.dataScadenzaIdoneita)}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'cantieri',
      header: 'Cantieri',
      width: '80px',
      render: (lav) => <span className="text-sm">{lav.cantieriIds.length}</span>
    }
  ];

  const stats = useMemo(() => {
    let ok = 0, warning = 0, critical = 0;
    lavoratori.forEach(lav => {
      const status = getLavoratoreStatus(lav.id, lav);
      if (status.color === 'green') ok++;
      else if (status.color === 'yellow') warning++;
      else critical++;
    });
    return { ok, warning, critical };
  }, [lavoratori]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lavoratori</h1>
          <p className="text-muted-foreground">Gestione formazione, visite mediche e DPI</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2" data-tutorial="btn-nuovo-lavoratore">
          <Plus className="w-4 h-4" />
          Nuovo Lavoratore
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-tutorial="lavoratori-stats">
        <div className="p-4 rounded-xl border border-border bg-card" data-tutorial="lavoratori-totale">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Totale Lavoratori</p>
            <HardHat className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-1">{lavoratori.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10" data-tutorial="lavoratori-conformi">
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-500">Conformi</p>
            <TrafficLight status="green" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.ok}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10" data-tutorial="lavoratori-attenzione">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-500">Attenzione</p>
            <TrafficLight status="yellow" />
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-1">{stats.warning}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10" data-tutorial="lavoratori-non-conformi">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-500">Non conformi</p>
            <TrafficLight status="red" />
          </div>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.critical}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca lavoratore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterImpresa} onValueChange={setFilterImpresa}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Impresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le imprese</SelectItem>
            {imprese.map(i => (
              <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="ok">✅ Conformi</SelectItem>
            <SelectItem value="warning">⚠️ Attenzione</SelectItem>
            <SelectItem value="critical">🔴 Non conformi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredLavoratori}
        columns={columns}
        keyExtractor={(l) => l.id}
        onRowClick={(lavoratore) => setSelectedLavoratore(lavoratore)}
        emptyMessage="Nessun lavoratore trovato"
      />

      {/* New Lavoratore Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo Lavoratore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cognome *</label>
                <Input
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Codice Fiscale *</label>
                <Input
                  value={formData.codiceFiscale}
                  onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data di Nascita</label>
                <Input
                  type="date"
                  value={formData.dataNascita}
                  onChange={(e) => setFormData({ ...formData, dataNascita: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Impresa *</label>
                <Select value={formData.impresaId} onValueChange={(v) => setFormData({ ...formData, impresaId: v })}>
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
              <div>
                <label className="text-sm font-medium mb-1 block">Tipologia</label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dipendente">Dipendente</SelectItem>
                    <SelectItem value="distaccato">Distaccato</SelectItem>
                    <SelectItem value="autonomo">Autonomo</SelectItem>
                    <SelectItem value="socio_lavoratore">Socio lavoratore</SelectItem>
                    <SelectItem value="amministratore">Amministratore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mansione</label>
                <Input
                  value={formData.mansione}
                  onChange={(e) => setFormData({ ...formData, mansione: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annulla</Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.nome || !formData.cognome || !formData.codiceFiscale || !formData.impresaId}
            >
              Crea Lavoratore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lavoratore Detail Dialog - COMPLETE */}
      <Dialog open={!!selectedLavoratore} onOpenChange={() => setSelectedLavoratore(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedLavoratore && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <TrafficLight status={getLavoratoreStatus(selectedLavoratore!.id, selectedLavoratore!).color} />
                  {selectedLavoratore.cognome} {selectedLavoratore.nome}
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="tabs-scrollable-header flex w-full h-auto flex-nowrap justify-start gap-1 p-1">
                  <TabsTrigger value="info" className="flex-shrink-0 whitespace-nowrap">Info</TabsTrigger>
                  <TabsTrigger value="formazione" className="flex-shrink-0 whitespace-nowrap">Formazione</TabsTrigger>
                  <TabsTrigger value="visita" className="flex-shrink-0 whitespace-nowrap">Visita Medica</TabsTrigger>
                  <TabsTrigger value="dpi" className="flex-shrink-0 whitespace-nowrap">DPI</TabsTrigger>
                  <TabsTrigger value="documenti" className="flex-shrink-0 whitespace-nowrap">Documenti</TabsTrigger>
                </TabsList>
                
                {/* Info Tab */}
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Codice Fiscale</p>
                      <p className="font-medium">{selectedLavoratore.codiceFiscale}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipologia</p>
                      <p className="font-medium">{TIPO_LAVORATORE_LABELS[selectedLavoratore.tipo]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mansione</p>
                      <p className="font-medium">{selectedLavoratore.mansione}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impresa</p>
                      <p className="font-medium">{getImpresaName(selectedLavoratore.impresaId)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Cantieri assegnati</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedLavoratore.cantieriIds.map(cId => {
                          const c = cantieri.find(x => x.id === cId);
                          return c ? (
                            <span key={cId} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                              {c.codiceCommessa}
                            </span>
                          ) : null;
                        })}
                        {selectedLavoratore.cantieriIds.length === 0 && (
                          <span className="text-sm text-muted-foreground">Nessun cantiere</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Formazione Tab */}
                <TabsContent value="formazione" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Formazioni</h3>
                    <Button size="sm" onClick={() => setShowAddFormazioneDialog(true)} className="gap-1">
                      <Plus className="w-4 h-4" /> Aggiungi Formazione
                    </Button>
                  </div>
                  {(() => {
                    const forms = getFormazioniLavoratore(selectedLavoratore.id);
                    if (forms.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-4">Nessuna formazione registrata. Clicca "Aggiungi Formazione" per iniziare.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {forms.map(f => (
                          <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <GraduationCap className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{f.tipoCorso}</p>
                                <p className="text-xs text-muted-foreground">
                                  {f.dataScadenza ? `Scade: ${formatDateFull(f.dataScadenza)}` : 'Nessuna scadenza'}
                                  {f.fileName && <span className="ml-2">📎 {f.fileName}</span>}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'px-2 py-1 text-xs font-medium rounded',
                                f.stato === 'fatto' ? 'bg-emerald-500/20 text-emerald-500' :
                                f.stato === 'in_scadenza' ? 'bg-amber-500/20 text-amber-500' :
                                f.stato === 'scaduto' ? 'bg-red-500/20 text-red-500' :
                                'bg-gray-500/20 text-gray-500'
                              )}>
                                {f.stato}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500" 
                                onClick={() => {
                                  deleteFormazione(f.id);
                                  toast({ title: "Formazione eliminata" });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </TabsContent>

                {/* Visita Medica Tab */}
                <TabsContent value="visita" className="mt-4">
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-6 h-6 text-muted-foreground" />
                        <h3 className="font-semibold">Sorveglianza Sanitaria</h3>
                      </div>
                      <Button size="sm" variant="outline" onClick={openEditVisita} className="gap-1">
                        <Edit className="w-4 h-4" /> Modifica
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Medico Competente</p>
                        <p className="font-medium">{selectedLavoratore.medicoCompetente || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Giudizio Idoneità</p>
                        <p className={cn(
                          'font-medium',
                          selectedLavoratore.giudizioIdoneita === 'idoneo' && 'text-emerald-500',
                          selectedLavoratore.giudizioIdoneita === 'idoneo_limitazioni' && 'text-amber-500',
                          selectedLavoratore.giudizioIdoneita === 'non_idoneo' && 'text-red-500'
                        )}>
                          {selectedLavoratore.giudizioIdoneita || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data Visita</p>
                        <p className="font-medium">{formatDateFull(selectedLavoratore.dataVisitaMedica)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Scadenza Idoneità</p>
                        <p className={cn(
                          'font-medium',
                          selectedLavoratore.dataScadenzaIdoneita && daysUntil(selectedLavoratore.dataScadenzaIdoneita)! < 0 && 'text-red-500',
                          selectedLavoratore.dataScadenzaIdoneita && daysUntil(selectedLavoratore.dataScadenzaIdoneita)! <= 30 && daysUntil(selectedLavoratore.dataScadenzaIdoneita)! >= 0 && 'text-amber-500'
                        )}>
                          {formatDateFull(selectedLavoratore.dataScadenzaIdoneita)}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* DPI Tab */}
                <TabsContent value="dpi" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Dispositivi di Protezione Individuale</h3>
                    <Button size="sm" onClick={() => setShowAddDPIDialog(true)} className="gap-1">
                      <Plus className="w-4 h-4" /> Aggiungi DPI
                    </Button>
                  </div>
                  {(() => {
                    const dpis = getDPILavoratore(selectedLavoratore.id);
                    if (dpis.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-4">Nessun DPI registrato. Clicca "Aggiungi DPI" per iniziare.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {dpis.map(d => (
                          <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{d.tipo}</p>
                                <p className="text-xs text-muted-foreground">
                                  Consegnato: {formatDateFull(d.dataConsegna)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'px-2 py-1 text-xs font-medium rounded',
                                d.stato === 'consegnato' ? 'bg-emerald-500/20 text-emerald-500' :
                                d.stato === 'da_sostituire' ? 'bg-amber-500/20 text-amber-500' :
                                'bg-red-500/20 text-red-500'
                              )}>
                                {d.stato}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500" 
                                onClick={() => {
                                  deleteDPI(d.id);
                                  toast({ title: "DPI eliminato" });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </TabsContent>

                {/* Documenti Tab */}
                <TabsContent value="documenti" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Documenti Personali</h3>
                    <Button size="sm" onClick={() => setShowAddDocDialog(true)} className="gap-1">
                      <Plus className="w-4 h-4" /> Aggiungi Documento
                    </Button>
                  </div>
                  {(() => {
                    const docs = getDocumentiLavoratore(selectedLavoratore.id);
                    if (docs.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-4">Nessun documento caricato. Clicca "Aggiungi Documento" per iniziare.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {docs.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{doc.tipo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.nome}
                                  {doc.dataScadenza && ` • Scade: ${formatDateFull(doc.dataScadenza)}`}
                                  {doc.fileName && <span className="ml-2">📎 {doc.fileName}</span>}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'px-2 py-1 text-xs font-medium rounded',
                                doc.stato === 'approvato' ? 'bg-emerald-500/20 text-emerald-500' :
                                doc.stato === 'in_scadenza' ? 'bg-amber-500/20 text-amber-500' :
                                doc.stato === 'scaduto' ? 'bg-red-500/20 text-red-500' :
                                'bg-gray-500/20 text-gray-500'
                              )}>
                                {doc.stato}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500" 
                                onClick={() => {
                                  deleteDocumento(doc.id);
                                  toast({ title: "Documento eliminato" });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Formazione Dialog */}
      <Dialog open={showAddFormazioneDialog} onOpenChange={setShowAddFormazioneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Formazione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo Corso *</label>
              <Select value={formazioneForm.tipoCorso} onValueChange={(v) => {
                const corso = TIPI_FORMAZIONE.find(c => c.nome === v);
                setFormazioneForm({ 
                  ...formazioneForm, 
                  tipoCorso: v, 
                  categoria: corso?.categoria || 'altro',
                  durataOre: corso?.durataStandard || 0
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona corso" />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_FORMAZIONE.map(c => (
                    <SelectItem key={c.nome} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Corso</label>
                <Input
                  type="date"
                  value={formazioneForm.dataCorso}
                  onChange={(e) => setFormazioneForm({ ...formazioneForm, dataCorso: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Scadenza</label>
                <Input
                  type="date"
                  value={formazioneForm.dataScadenza}
                  onChange={(e) => setFormazioneForm({ ...formazioneForm, dataScadenza: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Certificato/Attestato</label>
              <div className="flex gap-2">
                <input
                  ref={formazioneFileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => formazioneFileRef.current?.click()}
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
                  id="formazione-camera"
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('formazione-camera')?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFormazioneDialog(false)}>Annulla</Button>
            <Button onClick={handleAddFormazione} disabled={!formazioneForm.tipoCorso}>Aggiungi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add DPI Dialog */}
      <Dialog open={showAddDPIDialog} onOpenChange={setShowAddDPIDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi DPI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo DPI *</label>
              <Select value={dpiForm.tipo} onValueChange={(v) => setDpiForm({ ...dpiForm, tipo: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona DPI" />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_DPI.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Consegna</label>
                <Input
                  type="date"
                  value={dpiForm.dataConsegna}
                  onChange={(e) => setDpiForm({ ...dpiForm, dataConsegna: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stato</label>
                <Select value={dpiForm.stato} onValueChange={(v) => setDpiForm({ ...dpiForm, stato: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consegnato">Consegnato</SelectItem>
                    <SelectItem value="da_sostituire">Da sostituire</SelectItem>
                    <SelectItem value="scaduto">Scaduto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDPIDialog(false)}>Annulla</Button>
            <Button onClick={handleAddDPI} disabled={!dpiForm.tipo}>Aggiungi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Documento Dialog */}
      <Dialog open={showAddDocDialog} onOpenChange={setShowAddDocDialog}>
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
                  {TIPI_DOCUMENTI_LAVORATORE.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nome/Descrizione *</label>
              <Input
                value={docForm.nome}
                onChange={(e) => setDocForm({ ...docForm, nome: e.target.value })}
                placeholder="es. Carta identità Mario Rossi"
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
                  id="doc-camera"
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('doc-camera')?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDocDialog(false)}>Annulla</Button>
            <Button onClick={handleAddDocumento} disabled={!docForm.tipo || !docForm.nome}>Aggiungi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Visita Medica Dialog */}
      <Dialog open={showEditVisitaDialog} onOpenChange={setShowEditVisitaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Visita Medica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Medico Competente</label>
              <Input
                value={visitaForm.medicoCompetente}
                onChange={(e) => setVisitaForm({ ...visitaForm, medicoCompetente: e.target.value })}
                placeholder="Nome medico competente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Visita</label>
                <Input
                  type="date"
                  value={visitaForm.dataVisitaMedica}
                  onChange={(e) => setVisitaForm({ ...visitaForm, dataVisitaMedica: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Scadenza Idoneità</label>
                <Input
                  type="date"
                  value={visitaForm.dataScadenzaIdoneita}
                  onChange={(e) => setVisitaForm({ ...visitaForm, dataScadenzaIdoneita: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Giudizio Idoneità</label>
              <Select value={visitaForm.giudizioIdoneita} onValueChange={(v) => setVisitaForm({ ...visitaForm, giudizioIdoneita: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idoneo">Idoneo</SelectItem>
                  <SelectItem value="idoneo_limitazioni">Idoneo con limitazioni</SelectItem>
                  <SelectItem value="non_idoneo">Non idoneo</SelectItem>
                  <SelectItem value="in_attesa">In attesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditVisitaDialog(false)}>Annulla</Button>
            <Button onClick={handleUpdateVisita}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
