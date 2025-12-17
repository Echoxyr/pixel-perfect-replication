import { useState } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, formatDateFull, daysUntil, TaskStatus } from '@/types/workhub';
import { StatusPill } from './StatusPill';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, AlertTriangle, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface TaskTableInlineProps {
  tasks: Task[];
  showCantiere?: boolean;
  onTaskClick?: (task: Task) => void;
}

export function TaskTableInline({ tasks, showCantiere = true, onTaskClick }: TaskTableInlineProps) {
  const { cantieri, updateTask, deleteTask } = useWorkHub();
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const getCantiereName = (cantiereId?: string) => {
    if (!cantiereId) return '-';
    const cantiere = cantieri.find(c => c.id === cantiereId);
    return cantiere?.codiceCommessa || '-';
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
    toast({ title: 'Stato aggiornato' });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
    });
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    updateTask(editingTask.id, editForm);
    toast({ title: 'Task aggiornato' });
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Eliminare questo task?')) {
      deleteTask(taskId);
      toast({ title: 'Task eliminato' });
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessun task
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => {
          const days = task.dueDate ? daysUntil(task.dueDate) : null;
          const isOverdue = days !== null && days < 0;
          const isUrgent = days !== null && days <= 3 && days >= 0;

          return (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg border transition-colors',
                task.status === 'fatto' ? 'bg-emerald-500/5 border-emerald-500/20' :
                task.status === 'bloccato' ? 'bg-red-500/5 border-red-500/20' :
                isOverdue ? 'bg-red-500/5 border-red-500/30' :
                isUrgent ? 'bg-amber-500/5 border-amber-500/30' :
                'bg-card border-border hover:border-primary/30'
              )}
            >
              {/* Status indicator */}
              <button
                onClick={() => handleStatusChange(
                  task.id,
                  task.status === 'fatto' ? 'da_iniziare' : 'fatto'
                )}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  task.status === 'fatto'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-muted-foreground/30 hover:border-primary'
                )}
              >
                {task.status === 'fatto' && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </button>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    'font-medium truncate',
                    task.status === 'fatto' && 'line-through text-muted-foreground'
                  )}>
                    {task.title}
                  </p>
                  {task.priority && task.priority !== 'media' && task.priority !== 'nessuna' && (
                    <StatusPill type="priority" value={task.priority} size="xs" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {showCantiere && task.cantiereId && (
                    <span>{getCantiereName(task.cantiereId)}</span>
                  )}
                  {task.dueDate && (
                    <span className={cn(
                      'flex items-center gap-1',
                      isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : ''
                    )}>
                      {isOverdue ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {formatDateFull(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status pill */}
              <StatusPill type="task" value={task.status} size="xs" />

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(task)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" /> Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Titolo</label>
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descrizione</label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Stato</label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v as TaskStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="da_iniziare">Da iniziare</SelectItem>
                    <SelectItem value="in_corso">In corso</SelectItem>
                    <SelectItem value="in_attesa">In attesa</SelectItem>
                    <SelectItem value="bloccato">Bloccato</SelectItem>
                    <SelectItem value="fatto">Completato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Scadenza</label>
                <Input
                  type="date"
                  value={editForm.dueDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>Annulla</Button>
            <Button onClick={handleSaveEdit}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
