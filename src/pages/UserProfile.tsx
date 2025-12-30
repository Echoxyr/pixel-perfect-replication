import { useState, useMemo } from 'react';
import { useUser, THEME_COLORS, UserTask, UserNote, UserCalendarEvent } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  User,
  Palette,
  ListTodo,
  Calendar,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Check,
  Clock,
  Pin,
  Save,
  Bell,
  Settings,
  Mail,
  Phone,
  Briefcase,
  Table,
  LayoutGrid,
  GanttChart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

type TaskViewMode = 'table' | 'board' | 'calendar' | 'timeline';

const STATUS_LABELS: Record<string, string> = {
  da_fare: 'Da fare',
  in_corso: 'In corso',
  completata: 'Completata',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgente: 'bg-red-500/15 text-red-500 border-red-500/30',
  alta: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
  media: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  bassa: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  da_fare: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  in_corso: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completata: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

export default function UserProfile() {
  const { 
    profile, 
    tasks, 
    events, 
    notes, 
    themeColor,
    uiConfig,
    updateProfile, 
    setThemeColor,
    setUIConfig,
    addTask,
    updateTask,
    deleteTask,
    addEvent,
    updateEvent,
    deleteEvent,
    addNote,
    updateNote,
    deleteNote,
    loading 
  } = useUser();
  const { toast } = useToast();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>('table');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Task dialog
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<UserTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    titolo: '',
    descrizione: '',
    priorita: 'media' as UserTask['priorita'],
    stato: 'da_fare' as UserTask['stato'],
    data_scadenza: '',
    completata: false,
  });

  // Event dialog
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UserCalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    titolo: '',
    descrizione: '',
    data_inizio: '',
    data_fine: '',
    tutto_il_giorno: false,
    colore: 'primary',
  });

  // Note dialog
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [noteForm, setNoteForm] = useState({
    titolo: '',
    contenuto: '',
    categoria: 'generale',
    pinned: false,
    colore: 'default',
  });

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      !searchQuery || task.titolo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  // Tasks by status for board
  const tasksByStatus = useMemo(() => {
    return {
      da_fare: filteredTasks.filter(t => t.stato === 'da_fare'),
      in_corso: filteredTasks.filter(t => t.stato === 'in_corso'),
      completata: filteredTasks.filter(t => t.stato === 'completata'),
    };
  }, [filteredTasks]);

  const handleSaveProfile = async () => {
    await updateProfile(profileForm);
    setEditingProfile(false);
    toast({ title: 'Profilo aggiornato', description: 'Le modifiche sono state salvate.' });
  };

  const handleThemeChange = async (colorId: string) => {
    await setThemeColor(colorId);
    toast({ title: 'Tema aggiornato', description: `Il colore principale è stato cambiato.` });
  };

  // Task handlers
  const openNewTask = (initialDate?: string) => {
    setEditingTask(null);
    setTaskForm({ 
      titolo: '', 
      descrizione: '', 
      priorita: 'media', 
      stato: 'da_fare', 
      data_scadenza: initialDate || '', 
      completata: false 
    });
    setShowTaskDialog(true);
  };

  const openEditTask = (task: UserTask) => {
    setEditingTask(task);
    setTaskForm({
      titolo: task.titolo,
      descrizione: task.descrizione,
      priorita: task.priorita,
      stato: task.stato,
      data_scadenza: task.data_scadenza || '',
      completata: task.completata,
    });
    setShowTaskDialog(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.titolo.trim()) return;
    
    if (editingTask) {
      await updateTask(editingTask.id, taskForm);
      toast({ title: 'Task aggiornata' });
    } else {
      await addTask(taskForm);
      toast({ title: 'Task creata' });
    }
    setShowTaskDialog(false);
  };

  const handleToggleTask = async (task: UserTask) => {
    await updateTask(task.id, { 
      completata: !task.completata, 
      stato: !task.completata ? 'completata' : 'da_fare' 
    });
  };

  const handleStatusChange = async (taskId: string, newStatus: UserTask['stato']) => {
    await updateTask(taskId, { stato: newStatus, completata: newStatus === 'completata' });
    toast({ title: 'Stato aggiornato' });
  };

  // Event handlers
  const openNewEvent = () => {
    setEditingEvent(null);
    setEventForm({ 
      titolo: '', 
      descrizione: '', 
      data_inizio: new Date().toISOString().slice(0, 16), 
      data_fine: '', 
      tutto_il_giorno: false, 
      colore: 'primary' 
    });
    setShowEventDialog(true);
  };

  const openEditEvent = (event: UserCalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      titolo: event.titolo,
      descrizione: event.descrizione,
      data_inizio: event.data_inizio.slice(0, 16),
      data_fine: event.data_fine?.slice(0, 16) || '',
      tutto_il_giorno: event.tutto_il_giorno,
      colore: event.colore,
    });
    setShowEventDialog(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.titolo.trim() || !eventForm.data_inizio) return;
    
    if (editingEvent) {
      await updateEvent(editingEvent.id, {
        ...eventForm,
        data_fine: eventForm.data_fine || null,
      });
      toast({ title: 'Evento aggiornato' });
    } else {
      await addEvent({
        ...eventForm,
        data_fine: eventForm.data_fine || null,
      });
      toast({ title: 'Evento creato' });
    }
    setShowEventDialog(false);
  };

  // Note handlers
  const openNewNote = () => {
    setEditingNote(null);
    setNoteForm({ titolo: '', contenuto: '', categoria: 'generale', pinned: false, colore: 'default' });
    setShowNoteDialog(true);
  };

  const openEditNote = (note: UserNote) => {
    setEditingNote(note);
    setNoteForm({
      titolo: note.titolo,
      contenuto: note.contenuto,
      categoria: note.categoria,
      pinned: note.pinned,
      colore: note.colore,
    });
    setShowNoteDialog(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.titolo.trim()) return;
    
    if (editingNote) {
      await updateNote(editingNote.id, noteForm);
      toast({ title: 'Nota aggiornata' });
    } else {
      await addNote(noteForm);
      toast({ title: 'Nota creata' });
    }
    setShowNoteDialog(false);
  };

  const getNoteColor = (colore: string) => {
    switch (colore) {
      case 'red': return 'border-l-red-500 bg-red-500/5';
      case 'orange': return 'border-l-orange-500 bg-orange-500/5';
      case 'yellow': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'green': return 'border-l-emerald-500 bg-emerald-500/5';
      case 'blue': return 'border-l-blue-500 bg-blue-500/5';
      case 'purple': return 'border-l-purple-500 bg-purple-500/5';
      default: return 'border-l-border bg-card';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Render Task Table View
  const renderTaskTable = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Titolo</th>
              <th className="text-left p-3 font-medium">Stato</th>
              <th className="text-left p-3 font-medium">Priorità</th>
              <th className="text-left p-3 font-medium">Scadenza</th>
              <th className="text-left p-3 font-medium w-20">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={task.completata}
                      onCheckedChange={() => handleToggleTask(task)}
                    />
                    <span className={cn(task.completata && 'line-through opacity-60')}>
                      {task.titolo}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <Select value={task.stato} onValueChange={(v) => handleStatusChange(task.id, v as UserTask['stato'])}>
                    <SelectTrigger className="h-8 w-32">
                      <Badge className={cn('text-xs', STATUS_COLORS[task.stato])}>
                        {STATUS_LABELS[task.stato]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="da_fare">Da fare</SelectItem>
                      <SelectItem value="in_corso">In corso</SelectItem>
                      <SelectItem value="completata">Completata</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Badge className={cn('text-xs', PRIORITY_COLORS[task.priorita])}>
                    {task.priorita}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {task.data_scadenza ? format(new Date(task.data_scadenza), 'dd MMM yyyy', { locale: it }) : '-'}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTask(task)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Nessuna task. Clicca "Nuova Task" per crearne una.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Board View
  const renderTaskBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
        <div key={status} className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Badge className={cn('text-xs', STATUS_COLORS[status])}>
                {STATUS_LABELS[status]}
              </Badge>
              <span className="text-muted-foreground">{statusTasks.length}</span>
            </h3>
          </div>
          <div className="space-y-2">
            {statusTasks.map(task => (
              <div
                key={task.id}
                className="bg-card p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openEditTask(task)}
              >
                <p className={cn('font-medium text-sm mb-2', task.completata && 'line-through opacity-60')}>
                  {task.titolo}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-[10px]', PRIORITY_COLORS[task.priorita])}>
                    {task.priorita}
                  </Badge>
                  {task.data_scadenza && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(task.data_scadenza), 'dd MMM', { locale: it })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {statusTasks.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nessuna task
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Render Calendar View
  const renderTaskCalendar = () => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-lg">
          {format(calendarMonth, 'MMMM yyyy', { locale: it })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
        {calendarDays.map(day => {
          const dayTasks = filteredTasks.filter(t => 
            t.data_scadenza && isSameDay(new Date(t.data_scadenza), day)
          );
          return (
            <div
              key={day.toISOString()}
              onClick={() => openNewTask(format(day, 'yyyy-MM-dd'))}
              className={cn(
                'min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
                !isSameMonth(day, calendarMonth) && 'opacity-50',
                isToday(day) && 'ring-2 ring-primary'
              )}
            >
              <div className={cn(
                'text-xs font-medium mb-1',
                isToday(day) && 'text-primary'
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); openEditTask(task); }}
                    className={cn(
                      'text-[10px] truncate rounded px-1 py-0.5',
                      task.completata ? 'bg-emerald-500/20 text-emerald-600' : 'bg-primary/20 text-primary'
                    )}
                  >
                    {task.titolo}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-muted-foreground">+{dayTasks.length - 2} altre</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Timeline View
  const renderTaskTimeline = () => {
    const tasksWithDates = filteredTasks.filter(t => t.data_scadenza);
    const sortedTasks = [...tasksWithDates].sort((a, b) => 
      new Date(a.data_scadenza!).getTime() - new Date(b.data_scadenza!).getTime()
    );

    return (
      <div className="border rounded-lg p-4">
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna task con data scadenza
            </div>
          ) : (
            sortedTasks.map((task, index) => (
              <div key={task.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-2',
                    task.completata ? 'bg-emerald-500 border-emerald-500' : 'border-primary'
                  )} />
                  {index < sortedTasks.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-1" />
                  )}
                </div>
                <div 
                  className="flex-1 pb-4 cursor-pointer"
                  onClick={() => openEditTask(task)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(task.data_scadenza!), 'dd MMM yyyy', { locale: it })}
                    </span>
                    <Badge className={cn('text-xs', STATUS_COLORS[task.stato])}>
                      {STATUS_LABELS[task.stato]}
                    </Badge>
                  </div>
                  <p className={cn('font-medium', task.completata && 'line-through opacity-60')}>
                    {task.titolo}
                  </p>
                  {task.descrizione && (
                    <p className="text-sm text-muted-foreground mt-1">{task.descrizione}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Area Personale</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Gestisci il tuo profilo, task personali e note</p>
        </div>
      </div>

      <Tabs defaultValue="profilo" className="space-y-6">
        <TabsList className="tabs-scrollable-header flex flex-nowrap overflow-x-auto gap-1 h-auto p-1">
          <TabsTrigger value="profilo" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profilo</span>
          </TabsTrigger>
          <TabsTrigger value="tema" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Tema</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">Task</span>
            {tasks.filter(t => !t.completata).length > 0 && (
              <Badge variant="secondary" className="ml-1">{tasks.filter(t => !t.completata).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendario" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="taccuino" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Taccuino</span>
          </TabsTrigger>
        </TabsList>

        {/* Profilo Tab */}
        <TabsContent value="profilo">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Informazioni Profilo</CardTitle>
                <CardDescription>Gestisci i tuoi dati personali</CardDescription>
              </div>
              {!editingProfile ? (
                <Button variant="outline" onClick={() => { setProfileForm(profile); setEditingProfile(true); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>Annulla</Button>
                  <Button onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                      {profile.nome[0]}{profile.cognome[0]}
                    </span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    {editingProfile ? (
                      <Input value={profileForm.nome} onChange={e => setProfileForm({ ...profileForm, nome: e.target.value })} />
                    ) : (
                      <p className="text-foreground font-medium">{profile.nome}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome</Label>
                    {editingProfile ? (
                      <Input value={profileForm.cognome} onChange={e => setProfileForm({ ...profileForm, cognome: e.target.value })} />
                    ) : (
                      <p className="text-foreground font-medium">{profile.cognome}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Briefcase className="w-4 h-4" />Ruolo</Label>
                    {editingProfile ? (
                      <Input value={profileForm.ruolo} onChange={e => setProfileForm({ ...profileForm, ruolo: e.target.value })} />
                    ) : (
                      <p className="text-foreground font-medium">{profile.ruolo}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4" />Email</Label>
                    {editingProfile ? (
                      <Input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                    ) : (
                      <p className="text-foreground font-medium">{profile.email || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4" />Telefono</Label>
                    {editingProfile ? (
                      <Input value={profileForm.telefono} onChange={e => setProfileForm({ ...profileForm, telefono: e.target.value })} />
                    ) : (
                      <p className="text-foreground font-medium">{profile.telefono || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tema Tab */}
        <TabsContent value="tema">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" />Colore Principale</CardTitle>
                <CardDescription>Il colore usato per pulsanti, link e elementi interattivi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-3">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => handleThemeChange(color.id)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all hover:scale-105',
                        themeColor === color.id 
                          ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md ring-2 ring-background" style={{ background: `hsl(${color.primary})` }} />
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{color.name}</span>
                      {themeColor === color.id && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Personalizzazione Interfaccia</CardTitle>
                <CardDescription>Configura l'aspetto dei componenti dell'applicazione</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Stile Bordi Pulsanti</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'sharp', label: 'Squadrato', radius: '0' },
                      { id: 'soft', label: 'Morbido', radius: '0.375rem' },
                      { id: 'rounded', label: 'Arrotondato', radius: '0.75rem' },
                      { id: 'pill', label: 'Pillola', radius: '9999px' },
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setUIConfig({ buttonBorderRadius: style.radius });
                          toast({ title: 'Stile aggiornato' });
                        }}
                        className={cn(
                          'p-3 border-2 rounded-lg transition-all',
                          uiConfig.buttonBorderRadius === style.radius 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="w-full h-8 bg-primary mb-2" style={{ borderRadius: style.radius }} />
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Stile Card</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'flat', label: 'Piatto' },
                      { id: 'elevated', label: 'Elevato' },
                      { id: 'glass', label: 'Glass' },
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setUIConfig({ cardStyle: style.id as 'flat' | 'elevated' | 'glass' });
                          toast({ title: 'Stile card aggiornato' });
                        }}
                        className={cn(
                          'p-3 border-2 rounded-lg transition-all',
                          uiConfig.cardStyle === style.id 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="w-full h-16 rounded-lg bg-card mb-2 border" />
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Ombra Pulsanti</Label>
                      <p className="text-xs text-muted-foreground">Aggiunge profondità ai pulsanti</p>
                    </div>
                    <Switch checked={uiConfig.buttonShadow} onCheckedChange={(checked) => setUIConfig({ buttonShadow: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Effetto Glass</Label>
                      <p className="text-xs text-muted-foreground">Sfondo sfumato trasparente</p>
                    </div>
                    <Switch checked={uiConfig.glassEffect} onCheckedChange={(checked) => setUIConfig({ glassEffect: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Animazioni</Label>
                      <p className="text-xs text-muted-foreground">Transizioni fluide tra gli stati</p>
                    </div>
                    <Switch checked={uiConfig.animationsEnabled} onCheckedChange={(checked) => setUIConfig({ animationsEnabled: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Hover Glow</Label>
                      <p className="text-xs text-muted-foreground">Effetto luminoso al passaggio mouse</p>
                    </div>
                    <Switch checked={uiConfig.hoverGlow} onCheckedChange={(checked) => setUIConfig({ hoverGlow: checked })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab - Now with Table/Board/Calendar/Timeline views */}
        <TabsContent value="tasks">
          <div className="space-y-4">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Cerca task..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-60"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setTaskViewMode('table')}
                    className={cn('p-2 rounded-md transition-colors flex items-center gap-1.5', taskViewMode === 'table' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
                  >
                    <Table className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Tabella</span>
                  </button>
                  <button
                    onClick={() => setTaskViewMode('board')}
                    className={cn('p-2 rounded-md transition-colors flex items-center gap-1.5', taskViewMode === 'board' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Board</span>
                  </button>
                  <button
                    onClick={() => setTaskViewMode('calendar')}
                    className={cn('p-2 rounded-md transition-colors flex items-center gap-1.5', taskViewMode === 'calendar' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Calendario</span>
                  </button>
                  <button
                    onClick={() => setTaskViewMode('timeline')}
                    className={cn('p-2 rounded-md transition-colors flex items-center gap-1.5', taskViewMode === 'timeline' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
                  >
                    <GanttChart className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Timeline</span>
                  </button>
                </div>
                <Button onClick={() => openNewTask()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuova Task</span>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">{filteredTasks.length} task</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-emerald-500 font-medium">{filteredTasks.filter(t => t.completata).length} completate</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-blue-500 font-medium">{filteredTasks.filter(t => t.stato === 'in_corso').length} in corso</span>
            </div>

            {/* View Content */}
            {taskViewMode === 'table' && renderTaskTable()}
            {taskViewMode === 'board' && renderTaskBoard()}
            {taskViewMode === 'calendar' && renderTaskCalendar()}
            {taskViewMode === 'timeline' && renderTaskTimeline()}
          </div>
        </TabsContent>

        {/* Calendario Tab */}
        <TabsContent value="calendario">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Calendario Personale</CardTitle>
                <CardDescription>I tuoi eventi e appuntamenti</CardDescription>
              </div>
              <Button onClick={openNewEvent}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nuovo Evento</span>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun evento in calendario</p>
                    <Button variant="link" onClick={openNewEvent}>Aggiungi evento</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.map(event => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-all">
                        <div className="w-2 h-full min-h-[40px] rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm sm:text-base break-words">{event.titolo}</span>
                          {event.descrizione && <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{event.descrizione}</p>}
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.data_inizio), 'dd MMM yyyy HH:mm', { locale: it })}
                            {event.data_fine && ` - ${format(new Date(event.data_fine), 'HH:mm', { locale: it })}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditEvent(event)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteEvent(event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Taccuino Tab */}
        <TabsContent value="taccuino">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Taccuino Personale</CardTitle>
                <CardDescription>Note e appunti personali</CardDescription>
              </div>
              <Button onClick={openNewNote}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nuova Nota</span>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {notes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna nota salvata</p>
                    <Button variant="link" onClick={openNewNote}>Crea la prima nota</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {notes.map(note => (
                      <div
                        key={note.id}
                        className={cn('p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all', getNoteColor(note.colore))}
                        onClick={() => openEditNote(note)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium break-words flex-1">{note.titolo}</span>
                          {note.pinned && <Pin className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        {note.contenuto && <p className="text-sm text-muted-foreground line-clamp-3">{note.contenuto}</p>}
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-[10px]">{note.categoria}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(note.updated_at), 'dd/MM/yy', { locale: it })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Modifica Task' : 'Nuova Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titolo *</Label>
              <Input value={taskForm.titolo} onChange={e => setTaskForm({ ...taskForm, titolo: e.target.value })} placeholder="Titolo della task" />
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea value={taskForm.descrizione} onChange={e => setTaskForm({ ...taskForm, descrizione: e.target.value })} placeholder="Descrizione..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priorità</Label>
                <Select value={taskForm.priorita} onValueChange={v => setTaskForm({ ...taskForm, priorita: v as UserTask['priorita'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bassa">Bassa</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stato</Label>
                <Select value={taskForm.stato} onValueChange={v => setTaskForm({ ...taskForm, stato: v as UserTask['stato'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="da_fare">Da fare</SelectItem>
                    <SelectItem value="in_corso">In corso</SelectItem>
                    <SelectItem value="completata">Completata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Scadenza</Label>
              <Input type="date" value={taskForm.data_scadenza} onChange={e => setTaskForm({ ...taskForm, data_scadenza: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveTask}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titolo *</Label>
              <Input value={eventForm.titolo} onChange={e => setEventForm({ ...eventForm, titolo: e.target.value })} placeholder="Titolo evento" />
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea value={eventForm.descrizione} onChange={e => setEventForm({ ...eventForm, descrizione: e.target.value })} placeholder="Descrizione..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Inizio *</Label>
                <Input type="datetime-local" value={eventForm.data_inizio} onChange={e => setEventForm({ ...eventForm, data_inizio: e.target.value })} />
              </div>
              <div>
                <Label>Fine</Label>
                <Input type="datetime-local" value={eventForm.data_fine} onChange={e => setEventForm({ ...eventForm, data_fine: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={eventForm.tutto_il_giorno} onCheckedChange={checked => setEventForm({ ...eventForm, tutto_il_giorno: checked })} />
              <Label>Tutto il giorno</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveEvent}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Modifica Nota' : 'Nuova Nota'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titolo *</Label>
              <Input value={noteForm.titolo} onChange={e => setNoteForm({ ...noteForm, titolo: e.target.value })} placeholder="Titolo nota" />
            </div>
            <div>
              <Label>Contenuto</Label>
              <Textarea value={noteForm.contenuto} onChange={e => setNoteForm({ ...noteForm, contenuto: e.target.value })} placeholder="Scrivi qui..." rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={noteForm.categoria} onValueChange={v => setNoteForm({ ...noteForm, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generale">Generale</SelectItem>
                    <SelectItem value="lavoro">Lavoro</SelectItem>
                    <SelectItem value="personale">Personale</SelectItem>
                    <SelectItem value="idee">Idee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Colore</Label>
                <Select value={noteForm.colore} onValueChange={v => setNoteForm({ ...noteForm, colore: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="red">Rosso</SelectItem>
                    <SelectItem value="orange">Arancione</SelectItem>
                    <SelectItem value="yellow">Giallo</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="blue">Blu</SelectItem>
                    <SelectItem value="purple">Viola</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={noteForm.pinned} onCheckedChange={checked => setNoteForm({ ...noteForm, pinned: checked })} />
              <Label>Fissa in alto</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveNote}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
