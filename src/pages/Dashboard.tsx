import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { StatCard, MiniStat } from '@/components/workhub/StatCard';
import { StatusPill, TrafficLight } from '@/components/workhub/StatusPill';
import { formatDate, formatDateFull, daysUntil, calculateTrafficLight } from '@/types/workhub';
import {
  FolderKanban,
  Building2,
  HardHat,
  Construction,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  X,
  Users,
  FileWarning,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    cantieri,
    imprese,
    lavoratori,
    tasks,
    hseStats,
    documenti,
    formazioni,
    getImpreseCantiere,
    getLavoratoriCantiere,
    getTasksCantiere,
    getDocumentiCantiere,
    getDocumentiImpresa
  } = useWorkHub();

  const [selectedCantiereId, setSelectedCantiereId] = useState<string | null>(null);

  const activeCantieri = cantieri.filter(c => c.stato === 'attivo');
  const openTasks = tasks.filter(t => t.status !== 'fatto');
  
  const tasksByStatus = {
    da_iniziare: tasks.filter(t => t.status === 'da_iniziare').length,
    in_corso: tasks.filter(t => t.status === 'in_corso').length,
    in_attesa: tasks.filter(t => t.status === 'in_attesa').length,
    bloccato: tasks.filter(t => t.status === 'bloccato').length,
    fatto: tasks.filter(t => t.status === 'fatto').length
  };

  const urgentTasks = tasks.filter(t => 
    (t.priority === 'urgente' || t.priority === 'critica') && t.status !== 'fatto'
  );

  const upcomingDeadlines = tasks
    .filter(t => t.dueDate && t.status !== 'fatto')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  // Selected cantiere data - COMPLETELY ISOLATED
  const selectedCantiere = selectedCantiereId 
    ? cantieri.find(c => c.id === selectedCantiereId) 
    : null;

  const cantiereData = useMemo(() => {
    if (!selectedCantiereId) return null;
    
    const cantiereImprese = getImpreseCantiere(selectedCantiereId);
    const cantiereLavoratori = getLavoratoriCantiere(selectedCantiereId);
    const cantiereTasks = getTasksCantiere(selectedCantiereId);
    const cantiereDocumenti = getDocumentiCantiere(selectedCantiereId);

    const tasksCompleted = cantiereTasks.filter(t => t.status === 'fatto').length;
    const progress = cantiereTasks.length > 0 
      ? Math.round((tasksCompleted / cantiereTasks.length) * 100) 
      : 0;

    const docsScaduti = cantiereDocumenti.filter(d => d.stato === 'scaduto').length;
    const docsInScadenza = cantiereDocumenti.filter(d => d.stato === 'in_scadenza').length;

    // Check imprese docs for this cantiere only
    let impreseDocsScaduti = 0;
    let impreseDocsInScadenza = 0;
    cantiereImprese.forEach(imp => {
      const impDocs = getDocumentiImpresa(imp.id);
      impreseDocsScaduti += impDocs.filter(d => d.stato === 'scaduto').length;
      impreseDocsInScadenza += impDocs.filter(d => d.stato === 'in_scadenza').length;
    });

    // Cantiere-specific urgent tasks
    const cantiereUrgentTasks = cantiereTasks.filter(t => 
      (t.priority === 'urgente' || t.priority === 'critica') && t.status !== 'fatto'
    );

    // Cantiere-specific deadlines
    const cantiereDeadlines = cantiereTasks
      .filter(t => t.dueDate && t.status !== 'fatto')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    const totalDocsScaduti = docsScaduti + impreseDocsScaduti;
    const totalDocsInScadenza = docsInScadenza + impreseDocsInScadenza;

    return {
      imprese: cantiereImprese,
      lavoratori: cantiereLavoratori,
      tasks: cantiereTasks,
      documenti: cantiereDocumenti,
      progress,
      tasksCompleted,
      tasksPending: cantiereTasks.length - tasksCompleted,
      tasksBloccati: cantiereTasks.filter(t => t.status === 'bloccato').length,
      docsScaduti: totalDocsScaduti,
      docsInScadenza: totalDocsInScadenza,
      urgentTasks: cantiereUrgentTasks,
      deadlines: cantiereDeadlines,
      status: totalDocsScaduti > 0 ? 'red' : totalDocsInScadenza > 0 ? 'yellow' : 'green'
    };
  }, [selectedCantiereId, documenti, tasks]);

  // Critical items
  const totalCritical = hseStats.documentiScaduti + hseStats.formazioniScadute + hseStats.visiteMedicheScadute;
  const totalWarning = hseStats.documentiInScadenza + hseStats.formazioniInScadenza + hseStats.visiteMedicheInScadenza;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica generale E-gest</p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={selectedCantiereId || ''} 
            onValueChange={(v) => setSelectedCantiereId(v || null)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleziona un cantiere..." />
            </SelectTrigger>
            <SelectContent>
              {activeCantieri.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.codiceCommessa} - {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats - Clickable Cards with Blue Border */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate('/cantieri')}
          className="p-5 rounded-xl border-2 border-primary/50 bg-card card-clickable hover:border-primary shadow-sm hover:shadow-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-sky-500/10">
              <Construction className="w-5 h-5 text-sky-500" />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold mt-3">{activeCantieri.length}</p>
          <p className="text-sm text-muted-foreground">Cantieri Attivi</p>
          <p className="text-xs text-muted-foreground mt-1">{cantieri.length} totali</p>
        </div>

        <div 
          onClick={() => navigate('/progetti?status=open')}
          className="p-5 rounded-xl border-2 border-primary/50 bg-card card-clickable hover:border-primary shadow-sm hover:shadow-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold mt-3">{openTasks.length}</p>
          <p className="text-sm text-muted-foreground">Task Aperti</p>
          <p className="text-xs text-muted-foreground mt-1">
            {tasksByStatus.bloccato > 0 && (
              <span className="text-red-500">{tasksByStatus.bloccato} bloccati</span>
            )}
          </p>
        </div>

        <div 
          onClick={() => navigate('/imprese')}
          className="p-5 rounded-xl border-2 border-primary/50 bg-card card-clickable hover:border-primary shadow-sm hover:shadow-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className={cn(
              'p-2 rounded-lg',
              hseStats.impreseCritical > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
            )}>
              <Building2 className={cn(
                'w-5 h-5',
                hseStats.impreseCritical > 0 ? 'text-red-500' : 'text-emerald-500'
              )} />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold mt-3">{imprese.length}</p>
          <p className="text-sm text-muted-foreground">Imprese Esterne</p>
          {hseStats.impreseCritical > 0 && (
            <p className="text-xs text-red-500 mt-1">{hseStats.impreseCritical} con problemi</p>
          )}
        </div>

        <div 
          onClick={() => navigate('/lavoratori')}
          className="p-5 rounded-xl border-2 border-primary/50 bg-card card-clickable hover:border-primary shadow-sm hover:shadow-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className={cn(
              'p-2 rounded-lg',
              hseStats.lavoratoriCritical > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
            )}>
              <HardHat className={cn(
                'w-5 h-5',
                hseStats.lavoratoriCritical > 0 ? 'text-red-500' : 'text-emerald-500'
              )} />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold mt-3">{lavoratori.length}</p>
          <p className="text-sm text-muted-foreground">Dipendenti</p>
          <p className="text-xs text-emerald-500 mt-1">{hseStats.lavoratoriOk} conformi</p>
        </div>
      </div>

      {/* HSE Alert Banner */}
      {totalCritical > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-4">
          <div className="p-3 rounded-full bg-red-500/20">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-500">Attenzione: Documenti/Formazioni Scaduti</h3>
            <p className="text-sm text-muted-foreground">
              {hseStats.documentiScaduti} documenti, {hseStats.formazioniScadute} formazioni, {hseStats.visiteMedicheScadute} visite mediche scadute
            </p>
          </div>
          <Button 
            onClick={() => navigate('/hse')}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Verifica Subito
          </Button>
        </div>
      )}

      {/* Selected Cantiere Mini-Dashboard - COMPLETELY ISOLATED */}
      {selectedCantiere && cantiereData && (
        <div className="p-5 rounded-xl border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrafficLight status={cantiereData.status as 'green' | 'yellow' | 'red'} />
              <div>
                <h2 className="font-bold text-lg">{selectedCantiere.nome}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedCantiere.codiceCommessa} • {selectedCantiere.committente}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/cantieri/${selectedCantiere.id}`)}
              >
                Dettagli <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedCantiereId(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {/* Progress */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Avanzamento</p>
              <p className="text-2xl font-bold text-primary">{cantiereData.progress}%</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${cantiereData.progress}%` }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Task</p>
              <p className="text-2xl font-bold">{cantiereData.tasks.length}</p>
              <p className="text-xs">
                <span className="text-emerald-500">{cantiereData.tasksCompleted} completati</span>
                {cantiereData.tasksBloccati > 0 && (
                  <span className="text-red-500 ml-2">{cantiereData.tasksBloccati} bloccati</span>
                )}
              </p>
            </div>

            {/* Sicurezza */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Sicurezza</p>
              {cantiereData.docsScaduti > 0 ? (
                <p className="text-2xl font-bold text-red-500">{cantiereData.docsScaduti}</p>
              ) : cantiereData.docsInScadenza > 0 ? (
                <p className="text-2xl font-bold text-amber-500">{cantiereData.docsInScadenza}</p>
              ) : (
                <p className="text-2xl font-bold text-emerald-500">OK</p>
              )}
              <p className="text-xs text-muted-foreground">
                {cantiereData.docsScaduti > 0 ? 'doc. scaduti' : cantiereData.docsInScadenza > 0 ? 'in scadenza' : 'tutto regolare'}
              </p>
            </div>

            {/* Imprese */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Imprese</p>
              <p className="text-2xl font-bold">{cantiereData.imprese.length}</p>
              <p className="text-xs text-muted-foreground">coinvolte</p>
            </div>

            {/* Lavoratori */}
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Lavoratori</p>
              <p className="text-2xl font-bold">{cantiereData.lavoratori.length}</p>
              <p className="text-xs text-muted-foreground">presenti</p>
            </div>
          </div>

          {/* Cantiere-specific lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Urgent Tasks for this cantiere */}
            <div className="p-4 rounded-lg bg-card border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Task Urgenti Cantiere
              </h4>
              {cantiereData.urgentTasks.length > 0 ? (
                <div className="space-y-2">
                  {cantiereData.urgentTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{task.title}</span>
                      <StatusPill type="priority" value={task.priority} size="xs" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nessun task urgente</p>
              )}
            </div>

            {/* Deadlines for this cantiere */}
            <div className="p-4 rounded-lg bg-card border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Scadenze Cantiere
              </h4>
              {cantiereData.deadlines.length > 0 ? (
                <div className="space-y-2">
                  {cantiereData.deadlines.slice(0, 3).map(task => {
                    const days = daysUntil(task.dueDate);
                    return (
                      <div key={task.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{task.title}</span>
                        <span className={cn(
                          "text-xs",
                          days !== null && days < 0 ? 'text-red-500' :
                          days !== null && days <= 3 ? 'text-amber-500' : 'text-muted-foreground'
                        )}>
                          {days !== null && days < 0 ? `${Math.abs(days)}g fa` :
                           days !== null && days === 0 ? 'Oggi' :
                           days !== null ? `${days}g` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nessuna scadenza</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Overview - Moved to secondary */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Stato Task Generale</h2>
            <Link to="/progetti" className="text-sm text-primary hover:underline">
              Gestisci →
            </Link>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {[
              { status: 'da_iniziare', label: 'Da iniziare', color: 'bg-gray-500' },
              { status: 'in_corso', label: 'In corso', color: 'bg-sky-500' },
              { status: 'in_attesa', label: 'In attesa', color: 'bg-amber-500' },
              { status: 'bloccato', label: 'Bloccato', color: 'bg-red-500' },
              { status: 'fatto', label: 'Completato', color: 'bg-emerald-500' }
            ].map(item => (
              <div key={item.status} className="text-center p-3 rounded-lg bg-muted/50">
                <div className={cn('w-3 h-3 rounded-full mx-auto mb-2', item.color)} />
                <p className="text-2xl font-bold">{tasksByStatus[item.status as keyof typeof tasksByStatus]}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HSE Summary */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Sicurezza HSE</h2>
            <Link to="/hse" className="text-sm text-primary hover:underline">
              Dettagli →
            </Link>
          </div>

          <div className="space-y-4">
            {/* Traffic Light */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="text-center">
                <TrafficLight
                  status={totalCritical > 0 ? 'red' : totalWarning > 0 ? 'yellow' : 'green'}
                  size="lg"
                  pulse={totalCritical > 0}
                />
                <p className="text-xs text-muted-foreground mt-2">Stato Generale</p>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
              <MiniStat label="OK" value={hseStats.impreseOk + hseStats.lavoratoriOk} color="success" />
              <MiniStat label="Attenzione" value={totalWarning} color="warning" />
              <MiniStat label="Critico" value={totalCritical} color="danger" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-lg">Task Urgenti/Critici</h2>
          </div>
          
          <div className="space-y-2">
            {urgentTasks.slice(0, 5).map(task => (
              <Link
                key={task.id}
                to="/progetti"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Scadenza: {formatDate(task.dueDate)}
                    </p>
                  )}
                </div>
                <StatusPill type="priority" value={task.priority} size="xs" />
              </Link>
            ))}
            {urgentTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nessun task urgente
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Prossime Scadenze</h2>
          </div>
          
          <div className="space-y-2">
            {upcomingDeadlines.map(task => {
              const days = daysUntil(task.dueDate);
              const isOverdue = days !== null && days < 0;
              const isClose = days !== null && days <= 3;

              return (
                <Link
                  key={task.id}
                  to="/progetti"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateFull(task.dueDate)}
                    </p>
                  </div>
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    isOverdue ? 'bg-red-500/20 text-red-500' :
                    isClose ? 'bg-amber-500/20 text-amber-500' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {isOverdue ? `${Math.abs(days!)}g fa` :
                     days === 0 ? 'Oggi' :
                     days === 1 ? 'Domani' :
                     `${days}g`}
                  </span>
                </Link>
              );
            })}
            {upcomingDeadlines.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nessuna scadenza imminente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
