import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Truck,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Printer,
  Search,
  Package,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Link2
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { PostCreationActions, EntityType } from '@/components/workhub/PostCreationActions';
import { EntityLinks } from '@/components/workhub/EntityLinks';

interface DDT {
  id: string;
  numero: string;
  data: string;
  tipo: string;
  mittente: string;
  destinatario: string;
  indirizzo_destinazione: string | null;
  causale_trasporto: string;
  aspetto_beni: string | null;
  peso_kg: number | null;
  colli: number | null;
  vettore: string | null;
  note: string | null;
  stato: string;
  commessa_id: string | null;
  created_at: string;
}

interface RigaDDT {
  id?: string;
  ddt_id?: string;
  codice: string;
  descrizione: string;
  quantita: number;
  unita_misura: string;
  ordine: number;
}

const CAUSALI_TRASPORTO = [
  'Vendita',
  'Conto Lavorazione',
  'Conto Visione',
  'Reso',
  'Omaggio',
  'Riparazione',
  'Trasferimento',
  'Altro'
];

const UNITA_MISURA = ['pz', 'kg', 'mt', 'mq', 'mc', 'lt', 'conf', 'pallet'];

export default function DDTManager() {
  const queryClient = useQueryClient();
  const [showNewDDT, setShowNewDDT] = useState(false);
  const [showViewDDT, setShowViewDDT] = useState(false);
  const [selectedDDT, setSelectedDDT] = useState<DDT | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  
  // Post-creation dialog
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [createdDDT, setCreatedDDT] = useState<{ id: string; numero: string } | null>(null);

  const [newDDT, setNewDDT] = useState({
    numero: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'uscita',
    mittente: '',
    destinatario: '',
    indirizzo_destinazione: '',
    causale_trasporto: 'Vendita',
    aspetto_beni: '',
    peso_kg: 0,
    colli: 1,
    vettore: '',
    note: '',
    commessa_id: '',
  });

  const [righe, setRighe] = useState<RigaDDT[]>([
    { codice: '', descrizione: '', quantita: 1, unita_misura: 'pz', ordine: 0 }
  ]);

  // Fetch Cantieri for linking
  const { data: cantieri = [] } = useQuery({
    queryKey: ['cantieri_for_ddt'],
    queryFn: async () => {
      const { data } = await supabase.from('cantieri').select('id, nome, codice_commessa').order('nome');
      return data || [];
    },
  });

  // Fetch DDT
  const { data: ddtList = [], isLoading } = useQuery({
    queryKey: ['ddt'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ddt')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as DDT[];
    },
  });

  // Fetch righe DDT per il DDT selezionato
  const { data: righeSelected = [] } = useQuery({
    queryKey: ['righe_ddt', selectedDDT?.id],
    queryFn: async () => {
      if (!selectedDDT?.id) return [];
      const { data, error } = await supabase
        .from('righe_ddt')
        .select('*')
        .eq('ddt_id', selectedDDT.id)
        .order('ordine');
      if (error) throw error;
      return data as RigaDDT[];
    },
    enabled: !!selectedDDT?.id,
  });

  // Generate DDT number
  const generateNumero = () => {
    const year = new Date().getFullYear();
    const count = ddtList.filter(d => d.numero.includes(year.toString())).length + 1;
    return `DDT-${year}-${String(count).padStart(4, '0')}`;
  };

  // Create DDT
  const createMutation = useMutation({
    mutationFn: async () => {
      const numero = newDDT.numero || generateNumero();
      
      // Insert DDT
      const { data: ddtData, error: ddtError } = await supabase
        .from('ddt')
        .insert([{
          ...newDDT,
          numero,
          peso_kg: newDDT.peso_kg || null,
        }])
        .select()
        .single();
      
      if (ddtError) throw ddtError;

      // Insert righe
      const righeToInsert = righe
        .filter(r => r.descrizione.trim())
        .map((r, idx) => ({
          ddt_id: ddtData.id,
          codice: r.codice || null,
          descrizione: r.descrizione,
          quantita: r.quantita,
          unita_misura: r.unita_misura,
          ordine: idx,
        }));

      if (righeToInsert.length > 0) {
        const { error: righeError } = await supabase
          .from('righe_ddt')
          .insert(righeToInsert);
        if (righeError) throw righeError;
      }

      return ddtData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ddt'] });
      setShowNewDDT(false);
      resetForm();
      toast.success('DDT creato con successo');
      // Trigger post-creation
      setCreatedDDT({ id: data.id, numero: data.numero });
      setShowPostCreation(true);
    },
    onError: (error: any) => {
      toast.error('Errore nella creazione: ' + error.message);
    },
  });

  // Update DDT status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const { error } = await supabase
        .from('ddt')
        .update({ stato })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddt'] });
      toast.success('Stato aggiornato');
    },
  });

  // Delete DDT
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ddt').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddt'] });
      toast.success('DDT eliminato');
    },
  });

  const resetForm = () => {
    setNewDDT({
      numero: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'uscita',
      mittente: '',
      destinatario: '',
      indirizzo_destinazione: '',
      causale_trasporto: 'Vendita',
      aspetto_beni: '',
      peso_kg: 0,
      colli: 1,
      vettore: '',
      note: '',
      commessa_id: '',
    });
    setRighe([{ codice: '', descrizione: '', quantita: 1, unita_misura: 'pz', ordine: 0 }]);
  };

  const addRiga = () => {
    setRighe([...righe, { codice: '', descrizione: '', quantita: 1, unita_misura: 'pz', ordine: righe.length }]);
  };

  const removeRiga = (index: number) => {
    if (righe.length > 1) {
      setRighe(righe.filter((_, i) => i !== index));
    }
  };

  const updateRiga = (index: number, field: keyof RigaDDT, value: any) => {
    const updated = [...righe];
    updated[index] = { ...updated[index], [field]: value };
    setRighe(updated);
  };

  // Filtri
  const filteredDDT = ddtList.filter(d => {
    if (filterStato !== 'all' && d.stato !== filterStato) return false;
    if (filterTipo !== 'all' && d.tipo !== filterTipo) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return d.numero.toLowerCase().includes(search) ||
        d.destinatario.toLowerCase().includes(search) ||
        d.mittente.toLowerCase().includes(search);
    }
    return true;
  });

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'consegnato': return 'bg-emerald-500/15 text-emerald-500';
      case 'emesso': return 'bg-primary/15 text-primary';
      case 'annullato': return 'bg-red-500/15 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleExport = () => {
    exportToExcel(filteredDDT, [
      { key: 'numero', header: 'Numero', width: 20 },
      { key: 'data', header: 'Data', width: 12 },
      { key: 'tipo', header: 'Tipo', width: 10 },
      { key: 'mittente', header: 'Mittente', width: 25 },
      { key: 'destinatario', header: 'Destinatario', width: 25 },
      { key: 'causale_trasporto', header: 'Causale', width: 15 },
      { key: 'colli', header: 'Colli', width: 8 },
      { key: 'peso_kg', header: 'Peso (kg)', width: 10 },
      { key: 'stato', header: 'Stato', width: 12 },
    ], 'ddt');
  };

  // Stats
  const stats = {
    totale: ddtList.length,
    emessi: ddtList.filter(d => d.stato === 'emesso').length,
    consegnati: ddtList.filter(d => d.stato === 'consegnato').length,
    uscita: ddtList.filter(d => d.tipo === 'uscita').length,
    entrata: ddtList.filter(d => d.tipo === 'entrata').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Totale DDT</p>
                <p className="text-2xl font-bold">{stats.totale}</p>
              </div>
              <FileText className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Emessi</p>
                <p className="text-2xl font-bold text-blue-500">{stats.emessi}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Consegnati</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.consegnati}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Uscita</p>
                <p className="text-2xl font-bold text-amber-500">{stats.uscita}</p>
              </div>
              <Truck className="w-8 h-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Entrata</p>
                <p className="text-2xl font-bold text-purple-500">{stats.entrata}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Documenti di Trasporto</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Esporta
            </Button>
            <Button onClick={() => setShowNewDDT(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo DDT
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per numero, mittente, destinatario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="uscita">Uscita</SelectItem>
                <SelectItem value="entrata">Entrata</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStato} onValueChange={setFilterStato}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="bozza">Bozza</SelectItem>
                <SelectItem value="emesso">Emesso</SelectItem>
                <SelectItem value="consegnato">Consegnato</SelectItem>
                <SelectItem value="annullato">Annullato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredDDT.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nessun DDT trovato</p>
              <p className="text-sm">Crea il tuo primo documento di trasporto</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mittente</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Causale</TableHead>
                  <TableHead>Colli</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDDT.map((ddt) => (
                  <TableRow key={ddt.id}>
                    <TableCell className="font-mono font-medium">{ddt.numero}</TableCell>
                    <TableCell>{format(new Date(ddt.data), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ddt.tipo === 'uscita' ? 'Uscita' : 'Entrata'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{ddt.mittente}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{ddt.destinatario}</TableCell>
                    <TableCell>{ddt.causale_trasporto}</TableCell>
                    <TableCell className="text-center">{ddt.colli || 1}</TableCell>
                    <TableCell>
                      <Badge className={getStatoBadge(ddt.stato)}>
                        {ddt.stato === 'emesso' ? 'Emesso' : 
                         ddt.stato === 'consegnato' ? 'Consegnato' :
                         ddt.stato === 'annullato' ? 'Annullato' : 'Bozza'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedDDT(ddt);
                            setShowViewDDT(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {ddt.stato === 'emesso' && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-emerald-500"
                            onClick={() => updateStatusMutation.mutate({ id: ddt.id, stato: 'consegnato' })}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => deleteMutation.mutate(ddt.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nuovo DDT */}
      <Dialog open={showNewDDT} onOpenChange={setShowNewDDT}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo Documento di Trasporto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Intestazione */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Numero DDT</label>
                <Input
                  placeholder={generateNumero()}
                  value={newDDT.numero}
                  onChange={(e) => setNewDDT(prev => ({ ...prev, numero: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Lascia vuoto per generazione automatica</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data</label>
                <Input
                  type="date"
                  value={newDDT.data}
                  onChange={(e) => setNewDDT(prev => ({ ...prev, data: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select 
                  value={newDDT.tipo}
                  onValueChange={(v) => setNewDDT(prev => ({ ...prev, tipo: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uscita">Uscita (vendita/spedizione)</SelectItem>
                    <SelectItem value="entrata">Entrata (acquisto/ricezione)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Commessa Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Commessa (opzionale)</Label>
              <Select 
                value={newDDT.commessa_id}
                onValueChange={(v) => setNewDDT(prev => ({ ...prev, commessa_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Collega a commessa..." />
                </SelectTrigger>
                <SelectContent>
                  {cantieri.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.codice_commessa} - {c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Mittente e Destinatario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">Mittente</h3>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ragione Sociale / Nome *</label>
                  <Input
                    placeholder="Nome azienda o persona"
                    value={newDDT.mittente}
                    onChange={(e) => setNewDDT(prev => ({ ...prev, mittente: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Destinatario</h3>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ragione Sociale / Nome *</label>
                  <Input
                    placeholder="Nome azienda o persona"
                    value={newDDT.destinatario}
                    onChange={(e) => setNewDDT(prev => ({ ...prev, destinatario: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Indirizzo Destinazione</label>
                  <Input
                    placeholder="Via, numero civico, città..."
                    value={newDDT.indirizzo_destinazione}
                    onChange={(e) => setNewDDT(prev => ({ ...prev, indirizzo_destinazione: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dettagli Trasporto */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Causale Trasporto</label>
                <Select 
                  value={newDDT.causale_trasporto}
                  onValueChange={(v) => setNewDDT(prev => ({ ...prev, causale_trasporto: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAUSALI_TRASPORTO.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Aspetto Beni</label>
                <Input
                  placeholder="es. Scatole, Bancali..."
                  value={newDDT.aspetto_beni}
                  onChange={(e) => setNewDDT(prev => ({ ...prev, aspetto_beni: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">N. Colli</label>
                <Input
                  type="number"
                  min="1"
                  value={newDDT.colli}
                  onChange={(e) => setNewDDT(prev => ({ ...prev, colli: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Peso (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={newDDT.peso_kg}
                  onChange={(e) => setNewDDT(prev => ({ ...prev, peso_kg: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Vettore</label>
              <Input
                placeholder="Nome del vettore/corriere (opzionale)"
                value={newDDT.vettore}
                onChange={(e) => setNewDDT(prev => ({ ...prev, vettore: e.target.value }))}
              />
            </div>

            <Separator />

            {/* Righe DDT */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Articoli / Merce</h3>
                <Button variant="outline" size="sm" onClick={addRiga}>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Riga
                </Button>
              </div>
              
              <div className="space-y-3">
                {righe.map((riga, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-2">
                      <Input
                        placeholder="Codice"
                        value={riga.codice}
                        onChange={(e) => updateRiga(index, 'codice', e.target.value)}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder="Descrizione articolo *"
                        value={riga.descrizione}
                        onChange={(e) => updateRiga(index, 'descrizione', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Qtà"
                        value={riga.quantita}
                        onChange={(e) => updateRiga(index, 'quantita', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={riga.unita_misura}
                        onValueChange={(v) => updateRiga(index, 'unita_misura', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITA_MISURA.map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeRiga(index)}
                        disabled={righe.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Note</label>
              <Textarea
                placeholder="Note aggiuntive..."
                value={newDDT.note}
                onChange={(e) => setNewDDT(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNewDDT(false); resetForm(); }}>
                Annulla
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => createMutation.mutate()} 
                disabled={createMutation.isPending || !newDDT.mittente || !newDDT.destinatario}
              >
                {createMutation.isPending ? 'Creazione...' : 'Crea DDT'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza DDT */}
      <Dialog open={showViewDDT} onOpenChange={setShowViewDDT}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>DDT {selectedDDT?.numero}</DialogTitle>
          </DialogHeader>
          
          {selectedDDT && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{format(new Date(selectedDDT.data), 'dd MMMM yyyy', { locale: it })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant="outline">{selectedDDT.tipo === 'uscita' ? 'Uscita' : 'Entrata'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mittente</p>
                  <p className="font-medium">{selectedDDT.mittente}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destinatario</p>
                  <p className="font-medium">{selectedDDT.destinatario}</p>
                </div>
                {selectedDDT.indirizzo_destinazione && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Indirizzo Destinazione</p>
                    <p className="font-medium">{selectedDDT.indirizzo_destinazione}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Causale</p>
                  <p className="font-medium">{selectedDDT.causale_trasporto}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stato</p>
                  <Badge className={getStatoBadge(selectedDDT.stato)}>
                    {selectedDDT.stato}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Articoli</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Codice</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead className="text-right">Quantità</TableHead>
                      <TableHead>UM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {righeSelected.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{r.codice || '-'}</TableCell>
                        <TableCell>{r.descrizione}</TableCell>
                        <TableCell className="text-right">{r.quantita}</TableCell>
                        <TableCell>{r.unita_misura}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedDDT.note && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p>{selectedDDT.note}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Post Creation Actions Dialog */}
      {createdDDT && (
        <PostCreationActions
          open={showPostCreation}
          onClose={() => {
            setShowPostCreation(false);
            setCreatedDDT(null);
          }}
          entityType="ddt"
          entityId={createdDDT.id}
          entityName={createdDDT.numero}
        />
      )}
    </div>
  );
}