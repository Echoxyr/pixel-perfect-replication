import { useState, useMemo, useRef } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { DataTable, Column } from '@/components/workhub/DataTable';
import { StatusPill, TrafficLight } from '@/components/workhub/StatusPill';
import { Impresa, TIPO_IMPRESA_LABELS, calculateTrafficLight, formatDateFull, daysUntil, TIPI_DOCUMENTI_IMPRESA, generateId } from '@/types/workhub';
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
  Building2,
  FileText,
  Users,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  Upload,
  Camera,
  Trash2,
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Imprese() {
  const navigate = useNavigate();
  const {
    imprese,
    cantieri,
    lavoratori,
    documenti,
    addImpresa,
    addDocumento,
    deleteDocumento,
    getDocumentiImpresa,
    getLavoratoriImpresa
  } = useWorkHub();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedImpresa, setSelectedImpresa] = useState<Impresa | null>(null);
  const [showAddDocDialog, setShowAddDocDialog] = useState(false);

  // Doc form state
  const [docForm, setDocForm] = useState({
    tipo: '',
    nome: '',
    dataEmissione: '',
    dataScadenza: ''
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const docFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    ragioneSociale: '',
    partitaIva: '',
    codiceFiscale: '',
    sedeLegale: '',
    sedeOperativa: '',
    referenteNome: '',
    referenteRuolo: '',
    referenteTelefono: '',
    referenteEmail: '',
    ccnlApplicato: '',
    tipo: 'subappaltatore' as const,
    lavorazioniPrincipali: [] as string[],
    cantieriIds: [] as string[]
  });

  // Calculate impresa status
  const getImpresaStatus = (impresaId: string) => {
    const docs = getDocumentiImpresa(impresaId);
    return calculateTrafficLight(docs);
  };

  const filteredImprese = useMemo(() => {
    return imprese.filter(imp => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!imp.ragioneSociale.toLowerCase().includes(query) &&
            !imp.partitaIva.includes(query)) {
          return false;
        }
      }
      if (filterTipo !== 'all' && imp.tipo !== filterTipo) {
        return false;
      }
      if (filterStatus !== 'all') {
        const status = getImpresaStatus(imp.id);
        if (filterStatus === 'ok' && status.color !== 'green') return false;
        if (filterStatus === 'warning' && status.color !== 'yellow') return false;
        if (filterStatus === 'critical' && status.color !== 'red') return false;
      }
      return true;
    });
  }, [imprese, searchQuery, filterTipo, filterStatus]);

  const handleCreate = () => {
    if (!formData.ragioneSociale || !formData.partitaIva) return;

    addImpresa(formData);
    setFormData({
      ragioneSociale: '',
      partitaIva: '',
      codiceFiscale: '',
      sedeLegale: '',
      sedeOperativa: '',
      referenteNome: '',
      referenteRuolo: '',
      referenteTelefono: '',
      referenteEmail: '',
      ccnlApplicato: '',
      tipo: 'subappaltatore',
      lavorazioniPrincipali: [],
      cantieriIds: []
    });
    setShowNewDialog(false);
    toast({ title: "Impresa creata", description: formData.ragioneSociale });
  };

  const handleAddDocumento = () => {
    if (!selectedImpresa || !docForm.tipo || !docForm.nome) return;

    const stato = docForm.dataScadenza ? 
      (daysUntil(docForm.dataScadenza)! < 0 ? 'scaduto' : 
       daysUntil(docForm.dataScadenza)! <= 30 ? 'in_scadenza' : 'approvato') : 'approvato';

    addDocumento({
      tipo: docForm.tipo,
      nome: docForm.nome,
      impresaId: selectedImpresa.id,
      dataEmissione: docForm.dataEmissione || undefined,
      dataScadenza: docForm.dataScadenza || undefined,
      stato,
      fileName: uploadedFileName || undefined
    });

    toast({ title: "Documento aggiunto", description: docForm.nome });
    setDocForm({ tipo: '', nome: '', dataEmissione: '', dataScadenza: '' });
    setUploadedFileName('');
    setShowAddDocDialog(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      toast({ title: "File selezionato", description: file.name });
    }
  };

  const columns: Column<Impresa>[] = [
    {
      key: 'status',
      header: '',
      width: '40px',
      render: (impresa) => {
        const status = getImpresaStatus(impresa.id);
        return <TrafficLight status={status.color} />;
      }
    },
    {
      key: 'ragioneSociale',
      header: 'Ragione Sociale',
      sortable: true,
      render: (impresa) => (
        <button
          onClick={() => setSelectedImpresa(impresa)}
          className="text-left hover:text-primary"
        >
          <p className="font-medium">{impresa.ragioneSociale}</p>
          <p className="text-xs text-muted-foreground">P.IVA: {impresa.partitaIva}</p>
        </button>
      )
    },
    {
      key: 'tipo',
      header: 'Tipologia',
      width: '140px',
      render: (impresa) => (
        <span className={cn(
          'px-2 py-1 text-xs rounded-full',
          impresa.tipo === 'distacco' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {TIPO_IMPRESA_LABELS[impresa.tipo]}
        </span>
      )
    },
    {
      key: 'referente',
      header: 'Referente',
      render: (impresa) => (
        <div>
          <p className="text-sm">{impresa.referenteNome}</p>
          {impresa.referenteRuolo && (
            <p className="text-xs text-muted-foreground">{impresa.referenteRuolo}</p>
          )}
        </div>
      )
    },
    {
      key: 'cantieri',
      header: 'Cantieri',
      width: '80px',
      render: (impresa) => (
        <span className="text-sm">{impresa.cantieriIds.length}</span>
      )
    },
    {
      key: 'lavoratori',
      header: 'Lavoratori',
      width: '90px',
      render: (impresa) => {
        const lavs = getLavoratoriImpresa(impresa.id);
        return <span className="text-sm">{lavs.length}</span>;
      }
    },
    {
      key: 'documenti',
      header: 'Documenti',
      width: '140px',
      render: (impresa) => {
        const status = getImpresaStatus(impresa.id);
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs">{status.documentiOk}</span>
            </div>
            {status.documentiInScadenza > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs">{status.documentiInScadenza}</span>
              </div>
            )}
            {status.documentiScaduti > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs">{status.documentiScaduti}</span>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  // Summary stats
  const stats = useMemo(() => {
    let ok = 0, warning = 0, critical = 0;
    imprese.forEach(imp => {
      const status = getImpresaStatus(imp.id);
      if (status.color === 'green') ok++;
      else if (status.color === 'yellow') warning++;
      else critical++;
    });
    return { ok, warning, critical };
  }, [imprese]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Imprese Esterne</h1>
          <p className="text-muted-foreground">Gestione subappalti e documenti</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuova Impresa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Totale Imprese</p>
            <Building2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-1">{imprese.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-500">Documenti OK</p>
            <TrafficLight status="green" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.ok}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-500">In Scadenza</p>
            <TrafficLight status="yellow" />
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-1">{stats.warning}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-500">Problemi</p>
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
            placeholder="Cerca impresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipologia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le tipologie</SelectItem>
            <SelectItem value="subappaltatore">Subappaltatore</SelectItem>
            <SelectItem value="distacco">Distacco</SelectItem>
            <SelectItem value="autonomo">Lav. Autonomo</SelectItem>
            <SelectItem value="nolo_caldo">Nolo a caldo</SelectItem>
            <SelectItem value="consorzio">Consorzio</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stato doc." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="ok">✅ OK</SelectItem>
            <SelectItem value="warning">⚠️ In scadenza</SelectItem>
            <SelectItem value="critical">🔴 Problemi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredImprese}
        columns={columns}
        keyExtractor={(i) => i.id}
        onRowClick={(impresa) => setSelectedImpresa(impresa)}
        emptyMessage="Nessuna impresa trovata"
      />

      {/* New Impresa Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuova Impresa Esterna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Ragione Sociale *</label>
                <Input
                  value={formData.ragioneSociale}
                  onChange={(e) => setFormData({ ...formData, ragioneSociale: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Partita IVA *</label>
                <Input
                  value={formData.partitaIva}
                  onChange={(e) => setFormData({ ...formData, partitaIva: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Codice Fiscale</label>
                <Input
                  value={formData.codiceFiscale}
                  onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Sede Legale</label>
                <Input
                  value={formData.sedeLegale}
                  onChange={(e) => setFormData({ ...formData, sedeLegale: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tipologia</label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subappaltatore">Subappaltatore</SelectItem>
                    <SelectItem value="distacco">Distacco</SelectItem>
                    <SelectItem value="autonomo">Lav. Autonomo</SelectItem>
                    <SelectItem value="nolo_caldo">Nolo a caldo</SelectItem>
                    <SelectItem value="consorzio">Consorzio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">CCNL Applicato</label>
                <Input
                  value={formData.ccnlApplicato}
                  onChange={(e) => setFormData({ ...formData, ccnlApplicato: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Referente</label>
                <Input
                  value={formData.referenteNome}
                  onChange={(e) => setFormData({ ...formData, referenteNome: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ruolo</label>
                <Input
                  value={formData.referenteRuolo}
                  onChange={(e) => setFormData({ ...formData, referenteRuolo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Telefono</label>
                <Input
                  value={formData.referenteTelefono}
                  onChange={(e) => setFormData({ ...formData, referenteTelefono: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  type="email"
                  value={formData.referenteEmail}
                  onChange={(e) => setFormData({ ...formData, referenteEmail: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annulla</Button>
            <Button onClick={handleCreate} disabled={!formData.ragioneSociale || !formData.partitaIva}>
              Crea Impresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impresa Detail Dialog - COMPLETE */}
      <Dialog open={!!selectedImpresa} onOpenChange={() => setSelectedImpresa(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedImpresa && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <TrafficLight status={getImpresaStatus(selectedImpresa!.id).color} />
                  {selectedImpresa.ragioneSociale}
                  <span className={cn(
                    'px-2 py-1 text-xs rounded-full ml-2',
                    selectedImpresa.tipo === 'distacco' ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'
                  )}>
                    {TIPO_IMPRESA_LABELS[selectedImpresa.tipo]}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="tabs-scrollable-header flex w-full h-auto flex-nowrap justify-start gap-1 p-1">
                  <TabsTrigger value="info" className="flex-shrink-0 whitespace-nowrap">Informazioni</TabsTrigger>
                  <TabsTrigger value="documenti" className="flex-shrink-0 whitespace-nowrap">Documenti</TabsTrigger>
                  <TabsTrigger value="lavoratori" className="flex-shrink-0 whitespace-nowrap">Lavoratori</TabsTrigger>
                </TabsList>

                {/* Info Tab */}
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Partita IVA</p>
                      <p className="font-medium">{selectedImpresa.partitaIva}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Codice Fiscale</p>
                      <p className="font-medium">{selectedImpresa.codiceFiscale || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Sede Legale</p>
                      <p className="font-medium">{selectedImpresa.sedeLegale}</p>
                    </div>
                    {selectedImpresa.ccnlApplicato && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">CCNL Applicato</p>
                        <p className="font-medium">{selectedImpresa.ccnlApplicato}</p>
                      </div>
                    )}
                    {selectedImpresa.referenteNome && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Referente</p>
                        <p className="font-medium">
                          {selectedImpresa.referenteNome}
                          {selectedImpresa.referenteRuolo && ` (${selectedImpresa.referenteRuolo})`}
                        </p>
                        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                          {selectedImpresa.referenteTelefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {selectedImpresa.referenteTelefono}
                            </span>
                          )}
                          {selectedImpresa.referenteEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {selectedImpresa.referenteEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Cantieri assegnati</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedImpresa.cantieriIds.map(cId => {
                          const c = cantieri.find(x => x.id === cId);
                          return c ? (
                            <Link
                              key={cId}
                              to={`/cantieri/${cId}`}
                              className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20"
                            >
                              {c.codiceCommessa}
                            </Link>
                          ) : null;
                        })}
                        {selectedImpresa.cantieriIds.length === 0 && (
                          <span className="text-sm text-muted-foreground">Nessun cantiere</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Documenti Tab */}
                <TabsContent value="documenti" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Documenti Aziendali</h3>
                    <Button size="sm" onClick={() => setShowAddDocDialog(true)} className="gap-1">
                      <Plus className="w-4 h-4" /> Aggiungi Documento
                    </Button>
                  </div>
                  {(() => {
                    const docs = getDocumentiImpresa(selectedImpresa.id);
                    if (docs.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">Nessun documento caricato</p>
                          <Button onClick={() => setShowAddDocDialog(true)} className="gap-2">
                            <Upload className="w-4 h-4" />
                            Carica primo documento
                          </Button>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        {docs.map(doc => (
                          <div key={doc.id} className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            doc.stato === 'scaduto' ? 'border-red-500/30 bg-red-500/5' :
                            doc.stato === 'in_scadenza' ? 'border-amber-500/30 bg-amber-500/5' :
                            'border-border'
                          )}>
                            <div className="flex items-center gap-3">
                              <FileText className={cn(
                                "w-5 h-5",
                                doc.stato === 'scaduto' ? 'text-red-500' :
                                doc.stato === 'in_scadenza' ? 'text-amber-500' :
                                'text-muted-foreground'
                              )} />
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
                              <StatusPill type="document" value={doc.stato} size="xs" />
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
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

                {/* Lavoratori Tab */}
                <TabsContent value="lavoratori" className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Lavoratori dell'Impresa</h3>
                    <Button size="sm" variant="outline" onClick={() => navigate('/lavoratori')} className="gap-1">
                      Gestisci Lavoratori
                    </Button>
                  </div>
                  {(() => {
                    const lavs = getLavoratoriImpresa(selectedImpresa.id);
                    if (lavs.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-4">Nessun lavoratore associato a questa impresa</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {lavs.map(lav => (
                          <div
                            key={lav.id}
                            onClick={() => navigate('/lavoratori')}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{lav.cognome} {lav.nome}</p>
                                <p className="text-xs text-muted-foreground">{lav.mansione} • CF: {lav.codiceFiscale}</p>
                              </div>
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
                  {TIPI_DOCUMENTI_IMPRESA.map(d => (
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
                placeholder="es. DURC Maggio 2024"
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
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
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
                  id="impresa-doc-camera"
                />
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('impresa-doc-camera')?.click()}
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
    </div>
  );
}
