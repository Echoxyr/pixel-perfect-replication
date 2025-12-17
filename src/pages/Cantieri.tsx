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
import { Plus, Search, Building, Users, AlertTriangle, Calendar, FolderKanban } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutti i Cantieri</h1>
          <p className="text-muted-foreground">Gestione commesse e cantieri</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuovo Cantiere
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
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, codice, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStato} onValueChange={setFilterStato}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="attivo">Attivi</SelectItem>
            <SelectItem value="sospeso">Sospesi</SelectItem>
            <SelectItem value="chiuso">Chiusi</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCommittente} onValueChange={setFilterCommittente}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i clienti</SelectItem>
            {committenti.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        data={filteredCantieri}
        columns={columns}
        keyExtractor={(c) => c.id}
        onRowClick={(cantiere) => navigate(`/cantieri/${cantiere.id}`)}
        emptyMessage="Nessun cantiere trovato"
      />

      {/* New Cantiere Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo Cantiere</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Codice Commessa *</label>
                <Input
                  placeholder="es. 2550_25"
                  value={formData.codiceCommessa}
                  onChange={(e) => setFormData({ ...formData, codiceCommessa: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Nome Cantiere *</label>
                <Input
                  placeholder="Nome del cantiere"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Indirizzo</label>
              <Input
                placeholder="Indirizzo completo"
                value={formData.indirizzo}
                onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Committente</label>
              <Input
                placeholder="Nome committente / cliente"
                value={formData.committente}
                onChange={(e) => setFormData({ ...formData, committente: e.target.value })}
              />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Figure di Cantiere</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Direttore Lavori</label>
                  <Input
                    placeholder="Nome DL"
                    value={formData.direttoreLavori}
                    onChange={(e) => setFormData({ ...formData, direttoreLavori: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CSE</label>
                  <Input
                    placeholder="Coordinatore Sicurezza Esecuzione"
                    value={formData.cse}
                    onChange={(e) => setFormData({ ...formData, cse: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CSP</label>
                  <Input
                    placeholder="Coordinatore Sicurezza Progettazione"
                    value={formData.csp}
                    onChange={(e) => setFormData({ ...formData, csp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">RUP</label>
                  <Input
                    placeholder="Responsabile Unico Procedimento"
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
                    placeholder="Nome preposto"
                    value={formData.prepostoCantiere}
                    onChange={(e) => setFormData({ ...formData, prepostoCantiere: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Date</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Data Apertura</label>
                  <Input
                    type="date"
                    value={formData.dataApertura}
                    onChange={(e) => setFormData({ ...formData, dataApertura: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Chiusura Prevista</label>
                  <Input
                    type="date"
                    value={formData.dataChiusuraPrevista}
                    onChange={(e) => setFormData({ ...formData, dataChiusuraPrevista: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreate} disabled={!formData.nome || !formData.codiceCommessa}>
              Crea Cantiere
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
