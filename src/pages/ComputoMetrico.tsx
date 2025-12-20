import { useState, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calculator,
  Plus,
  Download,
  Upload,
  Search,
  FileSpreadsheet,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit,
  Copy,
  Move,
  FileText,
  Layers,
  Euro,
  Percent,
  ArrowUpDown,
  Filter,
  Save,
  FileUp,
  FileDown,
  Printer,
  Sparkles,
  Wand2,
  ListTree
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface VoceComputo {
  id: string;
  codice: string;
  codicePreziario: string;
  descrizione: string;
  unitaMisura: string;
  prezzoUnitario: number;
  quantita: number;
  importo: number;
  categoriaId: string;
  note: string;
}

interface CategoriaComputo {
  id: string;
  codice: string;
  nome: string;
  parentId: string | null;
  ordine: number;
  expanded: boolean;
}

interface Preziario {
  id: string;
  nome: string;
  regione: string;
  anno: number;
  voci: VocePreziario[];
}

interface VocePreziario {
  codice: string;
  descrizione: string;
  unitaMisura: string;
  prezzo: number;
  categoria: string;
}

// Sample prezziari
const prezziariDisponibili: Preziario[] = [
  {
    id: 'lom2024',
    nome: 'Prezzario Regione Lombardia 2024',
    regione: 'Lombardia',
    anno: 2024,
    voci: [
      { codice: 'E.01.001.001', descrizione: 'Scavo di sbancamento in terreno di qualsiasi natura', unitaMisura: 'm³', prezzo: 8.50, categoria: 'OPERE EDILI' },
      { codice: 'E.01.002.001', descrizione: 'Scavo a sezione obbligata', unitaMisura: 'm³', prezzo: 15.00, categoria: 'OPERE EDILI' },
      { codice: 'E.02.001.001', descrizione: 'Calcestruzzo classe C25/30', unitaMisura: 'm³', prezzo: 125.00, categoria: 'OPERE EDILI' },
      { codice: 'E.02.002.001', descrizione: 'Acciaio per c.a. B450C', unitaMisura: 'kg', prezzo: 1.85, categoria: 'OPERE EDILI' },
      { codice: 'M.01.001.001', descrizione: 'Tubazione in rame rivestito ø 18', unitaMisura: 'm', prezzo: 28.50, categoria: 'IMPIANTI MECCANICI' },
      { codice: 'M.01.002.001', descrizione: 'Tubazione in multistrato ø 20', unitaMisura: 'm', prezzo: 12.80, categoria: 'IMPIANTI MECCANICI' },
      { codice: 'M.02.001.001', descrizione: 'Radiatore in alluminio 10 elementi', unitaMisura: 'cad', prezzo: 185.00, categoria: 'IMPIANTI MECCANICI' },
      { codice: 'EL.01.001.001', descrizione: 'Cavo FG7OR 3x2.5 mm²', unitaMisura: 'm', prezzo: 3.20, categoria: 'IMPIANTI ELETTRICI' },
      { codice: 'EL.01.002.001', descrizione: 'Quadro elettrico da incasso 24 moduli', unitaMisura: 'cad', prezzo: 145.00, categoria: 'IMPIANTI ELETTRICI' },
      { codice: 'EL.02.001.001', descrizione: 'Punto luce completo', unitaMisura: 'cad', prezzo: 85.00, categoria: 'IMPIANTI ELETTRICI' },
      { codice: 'ID.01.001.001', descrizione: 'Tubazione in PE-HD ø 50', unitaMisura: 'm', prezzo: 8.50, categoria: 'IMPIANTI IDRAULICI' },
      { codice: 'ID.01.002.001', descrizione: 'Tubazione in PP ø 110', unitaMisura: 'm', prezzo: 22.00, categoria: 'IMPIANTI IDRAULICI' }
    ]
  }
];

// Sample categories
const categorieDefault: CategoriaComputo[] = [
  { id: 'cat1', codice: 'A', nome: 'OPERE EDILI', parentId: null, ordine: 1, expanded: true },
  { id: 'cat1a', codice: 'A.1', nome: 'Scavi e movimenti terra', parentId: 'cat1', ordine: 1, expanded: false },
  { id: 'cat1b', codice: 'A.2', nome: 'Opere in c.a.', parentId: 'cat1', ordine: 2, expanded: false },
  { id: 'cat2', codice: 'B', nome: 'IMPIANTI MECCANICI', parentId: null, ordine: 2, expanded: true },
  { id: 'cat2a', codice: 'B.1', nome: 'Riscaldamento', parentId: 'cat2', ordine: 1, expanded: false },
  { id: 'cat2b', codice: 'B.2', nome: 'Condizionamento', parentId: 'cat2', ordine: 2, expanded: false },
  { id: 'cat3', codice: 'C', nome: 'IMPIANTI ELETTRICI', parentId: null, ordine: 3, expanded: true },
  { id: 'cat3a', codice: 'C.1', nome: 'Distribuzione', parentId: 'cat3', ordine: 1, expanded: false },
  { id: 'cat3b', codice: 'C.2', nome: 'Illuminazione', parentId: 'cat3', ordine: 2, expanded: false },
  { id: 'cat4', codice: 'D', nome: 'IMPIANTI IDRAULICI', parentId: null, ordine: 4, expanded: true }
];

export default function ComputoMetrico() {
  const [activeTab, setActiveTab] = useState('computo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreziario, setSelectedPreziario] = useState<string>(prezziariDisponibili[0].id);
  const [preziarioSearch, setPreziarioSearch] = useState('');
  const [categorie, setCategorie] = useState<CategoriaComputo[]>(categorieDefault);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  
  const [vociComputo, setVociComputo] = useState<VoceComputo[]>([
    {
      id: '1',
      codice: 'A.1.001',
      codicePreziario: 'E.01.001.001',
      descrizione: 'Scavo di sbancamento in terreno di qualsiasi natura',
      unitaMisura: 'm³',
      prezzoUnitario: 8.50,
      quantita: 150,
      importo: 1275.00,
      categoriaId: 'cat1a',
      note: ''
    },
    {
      id: '2',
      codice: 'A.2.001',
      codicePreziario: 'E.02.001.001',
      descrizione: 'Calcestruzzo classe C25/30',
      unitaMisura: 'm³',
      prezzoUnitario: 125.00,
      quantita: 45,
      importo: 5625.00,
      categoriaId: 'cat1b',
      note: ''
    },
    {
      id: '3',
      codice: 'B.1.001',
      codicePreziario: 'M.02.001.001',
      descrizione: 'Radiatore in alluminio 10 elementi',
      unitaMisura: 'cad',
      prezzoUnitario: 185.00,
      quantita: 12,
      importo: 2220.00,
      categoriaId: 'cat2a',
      note: ''
    },
    {
      id: '4',
      codice: 'C.1.001',
      codicePreziario: 'EL.02.001.001',
      descrizione: 'Punto luce completo',
      unitaMisura: 'cad',
      prezzoUnitario: 85.00,
      quantita: 24,
      importo: 2040.00,
      categoriaId: 'cat3a',
      note: ''
    }
  ]);

  const [showNewVoce, setShowNewVoce] = useState(false);
  const [showImportExcel, setShowImportExcel] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Get current prezzario
  const currentPreziario = prezziariDisponibili.find(p => p.id === selectedPreziario);
  
  // Filter prezzario voci
  const filteredPreziarioVoci = useMemo(() => {
    if (!currentPreziario || !preziarioSearch.trim()) return currentPreziario?.voci || [];
    const search = preziarioSearch.toLowerCase();
    return currentPreziario.voci.filter(v => 
      v.codice.toLowerCase().includes(search) ||
      v.descrizione.toLowerCase().includes(search) ||
      v.categoria.toLowerCase().includes(search)
    );
  }, [currentPreziario, preziarioSearch]);

  // Group by categoria
  const vociByCategoria = useMemo(() => {
    const grouped: Record<string, VocePreziario[]> = {};
    filteredPreziarioVoci.forEach(voce => {
      if (!grouped[voce.categoria]) grouped[voce.categoria] = [];
      grouped[voce.categoria].push(voce);
    });
    return grouped;
  }, [filteredPreziarioVoci]);

  // Calculate totals
  const totali = useMemo(() => {
    const byCategoria: Record<string, number> = {};
    vociComputo.forEach(voce => {
      const cat = categorie.find(c => c.id === voce.categoriaId);
      const parentCat = cat?.parentId ? categorie.find(c => c.id === cat.parentId) : cat;
      if (parentCat) {
        byCategoria[parentCat.id] = (byCategoria[parentCat.id] || 0) + voce.importo;
      }
    });
    return {
      byCategoria,
      totale: vociComputo.reduce((sum, v) => sum + v.importo, 0)
    };
  }, [vociComputo, categorie]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const toggleCategoria = (catId: string) => {
    setCategorie(prev => prev.map(c => 
      c.id === catId ? { ...c, expanded: !c.expanded } : c
    ));
  };

  const addVoceFromPreziario = (voce: VocePreziario) => {
    const newVoce: VoceComputo = {
      id: Date.now().toString(),
      codice: `NP.${vociComputo.length + 1}`,
      codicePreziario: voce.codice,
      descrizione: voce.descrizione,
      unitaMisura: voce.unitaMisura,
      prezzoUnitario: voce.prezzo,
      quantita: 1,
      importo: voce.prezzo,
      categoriaId: selectedCategoria || 'cat1',
      note: ''
    };
    setVociComputo(prev => [...prev, newVoce]);
  };

  const updateQuantita = (id: string, quantita: number) => {
    setVociComputo(prev => prev.map(v => 
      v.id === id ? { ...v, quantita, importo: v.prezzoUnitario * quantita } : v
    ));
  };

  const deleteVoce = (id: string) => {
    setVociComputo(prev => prev.filter(v => v.id !== id));
  };

  // Export functions
  const exportToExcel = () => {
    // Generate Excel-compatible content
    const content = `
COMPUTO METRICO ESTIMATIVO
Data: ${new Date().toLocaleDateString('it-IT')}
Prezzario: ${currentPreziario?.nome}

${categorie.filter(c => !c.parentId).map(cat => {
  const catVoci = vociComputo.filter(v => {
    const vocecat = categorie.find(c => c.id === v.categoriaId);
    return vocecat?.parentId === cat.id || vocecat?.id === cat.id;
  });
  if (catVoci.length === 0) return '';
  return `
${cat.nome}
${catVoci.map(v => `${v.codicePreziario}\t${v.descrizione}\t${v.unitaMisura}\t${v.quantita}\t${v.prezzoUnitario}\t${v.importo}`).join('\n')}
SUBTOTALE ${cat.nome}: ${formatCurrency(totali.byCategoria[cat.id] || 0)}
`;
}).join('\n')}

TOTALE COMPLESSIVO: ${formatCurrency(totali.totale)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'computo_metrico.txt';
    a.click();
  };

  const exportToPrimus = () => {
    // Generate Primus-compatible XML
    const primusXML = `<?xml version="1.0" encoding="UTF-8"?>
<PrimusExport>
  <Testata>
    <Titolo>Computo Metrico</Titolo>
    <Data>${new Date().toISOString().split('T')[0]}</Data>
    <Prezzario>${currentPreziario?.nome}</Prezzario>
  </Testata>
  <Categorie>
    ${categorie.filter(c => !c.parentId).map(cat => `
    <Categoria codice="${cat.codice}" nome="${cat.nome}">
      ${categorie.filter(sc => sc.parentId === cat.id).map(subcat => `
      <SubCategoria codice="${subcat.codice}" nome="${subcat.nome}">
        ${vociComputo.filter(v => v.categoriaId === subcat.id).map(voce => `
        <Voce>
          <CodicePreziario>${voce.codicePreziario}</CodicePreziario>
          <Descrizione>${voce.descrizione}</Descrizione>
          <UM>${voce.unitaMisura}</UM>
          <Quantita>${voce.quantita}</Quantita>
          <PrezzoUnitario>${voce.prezzoUnitario}</PrezzoUnitario>
          <Importo>${voce.importo}</Importo>
        </Voce>
        `).join('')}
      </SubCategoria>
      `).join('')}
    </Categoria>
    `).join('')}
  </Categorie>
  <Totale>${totali.totale}</Totale>
</PrimusExport>`;

    const blob = new Blob([primusXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'computo_metrico_primus.xml';
    a.click();
  };

  const renderCategorieTree = (parentId: string | null = null, level: number = 0): JSX.Element[] => {
    return categorie
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.ordine - b.ordine)
      .map(cat => {
        const hasChildren = categorie.some(c => c.parentId === cat.id);
        const isSelected = selectedCategoria === cat.id;
        const catTotal = totali.byCategoria[cat.id] || 0;
        
        return (
          <div key={cat.id}>
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors',
                isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => setSelectedCategoria(cat.id)}
            >
              {hasChildren ? (
                <button onClick={(e) => { e.stopPropagation(); toggleCategoria(cat.id); }}>
                  {cat.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="w-4" />
              )}
              <span className="font-mono text-xs text-muted-foreground">{cat.codice}</span>
              <span className="flex-1 text-sm font-medium truncate">{cat.nome}</span>
              {catTotal > 0 && (
                <span className="text-xs font-medium text-primary">{formatCurrency(catTotal)}</span>
              )}
            </div>
            {cat.expanded && renderCategorieTree(cat.id, level + 1)}
          </div>
        );
      });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Computo Metrico</h1>
          <p className="text-muted-foreground">Gestione computi, preventivi e contabilità lavori</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPreziario} onValueChange={setSelectedPreziario}>
            <SelectTrigger className="w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prezziariDisponibili.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vociComputo.length}</p>
                <p className="text-xs text-muted-foreground">Voci Computo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Euro className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totali.totale)}</p>
                <p className="text-xs text-muted-foreground">Importo Totale</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Layers className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categorie.filter(c => !c.parentId).length}</p>
                <p className="text-xs text-muted-foreground">Categorie</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileSpreadsheet className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentPreziario?.voci.length || 0}</p>
                <p className="text-xs text-muted-foreground">Voci Prezzario</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Categories Tree */}
        <div className="col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Categorie</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-3 pb-3">
                {renderCategorieTree()}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Area */}
        <div className="col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="computo" className="gap-2">
                  <Calculator className="w-4 h-4" />
                  Computo
                </TabsTrigger>
                <TabsTrigger value="prezzario" className="gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Prezzario
                </TabsTrigger>
                <TabsTrigger value="riepilogo" className="gap-2">
                  <ListTree className="w-4 h-4" />
                  Riepilogo
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Wand2 className="w-4 h-4" />
                      Assistente AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Assistente AI Computo
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        L'assistente AI può aiutarti a:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-primary" />
                          Raggruppare automaticamente voci per categoria
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-primary" />
                          Identificare codici prezzario da descrizioni
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-primary" />
                          Analizzare Excel/CSV e importare automaticamente
                        </li>
                        <li className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-primary" />
                          Suggerire voci mancanti basate su progetti simili
                        </li>
                      </ul>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Carica un file Excel per l'analisi automatica
                        </p>
                        <Input type="file" className="mt-2" accept=".xlsx,.xls,.csv" />
                      </div>
                      <Textarea 
                        placeholder="Oppure descrivi cosa vuoi fare... Es: 'Raggruppa le voci per impianto' o 'Trova il codice per posa tubazione in rame'"
                        rows={3}
                      />
                      <Button className="w-full gap-2">
                        <Sparkles className="w-4 h-4" />
                        Elabora con AI
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="gap-2" onClick={exportToExcel}>
                  <FileDown className="w-4 h-4" />
                  Excel
                </Button>
                <Button variant="outline" className="gap-2" onClick={exportToPrimus}>
                  <FileDown className="w-4 h-4" />
                  Primus
                </Button>
                <Button variant="outline" className="gap-2">
                  <Printer className="w-4 h-4" />
                  Stampa
                </Button>
              </div>
            </div>

            {/* Computo Tab */}
            <TabsContent value="computo">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca voci..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                  </div>
                  <Button className="gap-2" onClick={() => setShowNewVoce(true)}>
                    <Plus className="w-4 h-4" />
                    Nuova Voce
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Codice</TableHead>
                        <TableHead className="w-32">Cod. Prezzario</TableHead>
                        <TableHead>Descrizione</TableHead>
                        <TableHead className="w-20">U.M.</TableHead>
                        <TableHead className="w-24 text-right">Quantità</TableHead>
                        <TableHead className="w-28 text-right">Prezzo Unit.</TableHead>
                        <TableHead className="w-28 text-right">Importo</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vociComputo
                        .filter(v => !searchQuery || 
                          v.descrizione.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.codicePreziario.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((voce) => (
                        <TableRow key={voce.id}>
                          <TableCell className="font-mono text-xs">{voce.codice}</TableCell>
                          <TableCell className="font-mono text-xs text-primary">{voce.codicePreziario}</TableCell>
                          <TableCell className="text-sm">{voce.descrizione}</TableCell>
                          <TableCell className="text-sm">{voce.unitaMisura}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={voce.quantita}
                              onChange={(e) => updateQuantita(voce.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-right h-8"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(voce.prezzoUnitario)}</TableCell>
                          <TableCell className="text-right font-bold text-primary">{formatCurrency(voce.importo)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteVoce(voce.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Total row */}
                  <div className="flex justify-end mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Totale Computo</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(totali.totale)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prezzario Tab */}
            <TabsContent value="prezzario">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca nel prezzario (codice, descrizione, categoria)..." 
                        value={preziarioSearch}
                        onChange={(e) => setPreziarioSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {Object.entries(vociByCategoria).map(([categoria, voci]) => (
                      <div key={categoria} className="mb-6">
                        <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                          <FolderTree className="w-4 h-4" />
                          {categoria}
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-40">Codice</TableHead>
                              <TableHead>Descrizione</TableHead>
                              <TableHead className="w-20">U.M.</TableHead>
                              <TableHead className="w-28 text-right">Prezzo</TableHead>
                              <TableHead className="w-20"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {voci.map((voce) => (
                              <TableRow key={voce.codice}>
                                <TableCell className="font-mono text-xs">{voce.codice}</TableCell>
                                <TableCell className="text-sm">{voce.descrizione}</TableCell>
                                <TableCell className="text-sm">{voce.unitaMisura}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(voce.prezzo)}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="gap-1"
                                    onClick={() => addVoceFromPreziario(voce)}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Aggiungi
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Riepilogo Tab */}
            <TabsContent value="riepilogo">
              <Card>
                <CardHeader>
                  <CardTitle>Riepilogo per Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-center">N. Voci</TableHead>
                        <TableHead className="text-right">Importo</TableHead>
                        <TableHead className="text-right">% su Totale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categorie.filter(c => !c.parentId).map(cat => {
                        const catTotal = totali.byCategoria[cat.id] || 0;
                        const numVoci = vociComputo.filter(v => {
                          const vocecat = categorie.find(c => c.id === v.categoriaId);
                          return vocecat?.parentId === cat.id || vocecat?.id === cat.id;
                        }).length;
                        const percentage = totali.totale > 0 ? (catTotal / totali.totale * 100) : 0;
                        
                        return (
                          <TableRow key={cat.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">{cat.codice}</span>
                                {cat.nome}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{numVoci}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(catTotal)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm">{percentage.toFixed(1)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                    <span className="font-semibold">TOTALE COMPLESSIVO</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(totali.totale)}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}