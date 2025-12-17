import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { formatDateFull, daysUntil, generateId } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Stethoscope,
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
  User,
  Phone,
  Mail
} from 'lucide-react';

// Tipi di visita medica secondo D.Lgs 81/2008
const TIPI_VISITA = [
  { id: 'preventiva', nome: 'Visita Preventiva', descrizione: 'Prima dell\'assunzione o cambio mansione' },
  { id: 'periodica', nome: 'Visita Periodica', descrizione: 'Controllo periodico secondo protocollo' },
  { id: 'richiesta_lavoratore', nome: 'Richiesta Lavoratore', descrizione: 'Su richiesta del lavoratore' },
  { id: 'cambio_mansione', nome: 'Cambio Mansione', descrizione: 'Per verifica idoneità nuova mansione' },
  { id: 'dopo_assenza', nome: 'Dopo Assenza Prolungata', descrizione: 'Dopo assenza > 60 giorni' },
  { id: 'cessazione', nome: 'Cessazione Rapporto', descrizione: 'Visita di fine rapporto' },
];

const GIUDIZI_IDONEITA = [
  { id: 'idoneo', nome: 'Idoneo', color: 'emerald' },
  { id: 'idoneo_con_prescrizioni', nome: 'Idoneo con Prescrizioni', color: 'amber' },
  { id: 'idoneo_con_limitazioni', nome: 'Idoneo con Limitazioni', color: 'amber' },
  { id: 'non_idoneo_temporaneo', nome: 'Non Idoneo Temporaneo', color: 'red' },
  { id: 'non_idoneo_permanente', nome: 'Non Idoneo Permanente', color: 'red' },
];

interface VisitaMedica {
  id: string;
  lavoratoreId: string;
  tipoVisita: string;
  dataVisita: string;
  dataScadenza: string;
  medicoCompetente: string;
  giudizioIdoneita: string;
  prescrizioni?: string;
  limitazioni?: string;
  note?: string;
  allegatiUrl?: string[];
}

interface MedicoCompetente {
  id: string;
  nome: string;
  cognome: string;
  specializzazione: string;
  telefono: string;
  email: string;
  ordine: string;
  numeroIscrizione: string;
}

export default function SorveglianzaSanitaria() {
  const { lavoratori, imprese } = useWorkHub();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterImpresa, setFilterImpresa] = useState<string>('all');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [filterGiudizio, setFilterGiudizio] = useState<string>('all');
  const [showNewVisitaDialog, setShowNewVisitaDialog] = useState(false);

  // Mock data visite mediche
  const [visiteMediche, setVisiteMediche] = useState<VisitaMedica[]>(
    lavoratori.slice(0, 6).map((l, i) => ({
      id: generateId(),
      lavoratoreId: l.id,
      tipoVisita: i % 2 === 0 ? 'periodica' : 'preventiva',
      dataVisita: new Date(Date.now() - (i * 60 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
      dataScadenza: new Date(Date.now() + ((365 - i * 60) * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
      medicoCompetente: 'Dr. Marco Bianchi',
      giudizioIdoneita: i === 2 ? 'idoneo_con_prescrizioni' : i === 4 ? 'idoneo_con_limitazioni' : 'idoneo',
      prescrizioni: i === 2 ? 'Evitare sollevamento carichi > 15kg' : undefined,
      limitazioni: i === 4 ? 'Non adibire a lavori in quota' : undefined,
    }))
  );

  // Mock medici competenti
  const [medici] = useState<MedicoCompetente[]>([
    { id: '1', nome: 'Marco', cognome: 'Bianchi', specializzazione: 'Medicina del Lavoro', telefono: '02 1234567', email: 'dr.bianchi@example.com', ordine: 'Milano', numeroIscrizione: '12345' },
    { id: '2', nome: 'Laura', cognome: 'Rossi', specializzazione: 'Medicina del Lavoro', telefono: '02 7654321', email: 'dr.rossi@example.com', ordine: 'Milano', numeroIscrizione: '67890' },
  ]);

  const [newVisita, setNewVisita] = useState({
    lavoratoreId: '',
    tipoVisita: '',
    dataVisita: '',
    medicoCompetente: '',
    giudizioIdoneita: '',
    prescrizioni: '',
    limitazioni: '',
    note: ''
  });

  // Calcola stato visita
  const getStatoVisita = (dataScadenza: string) => {
    const days = daysUntil(dataScadenza);
    if (days < 0) return 'scaduta';
    if (days <= 30) return 'in_scadenza';
    return 'valida';
  };

  // Statistiche
  const stats = useMemo(() => {
    const total = visiteMediche.length;
    const valide = visiteMediche.filter(v => getStatoVisita(v.dataScadenza) === 'valida').length;
    const inScadenza = visiteMediche.filter(v => getStatoVisita(v.dataScadenza) === 'in_scadenza').length;
    const scadute = visiteMediche.filter(v => getStatoVisita(v.dataScadenza) === 'scaduta').length;
    
    const idonei = visiteMediche.filter(v => v.giudizioIdoneita === 'idoneo').length;
    const conPrescrizioni = visiteMediche.filter(v => v.giudizioIdoneita === 'idoneo_con_prescrizioni' || v.giudizioIdoneita === 'idoneo_con_limitazioni').length;
    const nonIdonei = visiteMediche.filter(v => v.giudizioIdoneita.startsWith('non_idoneo')).length;
    
    const lavoratoriSenzaVisita = lavoratori.filter(l => !visiteMediche.some(v => v.lavoratoreId === l.id)).length;
    
    return { total, valide, inScadenza, scadute, idonei, conPrescrizioni, nonIdonei, lavoratoriSenzaVisita };
  }, [visiteMediche, lavoratori]);

  // Filtra visite
  const filteredVisite = useMemo(() => {
    return visiteMediche.filter(v => {
      const lavoratore = lavoratori.find(l => l.id === v.lavoratoreId);
      if (!lavoratore) return false;
      
      if (filterImpresa !== 'all' && lavoratore.impresaId !== filterImpresa) return false;
      
      const stato = getStatoVisita(v.dataScadenza);
      if (filterStato !== 'all' && stato !== filterStato) return false;
      
      if (filterGiudizio !== 'all' && v.giudizioIdoneita !== filterGiudizio) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${lavoratore.nome} ${lavoratore.cognome}`.toLowerCase();
        if (!fullName.includes(query)) return false;
      }
      
      return true;
    });
  }, [visiteMediche, lavoratori, filterImpresa, filterStato, filterGiudizio, searchQuery]);

  const getLavoratore = (id: string) => lavoratori.find(l => l.id === id);
  const getImpresa = (id?: string) => imprese.find(i => i.id === id);
  const getGiudizioInfo = (id: string) => GIUDIZI_IDONEITA.find(g => g.id === id);
  const getTipoVisitaInfo = (id: string) => TIPI_VISITA.find(t => t.id === id);

  const handleSaveVisita = () => {
    if (!newVisita.lavoratoreId || !newVisita.tipoVisita || !newVisita.dataVisita || !newVisita.giudizioIdoneita) {
      toast({ title: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }
    
    // Calcola scadenza (default 1 anno)
    const dataScadenza = new Date(newVisita.dataVisita);
    dataScadenza.setFullYear(dataScadenza.getFullYear() + 1);
    
    const nuovaVisita: VisitaMedica = {
      id: generateId(),
      ...newVisita,
      dataScadenza: dataScadenza.toISOString().slice(0, 10)
    };
    
    setVisiteMediche([...visiteMediche, nuovaVisita]);
    toast({ title: 'Visita medica registrata con successo' });
    setShowNewVisitaDialog(false);
    setNewVisita({ lavoratoreId: '', tipoVisita: '', dataVisita: '', medicoCompetente: '', giudizioIdoneita: '', prescrizioni: '', limitazioni: '', note: '' });
  };

  const conformityRate = lavoratori.length > 0 
    ? Math.round(((lavoratori.length - stats.scadute - stats.lavoratoriSenzaVisita) / lavoratori.length) * 100) 
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            Sorveglianza Sanitaria
          </h1>
          <p className="text-muted-foreground">Visite mediche e idoneità lavorative - D.Lgs 81/2008</p>
        </div>
        <Button onClick={() => setShowNewVisitaDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuova Visita
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Lavoratori</span>
          </div>
          <p className="text-2xl font-bold">{lavoratori.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-500">Visite Valide</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.valide}</p>
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
            <span className="text-xs text-red-500">Scadute</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.scadute}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-emerald-500">Idonei</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.idonei}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-amber-500">Con Prescrizioni</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{stats.conPrescrizioni}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-red-500">Senza Visita</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.lavoratoriSenzaVisita}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">Conformità</span>
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
        <Select value={filterStato} onValueChange={setFilterStato}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="valida">✅ Valida</SelectItem>
            <SelectItem value="in_scadenza">⚠️ In scadenza</SelectItem>
            <SelectItem value="scaduta">🔴 Scaduta</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterGiudizio} onValueChange={setFilterGiudizio}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Giudizio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i giudizi</SelectItem>
            {GIUDIZI_IDONEITA.map(g => (
              <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca lavoratore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visite" className="w-full">
        <TabsList>
          <TabsTrigger value="visite">Visite Mediche</TabsTrigger>
          <TabsTrigger value="scadenziario">Scadenziario</TabsTrigger>
          <TabsTrigger value="medici">Medici Competenti</TabsTrigger>
        </TabsList>

        <TabsContent value="visite" className="mt-6">
          <div className="space-y-4">
            {filteredVisite.map(visita => {
              const lavoratore = getLavoratore(visita.lavoratoreId);
              const impresa = getImpresa(lavoratore?.impresaId);
              const giudizio = getGiudizioInfo(visita.giudizioIdoneita);
              const tipoVisita = getTipoVisitaInfo(visita.tipoVisita);
              const stato = getStatoVisita(visita.dataScadenza);
              if (!lavoratore) return null;

              return (
                <div key={visita.id} className={cn(
                  'p-4 rounded-xl border bg-card',
                  stato === 'scaduta' ? 'border-red-500/50' :
                  stato === 'in_scadenza' ? 'border-amber-500/50' :
                  'border-border'
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold',
                        stato === 'scaduta' ? 'bg-red-500/20 text-red-500' :
                        stato === 'in_scadenza' ? 'bg-amber-500/20 text-amber-500' :
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
                        <p className="text-sm text-muted-foreground">
                          {tipoVisita?.nome} - {visita.medicoCompetente}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        giudizio?.color === 'emerald' && 'bg-emerald-500/20 text-emerald-500',
                        giudizio?.color === 'amber' && 'bg-amber-500/20 text-amber-500',
                        giudizio?.color === 'red' && 'bg-red-500/20 text-red-500'
                      )}>
                        {giudizio?.nome}
                      </Badge>
                      <p className="text-sm mt-2">
                        Visita: {formatDateFull(visita.dataVisita)}
                      </p>
                      <p className={cn(
                        'text-sm font-medium',
                        stato === 'scaduta' ? 'text-red-500' :
                        stato === 'in_scadenza' ? 'text-amber-500' : 'text-muted-foreground'
                      )}>
                        Scadenza: {formatDateFull(visita.dataScadenza)}
                      </p>
                    </div>
                  </div>
                  {(visita.prescrizioni || visita.limitazioni) && (
                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visita.prescrizioni && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                          <p className="text-xs font-semibold text-amber-500 mb-1">Prescrizioni</p>
                          <p className="text-sm">{visita.prescrizioni}</p>
                        </div>
                      )}
                      {visita.limitazioni && (
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                          <p className="text-xs font-semibold text-red-500 mb-1">Limitazioni</p>
                          <p className="text-sm">{visita.limitazioni}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scadenziario" className="mt-6">
          <div className="space-y-6">
            {/* Scadute */}
            {stats.scadute > 0 && (
              <div>
                <h3 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Visite Scadute ({stats.scadute})
                </h3>
                <div className="space-y-2">
                  {visiteMediche.filter(v => getStatoVisita(v.dataScadenza) === 'scaduta').map(v => {
                    const lavoratore = getLavoratore(v.lavoratoreId);
                    return (
                      <div key={v.id} className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lavoratore?.cognome} {lavoratore?.nome}</p>
                          <p className="text-sm text-muted-foreground">{v.medicoCompetente}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-500 font-medium">
                            Scaduta il {formatDateFull(v.dataScadenza)}
                          </p>
                          <Button size="sm" variant="destructive" className="mt-1">
                            Prenota Visita
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
                  {visiteMediche.filter(v => getStatoVisita(v.dataScadenza) === 'in_scadenza').map(v => {
                    const lavoratore = getLavoratore(v.lavoratoreId);
                    const days = daysUntil(v.dataScadenza);
                    return (
                      <div key={v.id} className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lavoratore?.cognome} {lavoratore?.nome}</p>
                          <p className="text-sm text-muted-foreground">{v.medicoCompetente}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-amber-500 font-medium">
                            Scade tra {days} giorni
                          </p>
                          <Button size="sm" variant="outline" className="mt-1">
                            Prenota Visita
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lavoratori senza visita */}
            {stats.lavoratoriSenzaVisita > 0 && (
              <div>
                <h3 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Lavoratori Senza Visita ({stats.lavoratoriSenzaVisita})
                </h3>
                <div className="space-y-2">
                  {lavoratori.filter(l => !visiteMediche.some(v => v.lavoratoreId === l.id)).map(l => (
                    <div key={l.id} className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{l.cognome} {l.nome}</p>
                        <p className="text-sm text-muted-foreground">{l.mansione}</p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Prenota Visita Preventiva
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="medici" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medici.map(medico => (
              <div key={medico.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Dr. {medico.cognome} {medico.nome}</h3>
                    <p className="text-sm text-muted-foreground">{medico.specializzazione}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ordine {medico.ordine} - N° {medico.numeroIscrizione}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <a href={`tel:${medico.telefono}`} className="flex items-center gap-1 text-primary hover:underline">
                        <Phone className="w-3 h-3" />
                        {medico.telefono}
                      </a>
                      <a href={`mailto:${medico.email}`} className="flex items-center gap-1 text-primary hover:underline">
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Nuova Visita */}
      <Dialog open={showNewVisitaDialog} onOpenChange={setShowNewVisitaDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registra Nuova Visita Medica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label>Lavoratore *</Label>
              <Select value={newVisita.lavoratoreId} onValueChange={(v) => setNewVisita({...newVisita, lavoratoreId: v})}>
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
              <Label>Tipo Visita *</Label>
              <Select value={newVisita.tipoVisita} onValueChange={(v) => setNewVisita({...newVisita, tipoVisita: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_VISITA.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Visita *</Label>
              <Input 
                type="date"
                value={newVisita.dataVisita}
                onChange={(e) => setNewVisita({...newVisita, dataVisita: e.target.value})}
              />
            </div>
            <div>
              <Label>Medico Competente</Label>
              <Select value={newVisita.medicoCompetente} onValueChange={(v) => setNewVisita({...newVisita, medicoCompetente: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona medico" />
                </SelectTrigger>
                <SelectContent>
                  {medici.map(m => (
                    <SelectItem key={m.id} value={`Dr. ${m.cognome} ${m.nome}`}>Dr. {m.cognome} {m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giudizio Idoneità *</Label>
              <Select value={newVisita.giudizioIdoneita} onValueChange={(v) => setNewVisita({...newVisita, giudizioIdoneita: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona giudizio" />
                </SelectTrigger>
                <SelectContent>
                  {GIUDIZI_IDONEITA.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(newVisita.giudizioIdoneita === 'idoneo_con_prescrizioni' || newVisita.giudizioIdoneita === 'idoneo_con_limitazioni') && (
              <>
                <div>
                  <Label>Prescrizioni</Label>
                  <Textarea 
                    value={newVisita.prescrizioni}
                    onChange={(e) => setNewVisita({...newVisita, prescrizioni: e.target.value})}
                    placeholder="Eventuali prescrizioni del medico"
                  />
                </div>
                <div>
                  <Label>Limitazioni</Label>
                  <Textarea 
                    value={newVisita.limitazioni}
                    onChange={(e) => setNewVisita({...newVisita, limitazioni: e.target.value})}
                    placeholder="Eventuali limitazioni"
                  />
                </div>
              </>
            )}
            <div>
              <Label>Note</Label>
              <Textarea 
                value={newVisita.note}
                onChange={(e) => setNewVisita({...newVisita, note: e.target.value})}
                placeholder="Note aggiuntive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewVisitaDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveVisita}>Salva Visita</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
