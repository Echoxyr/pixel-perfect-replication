import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { formatCurrency } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Users,
  HardHat,
  ClipboardList,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Layers,
  BarChart,
  Gauge,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
  PieChart as RechartsPie,
  Pie,
  Cell,
  ComposedChart,
  Line,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import ComplianceMonitor from '@/components/workhub/ComplianceMonitor';
import WorkflowNotifications from '@/components/workhub/WorkflowNotifications';

// Color palette for charts
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: 'hsl(var(--muted-foreground))',
};

export default function BusinessIntelligence() {
  const queryClient = useQueryClient();
  const { cantieri, imprese, lavoratori, hseStats } = useWorkHub();
  
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');
  const [periodoFiltro, setPeriodoFiltro] = useState('ytd');

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

  // Fetch Preventivi
  const { data: preventivi = [] } = useQuery({
    queryKey: ['preventivi_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preventivi_fornitori')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch Contratti
  const { data: contratti = [] } = useQuery({
    queryKey: ['contratti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contratti')
        .select('*')
        .order('data_inizio', { ascending: false });
      if (error) throw error;
      return data;
    }
  });


  // Calculate comprehensive stats from real data
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

    

    // Preventivi stats
    const preventiviInAttesa = preventivi.filter(p => p.stato === 'inviato').length;
    const preventiviApprovati = preventivi.filter(p => p.stato === 'accettato').length;
    const valorePreventivi = preventivi.filter(p => p.stato === 'inviato').reduce((acc, p) => acc + p.importo, 0);
    const tassoConversione = preventivi.length > 0 
      ? (preventiviApprovati / preventivi.length) * 100 
      : 0;

    // Contratti stats
    const contrattiAttivi = contratti.filter(c => c.stato === 'attivo').length;
    const valoreContratti = contratti.filter(c => c.stato === 'attivo').reduce((acc, c) => acc + (c.importo || 0), 0);

    // Cantieri stats
    const cantieriAttivi = cantieri.filter(c => c.stato === 'attivo').length;
    const cantieriChiusi = cantieri.filter(c => c.stato === 'chiuso').length;
    const cantieriSospesi = cantieri.filter(c => c.stato === 'sospeso').length;

    return {
      totaleRicavi,
      totaleCosti,
      margine,
      percentualeMargine: totaleRicavi > 0 ? (margine / totaleRicavi) * 100 : 0,
      dso: Math.round(dso),
      wipTotale: valoreOrdini,
      fattureScadute: fatture.filter(f => f.stato === 'scaduta').length,
      fattureInAttesa: fatture.filter(f => f.stato === 'emessa').length,
      cantieriAttivi,
      cantieriChiusi,
      cantieriSospesi,
      preventiviInAttesa,
      preventiviApprovati,
      valorePreventivi,
      tassoConversione,
      contrattiAttivi,
      valoreContratti,
      impreseCollaborate: imprese.length,
      lavoratoriTotali: lavoratori.length,
      hseAlerts: hseStats.documentiScaduti + hseStats.formazioniScadute + hseStats.visiteMedicheScadute,
    };
  }, [fatture, ordini, cantieri, preventivi, contratti, imprese, lavoratori, hseStats]);

  // Chart data
  const financialTrendData = useMemo(() => {
    if (kpiFinanziari.length > 0) {
      return kpiFinanziari.map(k => ({
        periodo: k.periodo,
        ricavi: k.ricavi_effettivi || 0,
        costi: k.costi_effettivi || 0,
        margine: k.margine || 0,
        ricaviPrevisti: k.ricavi_previsti || 0,
      }));
    }
    return [
      { periodo: 'Gen', ricavi: 480000, costi: 390000, margine: 90000, ricaviPrevisti: 500000 },
      { periodo: 'Feb', ricavi: 620000, costi: 470000, margine: 150000, ricaviPrevisti: 600000 },
      { periodo: 'Mar', ricavi: 540000, costi: 450000, margine: 90000, ricaviPrevisti: 550000 },
      { periodo: 'Apr', ricavi: 710000, costi: 520000, margine: 190000, ricaviPrevisti: 700000 },
      { periodo: 'Mag', ricavi: 680000, costi: 510000, margine: 170000, ricaviPrevisti: 650000 },
      { periodo: 'Giu', ricavi: 750000, costi: 560000, margine: 190000, ricaviPrevisti: 720000 },
    ];
  }, [kpiFinanziari]);

  // Status distribution for pie chart
  const cantieriStatusData = useMemo(() => [
    { name: 'Attivi', value: stats.cantieriAttivi, color: CHART_COLORS.info },
    { name: 'Chiusi', value: stats.cantieriChiusi, color: CHART_COLORS.success },
    { name: 'Sospesi', value: stats.cantieriSospesi, color: CHART_COLORS.danger },
  ].filter(d => d.value > 0), [stats]);

  // Performance gauges data
  const performanceData = useMemo(() => [
    { name: 'Margine', value: Math.min(stats.percentualeMargine, 100), fill: CHART_COLORS.success },
    { name: 'Conversione', value: stats.tassoConversione, fill: CHART_COLORS.info },
    { name: 'HSE Score', value: Math.max(0, 100 - (stats.hseAlerts * 5)), fill: stats.hseAlerts > 5 ? CHART_COLORS.danger : CHART_COLORS.success },
  ], [stats]);

  // Cash flow projection
  const cashFlowData = useMemo(() => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'];
    return months.map((m, i) => ({
      mese: m,
      entrate: Math.floor(Math.random() * 300000) + 400000,
      uscite: Math.floor(Math.random() * 250000) + 350000,
      saldo: Math.floor(Math.random() * 100000) + 50000,
    }));
  }, []);

  const getImpactBadge = (impatto: string) => {
    const colors: Record<string, string> = {
      basso: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      medio: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      alto: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      critico: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
    };
    return colors[impatto] || colors.medio;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="truncate">Business Intelligence</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Centro di controllo direzionale per analisi, KPI e previsioni aziendali
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Mese</SelectItem>
              <SelectItem value="qtd">Trimestre</SelectItem>
              <SelectItem value="ytd">Anno</SelectItem>
              <SelectItem value="all">Tutto</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Esporta
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max h-auto gap-1 p-1">
            <TabsTrigger value="executive" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Executive Summary
            </TabsTrigger>
            <TabsTrigger value="finanziario" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Euro className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Finanziario
            </TabsTrigger>
            <TabsTrigger value="operativo" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Operativo
            </TabsTrigger>
            <TabsTrigger value="commerciale" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Commerciale
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Compliance
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* EXECUTIVE SUMMARY TAB */}
        <TabsContent value="executive" className="mt-6 space-y-6">
          {/* Top-Level KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Ricavi YTD</span>
                </div>
                <p className="text-lg sm:text-xl font-bold">{formatCurrency(stats.totaleRicavi)}</p>
                <div className="flex items-center gap-1 text-xs mt-1 text-emerald-500">
                  {getTrendIcon(8.5)}
                  +8.5% vs anno prec.
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Margine</span>
                </div>
                <p className={cn("text-lg sm:text-xl font-bold", stats.margine >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {stats.percentualeMargine.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.margine)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs text-muted-foreground">Cantieri Attivi</span>
                </div>
                <p className="text-lg sm:text-xl font-bold">{stats.cantieriAttivi}</p>
                <p className="text-xs text-muted-foreground">su {cantieri.length} totali</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Contratti Attivi</span>
                </div>
                <p className="text-lg sm:text-xl font-bold">{stats.contrattiAttivi}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.valoreContratti)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Organico</span>
                </div>
                <p className="text-lg sm:text-xl font-bold">{stats.lavoratoriTotali}</p>
                <p className="text-xs text-muted-foreground">{stats.impreseCollaborate} imprese</p>
              </CardContent>
            </Card>

            <Card className={cn(
              stats.hseAlerts > 0 ? "border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-900/10" : ""
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={cn("w-4 h-4", stats.hseAlerts > 0 ? "text-red-500" : "text-emerald-500")} />
                  <span className="text-xs text-muted-foreground">HSE Alert</span>
                </div>
                <p className={cn("text-lg sm:text-xl font-bold", stats.hseAlerts > 0 ? "text-red-500" : "text-emerald-500")}>
                  {stats.hseAlerts}
                </p>
                <p className="text-xs text-muted-foreground">scadenze da gestire</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Gauges & Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Indicators */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Indicatori Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.value.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={item.value} 
                        className={cn(
                          "h-2",
                          item.value >= 70 ? "[&>div]:bg-emerald-500" : 
                          item.value >= 40 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Trend */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="w-4 h-4" />
                  Trend Finanziario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={financialTrendData}>
                    <defs>
                      <linearGradient id="colorRicavi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMargine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="periodo" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="ricavi" stroke={CHART_COLORS.info} fill="url(#colorRicavi)" name="Ricavi" />
                    <Area type="monotone" dataKey="margine" stroke={CHART_COLORS.success} fill="url(#colorMargine)" name="Margine" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preventivi in attesa</p>
                    <p className="text-xl font-bold">{stats.preventiviInAttesa}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(stats.valorePreventivi)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Receipt className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fatture da incassare</p>
                    <p className="text-xl font-bold">{stats.fattureInAttesa}</p>
                    <p className="text-xs text-muted-foreground">DSO: {stats.dso} gg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasso conversione</p>
                    <p className="text-xl font-bold">{stats.tassoConversione.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">preventivi → ordini</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HSE Alert</p>
                    <p className="text-xl font-bold">{stats.hseAlerts}</p>
                    <p className="text-xs text-muted-foreground">scadenze critiche</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FINANZIARIO TAB */}
        <TabsContent value="finanziario" className="mt-6 space-y-6">
          {/* Financial KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Ricavi</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(stats.totaleRicavi)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Costi</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(stats.totaleCosti)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Margine Lordo</span>
                </div>
                <p className={cn("text-xl font-bold", stats.margine >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {formatCurrency(stats.margine)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">DSO Medio</span>
                </div>
                <p className="text-xl font-bold">{stats.dso} giorni</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Ricavi vs Costi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={financialTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="periodo" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="ricavi" fill={CHART_COLORS.info} name="Ricavi" />
                    <Bar dataKey="costi" fill={CHART_COLORS.danger} name="Costi" opacity={0.7} />
                    <Line type="monotone" dataKey="margine" stroke={CHART_COLORS.success} strokeWidth={2} name="Margine" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Cash Flow Mensile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="mese" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="entrate" fill={CHART_COLORS.success} name="Entrate" />
                    <Bar dataKey="uscite" fill={CHART_COLORS.danger} name="Uscite" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Fatture in scadenza */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Fatture in Attesa ({stats.fattureInAttesa + stats.fattureScadute})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Cliente/Fornitore</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fatture.filter(f => f.stato === 'emessa' || f.stato === 'scaduta').slice(0, 10).map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.numero}</TableCell>
                      <TableCell>{f.cliente_fornitore}</TableCell>
                      <TableCell>{formatCurrency(f.totale || f.imponibile)}</TableCell>
                      <TableCell>{format(new Date(f.data), 'dd/MM/yyyy', { locale: it })}</TableCell>
                      <TableCell>
                        <Badge variant={f.stato === 'scaduta' ? 'destructive' : 'outline'}>
                          {f.stato}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {fatture.filter(f => f.stato === 'emessa' || f.stato === 'scaduta').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nessuna fattura in attesa
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPERATIVO TAB */}
        <TabsContent value="operativo" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <HardHat className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Lavoratori</span>
                </div>
                <p className="text-xl font-bold">{stats.lavoratoriTotali}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Imprese</span>
                </div>
                <p className="text-xl font-bold">{stats.impreseCollaborate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Ordini in corso</span>
                </div>
                <p className="text-xl font-bold">{ordini.filter(o => o.stato !== 'consegnato').length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cantieri status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Stato Cantieri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={cantieriStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {cantieriStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cantieri list */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Cantieri Attivi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {cantieri.filter(c => c.stato === 'attivo').slice(0, 6).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.indirizzo}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {c.stato}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {cantieri.filter(c => c.stato === 'attivo').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nessun cantiere attivo</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COMMERCIALE TAB */}
        <TabsContent value="commerciale" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Preventivi Attivi</span>
                </div>
                <p className="text-xl font-bold">{stats.preventiviInAttesa}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(stats.valorePreventivi)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Approvati</span>
                </div>
                <p className="text-xl font-bold">{stats.preventiviApprovati}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Tasso Conversione</span>
                </div>
                <p className="text-xl font-bold">{stats.tassoConversione.toFixed(0)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Contratti Attivi</span>
                </div>
                <p className="text-xl font-bold">{stats.contrattiAttivi}</p>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline commerciale */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Commerciale</CardTitle>
              <CardDescription>Stato delle opportunità commerciali</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-2xl font-bold text-blue-600">{preventivi.filter(p => p.stato === 'bozza').length}</p>
                  <p className="text-xs text-muted-foreground">Bozze</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex-1 text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-2xl font-bold text-amber-600">{preventivi.filter(p => p.stato === 'inviato').length}</p>
                  <p className="text-xs text-muted-foreground">Inviati</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex-1 text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-2xl font-bold text-emerald-600">{preventivi.filter(p => p.stato === 'accettato').length}</p>
                  <p className="text-xs text-muted-foreground">Accettati</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex-1 text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-2xl font-bold text-red-600">{preventivi.filter(p => p.stato === 'rifiutato').length}</p>
                  <p className="text-xs text-muted-foreground">Rifiutati</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* COMPLIANCE TAB */}
        <TabsContent value="compliance" className="mt-6">
          <ComplianceMonitor />
        </TabsContent>
      </Tabs>

      {/* Report Dialog */}
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
                  </SelectContent>
                </Select>
              </div>
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
