import { useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, formatDateFull } from '@/types/workhub';
import { cn } from '@/lib/utils';
import { StatusPill } from './StatusPill';

interface GanttTimelineProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function GanttTimeline({ tasks, onTaskClick }: GanttTimelineProps) {
  const { cantieri } = useWorkHub();

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
      {/* Header with weeks */}
      <div className="flex border-b border-border bg-muted/50">
        <div className="w-64 flex-shrink-0 p-3 border-r border-border font-medium text-sm">
          Task
        </div>
        <div className="flex-1 flex">
          {weeks.map((week, i) => (
            <div
              key={i}
              className="flex-1 p-2 text-center text-xs text-muted-foreground border-r border-border last:border-0"
            >
              {week.label}
            </div>
          ))}
        </div>
      </div>

      {/* Task rows */}
      <div className="divide-y divide-border">
        {tasksWithDates.map((task) => {
          const position = getTaskPosition(task);

          return (
            <div
              key={task.id}
              className="flex hover:bg-muted/30 transition-colors"
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
              <div className="flex-1 relative p-2">
                <div
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer',
                    'hover:opacity-80 transition-opacity',
                    getStatusColor(task.status)
                  )}
                  style={{
                    left: position.left,
                    width: position.width,
                    minWidth: '20px'
                  }}
                  title={`${formatDateFull(task.startDate)} → ${formatDateFull(task.dueDate)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">Legenda:</span>
        {[
          { status: 'da_iniziare', label: 'Da iniziare', color: 'bg-gray-500' },
          { status: 'in_corso', label: 'In corso', color: 'bg-sky-500' },
          { status: 'in_attesa', label: 'In attesa', color: 'bg-amber-500' },
          { status: 'bloccato', label: 'Bloccato', color: 'bg-red-500' },
          { status: 'fatto', label: 'Completato', color: 'bg-emerald-500' },
        ].map(item => (
          <div key={item.status} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded', item.color)} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
