import React, { useState, useMemo, useEffect } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import {
  NonConformita,
  CAPA,
  AuditInterno,
  DocumentoControllato,
} from '@/types/compliance';
import { formatDateFull, generateId } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Award,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  TrendingUp,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  BarChart3,
  Trash2,
  Edit,
  Download,
  FileSignature,
  Users,
  HardHat,
  UserCheck,
  Shield,
  Building2
} from 'lucide-react';

export default function QualityISO() {
  const { cantieri } = useWorkHub();
  const { toast } = useToast();
  
  const [nonConformita, setNonConformita] = useState<NonConformita[]>(() => {
    const saved = localStorage.getItem('quality_nc');
    return saved ? JSON.parse(saved) : [];
  });

  const [capa, setCapa] = useState<CAPA[]>(() => {
    const saved = localStorage.getItem('quality_capa');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditInterni, setAuditInterni] = useState<AuditInterno[]>(() => {
    const saved = localStorage.getItem('quality_audit');
    return saved ? JSON.parse(saved) : [];
  });

  const [documentiControllati, setDocumentiControllati] = useState<DocumentoControllato[]>(() => {
    const saved = localStorage.getItem('quality_docs');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-save
  useEffect(() => {
    localStorage.setItem('quality_nc', JSON.stringify(nonConformita));
  }, [nonConformita]);

  useEffect(() => {
    localStorage.setItem('quality_capa', JSON.stringify(capa));
  }, [capa]);

  useEffect(() => {
    localStorage.setItem('quality_audit', JSON.stringify(auditInterni));
  }, [auditInterni]);

  useEffect(() => {
    localStorage.setItem('quality_docs', JSON.stringify(documentiControllati));
  }, [documentiControllati]);

  const [showNewNCDialog, setShowNewNCDialog] = useState(false);
  const [showNewAuditDialog, setShowNewAuditDialog] = useState(false);
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);
  const [showNCDetailDialog, setShowNCDetailDialog] = useState<string | null>(null);

  // Form states
  const [newNC, setNewNC] = useState({
    origine: '' as 'interna' | 'cliente' | 'fornitore' | 'audit' | '',
    tipoNC: '' as 'prodotto' | 'processo' | 'servizio' | 'sistema' | '',
    gravita: '' as 'minore' | 'maggiore' | 'critica' | '',
    descrizione: '',
    rilevatore: '',
    cantiereId: ''
  });

  const [newAudit, setNewAudit] = useState({
    tipoAudit: '' as 'sistema' | 'processo' | 'prodotto' | 'cantiere' | '',
    areaAuditata: '',
    auditorLead: '',
    dataAudit: '',
    durataOre: 4,
    cantiereId: ''
  });

  const [newDoc, setNewDoc] = useState({
    codice: '',
    titolo: '',
    tipo: '' as 'procedura' | 'istruzione' | 'modulo' | 'manuale' | 'specifica' | '',
    revisione: '01',
    redattore: '',
    verificatore: '',
    approvatore: ''
  });

  const stats = useMemo(() => ({
    ncAperte: nonConformita.filter(nc => nc.stato !== 'chiusa' && nc.stato !== 'verificata').length,
    ncChiuse: nonConformita.filter(nc => nc.stato === 'chiusa' || nc.stato === 'verificata').length,
    capaInCorso: capa.filter(c => c.stato === 'in_corso').length,
    auditPianificati: auditInterni.filter(a => a.stato === 'pianificato').length,
    documentiVigenti: documentiControllati.filter(d => d.stato === 'vigente').length,
    tassoConformita: auditInterni.length > 0 
      ? Math.round(auditInterni.reduce((acc, a) => {
          const conformi = a.checklist.filter(c => c.conforme === true).length;
          const totale = a.checklist.filter(c => c.conforme !== null).length;
          return acc + (totale > 0 ? (conformi / totale) * 100 : 0);
        }, 0) / auditInterni.length)
      : 100
  }), [nonConformita, capa, auditInterni, documentiControllati]);

  const getNCColor = (gravita: string) => {
    switch (gravita) {
      case 'critica': return 'bg-red-500/20 text-red-500';
      case 'maggiore': return 'bg-amber-500/20 text-amber-500';
      case 'minore': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'aperta': return 'bg-red-500/20 text-red-500';
      case 'in_analisi': return 'bg-blue-500/20 text-blue-500';
      case 'in_trattamento': return 'bg-amber-500/20 text-amber-500';
      case 'chiusa': return 'bg-emerald-500/20 text-emerald-500';
      case 'verificata': return 'bg-green-600/20 text-green-600';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const generateNCCode = () => {
    const year = new Date().getFullYear();
    const count = nonConformita.filter(nc => nc.codice.includes(year.toString())).length + 1;
    return `NC-${year}-${count.toString().padStart(3, '0')}`;
  };

  const generateAuditCode = () => {
    const year = new Date().getFullYear();
    const count = auditInterni.filter(a => a.codice.includes(year.toString())).length + 1;
    return `AUD-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleSaveNC = () => {
    if (!newNC.origine || !newNC.gravita || !newNC.descrizione || !newNC.rilevatore) {
      toast({ title: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }

    const nc: NonConformita = {
      id: generateId(),
      codice: generateNCCode(),
      cantiereId: newNC.cantiereId || undefined,
      origine: newNC.origine,
      tipoNC: newNC.tipoNC || 'processo',
      descrizione: newNC.descrizione,
      rilevatore: newNC.rilevatore,
      dataRilevamento: new Date().toISOString().slice(0, 10),
      gravita: newNC.gravita,
      stato: 'aperta',
      allegatiUrl: []
    };

    setNonConformita(prev => [nc, ...prev]);
    toast({ title: 'Non Conformità registrata', description: `Codice: ${nc.codice}` });
    setShowNewNCDialog(false);
    setNewNC({ origine: '', tipoNC: '', gravita: '', descrizione: '', rilevatore: '', cantiereId: '' });
  };

  const handleSaveAudit = () => {
    if (!newAudit.tipoAudit || !newAudit.areaAuditata || !newAudit.auditorLead || !newAudit.dataAudit) {
      toast({ title: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }

    const audit: AuditInterno = {
      id: generateId(),
      codice: generateAuditCode(),
      tipoAudit: newAudit.tipoAudit,
      areaAuditata: newAudit.areaAuditata,
      cantiereId: newAudit.cantiereId || undefined,
      auditorLead: newAudit.auditorLead,
      teamAudit: [],
      dataAudit: newAudit.dataAudit,
      durataOre: newAudit.durataOre,
      checklist: [],
      findings: [],
      conclusioni: '',
      stato: 'pianificato'
    };

    setAuditInterni(prev => [audit, ...prev]);
    toast({ title: 'Audit pianificato', description: `Codice: ${audit.codice}` });
    setShowNewAuditDialog(false);
    setNewAudit({ tipoAudit: '', areaAuditata: '', auditorLead: '', dataAudit: '', durataOre: 4, cantiereId: '' });
  };

  const handleSaveDoc = () => {
    if (!newDoc.codice || !newDoc.titolo || !newDoc.tipo || !newDoc.redattore) {
      toast({ title: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }

    const doc: DocumentoControllato = {
      id: generateId(),
      codice: newDoc.codice,
      titolo: newDoc.titolo,
      tipo: newDoc.tipo,
      revisione: newDoc.revisione,
      dataEmissione: new Date().toISOString().slice(0, 10),
      redattore: newDoc.redattore,
      verificatore: newDoc.verificatore,
      approvatore: newDoc.approvatore,
      stato: 'bozza',
      fileUrl: '',
      distribuzioneControlata: true,
      elencoDistribuzione: []
    };

    setDocumentiControllati(prev => [doc, ...prev]);
    toast({ title: 'Documento creato' });
    setShowNewDocDialog(false);
    setNewDoc({ codice: '', titolo: '', tipo: '', revisione: '01', redattore: '', verificatore: '', approvatore: '' });
  };

  const handleUpdateNCStatus = (ncId: string, newStatus: NonConformita['stato']) => {
    setNonConformita(prev => prev.map(nc => 
      nc.id === ncId ? { ...nc, stato: newStatus, dataChiusura: newStatus === 'chiusa' ? new Date().toISOString().slice(0, 10) : nc.dataChiusura } : nc
    ));
    toast({ title: 'Stato aggiornato' });
  };

  const handleDeleteNC = (ncId: string) => {
    setNonConformita(prev => prev.filter(nc => nc.id !== ncId));
    toast({ title: 'NC eliminata' });
  };

  const handleDeleteAudit = (auditId: string) => {
    setAuditInterni(prev => prev.filter(a => a.id !== auditId));
    toast({ title: 'Audit eliminato' });
  };

  const handleUpdateAuditStatus = (auditId: string, newStatus: AuditInterno['stato']) => {
    setAuditInterni(prev => prev.map(a => 
      a.id === auditId ? { ...a, stato: newStatus } : a
    ));
    toast({ title: 'Stato audit aggiornato' });
  };

  const selectedNC = nonConformita.find(nc => nc.id === showNCDetailDialog);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Sistema Qualità ISO 9001:2015
          </h1>
          <p className="text-muted-foreground">Gestione NC, CAPA, Audit e Documenti controllati</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewAuditDialog(true)} className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Pianifica Audit
          </Button>
          <Button onClick={() => setShowNewNCDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuova NC
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">NC Aperte</span>
          </div>
          <p className="text-2xl font-bold">{stats.ncAperte}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">NC Chiuse</span>
          </div>
          <p className="text-2xl font-bold">{stats.ncChiuse}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">CAPA in Corso</span>
          </div>
          <p className="text-2xl font-bold">{stats.capaInCorso}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-4 h-4 text-cyan-500" />
            <span className="text-sm text-muted-foreground">Audit Pianificati</span>
          </div>
          <p className="text-2xl font-bold">{stats.auditPianificati}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Doc. Vigenti</span>
          </div>
          <p className="text-2xl font-bold">{stats.documentiVigenti}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">% Conformità</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.tassoConformita}%</p>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          KPI Qualità
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tasso risoluzione NC</span>
              <span className="font-medium">{stats.ncAperte + stats.ncChiuse > 0 ? Math.round((stats.ncChiuse / (stats.ncAperte + stats.ncChiuse)) * 100) : 100}%</span>
            </div>
            <Progress value={stats.ncAperte + stats.ncChiuse > 0 ? (stats.ncChiuse / (stats.ncAperte + stats.ncChiuse)) * 100 : 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Conformità Audit</span>
              <span className="font-medium">{stats.tassoConformita}%</span>
            </div>
            <Progress value={stats.tassoConformita} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>CAPA Completate</span>
              <span className="font-medium">{capa.filter(c => c.stato === 'chiusa' || c.stato === 'verificata').length}/{capa.length}</span>
            </div>
            <Progress value={capa.length > 0 ? (capa.filter(c => c.stato === 'chiusa' || c.stato === 'verificata').length / capa.length) * 100 : 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="moduli" className="w-full overflow-hidden">
        <div className="tabs-scrollable-header">
          <TabsList className="inline-flex w-auto min-w-max">
            <TabsTrigger value="moduli">Moduli ISO 9001</TabsTrigger>
            <TabsTrigger value="nc">Non Conformità</TabsTrigger>
            <TabsTrigger value="capa">CAPA</TabsTrigger>
            <TabsTrigger value="audit">Audit Interni</TabsTrigger>
            <TabsTrigger value="documenti">Documenti Controllati</TabsTrigger>
          </TabsList>
        </div>

        {/* Moduli ISO 9001 Tab */}
        <TabsContent value="moduli" className="mt-6">
          <div className="space-y-6">
            {/* Nomine Section */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Nomine e Incarichi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'nomina_preposto', nome: 'Nomina Preposto', desc: 'Nomina del Preposto alla vigilanza e controllo (Art. 19 D.Lgs 81/08)', icon: HardHat },
                  { id: 'nomina_raq', nome: 'Nomina RAQ', desc: 'Nomina Responsabile Assicurazione Qualità', icon: Award },
                  { id: 'nomina_rsgq', nome: 'Nomina RSGQ', desc: 'Nomina Responsabile Sistema Gestione Qualità', icon: Shield },
                  { id: 'nomina_resp_laboratorio', nome: 'Responsabile Laboratorio', desc: 'Nomina Responsabile Prove e Controlli', icon: ClipboardCheck },
                  { id: 'nomina_resp_magazzino', nome: 'Responsabile Magazzino', desc: 'Nomina Responsabile Gestione Magazzino', icon: Building2 },
                  { id: 'nomina_auditor', nome: 'Nomina Auditor Interni', desc: 'Qualifica e nomina degli auditor interni', icon: Users },
                ].map(modulo => (
                  <div key={modulo.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <modulo.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{modulo.nome}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{modulo.desc}</p>
                        <Button size="sm" variant="outline" className="mt-3 gap-1">
                          <Download className="w-3 h-3" />
                          Genera
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dichiarazioni Section */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-primary" />
                Dichiarazioni e Attestazioni
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'dich_conformita', nome: 'Dichiarazione di Conformità', desc: 'Dichiarazione di conformità prodotto/servizio', icon: CheckCircle },
                  { id: 'dich_impianti', nome: 'Dichiarazione Conformità Impianti', desc: 'Dichiarazione di conformità impianti (DM 37/08)', icon: Shield },
                  { id: 'dich_materiali', nome: 'Dichiarazione Materiali', desc: 'Attestazione provenienza e qualità materiali', icon: Award },
                  { id: 'dich_subappalto', nome: 'Dichiarazione Subappalto', desc: 'Dichiarazione attività in subappalto', icon: Building2 },
                  { id: 'dich_competenze', nome: 'Matrice Competenze', desc: 'Dichiarazione competenze personale', icon: Users },
                ].map(modulo => (
                  <div key={modulo.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                        <modulo.icon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{modulo.nome}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{modulo.desc}</p>
                        <Button size="sm" variant="outline" className="mt-3 gap-1">
                          <Download className="w-3 h-3" />
                          Genera
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verbali Section */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Verbali e Report
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'verbale_sopralluogo', nome: 'Verbale di Sopralluogo', desc: 'Verbale ispezione e verifica cantiere/stabilimento', icon: ClipboardCheck },
                  { id: 'verbale_riesame', nome: 'Verbale Riesame Direzione', desc: 'Verbale riesame periodico della direzione', icon: BarChart3 },
                  { id: 'verbale_consegna', nome: 'Verbale Consegna Lavori', desc: 'Verbale di consegna lavori al committente', icon: FileText },
                  { id: 'verbale_collaudo', nome: 'Verbale di Collaudo', desc: 'Verbale collaudo finale opere/prodotti', icon: CheckCircle },
                  { id: 'verbale_formazione', nome: 'Verbale Formazione', desc: 'Registro partecipazione corsi formativi', icon: Users },
                  { id: 'report_fornitore', nome: 'Report Valutazione Fornitore', desc: 'Scheda valutazione e qualifica fornitori', icon: Building2 },
                ].map(modulo => (
                  <div key={modulo.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <modulo.icon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{modulo.nome}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{modulo.desc}</p>
                        <Button size="sm" variant="outline" className="mt-3 gap-1">
                          <Download className="w-3 h-3" />
                          Genera
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registri Section */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Registri e Schede
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'registro_nc', nome: 'Registro Non Conformità', desc: 'Elenco e tracking delle non conformità', icon: AlertTriangle },
                  { id: 'registro_reclami', nome: 'Registro Reclami Cliente', desc: 'Gestione reclami e feedback clienti', icon: Users },
                  { id: 'registro_strumenti', nome: 'Registro Taratura Strumenti', desc: 'Schede taratura e calibrazione strumenti', icon: ClipboardCheck },
                  { id: 'scheda_controllo', nome: 'Scheda Controllo Qualità', desc: 'Check-list controllo qualità prodotto/processo', icon: CheckCircle },
                  { id: 'piano_controllo', nome: 'Piano di Controllo', desc: 'Piano controlli in accettazione e produzione', icon: BarChart3 },
                ].map(modulo => (
                  <div key={modulo.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <modulo.icon className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{modulo.nome}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{modulo.desc}</p>
                        <Button size="sm" variant="outline" className="mt-3 gap-1">
                          <Download className="w-3 h-3" />
                          Genera
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* NC Tab */}
        <TabsContent value="nc" className="mt-6">
          <div className="space-y-4">
            {nonConformita.map(nc => (
              <div key={nc.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-lg', getNCColor(nc.gravita))}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-muted-foreground">{nc.codice}</span>
                        <Badge className={getNCColor(nc.gravita)}>{nc.gravita}</Badge>
                        <Badge className={getStatoColor(nc.stato)}>{nc.stato.replace('_', ' ')}</Badge>
                      </div>
                      <h3 className="font-semibold">{nc.descrizione}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Rilevata da {nc.rilevatore} il {formatDateFull(nc.dataRilevamento)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={nc.stato} 
                      onValueChange={(v) => handleUpdateNCStatus(nc.id, v as NonConformita['stato'])}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aperta">Aperta</SelectItem>
                        <SelectItem value="in_analisi">In Analisi</SelectItem>
                        <SelectItem value="in_trattamento">In Trattamento</SelectItem>
                        <SelectItem value="chiusa">Chiusa</SelectItem>
                        <SelectItem value="verificata">Verificata</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNC(nc.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {nc.azioneCorrettiva && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm"><strong>Azione correttiva:</strong> {nc.azioneCorrettiva}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* CAPA Tab */}
        <TabsContent value="capa" className="mt-6">
          <div className="space-y-4">
            {capa.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">{c.codice}</span>
                      <Badge variant="outline">{c.tipo}</Badge>
                      <Badge className={getStatoColor(c.stato)}>{c.stato.replace('_', ' ')}</Badge>
                    </div>
                    <h3 className="font-semibold">{c.descrizioneProblema}</h3>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 mb-4">
                  <p className="text-sm"><strong>Analisi causa radice:</strong> {c.analisicausaRadice}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Azioni previste:</p>
                  {c.azioniPreviste.map((azione, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        {azione.stato === 'completata' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : azione.stato === 'in_corso' ? (
                          <Clock className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{azione.descrizione}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{azione.responsabile}</span>
                        <span>•</span>
                        <span>{formatDateFull(azione.dataScadenza)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-6">
          <div className="space-y-4">
            {auditInterni.map(audit => (
              <div key={audit.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">{audit.codice}</span>
                      <Badge variant="outline">{audit.tipoAudit}</Badge>
                      <Badge className={cn(
                        audit.stato === 'completato' && 'bg-emerald-500/20 text-emerald-500',
                        audit.stato === 'pianificato' && 'bg-blue-500/20 text-blue-500',
                        audit.stato === 'in_corso' && 'bg-amber-500/20 text-amber-500'
                      )}>
                        {audit.stato.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{audit.areaAuditata}</h3>
                    <p className="text-sm text-muted-foreground">
                      Lead: {audit.auditorLead} | Data: {formatDateFull(audit.dataAudit)} | Durata: {audit.durataOre}h
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={audit.stato} 
                      onValueChange={(v) => handleUpdateAuditStatus(audit.id, v as AuditInterno['stato'])}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pianificato">Pianificato</SelectItem>
                        <SelectItem value="in_corso">In Corso</SelectItem>
                        <SelectItem value="completato">Completato</SelectItem>
                        <SelectItem value="report_emesso">Report Emesso</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAudit(audit.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {audit.findings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Findings:</p>
                    <div className="space-y-2">
                      {audit.findings.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Badge variant="outline" className={cn(
                            f.tipo === 'nc_maggiore' && 'bg-red-500/20 text-red-500',
                            f.tipo === 'nc_minore' && 'bg-amber-500/20 text-amber-500',
                            f.tipo === 'osservazione' && 'bg-blue-500/20 text-blue-500'
                          )}>
                            {f.tipo.replace('_', ' ')}
                          </Badge>
                          <span>{f.descrizione}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {audit.conclusioni && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">{audit.conclusioni}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Documenti Tab */}
        <TabsContent value="documenti" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowNewDocDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuovo Documento
            </Button>
          </div>
          <div className="space-y-4">
            {documentiControllati.map(doc => (
              <div key={doc.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm">{doc.codice}</span>
                      <Badge variant="outline">Rev. {doc.revisione}</Badge>
                      <Badge className={cn(
                        doc.stato === 'vigente' && 'bg-emerald-500/20 text-emerald-500',
                        doc.stato === 'obsoleto' && 'bg-gray-500/20 text-gray-500',
                        doc.stato === 'bozza' && 'bg-blue-500/20 text-blue-500'
                      )}>
                        {doc.stato}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{doc.titolo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.tipo} | Emesso: {formatDateFull(doc.dataEmissione)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Visualizza</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New NC Dialog */}
      <Dialog open={showNewNCDialog} onOpenChange={setShowNewNCDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuova Non Conformità</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Origine *</Label>
                <Select value={newNC.origine} onValueChange={(v) => setNewNC(prev => ({ ...prev, origine: v as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona origine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interna">Interna</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="fornitore">Fornitore</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gravità *</Label>
                <Select value={newNC.gravita} onValueChange={(v) => setNewNC(prev => ({ ...prev, gravita: v as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona gravità" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minore">Minore</SelectItem>
                    <SelectItem value="maggiore">Maggiore</SelectItem>
                    <SelectItem value="critica">Critica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tipo NC</Label>
              <Select value={newNC.tipoNC} onValueChange={(v) => setNewNC(prev => ({ ...prev, tipoNC: v as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prodotto">Prodotto</SelectItem>
                  <SelectItem value="processo">Processo</SelectItem>
                  <SelectItem value="servizio">Servizio</SelectItem>
                  <SelectItem value="sistema">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrizione *</Label>
              <Textarea 
                placeholder="Descrivi la non conformità..." 
                value={newNC.descrizione}
                onChange={(e) => setNewNC(prev => ({ ...prev, descrizione: e.target.value }))}
              />
            </div>
            <div>
              <Label>Rilevatore *</Label>
              <Input 
                placeholder="Nome del rilevatore"
                value={newNC.rilevatore}
                onChange={(e) => setNewNC(prev => ({ ...prev, rilevatore: e.target.value }))}
              />
            </div>
            <div>
              <Label>Cantiere (opzionale)</Label>
              <Select value={newNC.cantiereId} onValueChange={(v) => setNewNC(prev => ({ ...prev, cantiereId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cantiere" />
                </SelectTrigger>
                <SelectContent>
                  {cantieri.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewNCDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveNC}>Crea NC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Audit Dialog */}
      <Dialog open={showNewAuditDialog} onOpenChange={setShowNewAuditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pianifica Audit Interno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo Audit *</Label>
                <Select value={newAudit.tipoAudit} onValueChange={(v) => setNewAudit(prev => ({ ...prev, tipoAudit: v as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sistema">Sistema</SelectItem>
                    <SelectItem value="processo">Processo</SelectItem>
                    <SelectItem value="prodotto">Prodotto</SelectItem>
                    <SelectItem value="cantiere">Cantiere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data Audit *</Label>
                <Input 
                  type="date"
                  value={newAudit.dataAudit}
                  onChange={(e) => setNewAudit(prev => ({ ...prev, dataAudit: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Area Auditata *</Label>
              <Input 
                placeholder="Es: Gestione Approvvigionamenti"
                value={newAudit.areaAuditata}
                onChange={(e) => setNewAudit(prev => ({ ...prev, areaAuditata: e.target.value }))}
              />
            </div>
            <div>
              <Label>Auditor Lead *</Label>
              <Input 
                placeholder="Nome auditor principale"
                value={newAudit.auditorLead}
                onChange={(e) => setNewAudit(prev => ({ ...prev, auditorLead: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Durata (ore)</Label>
                <Input 
                  type="number"
                  value={newAudit.durataOre}
                  onChange={(e) => setNewAudit(prev => ({ ...prev, durataOre: parseInt(e.target.value) || 4 }))}
                />
              </div>
              <div>
                <Label>Cantiere (opzionale)</Label>
                <Select value={newAudit.cantiereId} onValueChange={(v) => setNewAudit(prev => ({ ...prev, cantiereId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {cantieri.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.codiceCommessa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAuditDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveAudit}>Pianifica Audit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Document Dialog */}
      <Dialog open={showNewDocDialog} onOpenChange={setShowNewDocDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo Documento Controllato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Codice *</Label>
                <Input 
                  placeholder="Es: PQ-02"
                  value={newDoc.codice}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, codice: e.target.value }))}
                />
              </div>
              <div>
                <Label>Revisione</Label>
                <Input 
                  value={newDoc.revisione}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, revisione: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Titolo *</Label>
              <Input 
                placeholder="Titolo del documento"
                value={newDoc.titolo}
                onChange={(e) => setNewDoc(prev => ({ ...prev, titolo: e.target.value }))}
              />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={newDoc.tipo} onValueChange={(v) => setNewDoc(prev => ({ ...prev, tipo: v as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manuale">Manuale</SelectItem>
                  <SelectItem value="procedura">Procedura</SelectItem>
                  <SelectItem value="istruzione">Istruzione Operativa</SelectItem>
                  <SelectItem value="modulo">Modulo</SelectItem>
                  <SelectItem value="specifica">Specifica Tecnica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Redattore *</Label>
                <Input 
                  placeholder="Nome"
                  value={newDoc.redattore}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, redattore: e.target.value }))}
                />
              </div>
              <div>
                <Label>Verificatore</Label>
                <Input 
                  placeholder="Nome"
                  value={newDoc.verificatore}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, verificatore: e.target.value }))}
                />
              </div>
              <div>
                <Label>Approvatore</Label>
                <Input 
                  placeholder="Nome"
                  value={newDoc.approvatore}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, approvatore: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDocDialog(false)}>Annulla</Button>
            <Button onClick={handleSaveDoc}>Crea Documento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
