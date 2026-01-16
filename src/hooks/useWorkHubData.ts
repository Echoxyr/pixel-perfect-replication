import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Task,
  Cantiere,
  Impresa,
  Lavoratore,
  Documento,
  Formazione,
  DPI,
  SAL,
  ContrattoLavorazione,
  Presenza,
  PrevisioneSAL,
  HSEStats,
  DatiAzienda,
  daysUntil
} from '@/types/workhub';

const AZIENDA_STORAGE_KEY = 'workhub_dati_azienda';

const defaultDatiAzienda: DatiAzienda = {
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscaleAzienda: '',
  iscrizioneREA: '',
  sedeLegale: '',
  cap: '',
  citta: '',
  provincia: '',
  pec: '',
  email: '',
  telefono: '',
  nomeTitolare: '',
  cognomeTitolare: '',
  codiceFiscaleTitolare: '',
  dataNascitaTitolare: '',
  luogoNascitaTitolare: '',
  provinciaNascitaTitolare: '',
  residenzaTitolare: '',
  ciTitolare: '',
  cellulareTitolare: '',
  cartaIntestataHeader: undefined,
  cartaIntestataFooter: undefined,
  timbro: undefined,
  timbroPositionX: 80,
  timbroPositionY: 85
};

const loadAziendaFromStorage = (): DatiAzienda => {
  try {
    const data = localStorage.getItem(AZIENDA_STORAGE_KEY);
    return data ? { ...defaultDatiAzienda, ...JSON.parse(data) } : defaultDatiAzienda;
  } catch {
    return defaultDatiAzienda;
  }
};

const saveAziendaToStorage = (data: DatiAzienda) => {
  try {
    localStorage.setItem(AZIENDA_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save azienda to localStorage', e);
  }
};

// Helper to convert DB record to app type
const mapCantiereFromDB = (c: any): Cantiere => ({
  id: c.id,
  nome: c.nome,
  codiceCommessa: c.codice_commessa,
  indirizzo: c.indirizzo || '',
  committente: c.committente || '',
  direttoreLavori: c.direttore_lavori,
  cse: c.cse,
  csp: c.csp,
  dataApertura: c.data_inizio,
  dataChiusuraPrevista: c.data_fine_prevista,
  dataChiusuraEffettiva: c.data_fine_effettiva,
  stato: c.stato === 'concluso' ? 'chiuso' : c.stato || 'attivo',
  importoContratto: c.importo_contratto,
  createdAt: c.created_at,
  updatedAt: c.updated_at
});

const mapImpresaFromDB = (i: any, cantieriIds: string[] = []): Impresa => ({
  id: i.id,
  ragioneSociale: i.ragione_sociale,
  partitaIva: i.partita_iva || '',
  codiceFiscale: i.codice_fiscale,
  sedeLegale: i.indirizzo || '',
  sedeOperativa: '',
  referenteNome: '',
  referenteRuolo: '',
  referenteTelefono: i.telefono,
  referenteEmail: i.email,
  ccnlApplicato: '',
  tipo: (i.tipo as any) || 'subappaltatore',
  lavorazioniPrincipali: [],
  cantieriIds,
  createdAt: i.created_at,
  updatedAt: i.updated_at
});

const mapLavoratoreFromDB = (l: any, cantieriIds: string[] = []): Lavoratore => ({
  id: l.id,
  nome: l.nome,
  cognome: l.cognome,
  codiceFiscale: l.codice_fiscale || '',
  dataNascita: l.data_nascita,
  impresaId: l.impresa_id || '',
  tipo: 'dipendente',
  mansione: l.mansione || '',
  qualifica: l.livello,
  cantieriIds,
  createdAt: l.created_at,
  updatedAt: l.updated_at
});

const mapDocumentoFromDB = (d: any): Documento => ({
  id: d.id,
  tipo: d.tipo,
  nome: d.titolo,
  impresaId: d.entita_tipo === 'impresa' ? d.entita_id : undefined,
  cantiereId: d.entita_tipo === 'cantiere' ? d.entita_id : undefined,
  lavoratoreId: d.entita_tipo === 'lavoratore' ? d.entita_id : undefined,
  fileUrl: d.file_url,
  dataEmissione: d.data_emissione,
  dataScadenza: d.data_scadenza,
  stato: d.stato as any || 'approvato',
  note: d.note,
  createdAt: d.created_at,
  updatedAt: d.updated_at
});

const mapFormazioneFromDB = (f: any): Formazione => ({
  id: f.id,
  lavoratoreId: f.lavoratore_id,
  tipoCorso: f.tipo_corso,
  categoria: f.tipo_corso,
  dataCorso: f.data_conseguimento,
  durataOre: f.ore_durata,
  dataScadenza: f.data_scadenza,
  esito: 'positivo',
  certificatoUrl: f.attestato_url,
  stato: f.stato as any || 'fatto',
  note: f.note,
  createdAt: f.created_at,
  updatedAt: f.updated_at
});

const mapDPIFromDB = (d: any): DPI => ({
  id: d.id,
  lavoratoreId: d.lavoratore_id || '',
  tipo: d.tipo,
  dataConsegna: d.data_consegna,
  firmaRicevuta: undefined,
  stato: d.stato === 'scaduto' ? 'scaduto' : d.stato === 'sostituire' ? 'da_sostituire' : 'consegnato',
  note: d.note,
  createdAt: d.created_at,
  updatedAt: d.created_at
});

const mapTaskFromDB = (t: any): Task => ({
  id: t.id,
  parentId: t.parent_id,
  title: t.title,
  description: t.description,
  cantiereId: t.cantiere_id,
  impresaId: t.impresa_id,
  status: t.status || 'da_iniziare',
  priority: t.priority || 'media',
  startDate: t.start_date,
  dueDate: t.due_date,
  completedAt: t.completed_date,
  note: t.note,
  updates: [],
  comments: [],
  check: false,
  tags: t.tags || [],
  subtasks: [],
  createdAt: t.created_at,
  updatedAt: t.updated_at
});

export function useWorkHubData() {
  const queryClient = useQueryClient();
  const [datiAzienda, setDatiAziendaState] = useState<DatiAzienda>(loadAziendaFromStorage());

  // === FETCH DATA FROM SUPABASE ===
  
  const { data: cantieriData = [] } = useQuery({
    queryKey: ['cantieri'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cantieri').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapCantiereFromDB);
    }
  });

  const { data: cantieriImpreseData = [] } = useQuery({
    queryKey: ['cantieri_imprese'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cantieri_imprese').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: impreseData = [] } = useQuery({
    queryKey: ['imprese'],
    queryFn: async () => {
      const { data, error } = await supabase.from('imprese').select('*').order('ragione_sociale');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: lavoratoriCantieriData = [] } = useQuery({
    queryKey: ['lavoratori_cantieri'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lavoratori_cantieri').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: lavoratoriData = [] } = useQuery({
    queryKey: ['lavoratori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lavoratori').select('*').order('cognome');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: documentiData = [] } = useQuery({
    queryKey: ['documenti'],
    queryFn: async () => {
      const { data, error } = await supabase.from('documenti').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDocumentoFromDB);
    }
  });

  const { data: formazioniData = [] } = useQuery({
    queryKey: ['formazioni'],
    queryFn: async () => {
      const { data, error } = await supabase.from('formazioni').select('*').order('data_conseguimento', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFormazioneFromDB);
    }
  });

  const { data: dpiData = [] } = useQuery({
    queryKey: ['dpi'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dpi').select('*').order('data_consegna', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDPIFromDB);
    }
  });

  const { data: tasksData = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapTaskFromDB);
    }
  });

  // Derive imprese with cantieri mapping
  const imprese = useMemo(() => {
    return impreseData.map(i => {
      const cantieriIds = cantieriImpreseData
        .filter(ci => ci.impresa_id === i.id)
        .map(ci => ci.cantiere_id);
      return mapImpresaFromDB(i, cantieriIds);
    });
  }, [impreseData, cantieriImpreseData]);

  // Derive lavoratori with cantieri mapping
  const lavoratori = useMemo(() => {
    return lavoratoriData.map(l => {
      const cantieriIds = lavoratoriCantieriData
        .filter(lc => lc.lavoratore_id === l.id && lc.attivo)
        .map(lc => lc.cantiere_id);
      return mapLavoratoreFromDB(l, cantieriIds);
    });
  }, [lavoratoriData, lavoratoriCantieriData]);

  const cantieri = cantieriData;
  const documenti = documentiData;
  const formazioni = formazioniData;
  const dpiList = dpiData;
  const tasks = tasksData;
  
  // Empty arrays for SAL/Contratti/Presenze/Previsioni - can be added later
  const sal: SAL[] = [];
  const contratti: ContrattoLavorazione[] = [];
  const presenze: Presenza[] = [];
  const previsioni: PrevisioneSAL[] = [];

  // === MUTATIONS ===

  const addCantiereMutation = useMutation({
    mutationFn: async (cantiere: Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase.from('cantieri').insert({
        codice_commessa: cantiere.codiceCommessa,
        nome: cantiere.nome,
        committente: cantiere.committente,
        indirizzo: cantiere.indirizzo,
        stato: cantiere.stato === 'chiuso' ? 'concluso' : cantiere.stato,
        data_inizio: cantiere.dataApertura,
        data_fine_prevista: cantiere.dataChiusuraPrevista,
        importo_contratto: cantiere.importoContratto,
        direttore_lavori: cantiere.direttoreLavori,
        cse: cantiere.cse,
        csp: cantiere.csp
      }).select().single();
      if (error) throw error;
      return mapCantiereFromDB(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cantieri'] })
  });

  const updateCantiereMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Cantiere> }) => {
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.codiceCommessa) dbUpdates.codice_commessa = updates.codiceCommessa;
      if (updates.committente) dbUpdates.committente = updates.committente;
      if (updates.indirizzo) dbUpdates.indirizzo = updates.indirizzo;
      if (updates.stato) dbUpdates.stato = updates.stato === 'chiuso' ? 'concluso' : updates.stato;
      if (updates.dataApertura) dbUpdates.data_inizio = updates.dataApertura;
      if (updates.dataChiusuraPrevista) dbUpdates.data_fine_prevista = updates.dataChiusuraPrevista;
      if (updates.importoContratto) dbUpdates.importo_contratto = updates.importoContratto;
      
      const { error } = await supabase.from('cantieri').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cantieri'] })
  });

  const deleteCantiereMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cantieri').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cantieri'] })
  });

  const addImpresaMutation = useMutation({
    mutationFn: async (impresa: Omit<Impresa, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase.from('imprese').insert({
        ragione_sociale: impresa.ragioneSociale,
        partita_iva: impresa.partitaIva,
        codice_fiscale: impresa.codiceFiscale,
        indirizzo: impresa.sedeLegale,
        telefono: impresa.referenteTelefono,
        email: impresa.referenteEmail,
        tipo: impresa.tipo === 'subappaltatore' ? 'subappaltatrice' : 'principale'
      }).select().single();
      if (error) throw error;
      
      // Link to cantieri if specified
      if (impresa.cantieriIds?.length) {
        const links = impresa.cantieriIds.map(cantiereId => ({
          cantiere_id: cantiereId,
          impresa_id: data.id
        }));
        await supabase.from('cantieri_imprese').insert(links);
      }
      
      return mapImpresaFromDB(data, impresa.cantieriIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imprese'] });
      queryClient.invalidateQueries({ queryKey: ['cantieri_imprese'] });
    }
  });

  const updateImpresaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Impresa> }) => {
      const dbUpdates: any = {};
      if (updates.ragioneSociale) dbUpdates.ragione_sociale = updates.ragioneSociale;
      if (updates.partitaIva) dbUpdates.partita_iva = updates.partitaIva;
      if (updates.codiceFiscale) dbUpdates.codice_fiscale = updates.codiceFiscale;
      if (updates.sedeLegale) dbUpdates.indirizzo = updates.sedeLegale;
      
      const { error } = await supabase.from('imprese').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['imprese'] })
  });

  const deleteImpresaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('imprese').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imprese'] });
      queryClient.invalidateQueries({ queryKey: ['cantieri_imprese'] });
    }
  });

  const addLavoratoreMutation = useMutation({
    mutationFn: async (lavoratore: Omit<Lavoratore, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase.from('lavoratori').insert({
        nome: lavoratore.nome,
        cognome: lavoratore.cognome,
        codice_fiscale: lavoratore.codiceFiscale,
        data_nascita: lavoratore.dataNascita,
        impresa_id: lavoratore.impresaId || null,
        mansione: lavoratore.mansione,
        livello: lavoratore.qualifica
      }).select().single();
      if (error) throw error;
      
      // Link to cantieri if specified
      if (lavoratore.cantieriIds?.length) {
        const links = lavoratore.cantieriIds.map(cantiereId => ({
          cantiere_id: cantiereId,
          lavoratore_id: data.id,
          attivo: true
        }));
        await supabase.from('lavoratori_cantieri').insert(links);
      }
      
      return mapLavoratoreFromDB(data, lavoratore.cantieriIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lavoratori'] });
      queryClient.invalidateQueries({ queryKey: ['lavoratori_cantieri'] });
    }
  });

  const updateLavoratoreMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lavoratore> }) => {
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.nome = updates.nome;
      if (updates.cognome) dbUpdates.cognome = updates.cognome;
      if (updates.codiceFiscale) dbUpdates.codice_fiscale = updates.codiceFiscale;
      if (updates.mansione) dbUpdates.mansione = updates.mansione;
      if (updates.impresaId) dbUpdates.impresa_id = updates.impresaId;
      
      const { error } = await supabase.from('lavoratori').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lavoratori'] })
  });

  const deleteLavoratoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lavoratori').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lavoratori'] });
      queryClient.invalidateQueries({ queryKey: ['lavoratori_cantieri'] });
    }
  });

  const addDocumentoMutation = useMutation({
    mutationFn: async (documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt'>) => {
      const entitaTipo = documento.impresaId ? 'impresa' : documento.cantiereId ? 'cantiere' : documento.lavoratoreId ? 'lavoratore' : 'azienda';
      const entitaId = documento.impresaId || documento.cantiereId || documento.lavoratoreId || null;
      
      const { data, error } = await supabase.from('documenti').insert({
        titolo: documento.nome,
        tipo: documento.tipo,
        entita_tipo: entitaTipo,
        entita_id: entitaId,
        data_emissione: documento.dataEmissione,
        data_scadenza: documento.dataScadenza,
        stato: documento.stato,
        file_url: documento.fileUrl,
        note: documento.note
      }).select().single();
      if (error) throw error;
      return mapDocumentoFromDB(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documenti'] })
  });

  const updateDocumentoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Documento> }) => {
      const dbUpdates: any = {};
      if (updates.nome) dbUpdates.titolo = updates.nome;
      if (updates.tipo) dbUpdates.tipo = updates.tipo;
      if (updates.dataEmissione) dbUpdates.data_emissione = updates.dataEmissione;
      if (updates.dataScadenza) dbUpdates.data_scadenza = updates.dataScadenza;
      if (updates.stato) dbUpdates.stato = updates.stato;
      if (updates.fileUrl) dbUpdates.file_url = updates.fileUrl;
      
      const { error } = await supabase.from('documenti').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documenti'] })
  });

  const deleteDocumentoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documenti').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documenti'] })
  });

  const addFormazioneMutation = useMutation({
    mutationFn: async (formazione: Omit<Formazione, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase.from('formazioni').insert({
        lavoratore_id: formazione.lavoratoreId,
        tipo_corso: formazione.tipoCorso,
        titolo_corso: formazione.tipoCorso,
        data_conseguimento: formazione.dataCorso,
        data_scadenza: formazione.dataScadenza,
        ore_durata: formazione.durataOre,
        attestato_url: formazione.certificatoUrl,
        stato: formazione.stato === 'fatto' ? 'valido' : formazione.stato,
        note: formazione.note
      }).select().single();
      if (error) throw error;
      return mapFormazioneFromDB(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formazioni'] })
  });

  const updateFormazioneMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Formazione> }) => {
      const dbUpdates: any = {};
      if (updates.tipoCorso) dbUpdates.tipo_corso = updates.tipoCorso;
      if (updates.dataCorso) dbUpdates.data_conseguimento = updates.dataCorso;
      if (updates.dataScadenza) dbUpdates.data_scadenza = updates.dataScadenza;
      if (updates.certificatoUrl) dbUpdates.attestato_url = updates.certificatoUrl;
      
      const { error } = await supabase.from('formazioni').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formazioni'] })
  });

  const deleteFormazioneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formazioni').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formazioni'] })
  });

  const addDPIMutation = useMutation({
    mutationFn: async (dpi: Omit<DPI, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase.from('dpi').insert({
        lavoratore_id: dpi.lavoratoreId || null,
        tipo: dpi.tipo,
        data_consegna: dpi.dataConsegna,
        stato: dpi.stato === 'da_sostituire' ? 'sostituire' : dpi.stato,
        note: dpi.note
      }).select().single();
      if (error) throw error;
      return mapDPIFromDB(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dpi'] })
  });

  const updateDPIMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DPI> }) => {
      const dbUpdates: any = {};
      if (updates.tipo) dbUpdates.tipo = updates.tipo;
      if (updates.dataConsegna) dbUpdates.data_consegna = updates.dataConsegna;
      if (updates.stato) dbUpdates.stato = updates.stato === 'da_sostituire' ? 'sostituire' : updates.stato;
      
      const { error } = await supabase.from('dpi').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dpi'] })
  });

  const deleteDPIMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dpi').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dpi'] })
  });

  const addTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase.from('tasks').insert({
        title: task.title,
        description: task.description,
        cantiere_id: task.cantiereId || null,
        impresa_id: task.impresaId || null,
        status: task.status,
        priority: task.priority,
        start_date: task.startDate,
        due_date: task.dueDate,
        note: task.note,
        tags: task.tags,
        parent_id: task.parentId || null
      }).select().single();
      if (error) throw error;
      return mapTaskFromDB(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.completedAt !== undefined) dbUpdates.completed_date = updates.completedAt;
      if (updates.note !== undefined) dbUpdates.note = updates.note;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.cantiereId !== undefined) dbUpdates.cantiere_id = updates.cantiereId || null;
      if (updates.impresaId !== undefined) dbUpdates.impresa_id = updates.impresaId || null;
      
      const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  // === WRAPPER FUNCTIONS ===
  
  const addCantiere = useCallback((cantiere: Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'>) => {
    addCantiereMutation.mutate(cantiere);
    return { ...cantiere, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Cantiere;
  }, [addCantiereMutation]);

  const updateCantiere = useCallback((id: string, updates: Partial<Cantiere>) => {
    updateCantiereMutation.mutate({ id, updates });
  }, [updateCantiereMutation]);

  const deleteCantiere = useCallback((id: string) => {
    deleteCantiereMutation.mutate(id);
  }, [deleteCantiereMutation]);

  const addImpresa = useCallback((impresa: Omit<Impresa, 'id' | 'createdAt' | 'updatedAt'>) => {
    addImpresaMutation.mutate(impresa);
    return { ...impresa, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Impresa;
  }, [addImpresaMutation]);

  const updateImpresa = useCallback((id: string, updates: Partial<Impresa>) => {
    updateImpresaMutation.mutate({ id, updates });
  }, [updateImpresaMutation]);

  const deleteImpresa = useCallback((id: string) => {
    deleteImpresaMutation.mutate(id);
  }, [deleteImpresaMutation]);

  const addLavoratore = useCallback((lavoratore: Omit<Lavoratore, 'id' | 'createdAt' | 'updatedAt'>) => {
    addLavoratoreMutation.mutate(lavoratore);
    return { ...lavoratore, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Lavoratore;
  }, [addLavoratoreMutation]);

  const updateLavoratore = useCallback((id: string, updates: Partial<Lavoratore>) => {
    updateLavoratoreMutation.mutate({ id, updates });
  }, [updateLavoratoreMutation]);

  const deleteLavoratore = useCallback((id: string) => {
    deleteLavoratoreMutation.mutate(id);
  }, [deleteLavoratoreMutation]);

  const addDocumento = useCallback((documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt'>) => {
    addDocumentoMutation.mutate(documento);
    return { ...documento, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Documento;
  }, [addDocumentoMutation]);

  const updateDocumento = useCallback((id: string, updates: Partial<Documento>) => {
    updateDocumentoMutation.mutate({ id, updates });
  }, [updateDocumentoMutation]);

  const deleteDocumento = useCallback((id: string) => {
    deleteDocumentoMutation.mutate(id);
  }, [deleteDocumentoMutation]);

  const addFormazione = useCallback((formazione: Omit<Formazione, 'id' | 'createdAt' | 'updatedAt'>) => {
    addFormazioneMutation.mutate(formazione);
    return { ...formazione, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Formazione;
  }, [addFormazioneMutation]);

  const updateFormazione = useCallback((id: string, updates: Partial<Formazione>) => {
    updateFormazioneMutation.mutate({ id, updates });
  }, [updateFormazioneMutation]);

  const deleteFormazione = useCallback((id: string) => {
    deleteFormazioneMutation.mutate(id);
  }, [deleteFormazioneMutation]);

  const addDPI = useCallback((dpi: Omit<DPI, 'id' | 'createdAt' | 'updatedAt'>) => {
    addDPIMutation.mutate(dpi);
    return { ...dpi, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as DPI;
  }, [addDPIMutation]);

  const updateDPI = useCallback((id: string, updates: Partial<DPI>) => {
    updateDPIMutation.mutate({ id, updates });
  }, [updateDPIMutation]);

  const deleteDPI = useCallback((id: string) => {
    deleteDPIMutation.mutate(id);
  }, [deleteDPIMutation]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTaskMutation.mutate(task);
    return { ...task, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Task;
  }, [addTaskMutation]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id, updates });
  }, [updateTaskMutation]);

  const deleteTask = useCallback((id: string) => {
    deleteTaskMutation.mutate(id);
  }, [deleteTaskMutation]);

  // Stub functions for SAL/Contratti/Presenze/Previsioni
  const addSAL = useCallback((salItem: Omit<SAL, 'id' | 'createdAt' | 'updatedAt'>) => {
    return { ...salItem, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as SAL;
  }, []);
  const updateSAL = useCallback((id: string, updates: Partial<SAL>) => {}, []);
  const deleteSAL = useCallback((id: string) => {}, []);

  const addContratto = useCallback((contratto: Omit<ContrattoLavorazione, 'id' | 'createdAt' | 'updatedAt'>) => {
    return { ...contratto, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ContrattoLavorazione;
  }, []);
  const updateContratto = useCallback((id: string, updates: Partial<ContrattoLavorazione>) => {}, []);
  const deleteContratto = useCallback((id: string) => {}, []);

  const addPresenza = useCallback((presenza: Omit<Presenza, 'id' | 'createdAt' | 'updatedAt'>) => {
    return { ...presenza, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Presenza;
  }, []);
  const updatePresenza = useCallback((id: string, updates: Partial<Presenza>) => {}, []);
  const deletePresenza = useCallback((id: string) => {}, []);

  const addPrevisione = useCallback((previsione: Omit<PrevisioneSAL, 'id' | 'createdAt' | 'updatedAt'>) => {
    return { ...previsione, id: 'temp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as PrevisioneSAL;
  }, []);
  const updatePrevisione = useCallback((id: string, updates: Partial<PrevisioneSAL>) => {}, []);
  const deletePrevisione = useCallback((id: string) => {}, []);

  const getPresenzeCantiere = useCallback((cantiereId: string, data?: string) => {
    return presenze.filter(p => {
      if (p.cantiereId !== cantiereId) return false;
      if (data && p.data !== data) return false;
      return true;
    });
  }, [presenze]);

  const getSALCantiere = useCallback((cantiereId: string) => {
    return sal.filter(s => s.cantiereId === cantiereId);
  }, [sal]);

  const getContrattiCantiere = useCallback((cantiereId: string) => {
    return contratti.filter(c => c.cantiereId === cantiereId);
  }, [contratti]);

  const getPrevisioniCantiere = useCallback((cantiereId: string) => {
    return previsioni.filter(p => p.cantiereId === cantiereId);
  }, [previsioni]);

  // === COMPUTED VALUES ===
  
  const getDocumentiImpresa = useCallback((impresaId: string) => {
    return documenti.filter(d => d.impresaId === impresaId);
  }, [documenti]);

  const getDocumentiCantiere = useCallback((cantiereId: string) => {
    return documenti.filter(d => d.cantiereId === cantiereId);
  }, [documenti]);

  const getDocumentiLavoratore = useCallback((lavoratoreId: string) => {
    return documenti.filter(d => d.lavoratoreId === lavoratoreId);
  }, [documenti]);

  const getLavoratoriImpresa = useCallback((impresaId: string) => {
    return lavoratori.filter(l => l.impresaId === impresaId);
  }, [lavoratori]);

  const getLavoratoriCantiere = useCallback((cantiereId: string) => {
    return lavoratori.filter(l => l.cantieriIds.includes(cantiereId));
  }, [lavoratori]);

  const getFormazioniLavoratore = useCallback((lavoratoreId: string) => {
    return formazioni.filter(f => f.lavoratoreId === lavoratoreId);
  }, [formazioni]);

  const getDPILavoratore = useCallback((lavoratoreId: string) => {
    return dpiList.filter(d => d.lavoratoreId === lavoratoreId);
  }, [dpiList]);

  const getTasksCantiere = useCallback((cantiereId: string) => {
    return tasks.filter(t => t.cantiereId === cantiereId);
  }, [tasks]);

  const getImpreseCantiere = useCallback((cantiereId: string) => {
    return imprese.filter(i => i.cantieriIds.includes(cantiereId));
  }, [imprese]);

  // HSE Statistics
  const hseStats = useMemo((): HSEStats => {
    const EXPIRY_THRESHOLD = 30;

    const documentiScaduti = documenti.filter(d => d.stato === 'scaduto').length;
    const documentiInScadenza = documenti.filter(d => d.stato === 'in_scadenza').length;

    const formazioniScadute = formazioni.filter(f => f.stato === 'scaduto').length;
    const formazioniInScadenza = formazioni.filter(f => {
      if (!f.dataScadenza) return false;
      const days = daysUntil(f.dataScadenza);
      return days !== null && days >= 0 && days <= EXPIRY_THRESHOLD;
    }).length;

    const visiteMedicheScadute = lavoratori.filter(l => {
      if (!l.dataScadenzaIdoneita) return false;
      const days = daysUntil(l.dataScadenzaIdoneita);
      return days !== null && days < 0;
    }).length;

    const visiteMedicheInScadenza = lavoratori.filter(l => {
      if (!l.dataScadenzaIdoneita) return false;
      const days = daysUntil(l.dataScadenzaIdoneita);
      return days !== null && days >= 0 && days <= EXPIRY_THRESHOLD;
    }).length;

    const impreseStatus = imprese.map(imp => {
      const docs = getDocumentiImpresa(imp.id);
      const scaduti = docs.filter(d => d.stato === 'scaduto' || d.stato === 'da_richiedere').length;
      const inScadenza = docs.filter(d => d.stato === 'in_scadenza').length;
      if (scaduti > 0) return 'critical';
      if (inScadenza > 0) return 'warning';
      return 'ok';
    });

    const lavoratoriStatus = lavoratori.map(lav => {
      const forms = getFormazioniLavoratore(lav.id);
      const formsScadute = forms.filter(f => f.stato === 'scaduto').length;
      const formsInScadenza = forms.filter(f => f.stato === 'in_scadenza').length;
      
      const visitaScaduta = lav.dataScadenzaIdoneita && daysUntil(lav.dataScadenzaIdoneita)! < 0;
      const visitaInScadenza = lav.dataScadenzaIdoneita && 
        daysUntil(lav.dataScadenzaIdoneita)! >= 0 && 
        daysUntil(lav.dataScadenzaIdoneita)! <= EXPIRY_THRESHOLD;

      if (formsScadute > 0 || visitaScaduta) return 'critical';
      if (formsInScadenza > 0 || visitaInScadenza) return 'warning';
      return 'ok';
    });

    return {
      impreseTotal: imprese.length,
      impreseOk: impreseStatus.filter(s => s === 'ok').length,
      impreseWarning: impreseStatus.filter(s => s === 'warning').length,
      impreseCritical: impreseStatus.filter(s => s === 'critical').length,
      lavoratoriTotal: lavoratori.length,
      lavoratoriOk: lavoratoriStatus.filter(s => s === 'ok').length,
      lavoratoriWarning: lavoratoriStatus.filter(s => s === 'warning').length,
      lavoratoriCritical: lavoratoriStatus.filter(s => s === 'critical').length,
      documentiScaduti,
      documentiInScadenza,
      formazioniScadute,
      formazioniInScadenza,
      visiteMedicheScadute,
      visiteMedicheInScadenza
    };
  }, [imprese, lavoratori, documenti, formazioni, getDocumentiImpresa, getFormazioniLavoratore]);

  // === DATI AZIENDA ===
  const updateDatiAzienda = useCallback((updates: Partial<DatiAzienda>) => {
    setDatiAziendaState(prev => {
      const updated = { ...prev, ...updates };
      saveAziendaToStorage(updated);
      return updated;
    });
  }, []);

  return {
    // Data
    cantieri,
    imprese,
    lavoratori,
    documenti,
    formazioni,
    dpiList,
    tasks,
    sal,
    contratti,
    presenze,
    datiAzienda,
    
    // Cantieri
    addCantiere,
    updateCantiere,
    deleteCantiere,
    
    // Imprese
    addImpresa,
    updateImpresa,
    deleteImpresa,
    
    // Lavoratori
    addLavoratore,
    updateLavoratore,
    deleteLavoratore,
    
    // Documenti
    addDocumento,
    updateDocumento,
    deleteDocumento,
    
    // Formazioni
    addFormazione,
    updateFormazione,
    deleteFormazione,
    
    // DPI
    addDPI,
    updateDPI,
    deleteDPI,
    
    // Tasks
    addTask,
    updateTask,
    deleteTask,
    
    // SAL
    addSAL,
    updateSAL,
    deleteSAL,
    
    // Contratti
    addContratto,
    updateContratto,
    deleteContratto,
    
    // Presenze
    addPresenza,
    updatePresenza,
    deletePresenza,
    
    // Previsioni SAL
    previsioni,
    addPrevisione,
    updatePrevisione,
    deletePrevisione,
    
    // Dati Azienda
    updateDatiAzienda,
    
    // Computed
    getDocumentiImpresa,
    getDocumentiCantiere,
    getDocumentiLavoratore,
    getLavoratoriImpresa,
    getLavoratoriCantiere,
    getFormazioniLavoratore,
    getDPILavoratore,
    getTasksCantiere,
    getImpreseCantiere,
    getPresenzeCantiere,
    getSALCantiere,
    getContrattiCantiere,
    getPrevisioniCantiere,
    hseStats
  };
}
