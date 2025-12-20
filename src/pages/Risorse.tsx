import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { format, addDays, isWithinInterval, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Truck,
  Wrench,
  HardHat,
  Plus,
  Calendar,
  Check,
  X,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Risorsa {
  id: string;
  nome: string;
  tipo: 'mezzo' | 'attrezzatura' | 'macchinario';
  descrizione: string | null;
  stato: 'disponibile' | 'in_uso' | 'manutenzione' | 'guasto';
  targa: string | null;
  matricola: string | null;
  created_at: string;
}

interface Prenotazione {
  id: string;
  risorsa_id: string;
  cantiere_id: string | null;
  cantiere_nome: string | null;
  data_inizio: string;
  data_fine: string;
  note: string | null;
  stato: 'richiesta' | 'confermata' | 'annullata';
  created_at: string;
}

export default function Risorse() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cantieri } = useWorkHub();
  
  const [showNewRisorsa, setShowNewRisorsa] = useState(false);
  const [showNewPrenotazione, setShowNewPrenotazione] = useState(false);
  const [selectedRisorsa, setSelectedRisorsa] = useState<Risorsa | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  
  const [newRisorsa, setNewRisorsa] = useState({
    nome: '',
    tipo: 'mezzo' as Risorsa['tipo'],
    descrizione: '',
    targa: '',
    matricola: '',
  });

  const [newPrenotazione, setNewPrenotazione] = useState({
    risorsa_id: '',
    cantiere_id: '',
    data_inizio: format(new Date(), 'yyyy-MM-dd'),
    data_fine: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    note: '',
  });

  // Fetch risorse
  const { data: risorse = [], isLoading: loadingRisorse } = useQuery({
    queryKey: ['risorse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risorse')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Risorsa[];
    },
  });

  // Fetch prenotazioni
  const { data: prenotazioni = [], isLoading: loadingPrenotazioni } = useQuery({
    queryKey: ['prenotazioni_risorse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prenotazioni_risorse')
        .select('*')
        .neq('stato', 'annullata')
        .order('data_inizio');
      if (error) throw error;
      return data as Prenotazione[];
    },
  });

  // Create risorsa
  const createRisorsaMutation = useMutation({
    mutationFn: async (risorsa: Partial<Risorsa>) => {
      const { error } = await supabase.from('risorse').insert([risorsa]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risorse'] });
      setShowNewRisorsa(false);
      setNewRisorsa({ nome: '', tipo: 'mezzo', descrizione: '', targa: '', matricola: '' });
      toast({ title: 'Risorsa creata' });
    },
  });

  // Create prenotazione
  const createPrenotazioneMutation = useMutation({
    mutationFn: async (prenotazione: Partial<Prenotazione>) => {
      const { error } = await supabase.from('prenotazioni_risorse').insert([prenotazione]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prenotazioni_risorse'] });
      setShowNewPrenotazione(false);
      setNewPrenotazione({
        risorsa_id: '',
        cantiere_id: '',
        data_inizio: format(new Date(), 'yyyy-MM-dd'),
        data_fine: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        note: '',
      });
      toast({ title: 'Prenotazione creata' });
    },
  });

  // Genera giorni della settimana
  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = addDays(today, weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  };

  const weekDays = getWeekDays();

  // Controlla se una risorsa è prenotata in un giorno
  const isBooked = (risorsaId: string, date: Date) => {
    return prenotazioni.find(p => 
      p.risorsa_id === risorsaId &&
      isWithinInterval(date, {
        start: parseISO(p.data_inizio),
        end: parseISO(p.data_fine)
      })
    );
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'mezzo': return <Truck className="w-5 h-5" />;
      case 'attrezzatura': return <Wrench className="w-5 h-5" />;
      case 'macchinario': return <HardHat className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'disponibile': return <Badge className="bg-emerald-500/15 text-emerald-500 border-0">Disponibile</Badge>;
      case 'in_uso': return <Badge className="bg-primary/15 text-primary border-0">In uso</Badge>;
      case 'manutenzione': return <Badge className="bg-amber-500/15 text-amber-500 border-0">Manutenzione</Badge>;
      case 'guasto': return <Badge className="bg-red-500/15 text-red-500 border-0">Guasto</Badge>;
      default: return <Badge variant="secondary">{stato}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Gestione Risorse
          </h1>
          <p className="text-muted-foreground">Mezzi, attrezzature e prenotazioni</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewRisorsa} onOpenChange={setShowNewRisorsa}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nuova Risorsa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuova Risorsa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome *</label>
                  <Input
                    placeholder="es. Escavatore CAT 320"
                    value={newRisorsa.nome}
                    onChange={(e) => setNewRisorsa(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo *</label>
                  <Select 
                    value={newRisorsa.tipo}
                    onValueChange={(v: Risorsa['tipo']) => setNewRisorsa(prev => ({ ...prev, tipo: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mezzo">Mezzo</SelectItem>
                      <SelectItem value="attrezzatura">Attrezzatura</SelectItem>
                      <SelectItem value="macchinario">Macchinario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Targa</label>
                    <Input
                      placeholder="AA000BB"
                      value={newRisorsa.targa}
                      onChange={(e) => setNewRisorsa(prev => ({ ...prev, targa: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Matricola</label>
                    <Input
                      placeholder="123456"
                      value={newRisorsa.matricola}
                      onChange={(e) => setNewRisorsa(prev => ({ ...prev, matricola: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrizione</label>
                  <Textarea
                    placeholder="Note aggiuntive..."
                    value={newRisorsa.descrizione}
                    onChange={(e) => setNewRisorsa(prev => ({ ...prev, descrizione: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewRisorsa(false)}>
                    Annulla
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => createRisorsaMutation.mutate({
                      nome: newRisorsa.nome,
                      tipo: newRisorsa.tipo,
                      descrizione: newRisorsa.descrizione || null,
                      targa: newRisorsa.targa || null,
                      matricola: newRisorsa.matricola || null,
                      stato: 'disponibile',
                    })}
                    disabled={!newRisorsa.nome || createRisorsaMutation.isPending}
                  >
                    Crea
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewPrenotazione} onOpenChange={setShowNewPrenotazione}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Prenota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuova Prenotazione</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Risorsa *</label>
                  <Select 
                    value={newPrenotazione.risorsa_id}
                    onValueChange={(v) => setNewPrenotazione(prev => ({ ...prev, risorsa_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona risorsa" />
                    </SelectTrigger>
                    <SelectContent>
                      {risorse.filter(r => r.stato === 'disponibile').map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nome} {r.targa && `(${r.targa})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cantiere</label>
                  <Select 
                    value={newPrenotazione.cantiere_id}
                    onValueChange={(v) => setNewPrenotazione(prev => ({ ...prev, cantiere_id: v }))}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Inizio *</label>
                    <Input
                      type="date"
                      value={newPrenotazione.data_inizio}
                      onChange={(e) => setNewPrenotazione(prev => ({ ...prev, data_inizio: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Fine *</label>
                    <Input
                      type="date"
                      value={newPrenotazione.data_fine}
                      onChange={(e) => setNewPrenotazione(prev => ({ ...prev, data_fine: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Note</label>
                  <Textarea
                    placeholder="Note aggiuntive..."
                    value={newPrenotazione.note}
                    onChange={(e) => setNewPrenotazione(prev => ({ ...prev, note: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewPrenotazione(false)}>
                    Annulla
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      const cantiere = cantieri.find(c => c.id === newPrenotazione.cantiere_id);
                      createPrenotazioneMutation.mutate({
                        risorsa_id: newPrenotazione.risorsa_id,
                        cantiere_id: newPrenotazione.cantiere_id || null,
                        cantiere_nome: cantiere?.nome || null,
                        data_inizio: newPrenotazione.data_inizio,
                        data_fine: newPrenotazione.data_fine,
                        note: newPrenotazione.note || null,
                        stato: 'confermata',
                      });
                    }}
                    disabled={!newPrenotazione.risorsa_id || createPrenotazioneMutation.isPending}
                  >
                    Prenota
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{risorse.length}</p>
                <p className="text-xs text-muted-foreground">Totale Risorse</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{risorse.filter(r => r.stato === 'disponibile').length}</p>
                <p className="text-xs text-muted-foreground">Disponibili</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Settings className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{risorse.filter(r => r.stato === 'manutenzione').length}</p>
                <p className="text-xs text-muted-foreground">In Manutenzione</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{risorse.filter(r => r.stato === 'guasto').length}</p>
                <p className="text-xs text-muted-foreground">Guasti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="card-modern">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Calendario Prenotazioni</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                Oggi
              </Button>
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground min-w-[200px]">
                    Risorsa
                  </th>
                  {weekDays.map((day) => (
                    <th 
                      key={day.toISOString()} 
                      className={cn(
                        "text-center p-3 text-sm font-medium min-w-[100px]",
                        format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 'bg-primary/10 rounded-t-lg'
                      )}
                    >
                      <div>{format(day, 'EEE', { locale: it })}</div>
                      <div className="text-lg font-bold">{format(day, 'd')}</div>
                      <div className="text-xs text-muted-foreground">{format(day, 'MMM', { locale: it })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {risorse.map((risorsa) => (
                  <tr key={risorsa.id} className="border-t border-border/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          risorsa.tipo === 'mezzo' ? 'bg-primary/10 text-primary' :
                          risorsa.tipo === 'attrezzatura' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        )}>
                          {getIcon(risorsa.tipo)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{risorsa.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {risorsa.targa || risorsa.matricola || risorsa.tipo}
                          </p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const booking = isBooked(risorsa.id, day);
                      return (
                        <td 
                          key={day.toISOString()} 
                          className={cn(
                            "p-2 text-center",
                            format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 'bg-primary/5'
                          )}
                        >
                          {booking ? (
                            <div 
                              className="p-2 rounded-lg bg-primary/20 text-primary text-xs font-medium cursor-pointer hover:bg-primary/30 transition-colors"
                              title={booking.cantiere_nome || 'Prenotato'}
                            >
                              {booking.cantiere_nome?.slice(0, 8) || 'Occupato'}
                            </div>
                          ) : risorsa.stato !== 'disponibile' ? (
                            <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground text-xs">
                              {risorsa.stato === 'manutenzione' ? 'Manut.' : 'N/D'}
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs">
                              Libero
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lista Risorse */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-lg">Elenco Risorse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risorse.map((risorsa) => (
              <div 
                key={risorsa.id}
                className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      risorsa.tipo === 'mezzo' ? 'bg-primary/10 text-primary' :
                      risorsa.tipo === 'attrezzatura' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {getIcon(risorsa.tipo)}
                    </div>
                    <div>
                      <p className="font-medium">{risorsa.nome}</p>
                      <p className="text-xs text-muted-foreground capitalize">{risorsa.tipo}</p>
                    </div>
                  </div>
                  {getStatoBadge(risorsa.stato)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {risorsa.targa && <p>Targa: {risorsa.targa}</p>}
                  {risorsa.matricola && <p>Matricola: {risorsa.matricola}</p>}
                  {risorsa.descrizione && <p className="truncate">{risorsa.descrizione}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
