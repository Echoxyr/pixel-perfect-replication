import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { format, addDays, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Truck,
  Wrench,
  HardHat,
  Plus,
  Calendar,
  Check,
  X,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Fuel,
  Gauge,
  PenTool,
  Upload,
  Download,
  Eye,
  Trash2,
  Clock,
  Car,
  Circle,
  RotateCcw,
  AlertTriangle,
  Edit,
  MapPin,
  Zap
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { Switch } from '@/components/ui/switch';

interface Risorsa {
  id: string;
  nome: string;
  tipo: 'mezzo' | 'attrezzatura' | 'macchinario';
  descrizione: string | null;
  stato: 'disponibile' | 'in_uso' | 'manutenzione' | 'guasto';
  targa: string | null;
  matricola: string | null;
  created_at: string;
}

interface Prenotazione {
  id: string;
  risorsa_id: string;
  cantiere_id: string | null;
  cantiere_nome: string | null;
  data_inizio: string;
  data_fine: string;
  note: string | null;
  stato: 'richiesta' | 'confermata' | 'annullata';
  created_at: string;
}

interface DocumentoRisorsa {
  id: string;
  risorsa_id: string;
  tipo: string;
  titolo: string;
  data_emissione: string | null;
  data_scadenza: string | null;
  allegato_url: string | null;
  note: string | null;
  stato: string;
  created_at: string;
}

interface AttivitaRisorsa {
  id: string;
  risorsa_id: string;
  data: string;
  tipo_attivita: string;
  cantiere_id: string | null;
  cantiere_nome: string | null;
  km_iniziali: number | null;
  km_finali: number | null;
  km_percorsi: number | null;
  litri_carburante: number | null;
  costo: number | null;
  ore_utilizzo: number | null;
  eseguito_da: string | null;
  descrizione: string | null;
  note: string | null;
  created_at: string;
}

interface ManutenzioneRisorsa {
  id: string;
  risorsa_id: string;
  tipo: string;
  descrizione: string;
  data_programmata: string | null;
  data_esecuzione: string | null;
  km_programmati: number | null;
  km_esecuzione: number | null;
  costo: number | null;
  eseguito_da: string | null;
  officina: string | null;
  stato: string;
  allegati: string[];
  note: string | null;
  created_at: string;
}

interface Segnalazione {
  id: string;
  risorsa_id: string;
  tipo: 'guasto' | 'danno' | 'anomalia' | 'furto' | 'incidente';
  descrizione: string;
  urgenza: 'bassa' | 'media' | 'alta' | 'critica';
  data: string;
  segnalato_da: string;
  stato: 'aperta' | 'in_lavorazione' | 'risolta' | 'chiusa';
  note: string | null;
}

export default function Risorse() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cantieri } = useWorkHub();
  
  const [activeTab, setActiveTab] = useState('risorse');
  const [showNewRisorsa, setShowNewRisorsa] = useState(false);
  const [showNewPrenotazione, setShowNewPrenotazione] = useState(false);
  const [showNewDocumento, setShowNewDocumento] = useState(false);
  const [showNewAttivita, setShowNewAttivita] = useState(false);
  const [showNewManutenzione, setShowNewManutenzione] = useState(false);
  const [showNewSegnalazione, setShowNewSegnalazione] = useState(false);
  const [showEditRisorsa, setShowEditRisorsa] = useState(false);
  const [editingRisorsa, setEditingRisorsa] = useState<Risorsa | null>(null);
  const [selectedRisorsa, setSelectedRisorsa] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterTipo, setFilterTipo] = useState<string>('tutti');
  
  const [newRisorsa, setNewRisorsa] = useState({
    nome: '',
    tipo: 'mezzo' as Risorsa['tipo'],
    descrizione: '',
    targa: '',
    matricola: '',
  });

  const [newPrenotazione, setNewPrenotazione] = useState({
    risorsa_id: '',
    cantiere_id: '',
    data_inizio: format(new Date(), 'yyyy-MM-dd'),
    data_fine: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    note: '',
  });

  const [newDocumento, setNewDocumento] = useState({
    risorsa_id: '',
    tipo: 'assicurazione',
    titolo: '',
    data_emissione: '',
    data_scadenza: '',
    note: '',
  });

  const [newAttivita, setNewAttivita] = useState({
    risorsa_id: '',
    tipo_attivita: 'km',
    data: format(new Date(), 'yyyy-MM-dd'),
    cantiere_id: '',
    km_iniziali: '',
    km_finali: '',
    litri_carburante: '',
    costo: '',
    ore_utilizzo: '',
    eseguito_da: '',
    descrizione: '',
    note: '',
  });

  const [newManutenzione, setNewManutenzione] = useState({
    risorsa_id: '',
    tipo: 'ordinaria',
    descrizione: '',
    data_programmata: '',
    km_programmati: '',
    officina: '',
    costo_stimato: '',
    note: '',
  });

  const [newSegnalazione, setNewSegnalazione] = useState({
    risorsa_id: '',
    tipo: 'guasto' as Segnalazione['tipo'],
    descrizione: '',
    urgenza: 'media' as Segnalazione['urgenza'],
    segnalato_da: '',
  });

  // Fetch risorse
  const { data: risorse = [], isLoading: loadingRisorse } = useQuery({
    queryKey: ['risorse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risorse')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Risorsa[];
    },
  });

  // Fetch prenotazioni
  const { data: prenotazioni = [] } = useQuery({
    queryKey: ['prenotazioni_risorse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prenotazioni_risorse')
        .select('*')
        .neq('stato', 'annullata')
        .order('data_inizio');
      if (error) throw error;
      return data as Prenotazione[];
    },
  });

  // Fetch documenti
  const { data: documenti = [] } = useQuery({
    queryKey: ['documenti_risorse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documenti_risorse')
        .select('*')
        .order('data_scadenza');
      if (error) throw error;
      return data as DocumentoRisorsa[];
    },
  });

  // Fetch attività
  const { data: attivita = [] } = useQuery({
    queryKey: ['attivita_risorse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attivita_risorse')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as AttivitaRisorsa[];
    },
  });

  // Fetch manutenzioni
  const { data: manutenzioni = [] } = useQuery({
    queryKey: ['manutenzioni_risorse'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manutenzioni_risorse')
        .select('*')
        .order('data_programmata');
      if (error) throw error;
      return data as ManutenzioneRisorsa[];
    },
  });

  // Create risorsa
  const createRisorsaMutation = useMutation({
    mutationFn: async (risorsa: any) => {
      const { error } = await supabase.from('risorse').insert([risorsa]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risorse'] });
      setShowNewRisorsa(false);
      setNewRisorsa({ nome: '', tipo: 'mezzo', descrizione: '', targa: '', matricola: '' });
      toast({ title: 'Risorsa creata' });
    },
  });

  // Create prenotazione
  const createPrenotazioneMutation = useMutation({
    mutationFn: async (prenotazione: any) => {
      const { error } = await supabase.from('prenotazioni_risorse').insert([prenotazione]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prenotazioni_risorse'] });
      setShowNewPrenotazione(false);
      toast({ title: 'Prenotazione creata' });
    },
  });

  // Create documento
  const createDocumentoMutation = useMutation({
    mutationFn: async (doc: any) => {
      const { error } = await supabase.from('documenti_risorse').insert([doc]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documenti_risorse'] });
      setShowNewDocumento(false);
      setNewDocumento({ risorsa_id: '', tipo: 'assicurazione', titolo: '', data_emissione: '', data_scadenza: '', note: '' });
      toast({ title: 'Documento aggiunto' });
    },
  });

  // Create attività
  const createAttivitaMutation = useMutation({
    mutationFn: async (att: any) => {
      const { error } = await supabase.from('attivita_risorse').insert([att]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attivita_risorse'] });
      setShowNewAttivita(false);
      toast({ title: 'Attività registrata' });
    },
  });

  // Create manutenzione
  const createManutenzioneMutation = useMutation({
    mutationFn: async (man: any) => {
      const { error } = await supabase.from('manutenzioni_risorse').insert([man]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutenzioni_risorse'] });
      setShowNewManutenzione(false);
      setNewManutenzione({ risorsa_id: '', tipo: 'ordinaria', descrizione: '', data_programmata: '', km_programmati: '', officina: '', costo_stimato: '', note: '' });
      toast({ title: 'Manutenzione programmata' });
    },
  });

  // Update risorsa stato
  const updateRisorsaStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const { error } = await supabase.from('risorse').update({ stato }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risorse'] });
      toast({ title: 'Stato aggiornato' });
    },
  });

  // Update risorsa 
  const updateRisorsaMutation = useMutation({
    mutationFn: async (risorsa: Partial<Risorsa> & { id: string }) => {
      const { id, ...updates } = risorsa;
      const { error } = await supabase.from('risorse').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risorse'] });
      setShowEditRisorsa(false);
      setEditingRisorsa(null);
      toast({ title: 'Risorsa aggiornata' });
    },
  });

  // Delete risorsa
  const deleteRisorsaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('risorse').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risorse'] });
      toast({ title: 'Risorsa eliminata' });
    },
  });

  // Delete prenotazione
  const deletePrenotazioneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prenotazioni_risorse').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prenotazioni_risorse'] });
      toast({ title: 'Prenotazione annullata' });
    },
  });

  // Delete documento
  const deleteDocumentoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documenti_risorse').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documenti_risorse'] });
      toast({ title: 'Documento eliminato' });
    },
  });

  // Complete manutenzione
  const completeManutenzioneeMutation = useMutation({
    mutationFn: async ({ id, costo, km_esecuzione }: { id: string; costo?: number; km_esecuzione?: number }) => {
      const { error } = await supabase.from('manutenzioni_risorse').update({ 
        stato: 'completata', 
        data_esecuzione: format(new Date(), 'yyyy-MM-dd'),
        costo,
        km_esecuzione 
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutenzioni_risorse'] });
      toast({ title: 'Manutenzione completata' });
    },
  });

  // Genera giorni della settimana
  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = addDays(today, weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  };

  const weekDays = getWeekDays();

  // Controlla se una risorsa è prenotata in un giorno
  const isBooked = (risorsaId: string, date: Date) => {
    return prenotazioni.find(p => 
      p.risorsa_id === risorsaId &&
      isWithinInterval(date, {
        start: parseISO(p.data_inizio),
        end: parseISO(p.data_fine)
      })
    );
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'mezzo': return <Truck className="w-5 h-5" />;
      case 'attrezzatura': return <Wrench className="w-5 h-5" />;
      case 'macchinario': return <HardHat className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'disponibile': return <Badge className="bg-emerald-500/15 text-emerald-500 border-0">Disponibile</Badge>;
      case 'in_uso': return <Badge className="bg-primary/15 text-primary border-0">In uso</Badge>;
      case 'manutenzione': return <Badge className="bg-amber-500/15 text-amber-500 border-0">Manutenzione</Badge>;
      case 'guasto': return <Badge className="bg-red-500/15 text-red-500 border-0">Guasto</Badge>;
      default: return <Badge variant="secondary">{stato}</Badge>;
    }
  };

  const getDocumentoStatoBadge = (doc: DocumentoRisorsa) => {
    if (!doc.data_scadenza) return <Badge variant="secondary">N/D</Badge>;
    const days = differenceInDays(parseISO(doc.data_scadenza), new Date());
    if (days < 0) return <Badge className="bg-red-500/15 text-red-500 border-0">Scaduto</Badge>;
    if (days <= 30) return <Badge className="bg-amber-500/15 text-amber-500 border-0">In scadenza</Badge>;
    return <Badge className="bg-emerald-500/15 text-emerald-500 border-0">Valido</Badge>;
  };

  // Stats
  const documentiScaduti = documenti.filter(d => d.data_scadenza && differenceInDays(parseISO(d.data_scadenza), new Date()) < 0).length;
  const documentiInScadenza = documenti.filter(d => d.data_scadenza && differenceInDays(parseISO(d.data_scadenza), new Date()) <= 30 && differenceInDays(parseISO(d.data_scadenza), new Date()) >= 0).length;
  const manutenzioniProgrammate = manutenzioni.filter(m => m.stato === 'programmata').length;
  const kmTotali = attivita.reduce((sum, a) => sum + (a.km_percorsi || 0), 0);
  const litriTotali = attivita.reduce((sum, a) => sum + (a.litri_carburante || 0), 0);
  const costiTotali = attivita.reduce((sum, a) => sum + (a.costo || 0), 0) + manutenzioni.reduce((sum, m) => sum + (m.costo || 0), 0);
  const revisioniScadute = documenti.filter(d => d.tipo === 'revisione' && d.data_scadenza && differenceInDays(parseISO(d.data_scadenza), new Date()) < 0).length;

  const getRisorsaNome = (id: string) => risorse.find(r => r.id === id)?.nome || 'N/D';

  // Filter risorse
  const filteredRisorse = risorse.filter(r => filterTipo === 'tutti' || r.tipo === filterTipo);

  const exportToExcel = () => {
    const data = attivita.map(a => ({
      'Data': format(parseISO(a.data), 'dd/MM/yyyy'),
      'Risorsa': getRisorsaNome(a.risorsa_id),
      'Tipo': a.tipo_attivita,
      'Cantiere': a.cantiere_nome || '-',
      'Km Percorsi': a.km_percorsi || 0,
      'Litri Carb.': a.litri_carburante || 0,
      'Costo': a.costo || 0,
      'Ore Utilizzo': a.ore_utilizzo || 0,
      'Eseguito Da': a.eseguito_da || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attività Risorse');
    XLSX.writeFile(wb, `attivita_risorse_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast({ title: 'Report esportato' });
  };

  const exportManutenzioniExcel = () => {
    const data = manutenzioni.map(m => ({
      'Risorsa': getRisorsaNome(m.risorsa_id),
      'Tipo': m.tipo,
      'Descrizione': m.descrizione,
      'Data Progr.': m.data_programmata ? format(parseISO(m.data_programmata), 'dd/MM/yyyy') : '-',
      'Data Esec.': m.data_esecuzione ? format(parseISO(m.data_esecuzione), 'dd/MM/yyyy') : '-',
      'Km Progr.': m.km_programmati || '-',
      'Km Esec.': m.km_esecuzione || '-',
      'Costo €': m.costo || 0,
      'Officina': m.officina || '-',
      'Stato': m.stato,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Manutenzioni');
    XLSX.writeFile(wb, `manutenzioni_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast({ title: 'Report manutenzioni esportato' });
  };

  const getManutenzioneIcon = (tipo: string) => {
    switch (tipo) {
      case 'cambio_gomme': return <Circle className="w-4 h-4" />;
      case 'revisione': return <FileText className="w-4 h-4" />;
      case 'tagliando': return <Settings className="w-4 h-4" />;
      case 'ordinaria': return <Wrench className="w-4 h-4" />;
      case 'straordinaria': return <AlertTriangle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getManutenzioneStatoBadge = (stato: string) => {
    switch (stato) {
      case 'programmata': return <Badge className="bg-primary/15 text-primary border-0">Programmata</Badge>;
      case 'in_corso': return <Badge className="bg-amber-500/15 text-amber-500 border-0">In corso</Badge>;
      case 'completata': return <Badge className="bg-emerald-500/15 text-emerald-500 border-0">Completata</Badge>;
      case 'annullata': return <Badge className="bg-muted text-muted-foreground border-0">Annullata</Badge>;
      default: return <Badge variant="secondary">{stato}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Gestione Risorse & Mezzi
          </h1>
          <p className="text-muted-foreground">Mezzi, documenti, km e manutenzioni</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showNewRisorsa} onOpenChange={setShowNewRisorsa}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nuova Risorsa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuova Risorsa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome *</label>
                  <Input
                    placeholder="es. Escavatore CAT 320"
                    value={newRisorsa.nome}
                    onChange={(e) => setNewRisorsa(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo *</label>
                  <Select 
                    value={newRisorsa.tipo}
                    onValueChange={(v: Risorsa['tipo']) => setNewRisorsa(prev => ({ ...prev, tipo: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mezzo">Mezzo</SelectItem>
                      <SelectItem value="attrezzatura">Attrezzatura</SelectItem>
                      <SelectItem value="macchinario">Macchinario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Targa</label>
                    <Input
                      placeholder="AA000BB"
                      value={newRisorsa.targa}
                      onChange={(e) => setNewRisorsa(prev => ({ ...prev, targa: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Matricola</label>
                    <Input
                      placeholder="123456"
                      value={newRisorsa.matricola}
                      onChange={(e) => setNewRisorsa(prev => ({ ...prev, matricola: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrizione</label>
                  <Textarea
                    placeholder="Note aggiuntive..."
                    value={newRisorsa.descrizione}
                    onChange={(e) => setNewRisorsa(prev => ({ ...prev, descrizione: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewRisorsa(false)}>
                    Annulla
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => createRisorsaMutation.mutate({
                      nome: newRisorsa.nome,
                      tipo: newRisorsa.tipo,
                      descrizione: newRisorsa.descrizione || null,
                      targa: newRisorsa.targa || null,
                      matricola: newRisorsa.matricola || null,
                      stato: 'disponibile',
                    })}
                    disabled={!newRisorsa.nome || createRisorsaMutation.isPending}
                  >
                    Crea
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{risorse.length}</p>
                <p className="text-xs text-muted-foreground">Totale Risorse</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{risorse.filter(r => r.stato === 'disponibile').length}</p>
                <p className="text-xs text-muted-foreground">Disponibili</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documentiScaduti}</p>
                <p className="text-xs text-muted-foreground">Doc. Scaduti</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Gauge className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kmTotali.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Km Totali</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{manutenzioniProgrammate}</p>
                <p className="text-xs text-muted-foreground">Manutenzioni</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="tabs-scrollable-header flex w-full h-auto flex-nowrap justify-start gap-1 p-1 max-w-2xl">
          <TabsTrigger value="risorse" className="flex-shrink-0 whitespace-nowrap">Risorse</TabsTrigger>
          <TabsTrigger value="calendario" className="flex-shrink-0 whitespace-nowrap">Calendario</TabsTrigger>
          <TabsTrigger value="documenti" className="flex-shrink-0 whitespace-nowrap">Documenti</TabsTrigger>
          <TabsTrigger value="attivita" className="flex-shrink-0 whitespace-nowrap">Attività/Km</TabsTrigger>
          <TabsTrigger value="manutenzioni" className="flex-shrink-0 whitespace-nowrap">Manutenzioni</TabsTrigger>
        </TabsList>

        {/* Tab Risorse */}
        <TabsContent value="risorse" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtra per tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti i tipi</SelectItem>
                <SelectItem value="mezzo">Mezzi</SelectItem>
                <SelectItem value="attrezzatura">Attrezzature</SelectItem>
                <SelectItem value="macchinario">Macchinari</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filteredRisorse.length} risorsa/e</span>
          </div>

          <div className="grid gap-4">
            {filteredRisorse.map(risorsa => {
              const risorsaDocs = documenti.filter(d => d.risorsa_id === risorsa.id);
              const docsScaduti = risorsaDocs.filter(d => d.data_scadenza && differenceInDays(parseISO(d.data_scadenza), new Date()) < 0).length;
              const risorsaManutenzioni = manutenzioni.filter(m => m.risorsa_id === risorsa.id && m.stato === 'programmata');
              const ultimoKm = attivita.filter(a => a.risorsa_id === risorsa.id && a.km_finali).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
              
              return (
                <Card key={risorsa.id} className="card-modern hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          {getIcon(risorsa.tipo)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{risorsa.nome}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            {risorsa.targa && <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {risorsa.targa}</span>}
                            {risorsa.matricola && <span>• Matr: {risorsa.matricola}</span>}
                            {ultimoKm?.km_finali && (
                              <span className="flex items-center gap-1">
                                <Gauge className="w-3 h-3" /> {ultimoKm.km_finali.toLocaleString()} km
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        {docsScaduti > 0 && (
                          <Badge className="bg-red-500/15 text-red-500 border-0">
                            <AlertCircle className="w-3 h-3 mr-1" /> {docsScaduti} doc scaduti
                          </Badge>
                        )}
                        {risorsaManutenzioni.length > 0 && (
                          <Badge className="bg-amber-500/15 text-amber-500 border-0">
                            <Settings className="w-3 h-3 mr-1" /> {risorsaManutenzioni.length} manutenzioni
                          </Badge>
                        )}
                        {getStatoBadge(risorsa.stato)}
                        <Badge variant="outline" className="capitalize">{risorsa.tipo}</Badge>
                        
                        {/* Quick Actions */}
                        <Select
                          value={risorsa.stato}
                          onValueChange={(v) => updateRisorsaStatoMutation.mutate({ id: risorsa.id, stato: v })}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponibile">Disponibile</SelectItem>
                            <SelectItem value="in_uso">In Uso</SelectItem>
                            <SelectItem value="manutenzione">Manutenzione</SelectItem>
                            <SelectItem value="guasto">Guasto</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingRisorsa(risorsa);
                            setShowEditRisorsa(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm('Eliminare questa risorsa?')) {
                              deleteRisorsaMutation.mutate(risorsa.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredRisorse.length === 0 && (
              <Card className="card-modern">
                <CardContent className="p-8 text-center text-muted-foreground">
                  {filterTipo === 'tutti' ? 'Nessuna risorsa. Aggiungi la prima risorsa.' : 'Nessuna risorsa di questo tipo.'}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab Calendario */}
        <TabsContent value="calendario" className="space-y-4">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Calendario Prenotazioni</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Oggi</Button>
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset(prev => prev + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Dialog open={showNewPrenotazione} onOpenChange={setShowNewPrenotazione}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Prenota
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nuova Prenotazione</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Risorsa *</label>
                          <Select 
                            value={newPrenotazione.risorsa_id}
                            onValueChange={(v) => setNewPrenotazione(prev => ({ ...prev, risorsa_id: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona risorsa" />
                            </SelectTrigger>
                            <SelectContent>
                              {risorse.filter(r => r.stato === 'disponibile').map(r => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.nome} {r.targa && `(${r.targa})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Cantiere</label>
                          <Select 
                            value={newPrenotazione.cantiere_id}
                            onValueChange={(v) => setNewPrenotazione(prev => ({ ...prev, cantiere_id: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona cantiere" />
                            </SelectTrigger>
                            <SelectContent>
                              {cantieri.filter(c => c.stato === 'attivo').map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.codiceCommessa} - {c.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Data Inizio *</label>
                            <Input
                              type="date"
                              value={newPrenotazione.data_inizio}
                              onChange={(e) => setNewPrenotazione(prev => ({ ...prev, data_inizio: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Data Fine *</label>
                            <Input
                              type="date"
                              value={newPrenotazione.data_fine}
                              onChange={(e) => setNewPrenotazione(prev => ({ ...prev, data_fine: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="flex-1" onClick={() => setShowNewPrenotazione(false)}>
                            Annulla
                          </Button>
                          <Button 
                            className="flex-1" 
                            onClick={() => {
                              const cantiere = cantieri.find(c => c.id === newPrenotazione.cantiere_id);
                              createPrenotazioneMutation.mutate({
                                risorsa_id: newPrenotazione.risorsa_id,
                                cantiere_id: newPrenotazione.cantiere_id || null,
                                cantiere_nome: cantiere?.nome || null,
                                data_inizio: newPrenotazione.data_inizio,
                                data_fine: newPrenotazione.data_fine,
                                note: newPrenotazione.note || null,
                                stato: 'confermata',
                              });
                            }}
                            disabled={!newPrenotazione.risorsa_id || createPrenotazioneMutation.isPending}
                          >
                            Prenota
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Risorsa</TableHead>
                      {weekDays.map(day => (
                        <TableHead key={day.toISOString()} className="text-center min-w-[80px]">
                          <div className="text-xs text-muted-foreground">
                            {format(day, 'EEE', { locale: it })}
                          </div>
                          <div className="font-semibold">{format(day, 'd')}</div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risorse.map(risorsa => (
                      <TableRow key={risorsa.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getIcon(risorsa.tipo)}
                            <span className="font-medium truncate">{risorsa.nome}</span>
                          </div>
                        </TableCell>
                        {weekDays.map(day => {
                          const booking = isBooked(risorsa.id, day);
                          return (
                            <TableCell key={day.toISOString()} className="text-center p-1">
                              {booking ? (
                                <div className="h-8 rounded bg-primary/20 flex items-center justify-center text-xs font-medium text-primary truncate px-1">
                                  {booking.cantiere_nome?.slice(0, 8) || 'Prenotato'}
                                </div>
                              ) : risorsa.stato === 'disponibile' ? (
                                <div className="h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-emerald-500" />
                                </div>
                              ) : (
                                <div className="h-8 rounded bg-muted flex items-center justify-center">
                                  <X className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Documenti */}
        <TabsContent value="documenti" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewDocumento} onOpenChange={setShowNewDocumento}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Documento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuovo Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Risorsa *</label>
                    <Select 
                      value={newDocumento.risorsa_id}
                      onValueChange={(v) => setNewDocumento(prev => ({ ...prev, risorsa_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona risorsa" />
                      </SelectTrigger>
                      <SelectContent>
                        {risorse.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo *</label>
                      <Select 
                        value={newDocumento.tipo}
                        onValueChange={(v) => setNewDocumento(prev => ({ ...prev, tipo: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assicurazione">Assicurazione</SelectItem>
                          <SelectItem value="revisione">Revisione</SelectItem>
                          <SelectItem value="bollo">Bollo</SelectItem>
                          <SelectItem value="libretto">Libretto</SelectItem>
                          <SelectItem value="patente">Patente conducente</SelectItem>
                          <SelectItem value="altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Titolo *</label>
                      <Input
                        placeholder="es. Polizza RCA 2024"
                        value={newDocumento.titolo}
                        onChange={(e) => setNewDocumento(prev => ({ ...prev, titolo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Emissione</label>
                      <Input
                        type="date"
                        value={newDocumento.data_emissione}
                        onChange={(e) => setNewDocumento(prev => ({ ...prev, data_emissione: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Scadenza</label>
                      <Input
                        type="date"
                        value={newDocumento.data_scadenza}
                        onChange={(e) => setNewDocumento(prev => ({ ...prev, data_scadenza: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowNewDocumento(false)}>
                      Annulla
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => createDocumentoMutation.mutate({
                        risorsa_id: newDocumento.risorsa_id,
                        tipo: newDocumento.tipo,
                        titolo: newDocumento.titolo,
                        data_emissione: newDocumento.data_emissione || null,
                        data_scadenza: newDocumento.data_scadenza || null,
                        note: newDocumento.note || null,
                        stato: 'valido',
                      })}
                      disabled={!newDocumento.risorsa_id || !newDocumento.titolo}
                    >
                      Aggiungi
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="card-modern">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risorsa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Scadenza</TableHead>
                  <TableHead>Stato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documenti.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{getRisorsaNome(doc.risorsa_id)}</TableCell>
                    <TableCell className="capitalize">{doc.tipo}</TableCell>
                    <TableCell>{doc.titolo}</TableCell>
                    <TableCell>{doc.data_scadenza ? format(parseISO(doc.data_scadenza), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>{getDocumentoStatoBadge(doc)}</TableCell>
                  </TableRow>
                ))}
                {documenti.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nessun documento registrato
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab Attività/Km */}
        <TabsContent value="attivita" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showNewAttivita} onOpenChange={setShowNewAttivita}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Registra Attività
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Registra Attività</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Risorsa *</label>
                      <Select 
                        value={newAttivita.risorsa_id}
                        onValueChange={(v) => setNewAttivita(prev => ({ ...prev, risorsa_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                        <SelectContent>
                          {risorse.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo *</label>
                      <Select 
                        value={newAttivita.tipo_attivita}
                        onValueChange={(v) => setNewAttivita(prev => ({ ...prev, tipo_attivita: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">Report Km</SelectItem>
                          <SelectItem value="rifornimento">Rifornimento</SelectItem>
                          <SelectItem value="utilizzo">Utilizzo</SelectItem>
                          <SelectItem value="controllo">Controllo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data</label>
                      <Input
                        type="date"
                        value={newAttivita.data}
                        onChange={(e) => setNewAttivita(prev => ({ ...prev, data: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cantiere</label>
                      <Select 
                        value={newAttivita.cantiere_id}
                        onValueChange={(v) => setNewAttivita(prev => ({ ...prev, cantiere_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Opzionale" />
                        </SelectTrigger>
                        <SelectContent>
                          {cantieri.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Km Iniziali</label>
                      <Input
                        type="number"
                        value={newAttivita.km_iniziali}
                        onChange={(e) => setNewAttivita(prev => ({ ...prev, km_iniziali: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Km Finali</label>
                      <Input
                        type="number"
                        value={newAttivita.km_finali}
                        onChange={(e) => setNewAttivita(prev => ({ ...prev, km_finali: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ore Utilizzo</label>
                      <Input
                        type="number"
                        step="0.5"
                        value={newAttivita.ore_utilizzo}
                        onChange={(e) => setNewAttivita(prev => ({ ...prev, ore_utilizzo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Litri Carburante</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newAttivita.litri_carburante}
                        onChange={(e) => setNewAttivita(prev => ({ ...prev, litri_carburante: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Costo €</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAttivita.costo}
                        onChange={(e) => setNewAttivita(prev => ({ ...prev, costo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Eseguito Da</label>
                    <Input
                      placeholder="Nome operatore"
                      value={newAttivita.eseguito_da}
                      onChange={(e) => setNewAttivita(prev => ({ ...prev, eseguito_da: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descrizione</label>
                    <Textarea
                      placeholder="Dettagli attività..."
                      value={newAttivita.descrizione}
                      onChange={(e) => setNewAttivita(prev => ({ ...prev, descrizione: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowNewAttivita(false)}>
                      Annulla
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        const cantiere = cantieri.find(c => c.id === newAttivita.cantiere_id);
                        const kmIni = parseFloat(newAttivita.km_iniziali) || null;
                        const kmFin = parseFloat(newAttivita.km_finali) || null;
                        createAttivitaMutation.mutate({
                          risorsa_id: newAttivita.risorsa_id,
                          tipo_attivita: newAttivita.tipo_attivita,
                          data: newAttivita.data,
                          cantiere_id: newAttivita.cantiere_id || null,
                          cantiere_nome: cantiere?.nome || null,
                          km_iniziali: kmIni,
                          km_finali: kmFin,
                          km_percorsi: kmIni && kmFin ? kmFin - kmIni : null,
                          litri_carburante: parseFloat(newAttivita.litri_carburante) || null,
                          costo: parseFloat(newAttivita.costo) || null,
                          ore_utilizzo: parseFloat(newAttivita.ore_utilizzo) || null,
                          eseguito_da: newAttivita.eseguito_da || null,
                          descrizione: newAttivita.descrizione || null,
                          note: newAttivita.note || null,
                        });
                      }}
                      disabled={!newAttivita.risorsa_id}
                    >
                      Registra
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="card-modern">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Risorsa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantiere</TableHead>
                  <TableHead className="text-right">Km</TableHead>
                  <TableHead className="text-right">Litri</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead>Operatore</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attivita.slice(0, 50).map(att => (
                  <TableRow key={att.id}>
                    <TableCell>{format(parseISO(att.data), 'dd/MM/yy')}</TableCell>
                    <TableCell className="font-medium">{getRisorsaNome(att.risorsa_id)}</TableCell>
                    <TableCell className="capitalize">{att.tipo_attivita}</TableCell>
                    <TableCell>{att.cantiere_nome || '-'}</TableCell>
                    <TableCell className="text-right">{att.km_percorsi?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">{att.litri_carburante || '-'}</TableCell>
                    <TableCell className="text-right">{att.costo ? `€${att.costo.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{att.eseguito_da || '-'}</TableCell>
                  </TableRow>
                ))}
                {attivita.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nessuna attività registrata
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab Manutenzioni */}
        <TabsContent value="manutenzioni" className="space-y-4">
          <div className="flex justify-between flex-wrap gap-4">
            <Button variant="outline" onClick={exportManutenzioniExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export Manutenzioni
            </Button>
            <Dialog open={showNewManutenzione} onOpenChange={setShowNewManutenzione}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Programma Manutenzione
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Programma Manutenzione</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Risorsa *</label>
                    <Select 
                      value={newManutenzione.risorsa_id}
                      onValueChange={(v) => setNewManutenzione(prev => ({ ...prev, risorsa_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona risorsa" />
                      </SelectTrigger>
                      <SelectContent>
                        {risorse.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo *</label>
                      <Select 
                        value={newManutenzione.tipo}
                        onValueChange={(v) => setNewManutenzione(prev => ({ ...prev, tipo: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ordinaria">Manutenzione Ordinaria</SelectItem>
                          <SelectItem value="straordinaria">Manutenzione Straordinaria</SelectItem>
                          <SelectItem value="tagliando">Tagliando</SelectItem>
                          <SelectItem value="cambio_gomme">Cambio Gomme</SelectItem>
                          <SelectItem value="revisione">Revisione</SelectItem>
                          <SelectItem value="controllo">Controllo Periodico</SelectItem>
                          <SelectItem value="riparazione">Riparazione</SelectItem>
                          <SelectItem value="sostituzione_pezzi">Sostituzione Pezzi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Programmata</label>
                      <Input
                        type="date"
                        value={newManutenzione.data_programmata}
                        onChange={(e) => setNewManutenzione(prev => ({ ...prev, data_programmata: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descrizione *</label>
                    <Textarea
                      placeholder="Descrizione intervento..."
                      value={newManutenzione.descrizione}
                      onChange={(e) => setNewManutenzione(prev => ({ ...prev, descrizione: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Km Programmati</label>
                      <Input
                        type="number"
                        value={newManutenzione.km_programmati}
                        onChange={(e) => setNewManutenzione(prev => ({ ...prev, km_programmati: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Costo Stimato €</label>
                      <Input
                        type="number"
                        value={newManutenzione.costo_stimato}
                        onChange={(e) => setNewManutenzione(prev => ({ ...prev, costo_stimato: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Officina</label>
                      <Input
                        placeholder="Nome officina"
                        value={newManutenzione.officina}
                        onChange={(e) => setNewManutenzione(prev => ({ ...prev, officina: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowNewManutenzione(false)}>
                      Annulla
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => createManutenzioneMutation.mutate({
                        risorsa_id: newManutenzione.risorsa_id,
                        tipo: newManutenzione.tipo,
                        descrizione: newManutenzione.descrizione,
                        data_programmata: newManutenzione.data_programmata || null,
                        km_programmati: parseFloat(newManutenzione.km_programmati) || null,
                        officina: newManutenzione.officina || null,
                        stato: 'programmata',
                        allegati: [],
                        note: newManutenzione.note || null,
                      })}
                      disabled={!newManutenzione.risorsa_id || !newManutenzione.descrizione}
                    >
                      Programma
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Manutenzioni Cards per tipo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="card-modern">
              <CardContent className="p-4 text-center">
                <Circle className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{manutenzioni.filter(m => m.tipo === 'cambio_gomme').length}</p>
                <p className="text-xs text-muted-foreground">Cambio Gomme</p>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{manutenzioni.filter(m => m.tipo === 'revisione').length}</p>
                <p className="text-xs text-muted-foreground">Revisioni</p>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 text-center">
                <Settings className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-2xl font-bold">{manutenzioni.filter(m => m.tipo === 'tagliando').length}</p>
                <p className="text-xs text-muted-foreground">Tagliandi</p>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 text-center">
                <Wrench className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{manutenzioni.filter(m => m.stato === 'programmata').length}</p>
                <p className="text-xs text-muted-foreground">In Programma</p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-modern">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risorsa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead>Data Progr.</TableHead>
                  <TableHead>Km</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Officina</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manutenzioni.map(man => (
                  <TableRow key={man.id}>
                    <TableCell className="font-medium">{getRisorsaNome(man.risorsa_id)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 capitalize">
                        {getManutenzioneIcon(man.tipo)}
                        <span>{man.tipo.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{man.descrizione}</TableCell>
                    <TableCell>{man.data_programmata ? format(parseISO(man.data_programmata), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>{man.km_programmati?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{man.costo ? `€${man.costo.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{man.officina || '-'}</TableCell>
                    <TableCell>{getManutenzioneStatoBadge(man.stato)}</TableCell>
                    <TableCell className="text-right">
                      {man.stato === 'programmata' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => completeManutenzioneeMutation.mutate({ id: man.id })}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Completa
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {manutenzioni.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nessuna manutenzione programmata
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Risorsa Dialog */}
      <Dialog open={showEditRisorsa} onOpenChange={setShowEditRisorsa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Risorsa</DialogTitle>
          </DialogHeader>
          {editingRisorsa && (
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome *</label>
                <Input
                  value={editingRisorsa.nome}
                  onChange={(e) => setEditingRisorsa({ ...editingRisorsa, nome: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Targa</label>
                  <Input
                    value={editingRisorsa.targa || ''}
                    onChange={(e) => setEditingRisorsa({ ...editingRisorsa, targa: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Matricola</label>
                  <Input
                    value={editingRisorsa.matricola || ''}
                    onChange={(e) => setEditingRisorsa({ ...editingRisorsa, matricola: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Descrizione</label>
                <Textarea
                  value={editingRisorsa.descrizione || ''}
                  onChange={(e) => setEditingRisorsa({ ...editingRisorsa, descrizione: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditRisorsa(false)}>
                  Annulla
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => updateRisorsaMutation.mutate({
                    id: editingRisorsa.id,
                    nome: editingRisorsa.nome,
                    targa: editingRisorsa.targa,
                    matricola: editingRisorsa.matricola,
                    descrizione: editingRisorsa.descrizione,
                  })}
                  disabled={!editingRisorsa.nome}
                >
                  Salva
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
