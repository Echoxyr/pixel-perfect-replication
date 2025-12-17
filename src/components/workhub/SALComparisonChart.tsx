import { useMemo, useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  SAL, 
  PrevisioneSAL, 
  TipoLavorazione,
  TIPO_LAVORAZIONE_LABELS,
  formatCurrency,
  generateId 
} from '@/types/workhub';
import { Plus, TrendingUp, TrendingDown, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SALComparisonChartProps {
  sal: SAL[];
  previsioni: PrevisioneSAL[];
  cantiereId?: string;
  onAddPrevisione?: (previsione: Omit<PrevisioneSAL, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function SALComparisonChart({ 
  sal, 
  previsioni, 
  cantiereId,
  onAddPrevisione 
}: SALComparisonChartProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [form, setForm] = useState({
    mese: new Date().toISOString().slice(0, 7),
    tipoLavorazione: 'elettrico' as TipoLavorazione,
    importoPrevisto: 0,
    percentualePrevista: 0,
    note: ''
  });

  // Generate chart data by combining SAL and previsioni
  const chartData = useMemo(() => {
    const filteredSAL = cantiereId 
      ? sal.filter(s => s.cantiereId === cantiereId) 
      : sal;
    
    const filteredPrevisioni = cantiereId 
      ? previsioni.filter(p => p.cantiereId === cantiereId) 
      : previsioni;

    // Get all unique months
    const allMonths = new Set<string>();
    filteredSAL.forEach(s => allMonths.add(s.mese));
    filteredPrevisioni.forEach(p => allMonths.add(p.mese));

    // Sort months
    const sortedMonths = Array.from(allMonths).sort();

    // Build data points
    let cumulativeEseguito = 0;
    let cumulativePrevisto = 0;

    return sortedMonths.map(mese => {
      const salMese = filteredSAL.filter(s => s.mese === mese);
      const prevMese = filteredPrevisioni.filter(p => p.mese === mese);

      const eseguitoMese = salMese.reduce((sum, s) => sum + s.importoLavoriPeriodo, 0);
      const previstoMese = prevMese.reduce((sum, p) => sum + p.importoPrevisto, 0);

      cumulativeEseguito += eseguitoMese;
      cumulativePrevisto += previstoMese;

      const [year, month] = mese.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('it-IT', { month: 'short' });

      return {
        mese: `${monthName} ${year.slice(2)}`,
        meseRaw: mese,
        eseguito: cumulativeEseguito,
        previsto: cumulativePrevisto,
        eseguitoMese,
        previstoMese,
        differenza: cumulativeEseguito - cumulativePrevisto
      };
    });
  }, [sal, previsioni, cantiereId]);

  // Calculate status
  const status = useMemo(() => {
    if (chartData.length === 0) return null;
    const last = chartData[chartData.length - 1];
    const diff = last.eseguito - last.previsto;
    const percentDiff = last.previsto > 0 ? (diff / last.previsto) * 100 : 0;
    return { diff, percentDiff, isPositive: diff >= 0 };
  }, [chartData]);

  const handleAddPrevisione = () => {
    if (onAddPrevisione && cantiereId) {
      onAddPrevisione({
        cantiereId,
        ...form
      });
      setShowDialog(false);
      setForm({
        mese: new Date().toISOString().slice(0, 7),
        tipoLavorazione: 'elettrico',
        importoPrevisto: 0,
        percentualePrevista: 0,
        note: ''
      });
    }
  };

  const chartContent = (
    <div className="space-y-4">
      {/* Status indicator */}
      {status && (
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-lg',
          status.isPositive 
            ? 'bg-emerald-500/10 border border-emerald-500/20' 
            : 'bg-red-500/10 border border-red-500/20'
        )}>
          {status.isPositive ? (
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className={cn(
              'font-medium',
              status.isPositive ? 'text-emerald-500' : 'text-red-500'
            )}>
              {status.isPositive ? 'In linea con le previsioni' : 'Sotto le previsioni'}
            </p>
            <p className="text-sm text-muted-foreground">
              Differenza: {formatCurrency(status.diff)} ({status.percentDiff.toFixed(1)}%)
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className={cn('transition-all', isExpanded ? 'h-[500px]' : 'h-[300px]')}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEseguito" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="mese" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'previsto' ? 'SAL Previsto' : 'SAL Eseguito'
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                formatter={(value) => (
                  <span className="text-sm">
                    {value === 'previsto' ? '🟢 SAL Previsto' : '🔴 SAL Eseguito'}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="previsto"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={3}
                fill="url(#colorPrevisto)"
                dot={{ r: 6, fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="eseguito"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={3}
                fill="url(#colorEseguito)"
                dot={{ r: 6, fill: 'hsl(0, 84%, 60%)', strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          <p>Nessun dato disponibile. Aggiungi previsioni e SAL per visualizzare il grafico.</p>
        </div>
      )}

      {/* Legend info */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">SAL Previsto (obiettivo)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">SAL Eseguito (reale)</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Confronto SAL Previsto vs Eseguito
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            {onAddPrevisione && cantiereId && (
              <Button onClick={() => setShowDialog(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nuova Previsione
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {chartContent}
        </CardContent>
      </Card>

      {/* Add Previsione Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Previsione SAL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mese</Label>
                <Input
                  type="month"
                  value={form.mese}
                  onChange={(e) => setForm({ ...form, mese: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo Lavorazione</Label>
                <Select
                  value={form.tipoLavorazione}
                  onValueChange={(v) => setForm({ ...form, tipoLavorazione: v as TipoLavorazione })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_LAVORAZIONE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Importo Previsto (€)</Label>
                <Input
                  type="number"
                  value={form.importoPrevisto}
                  onChange={(e) => setForm({ ...form, importoPrevisto: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>% Avanzamento Prevista</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.percentualePrevista}
                  onChange={(e) => setForm({ ...form, percentualePrevista: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Note opzionali..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleAddPrevisione}>
              Aggiungi Previsione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}