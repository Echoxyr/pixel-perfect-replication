import { useState, useMemo, useRef } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { AdvancedTaskTable } from '@/components/workhub/AdvancedTaskTable';
import { KanbanBoard } from '@/components/workhub/KanbanBoard';
import { GanttTimeline } from '@/components/workhub/GanttTimeline';
import { InteractiveCalendar } from '@/components/workhub/InteractiveCalendar';
import { Task, TaskStatus, TaskPriority, Subtask, generateId } from '@/types/workhub';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  LayoutGrid,
  Calendar,
  GanttChart,
  Plus,
  Search,
  Trash2,
  X,
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Camera,
  FileSpreadsheet,
  Filter,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'table' | 'board' | 'calendar' | 'timeline';

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export default function Progetti() {
  const { tasks, cantieri, imprese, addTask, updateTask, deleteTask } = useWorkHub();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCantiere, setFilterCantiere] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCantiere, setNewTaskCantiere] = useState('');
  const [newTaskImpresa, setNewTaskImpresa] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('media');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskNote, setNewTaskNote] = useState('');

  // File attachments
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all' && task.status !== filterStatus) {
        return false;
      }
      if (filterCantiere !== 'all' && task.cantiereId !== filterCantiere) {
        return false;
      }
      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterCantiere, filterPriority]);

  const resetNewTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskCantiere('');
    setNewTaskImpresa('');
    setNewTaskPriority('media');
    setNewTaskStartDate('');
    setNewTaskDueDate('');
    setNewTaskNote('');
    setAttachments([]);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Errore",
        description: "Il titolo è obbligatorio",
        variant: "destructive"
      });
      return;
    }

    try {
      addTask({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        cantiereId: newTaskCantiere && newTaskCantiere !== 'none' ? newTaskCantiere : undefined,
        impresaId: newTaskImpresa && newTaskImpresa !== 'none' ? newTaskImpresa : undefined,
        status: 'da_iniziare',
        priority: newTaskPriority,
        startDate: newTaskStartDate || undefined,
        dueDate: newTaskDueDate || undefined,
        note: newTaskNote || undefined,
        updates: [],
        check: false,
        tags: [],
        subtasks: [],
        fileInfo: attachments.length > 0 ? `${attachments.length} file allegati` : undefined
      });

      toast({
        title: "Task creato",
        description: `"${newTaskTitle}" è stato aggiunto con successo`
      });

      resetNewTaskForm();
      setShowNewTaskDialog(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare il task",
        variant: "destructive"
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FileAttachment[] = Array.from(files).map(file => ({
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size
    }));

    setAttachments(prev => [...prev, ...newFiles]);
    toast({
      title: "File caricati",
      description: `${files.length} file aggiunti`
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleCreateTaskFromCalendar = (dateStr: string) => {
    setNewTaskDueDate(dateStr);
    setShowNewTaskDialog(true);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Progetti & Task</h1>
          <p className="text-sm text-muted-foreground">Gestione task e timeline lavori</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => {
              import('xlsx').then(XLSX => {
                const data = filteredTasks.map(t => ({
                  'Titolo': t.title,
                  'Stato': t.status,
                  'Priorità': t.priority,
                  'Cantiere': cantieri.find(c => c.id === t.cantiereId)?.codiceCommessa || '-',
                  'Impresa': imprese.find(i => i.id === t.impresaId)?.ragioneSociale || '-',
                  'Data Inizio': t.startDate || '-',
                  'Scadenza': t.dueDate || '-',
                  'Descrizione': t.description || '-',
                  'Note': t.note || '-',
                }));
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Task');
                XLSX.writeFile(wb, `export_task_${new Date().toISOString().split('T')[0]}.xlsx`);
                toast({ title: 'Export completato', description: 'File Excel scaricato' });
              });
            }}
            className="gap-2 flex-1 sm:flex-initial text-xs sm:text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden xs:inline">Export</span>
          </Button>
          <Button onClick={() => setShowNewTaskDialog(true)} className="gap-2 flex-1 sm:flex-initial text-xs sm:text-sm" data-tutorial="btn-nuovo-task">
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Nuovo</span> Task
          </Button>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 min-w-0">
          {/* Search */}
          <div className="relative w-full sm:flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full xs:w-28 sm:w-32">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="da_iniziare">Da iniziare</SelectItem>
                <SelectItem value="in_corso">In corso</SelectItem>
                <SelectItem value="in_attesa">In attesa</SelectItem>
                <SelectItem value="bloccato">Bloccato</SelectItem>
                <SelectItem value="fatto">Completato</SelectItem>
              </SelectContent>
            </Select>

            {/* Commessa Filter */}
            <Select value={filterCantiere} onValueChange={setFilterCantiere}>
              <SelectTrigger className="w-full xs:w-32 sm:w-36">
                <SelectValue placeholder="Commessa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                {cantieri.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.codiceCommessa}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full xs:w-28 sm:w-32">
                <SelectValue placeholder="Priorità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="critica">Critica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="bassa">Bassa</SelectItem>
                <SelectItem value="nessuna">Nessuna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg" data-tutorial="task-view-toggle">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'p-2 rounded-md transition-colors flex items-center gap-1.5',
              viewMode === 'table' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
            title="Tabella"
            data-tutorial="view-table"
          >
            <Table className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Tabella</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={cn(
              'p-2 rounded-md transition-colors flex items-center gap-1.5',
              viewMode === 'board' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
            title="Board"
            data-tutorial="view-board"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Board</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              'p-2 rounded-md transition-colors flex items-center gap-1.5',
              viewMode === 'calendar' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
            title="Calendario"
            data-tutorial="view-calendar"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Calendario</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={cn(
              'p-2 rounded-md transition-colors flex items-center gap-1.5',
              viewMode === 'timeline' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
            )}
            title="Timeline"
            data-tutorial="view-timeline"
          >
            <GanttChart className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Timeline</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          {filteredTasks.length} task {filterStatus !== 'all' || filterCantiere !== 'all' || filterPriority !== 'all' ? '(filtrati)' : ''}
        </span>
        <span className="text-muted-foreground">•</span>
        <span className="text-emerald-500 font-medium">
          {filteredTasks.filter(t => t.status === 'fatto').length} completati
        </span>
        <span className="text-muted-foreground">•</span>
        <span className="text-red-500 font-medium">
          {filteredTasks.filter(t => t.status === 'bloccato').length} bloccati
        </span>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' && (
        <AdvancedTaskTable tasks={filteredTasks} />
      )}

      {viewMode === 'board' && (
        <KanbanBoard tasks={filteredTasks} onTaskClick={() => {}} />
      )}

      {viewMode === 'calendar' && (
        <InteractiveCalendar 
          tasks={filteredTasks} 
          onTaskClick={() => {}}
          onCreateTask={handleCreateTaskFromCalendar}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      )}

      {viewMode === 'timeline' && (
        <GanttTimeline 
          tasks={filteredTasks} 
          onTaskClick={() => {}} 
          onUpdateTask={updateTask}
        />
      )}

      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Titolo *</label>
              <Input
                placeholder="Titolo del task"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Descrizione</label>
              <Textarea
                placeholder="Descrizione dettagliata..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Cantiere</label>
                <Select value={newTaskCantiere} onValueChange={setNewTaskCantiere}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona cantiere" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuno</SelectItem>
                    {cantieri.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Impresa</label>
                <Select value={newTaskImpresa} onValueChange={setNewTaskImpresa}>
                  <SelectTrigger>
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Priorità</label>
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="critica">Critica</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="bassa">Bassa</SelectItem>
                    <SelectItem value="nessuna">Nessuna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Inizio</label>
                <Input
                  type="date"
                  value={newTaskStartDate}
                  onChange={(e) => setNewTaskStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Scadenza</label>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Note</label>
              <Textarea
                placeholder="Note aggiuntive..."
                value={newTaskNote}
                onChange={(e) => setNewTaskNote(e.target.value)}
                rows={2}
              />
            </div>

            {/* File Attachments */}
            <div>
              <label className="text-sm font-medium mb-2 block">Allegati</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Clicca o trascina file qui</span>
                  <span className="text-xs">Supporta immagini, PDF, documenti Office</span>
                </div>
              </div>

              {/* Mobile camera capture */}
              <div className="mt-2 flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="camera-capture-new"
                />
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('camera-capture-new')?.click()}
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Scatta foto (mobile)
                </Button>
              </div>

              {/* Uploaded files list */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(file.id)}
                        className="p-1 hover:bg-background rounded"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetNewTaskForm(); setShowNewTaskDialog(false); }}>
              Annulla
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
              Crea Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
