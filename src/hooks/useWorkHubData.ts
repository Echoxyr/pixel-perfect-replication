import { useState, useCallback, useMemo } from 'react';
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
  HSEStats,
  generateId,
  daysUntil
} from '@/types/workhub';
import {
  sampleCantieri,
  sampleImprese,
  sampleLavoratori,
  sampleDocumenti,
  sampleFormazioni,
  sampleDPI,
  sampleTasks
} from '@/data/sampleData';

const STORAGE_KEY = 'workhub_data_v2';

interface WorkHubData {
  cantieri: Cantiere[];
  imprese: Impresa[];
  lavoratori: Lavoratore[];
  documenti: Documento[];
  formazioni: Formazione[];
  dpiList: DPI[];
  tasks: Task[];
  sal: SAL[];
  contratti: ContrattoLavorazione[];
  presenze: Presenza[];
}

const loadFromStorage = (): WorkHubData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (data: WorkHubData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export function useWorkHubData() {
  const initialData = loadFromStorage() || {
    cantieri: sampleCantieri,
    imprese: sampleImprese,
    lavoratori: sampleLavoratori,
    documenti: sampleDocumenti,
    formazioni: sampleFormazioni,
    dpiList: sampleDPI,
    tasks: sampleTasks,
    sal: [],
    contratti: [],
    presenze: []
  };

  const [cantieri, setCantieri] = useState<Cantiere[]>(initialData.cantieri);
  const [imprese, setImprese] = useState<Impresa[]>(initialData.imprese);
  const [lavoratori, setLavoratori] = useState<Lavoratore[]>(initialData.lavoratori);
  const [documenti, setDocumenti] = useState<Documento[]>(initialData.documenti);
  const [formazioni, setFormazioni] = useState<Formazione[]>(initialData.formazioni);
  const [dpiList, setDpiList] = useState<DPI[]>(initialData.dpiList);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [sal, setSal] = useState<SAL[]>(initialData.sal || []);
  const [contratti, setContratti] = useState<ContrattoLavorazione[]>(initialData.contratti || []);
  const [presenze, setPresenze] = useState<Presenza[]>(initialData.presenze || []);

  // Auto-save to localStorage
  const saveData = useCallback(() => {
    saveToStorage({ cantieri, imprese, lavoratori, documenti, formazioni, dpiList, tasks, sal, contratti, presenze });
  }, [cantieri, imprese, lavoratori, documenti, formazioni, dpiList, tasks, sal, contratti, presenze]);

  // === CANTIERI CRUD ===
  const addCantiere = useCallback((cantiere: Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCantiere: Cantiere = {
      ...cantiere,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCantieri(prev => {
      const updated = [...prev, newCantiere];
      setTimeout(saveData, 0);
      return updated;
    });
    return newCantiere;
  }, [saveData]);

  const updateCantiere = useCallback((id: string, updates: Partial<Cantiere>) => {
    setCantieri(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteCantiere = useCallback((id: string) => {
    setCantieri(prev => {
      const updated = prev.filter(c => c.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === IMPRESE CRUD ===
  const addImpresa = useCallback((impresa: Omit<Impresa, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newImpresa: Impresa = {
      ...impresa,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setImprese(prev => {
      const updated = [...prev, newImpresa];
      setTimeout(saveData, 0);
      return updated;
    });
    return newImpresa;
  }, [saveData]);

  const updateImpresa = useCallback((id: string, updates: Partial<Impresa>) => {
    setImprese(prev => {
      const updated = prev.map(i => 
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteImpresa = useCallback((id: string) => {
    setImprese(prev => {
      const updated = prev.filter(i => i.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === LAVORATORI CRUD ===
  const addLavoratore = useCallback((lavoratore: Omit<Lavoratore, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLavoratore: Lavoratore = {
      ...lavoratore,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLavoratori(prev => {
      const updated = [...prev, newLavoratore];
      setTimeout(saveData, 0);
      return updated;
    });
    return newLavoratore;
  }, [saveData]);

  const updateLavoratore = useCallback((id: string, updates: Partial<Lavoratore>) => {
    setLavoratori(prev => {
      const updated = prev.map(l => 
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteLavoratore = useCallback((id: string) => {
    setLavoratori(prev => {
      const updated = prev.filter(l => l.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === DOCUMENTI CRUD ===
  const addDocumento = useCallback((documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocumento: Documento = {
      ...documento,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDocumenti(prev => {
      const updated = [...prev, newDocumento];
      setTimeout(saveData, 0);
      return updated;
    });
    return newDocumento;
  }, [saveData]);

  const updateDocumento = useCallback((id: string, updates: Partial<Documento>) => {
    setDocumenti(prev => {
      const updated = prev.map(d => 
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteDocumento = useCallback((id: string) => {
    setDocumenti(prev => {
      const updated = prev.filter(d => d.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === FORMAZIONI CRUD ===
  const addFormazione = useCallback((formazione: Omit<Formazione, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFormazione: Formazione = {
      ...formazione,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFormazioni(prev => {
      const updated = [...prev, newFormazione];
      setTimeout(saveData, 0);
      return updated;
    });
    return newFormazione;
  }, [saveData]);

  const updateFormazione = useCallback((id: string, updates: Partial<Formazione>) => {
    setFormazioni(prev => {
      const updated = prev.map(f => 
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteFormazione = useCallback((id: string) => {
    setFormazioni(prev => {
      const updated = prev.filter(f => f.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === DPI CRUD ===
  const addDPI = useCallback((dpi: Omit<DPI, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDPI: DPI = {
      ...dpi,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDpiList(prev => {
      const updated = [...prev, newDPI];
      setTimeout(saveData, 0);
      return updated;
    });
    return newDPI;
  }, [saveData]);

  const updateDPI = useCallback((id: string, updates: Partial<DPI>) => {
    setDpiList(prev => {
      const updated = prev.map(d => 
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteDPI = useCallback((id: string) => {
    setDpiList(prev => {
      const updated = prev.filter(d => d.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === TASKS CRUD ===
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => {
      const updated = [...prev, newTask];
      setTimeout(saveData, 0);
      return updated;
    });
    return newTask;
  }, [saveData]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(t => 
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === SAL CRUD ===
  const addSAL = useCallback((salItem: Omit<SAL, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSAL: SAL = {
      ...salItem,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSal(prev => {
      const updated = [...prev, newSAL];
      setTimeout(saveData, 0);
      return updated;
    });
    return newSAL;
  }, [saveData]);

  const updateSAL = useCallback((id: string, updates: Partial<SAL>) => {
    setSal(prev => {
      const updated = prev.map(s => 
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteSAL = useCallback((id: string) => {
    setSal(prev => {
      const updated = prev.filter(s => s.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === CONTRATTI CRUD ===
  const addContratto = useCallback((contratto: Omit<ContrattoLavorazione, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContratto: ContrattoLavorazione = {
      ...contratto,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContratti(prev => {
      const updated = [...prev, newContratto];
      setTimeout(saveData, 0);
      return updated;
    });
    return newContratto;
  }, [saveData]);

  const updateContratto = useCallback((id: string, updates: Partial<ContrattoLavorazione>) => {
    setContratti(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deleteContratto = useCallback((id: string) => {
    setContratti(prev => {
      const updated = prev.filter(c => c.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // === PRESENZE CRUD ===
  const addPresenza = useCallback((presenza: Omit<Presenza, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPresenza: Presenza = {
      ...presenza,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPresenze(prev => {
      const updated = [...prev, newPresenza];
      setTimeout(saveData, 0);
      return updated;
    });
    return newPresenza;
  }, [saveData]);

  const updatePresenza = useCallback((id: string, updates: Partial<Presenza>) => {
    setPresenze(prev => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  const deletePresenza = useCallback((id: string) => {
    setPresenze(prev => {
      const updated = prev.filter(p => p.id !== id);
      setTimeout(saveData, 0);
      return updated;
    });
  }, [saveData]);

  // Get presenze for a cantiere
  const getPresenzeCantiere = useCallback((cantiereId: string, data?: string) => {
    return presenze.filter(p => {
      if (p.cantiereId !== cantiereId) return false;
      if (data && p.data !== data) return false;
      return true;
    });
  }, [presenze]);

  // Get SAL for a cantiere
  const getSALCantiere = useCallback((cantiereId: string) => {
    return sal.filter(s => s.cantiereId === cantiereId);
  }, [sal]);

  // Get contratti for a cantiere
  const getContrattiCantiere = useCallback((cantiereId: string) => {
    return contratti.filter(c => c.cantiereId === cantiereId);
  }, [contratti]);

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
    hseStats
  };
}
