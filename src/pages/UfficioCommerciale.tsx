import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Building2,
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
  Calculator,
  Download,
  Upload,
  Search,
  Filter,
  Truck,
  Euro,
  Percent,
  Package,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Send,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Fornitore {
  id: string;
  ragioneSociale: string;
  partitaIva: string;
  indirizzo: string;
  citta: string;
  cap: string;
  telefono: string;
  email: string;
  pec: string;
  categoria: string;
  scontoBase: number;
  condizioniPagamento: string;
  note: string;
  stato: 'attivo' | 'sospeso' | 'cessato';
}

interface Preventivo {
  id: string;
  numero: string;
  data: string;
  fornitoreId: string;
  fornitoreNome: string;
  oggetto: string;
  importo: number;
  stato: 'richiesto' | 'ricevuto' | 'approvato' | 'rifiutato' | 'scaduto';
  scadenza: string;
  note: string;
  allegati: string[];
}

interface Ordine {
  id: string;
  numero: string;
  data: string;
  fornitoreId: string;
  fornitoreNome: string;
  preventivi: string[];
  importo: number;
  stato: 'bozza' | 'inviato' | 'confermato' | 'in_consegna' | 'consegnato' | 'annullato';
  dataConsegnaPrevista: string;
  dataConsegnaEffettiva?: string;
  note: string;
}

interface Contratto {
  id: string;
  numero: string;
  titolo: string;
  tipo: 'appalto' | 'subappalto' | 'fornitura' | 'servizio';
  contraente: string;
  importo: number;
  dataInizio: string;
  dataFine: string;
  stato: 'attivo' | 'scaduto' | 'chiuso' | 'sospeso';
  rinnovo: boolean;
  allegati: string[];
}

interface ListinoPrezzo {
  id: string;
  fornitoreId: string;
  fornitoreNome: string;
  nome: string;
  validoDal: string;
  validoAl: string;
  scontoApplicato: number;
  articoli: ArticoloListino[];
}

interface ArticoloListino {
  codice: string;
  descrizione: string;
  unitaMisura: string;
  prezzoListino: number;
  prezzoScontato: number;
}

export default function UfficioCommerciale() {
  const [activeTab, setActiveTab] = useState('contratti');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample data
  const [fornitori, setFornitori] = useState<Fornitore[]>([
    {
      id: '1',
      ragioneSociale: 'Edilmateriali SRL',
      partitaIva: '01234567890',
      indirizzo: 'Via Roma 123',
      citta: 'Milano',
      cap: '20100',
      telefono: '02-12345678',
      email: 'info@edilmateriali.it',
      pec: 'edilmateriali@pec.it',
      categoria: 'Materiali edili',
      scontoBase: 15,
      condizioniPagamento: '30 gg DFFM',
      note: '',
      stato: 'attivo'
    },
    {
      id: '2',
      ragioneSociale: 'Ferramenta Industriale SpA',
      partitaIva: '09876543210',
      indirizzo: 'Via Industria 45',
      citta: 'Torino',
      cap: '10100',
      telefono: '011-9876543',
      email: 'ordini@ferramentaind.it',
      pec: 'ferramentaind@pec.it',
      categoria: 'Ferramenta',
      scontoBase: 20,
      condizioniPagamento: '60 gg DFFM',
      note: 'Consegna gratuita sopra 500€',
      stato: 'attivo'
    }
  ]);

  const [preventivi, setPreventivi] = useState<Preventivo[]>([
    {
      id: '1',
      numero: 'PRV-2024-001',
      data: '2024-01-15',
      fornitoreId: '1',
      fornitoreNome: 'Edilmateriali SRL',
      oggetto: 'Materiali per cantiere Via Mazzini',
      importo: 15000,
      stato: 'ricevuto',
      scadenza: '2024-02-15',
      note: '',
      allegati: []
    },
    {
      id: '2',
      numero: 'PRV-2024-002',
      data: '2024-01-20',
      fornitoreId: '2',
      fornitoreNome: 'Ferramenta Industriale SpA',
      oggetto: 'Bulloneria e fissaggi',
      importo: 3500,
      stato: 'approvato',
      scadenza: '2024-02-20',
      note: '',
      allegati: []
    }
  ]);

  const [ordini, setOrdini] = useState<Ordine[]>([
    {
      id: '1',
      numero: 'ORD-2024-001',
      data: '2024-01-22',
      fornitoreId: '2',
      fornitoreNome: 'Ferramenta Industriale SpA',
      preventivi: ['2'],
      importo: 3500,
      stato: 'confermato',
      dataConsegnaPrevista: '2024-02-05',
      note: ''
    }
  ]);

  const [contratti, setContratti] = useState<Contratto[]>([
    {
      id: '1',
      numero: 'CTR-2024-001',
      titolo: 'Appalto lavori edili Via Roma',
      tipo: 'appalto',
      contraente: 'Comune di Milano',
      importo: 500000,
      dataInizio: '2024-01-01',
      dataFine: '2024-12-31',
      stato: 'attivo',
      rinnovo: false,
      allegati: []
    },
    {
      id: '2',
      numero: 'CTR-2024-002',
      titolo: 'Subappalto impianti elettrici',
      tipo: 'subappalto',
      contraente: 'Elettrica SRL',
      importo: 80000,
      dataInizio: '2024-02-01',
      dataFine: '2024-06-30',
      stato: 'attivo',
      rinnovo: true,
      allegati: []
    }
  ]);

  const [listini, setListini] = useState<ListinoPrezzo[]>([
    {
      id: '1',
      fornitoreId: '1',
      fornitoreNome: 'Edilmateriali SRL',
      nome: 'Listino 2024',
      validoDal: '2024-01-01',
      validoAl: '2024-12-31',
      scontoApplicato: 15,
      articoli: [
        { codice: 'CEM001', descrizione: 'Cemento Portland 325', unitaMisura: 'sacco', prezzoListino: 8.50, prezzoScontato: 7.23 },
        { codice: 'SAB001', descrizione: 'Sabbia lavata', unitaMisura: 'm³', prezzoListino: 35.00, prezzoScontato: 29.75 },
        { codice: 'GHI001', descrizione: 'Ghiaia mista', unitaMisura: 'm³', prezzoListino: 28.00, prezzoScontato: 23.80 }
      ]
    }
  ]);

  // Dialogs state
  const [showNewFornitore, setShowNewFornitore] = useState(false);
  const [showNewPreventivo, setShowNewPreventivo] = useState(false);
  const [showNewOrdine, setShowNewOrdine] = useState(false);
  const [showNewContratto, setShowNewContratto] = useState(false);

  // New item forms
  const [newFornitore, setNewFornitore] = useState<Partial<Fornitore>>({});
  const [newPreventivo, setNewPreventivo] = useState<Partial<Preventivo>>({});
  const [newOrdine, setNewOrdine] = useState<Partial<Ordine>>({});
  const [newContratto, setNewContratto] = useState<Partial<Contratto>>({});

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'attivo': case 'approvato': case 'confermato': case 'consegnato':
        return 'bg-emerald-500/15 text-emerald-500';
      case 'ricevuto': case 'in_consegna': case 'inviato':
        return 'bg-sky-500/15 text-sky-500';
      case 'richiesto': case 'bozza':
        return 'bg-amber-500/15 text-amber-500';
      case 'scaduto': case 'rifiutato': case 'annullato': case 'cessato': case 'sospeso':
        return 'bg-red-500/15 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT');
  };

  // Stats
  const stats = {
    contrattiAttivi: contratti.filter(c => c.stato === 'attivo').length,
    valoreTotaleContratti: contratti.filter(c => c.stato === 'attivo').reduce((sum, c) => sum + c.importo, 0),
    preventiviInAttesa: preventivi.filter(p => p.stato === 'richiesto' || p.stato === 'ricevuto').length,
    ordiniInCorso: ordini.filter(o => o.stato !== 'consegnato' && o.stato !== 'annullato').length,
    fornitoriAttivi: fornitori.filter(f => f.stato === 'attivo').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reparto Commerciale</h1>
          <p className="text-muted-foreground">Gestione contratti, fornitori, preventivi e ordini</p>
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
        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold truncate">{stats.contrattiAttivi}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Contratti Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
                <Euro className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold truncate" title={formatCurrency(stats.valoreTotaleContratti)}>{formatCurrency(stats.valoreTotaleContratti)}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Valore Contratti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
                <Receipt className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold truncate">{stats.preventiviInAttesa}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Preventivi in Attesa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 flex-shrink-0">
                <Truck className="w-5 h-5 text-sky-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold truncate">{stats.ordiniInCorso}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Ordini in Corso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                <Building2 className="w-5 h-5 text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold truncate">{stats.fornitoriAttivi}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Fornitori Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="contratti" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Contratti
          </TabsTrigger>
          <TabsTrigger value="fornitori" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Fornitori
          </TabsTrigger>
          <TabsTrigger value="preventivi" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Preventivi
          </TabsTrigger>
          <TabsTrigger value="ordini" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Ordini
          </TabsTrigger>
          <TabsTrigger value="listini" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Listini Prezzi
          </TabsTrigger>
          <TabsTrigger value="computi" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Computo Metrico
          </TabsTrigger>
        </TabsList>

        {/* Contratti Tab */}
        <TabsContent value="contratti" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contratti</CardTitle>
              <Dialog open={showNewContratto} onOpenChange={setShowNewContratto}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuovo Contratto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nuovo Contratto</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Numero Contratto</Label>
                      <Input placeholder="CTR-2024-XXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appalto">Appalto</SelectItem>
                          <SelectItem value="subappalto">Subappalto</SelectItem>
                          <SelectItem value="fornitura">Fornitura</SelectItem>
                          <SelectItem value="servizio">Servizio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Titolo</Label>
                      <Input placeholder="Titolo del contratto" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contraente</Label>
                      <Input placeholder="Nome contraente" />
                    </div>
                    <div className="space-y-2">
                      <Label>Importo</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Inizio</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fine</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Allegati</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Trascina o clicca per caricare</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewContratto(false)}>Annulla</Button>
                    <Button>Salva Contratto</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contraente</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratti.map((contratto) => (
                    <TableRow key={contratto.id}>
                      <TableCell className="font-medium">{contratto.numero}</TableCell>
                      <TableCell>{contratto.titolo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{contratto.tipo}</Badge>
                      </TableCell>
                      <TableCell>{contratto.contraente}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(contratto.importo)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(contratto.dataInizio)} - {formatDate(contratto.dataFine)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize', getStatoColor(contratto.stato))}>
                          {contratto.stato}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fornitori Tab */}
        <TabsContent value="fornitori" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Anagrafica Fornitori</CardTitle>
              <Dialog open={showNewFornitore} onOpenChange={setShowNewFornitore}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuovo Fornitore
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Nuovo Fornitore</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Ragione Sociale *</Label>
                      <Input placeholder="Ragione sociale" />
                    </div>
                    <div className="space-y-2">
                      <Label>P.IVA *</Label>
                      <Input placeholder="01234567890" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Indirizzo</Label>
                      <Input placeholder="Via/Piazza" />
                    </div>
                    <div className="space-y-2">
                      <Label>CAP</Label>
                      <Input placeholder="00000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Città</Label>
                      <Input placeholder="Città" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefono</Label>
                      <Input placeholder="+39 0123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="email@esempio.it" />
                    </div>
                    <div className="space-y-2">
                      <Label>PEC</Label>
                      <Input type="email" placeholder="pec@esempio.it" />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="materiali">Materiali edili</SelectItem>
                          <SelectItem value="ferramenta">Ferramenta</SelectItem>
                          <SelectItem value="elettrico">Materiale elettrico</SelectItem>
                          <SelectItem value="idraulica">Idraulica</SelectItem>
                          <SelectItem value="noleggio">Noleggio</SelectItem>
                          <SelectItem value="servizi">Servizi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sconto Base %</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Condizioni Pagamento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contanti">Contanti</SelectItem>
                          <SelectItem value="30gg">30 gg DFFM</SelectItem>
                          <SelectItem value="60gg">60 gg DFFM</SelectItem>
                          <SelectItem value="90gg">90 gg DFFM</SelectItem>
                          <SelectItem value="riba30">Ri.Ba 30 gg</SelectItem>
                          <SelectItem value="riba60">Ri.Ba 60 gg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-3">
                      <Label>Note</Label>
                      <Textarea placeholder="Note aggiuntive..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewFornitore(false)}>Annulla</Button>
                    <Button>Salva Fornitore</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ragione Sociale</TableHead>
                    <TableHead>P.IVA</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Sconto Base</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Contatti</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fornitori.map((fornitore) => (
                    <TableRow key={fornitore.id}>
                      <TableCell className="font-medium">{fornitore.ragioneSociale}</TableCell>
                      <TableCell>{fornitore.partitaIva}</TableCell>
                      <TableCell>{fornitore.categoria}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-emerald-500">
                          -{fornitore.scontoBase}%
                        </Badge>
                      </TableCell>
                      <TableCell>{fornitore.condizioniPagamento}</TableCell>
                      <TableCell className="text-sm">
                        <div>{fornitore.email}</div>
                        <div className="text-muted-foreground">{fornitore.telefono}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize', getStatoColor(fornitore.stato))}>
                          {fornitore.stato}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon"><FileSpreadsheet className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preventivi Tab */}
        <TabsContent value="preventivi" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preventivi Ricevuti/Emessi</CardTitle>
              <div className="flex items-center gap-2">
                <Dialog open={showNewPreventivo} onOpenChange={setShowNewPreventivo}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Upload className="w-4 h-4" />
                      Carica Preventivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Carica Preventivo</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Tipo *</Label>
                        <Select defaultValue="ricevuto">
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ricevuto">Preventivo Ricevuto (da fornitore)</SelectItem>
                            <SelectItem value="emesso">Preventivo Emesso (a cliente)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fornitore/Cliente *</Label>
                        <Input placeholder="Nome fornitore o cliente" />
                      </div>
                      <div className="space-y-2">
                        <Label>Numero Preventivo</Label>
                        <Input placeholder="PRV-2024-XXX" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Oggetto *</Label>
                        <Input placeholder="Oggetto del preventivo" />
                      </div>
                      <div className="space-y-2">
                        <Label>Importo</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Scadenza</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Stato</Label>
                        <Select defaultValue="ricevuto">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ricevuto">Ricevuto</SelectItem>
                            <SelectItem value="approvato">Approvato</SelectItem>
                            <SelectItem value="rifiutato">Rifiutato</SelectItem>
                            <SelectItem value="scaduto">Scaduto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Allegato (PDF)</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" id="preventivo-upload" />
                          <label htmlFor="preventivo-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Carica il file del preventivo</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, XLS, XLSX</p>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewPreventivo(false)}>Annulla</Button>
                      <Button className="gap-2">
                        <FileCheck className="w-4 h-4" />
                        Salva Preventivo
                      </Button>
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
                    <TableHead>Data</TableHead>
                    <TableHead>Fornitore/Cliente</TableHead>
                    <TableHead>Oggetto</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preventivi.map((preventivo) => (
                    <TableRow key={preventivo.id}>
                      <TableCell className="font-medium">{preventivo.numero}</TableCell>
                      <TableCell>{formatDate(preventivo.data)}</TableCell>
                      <TableCell>{preventivo.fornitoreNome}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{preventivo.oggetto}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(preventivo.importo)}</TableCell>
                      <TableCell>{formatDate(preventivo.scadenza)}</TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize', getStatoColor(preventivo.stato))}>
                          {preventivo.stato.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Visualizza"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" title="Scarica"><Download className="w-4 h-4" /></Button>
                          {preventivo.stato === 'ricevuto' && (
                            <>
                              <Button variant="ghost" size="icon" className="text-emerald-500" title="Approva">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500" title="Rifiuta">
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="text-red-500" title="Elimina">
                            <Trash2 className="w-4 h-4" />
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

        {/* Ordini Tab */}
        <TabsContent value="ordini" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ordini a Fornitore</CardTitle>
              <Dialog open={showNewOrdine} onOpenChange={setShowNewOrdine}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuovo Ordine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nuovo Ordine</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Fornitore *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona fornitore" />
                        </SelectTrigger>
                        <SelectContent>
                          {fornitori.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.ragioneSociale}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Da Preventivo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Collega preventivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {preventivi.filter(p => p.stato === 'approvato').map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.numero} - {p.oggetto}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data Consegna Prevista</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Importo</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Note</Label>
                      <Textarea placeholder="Note per il fornitore..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewOrdine(false)}>Annulla</Button>
                    <Button className="gap-2">
                      <Send className="w-4 h-4" />
                      Crea ed Invia Ordine
                    </Button>
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
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Consegna Prevista</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordini.map((ordine) => (
                    <TableRow key={ordine.id}>
                      <TableCell className="font-medium">{ordine.numero}</TableCell>
                      <TableCell>{formatDate(ordine.data)}</TableCell>
                      <TableCell>{ordine.fornitoreNome}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(ordine.importo)}</TableCell>
                      <TableCell>{formatDate(ordine.dataConsegnaPrevista)}</TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize', getStatoColor(ordine.stato))}>
                          {ordine.stato.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                          {ordine.stato === 'confermato' && (
                            <Button variant="ghost" size="icon" className="text-emerald-500">
                              <FileCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listini Prezzi Tab */}
        <TabsContent value="listini" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Listini Prezzi Fornitori</CardTitle>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Importa Listino
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {listini.map((listino) => (
                  <Card key={listino.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{listino.fornitoreNome}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {listino.nome} • Valido dal {formatDate(listino.validoDal)} al {formatDate(listino.validoAl)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-emerald-500">
                            <Percent className="w-3 h-3 mr-1" />
                            -{listino.scontoApplicato}%
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Esporta
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Codice</TableHead>
                            <TableHead>Descrizione</TableHead>
                            <TableHead>U.M.</TableHead>
                            <TableHead className="text-right">Prezzo Listino</TableHead>
                            <TableHead className="text-right">Prezzo Scontato</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {listino.articoli.map((articolo, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-mono">{articolo.codice}</TableCell>
                              <TableCell>{articolo.descrizione}</TableCell>
                              <TableCell>{articolo.unitaMisura}</TableCell>
                              <TableCell className="text-right text-muted-foreground line-through">
                                {formatCurrency(articolo.prezzoListino)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-emerald-500">
                                {formatCurrency(articolo.prezzoScontato)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Computo Metrico Tab - Redirect to dedicated page */}
        <TabsContent value="computi" className="mt-6">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Calculator className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Gestione Computo Metrico</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Strumento avanzato per la gestione dei computi metrici, preventivi e contabilità lavori.
                Compatibile con Primus, Excel e prezziari regionali.
              </p>
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => window.location.href = '/computo-metrico'}
              >
                <FileSpreadsheet className="w-5 h-5" />
                Apri Computo Metrico
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}