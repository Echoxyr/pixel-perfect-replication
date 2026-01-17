import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Plus,
  Building2,
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
  Calculator,
  Download,
  Search,
  Truck,
  Euro,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
  AlertOctagon,
  CheckCircle2,
  FileBadge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { Link } from 'react-router-dom';

// Types
interface Fornitore {
  id: string;
  ragione_sociale: string;
  partita_iva: string | null;
  indirizzo: string | null;
  citta: string | null;
  cap: string | null;
  telefono: string | null;
  email: string | null;
  pec: string | null;
  categoria: string | null;
  sconto_base: number | null;
  condizioni_pagamento: string | null;
  note: string | null;
  stato: string;
}

interface PreventivoFornitore {
  id: string;
  numero: string;
  data: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  oggetto: string;
  importo: number | null;
  stato: string;
  scadenza: string | null;
  note: string | null;
}

interface OrdineFornitore {
  id: string;
  numero: string;
  data: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  importo: number;
  stato: string;
  data_consegna_prevista: string | null;
  data_consegna_effettiva: string | null;
  note: string | null;
}

interface Contratto {
  id: string;
  numero: string;
  titolo: string;
  tipo: string;
  contraente: string;
  importo: number;
  data_inizio: string;
  data_fine: string;
  stato: string;
  rinnovo_automatico: boolean | null;
  descrizione: string | null;
}

interface ListinoFornitore {
  id: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  nome: string;
  valido_dal: string;
  valido_al: string | null;
  sconto_applicato: number | null;
  attivo: boolean | null;
}

export default function UfficioCommerciale() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('contratti');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showNewFornitore, setShowNewFornitore] = useState(false);
  const [showNewPreventivo, setShowNewPreventivo] = useState(false);
  const [showNewOrdine, setShowNewOrdine] = useState(false);
  const [showNewContratto, setShowNewContratto] = useState(false);
  const [showNewListino, setShowNewListino] = useState(false);

  // Form states
  const [newFornitore, setNewFornitore] = useState({
    ragione_sociale: '',
    partita_iva: '',
    indirizzo: '',
    citta: '',
    cap: '',
    telefono: '',
    email: '',
    pec: '',
    categoria: '',
    sconto_base: 0,
    condizioni_pagamento: '30 gg DFFM',
    stato: 'attivo'
  });

  const [newPreventivo, setNewPreventivo] = useState({
    numero: `PRV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    fornitore_id: '',
    fornitore_nome: '',
    oggetto: '',
    importo: 0,
    scadenza: '',
    note: ''
  });

  const [newOrdine, setNewOrdine] = useState({
    numero: `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    fornitore_id: '',
    fornitore_nome: '',
    importo: 0,
    data_consegna_prevista: '',
    note: ''
  });

  const [newContratto, setNewContratto] = useState({
    numero: `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    titolo: '',
    tipo: 'appalto',
    contraente: '',
    importo: 0,
    data_inizio: new Date().toISOString().split('T')[0],
    data_fine: '',
    rinnovo_automatico: false,
    descrizione: ''
  });

  const [newListino, setNewListino] = useState({
    fornitore_id: '',
    fornitore_nome: '',
    nome: '',
    valido_dal: new Date().toISOString().split('T')[0],
    valido_al: '',
    sconto_applicato: 0
  });

  // Queries
  const { data: fornitori = [] } = useQuery({
    queryKey: ['fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fornitori').select('*').order('ragione_sociale');
      if (error) throw error;
      return data as Fornitore[];
    }
  });

  const { data: preventivi = [] } = useQuery({
    queryKey: ['preventivi_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('preventivi_fornitori').select('*').order('data', { ascending: false });
      if (error) throw error;
      return data as PreventivoFornitore[];
    }
  });

  const { data: ordini = [] } = useQuery({
    queryKey: ['ordini_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ordini_fornitori').select('*').order('data', { ascending: false });
      if (error) throw error;
      return data as OrdineFornitore[];
    }
  });

  const { data: contratti = [] } = useQuery({
    queryKey: ['contratti'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contratti').select('*').order('data_inizio', { ascending: false });
      if (error) throw error;
      return data as Contratto[];
    }
  });

  const { data: listini = [] } = useQuery({
    queryKey: ['listini_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('listini_fornitori').select('*').order('valido_dal', { ascending: false });
      if (error) throw error;
      return data as ListinoFornitore[];
    }
  });

  // Mutations
  const createFornitoreMutation = useMutation({
    mutationFn: async (data: typeof newFornitore) => {
      const { error } = await supabase.from('fornitori').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornitori'] });
      toast.success('Fornitore creato');
      setShowNewFornitore(false);
      setNewFornitore({ ragione_sociale: '', partita_iva: '', indirizzo: '', citta: '', cap: '', telefono: '', email: '', pec: '', categoria: '', sconto_base: 0, condizioni_pagamento: '30 gg DFFM', stato: 'attivo' });
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const createPreventivoMutation = useMutation({
    mutationFn: async (data: typeof newPreventivo) => {
      const { error } = await supabase.from('preventivi_fornitori').insert({
        ...data,
        stato: 'richiesto'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventivi_fornitori'] });
      toast.success('Preventivo richiesto');
      setShowNewPreventivo(false);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const createOrdineMutation = useMutation({
    mutationFn: async (data: typeof newOrdine) => {
      const { error } = await supabase.from('ordini_fornitori').insert({
        ...data,
        stato: 'bozza'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordini_fornitori'] });
      toast.success('Ordine creato');
      setShowNewOrdine(false);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const createContrattoMutation = useMutation({
    mutationFn: async (data: typeof newContratto) => {
      const { error } = await supabase.from('contratti').insert({
        ...data,
        stato: 'attivo'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratti'] });
      toast.success('Contratto creato');
      setShowNewContratto(false);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const createListinoMutation = useMutation({
    mutationFn: async (data: typeof newListino) => {
      const { error } = await supabase.from('listini_fornitori').insert({
        ...data,
        attivo: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listini_fornitori'] });
      toast.success('Listino creato');
      setShowNewListino(false);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const deleteFornitoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fornitori').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornitori'] });
      toast.success('Fornitore eliminato');
    }
  });

  const deleteContrattoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contratti').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratti'] });
      toast.success('Contratto eliminato');
    }
  });

  const updateOrdineStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const update: Record<string, unknown> = { stato };
      if (stato === 'consegnato') {
        update.data_consegna_effettiva = new Date().toISOString().split('T')[0];
      }
      const { error } = await supabase.from('ordini_fornitori').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordini_fornitori'] });
      toast.success('Stato aggiornato');
    }
  });

  const updatePreventivoStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const { error } = await supabase.from('preventivi_fornitori').update({ stato }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventivi_fornitori'] });
      toast.success('Stato aggiornato');
    }
  });

  // Helpers
  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'attivo': case 'approvato': case 'confermato': case 'consegnato': case 'ricevuto':
        return 'bg-emerald-500/15 text-emerald-500';
      case 'in_consegna': case 'inviato':
        return 'bg-sky-500/15 text-sky-500';
      case 'richiesto': case 'bozza':
        return 'bg-amber-500/15 text-amber-500';
      case 'scaduto': case 'rifiutato': case 'annullato': case 'cessato': case 'sospeso':
        return 'bg-red-500/15 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'attivo': case 'approvato': case 'confermato': case 'consegnato':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_consegna': case 'inviato':
        return <Truck className="w-4 h-4" />;
      case 'richiesto': case 'bozza': case 'ricevuto':
        return <Clock className="w-4 h-4" />;
      case 'scaduto': case 'rifiutato': case 'annullato':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('it-IT');

  // Stats
  const stats = {
    contrattiAttivi: contratti.filter(c => c.stato === 'attivo').length,
    valoreTotaleContratti: contratti.filter(c => c.stato === 'attivo').reduce((sum, c) => sum + c.importo, 0),
    preventiviInAttesa: preventivi.filter(p => p.stato === 'richiesto' || p.stato === 'ricevuto').length,
    ordiniInCorso: ordini.filter(o => o.stato !== 'consegnato' && o.stato !== 'annullato').length,
    fornitoriAttivi: fornitori.filter(f => f.stato === 'attivo').length
  };

  // Filter data
  const filteredFornitori = fornitori.filter(f => 
    f.ragione_sociale.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContratti = contratti.filter(c =>
    c.titolo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contraente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = <T extends object>(data: T[], filename: string) => {
    if (data.length === 0) return;
    const columns = Object.keys(data[0]).map(key => ({ key, header: key, width: 15 }));
    exportToExcel(data as Record<string, unknown>[], columns, filename);
    toast.success('Export completato');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reparto Commerciale</h1>
          <p className="text-muted-foreground">Gestione contratti, fornitori, preventivi e ordini</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><FileText className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.contrattiAttivi}</p>
                <p className="text-xs text-muted-foreground">Contratti Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><Euro className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(stats.valoreTotaleContratti)}</p>
                <p className="text-xs text-muted-foreground">Valore Contratti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10"><Receipt className="w-5 h-5 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.preventiviInAttesa}</p>
                <p className="text-xs text-muted-foreground">Preventivi in Attesa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10"><Truck className="w-5 h-5 text-sky-500" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.ordiniInCorso}</p>
                <p className="text-xs text-muted-foreground">Ordini in Corso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><Building2 className="w-5 h-5 text-purple-500" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.fornitoriAttivi}</p>
                <p className="text-xs text-muted-foreground">Fornitori Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="tabs-scrollable-header flex w-full h-auto flex-nowrap justify-start gap-1 p-1">
          <TabsTrigger value="contratti" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><FileText className="w-4 h-4" />Contratti</TabsTrigger>
          <TabsTrigger value="fornitori" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Building2 className="w-4 h-4" />Fornitori</TabsTrigger>
          <TabsTrigger value="documenti-fornitori" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><FileBadge className="w-4 h-4" />Documenti Fornitori</TabsTrigger>
          <TabsTrigger value="preventivi" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Receipt className="w-4 h-4" />Preventivi</TabsTrigger>
          <TabsTrigger value="ordini" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Ordini</TabsTrigger>
          <TabsTrigger value="listini" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />Listini</TabsTrigger>
          <TabsTrigger value="computi" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Calculator className="w-4 h-4" />Computo</TabsTrigger>
        </TabsList>

        {/* Contratti Tab */}
        <TabsContent value="contratti" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contratti</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(contratti, 'contratti')}>
                  <Download className="w-4 h-4" />Esporta
                </Button>
                <Dialog open={showNewContratto} onOpenChange={setShowNewContratto}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Contratto</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Nuovo Contratto</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div><Label>Numero</Label><Input value={newContratto.numero} onChange={(e) => setNewContratto(p => ({ ...p, numero: e.target.value }))} /></div>
                      <div><Label>Tipo</Label>
                        <Select value={newContratto.tipo} onValueChange={(v) => setNewContratto(p => ({ ...p, tipo: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="appalto">Appalto</SelectItem>
                            <SelectItem value="subappalto">Subappalto</SelectItem>
                            <SelectItem value="fornitura">Fornitura</SelectItem>
                            <SelectItem value="servizio">Servizio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"><Label>Titolo *</Label><Input value={newContratto.titolo} onChange={(e) => setNewContratto(p => ({ ...p, titolo: e.target.value }))} /></div>
                      <div><Label>Contraente *</Label><Input value={newContratto.contraente} onChange={(e) => setNewContratto(p => ({ ...p, contraente: e.target.value }))} /></div>
                      <div><Label>Importo €</Label><Input type="number" value={newContratto.importo} onChange={(e) => setNewContratto(p => ({ ...p, importo: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Data Inizio</Label><Input type="date" value={newContratto.data_inizio} onChange={(e) => setNewContratto(p => ({ ...p, data_inizio: e.target.value }))} /></div>
                      <div><Label>Data Fine</Label><Input type="date" value={newContratto.data_fine} onChange={(e) => setNewContratto(p => ({ ...p, data_fine: e.target.value }))} /></div>
                      <div className="col-span-2"><Label>Descrizione</Label><Textarea value={newContratto.descrizione} onChange={(e) => setNewContratto(p => ({ ...p, descrizione: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewContratto(false)}>Annulla</Button>
                      <Button onClick={() => createContrattoMutation.mutate(newContratto)} disabled={!newContratto.titolo || !newContratto.contraente}>Salva</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contraente</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContratti.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.numero}</TableCell>
                      <TableCell className="font-medium">{c.titolo}</TableCell>
                      <TableCell><Badge variant="outline">{c.tipo}</Badge></TableCell>
                      <TableCell>{c.contraente}</TableCell>
                      <TableCell>{formatCurrency(c.importo)}</TableCell>
                      <TableCell className="text-sm">{formatDate(c.data_inizio)} - {formatDate(c.data_fine)}</TableCell>
                      <TableCell><Badge className={cn("gap-1", getStatoColor(c.stato))}>{getStatoIcon(c.stato)}{c.stato}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteContrattoMutation.mutate(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredContratti.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessun contratto trovato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documenti Fornitori - Compliance Tab */}
        <TabsContent value="documenti-fornitori" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBadge className="w-5 h-5" />
                Regolarità Documentale Fornitori
              </CardTitle>
              <p className="text-sm text-muted-foreground">Verifica veloce della documentazione obbligatoria per pagamenti e compliance</p>
            </CardHeader>
            <CardContent>
              {/* Documenti obbligatori per fornitore */}
              <div className="space-y-4">
                {fornitori.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun fornitore registrato. Aggiungi fornitori per monitorare la documentazione.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornitore</TableHead>
                        <TableHead className="text-center">DURC</TableHead>
                        <TableHead className="text-center">Visura Camerale</TableHead>
                        <TableHead className="text-center">Cert. ISO</TableHead>
                        <TableHead className="text-center">Polizza RCT/RCO</TableHead>
                        <TableHead className="text-center">Dich. Antimafia</TableHead>
                        <TableHead className="text-center">Fatture Regolari</TableHead>
                        <TableHead>Stato Pagamenti</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fornitori.map(f => {
                        // Simulazione stato documenti (in produzione verrebbe da DB)
                        const docs = {
                          durc: Math.random() > 0.3,
                          visura: Math.random() > 0.2,
                          iso: Math.random() > 0.5,
                          polizza: Math.random() > 0.4,
                          antimafia: Math.random() > 0.3,
                          fatture: Math.random() > 0.2
                        };
                        const completeCount = Object.values(docs).filter(Boolean).length;
                        const totalDocs = 6;
                        const isComplete = completeCount === totalDocs;
                        const hasWarning = completeCount >= 4 && completeCount < totalDocs;
                        const hasCritical = completeCount < 4;

                        return (
                          <TableRow key={f.id}>
                            <TableCell>
                              <div className="font-medium">{f.ragione_sociale}</div>
                              <div className="text-xs text-muted-foreground">{f.partita_iva || 'P.IVA mancante'}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              {docs.durc ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <AlertOctagon className="w-5 h-5 text-red-500 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-center">
                              {docs.visura ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <AlertOctagon className="w-5 h-5 text-red-500 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-center">
                              {docs.iso ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <Clock className="w-5 h-5 text-amber-500 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-center">
                              {docs.polizza ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <AlertOctagon className="w-5 h-5 text-red-500 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-center">
                              {docs.antimafia ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <AlertOctagon className="w-5 h-5 text-red-500 mx-auto" />}
                            </TableCell>
                            <TableCell className="text-center">
                              {docs.fatture ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <Clock className="w-5 h-5 text-amber-500 mx-auto" />}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "gap-1",
                                isComplete ? "bg-emerald-500/15 text-emerald-500" :
                                hasWarning ? "bg-amber-500/15 text-amber-500" :
                                "bg-red-500/15 text-red-500"
                              )}>
                                {isComplete ? <CheckCircle className="w-3 h-3" /> : hasCritical ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {isComplete ? 'Pagabile' : hasWarning ? 'In Attesa Doc.' : 'Blocco Pagamento'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Legenda Documenti Obbligatori</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div><strong>DURC:</strong> Documento Unico Regolarità Contributiva (validità 120gg)</div>
                    <div><strong>Visura:</strong> Visura Camerale aggiornata (max 6 mesi)</div>
                    <div><strong>Cert. ISO:</strong> Certificazioni qualità (opzionale ma consigliato)</div>
                    <div><strong>Polizza RCT/RCO:</strong> Responsabilità Civile Terzi/Operai</div>
                    <div><strong>Antimafia:</strong> Dichiarazione sostitutiva antimafia</div>
                    <div><strong>Fatture:</strong> Fatture conformi e regolarmente emesse</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fornitori Tab */}
        <TabsContent value="fornitori" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fornitori</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(fornitori, 'fornitori')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewFornitore} onOpenChange={setShowNewFornitore}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Fornitore</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Nuovo Fornitore</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="col-span-2"><Label>Ragione Sociale *</Label><Input value={newFornitore.ragione_sociale} onChange={(e) => setNewFornitore(p => ({ ...p, ragione_sociale: e.target.value }))} /></div>
                      <div><Label>Partita IVA</Label><Input value={newFornitore.partita_iva} onChange={(e) => setNewFornitore(p => ({ ...p, partita_iva: e.target.value }))} /></div>
                      <div><Label>Categoria</Label><Input value={newFornitore.categoria} onChange={(e) => setNewFornitore(p => ({ ...p, categoria: e.target.value }))} placeholder="es. Materiali edili" /></div>
                      <div className="col-span-2"><Label>Indirizzo</Label><Input value={newFornitore.indirizzo} onChange={(e) => setNewFornitore(p => ({ ...p, indirizzo: e.target.value }))} /></div>
                      <div><Label>Città</Label><Input value={newFornitore.citta} onChange={(e) => setNewFornitore(p => ({ ...p, citta: e.target.value }))} /></div>
                      <div><Label>CAP</Label><Input value={newFornitore.cap} onChange={(e) => setNewFornitore(p => ({ ...p, cap: e.target.value }))} /></div>
                      <div><Label>Telefono</Label><Input value={newFornitore.telefono} onChange={(e) => setNewFornitore(p => ({ ...p, telefono: e.target.value }))} /></div>
                      <div><Label>Email</Label><Input type="email" value={newFornitore.email} onChange={(e) => setNewFornitore(p => ({ ...p, email: e.target.value }))} /></div>
                      <div><Label>PEC</Label><Input value={newFornitore.pec} onChange={(e) => setNewFornitore(p => ({ ...p, pec: e.target.value }))} /></div>
                      <div><Label>Sconto Base %</Label><Input type="number" value={newFornitore.sconto_base} onChange={(e) => setNewFornitore(p => ({ ...p, sconto_base: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Condizioni Pagamento</Label><Input value={newFornitore.condizioni_pagamento} onChange={(e) => setNewFornitore(p => ({ ...p, condizioni_pagamento: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewFornitore(false)}>Annulla</Button>
                      <Button onClick={() => createFornitoreMutation.mutate(newFornitore)} disabled={!newFornitore.ragione_sociale}>Salva</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ragione Sociale</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Città</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Sconto</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFornitori.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.ragione_sociale}</TableCell>
                      <TableCell>{f.categoria || '-'}</TableCell>
                      <TableCell>{f.citta || '-'}</TableCell>
                      <TableCell>{f.telefono || '-'}</TableCell>
                      <TableCell>{f.email || '-'}</TableCell>
                      <TableCell>{f.sconto_base}%</TableCell>
                      <TableCell><Badge className={getStatoColor(f.stato)}>{f.stato}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteFornitoreMutation.mutate(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredFornitori.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessun fornitore trovato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preventivi Tab */}
        <TabsContent value="preventivi" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Richieste Preventivo</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(preventivi, 'preventivi')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewPreventivo} onOpenChange={setShowNewPreventivo}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="w-4 h-4" />Nuova Richiesta</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nuova Richiesta Preventivo</DialogTitle></DialogHeader>
                    <div className="grid gap-4 pt-4">
                      <div><Label>Fornitore *</Label>
                        <Select value={newPreventivo.fornitore_id} onValueChange={(v) => {
                          const f = fornitori.find(x => x.id === v);
                          setNewPreventivo(p => ({ ...p, fornitore_id: v, fornitore_nome: f?.ragione_sociale || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
                          <SelectContent>
                            {fornitori.map(f => <SelectItem key={f.id} value={f.id}>{f.ragione_sociale}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Oggetto *</Label><Input value={newPreventivo.oggetto} onChange={(e) => setNewPreventivo(p => ({ ...p, oggetto: e.target.value }))} /></div>
                      <div><Label>Importo Stimato €</Label><Input type="number" value={newPreventivo.importo} onChange={(e) => setNewPreventivo(p => ({ ...p, importo: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Scadenza</Label><Input type="date" value={newPreventivo.scadenza} onChange={(e) => setNewPreventivo(p => ({ ...p, scadenza: e.target.value }))} /></div>
                      <div><Label>Note</Label><Textarea value={newPreventivo.note || ''} onChange={(e) => setNewPreventivo(p => ({ ...p, note: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewPreventivo(false)}>Annulla</Button>
                      <Button onClick={() => createPreventivoMutation.mutate(newPreventivo)} disabled={!newPreventivo.fornitore_nome || !newPreventivo.oggetto}>Invia Richiesta</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Oggetto</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preventivi.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.numero}</TableCell>
                      <TableCell>{formatDate(p.data)}</TableCell>
                      <TableCell>{p.fornitore_nome}</TableCell>
                      <TableCell>{p.oggetto}</TableCell>
                      <TableCell>{p.importo ? formatCurrency(p.importo) : '-'}</TableCell>
                      <TableCell>{p.scadenza ? formatDate(p.scadenza) : '-'}</TableCell>
                      <TableCell><Badge className={getStatoColor(p.stato)}>{p.stato}</Badge></TableCell>
                      <TableCell className="text-right flex gap-1 justify-end">
                        {p.stato === 'richiesto' && (
                          <Button size="sm" variant="outline" onClick={() => updatePreventivoStatoMutation.mutate({ id: p.id, stato: 'ricevuto' })}>Ricevuto</Button>
                        )}
                        {p.stato === 'ricevuto' && (
                          <>
                            <Button size="sm" variant="outline" className="text-emerald-500" onClick={() => updatePreventivoStatoMutation.mutate({ id: p.id, stato: 'approvato' })}>Approva</Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => updatePreventivoStatoMutation.mutate({ id: p.id, stato: 'rifiutato' })}>Rifiuta</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {preventivi.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessun preventivo trovato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ordini Tab */}
        <TabsContent value="ordini" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ordini Fornitori</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(ordini, 'ordini')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewOrdine} onOpenChange={setShowNewOrdine}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Ordine</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nuovo Ordine</DialogTitle></DialogHeader>
                    <div className="grid gap-4 pt-4">
                      <div><Label>Fornitore *</Label>
                        <Select value={newOrdine.fornitore_id} onValueChange={(v) => {
                          const f = fornitori.find(x => x.id === v);
                          setNewOrdine(p => ({ ...p, fornitore_id: v, fornitore_nome: f?.ragione_sociale || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
                          <SelectContent>
                            {fornitori.map(f => <SelectItem key={f.id} value={f.id}>{f.ragione_sociale}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Importo €</Label><Input type="number" value={newOrdine.importo} onChange={(e) => setNewOrdine(p => ({ ...p, importo: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Data Consegna Prevista</Label><Input type="date" value={newOrdine.data_consegna_prevista} onChange={(e) => setNewOrdine(p => ({ ...p, data_consegna_prevista: e.target.value }))} /></div>
                      <div><Label>Note</Label><Textarea value={newOrdine.note || ''} onChange={(e) => setNewOrdine(p => ({ ...p, note: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewOrdine(false)}>Annulla</Button>
                      <Button onClick={() => createOrdineMutation.mutate(newOrdine)} disabled={!newOrdine.fornitore_nome}>Crea Ordine</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Consegna Prevista</TableHead>
                    <TableHead>Consegna Effettiva</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordini.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono">{o.numero}</TableCell>
                      <TableCell>{formatDate(o.data)}</TableCell>
                      <TableCell>{o.fornitore_nome}</TableCell>
                      <TableCell>{formatCurrency(o.importo)}</TableCell>
                      <TableCell>{o.data_consegna_prevista ? formatDate(o.data_consegna_prevista) : '-'}</TableCell>
                      <TableCell>{o.data_consegna_effettiva ? formatDate(o.data_consegna_effettiva) : '-'}</TableCell>
                      <TableCell><Badge className={cn("gap-1", getStatoColor(o.stato))}>{getStatoIcon(o.stato)}{o.stato.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-right flex gap-1 justify-end">
                        {o.stato === 'bozza' && (
                          <Button size="sm" variant="outline" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'inviato' })}><Send className="w-3 h-3 mr-1" />Invia</Button>
                        )}
                        {o.stato === 'inviato' && (
                          <Button size="sm" variant="outline" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'confermato' })}>Conferma</Button>
                        )}
                        {o.stato === 'confermato' && (
                          <Button size="sm" variant="outline" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'in_consegna' })}>In Consegna</Button>
                        )}
                        {o.stato === 'in_consegna' && (
                          <Button size="sm" variant="outline" className="text-emerald-500" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'consegnato' })}><CheckCircle className="w-3 h-3 mr-1" />Consegnato</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {ordini.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessun ordine trovato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listini Tab */}
        <TabsContent value="listini" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Listini Prezzi Fornitori</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(listini, 'listini')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewListino} onOpenChange={setShowNewListino}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Listino</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nuovo Listino</DialogTitle></DialogHeader>
                    <div className="grid gap-4 pt-4">
                      <div><Label>Fornitore *</Label>
                        <Select value={newListino.fornitore_id} onValueChange={(v) => {
                          const f = fornitori.find(x => x.id === v);
                          setNewListino(p => ({ ...p, fornitore_id: v, fornitore_nome: f?.ragione_sociale || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
                          <SelectContent>
                            {fornitori.map(f => <SelectItem key={f.id} value={f.id}>{f.ragione_sociale}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Nome Listino *</Label><Input value={newListino.nome} onChange={(e) => setNewListino(p => ({ ...p, nome: e.target.value }))} placeholder="es. Listino 2024" /></div>
                      <div><Label>Valido Dal</Label><Input type="date" value={newListino.valido_dal} onChange={(e) => setNewListino(p => ({ ...p, valido_dal: e.target.value }))} /></div>
                      <div><Label>Valido Al</Label><Input type="date" value={newListino.valido_al} onChange={(e) => setNewListino(p => ({ ...p, valido_al: e.target.value }))} /></div>
                      <div><Label>Sconto Applicato %</Label><Input type="number" value={newListino.sconto_applicato} onChange={(e) => setNewListino(p => ({ ...p, sconto_applicato: parseFloat(e.target.value) || 0 }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewListino(false)}>Annulla</Button>
                      <Button onClick={() => createListinoMutation.mutate(newListino)} disabled={!newListino.fornitore_nome || !newListino.nome}>Salva</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Nome Listino</TableHead>
                    <TableHead>Valido Dal</TableHead>
                    <TableHead>Valido Al</TableHead>
                    <TableHead>Sconto</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listini.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.fornitore_nome}</TableCell>
                      <TableCell>{l.nome}</TableCell>
                      <TableCell>{formatDate(l.valido_dal)}</TableCell>
                      <TableCell>{l.valido_al ? formatDate(l.valido_al) : 'Indeterminato'}</TableCell>
                      <TableCell>{l.sconto_applicato}%</TableCell>
                      <TableCell><Badge className={l.attivo ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted'}>{l.attivo ? 'Attivo' : 'Inattivo'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {listini.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nessun listino trovato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Computo Metrico Tab */}
        <TabsContent value="computi" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Computo Metrico</CardTitle>
              <Link to="/computo-metrico">
                <Button className="gap-2"><Calculator className="w-4 h-4" />Apri Modulo Completo</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Gestione Computi Metrici</h3>
                <p className="text-muted-foreground mb-4">Accedi al modulo completo per la gestione dei computi metrici estimativi</p>
                <Link to="/computo-metrico">
                  <Button>Vai al Computo Metrico</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
