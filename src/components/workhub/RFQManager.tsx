import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  FileText, Plus, Send, Clock, CheckCircle, XCircle, AlertTriangle, 
  Eye, Edit, Trash2, Bell, BarChart3, Trophy, Scale, FileCheck,
  Building2, Calendar, Euro, Star, MessageSquare
} from 'lucide-react';

interface RFQRichiesta {
  id: string;
  numero: string;
  oggetto: string;
  descrizione?: string;
  cantiere_id?: string;
  lavorazione?: string;
  importo_stimato?: number;
  data_emissione: string;
  data_scadenza: string;
  stato: string;
  urgenza: string;
  allegati_tecnici?: any[];
  note?: string;
  solleciti_inviati: number;
  ultimo_sollecito?: string;
  created_at: string;
}

interface RFQRisposta {
  id: string;
  rfq_id: string;
  fornitore_id?: string;
  fornitore_nome?: string;
  data_ricezione: string;
  importo_offerto: number;
  tempi_consegna?: string;
  condizioni_pagamento?: string;
  validita_offerta?: string;
  note_tecniche?: string;
  allegati?: any[];
  valutazione?: number;
  punteggio_tecnico?: number;
  punteggio_economico?: number;
  punteggio_totale?: number;
  selezionata: boolean;
  motivo_selezione?: string;
  motivo_esclusione?: string;
}

interface RFQComparazione {
  id: string;
  rfq_id: string;
  data_comparazione: string;
  criteri_valutazione: Record<string, number>;
  risposta_vincente_id?: string;
  motivazione_scelta: string;
  note_commissione?: string;
  approvato_da?: string;
  data_approvazione?: string;
}

const STATO_COLORS: Record<string, string> = {
  bozza: 'bg-gray-100 text-gray-800',
  aperta: 'bg-blue-100 text-blue-800',
  in_valutazione: 'bg-yellow-100 text-yellow-800',
  assegnata: 'bg-green-100 text-green-800',
  annullata: 'bg-red-100 text-red-800',
  scaduta: 'bg-orange-100 text-orange-800'
};

const URGENZA_COLORS: Record<string, string> = {
  bassa: 'bg-gray-100 text-gray-800',
  normale: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800'
};

export default function RFQManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('richieste');
  const [showNewRFQDialog, setShowNewRFQDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQRichiesta | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<RFQRisposta | null>(null);
  
  const [newRFQ, setNewRFQ] = useState({
    oggetto: '',
    descrizione: '',
    cantiere_id: '',
    lavorazione: '',
    importo_stimato: '',
    data_scadenza: '',
    urgenza: 'normale',
    note: ''
  });

  const [newResponse, setNewResponse] = useState({
    fornitore_nome: '',
    importo_offerto: '',
    tempi_consegna: '',
    condizioni_pagamento: '',
    validita_offerta: '',
    note_tecniche: ''
  });

  const [comparisonData, setComparisonData] = useState({
    criteri: { prezzo: 40, tempi: 30, qualita: 30 },
    motivazione_scelta: '',
    note_commissione: ''
  });

  // Fetch RFQ Requests
  const { data: rfqRichieste = [], isLoading } = useQuery({
    queryKey: ['rfq-richieste'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_richieste')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RFQRichiesta[];
    }
  });

  // Fetch RFQ Responses
  const { data: rfqRisposte = [] } = useQuery({
    queryKey: ['rfq-risposte'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_risposte')
        .select('*')
        .order('data_ricezione', { ascending: false });
      if (error) throw error;
      return data as RFQRisposta[];
    }
  });

  // Fetch Comparisons
  const { data: comparazioni = [] } = useQuery({
    queryKey: ['rfq-comparazioni'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_comparazioni')
        .select('*')
        .order('data_comparazione', { ascending: false });
      if (error) throw error;
      return data as RFQComparazione[];
    }
  });

  // Fetch Fornitori for selection
  const { data: fornitori = [] } = useQuery({
    queryKey: ['fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fornitori')
        .select('id, ragione_sociale')
        .order('ragione_sociale');
      if (error) throw error;
      return data;
    }
  });

  // Fetch Cantieri for selection
  const { data: cantieri = [] } = useQuery({
    queryKey: ['cantieri'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cantieri')
        .select('id, nome')
        .order('nome');
      if (error) throw error;
      return data;
    }
  });

  // Generate RFQ number
  const generateRFQNumber = () => {
    const year = new Date().getFullYear();
    const count = rfqRichieste.filter(r => r.numero?.includes(String(year))).length + 1;
    return `RFQ-${year}-${String(count).padStart(4, '0')}`;
  };

  // Create RFQ Mutation
  const createRFQMutation = useMutation({
    mutationFn: async (data: typeof newRFQ) => {
      const { error } = await supabase.from('rfq_richieste').insert({
        numero: generateRFQNumber(),
        oggetto: data.oggetto,
        descrizione: data.descrizione || null,
        cantiere_id: data.cantiere_id || null,
        lavorazione: data.lavorazione || null,
        importo_stimato: data.importo_stimato ? parseFloat(data.importo_stimato) : null,
        data_scadenza: data.data_scadenza,
        urgenza: data.urgenza,
        note: data.note || null,
        stato: 'aperta'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-richieste'] });
      setShowNewRFQDialog(false);
      setNewRFQ({ oggetto: '', descrizione: '', cantiere_id: '', lavorazione: '', importo_stimato: '', data_scadenza: '', urgenza: 'normale', note: '' });
      toast({ title: 'RFQ Creata', description: 'Richiesta di offerta creata con successo' });
    },
    onError: (error: any) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    }
  });

  // Add Response Mutation
  const addResponseMutation = useMutation({
    mutationFn: async (data: { rfq_id: string } & typeof newResponse) => {
      const { error } = await supabase.from('rfq_risposte').insert({
        rfq_id: data.rfq_id,
        fornitore_nome: data.fornitore_nome,
        importo_offerto: parseFloat(data.importo_offerto),
        tempi_consegna: data.tempi_consegna || null,
        condizioni_pagamento: data.condizioni_pagamento || null,
        validita_offerta: data.validita_offerta || null,
        note_tecniche: data.note_tecniche || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-risposte'] });
      setShowResponseDialog(false);
      setNewResponse({ fornitore_nome: '', importo_offerto: '', tempi_consegna: '', condizioni_pagamento: '', validita_offerta: '', note_tecniche: '' });
      toast({ title: 'Risposta Registrata', description: 'Offerta del fornitore registrata con successo' });
    },
    onError: (error: any) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    }
  });

  // Update RFQ Status Mutation
  const updateRFQStatusMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const { error } = await supabase.from('rfq_richieste').update({ stato }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-richieste'] });
      toast({ title: 'Stato Aggiornato' });
    }
  });

  // Select Winner Mutation
  const selectWinnerMutation = useMutation({
    mutationFn: async ({ rfq_id, risposta_id, motivazione }: { rfq_id: string; risposta_id: string; motivazione: string }) => {
      // Deselect all other responses
      await supabase.from('rfq_risposte').update({ selezionata: false }).eq('rfq_id', rfq_id);
      // Select winner
      await supabase.from('rfq_risposte').update({ selezionata: true, motivo_selezione: motivazione }).eq('id', risposta_id);
      // Create comparison record
      const { error } = await supabase.from('rfq_comparazioni').insert({
        rfq_id,
        risposta_vincente_id: risposta_id,
        criteri_valutazione: comparisonData.criteri,
        motivazione_scelta: motivazione,
        note_commissione: comparisonData.note_commissione || null,
        data_approvazione: new Date().toISOString().split('T')[0]
      });
      if (error) throw error;
      // Update RFQ status
      await supabase.from('rfq_richieste').update({ stato: 'assegnata' }).eq('id', rfq_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-richieste'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-risposte'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-comparazioni'] });
      setShowCompareDialog(false);
      toast({ title: 'Fornitore Selezionato', description: 'Offerta vincente registrata con comparazione' });
    }
  });

  // Send Reminder Mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (rfq_id: string) => {
      const rfq = rfqRichieste.find(r => r.id === rfq_id);
      const { error } = await supabase.from('rfq_richieste').update({
        solleciti_inviati: (rfq?.solleciti_inviati || 0) + 1,
        ultimo_sollecito: new Date().toISOString()
      }).eq('id', rfq_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-richieste'] });
      toast({ title: 'Sollecito Inviato', description: 'Sollecito registrato con successo' });
    }
  });

  // Delete RFQ Mutation
  const deleteRFQMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rfq_richieste').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfq-richieste'] });
      toast({ title: 'RFQ Eliminata' });
    }
  });

  const getResponsesForRFQ = (rfq_id: string) => rfqRisposte.filter(r => r.rfq_id === rfq_id);
  
  const getDaysRemaining = (dateStr: string) => {
    const days = differenceInDays(new Date(dateStr), new Date());
    return days;
  };

  // Statistics
  const stats = {
    totali: rfqRichieste.length,
    aperte: rfqRichieste.filter(r => r.stato === 'aperta').length,
    inValutazione: rfqRichieste.filter(r => r.stato === 'in_valutazione').length,
    assegnate: rfqRichieste.filter(r => r.stato === 'assegnata').length,
    scadute: rfqRichieste.filter(r => r.stato === 'scaduta' || getDaysRemaining(r.data_scadenza) < 0).length,
    risposteTotali: rfqRisposte.length,
    comparazioniEffettuate: comparazioni.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Gestione RFQ (Richieste di Offerta)
          </h2>
          <p className="text-sm text-muted-foreground">
            Crea richieste, raccogli offerte, confronta e seleziona i fornitori
          </p>
        </div>
        <Button onClick={() => setShowNewRFQDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuova RFQ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3">
          <div className="text-2xl font-bold">{stats.totali}</div>
          <div className="text-xs text-muted-foreground">Totali</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-blue-600">{stats.aperte}</div>
          <div className="text-xs text-muted-foreground">Aperte</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-yellow-600">{stats.inValutazione}</div>
          <div className="text-xs text-muted-foreground">In Valutazione</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-600">{stats.assegnate}</div>
          <div className="text-xs text-muted-foreground">Assegnate</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-red-600">{stats.scadute}</div>
          <div className="text-xs text-muted-foreground">Scadute</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-purple-600">{stats.risposteTotali}</div>
          <div className="text-xs text-muted-foreground">Offerte Ricevute</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-indigo-600">{stats.comparazioniEffettuate}</div>
          <div className="text-xs text-muted-foreground">Comparazioni</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="richieste" className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Richieste RFQ
          </TabsTrigger>
          <TabsTrigger value="risposte" className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Offerte Ricevute
          </TabsTrigger>
          <TabsTrigger value="comparazioni" className="flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            Comparazioni
          </TabsTrigger>
        </TabsList>

        {/* Richieste Tab */}
        <TabsContent value="richieste" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[900px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numero</TableHead>
                        <TableHead>Oggetto</TableHead>
                        <TableHead>Cantiere</TableHead>
                        <TableHead>Importo Stimato</TableHead>
                        <TableHead>Scadenza</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Urgenza</TableHead>
                        <TableHead>Offerte</TableHead>
                        <TableHead>Solleciti</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfqRichieste.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            Nessuna RFQ creata. Clicca "Nuova RFQ" per iniziare.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rfqRichieste.map((rfq) => {
                          const responses = getResponsesForRFQ(rfq.id);
                          const daysRemaining = getDaysRemaining(rfq.data_scadenza);
                          const cantiere = cantieri.find(c => c.id === rfq.cantiere_id);
                          
                          return (
                            <TableRow key={rfq.id}>
                              <TableCell className="font-mono text-sm">{rfq.numero}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{rfq.oggetto}</TableCell>
                              <TableCell>{cantiere?.nome || '-'}</TableCell>
                              <TableCell>
                                {rfq.importo_stimato 
                                  ? `€ ${rfq.importo_stimato.toLocaleString('it-IT')}` 
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(rfq.data_scadenza), 'dd/MM/yyyy', { locale: it })}
                                  {daysRemaining >= 0 && daysRemaining <= 3 && (
                                    <Badge variant="outline" className="ml-1 text-orange-600 text-xs">
                                      {daysRemaining}g
                                    </Badge>
                                  )}
                                  {daysRemaining < 0 && (
                                    <Badge variant="destructive" className="ml-1 text-xs">Scaduta</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={STATO_COLORS[rfq.stato]}>
                                  {rfq.stato.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={URGENZA_COLORS[rfq.urgenza]}>
                                  {rfq.urgenza}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{responses.length}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{rfq.solleciti_inviati || 0}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedRFQ(rfq);
                                      setShowDetailDialog(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedRFQ(rfq);
                                      setShowResponseDialog(true);
                                    }}
                                    disabled={rfq.stato === 'assegnata' || rfq.stato === 'annullata'}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  {responses.length >= 2 && rfq.stato !== 'assegnata' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedRFQ(rfq);
                                        setShowCompareDialog(true);
                                      }}
                                    >
                                      <Scale className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => sendReminderMutation.mutate(rfq.id)}
                                    disabled={rfq.stato === 'assegnata' || rfq.stato === 'annullata'}
                                  >
                                    <Bell className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteRFQMutation.mutate(rfq.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risposte Tab */}
        <TabsContent value="risposte" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RFQ</TableHead>
                        <TableHead>Fornitore</TableHead>
                        <TableHead>Data Ricezione</TableHead>
                        <TableHead>Importo</TableHead>
                        <TableHead>Tempi Consegna</TableHead>
                        <TableHead>Validità</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfqRisposte.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Nessuna offerta ricevuta
                          </TableCell>
                        </TableRow>
                      ) : (
                        rfqRisposte.map((resp) => {
                          const rfq = rfqRichieste.find(r => r.id === resp.rfq_id);
                          return (
                            <TableRow key={resp.id} className={resp.selezionata ? 'bg-green-50' : ''}>
                              <TableCell className="font-mono text-sm">{rfq?.numero || '-'}</TableCell>
                              <TableCell>{resp.fornitore_nome}</TableCell>
                              <TableCell>
                                {format(new Date(resp.data_ricezione), 'dd/MM/yyyy', { locale: it })}
                              </TableCell>
                              <TableCell className="font-medium">
                                € {resp.importo_offerto.toLocaleString('it-IT')}
                              </TableCell>
                              <TableCell>{resp.tempi_consegna || '-'}</TableCell>
                              <TableCell>
                                {resp.validita_offerta 
                                  ? format(new Date(resp.validita_offerta), 'dd/MM/yyyy', { locale: it })
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {resp.selezionata ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Vincente
                                  </Badge>
                                ) : resp.motivo_esclusione ? (
                                  <Badge variant="destructive">Esclusa</Badge>
                                ) : (
                                  <Badge variant="outline">In valutazione</Badge>
                                )}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {resp.note_tecniche || '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparazioni Tab */}
        <TabsContent value="comparazioni" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RFQ</TableHead>
                        <TableHead>Data Comparazione</TableHead>
                        <TableHead>Fornitore Vincente</TableHead>
                        <TableHead>Criteri</TableHead>
                        <TableHead>Motivazione</TableHead>
                        <TableHead>Approvato Da</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparazioni.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nessuna comparazione effettuata
                          </TableCell>
                        </TableRow>
                      ) : (
                        comparazioni.map((comp) => {
                          const rfq = rfqRichieste.find(r => r.id === comp.rfq_id);
                          const winner = rfqRisposte.find(r => r.id === comp.risposta_vincente_id);
                          const criteri = comp.criteri_valutazione as Record<string, number>;
                          
                          return (
                            <TableRow key={comp.id}>
                              <TableCell className="font-mono text-sm">{rfq?.numero || '-'}</TableCell>
                              <TableCell>
                                {format(new Date(comp.data_comparazione), 'dd/MM/yyyy', { locale: it })}
                              </TableCell>
                              <TableCell className="font-medium">
                                {winner?.fornitore_nome || '-'}
                              </TableCell>
                              <TableCell>
                                <div className="text-xs space-y-0.5">
                                  <div>Prezzo: {criteri.prezzo}%</div>
                                  <div>Tempi: {criteri.tempi}%</div>
                                  <div>Qualità: {criteri.qualita}%</div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[250px] truncate">
                                {comp.motivazione_scelta}
                              </TableCell>
                              <TableCell>{comp.approvato_da || '-'}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New RFQ Dialog */}
      <Dialog open={showNewRFQDialog} onOpenChange={setShowNewRFQDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuova Richiesta di Offerta (RFQ)</DialogTitle>
            <DialogDescription>
              Crea una nuova richiesta da inviare ai fornitori
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Oggetto della Richiesta *</Label>
              <Input
                value={newRFQ.oggetto}
                onChange={(e) => setNewRFQ({ ...newRFQ, oggetto: e.target.value })}
                placeholder="Es: Fornitura materiale elettrico"
              />
            </div>
            <div className="grid gap-2">
              <Label>Descrizione Dettagliata</Label>
              <Textarea
                value={newRFQ.descrizione}
                onChange={(e) => setNewRFQ({ ...newRFQ, descrizione: e.target.value })}
                placeholder="Descrizione dettagliata della richiesta..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Cantiere</Label>
                <Select
                  value={newRFQ.cantiere_id}
                  onValueChange={(v) => setNewRFQ({ ...newRFQ, cantiere_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona cantiere" />
                  </SelectTrigger>
                  <SelectContent>
                    {cantieri.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Lavorazione</Label>
                <Input
                  value={newRFQ.lavorazione}
                  onChange={(e) => setNewRFQ({ ...newRFQ, lavorazione: e.target.value })}
                  placeholder="Es: Impianto elettrico"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Importo Stimato (€)</Label>
                <Input
                  type="number"
                  value={newRFQ.importo_stimato}
                  onChange={(e) => setNewRFQ({ ...newRFQ, importo_stimato: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Scadenza Risposte *</Label>
                <Input
                  type="date"
                  value={newRFQ.data_scadenza}
                  onChange={(e) => setNewRFQ({ ...newRFQ, data_scadenza: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Urgenza</Label>
                <Select
                  value={newRFQ.urgenza}
                  onValueChange={(v) => setNewRFQ({ ...newRFQ, urgenza: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bassa">Bassa</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <Textarea
                value={newRFQ.note}
                onChange={(e) => setNewRFQ({ ...newRFQ, note: e.target.value })}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRFQDialog(false)}>Annulla</Button>
            <Button 
              onClick={() => createRFQMutation.mutate(newRFQ)}
              disabled={!newRFQ.oggetto || !newRFQ.data_scadenza}
            >
              Crea RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registra Offerta Ricevuta</DialogTitle>
            <DialogDescription>
              RFQ: {selectedRFQ?.numero} - {selectedRFQ?.oggetto}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Fornitore *</Label>
              <Input
                value={newResponse.fornitore_nome}
                onChange={(e) => setNewResponse({ ...newResponse, fornitore_nome: e.target.value })}
                placeholder="Nome fornitore"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Importo Offerto (€) *</Label>
                <Input
                  type="number"
                  value={newResponse.importo_offerto}
                  onChange={(e) => setNewResponse({ ...newResponse, importo_offerto: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Tempi di Consegna</Label>
                <Input
                  value={newResponse.tempi_consegna}
                  onChange={(e) => setNewResponse({ ...newResponse, tempi_consegna: e.target.value })}
                  placeholder="Es: 15 giorni"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Condizioni di Pagamento</Label>
                <Input
                  value={newResponse.condizioni_pagamento}
                  onChange={(e) => setNewResponse({ ...newResponse, condizioni_pagamento: e.target.value })}
                  placeholder="Es: 30gg DFFM"
                />
              </div>
              <div className="grid gap-2">
                <Label>Validità Offerta</Label>
                <Input
                  type="date"
                  value={newResponse.validita_offerta}
                  onChange={(e) => setNewResponse({ ...newResponse, validita_offerta: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Note Tecniche</Label>
              <Textarea
                value={newResponse.note_tecniche}
                onChange={(e) => setNewResponse({ ...newResponse, note_tecniche: e.target.value })}
                placeholder="Note tecniche, specifiche, esclusioni..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Annulla</Button>
            <Button 
              onClick={() => selectedRFQ && addResponseMutation.mutate({ rfq_id: selectedRFQ.id, ...newResponse })}
              disabled={!newResponse.fornitore_nome || !newResponse.importo_offerto}
            >
              Registra Offerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparazione Offerte</DialogTitle>
            <DialogDescription>
              RFQ: {selectedRFQ?.numero} - {selectedRFQ?.oggetto}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Criteri Pesi */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Criteri di Valutazione (Pesi %)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Prezzo</Label>
                  <Input
                    type="number"
                    value={comparisonData.criteri.prezzo}
                    onChange={(e) => setComparisonData({
                      ...comparisonData,
                      criteri: { ...comparisonData.criteri, prezzo: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tempi</Label>
                  <Input
                    type="number"
                    value={comparisonData.criteri.tempi}
                    onChange={(e) => setComparisonData({
                      ...comparisonData,
                      criteri: { ...comparisonData.criteri, tempi: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Qualità</Label>
                  <Input
                    type="number"
                    value={comparisonData.criteri.qualita}
                    onChange={(e) => setComparisonData({
                      ...comparisonData,
                      criteri: { ...comparisonData.criteri, qualita: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Offerte da Comparare */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Offerte Ricevute</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornitore</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Tempi</TableHead>
                      <TableHead>Condizioni</TableHead>
                      <TableHead>Azione</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRFQ && getResponsesForRFQ(selectedRFQ.id).map((resp) => (
                      <TableRow key={resp.id}>
                        <TableCell className="font-medium">{resp.fornitore_nome}</TableCell>
                        <TableCell>€ {resp.importo_offerto.toLocaleString('it-IT')}</TableCell>
                        <TableCell>{resp.tempi_consegna || '-'}</TableCell>
                        <TableCell>{resp.condizioni_pagamento || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={selectedResponse?.id === resp.id ? 'default' : 'outline'}
                            onClick={() => setSelectedResponse(resp)}
                          >
                            <Trophy className="w-3 h-3 mr-1" />
                            Seleziona
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-2">
              <Label>Motivazione della Scelta *</Label>
              <Textarea
                value={comparisonData.motivazione_scelta}
                onChange={(e) => setComparisonData({ ...comparisonData, motivazione_scelta: e.target.value })}
                placeholder="Motivare la scelta del fornitore vincente..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Note Commissione</Label>
              <Textarea
                value={comparisonData.note_commissione}
                onChange={(e) => setComparisonData({ ...comparisonData, note_commissione: e.target.value })}
                placeholder="Note aggiuntive della commissione..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>Annulla</Button>
            <Button 
              onClick={() => selectedRFQ && selectedResponse && selectWinnerMutation.mutate({
                rfq_id: selectedRFQ.id,
                risposta_id: selectedResponse.id,
                motivazione: comparisonData.motivazione_scelta
              })}
              disabled={!selectedResponse || !comparisonData.motivazione_scelta}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Conferma Selezione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettaglio RFQ {selectedRFQ?.numero}</DialogTitle>
          </DialogHeader>
          {selectedRFQ && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Oggetto</Label>
                  <p className="font-medium">{selectedRFQ.oggetto}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge className={STATO_COLORS[selectedRFQ.stato]}>{selectedRFQ.stato}</Badge>
                </div>
              </div>
              {selectedRFQ.descrizione && (
                <div>
                  <Label className="text-muted-foreground">Descrizione</Label>
                  <p>{selectedRFQ.descrizione}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Importo Stimato</Label>
                  <p className="font-medium">
                    {selectedRFQ.importo_stimato 
                      ? `€ ${selectedRFQ.importo_stimato.toLocaleString('it-IT')}` 
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Emissione</Label>
                  <p>{format(new Date(selectedRFQ.data_emissione), 'dd/MM/yyyy', { locale: it })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Scadenza</Label>
                  <p>{format(new Date(selectedRFQ.data_scadenza), 'dd/MM/yyyy', { locale: it })}</p>
                </div>
              </div>
              
              {/* Offerte Ricevute */}
              <div>
                <Label className="text-muted-foreground">Offerte Ricevute ({getResponsesForRFQ(selectedRFQ.id).length})</Label>
                <div className="mt-2 space-y-2">
                  {getResponsesForRFQ(selectedRFQ.id).map((resp) => (
                    <Card key={resp.id} className={resp.selezionata ? 'border-green-500' : ''}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{resp.fornitore_nome}</p>
                          <p className="text-sm text-muted-foreground">
                            € {resp.importo_offerto.toLocaleString('it-IT')} - {resp.tempi_consegna || 'N/D'}
                          </p>
                        </div>
                        {resp.selezionata && (
                          <Badge className="bg-green-100 text-green-800">
                            <Trophy className="w-3 h-3 mr-1" />
                            Vincente
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedRFQ.note && (
                <div>
                  <Label className="text-muted-foreground">Note</Label>
                  <p>{selectedRFQ.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
