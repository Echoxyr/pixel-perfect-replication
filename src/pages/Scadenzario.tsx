import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  CalendarClock,
  Plus,
  Trash2,
  Edit,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  GraduationCap,
  Wrench,
  Stethoscope,
  FileSignature,
  Shield,
  Download,
  Filter,
  Search,
  User,
  Building,
  Car,
  HardHat
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

interface Scadenza {
  id: string;
  tipo: string;
  titolo: string;
  descrizione: string | null;
  data_scadenza: string;
  entita_tipo: string | null;
  entita_id: string | null;
  entita_nome: string | null;
  giorni_preavviso: number;
  stato: string;
  priorita: string;
  responsabile: string | null;
  note: string | null;
  created_at: string;
}

const TIPI_SCADENZA = [
  { value: 'documento', label: 'Documento', icon: FileText },
  { value: 'formazione', label: 'Formazione', icon: GraduationCap },
  { value: 'manutenzione', label: 'Manutenzione', icon: Wrench },
  { value: 'visita_medica', label: 'Visita Medica', icon: Stethoscope },
  { value: 'contratto', label: 'Contratto', icon: FileSignature },
  { value: 'assicurazione', label: 'Assicurazione', icon: Shield },
  { value: 'altro', label: 'Altro', icon: CalendarClock },
];

const ENTITA_TIPI = [
  { value: 'lavoratore', label: 'Lavoratore', icon: User },
  { value: 'cantiere', label: 'Cantiere', icon: Building },
  { value: 'attrezzatura', label: 'Attrezzatura', icon: Wrench },
  { value: 'veicolo', label: 'Veicolo', icon: Car },
  { value: 'azienda', label: 'Azienda', icon: HardHat },
];

const PRIORITA = [
  { value: 'bassa', label: 'Bassa', color: 'bg-slate-500/15 text-slate-500' },
  { value: 'media', label: 'Media', color: 'bg-blue-500/15 text-blue-500' },
  { value: 'alta', label: 'Alta', color: 'bg-amber-500/15 text-amber-500' },
  { value: 'critica', label: 'Critica', color: 'bg-red-500/15 text-red-500' },
];

export default function Scadenzario() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('tutte');

  const [newScadenza, setNewScadenza] = useState({
    tipo: 'documento',
    titolo: '',
    descrizione: '',
    data_scadenza: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    entita_tipo: '',
    entita_nome: '',
    giorni_preavviso: 30,
    priorita: 'media',
    responsabile: '',
    note: '',
  });

  const { data: scadenze = [], isLoading } = useQuery({
    queryKey: ['scadenzario'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scadenzario')
        .select('*')
        .order('data_scadenza', { ascending: true });
      if (error) throw error;
      return data as Scadenza[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newScadenza) => {
      const { error } = await supabase.from('scadenzario').insert([{
        ...data,
        entita_tipo: data.entita_tipo || null,
        entita_nome: data.entita_nome || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scadenzario'] });
      setShowNew(false);
      resetForm();
      toast.success('Scadenza creata');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const { error } = await supabase.from('scadenzario').update({ stato }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scadenzario'] });
      toast.success('Stato aggiornato');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scadenzario').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scadenzario'] });
      toast.success('Scadenza eliminata');
    },
  });

  const resetForm = () => {
    setNewScadenza({
      tipo: 'documento',
      titolo: '',
      descrizione: '',
      data_scadenza: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      entita_tipo: '',
      entita_nome: '',
      giorni_preavviso: 30,
      priorita: 'media',
      responsabile: '',
      note: '',
    });
  };

  const getGiorniRimanenti = (dataScadenza: string) => {
    return differenceInDays(new Date(dataScadenza), new Date());
  };

  const getStatoAutomatico = (scadenza: Scadenza) => {
    if (scadenza.stato === 'completata' || scadenza.stato === 'archiviata') return scadenza.stato;
    const giorni = getGiorniRimanenti(scadenza.data_scadenza);
    if (giorni < 0) return 'scaduta';
    if (giorni <= scadenza.giorni_preavviso) return 'in_scadenza';
    return 'attiva';
  };

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'completata': return 'bg-emerald-500/15 text-emerald-500';
      case 'attiva': return 'bg-blue-500/15 text-blue-500';
      case 'in_scadenza': return 'bg-amber-500/15 text-amber-500';
      case 'scaduta': return 'bg-red-500/15 text-red-500';
      case 'archiviata': return 'bg-slate-500/15 text-slate-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredScadenze = scadenze.filter(s => {
    const statoCalcolato = getStatoAutomatico(s);
    if (filterTipo !== 'all' && s.tipo !== filterTipo) return false;
    if (filterStato !== 'all' && statoCalcolato !== filterStato) return false;
    if (activeTab === 'in_scadenza' && statoCalcolato !== 'in_scadenza' && statoCalcolato !== 'scaduta') return false;
    if (activeTab === 'completate' && statoCalcolato !== 'completata') return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return s.titolo.toLowerCase().includes(search) ||
        s.entita_nome?.toLowerCase().includes(search) ||
        s.responsabile?.toLowerCase().includes(search);
    }
    return true;
  });

  const stats = {
    totale: scadenze.length,
    attive: scadenze.filter(s => getStatoAutomatico(s) === 'attiva').length,
    inScadenza: scadenze.filter(s => getStatoAutomatico(s) === 'in_scadenza').length,
    scadute: scadenze.filter(s => getStatoAutomatico(s) === 'scaduta').length,
    completate: scadenze.filter(s => getStatoAutomatico(s) === 'completata').length,
  };

  const handleExport = () => {
    exportToExcel(filteredScadenze.map(s => ({ ...s, stato_calcolato: getStatoAutomatico(s) })), [
      { key: 'titolo', header: 'Titolo', width: 30 },
      { key: 'tipo', header: 'Tipo', width: 15 },
      { key: 'data_scadenza', header: 'Scadenza', width: 12 },
      { key: 'entita_nome', header: 'Riferimento', width: 20 },
      { key: 'priorita', header: 'Priorità', width: 10 },
      { key: 'responsabile', header: 'Responsabile', width: 20 },
      { key: 'stato_calcolato', header: 'Stato', width: 12 },
    ], 'scadenzario');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-primary" />
            Scadenzario
          </h1>
          <p className="text-muted-foreground">Gestione scadenze documenti, formazione, manutenzioni</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
          <Button onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuova Scadenza
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Totale</p><p className="text-2xl font-bold">{stats.totale}</p></div><CalendarClock className="w-8 h-8 text-primary/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Attive</p><p className="text-2xl font-bold text-blue-500">{stats.attive}</p></div><Clock className="w-8 h-8 text-blue-500/20" /></div></CardContent></Card>
        <Card className="border-amber-500/50"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">In Scadenza</p><p className="text-2xl font-bold text-amber-500">{stats.inScadenza}</p></div><AlertTriangle className="w-8 h-8 text-amber-500/20" /></div></CardContent></Card>
        <Card className="border-red-500/50"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Scadute</p><p className="text-2xl font-bold text-red-500">{stats.scadute}</p></div><XCircle className="w-8 h-8 text-red-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Completate</p><p className="text-2xl font-bold text-emerald-500">{stats.completate}</p></div><CheckCircle className="w-8 h-8 text-emerald-500/20" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tutte">Tutte</TabsTrigger>
          <TabsTrigger value="in_scadenza" className="text-amber-500">In Scadenza ({stats.inScadenza + stats.scadute})</TabsTrigger>
          <TabsTrigger value="completate">Completate</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Cerca..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  {TIPI_SCADENZA.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
            ) : filteredScadenze.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna scadenza trovata</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Riferimento</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Giorni</TableHead>
                    <TableHead>Priorità</TableHead>
                    <TableHead>Responsabile</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScadenze.map((s) => {
                    const statoCalc = getStatoAutomatico(s);
                    const giorni = getGiorniRimanenti(s.data_scadenza);
                    const TipoIcon = TIPI_SCADENZA.find(t => t.value === s.tipo)?.icon || CalendarClock;
                    return (
                      <TableRow key={s.id} className={statoCalc === 'scaduta' ? 'bg-red-500/5' : statoCalc === 'in_scadenza' ? 'bg-amber-500/5' : ''}>
                        <TableCell><TipoIcon className="w-5 h-5 text-muted-foreground" /></TableCell>
                        <TableCell className="font-medium">{s.titolo}</TableCell>
                        <TableCell>{s.entita_nome || '-'}</TableCell>
                        <TableCell>{format(new Date(s.data_scadenza), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <span className={giorni < 0 ? 'text-red-500 font-bold' : giorni <= 7 ? 'text-amber-500 font-bold' : ''}>
                            {giorni < 0 ? `${Math.abs(giorni)}g scaduta` : `${giorni}g`}
                          </span>
                        </TableCell>
                        <TableCell><Badge className={PRIORITA.find(p => p.value === s.priorita)?.color}>{s.priorita}</Badge></TableCell>
                        <TableCell>{s.responsabile || '-'}</TableCell>
                        <TableCell><Badge className={getStatoBadge(statoCalc)}>{statoCalc === 'in_scadenza' ? 'In Scadenza' : statoCalc}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {statoCalc !== 'completata' && (
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => updateStatoMutation.mutate({ id: s.id, stato: 'completata' })}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(s.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
      </Tabs>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nuova Scadenza</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Titolo *</label>
              <Input placeholder="es. Rinnovo patente muletto" value={newScadenza.titolo} onChange={(e) => setNewScadenza(prev => ({ ...prev, titolo: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={newScadenza.tipo} onValueChange={(v) => setNewScadenza(prev => ({ ...prev, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPI_SCADENZA.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Scadenza *</label>
              <Input type="date" value={newScadenza.data_scadenza} onChange={(e) => setNewScadenza(prev => ({ ...prev, data_scadenza: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Riferito a (tipo)</label>
              <Select value={newScadenza.entita_tipo} onValueChange={(v) => setNewScadenza(prev => ({ ...prev, entita_tipo: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                <SelectContent>{ENTITA_TIPI.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nome riferimento</label>
              <Input placeholder="es. Mario Rossi, Gru #3..." value={newScadenza.entita_nome} onChange={(e) => setNewScadenza(prev => ({ ...prev, entita_nome: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Giorni Preavviso</label>
              <Input type="number" min="1" value={newScadenza.giorni_preavviso} onChange={(e) => setNewScadenza(prev => ({ ...prev, giorni_preavviso: parseInt(e.target.value) || 30 }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priorità</label>
              <Select value={newScadenza.priorita} onValueChange={(v) => setNewScadenza(prev => ({ ...prev, priorita: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITA.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Responsabile</label>
              <Input placeholder="Chi deve gestire..." value={newScadenza.responsabile} onChange={(e) => setNewScadenza(prev => ({ ...prev, responsabile: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Descrizione</label>
              <Textarea placeholder="Dettagli..." value={newScadenza.descrizione} onChange={(e) => setNewScadenza(prev => ({ ...prev, descrizione: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNew(false); resetForm(); }}>Annulla</Button>
              <Button className="flex-1" onClick={() => createMutation.mutate(newScadenza)} disabled={!newScadenza.titolo || createMutation.isPending}>
                {createMutation.isPending ? 'Creazione...' : 'Crea Scadenza'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}