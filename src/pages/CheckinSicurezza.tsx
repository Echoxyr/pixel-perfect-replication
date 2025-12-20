import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Shield,
  Plus,
  Trash2,
  Eye,
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardHat,
  Flame,
  Users,
  AlertOctagon,
  Briefcase,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';

interface CheckinSicurezza {
  id: string;
  cantiere_id: string | null;
  cantiere_nome: string;
  data: string;
  ora: string;
  eseguito_da: string;
  ruolo: string | null;
  dpi_verificati: boolean;
  dpi_mancanti: string | null;
  briefing_effettuato: boolean;
  argomenti_briefing: string | null;
  condizioni_meteo_ok: boolean;
  segnalazioni_pericoli: string | null;
  area_lavoro_delimitata: boolean;
  mezzi_verificati: boolean;
  primo_soccorso_ok: boolean;
  estintori_ok: boolean;
  note: string | null;
  firma_responsabile: string | null;
  created_at: string;
}

export default function CheckinSicurezzaPage() {
  const queryClient = useQueryClient();
  const { cantieri } = useWorkHub();
  const [showNew, setShowNew] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<CheckinSicurezza | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCantiere, setFilterCantiere] = useState<string>('all');
  const [filterDate, setFilterDate] = useState('');

  const [newCheckin, setNewCheckin] = useState({
    cantiere_id: '',
    cantiere_nome: '',
    eseguito_da: '',
    ruolo: '',
    dpi_verificati: false,
    dpi_mancanti: '',
    briefing_effettuato: false,
    argomenti_briefing: '',
    condizioni_meteo_ok: true,
    segnalazioni_pericoli: '',
    area_lavoro_delimitata: false,
    mezzi_verificati: false,
    primo_soccorso_ok: false,
    estintori_ok: false,
    note: '',
    firma_responsabile: '',
  });

  const { data: checkins = [], isLoading } = useQuery({
    queryKey: ['checkin_sicurezza'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkin_sicurezza')
        .select('*')
        .order('data', { ascending: false })
        .order('ora', { ascending: false });
      if (error) throw error;
      return data as CheckinSicurezza[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newCheckin) => {
      const cantiere = cantieri.find(c => c.id === data.cantiere_id);
      const { error } = await supabase.from('checkin_sicurezza').insert([{
        ...data,
        cantiere_nome: cantiere?.nome || data.cantiere_nome,
        data: format(new Date(), 'yyyy-MM-dd'),
        ora: format(new Date(), 'HH:mm:ss'),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin_sicurezza'] });
      setShowNew(false);
      resetForm();
      toast.success('Check-in sicurezza registrato');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checkin_sicurezza').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin_sicurezza'] });
      toast.success('Check-in eliminato');
    },
  });

  const resetForm = () => {
    setNewCheckin({
      cantiere_id: '',
      cantiere_nome: '',
      eseguito_da: '',
      ruolo: '',
      dpi_verificati: false,
      dpi_mancanti: '',
      briefing_effettuato: false,
      argomenti_briefing: '',
      condizioni_meteo_ok: true,
      segnalazioni_pericoli: '',
      area_lavoro_delimitata: false,
      mezzi_verificati: false,
      primo_soccorso_ok: false,
      estintori_ok: false,
      note: '',
      firma_responsabile: '',
    });
  };

  const getComplianceScore = (c: CheckinSicurezza) => {
    const checks = [c.dpi_verificati, c.briefing_effettuato, c.condizioni_meteo_ok, c.area_lavoro_delimitata, c.mezzi_verificati, c.primo_soccorso_ok, c.estintori_ok];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const filteredCheckins = checkins.filter(c => {
    if (filterCantiere !== 'all' && c.cantiere_id !== filterCantiere) return false;
    if (filterDate && c.data !== filterDate) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return c.cantiere_nome.toLowerCase().includes(s) || c.eseguito_da.toLowerCase().includes(s);
    }
    return true;
  });

  const todayCheckins = checkins.filter(c => c.data === format(new Date(), 'yyyy-MM-dd'));
  const stats = {
    totaleOggi: todayCheckins.length,
    conformiOggi: todayCheckins.filter(c => getComplianceScore(c) >= 80).length,
    problemiSegnalati: todayCheckins.filter(c => c.segnalazioni_pericoli).length,
    cantieriCoperti: new Set(todayCheckins.map(c => c.cantiere_id)).size,
  };

  const handleExport = () => {
    exportToExcel(filteredCheckins.map(c => ({ ...c, compliance: getComplianceScore(c) + '%' })), [
      { key: 'data', header: 'Data', width: 12 },
      { key: 'ora', header: 'Ora', width: 10 },
      { key: 'cantiere_nome', header: 'Cantiere', width: 25 },
      { key: 'eseguito_da', header: 'Responsabile', width: 20 },
      { key: 'compliance', header: 'Conformità', width: 12 },
      { key: 'dpi_verificati', header: 'DPI OK', width: 10 },
      { key: 'briefing_effettuato', header: 'Briefing', width: 10 },
      { key: 'segnalazioni_pericoli', header: 'Segnalazioni', width: 30 },
    ], 'checkin_sicurezza');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" />Check-in Sicurezza</h1>
          <p className="text-muted-foreground">Verifiche giornaliere sicurezza cantiere</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Esporta</Button>
          <Button onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-2" />Nuovo Check-in</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Check-in Oggi</p><p className="text-2xl font-bold">{stats.totaleOggi}</p></div><Shield className="w-8 h-8 text-primary/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Conformi</p><p className="text-2xl font-bold text-emerald-500">{stats.conformiOggi}</p></div><CheckCircle className="w-8 h-8 text-emerald-500/20" /></div></CardContent></Card>
        <Card className={stats.problemiSegnalati > 0 ? 'border-amber-500/50' : ''}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Segnalazioni</p><p className="text-2xl font-bold text-amber-500">{stats.problemiSegnalati}</p></div><AlertTriangle className="w-8 h-8 text-amber-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Cantieri Coperti</p><p className="text-2xl font-bold text-blue-500">{stats.cantieriCoperti}</p></div><HardHat className="w-8 h-8 text-blue-500/20" /></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cerca cantiere, responsabile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-auto" />
            <Select value={filterCantiere} onValueChange={setFilterCantiere}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Cantiere" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i cantieri</SelectItem>
                {cantieri.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredCheckins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Shield className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Nessun check-in trovato</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Ora</TableHead>
                  <TableHead>Cantiere</TableHead>
                  <TableHead>Responsabile</TableHead>
                  <TableHead>DPI</TableHead>
                  <TableHead>Briefing</TableHead>
                  <TableHead>P.Soccorso</TableHead>
                  <TableHead>Estintori</TableHead>
                  <TableHead>Conformità</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCheckins.map((c) => {
                  const score = getComplianceScore(c);
                  return (
                    <TableRow key={c.id} className={c.segnalazioni_pericoli ? 'bg-amber-500/5' : ''}>
                      <TableCell className="font-mono text-sm">{format(new Date(c.data), 'dd/MM/yy')} {c.ora.slice(0, 5)}</TableCell>
                      <TableCell className="font-medium">{c.cantiere_nome}</TableCell>
                      <TableCell>{c.eseguito_da}</TableCell>
                      <TableCell>{c.dpi_verificati ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</TableCell>
                      <TableCell>{c.briefing_effettuato ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</TableCell>
                      <TableCell>{c.primo_soccorso_ok ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</TableCell>
                      <TableCell>{c.estintori_ok ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}</TableCell>
                      <TableCell>
                        <Badge className={score >= 80 ? 'bg-emerald-500/15 text-emerald-500' : score >= 50 ? 'bg-amber-500/15 text-amber-500' : 'bg-red-500/15 text-red-500'}>
                          {score}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedCheckin(c); setShowView(true); }}><Eye className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nuovo Check-in */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuovo Check-in Sicurezza</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cantiere *</label>
                <Select value={newCheckin.cantiere_id} onValueChange={(v) => setNewCheckin(p => ({ ...p, cantiere_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>{cantieri.filter(c => c.stato === 'attivo').map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium mb-2 block">Eseguito da *</label><Input value={newCheckin.eseguito_da} onChange={(e) => setNewCheckin(p => ({ ...p, eseguito_da: e.target.value }))} placeholder="Nome e cognome" /></div>
              <div><label className="text-sm font-medium mb-2 block">Ruolo</label><Input value={newCheckin.ruolo} onChange={(e) => setNewCheckin(p => ({ ...p, ruolo: e.target.value }))} placeholder="es. Capo cantiere" /></div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Verifiche</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox id="dpi" checked={newCheckin.dpi_verificati} onCheckedChange={(v) => setNewCheckin(p => ({ ...p, dpi_verificati: !!v }))} />
                  <label htmlFor="dpi" className="flex items-center gap-2 cursor-pointer"><HardHat className="w-4 h-4" />DPI Verificati</label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox id="briefing" checked={newCheckin.briefing_effettuato} onCheckedChange={(v) => setNewCheckin(p => ({ ...p, briefing_effettuato: !!v }))} />
                  <label htmlFor="briefing" className="flex items-center gap-2 cursor-pointer"><Users className="w-4 h-4" />Briefing Effettuato</label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox id="area" checked={newCheckin.area_lavoro_delimitata} onCheckedChange={(v) => setNewCheckin(p => ({ ...p, area_lavoro_delimitata: !!v }))} />
                  <label htmlFor="area" className="flex items-center gap-2 cursor-pointer"><AlertOctagon className="w-4 h-4" />Area Delimitata</label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox id="mezzi" checked={newCheckin.mezzi_verificati} onCheckedChange={(v) => setNewCheckin(p => ({ ...p, mezzi_verificati: !!v }))} />
                  <label htmlFor="mezzi" className="flex items-center gap-2 cursor-pointer"><Briefcase className="w-4 h-4" />Mezzi Verificati</label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox id="soccorso" checked={newCheckin.primo_soccorso_ok} onCheckedChange={(v) => setNewCheckin(p => ({ ...p, primo_soccorso_ok: !!v }))} />
                  <label htmlFor="soccorso" className="flex items-center gap-2 cursor-pointer"><Shield className="w-4 h-4" />Primo Soccorso OK</label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox id="estintori" checked={newCheckin.estintori_ok} onCheckedChange={(v) => setNewCheckin(p => ({ ...p, estintori_ok: !!v }))} />
                  <label htmlFor="estintori" className="flex items-center gap-2 cursor-pointer"><Flame className="w-4 h-4" />Estintori OK</label>
                </div>
              </div>
            </div>

            {!newCheckin.dpi_verificati && (
              <div><label className="text-sm font-medium mb-2 block text-red-500">DPI Mancanti</label><Textarea placeholder="Elenca i DPI mancanti..." value={newCheckin.dpi_mancanti} onChange={(e) => setNewCheckin(p => ({ ...p, dpi_mancanti: e.target.value }))} /></div>
            )}

            {newCheckin.briefing_effettuato && (
              <div><label className="text-sm font-medium mb-2 block">Argomenti Briefing</label><Textarea placeholder="Argomenti trattati..." value={newCheckin.argomenti_briefing} onChange={(e) => setNewCheckin(p => ({ ...p, argomenti_briefing: e.target.value }))} /></div>
            )}

            <div><label className="text-sm font-medium mb-2 block flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Segnalazioni Pericoli</label><Textarea placeholder="Eventuali pericoli o situazioni da segnalare..." value={newCheckin.segnalazioni_pericoli} onChange={(e) => setNewCheckin(p => ({ ...p, segnalazioni_pericoli: e.target.value }))} /></div>

            <div><label className="text-sm font-medium mb-2 block">Note</label><Textarea value={newCheckin.note} onChange={(e) => setNewCheckin(p => ({ ...p, note: e.target.value }))} /></div>

            <div><label className="text-sm font-medium mb-2 block">Firma Responsabile</label><Input placeholder="Nome e cognome del responsabile" value={newCheckin.firma_responsabile} onChange={(e) => setNewCheckin(p => ({ ...p, firma_responsabile: e.target.value }))} /></div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNew(false); resetForm(); }}>Annulla</Button>
              <Button className="flex-1" onClick={() => createMutation.mutate(newCheckin)} disabled={!newCheckin.cantiere_id || !newCheckin.eseguito_da || createMutation.isPending}>
                {createMutation.isPending ? 'Registrazione...' : 'Registra Check-in'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza */}
      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Check-in del {selectedCheckin && format(new Date(selectedCheckin.data), 'dd MMMM yyyy', { locale: it })}</DialogTitle></DialogHeader>
          {selectedCheckin && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Cantiere</p><p className="font-medium">{selectedCheckin.cantiere_nome}</p></div>
                <div><p className="text-sm text-muted-foreground">Ora</p><p className="font-medium">{selectedCheckin.ora.slice(0, 5)}</p></div>
                <div><p className="text-sm text-muted-foreground">Responsabile</p><p className="font-medium">{selectedCheckin.eseguito_da}</p></div>
                <div><p className="text-sm text-muted-foreground">Conformità</p><Badge className={getComplianceScore(selectedCheckin) >= 80 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}>{getComplianceScore(selectedCheckin)}%</Badge></div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'DPI', ok: selectedCheckin.dpi_verificati },
                  { label: 'Briefing', ok: selectedCheckin.briefing_effettuato },
                  { label: 'Area Delimitata', ok: selectedCheckin.area_lavoro_delimitata },
                  { label: 'Mezzi', ok: selectedCheckin.mezzi_verificati },
                  { label: 'Primo Soccorso', ok: selectedCheckin.primo_soccorso_ok },
                  { label: 'Estintori', ok: selectedCheckin.estintori_ok },
                ].map(v => (
                  <div key={v.label} className="flex items-center gap-2 p-2 border rounded">
                    {v.ok ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">{v.label}</span>
                  </div>
                ))}
              </div>
              {selectedCheckin.segnalazioni_pericoli && (
                <>
                  <Separator />
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm font-medium text-amber-500 mb-1">Segnalazioni Pericoli</p>
                    <p>{selectedCheckin.segnalazioni_pericoli}</p>
                  </div>
                </>
              )}
              {selectedCheckin.dpi_mancanti && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm font-medium text-red-500 mb-1">DPI Mancanti</p>
                  <p>{selectedCheckin.dpi_mancanti}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}