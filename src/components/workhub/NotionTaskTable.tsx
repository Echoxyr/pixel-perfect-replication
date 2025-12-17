import { useState, useRef, useMemo, useCallback } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, TaskStatus, TaskPriority, generateId, formatDateFull, daysUntil, STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '@/types/workhub';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Paperclip,
  MessageSquare,
  Star,
  StarOff,
  Copy,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Download,
  FileText,
  Image as ImageIcon,
  Tag,
  Users,
  Palette,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotionTaskTableProps {
  tasks: Task[];
  showCantiere?: boolean;
}

// Status color mappings for pills
const statusColors: Record<TaskStatus, string> = {
  da_iniziare: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  in_corso: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_attesa: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  bloccato: 'bg-red-500/20 text-red-400 border-red-500/30',
  fatto: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const priorityColors: Record<TaskPriority, string> = {
  nessuna: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  bassa: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  media: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  alta: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critica: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  urgente: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const taskColors = [
  { name: 'Nessuno', value: '' },
  { name: 'Rosso', value: 'border-l-red-500' },
  { name: 'Arancione', value: 'border-l-orange-500' },
  { name: 'Giallo', value: 'border-l-yellow-500' },
  { name: 'Verde', value: 'border-l-emerald-500' },
  { name: 'Blu', value: 'border-l-blue-500' },
  { name: 'Viola', value: 'border-l-purple-500' },
  { name: 'Rosa', value: 'border-l-pink-500' },
];

export function NotionTaskTable({ tasks, showCantiere = true }: NotionTaskTableProps) {
  const { cantieri, imprese, addTask, updateTask, deleteTask } = useWorkHub();
  const { toast } = useToast();
  
  // State
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [newSubtaskParent, setNewSubtaskParent] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  // Get root tasks and nested structure
  const taskTree = useMemo(() => {
    const rootTasks = tasks.filter(t => !t.parentId);
    const childrenMap = new Map<string, Task[]>();
    
    tasks.forEach(t => {
      if (t.parentId) {
        const children = childrenMap.get(t.parentId) || [];
        children.push(t);
        childrenMap.set(t.parentId, children);
      }
    });

    return { rootTasks, childrenMap };
  }, [tasks]);

  // Sorted tasks
  const sortedRootTasks = useMemo(() => {
    let sorted = [...taskTree.rootTasks];
    if (sortField) {
      sorted.sort((a, b) => {
        let aVal = (a as any)[sortField] || '';
        let bVal = (b as any)[sortField] || '';
        if (sortField === 'dueDate' || sortField === 'startDate') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [taskTree.rootTasks, sortField, sortDir]);

  // Helpers
  const getCantiereName = (cantiereId?: string) => {
    if (!cantiereId) return '-';
    return cantieri.find(c => c.id === cantiereId)?.codiceCommessa || '-';
  };

  const getImpresaName = (impresaId?: string) => {
    if (!impresaId) return '-';
    return imprese.find(i => i.id === impresaId)?.ragioneSociale || '-';
  };

  const getChildrenCount = (taskId: string): number => {
    const children = taskTree.childrenMap.get(taskId) || [];
    return children.length + children.reduce((acc, c) => acc + getChildrenCount(c.id), 0);
  };

  const hasChildren = (taskId: string) => {
    return (taskTree.childrenMap.get(taskId) || []).length > 0;
  };

  // Actions
  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)));
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { 
      status, 
      completedAt: status === 'fatto' ? new Date().toISOString() : undefined 
    });
    toast({ title: 'Stato aggiornato' });
  };

  const handlePriorityChange = (taskId: string, priority: TaskPriority) => {
    updateTask(taskId, { priority });
    toast({ title: 'Priorità aggiornata' });
  };

  const handleCantiereChange = (taskId: string, cantiereId: string) => {
    updateTask(taskId, { cantiereId: cantiereId === 'none' ? undefined : cantiereId });
    toast({ title: 'Cantiere aggiornato' });
  };

  const handleImpresaChange = (taskId: string, impresaId: string) => {
    updateTask(taskId, { impresaId: impresaId === 'none' ? undefined : impresaId });
    toast({ title: 'Impresa aggiornata' });
  };

  const handleToggleFavorite = (taskId: string, current: boolean) => {
    updateTask(taskId, { isFavorite: !current });
    toast({ title: current ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti' });
  };

  const handleColorChange = (taskId: string, color: string) => {
    updateTask(taskId, { color });
    toast({ title: 'Colore aggiornato' });
  };

  const handleFieldUpdate = (taskId: string, field: string, value: string) => {
    updateTask(taskId, { [field]: value || undefined });
    setEditingCell(null);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Eliminare questo task e tutti i subtask?')) {
      // Delete all children recursively
      const deleteChildren = (id: string) => {
        const children = taskTree.childrenMap.get(id) || [];
        children.forEach(c => {
          deleteChildren(c.id);
          deleteTask(c.id);
        });
      };
      deleteChildren(taskId);
      deleteTask(taskId);
      toast({ title: 'Task eliminato' });
    }
  };

  const handleDuplicate = (task: Task) => {
    addTask({
      ...task,
      title: `${task.title} (copia)`,
      parentId: task.parentId,
      status: 'da_iniziare',
      check: false,
      updates: [],
      comments: [],
      subtasks: [],
    });
    toast({ title: 'Task duplicato' });
  };

  const handleAddSubtask = (parentId: string) => {
    if (!newSubtaskTitle.trim()) return;
    addTask({
      title: newSubtaskTitle,
      parentId,
      status: 'da_iniziare',
      priority: 'media',
      check: false,
      tags: [],
      subtasks: [],
      updates: [],
    });
    setNewSubtaskTitle('');
    setNewSubtaskParent(null);
    setExpandedTasks(prev => new Set(prev).add(parentId));
    toast({ title: 'Subtask aggiunto' });
  };

  const handleQuickAdd = () => {
    if (!quickAddTitle.trim()) return;
    addTask({
      title: quickAddTitle,
      status: 'da_iniziare',
      priority: 'media',
      check: false,
      tags: [],
      subtasks: [],
      updates: [],
    });
    setQuickAddTitle('');
    toast({ title: 'Task creato' });
  };

  const handleBulkDelete = () => {
    if (selectedTasks.size === 0) return;
    if (confirm(`Eliminare ${selectedTasks.size} task selezionati?`)) {
      selectedTasks.forEach(id => deleteTask(id));
      setSelectedTasks(new Set());
      toast({ title: `${selectedTasks.size} task eliminati` });
    }
  };

  const handleBulkStatusChange = (status: TaskStatus) => {
    selectedTasks.forEach(id => updateTask(id, { status }));
    toast({ title: `Stato aggiornato per ${selectedTasks.size} task` });
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

  // Render task row recursively
  const renderTaskRow = (task: Task, depth: number = 0) => {
    const isExpanded = expandedTasks.has(task.id);
    const isSelected = selectedTasks.has(task.id);
    const children = taskTree.childrenMap.get(task.id) || [];
    const childCount = getChildrenCount(task.id);
    const days = task.dueDate ? daysUntil(task.dueDate) : null;
    const isOverdue = days !== null && days < 0;
    const isUrgent = days !== null && days <= 3 && days >= 0;
    const fileCount = task.fileInfo?.split(',').filter(Boolean).length || 0;

    return (
      <div key={task.id}>
        <div
          className={cn(
            'group grid grid-cols-12 gap-1 px-2 py-1.5 text-sm border-b border-border/50 hover:bg-muted/30 transition-colors items-center',
            isSelected && 'bg-primary/5',
            task.color && `border-l-4 ${task.color}`,
            task.status === 'fatto' && 'opacity-60'
          )}
          style={{ paddingLeft: `${8 + depth * 24}px` }}
        >
          {/* Checkbox + Expand + Title */}
          <div className="col-span-4 flex items-center gap-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelect(task.id)}
              className="h-4 w-4 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
            />
            
            {hasChildren(task.id) || depth === 0 ? (
              <button
                onClick={() => toggleExpand(task.id)}
                className={cn(
                  'w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors',
                  !hasChildren(task.id) && 'opacity-0'
                )}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-5" />
            )}

            <button
              onClick={() => handleStatusChange(task.id, task.status === 'fatto' ? 'da_iniziare' : 'fatto')}
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                task.status === 'fatto'
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-muted-foreground/40 hover:border-primary'
              )}
            >
              {task.status === 'fatto' && <Check className="w-2.5 h-2.5 text-white" />}
            </button>

            {task.isFavorite && (
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}

            {editingCell?.taskId === task.id && editingCell.field === 'title' ? (
              <Input
                autoFocus
                defaultValue={task.title}
                className="h-6 text-sm flex-1"
                onBlur={(e) => handleFieldUpdate(task.id, 'title', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFieldUpdate(task.id, 'title', e.currentTarget.value);
                  if (e.key === 'Escape') setEditingCell(null);
                }}
              />
            ) : (
              <span
                onClick={() => setEditingCell({ taskId: task.id, field: 'title' })}
                className={cn(
                  'truncate cursor-text hover:text-primary flex-1',
                  task.status === 'fatto' && 'line-through'
                )}
              >
                {task.title}
              </span>
            )}

            {childCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {childCount}
              </span>
            )}
          </div>

          {/* Status */}
          <div className="col-span-1">
            <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}>
              <SelectTrigger className={cn('h-6 text-xs border', statusColors[task.status])}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="col-span-1">
            <Select value={task.priority} onValueChange={(v) => handlePriorityChange(task.id, v as TaskPriority)}>
              <SelectTrigger className={cn('h-6 text-xs border', priorityColors[task.priority])}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cantiere */}
          {showCantiere && (
            <div className="col-span-1">
              <Select value={task.cantiereId || 'none'} onValueChange={(v) => handleCantiereChange(task.id, v)}>
                <SelectTrigger className="h-6 text-xs">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-</SelectItem>
                  {cantieri.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.codiceCommessa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Impresa */}
          <div className="col-span-1">
            <Select value={task.impresaId || 'none'} onValueChange={(v) => handleImpresaChange(task.id, v)}>
              <SelectTrigger className="h-6 text-xs">
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-</SelectItem>
                {imprese.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className={showCantiere ? "col-span-1" : "col-span-1"}>
            {editingCell?.taskId === task.id && editingCell.field === 'startDate' ? (
              <Input
                type="date"
                autoFocus
                defaultValue={task.startDate || ''}
                className="h-6 text-xs"
                onBlur={(e) => handleFieldUpdate(task.id, 'startDate', e.target.value)}
              />
            ) : (
              <span
                onClick={() => setEditingCell({ taskId: task.id, field: 'startDate' })}
                className="text-xs text-muted-foreground cursor-text hover:text-primary block truncate"
              >
                {task.startDate ? new Date(task.startDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
              </span>
            )}
          </div>

          {/* Due Date */}
          <div className="col-span-1">
            {editingCell?.taskId === task.id && editingCell.field === 'dueDate' ? (
              <Input
                type="date"
                autoFocus
                defaultValue={task.dueDate || ''}
                className="h-6 text-xs"
                onBlur={(e) => handleFieldUpdate(task.id, 'dueDate', e.target.value)}
              />
            ) : (
              <span
                onClick={() => setEditingCell({ taskId: task.id, field: 'dueDate' })}
                className={cn(
                  'text-xs cursor-text hover:text-primary block truncate flex items-center gap-1',
                  isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'
                )}
              >
                {isOverdue && <AlertTriangle className="w-3 h-3" />}
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
              </span>
            )}
          </div>

          {/* Attachments */}
          <div className="col-span-1 flex items-center gap-1">
            <input
              ref={uploadingTaskId === task.id ? fileInputRef : null}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(task.id, e)}
            />
            <button
              onClick={() => {
                setUploadingTaskId(task.id);
                setTimeout(() => fileInputRef.current?.click(), 0);
              }}
              className={cn(
                'flex items-center gap-1 text-xs hover:text-primary transition-colors',
                fileCount > 0 ? 'text-blue-400' : 'text-muted-foreground'
              )}
            >
              <Paperclip className="w-3.5 h-3.5" />
              {fileCount > 0 && <span>{fileCount}</span>}
            </button>
          </div>

          {/* Actions */}
          <div className={cn("flex items-center justify-end gap-1", showCantiere ? "col-span-1" : "col-span-2")}>
            <button
              onClick={() => setNewSubtaskParent(newSubtaskParent === task.id ? null : task.id)}
              className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              title="Aggiungi subtask"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleToggleFavorite(task.id, !!task.isFavorite)}>
                  {task.isFavorite ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                  {task.isFavorite ? 'Rimuovi preferito' : 'Aggiungi preferito'}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="w-4 h-4 mr-2" />
                    Colore
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {taskColors.map(c => (
                      <DropdownMenuItem key={c.value} onClick={() => handleColorChange(task.id, c.value)}>
                        <div className={cn('w-3 h-3 rounded mr-2', c.value || 'bg-muted')} />
                        {c.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDuplicate(task)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplica
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Add subtask input */}
        {newSubtaskParent === task.id && (
          <div 
            className="flex items-center gap-2 px-2 py-2 bg-muted/30 border-b border-border/50"
            style={{ paddingLeft: `${32 + depth * 24}px` }}
          >
            <Input
              autoFocus
              placeholder="Titolo subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="h-7 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtask(task.id);
                if (e.key === 'Escape') setNewSubtaskParent(null);
              }}
            />
            <Button size="sm" className="h-7" onClick={() => handleAddSubtask(task.id)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi
            </Button>
            <Button size="sm" variant="ghost" className="h-7" onClick={() => setNewSubtaskParent(null)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Render children */}
        {isExpanded && children.map(child => renderTaskRow(child, depth + 1))}
      </div>
    );
  };

  // Stats
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'fatto').length;
    const blocked = tasks.filter(t => t.status === 'bloccato').length;
    const favorites = tasks.filter(t => t.isFavorite).length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'fatto') return false;
      const days = daysUntil(t.dueDate);
      return days !== null && days < 0;
    }).length;
    return { completed, blocked, favorites, overdue, total: tasks.length };
  }, [tasks]);

  if (tasks.length === 0 && !quickAddTitle) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-4">Nessun task</p>
        <div className="flex items-center gap-2 justify-center max-w-md mx-auto">
          <Input
            placeholder="Nuovo task..."
            value={quickAddTitle}
            onChange={(e) => setQuickAddTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            className="h-9"
          />
          <Button onClick={handleQuickAdd}>
            <Plus className="w-4 h-4 mr-1" /> Aggiungi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Bulk actions bar */}
      {selectedTasks.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 border-b border-border">
          <span className="text-sm font-medium">{selectedTasks.size} selezionati</span>
          <Select onValueChange={(v) => handleBulkStatusChange(v as TaskStatus)}>
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue placeholder="Cambia stato" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="destructive" className="h-7" onClick={handleBulkDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Elimina
          </Button>
          <Button size="sm" variant="ghost" className="h-7 ml-auto" onClick={() => setSelectedTasks(new Set())}>
            Deseleziona
          </Button>
        </div>
      )}

      {/* Table header */}
      <div className="grid grid-cols-12 gap-1 px-2 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-muted/30">
        <div className="col-span-4 flex items-center gap-2">
          <Checkbox
            checked={selectedTasks.size === tasks.length && tasks.length > 0}
            onCheckedChange={toggleSelectAll}
            className="h-4 w-4"
          />
          <button onClick={() => handleSort('title')} className="flex items-center gap-1 hover:text-foreground">
            TITOLO
            {sortField === 'title' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
          </button>
        </div>
        <div className="col-span-1">
          <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-foreground">
            STATO
            {sortField === 'status' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
          </button>
        </div>
        <div className="col-span-1">
          <button onClick={() => handleSort('priority')} className="flex items-center gap-1 hover:text-foreground">
            PRIORITÀ
            {sortField === 'priority' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
          </button>
        </div>
        {showCantiere && <div className="col-span-1">CANTIERE</div>}
        <div className="col-span-1">IMPRESA</div>
        <div className="col-span-1">
          <button onClick={() => handleSort('startDate')} className="flex items-center gap-1 hover:text-foreground">
            INIZIO
            {sortField === 'startDate' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
          </button>
        </div>
        <div className="col-span-1">
          <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1 hover:text-foreground">
            SCADENZA
            {sortField === 'dueDate' && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
          </button>
        </div>
        <div className="col-span-1">ALLEGATI</div>
        <div className={cn("text-right", showCantiere ? "col-span-1" : "col-span-2")}>AZIONI</div>
      </div>

      {/* Task rows */}
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
        {sortedRootTasks.map(task => renderTaskRow(task, 0))}
      </div>

      {/* Quick add row */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-muted/20">
        <Plus className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="+ Aggiungi task..."
          value={quickAddTitle}
          onChange={(e) => setQuickAddTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
          className="h-7 border-0 bg-transparent focus-visible:ring-0 text-sm"
        />
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-4 px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
        <span>{stats.total} task</span>
        <span className="text-emerald-500">{stats.completed} completati</span>
        <span className="text-red-500">{stats.blocked} bloccati</span>
        {stats.overdue > 0 && <span className="text-orange-500">{stats.overdue} in ritardo</span>}
        {stats.favorites > 0 && <span className="text-yellow-500">★ {stats.favorites} preferiti</span>}
      </div>
    </div>
  );
}
