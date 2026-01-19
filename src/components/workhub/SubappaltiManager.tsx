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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Building2, Plus, FileText, Users, Calendar, Euro, 
  CheckCircle, XCircle, AlertTriangle, Clock, Eye, Edit, 
  Trash2, FileCheck, Phone, Mail, Briefcase
} from 'lucide-react';

interface Subappalto {
  id: string;
  numero_contratto: string;
  impresa_id?: string;
  impresa_nome?: string;
  cantiere_id?: string;
  lotto?: string;
  oggetto: string;
  importo_contratto: number;
  importo_autorizzato?: number;
  percentuale_ribasso?: number;
  stato: string;
  data_contratto?: string;
  data_inizio_lavori?: string;
  data_fine_prevista?: string;
  data_fine_effettiva?: string;
  condizioni_pagamento?: string;
  penali?: string;
  referente_nome?: string;
  referente_telefono?: string;
  referente_email?: string;
  documenti_obbligatori?: any[];
  documenti_ricevuti?: any[];
  note?: string;
  allegati?: any[];
  created_at: string;
}

interface SubappaltoDocumento {
  id: string;
  subappalto_id: string;
  tipo_documento: string;
  nome_documento?: string;
  stato: string;
  data_richiesta?: string;
  data_ricezione?: string;
  data_verifica?: string;
  data_scadenza?: string;
  verificato_da?: string;
  note?: string;
  file_url?: string;
}

const STATO_COLORS: Record<string, string> = {
  bozza: 'bg-gray-100 text-gray-800',
  in_approvazione: 'bg-yellow-100 text-yellow-800',
  affidato: 'bg-blue-100 text-blue-800',
  in_corso: 'bg-green-100 text-green-800',
  sospeso: 'bg-orange-100 text-orange-800',
  chiuso: 'bg-purple-100 text-purple-800',
  risolto: 'bg-red-100 text-red-800'
};

const DOC_STATO_COLORS: Record<string, string> = {
  richiesto: 'bg-gray-100 text-gray-800',
  ricevuto: 'bg-blue-100 text-blue-800',
  in_verifica: 'bg-yellow-100 text-yellow-800',
  verificato: 'bg-green-100 text-green-800',
  respinto: 'bg-red-100 text-red-800',
  scaduto: 'bg-orange-100 text-orange-800'
};

const DOCUMENTI_OBBLIGATORI = [
  'DURC',
  'Visura Camerale',
  'DVR',
  'Polizza RCT/RCO',
  'POS',
  'Elenco Lavoratori',
  'Formazioni Sicurezza',
  'Idoneità Sanitarie',
  'Dichiarazione Antimafia',
  'SOA (se applicabile)'
];

export default function SubappaltiManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('contratti');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [selectedSubappalto, setSelectedSubappalto] = useState<Subappalto | null>(null);
  
  const [newSubappalto, setNewSubappalto] = useState({
    impresa_nome: '',
    cantiere_id: '',
    lotto: '',
    oggetto: '',
    importo_contratto: '',
    importo_autorizzato: '',
    percentuale_ribasso: '',
    data_contratto: '',
    data_inizio_lavori: '',
    data_fine_prevista: '',
    condizioni_pagamento: '',
    penali: '',
    referente_nome: '',
    referente_telefono: '',
    referente_email: '',
    note: ''
  });

  const [newDoc, setNewDoc] = useState({
    tipo_documento: '',
    data_scadenza: '',
    note: ''
  });

  // Fetch Subappalti
  const { data: subappalti = [], isLoading } = useQuery({
    queryKey: ['subappalti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subappalti')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Subappalto[];
    }
  });

  // Fetch Documenti Subappalti
  const { data: documentiSubappalti = [] } = useQuery({
    queryKey: ['subappalti-documenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subappalti_documenti')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SubappaltoDocumento[];
    }
  });

  // Fetch Cantieri
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

  // Fetch Imprese
  const { data: imprese = [] } = useQuery({
    queryKey: ['imprese'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imprese')
        .select('id, ragione_sociale')
        .order('ragione_sociale');
      if (error) throw error;
      return data;
    }
  });

  // Generate Contract Number
  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const count = subappalti.filter(s => s.numero_contratto?.includes(String(year))).length + 1;
    return `SUB-${year}-${String(count).padStart(4, '0')}`;
  };

  // Create Subappalto Mutation
  const createSubappaltoMutation = useMutation({
    mutationFn: async (data: typeof newSubappalto) => {
      const { error } = await supabase.from('subappalti').insert({
        numero_contratto: generateContractNumber(),
        impresa_nome: data.impresa_nome,
        cantiere_id: data.cantiere_id || null,
        lotto: data.lotto || null,
        oggetto: data.oggetto,
        importo_contratto: parseFloat(data.importo_contratto),
        importo_autorizzato: data.importo_autorizzato ? parseFloat(data.importo_autorizzato) : null,
        percentuale_ribasso: data.percentuale_ribasso ? parseFloat(data.percentuale_ribasso) : null,
        data_contratto: data.data_contratto || null,
        data_inizio_lavori: data.data_inizio_lavori || null,
        data_fine_prevista: data.data_fine_prevista || null,
        condizioni_pagamento: data.condizioni_pagamento || null,
        penali: data.penali || null,
        referente_nome: data.referente_nome || null,
        referente_telefono: data.referente_telefono || null,
        referente_email: data.referente_email || null,
        note: data.note || null,
        stato: 'bozza'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subappalti'] });
      setShowNewDialog(false);
      resetNewSubappalto();
      toast({ title: 'Subappalto Creato', description: 'Contratto di subappalto creato con successo' });
    },
    onError: (error: any) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const { error } = await supabase.from('subappalti').update({ stato }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subappalti'] });
      toast({ title: 'Stato Aggiornato' });
    }
  });

  // Add Document Mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (data: { subappalto_id: string } & typeof newDoc) => {
      const { error } = await supabase.from('subappalti_documenti').insert({
        subappalto_id: data.subappalto_id,
        tipo_documento: data.tipo_documento,
        data_scadenza: data.data_scadenza || null,
        note: data.note || null,
        stato: 'richiesto'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subappalti-documenti'] });
      setShowDocDialog(false);
      setNewDoc({ tipo_documento: '', data_scadenza: '', note: '' });
      toast({ title: 'Documento Aggiunto', description: 'Documento richiesto registrato' });
    }
  });

  // Update Document Status Mutation
  const updateDocStatusMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const updates: any = { stato };
      if (stato === 'ricevuto') updates.data_ricezione = new Date().toISOString().split('T')[0];
      if (stato === 'verificato') updates.data_verifica = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.from('subappalti_documenti').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subappalti-documenti'] });
      toast({ title: 'Stato Documento Aggiornato' });
    }
  });

  // Delete Subappalto Mutation
  const deleteSubappaltoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subappalti').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subappalti'] });
      toast({ title: 'Subappalto Eliminato' });
    }
  });

  const resetNewSubappalto = () => {
    setNewSubappalto({
      impresa_nome: '',
      cantiere_id: '',
      lotto: '',
      oggetto: '',
      importo_contratto: '',
      importo_autorizzato: '',
      percentuale_ribasso: '',
      data_contratto: '',
      data_inizio_lavori: '',
      data_fine_prevista: '',
      condizioni_pagamento: '',
      penali: '',
      referente_nome: '',
      referente_telefono: '',
      referente_email: '',
      note: ''
    });
  };

  const getDocumentiForSubappalto = (subappalto_id: string) => 
    documentiSubappalti.filter(d => d.subappalto_id === subappalto_id);

  const calculateDocCompliance = (subappalto_id: string) => {
    const docs = getDocumentiForSubappalto(subappalto_id);
    const verified = docs.filter(d => d.stato === 'verificato').length;
    const total = docs.length || 1;
    return Math.round((verified / total) * 100);
  };

  // Statistics
  const stats = {
    totali: subappalti.length,
    bozza: subappalti.filter(s => s.stato === 'bozza').length,
    inCorso: subappalti.filter(s => s.stato === 'in_corso').length,
    chiusi: subappalti.filter(s => s.stato === 'chiuso').length,
    importoTotale: subappalti.reduce((sum, s) => sum + (s.importo_contratto || 0), 0),
    documentiPendenti: documentiSubappalti.filter(d => d.stato === 'richiesto' || d.stato === 'ricevuto').length,
    documentiScaduti: documentiSubappalti.filter(d => d.stato === 'scaduto' || 
      (d.data_scadenza && differenceInDays(new Date(d.data_scadenza), new Date()) < 0)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Gestione Subappalti
          </h2>
          <p className="text-sm text-muted-foreground">
            Contratti, lotti, documenti obbligatori e scadenze
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Subappalto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3">
          <div className="text-2xl font-bold">{stats.totali}</div>
          <div className="text-xs text-muted-foreground">Totali</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-gray-600">{stats.bozza}</div>
          <div className="text-xs text-muted-foreground">Bozze</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-600">{stats.inCorso}</div>
          <div className="text-xs text-muted-foreground">In Corso</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-purple-600">{stats.chiusi}</div>
          <div className="text-xs text-muted-foreground">Chiusi</div>
        </Card>
        <Card className="p-3">
          <div className="text-lg font-bold text-blue-600">€{(stats.importoTotale / 1000).toFixed(0)}k</div>
          <div className="text-xs text-muted-foreground">Importo Tot.</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-yellow-600">{stats.documentiPendenti}</div>
          <div className="text-xs text-muted-foreground">Doc. Pendenti</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-red-600">{stats.documentiScaduti}</div>
          <div className="text-xs text-muted-foreground">Doc. Scaduti</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contratti" className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Contratti
          </TabsTrigger>
          <TabsTrigger value="documenti" className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            Checklist Documenti
          </TabsTrigger>
          <TabsTrigger value="scadenze" className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Scadenzario
          </TabsTrigger>
        </TabsList>

        {/* Contratti Tab */}
        <TabsContent value="contratti" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1100px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N. Contratto</TableHead>
                        <TableHead>Impresa</TableHead>
                        <TableHead>Cantiere/Lotto</TableHead>
                        <TableHead>Oggetto</TableHead>
                        <TableHead>Importo</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Referente</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subappalti.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                            Nessun subappalto registrato
                          </TableCell>
                        </TableRow>
                      ) : (
                        subappalti.map((sub) => {
                          const cantiere = cantieri.find(c => c.id === sub.cantiere_id);
                          const compliance = calculateDocCompliance(sub.id);
                          
                          return (
                            <TableRow key={sub.id}>
                              <TableCell className="font-mono text-sm">{sub.numero_contratto}</TableCell>
                              <TableCell className="font-medium">{sub.impresa_nome || '-'}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{cantiere?.nome || '-'}</div>
                                  {sub.lotto && <div className="text-muted-foreground text-xs">Lotto: {sub.lotto}</div>}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">{sub.oggetto}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium">€ {sub.importo_contratto.toLocaleString('it-IT')}</div>
                                  {sub.percentuale_ribasso && (
                                    <div className="text-xs text-muted-foreground">-{sub.percentuale_ribasso}%</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs space-y-0.5">
                                  {sub.data_inizio_lavori && (
                                    <div>Inizio: {format(new Date(sub.data_inizio_lavori), 'dd/MM/yy')}</div>
                                  )}
                                  {sub.data_fine_prevista && (
                                    <div>Fine: {format(new Date(sub.data_fine_prevista), 'dd/MM/yy')}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={sub.stato}
                                  onValueChange={(v) => updateStatusMutation.mutate({ id: sub.id, stato: v })}
                                >
                                  <SelectTrigger className="h-7 text-xs w-28">
                                    <Badge className={STATO_COLORS[sub.stato]}>{sub.stato.replace('_', ' ')}</Badge>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="bozza">Bozza</SelectItem>
                                    <SelectItem value="in_approvazione">In Approvazione</SelectItem>
                                    <SelectItem value="affidato">Affidato</SelectItem>
                                    <SelectItem value="in_corso">In Corso</SelectItem>
                                    <SelectItem value="sospeso">Sospeso</SelectItem>
                                    <SelectItem value="chiuso">Chiuso</SelectItem>
                                    <SelectItem value="risolto">Risolto</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="w-16">
                                  <Progress value={compliance} className="h-2" />
                                  <div className="text-xs text-center mt-0.5">{compliance}%</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs">
                                  {sub.referente_nome || '-'}
                                  {sub.referente_telefono && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Phone className="w-3 h-3" />
                                      {sub.referente_telefono}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedSubappalto(sub);
                                      setShowDetailDialog(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedSubappalto(sub);
                                      setShowDocDialog(true);
                                    }}
                                  >
                                    <FileCheck className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteSubappaltoMutation.mutate(sub.id)}
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

        {/* Documenti Tab */}
        <TabsContent value="documenti" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subappalto</TableHead>
                        <TableHead>Tipo Documento</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Data Richiesta</TableHead>
                        <TableHead>Data Ricezione</TableHead>
                        <TableHead>Scadenza</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentiSubappalti.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Nessun documento richiesto
                          </TableCell>
                        </TableRow>
                      ) : (
                        documentiSubappalti.map((doc) => {
                          const sub = subappalti.find(s => s.id === doc.subappalto_id);
                          const isExpired = doc.data_scadenza && differenceInDays(new Date(doc.data_scadenza), new Date()) < 0;
                          
                          return (
                            <TableRow key={doc.id} className={isExpired ? 'bg-red-50' : ''}>
                              <TableCell className="font-mono text-sm">{sub?.numero_contratto || '-'}</TableCell>
                              <TableCell className="font-medium">{doc.tipo_documento}</TableCell>
                              <TableCell>
                                <Select
                                  value={doc.stato}
                                  onValueChange={(v) => updateDocStatusMutation.mutate({ id: doc.id, stato: v })}
                                >
                                  <SelectTrigger className="h-7 text-xs w-28">
                                    <Badge className={DOC_STATO_COLORS[doc.stato]}>{doc.stato}</Badge>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="richiesto">Richiesto</SelectItem>
                                    <SelectItem value="ricevuto">Ricevuto</SelectItem>
                                    <SelectItem value="in_verifica">In Verifica</SelectItem>
                                    <SelectItem value="verificato">Verificato</SelectItem>
                                    <SelectItem value="respinto">Respinto</SelectItem>
                                    <SelectItem value="scaduto">Scaduto</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {doc.data_richiesta 
                                  ? format(new Date(doc.data_richiesta), 'dd/MM/yyyy')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {doc.data_ricezione 
                                  ? format(new Date(doc.data_ricezione), 'dd/MM/yyyy')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {doc.data_scadenza ? (
                                  <div className={isExpired ? 'text-red-600 font-medium' : ''}>
                                    {format(new Date(doc.data_scadenza), 'dd/MM/yyyy')}
                                    {isExpired && <span className="ml-1 text-xs">(Scaduto)</span>}
                                  </div>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">{doc.note || '-'}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
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

        {/* Scadenze Tab */}
        <TabsContent value="scadenze" className="mt-4">
          <div className="grid gap-4">
            {subappalti.filter(s => s.data_fine_prevista).map((sub) => {
              const daysRemaining = differenceInDays(new Date(sub.data_fine_prevista!), new Date());
              const isUrgent = daysRemaining <= 30 && daysRemaining >= 0;
              const isPast = daysRemaining < 0;
              
              return (
                <Card key={sub.id} className={isPast ? 'border-red-300' : isUrgent ? 'border-orange-300' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{sub.numero_contratto} - {sub.impresa_nome}</div>
                        <div className="text-sm text-muted-foreground">{sub.oggetto}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          Scadenza: {format(new Date(sub.data_fine_prevista!), 'dd/MM/yyyy', { locale: it })}
                        </div>
                        <Badge className={isPast ? 'bg-red-100 text-red-800' : isUrgent ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                          {isPast ? 'Scaduto' : isUrgent ? `${daysRemaining}g rimanenti` : 'In tempo'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {subappalti.filter(s => s.data_fine_prevista).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nessuna scadenza contrattuale registrata
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Subappalto Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo Contratto di Subappalto</DialogTitle>
            <DialogDescription>
              Registra un nuovo contratto di subappalto
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Impresa Subappaltatrice *</Label>
                <Input
                  value={newSubappalto.impresa_nome}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, impresa_nome: e.target.value })}
                  placeholder="Ragione sociale"
                />
              </div>
              <div className="grid gap-2">
                <Label>Cantiere</Label>
                <Select
                  value={newSubappalto.cantiere_id}
                  onValueChange={(v) => setNewSubappalto({ ...newSubappalto, cantiere_id: v })}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Lotto</Label>
                <Input
                  value={newSubappalto.lotto}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, lotto: e.target.value })}
                  placeholder="Es: Lotto 1 - Impianti"
                />
              </div>
              <div className="grid gap-2">
                <Label>Data Contratto</Label>
                <Input
                  type="date"
                  value={newSubappalto.data_contratto}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, data_contratto: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Oggetto del Contratto *</Label>
              <Textarea
                value={newSubappalto.oggetto}
                onChange={(e) => setNewSubappalto({ ...newSubappalto, oggetto: e.target.value })}
                placeholder="Descrizione delle lavorazioni oggetto del subappalto..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Importo Contratto (€) *</Label>
                <Input
                  type="number"
                  value={newSubappalto.importo_contratto}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, importo_contratto: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Importo Autorizzato (€)</Label>
                <Input
                  type="number"
                  value={newSubappalto.importo_autorizzato}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, importo_autorizzato: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Ribasso (%)</Label>
                <Input
                  type="number"
                  value={newSubappalto.percentuale_ribasso}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, percentuale_ribasso: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data Inizio Lavori</Label>
                <Input
                  type="date"
                  value={newSubappalto.data_inizio_lavori}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, data_inizio_lavori: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data Fine Prevista</Label>
                <Input
                  type="date"
                  value={newSubappalto.data_fine_prevista}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, data_fine_prevista: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Condizioni di Pagamento</Label>
              <Input
                value={newSubappalto.condizioni_pagamento}
                onChange={(e) => setNewSubappalto({ ...newSubappalto, condizioni_pagamento: e.target.value })}
                placeholder="Es: 60gg DFFM previa presentazione SAL"
              />
            </div>

            <div className="grid gap-2">
              <Label>Penali</Label>
              <Textarea
                value={newSubappalto.penali}
                onChange={(e) => setNewSubappalto({ ...newSubappalto, penali: e.target.value })}
                placeholder="Clausole penali per ritardi, non conformità..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Referente</Label>
                <Input
                  value={newSubappalto.referente_nome}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, referente_nome: e.target.value })}
                  placeholder="Nome e Cognome"
                />
              </div>
              <div className="grid gap-2">
                <Label>Telefono</Label>
                <Input
                  value={newSubappalto.referente_telefono}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, referente_telefono: e.target.value })}
                  placeholder="+39..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newSubappalto.referente_email}
                  onChange={(e) => setNewSubappalto({ ...newSubappalto, referente_email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Note</Label>
              <Textarea
                value={newSubappalto.note}
                onChange={(e) => setNewSubappalto({ ...newSubappalto, note: e.target.value })}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annulla</Button>
            <Button 
              onClick={() => createSubappaltoMutation.mutate(newSubappalto)}
              disabled={!newSubappalto.impresa_nome || !newSubappalto.oggetto || !newSubappalto.importo_contratto}
            >
              Crea Subappalto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dettaglio Subappalto {selectedSubappalto?.numero_contratto}</DialogTitle>
          </DialogHeader>
          {selectedSubappalto && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Impresa</Label>
                  <p className="font-medium">{selectedSubappalto.impresa_nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge className={STATO_COLORS[selectedSubappalto.stato]}>{selectedSubappalto.stato}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Oggetto</Label>
                <p>{selectedSubappalto.oggetto}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Importo Contratto</Label>
                  <p className="font-medium">€ {selectedSubappalto.importo_contratto.toLocaleString('it-IT')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Importo Autorizzato</Label>
                  <p>{selectedSubappalto.importo_autorizzato ? `€ ${selectedSubappalto.importo_autorizzato.toLocaleString('it-IT')}` : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ribasso</Label>
                  <p>{selectedSubappalto.percentuale_ribasso ? `${selectedSubappalto.percentuale_ribasso}%` : '-'}</p>
                </div>
              </div>
              
              {/* Documenti */}
              <div>
                <Label className="text-muted-foreground">Documenti ({getDocumentiForSubappalto(selectedSubappalto.id).length})</Label>
                <div className="mt-2 space-y-2">
                  {getDocumentiForSubappalto(selectedSubappalto.id).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{doc.tipo_documento}</span>
                      <Badge className={DOC_STATO_COLORS[doc.stato]}>{doc.stato}</Badge>
                    </div>
                  ))}
                  {getDocumentiForSubappalto(selectedSubappalto.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">Nessun documento richiesto</p>
                  )}
                </div>
              </div>

              {selectedSubappalto.condizioni_pagamento && (
                <div>
                  <Label className="text-muted-foreground">Condizioni Pagamento</Label>
                  <p>{selectedSubappalto.condizioni_pagamento}</p>
                </div>
              )}
              {selectedSubappalto.penali && (
                <div>
                  <Label className="text-muted-foreground">Penali</Label>
                  <p>{selectedSubappalto.penali}</p>
                </div>
              )}
              {selectedSubappalto.note && (
                <div>
                  <Label className="text-muted-foreground">Note</Label>
                  <p>{selectedSubappalto.note}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Documento Richiesto</DialogTitle>
            <DialogDescription>
              Subappalto: {selectedSubappalto?.numero_contratto}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tipo Documento *</Label>
              <Select
                value={newDoc.tipo_documento}
                onValueChange={(v) => setNewDoc({ ...newDoc, tipo_documento: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENTI_OBBLIGATORI.map((doc) => (
                    <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Data Scadenza</Label>
              <Input
                type="date"
                value={newDoc.data_scadenza}
                onChange={(e) => setNewDoc({ ...newDoc, data_scadenza: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Note</Label>
              <Textarea
                value={newDoc.note}
                onChange={(e) => setNewDoc({ ...newDoc, note: e.target.value })}
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocDialog(false)}>Annulla</Button>
            <Button 
              onClick={() => selectedSubappalto && addDocumentMutation.mutate({ subappalto_id: selectedSubappalto.id, ...newDoc })}
              disabled={!newDoc.tipo_documento}
            >
              Aggiungi Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
