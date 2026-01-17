import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Calendar,
  User,
  Construction,
  Plus,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  Coffee,
  Moon,
  Sun,
  Smartphone,
  CreditCard,
  QrCode,
  Edit,
  Trash2,
  Eye,
  FileText,
  TrendingUp
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
  DialogTrigger,
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
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, formatters } from '@/utils/exportUtils';

interface Timbratura {
  id: string;
  lavoratore_nome: string;
  lavoratore_id: string | null;
  cantiere_id: string | null;
  cantiere_nome: string | null;
  tipo: string;
  data: string;
  ora: string;
  ora_fine: string | null;
  ore_lavorate: number | null;
  ore_straordinario: number | null;
  pausa_minuti: number | null;
  metodo: string;
  stato_validazione: string;
  validata_da: string | null;
  data_validazione: string | null;
  non_conformita_tipo: string | null;
  non_conformita_motivo: string | null;
  turno: string;
  attivita: string | null;
  note: string | null;
  posizione_gps: string | null;
  created_at: string;
}

const METODI_TIMBRATURA = [
  { value: 'manuale', label: 'Manuale', icon: Edit },
  { value: 'gps', label: 'GPS', icon: MapPin },
  { value: 'qr', label: 'QR Code', icon: QrCode },
  { value: 'badge', label: 'Badge', icon: CreditCard },
];

const TURNI = [
  { value: 'ordinario', label: 'Ordinario', icon: Sun },
  { value: 'notturno', label: 'Notturno', icon: Moon },
  { value: 'festivo', label: 'Festivo', icon: Calendar },
  { value: 'reperibilita', label: 'Reperibilità', icon: Smartphone },
];

const NON_CONFORMITA = [
  { value: 'ritardo', label: 'Ritardo' },
  { value: 'uscita_anticipata', label: 'Uscita Anticipata' },
  { value: 'assenza_ingiustificata', label: 'Assenza Ingiustificata' },
  { value: 'straordinario_non_autorizzato', label: 'Straordinario Non Autorizzato' },
];

export default function Timbrature() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cantieri, lavoratori } = useWorkHub();
  
  const [showNewTimbratura, setShowNewTimbratura] = useState(false);
  const [showValidazione, setShowValidazione] = useState(false);
  const [selectedTimbratura, setSelectedTimbratura] = useState<Timbratura | null>(null);
  const [activeTab, setActiveTab] = useState('giornaliere');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterDateEnd, setFilterDateEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterCantiere, setFilterCantiere] = useState<string>('all');
  const [filterLavoratore, setFilterLavoratore] = useState('');
  const [filterStato, setFilterStato] = useState<string>('all');
  
  const [newTimbratura, setNewTimbratura] = useState({
    lavoratore_nome: '',
    cantiere_id: '',
    cantiere_nome: '',
    tipo: 'entrata' as string,
    data: format(new Date(), 'yyyy-MM-dd'),
    ora: format(new Date(), 'HH:mm'),
    ora_fine: '',
    pausa_minuti: 0,
    metodo: 'manuale',
    turno: 'ordinario',
    attivita: '',
    note: '',
    non_conformita_tipo: '',
    non_conformita_motivo: '',
  });

  // Fetch timbrature
  const { data: timbrature = [], isLoading } = useQuery({
    queryKey: ['timbrature', filterDate, filterDateEnd, activeTab],
    queryFn: async () => {
      let query = supabase.from('timbrature').select('*');
      
      if (activeTab === 'giornaliere') {
        query = query.eq('data', filterDate);
      } else {
        query = query.gte('data', filterDate).lte('data', filterDateEnd);
      }
      
      const { data, error } = await query.order('data', { ascending: false }).order('ora', { ascending: false });
      if (error) throw error;
      return data as Timbratura[];
    },
  });

  // Create timbratura
  const createMutation = useMutation({
    mutationFn: async (timbratura: any) => {
      // Calcola ore lavorate se abbiamo entrata e uscita
      let oreLavorate = null;
      let oreStraordinario = 0;
      
      if (timbratura.ora && timbratura.ora_fine) {
        const [hIn, mIn] = timbratura.ora.split(':').map(Number);
        const [hOut, mOut] = timbratura.ora_fine.split(':').map(Number);
        const minTotali = (hOut * 60 + mOut) - (hIn * 60 + mIn) - (timbratura.pausa_minuti || 0);
        oreLavorate = Math.max(0, minTotali / 60);
        
        // Calcola straordinari (oltre 8 ore)
        if (oreLavorate > 8) {
          oreStraordinario = oreLavorate - 8;
          oreLavorate = 8;
        }
      }
      
      const { error } = await supabase.from('timbrature').insert([{
        ...timbratura,
        ore_lavorate: oreLavorate,
        ore_straordinario: oreStraordinario,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
      setShowNewTimbratura(false);
      setNewTimbratura({
        lavoratore_nome: '',
        cantiere_id: '',
        cantiere_nome: '',
        tipo: 'entrata',
        data: format(new Date(), 'yyyy-MM-dd'),
        ora: format(new Date(), 'HH:mm'),
        ora_fine: '',
        pausa_minuti: 0,
        metodo: 'manuale',
        turno: 'ordinario',
        attivita: '',
        note: '',
        non_conformita_tipo: '',
        non_conformita_motivo: '',
      });
      toast({ title: 'Timbratura registrata con successo' });
    },
    onError: (error: any) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  // Valida timbratura
  const validaMutation = useMutation({
    mutationFn: async ({ id, stato, motivo }: { id: string; stato: string; motivo?: string }) => {
      const { error } = await supabase.from('timbrature').update({
        stato_validazione: stato,
        validata_da: 'Admin', // In futuro prenderemo dall'auth
        data_validazione: new Date().toISOString(),
        non_conformita_motivo: motivo || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
      setShowValidazione(false);
      setSelectedTimbratura(null);
      toast({ title: 'Timbratura validata' });
    },
  });

  // Delete timbratura
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timbrature').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
      toast({ title: 'Timbratura eliminata' });
    },
  });

  const handleSubmit = () => {
    if (!newTimbratura.lavoratore_nome) {
      toast({ title: 'Inserisci il nome del lavoratore', variant: 'destructive' });
      return;
    }

    const cantiere = cantieri.find(c => c.id === newTimbratura.cantiere_id);
    
    createMutation.mutate({
      lavoratore_nome: newTimbratura.lavoratore_nome,
      cantiere_id: newTimbratura.cantiere_id || null,
      cantiere_nome: cantiere?.nome || null,
      tipo: newTimbratura.tipo,
      data: newTimbratura.data,
      ora: newTimbratura.ora + ':00',
      ora_fine: newTimbratura.ora_fine ? newTimbratura.ora_fine + ':00' : null,
      pausa_minuti: newTimbratura.pausa_minuti,
      metodo: newTimbratura.metodo,
      turno: newTimbratura.turno,
      attivita: newTimbratura.attivita || null,
      note: newTimbratura.note || null,
      non_conformita_tipo: newTimbratura.non_conformita_tipo || null,
      non_conformita_motivo: newTimbratura.non_conformita_motivo || null,
    });
  };

  // Filtri applicati
  const filteredTimbrature = timbrature.filter(t => {
    if (filterCantiere !== 'all' && t.cantiere_id !== filterCantiere) return false;
    if (filterStato !== 'all' && t.stato_validazione !== filterStato) return false;
    if (filterLavoratore && !t.lavoratore_nome.toLowerCase().includes(filterLavoratore.toLowerCase())) return false;
    return true;
  });

  // Statistiche
  const stats = {
    totaleEntrate: timbrature.filter(t => t.tipo === 'entrata').length,
    totaleUscite: timbrature.filter(t => t.tipo === 'uscita').length,
    lavoratoriPresenti: new Set(timbrature.filter(t => t.tipo === 'entrata').map(t => t.lavoratore_nome)).size,
    oreTotali: timbrature.reduce((sum, t) => sum + (t.ore_lavorate || 0), 0),
    oreStraordinario: timbrature.reduce((sum, t) => sum + (t.ore_straordinario || 0), 0),
    daValidare: timbrature.filter(t => t.stato_validazione === 'da_validare').length,
    nonConformita: timbrature.filter(t => t.non_conformita_tipo).length,
  };

  const handleExport = () => {
    exportToExcel(filteredTimbrature, [
      { key: 'data', header: 'Data', width: 12, format: formatters.date },
      { key: 'lavoratore_nome', header: 'Lavoratore', width: 25 },
      { key: 'cantiere_nome', header: 'Cantiere', width: 20 },
      { key: 'tipo', header: 'Tipo', width: 10, format: formatters.capitalize },
      { key: 'ora', header: 'Entrata', width: 10 },
      { key: 'ora_fine', header: 'Uscita', width: 10 },
      { key: 'ore_lavorate', header: 'Ore Lav.', width: 10 },
      { key: 'ore_straordinario', header: 'Ore Str.', width: 10 },
      { key: 'pausa_minuti', header: 'Pausa (min)', width: 12 },
      { key: 'turno', header: 'Turno', width: 12, format: formatters.capitalize },
      { key: 'metodo', header: 'Metodo', width: 12, format: formatters.capitalize },
      { key: 'stato_validazione', header: 'Stato', width: 12, format: formatters.capitalize },
      { key: 'non_conformita_tipo', header: 'Non Conformità', width: 20 },
      { key: 'attivita', header: 'Attività', width: 30 },
      { key: 'note', header: 'Note', width: 30 },
    ], 'timbrature');
  };

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'validata': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'rifiutata': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'validata': return 'bg-emerald-500/15 text-emerald-500';
      case 'rifiutata': return 'bg-red-500/15 text-red-500';
      default: return 'bg-amber-500/15 text-amber-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Gestione Presenze
          </h1>
          <p className="text-muted-foreground">Timbrature, ore lavorate, straordinari e validazioni</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
          <Dialog open={showNewTimbratura} onOpenChange={setShowNewTimbratura}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuova Timbratura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registra Timbratura Completa</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Lavoratore *</label>
                  <Select 
                    value={newTimbratura.lavoratore_nome}
                    onValueChange={(v) => setNewTimbratura(prev => ({ ...prev, lavoratore_nome: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona lavoratore" />
                    </SelectTrigger>
                    <SelectContent>
                      {lavoratori.map(l => (
                        <SelectItem key={l.id} value={`${l.nome} ${l.cognome}`}>
                          {l.nome} {l.cognome} - {l.mansione}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Cantiere</label>
                  <Select 
                    value={newTimbratura.cantiere_id}
                    onValueChange={(v) => setNewTimbratura(prev => ({ ...prev, cantiere_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona cantiere" />
                    </SelectTrigger>
                    <SelectContent>
                      {cantieri.filter(c => c.stato === 'attivo').map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.codiceCommessa} - {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Data</label>
                  <Input
                    type="date"
                    value={newTimbratura.data}
                    onChange={(e) => setNewTimbratura(prev => ({ ...prev, data: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ora Entrata</label>
                  <Input
                    type="time"
                    value={newTimbratura.ora}
                    onChange={(e) => setNewTimbratura(prev => ({ ...prev, ora: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ora Uscita</label>
                  <Input
                    type="time"
                    value={newTimbratura.ora_fine}
                    onChange={(e) => setNewTimbratura(prev => ({ ...prev, ora_fine: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pausa (minuti)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newTimbratura.pausa_minuti}
                    onChange={(e) => setNewTimbratura(prev => ({ ...prev, pausa_minuti: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Turno</label>
                  <Select 
                    value={newTimbratura.turno}
                    onValueChange={(v) => setNewTimbratura(prev => ({ ...prev, turno: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TURNI.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className="w-4 h-4" />
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Metodo Timbratura</label>
                  <Select 
                    value={newTimbratura.metodo}
                    onValueChange={(v) => setNewTimbratura(prev => ({ ...prev, metodo: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METODI_TIMBRATURA.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          <div className="flex items-center gap-2">
                            <m.icon className="w-4 h-4" />
                            {m.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Non Conformità</label>
                  <Select 
                    value={newTimbratura.non_conformita_tipo}
                    onValueChange={(v) => setNewTimbratura(prev => ({ ...prev, non_conformita_tipo: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nessuna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nessuna">Nessuna</SelectItem>
                      {NON_CONFORMITA.map(nc => (
                        <SelectItem key={nc.value} value={nc.value}>
                          {nc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newTimbratura.non_conformita_tipo && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Motivo Non Conformità</label>
                    <Textarea
                      placeholder="Descrivi il motivo della non conformità..."
                      value={newTimbratura.non_conformita_motivo}
                      onChange={(e) => setNewTimbratura(prev => ({ ...prev, non_conformita_motivo: e.target.value }))}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Attività Svolta</label>
                  <Textarea
                    placeholder="Descrivi l'attività svolta..."
                    value={newTimbratura.attivita}
                    onChange={(e) => setNewTimbratura(prev => ({ ...prev, attivita: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Note</label>
                  <Input
                    placeholder="Note opzionali..."
                    value={newTimbratura.note}
                    onChange={(e) => setNewTimbratura(prev => ({ ...prev, note: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewTimbratura(false)}>
                    Annulla
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Registrazione...' : 'Registra Timbratura'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Entrate</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.totaleEntrate}</p>
              </div>
              <LogIn className="w-8 h-8 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Uscite</p>
                <p className="text-2xl font-bold text-amber-500">{stats.totaleUscite}</p>
              </div>
              <LogOut className="w-8 h-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Presenti</p>
                <p className="text-2xl font-bold text-primary">{stats.lavoratoriPresenti}</p>
              </div>
              <User className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ore Totali</p>
                <p className="text-2xl font-bold text-blue-500">{stats.oreTotali.toFixed(1)}</p>
              </div>
              <Timer className="w-8 h-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Straordinari</p>
                <p className="text-2xl font-bold text-purple-500">{stats.oreStraordinario.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Da Validare</p>
                <p className="text-2xl font-bold text-amber-500">{stats.daValidare}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Non Conf.</p>
                <p className="text-2xl font-bold text-red-500">{stats.nonConformita}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="giornaliere">Vista Giornaliera</TabsTrigger>
          <TabsTrigger value="periodiche">Vista Periodo</TabsTrigger>
          <TabsTrigger value="validazione">Da Validare ({stats.daValidare})</TabsTrigger>
          <TabsTrigger value="nonconformita">Non Conformità ({stats.nonConformita})</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="card-modern mt-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-auto"
                />
                {activeTab === 'periodiche' && (
                  <>
                    <span className="text-muted-foreground">a</span>
                    <Input
                      type="date"
                      value={filterDateEnd}
                      onChange={(e) => setFilterDateEnd(e.target.value)}
                      className="w-auto"
                    />
                  </>
                )}
              </div>
              <Select value={filterCantiere} onValueChange={setFilterCantiere}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tutte le commesse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le commesse</SelectItem>
                  {cantieri.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.codiceCommessa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStato} onValueChange={setFilterStato}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="da_validare">Da Validare</SelectItem>
                  <SelectItem value="validata">Validata</SelectItem>
                  <SelectItem value="rifiutata">Rifiutata</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Cerca lavoratore..."
                value={filterLavoratore}
                onChange={(e) => setFilterLavoratore(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table for all tabs */}
        <TabsContent value={activeTab} className="mt-4">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-lg">
                {activeTab === 'giornaliere' && `Timbrature del ${format(new Date(filterDate), 'dd MMMM yyyy', { locale: it })}`}
                {activeTab === 'periodiche' && `Timbrature dal ${format(new Date(filterDate), 'dd/MM/yyyy')} al ${format(new Date(filterDateEnd), 'dd/MM/yyyy')}`}
                {activeTab === 'validazione' && 'Timbrature da Validare'}
                {activeTab === 'nonconformita' && 'Non Conformità'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : filteredTimbrature.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna timbratura trovata
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Lavoratore</TableHead>
                        <TableHead>Cantiere</TableHead>
                        <TableHead>Entrata</TableHead>
                        <TableHead>Uscita</TableHead>
                        <TableHead>Ore</TableHead>
                        <TableHead>Str.</TableHead>
                        <TableHead>Turno</TableHead>
                        <TableHead>Metodo</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>NC</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimbrature
                        .filter(t => {
                          if (activeTab === 'validazione') return t.stato_validazione === 'da_validare';
                          if (activeTab === 'nonconformita') return t.non_conformita_tipo;
                          return true;
                        })
                        .map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono text-sm">{format(new Date(t.data), 'dd/MM/yy')}</TableCell>
                          <TableCell className="font-medium">{t.lavoratore_nome}</TableCell>
                          <TableCell className="text-sm">{t.cantiere_nome || '-'}</TableCell>
                          <TableCell className="font-mono">{t.ora?.slice(0, 5)}</TableCell>
                          <TableCell className="font-mono">{t.ora_fine?.slice(0, 5) || '-'}</TableCell>
                          <TableCell className="font-mono">{t.ore_lavorate?.toFixed(1) || '-'}</TableCell>
                          <TableCell className="font-mono text-purple-500">{t.ore_straordinario ? t.ore_straordinario.toFixed(1) : '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {TURNI.find(x => x.value === t.turno)?.label || t.turno}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {METODI_TIMBRATURA.find(x => x.value === t.metodo)?.label || t.metodo}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatoBadge(t.stato_validazione)}>
                              {t.stato_validazione === 'da_validare' ? 'Da Validare' : 
                               t.stato_validazione === 'validata' ? 'Validata' : 'Rifiutata'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {t.non_conformita_tipo && (
                              <Badge className="bg-red-500/15 text-red-500 text-xs">
                                {NON_CONFORMITA.find(x => x.value === t.non_conformita_tipo)?.label || t.non_conformita_tipo}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {t.stato_validazione === 'da_validare' && (
                                <>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-emerald-500"
                                    onClick={() => validaMutation.mutate({ id: t.id, stato: 'validata' })}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-500"
                                    onClick={() => {
                                      setSelectedTimbratura(t);
                                      setShowValidazione(true);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => deleteMutation.mutate(t.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Rifiuto Validazione */}
      <Dialog open={showValidazione} onOpenChange={setShowValidazione}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rifiuta Timbratura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Stai rifiutando la timbratura di <strong>{selectedTimbratura?.lavoratore_nome}</strong> del {selectedTimbratura?.data}
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Motivo del rifiuto</label>
              <Textarea
                id="motivo-rifiuto"
                placeholder="Inserisci il motivo del rifiuto..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowValidazione(false)}>
                Annulla
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => {
                  const motivo = (document.getElementById('motivo-rifiuto') as HTMLTextAreaElement)?.value;
                  if (selectedTimbratura) {
                    validaMutation.mutate({ id: selectedTimbratura.id, stato: 'rifiutata', motivo });
                  }
                }}
              >
                Rifiuta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}