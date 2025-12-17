import { useState, useMemo } from 'react';
import { Task, formatDateFull, daysUntil } from '@/types/workhub';
import { StatusPill } from './StatusPill';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onCreateTask?: (date: string) => void;
}

export function TaskCalendar({ tasks, onTaskClick, onCreateTask }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { days, monthLabel } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    const monthLabel = firstDay.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    return { days, monthLabel };
  }, [currentDate]);

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    if (onCreateTask) {
      onCreateTask(date.toISOString().split('T')[0]);
    }
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold capitalize ml-2">{monthLabel}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Oggi
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground bg-muted/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day.date);
          const today = isToday(day.date);

          return (
            <div
              key={index}
              className={cn(
                'min-h-[100px] p-1 border-r border-b border-border last:border-r-0',
                !day.isCurrentMonth && 'bg-muted/30',
                '[&:nth-child(7n)]:border-r-0'
              )}
            >
              <div className="flex items-center justify-between p-1">
                <span
                  className={cn(
                    'text-sm w-7 h-7 flex items-center justify-center rounded-full',
                    today && 'bg-primary text-primary-foreground',
                    !day.isCurrentMonth && 'text-muted-foreground'
                  )}
                >
                  {day.date.getDate()}
                </span>
                {onCreateTask && day.isCurrentMonth && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={() => handleDayClick(day.date)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-1 mt-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={cn(
                      'w-full text-left text-xs p-1 rounded truncate',
                      task.status === 'fatto'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : task.status === 'bloccato'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                        : task.priority === 'urgente' || task.priority === 'critica'
                        ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                        : 'bg-primary/20 text-primary'
                    )}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{dayTasks.length - 3} altri
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
