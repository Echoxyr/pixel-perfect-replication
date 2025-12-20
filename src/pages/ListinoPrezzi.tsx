import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  Download,
  Search,
  DollarSign,
  Package,
  Wrench,
  Users,
  Hammer,
  Percent
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
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';

interface VoceListino {
  id: string;
  codice: string;
  descrizione: string;
  unita_misura: string;
  prezzo_unitario: number;
  categoria: string | null;
  sottocategoria: string | null;
  fornitore: string | null;
  costo_acquisto: number | null;
  margine_percentuale: number | null;
  iva_percentuale: number;
  note: string | null;
  attivo: boolean;
  created_at: string;
}

const CATEGORIE = [
  { value: 'manodopera', label: 'Manodopera', icon: Users },
  { value: 'materiale', label: 'Materiale', icon: Package },
  { value: 'attrezzatura', label: 'Attrezzatura', icon: Wrench },
  { value: 'lavorazione', label: 'Lavorazione', icon: Hammer },
  { value: 'altro', label: 'Altro', icon: Tag },
];

const UNITA_MISURA = ['ora', 'giorno', 'cad', 'kg', 'mt', 'mq', 'mc', 'lt', 'corpo', 'forfait'];

export default function ListinoPrezzi() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');

  const [newVoce, setNewVoce] = useState({
    codice: '',
    descrizione: '',
    unita_misura: 'cad',
    prezzo_unitario: 0,
    categoria: 'materiale',
    sottocategoria: '',
    fornitore: '',
    costo_acquisto: 0,
    margine_percentuale: 30,
    iva_percentuale: 22,
    note: '',
  });

  const { data: listino = [], isLoading } = useQuery({
    queryKey: ['listino_prezzi'],
    queryFn: async () => {
      const { data, error } = await supabase.from('listino_prezzi').select('*').eq('attivo', true).order('categoria').order('descrizione');
      if (error) throw error;
      return data as VoceListino[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newVoce) => {
      const { error } = await supabase.from('listino_prezzi').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listino_prezzi'] });
      setShowNew(false);
      resetForm();
      toast.success('Voce aggiunta al listino');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listino_prezzi').update({ attivo: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listino_prezzi'] });
      toast.success('Voce rimossa');
    },
  });

  const resetForm = () => {
    setNewVoce({ codice: '', descrizione: '', unita_misura: 'cad', prezzo_unitario: 0, categoria: 'materiale', sottocategoria: '', fornitore: '', costo_acquisto: 0, margine_percentuale: 30, iva_percentuale: 22, note: '' });
  };

  const calcPrezzoVendita = () => {
    if (newVoce.costo_acquisto && newVoce.margine_percentuale) {
      return newVoce.costo_acquisto * (1 + newVoce.margine_percentuale / 100);
    }
    return newVoce.prezzo_unitario;
  };

  const filteredListino = listino.filter(v => {
    if (filterCategoria !== 'all' && v.categoria !== filterCategoria) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return v.codice.toLowerCase().includes(s) || v.descrizione.toLowerCase().includes(s);
    }
    return true;
  });

  const stats = {
    totaleVoci: listino.length,
    manodopera: listino.filter(v => v.categoria === 'manodopera').length,
    materiali: listino.filter(v => v.categoria === 'materiale').length,
    lavorazioni: listino.filter(v => v.categoria === 'lavorazione').length,
  };

  const handleExport = () => {
    exportToExcel(filteredListino, [
      { key: 'codice', header: 'Codice', width: 15 },
      { key: 'descrizione', header: 'Descrizione', width: 40 },
      { key: 'categoria', header: 'Categoria', width: 15 },
      { key: 'unita_misura', header: 'UM', width: 8 },
      { key: 'prezzo_unitario', header: 'Prezzo', width: 12 },
      { key: 'iva_percentuale', header: 'IVA %', width: 8 },
      { key: 'fornitore', header: 'Fornitore', width: 20 },
    ], 'listino_prezzi');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6 text-primary" />Listino Prezzi</h1>
          <p className="text-muted-foreground">Gestione prezzi materiali, manodopera e lavorazioni</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Esporta</Button>
          <Button onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-2" />Nuova Voce</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Totale Voci</p><p className="text-2xl font-bold">{stats.totaleVoci}</p></div><Tag className="w-8 h-8 text-primary/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Manodopera</p><p className="text-2xl font-bold text-blue-500">{stats.manodopera}</p></div><Users className="w-8 h-8 text-blue-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Materiali</p><p className="text-2xl font-bold text-emerald-500">{stats.materiali}</p></div><Package className="w-8 h-8 text-emerald-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Lavorazioni</p><p className="text-2xl font-bold text-amber-500">{stats.lavorazioni}</p></div><Hammer className="w-8 h-8 text-amber-500/20" /></div></CardContent></Card>
      </div>

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
                {CATEGORIE.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredListino.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Tag className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Nessuna voce nel listino</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codice</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>UM</TableHead>
                  <TableHead className="text-right">Prezzo</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Fornitore</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListino.map((v) => {
                  const CatIcon = CATEGORIE.find(c => c.value === v.categoria)?.icon || Tag;
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono">{v.codice}</TableCell>
                      <TableCell className="font-medium max-w-[300px] truncate">{v.descrizione}</TableCell>
                      <TableCell><Badge variant="outline" className="flex items-center gap-1 w-fit"><CatIcon className="w-3 h-3" />{v.categoria}</Badge></TableCell>
                      <TableCell>{v.unita_misura}</TableCell>
                      <TableCell className="text-right font-mono">€{v.prezzo_unitario.toFixed(2)}</TableCell>
                      <TableCell>{v.iva_percentuale}%</TableCell>
                      <TableCell>{v.fornitore || '-'}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(v.id)}><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nuova Voce */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nuova Voce Listino</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div><label className="text-sm font-medium mb-2 block">Codice *</label><Input placeholder="es. MAN-001" value={newVoce.codice} onChange={(e) => setNewVoce(p => ({ ...p, codice: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Categoria</label><Select value={newVoce.categoria} onValueChange={(v) => setNewVoce(p => ({ ...p, categoria: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIE.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-2 block">Descrizione *</label><Textarea value={newVoce.descrizione} onChange={(e) => setNewVoce(p => ({ ...p, descrizione: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Unità di Misura</label><Select value={newVoce.unita_misura} onValueChange={(v) => setNewVoce(p => ({ ...p, unita_misura: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITA_MISURA.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-medium mb-2 block">IVA %</label><Select value={String(newVoce.iva_percentuale)} onValueChange={(v) => setNewVoce(p => ({ ...p, iva_percentuale: parseInt(v) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">0%</SelectItem><SelectItem value="4">4%</SelectItem><SelectItem value="10">10%</SelectItem><SelectItem value="22">22%</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm font-medium mb-2 block">Costo Acquisto</label><Input type="number" min="0" step="0.01" value={newVoce.costo_acquisto} onChange={(e) => setNewVoce(p => ({ ...p, costo_acquisto: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Margine %</label><Input type="number" min="0" step="1" value={newVoce.margine_percentuale} onChange={(e) => setNewVoce(p => ({ ...p, margine_percentuale: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Prezzo Unitario *</label><Input type="number" min="0" step="0.01" value={newVoce.prezzo_unitario || calcPrezzoVendita()} onChange={(e) => setNewVoce(p => ({ ...p, prezzo_unitario: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="text-sm font-medium mb-2 block">Fornitore</label><Input value={newVoce.fornitore} onChange={(e) => setNewVoce(p => ({ ...p, fornitore: e.target.value }))} /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-2 block">Note</label><Input value={newVoce.note} onChange={(e) => setNewVoce(p => ({ ...p, note: e.target.value }))} /></div>
            <div className="md:col-span-2 flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNew(false); resetForm(); }}>Annulla</Button>
              <Button className="flex-1" onClick={() => createMutation.mutate(newVoce)} disabled={!newVoce.codice || !newVoce.descrizione || !newVoce.prezzo_unitario || createMutation.isPending}>
                {createMutation.isPending ? 'Creazione...' : 'Aggiungi al Listino'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}