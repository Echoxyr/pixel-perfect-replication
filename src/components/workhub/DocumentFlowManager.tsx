import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  FileText,
  ShoppingCart,
  Truck,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Link2,
  History,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DocumentFlowManagerProps {
  className?: string;
}

interface Preventivo {
  id: string;
  numero: string;
  data: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  oggetto: string;
  importo: number | null;
  stato: string;
  ordine_generato_id?: string | null;
  cantiere_id?: string | null;
}

interface Ordine {
  id: string;
  numero: string;
  data: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  importo: number;
  stato: string;
  preventivo_origine_id?: string | null;
  ddt_generato_id?: string | null;
  cantiere_id?: string | null;
}

interface DDT {
  id: string;
  numero: string;
  data: string;
  destinatario: string;
  stato: string;
  ordine_origine_id?: string | null;
  fattura_generata_id?: string | null;
  fornitore_id?: string | null;
}

interface Fattura {
  id: string;
  numero: string;
  data: string;
  cliente_fornitore: string;
  tipo: string;
  stato: string;
  imponibile: number;
  ddt_origine_id?: string | null;
  ordine_origine_id?: string | null;
}

interface ConversionLog {
  id: string;
  documento_origine_tipo: string;
  documento_origine_id: string;
  documento_destinazione_tipo: string;
  documento_destinazione_id: string;
  convertito_da: string | null;
  note: string | null;
  created_at: string;
}

const FLOW_STEPS = [
  { key: 'preventivo', label: 'Preventivo', icon: FileText, color: 'bg-blue-500' },
  { key: 'ordine', label: 'Ordine', icon: ShoppingCart, color: 'bg-amber-500' },
  { key: 'ddt', label: 'DDT', icon: Truck, color: 'bg-purple-500' },
  { key: 'fattura', label: 'Fattura', icon: Receipt, color: 'bg-green-500' },
];

export default function DocumentFlowManager({ className }: DocumentFlowManagerProps) {
  const queryClient = useQueryClient();
  const [selectedPreventivo, setSelectedPreventivo] = useState<Preventivo | null>(null);
  const [selectedOrdine, setSelectedOrdine] = useState<Ordine | null>(null);
  const [selectedDDT, setSelectedDDT] = useState<DDT | null>(null);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [conversionType, setConversionType] = useState<'preventivo_ordine' | 'ordine_ddt' | 'ddt_fattura' | null>(null);
  const [conversionNote, setConversionNote] = useState('');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyEntityId, setHistoryEntityId] = useState<string | null>(null);

  // Fetch data
  const { data: preventivi = [] } = useQuery({
    queryKey: ['preventivi_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preventivi_fornitori')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as Preventivo[];
    }
  });

  const { data: ordini = [] } = useQuery({
    queryKey: ['ordini_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ordini_fornitori')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as Ordine[];
    }
  });

  const { data: ddts = [] } = useQuery({
    queryKey: ['ddt'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ddt')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as DDT[];
    }
  });

  const { data: fatture = [] } = useQuery({
    queryKey: ['fatture'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fatture')
        .select('*')
        .order('data', { ascending: false });
      if (error) throw error;
      return data as Fattura[];
    }
  });

  const { data: conversionLogs = [] } = useQuery({
    queryKey: ['document_conversions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ConversionLog[];
    }
  });

  const { data: cantieri = [] } = useQuery({
    queryKey: ['cantieri'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cantieri').select('id, nome').order('nome');
      if (error) throw error;
      return data;
    }
  });

  // Convert Preventivo to Ordine
  const convertPreventivoToOrdine = useMutation({
    mutationFn: async (preventivo: Preventivo) => {
      const numeroOrdine = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      // Prepare insert data - handle nullable fields properly
      const insertData = {
        numero: numeroOrdine,
        data: new Date().toISOString().split('T')[0],
        fornitore_id: preventivo.fornitore_id || null,
        fornitore_nome: preventivo.fornitore_nome || 'N/D',
        cantiere_id: preventivo.cantiere_id || null,
        importo: preventivo.importo || 0,
        stato: 'confermato',
        preventivo_origine_id: preventivo.id,
        note: `Generato da preventivo ${preventivo.numero}`
      };
      
      console.log('Creating ordine with data:', insertData);
      
      // Create new order
      const { data: newOrdine, error: ordineError } = await supabase
        .from('ordini_fornitori')
        .insert(insertData)
        .select()
        .single();
      
      if (ordineError) {
        console.error('Error creating ordine:', ordineError);
        throw ordineError;
      }
      
      console.log('Ordine created:', newOrdine);

      // Update preventivo with link
      const { error: updateError } = await supabase
        .from('preventivi_fornitori')
        .update({
          stato: 'approvato',
          ordine_generato_id: newOrdine.id,
          convertito_in_ordine_at: new Date().toISOString()
        })
        .eq('id', preventivo.id);
      
      if (updateError) {
        console.error('Error updating preventivo:', updateError);
      }

      // Log conversion
      await supabase.from('document_conversions').insert({
        documento_origine_tipo: 'preventivo',
        documento_origine_id: preventivo.id,
        documento_destinazione_tipo: 'ordine',
        documento_destinazione_id: newOrdine.id,
        note: conversionNote || null
      });

      // Create notification
      await supabase.from('workflow_notifications').insert({
        tipo: 'conversione',
        entita_tipo: 'ordine',
        entita_id: newOrdine.id,
        titolo: 'Nuovo ordine generato',
        messaggio: `Ordine ${numeroOrdine} generato automaticamente dal preventivo ${preventivo.numero}`,
        priorita: 'media',
        azione_suggerita: 'Verifica e conferma ordine',
        link_azione: '/reparto-commerciale?tab=ordini'
      });

      return newOrdine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventivi_fornitori'] });
      queryClient.invalidateQueries({ queryKey: ['ordini_fornitori'] });
      queryClient.invalidateQueries({ queryKey: ['document_conversions'] });
      queryClient.invalidateQueries({ queryKey: ['workflow_notifications'] });
      toast.success('Preventivo convertito in ordine!');
      setShowConvertDialog(false);
      setSelectedPreventivo(null);
      setConversionNote('');
    },
    onError: (error) => {
      console.error('Conversion error:', error);
      toast.error('Errore nella conversione: ' + (error as Error).message);
    }
  });

  // Convert Ordine to DDT
  const convertOrdineToDDT = useMutation({
    mutationFn: async (ordine: Ordine) => {      
      const numeroDDT = `DDT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      const { data: newDDT, error: ddtError } = await supabase
        .from('ddt')
        .insert([{
          numero: numeroDDT,
          data: new Date().toISOString().split('T')[0],
          mittente: 'Azienda',
          destinatario: ordine.fornitore_nome,
          stato: 'in_preparazione',
          ordine_origine_id: ordine.id,
          fornitore_id: ordine.fornitore_id,
          commessa_id: ordine.cantiere_id,
          causale_trasporto: 'Consegna materiale',
          note: `Generato da ordine ${ordine.numero}`
        }])
        .select()
        .single();

      if (ddtError) throw ddtError;

      // Update ordine
      await supabase
        .from('ordini_fornitori')
        .update({
          stato: 'evaso',
          ddt_generato_id: newDDT.id,
          convertito_in_ddt_at: new Date().toISOString()
        })
        .eq('id', ordine.id);

      // Log conversion
      await supabase.from('document_conversions').insert({
        documento_origine_tipo: 'ordine',
        documento_origine_id: ordine.id,
        documento_destinazione_tipo: 'ddt',
        documento_destinazione_id: newDDT.id,
        note: conversionNote || null
      });

      // Create notification
      await supabase.from('workflow_notifications').insert({
        tipo: 'conversione',
        entita_tipo: 'ddt',
        entita_id: newDDT.id,
        titolo: 'Nuovo DDT generato',
        messaggio: `DDT ${numeroDDT} generato da ordine ${ordine.numero}`,
        priorita: 'media',
        azione_suggerita: 'Prepara merce per spedizione',
        link_azione: '/reparto-amministrazione?tab=ddt'
      });

      return newDDT;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordini_fornitori'] });
      queryClient.invalidateQueries({ queryKey: ['ddt'] });
      queryClient.invalidateQueries({ queryKey: ['document_conversions'] });
      toast.success('Ordine convertito in DDT!');
      setShowConvertDialog(false);
      setSelectedOrdine(null);
      setConversionNote('');
    },
    onError: (error) => {
      toast.error('Errore: ' + (error as Error).message);
    }
  });

  // Convert DDT to Fattura
  const convertDDTToFattura = useMutation({
    mutationFn: async (ddt: DDT) => {
      const numeroFattura = `FT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      const { data: newFattura, error: fatturaError } = await supabase
        .from('fatture')
        .insert({
          numero: numeroFattura,
          data: new Date().toISOString().split('T')[0],
          scadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          cliente_fornitore: ddt.destinatario,
          tipo: 'attiva',
          stato: 'emessa',
          descrizione: `Fattura per DDT ${ddt.numero}`,
          imponibile: 0,
          aliquota_iva: 22,
          ddt_origine_id: ddt.id,
          fornitore_id: ddt.fornitore_id
        })
        .select()
        .single();

      if (fatturaError) throw fatturaError;

      // Update DDT
      await supabase
        .from('ddt')
        .update({
          stato: 'fatturato',
          fattura_generata_id: newFattura.id,
          convertito_in_fattura_at: new Date().toISOString()
        })
        .eq('id', ddt.id);

      // Log conversion
      await supabase.from('document_conversions').insert({
        documento_origine_tipo: 'ddt',
        documento_origine_id: ddt.id,
        documento_destinazione_tipo: 'fattura',
        documento_destinazione_id: newFattura.id,
        note: conversionNote || null
      });

      // Create notification
      await supabase.from('workflow_notifications').insert({
        tipo: 'conversione',
        entita_tipo: 'fattura',
        entita_id: newFattura.id,
        titolo: 'Nuova fattura generata',
        messaggio: `Fattura ${numeroFattura} generata da DDT ${ddt.numero}`,
        priorita: 'alta',
        azione_suggerita: 'Verifica importi e invia fattura',
        link_azione: '/reparto-amministrazione?tab=fatture'
      });

      return newFattura;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ddt'] });
      queryClient.invalidateQueries({ queryKey: ['fatture'] });
      queryClient.invalidateQueries({ queryKey: ['document_conversions'] });
      toast.success('DDT convertito in fattura!');
      setShowConvertDialog(false);
      setSelectedDDT(null);
      setConversionNote('');
    },
    onError: (error) => {
      toast.error('Errore: ' + (error as Error).message);
    }
  });

  // Convertible items (not yet converted)
  const convertiblePreventivi = preventivi.filter(p => p.stato === 'ricevuto' || p.stato === 'approvato');
  const convertibleOrdini = ordini.filter(o => o.stato === 'confermato' && !o.ddt_generato_id);
  const convertibleDDT = ddts.filter(d => d.stato === 'consegnato' && !d.fattura_generata_id);

  const handleStartConversion = (type: 'preventivo_ordine' | 'ordine_ddt' | 'ddt_fattura') => {
    setConversionType(type);
    setShowConvertDialog(true);
  };

  const handleConfirmConversion = () => {
    if (conversionType === 'preventivo_ordine' && selectedPreventivo) {
      convertPreventivoToOrdine.mutate(selectedPreventivo);
    } else if (conversionType === 'ordine_ddt' && selectedOrdine) {
      convertOrdineToDDT.mutate(selectedOrdine);
    } else if (conversionType === 'ddt_fattura' && selectedDDT) {
      convertDDTToFattura.mutate(selectedDDT);
    }
  };

  const getStatusBadge = (stato: string) => {
    const colors: Record<string, string> = {
      richiesto: 'bg-blue-100 text-blue-800',
      ricevuto: 'bg-amber-100 text-amber-800',
      approvato: 'bg-green-100 text-green-800',
      rifiutato: 'bg-red-100 text-red-800',
      bozza: 'bg-gray-100 text-gray-800',
      confermato: 'bg-blue-100 text-blue-800',
      evaso: 'bg-green-100 text-green-800',
      in_preparazione: 'bg-amber-100 text-amber-800',
      spedito: 'bg-blue-100 text-blue-800',
      consegnato: 'bg-green-100 text-green-800',
      fatturato: 'bg-purple-100 text-purple-800',
      emessa: 'bg-blue-100 text-blue-800',
      pagata: 'bg-green-100 text-green-800',
    };
    return colors[stato] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn("space-y-6 min-w-0", className)}>
      {/* Flow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Flusso Documentale End-to-End
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Flow Steps Visualization */}
          <div className="mb-6 md:mb-8">
            <div className="overflow-x-auto scrollbar-hidden -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
              <div className="flex w-max items-center gap-3 md:w-full md:justify-between md:gap-0 py-2">
                {FLOW_STEPS.map((step, index) => (
                  <div key={step.key} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white", step.color)}>
                        <step.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <span className="mt-2 text-xs sm:text-sm font-medium text-wrap-responsive">{step.label}</span>
                      <span className="text-[11px] sm:text-xs text-muted-foreground">
                        {step.key === 'preventivo' && `${preventivi.length}`}
                        {step.key === 'ordine' && `${ordini.length}`}
                        {step.key === 'ddt' && `${ddts.length}`}
                        {step.key === 'fattura' && `${fatture.length}`}
                      </span>
                    </div>
                    {index < FLOW_STEPS.length - 1 && (
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 mx-2 sm:mx-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base text-wrap-responsive">Preventivo → Ordine</span>
                  </div>
                  <Badge variant="outline" className="w-fit flex-shrink-0">{convertiblePreventivi.length} disponibili</Badge>
                </div>
                <Button 
                  className="w-full gap-2" 
                  variant="outline"
                  onClick={() => handleStartConversion('preventivo_ordine')}
                  disabled={convertiblePreventivi.length === 0}
                >
                  <Zap className="w-4 h-4" />
                  Converti in Ordine
                </Button>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShoppingCart className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base text-wrap-responsive">Ordine → DDT</span>
                  </div>
                  <Badge variant="outline" className="w-fit flex-shrink-0">{convertibleOrdini.length} disponibili</Badge>
                </div>
                <Button 
                  className="w-full gap-2" 
                  variant="outline"
                  onClick={() => handleStartConversion('ordine_ddt')}
                  disabled={convertibleOrdini.length === 0}
                >
                  <Zap className="w-4 h-4" />
                  Genera DDT
                </Button>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Truck className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base text-wrap-responsive">DDT → Fattura</span>
                  </div>
                  <Badge variant="outline" className="w-fit flex-shrink-0">{convertibleDDT.length} disponibili</Badge>
                </div>
                <Button 
                  className="w-full gap-2" 
                  variant="outline"
                  onClick={() => handleStartConversion('ddt_fattura')}
                  disabled={convertibleDDT.length === 0}
                >
                  <Zap className="w-4 h-4" />
                  Genera Fattura
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversions */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Ultime Conversioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversionLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nessuna conversione effettuata. Inizia convertendo un preventivo in ordine!
            </p>
          ) : (
            <div className="space-y-3">
              {conversionLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/50 rounded-lg min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <Badge variant="outline" className="capitalize">{log.documento_origine_tipo}</Badge>
                        <ArrowRight className="w-4 h-4 flex-shrink-0" />
                        <Badge variant="outline" className="capitalize">{log.documento_destinazione_tipo}</Badge>
                      </div>
                      {log.note && <span className="text-sm text-muted-foreground text-wrap-responsive">- {log.note}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground sm:text-right">
                      {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: it })}
                    </span>
                  </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {conversionType === 'preventivo_ordine' && 'Converti Preventivo in Ordine'}
              {conversionType === 'ordine_ddt' && 'Genera DDT da Ordine'}
              {conversionType === 'ddt_fattura' && 'Genera Fattura da DDT'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {conversionType === 'preventivo_ordine' && (
              <div>
                <Label>Seleziona Preventivo</Label>
                <Select 
                  value={selectedPreventivo?.id || ''} 
                  onValueChange={(id) => setSelectedPreventivo(convertiblePreventivi.find(p => p.id === id) || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scegli preventivo da convertire" />
                  </SelectTrigger>
                  <SelectContent>
                    {convertiblePreventivi.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.numero} - {p.fornitore_nome} - €{(p.importo || 0).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPreventivo && (
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                    <p><strong>Fornitore:</strong> {selectedPreventivo.fornitore_nome}</p>
                    <p><strong>Oggetto:</strong> {selectedPreventivo.oggetto}</p>
                    <p><strong>Importo:</strong> €{(selectedPreventivo.importo || 0).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {conversionType === 'ordine_ddt' && (
              <div>
                <Label>Seleziona Ordine</Label>
                <Select 
                  value={selectedOrdine?.id || ''} 
                  onValueChange={(id) => setSelectedOrdine(convertibleOrdini.find(o => o.id === id) || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scegli ordine per DDT" />
                  </SelectTrigger>
                  <SelectContent>
                    {convertibleOrdini.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.numero} - {o.fornitore_nome} - €{o.importo.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {conversionType === 'ddt_fattura' && (
              <div>
                <Label>Seleziona DDT</Label>
                <Select 
                  value={selectedDDT?.id || ''} 
                  onValueChange={(id) => setSelectedDDT(convertibleDDT.find(d => d.id === id) || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scegli DDT da fatturare" />
                  </SelectTrigger>
                  <SelectContent>
                    {convertibleDDT.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.numero} - {d.destinatario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Note conversione (opzionale)</Label>
              <Textarea 
                value={conversionNote}
                onChange={(e) => setConversionNote(e.target.value)}
                placeholder="Aggiungi note sulla conversione..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
              Annulla
            </Button>
            <Button 
              onClick={handleConfirmConversion}
              disabled={
                (conversionType === 'preventivo_ordine' && !selectedPreventivo) ||
                (conversionType === 'ordine_ddt' && !selectedOrdine) ||
                (conversionType === 'ddt_fattura' && !selectedDDT)
              }
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Conferma Conversione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
