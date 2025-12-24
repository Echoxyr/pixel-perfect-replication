import { useState } from 'react';
import { useUser, THEME_COLORS, UserTask, UserNote, UserCalendarEvent } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertCircle,
  Pin,
  Save,
  Bell,
  Settings,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function UserProfile() {
  const { 
    profile, 
    tasks, 
    events, 
    notes, 
    themeColor, 
    updateProfile, 
    setThemeColor,
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
  const openNewTask = () => {
    setEditingTask(null);
    setTaskForm({ titolo: '', descrizione: '', priorita: 'media', stato: 'da_fare', data_scadenza: '', completata: false });
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

  const getPriorityColor = (priorita: string) => {
    switch (priorita) {
      case 'urgente': return 'bg-red-500/15 text-red-500';
      case 'alta': return 'bg-orange-500/15 text-orange-500';
      case 'media': return 'bg-amber-500/15 text-amber-500';
      case 'bassa': return 'bg-emerald-500/15 text-emerald-500';
      default: return 'bg-muted text-muted-foreground';
    }
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
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="profilo" className="flex items-center gap-2 text-xs sm:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profilo</span>
          </TabsTrigger>
          <TabsTrigger value="tema" className="flex items-center gap-2 text-xs sm:text-sm">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Tema</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2 text-xs sm:text-sm">
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">Task</span>
            {tasks.filter(t => !t.completata).length > 0 && (
              <Badge variant="secondary" className="ml-1">{tasks.filter(t => !t.completata).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendario" className="flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="taccuino" className="flex items-center gap-2 text-xs sm:text-sm">
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
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                      {profile.nome[0]}{profile.cognome[0]}
                    </span>
                  </div>
                  {editingProfile && (
                    <Button variant="outline" size="sm">Cambia foto</Button>
                  )}
                </div>

                {/* Form */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    {editingProfile ? (
                      <Input 
                        value={profileForm.nome} 
                        onChange={e => setProfileForm({ ...profileForm, nome: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.nome}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome</Label>
                    {editingProfile ? (
                      <Input 
                        value={profileForm.cognome} 
                        onChange={e => setProfileForm({ ...profileForm, cognome: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.cognome}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Ruolo
                    </Label>
                    {editingProfile ? (
                      <Input 
                        value={profileForm.ruolo} 
                        onChange={e => setProfileForm({ ...profileForm, ruolo: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.ruolo}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    {editingProfile ? (
                      <Input 
                        type="email"
                        value={profileForm.email} 
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.email || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefono
                    </Label>
                    {editingProfile ? (
                      <Input 
                        value={profileForm.telefono} 
                        onChange={e => setProfileForm({ ...profileForm, telefono: e.target.value })}
                      />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personalizza Tema
              </CardTitle>
              <CardDescription>Scegli il colore principale dell'applicazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {THEME_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => handleThemeChange(color.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all',
                      themeColor === color.id 
                        ? 'border-primary bg-primary/10 shadow-lg' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md"
                      style={{ background: `hsl(${color.primary})` }}
                    />
                    <span className="text-xs sm:text-sm font-medium">{color.name}</span>
                    {themeColor === color.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 sm:p-6 rounded-xl border bg-card">
                <h3 className="font-semibold mb-4">Anteprima</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Pulsante Primario</Button>
                  <Button variant="secondary">Secondario</Button>
                  <Button variant="outline">Outline</Button>
                  <Badge>Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5" />
                  Task Personali
                </CardTitle>
                <CardDescription>Gestisci le tue attività personali</CardDescription>
              </div>
              <Button onClick={openNewTask}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nuova Task</span>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListTodo className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessuna task personale</p>
                    <Button variant="link" onClick={openNewTask}>Crea la prima task</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border transition-all',
                          task.completata ? 'bg-muted/50 opacity-60' : 'bg-card hover:bg-muted/30'
                        )}
                      >
                        <Checkbox
                          checked={task.completata}
                          onCheckedChange={() => handleToggleTask(task)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('font-medium text-sm sm:text-base break-words', task.completata && 'line-through')}>
                              {task.titolo}
                            </span>
                            <Badge className={cn('text-[10px]', getPriorityColor(task.priorita))}>
                              {task.priorita}
                            </Badge>
                          </div>
                          {task.descrizione && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{task.descrizione}</p>
                          )}
                          {task.data_scadenza && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(task.data_scadenza), 'dd MMM yyyy', { locale: it })}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTask(task)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTask(task.id)}>
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

        {/* Calendario Tab */}
        <TabsContent value="calendario">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Calendario Personale
                </CardTitle>
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
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-all"
                      >
                        <div className="w-2 h-full min-h-[40px] rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm sm:text-base break-words">{event.titolo}</span>
                          {event.descrizione && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{event.descrizione}</p>
                          )}
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
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Taccuino
                </CardTitle>
                <CardDescription>Le tue note e appunti personali</CardDescription>
              </div>
              <Button onClick={openNewNote}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nuova Nota</span>
              </Button>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna nota</p>
                  <Button variant="link" onClick={openNewNote}>Crea la prima nota</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map(note => (
                    <div
                      key={note.id}
                      className={cn(
                        'p-4 rounded-lg border-l-4 transition-all cursor-pointer hover:shadow-md',
                        getNoteColor(note.colore)
                      )}
                      onClick={() => openEditNote(note)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm break-words">{note.titolo}</h3>
                        {note.pinned && <Pin className="w-4 h-4 text-primary flex-shrink-0" />}
                      </div>
                      {note.contenuto && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3 break-words">{note.contenuto}</p>
                      )}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Modifica Task' : 'Nuova Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo *</Label>
              <Input
                value={taskForm.titolo}
                onChange={e => setTaskForm({ ...taskForm, titolo: e.target.value })}
                placeholder="Cosa devi fare?"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea
                value={taskForm.descrizione}
                onChange={e => setTaskForm({ ...taskForm, descrizione: e.target.value })}
                placeholder="Dettagli opzionali..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorità</Label>
                <Select value={taskForm.priorita} onValueChange={(v: UserTask['priorita']) => setTaskForm({ ...taskForm, priorita: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bassa">Bassa</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scadenza</Label>
                <Input
                  type="date"
                  value={taskForm.data_scadenza}
                  onChange={e => setTaskForm({ ...taskForm, data_scadenza: e.target.value })}
                />
              </div>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo *</Label>
              <Input
                value={eventForm.titolo}
                onChange={e => setEventForm({ ...eventForm, titolo: e.target.value })}
                placeholder="Nome evento"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea
                value={eventForm.descrizione}
                onChange={e => setEventForm({ ...eventForm, descrizione: e.target.value })}
                placeholder="Dettagli opzionali..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inizio *</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.data_inizio}
                  onChange={e => setEventForm({ ...eventForm, data_inizio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fine</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.data_fine}
                  onChange={e => setEventForm({ ...eventForm, data_fine: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="tutto_il_giorno"
                checked={eventForm.tutto_il_giorno}
                onCheckedChange={(checked) => setEventForm({ ...eventForm, tutto_il_giorno: !!checked })}
              />
              <Label htmlFor="tutto_il_giorno">Tutto il giorno</Label>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Modifica Nota' : 'Nuova Nota'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo *</Label>
              <Input
                value={noteForm.titolo}
                onChange={e => setNoteForm({ ...noteForm, titolo: e.target.value })}
                placeholder="Titolo nota"
              />
            </div>
            <div className="space-y-2">
              <Label>Contenuto</Label>
              <Textarea
                value={noteForm.contenuto}
                onChange={e => setNoteForm({ ...noteForm, contenuto: e.target.value })}
                placeholder="Scrivi qui..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={noteForm.categoria} onValueChange={v => setNoteForm({ ...noteForm, categoria: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generale">Generale</SelectItem>
                    <SelectItem value="lavoro">Lavoro</SelectItem>
                    <SelectItem value="personale">Personale</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="importante">Importante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Colore</Label>
                <Select value={noteForm.colore} onValueChange={v => setNoteForm({ ...noteForm, colore: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
              <Checkbox
                id="pinned"
                checked={noteForm.pinned}
                onCheckedChange={(checked) => setNoteForm({ ...noteForm, pinned: !!checked })}
              />
              <Label htmlFor="pinned">Fissa in alto</Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingNote && (
              <Button variant="destructive" onClick={() => { deleteNote(editingNote.id); setShowNoteDialog(false); }} className="sm:mr-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveNote}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
