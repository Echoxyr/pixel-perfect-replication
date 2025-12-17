import { useState, useRef } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, formatDateFull, daysUntil, TaskStatus, TaskPriority, generateId } from '@/types/workhub';
import { StatusPill } from './StatusPill';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  MoreHorizontal,
  Paperclip,
  Upload,
  X,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface TaskTableInlineProps {
  tasks: Task[];
  showCantiere?: boolean;
  onTaskClick?: (task: Task) => void;
}

export function TaskTableInline({ tasks, showCantiere = true, onTaskClick }: TaskTableInlineProps) {
  const { cantieri, imprese, updateTask, deleteTask } = useWorkHub();
  const { toast } = useToast();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ taskId: string; field: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  const getCantiereName = (cantiereId?: string) => {
    if (!cantiereId) return '-';
    const cantiere = cantieri.find(c => c.id === cantiereId);
    return cantiere?.codiceCommessa || '-';
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
    toast({ title: 'Stato aggiornato' });
  };

  const handlePriorityChange = (taskId: string, newPriority: TaskPriority) => {
    updateTask(taskId, { priority: newPriority });
    toast({ title: 'Priorità aggiornata' });
  };

  const handleCantiereChange = (taskId: string, cantiereId: string) => {
    updateTask(taskId, { cantiereId: cantiereId === 'none' ? undefined : cantiereId });
    toast({ title: 'Cantiere aggiornato' });
  };

  const handleFieldUpdate = (taskId: string, field: string, value: string) => {
    updateTask(taskId, { [field]: value || undefined });
    setEditingField(null);
    toast({ title: 'Campo aggiornato' });
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Eliminare questo task?')) {
      deleteTask(taskId);
      toast({ title: 'Task eliminato' });
    }
  };

  const handleFileUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const fileNames = Array.from(files).map(f => f.name).join(', ');
    const currentFiles = task.fileInfo || '';
    const newFileInfo = currentFiles ? `${currentFiles}, ${fileNames}` : fileNames;
    
    updateTask(taskId, { fileInfo: newFileInfo });
    toast({ title: 'File allegati', description: `${files.length} file aggiunti` });
    setUploadingTaskId(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessun task
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
        <div className="col-span-4">Task</div>
        <div className="col-span-2">Stato</div>
        <div className="col-span-2">Priorità</div>
        {showCantiere && <div className="col-span-2">Cantiere</div>}
        <div className={showCantiere ? "col-span-1" : "col-span-3"}>Scadenza</div>
        <div className="col-span-1 text-right">Azioni</div>
      </div>

      {tasks.map((task) => {
        const days = task.dueDate ? daysUntil(task.dueDate) : null;
        const isOverdue = days !== null && days < 0;
        const isUrgent = days !== null && days <= 3 && days >= 0;
        const isExpanded = expandedTaskId === task.id;

        return (
          <div key={task.id}>
            {/* Main Row */}
            <div
              className={cn(
                'grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg border transition-colors items-center',
                task.status === 'fatto' ? 'bg-emerald-500/5 border-emerald-500/20' :
                task.status === 'bloccato' ? 'bg-red-500/5 border-red-500/20' :
                isOverdue ? 'bg-red-500/5 border-red-500/30' :
                isUrgent ? 'bg-amber-500/5 border-amber-500/30' :
                'bg-card border-border hover:border-primary/30'
              )}
            >
              {/* Task Title + Toggle */}
              <div className="col-span-4 flex items-center gap-2 min-w-0">
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
                <div className="flex-1 min-w-0">
                  {editingField?.taskId === task.id && editingField.field === 'title' ? (
                    <Input
                      autoFocus
                      defaultValue={task.title}
                      className="h-7 text-sm"
                      onBlur={(e) => handleFieldUpdate(task.id, 'title', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFieldUpdate(task.id, 'title', e.currentTarget.value);
                        if (e.key === 'Escape') setEditingField(null);
                      }}
                    />
                  ) : (
                    <p
                      onClick={() => setEditingField({ taskId: task.id, field: 'title' })}
                      className={cn(
                        'font-medium truncate cursor-text hover:text-primary',
                        task.status === 'fatto' && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </p>
                  )}
                  {task.fileInfo && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      {task.fileInfo.split(',').length} file
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                >
                  <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
                </Button>
              </div>

              {/* Status Dropdown */}
              <div className="col-span-2">
                <Select
                  value={task.status}
                  onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                >
                  <SelectTrigger className="h-7 text-xs">
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

              {/* Priority Dropdown */}
              <div className="col-span-2">
                <Select
                  value={task.priority}
                  onValueChange={(v) => handlePriorityChange(task.id, v as TaskPriority)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critica">Critica</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="bassa">Bassa</SelectItem>
                    <SelectItem value="nessuna">Nessuna</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cantiere Dropdown */}
              {showCantiere && (
                <div className="col-span-2">
                  <Select
                    value={task.cantiereId || 'none'}
                    onValueChange={(v) => handleCantiereChange(task.id, v)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuno</SelectItem>
                      {cantieri.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.codiceCommessa}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Due Date */}
              <div className={showCantiere ? "col-span-1" : "col-span-3"}>
                {editingField?.taskId === task.id && editingField.field === 'dueDate' ? (
                  <Input
                    type="date"
                    autoFocus
                    defaultValue={task.dueDate || ''}
                    className="h-7 text-xs"
                    onBlur={(e) => handleFieldUpdate(task.id, 'dueDate', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditingField(null);
                    }}
                  />
                ) : (
                  <span
                    onClick={() => setEditingField({ taskId: task.id, field: 'dueDate' })}
                    className={cn(
                      'text-xs cursor-text hover:text-primary flex items-center gap-1',
                      isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'
                    )}
                  >
                    {task.dueDate ? (
                      <>
                        {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {formatDateFull(task.dueDate)}
                      </>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end gap-1">
                <input
                  ref={uploadingTaskId === task.id ? fileInputRef : null}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(task.id, e)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setUploadingTaskId(task.id);
                    setTimeout(() => fileInputRef.current?.click(), 0);
                  }}
                  title="Allega file"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Dettagli
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4 mr-2" /> Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="ml-7 mr-3 mt-1 mb-2 p-4 rounded-lg bg-muted/30 border border-border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Description */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrizione</label>
                    <Textarea
                      value={task.description || ''}
                      onChange={(e) => updateTask(task.id, { description: e.target.value })}
                      placeholder="Aggiungi una descrizione..."
                      className="text-sm min-h-[60px]"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Data Inizio</label>
                    <Input
                      type="date"
                      value={task.startDate || ''}
                      onChange={(e) => updateTask(task.id, { startDate: e.target.value || undefined })}
                      className="text-sm"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Scadenza</label>
                    <Input
                      type="date"
                      value={task.dueDate || ''}
                      onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
                      className="text-sm"
                    />
                  </div>

                  {/* Impresa */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Impresa</label>
                    <Select
                      value={task.impresaId || 'none'}
                      onValueChange={(v) => updateTask(task.id, { impresaId: v === 'none' ? undefined : v })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Seleziona impresa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nessuna</SelectItem>
                        {imprese.map(i => (
                          <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Note</label>
                    <Input
                      value={task.note || ''}
                      onChange={(e) => updateTask(task.id, { note: e.target.value || undefined })}
                      placeholder="Note aggiuntive..."
                      className="text-sm"
                    />
                  </div>

                  {/* Files */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Allegati</label>
                    <div className="flex flex-wrap gap-2">
                      {task.fileInfo?.split(',').map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs">
                          <FileText className="w-3 h-3" />
                          <span>{file.trim()}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-destructive/20"
                            onClick={() => {
                              const files = task.fileInfo?.split(',').map(f => f.trim()).filter((_, idx) => idx !== i);
                              updateTask(task.id, { fileInfo: files?.join(', ') || undefined });
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setUploadingTaskId(task.id);
                          setTimeout(() => fileInputRef.current?.click(), 0);
                        }}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Carica file
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
