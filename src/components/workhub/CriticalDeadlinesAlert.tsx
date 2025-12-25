import { useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertTriangle,
  FileWarning,
  GraduationCap,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { daysUntil } from '@/types/workhub';

interface CriticalItem {
  id: string;
  tipo: 'documento' | 'formazione' | 'visita';
  titolo: string;
  entita: string;
  scadenza: string;
  giorni: number;
  urgenza: 'scaduto' | 'critico' | 'attenzione';
}

export function CriticalDeadlinesAlert() {
  const navigate = useNavigate();
  const { documenti, formazioni, lavoratori, hseStats } = useWorkHub();

  const criticalItems = useMemo(() => {
    const items: CriticalItem[] = [];

    // Documenti scaduti o in scadenza
    documenti.forEach(doc => {
      if (doc.stato === 'scaduto' || doc.stato === 'in_scadenza') {
        const scadenzaDate = doc.dataScadenza || '';
        const giorni = daysUntil(scadenzaDate) ?? 0;
        items.push({
          id: doc.id,
          tipo: 'documento',
          titolo: doc.nome,
          entita: doc.entitaTipo || '',
          scadenza: scadenzaDate,
          giorni,
          urgenza: giorni < 0 ? 'scaduto' : giorni <= 7 ? 'critico' : 'attenzione',
        });
      }
    });

    // Formazioni scadute o in scadenza
    formazioni.forEach(form => {
      if (form.stato === 'scaduto' || form.stato === 'in_scadenza') {
        const scadenzaDate = form.dataScadenza || '';
        const giorni = daysUntil(scadenzaDate) ?? 0;
        const lavoratore = lavoratori.find(l => l.id === form.lavoratoreId);
        items.push({
          id: form.id,
          tipo: 'formazione',
          titolo: form.nomeCorso,
          entita: lavoratore ? `${lavoratore.nome} ${lavoratore.cognome}` : 'N/A',
          scadenza: scadenzaDate,
          giorni,
          urgenza: giorni < 0 ? 'scaduto' : giorni <= 7 ? 'critico' : 'attenzione',
        });
      }
    });

    // Sort by urgency and days
    return items.sort((a, b) => {
      if (a.urgenza === 'scaduto' && b.urgenza !== 'scaduto') return -1;
      if (b.urgenza === 'scaduto' && a.urgenza !== 'scaduto') return 1;
      return a.giorni - b.giorni;
    }).slice(0, 20);
  }, [documenti, formazioni, lavoratori]);

  const totalCritical = hseStats.documentiScaduti + hseStats.formazioniScadute + hseStats.visiteMedicheScadute;
  const totalWarning = hseStats.documentiInScadenza + hseStats.formazioniInScadenza + hseStats.visiteMedicheInScadenza;

  if (totalCritical + totalWarning === 0) return null;

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'documento': return FileWarning;
      case 'formazione': return GraduationCap;
      case 'visita': return Stethoscope;
      default: return AlertTriangle;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative gap-2',
            totalCritical > 0 ? 'text-red-500 hover:text-red-600' : 'text-amber-500 hover:text-amber-600'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">Scadenze</span>
          <Badge 
            variant="destructive" 
            className={cn(
              'ml-1',
              totalCritical > 0 ? 'bg-red-500' : 'bg-amber-500'
            )}
          >
            {totalCritical + totalWarning}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Scadenze Critiche
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-red-500/10 text-center">
              <p className="text-2xl font-bold text-red-500">{totalCritical}</p>
              <p className="text-xs text-muted-foreground">Scaduti</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-center">
              <p className="text-2xl font-bold text-amber-500">{totalWarning}</p>
              <p className="text-xs text-muted-foreground">In Scadenza</p>
            </div>
            <div className="p-3 rounded-lg bg-muted text-center">
              <p className="text-2xl font-bold">{criticalItems.length}</p>
              <p className="text-xs text-muted-foreground">Totale</p>
            </div>
          </div>

          {/* List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {criticalItems.map(item => {
                const Icon = getIcon(item.tipo);
                return (
                  <div
                    key={`${item.tipo}-${item.id}`}
                    className={cn(
                      'p-3 rounded-lg border flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors',
                      item.urgenza === 'scaduto' && 'border-red-500/30 bg-red-500/5',
                      item.urgenza === 'critico' && 'border-amber-500/30 bg-amber-500/5',
                      item.urgenza === 'attenzione' && 'border-border'
                    )}
                    onClick={() => {
                      if (item.tipo === 'documento') navigate('/hse');
                      if (item.tipo === 'formazione') navigate('/formazione');
                      if (item.tipo === 'visita') navigate('/sorveglianza-sanitaria');
                    }}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      item.urgenza === 'scaduto' && 'bg-red-500/20 text-red-500',
                      item.urgenza === 'critico' && 'bg-amber-500/20 text-amber-500',
                      item.urgenza === 'attenzione' && 'bg-muted text-muted-foreground'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.titolo}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.entita}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.urgenza === 'scaduto' ? 'destructive' : 'secondary'}>
                        {item.giorni < 0 ? `${Math.abs(item.giorni)}g fa` : 
                         item.giorni === 0 ? 'Oggi' : `${item.giorni}g`}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Action */}
          <Button className="w-full" onClick={() => navigate('/hse')}>
            Vai a Dashboard HSE
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
