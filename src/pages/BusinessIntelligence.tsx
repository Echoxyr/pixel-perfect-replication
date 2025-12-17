import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import {
  KPIFinanziario,
  ReportSchedulato,
  AnalisiPredittiva
} from '@/types/compliance';
import { formatDateFull, formatCurrency, generateId } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Euro,
  Calendar,
  FileText,
  Download,
  Plus,
  Clock,
  AlertTriangle,
  Target,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function BusinessIntelligence() {
  const { cantieri, sal, contratti } = useWorkHub();
  const { toast } = useToast();
  
  const [kpiFinanziari, setKpiFinanziari] = useState<KPIFinanziario[]>([
    { id: '1', periodo: '2024-01', ricaviPrevisti: 500000, ricaviEffettivi: 480000, costiPrevisti: 400000, costiEffettivi: 390000, margine: 90000, marginePrevisto: 100000, cashFlowOperativo: 50000, dso: 45, wip: 150000 },
    { id: '2', periodo: '2024-02', ricaviPrevisti: 600000, ricaviEffettivi: 620000, costiPrevisti: 480000, costiEffettivi: 470000, margine: 150000, marginePrevisto: 120000, cashFlowOperativo: 80000, dso: 42, wip: 180000 },
    { id: '3', periodo: '2024-03', ricaviPrevisti: 550000, ricaviEffettivi: 540000, costiPrevisti: 440000, costiEffettivi: 450000, margine: 90000, marginePrevisto: 110000, cashFlowOperativo: 40000, dso: 48, wip: 200000 },
  ]);

  const [reportSchedulati, setReportSchedulati] = useState<ReportSchedulato[]>([
    { id: '1', nome: 'Report Executive Mensile', descrizione: 'KPI finanziari e operativi', tipoReport: 'executive', templateId: 'exec-1', filtri: {}, formato: 'pdf', frequenza: 'mensile', destinatari: ['direzione@azienda.it'], prossimaEsecuzione: '2024-04-01', attivo: true },
    { id: '2', nome: 'Report HSE Settimanale', descrizione: 'Stato sicurezza cantieri', tipoReport: 'hse', templateId: 'hse-1', filtri: {}, formato: 'pdf', frequenza: 'settimanale', destinatari: ['rspp@azienda.it'], prossimaEsecuzione: '2024-03-25', attivo: true },
  ]);

  const [analisiPredittive, setAnalisiPredittive] = useState<AnalisiPredittiva[]>([
    { id: '1', cantiereId: cantieri[0]?.id || '', dataAnalisi: '2024-03-20', tipoPrevisione: 'ritardo', probabilita: 35, impatto: 'medio', fattoriRischio: ['Ritardi forniture', 'Condizioni meteo'], raccomandazioni: ['Anticipare ordini materiali', 'Prevedere buffer temporale'], azioniMitigazione: ['Contattare fornitori alternativi'] },
    { id: '2', cantiereId: cantieri[0]?.id || '', dataAnalisi: '2024-03-20', tipoPrevisione: 'sovracosto', probabilita: 20, impatto: 'basso', fattoriRischio: ['Variazione prezzi materie prime'], raccomandazioni: ['Bloccare prezzi con contratti'], azioniMitigazione: [] },
  ]);

  const [showNewReportDialog, setShowNewReportDialog] = useState(false);

  const chartData = useMemo(() => {
    return kpiFinanziari.map(k => ({
      periodo: k.periodo,
      ricavi: k.ricaviEffettivi,
      costi: k.costiEffettivi,
      margine: k.margine,
      ricaviPrevisti: k.ricaviPrevisti,
      costiPrevisti: k.costiPrevisti
    }));
  }, [kpiFinanziari]);

  const stats = useMemo(() => {
    const ultimo = kpiFinanziari[kpiFinanziari.length - 1];
    const penultimo = kpiFinanziari[kpiFinanziari.length - 2];
    
    const totaleRicavi = kpiFinanziari.reduce((acc, k) => acc + k.ricaviEffettivi, 0);
    const totaleCosti = kpiFinanziari.reduce((acc, k) => acc + k.costiEffettivi, 0);
    const margineComplessivo = totaleRicavi - totaleCosti;
    const percentualeMargine = totaleRicavi > 0 ? (margineComplessivo / totaleRicavi) * 100 : 0;
    
    const varianzaRicavi = ultimo && penultimo 
      ? ((ultimo.ricaviEffettivi - penultimo.ricaviEffettivi) / penultimo.ricaviEffettivi) * 100 
      : 0;

    return {
      totaleRicavi,
      totaleCosti,
      margineComplessivo,
      percentualeMargine,
      varianzaRicavi,
      dsoMedio: kpiFinanziari.reduce((acc, k) => acc + k.dso, 0) / kpiFinanziari.length,
      wipTotale: ultimo?.wip || 0,
      rischioAlto: analisiPredittive.filter(a => a.impatto === 'alto' || a.impatto === 'critico').length
    };
  }, [kpiFinanziari, analisiPredittive]);

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
            <BarChart3 className="w-6 h-6 text-primary" />
            Business Intelligence & Reporting
          </h1>
          <p className="text-muted-foreground">Dashboard KPI, Report automatici e Analisi predittiva</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Esporta Report
          </Button>
          <Button onClick={() => setShowNewReportDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo Report
          </Button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Ricavi YTD</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(stats.totaleRicavi)}</p>
            <div className={cn(
              'flex items-center gap-1 text-xs mt-1',
              stats.varianzaRicavi >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {stats.varianzaRicavi >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(stats.varianzaRicavi).toFixed(1)}% vs mese prec.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Costi YTD</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(stats.totaleCosti)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Margine</span>
            </div>
            <p className="text-xl font-bold text-emerald-500">{formatCurrency(stats.margineComplessivo)}</p>
            <p className="text-xs text-muted-foreground">{stats.percentualeMargine.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">DSO Medio</span>
            </div>
            <p className="text-xl font-bold">{stats.dsoMedio.toFixed(0)} gg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">WIP</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(stats.wipTotale)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Rischi Alti</span>
            </div>
            <p className="text-xl font-bold text-red-500">{stats.rischioAlto}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Andamento Ricavi vs Costi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRicavi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCosti" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="periodo" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="ricavi" stroke="hsl(var(--primary))" fill="url(#colorRicavi)" name="Ricavi" />
                <Area type="monotone" dataKey="costi" stroke="hsl(var(--destructive))" fill="url(#colorCosti)" name="Costi" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Budget vs Consuntivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="periodo" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="ricaviPrevisti" fill="hsl(var(--primary) / 0.3)" name="Ricavi Previsti" />
                <Bar dataKey="ricavi" fill="hsl(var(--primary))" name="Ricavi Effettivi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kpi" className="w-full">
        <TabsList>
          <TabsTrigger value="kpi">KPI Dettaglio</TabsTrigger>
          <TabsTrigger value="report">Report Schedulati</TabsTrigger>
          <TabsTrigger value="predittiva">Analisi Predittiva</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark Cantieri</TabsTrigger>
        </TabsList>

        {/* KPI Tab */}
        <TabsContent value="kpi" className="mt-6">
          <div className="space-y-4">
            {kpiFinanziari.map(k => (
              <div key={k.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{k.periodo}</h3>
                      <p className="text-sm text-muted-foreground">Periodo di riferimento</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    k.margine >= k.marginePrevisto ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                  )}>
                    {k.margine >= k.marginePrevisto ? 'In Target' : 'Sotto Target'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ricavi</p>
                    <p className="font-semibold">{formatCurrency(k.ricaviEffettivi)}</p>
                    <p className="text-xs text-muted-foreground">vs {formatCurrency(k.ricaviPrevisti)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Costi</p>
                    <p className="font-semibold">{formatCurrency(k.costiEffettivi)}</p>
                    <p className="text-xs text-muted-foreground">vs {formatCurrency(k.costiPrevisti)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margine</p>
                    <p className="font-semibold text-emerald-500">{formatCurrency(k.margine)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">DSO</p>
                    <p className="font-semibold">{k.dso} giorni</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WIP</p>
                    <p className="font-semibold">{formatCurrency(k.wip)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="mt-6">
          <div className="space-y-4">
            {reportSchedulati.map(r => (
              <div key={r.id} className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{r.nome}</h3>
                      <Badge variant="outline">{r.frequenza}</Badge>
                      <Badge variant="outline">{r.formato.toUpperCase()}</Badge>
                      {r.attivo ? (
                        <Badge className="bg-emerald-500/20 text-emerald-500">Attivo</Badge>
                      ) : (
                        <Badge variant="outline">Disattivo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{r.descrizione}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prossima esecuzione: {formatDateFull(r.prossimaEsecuzione)} | 
                      Destinatari: {r.destinatari.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-4 h-4" />
                    Genera Ora
                  </Button>
                  <Button variant="outline" size="sm">Modifica</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Predittiva Tab */}
        <TabsContent value="predittiva" className="mt-6">
          <div className="space-y-4">
            {analisiPredittive.map(a => (
              <div key={a.id} className={cn(
                'p-4 rounded-xl border bg-card',
                a.impatto === 'critico' ? 'border-red-500/50' :
                a.impatto === 'alto' ? 'border-amber-500/50' :
                'border-border'
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{a.tipoPrevisione}</Badge>
                      <Badge className={cn(
                        a.impatto === 'critico' && 'bg-red-600/20 text-red-600',
                        a.impatto === 'alto' && 'bg-red-500/20 text-red-500',
                        a.impatto === 'medio' && 'bg-amber-500/20 text-amber-500',
                        a.impatto === 'basso' && 'bg-emerald-500/20 text-emerald-500'
                      )}>
                        Impatto {a.impatto}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{getCantiereName(a.cantiereId)}</h3>
                    <p className="text-sm text-muted-foreground">Analisi del {formatDateFull(a.dataAnalisi)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{a.probabilita}%</p>
                    <p className="text-xs text-muted-foreground">Probabilità</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Fattori di rischio:</p>
                    <div className="flex flex-wrap gap-1">
                      {a.fattoriRischio.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Raccomandazioni:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {a.raccomandazioni.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Azioni mitigazione:</p>
                    {a.azioniMitigazione.length > 0 ? (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {a.azioniMitigazione.map((m, i) => (
                          <li key={i}>• {m}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nessuna azione definita</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Benchmark Tab */}
        <TabsContent value="benchmark" className="mt-6">
          <div className="grid gap-4">
            {cantieri.slice(0, 5).map(c => {
              const cantiereContratti = contratti.filter(co => co.cantiereId === c.id);
              const cantiereSal = sal.filter(s => s.cantiereId === c.id);
              const importoTotale = cantiereContratti.reduce((acc, co) => acc + co.importoTotale, 0);
              const importoEseguito = cantiereSal.reduce((acc, s) => acc + s.importoLavoriEseguiti, 0);
              const percentuale = importoTotale > 0 ? (importoEseguito / importoTotale) * 100 : 0;

              return (
                <div key={c.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{c.codiceCommessa} - {c.nome}</h3>
                      <p className="text-sm text-muted-foreground">Budget: {formatCurrency(importoTotale)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{percentuale.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Avanzamento</p>
                    </div>
                  </div>
                  <Progress value={percentuale} className="h-2" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Eseguito: {formatCurrency(importoEseguito)}</span>
                    <span>Residuo: {formatCurrency(importoTotale - importoEseguito)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Report Dialog */}
      <Dialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo Report Schedulato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome Report</Label>
              <Input placeholder="Nome del report" />
            </div>
            <div>
              <Label>Tipo Report</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="finanziario">Finanziario</SelectItem>
                  <SelectItem value="operativo">Operativo</SelectItem>
                  <SelectItem value="hse">HSE</SelectItem>
                  <SelectItem value="qualita">Qualità</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequenza</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="giornaliero">Giornaliero</SelectItem>
                    <SelectItem value="settimanale">Settimanale</SelectItem>
                    <SelectItem value="mensile">Mensile</SelectItem>
                    <SelectItem value="trimestrale">Trimestrale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Formato</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Destinatari (email)</Label>
              <Input placeholder="email1@azienda.it, email2@azienda.it" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewReportDialog(false)}>Annulla</Button>
            <Button onClick={() => {
              toast({ title: 'Report schedulato creato' });
              setShowNewReportDialog(false);
            }}>Crea Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
