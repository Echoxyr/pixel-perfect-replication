import { useState, useMemo } from 'react';
import { Task, formatDateFull, daysUntil } from '@/types/workhub';
import { StatusPill } from './StatusPill';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle
} from 'lucide-react';

interface InteractiveCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onCreateTask?: (date: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
}

export function InteractiveCalendar({ 
  tasks, 
  onTaskClick, 
  onCreateTask,
  onUpdateTask,
  onDeleteTask 
}: InteractiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

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
    return tasks.filter(t => t.dueDate === dateStr || t.startDate === dateStr);
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

  const handleDayClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowTaskDialog(true);
  };

  const handleCreateQuickTask = () => {
    if (onCreateTask && selectedDate && newTaskTitle.trim()) {
      onCreateTask(selectedDate);
      setNewTaskTitle('');
      setShowTaskDialog(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedTask && onUpdateTask) {
      const newDateStr = date.toISOString().split('T')[0];
      onUpdateTask(draggedTask.id, { dueDate: newDateStr });
    }
    setDraggedTask(null);
  };

  const handleTaskStatusToggle = (task: Task) => {
    if (onUpdateTask) {
      const newStatus = task.status === 'fatto' ? 'da_iniziare' : 'fatto';
      onUpdateTask(task.id, { status: newStatus });
    }
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  const getTaskColor = (task: Task) => {
    if (task.status === 'fatto') return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300';
    if (task.status === 'bloccato') return 'bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300';
    if (task.priority === 'urgente' || task.priority === 'critica') return 'bg-orange-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300';
    if (task.color) return `border-l-4 bg-card`;
    return 'bg-primary/10 border-primary/30 text-primary';
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold capitalize ml-2">{monthLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Oggi
            </Button>
            {onCreateTask && (
              <Button size="sm" onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setShowTaskDialog(true);
              }} className="gap-2">
                <Plus className="w-4 h-4" />
                Nuova Task
              </Button>
            )}
          </div>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/50"
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
            const dateStr = day.date.toISOString().split('T')[0];

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[120px] p-2 border-r border-b border-border transition-colors',
                  !day.isCurrentMonth && 'bg-muted/20 opacity-50',
                  day.isCurrentMonth && 'hover:bg-muted/30 cursor-pointer',
                  '[&:nth-child(7n)]:border-r-0',
                  draggedTask && 'hover:bg-primary/10'
                )}
                onClick={() => handleDayClick(day.date, day.isCurrentMonth)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day.date)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      'text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium',
                      today && 'bg-primary text-primary-foreground',
                      !day.isCurrentMonth && 'text-muted-foreground'
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick?.(task);
                      }}
                      className={cn(
                        'group relative text-xs p-1.5 rounded border truncate cursor-move',
                        'hover:shadow-md transition-all',
                        getTaskColor(task)
                      )}
                      style={task.color ? { borderLeftColor: task.color } : undefined}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskStatusToggle(task);
                          }}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <CheckCircle className={cn(
                            'w-3 h-3',
                            task.status === 'fatto' ? 'text-emerald-500' : 'text-muted-foreground'
                          )} />
                        </button>
                        <span className={cn(
                          'truncate',
                          task.status === 'fatto' && 'line-through opacity-60'
                        )}>
                          {task.title}
                        </span>
                      </div>
                      
                      {/* Quick actions on hover */}
                      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              onClick={(e) => e.stopPropagation()}
                              className="p-0.5 rounded hover:bg-background/50"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onTaskClick?.(task)}>
                              <Edit className="w-3 h-3 mr-2" />
                              Modifica
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeleteTask?.(task.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Could open a modal with all tasks for this day
                      }}
                      className="text-xs text-primary hover:underline w-full text-left px-1"
                    >
                      +{dayTasks.length - 3} altri
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Create Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate && (
                <span>
                  Task per {new Date(selectedDate).toLocaleDateString('it-IT', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Titolo task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateQuickTask();
              }}
              autoFocus
            />
            {selectedDate && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Task esistenti:</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {tasks.filter(t => t.dueDate === selectedDate || t.startDate === selectedDate).map(task => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded border border-border bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <StatusPill type="task" value={task.status} size="xs" />
                        <span className="text-sm">{task.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onTaskClick?.(task)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {tasks.filter(t => t.dueDate === selectedDate || t.startDate === selectedDate).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nessuna task per questa data
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Chiudi
            </Button>
            {newTaskTitle.trim() && (
              <Button onClick={handleCreateQuickTask}>
                Crea Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}