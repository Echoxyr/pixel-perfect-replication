import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Euro,
  Receipt,
  Calculator,
  Download,
  Upload,
  Search,
  Calendar,
  CreditCard,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Landmark,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  PiggyBank
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
  imponibile: number;
  iva: number;
  totale: number;
  stato: 'emessa' | 'pagata' | 'scaduta' | 'in_attesa' | 'contestata';
  metodoPagamento: string;
  dataPagamento?: string;
}

interface Scadenza {
  id: string;
  tipo: 'fattura' | 'tributo' | 'contributi' | 'altro';
  descrizione: string;
  importo: number;
  dataScadenza: string;
  stato: 'da_pagare' | 'pagata' | 'scaduta';
  ricorrente: boolean;
  periodicita?: 'mensile' | 'trimestrale' | 'annuale';
}

interface MovimentoBanca {
  id: string;
  data: string;
  tipo: 'entrata' | 'uscita';
  descrizione: string;
  importo: number;
  saldo: number;
  categoria: string;
  riferimentoFattura?: string;
}

interface NotaSpesa {
  id: string;
  numero: string;
  data: string;
  dipendente: string;
  descrizione: string;
  importo: number;
  stato: 'presentata' | 'approvata' | 'rimborsata' | 'rifiutata';
  allegati: string[];
}

interface PrimaNota {
  id: string;
  data: string;
  causale: string;
  descrizione: string;
  dare: number;
  avere: number;
  conto: string;
}

export default function RepartoAmministrazione() {
  const [activeTab, setActiveTab] = useState('fatture');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<'tutte' | 'attive' | 'passive'>('tutte');

  // Sample data
  const [fattureAttive] = useState<Fattura[]>([
    {
      id: '1',
      numero: 'FA-2024-001',
      tipo: 'attiva',
      data: '2024-01-15',
      scadenza: '2024-02-15',
      cliente_fornitore: 'Comune di Milano',
      descrizione: 'SAL 1 - Lavori Via Roma',
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
      imponibile: 28000,
      iva: 6160,
      totale: 34160,
      stato: 'pagata',
      metodoPagamento: 'Bonifico',
      dataPagamento: '2024-02-18'
    }
  ]);

  const [fatturePassive] = useState<Fattura[]>([
    {
      id: '3',
      numero: 'FP-2024-001',
      tipo: 'passiva',
      data: '2024-01-10',
      scadenza: '2024-02-10',
      cliente_fornitore: 'Edilmateriali SRL',
      descrizione: 'Materiali cantiere Via Roma',
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
      imponibile: 3500,
      iva: 770,
      totale: 4270,
      stato: 'in_attesa',
      metodoPagamento: 'RIBA 60gg'
    }
  ]);

  const [scadenze] = useState<Scadenza[]>([
    {
      id: '1',
      tipo: 'tributo',
      descrizione: 'IVA trimestrale Q1 2024',
      importo: 15000,
      dataScadenza: '2024-05-16',
      stato: 'da_pagare',
      ricorrente: true,
      periodicita: 'trimestrale'
    },
    {
      id: '2',
      tipo: 'contributi',
      descrizione: 'INPS dipendenti Febbraio',
      importo: 8500,
      dataScadenza: '2024-03-16',
      stato: 'da_pagare',
      ricorrente: true,
      periodicita: 'mensile'
    },
    {
      id: '3',
      tipo: 'tributo',
      descrizione: 'IMU saldo 2023',
      importo: 2800,
      dataScadenza: '2024-06-16',
      stato: 'da_pagare',
      ricorrente: true,
      periodicita: 'annuale'
    }
  ]);

  const [movimentiBanca] = useState<MovimentoBanca[]>([
    {
      id: '1',
      data: '2024-02-20',
      tipo: 'entrata',
      descrizione: 'Incasso FA-2024-002',
      importo: 34160,
      saldo: 125000,
      categoria: 'Incasso fatture',
      riferimentoFattura: 'FA-2024-002'
    },
    {
      id: '2',
      data: '2024-02-18',
      tipo: 'uscita',
      descrizione: 'Stipendi Febbraio',
      importo: 45000,
      saldo: 80000,
      categoria: 'Personale'
    },
    {
      id: '3',
      data: '2024-02-15',
      tipo: 'uscita',
      descrizione: 'Pagamento FP-2024-001',
      importo: 14640,
      saldo: 125000,
      categoria: 'Fornitori',
      riferimentoFattura: 'FP-2024-001'
    }
  ]);

  const [noteSpesa] = useState<NotaSpesa[]>([
    {
      id: '1',
      numero: 'NS-2024-001',
      data: '2024-02-10',
      dipendente: 'Mario Rossi',
      descrizione: 'Trasferta cantiere Torino',
      importo: 350,
      stato: 'approvata',
      allegati: ['ricevute.pdf']
    },
    {
      id: '2',
      numero: 'NS-2024-002',
      data: '2024-02-15',
      dipendente: 'Giuseppe Verdi',
      descrizione: 'Materiale di consumo urgente',
      importo: 120,
      stato: 'presentata',
      allegati: ['scontrini.pdf']
    }
  ]);

  const [primaNota] = useState<PrimaNota[]>([
    {
      id: '1',
      data: '2024-02-20',
      causale: 'Incasso fattura',
      descrizione: 'Incasso FA-2024-002 Condominio Aurora',
      dare: 34160,
      avere: 0,
      conto: 'Banca c/c'
    },
    {
      id: '2',
      data: '2024-02-18',
      causale: 'Pagamento stipendi',
      descrizione: 'Stipendi dipendenti Febbraio 2024',
      dare: 0,
      avere: 45000,
      conto: 'Banca c/c'
    }
  ]);

  const [showNewFattura, setShowNewFattura] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT');
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'pagata': case 'approvata': case 'rimborsata':
        return 'bg-emerald-500/15 text-emerald-500';
      case 'emessa': case 'in_attesa': case 'presentata':
        return 'bg-sky-500/15 text-sky-500';
      case 'da_pagare':
        return 'bg-amber-500/15 text-amber-500';
      case 'scaduta': case 'contestata': case 'rifiutata':
        return 'bg-red-500/15 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const allFatture = [...fattureAttive, ...fatturePassive];
  const filteredFatture = allFatture.filter(f => {
    if (filterTipo === 'attive' && f.tipo !== 'attiva') return false;
    if (filterTipo === 'passive' && f.tipo !== 'passiva') return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return f.numero.toLowerCase().includes(search) ||
        f.cliente_fornitore.toLowerCase().includes(search) ||
        f.descrizione.toLowerCase().includes(search);
    }
    return true;
  });

  // Stats
  const stats = {
    fattureAttiveEmesse: fattureAttive.filter(f => f.stato === 'emessa').reduce((sum, f) => sum + f.totale, 0),
    fatturePassiveDaPagare: fatturePassive.filter(f => f.stato === 'in_attesa').reduce((sum, f) => sum + f.totale, 0),
    scadenzeProssime: scadenze.filter(s => s.stato === 'da_pagare').reduce((sum, s) => sum + s.importo, 0),
    saldoBanca: movimentiBanca[0]?.saldo || 0,
    noteSpesaInAttesa: noteSpesa.filter(n => n.stato === 'presentata').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reparto Amministrazione</h1>
          <p className="text-muted-foreground">Gestione fatturazione, scadenze, prima nota e tesoreria</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.scadenzeProssime)}</p>
                <p className="text-xs text-muted-foreground">Scadenze prossime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Landmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.saldoBanca)}</p>
                <p className="text-xs text-muted-foreground">Saldo Banca</p>
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
                <p className="text-2xl font-bold">{stats.noteSpesaInAttesa}</p>
                <p className="text-xs text-muted-foreground">Note Spesa da approvare</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="fatture" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Fatture
          </TabsTrigger>
          <TabsTrigger value="scadenze" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Scadenzario
          </TabsTrigger>
          <TabsTrigger value="banca" className="flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            Movimenti Banca
          </TabsTrigger>
          <TabsTrigger value="notespesa" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Note Spesa
          </TabsTrigger>
          <TabsTrigger value="primanota" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Prima Nota
          </TabsTrigger>
        </TabsList>

        {/* Fatture Tab */}
        <TabsContent value="fatture" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Fatture</CardTitle>
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
                      <div className="space-y-2 col-span-2">
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
                    <TableHead>Descrizione</TableHead>
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
                      <TableCell className="max-w-[200px] truncate">{fattura.descrizione}</TableCell>
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

        {/* Scadenzario Tab */}
        <TabsContent value="scadenze" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Scadenzario Fiscale</CardTitle>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuova Scadenza
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Ricorrente</TableHead>
                    <TableHead className="w-[100px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scadenze.map((scadenza) => (
                    <TableRow key={scadenza.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {scadenza.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{scadenza.descrizione}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(scadenza.importo)}</TableCell>
                      <TableCell>{formatDate(scadenza.dataScadenza)}</TableCell>
                      <TableCell>
                        <Badge className={getStatoColor(scadenza.stato)}>
                          {scadenza.stato.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {scadenza.ricorrente && (
                          <Badge variant="outline">{scadenza.periodicita}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Paga
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movimenti Banca Tab */}
        <TabsContent value="banca" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Movimenti Bancari</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Saldo attuale: {formatCurrency(stats.saldoBanca)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Importa estratto conto
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuovo Movimento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentiBanca.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell>{formatDate(movimento.data)}</TableCell>
                      <TableCell>
                        {movimento.tipo === 'entrata' ? (
                          <div className="flex items-center gap-2 text-emerald-500">
                            <ArrowUpRight className="w-4 h-4" />
                            Entrata
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500">
                            <ArrowDownLeft className="w-4 h-4" />
                            Uscita
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{movimento.descrizione}</TableCell>
                      <TableCell>{movimento.categoria}</TableCell>
                      <TableCell className={cn(
                        'text-right font-medium',
                        movimento.tipo === 'entrata' ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {movimento.tipo === 'entrata' ? '+' : '-'}{formatCurrency(movimento.importo)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(movimento.saldo)}</TableCell>
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
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nuova Nota Spesa
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Dipendente</TableHead>
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
                      <TableCell>{nota.descrizione}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(nota.importo)}</TableCell>
                      <TableCell>
                        <Badge className={getStatoColor(nota.stato)}>
                          {nota.stato}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approva
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

        {/* Prima Nota Tab */}
        <TabsContent value="primanota" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Prima Nota Contabile</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Esporta
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuova Registrazione
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Causale</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Conto</TableHead>
                    <TableHead className="text-right">Dare</TableHead>
                    <TableHead className="text-right">Avere</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {primaNota.map((registrazione) => (
                    <TableRow key={registrazione.id}>
                      <TableCell>{formatDate(registrazione.data)}</TableCell>
                      <TableCell>{registrazione.causale}</TableCell>
                      <TableCell>{registrazione.descrizione}</TableCell>
                      <TableCell>{registrazione.conto}</TableCell>
                      <TableCell className={cn(
                        'text-right font-medium',
                        registrazione.dare > 0 ? 'text-emerald-500' : ''
                      )}>
                        {registrazione.dare > 0 ? formatCurrency(registrazione.dare) : '-'}
                      </TableCell>
                      <TableCell className={cn(
                        'text-right font-medium',
                        registrazione.avere > 0 ? 'text-red-500' : ''
                      )}>
                        {registrazione.avere > 0 ? formatCurrency(registrazione.avere) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
