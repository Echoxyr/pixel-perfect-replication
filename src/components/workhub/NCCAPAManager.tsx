import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, AlertTriangle, CheckCircle, XCircle, Clock, Eye, Wrench, Shield, Target } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface NonConformita {
  id: string;
  codice: string;
  tipo: string;
  oggetto: string;
  descrizione: string;
  gravita: string;
  stato: string;
  origine: string | null;
  impatto: string | null;
  fornitore_id: string | null;
  cantiere_id: string | null;
  subappalto_id: string | null;
  rilevato_da: string | null;
  data_rilevazione: string;
  causa_radice: string | null;
  trattamento_immediato: string | null;
  responsabile_trattamento: string | null;
  data_scadenza_trattamento: string | null;
  data_chiusura: string | null;
  chiuso_da: string | null;
  esito_verifica: string | null;
  efficacia_verificata: boolean | null;
  costo_stimato: number | null;
  note: string | null;
  created_at: string;
}

interface AzioneCorrettiva {
  id: string;
  codice: string;
  nc_id: string | null;
  tipo: string;
  oggetto: string;
  descrizione: string;
  azione_proposta: string;
  responsabile: string;
  data_apertura: string;
  data_scadenza: string;
  data_completamento: string | null;
  stato: string;
  analisi_causa: string | null;
  risultato_atteso: string | null;
  esito_verifica: string | null;
  data_verifica: string | null;
  verificato_da: string | null;
  efficace: boolean | null;
  costo_implementazione: number | null;
  priorita: string | null;
  note: string | null;
  created_at: string;
}

const STATO_NC_COLORS: Record<string, string> = {
  aperta: 'bg-red-500/15 text-red-600',
  in_analisi: 'bg-amber-500/15 text-amber-600',
  in_trattamento: 'bg-blue-500/15 text-blue-600',
  verificata: 'bg-purple-500/15 text-purple-600',
  chiusa: 'bg-emerald-500/15 text-emerald-600',
};

const STATO_NC_LABELS: Record<string, string> = {
  aperta: 'Aperta',
  in_analisi: 'In Analisi',
  in_trattamento: 'In Trattamento',
  verificata: 'Verificata',
  chiusa: 'Chiusa',
};

const GRAVITA_COLORS: Record<string, string> = {
  minore: 'bg-yellow-500/15 text-yellow-600',
  maggiore: 'bg-orange-500/15 text-orange-600',
  critica: 'bg-red-500/15 text-red-600',
};

const STATO_AZIONE_COLORS: Record<string, string> = {
  pianificata: 'bg-gray-500/15 text-gray-600',
  in_corso: 'bg-blue-500/15 text-blue-600',
  completata: 'bg-purple-500/15 text-purple-600',
  verificata: 'bg-amber-500/15 text-amber-600',
  chiusa: 'bg-emerald-500/15 text-emerald-600',
};

const STATO_AZIONE_LABELS: Record<string, string> = {
  pianificata: 'Pianificata',
  in_corso: 'In Corso',
  completata: 'Completata',
  verificata: 'Verificata',
  chiusa: 'Chiusa',
};

export default function NCCAPAManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('nc');
  const [showNewNCDialog, setShowNewNCDialog] = useState(false);
  const [showNewCAPADialog, setShowNewCAPADialog] = useState(false);
  const [selectedNC, setSelectedNC] = useState<NonConformita | null>(null);
  const [selectedCAPA, setSelectedCAPA] = useState<AzioneCorrettiva | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // NC Form
  const [ncForm, setNCForm] = useState({
    tipo: 'fornitore',
    oggetto: '',
    descrizione: '',
    gravita: 'minore',
    rilevato_da: '',
    trattamento_immediato: '',
    note: '',
  });

  // CAPA Form
  const [capaForm, setCAPAForm] = useState({
    nc_id: '',
    tipo: 'correttiva',
    oggetto: '',
    descrizione: '',
    azione_proposta: '',
    responsabile: '',
    data_scadenza: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    analisi_causa: '',
    risultato_atteso: '',
    note: '',
  });

  // Fetch NC
  const { data: ncList = [], isLoading: ncLoading } = useQuery({
    queryKey: ['non_conformita'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformita')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as NonConformita[];
    },
  });

  // Fetch CAPA
  const { data: capaList = [], isLoading: capaLoading } = useQuery({
    queryKey: ['capa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capa')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AzioneCorrettiva[];
    },
  });

  // Create NC
  const createNCMutation = useMutation({
    mutationFn: async (data: typeof ncForm) => {
      const codice = `NC-${new Date().getFullYear()}-${String(ncList.length + 1).padStart(4, '0')}`;
      const { error } = await supabase.from('non_conformita').insert({
        codice,
        tipo: data.tipo,
        oggetto: data.oggetto,
        descrizione: data.descrizione,
        gravita: data.gravita,
        stato: 'aperta',
        rilevato_da: data.rilevato_da || null,
        data_rilevazione: new Date().toISOString().split('T')[0],
        trattamento_immediato: data.trattamento_immediato || null,
        note: data.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non_conformita'] });
      toast.success('Non Conformità registrata');
      setShowNewNCDialog(false);
      setNCForm({
        tipo: 'fornitore',
        oggetto: '',
        descrizione: '',
        gravita: 'minore',
        rilevato_da: '',
        trattamento_immediato: '',
        note: '',
      });
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Create CAPA
  const createCAPAMutation = useMutation({
    mutationFn: async (data: typeof capaForm) => {
      const codice = `${data.tipo === 'correttiva' ? 'AC' : 'AP'}-${new Date().getFullYear()}-${String(capaList.length + 1).padStart(4, '0')}`;
      const { error } = await supabase.from('capa').insert({
        codice,
        nc_id: data.nc_id || null,
        tipo: data.tipo,
        oggetto: data.oggetto,
        descrizione: data.descrizione,
        azione_proposta: data.azione_proposta,
        responsabile: data.responsabile,
        data_apertura: new Date().toISOString().split('T')[0],
        data_scadenza: data.data_scadenza,
        stato: 'pianificata',
        analisi_causa: data.analisi_causa || null,
        risultato_atteso: data.risultato_atteso || null,
        note: data.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capa'] });
      toast.success('Azione CAPA creata');
      setShowNewCAPADialog(false);
      setCAPAForm({
        nc_id: '',
        tipo: 'correttiva',
        oggetto: '',
        descrizione: '',
        azione_proposta: '',
        responsabile: '',
        data_scadenza: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        analisi_causa: '',
        risultato_atteso: '',
        note: '',
      });
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Update NC stato
  const updateNCStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const updateData: any = { stato };
      if (stato === 'chiusa') {
        updateData.data_chiusura = new Date().toISOString().split('T')[0];
      }
      const { error } = await supabase.from('non_conformita').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non_conformita'] });
      toast.success('Stato NC aggiornato');
    },
  });

  // Update CAPA stato
  const updateCAPAStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const updateData: any = { stato };
      if (stato === 'completata') {
        updateData.data_completamento = new Date().toISOString().split('T')[0];
      }
      const { error } = await supabase.from('capa').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capa'] });
      toast.success('Stato CAPA aggiornato');
    },
  });

  // Stats
  const stats = useMemo(() => {
    const ncAperte = ncList.filter(nc => nc.stato !== 'chiusa').length;
    const ncCritiche = ncList.filter(nc => nc.gravita === 'critica' && nc.stato !== 'chiusa').length;
    const capaAperte = capaList.filter(c => c.stato !== 'chiusa').length;
    const capaScadute = capaList.filter(c => 
      c.stato !== 'chiusa' && new Date(c.data_scadenza) < new Date()
    ).length;
    return { ncAperte, ncCritiche, capaAperte, capaScadute };
  }, [ncList, capaList]);

  const formatCurrency = (amount: number | null) =>
    amount ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount) : '-';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">NC Aperte</p>
                <p className="text-xl font-bold">{stats.ncAperte}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <XCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">NC Critiche</p>
                <p className="text-xl font-bold text-orange-600">{stats.ncCritiche}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Wrench className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">CAPA Aperte</p>
                <p className="text-xl font-bold">{stats.capaAperte}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">CAPA Scadute</p>
                <p className={`text-xl font-bold ${stats.capaScadute > 0 ? 'text-red-600' : ''}`}>{stats.capaScadute}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="nc" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Non Conformità
            </TabsTrigger>
            <TabsTrigger value="capa" className="gap-2">
              <Wrench className="w-4 h-4" />
              CAPA
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Dialog open={showNewNCDialog} onOpenChange={setShowNewNCDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuova NC
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registra Non Conformità</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={ncForm.tipo} onValueChange={(v) => setNCForm({ ...ncForm, tipo: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fornitore">Fornitore</SelectItem>
                          <SelectItem value="materiale">Materiale</SelectItem>
                          <SelectItem value="lavorazione">Lavorazione</SelectItem>
                          <SelectItem value="processo">Processo</SelectItem>
                          <SelectItem value="altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Gravità *</Label>
                      <Select value={ncForm.gravita} onValueChange={(v) => setNCForm({ ...ncForm, gravita: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minore">Minore</SelectItem>
                          <SelectItem value="maggiore">Maggiore</SelectItem>
                          <SelectItem value="critica">Critica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Oggetto *</Label>
                    <Input
                      value={ncForm.oggetto}
                      onChange={(e) => setNCForm({ ...ncForm, oggetto: e.target.value })}
                      placeholder="Breve descrizione della NC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrizione Dettagliata *</Label>
                    <Textarea
                      value={ncForm.descrizione}
                      onChange={(e) => setNCForm({ ...ncForm, descrizione: e.target.value })}
                      placeholder="Descrizione completa della non conformità rilevata"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rilevato da</Label>
                    <Input
                      value={ncForm.rilevato_da}
                      onChange={(e) => setNCForm({ ...ncForm, rilevato_da: e.target.value })}
                      placeholder="Nome di chi ha rilevato la NC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Trattamento Immediato</Label>
                    <Textarea
                      value={ncForm.trattamento_immediato}
                      onChange={(e) => setNCForm({ ...ncForm, trattamento_immediato: e.target.value })}
                      placeholder="Azioni immediate intraprese per contenere la NC"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Note</Label>
                    <Textarea
                      value={ncForm.note}
                      onChange={(e) => setNCForm({ ...ncForm, note: e.target.value })}
                      placeholder="Note aggiuntive"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewNCDialog(false)}>Annulla</Button>
                  <Button
                    onClick={() => createNCMutation.mutate(ncForm)}
                    disabled={!ncForm.oggetto || !ncForm.descrizione || createNCMutation.isPending}
                  >
                    Registra NC
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showNewCAPADialog} onOpenChange={setShowNewCAPADialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuova CAPA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crea Azione Correttiva/Preventiva</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo Azione *</Label>
                      <Select value={capaForm.tipo} onValueChange={(v) => setCAPAForm({ ...capaForm, tipo: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="correttiva">Correttiva</SelectItem>
                          <SelectItem value="preventiva">Preventiva</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>NC Collegata</Label>
                      <Select value={capaForm.nc_id} onValueChange={(v) => setCAPAForm({ ...capaForm, nc_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nessuna" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nessuna</SelectItem>
                          {ncList.filter(nc => nc.stato !== 'chiusa').map(nc => (
                            <SelectItem key={nc.id} value={nc.id}>{nc.codice} - {nc.oggetto}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Oggetto *</Label>
                    <Input
                      value={capaForm.oggetto}
                      onChange={(e) => setCAPAForm({ ...capaForm, oggetto: e.target.value })}
                      placeholder="Oggetto dell'azione"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrizione *</Label>
                    <Textarea
                      value={capaForm.descrizione}
                      onChange={(e) => setCAPAForm({ ...capaForm, descrizione: e.target.value })}
                      placeholder="Descrizione del problema/situazione"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Azione Proposta *</Label>
                    <Textarea
                      value={capaForm.azione_proposta}
                      onChange={(e) => setCAPAForm({ ...capaForm, azione_proposta: e.target.value })}
                      placeholder="Descrizione dell'azione correttiva/preventiva proposta"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Responsabile *</Label>
                      <Input
                        value={capaForm.responsabile}
                        onChange={(e) => setCAPAForm({ ...capaForm, responsabile: e.target.value })}
                        placeholder="Nome responsabile"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Scadenza *</Label>
                      <Input
                        type="date"
                        value={capaForm.data_scadenza}
                        onChange={(e) => setCAPAForm({ ...capaForm, data_scadenza: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Analisi Causa Radice</Label>
                    <Textarea
                      value={capaForm.analisi_causa}
                      onChange={(e) => setCAPAForm({ ...capaForm, analisi_causa: e.target.value })}
                      placeholder="Analisi della causa radice del problema (5 Why, Ishikawa...)"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Risultato Atteso</Label>
                    <Textarea
                      value={capaForm.risultato_atteso}
                      onChange={(e) => setCAPAForm({ ...capaForm, risultato_atteso: e.target.value })}
                      placeholder="Risultato atteso dall'implementazione dell'azione"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Note</Label>
                    <Textarea
                      value={capaForm.note}
                      onChange={(e) => setCAPAForm({ ...capaForm, note: e.target.value })}
                      placeholder="Note aggiuntive"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewCAPADialog(false)}>Annulla</Button>
                  <Button
                    onClick={() => createCAPAMutation.mutate(capaForm)}
                    disabled={!capaForm.oggetto || !capaForm.descrizione || !capaForm.azione_proposta || !capaForm.responsabile || createCAPAMutation.isPending}
                  >
                    Crea CAPA
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* NC Tab */}
        <TabsContent value="nc" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Registro Non Conformità ({ncList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ncLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : ncList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna non conformità registrata
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Codice</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Oggetto</TableHead>
                        <TableHead>Gravità</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ncList.map((nc) => (
                        <TableRow key={nc.id}>
                          <TableCell className="font-mono text-xs">{nc.codice}</TableCell>
                          <TableCell className="capitalize">{nc.tipo}</TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{nc.oggetto}</TableCell>
                          <TableCell>
                            <Badge className={GRAVITA_COLORS[nc.gravita] || 'bg-gray-500/15 text-gray-600'}>
                              {nc.gravita}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATO_NC_COLORS[nc.stato] || 'bg-gray-500/15 text-gray-600'}>
                              {STATO_NC_LABELS[nc.stato] || nc.stato}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {format(new Date(nc.data_rilevazione), 'dd/MM/yyyy', { locale: it })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedNC(nc);
                                  setSelectedCAPA(null);
                                  setShowDetailDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {nc.stato === 'aperta' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600"
                                  onClick={() => updateNCStatoMutation.mutate({ id: nc.id, stato: 'in_analisi' })}
                                >
                                  <Target className="w-4 h-4" />
                                </Button>
                              )}
                              {nc.stato === 'in_analisi' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600"
                                  onClick={() => updateNCStatoMutation.mutate({ id: nc.id, stato: 'in_trattamento' })}
                                >
                                  <Wrench className="w-4 h-4" />
                                </Button>
                              )}
                              {nc.stato === 'in_trattamento' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-purple-600"
                                  onClick={() => updateNCStatoMutation.mutate({ id: nc.id, stato: 'verificata' })}
                                >
                                  <Shield className="w-4 h-4" />
                                </Button>
                              )}
                              {nc.stato === 'verificata' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600"
                                  onClick={() => updateNCStatoMutation.mutate({ id: nc.id, stato: 'chiusa' })}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
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

        {/* CAPA Tab */}
        <TabsContent value="capa" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Azioni Correttive e Preventive ({capaList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {capaLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : capaList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna azione CAPA registrata
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Codice</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Oggetto</TableHead>
                        <TableHead>Responsabile</TableHead>
                        <TableHead>Scadenza</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capaList.map((capa) => {
                        const isOverdue = new Date(capa.data_scadenza) < new Date() && capa.stato !== 'chiusa';
                        return (
                          <TableRow key={capa.id} className={isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                            <TableCell className="font-mono text-xs">{capa.codice}</TableCell>
                            <TableCell>
                              <Badge variant={capa.tipo === 'correttiva' ? 'default' : 'secondary'}>
                                {capa.tipo === 'correttiva' ? 'AC' : 'AP'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">{capa.oggetto}</TableCell>
                            <TableCell>{capa.responsabile}</TableCell>
                            <TableCell className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                              {format(new Date(capa.data_scadenza), 'dd/MM/yyyy', { locale: it })}
                            </TableCell>
                            <TableCell>
                              <Badge className={STATO_AZIONE_COLORS[capa.stato] || 'bg-gray-500/15 text-gray-600'}>
                                {STATO_AZIONE_LABELS[capa.stato] || capa.stato}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedCAPA(capa);
                                    setSelectedNC(null);
                                    setShowDetailDialog(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {capa.stato === 'pianificata' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600"
                                    onClick={() => updateCAPAStatoMutation.mutate({ id: capa.id, stato: 'in_corso' })}
                                  >
                                    <Wrench className="w-4 h-4" />
                                  </Button>
                                )}
                                {capa.stato === 'in_corso' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-purple-600"
                                    onClick={() => updateCAPAStatoMutation.mutate({ id: capa.id, stato: 'completata' })}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {capa.stato === 'completata' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600"
                                    onClick={() => updateCAPAStatoMutation.mutate({ id: capa.id, stato: 'verificata' })}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                )}
                                {capa.stato === 'verificata' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600"
                                    onClick={() => updateCAPAStatoMutation.mutate({ id: capa.id, stato: 'chiusa' })}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedNC ? `Dettaglio NC ${selectedNC.codice}` : selectedCAPA ? `Dettaglio CAPA ${selectedCAPA.codice}` : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedNC && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">{selectedNC.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gravità</p>
                  <Badge className={GRAVITA_COLORS[selectedNC.gravita] || 'bg-gray-500/15 text-gray-600'}>
                    {selectedNC.gravita}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Oggetto</p>
                <p className="font-medium">{selectedNC.oggetto}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Descrizione</p>
                <p className="text-sm">{selectedNC.descrizione}</p>
              </div>
              {selectedNC.trattamento_immediato && (
                <div>
                  <p className="text-xs text-muted-foreground">Trattamento Immediato</p>
                  <p className="text-sm">{selectedNC.trattamento_immediato}</p>
                </div>
              )}
              {selectedNC.causa_radice && (
                <div>
                  <p className="text-xs text-muted-foreground">Causa Radice</p>
                  <p className="text-sm">{selectedNC.causa_radice}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Rilevato da</p>
                  <p className="text-sm">{selectedNC.rilevato_da || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Rilevazione</p>
                  <p className="text-sm">{format(new Date(selectedNC.data_rilevazione), 'dd/MM/yyyy', { locale: it })}</p>
                </div>
              </div>
            </div>
          )}

          {selectedCAPA && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <Badge variant={selectedCAPA.tipo === 'correttiva' ? 'default' : 'secondary'}>
                    {selectedCAPA.tipo === 'correttiva' ? 'Azione Correttiva' : 'Azione Preventiva'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stato</p>
                  <Badge className={STATO_AZIONE_COLORS[selectedCAPA.stato] || 'bg-gray-500/15 text-gray-600'}>
                    {STATO_AZIONE_LABELS[selectedCAPA.stato] || selectedCAPA.stato}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Oggetto</p>
                <p className="font-medium">{selectedCAPA.oggetto}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Descrizione</p>
                <p className="text-sm">{selectedCAPA.descrizione}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Azione Proposta</p>
                <p className="text-sm">{selectedCAPA.azione_proposta}</p>
              </div>
              {selectedCAPA.analisi_causa && (
                <div>
                  <p className="text-xs text-muted-foreground">Analisi Causa</p>
                  <p className="text-sm">{selectedCAPA.analisi_causa}</p>
                </div>
              )}
              {selectedCAPA.risultato_atteso && (
                <div>
                  <p className="text-xs text-muted-foreground">Risultato Atteso</p>
                  <p className="text-sm">{selectedCAPA.risultato_atteso}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Responsabile</p>
                  <p className="text-sm">{selectedCAPA.responsabile}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Scadenza</p>
                  <p className="text-sm">{format(new Date(selectedCAPA.data_scadenza), 'dd/MM/yyyy', { locale: it })}</p>
                </div>
              </div>
              {selectedCAPA.esito_verifica && (
                <div>
                  <p className="text-xs text-muted-foreground">Esito Verifica</p>
                  <p className="text-sm">{selectedCAPA.esito_verifica}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
