import { useMemo, useState } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, formatDateFull } from '@/types/workhub';
import { cn } from '@/lib/utils';
import { StatusPill } from './StatusPill';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface GanttTimelineProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
}

export function GanttTimeline({ tasks, onTaskClick, onUpdateTask }: GanttTimelineProps) {
  const { cantieri } = useWorkHub();
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = week, 2 = day view
  const [scrollOffset, setScrollOffset] = useState(0);

  const { tasksWithDates, dateRange, weeks } = useMemo(() => {
    // Filter tasks with dates
    const tasksWithDates = tasks.filter(t => t.startDate || t.dueDate);

    if (tasksWithDates.length === 0) {
      const today = new Date();
      return {
        tasksWithDates: [],
        dateRange: { start: today, end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) },
        weeks: []
      };
    }

    // Calculate date range
    const allDates = tasksWithDates.flatMap(t => [
      t.startDate ? new Date(t.startDate) : null,
      t.dueDate ? new Date(t.dueDate) : null
    ]).filter(Boolean) as Date[];

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    // Generate weeks
    const weeks: { start: Date; label: string }[] = [];
    const current = new Date(minDate);
    current.setDate(current.getDate() - current.getDay()); // Start from Sunday

    while (current <= maxDate) {
      weeks.push({
        start: new Date(current),
        label: `${current.getDate()}/${current.getMonth() + 1}`
      });
      current.setDate(current.getDate() + 7);
    }

    return {
      tasksWithDates,
      dateRange: { start: minDate, end: maxDate },
      weeks
    };
  }, [tasks]);

  const getCantiereName = (cantiereId?: string) => {
    if (!cantiereId) return null;
    const cantiere = cantieri.find(c => c.id === cantiereId);
    return cantiere?.codiceCommessa;
  };

  const getTaskPosition = (task: Task) => {
    const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    const start = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : dateRange.start;
    const end = task.dueDate ? new Date(task.dueDate) : task.startDate ? new Date(task.startDate) : dateRange.end;

    const startOffset = Math.ceil((start.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${Math.max((duration / totalDays) * 100, 2)}%`
    };
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'fatto': return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
      case 'in_corso': return 'bg-gradient-to-r from-sky-400 to-sky-600';
      case 'in_attesa': return 'bg-gradient-to-r from-amber-400 to-amber-600';
      case 'bloccato': return 'bg-gradient-to-r from-red-400 to-red-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fatto': return 'bg-emerald-500';
      case 'in_corso': return 'bg-sky-500';
      case 'in_attesa': return 'bg-amber-500';
      case 'bloccato': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (tasksWithDates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nessun task con date definite.</p>
        <p className="text-sm mt-1">Aggiungi una data di inizio o scadenza ai task per visualizzarli nella timeline.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setScrollOffset(prev => Math.max(0, prev - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setScrollOffset(prev => prev + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Header with weeks */}
      <div className="flex border-b border-border bg-muted/50">
        <div className="w-64 flex-shrink-0 p-3 border-r border-border font-medium text-sm">
          Task
        </div>
        <div className="flex-1 flex overflow-hidden">
          {weeks.map((week, i) => (
            <div
              key={i}
              className="p-2 text-center text-xs text-muted-foreground border-r border-border last:border-0"
              style={{ minWidth: `${80 * zoomLevel}px`, flex: `0 0 ${80 * zoomLevel}px` }}
            >
              {week.label}
            </div>
          ))}
        </div>
      </div>

      {/* Task rows */}
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {tasksWithDates.map((task) => {
          const position = getTaskPosition(task);

          return (
            <div
              key={task.id}
              className="flex hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onTaskClick?.(task)}
            >
              {/* Task info */}
              <div className="w-64 flex-shrink-0 p-3 border-r border-border">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill type="task" value={task.status} size="xs" />
                  {getCantiereName(task.cantiereId) && (
                    <span className="text-xs text-muted-foreground">
                      {getCantiereName(task.cantiereId)}
                    </span>
                  )}
                </div>
              </div>

              {/* Timeline bar */}
              <div className="flex-1 relative py-2 px-1 overflow-hidden">
                <div
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 h-8 rounded-full cursor-pointer',
                    'shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]',
                    'flex items-center justify-center',
                    getStatusGradient(task.status)
                  )}
                  style={{
                    left: position.left,
                    width: position.width,
                    minWidth: '40px'
                  }}
                  title={`${formatDateFull(task.startDate)} → ${formatDateFull(task.dueDate)}`}
                >
                  {/* Progress indicator dots */}
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                    <div className="w-2 h-2 rounded-full bg-white/60" />
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">Legenda:</span>
        {[
          { status: 'da_iniziare', label: 'Da iniziare', gradient: 'bg-gradient-to-r from-gray-400 to-gray-600' },
          { status: 'in_corso', label: 'In corso', gradient: 'bg-gradient-to-r from-sky-400 to-sky-600' },
          { status: 'in_attesa', label: 'In attesa', gradient: 'bg-gradient-to-r from-amber-400 to-amber-600' },
          { status: 'bloccato', label: 'Bloccato', gradient: 'bg-gradient-to-r from-red-400 to-red-600' },
          { status: 'fatto', label: 'Completato', gradient: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
        ].map(item => (
          <div key={item.status} className="flex items-center gap-1.5">
            <div className={cn('w-6 h-3 rounded-full', item.gradient)} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
