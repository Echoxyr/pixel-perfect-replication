import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  ClipboardList,
  Plus,
  Trash2,
  Eye,
  Download,
  Search,
  Calendar,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  CheckCircle,
  Clock,
  Users,
  Thermometer,
  Wrench,
  Package,
  AlertTriangle,
  Shield
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
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';

interface Rapportino {
  id: string;
  data: string;
  cantiere_id: string | null;
  cantiere_nome: string | null;
  redatto_da: string;
  condizioni_meteo: string | null;
  temperatura_min: number | null;
  temperatura_max: number | null;
  ore_lavorate_totali: number;
  lavorazioni_eseguite: string | null;
  materiali_utilizzati: string | null;
  attrezzature_utilizzate: string | null;
  problemi_riscontrati: string | null;
  note_sicurezza: string | null;
  approvato: boolean;
  approvato_da: string | null;
  created_at: string;
}

interface PresenzaRapportino {
  id?: string;
  lavoratore_nome: string;
  ore_ordinarie: number;
  ore_straordinario: number;
  mansione: string;
  note: string;
}

const METEO = [
  { value: 'sereno', label: 'Sereno', icon: Sun },
  { value: 'nuvoloso', label: 'Nuvoloso', icon: Cloud },
  { value: 'pioggia', label: 'Pioggia', icon: CloudRain },
  { value: 'neve', label: 'Neve', icon: Snowflake },
  { value: 'vento_forte', label: 'Vento Forte', icon: Wind },
];

export default function Rapportini() {
  const queryClient = useQueryClient();
  const { cantieri, lavoratori } = useWorkHub();
  const [showNew, setShowNew] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedRapportino, setSelectedRapportino] = useState<Rapportino | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCantiere, setFilterCantiere] = useState<string>('all');

  const [newRapportino, setNewRapportino] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    cantiere_id: '',
    cantiere_nome: '',
    redatto_da: '',
    condizioni_meteo: 'sereno',
    temperatura_min: 0,
    temperatura_max: 0,
    lavorazioni_eseguite: '',
    materiali_utilizzati: '',
    attrezzature_utilizzate: '',
    problemi_riscontrati: '',
    note_sicurezza: '',
  });

  const [presenze, setPresenze] = useState<PresenzaRapportino[]>([
    { lavoratore_nome: '', ore_ordinarie: 8, ore_straordinario: 0, mansione: '', note: '' }
  ]);

  const { data: rapportini = [], isLoading } = useQuery({
    queryKey: ['rapportini'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rapportini')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as Rapportino[];
    },
  });

  const { data: presenzeSelected = [] } = useQuery({
    queryKey: ['presenze_rapportino', selectedRapportino?.id],
    queryFn: async () => {
      if (!selectedRapportino?.id) return [];
      const { data, error } = await supabase
        .from('presenze_rapportino')
        .select('*')
        .eq('rapportino_id', selectedRapportino.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRapportino?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const cantiere = cantieri.find(c => c.id === newRapportino.cantiere_id);
      const oreTotali = presenze.reduce((sum, p) => sum + p.ore_ordinarie + p.ore_straordinario, 0);

      const { data: rapportinoData, error: rapError } = await supabase
        .from('rapportini')
        .insert([{
          ...newRapportino,
          cantiere_nome: cantiere?.nome || null,
          ore_lavorate_totali: oreTotali,
        }])
        .select()
        .single();

      if (rapError) throw rapError;

      const presenzeToInsert = presenze
        .filter(p => p.lavoratore_nome)
        .map(p => ({
          rapportino_id: rapportinoData.id,
          lavoratore_nome: p.lavoratore_nome,
          ore_ordinarie: p.ore_ordinarie,
          ore_straordinario: p.ore_straordinario,
          mansione: p.mansione || null,
          note: p.note || null,
        }));

      if (presenzeToInsert.length > 0) {
        const { error: presError } = await supabase.from('presenze_rapportino').insert(presenzeToInsert);
        if (presError) throw presError;
      }

      return rapportinoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapportini'] });
      setShowNew(false);
      resetForm();
      toast.success('Rapportino creato');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const approvaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rapportini').update({
        approvato: true,
        approvato_da: 'Admin',
        data_approvazione: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapportini'] });
      toast.success('Rapportino approvato');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rapportini').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapportini'] });
      toast.success('Rapportino eliminato');
    },
  });

  const resetForm = () => {
    setNewRapportino({
      data: format(new Date(), 'yyyy-MM-dd'),
      cantiere_id: '',
      cantiere_nome: '',
      redatto_da: '',
      condizioni_meteo: 'sereno',
      temperatura_min: 0,
      temperatura_max: 0,
      lavorazioni_eseguite: '',
      materiali_utilizzati: '',
      attrezzature_utilizzate: '',
      problemi_riscontrati: '',
      note_sicurezza: '',
    });
    setPresenze([{ lavoratore_nome: '', ore_ordinarie: 8, ore_straordinario: 0, mansione: '', note: '' }]);
  };

  const addPresenza = () => {
    setPresenze([...presenze, { lavoratore_nome: '', ore_ordinarie: 8, ore_straordinario: 0, mansione: '', note: '' }]);
  };

  const updatePresenza = (index: number, field: keyof PresenzaRapportino, value: any) => {
    const updated = [...presenze];
    updated[index] = { ...updated[index], [field]: value };
    setPresenze(updated);
  };

  const removePresenza = (index: number) => {
    if (presenze.length > 1) setPresenze(presenze.filter((_, i) => i !== index));
  };

  const filteredRapportini = rapportini.filter(r => {
    if (filterCantiere !== 'all' && r.cantiere_id !== filterCantiere) return false;
    if (filterDate && r.data !== filterDate) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return r.cantiere_nome?.toLowerCase().includes(s) || r.redatto_da.toLowerCase().includes(s);
    }
    return true;
  });

  const stats = {
    totale: rapportini.length,
    approvati: rapportini.filter(r => r.approvato).length,
    daApprovare: rapportini.filter(r => !r.approvato).length,
    oreTotaliMese: rapportini.filter(r => r.data.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s, r) => s + r.ore_lavorate_totali, 0),
  };

  const handleExport = () => {
    exportToExcel(filteredRapportini, [
      { key: 'data', header: 'Data', width: 12 },
      { key: 'cantiere_nome', header: 'Cantiere', width: 25 },
      { key: 'redatto_da', header: 'Redatto da', width: 20 },
      { key: 'ore_lavorate_totali', header: 'Ore Totali', width: 12 },
      { key: 'condizioni_meteo', header: 'Meteo', width: 12 },
      { key: 'approvato', header: 'Approvato', width: 10 },
    ], 'rapportini');
  };

  const MeteoIcon = METEO.find(m => m.value === selectedRapportino?.condizioni_meteo)?.icon || Sun;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Rapportini Giornalieri
          </h1>
          <p className="text-muted-foreground">Gestione rapportini di cantiere</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Esporta</Button>
          <Button onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-2" />Nuovo Rapportino</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Totale</p><p className="text-2xl font-bold">{stats.totale}</p></div><ClipboardList className="w-8 h-8 text-primary/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Approvati</p><p className="text-2xl font-bold text-emerald-500">{stats.approvati}</p></div><CheckCircle className="w-8 h-8 text-emerald-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Da Approvare</p><p className="text-2xl font-bold text-amber-500">{stats.daApprovare}</p></div><Clock className="w-8 h-8 text-amber-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Ore Mese</p><p className="text-2xl font-bold text-blue-500">{stats.oreTotaliMese}</p></div><Users className="w-8 h-8 text-blue-500/20" /></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cerca cantiere, redattore..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-auto" />
            <Select value={filterCantiere} onValueChange={setFilterCantiere}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Cantiere" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i cantieri</SelectItem>
                {cantieri.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredRapportini.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun rapportino trovato</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cantiere</TableHead>
                  <TableHead>Redatto da</TableHead>
                  <TableHead>Meteo</TableHead>
                  <TableHead>Ore Totali</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRapportini.map((r) => {
                  const MeteoI = METEO.find(m => m.value === r.condizioni_meteo)?.icon || Sun;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{format(new Date(r.data), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-medium">{r.cantiere_nome || '-'}</TableCell>
                      <TableCell>{r.redatto_da}</TableCell>
                      <TableCell><MeteoI className="w-5 h-5 text-muted-foreground" /></TableCell>
                      <TableCell className="font-mono">{r.ore_lavorate_totali}h</TableCell>
                      <TableCell>
                        <Badge className={r.approvato ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}>
                          {r.approvato ? 'Approvato' : 'In Attesa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedRapportino(r); setShowView(true); }}><Eye className="w-4 h-4" /></Button>
                          {!r.approvato && <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => approvaMutation.mutate(r.id)}><CheckCircle className="w-4 h-4" /></Button>}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nuovo Rapportino */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuovo Rapportino Giornaliero</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data *</label>
                <Input type="date" value={newRapportino.data} onChange={(e) => setNewRapportino(p => ({ ...p, data: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cantiere *</label>
                <Select value={newRapportino.cantiere_id} onValueChange={(v) => setNewRapportino(p => ({ ...p, cantiere_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>{cantieri.filter(c => c.stato === 'attivo').map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Redatto da *</label>
                <Input placeholder="Nome compilatore" value={newRapportino.redatto_da} onChange={(e) => setNewRapportino(p => ({ ...p, redatto_da: e.target.value }))} />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Meteo</label>
                <Select value={newRapportino.condizioni_meteo} onValueChange={(v) => setNewRapportino(p => ({ ...p, condizioni_meteo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METEO.map(m => <SelectItem key={m.value} value={m.value}><div className="flex items-center gap-2"><m.icon className="w-4 h-4" />{m.label}</div></SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Temp. Min (°C)</label>
                <Input type="number" value={newRapportino.temperatura_min} onChange={(e) => setNewRapportino(p => ({ ...p, temperatura_min: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Temp. Max (°C)</label>
                <Input type="number" value={newRapportino.temperatura_max} onChange={(e) => setNewRapportino(p => ({ ...p, temperatura_max: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2"><Users className="w-5 h-5" />Presenze</h3>
                <Button variant="outline" size="sm" onClick={addPresenza}><Plus className="w-4 h-4 mr-2" />Aggiungi</Button>
              </div>
              <div className="space-y-3">
                {presenze.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <Select value={p.lavoratore_nome} onValueChange={(v) => updatePresenza(i, 'lavoratore_nome', v)}>
                        <SelectTrigger><SelectValue placeholder="Lavoratore" /></SelectTrigger>
                        <SelectContent>{lavoratori.map(l => <SelectItem key={l.id} value={`${l.nome} ${l.cognome}`}>{l.nome} {l.cognome}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><Input type="number" min="0" step="0.5" placeholder="Ore ord." value={p.ore_ordinarie} onChange={(e) => updatePresenza(i, 'ore_ordinarie', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-2"><Input type="number" min="0" step="0.5" placeholder="Ore str." value={p.ore_straordinario} onChange={(e) => updatePresenza(i, 'ore_straordinario', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-3"><Input placeholder="Mansione" value={p.mansione} onChange={(e) => updatePresenza(i, 'mansione', e.target.value)} /></div>
                    <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removePresenza(i)} disabled={presenze.length === 1}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-2 block flex items-center gap-2"><Wrench className="w-4 h-4" />Lavorazioni Eseguite</label><Textarea placeholder="Descrivi le lavorazioni..." value={newRapportino.lavorazioni_eseguite} onChange={(e) => setNewRapportino(p => ({ ...p, lavorazioni_eseguite: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block flex items-center gap-2"><Package className="w-4 h-4" />Materiali Utilizzati</label><Textarea placeholder="Elenco materiali..." value={newRapportino.materiali_utilizzati} onChange={(e) => setNewRapportino(p => ({ ...p, materiali_utilizzati: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Problemi Riscontrati</label><Textarea placeholder="Eventuali problemi..." value={newRapportino.problemi_riscontrati} onChange={(e) => setNewRapportino(p => ({ ...p, problemi_riscontrati: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block flex items-center gap-2"><Shield className="w-4 h-4" />Note Sicurezza</label><Textarea placeholder="Note sulla sicurezza..." value={newRapportino.note_sicurezza} onChange={(e) => setNewRapportino(p => ({ ...p, note_sicurezza: e.target.value }))} /></div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNew(false); resetForm(); }}>Annulla</Button>
              <Button className="flex-1" onClick={() => createMutation.mutate()} disabled={!newRapportino.cantiere_id || !newRapportino.redatto_da || createMutation.isPending}>
                {createMutation.isPending ? 'Creazione...' : 'Crea Rapportino'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza */}
      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Rapportino del {selectedRapportino && format(new Date(selectedRapportino.data), 'dd MMMM yyyy', { locale: it })}</DialogTitle></DialogHeader>
          {selectedRapportino && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-sm text-muted-foreground">Cantiere</p><p className="font-medium">{selectedRapportino.cantiere_nome}</p></div>
                <div><p className="text-sm text-muted-foreground">Redatto da</p><p className="font-medium">{selectedRapportino.redatto_da}</p></div>
                <div><p className="text-sm text-muted-foreground">Meteo</p><div className="flex items-center gap-2"><MeteoIcon className="w-5 h-5" />{selectedRapportino.condizioni_meteo}</div></div>
                <div><p className="text-sm text-muted-foreground">Ore Totali</p><p className="font-medium text-xl">{selectedRapportino.ore_lavorate_totali}h</p></div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Presenze</h4>
                <Table>
                  <TableHeader><TableRow><TableHead>Lavoratore</TableHead><TableHead>Ore Ord.</TableHead><TableHead>Ore Str.</TableHead><TableHead>Mansione</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {presenzeSelected.map((p: any) => (
                      <TableRow key={p.id}><TableCell>{p.lavoratore_nome}</TableCell><TableCell>{p.ore_ordinarie}h</TableCell><TableCell>{p.ore_straordinario}h</TableCell><TableCell>{p.mansione || '-'}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {selectedRapportino.lavorazioni_eseguite && <><Separator /><div><p className="text-sm text-muted-foreground">Lavorazioni Eseguite</p><p>{selectedRapportino.lavorazioni_eseguite}</p></div></>}
              {selectedRapportino.problemi_riscontrati && <><Separator /><div><p className="text-sm text-muted-foreground text-amber-500">Problemi Riscontrati</p><p>{selectedRapportino.problemi_riscontrati}</p></div></>}
              {selectedRapportino.note_sicurezza && <><Separator /><div><p className="text-sm text-muted-foreground text-red-500">Note Sicurezza</p><p>{selectedRapportino.note_sicurezza}</p></div></>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}