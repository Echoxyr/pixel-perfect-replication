import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DDTManager from '@/components/workhub/DDTManager';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  XCircle,
  MessageSquare,
  Calendar,
  Upload,
  Paperclip,
  Trash2,
  LayoutGrid,
  List,
  CalendarDays,
  Truck,
  Printer,
  Save,
  AlertTriangle,
  Bell,
  AlertCircle,
  AlertOctagon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
type StatoFattura = 'emessa' | 'pagata' | 'scaduta' | 'in_attesa' | 'contestata';
type TipoFattura = 'attiva' | 'passiva';
type StatoNotaSpesa = 'presentata' | 'approvata' | 'rimborsata' | 'rifiutata';
type CategoriaNotaSpesa = 'trasferta' | 'materiale' | 'vitto' | 'alloggio' | 'altro';
type StatoRichiesta = 'in_attesa' | 'approvata' | 'rifiutata' | 'completata';
type TipoRichiesta = 'ferie' | 'permesso' | 'malattia' | 'straordinario' | 'anticipo' | 'rimborso' | 'altro';

interface NodoOrganigramma {
  id: string;
  nome: string;
  ruolo: string;
  reparto: string;
  superiore_id?: string | null;
  livello: number;
  foto_url?: string | null;
  email?: string | null;
  telefono?: string | null;
}

export default function RepartoAmministrazione() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('fatture');
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'board'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<'tutte' | 'attive' | 'passive'>('tutte');

  // Dialog states
  const [showNewFattura, setShowNewFattura] = useState(false);
  const [showNewNota, setShowNewNota] = useState(false);
  const [showNewRichiesta, setShowNewRichiesta] = useState(false);
  const [showNewDDT, setShowNewDDT] = useState(false);
  const [showViewFattura, setShowViewFattura] = useState(false);
  const [showEditFattura, setShowEditFattura] = useState(false);
  const [selectedFattura, setSelectedFattura] = useState<typeof fatture[0] | null>(null);

  // Form states
  const [newFattura, setNewFattura] = useState({
    tipo: 'attiva' as TipoFattura,
    numero: '',
    data: new Date().toISOString().split('T')[0],
    scadenza: '',
    cliente_fornitore: '',
    descrizione: '',
    imponibile: 0,
    aliquota_iva: 22
  });

  const [newNota, setNewNota] = useState({
    dipendente_nome: '',
    categoria: 'altro' as CategoriaNotaSpesa,
    descrizione: '',
    importo: 0,
    commessa_id: ''
  });

  const [newRichiesta, setNewRichiesta] = useState({
    dipendente_nome: '',
    tipo: 'ferie' as TipoRichiesta,
    descrizione: '',
    data_inizio: '',
    data_fine: '',
    importo: 0
  });

  // Fetch fatture from database
  const { data: fatture = [], isLoading: loadingFatture } = useQuery({
    queryKey: ['fatture'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fatture')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch note spesa from database
  const { data: noteSpesa = [], isLoading: loadingNote } = useQuery({
    queryKey: ['note_spesa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('note_spesa')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch richieste dipendenti from database
  const { data: richiesteDipendenti = [], isLoading: loadingRichieste } = useQuery({
    queryKey: ['richieste_dipendenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('richieste_dipendenti')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch organigramma from database
  const { data: organigramma = [] } = useQuery({
    queryKey: ['organigramma'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organigramma')
        .select('*')
        .order('livello', { ascending: true });
      if (error) throw error;
      return data as NodoOrganigramma[];
    }
  });

  // Create fattura mutation
  const createFattura = useMutation({
    mutationFn: async (data: typeof newFattura) => {
      const { error } = await supabase.from('fatture').insert({
        tipo: data.tipo,
        numero: data.numero || undefined,
        data: data.data,
        scadenza: data.scadenza,
        cliente_fornitore: data.cliente_fornitore,
        descrizione: data.descrizione,
        imponibile: data.imponibile,
        aliquota_iva: data.aliquota_iva
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fatture'] });
      setShowNewFattura(false);
      setNewFattura({
        tipo: 'attiva',
        numero: '',
        data: new Date().toISOString().split('T')[0],
        scadenza: '',
        cliente_fornitore: '',
        descrizione: '',
        imponibile: 0,
        aliquota_iva: 22
      });
      toast.success('Fattura creata con successo');
    },
    onError: (error) => {
      toast.error('Errore nella creazione: ' + error.message);
    }
  });

  // Create nota spesa mutation
  const createNotaSpesa = useMutation({
    mutationFn: async (data: typeof newNota) => {
      const numero = `NS-${new Date().getFullYear()}-${String(noteSpesa.length + 1).padStart(3, '0')}`;
      const { error } = await supabase.from('note_spesa').insert({
        numero,
        dipendente_nome: data.dipendente_nome,
        categoria: data.categoria,
        descrizione: data.descrizione,
        importo: data.importo,
        commessa_id: data.commessa_id || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note_spesa'] });
      setShowNewNota(false);
      setNewNota({ dipendente_nome: '', categoria: 'altro', descrizione: '', importo: 0, commessa_id: '' });
      toast.success('Nota spesa creata con successo');
    },
    onError: (error) => {
      toast.error('Errore: ' + error.message);
    }
  });

  // Create richiesta mutation
  const createRichiesta = useMutation({
    mutationFn: async (data: typeof newRichiesta) => {
      const numero = `RD-${new Date().getFullYear()}-${String(richiesteDipendenti.length + 1).padStart(3, '0')}`;
      const { error } = await supabase.from('richieste_dipendenti').insert({
        numero,
        dipendente_nome: data.dipendente_nome,
        tipo: data.tipo,
        descrizione: data.descrizione,
        data_inizio: data.data_inizio || null,
        data_fine: data.data_fine || null,
        importo: data.importo || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['richieste_dipendenti'] });
      setShowNewRichiesta(false);
      setNewRichiesta({ dipendente_nome: '', tipo: 'ferie', descrizione: '', data_inizio: '', data_fine: '', importo: 0 });
      toast.success('Richiesta inviata con successo');
    },
    onError: (error) => {
      toast.error('Errore: ' + error.message);
    }
  });

  // Update nota spesa status
  const updateNotaStatus = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: StatoNotaSpesa }) => {
      const { error } = await supabase.from('note_spesa').update({ stato }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note_spesa'] });
      toast.success('Stato aggiornato');
    }
  });

  // Update richiesta status
  const updateRichiestaStatus = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: StatoRichiesta }) => {
      const { error } = await supabase.from('richieste_dipendenti').update({ 
        stato,
        data_approvazione: stato === 'approvata' ? new Date().toISOString().split('T')[0] : null
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['richieste_dipendenti'] });
      toast.success('Stato aggiornato');
    }
  });

  // Update fattura status
  const updateFatturaStatus = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: StatoFattura }) => {
      const updates: any = { stato };
      if (stato === 'pagata') {
        updates.data_pagamento = new Date().toISOString().split('T')[0];
      }
      const { error } = await supabase.from('fatture').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fatture'] });
      toast.success('Stato fattura aggiornato');
    }
  });

  // Update fattura (full edit)
  const updateFattura = useMutation({
    mutationFn: async (data: { id: string; cliente_fornitore: string; descrizione: string; imponibile: number; aliquota_iva: number; scadenza: string }) => {
      const totale = data.imponibile * (1 + data.aliquota_iva / 100);
      const { error } = await supabase.from('fatture').update({
        cliente_fornitore: data.cliente_fornitore,
        descrizione: data.descrizione,
        imponibile: data.imponibile,
        aliquota_iva: data.aliquota_iva,
        totale,
        scadenza: data.scadenza
      }).eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fatture'] });
      setShowEditFattura(false);
      setSelectedFattura(null);
      toast.success('Fattura aggiornata');
    },
    onError: (error) => toast.error('Errore: ' + error.message)
  });

  // Delete fattura
  const deleteFattura = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fatture').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fatture'] });
      toast.success('Fattura eliminata');
    },
    onError: (error) => toast.error('Errore: ' + error.message)
  });

  // Delete nota spesa
  const deleteNotaSpesa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('note_spesa').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note_spesa'] });
      toast.success('Nota spesa eliminata');
    },
    onError: (error) => toast.error('Errore: ' + error.message)
  });

  // Delete richiesta
  const deleteRichiesta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('richieste_dipendenti').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['richieste_dipendenti'] });
      toast.success('Richiesta eliminata');
    },
    onError: (error) => toast.error('Errore: ' + error.message)
  });

  // Delete organigramma node
  const deleteOrganigramma = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('organigramma').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organigramma'] });
      toast.success('Ruolo eliminato');
    },
    onError: (error) => toast.error('Errore: ' + error.message)
  });

  const formatCurrency = (value: number | null) => {
    if (value === null) return '€ 0,00';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
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
      case 'ferie': return 'bg-primary/15 text-primary';
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
        (f.descrizione && f.descrizione.toLowerCase().includes(search));
    }
    return true;
  });

  // Real stats from database
  const stats = useMemo(() => ({
    fattureAttiveEmesse: fatture.filter(f => f.tipo === 'attiva' && f.stato === 'emessa').reduce((sum, f) => sum + (f.totale || 0), 0),
    fatturePassiveDaPagare: fatture.filter(f => f.tipo === 'passiva' && f.stato === 'in_attesa').reduce((sum, f) => sum + (f.totale || 0), 0),
    noteSpesaInAttesa: noteSpesa.filter(n => n.stato === 'presentata').length,
    richiesteInAttesa: richiesteDipendenti.filter(r => r.stato === 'in_attesa').length,
    totaleNoteSpesaInAttesa: noteSpesa.filter(n => n.stato === 'presentata').reduce((sum, n) => sum + n.importo, 0)
  }), [fatture, noteSpesa, richiesteDipendenti]);

  // Blacklist logic - fatture con scadenze critiche
  const blacklistData = useMemo(() => {
    const today = new Date();
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    const fattureNonPagate = fatture.filter(f => f.stato !== 'pagata' && f.scadenza);

    // Alert 1 settimana prima (preventivo)
    const inScadenza1Settimana = fattureNonPagate.filter(f => {
      const scadenza = new Date(f.scadenza);
      const diffDays = Math.ceil((scadenza.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    });

    // Scadute da meno di 1 mese - Alert sollecito
    const scaduteRecenti = fattureNonPagate.filter(f => {
      const scadenza = new Date(f.scadenza);
      return scadenza < today && scadenza >= oneMonthAgo;
    });

    // Scadute da 1-2 mesi - Alert urgente
    const scadute1Mese = fattureNonPagate.filter(f => {
      const scadenza = new Date(f.scadenza);
      return scadenza < oneMonthAgo && scadenza >= twoMonthsAgo;
    });

    // Blacklist - scadute da più di 2 mesi
    const blacklist = fattureNonPagate.filter(f => {
      const scadenza = new Date(f.scadenza);
      return scadenza < twoMonthsAgo;
    });

    return {
      inScadenza1Settimana,
      scaduteRecenti,
      scadute1Mese,
      blacklist,
      totaleBlacklist: blacklist.length,
      totaleAlerts: inScadenza1Settimana.length + scaduteRecenti.length + scadute1Mese.length
    };
  }, [fatture]);

  // Render Blacklist View
  const renderBlacklistView = () => {
    const getDaysOverdue = (scadenza: string) => {
      const today = new Date();
      const scadenzaDate = new Date(scadenza);
      return Math.ceil((today.getTime() - scadenzaDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
      <div className="space-y-6">
        {/* Alert in scadenza 1 settimana */}
        {blacklistData.inScadenza1Settimana.length > 0 && (
          <Card className="border-2 border-amber-500/50 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-500">
                <Bell className="w-5 h-5" />
                In Scadenza Entro 1 Settimana ({blacklistData.inScadenza1Settimana.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blacklistData.inScadenza1Settimana.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={f.tipo === 'attiva' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                        {f.tipo === 'attiva' ? 'Attiva' : 'Passiva'}
                      </Badge>
                      <div>
                        <span className="font-mono font-medium">{f.numero}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span>{f.cliente_fornitore}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{formatCurrency(f.totale)}</span>
                      <Badge className="bg-amber-500/15 text-amber-500">Scade il {formatDate(f.scadenza)}</Badge>
                      <Button size="sm" variant="outline" onClick={() => updateFatturaStatus.mutate({ id: f.id, stato: 'pagata' })}>
                        <CheckCircle className="w-4 h-4 mr-1" />Segna Pagata
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scadute recenti - sollecito */}
        {blacklistData.scaduteRecenti.length > 0 && (
          <Card className="border-2 border-orange-500/50 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <AlertCircle className="w-5 h-5" />
                Sollecito Pagamento - Scadute da meno di 1 mese ({blacklistData.scaduteRecenti.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blacklistData.scaduteRecenti.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={f.tipo === 'attiva' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                        {f.tipo === 'attiva' ? 'Da incassare' : 'Da pagare'}
                      </Badge>
                      <div>
                        <span className="font-mono font-medium">{f.numero}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span>{f.cliente_fornitore}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{formatCurrency(f.totale)}</span>
                      <Badge className="bg-orange-500/15 text-orange-500">Scaduta da {getDaysOverdue(f.scadenza)} giorni</Badge>
                      <Button size="sm" variant="outline" onClick={() => updateFatturaStatus.mutate({ id: f.id, stato: 'pagata' })}>
                        <CheckCircle className="w-4 h-4 mr-1" />Segna Pagata
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scadute da 1-2 mesi - urgente */}
        {blacklistData.scadute1Mese.length > 0 && (
          <Card className="border-2 border-red-500/50 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Urgente - Scadute da oltre 1 mese ({blacklistData.scadute1Mese.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blacklistData.scadute1Mese.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={f.tipo === 'attiva' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                        {f.tipo === 'attiva' ? 'Da incassare' : 'Da pagare'}
                      </Badge>
                      <div>
                        <span className="font-mono font-medium">{f.numero}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span>{f.cliente_fornitore}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-red-500">{formatCurrency(f.totale)}</span>
                      <Badge className="bg-red-500/15 text-red-500">Scaduta da {getDaysOverdue(f.scadenza)} giorni</Badge>
                      <Button size="sm" variant="outline" onClick={() => updateFatturaStatus.mutate({ id: f.id, stato: 'pagata' })}>
                        <CheckCircle className="w-4 h-4 mr-1" />Segna Pagata
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLACKLIST - oltre 2 mesi */}
        <Card className="border-2 border-destructive bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertOctagon className="w-5 h-5" />
              BLACKLIST - Scadute da oltre 2 mesi ({blacklistData.blacklist.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blacklistData.blacklist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                <p className="text-lg font-medium">Nessuna fattura in blacklist</p>
                <p className="text-sm">Tutte le fatture sono regolari</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blacklistData.blacklist.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-background rounded-lg border-2 border-destructive/50">
                    <div className="flex items-center gap-4">
                      <AlertOctagon className="w-5 h-5 text-destructive" />
                      <Badge variant="outline" className={f.tipo === 'attiva' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                        {f.tipo === 'attiva' ? 'CREDITO' : 'DEBITO'}
                      </Badge>
                      <div>
                        <span className="font-mono font-bold">{f.numero}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span className="font-medium">{f.cliente_fornitore}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-xl text-destructive">{formatCurrency(f.totale)}</span>
                      <Badge variant="destructive">Scaduta da {getDaysOverdue(f.scadenza)} giorni</Badge>
                      <Button size="sm" variant="outline" onClick={() => updateFatturaStatus.mutate({ id: f.id, stato: 'pagata' })}>
                        <CheckCircle className="w-4 h-4 mr-1" />Segna Pagata
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-amber-500">{blacklistData.inScadenza1Settimana.length}</p>
                <p className="text-sm text-muted-foreground">In scadenza</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{blacklistData.scaduteRecenti.length}</p>
                <p className="text-sm text-muted-foreground">Sollecito</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{blacklistData.scadute1Mese.length}</p>
                <p className="text-sm text-muted-foreground">Urgente</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{blacklistData.blacklist.length}</p>
                <p className="text-sm text-muted-foreground">Blacklist</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Calendar view for richieste
  const renderCalendarView = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-muted/30" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayRichieste = richiesteDipendenti.filter(r => {
        if (!r.data_inizio || !r.data_fine) return false;
        return dateStr >= r.data_inizio && dateStr <= r.data_fine;
      });

      days.push(
        <div key={day} className={cn(
          "h-24 border border-border p-1 hover:bg-muted/50 transition-colors",
          day === today.getDate() && "bg-primary/10 border-primary"
        )}>
          <span className={cn(
            "text-sm font-medium",
            day === today.getDate() && "text-primary"
          )}>{day}</span>
          <div className="mt-1 space-y-1 overflow-hidden">
            {dayRichieste.slice(0, 2).map((r, i) => (
              <div key={i} className={cn(
                "text-xs px-1 py-0.5 rounded truncate",
                getTipoRichiestaColor(r.tipo)
              )}>
                {r.dipendente_nome.split(' ')[0]} - {r.tipo}
              </div>
            ))}
            {dayRichieste.length > 2 && (
              <span className="text-xs text-muted-foreground">+{dayRichieste.length - 2} altri</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {new Date(currentYear, currentMonth).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(d => (
              <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {days}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Board/Kanban view for richieste
  const renderBoardView = () => {
    const columns: { key: StatoRichiesta; label: string; color: string }[] = [
      { key: 'in_attesa', label: 'In Attesa', color: 'border-amber-500' },
      { key: 'approvata', label: 'Approvate', color: 'border-emerald-500' },
      { key: 'rifiutata', label: 'Rifiutate', color: 'border-red-500' },
      { key: 'completata', label: 'Completate', color: 'border-sky-500' }
    ];

    return (
      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => (
          <Card key={col.key} className={cn("border-t-4", col.color)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                {col.label}
                <Badge variant="secondary">{richiesteDipendenti.filter(r => r.stato === col.key).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ScrollArea className="h-[400px] pr-2">
                {richiesteDipendenti.filter(r => r.stato === col.key).map(r => (
                  <Card key={r.id} className="mb-2 p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getTipoRichiestaColor(r.tipo)} variant="secondary">
                        {r.tipo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{r.numero}</span>
                    </div>
                    <p className="font-medium text-sm mb-1">{r.dipendente_nome}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.descrizione}</p>
                    {r.data_inizio && r.data_fine && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(r.data_inizio)} - {formatDate(r.data_fine)}
                      </div>
                    )}
                    <div className="flex gap-1 mt-2">
                      {col.key === 'in_attesa' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-emerald-500"
                            onClick={() => updateRichiestaStatus.mutate({ id: r.id, stato: 'approvata' })}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approva
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-red-500"
                            onClick={() => updateRichiestaStatus.mutate({ id: r.id, stato: 'rifiutata' })}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => {
                          if (confirm('Sei sicuro di voler eliminare questa richiesta?')) {
                            deleteRichiesta.mutate(r.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
                    "w-48 border-2 transition-all hover:shadow-lg cursor-pointer relative group",
                    repartiColors[nodo.reparto] || 'border-border'
                  )}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Sei sicuro di voler eliminare questo ruolo?')) {
                        deleteOrganigramma.mutate(nodo.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
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
    <div className="space-y-6 animate-fade-in min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Reparto Amministrazione</h1>
          <p className="text-muted-foreground">Gestione fatture, note spesa, richieste dipendenti e organigramma</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold truncate" title={formatCurrency(stats.fattureAttiveEmesse)}>{formatCurrency(stats.fattureAttiveEmesse)}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Crediti da incassare</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
                <ArrowDownLeft className="w-5 h-5 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold truncate" title={formatCurrency(stats.fatturePassiveDaPagare)}>{formatCurrency(stats.fatturePassiveDaPagare)}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Debiti da pagare</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                <Receipt className="w-5 h-5 text-purple-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{stats.noteSpesaInAttesa}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap truncate" title={`Note spesa (${formatCurrency(stats.totaleNoteSpesaInAttesa)})`}>Note spesa ({formatCurrency(stats.totaleNoteSpesaInAttesa)})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{stats.richiesteInAttesa}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Richieste in attesa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="tabs-scrollable-header flex w-full h-auto flex-nowrap justify-start gap-1 p-1">
          <TabsTrigger value="fatture" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Fatture
          </TabsTrigger>
          <TabsTrigger value="blacklist" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2 relative">
            <AlertTriangle className="w-4 h-4" />
            Blacklist
            {blacklistData.totaleAlerts + blacklistData.totaleBlacklist > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {blacklistData.totaleAlerts + blacklistData.totaleBlacklist}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notespesa" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Note Spesa
          </TabsTrigger>
          <TabsTrigger value="richieste" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Richieste
          </TabsTrigger>
          <TabsTrigger value="ddt" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2">
            <Truck className="w-4 h-4" />
            DDT
          </TabsTrigger>
          <TabsTrigger value="organigramma" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2">
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
                  <Button variant={filterTipo === 'tutte' ? 'default' : 'outline'} size="sm" onClick={() => setFilterTipo('tutte')}>Tutte</Button>
                  <Button variant={filterTipo === 'attive' ? 'default' : 'outline'} size="sm" onClick={() => setFilterTipo('attive')}>Attive</Button>
                  <Button variant={filterTipo === 'passive' ? 'default' : 'outline'} size="sm" onClick={() => setFilterTipo('passive')}>Passive</Button>
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
                        <Select value={newFattura.tipo} onValueChange={(v: TipoFattura) => setNewFattura({...newFattura, tipo: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attiva">Fattura Attiva</SelectItem>
                            <SelectItem value="passiva">Fattura Passiva</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Numero (auto se vuoto)</Label>
                        <Input value={newFattura.numero} onChange={(e) => setNewFattura({...newFattura, numero: e.target.value})} placeholder="FA-2024-XXX" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input type="date" value={newFattura.data} onChange={(e) => setNewFattura({...newFattura, data: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Scadenza *</Label>
                        <Input type="date" value={newFattura.scadenza} onChange={(e) => setNewFattura({...newFattura, scadenza: e.target.value})} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Cliente/Fornitore *</Label>
                        <Input value={newFattura.cliente_fornitore} onChange={(e) => setNewFattura({...newFattura, cliente_fornitore: e.target.value})} placeholder="Nome cliente o fornitore" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Descrizione</Label>
                        <Input value={newFattura.descrizione} onChange={(e) => setNewFattura({...newFattura, descrizione: e.target.value})} placeholder="Descrizione fattura" />
                      </div>
                      <div className="space-y-2">
                        <Label>Imponibile *</Label>
                        <Input type="number" value={newFattura.imponibile} onChange={(e) => setNewFattura({...newFattura, imponibile: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Aliquota IVA %</Label>
                        <Select value={String(newFattura.aliquota_iva)} onValueChange={(v) => setNewFattura({...newFattura, aliquota_iva: parseInt(v)})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="22">22%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="4">4%</SelectItem>
                            <SelectItem value="0">Esente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Allegato</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="fattura-file" onChange={(e) => {
                            if (e.target.files?.[0]) toast.success(`File "${e.target.files[0].name}" selezionato`);
                          }} />
                          <label htmlFor="fattura-file" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Clicca per caricare</p>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewFattura(false)}>Annulla</Button>
                      <Button onClick={() => createFattura.mutate(newFattura)} disabled={!newFattura.cliente_fornitore || !newFattura.scadenza}>
                        <Save className="w-4 h-4 mr-2" />
                        Salva Fattura
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente/Fornitore</TableHead>
                      <TableHead className="text-right">Totale</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Scadenza</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingFatture ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8">Caricamento...</TableCell></TableRow>
                    ) : filteredFatture.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessuna fattura trovata</TableCell></TableRow>
                    ) : filteredFatture.map((fattura) => (
                      <TableRow key={fattura.id}>
                        <TableCell className="font-mono font-medium">{fattura.numero}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={fattura.tipo === 'attiva' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                            {fattura.tipo === 'attiva' ? 'Attiva' : 'Passiva'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(fattura.data)}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block max-w-[180px] truncate">{fattura.cliente_fornitore}</span>
                              </TooltipTrigger>
                              <TooltipContent><p>{fattura.cliente_fornitore}</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(fattura.totale)}</TableCell>
                        <TableCell>
                          <Badge className={getStatoColor(fattura.stato)}>{fattura.stato.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(fattura.scadenza)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedFattura(fattura); setShowViewFattura(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedFattura(fattura); setShowEditFattura(true); }}><Edit className="w-4 h-4" /></Button>
                            {fattura.stato === 'emessa' && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500" onClick={() => updateFatturaStatus.mutate({ id: fattura.id, stato: 'pagata' })}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="w-4 h-4" /></Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => {
                                if (confirm('Sei sicuro di voler eliminare questa fattura?')) {
                                  deleteFattura.mutate(fattura.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blacklist Tab */}
        <TabsContent value="blacklist" className="mt-6">
          {renderBlacklistView()}
        </TabsContent>

        {/* Note Spesa Tab */}
        <TabsContent value="notespesa" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Note Spesa</CardTitle>
              <Dialog open={showNewNota} onOpenChange={setShowNewNota}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" />Nuova Nota Spesa</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Nuova Nota Spesa</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Dipendente *</Label>
                        <Input value={newNota.dipendente_nome} onChange={(e) => setNewNota({...newNota, dipendente_nome: e.target.value})} placeholder="Nome dipendente" />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select value={newNota.categoria} onValueChange={(v: CategoriaNotaSpesa) => setNewNota({...newNota, categoria: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <div className="space-y-2">
                      <Label>Importo *</Label>
                      <Input type="number" value={newNota.importo} onChange={(e) => setNewNota({...newNota, importo: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrizione *</Label>
                      <Textarea value={newNota.descrizione} onChange={(e) => setNewNota({...newNota, descrizione: e.target.value})} placeholder="Descrizione spesa..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Allegati</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input type="file" multiple className="hidden" id="nota-file" onChange={(e) => {
                          if (e.target.files?.length) toast.success(`${e.target.files.length} file selezionato/i`);
                        }} />
                        <label htmlFor="nota-file" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Carica ricevute</p>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewNota(false)}>Annulla</Button>
                    <Button onClick={() => createNotaSpesa.mutate(newNota)} disabled={!newNota.dipendente_nome || !newNota.descrizione || newNota.importo <= 0}>
                      <Save className="w-4 h-4 mr-2" />Invia
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Dipendente</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrizione</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingNote ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8">Caricamento...</TableCell></TableRow>
                    ) : noteSpesa.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessuna nota spesa</TableCell></TableRow>
                    ) : noteSpesa.map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell className="font-mono">{nota.numero}</TableCell>
                        <TableCell>{formatDate(nota.data)}</TableCell>
                        <TableCell>{nota.dipendente_nome}</TableCell>
                        <TableCell><Badge variant="outline">{nota.categoria}</Badge></TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild><span className="block max-w-[200px] truncate">{nota.descrizione}</span></TooltipTrigger>
                              <TooltipContent className="max-w-[300px]"><p>{nota.descrizione}</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(nota.importo)}</TableCell>
                        <TableCell><Badge className={getStatoColor(nota.stato)}>{nota.stato}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {nota.stato === 'presentata' && (
                              <>
                                <Button variant="ghost" size="sm" className="h-8 text-emerald-500" onClick={() => updateNotaStatus.mutate({ id: nota.id, stato: 'approvata' })}>
                                  <CheckCircle className="w-4 h-4 mr-1" />Approva
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-red-500" onClick={() => updateNotaStatus.mutate({ id: nota.id, stato: 'rifiutata' })}>
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {nota.stato === 'approvata' && (
                              <Button variant="ghost" size="sm" className="h-8 text-emerald-500" onClick={() => updateNotaStatus.mutate({ id: nota.id, stato: 'rimborsata' })}>
                                Rimborsa
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => {
                                if (confirm('Sei sicuro di voler eliminare questa nota spesa?')) {
                                  deleteNotaSpesa.mutate(nota.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Richieste Dipendenti Tab */}
        <TabsContent value="richieste" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}><List className="w-4 h-4 mr-1" />Tabella</Button>
              <Button variant={viewMode === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('calendar')}><CalendarDays className="w-4 h-4 mr-1" />Calendario</Button>
              <Button variant={viewMode === 'board' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('board')}><LayoutGrid className="w-4 h-4 mr-1" />Board</Button>
            </div>
            <Dialog open={showNewRichiesta} onOpenChange={setShowNewRichiesta}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Nuova Richiesta</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nuova Richiesta</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dipendente *</Label>
                      <Input value={newRichiesta.dipendente_nome} onChange={(e) => setNewRichiesta({...newRichiesta, dipendente_nome: e.target.value})} placeholder="Nome dipendente" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={newRichiesta.tipo} onValueChange={(v: TipoRichiesta) => setNewRichiesta({...newRichiesta, tipo: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ferie">Ferie</SelectItem>
                          <SelectItem value="permesso">Permesso</SelectItem>
                          <SelectItem value="malattia">Malattia</SelectItem>
                          <SelectItem value="straordinario">Straordinario</SelectItem>
                          <SelectItem value="anticipo">Anticipo</SelectItem>
                          <SelectItem value="rimborso">Rimborso</SelectItem>
                          <SelectItem value="altro">Altro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Inizio</Label>
                      <Input type="date" value={newRichiesta.data_inizio} onChange={(e) => setNewRichiesta({...newRichiesta, data_inizio: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fine</Label>
                      <Input type="date" value={newRichiesta.data_fine} onChange={(e) => setNewRichiesta({...newRichiesta, data_fine: e.target.value})} />
                    </div>
                  </div>
                  {(newRichiesta.tipo === 'anticipo' || newRichiesta.tipo === 'rimborso') && (
                    <div className="space-y-2">
                      <Label>Importo</Label>
                      <Input type="number" value={newRichiesta.importo} onChange={(e) => setNewRichiesta({...newRichiesta, importo: parseFloat(e.target.value) || 0})} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Descrizione *</Label>
                    <Textarea value={newRichiesta.descrizione} onChange={(e) => setNewRichiesta({...newRichiesta, descrizione: e.target.value})} placeholder="Descrivi la richiesta..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewRichiesta(false)}>Annulla</Button>
                  <Button onClick={() => createRichiesta.mutate(newRichiesta)} disabled={!newRichiesta.dipendente_nome || !newRichiesta.descrizione}>
                    <Save className="w-4 h-4 mr-2" />Invia
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {viewMode === 'table' && (
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
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
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingRichieste ? (
                        <TableRow><TableCell colSpan={8} className="text-center py-8">Caricamento...</TableCell></TableRow>
                      ) : richiesteDipendenti.length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessuna richiesta</TableCell></TableRow>
                      ) : richiesteDipendenti.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono">{r.numero}</TableCell>
                          <TableCell>{formatDate(r.data)}</TableCell>
                          <TableCell>{r.dipendente_nome}</TableCell>
                          <TableCell><Badge className={getTipoRichiestaColor(r.tipo)}>{r.tipo}</Badge></TableCell>
                          <TableCell>
                            {r.data_inizio && r.data_fine ? (
                              <span className="text-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(r.data_inizio)} - {formatDate(r.data_fine)}
                              </span>
                            ) : r.importo ? (
                              <span className="font-medium">{formatCurrency(r.importo)}</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild><span className="block max-w-[200px] truncate">{r.descrizione}</span></TooltipTrigger>
                                <TooltipContent className="max-w-[300px]"><p>{r.descrizione}</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell><Badge className={getStatoColor(r.stato)}>{r.stato.replace('_', ' ')}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {r.stato === 'in_attesa' && (
                                <>
                                  <Button variant="ghost" size="sm" className="h-8 text-emerald-500" onClick={() => updateRichiestaStatus.mutate({ id: r.id, stato: 'approvata' })}>
                                    <CheckCircle className="w-4 h-4 mr-1" />Approva
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 text-red-500" onClick={() => updateRichiestaStatus.mutate({ id: r.id, stato: 'rifiutata' })}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => {
                                  if (confirm('Sei sicuro di voler eliminare questa richiesta?')) {
                                    deleteRichiesta.mutate(r.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'board' && renderBoardView()}
        </TabsContent>

        {/* DDT Tab */}
        <TabsContent value="ddt" className="mt-6">
          <DDTManager />
        </TabsContent>

        {/* Organigramma Tab */}
        <TabsContent value="organigramma" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Organigramma Aziendale</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Struttura organizzativa aziendale</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Esporta PDF</Button>
                <Button className="gap-2"><UserPlus className="w-4 h-4" />Aggiungi Ruolo</Button>
              </div>
            </CardHeader>
            <CardContent>
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
              
              {organigramma.length > 0 ? renderOrganigramma : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun dipendente nell'organigramma</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Visualizza Fattura */}
      <Dialog open={showViewFattura} onOpenChange={setShowViewFattura}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Dettagli Fattura {selectedFattura?.numero}
            </DialogTitle>
          </DialogHeader>
          {selectedFattura && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Numero</Label>
                  <p className="font-mono font-medium">{selectedFattura.numero}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <Badge variant="outline" className={selectedFattura.tipo === 'attiva' ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>
                    {selectedFattura.tipo === 'attiva' ? 'Attiva' : 'Passiva'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Emissione</Label>
                  <p>{formatDate(selectedFattura.data)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Scadenza</Label>
                  <p>{formatDate(selectedFattura.scadenza)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Cliente/Fornitore</Label>
                  <p className="font-medium">{selectedFattura.cliente_fornitore}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Imponibile</Label>
                  <p>{formatCurrency(selectedFattura.imponibile)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IVA ({selectedFattura.aliquota_iva}%)</Label>
                  <p>{formatCurrency(selectedFattura.imponibile * selectedFattura.aliquota_iva / 100)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Totale</Label>
                  <p className="text-xl font-bold text-primary">{formatCurrency(selectedFattura.totale)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge className={getStatoColor(selectedFattura.stato)}>{selectedFattura.stato}</Badge>
                </div>
                {selectedFattura.data_pagamento && (
                  <div>
                    <Label className="text-muted-foreground">Data Pagamento</Label>
                    <p>{formatDate(selectedFattura.data_pagamento)}</p>
                  </div>
                )}
                {selectedFattura.descrizione && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Descrizione</Label>
                    <p className="text-sm">{selectedFattura.descrizione}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowViewFattura(false)}>Chiudi</Button>
                <Button className="flex-1" onClick={() => { setShowViewFattura(false); setShowEditFattura(true); }}>Modifica</Button>
                <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modifica Fattura */}
      <Dialog open={showEditFattura} onOpenChange={setShowEditFattura}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Modifica Fattura</DialogTitle></DialogHeader>
          {selectedFattura && (
            <div className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Numero</Label>
                  <Input value={selectedFattura.numero} disabled />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Input value={selectedFattura.tipo === 'attiva' ? 'Attiva' : 'Passiva'} disabled />
                </div>
              </div>
              <div>
                <Label>Cliente/Fornitore *</Label>
                <Input 
                  value={selectedFattura.cliente_fornitore} 
                  onChange={(e) => setSelectedFattura({ ...selectedFattura, cliente_fornitore: e.target.value })} 
                />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea 
                  value={selectedFattura.descrizione || ''} 
                  onChange={(e) => setSelectedFattura({ ...selectedFattura, descrizione: e.target.value })} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Imponibile €</Label>
                  <Input 
                    type="number" 
                    value={selectedFattura.imponibile} 
                    onChange={(e) => setSelectedFattura({ ...selectedFattura, imponibile: parseFloat(e.target.value) || 0 })} 
                  />
                </div>
                <div>
                  <Label>Aliquota IVA %</Label>
                  <Select 
                    value={String(selectedFattura.aliquota_iva)} 
                    onValueChange={(v) => setSelectedFattura({ ...selectedFattura, aliquota_iva: parseInt(v) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="4">4%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="22">22%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Scadenza</Label>
                <Input 
                  type="date" 
                  value={selectedFattura.scadenza} 
                  onChange={(e) => setSelectedFattura({ ...selectedFattura, scadenza: e.target.value })} 
                />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-muted-foreground">Totale Calcolato</Label>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(selectedFattura.imponibile * (1 + selectedFattura.aliquota_iva / 100))}
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => { setShowEditFattura(false); setSelectedFattura(null); }}>Annulla</Button>
            <Button 
              className="flex-1"
              onClick={() => selectedFattura && updateFattura.mutate({
                id: selectedFattura.id,
                cliente_fornitore: selectedFattura.cliente_fornitore,
                descrizione: selectedFattura.descrizione || '',
                imponibile: selectedFattura.imponibile,
                aliquota_iva: selectedFattura.aliquota_iva,
                scadenza: selectedFattura.scadenza
              })}
              disabled={!selectedFattura?.cliente_fornitore}
            >
              Salva Modifiche
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
