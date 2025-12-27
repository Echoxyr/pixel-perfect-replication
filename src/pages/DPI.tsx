import React, { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { formatDateFull, daysUntil, generateId } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  HardHat,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Package,
  Calendar,
  User,
  Building2,
  FileText,
  Eye,
  Footprints,
  Hand,
  Ear,
  Glasses
} from 'lucide-react';

// Categorie DPI secondo normativa
const CATEGORIE_DPI = [
  { id: 'testa', nome: 'Protezione Testa', icon: HardHat, esempi: ['Casco', 'Elmetto', 'Cappuccio'] },
  { id: 'udito', nome: 'Protezione Udito', icon: Ear, esempi: ['Tappi', 'Cuffie antirumore', 'Archetti'] },
  { id: 'occhi', nome: 'Protezione Occhi', icon: Glasses, esempi: ['Occhiali', 'Visiera', 'Maschera saldatura'] },
  { id: 'vie_respiratorie', nome: 'Vie Respiratorie', icon: Eye, esempi: ['Mascherina FFP2/FFP3', 'Semimaschera', 'Autorespiratore'] },
  { id: 'mani', nome: 'Protezione Mani', icon: Hand, esempi: ['Guanti', 'Guanti antitaglio', 'Guanti chimici'] },
  { id: 'piedi', nome: 'Protezione Piedi', icon: Footprints, esempi: ['Scarpe antinfortunistiche', 'Stivali', 'Soprascarpe'] },
  { id: 'corpo', nome: 'Protezione Corpo', icon: User, esempi: ['Tuta', 'Gilet alta visibilità', 'Grembiule'] },
  { id: 'anticaduta', nome: 'Anticaduta', icon: ShieldAlert, esempi: ['Imbracatura', 'Cordino', 'Dissipatore'] },
];

interface DPIItem {
  id: string;
  categoria: string;
  nome: string;
  marca?: string;
  modello?: string;
  normativa: string;
  dataAcquisto: string;
  dataScadenza?: string;
  quantitaDisponibile: number;
  quantitaAssegnata: number;
}

interface AssegnazioneDPI {
  id: string;
  dpiId: string;
  lavoratoreId: string;
  dataConsegna: string;
  dataRestituzione?: string;
  firmato: boolean;
  note?: string;
}

export default function DPI() {
  const { lavoratori, imprese, cantieri } = useWorkHub();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [showNewDPIDialog, setShowNewDPIDialog] = useState(false);
  const [showAssegnaDialog, setShowAssegnaDialog] = useState(false);

  // Dati DPI con persistenza localStorage
  const [dpiInventario, setDpiInventario] = useState<DPIItem[]>(() => {
    const saved = localStorage.getItem('dpi_inventario');
    return saved ? JSON.parse(saved) : [];
  });

  const [assegnazioni, setAssegnazioni] = useState<AssegnazioneDPI[]>(() => {
    const saved = localStorage.getItem('dpi_assegnazioni');
    return saved ? JSON.parse(saved) : [];
  });

  // Salva automaticamente quando cambiano i dati
  React.useEffect(() => {
    localStorage.setItem('dpi_inventario', JSON.stringify(dpiInventario));
  }, [dpiInventario]);

  React.useEffect(() => {
    localStorage.setItem('dpi_assegnazioni', JSON.stringify(assegnazioni));
  }, [assegnazioni]);

  const [newDPI, setNewDPI] = useState({
    categoria: '',
    nome: '',
    marca: '',
    modello: '',
    normativa: '',
    dataAcquisto: '',
    dataScadenza: '',
    quantitaDisponibile: 0
  });

  const [newAssegnazione, setNewAssegnazione] = useState({
    dpiId: '',
    lavoratoreId: '',
    dataConsegna: new Date().toISOString().slice(0, 10)
  });

  // Statistiche
  const stats = useMemo(() => {
    const totalItems = dpiInventario.reduce((acc, d) => acc + d.quantitaDisponibile, 0);
    const assignedItems = dpiInventario.reduce((acc, d) => acc + d.quantitaAssegnata, 0);
    const availableItems = totalItems - assignedItems;
    const lowStock = dpiInventario.filter(d => (d.quantitaDisponibile - d.quantitaAssegnata) < 5).length;
    const expiring = dpiInventario.filter(d => d.dataScadenza && daysUntil(d.dataScadenza) <= 90 && daysUntil(d.dataScadenza) > 0).length;
    const expired = dpiInventario.filter(d => d.dataScadenza && daysUntil(d.dataScadenza) < 0).length;
    
    return { totalItems, assignedItems, availableItems, lowStock, expiring, expired };
  }, [dpiInventario]);

  // Filtra inventario
  const filteredInventario = useMemo(() => {
    return dpiInventario.filter(d => {
      if (filterCategoria !== 'all' && d.categoria !== filterCategoria) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!d.nome.toLowerCase().includes(query) && 
            !d.marca?.toLowerCase().includes(query) &&
            !d.modello?.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [dpiInventario, filterCategoria, searchQuery]);

  const getCategoriaInfo = (id: string) => CATEGORIE_DPI.find(c => c.id === id);
  const getLavoratore = (id: string) => lavoratori.find(l => l.id === id);
  const getDPI = (id: string) => dpiInventario.find(d => d.id === id);

  const handleSaveDPI = () => {
    if (!newDPI.categoria || !newDPI.nome || !newDPI.normativa) {
      toast({ title: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }
    
    const newItem: DPIItem = {
      id: generateId(),
      ...newDPI,
      quantitaAssegnata: 0
    };
    
    setDpiInventario([...dpiInventario, newItem]);
    toast({ title: 'DPI aggiunto all\'inventario' });
    setShowNewDPIDialog(false);
    setNewDPI({ categoria: '', nome: '', marca: '', modello: '', normativa: '', dataAcquisto: '', dataScadenza: '', quantitaDisponibile: 0 });
  };

  const handleAssegna = () => {
    if (!newAssegnazione.dpiId || !newAssegnazione.lavoratoreId) {
      toast({ title: 'Seleziona DPI e lavoratore', variant: 'destructive' });
      return;
    }
    
    const newA: AssegnazioneDPI = {
      id: generateId(),
      ...newAssegnazione,
      firmato: false
    };
    
    setAssegnazioni([...assegnazioni, newA]);
    
    // Aggiorna quantità assegnata
    setDpiInventario(dpiInventario.map(d => 
      d.id === newAssegnazione.dpiId 
        ? { ...d, quantitaAssegnata: d.quantitaAssegnata + 1 }
        : d
    ));
    
    toast({ title: 'DPI assegnato con successo' });
    setShowAssegnaDialog(false);
    setNewAssegnazione({ dpiId: '', lavoratoreId: '', dataConsegna: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            Gestione DPI
          </h1>
          <p className="text-muted-foreground">Dispositivi di Protezione Individuale - Inventario e assegnazioni</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAssegnaDialog(true)} className="gap-2">
            <User className="w-4 h-4" />
            Assegna DPI
          </Button>
          <Button onClick={() => setShowNewDPIDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo DPI
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Totale Inventario</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalItems}</p>
        </div>
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary">Assegnati</span>
          </div>
          <p className="text-2xl font-bold text-primary">{stats.assignedItems}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-500">Disponibili</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.availableItems}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-500">Scorta Bassa</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{stats.lowStock}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-500">In Scadenza</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{stats.expiring}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-500">Scaduti</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
        </div>
      </div>

      {/* Categorie DPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIE_DPI.map(cat => {
          const Icon = cat.icon;
          const count = dpiInventario.filter(d => d.categoria === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategoria(filterCategoria === cat.id ? 'all' : cat.id)}
              className={cn(
                'p-3 rounded-xl border text-center transition-all',
                filterCategoria === cat.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <Icon className={cn('w-6 h-6 mx-auto mb-1', filterCategoria === cat.id ? 'text-primary' : 'text-muted-foreground')} />
              <p className="text-xs font-medium truncate">{cat.nome}</p>
              <p className="text-xs text-muted-foreground">{count} tipi</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filtri:
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca DPI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventario" className="w-full">
        <TabsList>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="assegnazioni">Assegnazioni</TabsTrigger>
          <TabsTrigger value="scadenziario">Scadenziario</TabsTrigger>
        </TabsList>

        <TabsContent value="inventario" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventario.map(dpi => {
              const cat = getCategoriaInfo(dpi.categoria);
              const Icon = cat?.icon || Package;
              const disponibili = dpi.quantitaDisponibile - dpi.quantitaAssegnata;
              const isLowStock = disponibili < 5;
              const isExpired = dpi.dataScadenza && daysUntil(dpi.dataScadenza) < 0;
              const isExpiring = dpi.dataScadenza && daysUntil(dpi.dataScadenza) <= 90 && daysUntil(dpi.dataScadenza) > 0;

              return (
                <div key={dpi.id} className={cn(
                  'p-4 rounded-xl border bg-card',
                  isExpired ? 'border-red-500/50' :
                  isExpiring || isLowStock ? 'border-amber-500/50' :
                  'border-border'
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{dpi.nome}</h3>
                        <p className="text-xs text-muted-foreground">{cat?.nome}</p>
                      </div>
                    </div>
                    {isExpired && <Badge className="bg-red-500/20 text-red-500">Scaduto</Badge>}
                    {isExpiring && !isExpired && <Badge className="bg-amber-500/20 text-amber-500">In scadenza</Badge>}
                    {isLowStock && !isExpired && !isExpiring && <Badge className="bg-amber-500/20 text-amber-500">Scorta bassa</Badge>}
                  </div>
                  <div className="space-y-2 text-sm">
                    {dpi.marca && <p className="text-muted-foreground">Marca: <span className="text-foreground">{dpi.marca} {dpi.modello}</span></p>}
                    <p className="text-muted-foreground">Normativa: <span className="text-foreground font-mono text-xs">{dpi.normativa}</span></p>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Disponibili:</span>
                      <span className={cn('font-bold', disponibili < 5 ? 'text-amber-500' : 'text-emerald-500')}>{disponibili} / {dpi.quantitaDisponibile}</span>
                    </div>
                    {dpi.dataScadenza && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scadenza:</span>
                        <span className={cn(isExpired ? 'text-red-500' : isExpiring ? 'text-amber-500' : '')}>{formatDateFull(dpi.dataScadenza)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="assegnazioni" className="mt-6">
          <div className="space-y-4">
            {assegnazioni.map(a => {
              const dpi = getDPI(a.dpiId);
              const lavoratore = getLavoratore(a.lavoratoreId);
              if (!dpi || !lavoratore) return null;

              return (
                <div key={a.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {lavoratore.nome.charAt(0)}{lavoratore.cognome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{lavoratore.cognome} {lavoratore.nome}</p>
                      <p className="text-sm text-muted-foreground">{dpi.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p>Consegnato: {formatDateFull(a.dataConsegna)}</p>
                      {a.firmato && <Badge className="bg-emerald-500/20 text-emerald-500">Firmato</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scadenziario" className="mt-6">
          <div className="space-y-4">
            {dpiInventario.filter(d => d.dataScadenza).sort((a, b) => 
              new Date(a.dataScadenza!).getTime() - new Date(b.dataScadenza!).getTime()
            ).map(dpi => {
              const days = daysUntil(dpi.dataScadenza!);
              const isExpired = days < 0;
              const isExpiring = days >= 0 && days <= 90;

              return (
                <div key={dpi.id} className={cn(
                  'p-4 rounded-xl border flex items-center justify-between',
                  isExpired ? 'border-red-500/30 bg-red-500/5' :
                  isExpiring ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-border bg-card'
                )}>
                  <div>
                    <p className="font-semibold">{dpi.nome}</p>
                    <p className="text-sm text-muted-foreground">{dpi.marca} {dpi.modello}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-medium',
                      isExpired ? 'text-red-500' : isExpiring ? 'text-amber-500' : ''
                    )}>
                      {isExpired ? `Scaduto da ${Math.abs(days)} giorni` : `Scade tra ${days} giorni`}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDateFull(dpi.dataScadenza!)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nuovo DPI */}
      <Dialog open={showNewDPIDialog} onOpenChange={setShowNewDPIDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aggiungi DPI all'Inventario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Categoria *</Label>
              <Select value={newDPI.categoria} onValueChange={(v) => setNewDPI({...newDPI, categoria: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIE_DPI.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome DPI *</Label>
              <Input 
                value={newDPI.nome}
                onChange={(e) => setNewDPI({...newDPI, nome: e.target.value})}
                placeholder="es. Casco di protezione"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Marca</Label>
                <Input 
                  value={newDPI.marca}
                  onChange={(e) => setNewDPI({...newDPI, marca: e.target.value})}
                />
              </div>
              <div>
                <Label>Modello</Label>
                <Input 
                  value={newDPI.modello}
                  onChange={(e) => setNewDPI({...newDPI, modello: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Normativa di riferimento *</Label>
              <Input 
                value={newDPI.normativa}
                onChange={(e) => setNewDPI({...newDPI, normativa: e.target.value})}
                placeholder="es. EN 397"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Acquisto</Label>
                <Input 
                  type="date"
                  value={newDPI.dataAcquisto}
                  onChange={(e) => setNewDPI({...newDPI, dataAcquisto: e.target.value})}
                />
              </div>
              <div>
                <Label>Data Scadenza</Label>
                <Input 
                  type="date"
                  value={newDPI.dataScadenza}
                  onChange={(e) => setNewDPI({...newDPI, dataScadenza: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Quantità</Label>
              <Input 
                type="number"
                value={newDPI.quantitaDisponibile}
                onChange={(e) => setNewDPI({...newDPI, quantitaDisponibile: parseInt(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDPIDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveDPI}>Aggiungi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Assegna DPI */}
      <Dialog open={showAssegnaDialog} onOpenChange={setShowAssegnaDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assegna DPI a Lavoratore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>DPI *</Label>
              <Select value={newAssegnazione.dpiId} onValueChange={(v) => setNewAssegnazione({...newAssegnazione, dpiId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona DPI" />
                </SelectTrigger>
                <SelectContent>
                  {dpiInventario.filter(d => d.quantitaDisponibile - d.quantitaAssegnata > 0).map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nome} ({d.quantitaDisponibile - d.quantitaAssegnata} disponibili)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lavoratore *</Label>
              <Select value={newAssegnazione.lavoratoreId} onValueChange={(v) => setNewAssegnazione({...newAssegnazione, lavoratoreId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona lavoratore" />
                </SelectTrigger>
                <SelectContent>
                  {lavoratori.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.cognome} {l.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Consegna</Label>
              <Input 
                type="date"
                value={newAssegnazione.dataConsegna}
                onChange={(e) => setNewAssegnazione({...newAssegnazione, dataConsegna: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssegnaDialog(false)}>Annulla</Button>
            <Button onClick={handleAssegna}>Assegna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
