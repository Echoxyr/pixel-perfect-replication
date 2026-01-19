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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, GitBranch, History, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type StatoVariante = 'proposta' | 'in_valutazione' | 'approvata' | 'rifiutata' | 'implementata';

interface Variante {
  id: string;
  numero_variante: string;
  oggetto: string;
  descrizione: string | null;
  tipo_variante: string;
  tipo_riferimento: string;
  riferimento_id: string;
  riferimento_numero: string | null;
  importo_originale: number | null;
  importo_variante: number;
  importo_nuovo_totale: number | null;
  percentuale_variazione: number | null;
  motivazione: string;
  stato: string;
  richiesto_da: string | null;
  approvato_da: string | null;
  data_richiesta: string;
  data_approvazione: string | null;
  note_approvazione: string | null;
  versione: number | null;
  cantiere_id: string | null;
  created_at: string;
}

const STATO_COLORS: Record<string, string> = {
  proposta: 'bg-blue-500/15 text-blue-600',
  in_valutazione: 'bg-amber-500/15 text-amber-600',
  approvata: 'bg-emerald-500/15 text-emerald-600',
  rifiutata: 'bg-red-500/15 text-red-600',
  implementata: 'bg-purple-500/15 text-purple-600',
};

const STATO_LABELS: Record<string, string> = {
  proposta: 'Proposta',
  in_valutazione: 'In Valutazione',
  approvata: 'Approvata',
  rifiutata: 'Rifiutata',
  implementata: 'Implementata',
};

const TIPO_VARIANTE = ['modifica_quantità', 'modifica_prezzo', 'aggiunta_lavorazione', 'eliminazione_lavorazione', 'modifica_tempi', 'altro'];
const TIPO_RIFERIMENTO = ['ordine', 'subappalto', 'contratto'];

export default function VariantiManager() {
  const queryClient = useQueryClient();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedVariante, setSelectedVariante] = useState<Variante | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [filterStato, setFilterStato] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    tipo_variante: 'modifica_prezzo',
    tipo_riferimento: 'ordine',
    riferimento_id: '',
    oggetto: '',
    descrizione: '',
    importo_originale: 0,
    importo_variante: 0,
    motivazione: '',
    richiesto_da: '',
  });

  // Fetch varianti
  const { data: varianti = [], isLoading } = useQuery({
    queryKey: ['varianti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('varianti')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Variante[];
    },
  });

  // Create variante
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const numero_variante = `VAR-${new Date().getFullYear()}-${String(varianti.length + 1).padStart(4, '0')}`;
      const differenza = data.importo_variante - data.importo_originale;
      const percentuale = data.importo_originale > 0 
        ? ((differenza / data.importo_originale) * 100)
        : 0;
      
      const { error } = await supabase.from('varianti').insert({
        numero_variante,
        oggetto: data.oggetto,
        descrizione: data.descrizione || null,
        tipo_variante: data.tipo_variante,
        tipo_riferimento: data.tipo_riferimento,
        riferimento_id: data.riferimento_id || crypto.randomUUID(),
        importo_originale: data.importo_originale,
        importo_variante: data.importo_variante,
        importo_nuovo_totale: data.importo_variante,
        percentuale_variazione: percentuale,
        motivazione: data.motivazione,
        stato: 'proposta',
        richiesto_da: data.richiesto_da || null,
        data_richiesta: new Date().toISOString().split('T')[0],
        versione: 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varianti'] });
      toast.success('Variante creata con successo');
      setShowNewDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Update stato
  const updateStatoMutation = useMutation({
    mutationFn: async ({ id, stato, approvato_da }: { id: string; stato: string; approvato_da?: string }) => {
      const updateData: any = { stato };
      if (stato === 'approvata' || stato === 'rifiutata') {
        updateData.data_approvazione = new Date().toISOString().split('T')[0];
        if (approvato_da) updateData.approvato_da = approvato_da;
      }
      const { error } = await supabase.from('varianti').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varianti'] });
      toast.success('Stato aggiornato');
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      tipo_variante: 'modifica_prezzo',
      tipo_riferimento: 'ordine',
      riferimento_id: '',
      oggetto: '',
      descrizione: '',
      importo_originale: 0,
      importo_variante: 0,
      motivazione: '',
      richiesto_da: '',
    });
  };

  // Stats
  const stats = useMemo(() => {
    const proposte = varianti.filter(v => v.stato === 'proposta').length;
    const inValutazione = varianti.filter(v => v.stato === 'in_valutazione').length;
    const approvate = varianti.filter(v => v.stato === 'approvata' || v.stato === 'implementata').length;
    const totaleVariazioni = varianti
      .filter(v => v.stato === 'approvata' || v.stato === 'implementata')
      .reduce((sum, v) => sum + v.importo_variante - (v.importo_originale || 0), 0);
    return { proposte, inValutazione, approvate, totaleVariazioni };
  }, [varianti]);

  // Filtered varianti
  const filteredVarianti = useMemo(() => {
    if (filterStato === 'all') return varianti;
    return varianti.filter(v => v.stato === filterStato);
  }, [varianti, filterStato]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Proposte</p>
                <p className="text-xl font-bold">{stats.proposte}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <GitBranch className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">In Valutazione</p>
                <p className="text-xl font-bold">{stats.inValutazione}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Approvate</p>
                <p className="text-xl font-bold">{stats.approvate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <History className="w-5 h-5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Totale Variazioni</p>
                <p className={`text-lg font-bold ${stats.totaleVariazioni >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.totaleVariazioni >= 0 ? '+' : ''}{formatCurrency(stats.totaleVariazioni)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Select value={filterStato} onValueChange={setFilterStato}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            {Object.entries(STATO_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuova Variante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuova Variante / Change Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo Variante</Label>
                  <Select value={formData.tipo_variante} onValueChange={(v) => setFormData({ ...formData, tipo_variante: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_VARIANTE.map(t => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo Riferimento</Label>
                  <Select value={formData.tipo_riferimento} onValueChange={(v) => setFormData({ ...formData, tipo_riferimento: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_RIFERIMENTO.map(t => (
                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Oggetto *</Label>
                <Input
                  value={formData.oggetto}
                  onChange={(e) => setFormData({ ...formData, oggetto: e.target.value })}
                  placeholder="Oggetto della variante"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrizione</Label>
                <Textarea
                  value={formData.descrizione}
                  onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                  placeholder="Descrizione dettagliata della variante"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Importo Originale (€)</Label>
                  <Input
                    type="number"
                    value={formData.importo_originale}
                    onChange={(e) => setFormData({ ...formData, importo_originale: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nuovo Importo (€)</Label>
                  <Input
                    type="number"
                    value={formData.importo_variante}
                    onChange={(e) => setFormData({ ...formData, importo_variante: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Differenza:</strong>{' '}
                  <span className={formData.importo_variante - formData.importo_originale >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {formData.importo_variante - formData.importo_originale >= 0 ? '+' : ''}
                    {formatCurrency(formData.importo_variante - formData.importo_originale)}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Motivazione *</Label>
                <Textarea
                  value={formData.motivazione}
                  onChange={(e) => setFormData({ ...formData, motivazione: e.target.value })}
                  placeholder="Motivo tecnico/commerciale della variante"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Richiesto da</Label>
                <Input
                  value={formData.richiesto_da}
                  onChange={(e) => setFormData({ ...formData, richiesto_da: e.target.value })}
                  placeholder="Nome richiedente"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annulla</Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.oggetto || !formData.motivazione || createMutation.isPending}
              >
                Crea Variante
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Varianti Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Registro Varianti ({filteredVarianti.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredVarianti.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna variante registrata
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Oggetto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Originale</TableHead>
                    <TableHead className="text-right">Variante</TableHead>
                    <TableHead className="text-right">Differenza</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVarianti.map((v) => {
                    const diff = v.importo_variante - (v.importo_originale || 0);
                    return (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono text-xs">{v.numero_variante}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{v.oggetto}</TableCell>
                        <TableCell className="text-xs capitalize">{v.tipo_variante.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.importo_originale || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.importo_variante)}</TableCell>
                        <TableCell className={`text-right font-medium ${diff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATO_COLORS[v.stato] || 'bg-gray-500/15 text-gray-600'}>
                            {STATO_LABELS[v.stato] || v.stato}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(v.data_richiesta), 'dd/MM/yyyy', { locale: it })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedVariante(v);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {v.stato === 'proposta' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600"
                                onClick={() => updateStatoMutation.mutate({ id: v.id, stato: 'in_valutazione' })}
                              >
                                <Clock className="w-4 h-4" />
                              </Button>
                            )}
                            {v.stato === 'in_valutazione' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600"
                                  onClick={() => updateStatoMutation.mutate({ id: v.id, stato: 'approvata' })}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => updateStatoMutation.mutate({ id: v.id, stato: 'rifiutata' })}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {v.stato === 'approvata' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-purple-600"
                                onClick={() => updateStatoMutation.mutate({ id: v.id, stato: 'implementata' })}
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dettaglio Variante {selectedVariante?.numero_variante}</DialogTitle>
          </DialogHeader>
          {selectedVariante && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tipo Variante</p>
                  <p className="font-medium capitalize">{selectedVariante.tipo_variante.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stato</p>
                  <Badge className={STATO_COLORS[selectedVariante.stato] || 'bg-gray-500/15 text-gray-600'}>
                    {STATO_LABELS[selectedVariante.stato] || selectedVariante.stato}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Oggetto</p>
                <p className="font-medium">{selectedVariante.oggetto}</p>
              </div>
              
              {selectedVariante.descrizione && (
                <div>
                  <p className="text-xs text-muted-foreground">Descrizione</p>
                  <p className="text-sm">{selectedVariante.descrizione}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Originale</p>
                  <p className="font-medium">{formatCurrency(selectedVariante.importo_originale || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Variante</p>
                  <p className="font-medium">{formatCurrency(selectedVariante.importo_variante)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Differenza</p>
                  <p className={`font-bold ${selectedVariante.importo_variante - (selectedVariante.importo_originale || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedVariante.importo_variante - (selectedVariante.importo_originale || 0) >= 0 ? '+' : ''}
                    {formatCurrency(selectedVariante.importo_variante - (selectedVariante.importo_originale || 0))}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Motivazione</p>
                <p className="text-sm">{selectedVariante.motivazione}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Richiesto da</p>
                  <p className="text-sm">{selectedVariante.richiesto_da || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Approvato da</p>
                  <p className="text-sm">{selectedVariante.approvato_da || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Data Richiesta</p>
                  <p className="text-sm">{format(new Date(selectedVariante.data_richiesta), 'dd/MM/yyyy', { locale: it })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Approvazione</p>
                  <p className="text-sm">
                    {selectedVariante.data_approvazione 
                      ? format(new Date(selectedVariante.data_approvazione), 'dd/MM/yyyy', { locale: it })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
