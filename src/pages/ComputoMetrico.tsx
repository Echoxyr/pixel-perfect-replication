import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FileText,
  Layers,
  Euro,
  FileUp,
  FileDown,
  Printer,
  Sparkles,
  Wand2,
  ListTree,
  FileArchive,
  Loader2,
  Globe,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  descrizione: string;
  attivo: boolean;
  voci: VocePreziario[];
}

interface VocePreziario {
  codice: string;
  descrizione: string;
  unitaMisura: string;
  prezzo: number;
  categoria: string;
}

// Prezziari regionali italiani con descrizioni complete
const prezziariDisponibili: Preziario[] = [
  {
    id: 'lom2024',
    nome: 'Prezzario Regione Lombardia 2024',
    regione: 'Lombardia',
    anno: 2024,
    descrizione: 'Prezzario ufficiale regionale per opere edili, impiantistiche e infrastrutturali. Include voci per edilizia residenziale, terziaria e industriale.',
    attivo: true,
    voci: [
      { codice: 'E.01.001.001', descrizione: 'Scavo di sbancamento in terreno di qualsiasi natura esclusa roccia', unitaMisura: 'm³', prezzo: 8.50, categoria: 'OPERE EDILI - Movimenti terra' },
      { codice: 'E.01.002.001', descrizione: 'Scavo a sezione obbligata fino a m 2.00 di profondità', unitaMisura: 'm³', prezzo: 15.00, categoria: 'OPERE EDILI - Movimenti terra' },
      { codice: 'E.01.003.001', descrizione: 'Rinterro e costipazione con materiale proveniente dagli scavi', unitaMisura: 'm³', prezzo: 4.20, categoria: 'OPERE EDILI - Movimenti terra' },
      { codice: 'E.02.001.001', descrizione: 'Calcestruzzo per strutture in elevazione classe C25/30', unitaMisura: 'm³', prezzo: 125.00, categoria: 'OPERE EDILI - Calcestruzzi' },
      { codice: 'E.02.001.002', descrizione: 'Calcestruzzo per strutture in elevazione classe C30/37', unitaMisura: 'm³', prezzo: 135.00, categoria: 'OPERE EDILI - Calcestruzzi' },
      { codice: 'E.02.002.001', descrizione: 'Acciaio per c.a. tipo B450C in barre ad aderenza migliorata', unitaMisura: 'kg', prezzo: 1.85, categoria: 'OPERE EDILI - Acciaio' },
      { codice: 'E.03.001.001', descrizione: 'Muratura in blocchi di laterizio da cm 25', unitaMisura: 'm²', prezzo: 48.00, categoria: 'OPERE EDILI - Murature' },
      { codice: 'M.01.001.001', descrizione: 'Tubazione in rame rivestito per impianti di riscaldamento ø 18 mm', unitaMisura: 'm', prezzo: 28.50, categoria: 'IMPIANTI MECCANICI - Tubazioni' },
      { codice: 'M.01.002.001', descrizione: 'Tubazione in multistrato PEX/AL/PEX ø 20 mm', unitaMisura: 'm', prezzo: 12.80, categoria: 'IMPIANTI MECCANICI - Tubazioni' },
      { codice: 'M.02.001.001', descrizione: 'Radiatore in alluminio pressofuso 10 elementi h. 600 mm', unitaMisura: 'cad', prezzo: 185.00, categoria: 'IMPIANTI MECCANICI - Terminali' },
      { codice: 'EL.01.001.001', descrizione: 'Cavo FG7OR 450/750V 3x2.5 mm² in guaina', unitaMisura: 'm', prezzo: 3.20, categoria: 'IMPIANTI ELETTRICI - Cavi' },
      { codice: 'EL.01.002.001', descrizione: 'Quadro elettrico da incasso 24 moduli DIN con sportello', unitaMisura: 'cad', prezzo: 145.00, categoria: 'IMPIANTI ELETTRICI - Quadri' },
      { codice: 'EL.02.001.001', descrizione: 'Punto luce completo di frutto, placca e cablaggio', unitaMisura: 'cad', prezzo: 85.00, categoria: 'IMPIANTI ELETTRICI - Punti' },
      { codice: 'ID.01.001.001', descrizione: 'Tubazione in PE-HD PN16 per acquedotti ø 50 mm', unitaMisura: 'm', prezzo: 8.50, categoria: 'IMPIANTI IDRAULICI - Adduzione' },
      { codice: 'ID.01.002.001', descrizione: 'Tubazione in PP per scarichi ø 110 mm', unitaMisura: 'm', prezzo: 22.00, categoria: 'IMPIANTI IDRAULICI - Scarichi' }
    ]
  },
  {
    id: 'laz2024',
    nome: 'Prezzario Regione Lazio 2024',
    regione: 'Lazio',
    anno: 2024,
    descrizione: 'Tariffa dei prezzi per opere pubbliche della Regione Lazio. Comprende edilizia, strade, acquedotti e fognature.',
    attivo: true,
    voci: [
      { codice: 'A.01.001.a', descrizione: 'Scavo di sbancamento a macchina in terreno di qualsiasi natura', unitaMisura: 'm³', prezzo: 7.80, categoria: 'OPERE EDILI - Scavi' },
      { codice: 'A.01.002.a', descrizione: 'Scavo a sezione obbligata fino a ml 1.50', unitaMisura: 'm³', prezzo: 14.50, categoria: 'OPERE EDILI - Scavi' },
      { codice: 'B.01.001.a', descrizione: 'Conglomerato cementizio Rck 30 per strutture armate', unitaMisura: 'm³', prezzo: 128.00, categoria: 'OPERE EDILI - Calcestruzzi' },
      { codice: 'B.02.001.a', descrizione: 'Acciaio ad aderenza migliorata B450C lavorato', unitaMisura: 'kg', prezzo: 1.90, categoria: 'OPERE EDILI - Armature' },
      { codice: 'C.01.001.a', descrizione: 'Muratura in blocchi di laterizio forato spessore cm 12', unitaMisura: 'm²', prezzo: 32.00, categoria: 'OPERE EDILI - Murature' },
      { codice: 'IM.01.001.a', descrizione: 'Tubo multistrato in PE-X/AL/PE-X ø 16 mm', unitaMisura: 'm', prezzo: 10.50, categoria: 'IMPIANTI - Tubazioni' },
      { codice: 'IM.02.001.a', descrizione: 'Radiatore in alluminio 8 elementi h 700', unitaMisura: 'cad', prezzo: 165.00, categoria: 'IMPIANTI - Riscaldamento' },
      { codice: 'IE.01.001.a', descrizione: 'Punto presa forza motrice 16A', unitaMisura: 'cad', prezzo: 75.00, categoria: 'IMPIANTI - Elettrico' }
    ]
  },
  {
    id: 'cam2024',
    nome: 'Prezzario Regione Campania 2024',
    regione: 'Campania',
    anno: 2024,
    descrizione: 'Listino prezzi per lavori pubblici della Regione Campania. Include bonifiche, restauro e consolidamento antisismico.',
    attivo: true,
    voci: [
      { codice: 'OE.01.001', descrizione: 'Scavo di sbancamento con mezzi meccanici', unitaMisura: 'm³', prezzo: 7.20, categoria: 'OPERE EDILI' },
      { codice: 'OE.02.001', descrizione: 'Calcestruzzo per fondazioni Rck 25', unitaMisura: 'm³', prezzo: 118.00, categoria: 'OPERE EDILI' },
      { codice: 'OE.03.001', descrizione: 'Acciaio B450C in opera', unitaMisura: 'kg', prezzo: 1.75, categoria: 'OPERE EDILI' },
      { codice: 'AS.01.001', descrizione: 'Intervento di consolidamento antisismico con fasciatura FRP', unitaMisura: 'm²', prezzo: 85.00, categoria: 'ANTISISMICO' },
      { codice: 'IM.01.001', descrizione: 'Tubazione rame ø 22 per gas', unitaMisura: 'm', prezzo: 32.00, categoria: 'IMPIANTI' }
    ]
  },
  {
    id: 'emr2024',
    nome: 'Prezzario Regione Emilia Romagna 2024',
    regione: 'Emilia Romagna',
    anno: 2024,
    descrizione: 'Elenco regionale prezzi per opere pubbliche. Include specifiche voci per ricostruzione post-sisma.',
    attivo: true,
    voci: [
      { codice: '01.A01.A01.001', descrizione: 'Scavo a sezione aperta in terreno ordinario', unitaMisura: 'm³', prezzo: 8.10, categoria: 'MOVIMENTI TERRA' },
      { codice: '02.A01.A01.001', descrizione: 'Cls per fondazioni Rck 30', unitaMisura: 'm³', prezzo: 130.00, categoria: 'STRUTTURE' },
      { codice: '02.A02.A01.001', descrizione: 'Acciaio tipo B450C', unitaMisura: 'kg', prezzo: 1.88, categoria: 'STRUTTURE' },
      { codice: '03.A01.A01.001', descrizione: 'Muratura portante in laterizio pieno', unitaMisura: 'm³', prezzo: 280.00, categoria: 'MURATURE' },
      { codice: '08.A01.A01.001', descrizione: 'Consolidamento solai con profili HEA', unitaMisura: 'kg', prezzo: 3.50, categoria: 'CONSOLIDAMENTI' }
    ]
  },
  {
    id: 'ven2024',
    nome: 'Prezzario Regione Veneto 2024',
    regione: 'Veneto',
    anno: 2024,
    descrizione: 'Prezzario regionale per opere pubbliche del Veneto. Include edilizia sostenibile e infrastrutture verdi.',
    attivo: true,
    voci: [
      { codice: 'A.01.01.001.a', descrizione: 'Scavo di sbancamento a macchina', unitaMisura: 'm³', prezzo: 8.00, categoria: 'SCAVI E DEMOLIZIONI' },
      { codice: 'B.01.01.001.a', descrizione: 'Calcestruzzo classe C25/30 per fondazioni', unitaMisura: 'm³', prezzo: 122.00, categoria: 'CALCESTRUZZI' },
      { codice: 'B.02.01.001.a', descrizione: 'Acciaio B450C per armature', unitaMisura: 'kg', prezzo: 1.82, categoria: 'ARMATURE' },
      { codice: 'D.01.01.001.a', descrizione: 'Cappotto termico in EPS spessore cm 10', unitaMisura: 'm²', prezzo: 65.00, categoria: 'ISOLAMENTI' },
      { codice: 'F.01.01.001.a', descrizione: 'Pompa di calore aria-acqua 10 kW', unitaMisura: 'cad', prezzo: 4500.00, categoria: 'ENERGIE RINNOVABILI' }
    ]
  },
  {
    id: 'tos2024',
    nome: 'Prezzario Regione Toscana 2024',
    regione: 'Toscana',
    anno: 2024,
    descrizione: 'Prezzario ufficiale della Regione Toscana. Include restauro beni culturali e edilizia storica.',
    attivo: true,
    voci: [
      { codice: '01.A01.001.001', descrizione: 'Scavo di sbancamento a sezione aperta', unitaMisura: 'm³', prezzo: 8.30, categoria: 'SCAVI' },
      { codice: '02.A01.001.001', descrizione: 'Calcestruzzo C25/30 per strutture', unitaMisura: 'm³', prezzo: 127.00, categoria: 'CEMENTI ARMATI' },
      { codice: '02.B01.001.001', descrizione: 'Acciaio B450C in barre', unitaMisura: 'kg', prezzo: 1.87, categoria: 'CEMENTI ARMATI' },
      { codice: '05.A01.001.001', descrizione: 'Intonaco di calce per restauro', unitaMisura: 'm²', prezzo: 35.00, categoria: 'RESTAURO' },
      { codice: '05.B01.001.001', descrizione: 'Pulitura superficie lapidea con impacco', unitaMisura: 'm²', prezzo: 42.00, categoria: 'RESTAURO' }
    ]
  },
  {
    id: 'pie2024',
    nome: 'Prezzario Regione Piemonte 2024',
    regione: 'Piemonte',
    anno: 2024,
    descrizione: 'Elenco prezzi della Regione Piemonte per lavori pubblici. Include edilizia montana e infrastrutture alpine.',
    attivo: true,
    voci: [
      { codice: 'A01.001.a', descrizione: 'Scavo di sbancamento', unitaMisura: 'm³', prezzo: 8.80, categoria: 'MOVIMENTI TERRA' },
      { codice: 'B01.001.a', descrizione: 'Calcestruzzo Rck 30 per fondazioni', unitaMisura: 'm³', prezzo: 132.00, categoria: 'CALCESTRUZZI' },
      { codice: 'B02.001.a', descrizione: 'Armatura in acciaio B450C', unitaMisura: 'kg', prezzo: 1.92, categoria: 'ARMATURE' },
      { codice: 'C01.001.a', descrizione: 'Muratura in pietra locale', unitaMisura: 'm³', prezzo: 320.00, categoria: 'MURATURE TRADIZIONALI' },
      { codice: 'D01.001.a', descrizione: 'Copertura in lose di pietra', unitaMisura: 'm²', prezzo: 95.00, categoria: 'COPERTURE ALPINE' }
    ]
  },
  {
    id: 'sic2024',
    nome: 'Prezzario Regione Sicilia 2024',
    regione: 'Sicilia',
    anno: 2024,
    descrizione: 'Prezzario regionale siciliano per opere pubbliche. Include edilizia in zone sismiche e consolidamenti.',
    attivo: true,
    voci: [
      { codice: 'A.01.001', descrizione: 'Scavo a sezione obbligata in roccia', unitaMisura: 'm³', prezzo: 28.00, categoria: 'SCAVI' },
      { codice: 'A.02.001', descrizione: 'Scavo in terreno di qualsiasi natura', unitaMisura: 'm³', prezzo: 7.50, categoria: 'SCAVI' },
      { codice: 'B.01.001', descrizione: 'Calcestruzzo Rck 30', unitaMisura: 'm³', prezzo: 120.00, categoria: 'STRUTTURE' },
      { codice: 'B.02.001', descrizione: 'Acciaio B450C', unitaMisura: 'kg', prezzo: 1.80, categoria: 'STRUTTURE' },
      { codice: 'S.01.001', descrizione: 'Consolidamento antisismico nodi c.a.', unitaMisura: 'cad', prezzo: 850.00, categoria: 'ANTISISMICO' }
    ]
  }
];

// Default categories
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
  
  const [vociComputo, setVociComputo] = useState<VoceComputo[]>([]);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

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
    toast({
      title: "Voce aggiunta",
      description: voce.descrizione.substring(0, 50) + "...",
    });
  };

  const updateQuantita = (id: string, quantita: number) => {
    setVociComputo(prev => prev.map(v => 
      v.id === id ? { ...v, quantita, importo: v.prezzoUnitario * quantita } : v
    ));
  };

  const deleteVoce = (id: string) => {
    setVociComputo(prev => prev.filter(v => v.id !== id));
  };

  // AI Assistant functions
  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAiLoading(true);
    setAiResult('');
    
    try {
      const { data, error } = await supabase.functions.invoke('computo-ai', {
        body: { action: 'find_code', data: aiQuery }
      });

      if (error) throw error;

      if (data?.result) {
        if (typeof data.result === 'object' && data.result.suggestions) {
          // Format suggestions as readable text
          const suggestions = data.result.suggestions.map((s: any) => 
            `• ${s.codice} - ${s.descrizione}\n  Regione: ${s.regione || 'N/A'} | Prezzo: €${s.prezzoIndicativo || 'N/A'}`
          ).join('\n\n');
          setAiResult(suggestions || 'Nessun codice trovato per questa descrizione.');
        } else {
          setAiResult(typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2));
        }
      }
    } catch (error) {
      console.error('AI error:', error);
      toast({
        title: "Errore AI",
        description: "Impossibile elaborare la richiesta. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAIFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAiLoading(true);
    setAiResult('');

    try {
      const text = await file.text();
      
      const { data, error } = await supabase.functions.invoke('computo-ai', {
        body: { action: 'analyze_excel', fileContent: text }
      });

      if (error) throw error;

      if (data?.result?.voci) {
        // Add imported voci
        const importedVoci: VoceComputo[] = data.result.voci.map((v: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          codice: `AI.${index + 1}`,
          codicePreziario: v.codice || 'N/A',
          descrizione: v.descrizione || 'Voce importata',
          unitaMisura: v.unitaMisura || 'cad',
          prezzoUnitario: v.prezzoUnitario || 0,
          quantita: v.quantita || 1,
          importo: (v.prezzoUnitario || 0) * (v.quantita || 1),
          categoriaId: 'cat1',
          note: 'Importato da AI'
        }));

        setVociComputo(prev => [...prev, ...importedVoci]);
        setAiResult(`Importate ${importedVoci.length} voci dal file.\n\n${data.result.note || ''}`);
        
        toast({
          title: "Importazione AI completata",
          description: `Aggiunte ${importedVoci.length} voci al computo`,
        });
      } else {
        setAiResult(typeof data.result === 'string' ? data.result : 'Analisi completata, ma nessuna voce trovata.');
      }
    } catch (error) {
      console.error('AI file error:', error);
      toast({
        title: "Errore analisi",
        description: "Impossibile analizzare il file. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = '';
    }
  };

  // Import Primus file
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'xpwe' || extension === 'dcf' || extension === 'xml') {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        const vociElements = xmlDoc.querySelectorAll('Voce, voce, VOCE, Articolo, articolo');
        const importedVoci: VoceComputo[] = [];
        
        vociElements.forEach((voceEl, index) => {
          const codice = voceEl.querySelector('Codice, codice, CodicePreziario, CodArt')?.textContent || 
                        voceEl.getAttribute('codice') || `IMP.${index + 1}`;
          const descrizione = voceEl.querySelector('Descrizione, descrizione, Desc, DesArt')?.textContent || 
                             voceEl.getAttribute('descrizione') || 'Voce importata';
          const um = voceEl.querySelector('UM, um, UnitaMisura, Unita')?.textContent || 
                    voceEl.getAttribute('um') || 'cad';
          const quantita = parseFloat(voceEl.querySelector('Quantita, quantita, Qta')?.textContent || 
                                      voceEl.getAttribute('quantita') || '1') || 1;
          const prezzo = parseFloat(voceEl.querySelector('Prezzo, prezzo, PrezzoUnitario, PrzUnit')?.textContent || 
                                   voceEl.getAttribute('prezzo') || '0') || 0;
          
          importedVoci.push({
            id: `imp-${Date.now()}-${index}`,
            codice: `IMP.${index + 1}`,
            codicePreziario: codice,
            descrizione: descrizione,
            unitaMisura: um,
            prezzoUnitario: prezzo,
            quantita: quantita,
            importo: prezzo * quantita,
            categoriaId: 'cat1',
            note: 'Importato da ' + file.name
          });
        });

        if (importedVoci.length > 0) {
          setVociComputo(prev => [...prev, ...importedVoci]);
          toast({
            title: "Importazione completata",
            description: `Importate ${importedVoci.length} voci da ${file.name}`,
          });
        } else {
          toast({
            title: "Nessuna voce trovata",
            description: "Il file non contiene voci riconoscibili",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Formato non supportato",
          description: "Formati supportati: .xpwe, .dcf, .xml",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Errore importazione:', error);
      toast({
        title: "Errore importazione",
        description: "Impossibile leggere il file.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowImportDialog(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Export functions
  const exportToDCF = () => {
    const dcfContent = `<?xml version="1.0" encoding="UTF-8"?>
<DCF version="1.0">
  <Intestazione>
    <Titolo>Computo Metrico</Titolo>
    <Data>${new Date().toISOString().split('T')[0]}</Data>
    <Prezzario>${currentPreziario?.nome || 'Non specificato'}</Prezzario>
  </Intestazione>
  <Corpo>
    <Categorie>
${categorie.filter(c => !c.parentId).map(cat => {
  const catVoci = vociComputo.filter(v => {
    const vocecat = categorie.find(c => c.id === v.categoriaId);
    return vocecat?.parentId === cat.id || vocecat?.id === cat.id;
  });
  return `      <Categoria codice="${cat.codice}" nome="${cat.nome}">
${catVoci.map(voce => `        <Articolo>
          <CodArt>${voce.codicePreziario}</CodArt>
          <DesArt><![CDATA[${voce.descrizione}]]></DesArt>
          <Unita>${voce.unitaMisura}</Unita>
          <Qta>${voce.quantita}</Qta>
          <PrzUnit>${voce.prezzoUnitario.toFixed(2)}</PrzUnit>
          <Importo>${voce.importo.toFixed(2)}</Importo>
        </Articolo>`).join('\n')}
      </Categoria>`;
}).join('\n')}
    </Categorie>
    <Riepilogo>
      <TotaleImponibile>${totali.totale.toFixed(2)}</TotaleImponibile>
    </Riepilogo>
  </Corpo>
</DCF>`;

    const blob = new Blob([dcfContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'computo_metrico.dcf';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Esportazione DCF completata" });
  };

  const exportToPDF = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Computo Metrico</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; font-size: 10pt; }
    h1 { font-size: 16pt; margin-bottom: 5px; }
    h2 { font-size: 12pt; color: #333; margin-top: 20px; border-bottom: 1px solid #333; }
    .info { color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .right { text-align: right; }
    .total-row { background-color: #e8f4ff; font-weight: bold; }
    .grand-total { background-color: #1e40af; color: white; font-size: 12pt; }
  </style>
</head>
<body>
  <h1>COMPUTO METRICO ESTIMATIVO</h1>
  <div class="info">
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
    <p><strong>Prezzario:</strong> ${currentPreziario?.nome || 'Non specificato'}</p>
  </div>
  
  ${categorie.filter(c => !c.parentId).map(cat => {
    const catVoci = vociComputo.filter(v => {
      const vocecat = categorie.find(c => c.id === v.categoriaId);
      return vocecat?.parentId === cat.id || vocecat?.id === cat.id;
    });
    if (catVoci.length === 0) return '';
    
    return `
    <h2>${cat.codice} - ${cat.nome}</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 15%">Codice</th>
          <th>Descrizione</th>
          <th style="width: 8%">U.M.</th>
          <th style="width: 10%" class="right">Quantità</th>
          <th style="width: 12%" class="right">Prezzo Unit.</th>
          <th style="width: 12%" class="right">Importo</th>
        </tr>
      </thead>
      <tbody>
        ${catVoci.map(voce => `
        <tr>
          <td>${voce.codicePreziario}</td>
          <td>${voce.descrizione}</td>
          <td>${voce.unitaMisura}</td>
          <td class="right">${voce.quantita.toLocaleString('it-IT')}</td>
          <td class="right">${formatCurrency(voce.prezzoUnitario)}</td>
          <td class="right">${formatCurrency(voce.importo)}</td>
        </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="5" class="right">Subtotale ${cat.nome}:</td>
          <td class="right">${formatCurrency(totali.byCategoria[cat.id] || 0)}</td>
        </tr>
      </tbody>
    </table>
    `;
  }).join('')}
  
  <table style="margin-top: 30px;">
    <tr class="grand-total">
      <td colspan="5" class="right" style="padding: 15px;">TOTALE COMPLESSIVO:</td>
      <td class="right" style="padding: 15px;">${formatCurrency(totali.totale)}</td>
    </tr>
  </table>
  
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const exportToPrimus = () => {
    const primusXML = `<?xml version="1.0" encoding="UTF-8"?>
<PrimusExport version="2.0">
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
          <Descrizione><![CDATA[${voce.descrizione}]]></Descrizione>
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
    a.download = 'computo_metrico.xpwe';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Esportazione XPWE completata" });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Computo Metrico</h1>
          <p className="text-muted-foreground">Gestione computi, preventivi e contabilità lavori</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPreziario} onValueChange={setSelectedPreziario}>
            <SelectTrigger className="w-full md:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prezziariDisponibili.filter(p => p.attivo).map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    {p.nome}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prezzario Info Card */}
      {currentPreziario && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentPreziario.nome}</h3>
                  <p className="text-sm text-muted-foreground">{currentPreziario.descrizione}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {currentPreziario.regione}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Anno {currentPreziario.anno}
                    </Badge>
                    <Badge className="text-xs bg-emerald-500">
                      <Check className="w-3 h-3 mr-1" />
                      Attivo
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{currentPreziario.voci.length}</p>
                <p className="text-xs text-muted-foreground">Voci disponibili</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{prezziariDisponibili.filter(p => p.attivo).length}</p>
                <p className="text-xs text-muted-foreground">Prezziari Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Categories Tree */}
        <div className="lg:col-span-3">
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
        <div className="lg:col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="computo" className="gap-2">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden md:inline">Computo</span>
                </TabsTrigger>
                <TabsTrigger value="prezzario" className="gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden md:inline">Prezzario</span>
                </TabsTrigger>
                <TabsTrigger value="riepilogo" className="gap-2">
                  <ListTree className="w-4 h-4" />
                  <span className="hidden md:inline">Riepilogo</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap items-center gap-2">
                <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Wand2 className="w-4 h-4" />
                      <span className="hidden md:inline">Assistente AI</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      
                      {/* File Upload */}
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Carica un file Excel per l'analisi automatica
                        </p>
                        <Input 
                          ref={aiFileInputRef}
                          type="file" 
                          className="mt-2"
                          accept=".xlsx,.xls,.csv,.txt"
                          onChange={handleAIFileUpload}
                          disabled={isAiLoading}
                        />
                      </div>
                      
                      {/* Text Query */}
                      <Textarea 
                        placeholder="Oppure descrivi cosa vuoi fare... Es: 'Trova il codice per posa tubazione in rame ø 22' o 'Prezzo scavo a sezione obbligata'"
                        rows={3}
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        disabled={isAiLoading}
                      />
                      
                      <Button 
                        className="w-full gap-2" 
                        onClick={handleAIQuery}
                        disabled={isAiLoading || !aiQuery.trim()}
                      >
                        {isAiLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {isAiLoading ? 'Elaborazione...' : 'Elabora con AI'}
                      </Button>

                      {/* AI Result */}
                      {aiResult && (
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">Risultato:</h4>
                          <pre className="text-sm whitespace-pre-wrap font-mono">{aiResult}</pre>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <FileUp className="w-4 h-4" />
                      <span className="hidden md:inline">Importa</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FileArchive className="w-5 h-5 text-primary" />
                        Importa file Primus
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Carica un file Primus (.xpwe, .dcf) o XML per importare le voci del computo.
                      </p>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Formati supportati: .xpwe, .dcf, .xml
                        </p>
                        <Input 
                          ref={fileInputRef}
                          type="file" 
                          accept=".xpwe,.dcf,.xml"
                          onChange={handleFileImport}
                          disabled={isProcessing}
                        />
                      </div>
                      {isProcessing && (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Elaborazione in corso...</span>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="icon" onClick={exportToPrimus} title="Esporta XPWE">
                  <FileDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={exportToDCF} title="Esporta DCF">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={exportToPDF} title="Stampa PDF">
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Computo Tab */}
            <TabsContent value="computo">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cerca voci..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
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
                          <TableHead className="w-20"></TableHead>
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
                  </div>
                  
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cerca nel prezzario (codice, descrizione, categoria)..." 
                      value={preziarioSearch}
                      onChange={(e) => setPreziarioSearch(e.target.value)}
                      className="pl-9"
                    />
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
                        <div className="overflow-x-auto">
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
                  <div className="overflow-x-auto">
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
                  </div>
                  
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
