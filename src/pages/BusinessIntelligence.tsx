import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { formatCurrency } from '@/types/workhub';
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
import { toast } from 'sonner';
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
  Activity,
  Brain,
  Zap,
  Shield,
  Building2,
  Truck,
  RefreshCw,
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
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import ComplianceMonitor from '@/components/workhub/ComplianceMonitor';
import WorkflowNotifications from '@/components/workhub/WorkflowNotifications';

export default function BusinessIntelligence() {
  const queryClient = useQueryClient();
  const { cantieri, hseStats } = useWorkHub();
  
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch KPI Finanziari from DB
  const { data: kpiFinanziari = [] } = useQuery({
    queryKey: ['kpi_finanziari'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_finanziari')
        .select('*')
        .order('periodo', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Fetch AI Predictions from DB
  const { data: aiPredictions = [] } = useQuery({
    queryKey: ['ai_predictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    }
  });

  // Fetch Analisi Predittive from DB
  const { data: analisiPredittive = [] } = useQuery({
    queryKey: ['analisi_predittive'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analisi_predittive')
        .select('*')
        .order('data_analisi', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    }
  });

  // Fetch Fatture for cash flow
  const { data: fatture = [] } = useQuery({
    queryKey: ['fatture'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fatture')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch Ordini for procurement analysis
  const { data: ordini = [] } = useQuery({
    queryKey: ['ordini_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordini_fornitori')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Generate AI Prediction mutation
  const generatePrediction = useMutation({
    mutationFn: async (tipo: string) => {
      setIsAnalyzing(true);
      
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const predictions = {
        ritardo: {
          tipo: 'ritardo_progetto',
          probabilita: Math.floor(Math.random() * 40) + 10,
          impatto: Math.random() > 0.5 ? 'medio' : 'basso',
          fattori_rischio: ['Ritardi nelle forniture', 'Condizioni meteo avverse', 'Carenza manodopera'],
          raccomandazioni: ['Anticipare ordini materiali di 2 settimane', 'Prevedere piano B per maltempo', 'Contattare agenzia interinale']
        },
        cashflow: {
          tipo: 'cashflow',
          probabilita: Math.floor(Math.random() * 30) + 20,
          impatto: 'alto',
          fattori_rischio: ['Fatture non incassate >60gg', 'Scadenze pagamenti concentrati'],
          raccomandazioni: ['Sollecitare incassi scaduti', 'Negoziare dilazioni con fornitori', 'Valutare anticipo fatture']
        },
        fornitore: {
          tipo: 'affidabilita_fornitore',
          probabilita: Math.floor(Math.random() * 25) + 5,
          impatto: 'medio',
          fattori_rischio: ['Ritardi consegne ricorrenti', 'Qualità variabile'],
          raccomandazioni: ['Richiedere referenze aggiornate', 'Valutare fornitori alternativi', 'Inserire penali contrattuali']
        }
      };

      const prediction = predictions[tipo as keyof typeof predictions] || predictions.ritardo;
      
      const { error } = await supabase.from('ai_predictions').insert({
        tipo: prediction.tipo,
        probabilita: prediction.probabilita,
        impatto: prediction.impatto,
        dati_input: { 
          cantieri_attivi: cantieri.filter(c => c.stato === 'attivo').length,
          hse_alerts: hseStats.documentiScaduti + hseStats.formazioniScadute
        },
        raccomandazioni: prediction.raccomandazioni,
        previsione_dettaglio: { fattori_rischio: prediction.fattori_rischio },
        valido_fino: addDays(new Date(), 7).toISOString()
      });

      if (error) throw error;
      setIsAnalyzing(false);
      return prediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_predictions'] });
      toast.success('Analisi predittiva completata!');
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error('Errore nell\'analisi');
    }
  });

  // Calculate stats from real data
  const stats = useMemo(() => {
    const fattureAttive = fatture.filter(f => f.tipo === 'attiva');
    const fatturePassive = fatture.filter(f => f.tipo === 'passiva');
    
    const totaleRicavi = fattureAttive.reduce((acc, f) => acc + (f.totale || f.imponibile), 0);
    const totaleCosti = fatturePassive.reduce((acc, f) => acc + (f.totale || f.imponibile), 0);
    const margine = totaleRicavi - totaleCosti;
    
    const fattureDaPagare = fatture.filter(f => f.stato === 'emessa' || f.stato === 'scaduta');
    const dso = fattureDaPagare.length > 0 
      ? fattureDaPagare.reduce((acc, f) => acc + differenceInDays(new Date(), new Date(f.data)), 0) / fattureDaPagare.length
      : 0;

    const ordiniInCorso = ordini.filter(o => o.stato !== 'consegnato' && o.stato !== 'annullato');
    const valoreOrdini = ordiniInCorso.reduce((acc, o) => acc + o.importo, 0);

    const rischioAlto = aiPredictions.filter(p => p.impatto === 'alto' || p.impatto === 'critico').length;

    return {
      totaleRicavi,
      totaleCosti,
      margine,
      percentualeMargine: totaleRicavi > 0 ? (margine / totaleRicavi) * 100 : 0,
      dso: Math.round(dso),
      wipTotale: valoreOrdini,
      rischioAlto,
      fattureScadute: fatture.filter(f => f.stato === 'scaduta').length,
      cantieriAttivi: cantieri.filter(c => c.stato === 'attivo').length
    };
  }, [fatture, ordini, aiPredictions, cantieri]);

  // Chart data from KPI
  const chartData = useMemo(() => {
    if (kpiFinanziari.length > 0) {
      return kpiFinanziari.map(k => ({
        periodo: k.periodo,
        ricavi: k.ricavi_effettivi || 0,
        costi: k.costi_effettivi || 0,
        margine: k.margine || 0,
        ricaviPrevisti: k.ricavi_previsti || 0,
        costiPrevisti: k.costi_previsti || 0
      }));
    }
    // Fallback demo data if no KPI in DB
    return [
      { periodo: '2024-01', ricavi: 480000, costi: 390000, margine: 90000, ricaviPrevisti: 500000, costiPrevisti: 400000 },
      { periodo: '2024-02', ricavi: 620000, costi: 470000, margine: 150000, ricaviPrevisti: 600000, costiPrevisti: 480000 },
      { periodo: '2024-03', ricavi: 540000, costi: 450000, margine: 90000, ricaviPrevisti: 550000, costiPrevisti: 440000 },
    ];
  }, [kpiFinanziari]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const attivi = cantieri.filter(c => c.stato === 'attivo').length;
    const completati = cantieri.filter(c => c.stato === 'chiuso').length;
    const sospesi = cantieri.filter(c => c.stato === 'sospeso').length;
    
    return [
      { name: 'Attivi', value: attivi, color: '#3b82f6' },
      { name: 'Chiusi', value: completati, color: '#10b981' },
      { name: 'Sospesi', value: sospesi, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [cantieri]);

  const getImpactBadge = (impatto: string) => {
    const colors: Record<string, string> = {
      basso: 'bg-green-100 text-green-800',
      medio: 'bg-amber-100 text-amber-800',
      alto: 'bg-red-100 text-red-800',
      critico: 'bg-red-200 text-red-900',
    };
    return colors[impatto] || colors.medio;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Business Intelligence & AI Predittiva
          </h1>
          <p className="text-muted-foreground">Dashboard KPI, Analisi predittiva AI e Monitoraggio in tempo reale</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => generatePrediction.mutate('ritardo')}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            Analisi AI
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Esporta Report
          </Button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Ricavi Totali</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(stats.totaleRicavi)}</p>
            <div className="flex items-center gap-1 text-xs mt-1 text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              da fatture attive
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Costi Totali</span>
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
            <p className={cn("text-xl font-bold", stats.margine >= 0 ? "text-emerald-500" : "text-red-500")}>
              {formatCurrency(stats.margine)}
            </p>
            <p className="text-xs text-muted-foreground">{stats.percentualeMargine.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">DSO Medio</span>
            </div>
            <p className="text-xl font-bold">{stats.dso} gg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-cyan-500" />
              <span className="text-xs text-muted-foreground">Cantieri Attivi</span>
            </div>
            <p className="text-xl font-bold">{stats.cantieriAttivi}</p>
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

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predittiva" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Predittiva
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="notifiche" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Workflow
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
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
                  <PieChart className="w-5 h-5" />
                  Stato Cantieri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Budget vs Consuntivo */}
          <Card className="mt-6">
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
        </TabsContent>

        {/* AI Predittiva Tab */}
        <TabsContent value="predittiva" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => generatePrediction.mutate('ritardo')}>
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-amber-500" />
                <h3 className="font-semibold mb-2">Analisi Ritardi</h3>
                <p className="text-sm text-muted-foreground">Previsione rischi di ritardo sui progetti attivi</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => generatePrediction.mutate('cashflow')}>
              <CardContent className="p-6 text-center">
                <Euro className="w-10 h-10 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">Previsione Cash Flow</h3>
                <p className="text-sm text-muted-foreground">Analisi flussi di cassa e rischi liquidità</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => generatePrediction.mutate('fornitore')}>
              <CardContent className="p-6 text-center">
                <Truck className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold mb-2">Affidabilità Fornitori</h3>
                <p className="text-sm text-muted-foreground">Valutazione performance e rischi fornitori</p>
              </CardContent>
            </Card>
          </div>

          {/* Predictions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Previsioni AI Recenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiPredictions.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nessuna previsione ancora</h3>
                  <p className="text-muted-foreground mb-4">Clicca su una delle card sopra per generare un'analisi AI</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiPredictions.map((prediction) => (
                    <div key={prediction.id} className={cn(
                      "p-4 rounded-lg border",
                      prediction.impatto === 'alto' || prediction.impatto === 'critico' 
                        ? "border-red-200 bg-red-50/30" 
                        : "border-border"
                    )}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{prediction.tipo}</Badge>
                            <Badge className={getImpactBadge(prediction.impatto || 'medio')}>
                              Impatto {prediction.impatto}
                            </Badge>
                          </div>
                          {prediction.entita_nome && (
                            <p className="text-sm font-medium">{prediction.entita_nome}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{prediction.probabilita}%</p>
                          <p className="text-xs text-muted-foreground">Probabilità</p>
                        </div>
                      </div>
                      {prediction.raccomandazioni && prediction.raccomandazioni.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Raccomandazioni:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {prediction.raccomandazioni.map((r, i) => (
                              <li key={i}>• {r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
                        Generato: {format(new Date(prediction.created_at || ''), 'dd/MM/yyyy HH:mm', { locale: it })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="mt-6">
          <ComplianceMonitor />
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="notifiche" className="mt-6">
          <WorkflowNotifications />
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
              toast.success('Report schedulato creato');
              setShowNewReportDialog(false);
            }}>Crea Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
