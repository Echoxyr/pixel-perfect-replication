import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { Task, TaskStatus, TaskPriority, generateId, formatDateFull, daysUntil, STATUS_LABELS, PRIORITY_LABELS } from '@/types/workhub';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Paperclip,
  Star,
  StarOff,
  Copy,
  Trash2,
  AlertTriangle,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Settings2,
  Eye,
  EyeOff,
  Palette,
  Type,
  Hash,
  Calendar,
  User,
  Tag,
  Link,
  Mail,
  Phone,
  Percent,
  DollarSign,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedTaskTableProps {
  tasks: Task[];
  showCantiere?: boolean;
}

// Column types that can be added
type ColumnType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'person' | 'checkbox' | 'url' | 'email' | 'phone' | 'percent' | 'currency';

interface TableColumn {
  id: string;
  key: string;
  header: string;
  type: ColumnType;
  width: number;
  minWidth: number;
  visible: boolean;
  sortable: boolean;
  editable: boolean;
  options?: string[]; // For select/multiselect
}

// Default columns configuration
const defaultColumns: TableColumn[] = [
  { id: 'title', key: 'title', header: 'Titolo', type: 'text', width: 300, minWidth: 150, visible: true, sortable: true, editable: true },
  { id: 'status', key: 'status', header: 'Stato', type: 'select', width: 120, minWidth: 100, visible: true, sortable: true, editable: true, options: Object.keys(STATUS_LABELS) },
  { id: 'priority', key: 'priority', header: 'Priorità', type: 'select', width: 110, minWidth: 90, visible: true, sortable: true, editable: true, options: Object.keys(PRIORITY_LABELS) },
  { id: 'cantiere', key: 'cantiereId', header: 'Cantiere', type: 'select', width: 120, minWidth: 100, visible: true, sortable: true, editable: true },
  { id: 'impresa', key: 'impresaId', header: 'Impresa', type: 'select', width: 130, minWidth: 100, visible: true, sortable: true, editable: true },
  { id: 'startDate', key: 'startDate', header: 'Inizio', type: 'date', width: 110, minWidth: 90, visible: true, sortable: true, editable: true },
  { id: 'dueDate', key: 'dueDate', header: 'Scadenza', type: 'date', width: 110, minWidth: 90, visible: true, sortable: true, editable: true },
  { id: 'attachments', key: 'fileInfo', header: 'Allegati', type: 'text', width: 90, minWidth: 70, visible: true, sortable: false, editable: false },
];

// Status color mappings
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

const columnTypeIcons: Record<ColumnType, React.ReactNode> = {
  text: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  date: <Calendar className="w-4 h-4" />,
  select: <Tag className="w-4 h-4" />,
  multiselect: <Tag className="w-4 h-4" />,
  person: <User className="w-4 h-4" />,
  checkbox: <CheckSquare className="w-4 h-4" />,
  url: <Link className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  percent: <Percent className="w-4 h-4" />,
  currency: <DollarSign className="w-4 h-4" />,
};

export function AdvancedTaskTable({ tasks, showCantiere = true }: AdvancedTaskTableProps) {
  const { cantieri, imprese, addTask, updateTask, deleteTask } = useWorkHub();
  const { toast } = useToast();
  
  // State
  const [columns, setColumns] = useState<TableColumn[]>(() => {
    const saved = localStorage.getItem('taskTableColumns');
    if (saved) {
      try { return JSON.parse(saved); } catch { return defaultColumns; }
    }
    return defaultColumns;
  });
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ taskId: string; columnId: string } | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [newSubtaskParent, setNewSubtaskParent] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [newColumnDialog, setNewColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<ColumnType>('text');
  const tableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  // Save columns to localStorage
  useEffect(() => {
    localStorage.setItem('taskTableColumns', JSON.stringify(columns));
  }, [columns]);

  // Mouse move handler for resizing
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(resizing.startWidth + diff, 60);
      setColumns(cols => cols.map(col => 
        col.id === resizing.columnId ? { ...col, width: newWidth } : col
      ));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // Get visible columns
  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  // Build task tree
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

  const hasChildren = (taskId: string) => (taskTree.childrenMap.get(taskId) || []).length > 0;

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

  const handleFieldUpdate = (taskId: string, field: string, value: any) => {
    updateTask(taskId, { [field]: value || undefined });
    setEditingCell(null);
    toast({ title: 'Campo aggiornato' });
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Eliminare questo task e tutti i subtask?')) {
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

  // Column management
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(cols => cols.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const addNewColumn = () => {
    if (!newColumnName.trim()) return;
    const newCol: TableColumn = {
      id: `custom_${Date.now()}`,
      key: `custom_${Date.now()}`,
      header: newColumnName,
      type: newColumnType,
      width: 150,
      minWidth: 80,
      visible: true,
      sortable: true,
      editable: true,
    };
    setColumns([...columns, newCol]);
    setNewColumnDialog(false);
    setNewColumnName('');
    setNewColumnType('text');
    toast({ title: 'Colonna aggiunta' });
  };

  const removeColumn = (columnId: string) => {
    if (!columnId.startsWith('custom_')) {
      toast({ title: 'Non puoi rimuovere le colonne predefinite', variant: 'destructive' });
      return;
    }
    setColumns(cols => cols.filter(c => c.id !== columnId));
    toast({ title: 'Colonna rimossa' });
  };

  const startResize = (e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ columnId, startX: e.clientX, startWidth: currentWidth });
  };

  // Render cell content based on column type
  const renderCellContent = (task: Task, column: TableColumn, depth: number = 0) => {
    const isEditing = editingCell?.taskId === task.id && editingCell?.columnId === column.id;
    const value = (task as any)[column.key];

    // Title column - special handling
    if (column.id === 'title') {
      const isExpanded = expandedTasks.has(task.id);
      const isSelected = selectedTasks.has(task.id);
      const childCount = getChildrenCount(task.id);

      return (
        <div className="flex items-center gap-1 min-w-0" style={{ paddingLeft: `${depth * 20}px` }}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelect(task.id)}
            className="h-4 w-4 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 flex-shrink-0"
          />
          
          {hasChildren(task.id) || depth === 0 ? (
            <button
              onClick={() => toggleExpand(task.id)}
              className={cn(
                'w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors flex-shrink-0',
                !hasChildren(task.id) && 'opacity-0'
              )}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-5 flex-shrink-0" />
          )}

          <button
            onClick={() => handleFieldUpdate(task.id, 'status', task.status === 'fatto' ? 'da_iniziare' : 'fatto')}
            className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
              task.status === 'fatto' ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/40 hover:border-primary'
            )}
          >
            {task.status === 'fatto' && <Check className="w-2.5 h-2.5 text-white" />}
          </button>

          {task.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}

          {isEditing ? (
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
              onClick={() => column.editable && setEditingCell({ taskId: task.id, columnId: column.id })}
              className={cn(
                'truncate cursor-text hover:text-primary flex-1',
                task.status === 'fatto' && 'line-through opacity-60'
              )}
            >
              {task.title}
            </span>
          )}

          {childCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
              {childCount}
            </span>
          )}
        </div>
      );
    }

    // Status column
    if (column.id === 'status') {
      return (
        <Select value={task.status} onValueChange={(v) => handleFieldUpdate(task.id, 'status', v)}>
          <SelectTrigger className={cn('h-6 text-xs border', statusColors[task.status])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Priority column
    if (column.id === 'priority') {
      return (
        <Select value={task.priority} onValueChange={(v) => handleFieldUpdate(task.id, 'priority', v)}>
          <SelectTrigger className={cn('h-6 text-xs border', priorityColors[task.priority])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Cantiere column
    if (column.id === 'cantiere') {
      return (
        <Select value={task.cantiereId || 'none'} onValueChange={(v) => handleFieldUpdate(task.id, 'cantiereId', v === 'none' ? undefined : v)}>
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
      );
    }

    // Impresa column
    if (column.id === 'impresa') {
      return (
        <Select value={task.impresaId || 'none'} onValueChange={(v) => handleFieldUpdate(task.id, 'impresaId', v === 'none' ? undefined : v)}>
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
      );
    }

    // Date columns
    if (column.type === 'date') {
      const dateValue = value ? new Date(value) : null;
      const days = column.key === 'dueDate' && task.dueDate ? daysUntil(task.dueDate) : null;
      const isOverdue = days !== null && days < 0;
      const isUrgent = days !== null && days <= 3 && days >= 0;

      if (isEditing) {
        return (
          <Input
            type="date"
            autoFocus
            defaultValue={value || ''}
            className="h-6 text-xs"
            onBlur={(e) => handleFieldUpdate(task.id, column.key, e.target.value)}
          />
        );
      }

      return (
        <span
          onClick={() => column.editable && setEditingCell({ taskId: task.id, columnId: column.id })}
          className={cn(
            'text-xs cursor-text hover:text-primary block truncate flex items-center gap-1',
            isOverdue ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'
          )}
        >
          {isOverdue && <AlertTriangle className="w-3 h-3" />}
          {dateValue ? dateValue.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
        </span>
      );
    }

    // Attachments column
    if (column.id === 'attachments') {
      const fileCount = task.fileInfo?.split(',').filter(Boolean).length || 0;
      return (
        <div className="flex items-center gap-1">
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
      );
    }

    // Custom text columns
    if (column.type === 'text') {
      if (isEditing) {
        return (
          <Input
            autoFocus
            defaultValue={value || ''}
            className="h-6 text-xs"
            onBlur={(e) => handleFieldUpdate(task.id, column.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFieldUpdate(task.id, column.key, e.currentTarget.value);
              if (e.key === 'Escape') setEditingCell(null);
            }}
          />
        );
      }
      return (
        <span
          onClick={() => column.editable && setEditingCell({ taskId: task.id, columnId: column.id })}
          className="text-xs text-muted-foreground cursor-text hover:text-primary block truncate"
        >
          {value || '-'}
        </span>
      );
    }

    // Default fallback
    return <span className="text-xs text-muted-foreground">{value || '-'}</span>;
  };

  // Render task row
  const renderTaskRow = (task: Task, depth: number = 0) => {
    const isExpanded = expandedTasks.has(task.id);
    const children = taskTree.childrenMap.get(task.id) || [];

    return (
      <div key={task.id}>
        <div
          className={cn(
            'group flex items-center border-b border-border/50 hover:bg-muted/30 transition-colors',
            task.status === 'fatto' && 'opacity-60',
            task.color && `border-l-4 ${task.color}`
          )}
        >
          {visibleColumns.map((column, idx) => (
            <div
              key={column.id}
              className={cn(
                'flex items-center px-2 py-1.5 text-sm relative flex-shrink-0',
                idx === 0 && 'pl-2'
              )}
              style={{ width: column.width, minWidth: column.minWidth }}
            >
              {renderCellContent(task, column, idx === 0 ? depth : 0)}
            </div>
          ))}

          {/* Actions column */}
          <div className="flex items-center gap-1 px-2 py-1.5 ml-auto">
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
                <DropdownMenuItem onClick={() => updateTask(task.id, { isFavorite: !task.isFavorite })}>
                  {task.isFavorite ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                  {task.isFavorite ? 'Rimuovi preferito' : 'Aggiungi preferito'}
                </DropdownMenuItem>
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
            style={{ paddingLeft: `${32 + depth * 20}px` }}
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
    <div className="rounded-lg border border-border bg-card overflow-hidden" ref={tableRef}>
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

      {/* Table header with resizable columns */}
      <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
        {visibleColumns.map((column, idx) => (
          <div
            key={column.id}
            className="flex items-center justify-between text-xs font-medium text-muted-foreground relative flex-shrink-0 group"
            style={{ width: column.width, minWidth: column.minWidth }}
          >
            <button 
              onClick={() => column.sortable && handleSort(column.key)}
              className={cn(
                'flex items-center gap-1 px-2 py-2 hover:text-foreground truncate flex-1 text-left',
                column.sortable && 'cursor-pointer'
              )}
            >
              <span className="truncate">{column.header}</span>
              {column.sortable && sortField === column.key && (
                sortDir === 'asc' ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" />
              )}
            </button>
            
            {/* Resize handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onMouseDown={(e) => startResize(e, column.id, column.width)}
            />
          </div>
        ))}
        
        {/* Column settings button */}
        <div className="flex items-center gap-1 px-2 ml-auto flex-shrink-0">
          <DropdownMenu open={showColumnSettings} onOpenChange={setShowColumnSettings}>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded hover:bg-muted transition-colors">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Colonne visibili</div>
              {columns.map(col => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.visible}
                  onCheckedChange={() => toggleColumnVisibility(col.id)}
                  className="gap-2"
                >
                  {col.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {col.header}
                  {col.id.startsWith('custom_') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColumn(col.id);
                      }}
                      className="ml-auto p-1 hover:bg-destructive/20 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setNewColumnDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi colonna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task rows */}
      <div className="max-h-[calc(100vh-320px)] overflow-auto">
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

      {/* New Column Dialog */}
      <Dialog open={newColumnDialog} onOpenChange={setNewColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi nuova colonna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nome colonna</label>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Es. Note, Budget, Responsabile..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo colonna</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {Object.entries(columnTypeIcons).map(([type, icon]) => (
                  <button
                    key={type}
                    onClick={() => setNewColumnType(type as ColumnType)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                      newColumnType === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {icon}
                    <span className="text-xs capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewColumnDialog(false)}>Annulla</Button>
            <Button onClick={addNewColumn}>Aggiungi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resize cursor overlay */}
      {resizing && (
        <div className="fixed inset-0 cursor-col-resize z-50" />
      )}
    </div>
  );
}
