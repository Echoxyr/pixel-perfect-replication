import { useMemo, useState } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { MiniStat } from '@/components/workhub/StatCard';
import { TrafficLight } from '@/components/workhub/StatusPill';
import { formatDateFull, daysUntil, calculateTrafficLight } from '@/types/workhub';
import {
  ShieldCheck,
  FileWarning,
  GraduationCap,
  Stethoscope,
  Building2,
  HardHat,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function HSEDashboard() {
  const navigate = useNavigate();
  const {
    cantieri,
    imprese,
    lavoratori,
    documenti,
    formazioni,
    getDocumentiImpresa,
    getImpreseCantiere,
    getLavoratoriCantiere,
  } = useWorkHub();

  // Filters
  const [filterCantiere, setFilterCantiere] = useState<string>('all');
  const [filterTipoDoc, setFilterTipoDoc] = useState<string>('all');
  const [filterImpresa, setFilterImpresa] = useState<string>('all');
  const [filterGravita, setFilterGravita] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data by cantiere
  const filteredData = useMemo(() => {
    let filteredImprese = imprese;
    let filteredLavoratori = lavoratori;
    let filteredDocumenti = documenti;
    let filteredFormazioni = formazioni;

    if (filterCantiere !== 'all') {
      const cantiereImprese = getImpreseCantiere(filterCantiere);
      const cantiereLavoratori = getLavoratoriCantiere(filterCantiere);
      const cantiereImpreseIds = cantiereImprese.map(i => i.id);
      const cantiereLavoratoriIds = cantiereLavoratori.map(l => l.id);

      filteredImprese = cantiereImprese;
      filteredLavoratori = cantiereLavoratori;
      filteredDocumenti = documenti.filter(d => 
        d.cantiereId === filterCantiere || 
        (d.impresaId && cantiereImpreseIds.includes(d.impresaId))
      );
      filteredFormazioni = formazioni.filter(f => cantiereLavoratoriIds.includes(f.lavoratoreId));
    }

    if (filterImpresa !== 'all') {
      filteredDocumenti = filteredDocumenti.filter(d => d.impresaId === filterImpresa);
      filteredLavoratori = filteredLavoratori.filter(l => l.impresaId === filterImpresa);
      filteredFormazioni = filteredFormazioni.filter(f => {
        const lav = lavoratori.find(l => l.id === f.lavoratoreId);
        return lav?.impresaId === filterImpresa;
      });
    }

    return {
      imprese: filteredImprese,
      lavoratori: filteredLavoratori,
      documenti: filteredDocumenti,
      formazioni: filteredFormazioni
    };
  }, [filterCantiere, filterImpresa, imprese, lavoratori, documenti, formazioni]);

  // Calculate HSE stats for filtered data
  const filteredStats = useMemo(() => {
    const THRESHOLD = 30;

    const docsScaduti = filteredData.documenti.filter(d => d.stato === 'scaduto').length;
    const docsInScadenza = filteredData.documenti.filter(d => d.stato === 'in_scadenza').length;
    const docsMancanti = filteredData.documenti.filter(d => d.stato === 'da_richiedere').length;
    const formsScadute = filteredData.formazioni.filter(f => f.stato === 'scaduto').length;
    const formsInScadenza = filteredData.formazioni.filter(f => f.stato === 'in_scadenza').length;
    const visiteScadute = filteredData.lavoratori.filter(l => {
      if (!l.dataScadenzaIdoneita) return false;
      const days = daysUntil(l.dataScadenzaIdoneita);
      return days !== null && days < 0;
    }).length;
    const visiteInScadenza = filteredData.lavoratori.filter(l => {
      if (!l.dataScadenzaIdoneita) return false;
      const days = daysUntil(l.dataScadenzaIdoneita);
      return days !== null && days >= 0 && days <= THRESHOLD;
    }).length;

    return {
      docsScaduti,
      docsInScadenza,
      docsMancanti,
      formsScadute,
      formsInScadenza,
      visiteScadute,
      visiteInScadenza,
      totalCritical: docsScaduti + formsScadute + visiteScadute + docsMancanti,
      totalWarning: docsInScadenza + formsInScadenza + visiteInScadenza
    };
  }, [filteredData]);

  // Critical items lists with filters applied
  const expiredDocuments = useMemo(() => {
    let docs = filteredData.documenti.filter(d => d.stato === 'scaduto' || d.stato === 'in_scadenza' || d.stato === 'da_richiedere');
    
    // Filter by gravità
    if (filterGravita === 'critical') {
      docs = docs.filter(d => d.stato === 'scaduto' || d.stato === 'da_richiedere');
    } else if (filterGravita === 'warning') {
      docs = docs.filter(d => d.stato === 'in_scadenza');
    } else if (filterGravita === 'ok') {
      docs = [];
    }

    // Filter by tipo documento
    if (filterTipoDoc !== 'all') {
      if (filterTipoDoc === 'documenti') {
        // Already filtered
      } else if (filterTipoDoc === 'formazioni') {
        docs = [];
      } else if (filterTipoDoc === 'visite') {
        docs = [];
      }
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(d => 
        d.tipo.toLowerCase().includes(query) || 
        d.nome.toLowerCase().includes(query)
      );
    }

    return docs.sort((a, b) => {
      if (a.stato === 'scaduto' && b.stato !== 'scaduto') return -1;
      if (a.stato !== 'scaduto' && b.stato === 'scaduto') return 1;
      return 0;
    }).slice(0, 15);
  }, [filteredData.documenti, filterGravita, filterTipoDoc, searchQuery]);

  const expiredFormazioni = useMemo(() => {
    let forms = filteredData.formazioni.filter(f => f.stato === 'scaduto' || f.stato === 'in_scadenza');
    
    if (filterGravita === 'critical') {
      forms = forms.filter(f => f.stato === 'scaduto');
    } else if (filterGravita === 'warning') {
      forms = forms.filter(f => f.stato === 'in_scadenza');
    } else if (filterGravita === 'ok') {
      forms = [];
    }

    if (filterTipoDoc !== 'all' && filterTipoDoc !== 'formazioni') {
      forms = [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      forms = forms.filter(f => f.tipoCorso.toLowerCase().includes(query));
    }

    return forms.sort((a, b) => {
      if (a.stato === 'scaduto' && b.stato !== 'scaduto') return -1;
      if (a.stato !== 'scaduto' && b.stato === 'scaduto') return 1;
      return 0;
    }).slice(0, 15);
  }, [filteredData.formazioni, filterGravita, filterTipoDoc, searchQuery]);

  const expiredVisite = useMemo(() => {
    let lavs = filteredData.lavoratori.filter(l => {
      if (!l.dataScadenzaIdoneita) return false;
      const days = daysUntil(l.dataScadenzaIdoneita);
      return days !== null && days <= 30;
    });

    if (filterGravita === 'critical') {
      lavs = lavs.filter(l => daysUntil(l.dataScadenzaIdoneita!)! < 0);
    } else if (filterGravita === 'warning') {
      lavs = lavs.filter(l => {
        const days = daysUntil(l.dataScadenzaIdoneita!);
        return days !== null && days >= 0 && days <= 30;
      });
    } else if (filterGravita === 'ok') {
      lavs = [];
    }

    if (filterTipoDoc !== 'all' && filterTipoDoc !== 'visite') {
      lavs = [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      lavs = lavs.filter(l => 
        l.nome.toLowerCase().includes(query) || 
        l.cognome.toLowerCase().includes(query)
      );
    }

    return lavs.sort((a, b) => {
      const daysA = daysUntil(a.dataScadenzaIdoneita!);
      const daysB = daysUntil(b.dataScadenzaIdoneita!);
      return (daysA || 0) - (daysB || 0);
    }).slice(0, 15);
  }, [filteredData.lavoratori, filterGravita, filterTipoDoc, searchQuery]);

  const getLavoratoreName = (id: string) => {
    const lav = lavoratori.find(l => l.id === id);
    return lav ? `${lav.cognome} ${lav.nome}` : '-';
  };

  const getImpresaName = (id?: string) => {
    if (!id) return '-';
    const imp = imprese.find(i => i.id === id);
    return imp?.ragioneSociale || '-';
  };

  // Overall status
  const overallStatus = filteredStats.totalCritical > 0 ? 'red' : filteredStats.totalWarning > 0 ? 'yellow' : 'green';

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard HSE</h1>
          <p className="text-sm text-muted-foreground">Console centrale sicurezza, salute e ambiente</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl border border-border bg-card min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4 flex-shrink-0" />
          Filtri:
        </div>
        <div className="flex flex-col sm:flex-row gap-2 min-w-0">
          <Select value={filterCantiere} onValueChange={setFilterCantiere}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Commessa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              {cantieri.filter(c => c.stato === 'attivo').map(c => (
                <SelectItem key={c.id} value={c.id}>{c.codiceCommessa}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterImpresa} onValueChange={setFilterImpresa}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Impresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              {imprese.map(i => (
                <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTipoDoc} onValueChange={setFilterTipoDoc}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="documenti">Documenti</SelectItem>
              <SelectItem value="formazioni">Formazioni</SelectItem>
              <SelectItem value="visite">Visite</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterGravita} onValueChange={setFilterGravita}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Gravità" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              <SelectItem value="critical">🔴 Critico</SelectItem>
              <SelectItem value="warning">⚠️ Scadenza</SelectItem>
              <SelectItem value="ok">✅ OK</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:w-48"
          />
        </div>
      </div>

      {/* Overall Status */}
      <div className={cn(
        'p-6 rounded-xl border',
        overallStatus === 'red' ? 'bg-red-500/10 border-red-500/30' :
        overallStatus === 'yellow' ? 'bg-amber-500/10 border-amber-500/30' :
        'bg-emerald-500/10 border-emerald-500/30'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-4 rounded-full',
              overallStatus === 'red' ? 'bg-red-500/20' :
              overallStatus === 'yellow' ? 'bg-amber-500/20' :
              'bg-emerald-500/20'
            )}>
              <ShieldCheck className={cn(
                'w-8 h-8',
                overallStatus === 'red' ? 'text-red-500' :
                overallStatus === 'yellow' ? 'text-amber-500' :
                'text-emerald-500'
              )} />
            </div>
            <div>
              <h2 className={cn(
                'text-xl font-bold',
                overallStatus === 'red' ? 'text-red-500' :
                overallStatus === 'yellow' ? 'text-amber-500' :
                'text-emerald-500'
              )}>
                {overallStatus === 'red' ? 'Attenzione Richiesta' :
                 overallStatus === 'yellow' ? 'Elementi in Scadenza' :
                 'Tutto in Regola'}
              </h2>
              <p className="text-muted-foreground">
                {overallStatus === 'red' 
                  ? `${filteredStats.totalCritical} elementi scaduti/mancanti richiedono azione immediata`
                  : overallStatus === 'yellow'
                  ? `${filteredStats.totalWarning} elementi in scadenza nei prossimi 30 giorni`
                  : 'Tutti i documenti, formazioni e visite mediche sono in regola'}
              </p>
            </div>
          </div>
          <TrafficLight status={overallStatus} size="lg" pulse={overallStatus === 'red'} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div 
          className="p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/imprese')}
        >
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{filteredData.imprese.length}</p>
          <p className="text-sm text-muted-foreground">Imprese</p>
        </div>
        <div 
          className="p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/lavoratori')}
        >
          <div className="flex items-center justify-between mb-2">
            <HardHat className="w-5 h-5 text-muted-foreground" />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{filteredData.lavoratori.length}</p>
          <p className="text-sm text-muted-foreground">Lavoratori</p>
        </div>
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-red-500">{filteredStats.totalCritical}</p>
          <p className="text-sm text-red-500">Critici</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
          <Clock className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-500">{filteredStats.totalWarning}</p>
          <p className="text-sm text-amber-500">In scadenza</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <FileWarning className="w-5 h-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold">{filteredData.documenti.length}</p>
          <p className="text-sm text-muted-foreground">Documenti</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <GraduationCap className="w-5 h-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold">{filteredData.formazioni.length}</p>
          <p className="text-sm text-muted-foreground">Formazioni</p>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Documenti */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileWarning className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Documenti Aziendali</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Scaduti" value={filteredStats.docsScaduti} color={filteredStats.docsScaduti > 0 ? 'danger' : 'default'} />
            <MiniStat label="Mancanti" value={filteredStats.docsMancanti} color={filteredStats.docsMancanti > 0 ? 'danger' : 'default'} />
            <MiniStat label="In scadenza" value={filteredStats.docsInScadenza} color={filteredStats.docsInScadenza > 0 ? 'warning' : 'default'} />
            <MiniStat label="OK" value={filteredData.documenti.filter(d => d.stato === 'approvato').length} color="success" />
          </div>
        </div>

        {/* Formazioni */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <GraduationCap className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-semibold">Formazione</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Scadute" value={filteredStats.formsScadute} color={filteredStats.formsScadute > 0 ? 'danger' : 'default'} />
            <MiniStat label="In scadenza" value={filteredStats.formsInScadenza} color={filteredStats.formsInScadenza > 0 ? 'warning' : 'default'} />
            <MiniStat label="OK" value={filteredData.formazioni.filter(f => f.stato === 'fatto').length} color="success" />
          </div>
        </div>

        {/* Visite Mediche */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Stethoscope className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold">Visite Mediche</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Scadute" value={filteredStats.visiteScadute} color={filteredStats.visiteScadute > 0 ? 'danger' : 'default'} />
            <MiniStat label="In scadenza" value={filteredStats.visiteInScadenza} color={filteredStats.visiteInScadenza > 0 ? 'warning' : 'default'} />
            <MiniStat label="OK" value={filteredData.lavoratori.length - filteredStats.visiteScadute - filteredStats.visiteInScadenza} color="success" />
          </div>
        </div>
      </div>

      {/* Critical Items Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documenti */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-muted-foreground" />
              Documenti da verificare
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/imprese')}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expiredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate('/imprese')}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors',
                  doc.stato === 'scaduto' || doc.stato === 'da_richiedere' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.tipo}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getImpresaName(doc.impresaId)}
                    </p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-[10px] font-semibold rounded',
                    doc.stato === 'scaduto' || doc.stato === 'da_richiedere' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                  )}>
                    {doc.stato === 'scaduto' ? 'SCADUTO' : doc.stato === 'da_richiedere' ? 'MANCANTE' : 'IN SCADENZA'}
                  </span>
                </div>
                {doc.dataScadenza && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Scadenza: {formatDateFull(doc.dataScadenza)}
                  </p>
                )}
              </div>
            ))}
            {expiredDocuments.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                Tutti i documenti sono in regola
              </div>
            )}
          </div>
        </div>

        {/* Formazioni */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-muted-foreground" />
              Formazioni da aggiornare
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/lavoratori')}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expiredFormazioni.map(form => (
              <div
                key={form.id}
                onClick={() => navigate('/lavoratori')}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors',
                  form.stato === 'scaduto' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{form.tipoCorso}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getLavoratoreName(form.lavoratoreId)}
                    </p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-[10px] font-semibold rounded',
                    form.stato === 'scaduto' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                  )}>
                    {form.stato === 'scaduto' ? 'SCADUTA' : 'IN SCADENZA'}
                  </span>
                </div>
                {form.dataScadenza && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Scadenza: {formatDateFull(form.dataScadenza)}
                  </p>
                )}
              </div>
            ))}
            {expiredFormazioni.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                Tutte le formazioni sono in regola
              </div>
            )}
          </div>
        </div>

        {/* Visite Mediche */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-muted-foreground" />
              Visite mediche da rinnovare
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/lavoratori')}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expiredVisite.map(lav => {
              const days = daysUntil(lav.dataScadenzaIdoneita!);
              const isExpired = days !== null && days < 0;
              const impresa = imprese.find(i => i.id === lav.impresaId);
              return (
                <div
                  key={lav.id}
                  onClick={() => navigate('/lavoratori')}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors',
                    isExpired ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lav.cognome} {lav.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {impresa?.ragioneSociale || '-'} • {lav.mansione}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 text-[10px] font-semibold rounded',
                      isExpired ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                    )}>
                      {isExpired ? 'SCADUTA' : 'IN SCADENZA'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scadenza: {formatDateFull(lav.dataScadenzaIdoneita)}
                  </p>
                </div>
              );
            })}
            {expiredVisite.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                Tutte le visite sono in regola
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cantieri Status Overview */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Stato Cantieri</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/cantieri')}>
            Vedi tutti <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cantieri.filter(c => c.stato === 'attivo').map(cantiere => {
            const cantiereImprese = getImpreseCantiere(cantiere.id);
            let status: 'green' | 'yellow' | 'red' = 'green';
            cantiereImprese.forEach(imp => {
              const docs = getDocumentiImpresa(imp.id);
              const impStatus = calculateTrafficLight(docs);
              if (impStatus.color === 'red') status = 'red';
              else if (impStatus.color === 'yellow' && status !== 'red') status = 'yellow';
            });

            return (
              <div
                key={cantiere.id}
                onClick={() => navigate(`/cantieri/${cantiere.id}`)}
                className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrafficLight status={status} />
                    <span className="font-mono text-sm text-primary">{cantiere.codiceCommessa}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="font-medium truncate">{cantiere.nome}</p>
                <p className="text-xs text-muted-foreground">{cantiereImprese.length} imprese</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
