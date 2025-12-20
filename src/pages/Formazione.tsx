import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { formatDateFull, daysUntil, generateId } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  GraduationCap,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Building2,
  FileText,
  Download,
  Upload
} from 'lucide-react';

// Tipi di corsi obbligatori per legge italiana
const TIPI_CORSO = [
  { id: 'generale', nome: 'Formazione Generale', durata: 4, validita: null },
  { id: 'specifica_basso', nome: 'Formazione Specifica - Rischio Basso', durata: 4, validita: 5 },
  { id: 'specifica_medio', nome: 'Formazione Specifica - Rischio Medio', durata: 8, validita: 5 },
  { id: 'specifica_alto', nome: 'Formazione Specifica - Rischio Alto', durata: 12, validita: 5 },
  { id: 'preposto', nome: 'Formazione Preposti', durata: 8, validita: 5 },
  { id: 'dirigente', nome: 'Formazione Dirigenti', durata: 16, validita: 5 },
  { id: 'primo_soccorso_a', nome: 'Primo Soccorso Gruppo A', durata: 16, validita: 3 },
  { id: 'primo_soccorso_bc', nome: 'Primo Soccorso Gruppo B/C', durata: 12, validita: 3 },
  { id: 'antincendio_basso', nome: 'Antincendio - Rischio Basso', durata: 4, validita: 5 },
  { id: 'antincendio_medio', nome: 'Antincendio - Rischio Medio', durata: 8, validita: 5 },
  { id: 'antincendio_alto', nome: 'Antincendio - Rischio Alto', durata: 16, validita: 5 },
  { id: 'rls', nome: 'RLS', durata: 32, validita: 1 },
  { id: 'rspp_datore', nome: 'RSPP Datore di Lavoro', durata: 48, validita: 5 },
  { id: 'ponteggi', nome: 'Montaggio Ponteggi', durata: 28, validita: 4 },
  { id: 'ple', nome: 'PLE (Piattaforme Elevabili)', durata: 10, validita: 5 },
  { id: 'gru_autocarro', nome: 'Gru su Autocarro', durata: 12, validita: 5 },
  { id: 'carrello_elevatore', nome: 'Carrello Elevatore', durata: 12, validita: 5 },
  { id: 'escavatore', nome: 'Escavatore', durata: 10, validita: 5 },
  { id: 'imbracatore', nome: 'Imbracatore', durata: 8, validita: 5 },
  { id: 'spazi_confinati', nome: 'Spazi Confinati', durata: 8, validita: 5 },
  { id: 'lavori_quota', nome: 'Lavori in Quota', durata: 8, validita: 5 },
  { id: 'pav_pes_pei', nome: 'PAV-PES-PEI Elettrico', durata: 16, validita: 5 },
];

interface CorsoFormazione {
  id: string;
  lavoratoreId: string;
  tipoCorso: string;
  dataCorso: string;
  dataScadenza?: string;
  ore: number;
  ente: string;
  attestatoUrl?: string;
  stato: 'valido' | 'in_scadenza' | 'scaduto';
}

export default function Formazione() {
  const { lavoratori, imprese, formazioni } = useWorkHub();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImpresa, setFilterImpresa] = useState<string>('all');
  const [filterTipoCorso, setFilterTipoCorso] = useState<string>('all');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [showNewCorsoDialog, setShowNewCorsoDialog] = useState(false);
  const [attestatoFile, setAttestatoFile] = useState<File | null>(null);
  
  const [newCorso, setNewCorso] = useState({
    lavoratoreId: '',
    tipoCorso: '',
    dataCorso: '',
    dataScadenza: '',
    ore: 0,
    ente: ''
  });

  // Calcola statistiche formazione
  const stats = useMemo(() => {
    const total = formazioni.length;
    const validi = formazioni.filter(f => f.stato === 'fatto').length;
    const inScadenza = formazioni.filter(f => f.stato === 'in_scadenza').length;
    const scaduti = formazioni.filter(f => f.stato === 'scaduto').length;
    
    const lavoratoriFormati = new Set(formazioni.filter(f => f.stato === 'fatto').map(f => f.lavoratoreId)).size;
    const lavoratoriNonConformi = new Set(formazioni.filter(f => f.stato === 'scaduto').map(f => f.lavoratoreId)).size;
    
    return { total, validi, inScadenza, scaduti, lavoratoriFormati, lavoratoriNonConformi };
  }, [formazioni]);

  // Filtra formazioni
  const filteredFormazioni = useMemo(() => {
    return formazioni.filter(f => {
      const lavoratore = lavoratori.find(l => l.id === f.lavoratoreId);
      if (!lavoratore) return false;
      
      if (filterImpresa !== 'all' && lavoratore.impresaId !== filterImpresa) return false;
      if (filterTipoCorso !== 'all' && f.tipoCorso !== filterTipoCorso) return false;
      if (filterStato !== 'all' && f.stato !== filterStato) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${lavoratore.nome} ${lavoratore.cognome}`.toLowerCase();
        if (!fullName.includes(query) && !f.tipoCorso.toLowerCase().includes(query)) return false;
      }
      
      return true;
    });
  }, [formazioni, lavoratori, filterImpresa, filterTipoCorso, filterStato, searchQuery]);

  // Raggruppa per lavoratore
  const formazioniPerLavoratore = useMemo(() => {
    const grouped: Record<string, typeof formazioni> = {};
    filteredFormazioni.forEach(f => {
      if (!grouped[f.lavoratoreId]) grouped[f.lavoratoreId] = [];
      grouped[f.lavoratoreId].push(f);
    });
    return grouped;
  }, [filteredFormazioni]);

  const getLavoratore = (id: string) => lavoratori.find(l => l.id === id);
  const getImpresa = (id?: string) => imprese.find(i => i.id === id);

  const handleSaveCorso = () => {
    if (!newCorso.lavoratoreId || !newCorso.tipoCorso || !newCorso.dataCorso) {
      toast({ title: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }
    
    // In a real app, we'd save the file to storage and course to database
    if (attestatoFile) {
      toast({ title: 'Corso e attestato registrati', description: `Attestato: ${attestatoFile.name}` });
    } else {
      toast({ title: 'Corso registrato con successo' });
    }
    setShowNewCorsoDialog(false);
    setNewCorso({ lavoratoreId: '', tipoCorso: '', dataCorso: '', dataScadenza: '', ore: 0, ente: '' });
    setAttestatoFile(null);
  };

  const conformityRate = stats.total > 0 
    ? Math.round((stats.validi / stats.total) * 100) 
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Gestione Formazione
          </h1>
          <p className="text-muted-foreground">Corsi obbligatori D.Lgs 81/2008 e attestati</p>
        </div>
        <Button onClick={() => setShowNewCorsoDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuovo Corso
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Totale Attestati</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-500">Validi</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.validi}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-500">In Scadenza</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{stats.inScadenza}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-500">Scaduti</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.scaduti}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Lavoratori Formati</span>
          </div>
          <p className="text-2xl font-bold">{stats.lavoratoriFormati}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">Tasso Conformità</span>
          </div>
          <p className="text-2xl font-bold">{conformityRate}%</p>
          <Progress value={conformityRate} className="mt-2 h-1.5" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filtri:
        </div>
        <Select value={filterImpresa} onValueChange={setFilterImpresa}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Impresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le imprese</SelectItem>
            {imprese.map(i => (
              <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTipoCorso} onValueChange={setFilterTipoCorso}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Tipo Corso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i corsi</SelectItem>
            {TIPI_CORSO.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStato} onValueChange={setFilterStato}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="valido">✅ Valido</SelectItem>
            <SelectItem value="in_scadenza">⚠️ In scadenza</SelectItem>
            <SelectItem value="scaduto">🔴 Scaduto</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca lavoratore o corso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista Attestati</TabsTrigger>
          <TabsTrigger value="scadenziario">Scadenziario</TabsTrigger>
          <TabsTrigger value="corsi">Tipologie Corsi</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-6">
          <div className="space-y-4">
            {Object.entries(formazioniPerLavoratore).map(([lavoratoreId, corsi]) => {
              const lavoratore = getLavoratore(lavoratoreId);
              const impresa = getImpresa(lavoratore?.impresaId);
              if (!lavoratore) return null;

              const hasScaduti = corsi.some(c => c.stato === 'scaduto');
              const hasInScadenza = corsi.some(c => c.stato === 'in_scadenza');

              return (
                <div key={lavoratoreId} className={cn(
                  'p-4 rounded-xl border bg-card',
                  hasScaduti ? 'border-red-500/50' :
                  hasInScadenza ? 'border-amber-500/50' :
                  'border-border'
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                        hasScaduti ? 'bg-red-500/20 text-red-500' :
                        hasInScadenza ? 'bg-amber-500/20 text-amber-500' :
                        'bg-emerald-500/20 text-emerald-500'
                      )}>
                        {lavoratore.nome.charAt(0)}{lavoratore.cognome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{lavoratore.cognome} {lavoratore.nome}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          {impresa?.ragioneSociale || 'N/D'} • {lavoratore.mansione}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{corsi.length} corsi</Badge>
                      {hasScaduti && <Badge className="bg-red-500/20 text-red-500">Scaduti</Badge>}
                      {hasInScadenza && !hasScaduti && <Badge className="bg-amber-500/20 text-amber-500">In scadenza</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {corsi.map(corso => (
                      <div key={corso.id} className={cn(
                        'p-3 rounded-lg border text-sm',
                        corso.stato === 'scaduto' ? 'border-red-500/30 bg-red-500/5' :
                        corso.stato === 'in_scadenza' ? 'border-amber-500/30 bg-amber-500/5' :
                        'border-border bg-muted/30'
                      )}>
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium">{corso.tipoCorso}</p>
                          <Badge className={cn(
                            'text-xs',
                            corso.stato === 'scaduto' && 'bg-red-500/20 text-red-500',
                            corso.stato === 'in_scadenza' && 'bg-amber-500/20 text-amber-500',
                            corso.stato === 'fatto' && 'bg-emerald-500/20 text-emerald-500'
                          )}>
                            {corso.stato}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Conseguito: {formatDateFull(corso.dataCorso)}
                        </p>
                        {corso.dataScadenza && (
                          <p className="text-muted-foreground text-xs">
                            Scadenza: {formatDateFull(corso.dataScadenza)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scadenziario" className="mt-6">
          <div className="space-y-4">
            {/* Scaduti */}
            {stats.scaduti > 0 && (
              <div>
                <h3 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Attestati Scaduti ({stats.scaduti})
                </h3>
                <div className="space-y-2">
                  {formazioni.filter(f => f.stato === 'scaduto').map(f => {
                    const lavoratore = getLavoratore(f.lavoratoreId);
                    return (
                      <div key={f.id} className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lavoratore?.cognome} {lavoratore?.nome}</p>
                          <p className="text-sm text-muted-foreground">{f.tipoCorso}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-500 font-medium">
                            Scaduto il {formatDateFull(f.dataScadenza!)}
                          </p>
                          <Button size="sm" variant="destructive" className="mt-1">
                            Pianifica Rinnovo
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In scadenza */}
            {stats.inScadenza > 0 && (
              <div>
                <h3 className="font-semibold text-amber-500 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  In Scadenza nei prossimi 30 giorni ({stats.inScadenza})
                </h3>
                <div className="space-y-2">
                  {formazioni.filter(f => f.stato === 'in_scadenza').map(f => {
                    const lavoratore = getLavoratore(f.lavoratoreId);
                    const days = daysUntil(f.dataScadenza!);
                    return (
                      <div key={f.id} className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lavoratore?.cognome} {lavoratore?.nome}</p>
                          <p className="text-sm text-muted-foreground">{f.tipoCorso}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-amber-500 font-medium">
                            Scade tra {days} giorni
                          </p>
                          <Button size="sm" variant="outline" className="mt-1">
                            Pianifica Rinnovo
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="corsi" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPI_CORSO.map(corso => (
              <div key={corso.id} className="p-4 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">{corso.nome}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Durata: <span className="text-foreground font-medium">{corso.durata} ore</span></p>
                  <p>Validità: <span className="text-foreground font-medium">
                    {corso.validita ? `${corso.validita} anni` : 'Permanente'}
                  </span></p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nuovo Corso */}
      <Dialog open={showNewCorsoDialog} onOpenChange={setShowNewCorsoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registra Nuovo Corso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Lavoratore *</Label>
              <Select value={newCorso.lavoratoreId} onValueChange={(v) => setNewCorso({...newCorso, lavoratoreId: v})}>
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
              <Label>Tipo Corso *</Label>
              <Select value={newCorso.tipoCorso} onValueChange={(v) => {
                const corso = TIPI_CORSO.find(c => c.id === v);
                setNewCorso({...newCorso, tipoCorso: v, ore: corso?.durata || 0});
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo corso" />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_CORSO.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Corso *</Label>
                <Input 
                  type="date" 
                  value={newCorso.dataCorso}
                  onChange={(e) => setNewCorso({...newCorso, dataCorso: e.target.value})}
                />
              </div>
              <div>
                <Label>Ore</Label>
                <Input 
                  type="number" 
                  value={newCorso.ore}
                  onChange={(e) => setNewCorso({...newCorso, ore: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <Label>Data Scadenza</Label>
              <Input 
                type="date" 
                value={newCorso.dataScadenza}
                onChange={(e) => setNewCorso({...newCorso, dataScadenza: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Compilata automaticamente in base al tipo corso se non specificata
              </p>
            </div>
            <div>
              <Label>Ente Formatore</Label>
              <Input 
                value={newCorso.ente}
                onChange={(e) => setNewCorso({...newCorso, ente: e.target.value})}
                placeholder="Nome ente formatore"
              />
            </div>
            <div>
              <Label>Carica Attestato</Label>
              <div className="mt-2">
                {attestatoFile ? (
                  <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm flex-1">{attestatoFile.name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setAttestatoFile(null)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clicca per caricare attestato</span>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAttestatoFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCorsoDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveCorso}>Salva Corso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
