import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FireExtinguisher,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Shield,
  ClipboardList,
  AlertCircle,
  FileText,
  Search,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addMonths, addYears } from 'date-fns';
import { it } from 'date-fns/locale';
import { ExportButton } from '@/components/workhub/ExportButton';

// Categorie attrezzature obbligatorie per normativa
const CATEGORIE_ATTREZZATURE = [
  { id: 'antincendio', nome: 'Antincendio', icon: FireExtinguisher },
  { id: 'primo_soccorso', nome: 'Primo Soccorso', icon: Package },
  { id: 'emergenza', nome: 'Emergenza', icon: AlertTriangle },
  { id: 'segnaletica', nome: 'Segnaletica', icon: Shield },
];

// Tipi attrezzature con normativa e revisione CORRETTI secondo UNI 9994-1:2013 e normative vigenti
const TIPI_ATTREZZATURE = [
  // Antincendio - D.M. 10/03/1998, D.Lgs 81/2008 art. 46, UNI 9994-1:2013
  // NOTA: UNI 9994-1:2013 prevede: Sorveglianza (trimestrale), Controllo (semestrale), Revisione (varia per tipo), Collaudo (varia)
  { id: 'estintore_polvere', nome: 'Estintore a Polvere', categoria: 'antincendio', revisioneAnni: 3, collaudoAnni: 6, controlloMesi: 6, normativa: 'UNI 9994-1:2013 Tab. 1', obbligatorio: true, note: 'Revisione 36 mesi, Collaudo 72 mesi (12 anni per bombole)' },
  { id: 'estintore_co2', nome: 'Estintore CO2', categoria: 'antincendio', revisioneAnni: 5, collaudoAnni: 10, controlloMesi: 6, normativa: 'UNI 9994-1:2013 Tab. 1', obbligatorio: true, note: 'Revisione 60 mesi, Collaudo 120 mesi' },
  { id: 'estintore_schiuma', nome: 'Estintore a Schiuma', categoria: 'antincendio', revisioneAnni: 1.5, collaudoAnni: 6, controlloMesi: 6, normativa: 'UNI 9994-1:2013 Tab. 1', obbligatorio: true, note: 'Revisione 18 mesi, Collaudo 72 mesi' },
  { id: 'estintore_acqua', nome: 'Estintore ad Acqua', categoria: 'antincendio', revisioneAnni: 2, collaudoAnni: 6, controlloMesi: 6, normativa: 'UNI 9994-1:2013 Tab. 1', obbligatorio: false, note: 'Revisione 24 mesi, Collaudo 72 mesi' },
  { id: 'estintore_idrocarburi', nome: 'Estintore Idrocarburi Alogenati', categoria: 'antincendio', revisioneAnni: 6, collaudoAnni: 6, controlloMesi: 6, normativa: 'UNI 9994-1:2013 Tab. 1', obbligatorio: false, note: 'Revisione 72 mesi, Collaudo 72 mesi' },
  { id: 'idrante', nome: 'Idrante a Muro', categoria: 'antincendio', revisioneAnni: 1, collaudoAnni: 12, controlloMesi: 6, normativa: 'UNI EN 671-3:2009', obbligatorio: false, note: 'Controllo semestrale, Revisione annuale' },
  { id: 'naspo', nome: 'Naspo Antincendio', categoria: 'antincendio', revisioneAnni: 1, collaudoAnni: 12, controlloMesi: 6, normativa: 'UNI EN 671-3:2009', obbligatorio: false, note: 'Controllo semestrale, Revisione annuale' },
  { id: 'coperta_antifiamma', nome: 'Coperta Antifiamma', categoria: 'antincendio', revisioneAnni: 1, collaudoAnni: 0, controlloMesi: 12, normativa: 'UNI EN 1869:2019', obbligatorio: false, note: 'Ispezione annuale, Sostituzione se danneggiata' },
  { id: 'rilevatore_fumo', nome: 'Rilevatore di Fumo', categoria: 'antincendio', revisioneAnni: 1, collaudoAnni: 10, controlloMesi: 6, normativa: 'UNI 9795:2021, UNI 11224:2019', obbligatorio: false, note: 'Manutenzione semestrale, Sostituzione 10 anni' },
  { id: 'centrale_antincendio', nome: 'Centrale Rivelazione Incendi', categoria: 'antincendio', revisioneAnni: 1, collaudoAnni: 0, controlloMesi: 6, normativa: 'UNI EN 54-2, UNI 11224:2019', obbligatorio: false, note: 'Manutenzione semestrale' },
  { id: 'pulsante_emergenza', nome: 'Pulsante Manuale Allarme', categoria: 'antincendio', revisioneAnni: 1, collaudoAnni: 0, controlloMesi: 6, normativa: 'UNI EN 54-11, UNI 11224:2019', obbligatorio: true, note: 'Verifica funzionamento semestrale' },
  
  // Primo Soccorso - D.M. 388/2003, D.Lgs 81/2008 art. 45
  { id: 'cassetta_ps_a', nome: 'Cassetta Primo Soccorso (Cat. A)', categoria: 'primo_soccorso', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 3, normativa: 'D.M. 388/2003 All. 1', obbligatorio: true, note: 'Controllo trimestrale contenuto e scadenze' },
  { id: 'cassetta_ps_b', nome: 'Cassetta Primo Soccorso (Cat. B/C)', categoria: 'primo_soccorso', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 3, normativa: 'D.M. 388/2003 All. 2', obbligatorio: true, note: 'Controllo trimestrale contenuto e scadenze' },
  { id: 'pacchetto_medicazione', nome: 'Pacchetto di Medicazione', categoria: 'primo_soccorso', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 3, normativa: 'D.M. 388/2003 All. 2', obbligatorio: true, note: 'Controllo trimestrale contenuto e scadenze' },
  { id: 'dae', nome: 'DAE (Defibrillatore)', categoria: 'primo_soccorso', revisioneAnni: 0.5, collaudoAnni: 8, controlloMesi: 1, normativa: 'L. 116/2021, D.M. 18/03/2011', obbligatorio: false, note: 'Autotest mensile, Manutenzione semestrale, Piastre 2 anni, Batteria 4-5 anni' },
  { id: 'barella', nome: 'Barella di Emergenza', categoria: 'primo_soccorso', revisioneAnni: 1, collaudoAnni: 0, controlloMesi: 12, normativa: 'D.M. 388/2003', obbligatorio: false, note: 'Ispezione annuale integrità' },
  { id: 'coperta_termica', nome: 'Coperta Termica Isotermica', categoria: 'primo_soccorso', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 12, normativa: 'D.M. 388/2003', obbligatorio: true, note: 'Verifica integrità confezione annuale' },
  
  // Emergenza - D.Lgs 81/2008 art. 43-46
  { id: 'luce_emergenza', nome: 'Apparecchio Illuminazione Emergenza', categoria: 'emergenza', revisioneAnni: 1, collaudoAnni: 0, controlloMesi: 6, normativa: 'UNI EN 1838:2019, UNI 11222:2013', obbligatorio: true, note: 'Test funzionale mensile, Autonomia completa semestrale' },
  { id: 'sirena_allarme', nome: 'Sirena/Pannello Allarme', categoria: 'emergenza', revisioneAnni: 1, collaudoAnni: 0, controlloMesi: 6, normativa: 'UNI EN 54-3', obbligatorio: true, note: 'Verifica funzionamento semestrale' },
  { id: 'megafono', nome: 'Megafono Emergenza', categoria: 'emergenza', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 6, normativa: 'Piano Emergenza Aziendale', obbligatorio: false, note: 'Verifica batterie e funzionamento' },
  { id: 'torcia_emergenza', nome: 'Torcia di Emergenza', categoria: 'emergenza', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 3, normativa: 'Piano Emergenza Aziendale', obbligatorio: true, note: 'Verifica batterie trimestrale' },
  { id: 'uscita_emergenza', nome: 'Maniglione Antipanico', categoria: 'emergenza', revisioneAnni: 1, collaudoAnni: 0, controlloMesi: 6, normativa: 'UNI EN 1125:2008', obbligatorio: true, note: 'Manutenzione semestrale obbligatoria' },
  
  // Segnaletica - D.Lgs 81/2008 Allegato XXV, UNI 7543-1
  { id: 'cartello_uscita', nome: 'Cartello Uscita Emergenza', categoria: 'segnaletica', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 12, normativa: 'D.Lgs 81/2008 All. XXV, UNI EN ISO 7010', obbligatorio: true, note: 'Verifica visibilità e integrità annuale' },
  { id: 'cartello_estintore', nome: 'Cartello Posizione Estintore', categoria: 'segnaletica', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 12, normativa: 'D.Lgs 81/2008 All. XXV, UNI EN ISO 7010', obbligatorio: true, note: 'Verifica visibilità e integrità annuale' },
  { id: 'cartello_ps', nome: 'Cartello Primo Soccorso', categoria: 'segnaletica', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 12, normativa: 'D.Lgs 81/2008 All. XXV, UNI EN ISO 7010', obbligatorio: true, note: 'Verifica visibilità e integrità annuale' },
  { id: 'planimetria', nome: 'Planimetria Emergenza', categoria: 'segnaletica', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 12, normativa: 'D.M. 10/03/1998, UNI ISO 23601:2021', obbligatorio: true, note: 'Aggiornamento ad ogni modifica layout' },
  { id: 'cartello_divieto', nome: 'Cartello Divieto/Pericolo', categoria: 'segnaletica', revisioneAnni: 0, collaudoAnni: 0, controlloMesi: 12, normativa: 'D.Lgs 81/2008 All. XXV, UNI EN ISO 7010', obbligatorio: true, note: 'Verifica visibilità e integrità annuale' },
];

// Contenuto obbligatorio cassetta primo soccorso Cat. A (D.M. 388/2003 All. 1)
const CONTENUTO_CASSETTA_PS_A = [
  { nome: 'Guanti sterili monouso', quantita: 5, unita: 'paia' },
  { nome: 'Visiera paraschizzi', quantita: 1, unita: 'pz' },
  { nome: 'Flacone soluzione cutanea iodopovidone 500ml', quantita: 1, unita: 'pz' },
  { nome: 'Flacone soluzione fisiologica 500ml', quantita: 3, unita: 'pz' },
  { nome: 'Compresse garza sterile 10x10 cm', quantita: 10, unita: 'pz' },
  { nome: 'Compresse garza sterile 18x40 cm', quantita: 2, unita: 'pz' },
  { nome: 'Teli sterili monouso', quantita: 2, unita: 'pz' },
  { nome: 'Pinzette da medicazione sterili monouso', quantita: 2, unita: 'pz' },
  { nome: 'Confezione cotone idrofilo', quantita: 1, unita: 'pz' },
  { nome: 'Confezione cerotti varie misure', quantita: 2, unita: 'pz' },
  { nome: 'Rotoli benda orlata 10cm', quantita: 2, unita: 'pz' },
  { nome: 'Rotolo cerotto alto 2,5cm', quantita: 1, unita: 'pz' },
  { nome: 'Forbici', quantita: 1, unita: 'pz' },
  { nome: 'Lacci emostatici', quantita: 3, unita: 'pz' },
  { nome: 'Ghiaccio pronto uso', quantita: 2, unita: 'pz' },
  { nome: 'Sacchetti monouso per rifiuti sanitari', quantita: 2, unita: 'pz' },
  { nome: 'Termometro', quantita: 1, unita: 'pz' },
  { nome: 'Apparecchio per misurazione pressione arteriosa', quantita: 1, unita: 'pz' },
];

// Contenuto pacchetto medicazione (D.M. 388/2003 All. 2)
const CONTENUTO_PACCHETTO_MEDICAZIONE = [
  { nome: 'Guanti sterili monouso', quantita: 2, unita: 'paia' },
  { nome: 'Flacone soluzione cutanea iodopovidone 125ml', quantita: 1, unita: 'pz' },
  { nome: 'Flacone soluzione fisiologica 250ml', quantita: 1, unita: 'pz' },
  { nome: 'Compresse garza sterile 10x10 cm', quantita: 3, unita: 'pz' },
  { nome: 'Compresse garza sterile 18x40 cm', quantita: 1, unita: 'pz' },
  { nome: 'Pinzette da medicazione sterili monouso', quantita: 1, unita: 'pz' },
  { nome: 'Confezione cotone idrofilo', quantita: 1, unita: 'pz' },
  { nome: 'Confezione cerotti varie misure', quantita: 1, unita: 'pz' },
  { nome: 'Rotolo benda orlata 10cm', quantita: 1, unita: 'pz' },
  { nome: 'Rotolo cerotto alto 2,5cm', quantita: 1, unita: 'pz' },
  { nome: 'Forbici', quantita: 1, unita: 'pz' },
  { nome: 'Laccio emostatico', quantita: 1, unita: 'pz' },
  { nome: 'Ghiaccio pronto uso', quantita: 1, unita: 'pz' },
  { nome: 'Sacchetti monouso per rifiuti sanitari', quantita: 1, unita: 'pz' },
];

interface AttrezzaturaInventario {
  id: string;
  tipo: string;
  categoria: string;
  codiceInterno: string;
  marca?: string;
  modello?: string;
  numeroSerie?: string;
  ubicazione: string;
  dataInstallazione: string;
  dataUltimoControllo?: string;
  dataUltimaRevisione?: string;
  dataProssimoControllo?: string;
  dataProssimaRevisione?: string;
  stato: 'conforme' | 'da_controllare' | 'da_revisionare' | 'non_conforme' | 'scaduto';
  note?: string;
  contenuto?: ContenutoItem[];
  allegati?: string[];
}

interface ContenutoItem {
  id: string;
  nome: string;
  quantitaObbligatoria: number;
  quantitaPresente: number;
  unita: string;
  dataScadenza?: string;
  daReintegrare: boolean;
}

interface ControlloAttrezzatura {
  id: string;
  attrezzaturaId: string;
  tipo: 'controllo' | 'revisione' | 'manutenzione';
  data: string;
  esecutore: string;
  esito: 'conforme' | 'non_conforme' | 'con_riserve';
  note?: string;
  azioniCorrettive?: string;
  allegatoUrl?: string;
}

export function SafetyEquipmentInventory() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('tutti');
  const [filterStato, setFilterStato] = useState('tutti');
  
  // Inventario attrezzature con persistenza
  const [inventario, setInventario] = useState<AttrezzaturaInventario[]>(() => {
    const saved = localStorage.getItem('safety_equipment_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Storico controlli
  const [controlli, setControlli] = useState<ControlloAttrezzatura[]>(() => {
    const saved = localStorage.getItem('safety_equipment_controls');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('safety_equipment_inventory', JSON.stringify(inventario));
  }, [inventario]);

  useEffect(() => {
    localStorage.setItem('safety_equipment_controls', JSON.stringify(controlli));
  }, [controlli]);

  // Dialog states
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showControlloDialog, setShowControlloDialog] = useState(false);
  const [showContenutoDialog, setShowContenutoDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AttrezzaturaInventario | null>(null);
  const [selectedItem, setSelectedItem] = useState<AttrezzaturaInventario | null>(null);

  const [formData, setFormData] = useState({
    tipo: '',
    codiceInterno: '',
    marca: '',
    modello: '',
    numeroSerie: '',
    ubicazione: '',
    dataInstallazione: new Date().toISOString().split('T')[0],
    note: ''
  });

  const [controlloData, setControlloData] = useState({
    tipo: 'controllo' as 'controllo' | 'revisione' | 'manutenzione',
    data: new Date().toISOString().split('T')[0],
    esecutore: '',
    esito: 'conforme' as 'conforme' | 'non_conforme' | 'con_riserve',
    note: '',
    azioniCorrettive: ''
  });

  // Calcola stato attrezzatura
  const calcolaStato = (item: AttrezzaturaInventario): AttrezzaturaInventario['stato'] => {
    const oggi = new Date();
    
    if (item.dataProssimaRevisione) {
      const giorni = differenceInDays(new Date(item.dataProssimaRevisione), oggi);
      if (giorni < 0) return 'scaduto';
      if (giorni <= 30) return 'da_revisionare';
    }
    
    if (item.dataProssimoControllo) {
      const giorni = differenceInDays(new Date(item.dataProssimoControllo), oggi);
      if (giorni < 0) return 'non_conforme';
      if (giorni <= 15) return 'da_controllare';
    }

    // Verifica contenuto cassetta PS
    if (item.contenuto?.some(c => c.daReintegrare)) {
      return 'da_controllare';
    }
    
    return 'conforme';
  };

  // Aggiorna stati
  const inventarioConStato = useMemo(() => {
    return inventario.map(item => ({
      ...item,
      stato: calcolaStato(item)
    }));
  }, [inventario]);

  // Stats
  const stats = useMemo(() => {
    return {
      totale: inventarioConStato.length,
      conforme: inventarioConStato.filter(i => i.stato === 'conforme').length,
      daControllare: inventarioConStato.filter(i => i.stato === 'da_controllare').length,
      daRevisionare: inventarioConStato.filter(i => i.stato === 'da_revisionare').length,
      nonConforme: inventarioConStato.filter(i => i.stato === 'non_conforme' || i.stato === 'scaduto').length,
      estintori: inventarioConStato.filter(i => i.tipo.includes('estintore')).length,
      cassette: inventarioConStato.filter(i => i.tipo.includes('cassetta') || i.tipo.includes('pacchetto')).length
    };
  }, [inventarioConStato]);

  // Alert items
  const alertItems = useMemo(() => {
    return inventarioConStato.filter(i => 
      i.stato !== 'conforme'
    ).sort((a, b) => {
      const priority = { scaduto: 0, non_conforme: 1, da_revisionare: 2, da_controllare: 3, conforme: 4 };
      return priority[a.stato] - priority[b.stato];
    });
  }, [inventarioConStato]);

  // Filtro
  const filteredItems = useMemo(() => {
    return inventarioConStato.filter(item => {
      const matchSearch = item.codiceInterno.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.ubicazione.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         TIPI_ATTREZZATURE.find(t => t.id === item.tipo)?.nome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategoria = filterCategoria === 'tutti' || item.categoria === filterCategoria;
      const matchStato = filterStato === 'tutti' || item.stato === filterStato;
      return matchSearch && matchCategoria && matchStato;
    });
  }, [inventarioConStato, searchQuery, filterCategoria, filterStato]);

  const getTipoInfo = (tipoId: string) => TIPI_ATTREZZATURE.find(t => t.id === tipoId);
  const getCategoriaInfo = (catId: string) => CATEGORIE_ATTREZZATURE.find(c => c.id === catId);

  const getStatoBadge = (stato: AttrezzaturaInventario['stato']) => {
    switch (stato) {
      case 'conforme':
        return <Badge className="bg-emerald-500/15 text-emerald-500 gap-1"><CheckCircle className="w-3 h-3" />Conforme</Badge>;
      case 'da_controllare':
        return <Badge className="bg-amber-500/15 text-amber-500 gap-1"><Clock className="w-3 h-3" />Da Controllare</Badge>;
      case 'da_revisionare':
        return <Badge className="bg-orange-500/15 text-orange-500 gap-1"><AlertCircle className="w-3 h-3" />Da Revisionare</Badge>;
      case 'non_conforme':
        return <Badge className="bg-red-500/15 text-red-500 gap-1"><AlertTriangle className="w-3 h-3" />Non Conforme</Badge>;
      case 'scaduto':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Scaduto</Badge>;
    }
  };

  const handleSave = () => {
    if (!formData.tipo || !formData.ubicazione || !formData.codiceInterno) {
      toast({ title: 'Errore', description: 'Compila i campi obbligatori', variant: 'destructive' });
      return;
    }

    const tipoInfo = getTipoInfo(formData.tipo);
    const dataInstallazione = new Date(formData.dataInstallazione);
    
    // Calcola prossime scadenze
    const prossimoControllo = tipoInfo ? addMonths(dataInstallazione, tipoInfo.controlloMesi) : null;
    const prossimaRevisione = tipoInfo && tipoInfo.revisioneAnni > 0 
      ? addMonths(dataInstallazione, tipoInfo.revisioneAnni * 12) 
      : null;

    // Prepara contenuto se cassetta PS
    let contenuto: ContenutoItem[] | undefined;
    if (formData.tipo === 'cassetta_ps_a') {
      contenuto = CONTENUTO_CASSETTA_PS_A.map((c, idx) => ({
        id: `c-${idx}`,
        nome: c.nome,
        quantitaObbligatoria: c.quantita,
        quantitaPresente: c.quantita,
        unita: c.unita,
        daReintegrare: false
      }));
    } else if (formData.tipo === 'cassetta_ps_b' || formData.tipo === 'pacchetto_medicazione') {
      contenuto = CONTENUTO_PACCHETTO_MEDICAZIONE.map((c, idx) => ({
        id: `c-${idx}`,
        nome: c.nome,
        quantitaObbligatoria: c.quantita,
        quantitaPresente: c.quantita,
        unita: c.unita,
        daReintegrare: false
      }));
    }

    const newItem: AttrezzaturaInventario = {
      id: editingItem?.id || crypto.randomUUID(),
      tipo: formData.tipo,
      categoria: tipoInfo?.categoria || 'altro',
      codiceInterno: formData.codiceInterno,
      marca: formData.marca || undefined,
      modello: formData.modello || undefined,
      numeroSerie: formData.numeroSerie || undefined,
      ubicazione: formData.ubicazione,
      dataInstallazione: formData.dataInstallazione,
      dataUltimoControllo: formData.dataInstallazione,
      dataUltimaRevisione: formData.dataInstallazione,
      dataProssimoControllo: prossimoControllo?.toISOString().split('T')[0],
      dataProssimaRevisione: prossimaRevisione?.toISOString().split('T')[0],
      stato: 'conforme',
      note: formData.note || undefined,
      contenuto
    };

    if (editingItem) {
      setInventario(prev => prev.map(i => i.id === editingItem.id ? { ...newItem, contenuto: i.contenuto } : i));
      toast({ title: 'Attrezzatura aggiornata' });
    } else {
      setInventario(prev => [...prev, newItem]);
      toast({ title: 'Attrezzatura aggiunta' });
    }

    resetForm();
    setShowNewDialog(false);
  };

  const handleDelete = (id: string) => {
    setInventario(prev => prev.filter(i => i.id !== id));
    setControlli(prev => prev.filter(c => c.attrezzaturaId !== id));
    toast({ title: 'Attrezzatura eliminata' });
  };

  const handleSaveControllo = () => {
    if (!selectedItem || !controlloData.esecutore) {
      toast({ title: 'Errore', description: 'Compila tutti i campi', variant: 'destructive' });
      return;
    }

    const controllo: ControlloAttrezzatura = {
      id: crypto.randomUUID(),
      attrezzaturaId: selectedItem.id,
      ...controlloData
    };

    setControlli(prev => [...prev, controllo]);

    // Aggiorna date attrezzatura
    const tipoInfo = getTipoInfo(selectedItem.tipo);
    const dataControllo = new Date(controlloData.data);
    
    setInventario(prev => prev.map(item => {
      if (item.id !== selectedItem.id) return item;
      
      const updates: Partial<AttrezzaturaInventario> = {};
      
      if (controlloData.tipo === 'controllo') {
        updates.dataUltimoControllo = controlloData.data;
        if (tipoInfo) {
          updates.dataProssimoControllo = addMonths(dataControllo, tipoInfo.controlloMesi).toISOString().split('T')[0];
        }
      } else if (controlloData.tipo === 'revisione') {
        updates.dataUltimaRevisione = controlloData.data;
        if (tipoInfo && tipoInfo.revisioneAnni > 0) {
          updates.dataProssimaRevisione = addMonths(dataControllo, tipoInfo.revisioneAnni * 12).toISOString().split('T')[0];
        }
      }
      
      return { ...item, ...updates };
    }));

    toast({ title: `${controlloData.tipo.charAt(0).toUpperCase() + controlloData.tipo.slice(1)} registrato` });
    setShowControlloDialog(false);
    setControlloData({
      tipo: 'controllo',
      data: new Date().toISOString().split('T')[0],
      esecutore: '',
      esito: 'conforme',
      note: '',
      azioniCorrettive: ''
    });
  };

  const handleUpdateContenuto = (itemId: string, contenutoId: string, quantita: number) => {
    setInventario(prev => prev.map(item => {
      if (item.id !== itemId || !item.contenuto) return item;
      
      return {
        ...item,
        contenuto: item.contenuto.map(c => {
          if (c.id !== contenutoId) return c;
          return {
            ...c,
            quantitaPresente: quantita,
            daReintegrare: quantita < c.quantitaObbligatoria
          };
        })
      };
    }));
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      codiceInterno: '',
      marca: '',
      modello: '',
      numeroSerie: '',
      ubicazione: '',
      dataInstallazione: new Date().toISOString().split('T')[0],
      note: ''
    });
    setEditingItem(null);
  };

  const openEdit = (item: AttrezzaturaInventario) => {
    setEditingItem(item);
    setFormData({
      tipo: item.tipo,
      codiceInterno: item.codiceInterno,
      marca: item.marca || '',
      modello: item.modello || '',
      numeroSerie: item.numeroSerie || '',
      ubicazione: item.ubicazione,
      dataInstallazione: item.dataInstallazione,
      note: item.note || ''
    });
    setShowNewDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FireExtinguisher className="w-5 h-5 text-primary" />
            Inventario Attrezzature Obbligatorie
          </h2>
          <p className="text-sm text-muted-foreground">
            Estintori, Cassette PS, DAE e attrezzature per emergenza secondo normativa EU
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredItems.map(i => ({
              codice: i.codiceInterno,
              tipo: getTipoInfo(i.tipo)?.nome || i.tipo,
              ubicazione: i.ubicazione,
              stato: i.stato,
              prossimoControllo: i.dataProssimoControllo || '-',
              prossimaRevisione: i.dataProssimaRevisione || '-'
            }))}
            filename="inventario-attrezzature-sicurezza"
            columns={[
              { key: 'codice', label: 'Codice' },
              { key: 'tipo', label: 'Tipo' },
              { key: 'ubicazione', label: 'Ubicazione' },
              { key: 'stato', label: 'Stato' },
              { key: 'prossimoControllo', label: 'Prossimo Controllo' },
              { key: 'prossimaRevisione', label: 'Prossima Revisione' }
            ]}
          />
          <Button onClick={() => { resetForm(); setShowNewDialog(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuova Attrezzatura
          </Button>
        </div>
      </div>

      {/* Alert Items */}
      {alertItems.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              Attrezzature che richiedono attenzione ({alertItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {alertItems.slice(0, 6).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-background border">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.codiceInterno}</span>
                    <span className="text-xs text-muted-foreground">{item.ubicazione}</span>
                  </div>
                  {getStatoBadge(item.stato)}
                </div>
              ))}
            </div>
            {alertItems.length > 6 && (
              <p className="text-xs text-muted-foreground mt-2">+{alertItems.length - 6} altre attrezzature</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Totale</span>
          </div>
          <p className="text-xl font-bold">{stats.totale}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Conformi</span>
          </div>
          <p className="text-xl font-bold text-emerald-500">{stats.conforme}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Da Controllare</span>
          </div>
          <p className="text-xl font-bold text-amber-500">{stats.daControllare}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Da Revisionare</span>
          </div>
          <p className="text-xl font-bold text-orange-500">{stats.daRevisionare}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Non Conformi</span>
          </div>
          <p className="text-xl font-bold text-red-500">{stats.nonConforme}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <FireExtinguisher className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Estintori</span>
          </div>
          <p className="text-xl font-bold">{stats.estintori}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Cassette PS</span>
          </div>
          <p className="text-xl font-bold">{stats.cassette}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per codice, ubicazione..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutti">Tutte le categorie</SelectItem>
            {CATEGORIE_ATTREZZATURE.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStato} onValueChange={setFilterStato}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutti">Tutti gli stati</SelectItem>
            <SelectItem value="conforme">Conforme</SelectItem>
            <SelectItem value="da_controllare">Da controllare</SelectItem>
            <SelectItem value="da_revisionare">Da revisionare</SelectItem>
            <SelectItem value="non_conforme">Non conforme</SelectItem>
            <SelectItem value="scaduto">Scaduto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ubicazione</TableHead>
                <TableHead>Ultimo Controllo</TableHead>
                <TableHead>Prossimo Controllo</TableHead>
                <TableHead>Prossima Revisione</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nessuna attrezzatura trovata. Aggiungi la prima attrezzatura.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => {
                  const tipoInfo = getTipoInfo(item.tipo);
                  const CatIcon = getCategoriaInfo(item.categoria)?.icon || Package;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.codiceInterno}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CatIcon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{tipoInfo?.nome || item.tipo}</p>
                            <p className="text-xs text-muted-foreground">{tipoInfo?.normativa}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.ubicazione}</TableCell>
                      <TableCell>
                        {item.dataUltimoControllo 
                          ? format(new Date(item.dataUltimoControllo), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {item.dataProssimoControllo 
                          ? format(new Date(item.dataProssimoControllo), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {item.dataProssimaRevisione 
                          ? format(new Date(item.dataProssimaRevisione), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatoBadge(item.stato)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {(item.tipo.includes('cassetta') || item.tipo.includes('pacchetto')) && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Verifica Contenuto"
                              onClick={() => { setSelectedItem(item); setShowContenutoDialog(true); }}
                            >
                              <ClipboardList className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Registra Controllo/Revisione"
                            onClick={() => { setSelectedItem(item); setShowControlloDialog(true); }}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* New/Edit Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifica Attrezzatura' : 'Nuova Attrezzatura Obbligatoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Tipo Attrezzatura *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, tipo: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIE_ATTREZZATURE.map(cat => (
                    <React.Fragment key={cat.id}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                        {cat.nome}
                      </div>
                      {TIPI_ATTREZZATURE.filter(t => t.categoria === cat.id).map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex flex-col">
                            <span>{tipo.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {tipo.normativa} - Revisione: {tipo.revisioneAnni > 0 ? `${tipo.revisioneAnni * 12} mesi` : 'N/A'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Codice Interno *</Label>
              <Input 
                value={formData.codiceInterno}
                onChange={(e) => setFormData(prev => ({ ...prev, codiceInterno: e.target.value }))}
                placeholder="es. EST-001"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Ubicazione *</Label>
              <Input 
                value={formData.ubicazione}
                onChange={(e) => setFormData(prev => ({ ...prev, ubicazione: e.target.value }))}
                placeholder="es. Ingresso principale, Piano 1"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input 
                value={formData.marca}
                onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Modello</Label>
              <Input 
                value={formData.modello}
                onChange={(e) => setFormData(prev => ({ ...prev, modello: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Numero Serie</Label>
              <Input 
                value={formData.numeroSerie}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroSerie: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data Installazione/Acquisto *</Label>
              <Input 
                type="date"
                value={formData.dataInstallazione}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInstallazione: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>Note</Label>
              <Textarea 
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annulla</Button>
            <Button onClick={handleSave}>{editingItem ? 'Salva Modifiche' : 'Aggiungi'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Controllo/Revisione Dialog */}
      <Dialog open={showControlloDialog} onOpenChange={setShowControlloDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Registra Controllo/Revisione - {selectedItem?.codiceInterno}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo Intervento</Label>
              <Select 
                value={controlloData.tipo} 
                onValueChange={(v: any) => setControlloData(prev => ({ ...prev, tipo: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="controllo">Controllo Periodico</SelectItem>
                  <SelectItem value="revisione">Revisione</SelectItem>
                  <SelectItem value="manutenzione">Manutenzione Straordinaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data</Label>
              <Input 
                type="date"
                value={controlloData.data}
                onChange={(e) => setControlloData(prev => ({ ...prev, data: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Esecutore / Ditta *</Label>
              <Input 
                value={controlloData.esecutore}
                onChange={(e) => setControlloData(prev => ({ ...prev, esecutore: e.target.value }))}
                placeholder="Nome tecnico o ditta"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Esito</Label>
              <Select 
                value={controlloData.esito} 
                onValueChange={(v: any) => setControlloData(prev => ({ ...prev, esito: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conforme">Conforme</SelectItem>
                  <SelectItem value="con_riserve">Conforme con Riserve</SelectItem>
                  <SelectItem value="non_conforme">Non Conforme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea 
                value={controlloData.note}
                onChange={(e) => setControlloData(prev => ({ ...prev, note: e.target.value }))}
                rows={2}
              />
            </div>
            
            {controlloData.esito !== 'conforme' && (
              <div className="space-y-2">
                <Label>Azioni Correttive</Label>
                <Textarea 
                  value={controlloData.azioniCorrettive}
                  onChange={(e) => setControlloData(prev => ({ ...prev, azioniCorrettive: e.target.value }))}
                  rows={2}
                  placeholder="Descrivi le azioni correttive da intraprendere"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowControlloDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveControllo}>Registra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contenuto Cassetta Dialog */}
      <Dialog open={showContenutoDialog} onOpenChange={setShowContenutoDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Verifica Contenuto - {selectedItem?.codiceInterno}
            </DialogTitle>
          </DialogHeader>
          {selectedItem?.contenuto && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium">Contenuto obbligatorio secondo D.M. 388/2003</p>
                <p className="text-muted-foreground">
                  Aggiorna le quantità presenti. Gli articoli mancanti saranno segnalati per il reintegro.
                </p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Articolo</TableHead>
                    <TableHead className="text-center">Obbligatorio</TableHead>
                    <TableHead className="text-center">Presente</TableHead>
                    <TableHead>Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItem.contenuto.map(item => (
                    <TableRow key={item.id} className={cn(item.daReintegrare && 'bg-red-500/5')}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="text-center">
                        {item.quantitaObbligatoria} {item.unita}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input 
                          type="number"
                          min={0}
                          value={item.quantitaPresente}
                          onChange={(e) => handleUpdateContenuto(selectedItem.id, item.id, parseInt(e.target.value) || 0)}
                          className="w-20 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell>
                        {item.daReintegrare ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Da reintegrare
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-500 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {selectedItem.contenuto.some(c => c.daReintegrare) && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Articoli da reintegrare:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {selectedItem.contenuto.filter(c => c.daReintegrare).map(c => (
                      <li key={c.id}>
                        • {c.nome}: mancano {c.quantitaObbligatoria - c.quantitaPresente} {c.unita}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowContenutoDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SafetyEquipmentInventory;
