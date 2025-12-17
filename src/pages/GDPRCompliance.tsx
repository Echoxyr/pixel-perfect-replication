import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import {
  ConsensoGDPR,
  RegistroTrattamento,
  AuditLog,
  RichiestaPortabilita,
  generateComplianceId
} from '@/types/compliance';
import { formatDateFull, generateId } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Shield,
  FileText,
  Users,
  Clock,
  Download,
  Plus,
  Eye,
  Check,
  X,
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';

export default function GDPRCompliance() {
  const { lavoratori, imprese } = useWorkHub();
  const { toast } = useToast();
  
  // Sample data - in production would come from backend
  const [consensi, setConsensi] = useState<ConsensoGDPR[]>([
    {
      id: '1',
      entityType: 'lavoratore',
      entityId: 'lav-1',
      tipoConsenso: 'trattamento_dati',
      acconsentito: true,
      dataConsenso: '2024-01-15',
      note: 'Consenso iniziale'
    }
  ]);
  
  const [registroTrattamenti, setRegistroTrattamenti] = useState<RegistroTrattamento[]>([
    {
      id: '1',
      finalita: 'Gestione rapporto di lavoro',
      categorieDati: ['Dati anagrafici', 'Dati di contatto', 'Dati professionali'],
      baseGiuridica: 'Esecuzione contratto',
      destinatari: ['INPS', 'INAIL', 'Agenzia delle Entrate'],
      trasferimentoEstero: false,
      termineCancellazione: '10 anni dalla cessazione rapporto',
      misureSicurezza: ['Crittografia', 'Backup', 'Controllo accessi'],
      responsabileTitolare: 'Responsabile HR',
      dataCreazione: '2024-01-01',
      dataUltimaModifica: '2024-01-01'
    }
  ]);
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      userId: 'user-1',
      userName: 'Mario Rossi',
      action: 'view',
      entityType: 'lavoratore',
      entityId: 'lav-1',
      entityName: 'Giuseppe Verdi',
      timestamp: new Date().toISOString(),
      details: 'Visualizzazione scheda lavoratore'
    }
  ]);
  
  const [richiestePortabilita, setRichiestePortabilita] = useState<RichiestaPortabilita[]>([]);
  
  const [showNewConsensoDialog, setShowNewConsensoDialog] = useState(false);
  const [showNewTrattamentoDialog, setShowNewTrattamentoDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => ({
    totaleConsensi: consensi.length,
    consensiAttivi: consensi.filter(c => c.acconsentito && !c.dataRevoca).length,
    trattamentiRegistrati: registroTrattamenti.length,
    richiesteInAttesa: richiestePortabilita.filter(r => r.stato !== 'completata').length,
    logUltimi30gg: auditLogs.filter(l => {
      const logDate = new Date(l.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return logDate >= thirtyDaysAgo;
    }).length
  }), [consensi, registroTrattamenti, richiestePortabilita, auditLogs]);

  const handleExportData = (entityId: string, entityType: 'lavoratore' | 'impresa') => {
    // Create export package
    const entity = entityType === 'lavoratore' 
      ? lavoratori.find(l => l.id === entityId)
      : imprese.find(i => i.id === entityId);
    
    if (!entity) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      entityType,
      data: entity,
      consensi: consensi.filter(c => c.entityId === entityId),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_gdpr_${entityType}_${entityId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Export completato', description: 'Dati esportati in formato JSON' });
  };

  const handleCreateRichiestaPortabilita = (entityId: string, entityType: 'lavoratore' | 'impresa') => {
    const entity = entityType === 'lavoratore'
      ? lavoratori.find(l => l.id === entityId)
      : imprese.find(i => i.id === entityId);
    
    const nome = entityType === 'lavoratore' 
      ? `${(entity as any)?.nome} ${(entity as any)?.cognome}`
      : (entity as any)?.ragioneSociale;

    const newRichiesta: RichiestaPortabilita = {
      id: generateId(),
      richiedenteId: entityId,
      richiedenteTipo: entityType,
      richiedenteNome: nome || 'N/A',
      dataRichiesta: new Date().toISOString().slice(0, 10),
      stato: 'ricevuta',
      formatoExport: 'json'
    };

    setRichiestePortabilita([...richiestePortabilita, newRichiesta]);
    toast({ title: 'Richiesta registrata', description: 'La richiesta di portabilità è stata registrata' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            GDPR & Privacy Compliance
          </h1>
          <p className="text-muted-foreground">Gestione consensi, registro trattamenti e audit log</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewTrattamentoDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo Trattamento
          </Button>
          <Button onClick={() => setShowNewConsensoDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Registra Consenso
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Consensi Attivi</span>
          </div>
          <p className="text-2xl font-bold">{stats.consensiAttivi}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Trattamenti</span>
          </div>
          <p className="text-2xl font-bold">{stats.trattamentiRegistrati}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-sm text-muted-foreground">Richieste Attive</span>
          </div>
          <p className="text-2xl font-bold">{stats.richiesteInAttesa}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Eye className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="text-sm text-muted-foreground">Log (30gg)</span>
          </div>
          <p className="text-2xl font-bold">{stats.logUltimi30gg}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm text-muted-foreground">Soggetti</span>
          </div>
          <p className="text-2xl font-bold">{lavoratori.length + imprese.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="consensi" className="w-full">
        <TabsList>
          <TabsTrigger value="consensi">Registro Consensi</TabsTrigger>
          <TabsTrigger value="trattamenti">Registro Trattamenti</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="portabilita">Richieste Portabilità</TabsTrigger>
        </TabsList>

        {/* Consensi Tab */}
        <TabsContent value="consensi" className="mt-6">
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Soggetto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tipo Consenso</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consensi.map(consenso => {
                  const entity = consenso.entityType === 'lavoratore'
                    ? lavoratori.find(l => l.id === consenso.entityId)
                    : imprese.find(i => i.id === consenso.entityId);
                  const nome = consenso.entityType === 'lavoratore'
                    ? `${(entity as any)?.nome || ''} ${(entity as any)?.cognome || ''}`
                    : (entity as any)?.ragioneSociale || 'N/A';

                  return (
                    <TableRow key={consenso.id}>
                      <TableCell className="font-medium">{nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {consenso.entityType === 'lavoratore' ? 'Lavoratore' : 'Impresa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {consenso.tipoConsenso === 'trattamento_dati' && 'Trattamento Dati'}
                        {consenso.tipoConsenso === 'comunicazione_terzi' && 'Comunicazione Terzi'}
                        {consenso.tipoConsenso === 'marketing' && 'Marketing'}
                        {consenso.tipoConsenso === 'profilazione' && 'Profilazione'}
                      </TableCell>
                      <TableCell>
                        {consenso.acconsentito && !consenso.dataRevoca ? (
                          <Badge className="bg-emerald-500/20 text-emerald-500">Attivo</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-500">Revocato</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDateFull(consenso.dataConsenso)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportData(consenso.entityId, consenso.entityType)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Trattamenti Tab */}
        <TabsContent value="trattamenti" className="mt-6">
          <div className="space-y-4">
            {registroTrattamenti.map(trattamento => (
              <div key={trattamento.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{trattamento.finalita}</h3>
                    <p className="text-sm text-muted-foreground">
                      Base giuridica: {trattamento.baseGiuridica}
                    </p>
                  </div>
                  <Badge variant="outline">{trattamento.responsabileTitolare}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Categorie dati</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {trattamento.categorieDati.map((cat, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Destinatari</p>
                    <p className="font-medium">{trattamento.destinatari.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trasferimento estero</p>
                    <p className="font-medium">{trattamento.trasferimentoEstero ? 'Sì' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Termine cancellazione</p>
                    <p className="font-medium">{trattamento.termineCancellazione}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Misure di sicurezza: {trattamento.misureSicurezza.join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cerca nei log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Aggiorna
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Azione</TableHead>
                  <TableHead>Entità</TableHead>
                  <TableHead>Dettagli</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs
                  .filter(log => 
                    !searchQuery || 
                    log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.entityName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString('it-IT')}
                      </TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          log.action === 'delete' && 'bg-red-500/10 text-red-500',
                          log.action === 'create' && 'bg-emerald-500/10 text-emerald-500',
                          log.action === 'update' && 'bg-blue-500/10 text-blue-500',
                          log.action === 'export' && 'bg-amber-500/10 text-amber-500'
                        )}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{log.entityType}:</span> {log.entityName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Portabilità Tab */}
        <TabsContent value="portabilita" className="mt-6">
          <div className="space-y-4">
            {richiestePortabilita.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessuna richiesta di portabilità</p>
              </div>
            ) : (
              richiestePortabilita.map(richiesta => (
                <div key={richiesta.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{richiesta.richiedenteNome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Richiesta del {formatDateFull(richiesta.dataRichiesta)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        richiesta.stato === 'completata' && 'bg-emerald-500/20 text-emerald-500',
                        richiesta.stato === 'in_elaborazione' && 'bg-blue-500/20 text-blue-500',
                        richiesta.stato === 'ricevuta' && 'bg-amber-500/20 text-amber-500',
                        richiesta.stato === 'rifiutata' && 'bg-red-500/20 text-red-500'
                      )}>
                        {richiesta.stato}
                      </Badge>
                      {richiesta.stato !== 'completata' && (
                        <Button
                          size="sm"
                          onClick={() => handleExportData(richiesta.richiedenteId, richiesta.richiedenteTipo)}
                        >
                          Esporta Dati
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Consenso Dialog */}
      <Dialog open={showNewConsensoDialog} onOpenChange={setShowNewConsensoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registra Consenso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Tipo Soggetto</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lavoratore">Lavoratore</SelectItem>
                  <SelectItem value="impresa">Impresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo Consenso</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo consenso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trattamento_dati">Trattamento Dati</SelectItem>
                  <SelectItem value="comunicazione_terzi">Comunicazione a Terzi</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="profilazione">Profilazione</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Consenso Accordato</Label>
              <Switch />
            </div>
            <div>
              <Label>Note</Label>
              <Textarea placeholder="Note aggiuntive..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConsensoDialog(false)}>Annulla</Button>
            <Button onClick={() => {
              toast({ title: 'Consenso registrato' });
              setShowNewConsensoDialog(false);
            }}>Registra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
