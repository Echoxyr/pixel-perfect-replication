import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Download,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  StarOff,
  Eye,
  UserCircle,
  Briefcase,
  Wrench,
  Landmark,
  HardHat
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';

interface Contatto {
  id: string;
  tipo: string;
  ragione_sociale: string | null;
  nome: string;
  cognome: string | null;
  ruolo: string | null;
  azienda: string | null;
  email: string | null;
  telefono: string | null;
  cellulare: string | null;
  pec: string | null;
  indirizzo: string | null;
  citta: string | null;
  cap: string | null;
  provincia: string | null;
  partita_iva: string | null;
  codice_fiscale: string | null;
  codice_sdi: string | null;
  iban: string | null;
  note: string | null;
  tags: string[] | null;
  preferito: boolean;
  created_at: string;
}

const TIPI_CONTATTO = [
  { value: 'cliente', label: 'Cliente', icon: UserCircle },
  { value: 'fornitore', label: 'Fornitore', icon: Building },
  { value: 'subappaltatore', label: 'Subappaltatore', icon: HardHat },
  { value: 'professionista', label: 'Professionista', icon: Briefcase },
  { value: 'ente', label: 'Ente', icon: Landmark },
  { value: 'altro', label: 'Altro', icon: Users },
];

export default function Contatti() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedContatto, setSelectedContatto] = useState<Contatto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterPreferiti, setFilterPreferiti] = useState(false);

  const [newContatto, setNewContatto] = useState({
    tipo: 'cliente',
    ragione_sociale: '',
    nome: '',
    cognome: '',
    ruolo: '',
    azienda: '',
    email: '',
    telefono: '',
    cellulare: '',
    pec: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    partita_iva: '',
    codice_fiscale: '',
    codice_sdi: '',
    iban: '',
    note: '',
  });

  const { data: contatti = [], isLoading } = useQuery({
    queryKey: ['contatti'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contatti').select('*').order('nome');
      if (error) throw error;
      return data as Contatto[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newContatto) => {
      const { error } = await supabase.from('contatti').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatti'] });
      setShowNew(false);
      resetForm();
      toast.success('Contatto creato');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePreferitoMutation = useMutation({
    mutationFn: async ({ id, preferito }: { id: string; preferito: boolean }) => {
      const { error } = await supabase.from('contatti').update({ preferito }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatti'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contatti').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatti'] });
      toast.success('Contatto eliminato');
    },
  });

  const resetForm = () => {
    setNewContatto({
      tipo: 'cliente',
      ragione_sociale: '',
      nome: '',
      cognome: '',
      ruolo: '',
      azienda: '',
      email: '',
      telefono: '',
      cellulare: '',
      pec: '',
      indirizzo: '',
      citta: '',
      cap: '',
      provincia: '',
      partita_iva: '',
      codice_fiscale: '',
      codice_sdi: '',
      iban: '',
      note: '',
    });
  };

  const filteredContatti = contatti.filter(c => {
    if (filterTipo !== 'all' && c.tipo !== filterTipo) return false;
    if (filterPreferiti && !c.preferito) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return c.nome.toLowerCase().includes(s) ||
        c.cognome?.toLowerCase().includes(s) ||
        c.ragione_sociale?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.azienda?.toLowerCase().includes(s);
    }
    return true;
  });

  const stats = {
    totale: contatti.length,
    clienti: contatti.filter(c => c.tipo === 'cliente').length,
    fornitori: contatti.filter(c => c.tipo === 'fornitore').length,
    subappaltatori: contatti.filter(c => c.tipo === 'subappaltatore').length,
    preferiti: contatti.filter(c => c.preferito).length,
  };

  const handleExport = () => {
    exportToExcel(filteredContatti, [
      { key: 'tipo', header: 'Tipo', width: 15 },
      { key: 'ragione_sociale', header: 'Ragione Sociale', width: 25 },
      { key: 'nome', header: 'Nome', width: 15 },
      { key: 'cognome', header: 'Cognome', width: 15 },
      { key: 'email', header: 'Email', width: 25 },
      { key: 'telefono', header: 'Telefono', width: 15 },
      { key: 'citta', header: 'Città', width: 15 },
      { key: 'partita_iva', header: 'P.IVA', width: 15 },
    ], 'contatti');
  };

  const getTipoIcon = (tipo: string) => {
    const t = TIPI_CONTATTO.find(x => x.value === tipo);
    return t ? t.icon : Users;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" />Rubrica Contatti</h1>
          <p className="text-muted-foreground">Clienti, fornitori, subappaltatori e professionisti</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Esporta</Button>
          <Button onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-2" />Nuovo Contatto</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Totale</p><p className="text-2xl font-bold">{stats.totale}</p></div><Users className="w-8 h-8 text-primary/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Clienti</p><p className="text-2xl font-bold text-blue-500">{stats.clienti}</p></div><UserCircle className="w-8 h-8 text-blue-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Fornitori</p><p className="text-2xl font-bold text-emerald-500">{stats.fornitori}</p></div><Building className="w-8 h-8 text-emerald-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Subappaltatori</p><p className="text-2xl font-bold text-amber-500">{stats.subappaltatori}</p></div><HardHat className="w-8 h-8 text-amber-500/20" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Preferiti</p><p className="text-2xl font-bold text-yellow-500">{stats.preferiti}</p></div><Star className="w-8 h-8 text-yellow-500/20" /></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cerca nome, email, azienda..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                {TIPI_CONTATTO.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant={filterPreferiti ? 'default' : 'outline'} onClick={() => setFilterPreferiti(!filterPreferiti)}>
              <Star className={`w-4 h-4 mr-2 ${filterPreferiti ? 'fill-current' : ''}`} />
              Preferiti
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
          ) : filteredContatti.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Nessun contatto trovato</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Azienda</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Città</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContatti.map((c) => {
                  const TipoIcon = getTipoIcon(c.tipo);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => togglePreferitoMutation.mutate({ id: c.id, preferito: !c.preferito })}>
                          {c.preferito ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="flex items-center gap-1 w-fit"><TipoIcon className="w-3 h-3" />{c.tipo}</Badge></TableCell>
                      <TableCell className="font-medium">{c.ragione_sociale || `${c.nome} ${c.cognome || ''}`}</TableCell>
                      <TableCell>{c.azienda || '-'}</TableCell>
                      <TableCell>{c.email ? <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a> : '-'}</TableCell>
                      <TableCell>{c.telefono || c.cellulare || '-'}</TableCell>
                      <TableCell>{c.citta || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedContatto(c); setShowView(true); }}><Eye className="w-4 h-4" /></Button>
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

      {/* Dialog Nuovo Contatto */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuovo Contatto</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo *</label>
                <Select value={newContatto.tipo} onValueChange={(v) => setNewContatto(p => ({ ...p, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPI_CONTATTO.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Ragione Sociale</label>
                <Input placeholder="Per aziende" value={newContatto.ragione_sociale} onChange={(e) => setNewContatto(p => ({ ...p, ragione_sociale: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium mb-2 block">Nome *</label><Input value={newContatto.nome} onChange={(e) => setNewContatto(p => ({ ...p, nome: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">Cognome</label><Input value={newContatto.cognome} onChange={(e) => setNewContatto(p => ({ ...p, cognome: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">Ruolo</label><Input placeholder="es. Titolare, Responsabile..." value={newContatto.ruolo} onChange={(e) => setNewContatto(p => ({ ...p, ruolo: e.target.value }))} /></div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium mb-2 block">Email</label><Input type="email" value={newContatto.email} onChange={(e) => setNewContatto(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">Telefono</label><Input value={newContatto.telefono} onChange={(e) => setNewContatto(p => ({ ...p, telefono: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">Cellulare</label><Input value={newContatto.cellulare} onChange={(e) => setNewContatto(p => ({ ...p, cellulare: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">PEC</label><Input value={newContatto.pec} onChange={(e) => setNewContatto(p => ({ ...p, pec: e.target.value }))} /></div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2"><label className="text-sm font-medium mb-2 block">Indirizzo</label><Input value={newContatto.indirizzo} onChange={(e) => setNewContatto(p => ({ ...p, indirizzo: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">Città</label><Input value={newContatto.citta} onChange={(e) => setNewContatto(p => ({ ...p, citta: e.target.value }))} /></div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="text-sm font-medium mb-2 block">CAP</label><Input value={newContatto.cap} onChange={(e) => setNewContatto(p => ({ ...p, cap: e.target.value }))} /></div>
                <div className="w-20"><label className="text-sm font-medium mb-2 block">Prov.</label><Input maxLength={2} value={newContatto.provincia} onChange={(e) => setNewContatto(p => ({ ...p, provincia: e.target.value.toUpperCase() }))} /></div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium mb-2 block">Partita IVA</label><Input value={newContatto.partita_iva} onChange={(e) => setNewContatto(p => ({ ...p, partita_iva: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">Codice Fiscale</label><Input value={newContatto.codice_fiscale} onChange={(e) => setNewContatto(p => ({ ...p, codice_fiscale: e.target.value.toUpperCase() }))} /></div>
              <div><label className="text-sm font-medium mb-2 block">Codice SDI</label><Input maxLength={7} value={newContatto.codice_sdi} onChange={(e) => setNewContatto(p => ({ ...p, codice_sdi: e.target.value.toUpperCase() }))} /></div>
            </div>

            <div><label className="text-sm font-medium mb-2 block">IBAN</label><Input value={newContatto.iban} onChange={(e) => setNewContatto(p => ({ ...p, iban: e.target.value.toUpperCase().replace(/\s/g, '') }))} /></div>

            <div><label className="text-sm font-medium mb-2 block">Note</label><Textarea value={newContatto.note} onChange={(e) => setNewContatto(p => ({ ...p, note: e.target.value }))} /></div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowNew(false); resetForm(); }}>Annulla</Button>
              <Button className="flex-1" onClick={() => createMutation.mutate(newContatto)} disabled={!newContatto.nome || createMutation.isPending}>
                {createMutation.isPending ? 'Creazione...' : 'Crea Contatto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza */}
      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedContatto?.ragione_sociale || `${selectedContatto?.nome} ${selectedContatto?.cognome || ''}`}</DialogTitle></DialogHeader>
          {selectedContatto && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Tipo</p><Badge variant="outline">{selectedContatto.tipo}</Badge></div>
                {selectedContatto.ruolo && <div><p className="text-sm text-muted-foreground">Ruolo</p><p>{selectedContatto.ruolo}</p></div>}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {selectedContatto.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><a href={`mailto:${selectedContatto.email}`} className="text-primary hover:underline">{selectedContatto.email}</a></div>}
                {selectedContatto.telefono && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{selectedContatto.telefono}</div>}
                {selectedContatto.cellulare && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{selectedContatto.cellulare}</div>}
                {selectedContatto.pec && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{selectedContatto.pec} (PEC)</div>}
              </div>
              {(selectedContatto.indirizzo || selectedContatto.citta) && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>{selectedContatto.indirizzo}{selectedContatto.indirizzo && selectedContatto.citta && ', '}{selectedContatto.cap} {selectedContatto.citta} {selectedContatto.provincia && `(${selectedContatto.provincia})`}</div>
                  </div>
                </>
              )}
              {(selectedContatto.partita_iva || selectedContatto.codice_fiscale) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {selectedContatto.partita_iva && <div><p className="text-sm text-muted-foreground">P.IVA</p><p className="font-mono">{selectedContatto.partita_iva}</p></div>}
                    {selectedContatto.codice_fiscale && <div><p className="text-sm text-muted-foreground">Codice Fiscale</p><p className="font-mono">{selectedContatto.codice_fiscale}</p></div>}
                    {selectedContatto.codice_sdi && <div><p className="text-sm text-muted-foreground">Codice SDI</p><p className="font-mono">{selectedContatto.codice_sdi}</p></div>}
                  </div>
                </>
              )}
              {selectedContatto.iban && (
                <>
                  <Separator />
                  <div><p className="text-sm text-muted-foreground">IBAN</p><p className="font-mono">{selectedContatto.iban}</p></div>
                </>
              )}
              {selectedContatto.note && (
                <>
                  <Separator />
                  <div><p className="text-sm text-muted-foreground">Note</p><p>{selectedContatto.note}</p></div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}