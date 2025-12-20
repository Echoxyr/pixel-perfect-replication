import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Plus,
  Receipt,
  Download,
  Search,
  CheckCircle,
  Eye,
  Edit,
  Users,
  UserPlus,
  Briefcase,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  XCircle,
  MessageSquare,
  Calendar,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Fattura {
  id: string;
  numero: string;
  tipo: 'attiva' | 'passiva';
  data: string;
  scadenza: string;
  cliente_fornitore: string;
  descrizione: string;
  commessa?: string;
  imponibile: number;
  iva: number;
  totale: number;
  stato: 'emessa' | 'pagata' | 'scaduta' | 'in_attesa' | 'contestata';
  metodoPagamento: string;
  dataPagamento?: string;
}

interface NotaSpesa {
  id: string;
  numero: string;
  data: string;
  dipendente: string;
  commessa?: string;
  descrizione: string;
  importo: number;
  stato: 'presentata' | 'approvata' | 'rimborsata' | 'rifiutata';
  allegati: string[];
  categoria: 'trasferta' | 'materiale' | 'vitto' | 'alloggio' | 'altro';
}

interface RichiestaDipendente {
  id: string;
  numero: string;
  data: string;
  dipendente: string;
  tipo: 'ferie' | 'permesso' | 'malattia' | 'straordinario' | 'anticipo' | 'rimborso' | 'altro';
  descrizione: string;
  dataInizio?: string;
  dataFine?: string;
  importo?: number;
  stato: 'in_attesa' | 'approvata' | 'rifiutata' | 'completata';
  note?: string;
}

interface NodoOrganigramma {
  id: string;
  nome: string;
  ruolo: string;
  reparto: string;
  superioreId?: string;
  livello: number;
  foto?: string;
  email?: string;
  telefono?: string;
}

export default function RepartoAmministrazione() {
  const [activeTab, setActiveTab] = useState('fatture');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<'tutte' | 'attive' | 'passive'>('tutte');

  // Sample data - Fatture collegate a commesse
  const [fatture] = useState<Fattura[]>([
    {
      id: '1',
      numero: 'FA-2024-001',
      tipo: 'attiva',
      data: '2024-01-15',
      scadenza: '2024-02-15',
      cliente_fornitore: 'Comune di Milano',
      descrizione: 'SAL 1 - Lavori Via Roma',
      commessa: 'COM-2024-001',
      imponibile: 45000,
      iva: 9900,
      totale: 54900,
      stato: 'emessa',
      metodoPagamento: 'Bonifico 30gg'
    },
    {
      id: '2',
      numero: 'FA-2024-002',
      tipo: 'attiva',
      data: '2024-01-20',
      scadenza: '2024-02-20',
      cliente_fornitore: 'Condominio Aurora',
      descrizione: 'Ristrutturazione facciata',
      commessa: 'COM-2024-002',
      imponibile: 28000,
      iva: 6160,
      totale: 34160,
      stato: 'pagata',
      metodoPagamento: 'Bonifico',
      dataPagamento: '2024-02-18'
    },
    {
      id: '3',
      numero: 'FP-2024-001',
      tipo: 'passiva',
      data: '2024-01-10',
      scadenza: '2024-02-10',
      cliente_fornitore: 'Edilmateriali SRL',
      descrizione: 'Materiali cantiere Via Roma',
      commessa: 'COM-2024-001',
      imponibile: 12000,
      iva: 2640,
      totale: 14640,
      stato: 'pagata',
      metodoPagamento: 'Bonifico',
      dataPagamento: '2024-02-08'
    },
    {
      id: '4',
      numero: 'FP-2024-002',
      tipo: 'passiva',
      data: '2024-01-25',
      scadenza: '2024-02-25',
      cliente_fornitore: 'Ferramenta Industriale SpA',
      descrizione: 'Bulloneria e fissaggi',
      commessa: 'COM-2024-001',
      imponibile: 3500,
      iva: 770,
      totale: 4270,
      stato: 'in_attesa',
      metodoPagamento: 'RIBA 60gg'
    }
  ]);

  const [noteSpesa] = useState<NotaSpesa[]>([
    {
      id: '1',
      numero: 'NS-2024-001',
      data: '2024-02-10',
      dipendente: 'Mario Rossi',
      commessa: 'COM-2024-001',
      descrizione: 'Trasferta cantiere Torino',
      importo: 350,
      stato: 'approvata',
      allegati: ['ricevute.pdf'],
      categoria: 'trasferta'
    },
    {
      id: '2',
      numero: 'NS-2024-002',
      data: '2024-02-15',
      dipendente: 'Giuseppe Verdi',
      commessa: 'COM-2024-002',
      descrizione: 'Materiale di consumo urgente',
      importo: 120,
      stato: 'presentata',
      allegati: ['scontrini.pdf'],
      categoria: 'materiale'
    },
    {
      id: '3',
      numero: 'NS-2024-003',
      data: '2024-02-18',
      dipendente: 'Anna Bianchi',
      descrizione: 'Pranzo cliente',
      importo: 85,
      stato: 'presentata',
      allegati: ['ricevuta_ristorante.pdf'],
      categoria: 'vitto'
    }
  ]);

  const [richiesteDipendenti] = useState<RichiestaDipendente[]>([
    {
      id: '1',
      numero: 'RD-2024-001',
      data: '2024-02-01',
      dipendente: 'Mario Rossi',
      tipo: 'ferie',
      descrizione: 'Ferie estive',
      dataInizio: '2024-08-05',
      dataFine: '2024-08-19',
      stato: 'approvata'
    },
    {
      id: '2',
      numero: 'RD-2024-002',
      data: '2024-02-10',
      dipendente: 'Giuseppe Verdi',
      tipo: 'permesso',
      descrizione: 'Visita medica',
      dataInizio: '2024-02-20',
      dataFine: '2024-02-20',
      stato: 'approvata'
    },
    {
      id: '3',
      numero: 'RD-2024-003',
      data: '2024-02-15',
      dipendente: 'Anna Bianchi',
      tipo: 'anticipo',
      descrizione: 'Anticipo stipendio marzo',
      importo: 500,
      stato: 'in_attesa'
    },
    {
      id: '4',
      numero: 'RD-2024-004',
      data: '2024-02-18',
      dipendente: 'Luca Neri',
      tipo: 'straordinario',
      descrizione: 'Straordinari cantiere urgente',
      dataInizio: '2024-02-24',
      dataFine: '2024-02-25',
      stato: 'in_attesa',
      note: 'Consegna urgente cliente'
    }
  ]);

  // Organigramma aziendale
  const [organigramma] = useState<NodoOrganigramma[]>([
    { id: '1', nome: 'Marco Ferretti', ruolo: 'Amministratore Delegato', reparto: 'Direzione', livello: 0 },
    { id: '2', nome: 'Laura Conti', ruolo: 'Direttore Tecnico', reparto: 'Tecnico', superioreId: '1', livello: 1 },
    { id: '3', nome: 'Paolo Mantovani', ruolo: 'Direttore Commerciale', reparto: 'Commerciale', superioreId: '1', livello: 1 },
    { id: '4', nome: 'Giulia Rossini', ruolo: 'Responsabile Amministrativo', reparto: 'Amministrazione', superioreId: '1', livello: 1 },
    { id: '5', nome: 'Mario Rossi', ruolo: 'Capo Cantiere Senior', reparto: 'Tecnico', superioreId: '2', livello: 2 },
    { id: '6', nome: 'Giuseppe Verdi', ruolo: 'Capo Cantiere', reparto: 'Tecnico', superioreId: '2', livello: 2 },
    { id: '7', nome: 'Anna Bianchi', ruolo: 'Responsabile RSPP', reparto: 'HSE', superioreId: '2', livello: 2 },
    { id: '8', nome: 'Luca Neri', ruolo: 'Project Manager', reparto: 'Tecnico', superioreId: '2', livello: 2 },
    { id: '9', nome: 'Sara Colombo', ruolo: 'Commerciale', reparto: 'Commerciale', superioreId: '3', livello: 2 },
    { id: '10', nome: 'Roberto Galli', ruolo: 'Contabile', reparto: 'Amministrazione', superioreId: '4', livello: 2 },
    { id: '11', nome: 'Francesca Ricci', ruolo: 'HR Manager', reparto: 'Amministrazione', superioreId: '4', livello: 2 },
    { id: '12', nome: 'Alberto Marini', ruolo: 'Operaio Specializzato', reparto: 'Tecnico', superioreId: '5', livello: 3 },
    { id: '13', nome: 'Davide Costa', ruolo: 'Operaio Specializzato', reparto: 'Tecnico', superioreId: '5', livello: 3 },
    { id: '14', nome: 'Stefano Greco', ruolo: 'Operaio', reparto: 'Tecnico', superioreId: '6', livello: 3 },
  ]);

  const [showNewFattura, setShowNewFattura] = useState(false);
  const [showNewNota, setShowNewNota] = useState(false);
  const [showNewRichiesta, setShowNewRichiesta] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT');
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'pagata': case 'approvata': case 'rimborsata': case 'completata':
        return 'bg-emerald-500/15 text-emerald-500';
      case 'emessa': case 'in_attesa': case 'presentata':
        return 'bg-sky-500/15 text-sky-500';
      case 'scaduta': case 'contestata': case 'rifiutata':
        return 'bg-red-500/15 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTipoRichiestaColor = (tipo: string) => {
    switch (tipo) {
      case 'ferie': return 'bg-blue-500/15 text-blue-500';
      case 'permesso': return 'bg-purple-500/15 text-purple-500';
      case 'malattia': return 'bg-red-500/15 text-red-500';
      case 'straordinario': return 'bg-amber-500/15 text-amber-500';
      case 'anticipo': return 'bg-emerald-500/15 text-emerald-500';
      case 'rimborso': return 'bg-cyan-500/15 text-cyan-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredFatture = fatture.filter(f => {
    if (filterTipo === 'attive' && f.tipo !== 'attiva') return false;
    if (filterTipo === 'passive' && f.tipo !== 'passiva') return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return f.numero.toLowerCase().includes(search) ||
        f.cliente_fornitore.toLowerCase().includes(search) ||
        f.descrizione.toLowerCase().includes(search) ||
        (f.commessa && f.commessa.toLowerCase().includes(search));
    }
    return true;
  });

  // Stats
  const stats = {
    fattureAttiveEmesse: fatture.filter(f => f.tipo === 'attiva' && f.stato === 'emessa').reduce((sum, f) => sum + f.totale, 0),
    fatturePassiveDaPagare: fatture.filter(f => f.tipo === 'passiva' && f.stato === 'in_attesa').reduce((sum, f) => sum + f.totale, 0),
    noteSpesaInAttesa: noteSpesa.filter(n => n.stato === 'presentata').length,
    richiesteInAttesa: richiesteDipendenti.filter(r => r.stato === 'in_attesa').length,
    totaleNoteSpesaInAttesa: noteSpesa.filter(n => n.stato === 'presentata').reduce((sum, n) => sum + n.importo, 0)
  };

  // Organigramma rendering
  const renderOrganigramma = useMemo(() => {
    const nodiPerLivello: { [key: number]: NodoOrganigramma[] } = {};
    organigramma.forEach(nodo => {
      if (!nodiPerLivello[nodo.livello]) {
        nodiPerLivello[nodo.livello] = [];
      }
      nodiPerLivello[nodo.livello].push(nodo);
    });

    const repartiColors: { [key: string]: string } = {
      'Direzione': 'border-primary bg-primary/5',
      'Tecnico': 'border-blue-500 bg-blue-500/5',
      'Commerciale': 'border-amber-500 bg-amber-500/5',
      'Amministrazione': 'border-emerald-500 bg-emerald-500/5',
      'HSE': 'border-red-500 bg-red-500/5'
    };

    return (
      <div className="space-y-8 py-4">
        {Object.keys(nodiPerLivello).sort((a, b) => Number(a) - Number(b)).map(livello => (
          <div key={livello} className="space-y-2">
            <div className="text-sm text-muted-foreground font-medium mb-3">
              {livello === '0' ? 'Direzione' : livello === '1' ? 'Responsabili' : livello === '2' ? 'Coordinatori' : 'Operativi'}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {nodiPerLivello[Number(livello)].map(nodo => (
                <Card 
                  key={nodo.id} 
                  className={cn(
                    "w-48 border-2 transition-all hover:shadow-lg cursor-pointer",
                    repartiColors[nodo.reparto] || 'border-border'
                  )}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-sm truncate">{nodo.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{nodo.ruolo}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {nodo.reparto}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }, [organigramma]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reparto Amministrazione</h1>
          <p className="text-muted-foreground">Gestione fatture, note spesa, richieste dipendenti e organigramma</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.fattureAttiveEmesse)}</p>
                <p className="text-xs text-muted-foreground">Crediti da incassare</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ArrowDownLeft className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.fatturePassiveDaPagare)}</p>
                <p className="text-xs text-muted-foreground">Debiti da pagare</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Receipt className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.noteSpesaInAttesa}</p>
                <p className="text-xs text-muted-foreground">Note spesa ({formatCurrency(stats.totaleNoteSpesaInAttesa)})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.richiesteInAttesa}</p>
                <p className="text-xs text-muted-foreground">Richieste in attesa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="fatture" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Fatture
          </TabsTrigger>
          <TabsTrigger value="notespesa" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Note Spesa
          </TabsTrigger>
          <TabsTrigger value="richieste" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Richieste Dipendenti
          </TabsTrigger>
          <TabsTrigger value="organigramma" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Organigramma
          </TabsTrigger>
        </TabsList>

        {/* Fatture Tab */}
        <TabsContent value="fatture" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Fatture Attive e Passive</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filterTipo === 'tutte' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTipo('tutte')}
                  >
                    Tutte
                  </Button>
                  <Button
                    variant={filterTipo === 'attive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTipo('attive')}
                  >
                    Attive
                  </Button>
                  <Button
                    variant={filterTipo === 'passive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterTipo('passive')}
                  >
                    Passive
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Esporta
                </Button>
                <Dialog open={showNewFattura} onOpenChange={setShowNewFattura}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Nuova Fattura
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nuova Fattura</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attiva">Fattura Attiva (Emessa)</SelectItem>
                            <SelectItem value="passiva">Fattura Passiva (Ricevuta)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Numero Fattura</Label>
                        <Input placeholder="FA-2024-XXX" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Scadenza</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Commessa</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Collega a commessa" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COM-2024-001">COM-2024-001 - Via Roma</SelectItem>
                            <SelectItem value="COM-2024-002">COM-2024-002 - Aurora</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Cliente/Fornitore</Label>
                        <Input placeholder="Nome cliente o fornitore" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Descrizione</Label>
                        <Input placeholder="Descrizione fattura" />
                      </div>
                      <div className="space-y-2">
                        <Label>Imponibile</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Aliquota IVA %</Label>
                        <Select defaultValue="22">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="22">22%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="4">4%</SelectItem>
                            <SelectItem value="0">Esente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewFattura(false)}>Annulla</Button>
                      <Button>Salva Fattura</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente/Fornitore</TableHead>
                    <TableHead>Commessa</TableHead>
                    <TableHead className="text-right">Totale</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead className="w-[100px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFatture.map((fattura) => (
                    <TableRow key={fattura.id}>
                      <TableCell className="font-mono font-medium">{fattura.numero}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={fattura.tipo === 'attiva' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                          {fattura.tipo === 'attiva' ? 'Attiva' : 'Passiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(fattura.data)}</TableCell>
                      <TableCell>{fattura.cliente_fornitore}</TableCell>
                      <TableCell>
                        {fattura.commessa && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {fattura.commessa}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(fattura.totale)}</TableCell>
                      <TableCell>
                        <Badge className={getStatoColor(fattura.stato)}>
                          {fattura.stato.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(fattura.scadenza)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Note Spesa Tab */}
        <TabsContent value="notespesa" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Note Spesa</CardTitle>
              <Dialog open={showNewNota} onOpenChange={setShowNewNota}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuova Nota Spesa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuova Nota Spesa</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Dipendente</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona dipendente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mario">Mario Rossi</SelectItem>
                            <SelectItem value="giuseppe">Giuseppe Verdi</SelectItem>
                            <SelectItem value="anna">Anna Bianchi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trasferta">Trasferta</SelectItem>
                            <SelectItem value="materiale">Materiale</SelectItem>
                            <SelectItem value="vitto">Vitto</SelectItem>
                            <SelectItem value="alloggio">Alloggio</SelectItem>
                            <SelectItem value="altro">Altro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Commessa</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Collega a commessa" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COM-2024-001">COM-2024-001</SelectItem>
                            <SelectItem value="COM-2024-002">COM-2024-002</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Importo (€)</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrizione</Label>
                      <Textarea placeholder="Descrizione spesa..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewNota(false)}>Annulla</Button>
                    <Button>Invia Nota Spesa</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Commessa</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="w-[150px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noteSpesa.map((nota) => (
                    <TableRow key={nota.id}>
                      <TableCell className="font-mono font-medium">{nota.numero}</TableCell>
                      <TableCell>{formatDate(nota.data)}</TableCell>
                      <TableCell>{nota.dipendente}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{nota.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        {nota.commessa && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {nota.commessa}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{nota.descrizione}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(nota.importo)}</TableCell>
                      <TableCell>
                        <Badge className={getStatoColor(nota.stato)}>
                          {nota.stato}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {nota.stato === 'presentata' && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 text-emerald-500 hover:text-emerald-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approva
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Richieste Dipendenti Tab */}
        <TabsContent value="richieste" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Richieste Dipendenti</CardTitle>
              <Dialog open={showNewRichiesta} onOpenChange={setShowNewRichiesta}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuova Richiesta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuova Richiesta</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Dipendente</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona dipendente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mario">Mario Rossi</SelectItem>
                            <SelectItem value="giuseppe">Giuseppe Verdi</SelectItem>
                            <SelectItem value="anna">Anna Bianchi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo Richiesta</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ferie">Ferie</SelectItem>
                            <SelectItem value="permesso">Permesso</SelectItem>
                            <SelectItem value="malattia">Malattia</SelectItem>
                            <SelectItem value="straordinario">Straordinario</SelectItem>
                            <SelectItem value="anticipo">Anticipo Stipendio</SelectItem>
                            <SelectItem value="rimborso">Rimborso</SelectItem>
                            <SelectItem value="altro">Altro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Inizio</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Fine</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Importo (se applicabile)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrizione / Motivazione</Label>
                      <Textarea placeholder="Descrivi la richiesta..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewRichiesta(false)}>Annulla</Button>
                    <Button>Invia Richiesta</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Periodo/Importo</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="w-[150px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {richiesteDipendenti.map((richiesta) => (
                    <TableRow key={richiesta.id}>
                      <TableCell className="font-mono font-medium">{richiesta.numero}</TableCell>
                      <TableCell>{formatDate(richiesta.data)}</TableCell>
                      <TableCell>{richiesta.dipendente}</TableCell>
                      <TableCell>
                        <Badge className={getTipoRichiestaColor(richiesta.tipo)}>
                          {richiesta.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {richiesta.dataInizio && richiesta.dataFine ? (
                          <span className="text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(richiesta.dataInizio)} - {formatDate(richiesta.dataFine)}
                          </span>
                        ) : richiesta.importo ? (
                          <span className="font-medium">{formatCurrency(richiesta.importo)}</span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{richiesta.descrizione}</TableCell>
                      <TableCell>
                        <Badge className={getStatoColor(richiesta.stato)}>
                          {richiesta.stato.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {richiesta.stato === 'in_attesa' && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 text-emerald-500 hover:text-emerald-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approva
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organigramma Tab */}
        <TabsContent value="organigramma" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Organigramma Aziendale</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Struttura organizzativa generata automaticamente dai dati dipendenti
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Esporta PDF
                </Button>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Aggiungi Ruolo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legenda */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-primary bg-primary/5" />
                  <span className="text-sm">Direzione</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500/5" />
                  <span className="text-sm">Tecnico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-500/5" />
                  <span className="text-sm">Commerciale</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/5" />
                  <span className="text-sm">Amministrazione</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-500/5" />
                  <span className="text-sm">HSE</span>
                </div>
              </div>
              
              {renderOrganigramma}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
