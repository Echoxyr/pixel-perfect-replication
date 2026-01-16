import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Building2,
  FileText,
  Users,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  Shield,
  FileCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Search,
  FolderOpen,
  File,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { ExportButton } from '@/components/workhub/ExportButton';

interface DocumentoAzienda {
  id: string;
  tipo: string;
  titolo: string;
  descrizione: string;
  data_emissione: string;
  data_scadenza: string | null;
  allegato_url: string | null;
  categoria: 'azienda' | 'dipendente' | 'sicurezza' | 'fiscale';
  entita_nome: string | null;
  stato: 'valido' | 'in_scadenza' | 'scaduto';
  created_at: string;
}

const CATEGORIE_DOCUMENTI = [
  { value: 'azienda', label: 'Documenti Azienda', icon: Building2 },
  { value: 'dipendente', label: 'Documenti Dipendenti', icon: Users },
  { value: 'sicurezza', label: 'Sicurezza', icon: Shield },
  { value: 'fiscale', label: 'Fiscale', icon: FileCheck },
];

const TIPI_DOCUMENTI = [
  // Azienda
  { value: 'durc', label: 'DURC', categoria: 'azienda' },
  { value: 'visura', label: 'Visura Camerale', categoria: 'azienda' },
  { value: 'polizza_rct', label: 'Polizza RCT/RCO', categoria: 'azienda' },
  { value: 'certificazione_soa', label: 'Certificazione SOA', categoria: 'azienda' },
  { value: 'iso_9001', label: 'ISO 9001', categoria: 'azienda' },
  { value: 'iso_14001', label: 'ISO 14001', categoria: 'azienda' },
  { value: 'iso_45001', label: 'ISO 45001', categoria: 'azienda' },
  { value: 'statuto', label: 'Statuto Societario', categoria: 'azienda' },
  // Dipendente
  { value: 'contratto', label: 'Contratto di lavoro', categoria: 'dipendente' },
  { value: 'cedolino', label: 'Cedolino paga', categoria: 'dipendente' },
  { value: 'idoneita', label: 'Idoneità sanitaria', categoria: 'dipendente' },
  { value: 'attestato_formazione', label: 'Attestato formazione', categoria: 'dipendente' },
  { value: 'patente', label: 'Patente di guida', categoria: 'dipendente' },
  { value: 'cqc', label: 'CQC', categoria: 'dipendente' },
  // Sicurezza
  { value: 'dvr', label: 'DVR', categoria: 'sicurezza' },
  { value: 'pos', label: 'POS', categoria: 'sicurezza' },
  { value: 'psc', label: 'PSC', categoria: 'sicurezza' },
  { value: 'duvri', label: 'DUVRI', categoria: 'sicurezza' },
  { value: 'nomina_rspp', label: 'Nomina RSPP', categoria: 'sicurezza' },
  { value: 'nomina_rls', label: 'Nomina RLS', categoria: 'sicurezza' },
  // Fiscale
  { value: 'bilancio', label: 'Bilancio', categoria: 'fiscale' },
  { value: 'dichiarazione_iva', label: 'Dichiarazione IVA', categoria: 'fiscale' },
  { value: 'f24', label: 'F24', categoria: 'fiscale' },
  { value: 'modello_unico', label: 'Modello Unico', categoria: 'fiscale' },
];

export default function Azienda() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tutti');
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('tutti');
  const [editingDoc, setEditingDoc] = useState<DocumentoAzienda | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    tipo: '',
    titolo: '',
    descrizione: '',
    data_emissione: new Date().toISOString().split('T')[0],
    data_scadenza: '',
    categoria: 'azienda' as DocumentoAzienda['categoria'],
    entita_nome: '',
  });

  // Fetch documenti from Supabase
  const { data: documenti = [], isLoading } = useQuery({
    queryKey: ['documenti-azienda'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documenti_azienda')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        titolo: d.titolo,
        categoria: d.categoria,
        tipo: d.tipo,
        descrizione: d.descrizione,
        dataEmissione: d.data_emissione,
        dataScadenza: d.data_scadenza,
        numeroDocumento: d.numero_documento,
        fileUrl: d.file_url,
        note: d.note,
        createdAt: d.created_at
      })) as DocumentoAzienda[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (doc: Omit<DocumentoAzienda, 'id' | 'created_at' | 'stato' | 'allegato_url'>) => {
      const docs = [...documenti];
      const stato = getStatoDocumento(doc.data_scadenza);
      
      if (editingDoc) {
        const idx = docs.findIndex(d => d.id === editingDoc.id);
        if (idx !== -1) {
          docs[idx] = { ...docs[idx], ...doc, stato };
        }
      } else {
        const newDoc: DocumentoAzienda = {
          ...doc,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          stato,
          allegato_url: null,
        };
        docs.push(newDoc);
      }
      
      localStorage.setItem('documenti-azienda', JSON.stringify(docs));
      return docs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documenti-azienda'] });
      setShowDialog(false);
      resetForm();
      toast({ title: editingDoc ? 'Documento aggiornato' : 'Documento aggiunto' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const docs = documenti.filter(d => d.id !== id);
      localStorage.setItem('documenti-azienda', JSON.stringify(docs));
      return docs;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documenti-azienda'] });
      toast({ title: 'Documento eliminato' });
    },
  });

  const getStatoDocumento = (dataScadenza: string | null): DocumentoAzienda['stato'] => {
    if (!dataScadenza) return 'valido';
    const giorni = differenceInDays(new Date(dataScadenza), new Date());
    if (giorni < 0) return 'scaduto';
    if (giorni <= 30) return 'in_scadenza';
    return 'valido';
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      titolo: '',
      descrizione: '',
      data_emissione: new Date().toISOString().split('T')[0],
      data_scadenza: '',
      categoria: 'azienda',
      entita_nome: '',
    });
    setEditingDoc(null);
    setSelectedFile(null);
  };

  const openEdit = (doc: DocumentoAzienda) => {
    setEditingDoc(doc);
    setFormData({
      tipo: doc.tipo,
      titolo: doc.titolo,
      descrizione: doc.descrizione,
      data_emissione: doc.data_emissione,
      data_scadenza: doc.data_scadenza || '',
      categoria: doc.categoria,
      entita_nome: doc.entita_nome || '',
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.titolo || !formData.tipo) {
      toast({ title: 'Compila i campi obbligatori', variant: 'destructive' });
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredDocumenti = documenti.filter(doc => {
    const matchSearch = doc.titolo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       doc.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (doc.entita_nome && doc.entita_nome.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategoria = filterCategoria === 'tutti' || doc.categoria === filterCategoria;
    const matchTab = activeTab === 'tutti' || doc.categoria === activeTab;
    return matchSearch && matchCategoria && matchTab;
  });

  const stats = {
    totali: documenti.length,
    validi: documenti.filter(d => d.stato === 'valido').length,
    inScadenza: documenti.filter(d => d.stato === 'in_scadenza').length,
    scaduti: documenti.filter(d => d.stato === 'scaduto').length,
  };

  const getStatoBadge = (stato: DocumentoAzienda['stato']) => {
    switch (stato) {
      case 'valido':
        return <Badge className="bg-emerald-500/15 text-emerald-500">Valido</Badge>;
      case 'in_scadenza':
        return <Badge className="bg-amber-500/15 text-amber-500">In scadenza</Badge>;
      case 'scaduto':
        return <Badge className="bg-red-500/15 text-red-500">Scaduto</Badge>;
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    const cat = CATEGORIE_DOCUMENTI.find(c => c.value === categoria);
    return cat ? cat.icon : FileText;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Archivio Azienda</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestisci documenti aziendali, dipendenti, sicurezza e fiscali
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={filteredDocumenti} 
            filename="archivio-azienda"
            columns={[
              { key: 'titolo', label: 'Titolo' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'categoria', label: 'Categoria' },
              { key: 'data_emissione', label: 'Emissione' },
              { key: 'data_scadenza', label: 'Scadenza' },
              { key: 'stato', label: 'Stato' },
            ]}
          />
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Documento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totali}</p>
              <p className="text-xs text-muted-foreground">Documenti Totali</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{stats.validi}</p>
              <p className="text-xs text-muted-foreground">Validi</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{stats.inScadenza}</p>
              <p className="text-xs text-muted-foreground">In Scadenza</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.scaduti}</p>
              <p className="text-xs text-muted-foreground">Scaduti</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-nowrap tabs-scrollable-header h-auto p-1 gap-1">
          <TabsTrigger value="tutti" className="whitespace-nowrap">Tutti</TabsTrigger>
          {CATEGORIE_DOCUMENTI.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="whitespace-nowrap flex items-center gap-2">
              <cat.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca documento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : filteredDocumenti.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nessun documento trovato</p>
                  <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setShowDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi documento
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Emissione</TableHead>
                        <TableHead>Scadenza</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocumenti.map(doc => {
                        const Icon = getCategoriaIcon(doc.categoria);
                        return (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  <Icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{doc.titolo}</p>
                                  <p className="text-xs text-muted-foreground">{doc.tipo}</p>
                                  {doc.entita_nome && (
                                    <p className="text-xs text-primary">{doc.entita_nome}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{doc.categoria}</Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(doc.data_emissione), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              {doc.data_scadenza 
                                ? format(new Date(doc.data_scadenza), 'dd/MM/yyyy')
                                : '-'
                              }
                            </TableCell>
                            <TableCell>{getStatoBadge(doc.stato)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-500"
                                  onClick={() => deleteMutation.mutate(doc.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? 'Modifica Documento' : 'Nuovo Documento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(v) => setFormData({ ...formData, categoria: v as DocumentoAzienda['categoria'] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIE_DOCUMENTI.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo Documento *</Label>
              <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger><SelectValue placeholder="Seleziona tipo" /></SelectTrigger>
                <SelectContent>
                  {TIPI_DOCUMENTI
                    .filter(t => t.categoria === formData.categoria)
                    .map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Titolo *</Label>
              <Input 
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                placeholder="es. DURC Gennaio 2025"
              />
            </div>

            {formData.categoria === 'dipendente' && (
              <div>
                <Label>Nome Dipendente</Label>
                <Input 
                  value={formData.entita_nome}
                  onChange={(e) => setFormData({ ...formData, entita_nome: e.target.value })}
                  placeholder="es. Mario Rossi"
                />
              </div>
            )}

            <div>
              <Label>Descrizione</Label>
              <Textarea 
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Emissione *</Label>
                <Input 
                  type="date"
                  value={formData.data_emissione}
                  onChange={(e) => setFormData({ ...formData, data_emissione: e.target.value })}
                />
              </div>
              <div>
                <Label>Data Scadenza</Label>
                <Input 
                  type="date"
                  value={formData.data_scadenza}
                  onChange={(e) => setFormData({ ...formData, data_scadenza: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Allegato</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Trascina un file o clicca per selezionare
                </p>
                <input 
                  type="file" 
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button variant="outline" size="sm" className="mt-2" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
                  Seleziona File
                </Button>
                {selectedFile && (
                  <p className="text-xs text-primary mt-2">{selectedFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annulla</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {editingDoc ? 'Salva Modifiche' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}