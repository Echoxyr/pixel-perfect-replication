import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import {
  NonConformita,
  CAPA,
  AuditInterno,
  DocumentoControllato,
  generateComplianceId
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
  BarChart3
} from 'lucide-react';

export default function QualityISO() {
  const { cantieri } = useWorkHub();
  const { toast } = useToast();
  
  const [nonConformita, setNonConformita] = useState<NonConformita[]>([
    {
      id: '1',
      codice: 'NC-2024-001',
      cantiereId: cantieri[0]?.id,
      origine: 'interna',
      tipoNC: 'processo',
      descrizione: 'Procedura di saldatura non conforme alle specifiche tecniche',
      rilevatore: 'Mario Rossi',
      dataRilevamento: '2024-03-15',
      gravita: 'maggiore',
      stato: 'in_analisi',
      allegatiUrl: []
    }
  ]);

  const [capa, setCapa] = useState<CAPA[]>([
    {
      id: '1',
      nonConformitaId: '1',
      tipo: 'correttiva',
      codice: 'AC-2024-001',
      descrizioneProblema: 'Saldature non conformi rilevate durante ispezione',
      analisicausaRadice: 'Formazione insufficiente del personale sulla nuova procedura',
      azioniPreviste: [
        {
          descrizione: 'Formazione aggiuntiva operatori',
          responsabile: 'Resp. Qualità',
          dataScadenza: '2024-04-01',
          stato: 'in_corso'
        },
        {
          descrizione: 'Revisione procedura operativa',
          responsabile: 'Ing. Processo',
          dataScadenza: '2024-04-15',
          stato: 'pianificata'
        }
      ],
      dataApertura: '2024-03-16',
      stato: 'in_corso'
    }
  ]);

  const [auditInterni, setAuditInterni] = useState<AuditInterno[]>([
    {
      id: '1',
      codice: 'AUD-2024-001',
      tipoAudit: 'processo',
      areaAuditata: 'Gestione Approvvigionamenti',
      auditorLead: 'Responsabile Qualità',
      teamAudit: ['Auditor Interno 1'],
      dataAudit: '2024-04-20',
      durataOre: 4,
      checklist: [
        { requisito: '7.1.1 Risorse', conforme: true, evidenza: 'Procedura PQ-07 applicata' },
        { requisito: '8.4 Controllo processi esterni', conforme: true, evidenza: 'Qualifica fornitori OK' },
        { requisito: '7.5 Informazioni documentate', conforme: false, nota: 'Da aggiornare registro' }
      ],
      findings: [
        { tipo: 'nc_minore', descrizione: 'Registro fornitori non aggiornato', riferimentoNorma: '7.5.3' }
      ],
      conclusioni: 'Sistema sostanzialmente conforme con una NC minore',
      stato: 'completato'
    }
  ]);

  const [documentiControllati, setDocumentiControllati] = useState<DocumentoControllato[]>([
    {
      id: '1',
      codice: 'MQ-001',
      titolo: 'Manuale Qualità',
      tipo: 'manuale',
      revisione: '05',
      dataEmissione: '2024-01-01',
      redattore: 'Resp. Qualità',
      verificatore: 'Direttore Tecnico',
      approvatore: 'Direzione',
      stato: 'vigente',
      fileUrl: '',
      distribuzioneControlata: true,
      elencoDistribuzione: ['Tutti i reparti']
    },
    {
      id: '2',
      codice: 'PQ-01',
      titolo: 'Procedura Gestione Non Conformità',
      tipo: 'procedura',
      revisione: '03',
      dataEmissione: '2024-02-15',
      redattore: 'Resp. Qualità',
      verificatore: 'Direttore Tecnico',
      approvatore: 'Direzione',
      stato: 'vigente',
      fileUrl: '',
      distribuzioneControlata: true,
      elencoDistribuzione: ['Qualità', 'Produzione']
    }
  ]);

  const [showNewNCDialog, setShowNewNCDialog] = useState(false);
  const [showNewAuditDialog, setShowNewAuditDialog] = useState(false);

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
      <Tabs defaultValue="nc" className="w-full">
        <TabsList>
          <TabsTrigger value="nc">Non Conformità</TabsTrigger>
          <TabsTrigger value="capa">CAPA</TabsTrigger>
          <TabsTrigger value="audit">Audit Interni</TabsTrigger>
          <TabsTrigger value="documenti">Documenti Controllati</TabsTrigger>
        </TabsList>

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
                  <Button variant="outline" size="sm">Gestisci</Button>
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
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{audit.conclusioni}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Documenti Tab */}
        <TabsContent value="documenti" className="mt-6">
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
                <Label>Origine</Label>
                <Select>
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
                <Label>Gravità</Label>
                <Select>
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
              <Label>Descrizione</Label>
              <Textarea placeholder="Descrivi la non conformità..." />
            </div>
            <div>
              <Label>Cantiere (opzionale)</Label>
              <Select>
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
            <Button onClick={() => {
              toast({ title: 'Non Conformità registrata' });
              setShowNewNCDialog(false);
            }}>Crea NC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
