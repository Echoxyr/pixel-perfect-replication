import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Download,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  RotateCcw,
  History,
  Warehouse,
  BoxIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { useWorkHub } from '@/contexts/WorkHubContext';

interface Articolo {
  id: string;
  codice: string;
  descrizione: string;
  categoria: string | null;
  unita_misura: string;
  quantita_disponibile: number;
  quantita_minima: number;
  prezzo_medio: number;
  ubicazione: string | null;
  fornitore_preferito: string | null;
  note: string | null;
  created_at: string;
}

interface Movimento {
  id: string;
  articolo_id: string;
  data: string;
  tipo: string;
  quantita: number;
  cantiere_id: string | null;
  cantiere_nome: string | null;
  documento_tipo: string | null;
  documento_numero: string | null;
  note: string | null;
  eseguito_da: string | null;
  created_at: string;
}

const CATEGORIE = ['Materiale edile', 'Ferramenta', 'Elettrico', 'Idraulico', 'DPI', 'Attrezzi', 'Consumabili', 'Altro'];
const UNITA_MISURA = ['pz', 'kg', 'mt', 'mq', 'mc', 'lt', 'conf', 'rotolo', 'sacco'];

export default function Magazzino() {
  const queryClient = useQueryClient();
  const { cantieri } = useWorkHub();
  const [activeTab, setActiveTab] = useState('articoli');
  const [showNewArticolo, setShowNewArticolo] = useState(false);
  const [showMovimento, setShowMovimento] = useState(false);
  const [selectedArticolo, setSelectedArticolo] = useState<Articolo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');

  const [newArticolo, setNewArticolo] = useState({
    codice: '',
    descrizione: '',
    categoria: 'Altro',
    unita_misura: 'pz',
    quantita_disponibile: 0,
    quantita_minima: 0,
    prezzo_medio: 0,
    ubicazione: '',
    fornitore_preferito: '',
    note: '',
  });

  const [movimento, setMovimento] = useState({
    tipo: 'carico',
    quantita: 0,
    cantiere_id: '',
    cantiere_nome: '',
    documento_tipo: '',
    documento_numero: '',
    note: '',
    eseguito_da: '',
  });

  const { data: articoli = [], isLoading } = useQuery({
    queryKey: ['magazzino'],
    queryFn: async () => {
      const { data, error } = await supabase.from('magazzino').select('*').order('descrizione');
      if (error) throw error;
      return data as Articolo[];
    },
  });

  const { data: movimenti = [] } = useQuery({
    queryKey: ['movimenti_magazzino'],
    queryFn: async () => {
      const { data, error } = await supabase.from('movimenti_magazzino').select('*').order('data', { ascending: false }).limit(100);
      if (error) throw error;
      return data as Movimento[];
    },
  });

  const createArticoloMutation = useMutation({
    mutationFn: async (data: typeof newArticolo) => {
      const { error } = await supabase.from('magazzino').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazzino'] });
      setShowNewArticolo(false);
      resetArticoloForm();
      toast.success('Articolo creato');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createMovimentoMutation = useMutation({
    mutationFn: async () => {
      if (!selectedArticolo) return;
      
      const cantiere = cantieri.find(c => c.id === movimento.cantiere_id);
      const nuovaQta = movimento.tipo === 'carico' 
        ? selectedArticolo.quantita_disponibile + movimento.quantita
        : selectedArticolo.quantita_disponibile - movimento.quantita;

      const { error: movError } = await supabase.from('movimenti_magazzino').insert([{
        articolo_id: selectedArticolo.id,
        tipo: movimento.tipo,
        quantita: movimento.quantita,
        cantiere_id: movimento.cantiere_id || null,
        cantiere_nome: cantiere?.nome || null,
        documento_tipo: movimento.documento_tipo || null,
        documento_numero: movimento.documento_numero || null,
        note: movimento.note || null,
        eseguito_da: movimento.eseguito_da || null,
      }]);
      if (movError) throw movError;

      const { error: updError } = await supabase.from('magazzino').update({ quantita_disponibile: nuovaQta }).eq('id', selectedArticolo.id);
      if (updError) throw updError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazzino'] });
      queryClient.invalidateQueries({ queryKey: ['movimenti_magazzino'] });
      setShowMovimento(false);
      setSelectedArticolo(null);
      resetMovimentoForm();
      toast.success('Movimento registrato');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteArticoloMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('magazzino').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['magazzino'] });
      toast.success('Articolo eliminato');
    },
  });

  const resetArticoloForm = () => {
    setNewArticolo({ codice: '', descrizione: '', categoria: 'Altro', unita_misura: 'pz', quantita_disponibile: 0, quantita_minima: 0, prezzo_medio: 0, ubicazione: '', fornitore_preferito: '', note: '' });
  };

  const resetMovimentoForm = () => {
    setMovimento({ tipo: 'carico', quantita: 0, cantiere_id: '', cantiere_nome: '', documento_tipo: '', documento_numero: '', note: '', eseguito_da: '' });
  };

  const filteredArticoli = articoli.filter(a => {
    if (filterCategoria !== 'all' && a.categoria !== filterCategoria) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return a.codice.toLowerCase().includes(s) || a.descrizione.toLowerCase().includes(s);
    }
    return true;
  });

  const articoliSottoScorta = articoli.filter(a => a.quantita_disponibile <= a.quantita_minima);
  const stats = {
    totaleArticoli: articoli.length,
    sottoScorta: articoliSottoScorta.length,
    valoreMagazzino: articoli.reduce((s, a) => s + (a.quantita_disponibile * a.prezzo_medio), 0),
    movimentiOggi: movimenti.filter(m => m.data === format(new Date(), 'yyyy-MM-dd')).length,
  };

  const handleExport = () => {
    exportToExcel(filteredArticoli, [
      { key: 'codice', header: 'Codice', width: 15 },
      { key: 'descrizione', header: 'Descrizione', width: 30 },
      { key: 'categoria', header: 'Categoria', width: 15 },
      { key: 'quantita_disponibile', header: 'Qta Disp.', width: 12 },
      { key: 'quantita_minima', header: 'Qta Min.', width: 12 },
      { key: 'unita_misura', header: 'UM', width: 8 },
      { key: 'prezzo_medio', header: 'Prezzo', width: 12 },
      { key: 'ubicazione', header: 'Ubicazione', width: 15 },
    ], 'magazzino');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Warehouse className="w-6 h-6 text-primary" />Magazzino</h1>
          <p className="text-muted-foreground">Gestione articoli e movimenti di magazzino</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Esporta</Button>
          <Button onClick={() => setShowNewArticolo(true)}><Plus className="w-4 h-4 mr-2" />Nuovo Articolo</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Articoli</p><p className="text-2xl font-bold">{stats.totaleArticoli}</p></div><BoxIcon className="w-8 h-8 text-primary/20" /></div></CardContent></Card>
        <Card className={stats.sottoScorta > 0 ? 'border-red-500/50' : ''}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Sotto Scorta</p><p className="text-2xl font-bold text-red-500">{stats.sottoScorta}</p></div><AlertTriangle className="w-8 h-8 text-red-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Valore Mag.</p><p className="text-2xl font-bold text-emerald-500">€{stats.valoreMagazzino.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p></div><Package className="w-8 h-8 text-emerald-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Movimenti Oggi</p><p className="text-2xl font-bold text-blue-500">{stats.movimentiOggi}</p></div><History className="w-8 h-8 text-blue-500/20" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="articoli">Articoli</TabsTrigger>
          <TabsTrigger value="movimenti">Movimenti</TabsTrigger>
          <TabsTrigger value="sottoScorta" className="text-red-500">Sotto Scorta ({stats.sottoScorta})</TabsTrigger>
        </TabsList>

        <TabsContent value="articoli" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Cerca codice, descrizione..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    {CATEGORIE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : filteredArticoli.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Nessun articolo trovato</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Codice</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Qta Disp.</TableHead>
                      <TableHead>Qta Min.</TableHead>
                      <TableHead>Prezzo</TableHead>
                      <TableHead>Ubicazione</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticoli.map((a) => (
                      <TableRow key={a.id} className={a.quantita_disponibile <= a.quantita_minima ? 'bg-red-500/5' : ''}>
                        <TableCell className="font-mono">{a.codice}</TableCell>
                        <TableCell className="font-medium">{a.descrizione}</TableCell>
                        <TableCell><Badge variant="outline">{a.categoria}</Badge></TableCell>
                        <TableCell className={a.quantita_disponibile <= a.quantita_minima ? 'text-red-500 font-bold' : ''}>{a.quantita_disponibile} {a.unita_misura}</TableCell>
                        <TableCell className="text-muted-foreground">{a.quantita_minima}</TableCell>
                        <TableCell>€{a.prezzo_medio.toFixed(2)}</TableCell>
                        <TableCell>{a.ubicazione || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => { setSelectedArticolo(a); setMovimento(p => ({ ...p, tipo: 'carico' })); setShowMovimento(true); }}><ArrowUpCircle className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-500" onClick={() => { setSelectedArticolo(a); setMovimento(p => ({ ...p, tipo: 'scarico' })); setShowMovimento(true); }}><ArrowDownCircle className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteArticoloMutation.mutate(a.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimenti" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantità</TableHead>
                    <TableHead>Cantiere</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Eseguito da</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimenti.map((m) => {
                    const art = articoli.find(a => a.id === m.articolo_id);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono">{format(new Date(m.data), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={m.tipo === 'carico' ? 'bg-emerald-500/15 text-emerald-500' : m.tipo === 'scarico' ? 'bg-amber-500/15 text-amber-500' : 'bg-blue-500/15 text-blue-500'}>
                            {m.tipo === 'carico' ? 'Carico' : m.tipo === 'scarico' ? 'Scarico' : m.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{m.tipo === 'scarico' ? '-' : '+'}{m.quantita} {art?.unita_misura || ''}</TableCell>
                        <TableCell>{m.cantiere_nome || '-'}</TableCell>
                        <TableCell>{m.documento_tipo ? `${m.documento_tipo} ${m.documento_numero || ''}` : '-'}</TableCell>
                        <TableCell>{m.eseguito_da || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sottoScorta" className="mt-4">
          <Card className="border-red-500/50">
            <CardHeader><CardTitle className="text-red-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Articoli Sotto Scorta</CardTitle></CardHeader>
            <CardContent>
              {articoliSottoScorta.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nessun articolo sotto scorta</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Codice</TableHead><TableHead>Descrizione</TableHead><TableHead>Qta Attuale</TableHead><TableHead>Qta Minima</TableHead><TableHead>Azione</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {articoliSottoScorta.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono">{a.codice}</TableCell>
                        <TableCell>{a.descrizione}</TableCell>
                        <TableCell className="text-red-500 font-bold">{a.quantita_disponibile} {a.unita_misura}</TableCell>
                        <TableCell>{a.quantita_minima}</TableCell>
                        <TableCell><Button size="sm" onClick={() => { setSelectedArticolo(a); setMovimento(p => ({ ...p, tipo: 'carico' })); setShowMovimento(true); }}><ArrowUpCircle className="w-4 h-4 mr-2" />Carica</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Nuovo Articolo */}
      <Dialog open={showNewArticolo} onOpenChange={setShowNewArticolo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nuovo Articolo</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div><label className="text-sm font-medium mb-2 block">Codice *</label><Input placeholder="es. MAT-001" value={newArticolo.codice} onChange={(e) => setNewArticolo(p => ({ ...p, codice: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Categoria</label><Select value={newArticolo.categoria} onValueChange={(v) => setNewArticolo(p => ({ ...p, categoria: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-2 block">Descrizione *</label><Input placeholder="Descrizione articolo" value={newArticolo.descrizione} onChange={(e) => setNewArticolo(p => ({ ...p, descrizione: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Unità di Misura</label><Select value={newArticolo.unita_misura} onValueChange={(v) => setNewArticolo(p => ({ ...p, unita_misura: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITA_MISURA.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-medium mb-2 block">Quantità Iniziale</label><Input type="number" min="0" value={newArticolo.quantita_disponibile} onChange={(e) => setNewArticolo(p => ({ ...p, quantita_disponibile: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Quantità Minima</label><Input type="number" min="0" value={newArticolo.quantita_minima} onChange={(e) => setNewArticolo(p => ({ ...p, quantita_minima: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Prezzo Medio</label><Input type="number" min="0" step="0.01" value={newArticolo.prezzo_medio} onChange={(e) => setNewArticolo(p => ({ ...p, prezzo_medio: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Ubicazione</label><Input placeholder="es. Scaffale A3" value={newArticolo.ubicazione} onChange={(e) => setNewArticolo(p => ({ ...p, ubicazione: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Fornitore</label><Input placeholder="Fornitore preferito" value={newArticolo.fornitore_preferito} onChange={(e) => setNewArticolo(p => ({ ...p, fornitore_preferito: e.target.value }))} /></div>
            <div className="md:col-span-2 flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNewArticolo(false); resetArticoloForm(); }}>Annulla</Button>
              <Button className="flex-1" onClick={() => createArticoloMutation.mutate(newArticolo)} disabled={!newArticolo.codice || !newArticolo.descrizione || createArticoloMutation.isPending}>
                {createArticoloMutation.isPending ? 'Creazione...' : 'Crea Articolo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Movimento */}
      <Dialog open={showMovimento} onOpenChange={setShowMovimento}>
        <DialogContent>
          <DialogHeader><DialogTitle>{movimento.tipo === 'carico' ? 'Carico' : 'Scarico'} - {selectedArticolo?.descrizione}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Button variant={movimento.tipo === 'carico' ? 'default' : 'outline'} className="flex-1" onClick={() => setMovimento(p => ({ ...p, tipo: 'carico' }))}><ArrowUpCircle className="w-4 h-4 mr-2" />Carico</Button>
              <Button variant={movimento.tipo === 'scarico' ? 'default' : 'outline'} className="flex-1" onClick={() => setMovimento(p => ({ ...p, tipo: 'scarico' }))}><ArrowDownCircle className="w-4 h-4 mr-2" />Scarico</Button>
            </div>
            <div><label className="text-sm font-medium mb-2 block">Quantità *</label><Input type="number" min="0.01" step="0.01" value={movimento.quantita} onChange={(e) => setMovimento(p => ({ ...p, quantita: parseFloat(e.target.value) || 0 }))} /></div>
            {movimento.tipo === 'scarico' && (
              <div><label className="text-sm font-medium mb-2 block">Cantiere</label><Select value={movimento.cantiere_id} onValueChange={(v) => setMovimento(p => ({ ...p, cantiere_id: v }))}><SelectTrigger><SelectValue placeholder="Seleziona cantiere" /></SelectTrigger><SelectContent>{cantieri.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></div>
            )}
            <div><label className="text-sm font-medium mb-2 block">Documento (opzionale)</label><div className="flex gap-2"><Input placeholder="Tipo (DDT, Fattura...)" value={movimento.documento_tipo} onChange={(e) => setMovimento(p => ({ ...p, documento_tipo: e.target.value }))} /><Input placeholder="Numero" value={movimento.documento_numero} onChange={(e) => setMovimento(p => ({ ...p, documento_numero: e.target.value }))} /></div></div>
            <div><label className="text-sm font-medium mb-2 block">Eseguito da</label><Input placeholder="Nome operatore" value={movimento.eseguito_da} onChange={(e) => setMovimento(p => ({ ...p, eseguito_da: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Note</label><Textarea placeholder="Note..." value={movimento.note} onChange={(e) => setMovimento(p => ({ ...p, note: e.target.value }))} /></div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowMovimento(false); setSelectedArticolo(null); resetMovimentoForm(); }}>Annulla</Button>
              <Button className="flex-1" onClick={() => createMovimentoMutation.mutate()} disabled={!movimento.quantita || createMovimentoMutation.isPending}>
                {createMovimentoMutation.isPending ? 'Registrazione...' : 'Registra Movimento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}