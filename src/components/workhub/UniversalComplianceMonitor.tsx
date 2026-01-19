import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Euro,
  RefreshCw,
  Eye,
  Building2,
  Users,
  Truck,
  Stethoscope,
  HardHat,
  Plus,
  Upload,
  FileText,
  Calendar,
  Download,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { differenceInDays, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useFileUpload } from '@/hooks/useFileUpload';

type EntityType = 'fornitore' | 'impresa' | 'lavoratore' | 'azienda';

interface UniversalComplianceMonitorProps {
  className?: string;
}

interface DocumentoCompliance {
  id: string;
  entity_id: string;
  entity_type: EntityType;
  entity_name: string;
  tipo_documento: string;
  data_scadenza: string | null;
  data_emissione: string | null;
  file_url: string | null;
  stato: string;
  obbligatorio: boolean;
}

interface EntityComplianceStatus {
  entityId: string;
  entityName: string;
  entityType: EntityType;
  documentiValidi: number;
  documentiInScadenza: number;
  documentiScaduti: number;
  documentiMancanti: string[];
  pagabile: boolean;
  percentualeCompliance: number;
}

// Documenti obbligatori per tipo entità
const DOCUMENTI_OBBLIGATORI: Record<EntityType, string[]> = {
  fornitore: ['DURC', 'VISURA_CAMERALE', 'POLIZZA_RCT_RCO', 'DICH_ANTIMAFIA', 'DVR'],
  impresa: ['DURC', 'VISURA_CAMERALE', 'POLIZZA_RCT_RCO', 'DVR', 'DICH_ANTIMAFIA', 'CERT_SOA'],
  lavoratore: ['DOCUMENTO_IDENTITA', 'IDONEITA_SANITARIA', 'ATTESTATO_SICUREZZA', 'UNILAV'],
  azienda: ['DURC', 'VISURA_CAMERALE', 'POLIZZA_RCT_RCO', 'DVR', 'CERT_ISO_9001', 'CERT_ISO_14001', 'CERT_ISO_45001'],
};

const DOCUMENTO_LABELS: Record<string, string> = {
  'DURC': 'DURC',
  'VISURA_CAMERALE': 'Visura Camerale',
  'POLIZZA_RCT_RCO': 'Polizza RCT/RCO',
  'DICH_ANTIMAFIA': 'Antimafia',
  'DVR': 'DVR',
  'CERT_SOA': 'Attestazione SOA',
  'CERT_ISO_9001': 'ISO 9001',
  'CERT_ISO_14001': 'ISO 14001',
  'CERT_ISO_45001': 'ISO 45001',
  'DOCUMENTO_IDENTITA': 'Documento Identità',
  'IDONEITA_SANITARIA': 'Idoneità Sanitaria',
  'ATTESTATO_SICUREZZA': 'Attestato Sicurezza',
  'UNILAV': 'UniLav',
  'PERMESSO_SOGGIORNO': 'Permesso Soggiorno',
  'PATENTE': 'Patente',
  'FORMAZIONE_SPECIFICA': 'Formazione Specifica',
};

const ENTITY_ICONS: Record<EntityType, React.ReactNode> = {
  fornitore: <Truck className="w-4 h-4" />,
  impresa: <Building2 className="w-4 h-4" />,
  lavoratore: <HardHat className="w-4 h-4" />,
  azienda: <Shield className="w-4 h-4" />,
};

const ENTITY_LABELS: Record<EntityType, string> = {
  fornitore: 'Fornitori',
  impresa: 'Imprese Esterne',
  lavoratore: 'Lavoratori',
  azienda: 'Azienda',
};

export function UniversalComplianceMonitor({ className }: UniversalComplianceMonitorProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EntityType>('fornitore');
  const [selectedEntity, setSelectedEntity] = useState<EntityComplianceStatus | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddDocDialog, setShowAddDocDialog] = useState(false);
  const [addingDocForEntity, setAddingDocForEntity] = useState<{ id: string; name: string; type: EntityType } | null>(null);
  const [newDocForm, setNewDocForm] = useState({
    tipo: '',
    dataEmissione: '',
    dataScadenza: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploadFile, uploading, progress } = useFileUpload({
    bucket: 'documenti',
    folder: 'compliance',
  });

  // Fetch Fornitori
  const { data: fornitori = [] } = useQuery({
    queryKey: ['fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fornitori')
        .select('id, ragione_sociale, stato')
        .eq('stato', 'attivo');
      if (error) throw error;
      return data;
    }
  });

  // Fetch Imprese
  const { data: imprese = [] } = useQuery({
    queryKey: ['imprese_compliance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imprese')
        .select('id, ragione_sociale');
      if (error) throw error;
      return data;
    }
  });

  // Fetch Lavoratori
  const { data: lavoratori = [] } = useQuery({
    queryKey: ['lavoratori_compliance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lavoratori')
        .select('id, nome, cognome');
      if (error) throw error;
      return data.map(l => ({ ...l, nome_completo: `${l.cognome} ${l.nome}` }));
    }
  });

  // Fetch documenti fornitori
  const { data: documentiFornitoriRaw = [] } = useQuery({
    queryKey: ['documenti_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documenti_fornitori')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Fetch documenti generici (per imprese, lavoratori, azienda)
  const { data: documentiGenerici = [] } = useQuery({
    queryKey: ['documenti_generici'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documenti')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Fetch documenti azienda
  const { data: documentiAzienda = [] } = useQuery({
    queryKey: ['documenti_azienda'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documenti_azienda')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Calculate compliance for each entity type
  const calculateCompliance = (
    entityId: string,
    entityName: string,
    entityType: EntityType,
    entityDocuments: any[]
  ): EntityComplianceStatus => {
    const obbligatori = DOCUMENTI_OBBLIGATORI[entityType];
    const today = new Date();
    
    let validi = 0;
    let inScadenza = 0;
    let scaduti = 0;
    const mancanti: string[] = [];

    obbligatori.forEach(tipoDoc => {
      const doc = entityDocuments.find(d => d.tipo_documento === tipoDoc || d.tipo === tipoDoc);
      if (!doc) {
        mancanti.push(tipoDoc);
      } else {
        const dataScadenza = doc.data_scadenza;
        if (dataScadenza) {
          const scadenza = new Date(dataScadenza);
          const giorniRimanenti = differenceInDays(scadenza, today);
          
          if (giorniRimanenti < 0) {
            scaduti++;
            mancanti.push(tipoDoc);
          } else if (giorniRimanenti <= 30) {
            inScadenza++;
          } else {
            validi++;
          }
        } else {
          validi++;
        }
      }
    });

    const pagabile = mancanti.length === 0;
    const percentuale = Math.round(((obbligatori.length - mancanti.length) / obbligatori.length) * 100);

    return {
      entityId,
      entityName,
      entityType,
      documentiValidi: validi,
      documentiInScadenza: inScadenza,
      documentiScaduti: scaduti,
      documentiMancanti: mancanti,
      pagabile,
      percentualeCompliance: percentuale,
    };
  };

  // Compliance status per tipo
  const complianceStatuses = useMemo(() => {
    const result: Record<EntityType, EntityComplianceStatus[]> = {
      fornitore: [],
      impresa: [],
      lavoratore: [],
      azienda: [],
    };

    // Fornitori
    result.fornitore = fornitori.map(f => {
      const docs = documentiFornitoriRaw.filter(d => d.fornitore_id === f.id);
      return calculateCompliance(f.id, f.ragione_sociale, 'fornitore', docs);
    });

    // Imprese
    result.impresa = imprese.map(i => {
      const docs = documentiGenerici.filter(d => d.entita_tipo === 'impresa' && d.entita_id === i.id);
      return calculateCompliance(i.id, i.ragione_sociale, 'impresa', docs);
    });

    // Lavoratori
    result.lavoratore = lavoratori.map(l => {
      const docs = documentiGenerici.filter(d => d.entita_tipo === 'lavoratore' && d.entita_id === l.id);
      return calculateCompliance(l.id, l.nome_completo, 'lavoratore', docs);
    });

    // Azienda (single entity)
    if (documentiAzienda.length > 0 || true) {
      result.azienda = [{
        ...calculateCompliance('azienda', 'Azienda Principale', 'azienda', documentiAzienda),
      }];
    }

    return result;
  }, [fornitori, imprese, lavoratori, documentiFornitoriRaw, documentiGenerici, documentiAzienda]);

  // Stats per tab attivo
  const activeStats = useMemo(() => {
    const statuses = complianceStatuses[activeTab];
    return {
      totale: statuses.length,
      pagabili: statuses.filter(s => s.pagabile).length,
      bloccati: statuses.filter(s => !s.pagabile).length,
      inScadenza: statuses.filter(s => s.documentiInScadenza > 0).length,
      critici: statuses.filter(s => s.documentiScaduti > 0).length,
    };
  }, [complianceStatuses, activeTab]);

  // Add document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (data: { entityId: string; entityType: EntityType; tipo: string; dataEmissione: string; dataScadenza: string; fileUrl: string | null }) => {
      if (data.entityType === 'fornitore') {
        const { error } = await supabase.from('documenti_fornitori').insert({
          fornitore_id: data.entityId,
          tipo_documento: data.tipo,
          data_emissione: data.dataEmissione || null,
          data_scadenza: data.dataScadenza || null,
          file_url: data.fileUrl,
          stato: 'valido',
          obbligatorio: true,
        });
        if (error) throw error;
      } else if (data.entityType === 'azienda') {
        const { error } = await supabase.from('documenti_azienda').insert({
          tipo: data.tipo,
          titolo: DOCUMENTO_LABELS[data.tipo] || data.tipo,
          categoria: 'compliance',
          data_emissione: data.dataEmissione || null,
          data_scadenza: data.dataScadenza || null,
          file_url: data.fileUrl,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('documenti').insert({
          entita_id: data.entityId,
          entita_tipo: data.entityType,
          tipo: data.tipo,
          titolo: DOCUMENTO_LABELS[data.tipo] || data.tipo,
          data_emissione: data.dataEmissione || null,
          data_scadenza: data.dataScadenza || null,
          file_url: data.fileUrl,
          stato: 'valido',
          obbligatorio: true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documenti_fornitori'] });
      queryClient.invalidateQueries({ queryKey: ['documenti_generici'] });
      queryClient.invalidateQueries({ queryKey: ['documenti_azienda'] });
      toast.success('Documento aggiunto!');
      setShowAddDocDialog(false);
      setNewDocForm({ tipo: '', dataEmissione: '', dataScadenza: '' });
      setSelectedFile(null);
      setAddingDocForEntity(null);
    },
    onError: () => {
      toast.error('Errore nell\'aggiunta del documento');
    }
  });

  const handleAddDocument = async () => {
    if (!addingDocForEntity || !newDocForm.tipo) return;

    let fileUrl: string | null = null;
    if (selectedFile) {
      const result = await uploadFile(selectedFile);
      if (result) {
        fileUrl = result.url;
      }
    }

    addDocumentMutation.mutate({
      entityId: addingDocForEntity.id,
      entityType: addingDocForEntity.type,
      tipo: newDocForm.tipo,
      dataEmissione: newDocForm.dataEmissione,
      dataScadenza: newDocForm.dataScadenza,
      fileUrl,
    });
  };

  const getStatusIcon = (status: EntityComplianceStatus) => {
    if (status.pagabile && status.documentiInScadenza === 0) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status.pagabile && status.documentiInScadenza > 0) {
      return <Clock className="w-5 h-5 text-amber-500" />;
    } else {
      return <Ban className="w-5 h-5 text-red-500" />;
    }
  };

  const getPaymentBadge = (pagabile: boolean) => {
    if (pagabile) {
      return <Badge className="bg-green-100 text-green-800"><Euro className="w-3 h-3 mr-1" />Pagabile</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800"><Ban className="w-3 h-3 mr-1" />Bloccato</Badge>;
  };

  const openAddDocDialog = (entity: EntityComplianceStatus) => {
    setAddingDocForEntity({ id: entity.entityId, name: entity.entityName, type: entity.entityType });
    setShowAddDocDialog(true);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Monitoraggio Compliance Universale
          </h2>
          <p className="text-sm text-muted-foreground">
            Tracciamento documentale per Fornitori, Imprese, Lavoratori e Azienda
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="fornitore" className="gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Fornitori</span>
          </TabsTrigger>
          <TabsTrigger value="impresa" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Imprese</span>
          </TabsTrigger>
          <TabsTrigger value="lavoratore" className="gap-2">
            <HardHat className="w-4 h-4" />
            <span className="hidden sm:inline">Lavoratori</span>
          </TabsTrigger>
          <TabsTrigger value="azienda" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Azienda</span>
          </TabsTrigger>
        </TabsList>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <Card>
            <CardContent className="p-4 text-center">
              {ENTITY_ICONS[activeTab]}
              <p className="text-2xl font-bold mt-2">{activeStats.totale}</p>
              <p className="text-xs text-muted-foreground">Totale</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto text-green-500" />
              <p className="text-2xl font-bold text-green-700 mt-2">{activeStats.pagabili}</p>
              <p className="text-xs text-green-600">Conformi</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4 text-center">
              <Ban className="w-6 h-6 mx-auto text-red-500" />
              <p className="text-2xl font-bold text-red-700 mt-2">{activeStats.bloccati}</p>
              <p className="text-xs text-red-600">Non Conformi</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-amber-500" />
              <p className="text-2xl font-bold text-amber-700 mt-2">{activeStats.inScadenza}</p>
              <p className="text-xs text-amber-600">In Scadenza</p>
            </CardContent>
          </Card>
          <Card className="border-red-300 bg-red-100/50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto text-red-600" />
              <p className="text-2xl font-bold text-red-700 mt-2">{activeStats.critici}</p>
              <p className="text-xs text-red-600">Critici</p>
            </CardContent>
          </Card>
        </div>

        {/* Table Content */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {ENTITY_ICONS[activeTab]}
              {ENTITY_LABELS[activeTab]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-center">Compliance</TableHead>
                  {DOCUMENTI_OBBLIGATORI[activeTab].slice(0, 5).map(doc => (
                    <TableHead key={doc} className="text-center text-xs">
                      {DOCUMENTO_LABELS[doc]?.split(' ')[0] || doc}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceStatuses[activeTab].length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nessun elemento trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  complianceStatuses[activeTab].map((status) => (
                    <TableRow key={status.entityId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="font-medium">{status.entityName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={status.percentualeCompliance} className="w-16 h-2" />
                          <span className="text-sm font-medium">{status.percentualeCompliance}%</span>
                        </div>
                      </TableCell>
                      {DOCUMENTI_OBBLIGATORI[activeTab].slice(0, 5).map(doc => {
                        const isMancante = status.documentiMancanti.includes(doc);
                        return (
                          <TableCell key={doc} className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {isMancante ? (
                                    <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {DOCUMENTO_LABELS[doc]}: {isMancante ? 'Mancante' : 'OK'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        {getPaymentBadge(status.pagabile)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEntity(status);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAddDocDialog(status)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntity && ENTITY_ICONS[selectedEntity.entityType]}
              {selectedEntity?.entityName}
            </DialogTitle>
          </DialogHeader>

          {selectedEntity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Compliance</span>
                      <span className="text-lg font-bold">{selectedEntity.percentualeCompliance}%</span>
                    </div>
                    <Progress value={selectedEntity.percentualeCompliance} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stato</span>
                      {getPaymentBadge(selectedEntity.pagabile)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedEntity.documentiMancanti.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Documenti Mancanti/Scaduti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntity.documentiMancanti.map(doc => (
                        <Badge key={doc} variant="destructive">
                          {DOCUMENTO_LABELS[doc] || doc}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="mt-4 gap-2"
                      onClick={() => {
                        setShowDetailsDialog(false);
                        openAddDocDialog(selectedEntity);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Aggiungi Documento
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Documenti Obbligatori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DOCUMENTI_OBBLIGATORI[selectedEntity.entityType].map(doc => {
                      const isMancante = selectedEntity.documentiMancanti.includes(doc);
                      return (
                        <Card key={doc} className={cn(
                          "p-3",
                          isMancante ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                        )}>
                          <div className="flex items-center gap-2">
                            {isMancante ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">
                              {DOCUMENTO_LABELS[doc] || doc}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={showAddDocDialog} onOpenChange={setShowAddDocDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Aggiungi Documento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {addingDocForEntity && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Entità:</p>
                <p className="font-medium">{addingDocForEntity.name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo Documento *</label>
              <Select
                value={newDocForm.tipo}
                onValueChange={(v) => setNewDocForm({ ...newDocForm, tipo: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {addingDocForEntity && DOCUMENTI_OBBLIGATORI[addingDocForEntity.type].map(doc => (
                    <SelectItem key={doc} value={doc}>
                      {DOCUMENTO_LABELS[doc] || doc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Emissione</label>
                <Input
                  type="date"
                  value={newDocForm.dataEmissione}
                  onChange={(e) => setNewDocForm({ ...newDocForm, dataEmissione: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Scadenza</label>
                <Input
                  type="date"
                  value={newDocForm.dataScadenza}
                  onChange={(e) => setNewDocForm({ ...newDocForm, dataScadenza: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">File Allegato</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="compliance-file-upload"
                />
                <label htmlFor="compliance-file-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? selectedFile.name : 'Clicca per caricare'}
                  </p>
                </label>
              </div>
              {uploading && (
                <Progress value={progress} className="mt-2" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDocDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={handleAddDocument} 
              disabled={!newDocForm.tipo || uploading || addDocumentMutation.isPending}
            >
              {uploading ? 'Caricamento...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UniversalComplianceMonitor;
