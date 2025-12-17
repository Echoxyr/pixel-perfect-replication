import { useState } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, TaskStatus, formatDateFull, daysUntil } from '@/types/workhub';
import { StatusPill } from './StatusPill';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, MoreHorizontal, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'da_iniziare', label: 'Da Iniziare', color: 'border-gray-500' },
  { id: 'in_corso', label: 'In Corso', color: 'border-sky-500' },
  { id: 'in_attesa', label: 'In Attesa', color: 'border-amber-500' },
  { id: 'bloccato', label: 'Bloccato', color: 'border-red-500' },
  { id: 'fatto', label: 'Completato', color: 'border-emerald-500' },
];

export function KanbanBoard({ tasks, onTaskClick }: KanbanBoardProps) {
  const { cantieri, updateTask, deleteTask } = useWorkHub();
  const { toast } = useToast();
  const [draggingTask, setDraggingTask] = useState<string | null>(null);

  const getCantiereName = (cantiereId?: string) => {
    if (!cantiereId) return null;
    const cantiere = cantieri.find(c => c.id === cantiereId);
    return cantiere?.codiceCommessa;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggingTask) {
      updateTask(draggingTask, { status: newStatus });
      toast({ title: 'Stato task aggiornato' });
    }
    setDraggingTask(null);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Eliminare questo task?')) {
      deleteTask(taskId);
      toast({ title: 'Task eliminato' });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
    toast({ title: 'Stato aggiornato' });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter(t => t.status === column.id);

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-72"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={cn(
              'flex items-center justify-between p-3 rounded-t-xl bg-card border-t-4',
              column.color
            )}>
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="bg-muted/30 rounded-b-xl p-2 min-h-[400px] space-y-2">
              {columnTasks.map((task) => {
                const days = task.dueDate ? daysUntil(task.dueDate) : null;
                const isOverdue = days !== null && days < 0;
                const isUrgent = days !== null && days <= 3 && days >= 0;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={cn(
                      'p-3 rounded-lg bg-card border border-border shadow-sm cursor-move',
                      'hover:border-primary/50 transition-all',
                      draggingTask === task.id && 'opacity-50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {columns.filter(c => c.id !== task.status).map(c => (
                            <DropdownMenuItem
                              key={c.id}
                              onClick={() => handleStatusChange(task.id, c.id)}
                            >
                              Sposta in {c.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => handleDelete(task.id)}
                            className="text-red-500"
                          >
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {task.priority && task.priority !== 'nessuna' && (
                        <StatusPill type="priority" value={task.priority} size="xs" />
                      )}
                      {getCantiereName(task.cantiereId) && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {getCantiereName(task.cantiereId)}
                        </span>
                      )}
                    </div>

                    {task.dueDate && (
                      <div className={cn(
                        'flex items-center gap-1 mt-2 text-xs',
                        isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'
                      )}>
                        {isOverdue ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {formatDateFull(task.dueDate)}
                      </div>
                    )}
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nessun task
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
