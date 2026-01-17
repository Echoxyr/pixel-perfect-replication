import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  nome: string;
  cognome: string;
  ruolo: string;
  email: string;
  telefono: string;
  avatar_url: string;
  theme_color: string;
}

export interface UserTask {
  id: string;
  titolo: string;
  descrizione: string;
  priorita: 'bassa' | 'media' | 'alta' | 'urgente';
  stato: 'da_fare' | 'in_corso' | 'completata';
  data_scadenza: string | null;
  completata: boolean;
  created_at: string;
}

export interface UserCalendarEvent {
  id: string;
  titolo: string;
  descrizione: string;
  data_inizio: string;
  data_fine: string | null;
  tutto_il_giorno: boolean;
  colore: string;
}

export interface UserNote {
  id: string;
  titolo: string;
  contenuto: string;
  categoria: string;
  pinned: boolean;
  colore: string;
  created_at: string;
  updated_at: string;
}

// 15 colori distinti come richiesto
export const THEME_COLORS = [
  { id: 'blue', name: 'Blu', primary: '217 91% 60%', accent: '217 91% 97%' },
  { id: 'emerald', name: 'Smeraldo', primary: '160 84% 39%', accent: '160 84% 95%' },
  { id: 'violet', name: 'Viola', primary: '262 83% 58%', accent: '262 83% 95%' },
  { id: 'rose', name: 'Rosa', primary: '346 77% 50%', accent: '346 77% 95%' },
  { id: 'amber', name: 'Ambra', primary: '38 92% 50%', accent: '38 92% 95%' },
  { id: 'gold', name: 'Oro', primary: '45 93% 47%', accent: '45 93% 95%' },
  { id: 'teal', name: 'Teal', primary: '173 80% 40%', accent: '173 80% 95%' },
  { id: 'orange', name: 'Arancione', primary: '25 95% 53%', accent: '25 95% 95%' },
  { id: 'crimson', name: 'Cremisi', primary: '348 83% 47%', accent: '348 83% 95%' },
  { id: 'lime', name: 'Lime', primary: '84 81% 44%', accent: '84 81% 95%' },
  { id: 'fuchsia', name: 'Fucsia', primary: '292 84% 61%', accent: '292 84% 95%' },
  { id: 'sky', name: 'Cielo', primary: '199 89% 48%', accent: '199 89% 95%' },
  { id: 'coral', name: 'Corallo', primary: '16 85% 60%', accent: '16 85% 95%' },
  { id: 'mint', name: 'Menta', primary: '158 64% 52%', accent: '158 64% 95%' },
  { id: 'darkgreen', name: 'Verde Scuro', primary: '140 50% 30%', accent: '140 50% 95%' },
];

// Sidebar background colors
export const SIDEBAR_COLORS = [
  { id: 'dark', name: 'Scuro', background: '222 47% 14%', foreground: '220 14% 96%' },
  { id: 'darker', name: 'Nero', background: '220 25% 8%', foreground: '210 20% 95%' },
  { id: 'navy', name: 'Blu Navy', background: '224 47% 18%', foreground: '220 14% 96%' },
  { id: 'charcoal', name: 'Antracite', background: '210 15% 15%', foreground: '210 20% 95%' },
  { id: 'slate', name: 'Ardesia', background: '215 28% 17%', foreground: '210 20% 95%' },
  { id: 'graphite', name: 'Grafite', background: '0 0% 15%', foreground: '0 0% 95%' },
];

// Configurazioni varianti UI personalizzabili
export interface UIVariantConfig {
  buttonBorderRadius: string;
  cardStyle: 'flat' | 'elevated' | 'glass';
  buttonShadow: boolean;
  glassEffect: boolean;
  animationsEnabled: boolean;
  hoverGlow: boolean;
  sidebarColor: string;
}

export const DEFAULT_UI_CONFIG: UIVariantConfig = {
  buttonBorderRadius: '0.5rem',
  cardStyle: 'elevated',
  buttonShadow: true,
  glassEffect: true,
  animationsEnabled: true,
  hoverGlow: true,
  sidebarColor: 'dark',
};

const UI_CONFIG_KEY = 'ui_variant_config';

interface UserContextType {
  profile: UserProfile;
  tasks: UserTask[];
  events: UserCalendarEvent[];
  notes: UserNote[];
  themeColor: string;
  uiConfig: UIVariantConfig;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setThemeColor: (color: string) => void;
  setUIConfig: (config: Partial<UIVariantConfig>) => void;
  addTask: (task: Omit<UserTask, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<UserTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addEvent: (event: Omit<UserCalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<UserCalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addNote: (note: Omit<UserNote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<UserNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  loading: boolean;
}

const defaultProfile: UserProfile = {
  id: 'default',
  nome: 'Admin',
  cognome: 'User',
  ruolo: 'Direttore Tecnico',
  email: 'admin@gest-e.it',
  telefono: '+39 049 1234567',
  avatar_url: '',
  theme_color: 'blue',
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [events, setEvents] = useState<UserCalendarEvent[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [themeColor, setThemeColorState] = useState('blue');
  const [uiConfig, setUIConfigState] = useState<UIVariantConfig>(() => {
    const stored = localStorage.getItem(UI_CONFIG_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_UI_CONFIG;
  });
  const [loading, setLoading] = useState(true);

  // Load data from localStorage and Supabase
  useEffect(() => {
    loadData();
  }, []);

  // Apply theme color to CSS variables
  useEffect(() => {
    const colorConfig = THEME_COLORS.find(c => c.id === themeColor);
    if (colorConfig) {
      document.documentElement.style.setProperty('--primary', colorConfig.primary);
      document.documentElement.style.setProperty('--accent', colorConfig.accent);
      document.documentElement.style.setProperty('--ring', colorConfig.primary);
      document.documentElement.style.setProperty('--sidebar-primary', colorConfig.primary);
      document.documentElement.style.setProperty('--sidebar-ring', colorConfig.primary);
    }
  }, [themeColor]);

  // Apply UI config to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--radius', uiConfig.buttonBorderRadius);
    document.documentElement.classList.toggle('no-animations', !uiConfig.animationsEnabled);
    localStorage.setItem(UI_CONFIG_KEY, JSON.stringify(uiConfig));
  }, [uiConfig]);

  const loadData = async () => {
    try {
      // Load profile
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        setProfile({
          id: p.id,
          nome: p.nome || 'Admin',
          cognome: p.cognome || 'User',
          ruolo: p.ruolo || 'Direttore Tecnico',
          email: p.email || '',
          telefono: p.telefono || '',
          avatar_url: p.avatar_url || '',
          theme_color: p.theme_color || 'blue',
        });
        setThemeColorState(p.theme_color || 'blue');
      } else {
        // Create default profile
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();
        if (newProfile) {
          setProfile({ ...defaultProfile, id: newProfile.id });
        }
      }

      // Load tasks
      const { data: tasksData } = await supabase
        .from('user_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksData) {
        setTasks(tasksData.map(t => ({
          id: t.id,
          titolo: t.titolo,
          descrizione: t.descrizione || '',
          priorita: t.priorita as UserTask['priorita'] || 'media',
          stato: t.stato as UserTask['stato'] || 'da_fare',
          data_scadenza: t.data_scadenza,
          completata: t.completata || false,
          created_at: t.created_at,
        })));
      }

      // Load events
      const { data: eventsData } = await supabase
        .from('user_calendar_events')
        .select('*')
        .order('data_inizio', { ascending: true });
      
      if (eventsData) {
        setEvents(eventsData.map(e => ({
          id: e.id,
          titolo: e.titolo,
          descrizione: e.descrizione || '',
          data_inizio: e.data_inizio,
          data_fine: e.data_fine,
          tutto_il_giorno: e.tutto_il_giorno || false,
          colore: e.colore || 'primary',
        })));
      }

      // Load notes
      const { data: notesData } = await supabase
        .from('user_notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      
      if (notesData) {
        setNotes(notesData.map(n => ({
          id: n.id,
          titolo: n.titolo,
          contenuto: n.contenuto || '',
          categoria: n.categoria || 'generale',
          pinned: n.pinned || false,
          colore: n.colore || 'default',
          created_at: n.created_at,
          updated_at: n.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    
    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', profile.id);
  };

  const setThemeColor = async (color: string) => {
    setThemeColorState(color);
    await updateProfile({ theme_color: color });
  };

  const setUIConfig = (config: Partial<UIVariantConfig>) => {
    setUIConfigState(prev => ({ ...prev, ...config }));
  };

  const addTask = async (task: Omit<UserTask, 'id' | 'created_at'>) => {
    const { data } = await supabase
      .from('user_tasks')
      .insert({
        titolo: task.titolo,
        descrizione: task.descrizione,
        priorita: task.priorita,
        stato: task.stato,
        data_scadenza: task.data_scadenza,
        completata: task.completata,
      })
      .select()
      .single();
    
    if (data) {
      setTasks(prev => [{
        id: data.id,
        titolo: data.titolo,
        descrizione: data.descrizione || '',
        priorita: data.priorita as UserTask['priorita'],
        stato: data.stato as UserTask['stato'],
        data_scadenza: data.data_scadenza,
        completata: data.completata || false,
        created_at: data.created_at,
      }, ...prev]);
    }
  };

  const updateTask = async (id: string, updates: Partial<UserTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await supabase.from('user_tasks').update(updates).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('user_tasks').delete().eq('id', id);
  };

  const addEvent = async (event: Omit<UserCalendarEvent, 'id'>) => {
    const { data } = await supabase
      .from('user_calendar_events')
      .insert({
        titolo: event.titolo,
        descrizione: event.descrizione,
        data_inizio: event.data_inizio,
        data_fine: event.data_fine,
        tutto_il_giorno: event.tutto_il_giorno,
        colore: event.colore,
      })
      .select()
      .single();
    
    if (data) {
      setEvents(prev => [...prev, {
        id: data.id,
        titolo: data.titolo,
        descrizione: data.descrizione || '',
        data_inizio: data.data_inizio,
        data_fine: data.data_fine,
        tutto_il_giorno: data.tutto_il_giorno || false,
        colore: data.colore || 'primary',
      }]);
    }
  };

  const updateEvent = async (id: string, updates: Partial<UserCalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    await supabase.from('user_calendar_events').update(updates).eq('id', id);
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    await supabase.from('user_calendar_events').delete().eq('id', id);
  };

  const addNote = async (note: Omit<UserNote, 'id' | 'created_at' | 'updated_at'>) => {
    const { data } = await supabase
      .from('user_notes')
      .insert({
        titolo: note.titolo,
        contenuto: note.contenuto,
        categoria: note.categoria,
        pinned: note.pinned,
        colore: note.colore,
      })
      .select()
      .single();
    
    if (data) {
      setNotes(prev => [{
        id: data.id,
        titolo: data.titolo,
        contenuto: data.contenuto || '',
        categoria: data.categoria || 'generale',
        pinned: data.pinned || false,
        colore: data.colore || 'default',
        created_at: data.created_at,
        updated_at: data.updated_at,
      }, ...prev]);
    }
  };

  const updateNote = async (id: string, updates: Partial<UserNote>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
    await supabase.from('user_notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await supabase.from('user_notes').delete().eq('id', id);
  };

  return (
    <UserContext.Provider value={{
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
      loading,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
