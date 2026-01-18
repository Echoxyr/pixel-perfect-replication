import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { DataTable, Column } from '@/components/workhub/DataTable';
import { TrafficLight } from '@/components/workhub/StatusPill';
import { Cantiere, formatDateFull, daysUntil } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Building, Users, AlertTriangle, Calendar, FolderKanban, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Cantieri() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    cantieri, 
    imprese, 
    lavoratori, 
    tasks, 
    documenti, 
    addCantiere, 
    getImpreseCantiere, 
    getLavoratoriCantiere, 
    getTasksCantiere,
    getDocumentiCantiere 
  } = useWorkHub();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStato, setFilterStato] = useState<string>('all');
  const [filterCommittente, setFilterCommittente] = useState<string>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  // New cantiere form
  const [formData, setFormData] = useState({
    nome: '',
    codiceCommessa: '',
    indirizzo: '',
    committente: '',
    direttoreLavori: '',
    cse: '',
    csp: '',
    rup: '',
    rsppAffidataria: '',
    prepostoCantiere: '',
    dataApertura: '',
    dataChiusuraPrevista: ''
  });

  // Get unique committenti for filter
  const committenti = useMemo(() => {
    const unique = new Set(cantieri.map(c => c.committente).filter(Boolean));
    return Array.from(unique);
  }, [cantieri]);

  const filteredCantieri = cantieri.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!c.nome.toLowerCase().includes(query) &&
          !c.codiceCommessa.toLowerCase().includes(query) &&
          !c.committente?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filterStato !== 'all' && c.stato !== filterStato) {
      return false;
    }
    if (filterCommittente !== 'all' && c.committente !== filterCommittente) {
      return false;
    }
    return true;
  });

  const getCantiereStats = (cantiereId: string) => {
    const cantiereImprese = getImpreseCantiere(cantiereId);
    const cantiereLavoratori = getLavoratoriCantiere(cantiereId);
    const cantiereTasks = getTasksCantiere(cantiereId);
    const cantiereDocumenti = getDocumentiCantiere(cantiereId);

    const expiredDocs = cantiereDocumenti.filter(d => d.stato === 'scaduto').length;
    const expiringDocs = cantiereDocumenti.filter(d => d.stato === 'in_scadenza').length;
    const missingDocs = cantiereDocumenti.filter(d => d.stato === 'da_richiedere').length;

    let trafficStatus: 'green' | 'yellow' | 'red' = 'green';
    if (expiredDocs > 0 || missingDocs > 0) trafficStatus = 'red';
    else if (expiringDocs > 0) trafficStatus = 'yellow';

    const tasksCompleted = cantiereTasks.filter(t => t.status === 'fatto').length;
    const progress = cantiereTasks.length > 0 
      ? Math.round((tasksCompleted / cantiereTasks.length) * 100) 
      : 0;

    return {
      imprese: cantiereImprese.length,
      lavoratori: cantiereLavoratori.length,
      tasks: cantiereTasks.length,
      tasksDone: tasksCompleted,
      progress,
      expiredDocs,
      expiringDocs,
      missingDocs,
      trafficStatus
    };
  };

  const handleCreate = () => {
    if (!formData.nome || !formData.codiceCommessa) {
      toast({
        title: "Errore",
        description: "Nome e codice commessa sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    addCantiere({
      ...formData,
      stato: 'attivo'
    });

    toast({
      title: "Cantiere creato",
      description: `"${formData.nome}" è stato aggiunto con successo`
    });

    setFormData({
      nome: '',
      codiceCommessa: '',
      indirizzo: '',
      committente: '',
      direttoreLavori: '',
      cse: '',
      csp: '',
      rup: '',
      rsppAffidataria: '',
      prepostoCantiere: '',
      dataApertura: '',
      dataChiusuraPrevista: ''
    });
    setShowNewDialog(false);
  };

  const columns: Column<Cantiere>[] = [
    {
      key: 'status',
      header: '',
      width: '50px',
      render: (cantiere) => {
        const stats = getCantiereStats(cantiere.id);
        return <TrafficLight status={stats.trafficStatus} />;
      }
    },
    {
      key: 'codiceCommessa',
      header: 'Codice',
      width: '110px',
      sortable: true,
      render: (cantiere) => (
        <span className="font-mono font-medium text-primary">
          {cantiere.codiceCommessa}
        </span>
      )
    },
    {
      key: 'nome',
      header: 'Nome / Cliente',
      sortable: true,
      render: (cantiere) => (
        <div>
          <p className="font-medium">{cantiere.nome}</p>
          <p className="text-xs text-muted-foreground">{cantiere.committente || '-'}</p>
        </div>
      )
    },
    {
      key: 'stato',
      header: 'Stato',
      width: '100px',
      render: (cantiere) => (
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full capitalize',
          cantiere.stato === 'attivo' ? 'bg-emerald-500/20 text-emerald-500' :
          cantiere.stato === 'sospeso' ? 'bg-amber-500/20 text-amber-500' :
          'bg-gray-500/20 text-gray-500'
        )}>
          {cantiere.stato}
        </span>
      )
    },
    {
      key: 'dataApertura',
      header: 'Inizio',
      width: '100px',
      render: (cantiere) => (
        <span className="text-sm text-muted-foreground">
          {cantiere.dataApertura ? formatDateFull(cantiere.dataApertura) : '-'}
        </span>
      )
    },
    {
      key: 'dataChiusuraPrevista',
      header: 'Fine Prev.',
      width: '100px',
      render: (cantiere) => {
        if (!cantiere.dataChiusuraPrevista) return <span className="text-sm text-muted-foreground">-</span>;
        const days = daysUntil(cantiere.dataChiusuraPrevista);
        const isOverdue = days !== null && days < 0;
        const isClose = days !== null && days <= 30;
        
        return (
          <span className={cn(
            'text-sm',
            isOverdue ? 'text-red-500' : isClose ? 'text-amber-500' : 'text-muted-foreground'
          )}>
            {formatDateFull(cantiere.dataChiusuraPrevista)}
          </span>
        );
      }
    },
    {
      key: 'progress',
      header: 'Avanzamento',
      width: '120px',
      render: (cantiere) => {
        const stats = getCantiereStats(cantiere.id);
        return (
          <div className="flex items-center gap-2">
            <Progress value={stats.progress} className="h-2 flex-1" />
            <span className="text-xs font-medium w-8">{stats.progress}%</span>
          </div>
        );
      }
    },
    {
      key: 'imprese',
      header: 'Imprese',
      width: '80px',
      render: (cantiere) => {
        const stats = getCantiereStats(cantiere.id);
        return (
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{stats.imprese}</span>
          </div>
        );
      }
    },
    {
      key: 'lavoratori',
      header: 'Lavoratori',
      width: '90px',
      render: (cantiere) => {
        const stats = getCantiereStats(cantiere.id);
        return (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{stats.lavoratori}</span>
          </div>
        );
      }
    },
    {
      key: 'tasks',
      header: 'Task',
      width: '80px',
      render: (cantiere) => {
        const stats = getCantiereStats(cantiere.id);
        return (
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{stats.tasksDone}/{stats.tasks}</span>
          </div>
        );
      }
    },
    {
      key: 'alert',
      header: 'Alert',
      width: '90px',
      render: (cantiere) => {
        const stats = getCantiereStats(cantiere.id);
        const totalProblems = stats.expiredDocs + stats.missingDocs;
        
        if (totalProblems > 0) {
          return (
            <div className="flex items-center gap-1.5 text-red-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">{totalProblems} doc</span>
            </div>
          );
        }
        if (stats.expiringDocs > 0) {
          return (
            <div className="flex items-center gap-1.5 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">{stats.expiringDocs} doc</span>
            </div>
          );
        }
        return <span className="text-xs text-emerald-500">OK</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Tutte le Commesse</h1>
          <p className="text-sm text-muted-foreground">Gestione commesse</p>
        </div>
        <Button 
          onClick={() => setShowNewDialog(true)} 
          className="gap-2 w-full sm:w-auto"
          data-tutorial="btn-nuovo-cantiere"
        >
          <Plus className="w-4 h-4" />
          Nuova Commessa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attivi', value: cantieri.filter(c => c.stato === 'attivo').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Sospesi', value: cantieri.filter(c => c.stato === 'sospeso').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Chiusi', value: cantieri.filter(c => c.stato === 'chiuso').length, color: 'text-gray-500', bg: 'bg-gray-500/10' },
          { label: 'Totale', value: cantieri.length, color: 'text-foreground', bg: 'bg-muted' }
        ].map(stat => (
          <div key={stat.label} className={cn('p-4 rounded-xl border border-border', stat.bg)}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn('text-3xl font-bold', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 min-w-0">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterStato} onValueChange={setFilterStato}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="attivo">Attivi</SelectItem>
              <SelectItem value="sospeso">Sospesi</SelectItem>
              <SelectItem value="chiuso">Chiusi</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCommittente} onValueChange={setFilterCommittente}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              {committenti.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[800px]">
          <DataTable
            data={filteredCantieri}
            columns={columns}
            keyExtractor={(c) => c.id}
            onRowClick={(cantiere) => navigate(`/cantieri/${cantiere.id}`)}
            emptyMessage="Nessun cantiere trovato"
          />
        </div>
      </div>

      {/* New Cantiere Dialog - Wizard Style */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nuova Commessa
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Crea una nuova commessa/cantiere seguendo i passaggi guidati
            </p>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-2">
            {/* Step 1: Dati Base */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                <h3 className="font-semibold">Dati Identificativi della Commessa</h3>
              </div>
              <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Codice Commessa <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="es. 2550_25 (anno_progressivo)"
                    value={formData.codiceCommessa}
                    onChange={(e) => setFormData({ ...formData, codiceCommessa: e.target.value })}
                    className={cn(!formData.codiceCommessa && "border-amber-500/50")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Identificativo univoco della commessa</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Nome Cantiere/Progetto <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="es. Ristrutturazione Palazzo Rossi"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className={cn(!formData.nome && "border-amber-500/50")}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Indirizzo Cantiere</label>
                  <Input
                    placeholder="Via, numero civico, CAP, Città"
                    value={formData.indirizzo}
                    onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Committente / Cliente</label>
                  <Input
                    placeholder="Ragione sociale o nome del committente"
                    value={formData.committente}
                    onChange={(e) => setFormData({ ...formData, committente: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Tempistiche */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</div>
                <h3 className="font-semibold">Tempistiche</h3>
              </div>
              <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Inizio Lavori
                  </label>
                  <Input
                    type="date"
                    value={formData.dataApertura}
                    onChange={(e) => setFormData({ ...formData, dataApertura: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Fine Prevista
                  </label>
                  <Input
                    type="date"
                    value={formData.dataChiusuraPrevista}
                    onChange={(e) => setFormData({ ...formData, dataChiusuraPrevista: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Figure di Cantiere */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</div>
                <h3 className="font-semibold">Figure Professionali (opzionale)</h3>
              </div>
              <p className="ml-11 text-sm text-muted-foreground -mt-2">
                Puoi completare questi dati anche successivamente dalla scheda cantiere
              </p>
              <div className="ml-11 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Direttore Lavori</label>
                  <Input
                    placeholder="Nome e Cognome"
                    value={formData.direttoreLavori}
                    onChange={(e) => setFormData({ ...formData, direttoreLavori: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CSE (Coordinatore Sicurezza)</label>
                  <Input
                    placeholder="Coord. Sicurezza Esecuzione"
                    value={formData.cse}
                    onChange={(e) => setFormData({ ...formData, cse: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CSP (Coordinatore Progettazione)</label>
                  <Input
                    placeholder="Coord. Sicurezza Progettazione"
                    value={formData.csp}
                    onChange={(e) => setFormData({ ...formData, csp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">RUP</label>
                  <Input
                    placeholder="Resp. Unico Procedimento"
                    value={formData.rup}
                    onChange={(e) => setFormData({ ...formData, rup: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">RSPP Affidataria</label>
                  <Input
                    placeholder="RSPP ditta affidataria"
                    value={formData.rsppAffidataria}
                    onChange={(e) => setFormData({ ...formData, rsppAffidataria: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Preposto Cantiere</label>
                  <Input
                    placeholder="Preposto di cantiere"
                    value={formData.prepostoCantiere}
                    onChange={(e) => setFormData({ ...formData, prepostoCantiere: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Cosa succede dopo */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-bold">✓</div>
                <h3 className="font-semibold">Dopo la creazione potrai:</h3>
              </div>
              <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Building className="w-4 h-4 text-primary" />
                  <span>Aggiungere imprese e subappaltatori</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Associare lavoratori al cantiere</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Caricare documenti e contratti</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <FolderKanban className="w-4 h-4 text-primary" />
                  <span>Creare task e gestire avanzamento</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!formData.nome || !formData.codiceCommessa}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Crea Commessa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
