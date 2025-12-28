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
          <div className="space-y-6">
            {/* Colore Principale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Colore Principale
                </CardTitle>
                <CardDescription>Il colore usato per pulsanti, link e elementi interattivi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => handleThemeChange(color.id)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl border-2 transition-all hover:scale-105',
                        themeColor === color.id 
                          ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md ring-2 ring-background"
                        style={{ background: `hsl(${color.primary})` }}
                      />
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

            {/* Personalizzazione UI Avanzata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Personalizzazione Interfaccia
                </CardTitle>
                <CardDescription>Configura l'aspetto dei componenti dell'applicazione</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stile Bordi */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Stile Bordi Pulsanti</Label>
                  <div className="grid grid-cols-4 gap-3">
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
                          toast({ title: 'Stile aggiornato', description: `Bordi impostati a "${style.label}"` });
                        }}
                        className={cn(
                          'p-3 border-2 rounded-lg transition-all',
                          uiConfig.buttonBorderRadius === style.radius 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div 
                          className="w-full h-8 bg-primary mb-2"
                          style={{ borderRadius: style.radius }}
                        />
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stile Card */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Stile Card</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'flat', label: 'Piatto', shadow: 'none', border: '1px solid hsl(var(--border))' },
                      { id: 'elevated', label: 'Elevato', shadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: 'none' },
                      { id: 'glass', label: 'Glass', shadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)' },
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setUIConfig({ cardStyle: style.id as 'flat' | 'elevated' | 'glass' });
                          toast({ title: 'Stile card aggiornato', description: `Stile impostato a "${style.label}"` });
                        }}
                        className={cn(
                          'p-3 border-2 rounded-lg transition-all',
                          uiConfig.cardStyle === style.id 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div 
                          className="w-full h-16 rounded-lg bg-card mb-2"
                          style={{ boxShadow: style.shadow, border: style.border }}
                        />
                        <span className="text-xs font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opzioni Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Ombra Pulsanti</Label>
                      <p className="text-xs text-muted-foreground">Aggiunge profondità ai pulsanti</p>
                    </div>
                    <Switch 
                      checked={uiConfig.buttonShadow} 
                      onCheckedChange={(checked) => setUIConfig({ buttonShadow: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Effetto Glass</Label>
                      <p className="text-xs text-muted-foreground">Sfondo sfumato trasparente</p>
                    </div>
                    <Switch 
                      checked={uiConfig.glassEffect}
                      onCheckedChange={(checked) => setUIConfig({ glassEffect: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Animazioni</Label>
                      <p className="text-xs text-muted-foreground">Transizioni fluide tra gli stati</p>
                    </div>
                    <Switch 
                      checked={uiConfig.animationsEnabled}
                      onCheckedChange={(checked) => setUIConfig({ animationsEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                      <Label className="font-medium">Hover Glow</Label>
                      <p className="text-xs text-muted-foreground">Effetto luminoso al passaggio mouse</p>
                    </div>
                    <Switch 
                      checked={uiConfig.hoverGlow}
                      onCheckedChange={(checked) => setUIConfig({ hoverGlow: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anteprima Completa */}
            <Card>
              <CardHeader>
                <CardTitle>Anteprima Componenti</CardTitle>
                <CardDescription>Visualizza come appariranno i vari elementi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pulsanti */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Pulsanti</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button>Primario</Button>
                    <Button variant="secondary">Secondario</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Elimina</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>

                {/* Pulsanti con Icone */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Pulsanti con Icone</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm"><Plus className="w-4 h-4 mr-1" />Aggiungi</Button>
                    <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1" />Modifica</Button>
                    <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 mr-1" />Elimina</Button>
                    <Button size="icon" variant="ghost"><Bell className="w-4 h-4" /></Button>
                    <Button size="icon" variant="secondary"><Settings className="w-4 h-4" /></Button>
                  </div>
                </div>

                {/* Badge */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Badge</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Successo</Badge>
                    <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">Attenzione</Badge>
                  </div>
                </div>

                {/* Input */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Campi Input</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Input standard..." />
                    <Input placeholder="Input disabilitato" disabled />
                  </div>
                </div>

                {/* Card Preview */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Card Esempio</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-card shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Card Standard</p>
                          <p className="text-xs text-muted-foreground">Descrizione card</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Tag 1</Badge>
                        <Badge variant="outline">Tag 2</Badge>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">Card Highlight</p>
                          <p className="text-xs text-muted-foreground">Con sfondo primario</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">Azione</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
