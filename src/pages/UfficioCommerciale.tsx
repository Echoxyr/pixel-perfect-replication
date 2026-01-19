import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Plus,
  Building2,
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
  Calculator,
  Download,
  Search,
  Truck,
  Euro,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
  AlertOctagon,
  CheckCircle2,
  FileBadge,
  Upload,
  Calendar,
  AlertTriangle,
  FileWarning,
  Shield,
  Zap,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { Link } from 'react-router-dom';
import { differenceInDays, format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import DocumentFlowManager from '@/components/workhub/DocumentFlowManager';
import ComplianceMonitor from '@/components/workhub/ComplianceMonitor';
import { PostCreationActions, EntityType } from '@/components/workhub/PostCreationActions';
import { EntityLinks, DocumentFlowChain } from '@/components/workhub/EntityLinks';
import { useFileUpload } from '@/hooks/useFileUpload';
import RFQManager from '@/components/workhub/RFQManager';
import SubappaltiManager from '@/components/workhub/SubappaltiManager';

// Types
interface Fornitore {
  id: string;
  ragione_sociale: string;
  partita_iva: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  citta: string | null;
  cap: string | null;
  provincia: string | null;
  telefono: string | null;
  cellulare: string | null;
  email: string | null;
  pec: string | null;
  iban: string | null;
  categoria: string | null;
  sconto_base: number | null;
  condizioni_pagamento: string | null;
  note: string | null;
  stato: string;
  rating: number | null;
}

interface DocumentoFornitore {
  id: string;
  fornitore_id: string;
  tipo_documento: string;
  numero_documento: string | null;
  data_emissione: string | null;
  data_scadenza: string | null;
  ente_emittente: string | null;
  file_url: string | null;
  note: string | null;
  stato: string;
  obbligatorio: boolean;
  created_at: string;
}

interface PreventivoFornitore {
  id: string;
  numero: string;
  data: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  oggetto: string;
  importo: number | null;
  stato: string;
  scadenza: string | null;
  note: string | null;
}

interface OrdineFornitore {
  id: string;
  numero: string;
  data: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  importo: number;
  stato: string;
  data_consegna_prevista: string | null;
  data_consegna_effettiva: string | null;
  note: string | null;
}

interface Contratto {
  id: string;
  numero: string;
  titolo: string;
  tipo: string;
  contraente: string;
  importo: number;
  data_inizio: string;
  data_fine: string;
  stato: string;
  rinnovo_automatico: boolean | null;
  descrizione: string | null;
}

interface ListinoFornitore {
  id: string;
  fornitore_id: string | null;
  fornitore_nome: string;
  nome: string;
  valido_dal: string;
  valido_al: string | null;
  sconto_applicato: number | null;
  attivo: boolean | null;
}

// Tipi documenti obbligatori per fornitori
const TIPI_DOCUMENTO_FORNITORE = [
  { 
    tipo: 'DURC', 
    nome: 'DURC - Documento Unico Regolarità Contributiva', 
    obbligatorio: true,
    validitaGiorni: 120,
    descrizione: 'Certificato rilasciato da INPS/INAIL che attesta la regolarità contributiva'
  },
  { 
    tipo: 'VISURA_CAMERALE', 
    nome: 'Visura Camerale', 
    obbligatorio: true,
    validitaGiorni: 180,
    descrizione: 'Documento ufficiale della Camera di Commercio (max 6 mesi)'
  },
  { 
    tipo: 'POLIZZA_RCT_RCO', 
    nome: 'Polizza Assicurativa RCT/RCO', 
    obbligatorio: true,
    validitaGiorni: 365,
    descrizione: 'Responsabilità Civile verso Terzi e Operai'
  },
  { 
    tipo: 'DICH_ANTIMAFIA', 
    nome: 'Dichiarazione Antimafia', 
    obbligatorio: true,
    validitaGiorni: 180,
    descrizione: 'Dichiarazione sostitutiva art. 89 D.Lgs. 159/2011'
  },
  { 
    tipo: 'CERT_ISO_9001', 
    nome: 'Certificazione ISO 9001 (Qualità)', 
    obbligatorio: false,
    validitaGiorni: 365,
    descrizione: 'Sistema di gestione qualità'
  },
  { 
    tipo: 'CERT_ISO_14001', 
    nome: 'Certificazione ISO 14001 (Ambiente)', 
    obbligatorio: false,
    validitaGiorni: 365,
    descrizione: 'Sistema di gestione ambientale'
  },
  { 
    tipo: 'CERT_ISO_45001', 
    nome: 'Certificazione ISO 45001 (Sicurezza)', 
    obbligatorio: false,
    validitaGiorni: 365,
    descrizione: 'Sistema di gestione salute e sicurezza sul lavoro'
  },
  { 
    tipo: 'ATTESTAZIONE_SOA', 
    nome: 'Attestazione SOA', 
    obbligatorio: false,
    validitaGiorni: 365,
    descrizione: 'Qualificazione per lavori pubblici'
  },
  { 
    tipo: 'DVR', 
    nome: 'DVR - Documento Valutazione Rischi', 
    obbligatorio: true,
    validitaGiorni: 365,
    descrizione: 'Documento di valutazione dei rischi aziendali'
  },
  { 
    tipo: 'IDONEITA_SANITARIA', 
    nome: 'Idoneità Sanitaria Dipendenti', 
    obbligatorio: false,
    validitaGiorni: 365,
    descrizione: 'Certificati di idoneità alla mansione'
  }
];

export default function UfficioCommerciale() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('contratti');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showNewFornitore, setShowNewFornitore] = useState(false);
  const [showEditFornitore, setShowEditFornitore] = useState(false);
  const [showNewPreventivo, setShowNewPreventivo] = useState(false);
  const [showNewOrdine, setShowNewOrdine] = useState(false);
  const [showNewContratto, setShowNewContratto] = useState(false);
  const [showNewListino, setShowNewListino] = useState(false);
  const [showNewDocumento, setShowNewDocumento] = useState(false);
  const [showDocumentiFornitore, setShowDocumentiFornitore] = useState(false);
  const [showViewContratto, setShowViewContratto] = useState(false);
  const [showViewListino, setShowViewListino] = useState(false);
  const [showEditListino, setShowEditListino] = useState(false);
  const [showViewPreventivo, setShowViewPreventivo] = useState(false);
  const [showEditPreventivo, setShowEditPreventivo] = useState(false);
  const [showViewOrdine, setShowViewOrdine] = useState(false);
  const [showEditOrdine, setShowEditOrdine] = useState(false);
  const [selectedContratto, setSelectedContratto] = useState<Contratto | null>(null);
  const [selectedListino, setSelectedListino] = useState<ListinoFornitore | null>(null);
  const [selectedPreventivo, setSelectedPreventivo] = useState<PreventivoFornitore | null>(null);
  const [selectedOrdine, setSelectedOrdine] = useState<OrdineFornitore | null>(null);
  
  // Post-creation dialog state
  const [showPostCreation, setShowPostCreation] = useState(false);
  const [createdEntity, setCreatedEntity] = useState<{ type: EntityType; id: string; name: string } | null>(null);
  
  // Selected items
  const [selectedFornitore, setSelectedFornitore] = useState<Fornitore | null>(null);
  const [selectedFornitoreId, setSelectedFornitoreId] = useState<string | null>(null);

  // Form states
  const [newFornitore, setNewFornitore] = useState({
    ragione_sociale: '',
    partita_iva: '',
    codice_fiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    cellulare: '',
    email: '',
    pec: '',
    iban: '',
    categoria: '',
    sconto_base: 0,
    condizioni_pagamento: '30 gg DFFM',
    note: '',
    stato: 'attivo',
    rating: 3
  });

  const [editFornitore, setEditFornitore] = useState<typeof newFornitore & { id: string }>({
    id: '',
    ragione_sociale: '',
    partita_iva: '',
    codice_fiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    cellulare: '',
    email: '',
    pec: '',
    iban: '',
    categoria: '',
    sconto_base: 0,
    condizioni_pagamento: '30 gg DFFM',
    note: '',
    stato: 'attivo',
    rating: 3
  });

  const [newDocumento, setNewDocumento] = useState({
    fornitore_id: '',
    tipo_documento: '',
    numero_documento: '',
    data_emissione: new Date().toISOString().split('T')[0],
    data_scadenza: '',
    ente_emittente: '',
    note: '',
    obbligatorio: false
  });

  const [newPreventivo, setNewPreventivo] = useState({
    numero: `PRV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    fornitore_id: '',
    fornitore_nome: '',
    cantiere_id: '',
    oggetto: '',
    importo: 0,
    scadenza: '',
    note: '',
    allegati: [] as string[]
  });

  const [preventivoFile, setPreventivoFile] = useState<File | null>(null);

  const [newOrdine, setNewOrdine] = useState({
    numero: `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    fornitore_id: '',
    fornitore_nome: '',
    cantiere_id: '',
    cantiere_nome: '',
    importo: 0,
    data_consegna_prevista: '',
    note: '',
    allegati: [] as string[]
  });

  const [ordineFile, setOrdineFile] = useState<File | null>(null);

  const [newContratto, setNewContratto] = useState({
    numero: `CTR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    titolo: '',
    tipo: 'appalto',
    contraente: '',
    contraente_id: '',
    cantiere_id: '',
    cantiere_nome: '',
    importo: 0,
    data_inizio: new Date().toISOString().split('T')[0],
    data_fine: '',
    rinnovo_automatico: false,
    descrizione: '',
    allegati: [] as string[]
  });

  const [contrattoFile, setContrattoFile] = useState<File | null>(null);

  const [newListino, setNewListino] = useState({
    fornitore_id: '',
    fornitore_nome: '',
    nome: '',
    valido_dal: new Date().toISOString().split('T')[0],
    valido_al: '',
    sconto_applicato: 0
  });

  // Queries
  const { data: fornitori = [] } = useQuery({
    queryKey: ['fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fornitori').select('*').order('ragione_sociale');
      if (error) throw error;
      return data as Fornitore[];
    }
  });

  const { data: documentiFornitoriAll = [] } = useQuery({
    queryKey: ['documenti_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('documenti_fornitori').select('*').order('data_scadenza');
      if (error) throw error;
      return data as DocumentoFornitore[];
    }
  });

  const { data: preventivi = [] } = useQuery({
    queryKey: ['preventivi_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('preventivi_fornitori').select('*').order('data', { ascending: false });
      if (error) throw error;
      return data as PreventivoFornitore[];
    }
  });

  const { data: ordini = [] } = useQuery({
    queryKey: ['ordini_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ordini_fornitori').select('*').order('data', { ascending: false });
      if (error) throw error;
      return data as OrdineFornitore[];
    }
  });

  const { data: contratti = [] } = useQuery({
    queryKey: ['contratti'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contratti').select('*').order('data_inizio', { ascending: false });
      if (error) throw error;
      return data as Contratto[];
    }
  });

  const { data: listini = [] } = useQuery({
    queryKey: ['listini_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase.from('listini_fornitori').select('*').order('valido_dal', { ascending: false });
      if (error) throw error;
      return data as ListinoFornitore[];
    }
  });

  // Cantieri for linking
  const { data: cantieri = [] } = useQuery({
    queryKey: ['cantieri_for_select'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cantieri').select('id, nome, codice_commessa').order('nome');
      if (error) throw error;
      return data as { id: string; nome: string; codice_commessa: string }[];
    }
  });

  // Mutations
  const createFornitoreMutation = useMutation({
    mutationFn: async (data: typeof newFornitore) => {
      const { error } = await supabase.from('fornitori').insert(data);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fornitori'] });
      toast.success('Fornitore creato con successo');
      setShowNewFornitore(false);
      // Trigger post-creation actions
      setCreatedEntity({ type: 'fornitore', id: '', name: variables.ragione_sociale });
      setShowPostCreation(true);
      setNewFornitore({ ragione_sociale: '', partita_iva: '', codice_fiscale: '', indirizzo: '', citta: '', cap: '', provincia: '', telefono: '', cellulare: '', email: '', pec: '', iban: '', categoria: '', sconto_base: 0, condizioni_pagamento: '30 gg DFFM', note: '', stato: 'attivo', rating: 3 });
    },
    onError: () => toast.error('Errore nella creazione del fornitore')
  });

  const updateFornitoreMutation = useMutation({
    mutationFn: async (data: typeof editFornitore) => {
      const { id, ...updateData } = data;
      const { error } = await supabase.from('fornitori').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornitori'] });
      toast.success('Fornitore aggiornato con successo');
      setShowEditFornitore(false);
    },
    onError: () => toast.error('Errore nell\'aggiornamento del fornitore')
  });

  const createDocumentoMutation = useMutation({
    mutationFn: async (data: typeof newDocumento) => {
      const tipoDoc = TIPI_DOCUMENTO_FORNITORE.find(t => t.tipo === data.tipo_documento);
      const { error } = await supabase.from('documenti_fornitori').insert({
        ...data,
        obbligatorio: tipoDoc?.obbligatorio || false,
        stato: 'valido'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documenti_fornitori'] });
      toast.success('Documento aggiunto');
      setShowNewDocumento(false);
      setNewDocumento({ fornitore_id: '', tipo_documento: '', numero_documento: '', data_emissione: new Date().toISOString().split('T')[0], data_scadenza: '', ente_emittente: '', note: '', obbligatorio: false });
    },
    onError: () => toast.error('Errore nell\'aggiunta del documento')
  });

  const deleteDocumentoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documenti_fornitori').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documenti_fornitori'] });
      toast.success('Documento eliminato');
    }
  });

  const { uploadFile: uploadPreventivoFile, uploading: uploadingPreventivo } = useFileUpload({
    bucket: 'documenti',
    folder: 'preventivi',
  });

  const { uploadFile: uploadOrdineFile, uploading: uploadingOrdine } = useFileUpload({
    bucket: 'documenti',
    folder: 'ordini',
  });

  const { uploadFile: uploadContrattoFile, uploading: uploadingContratto } = useFileUpload({
    bucket: 'documenti',
    folder: 'contratti',
  });

  const createPreventivoMutation = useMutation({
    mutationFn: async (data: { formData: typeof newPreventivo; file: File | null }) => {
      let allegati: string[] = [];
      
      // Upload file if present
      if (data.file) {
        const uploadResult = await uploadPreventivoFile(data.file);
        if (uploadResult) {
          allegati = [uploadResult.url];
        }
      }
      
      const { data: result, error } = await supabase.from('preventivi_fornitori').insert({ 
        ...data.formData, 
        allegati,
        stato: 'richiesto' 
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['preventivi_fornitori'] });
      toast.success('Preventivo creato');
      setShowNewPreventivo(false);
      setPreventivoFile(null);
      setCreatedEntity({ type: 'preventivo', id: data.id, name: variables.formData.numero });
      setShowPostCreation(true);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const createOrdineMutation = useMutation({
    mutationFn: async (data: { formData: typeof newOrdine; file: File | null }) => {
      let allegati: string[] = [];
      
      if (data.file) {
        const uploadResult = await uploadOrdineFile(data.file);
        if (uploadResult) {
          allegati = [uploadResult.url];
        }
      }
      
      const { data: result, error } = await supabase.from('ordini_fornitori').insert({ 
        ...data.formData, 
        allegati,
        stato: 'bozza' 
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordini_fornitori'] });
      toast.success('Ordine creato');
      setShowNewOrdine(false);
      setOrdineFile(null);
      setCreatedEntity({ type: 'ordine', id: data.id, name: variables.formData.numero });
      setShowPostCreation(true);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const createContrattoMutation = useMutation({
    mutationFn: async (data: { formData: typeof newContratto; file: File | null }) => {
      let allegati: string[] = [];
      
      if (data.file) {
        const uploadResult = await uploadContrattoFile(data.file);
        if (uploadResult) {
          allegati = [uploadResult.url];
        }
      }
      
      const { data: result, error } = await supabase.from('contratti').insert({ 
        ...data.formData, 
        allegati,
        stato: 'attivo' 
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contratti'] });
      toast.success('Contratto creato');
      setShowNewContratto(false);
      setContrattoFile(null);
      setCreatedEntity({ type: 'contratto', id: data.id, name: variables.formData.titolo });
      setShowPostCreation(true);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const createListinoMutation = useMutation({
    mutationFn: async (data: typeof newListino) => {
      const { error } = await supabase.from('listini_fornitori').insert({ ...data, attivo: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listini_fornitori'] });
      toast.success('Listino creato');
      setShowNewListino(false);
    },
    onError: () => toast.error('Errore nella creazione')
  });

  const updateListinoMutation = useMutation({
    mutationFn: async (data: { id: string; nome: string; valido_dal: string; valido_al: string | null; sconto_applicato: number; attivo: boolean }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase.from('listini_fornitori').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listini_fornitori'] });
      toast.success('Listino aggiornato');
      setShowEditListino(false);
      setSelectedListino(null);
    },
    onError: () => toast.error('Errore nell\'aggiornamento')
  });

  const deleteListinoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listini_fornitori').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listini_fornitori'] });
      toast.success('Listino eliminato');
    }
  });

  const deleteFornitoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fornitori').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornitori'] });
      toast.success('Fornitore eliminato');
    }
  });

  const deleteContrattoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contratti').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratti'] });
      toast.success('Contratto eliminato');
    }
  });

  const updateOrdineStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const update: Record<string, unknown> = { stato };
      if (stato === 'consegnato') update.data_consegna_effettiva = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('ordini_fornitori').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordini_fornitori'] });
      toast.success('Stato aggiornato');
    }
  });

  const updatePreventivoStatoMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: string }) => {
      const { error } = await supabase.from('preventivi_fornitori').update({ stato }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventivi_fornitori'] });
      toast.success('Stato aggiornato');
    }
  });

  const updatePreventivoMutation = useMutation({
    mutationFn: async (data: { id: string; note?: string; importo?: number; scadenza?: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase.from('preventivi_fornitori').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventivi_fornitori'] });
      toast.success('Preventivo aggiornato');
      setShowEditPreventivo(false);
      setSelectedPreventivo(null);
    },
    onError: () => toast.error('Errore nell\'aggiornamento')
  });

  const updateOrdineMutation = useMutation({
    mutationFn: async (data: { id: string; note?: string; data_consegna_prevista?: string; data_consegna_effettiva?: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase.from('ordini_fornitori').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordini_fornitori'] });
      toast.success('Ordine aggiornato');
      setShowEditOrdine(false);
      setSelectedOrdine(null);
    },
    onError: () => toast.error('Errore nell\'aggiornamento')
  });

  // Helpers
  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'attivo': case 'approvato': case 'confermato': case 'consegnato': case 'ricevuto': case 'valido':
        return 'bg-emerald-500/15 text-emerald-500';
      case 'in_consegna': case 'inviato': case 'in_scadenza':
        return 'bg-amber-500/15 text-amber-500';
      case 'richiesto': case 'bozza': case 'da_verificare':
        return 'bg-sky-500/15 text-sky-500';
      case 'scaduto': case 'rifiutato': case 'annullato': case 'cessato': case 'sospeso':
        return 'bg-red-500/15 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'attivo': case 'approvato': case 'confermato': case 'consegnato': case 'valido':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_consegna': case 'inviato': case 'in_scadenza':
        return <Clock className="w-4 h-4" />;
      case 'richiesto': case 'bozza': case 'ricevuto': case 'da_verificare':
        return <Clock className="w-4 h-4" />;
      case 'scaduto': case 'rifiutato': case 'annullato':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('it-IT');

  // Calcola stato documento basato su scadenza
  const getDocumentoStatus = (doc: DocumentoFornitore) => {
    if (!doc.data_scadenza) return { stato: 'da_verificare', label: 'Da Verificare', color: 'bg-sky-500/15 text-sky-500' };
    const oggi = new Date();
    const scadenza = new Date(doc.data_scadenza);
    const giorniAllaScadenza = differenceInDays(scadenza, oggi);
    
    if (giorniAllaScadenza < 0) return { stato: 'scaduto', label: 'Scaduto', color: 'bg-red-500/15 text-red-500' };
    if (giorniAllaScadenza <= 30) return { stato: 'in_scadenza', label: `Scade tra ${giorniAllaScadenza}gg`, color: 'bg-amber-500/15 text-amber-500' };
    return { stato: 'valido', label: 'Valido', color: 'bg-emerald-500/15 text-emerald-500' };
  };

  // Calcola compliance fornitore
  const getFornitoreCompliance = (fornitoreId: string) => {
    const documentiFornitore = documentiFornitoriAll.filter(d => d.fornitore_id === fornitoreId);
    const documentiObbligatori = TIPI_DOCUMENTO_FORNITORE.filter(t => t.obbligatorio);
    
    const stato = {
      totaleObbligatori: documentiObbligatori.length,
      presenti: 0,
      validi: 0,
      inScadenza: 0,
      scaduti: 0,
      mancanti: [] as string[]
    };

    documentiObbligatori.forEach(tipoDoc => {
      const doc = documentiFornitore.find(d => d.tipo_documento === tipoDoc.tipo);
      if (!doc) {
        stato.mancanti.push(tipoDoc.nome);
      } else {
        stato.presenti++;
        const status = getDocumentoStatus(doc);
        if (status.stato === 'valido') stato.validi++;
        else if (status.stato === 'in_scadenza') stato.inScadenza++;
        else if (status.stato === 'scaduto') stato.scaduti++;
      }
    });

    // Determina stato pagamenti
    let statoPagamenti: 'pagabile' | 'in_attesa' | 'bloccato' = 'pagabile';
    if (stato.scaduti > 0 || stato.mancanti.length > 2) statoPagamenti = 'bloccato';
    else if (stato.mancanti.length > 0 || stato.inScadenza > 0) statoPagamenti = 'in_attesa';

    return { ...stato, statoPagamenti };
  };

  // Apri modifica fornitore
  const handleEditFornitore = (fornitore: Fornitore) => {
    setEditFornitore({
      id: fornitore.id,
      ragione_sociale: fornitore.ragione_sociale,
      partita_iva: fornitore.partita_iva || '',
      codice_fiscale: fornitore.codice_fiscale || '',
      indirizzo: fornitore.indirizzo || '',
      citta: fornitore.citta || '',
      cap: fornitore.cap || '',
      provincia: fornitore.provincia || '',
      telefono: fornitore.telefono || '',
      cellulare: fornitore.cellulare || '',
      email: fornitore.email || '',
      pec: fornitore.pec || '',
      iban: fornitore.iban || '',
      categoria: fornitore.categoria || '',
      sconto_base: fornitore.sconto_base || 0,
      condizioni_pagamento: fornitore.condizioni_pagamento || '30 gg DFFM',
      note: fornitore.note || '',
      stato: fornitore.stato,
      rating: fornitore.rating || 3
    });
    setShowEditFornitore(true);
  };

  // Apri documenti fornitore
  const handleViewDocumenti = (fornitoreId: string) => {
    setSelectedFornitoreId(fornitoreId);
    setShowDocumentiFornitore(true);
  };

  // Stats
  const stats = {
    contrattiAttivi: contratti.filter(c => c.stato === 'attivo').length,
    valoreTotaleContratti: contratti.filter(c => c.stato === 'attivo').reduce((sum, c) => sum + c.importo, 0),
    preventiviInAttesa: preventivi.filter(p => p.stato === 'richiesto' || p.stato === 'ricevuto').length,
    ordiniInCorso: ordini.filter(o => o.stato !== 'consegnato' && o.stato !== 'annullato').length,
    fornitoriAttivi: fornitori.filter(f => f.stato === 'attivo').length,
    documentiScaduti: documentiFornitoriAll.filter(d => getDocumentoStatus(d).stato === 'scaduto').length,
    documentiInScadenza: documentiFornitoriAll.filter(d => getDocumentoStatus(d).stato === 'in_scadenza').length
  };

  // Filter data
  const filteredFornitori = fornitori.filter(f => 
    f.ragione_sociale.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContratti = contratti.filter(c =>
    c.titolo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contraente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = <T extends object>(data: T[], filename: string) => {
    if (data.length === 0) return;
    const columns = Object.keys(data[0]).map(key => ({ key, header: key, width: 15 }));
    exportToExcel(data as Record<string, unknown>[], columns, filename);
    toast.success('Export completato');
  };

  const documentiFornitoreSelezionato = selectedFornitoreId 
    ? documentiFornitoriAll.filter(d => d.fornitore_id === selectedFornitoreId)
    : [];

  const fornitoreSelezionato = selectedFornitoreId 
    ? fornitori.find(f => f.id === selectedFornitoreId)
    : null;

    return (
      <div className="space-y-6 animate-fade-in min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Reparto Commerciale</h1>
            <p className="text-muted-foreground">Gestione contratti, fornitori, preventivi e ordini</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cerca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-xl font-bold truncate">{stats.contrattiAttivi}</p>
                <p className="text-xs text-muted-foreground truncate">Contratti Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0"><Euro className="w-4 h-4 text-emerald-500" /></div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-bold truncate">{formatCurrency(stats.valoreTotaleContratti)}</p>
                <p className="text-xs text-muted-foreground truncate">Valore Contratti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 flex-shrink-0"><Receipt className="w-4 h-4 text-amber-500" /></div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-xl font-bold truncate">{stats.preventiviInAttesa}</p>
                <p className="text-xs text-muted-foreground truncate">Preventivi in Attesa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-500/10 flex-shrink-0"><Truck className="w-4 h-4 text-sky-500" /></div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-xl font-bold truncate">{stats.ordiniInCorso}</p>
                <p className="text-xs text-muted-foreground truncate">Ordini in Corso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/50 min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0"><Building2 className="w-4 h-4 text-purple-500" /></div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-xl font-bold truncate">{stats.fornitoriAttivi}</p>
                <p className="text-xs text-muted-foreground truncate">Fornitori Attivi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Documenti */}
      {(stats.documentiScaduti > 0 || stats.documentiInScadenza > 0) && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium">Attenzione ai documenti fornitori</p>
                <p className="text-sm text-muted-foreground">
                  {stats.documentiScaduti > 0 && <span className="text-red-500 font-medium">{stats.documentiScaduti} documenti scaduti</span>}
                  {stats.documentiScaduti > 0 && stats.documentiInScadenza > 0 && ' • '}
                  {stats.documentiInScadenza > 0 && <span className="text-amber-500 font-medium">{stats.documentiInScadenza} in scadenza</span>}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('documenti-fornitori')}>
                Verifica
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="tabs-scrollable-header flex w-full h-auto flex-nowrap justify-start gap-1 p-1 overflow-x-auto">
          <TabsTrigger value="contratti" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><FileText className="w-4 h-4" />Contratti</TabsTrigger>
          <TabsTrigger value="fornitori" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Building2 className="w-4 h-4" />Fornitori</TabsTrigger>
          <TabsTrigger value="documenti-fornitori" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2">
            <FileBadge className="w-4 h-4" />Documenti Fornitori
            {(stats.documentiScaduti > 0) && <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">{stats.documentiScaduti}</span>}
          </TabsTrigger>
          <TabsTrigger value="preventivi" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Receipt className="w-4 h-4" />Preventivi</TabsTrigger>
          <TabsTrigger value="ordini" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Ordini</TabsTrigger>
          <TabsTrigger value="listini" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />Listini</TabsTrigger>
          <TabsTrigger value="computi" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Calculator className="w-4 h-4" />Computo</TabsTrigger>
          <TabsTrigger value="flusso-doc" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2 text-primary"><Zap className="w-4 h-4" />Flusso Documentale</TabsTrigger>
          <TabsTrigger value="rfq" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Truck className="w-4 h-4" />RFQ & Offerte</TabsTrigger>
          <TabsTrigger value="subappalti" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><FileCheck className="w-4 h-4" />Subappalti</TabsTrigger>
          <TabsTrigger value="compliance" className="flex-shrink-0 whitespace-nowrap flex items-center gap-2"><Shield className="w-4 h-4" />Compliance</TabsTrigger>
        </TabsList>

        {/* Contratti Tab */}
        <TabsContent value="contratti" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contratti</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(contratti, 'contratti')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewContratto} onOpenChange={setShowNewContratto}>
                  <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Contratto</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Nuovo Contratto</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div><Label>Numero</Label><Input value={newContratto.numero} onChange={(e) => setNewContratto(p => ({ ...p, numero: e.target.value }))} /></div>
                      <div><Label>Tipo</Label>
                        <Select value={newContratto.tipo} onValueChange={(v) => setNewContratto(p => ({ ...p, tipo: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="appalto">Appalto</SelectItem>
                            <SelectItem value="subappalto">Subappalto</SelectItem>
                            <SelectItem value="fornitura">Fornitura</SelectItem>
                            <SelectItem value="servizio">Servizio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"><Label>Titolo *</Label><Input value={newContratto.titolo} onChange={(e) => setNewContratto(p => ({ ...p, titolo: e.target.value }))} /></div>
                      <div><Label>Contraente *</Label><Input value={newContratto.contraente} onChange={(e) => setNewContratto(p => ({ ...p, contraente: e.target.value }))} /></div>
                      <div><Label>Commessa (opzionale)</Label>
                        <Select value={newContratto.cantiere_id} onValueChange={(v) => {
                          const c = cantieri.find(x => x.id === v);
                          setNewContratto(p => ({ ...p, cantiere_id: v, cantiere_nome: c?.nome || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Collega a commessa..." /></SelectTrigger>
                          <SelectContent>
                            {cantieri.map(c => <SelectItem key={c.id} value={c.id}>{c.codice_commessa} - {c.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Importo €</Label><Input type="number" value={newContratto.importo} onChange={(e) => setNewContratto(p => ({ ...p, importo: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Data Inizio</Label><Input type="date" value={newContratto.data_inizio} onChange={(e) => setNewContratto(p => ({ ...p, data_inizio: e.target.value }))} /></div>
                      <div><Label>Data Fine</Label><Input type="date" value={newContratto.data_fine} onChange={(e) => setNewContratto(p => ({ ...p, data_fine: e.target.value }))} /></div>
                      <div className="col-span-2">
                        <Label>Carica Contratto (PDF/Doc)</Label>
                        <div className="mt-1">
                          <Input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setContrattoFile(e.target.files?.[0] || null)}
                            className="cursor-pointer"
                          />
                          {contrattoFile && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {contrattoFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2"><Label>Descrizione</Label><Textarea value={newContratto.descrizione} onChange={(e) => setNewContratto(p => ({ ...p, descrizione: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewContratto(false)}>Annulla</Button>
                      <Button 
                        onClick={() => createContrattoMutation.mutate({ formData: newContratto, file: contrattoFile })} 
                        disabled={!newContratto.titolo || !newContratto.contraente || uploadingContratto}
                      >
                        {uploadingContratto ? 'Caricamento...' : 'Salva'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contraente</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContratti.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.numero}</TableCell>
                      <TableCell className="font-medium">{c.titolo}</TableCell>
                      <TableCell><Badge variant="outline">{c.tipo}</Badge></TableCell>
                      <TableCell>{c.contraente}</TableCell>
                      <TableCell>{formatCurrency(c.importo)}</TableCell>
                      <TableCell className="text-sm">{formatDate(c.data_inizio)} - {formatDate(c.data_fine)}</TableCell>
                      <TableCell><Badge className={cn("gap-1", getStatoColor(c.stato))}>{getStatoIcon(c.stato)}{c.stato}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedContratto(c); setShowViewContratto(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteContrattoMutation.mutate(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredContratti.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessun contratto trovato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documenti Fornitori - Compliance Tab */}
        <TabsContent value="documenti-fornitori" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Regolarità Documentale Fornitori</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Gestione completa della documentazione obbligatoria per pagamenti e compliance</p>
              </div>
              <Dialog open={showNewDocumento} onOpenChange={setShowNewDocumento}>
                <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Aggiungi Documento</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Aggiungi Documento Fornitore</DialogTitle></DialogHeader>
                  <div className="grid gap-4 pt-4">
                    <div>
                      <Label>Fornitore *</Label>
                      <Select value={newDocumento.fornitore_id} onValueChange={(v) => setNewDocumento(p => ({ ...p, fornitore_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
                        <SelectContent>
                          {fornitori.map(f => <SelectItem key={f.id} value={f.id}>{f.ragione_sociale}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo Documento *</Label>
                      <Select value={newDocumento.tipo_documento} onValueChange={(v) => {
                        const tipoDoc = TIPI_DOCUMENTO_FORNITORE.find(t => t.tipo === v);
                        const scadenza = tipoDoc ? format(addDays(new Date(), tipoDoc.validitaGiorni), 'yyyy-MM-dd') : '';
                        setNewDocumento(p => ({ ...p, tipo_documento: v, data_scadenza: scadenza, obbligatorio: tipoDoc?.obbligatorio || false }));
                      }}>
                        <SelectTrigger><SelectValue placeholder="Seleziona tipo" /></SelectTrigger>
                        <SelectContent>
                          {TIPI_DOCUMENTO_FORNITORE.map(t => (
                            <SelectItem key={t.tipo} value={t.tipo}>
                              <div className="flex items-center gap-2">
                                {t.obbligatorio && <span className="text-red-500">*</span>}
                                {t.nome}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Numero Documento</Label><Input value={newDocumento.numero_documento} onChange={(e) => setNewDocumento(p => ({ ...p, numero_documento: e.target.value }))} placeholder="es. DURC-2024-001" /></div>
                      <div><Label>Ente Emittente</Label><Input value={newDocumento.ente_emittente} onChange={(e) => setNewDocumento(p => ({ ...p, ente_emittente: e.target.value }))} placeholder="es. INPS, CCIAA" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Data Emissione</Label><Input type="date" value={newDocumento.data_emissione} onChange={(e) => setNewDocumento(p => ({ ...p, data_emissione: e.target.value }))} /></div>
                      <div><Label>Data Scadenza</Label><Input type="date" value={newDocumento.data_scadenza} onChange={(e) => setNewDocumento(p => ({ ...p, data_scadenza: e.target.value }))} /></div>
                    </div>
                    <div><Label>Note</Label><Textarea value={newDocumento.note} onChange={(e) => setNewDocumento(p => ({ ...p, note: e.target.value }))} /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewDocumento(false)}>Annulla</Button>
                    <Button onClick={() => createDocumentoMutation.mutate(newDocumento)} disabled={!newDocumento.fornitore_id || !newDocumento.tipo_documento}>Salva Documento</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {fornitori.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun fornitore registrato. Aggiungi fornitori per monitorare la documentazione.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fornitore</TableHead>
                        <TableHead className="text-center">DURC</TableHead>
                        <TableHead className="text-center">Visura</TableHead>
                        <TableHead className="text-center">Polizza RCT</TableHead>
                        <TableHead className="text-center">Antimafia</TableHead>
                        <TableHead className="text-center">DVR</TableHead>
                        <TableHead className="text-center">ISO</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Stato Pagamenti</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fornitori.map(f => {
                        const compliance = getFornitoreCompliance(f.id);
                        const documentiF = documentiFornitoriAll.filter(d => d.fornitore_id === f.id);
                        
                        const getDocIcon = (tipo: string) => {
                          const doc = documentiF.find(d => d.tipo_documento === tipo);
                          if (!doc) return <XCircle className="w-5 h-5 text-muted-foreground/50 mx-auto" />;
                          const status = getDocumentoStatus(doc);
                          if (status.stato === 'valido') return <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />;
                          if (status.stato === 'in_scadenza') return <Clock className="w-5 h-5 text-amber-500 mx-auto" />;
                          return <AlertOctagon className="w-5 h-5 text-red-500 mx-auto" />;
                        };

                        return (
                          <TableRow key={f.id}>
                            <TableCell>
                              <div className="font-medium">{f.ragione_sociale}</div>
                              <div className="text-xs text-muted-foreground">{f.partita_iva || 'P.IVA mancante'}</div>
                            </TableCell>
                            <TableCell className="text-center">{getDocIcon('DURC')}</TableCell>
                            <TableCell className="text-center">{getDocIcon('VISURA_CAMERALE')}</TableCell>
                            <TableCell className="text-center">{getDocIcon('POLIZZA_RCT_RCO')}</TableCell>
                            <TableCell className="text-center">{getDocIcon('DICH_ANTIMAFIA')}</TableCell>
                            <TableCell className="text-center">{getDocIcon('DVR')}</TableCell>
                            <TableCell className="text-center">{getDocIcon('CERT_ISO_9001')}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                  <div 
                                    className={cn("h-full transition-all", compliance.validi === compliance.totaleObbligatori ? "bg-emerald-500" : compliance.validi >= compliance.totaleObbligatori / 2 ? "bg-amber-500" : "bg-red-500")}
                                    style={{ width: `${(compliance.presenti / compliance.totaleObbligatori) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{compliance.presenti}/{compliance.totaleObbligatori}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("gap-1", compliance.statoPagamenti === 'pagabile' ? "bg-emerald-500/15 text-emerald-500" : compliance.statoPagamenti === 'in_attesa' ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-500")}>
                                {compliance.statoPagamenti === 'pagabile' ? <CheckCircle className="w-3 h-3" /> : compliance.statoPagamenti === 'in_attesa' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {compliance.statoPagamenti === 'pagabile' ? 'Pagabile' : compliance.statoPagamenti === 'in_attesa' ? 'In Attesa' : 'Bloccato'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => handleViewDocumenti(f.id)}>
                                <Eye className="w-4 h-4 mr-1" />Dettagli
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Legenda */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Documenti Obbligatori per Fornitori</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {TIPI_DOCUMENTO_FORNITORE.filter(t => t.obbligatorio).map(t => (
                        <div key={t.tipo} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">{t.tipo.replace(/_/g, ' ')}</span>
                            <p className="text-xs text-muted-foreground">{t.descrizione} (validità {t.validitaGiorni}gg)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fornitori Tab */}
        <TabsContent value="fornitori" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fornitori</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(fornitori, 'fornitori')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewFornitore} onOpenChange={setShowNewFornitore}>
                  <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Fornitore</Button></DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Nuovo Fornitore</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="col-span-2"><Label>Ragione Sociale *</Label><Input value={newFornitore.ragione_sociale} onChange={(e) => setNewFornitore(p => ({ ...p, ragione_sociale: e.target.value }))} /></div>
                      <div><Label>Partita IVA</Label><Input value={newFornitore.partita_iva} onChange={(e) => setNewFornitore(p => ({ ...p, partita_iva: e.target.value }))} /></div>
                      <div><Label>Codice Fiscale</Label><Input value={newFornitore.codice_fiscale} onChange={(e) => setNewFornitore(p => ({ ...p, codice_fiscale: e.target.value }))} /></div>
                      <div><Label>Categoria</Label><Input value={newFornitore.categoria} onChange={(e) => setNewFornitore(p => ({ ...p, categoria: e.target.value }))} placeholder="es. Materiali edili" /></div>
                      <div><Label>Stato</Label>
                        <Select value={newFornitore.stato} onValueChange={(v) => setNewFornitore(p => ({ ...p, stato: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attivo">Attivo</SelectItem>
                            <SelectItem value="sospeso">Sospeso</SelectItem>
                            <SelectItem value="cessato">Cessato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"><Label>Indirizzo</Label><Input value={newFornitore.indirizzo} onChange={(e) => setNewFornitore(p => ({ ...p, indirizzo: e.target.value }))} /></div>
                      <div><Label>Città</Label><Input value={newFornitore.citta} onChange={(e) => setNewFornitore(p => ({ ...p, citta: e.target.value }))} /></div>
                      <div><Label>CAP</Label><Input value={newFornitore.cap} onChange={(e) => setNewFornitore(p => ({ ...p, cap: e.target.value }))} /></div>
                      <div><Label>Provincia</Label><Input value={newFornitore.provincia} onChange={(e) => setNewFornitore(p => ({ ...p, provincia: e.target.value }))} maxLength={2} /></div>
                      <div><Label>Telefono</Label><Input value={newFornitore.telefono} onChange={(e) => setNewFornitore(p => ({ ...p, telefono: e.target.value }))} /></div>
                      <div><Label>Cellulare</Label><Input value={newFornitore.cellulare} onChange={(e) => setNewFornitore(p => ({ ...p, cellulare: e.target.value }))} /></div>
                      <div><Label>Email</Label><Input type="email" value={newFornitore.email} onChange={(e) => setNewFornitore(p => ({ ...p, email: e.target.value }))} /></div>
                      <div><Label>PEC</Label><Input value={newFornitore.pec} onChange={(e) => setNewFornitore(p => ({ ...p, pec: e.target.value }))} /></div>
                      <div><Label>IBAN</Label><Input value={newFornitore.iban} onChange={(e) => setNewFornitore(p => ({ ...p, iban: e.target.value }))} /></div>
                      <div><Label>Sconto Base %</Label><Input type="number" value={newFornitore.sconto_base} onChange={(e) => setNewFornitore(p => ({ ...p, sconto_base: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Condizioni Pagamento</Label><Input value={newFornitore.condizioni_pagamento} onChange={(e) => setNewFornitore(p => ({ ...p, condizioni_pagamento: e.target.value }))} /></div>
                      <div className="col-span-2"><Label>Note</Label><Textarea value={newFornitore.note} onChange={(e) => setNewFornitore(p => ({ ...p, note: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewFornitore(false)}>Annulla</Button>
                      <Button onClick={() => createFornitoreMutation.mutate(newFornitore)} disabled={!newFornitore.ragione_sociale}>Salva</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ragione Sociale</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Città</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Sconto</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFornitori.map(f => {
                    const compliance = getFornitoreCompliance(f.id);
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.ragione_sociale}</TableCell>
                        <TableCell>{f.categoria || '-'}</TableCell>
                        <TableCell>{f.citta || '-'}</TableCell>
                        <TableCell>{f.telefono || '-'}</TableCell>
                        <TableCell>{f.email || '-'}</TableCell>
                        <TableCell>{f.sconto_base}%</TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1", compliance.statoPagamenti === 'pagabile' ? "bg-emerald-500/15 text-emerald-500" : compliance.statoPagamenti === 'in_attesa' ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-500")}>
                            {compliance.presenti}/{compliance.totaleObbligatori} doc
                          </Badge>
                        </TableCell>
                        <TableCell><Badge className={getStatoColor(f.stato)}>{f.stato}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDocumenti(f.id)}><FileCheck className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditFornitore(f)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteFornitoreMutation.mutate(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredFornitori.length === 0 && (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nessun fornitore trovato</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preventivi Tab */}
        <TabsContent value="preventivi" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preventivo</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(preventivi, 'preventivi')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewPreventivo} onOpenChange={setShowNewPreventivo}>
                  <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Preventivo</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nuovo Preventivo</DialogTitle></DialogHeader>
                    <div className="grid gap-4 pt-4">
                      <div><Label>Fornitore *</Label>
                        <Select value={newPreventivo.fornitore_id} onValueChange={(v) => {
                          const f = fornitori.find(x => x.id === v);
                          setNewPreventivo(p => ({ ...p, fornitore_id: v, fornitore_nome: f?.ragione_sociale || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
                          <SelectContent>{fornitori.map(f => <SelectItem key={f.id} value={f.id}>{f.ragione_sociale}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Commessa (opzionale)</Label>
                        <Select value={newPreventivo.cantiere_id} onValueChange={(v) => setNewPreventivo(p => ({ ...p, cantiere_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Collega a commessa..." /></SelectTrigger>
                          <SelectContent>
                            {cantieri.map(c => <SelectItem key={c.id} value={c.id}>{c.codice_commessa} - {c.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Oggetto *</Label><Input value={newPreventivo.oggetto} onChange={(e) => setNewPreventivo(p => ({ ...p, oggetto: e.target.value }))} /></div>
                      <div><Label>Importo Stimato €</Label><Input type="number" value={newPreventivo.importo} onChange={(e) => setNewPreventivo(p => ({ ...p, importo: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Scadenza</Label><Input type="date" value={newPreventivo.scadenza} onChange={(e) => setNewPreventivo(p => ({ ...p, scadenza: e.target.value }))} /></div>
                      <div>
                        <Label>Carica Preventivo (PDF/Doc)</Label>
                        <div className="mt-1">
                          <Input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => setPreventivoFile(e.target.files?.[0] || null)}
                            className="cursor-pointer"
                          />
                          {preventivoFile && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {preventivoFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div><Label>Note</Label><Textarea value={newPreventivo.note || ''} onChange={(e) => setNewPreventivo(p => ({ ...p, note: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewPreventivo(false)}>Annulla</Button>
                      <Button 
                        onClick={() => createPreventivoMutation.mutate({ formData: newPreventivo, file: preventivoFile })} 
                        disabled={!newPreventivo.fornitore_nome || !newPreventivo.oggetto || uploadingPreventivo}
                      >
                        {uploadingPreventivo ? 'Caricamento...' : 'Salva Preventivo'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Numero</TableHead>
                      <TableHead className="whitespace-nowrap">Data</TableHead>
                      <TableHead className="whitespace-nowrap">Fornitore</TableHead>
                      <TableHead className="min-w-[150px]">Oggetto</TableHead>
                      <TableHead className="whitespace-nowrap">Importo</TableHead>
                      <TableHead className="whitespace-nowrap">Scadenza</TableHead>
                      <TableHead className="min-w-[120px]">Note</TableHead>
                      <TableHead className="whitespace-nowrap">Stato</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preventivi.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono whitespace-nowrap">{p.numero}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(p.data)}</TableCell>
                        <TableCell className="whitespace-nowrap">{p.fornitore_nome}</TableCell>
                        <TableCell className="max-w-[200px] break-words">{p.oggetto}</TableCell>
                        <TableCell className="whitespace-nowrap">{p.importo ? formatCurrency(p.importo) : '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{p.scadenza ? formatDate(p.scadenza) : '-'}</TableCell>
                        <TableCell className="max-w-[150px]">
                          {p.note ? <span className="text-xs text-muted-foreground break-words line-clamp-2">{p.note}</span> : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell><Badge className={getStatoColor(p.stato)}>{p.stato}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedPreventivo(p); setShowViewPreventivo(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedPreventivo(p); setShowEditPreventivo(true); }}><Edit className="w-4 h-4" /></Button>
                            {p.stato === 'richiesto' && <Button size="sm" variant="outline" onClick={() => updatePreventivoStatoMutation.mutate({ id: p.id, stato: 'ricevuto' })}>Ricevuto</Button>}
                            {p.stato === 'ricevuto' && (
                              <>
                                <Button size="sm" variant="outline" className="text-emerald-500" onClick={() => updatePreventivoStatoMutation.mutate({ id: p.id, stato: 'approvato' })}>Approva</Button>
                                <Button size="sm" variant="outline" className="text-destructive" onClick={() => updatePreventivoStatoMutation.mutate({ id: p.id, stato: 'rifiutato' })}>Rifiuta</Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {preventivi.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nessun preventivo trovato</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ordini Tab */}
        <TabsContent value="ordini" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ordini Fornitori</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(ordini, 'ordini')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewOrdine} onOpenChange={setShowNewOrdine}>
                  <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Ordine</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nuovo Ordine</DialogTitle></DialogHeader>
                    <div className="grid gap-4 pt-4">
                      <div><Label>Fornitore *</Label>
                        <Select value={newOrdine.fornitore_id} onValueChange={(v) => {
                          const f = fornitori.find(x => x.id === v);
                          setNewOrdine(p => ({ ...p, fornitore_id: v, fornitore_nome: f?.ragione_sociale || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
                          <SelectContent>{fornitori.map(f => <SelectItem key={f.id} value={f.id}>{f.ragione_sociale}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Commessa (opzionale)</Label>
                        <Select value={newOrdine.cantiere_id} onValueChange={(v) => {
                          const c = cantieri.find(x => x.id === v);
                          setNewOrdine(p => ({ ...p, cantiere_id: v, cantiere_nome: c?.nome || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Collega a commessa..." /></SelectTrigger>
                          <SelectContent>
                            {cantieri.map(c => <SelectItem key={c.id} value={c.id}>{c.codice_commessa} - {c.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Importo €</Label><Input type="number" value={newOrdine.importo} onChange={(e) => setNewOrdine(p => ({ ...p, importo: parseFloat(e.target.value) || 0 }))} /></div>
                      <div><Label>Data Consegna Prevista</Label><Input type="date" value={newOrdine.data_consegna_prevista} onChange={(e) => setNewOrdine(p => ({ ...p, data_consegna_prevista: e.target.value }))} /></div>
                      <div>
                        <Label>Carica Ordine (PDF/Doc)</Label>
                        <div className="mt-1">
                          <Input 
                            type="file" 
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => setOrdineFile(e.target.files?.[0] || null)}
                            className="cursor-pointer"
                          />
                          {ordineFile && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {ordineFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div><Label>Note</Label><Textarea value={newOrdine.note || ''} onChange={(e) => setNewOrdine(p => ({ ...p, note: e.target.value }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewOrdine(false)}>Annulla</Button>
                      <Button 
                        onClick={() => createOrdineMutation.mutate({ formData: newOrdine, file: ordineFile })} 
                        disabled={!newOrdine.fornitore_nome || uploadingOrdine}
                      >
                        {uploadingOrdine ? 'Caricamento...' : 'Crea Ordine'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Numero</TableHead>
                      <TableHead className="whitespace-nowrap">Data</TableHead>
                      <TableHead className="whitespace-nowrap">Fornitore</TableHead>
                      <TableHead className="whitespace-nowrap">Importo</TableHead>
                      <TableHead className="whitespace-nowrap">Consegna Prevista</TableHead>
                      <TableHead className="whitespace-nowrap">Consegna Effettiva</TableHead>
                      <TableHead className="min-w-[120px]">Note</TableHead>
                      <TableHead className="whitespace-nowrap">Stato</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordini.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono whitespace-nowrap">{o.numero}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(o.data)}</TableCell>
                        <TableCell className="whitespace-nowrap">{o.fornitore_nome}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatCurrency(o.importo)}</TableCell>
                        <TableCell className="whitespace-nowrap">{o.data_consegna_prevista ? formatDate(o.data_consegna_prevista) : '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{o.data_consegna_effettiva ? formatDate(o.data_consegna_effettiva) : '-'}</TableCell>
                        <TableCell className="max-w-[150px]">
                          {o.note ? <span className="text-xs text-muted-foreground break-words line-clamp-2">{o.note}</span> : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell><Badge className={cn("gap-1", getStatoColor(o.stato))}>{getStatoIcon(o.stato)}{o.stato.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedOrdine(o); setShowViewOrdine(true); }}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedOrdine(o); setShowEditOrdine(true); }}><Edit className="w-4 h-4" /></Button>
                            {o.stato === 'bozza' && <Button size="sm" variant="outline" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'inviato' })}><Send className="w-3 h-3 mr-1" />Invia</Button>}
                            {o.stato === 'inviato' && <Button size="sm" variant="outline" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'confermato' })}>Conferma</Button>}
                            {o.stato === 'confermato' && <Button size="sm" variant="outline" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'in_consegna' })}>In Consegna</Button>}
                            {o.stato === 'in_consegna' && <Button size="sm" variant="outline" className="text-emerald-500" onClick={() => updateOrdineStatoMutation.mutate({ id: o.id, stato: 'consegnato' })}><CheckCircle className="w-3 h-3 mr-1" />Consegnato</Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {ordini.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nessun ordine trovato</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listini Tab */}
        <TabsContent value="listini" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Listini Prezzi Fornitori</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => handleExport(listini, 'listini')}><Download className="w-4 h-4" />Esporta</Button>
                <Dialog open={showNewListino} onOpenChange={setShowNewListino}>
                  <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Nuovo Listino</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nuovo Listino</DialogTitle></DialogHeader>
                    <div className="grid gap-4 pt-4">
                      <div><Label>Fornitore *</Label>
                        <Select value={newListino.fornitore_id} onValueChange={(v) => {
                          const f = fornitori.find(x => x.id === v);
                          setNewListino(p => ({ ...p, fornitore_id: v, fornitore_nome: f?.ragione_sociale || '' }));
                        }}>
                          <SelectTrigger><SelectValue placeholder="Seleziona fornitore" /></SelectTrigger>
                          <SelectContent>{fornitori.map(f => <SelectItem key={f.id} value={f.id}>{f.ragione_sociale}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Nome Listino *</Label><Input value={newListino.nome} onChange={(e) => setNewListino(p => ({ ...p, nome: e.target.value }))} placeholder="es. Listino 2024" /></div>
                      <div><Label>Valido Dal</Label><Input type="date" value={newListino.valido_dal} onChange={(e) => setNewListino(p => ({ ...p, valido_dal: e.target.value }))} /></div>
                      <div><Label>Valido Al</Label><Input type="date" value={newListino.valido_al} onChange={(e) => setNewListino(p => ({ ...p, valido_al: e.target.value }))} /></div>
                      <div><Label>Sconto Applicato %</Label><Input type="number" value={newListino.sconto_applicato} onChange={(e) => setNewListino(p => ({ ...p, sconto_applicato: parseFloat(e.target.value) || 0 }))} /></div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewListino(false)}>Annulla</Button>
                      <Button onClick={() => createListinoMutation.mutate(newListino)} disabled={!newListino.fornitore_nome || !newListino.nome}>Salva</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Nome Listino</TableHead>
                    <TableHead>Valido Dal</TableHead>
                    <TableHead>Valido Al</TableHead>
                    <TableHead>Sconto</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listini.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.fornitore_nome}</TableCell>
                      <TableCell>{l.nome}</TableCell>
                      <TableCell>{formatDate(l.valido_dal)}</TableCell>
                      <TableCell>{l.valido_al ? formatDate(l.valido_al) : 'Indeterminato'}</TableCell>
                      <TableCell>{l.sconto_applicato}%</TableCell>
                      <TableCell><Badge className={l.attivo ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted'}>{l.attivo ? 'Attivo' : 'Inattivo'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedListino(l); setShowViewListino(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedListino(l); setShowEditListino(true); }}><Edit className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {listini.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nessun listino trovato</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Computo Metrico Tab */}
        <TabsContent value="computi" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Computo Metrico</CardTitle>
              <Link to="/computo-metrico"><Button className="gap-2"><Calculator className="w-4 h-4" />Apri Modulo Completo</Button></Link>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Gestione Computi Metrici</h3>
                <p className="text-muted-foreground mb-4">Accedi al modulo completo per la gestione dei computi metrici estimativi</p>
                <Link to="/computo-metrico"><Button>Vai al Computo Metrico</Button></Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flusso Documentale Tab */}
        <TabsContent value="flusso-doc" className="mt-6">
          <DocumentFlowManager />
        </TabsContent>

        {/* RFQ & Offerte Tab */}
        <TabsContent value="rfq" className="mt-6">
          <RFQManager />
        </TabsContent>

        {/* Subappalti Tab */}
        <TabsContent value="subappalti" className="mt-6">
          <SubappaltiManager />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="mt-6">
          <ComplianceMonitor />
        </TabsContent>
      </Tabs>

      {/* Dialog Modifica Fornitore */}
      <Dialog open={showEditFornitore} onOpenChange={setShowEditFornitore}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifica Fornitore</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="col-span-2"><Label>Ragione Sociale *</Label><Input value={editFornitore.ragione_sociale} onChange={(e) => setEditFornitore(p => ({ ...p, ragione_sociale: e.target.value }))} /></div>
            <div><Label>Partita IVA</Label><Input value={editFornitore.partita_iva} onChange={(e) => setEditFornitore(p => ({ ...p, partita_iva: e.target.value }))} /></div>
            <div><Label>Codice Fiscale</Label><Input value={editFornitore.codice_fiscale} onChange={(e) => setEditFornitore(p => ({ ...p, codice_fiscale: e.target.value }))} /></div>
            <div><Label>Categoria</Label><Input value={editFornitore.categoria} onChange={(e) => setEditFornitore(p => ({ ...p, categoria: e.target.value }))} /></div>
            <div><Label>Stato</Label>
              <Select value={editFornitore.stato} onValueChange={(v) => setEditFornitore(p => ({ ...p, stato: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="attivo">Attivo</SelectItem>
                  <SelectItem value="sospeso">Sospeso</SelectItem>
                  <SelectItem value="cessato">Cessato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Indirizzo</Label><Input value={editFornitore.indirizzo} onChange={(e) => setEditFornitore(p => ({ ...p, indirizzo: e.target.value }))} /></div>
            <div><Label>Città</Label><Input value={editFornitore.citta} onChange={(e) => setEditFornitore(p => ({ ...p, citta: e.target.value }))} /></div>
            <div><Label>CAP</Label><Input value={editFornitore.cap} onChange={(e) => setEditFornitore(p => ({ ...p, cap: e.target.value }))} /></div>
            <div><Label>Provincia</Label><Input value={editFornitore.provincia} onChange={(e) => setEditFornitore(p => ({ ...p, provincia: e.target.value }))} maxLength={2} /></div>
            <div><Label>Telefono</Label><Input value={editFornitore.telefono} onChange={(e) => setEditFornitore(p => ({ ...p, telefono: e.target.value }))} /></div>
            <div><Label>Cellulare</Label><Input value={editFornitore.cellulare} onChange={(e) => setEditFornitore(p => ({ ...p, cellulare: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={editFornitore.email} onChange={(e) => setEditFornitore(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>PEC</Label><Input value={editFornitore.pec} onChange={(e) => setEditFornitore(p => ({ ...p, pec: e.target.value }))} /></div>
            <div><Label>IBAN</Label><Input value={editFornitore.iban} onChange={(e) => setEditFornitore(p => ({ ...p, iban: e.target.value }))} /></div>
            <div><Label>Sconto Base %</Label><Input type="number" value={editFornitore.sconto_base} onChange={(e) => setEditFornitore(p => ({ ...p, sconto_base: parseFloat(e.target.value) || 0 }))} /></div>
            <div><Label>Condizioni Pagamento</Label><Input value={editFornitore.condizioni_pagamento} onChange={(e) => setEditFornitore(p => ({ ...p, condizioni_pagamento: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Note</Label><Textarea value={editFornitore.note} onChange={(e) => setEditFornitore(p => ({ ...p, note: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFornitore(false)}>Annulla</Button>
            <Button onClick={() => updateFornitoreMutation.mutate(editFornitore)} disabled={!editFornitore.ragione_sociale}>Salva Modifiche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Documenti Fornitore */}
      <Dialog open={showDocumentiFornitore} onOpenChange={setShowDocumentiFornitore}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Documenti di {fornitoreSelezionato?.ragione_sociale}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Lista documenti presenti */}
            {documentiFornitoreSelezionato.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo Documento</TableHead>
                    <TableHead>Numero</TableHead>
                    <TableHead>Emissione</TableHead>
                    <TableHead>Scadenza</TableHead>
                    <TableHead>Ente</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentiFornitoreSelezionato.map(doc => {
                    const status = getDocumentoStatus(doc);
                    const tipoDoc = TIPI_DOCUMENTO_FORNITORE.find(t => t.tipo === doc.tipo_documento);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tipoDoc?.obbligatorio && <span className="text-red-500 text-xs">*</span>}
                            <span className="font-medium">{doc.tipo_documento.replace(/_/g, ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{doc.numero_documento || '-'}</TableCell>
                        <TableCell>{doc.data_emissione ? formatDate(doc.data_emissione) : '-'}</TableCell>
                        <TableCell>{doc.data_scadenza ? formatDate(doc.data_scadenza) : '-'}</TableCell>
                        <TableCell>{doc.ente_emittente || '-'}</TableCell>
                        <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => deleteDocumentoMutation.mutate(doc.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileWarning className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun documento caricato per questo fornitore</p>
              </div>
            )}

            {/* Documenti mancanti */}
            {selectedFornitoreId && (() => {
              const compliance = getFornitoreCompliance(selectedFornitoreId);
              if (compliance.mancanti.length > 0) {
                return (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h4 className="font-medium text-red-500 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Documenti Obbligatori Mancanti ({compliance.mancanti.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {compliance.mancanti.map(doc => (
                        <div key={doc} className="flex items-center gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Aggiungi documento */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => {
                setNewDocumento(p => ({ ...p, fornitore_id: selectedFornitoreId || '' }));
                setShowDocumentiFornitore(false);
                setShowNewDocumento(true);
              }} className="gap-2">
                <Plus className="w-4 h-4" />Aggiungi Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza Contratto */}
      <Dialog open={showViewContratto} onOpenChange={setShowViewContratto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Dettagli Contratto {selectedContratto?.numero}
            </DialogTitle>
          </DialogHeader>
          {selectedContratto && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Numero</Label>
                  <p className="font-mono font-medium">{selectedContratto.numero}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <Badge variant="outline">{selectedContratto.tipo}</Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Titolo</Label>
                  <p className="font-medium">{selectedContratto.titolo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contraente</Label>
                  <p>{selectedContratto.contraente}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Importo</Label>
                  <p className="font-bold text-primary">{formatCurrency(selectedContratto.importo)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Inizio</Label>
                  <p>{formatDate(selectedContratto.data_inizio)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data Fine</Label>
                  <p>{formatDate(selectedContratto.data_fine)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge className={getStatoColor(selectedContratto.stato)}>{selectedContratto.stato}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rinnovo Automatico</Label>
                  <p>{selectedContratto.rinnovo_automatico ? 'Sì' : 'No'}</p>
                </div>
                {selectedContratto.descrizione && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Descrizione</Label>
                    <p className="text-sm">{selectedContratto.descrizione}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewContratto(false)}>Chiudi</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza Listino */}
      <Dialog open={showViewListino} onOpenChange={setShowViewListino}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Dettagli Listino
            </DialogTitle>
          </DialogHeader>
          {selectedListino && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Fornitore</Label>
                  <p className="font-medium">{selectedListino.fornitore_nome}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Nome Listino</Label>
                  <p className="font-medium">{selectedListino.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valido Dal</Label>
                  <p>{formatDate(selectedListino.valido_dal)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valido Al</Label>
                  <p>{selectedListino.valido_al ? formatDate(selectedListino.valido_al) : 'Indeterminato'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Sconto Applicato</Label>
                  <p className="font-bold text-primary">{selectedListino.sconto_applicato}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge className={selectedListino.attivo ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted'}>{selectedListino.attivo ? 'Attivo' : 'Inattivo'}</Badge>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewListino(false)}>Chiudi</Button>
                <Button onClick={() => { setShowViewListino(false); setShowEditListino(true); }}>Modifica</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modifica Listino */}
      <Dialog open={showEditListino} onOpenChange={setShowEditListino}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifica Listino</DialogTitle></DialogHeader>
          {selectedListino && (
            <div className="grid gap-4 pt-4">
              <div><Label>Fornitore</Label><Input value={selectedListino.fornitore_nome} disabled /></div>
              <div><Label>Nome Listino *</Label><Input value={selectedListino.nome} onChange={(e) => setSelectedListino({ ...selectedListino, nome: e.target.value })} /></div>
              <div><Label>Valido Dal</Label><Input type="date" value={selectedListino.valido_dal} onChange={(e) => setSelectedListino({ ...selectedListino, valido_dal: e.target.value })} /></div>
              <div><Label>Valido Al</Label><Input type="date" value={selectedListino.valido_al || ''} onChange={(e) => setSelectedListino({ ...selectedListino, valido_al: e.target.value || null })} /></div>
              <div><Label>Sconto Applicato %</Label><Input type="number" value={selectedListino.sconto_applicato || 0} onChange={(e) => setSelectedListino({ ...selectedListino, sconto_applicato: parseFloat(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="listino-attivo" 
                  checked={selectedListino.attivo || false} 
                  onChange={(e) => setSelectedListino({ ...selectedListino, attivo: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="listino-attivo">Listino Attivo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditListino(false); setSelectedListino(null); }}>Annulla</Button>
            <Button 
              onClick={() => selectedListino && updateListinoMutation.mutate({
                id: selectedListino.id,
                nome: selectedListino.nome,
                valido_dal: selectedListino.valido_dal,
                valido_al: selectedListino.valido_al,
                sconto_applicato: selectedListino.sconto_applicato || 0,
                attivo: selectedListino.attivo || false
              })}
              disabled={!selectedListino?.nome}
            >
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza Preventivo */}
      <Dialog open={showViewPreventivo} onOpenChange={setShowViewPreventivo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Dettagli Preventivo {selectedPreventivo?.numero}
            </DialogTitle>
          </DialogHeader>
          {selectedPreventivo && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Numero</Label>
                  <p className="font-mono">{selectedPreventivo.numero}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p>{formatDate(selectedPreventivo.data)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Fornitore</Label>
                  <p className="font-medium">{selectedPreventivo.fornitore_nome}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Oggetto</Label>
                  <p>{selectedPreventivo.oggetto}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Importo</Label>
                  <p className="font-bold text-primary">{selectedPreventivo.importo ? formatCurrency(selectedPreventivo.importo) : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Scadenza</Label>
                  <p>{selectedPreventivo.scadenza ? formatDate(selectedPreventivo.scadenza) : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge className={getStatoColor(selectedPreventivo.stato)}>{selectedPreventivo.stato}</Badge>
                </div>
                {selectedPreventivo.note && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Note</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedPreventivo.note}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewPreventivo(false)}>Chiudi</Button>
                <Button onClick={() => { setShowViewPreventivo(false); setShowEditPreventivo(true); }}>Modifica</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modifica Preventivo */}
      <Dialog open={showEditPreventivo} onOpenChange={setShowEditPreventivo}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Modifica Preventivo</DialogTitle></DialogHeader>
          {selectedPreventivo && (
            <div className="grid gap-4 pt-4">
              <div><Label>Numero</Label><Input value={selectedPreventivo.numero} disabled /></div>
              <div><Label>Fornitore</Label><Input value={selectedPreventivo.fornitore_nome} disabled /></div>
              <div><Label>Oggetto</Label><Input value={selectedPreventivo.oggetto} disabled /></div>
              <div><Label>Importo €</Label><Input type="number" value={selectedPreventivo.importo || 0} onChange={(e) => setSelectedPreventivo({ ...selectedPreventivo, importo: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Scadenza</Label><Input type="date" value={selectedPreventivo.scadenza || ''} onChange={(e) => setSelectedPreventivo({ ...selectedPreventivo, scadenza: e.target.value || null })} /></div>
              <div><Label>Note</Label><Textarea value={selectedPreventivo.note || ''} onChange={(e) => setSelectedPreventivo({ ...selectedPreventivo, note: e.target.value })} placeholder="Aggiungi note..." /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditPreventivo(false); setSelectedPreventivo(null); }}>Annulla</Button>
            <Button 
              onClick={() => selectedPreventivo && updatePreventivoMutation.mutate({
                id: selectedPreventivo.id,
                importo: selectedPreventivo.importo || undefined,
                scadenza: selectedPreventivo.scadenza || undefined,
                note: selectedPreventivo.note || undefined
              })}
            >
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizza Ordine */}
      <Dialog open={showViewOrdine} onOpenChange={setShowViewOrdine}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Dettagli Ordine {selectedOrdine?.numero}
            </DialogTitle>
          </DialogHeader>
          {selectedOrdine && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Numero</Label>
                  <p className="font-mono">{selectedOrdine.numero}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p>{formatDate(selectedOrdine.data)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Fornitore</Label>
                  <p className="font-medium">{selectedOrdine.fornitore_nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Importo</Label>
                  <p className="font-bold text-primary">{formatCurrency(selectedOrdine.importo)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stato</Label>
                  <Badge className={cn("gap-1", getStatoColor(selectedOrdine.stato))}>{getStatoIcon(selectedOrdine.stato)}{selectedOrdine.stato.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Consegna Prevista</Label>
                  <p>{selectedOrdine.data_consegna_prevista ? formatDate(selectedOrdine.data_consegna_prevista) : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Consegna Effettiva</Label>
                  <p>{selectedOrdine.data_consegna_effettiva ? formatDate(selectedOrdine.data_consegna_effettiva) : '-'}</p>
                </div>
                {selectedOrdine.note && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Note</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedOrdine.note}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewOrdine(false)}>Chiudi</Button>
                <Button onClick={() => { setShowViewOrdine(false); setShowEditOrdine(true); }}>Modifica</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modifica Ordine */}
      <Dialog open={showEditOrdine} onOpenChange={setShowEditOrdine}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Modifica Ordine</DialogTitle></DialogHeader>
          {selectedOrdine && (
            <div className="grid gap-4 pt-4">
              <div><Label>Numero</Label><Input value={selectedOrdine.numero} disabled /></div>
              <div><Label>Fornitore</Label><Input value={selectedOrdine.fornitore_nome} disabled /></div>
              <div><Label>Importo €</Label><Input value={formatCurrency(selectedOrdine.importo)} disabled /></div>
              <div><Label>Data Consegna Prevista</Label><Input type="date" value={selectedOrdine.data_consegna_prevista || ''} onChange={(e) => setSelectedOrdine({ ...selectedOrdine, data_consegna_prevista: e.target.value || null })} /></div>
              <div><Label>Data Consegna Effettiva</Label><Input type="date" value={selectedOrdine.data_consegna_effettiva || ''} onChange={(e) => setSelectedOrdine({ ...selectedOrdine, data_consegna_effettiva: e.target.value || null })} /></div>
              <div><Label>Note</Label><Textarea value={selectedOrdine.note || ''} onChange={(e) => setSelectedOrdine({ ...selectedOrdine, note: e.target.value })} placeholder="Aggiungi note su consegna, problemi, ecc..." /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditOrdine(false); setSelectedOrdine(null); }}>Annulla</Button>
            <Button 
              onClick={() => selectedOrdine && updateOrdineMutation.mutate({
                id: selectedOrdine.id,
                data_consegna_prevista: selectedOrdine.data_consegna_prevista || undefined,
                data_consegna_effettiva: selectedOrdine.data_consegna_effettiva || undefined,
                note: selectedOrdine.note || undefined
              })}
            >
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Creation Actions Dialog */}
      {createdEntity && (
        <PostCreationActions
          open={showPostCreation}
          onClose={() => {
            setShowPostCreation(false);
            setCreatedEntity(null);
          }}
          entityType={createdEntity.type}
          entityId={createdEntity.id}
          entityName={createdEntity.name}
        />
      )}
    </div>
  );
}
