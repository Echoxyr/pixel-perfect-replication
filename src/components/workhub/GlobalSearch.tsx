import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Construction,
  Building2,
  HardHat,
  FileText,
  FolderKanban,
  Receipt,
  Truck,
  Search,
  Calculator,
  Users,
  Settings
} from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { cantieri, imprese, lavoratori, tasks } = useWorkHub();
  const [search, setSearch] = useState('');

  // Fetch fatture e preventivi dal database
  const { data: fatture = [] } = useQuery({
    queryKey: ['fatture-search'],
    queryFn: async () => {
      const { data } = await supabase.from('fatture').select('*').limit(100);
      return data || [];
    },
    enabled: open,
  });

  const { data: preventivi = [] } = useQuery({
    queryKey: ['preventivi-search'],
    queryFn: async () => {
      const { data } = await supabase.from('preventivi').select('*').limit(100);
      return data || [];
    },
    enabled: open,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads-search'],
    queryFn: async () => {
      const { data } = await supabase.from('leads').select('*').limit(100);
      return data || [];
    },
    enabled: open,
  });

  const { data: ddt = [] } = useQuery({
    queryKey: ['ddt-search'],
    queryFn: async () => {
      const { data } = await supabase.from('ddt').select('*').limit(100);
      return data || [];
    },
    enabled: open,
  });

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
    setSearch('');
  };

  // Risultati filtrati
  const results = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();

    return {
      cantieri: cantieri.filter(c => 
        c.nome.toLowerCase().includes(q) || 
        c.codiceCommessa.toLowerCase().includes(q)
      ).slice(0, 5),
      imprese: imprese.filter(i => 
        i.ragioneSociale.toLowerCase().includes(q)
      ).slice(0, 5),
      lavoratori: lavoratori.filter(l => 
        `${l.nome} ${l.cognome}`.toLowerCase().includes(q)
      ).slice(0, 5),
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes(q)
      ).slice(0, 5),
      fatture: fatture.filter((f: any) => 
        f.numero?.toLowerCase().includes(q) || 
        f.cliente_fornitore?.toLowerCase().includes(q)
      ).slice(0, 5),
      preventivi: preventivi.filter((p: any) => 
        p.numero?.toLowerCase().includes(q) || 
        p.cliente_nome?.toLowerCase().includes(q) ||
        p.oggetto?.toLowerCase().includes(q)
      ).slice(0, 5),
      leads: leads.filter((l: any) => 
        l.nome?.toLowerCase().includes(q) || 
        l.azienda?.toLowerCase().includes(q)
      ).slice(0, 5),
      ddt: ddt.filter((d: any) => 
        d.numero?.toLowerCase().includes(q) || 
        d.destinatario?.toLowerCase().includes(q)
      ).slice(0, 5),
    };
  }, [search, cantieri, imprese, lavoratori, tasks, fatture, preventivi, leads, ddt]);

  const hasResults = results && Object.values(results).some(arr => arr.length > 0);

  // Scorciatoie rapide
  const quickActions = [
    { label: 'Dashboard', icon: FolderKanban, path: '/dashboard' },
    { label: 'Cantieri', icon: Construction, path: '/cantieri' },
    { label: 'Imprese', icon: Building2, path: '/imprese' },
    { label: 'Lavoratori', icon: HardHat, path: '/lavoratori' },
    { label: 'Progetti & Task', icon: FolderKanban, path: '/progetti' },
    { label: 'Fatture', icon: Receipt, path: '/reparto-amministrazione' },
    { label: 'Preventivi', icon: FileText, path: '/reparto-commerciale' },
    { label: 'Computo Metrico', icon: Calculator, path: '/computo-metrico' },
    { label: 'Impostazioni', icon: Settings, path: '/impostazioni' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Cerca cantieri, imprese, fatture, lavoratori..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {!search.trim() ? (
          <>
            <CommandGroup heading="Navigazione rapida">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.path}
                  onSelect={() => handleSelect(() => navigate(action.path))}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : !hasResults ? (
          <CommandEmpty>Nessun risultato per "{search}"</CommandEmpty>
        ) : (
          <>
            {results?.cantieri && results.cantieri.length > 0 && (
              <CommandGroup heading="Cantieri">
                {results.cantieri.map((c) => (
                  <CommandItem
                    key={c.id}
                    onSelect={() => handleSelect(() => navigate(`/cantieri/${c.id}`))}
                  >
                    <Construction className="mr-2 h-4 w-4" />
                    <span>{c.codiceCommessa}</span>
                    <span className="ml-2 text-muted-foreground">{c.nome}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results?.imprese && results.imprese.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Imprese">
                  {results.imprese.map((i) => (
                    <CommandItem
                      key={i.id}
                      onSelect={() => handleSelect(() => navigate('/imprese'))}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      {i.ragioneSociale}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results?.lavoratori && results.lavoratori.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Lavoratori">
                  {results.lavoratori.map((l) => (
                    <CommandItem
                      key={l.id}
                      onSelect={() => handleSelect(() => navigate('/lavoratori'))}
                    >
                      <HardHat className="mr-2 h-4 w-4" />
                      {l.nome} {l.cognome}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results?.tasks && results.tasks.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Task">
                  {results.tasks.map((t) => (
                    <CommandItem
                      key={t.id}
                      onSelect={() => handleSelect(() => navigate('/progetti'))}
                    >
                      <FolderKanban className="mr-2 h-4 w-4" />
                      {t.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results?.fatture && results.fatture.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Fatture">
                  {results.fatture.map((f: any) => (
                    <CommandItem
                      key={f.id}
                      onSelect={() => handleSelect(() => navigate('/reparto-amministrazione'))}
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      <span>{f.numero}</span>
                      <span className="ml-2 text-muted-foreground">{f.cliente_fornitore}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results?.preventivi && results.preventivi.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Preventivi">
                  {results.preventivi.map((p: any) => (
                    <CommandItem
                      key={p.id}
                      onSelect={() => handleSelect(() => navigate('/reparto-commerciale'))}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{p.numero}</span>
                      <span className="ml-2 text-muted-foreground">{p.cliente_nome}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results?.leads && results.leads.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Lead">
                  {results.leads.map((l: any) => (
                    <CommandItem
                      key={l.id}
                      onSelect={() => handleSelect(() => navigate('/reparto-commerciale'))}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>{l.nome}</span>
                      {l.azienda && <span className="ml-2 text-muted-foreground">{l.azienda}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results?.ddt && results.ddt.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="DDT">
                  {results.ddt.map((d: any) => (
                    <CommandItem
                      key={d.id}
                      onSelect={() => handleSelect(() => navigate('/reparto-amministrazione'))}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      <span>{d.numero}</span>
                      <span className="ml-2 text-muted-foreground">{d.destinatario}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
