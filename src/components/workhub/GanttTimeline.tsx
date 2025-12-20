import { useMemo, useState, useRef, useCallback } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, formatDateFull } from '@/types/workhub';
import { cn } from '@/lib/utils';
import { StatusPill } from './StatusPill';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, GripHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GanttTimelineProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
}

export function GanttTimeline({ tasks, onTaskClick, onUpdateTask }: GanttTimelineProps) {
  const { cantieri } = useWorkHub();
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [dragging, setDragging] = useState<{
    taskId: string;
    type: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    originalStart: Date;
    originalEnd: Date;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { tasksWithDates, dateRange, weeks, days, totalDays } = useMemo(() => {
    const tasksWithDates = tasks.filter(t => t.startDate || t.dueDate);

    if (tasksWithDates.length === 0) {
      const today = new Date();
      const end = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      return {
        tasksWithDates: [],
        dateRange: { start: today, end },
        weeks: [],
        days: [],
        totalDays: 30
      };
    }

    const allDates = tasksWithDates.flatMap(t => [
      t.startDate ? new Date(t.startDate) : null,
      t.dueDate ? new Date(t.dueDate) : null
    ]).filter(Boolean) as Date[];

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    const weeks: { start: Date; label: string }[] = [];
    const days: { date: Date; label: string; isWeekend: boolean }[] = [];
    const current = new Date(minDate);
    current.setDate(current.getDate() - current.getDay());

    while (current <= maxDate) {
      weeks.push({
        start: new Date(current),
        label: `${current.getDate()}/${current.getMonth() + 1}`
      });
      current.setDate(current.getDate() + 7);
    }

    // Generate days for fine-grained view
    const dayCurrent = new Date(minDate);
    while (dayCurrent <= maxDate) {
      days.push({
        date: new Date(dayCurrent),
        label: `${dayCurrent.getDate()}`,
        isWeekend: dayCurrent.getDay() === 0 || dayCurrent.getDay() === 6
      });
      dayCurrent.setDate(dayCurrent.getDate() + 1);
    }

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      tasksWithDates,
      dateRange: { start: minDate, end: maxDate },
      weeks,
      days,
      totalDays
    };
  }, [tasks]);

  const getCantiereName = (cantiereId?: string) => {
    if (!cantiereId) return null;
    return cantieri.find(c => c.id === cantiereId)?.codiceCommessa;
  };

  const getTaskPosition = useCallback((task: Task) => {
    const start = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : dateRange.start;
    const end = task.dueDate ? new Date(task.dueDate) : task.startDate ? new Date(task.startDate) : dateRange.end;

    const startOffset = Math.ceil((start.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${Math.max((duration / totalDays) * 100, 2)}%`,
      startOffset,
      duration
    };
  }, [dateRange, totalDays]);

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'fatto': return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
      case 'in_corso': return 'bg-gradient-to-r from-sky-400 to-sky-600';
      case 'in_attesa': return 'bg-gradient-to-r from-amber-400 to-amber-600';
      case 'bloccato': return 'bg-gradient-to-r from-red-400 to-red-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  // Drag handlers for moving/resizing tasks
  const handleDragStart = (e: React.MouseEvent, taskId: string, type: 'move' | 'resize-start' | 'resize-end') => {
    e.preventDefault();
    e.stopPropagation();
    
    const task = tasksWithDates.find(t => t.id === taskId);
    if (!task || !onUpdateTask) return;

    setDragging({
      taskId,
      type,
      startX: e.clientX,
      originalStart: task.startDate ? new Date(task.startDate) : new Date(),
      originalEnd: task.dueDate ? new Date(task.dueDate) : new Date()
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !containerRef.current || !onUpdateTask) return;

    const containerWidth = containerRef.current.getBoundingClientRect().width - 256; // Subtract task info column
    const pixelsPerDay = containerWidth / totalDays;
    const deltaX = e.clientX - dragging.startX;
    const deltaDays = Math.round(deltaX / pixelsPerDay);

    if (deltaDays === 0) return;

    const task = tasksWithDates.find(t => t.id === dragging.taskId);
    if (!task) return;

    let newStartDate: Date;
    let newEndDate: Date;

    if (dragging.type === 'move') {
      newStartDate = new Date(dragging.originalStart);
      newStartDate.setDate(newStartDate.getDate() + deltaDays);
      newEndDate = new Date(dragging.originalEnd);
      newEndDate.setDate(newEndDate.getDate() + deltaDays);
    } else if (dragging.type === 'resize-start') {
      newStartDate = new Date(dragging.originalStart);
      newStartDate.setDate(newStartDate.getDate() + deltaDays);
      newEndDate = new Date(dragging.originalEnd);
      // Don't let start go past end
      if (newStartDate >= newEndDate) return;
    } else {
      newStartDate = new Date(dragging.originalStart);
      newEndDate = new Date(dragging.originalEnd);
      newEndDate.setDate(newEndDate.getDate() + deltaDays);
      // Don't let end go before start
      if (newEndDate <= newStartDate) return;
    }

    // Update the task visually during drag (will be persisted on mouseup)
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    onUpdateTask(dragging.taskId, {
      startDate: formatDate(newStartDate),
      dueDate: formatDate(newEndDate)
    });
  }, [dragging, totalDays, tasksWithDates, onUpdateTask]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      toast({
        title: 'Timeline aggiornata',
        description: 'Le date del task sono state modificate'
      });
    }
    setDragging(null);
  }, [dragging, toast]);

  // Attach global listeners for drag
  useState(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  if (tasksWithDates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nessun task con date definite.</p>
        <p className="text-sm mt-1">Aggiungi una data di inizio o scadenza ai task per visualizzarli nella timeline.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="rounded-xl border border-border bg-card overflow-hidden"
      onMouseMove={dragging ? (e) => handleMouseMove(e.nativeEvent) : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setScrollOffset(prev => Math.max(0, prev - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setScrollOffset(prev => prev + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            Trascina le barre per modificare le date
          </span>
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
          const isDraggingThis = dragging?.taskId === task.id;

          return (
            <div
              key={task.id}
              className={cn(
                'flex hover:bg-muted/30 transition-colors',
                isDraggingThis && 'bg-muted/50'
              )}
            >
              {/* Task info */}
              <div 
                className="w-64 flex-shrink-0 p-3 border-r border-border cursor-pointer"
                onClick={() => onTaskClick?.(task)}
              >
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
                    'absolute top-1/2 -translate-y-1/2 h-8 rounded-full',
                    'shadow-lg transition-all',
                    'flex items-center justify-between px-1',
                    getStatusGradient(task.status),
                    isDraggingThis ? 'opacity-80 scale-105' : 'hover:shadow-xl'
                  )}
                  style={{
                    left: position.left,
                    width: position.width,
                    minWidth: '60px',
                    cursor: onUpdateTask ? 'grab' : 'pointer'
                  }}
                  title={`${formatDateFull(task.startDate)} → ${formatDateFull(task.dueDate)}`}
                >
                  {/* Left resize handle */}
                  {onUpdateTask && (
                    <div
                      className="w-3 h-full flex items-center justify-center cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleDragStart(e, task.id, 'resize-start')}
                    >
                      <div className="w-1 h-4 bg-white/60 rounded" />
                    </div>
                  )}

                  {/* Center drag handle */}
                  <div 
                    className="flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing"
                    onMouseDown={onUpdateTask ? (e) => handleDragStart(e, task.id, 'move') : undefined}
                  >
                    <GripHorizontal className="w-4 h-4 text-white/70" />
                  </div>

                  {/* Right resize handle */}
                  {onUpdateTask && (
                    <div
                      className="w-3 h-full flex items-center justify-center cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleDragStart(e, task.id, 'resize-end')}
                    >
                      <div className="w-1 h-4 bg-white/60 rounded" />
                    </div>
                  )}
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
