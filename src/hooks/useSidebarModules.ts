import { useState, useEffect, useCallback } from 'react';

// Definizione dei moduli sidebar disponibili
export interface SidebarModule {
  id: string;
  label: string;
  section: string;
  defaultVisible: boolean;
}

export const SIDEBAR_MODULES: SidebarModule[] = [
  // Principale
  { id: 'dashboard', label: 'Dashboard', section: 'principale', defaultVisible: true },
  { id: 'progetti', label: 'Progetti & Task', section: 'principale', defaultVisible: true },
  { id: 'sal', label: 'SAL', section: 'principale', defaultVisible: true },
  
  // Commesse
  { id: 'cantieri', label: 'Elenco Commesse', section: 'commesse', defaultVisible: true },
  
  // HSE
  { id: 'hse', label: 'Dashboard HSE', section: 'hse', defaultVisible: true },
  { id: 'sicurezza', label: 'D.Lgs 81/2008', section: 'hse', defaultVisible: true },
  { id: 'imprese', label: 'Imprese Esterne', section: 'hse', defaultVisible: true },
  { id: 'lavoratori', label: 'Dipendenti', section: 'hse', defaultVisible: true },
  { id: 'formazione', label: 'Formazione', section: 'hse', defaultVisible: true },
  { id: 'dpi', label: 'DPI', section: 'hse', defaultVisible: true },
  { id: 'sorveglianza', label: 'Sorveglianza Sanitaria', section: 'hse', defaultVisible: true },
  { id: 'checkin', label: 'Check-in Sicurezza', section: 'hse', defaultVisible: true },
  
  // Compliance
  { id: 'gdpr', label: 'GDPR Privacy', section: 'compliance', defaultVisible: true },
  { id: 'qualita', label: 'ISO 9001 Qualità', section: 'compliance', defaultVisible: true },
  { id: 'ambiente', label: 'ISO 14001 Ambiente', section: 'compliance', defaultVisible: true },
  { id: 'bi', label: 'Business Intelligence', section: 'compliance', defaultVisible: true },
  
  // Commerciale
  { id: 'commerciale', label: 'Reparto Commerciale', section: 'commerciale', defaultVisible: true },
  { id: 'computo', label: 'Computo Metrico', section: 'commerciale', defaultVisible: true },
  { id: 'listino', label: 'Listino Prezzi', section: 'commerciale', defaultVisible: true },
  
  // Amministrazione
  { id: 'amministrazione', label: 'Reparto Amministrazione', section: 'amministrazione', defaultVisible: true },
  { id: 'timbrature', label: 'Timbrature', section: 'amministrazione', defaultVisible: true },
  { id: 'scadenzario', label: 'Scadenzario', section: 'amministrazione', defaultVisible: true },
  { id: 'rapportini', label: 'Rapportini', section: 'amministrazione', defaultVisible: true },
  { id: 'contatti', label: 'Contatti', section: 'amministrazione', defaultVisible: true },
  
  // Logistica
  { id: 'risorse', label: 'Risorse & Mezzi', section: 'logistica', defaultVisible: true },
  { id: 'magazzino', label: 'Magazzino', section: 'logistica', defaultVisible: true },
];

export const SECTIONS = [
  { id: 'principale', label: 'Principale' },
  { id: 'commesse', label: 'Commesse' },
  { id: 'hse', label: 'Sicurezza & HSE' },
  { id: 'compliance', label: 'Conformità' },
  { id: 'commerciale', label: 'Commerciale' },
  { id: 'amministrazione', label: 'Amministrazione' },
  { id: 'logistica', label: 'Logistica' },
];

const STORAGE_KEY = 'sidebar_modules_visibility';

export function useSidebarModules() {
  const [visibleModules, setVisibleModules] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setVisibleModules(JSON.parse(stored));
      } catch {
        // If corrupted, use defaults
        const defaults: Record<string, boolean> = {};
        SIDEBAR_MODULES.forEach(m => { defaults[m.id] = m.defaultVisible; });
        setVisibleModules(defaults);
      }
    } else {
      // Use defaults
      const defaults: Record<string, boolean> = {};
      SIDEBAR_MODULES.forEach(m => { defaults[m.id] = m.defaultVisible; });
      setVisibleModules(defaults);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleModules));
    }
  }, [visibleModules, loaded]);

  const isModuleVisible = useCallback((moduleId: string): boolean => {
    if (visibleModules[moduleId] === undefined) {
      const module = SIDEBAR_MODULES.find(m => m.id === moduleId);
      return module?.defaultVisible ?? true;
    }
    return visibleModules[moduleId];
  }, [visibleModules]);

  const toggleModule = useCallback((moduleId: string) => {
    setVisibleModules(prev => ({
      ...prev,
      [moduleId]: !isModuleVisible(moduleId)
    }));
  }, [isModuleVisible]);

  const setModuleVisibility = useCallback((moduleId: string, visible: boolean) => {
    setVisibleModules(prev => ({
      ...prev,
      [moduleId]: visible
    }));
  }, []);

  const toggleSection = useCallback((sectionId: string, visible: boolean) => {
    const sectionModules = SIDEBAR_MODULES.filter(m => m.section === sectionId);
    const updates: Record<string, boolean> = {};
    sectionModules.forEach(m => { updates[m.id] = visible; });
    setVisibleModules(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults: Record<string, boolean> = {};
    SIDEBAR_MODULES.forEach(m => { defaults[m.id] = m.defaultVisible; });
    setVisibleModules(defaults);
  }, []);

  const getVisibleModulesInSection = useCallback((sectionId: string): SidebarModule[] => {
    return SIDEBAR_MODULES.filter(m => m.section === sectionId && isModuleVisible(m.id));
  }, [isModuleVisible]);

  const isSectionFullyVisible = useCallback((sectionId: string): boolean => {
    const sectionModules = SIDEBAR_MODULES.filter(m => m.section === sectionId);
    return sectionModules.every(m => isModuleVisible(m.id));
  }, [isModuleVisible]);

  const isSectionPartiallyVisible = useCallback((sectionId: string): boolean => {
    const sectionModules = SIDEBAR_MODULES.filter(m => m.section === sectionId);
    return sectionModules.some(m => isModuleVisible(m.id)) && !isSectionFullyVisible(sectionId);
  }, [isModuleVisible, isSectionFullyVisible]);

  return {
    visibleModules,
    isModuleVisible,
    toggleModule,
    setModuleVisibility,
    toggleSection,
    resetToDefaults,
    getVisibleModulesInSection,
    isSectionFullyVisible,
    isSectionPartiallyVisible,
    loaded,
  };
}
