import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { format } from 'date-fns';
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
  Download
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
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, formatters } from '@/utils/exportUtils';

interface Timbratura {
  id: string;
  lavoratore_nome: string;
  lavoratore_id: string | null;
  cantiere_id: string | null;
  cantiere_nome: string | null;
  tipo: 'entrata' | 'uscita';
  data: string;
  ora: string;
  note: string | null;
  posizione_gps: string | null;
  created_at: string;
}

export default function Timbrature() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cantieri, lavoratori } = useWorkHub();
  
  const [showNewTimbratura, setShowNewTimbratura] = useState(false);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterCantiere, setFilterCantiere] = useState<string>('all');
  const [filterLavoratore, setFilterLavoratore] = useState('');
  
  const [newTimbratura, setNewTimbratura] = useState({
    lavoratore_nome: '',
    cantiere_id: '',
    cantiere_nome: '',
    tipo: 'entrata' as 'entrata' | 'uscita',
    note: '',
  });

  // Fetch timbrature
  const { data: timbrature = [], isLoading } = useQuery({
    queryKey: ['timbrature', filterDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timbrature')
        .select('*')
        .eq('data', filterDate)
        .order('ora', { ascending: false });
      if (error) throw error;
      return data as Timbratura[];
    },
  });

  // Create timbratura
  const createMutation = useMutation({
    mutationFn: async (timbratura: Partial<Timbratura>) => {
      const { error } = await supabase.from('timbrature').insert([timbratura]);
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
        note: '',
      });
      toast({ title: 'Timbratura registrata' });
    },
    onError: (error: any) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
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
      note: newTimbratura.note || null,
      data: format(new Date(), 'yyyy-MM-dd'),
      ora: format(new Date(), 'HH:mm:ss'),
    });
  };

  const handleQuickTimbratura = (tipo: 'entrata' | 'uscita') => {
    // Placeholder per timbratura rapida - richiede selezione lavoratore
    setNewTimbratura(prev => ({ ...prev, tipo }));
    setShowNewTimbratura(true);
  };

  // Filtri applicati
  const filteredTimbrature = timbrature.filter(t => {
    if (filterCantiere !== 'all' && t.cantiere_id !== filterCantiere) return false;
    if (filterLavoratore && !t.lavoratore_nome.toLowerCase().includes(filterLavoratore.toLowerCase())) return false;
    return true;
  });

  // Statistiche giornaliere
  const stats = {
    totaleEntrate: timbrature.filter(t => t.tipo === 'entrata').length,
    totaleUscite: timbrature.filter(t => t.tipo === 'uscita').length,
    lavoratoriPresenti: new Set(
      timbrature
        .filter(t => t.tipo === 'entrata')
        .map(t => t.lavoratore_nome)
    ).size,
  };

  const handleExport = () => {
    exportToExcel(filteredTimbrature, [
      { key: 'lavoratore_nome', header: 'Lavoratore', width: 25 },
      { key: 'cantiere_nome', header: 'Cantiere', width: 20 },
      { key: 'tipo', header: 'Tipo', width: 10, format: formatters.capitalize },
      { key: 'data', header: 'Data', width: 12, format: formatters.date },
      { key: 'ora', header: 'Ora', width: 10 },
      { key: 'note', header: 'Note', width: 30 },
    ], 'timbrature');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Timbrature
          </h1>
          <p className="text-muted-foreground">Gestione presenze e orari lavoratori</p>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registra Timbratura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
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
                          {l.nome} {l.cognome}
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
                      <SelectValue placeholder="Seleziona cantiere (opzionale)" />
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
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newTimbratura.tipo === 'entrata' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setNewTimbratura(prev => ({ ...prev, tipo: 'entrata' }))}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrata
                    </Button>
                    <Button
                      type="button"
                      variant={newTimbratura.tipo === 'uscita' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setNewTimbratura(prev => ({ ...prev, tipo: 'uscita' }))}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Uscita
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Note</label>
                  <Input
                    placeholder="Note opzionali..."
                    value={newTimbratura.note}
                    onChange={(e) => setNewTimbratura(prev => ({ ...prev, note: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewTimbratura(false)}>
                    Annulla
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Registrazione...' : 'Registra'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entrate Oggi</p>
                <p className="text-3xl font-bold text-emerald-500">{stats.totaleEntrate}</p>
              </div>
              <LogIn className="w-10 h-10 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uscite Oggi</p>
                <p className="text-3xl font-bold text-amber-500">{stats.totaleUscite}</p>
              </div>
              <LogOut className="w-10 h-10 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lavoratori Presenti</p>
                <p className="text-3xl font-bold text-primary">{stats.lavoratoriPresenti}</p>
              </div>
              <User className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-modern">
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
            </div>
            <Select value={filterCantiere} onValueChange={setFilterCantiere}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tutti i cantieri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i cantieri</SelectItem>
                {cantieri.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.codiceCommessa}</SelectItem>
                ))}
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

      {/* Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-lg">
            Timbrature del {format(new Date(filterDate), 'dd MMMM yyyy', { locale: it })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredTimbrature.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna timbratura registrata
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ora</TableHead>
                  <TableHead>Lavoratore</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantiere</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimbrature.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono font-medium">{t.ora.slice(0, 5)}</TableCell>
                    <TableCell className="font-medium">{t.lavoratore_nome}</TableCell>
                    <TableCell>
                      <Badge variant={t.tipo === 'entrata' ? 'default' : 'secondary'}>
                        {t.tipo === 'entrata' ? (
                          <><LogIn className="w-3 h-3 mr-1" /> Entrata</>
                        ) : (
                          <><LogOut className="w-3 h-3 mr-1" /> Uscita</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.cantiere_nome || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{t.note || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
