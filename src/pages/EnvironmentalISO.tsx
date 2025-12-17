import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import {
  RegistroRifiuti,
  FIR,
  CarbonFootprint,
  ChecklistAmbientale,
  CER_COMUNI_EDILIZIA,
  generateComplianceId
} from '@/types/compliance';
import { formatDateFull, formatCurrency, generateId } from '@/types/workhub';
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
  Leaf,
  Trash2,
  FileText,
  CloudRain,
  ClipboardCheck,
  Plus,
  Download,
  TrendingDown,
  Recycle,
  Factory,
  BarChart3
} from 'lucide-react';

export default function EnvironmentalISO() {
  const { cantieri } = useWorkHub();
  const { toast } = useToast();
  
  const [registroRifiuti, setRegistroRifiuti] = useState<RegistroRifiuti[]>([
    {
      id: '1',
      cantiereId: cantieri[0]?.id || '',
      dataRegistrazione: '2024-03-15',
      codiceCER: '17 01 07',
      descrizioneRifiuto: 'Miscugli di cemento, mattoni, mattonelle e ceramiche',
      statoFisico: 'solido',
      caratteristichePericolo: [],
      quantitaKg: 5000,
      destinazione: 'recupero',
      trasportatoreId: 'trasp-1',
      trasportatoreRagioneSociale: 'Trasporti Eco Srl',
      destinatarioId: 'dest-1',
      destinatarioRagioneSociale: 'Impianto Recupero SpA',
      firNumero: 'FIR-2024-001',
      firData: '2024-03-15',
      mudInviato: false
    }
  ]);

  const [fir, setFir] = useState<FIR[]>([
    {
      id: '1',
      numero: 'FIR-2024-001',
      data: '2024-03-15',
      registroRifiutiId: '1',
      produttoreRagioneSociale: 'Costruzioni ABC Srl',
      produttoreCF: '12345678901',
      trasportatoreRagioneSociale: 'Trasporti Eco Srl',
      trasportatoreAlboNumero: 'MI-12345',
      destinatarioRagioneSociale: 'Impianto Recupero SpA',
      destinatarioAutorizzazione: 'AIA-2020-001',
      codiceCER: '17 01 07',
      quantitaKg: 5000,
      stato: 'confermato',
      dataConferimento: '2024-03-16',
      allegatiUrl: []
    }
  ]);

  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint[]>([
    {
      id: '1',
      cantiereId: cantieri[0]?.id || '',
      periodo: '2024-03',
      scope1: 15.5,
      scope2: 8.2,
      scope3: 22.3,
      totaleEmissioni: 46.0,
      unitaMisura: 'tCO2e',
      dettaglioScope1: [
        { fonte: 'Gasolio mezzi', quantita: 500, fattoreEmissione: 2.68, emissioni: 13.4 },
        { fonte: 'Gas generatori', quantita: 100, fattoreEmissione: 2.1, emissioni: 2.1 }
      ],
      dettaglioScope2: [
        { fonte: 'Energia elettrica', consumo: 20000, fattoreEmissione: 0.41, emissioni: 8.2 }
      ],
      azioniRiduzione: ['Utilizzo mezzi elettrici', 'Pannelli fotovoltaici cantiere'],
      target: 40.0,
      dataCalcolo: '2024-04-01'
    }
  ]);

  const [checklists, setChecklists] = useState<ChecklistAmbientale[]>([
    {
      id: '1',
      cantiereId: cantieri[0]?.id || '',
      dataCompilazione: '2024-03-20',
      compilatore: 'Resp. Ambiente',
      voci: [
        { categoria: 'rifiuti', descrizione: 'Corretta separazione rifiuti', conforme: true },
        { categoria: 'polveri', descrizione: 'Sistemi abbattimento polveri attivi', conforme: true },
        { categoria: 'rumore', descrizione: 'Rispetto limiti rumore', conforme: true },
        { categoria: 'acque', descrizione: 'Gestione acque reflue', conforme: false, azioneCorrettiva: 'Installare vasca di sedimentazione' }
      ],
      esito: 'con_osservazioni',
      allegatiUrl: []
    }
  ]);

  const [showNewRifiutoDialog, setShowNewRifiutoDialog] = useState(false);
  const [showNewChecklistDialog, setShowNewChecklistDialog] = useState(false);

  const stats = useMemo(() => {
    const totaleRifiutiKg = registroRifiuti.reduce((acc, r) => acc + r.quantitaKg, 0);
    const rifiutiRecupero = registroRifiuti.filter(r => r.destinazione === 'recupero').reduce((acc, r) => acc + r.quantitaKg, 0);
    const percentualeRecupero = totaleRifiutiKg > 0 ? (rifiutiRecupero / totaleRifiutiKg) * 100 : 0;
    
    const ultimoCF = carbonFootprint[carbonFootprint.length - 1];
    const emissioniMedie = carbonFootprint.length > 0 
      ? carbonFootprint.reduce((acc, cf) => acc + cf.totaleEmissioni, 0) / carbonFootprint.length
      : 0;

    return {
      totaleRifiutiKg,
      percentualeRecupero,
      firInCorso: fir.filter(f => f.stato !== 'confermato').length,
      emissioniUltimoMese: ultimoCF?.totaleEmissioni || 0,
      targetEmissioni: ultimoCF?.target || 0,
      checklistConformi: checklists.filter(c => c.esito === 'conforme').length,
      checklistTotali: checklists.length
    };
  }, [registroRifiuti, fir, carbonFootprint, checklists]);

  const getCantiereName = (id: string) => {
    const c = cantieri.find(c => c.id === id);
    return c ? `${c.codiceCommessa} - ${c.nome}` : '-';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-500" />
            Certificazioni Ambientali ISO 14001/EMAS
          </h1>
          <p className="text-muted-foreground">Registro rifiuti, FIR, Carbon Footprint e Checklist ambientali</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewChecklistDialog(true)} className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Nuova Checklist
          </Button>
          <Button onClick={() => setShowNewRifiutoDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Registra Rifiuto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Rifiuti Totali</span>
          </div>
          <p className="text-xl font-bold">{(stats.totaleRifiutiKg / 1000).toFixed(1)} t</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Recycle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">% Recupero</span>
          </div>
          <p className="text-xl font-bold text-emerald-500">{stats.percentualeRecupero.toFixed(0)}%</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">FIR in Corso</span>
          </div>
          <p className="text-xl font-bold">{stats.firInCorso}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Factory className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-muted-foreground">Emissioni Mese</span>
          </div>
          <p className="text-xl font-bold">{stats.emissioniUltimoMese.toFixed(1)} tCO2e</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Target</span>
          </div>
          <p className="text-xl font-bold">{stats.targetEmissioni.toFixed(1)} tCO2e</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Conformità</span>
          </div>
          <p className="text-xl font-bold">{stats.checklistConformi}/{stats.checklistTotali}</p>
        </div>
      </div>

      {/* Carbon Footprint Chart */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Carbon Footprint - Dettaglio Emissioni
        </h3>
        {carbonFootprint.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  Scope 1 (Dirette)
                </span>
                <span className="font-medium">{carbonFootprint[0].scope1.toFixed(1)} tCO2e</span>
              </div>
              <Progress value={(carbonFootprint[0].scope1 / carbonFootprint[0].totaleEmissioni) * 100} className="h-2 bg-red-500/20" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Scope 2 (Energia)
                </span>
                <span className="font-medium">{carbonFootprint[0].scope2.toFixed(1)} tCO2e</span>
              </div>
              <Progress value={(carbonFootprint[0].scope2 / carbonFootprint[0].totaleEmissioni) * 100} className="h-2 bg-amber-500/20" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Scope 3 (Indirette)
                </span>
                <span className="font-medium">{carbonFootprint[0].scope3.toFixed(1)} tCO2e</span>
              </div>
              <Progress value={(carbonFootprint[0].scope3 / carbonFootprint[0].totaleEmissioni) * 100} className="h-2 bg-blue-500/20" />
            </div>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Totale vs Target</p>
              <p className="text-lg font-bold">
                {stats.emissioniUltimoMese.toFixed(1)} / {stats.targetEmissioni.toFixed(1)} tCO2e
              </p>
            </div>
            <Badge className={cn(
              stats.emissioniUltimoMese <= stats.targetEmissioni 
                ? 'bg-emerald-500/20 text-emerald-500' 
                : 'bg-red-500/20 text-red-500'
            )}>
              {stats.emissioniUltimoMese <= stats.targetEmissioni ? 'In Target' : 'Sopra Target'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rifiuti" className="w-full">
        <TabsList>
          <TabsTrigger value="rifiuti">Registro Rifiuti</TabsTrigger>
          <TabsTrigger value="fir">FIR</TabsTrigger>
          <TabsTrigger value="carbon">Carbon Footprint</TabsTrigger>
          <TabsTrigger value="checklist">Checklist Ambientali</TabsTrigger>
        </TabsList>

        {/* Rifiuti Tab */}
        <TabsContent value="rifiuti" className="mt-6">
          <div className="space-y-4">
            {registroRifiuti.map(r => (
              <div key={r.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-3 rounded-lg',
                      r.destinazione === 'recupero' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                    )}>
                      {r.destinazione === 'recupero' ? (
                        <Recycle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm">{r.codiceCER}</span>
                        <Badge variant="outline">{r.statoFisico}</Badge>
                        <Badge className={cn(
                          r.destinazione === 'recupero' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                        )}>
                          {r.destinazione}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{r.descrizioneRifiuto}</h3>
                      <p className="text-sm text-muted-foreground">{getCantiereName(r.cantiereId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{(r.quantitaKg / 1000).toFixed(2)} t</p>
                    <p className="text-sm text-muted-foreground">{formatDateFull(r.dataRegistrazione)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border text-sm">
                  <div>
                    <p className="text-muted-foreground">Trasportatore</p>
                    <p className="font-medium">{r.trasportatoreRagioneSociale}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Destinatario</p>
                    <p className="font-medium">{r.destinatarioRagioneSociale}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">FIR</p>
                    <p className="font-medium">{r.firNumero}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* FIR Tab */}
        <TabsContent value="fir" className="mt-6">
          <div className="space-y-4">
            {fir.map(f => (
              <div key={f.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold">{f.numero}</span>
                      <Badge className={cn(
                        f.stato === 'confermato' && 'bg-emerald-500/20 text-emerald-500',
                        f.stato === 'in_transito' && 'bg-blue-500/20 text-blue-500',
                        f.stato === 'emesso' && 'bg-amber-500/20 text-amber-500'
                      )}>
                        {f.stato.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      CER {f.codiceCER} | {(f.quantitaKg / 1000).toFixed(2)} t | {formatDateFull(f.data)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border text-sm">
                  <div>
                    <p className="text-muted-foreground">Produttore</p>
                    <p className="font-medium">{f.produttoreRagioneSociale}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trasportatore</p>
                    <p className="font-medium">{f.trasportatoreRagioneSociale}</p>
                    <p className="text-xs text-muted-foreground">Albo: {f.trasportatoreAlboNumero}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Destinatario</p>
                    <p className="font-medium">{f.destinatarioRagioneSociale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Carbon Footprint Tab */}
        <TabsContent value="carbon" className="mt-6">
          <div className="space-y-4">
            {carbonFootprint.map(cf => (
              <div key={cf.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{getCantiereName(cf.cantiereId)}</h3>
                    <p className="text-sm text-muted-foreground">Periodo: {cf.periodo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{cf.totaleEmissioni.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">{cf.unitaMisura}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {cf.dettaglioScope1.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-red-500/5 rounded-lg">
                      <span className="text-muted-foreground">{d.fonte}</span>
                      <span className="font-medium">{d.emissioni.toFixed(2)} tCO2e</span>
                    </div>
                  ))}
                  {cf.dettaglioScope2.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-amber-500/5 rounded-lg">
                      <span className="text-muted-foreground">{d.fonte}</span>
                      <span className="font-medium">{d.emissioni.toFixed(2)} tCO2e</span>
                    </div>
                  ))}
                </div>
                {cf.azioniRiduzione.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Azioni di riduzione:</p>
                    <div className="flex flex-wrap gap-2">
                      {cf.azioniRiduzione.map((a, i) => (
                        <Badge key={i} variant="outline" className="bg-emerald-500/10">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="mt-6">
          <div className="space-y-4">
            {checklists.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{getCantiereName(c.cantiereId)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDateFull(c.dataCompilazione)} - {c.compilatore}
                    </p>
                  </div>
                  <Badge className={cn(
                    c.esito === 'conforme' && 'bg-emerald-500/20 text-emerald-500',
                    c.esito === 'con_osservazioni' && 'bg-amber-500/20 text-amber-500',
                    c.esito === 'non_conforme' && 'bg-red-500/20 text-red-500'
                  )}>
                    {c.esito.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {c.voci.map((v, i) => (
                    <div key={i} className={cn(
                      'flex items-center justify-between p-2 rounded-lg',
                      v.conforme ? 'bg-emerald-500/5' : 'bg-red-500/5'
                    )}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{v.categoria}</Badge>
                        <span className="text-sm">{v.descrizione}</span>
                      </div>
                      {v.conforme ? (
                        <Badge className="bg-emerald-500/20 text-emerald-500">Conforme</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-500">Non Conforme</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Rifiuto Dialog */}
      <Dialog open={showNewRifiutoDialog} onOpenChange={setShowNewRifiutoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registra Rifiuto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Cantiere</Label>
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
            <div>
              <Label>Codice CER</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona codice CER" />
                </SelectTrigger>
                <SelectContent>
                  {CER_COMUNI_EDILIZIA.map(cer => (
                    <SelectItem key={cer.codice} value={cer.codice}>
                      {cer.codice} - {cer.descrizione}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantità (kg)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <Label>Destinazione</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recupero">Recupero</SelectItem>
                    <SelectItem value="smaltimento">Smaltimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Trasportatore</Label>
              <Input placeholder="Ragione sociale trasportatore" />
            </div>
            <div>
              <Label>Destinatario</Label>
              <Input placeholder="Ragione sociale impianto" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRifiutoDialog(false)}>Annulla</Button>
            <Button onClick={() => {
              toast({ title: 'Rifiuto registrato' });
              setShowNewRifiutoDialog(false);
            }}>Registra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
