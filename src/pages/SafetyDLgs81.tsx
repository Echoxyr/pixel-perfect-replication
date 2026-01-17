import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import {
  POSDigitale,
  DUVRI,
  RegistroInfortuni,
  ScadenzarioVisiteMediche,
} from '@/types/compliance';
import { formatDateFull, generateId, daysUntil } from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  FileText,
  AlertTriangle,
  Stethoscope,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Building2,
  ClipboardList,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  GraduationCap,
  Upload,
  Shield,
  Users
} from 'lucide-react';
import SafetyFormsModule from '@/components/workhub/SafetyFormsModule';
import { DocumentEditorDialog } from '@/components/workhub/DocumentEditorDialog';

// Corsi obbligatori RSPP
const CORSI_RSPP = [
  { id: 'rspp_mod_a', nome: 'Modulo A (28 ore)', obbligatorio: true, scadenza: null, descrizione: 'Formazione base per RSPP' },
  { id: 'rspp_mod_b', nome: 'Modulo B (48 ore min.)', obbligatorio: true, scadenza: null, descrizione: 'Formazione specifica settore' },
  { id: 'rspp_mod_c', nome: 'Modulo C (24 ore)', obbligatorio: true, scadenza: null, descrizione: 'Competenze relazionali' },
  { id: 'rspp_agg', nome: 'Aggiornamento quinquennale (40 ore)', obbligatorio: true, scadenza: '5 anni', descrizione: 'Aggiornamento obbligatorio' },
];

// Corsi obbligatori RLS
const CORSI_RLS = [
  { id: 'rls_base', nome: 'Formazione RLS (32 ore)', obbligatorio: true, scadenza: null, descrizione: 'Formazione iniziale RLS' },
  { id: 'rls_agg_4', nome: 'Aggiornamento annuale (4 ore)', obbligatorio: true, scadenza: '1 anno', descrizione: 'Aziende 15-50 dipendenti' },
  { id: 'rls_agg_8', nome: 'Aggiornamento annuale (8 ore)', obbligatorio: true, scadenza: '1 anno', descrizione: 'Aziende > 50 dipendenti' },
];

interface FiguraSicurezza {
  id: string;
  tipo: 'rspp' | 'rls';
  nome: string;
  cognome: string;
  codiceFiscale: string;
  dataNomina: string;
  telefono: string;
  email: string;
  note?: string;
  corsiCompletati: CorsoFigura[];
  documentiUrl: DocumentoFigura[];
}

interface CorsoFigura {
  id: string;
  corsoId: string;
  dataConseguimento: string;
  dataScadenza?: string;
  ente: string;
  attestatoUrl?: string;
}

interface DocumentoFigura {
  id: string;
  nome: string;
  tipo: string;
  dataCaricamento: string;
  url: string;
}

export default function SafetyDLgs81() {
  const { cantieri, imprese, lavoratori } = useWorkHub();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // POS Digitali con persistenza
  const [posDigitali, setPosDigitali] = useState<POSDigitale[]>(() => {
    const saved = localStorage.getItem('safety_pos');
    return saved ? JSON.parse(saved) : [];
  });

  // DUVRI con persistenza
  const [duvri, setDuvri] = useState<DUVRI[]>(() => {
    const saved = localStorage.getItem('safety_duvri');
    return saved ? JSON.parse(saved) : [];
  });

  // Registro Infortuni con persistenza
  const [infortuni, setInfortuni] = useState<RegistroInfortuni[]>(() => {
    const saved = localStorage.getItem('safety_infortuni');
    return saved ? JSON.parse(saved) : [];
  });

  // Visite Mediche con persistenza
  const [visiteMediche, setVisiteMediche] = useState<ScadenzarioVisiteMediche[]>(() => {
    const saved = localStorage.getItem('safety_visite');
    return saved ? JSON.parse(saved) : [];
  });

  // Figure Sicurezza (RSPP e RLS) con persistenza
  const [figureSicurezza, setFigureSicurezza] = useState<FiguraSicurezza[]>(() => {
    const saved = localStorage.getItem('safety_figure');
    return saved ? JSON.parse(saved) : [];
  });

  // Salva automaticamente
  useEffect(() => {
    localStorage.setItem('safety_pos', JSON.stringify(posDigitali));
  }, [posDigitali]);

  useEffect(() => {
    localStorage.setItem('safety_duvri', JSON.stringify(duvri));
  }, [duvri]);

  useEffect(() => {
    localStorage.setItem('safety_infortuni', JSON.stringify(infortuni));
  }, [infortuni]);

  useEffect(() => {
    localStorage.setItem('safety_visite', JSON.stringify(visiteMediche));
  }, [visiteMediche]);

  useEffect(() => {
    localStorage.setItem('safety_figure', JSON.stringify(figureSicurezza));
  }, [figureSicurezza]);

  const [showNewFiguraDialog, setShowNewFiguraDialog] = useState(false);
  const [showCorsiFiguraDialog, setShowCorsiFiguraDialog] = useState(false);
  const [showDocumentiFiguraDialog, setShowDocumentiFiguraDialog] = useState(false);
  const [selectedFigura, setSelectedFigura] = useState<FiguraSicurezza | null>(null);
  const [editingFigura, setEditingFigura] = useState<FiguraSicurezza | null>(null);
  const [figuraType, setFiguraType] = useState<'rspp' | 'rls'>('rspp');

  const [newFigura, setNewFigura] = useState({
    nome: '',
    cognome: '',
    codiceFiscale: '',
    dataNomina: '',
    telefono: '',
    email: '',
    note: ''
  });

  const [newCorso, setNewCorso] = useState({
    corsoId: '',
    dataConseguimento: '',
    dataScadenza: '',
    ente: ''
  });

  const [showNewPOSDialog, setShowNewPOSDialog] = useState(false);
  const [showNewInfortunioDialog, setShowNewInfortunioDialog] = useState(false);
  const [showPOSEditorDialog, setShowPOSEditorDialog] = useState(false);
  const [editingPOS, setEditingPOS] = useState<POSDigitale | null>(null);
  const [editingPOSContent, setEditingPOSContent] = useState('');
  const [posStep, setPosStep] = useState(1);
  const [newPOSData, setNewPOSData] = useState({ 
    cantiereId: '', 
    impresaId: '', 
    versione: '1.0',
    rischioGenerico: [] as string[],
    rischioSpecifico: [] as string[],
    misurePrevenzione: [] as string[],
    dpiRichiesti: [] as string[],
    newRischio: '',
    newMisura: ''
  });

  // Nuovo infortunio form state
  const [newInfortunio, setNewInfortunio] = useState({
    lavoratoreId: '',
    lavoratoreNome: '',
    cantiereId: '',
    impresaId: '',
    dataInfortunio: '',
    oraInfortunio: '',
    luogo: '',
    descrizioneEvento: '',
    natureLesioni: '',
    sedeLesioni: '',
    giorniPrognosi: 0,
    giorniAssenza: 0,
    denunciaINAIL: false,
    denunciaINAILNumero: '',
    denunciaINAILData: '',
    testimoni: '',
    misureCorrettive: '',
    note: ''
  });

  // Contenuti POS salvati localmente (estensione del tipo base)
  const [posContents, setPosContents] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('safety_pos_contents');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('safety_pos_contents', JSON.stringify(posContents));
  }, [posContents]);

  const rsppList = figureSicurezza.filter(f => f.tipo === 'rspp');
  const rlsList = figureSicurezza.filter(f => f.tipo === 'rls');

  const stats = useMemo(() => {
    const visiteScadute = visiteMediche.filter(v => daysUntil(v.dataScadenza) < 0).length;
    const visiteInScadenza = visiteMediche.filter(v => {
      const days = daysUntil(v.dataScadenza);
      return days >= 0 && days <= 30;
    }).length;

    return {
      posAttivi: posDigitali.filter(p => p.stato === 'approvato').length,
      posDaApprovare: posDigitali.filter(p => p.stato === 'inviato').length,
      duvriAttivi: duvri.filter(d => d.stato === 'approvato').length,
      infortuniAnno: infortuni.filter(i => new Date(i.dataInfortunio).getFullYear() === new Date().getFullYear()).length,
      giorniSenzaInfortuni: infortuni.length === 0 ? 365 : Math.floor((Date.now() - new Date(infortuni[infortuni.length - 1]?.dataInfortunio || 0).getTime()) / (24 * 60 * 60 * 1000)),
      visiteScadute,
      visiteInScadenza,
      visiteOk: visiteMediche.length - visiteScadute - visiteInScadenza,
      rsppCount: rsppList.length,
      rlsCount: rlsList.length
    };
  }, [posDigitali, duvri, infortuni, visiteMediche, rsppList, rlsList]);

  const getCantiereName = (id: string) => {
    const c = cantieri.find(c => c.id === id);
    return c ? `${c.codiceCommessa} - ${c.nome}` : '-';
  };

  const getImpresaName = (id: string) => {
    const i = imprese.find(i => i.id === id);
    return i?.ragioneSociale || '-';
  };

  // Handlers per Figure Sicurezza
  const handleAddFigura = () => {
    if (!newFigura.nome || !newFigura.cognome) {
      toast({ title: 'Errore', description: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }

    const figura: FiguraSicurezza = {
      id: generateId(),
      tipo: figuraType,
      nome: newFigura.nome,
      cognome: newFigura.cognome,
      codiceFiscale: newFigura.codiceFiscale,
      dataNomina: newFigura.dataNomina,
      telefono: newFigura.telefono,
      email: newFigura.email,
      note: newFigura.note,
      corsiCompletati: [],
      documentiUrl: []
    };

    if (editingFigura) {
      setFigureSicurezza(prev => prev.map(f => f.id === editingFigura.id ? { ...figura, id: editingFigura.id, corsiCompletati: editingFigura.corsiCompletati, documentiUrl: editingFigura.documentiUrl } : f));
      toast({ title: 'Figura aggiornata', description: `${figuraType.toUpperCase()} aggiornato con successo` });
    } else {
      setFigureSicurezza(prev => [...prev, figura]);
      toast({ title: 'Figura aggiunta', description: `${figuraType.toUpperCase()} aggiunto con successo` });
    }

    setNewFigura({ nome: '', cognome: '', codiceFiscale: '', dataNomina: '', telefono: '', email: '', note: '' });
    setEditingFigura(null);
    setShowNewFiguraDialog(false);
  };

  const handleDeleteFigura = (id: string) => {
    setFigureSicurezza(prev => prev.filter(f => f.id !== id));
    toast({ title: 'Figura eliminata', description: 'Figura rimossa con successo' });
  };

  const handleEditFigura = (figura: FiguraSicurezza) => {
    setEditingFigura(figura);
    setFiguraType(figura.tipo);
    setNewFigura({
      nome: figura.nome,
      cognome: figura.cognome,
      codiceFiscale: figura.codiceFiscale,
      dataNomina: figura.dataNomina,
      telefono: figura.telefono,
      email: figura.email,
      note: figura.note || ''
    });
    setShowNewFiguraDialog(true);
  };

  const handleAddCorso = () => {
    if (!selectedFigura || !newCorso.corsoId || !newCorso.dataConseguimento) {
      toast({ title: 'Errore', description: 'Compila tutti i campi obbligatori', variant: 'destructive' });
      return;
    }

    const corso: CorsoFigura = {
      id: generateId(),
      corsoId: newCorso.corsoId,
      dataConseguimento: newCorso.dataConseguimento,
      dataScadenza: newCorso.dataScadenza || undefined,
      ente: newCorso.ente
    };

    setFigureSicurezza(prev => prev.map(f => {
      if (f.id === selectedFigura.id) {
        return { ...f, corsiCompletati: [...f.corsiCompletati, corso] };
      }
      return f;
    }));

    setNewCorso({ corsoId: '', dataConseguimento: '', dataScadenza: '', ente: '' });
    toast({ title: 'Corso aggiunto', description: 'Attestato corso registrato' });
  };

  const handleDeleteCorso = (figuraId: string, corsoId: string) => {
    setFigureSicurezza(prev => prev.map(f => {
      if (f.id === figuraId) {
        return { ...f, corsiCompletati: f.corsiCompletati.filter(c => c.id !== corsoId) };
      }
      return f;
    }));
    toast({ title: 'Corso rimosso' });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFigura || !event.target.files?.length) return;
    
    const file = event.target.files[0];
    const documento: DocumentoFigura = {
      id: generateId(),
      nome: file.name,
      tipo: file.type,
      dataCaricamento: new Date().toISOString().slice(0, 10),
      url: URL.createObjectURL(file)
    };

    setFigureSicurezza(prev => prev.map(f => {
      if (f.id === selectedFigura.id) {
        return { ...f, documentiUrl: [...f.documentiUrl, documento] };
      }
      return f;
    }));

    toast({ title: 'Documento caricato', description: file.name });
  };

  const handleDeleteDocumento = (figuraId: string, docId: string) => {
    setFigureSicurezza(prev => prev.map(f => {
      if (f.id === figuraId) {
        return { ...f, documentiUrl: f.documentiUrl.filter(d => d.id !== docId) };
      }
      return f;
    }));
    toast({ title: 'Documento rimosso' });
  };

  const getCorsiForType = (tipo: 'rspp' | 'rls') => {
    return tipo === 'rspp' ? CORSI_RSPP : CORSI_RLS;
  };

  const getCorsoNome = (tipo: 'rspp' | 'rls', corsoId: string) => {
    const corsi = getCorsiForType(tipo);
    return corsi.find(c => c.id === corsoId)?.nome || corsoId;
  };

  const getCorsiComplianceStatus = (figura: FiguraSicurezza) => {
    const corsiObbligatori = getCorsiForType(figura.tipo).filter(c => c.obbligatorio);
    const completati = figura.corsiCompletati.length;
    const totale = corsiObbligatori.length;
    const percentage = totale > 0 ? (completati / totale) * 100 : 0;
    
    // Check for expired courses
    const scaduti = figura.corsiCompletati.filter(c => c.dataScadenza && daysUntil(c.dataScadenza) < 0).length;
    const inScadenza = figura.corsiCompletati.filter(c => {
      if (!c.dataScadenza) return false;
      const days = daysUntil(c.dataScadenza);
      return days >= 0 && days <= 30;
    }).length;

    return { completati, totale, percentage, scaduti, inScadenza };
  };

  const renderFiguraSection = (tipo: 'rspp' | 'rls', lista: FiguraSicurezza[]) => {
    const tipoLabel = tipo === 'rspp' ? 'RSPP' : 'RLS';
    const tipoDesc = tipo === 'rspp' 
      ? 'Responsabile del Servizio di Prevenzione e Protezione' 
      : 'Rappresentante dei Lavoratori per la Sicurezza';
    const corsi = getCorsiForType(tipo);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {tipo === 'rspp' ? <Shield className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-primary" />}
              {tipoLabel}
            </h2>
            <p className="text-sm text-muted-foreground">{tipoDesc}</p>
          </div>
          <Button 
            onClick={() => {
              setFiguraType(tipo);
              setEditingFigura(null);
              setNewFigura({ nome: '', cognome: '', codiceFiscale: '', dataNomina: '', telefono: '', email: '', note: '' });
              setShowNewFiguraDialog(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuovo {tipoLabel}
          </Button>
        </div>

        {/* Corsi Obbligatori Reference */}
        <div className="p-4 rounded-xl border border-border bg-muted/30">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Corsi/Attestati Obbligatori per {tipoLabel}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {corsi.map(corso => (
              <div key={corso.id} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">{corso.nome}</span>
                  {corso.scadenza && <span className="text-muted-foreground"> - Rinnovo: {corso.scadenza}</span>}
                  <p className="text-xs text-muted-foreground">{corso.descrizione}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista Figure */}
        {lista.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nessun {tipoLabel} registrato</p>
            <p className="text-sm">Aggiungi il nominativo {tipoLabel} dell'azienda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lista.map(figura => {
              const compliance = getCorsiComplianceStatus(figura);
              
              return (
                <div key={figura.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'p-3 rounded-lg',
                        compliance.scaduti > 0 ? 'bg-red-500/10' :
                        compliance.inScadenza > 0 ? 'bg-amber-500/10' :
                        compliance.percentage === 100 ? 'bg-emerald-500/10' :
                        'bg-blue-500/10'
                      )}>
                        {tipo === 'rspp' ? (
                          <Shield className={cn(
                            'w-5 h-5',
                            compliance.scaduti > 0 ? 'text-red-500' :
                            compliance.inScadenza > 0 ? 'text-amber-500' :
                            compliance.percentage === 100 ? 'text-emerald-500' :
                            'text-blue-500'
                          )} />
                        ) : (
                          <Users className={cn(
                            'w-5 h-5',
                            compliance.scaduti > 0 ? 'text-red-500' :
                            compliance.inScadenza > 0 ? 'text-amber-500' :
                            compliance.percentage === 100 ? 'text-emerald-500' :
                            'text-blue-500'
                          )} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{figura.nome} {figura.cognome}</h3>
                        <p className="text-sm text-muted-foreground">CF: {figura.codiceFiscale}</p>
                        <p className="text-sm text-muted-foreground">Nominato il: {formatDateFull(figura.dataNomina)}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {figura.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {figura.telefono}
                            </span>
                          )}
                          {figura.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {figura.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedFigura(figura);
                          setShowDocumentiFiguraDialog(true);
                        }}
                        className="gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        Documenti ({figura.documentiUrl.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedFigura(figura);
                          setShowCorsiFiguraDialog(true);
                        }}
                        className="gap-1"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Corsi
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditFigura(figura)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteFigura(figura.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Corsi */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completamento Formazione</span>
                      <span className="text-sm text-muted-foreground">
                        {compliance.completati}/{compliance.totale} corsi
                        {compliance.scaduti > 0 && (
                          <Badge variant="destructive" className="ml-2">{compliance.scaduti} scaduti</Badge>
                        )}
                        {compliance.inScadenza > 0 && (
                          <Badge className="ml-2 bg-amber-500/20 text-amber-500">{compliance.inScadenza} in scadenza</Badge>
                        )}
                      </span>
                    </div>
                    <Progress 
                      value={compliance.percentage} 
                      className={cn(
                        'h-2',
                        compliance.scaduti > 0 && '[&>div]:bg-red-500',
                        compliance.inScadenza > 0 && compliance.scaduti === 0 && '[&>div]:bg-amber-500'
                      )}
                    />
                  </div>

                  {/* Lista Corsi Completati */}
                  {figura.corsiCompletati.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Attestati Registrati:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {figura.corsiCompletati.map(corso => {
                          const isExpired = corso.dataScadenza && daysUntil(corso.dataScadenza) < 0;
                          const isExpiring = corso.dataScadenza && daysUntil(corso.dataScadenza) >= 0 && daysUntil(corso.dataScadenza) <= 30;
                          
                          return (
                            <div key={corso.id} className={cn(
                              'p-2 rounded-lg text-sm flex items-center justify-between',
                              isExpired ? 'bg-red-500/10 border border-red-500/30' :
                              isExpiring ? 'bg-amber-500/10 border border-amber-500/30' :
                              'bg-muted/30'
                            )}>
                              <div>
                                <p className="font-medium">{getCorsoNome(figura.tipo, corso.corsoId)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateFull(corso.dataConseguimento)}
                                  {corso.dataScadenza && ` - Scade: ${formatDateFull(corso.dataScadenza)}`}
                                </p>
                              </div>
                              {isExpired && <Badge variant="destructive">Scaduto</Badge>}
                              {isExpiring && <Badge className="bg-amber-500/20 text-amber-500">In scadenza</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            Sicurezza D.Lgs 81/2008
          </h1>
          <p className="text-muted-foreground">POS digitali, DUVRI, Registro infortuni, Figure sicurezza e Visite mediche</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewInfortunioDialog(true)} className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Registra Infortunio
          </Button>
          <Button onClick={() => setShowNewPOSDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo POS
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">POS Attivi</span>
          </div>
          <p className="text-xl font-bold">{stats.posAttivi}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">POS da Approvare</span>
          </div>
          <p className="text-xl font-bold text-amber-500">{stats.posDaApprovare}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">DUVRI</span>
          </div>
          <p className="text-xl font-bold">{stats.duvriAttivi}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Infortuni Anno</span>
          </div>
          <p className="text-xl font-bold">{stats.infortuniAnno}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Giorni senza Infortuni</span>
          </div>
          <p className="text-xl font-bold text-emerald-500">{stats.giorniSenzaInfortuni}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">RSPP</span>
          </div>
          <p className="text-xl font-bold">{stats.rsppCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">RLS</span>
          </div>
          <p className="text-xl font-bold">{stats.rlsCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Visite Scadute</span>
          </div>
          <p className="text-xl font-bold text-red-500">{stats.visiteScadute}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">In Scadenza</span>
          </div>
          <p className="text-xl font-bold text-amber-500">{stats.visiteInScadenza}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="pos">POS Digitali</TabsTrigger>
          <TabsTrigger value="duvri">DUVRI</TabsTrigger>
          <TabsTrigger value="infortuni">Registro Infortuni</TabsTrigger>
          <TabsTrigger value="rspp" className="gap-1">
            <Shield className="w-4 h-4" />
            RSPP
          </TabsTrigger>
          <TabsTrigger value="rls" className="gap-1">
            <Users className="w-4 h-4" />
            RLS
          </TabsTrigger>
          <TabsTrigger value="visite">Visite Mediche</TabsTrigger>
          <TabsTrigger value="moduli" className="gap-1">
            <ClipboardList className="w-4 h-4" />
            Moduli Compilabili
          </TabsTrigger>
        </TabsList>

        {/* POS Tab */}
        <TabsContent value="pos" className="mt-6">
          <div className="space-y-4">
            {posDigitali.map(pos => (
              <div key={pos.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-3 rounded-lg',
                      pos.stato === 'approvato' ? 'bg-emerald-500/10' :
                      pos.stato === 'inviato' ? 'bg-blue-500/10' :
                      pos.stato === 'rifiutato' ? 'bg-red-500/10' :
                      'bg-gray-500/10'
                    )}>
                      <FileText className={cn(
                        'w-5 h-5',
                        pos.stato === 'approvato' ? 'text-emerald-500' :
                        pos.stato === 'inviato' ? 'text-blue-500' :
                        pos.stato === 'rifiutato' ? 'text-red-500' :
                        'text-gray-500'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">POS v{pos.versione}</h3>
                        <Badge className={cn(
                          pos.stato === 'approvato' && 'bg-emerald-500/20 text-emerald-500',
                          pos.stato === 'inviato' && 'bg-blue-500/20 text-blue-500',
                          pos.stato === 'rifiutato' && 'bg-red-500/20 text-red-500',
                          pos.stato === 'bozza' && 'bg-gray-500/20 text-gray-500'
                        )}>
                          {pos.stato.replace('_', ' ')}
                        </Badge>
                        {pos.firmaDigitale && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Firmato
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{getCantiereName(pos.cantiereId)}</p>
                      <p className="text-sm text-muted-foreground">{getImpresaName(pos.impresaId)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingPOS(pos);
                        setEditingPOSContent(posContents[pos.id] || '');
                        setShowPOSEditorDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifica
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border text-sm">
                  <div>
                    <p className="text-muted-foreground">Rischi Generici</p>
                    <p className="font-medium">{pos.rischioGenerico.length} identificati</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rischi Specifici</p>
                    <p className="font-medium">{pos.rischioSpecifico.length} identificati</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Misure Prevenzione</p>
                    <p className="font-medium">{pos.misurePrevenzione.length} previste</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">DPI Richiesti</p>
                    <p className="font-medium">{pos.dpiRichiesti.length} tipologie</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* DUVRI Tab */}
        <TabsContent value="duvri" className="mt-6">
          <div className="space-y-4">
            {duvri.map(d => (
              <div key={d.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">DUVRI - {getCantiereName(d.cantiereId)}</h3>
                      <Badge className={cn(
                        d.stato === 'approvato' && 'bg-emerald-500/20 text-emerald-500',
                        d.stato === 'in_firma' && 'bg-amber-500/20 text-amber-500',
                        d.stato === 'bozza' && 'bg-gray-500/20 text-gray-500'
                      )}>
                        {d.stato.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Redatto il {formatDateFull(d.dataRedazione)} | Costi sicurezza: €{d.costiSicurezza.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Imprese Interferenti:</p>
                  <div className="flex flex-wrap gap-2">
                    {d.impreseInterferenti.map(id => (
                      <Badge key={id} variant="outline">{getImpresaName(id)}</Badge>
                    ))}
                  </div>
                </div>
                {d.rischInterferenza.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Rischi Interferenza:</p>
                    {d.rischInterferenza.map((r, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium">{r.descrizione}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Misure: {r.misurePreviste.join(', ')} | Responsabile: {r.responsabile}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Infortuni Tab */}
        <TabsContent value="infortuni" className="mt-6">
          {infortuni.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-lg font-semibold text-foreground">Nessun infortunio registrato</h3>
              <p className="text-sm">Ottimo! Continuare a mantenere alti standard di sicurezza</p>
            </div>
          ) : (
            <div className="space-y-4">
              {infortuni.map(i => (
                <div key={i.id} className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{i.lavoratoreNome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDateFull(i.dataInfortunio)} ore {i.oraInfortunio} - {i.luogo}
                      </p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-500">{i.giorniPrognosi} gg prognosi</Badge>
                  </div>
                  <p className="text-sm mt-2">{i.descrizioneEvento}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* RSPP Tab */}
        <TabsContent value="rspp" className="mt-6">
          {renderFiguraSection('rspp', rsppList)}
        </TabsContent>

        {/* RLS Tab */}
        <TabsContent value="rls" className="mt-6">
          {renderFiguraSection('rls', rlsList)}
        </TabsContent>

        {/* Visite Mediche Tab */}
        <TabsContent value="visite" className="mt-6">
          <div className="space-y-4">
            {visiteMediche.map(v => {
              const days = daysUntil(v.dataScadenza);
              const isExpired = days < 0;
              const isExpiring = days >= 0 && days <= 30;

              return (
                <div key={v.id} className={cn(
                  'p-4 rounded-xl border bg-card',
                  isExpired ? 'border-red-500/50' :
                  isExpiring ? 'border-amber-500/50' :
                  'border-border'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'p-2 rounded-lg',
                        isExpired ? 'bg-red-500/10' :
                        isExpiring ? 'bg-amber-500/10' :
                        'bg-emerald-500/10'
                      )}>
                        <Stethoscope className={cn(
                          'w-5 h-5',
                          isExpired ? 'text-red-500' :
                          isExpiring ? 'text-amber-500' :
                          'text-emerald-500'
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{v.lavoratoreNome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {v.tipoVisita} | MC: {v.medicoCompetente}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        v.idoneitaGiudizio === 'idoneo' && 'bg-emerald-500/20 text-emerald-500',
                        v.idoneitaGiudizio === 'idoneo_con_prescrizioni' && 'bg-amber-500/20 text-amber-500',
                        v.idoneitaGiudizio === 'idoneo_con_limitazioni' && 'bg-orange-500/20 text-orange-500',
                        v.idoneitaGiudizio.includes('non_idoneo') && 'bg-red-500/20 text-red-500'
                      )}>
                        {v.idoneitaGiudizio.replace(/_/g, ' ')}
                      </Badge>
                      <p className={cn(
                        'text-sm mt-1',
                        isExpired ? 'text-red-500' :
                        isExpiring ? 'text-amber-500' :
                        'text-muted-foreground'
                      )}>
                        Scade: {formatDateFull(v.dataScadenza)}
                        {isExpired && ' (SCADUTA)'}
                        {isExpiring && ` (${days} giorni)`}
                      </p>
                    </div>
                  </div>
                  {v.prescrizioni && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm"><strong>Prescrizioni:</strong> {v.prescrizioni}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Moduli Compilabili Tab */}
        <TabsContent value="moduli" className="mt-6">
          <SafetyFormsModule />
        </TabsContent>
      </Tabs>

      {/* New Figura Dialog */}
      <Dialog open={showNewFiguraDialog} onOpenChange={setShowNewFiguraDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFigura ? 'Modifica' : 'Nuovo'} {figuraType.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome *</Label>
                <Input 
                  value={newFigura.nome}
                  onChange={(e) => setNewFigura({...newFigura, nome: e.target.value})}
                  placeholder="Nome"
                />
              </div>
              <div>
                <Label>Cognome *</Label>
                <Input 
                  value={newFigura.cognome}
                  onChange={(e) => setNewFigura({...newFigura, cognome: e.target.value})}
                  placeholder="Cognome"
                />
              </div>
            </div>
            <div>
              <Label>Codice Fiscale</Label>
              <Input 
                value={newFigura.codiceFiscale}
                onChange={(e) => setNewFigura({...newFigura, codiceFiscale: e.target.value.toUpperCase()})}
                placeholder="RSSMRA80A01H501A"
                maxLength={16}
              />
            </div>
            <div>
              <Label>Data Nomina</Label>
              <Input 
                type="date"
                value={newFigura.dataNomina}
                onChange={(e) => setNewFigura({...newFigura, dataNomina: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefono</Label>
                <Input 
                  value={newFigura.telefono}
                  onChange={(e) => setNewFigura({...newFigura, telefono: e.target.value})}
                  placeholder="+39 xxx xxx xxxx"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newFigura.email}
                  onChange={(e) => setNewFigura({...newFigura, email: e.target.value})}
                  placeholder="email@esempio.it"
                />
              </div>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea 
                value={newFigura.note}
                onChange={(e) => setNewFigura({...newFigura, note: e.target.value})}
                placeholder="Note aggiuntive..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewFiguraDialog(false);
              setEditingFigura(null);
            }}>Annulla</Button>
            <Button onClick={handleAddFigura}>
              {editingFigura ? 'Aggiorna' : 'Aggiungi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Corsi Figura Dialog - STILE MEDICO COMPETENTE */}
      <Dialog open={showCorsiFiguraDialog} onOpenChange={setShowCorsiFiguraDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Corsi e Attestati - {selectedFigura?.nome} {selectedFigura?.cognome} ({selectedFigura?.tipo.toUpperCase()})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Requisiti Obbligatori - STILE MEDICO COMPETENTE */}
            <div>
              <h4 className="font-medium mb-3">Requisiti Obbligatori</h4>
              <div className="space-y-2">
                {selectedFigura && getCorsiForType(selectedFigura.tipo).map(corso => {
                  const completato = selectedFigura.corsiCompletati.find(c => c.corsoId === corso.id);
                  const isExpired = completato?.dataScadenza && daysUntil(completato.dataScadenza) < 0;
                  const isExpiring = completato?.dataScadenza && daysUntil(completato.dataScadenza) >= 0 && daysUntil(completato.dataScadenza) <= 30;
                  
                  return (
                    <div key={corso.id} className={cn(
                      'p-3 rounded-lg border flex items-center justify-between',
                      completato && !isExpired && !isExpiring ? 'border-emerald-500/30 bg-emerald-500/5' : 
                      completato && isExpired ? 'border-red-500/30 bg-red-500/5' :
                      completato && isExpiring ? 'border-amber-500/30 bg-amber-500/5' :
                      'border-amber-500/30 bg-amber-500/5'
                    )}>
                      <div className="flex items-center gap-3">
                        {completato && !isExpired && !isExpiring ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : completato && isExpired ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{corso.nome}</p>
                          {completato && (
                            <p className="text-xs text-muted-foreground">
                              Conseguito il {formatDateFull(completato.dataConseguimento)}
                              {completato.ente && ` presso ${completato.ente}`}
                            </p>
                          )}
                          {corso.scadenza && (
                            <p className="text-xs text-muted-foreground">Validita: {corso.scadenza}</p>
                          )}
                          {completato && isExpired && (
                            <p className="text-xs text-red-500 font-medium">SCADUTO - Rinnovo necessario</p>
                          )}
                          {completato && isExpiring && (
                            <p className="text-xs text-amber-500 font-medium">In scadenza tra {daysUntil(completato.dataScadenza!)} giorni</p>
                          )}
                        </div>
                      </div>
                      {completato && (
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteCorso(selectedFigura.id, completato.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aggiungi Corso/Attestato - STILE MEDICO COMPETENTE */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Aggiungi Corso/Attestato</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo Corso *</Label>
                  <Select value={newCorso.corsoId} onValueChange={(v) => setNewCorso({...newCorso, corsoId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona corso" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFigura && getCorsiForType(selectedFigura.tipo).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Conseguimento *</Label>
                  <Input 
                    type="date"
                    value={newCorso.dataConseguimento}
                    onChange={(e) => setNewCorso({...newCorso, dataConseguimento: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Ente Formatore</Label>
                  <Input 
                    value={newCorso.ente}
                    onChange={(e) => setNewCorso({...newCorso, ente: e.target.value})}
                    placeholder="Universita, Ordine..."
                  />
                </div>
                <div>
                  <Label>Data Scadenza</Label>
                  <Input 
                    type="date"
                    value={newCorso.dataScadenza}
                    onChange={(e) => setNewCorso({...newCorso, dataScadenza: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddCorso} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Aggiungi Corso
              </Button>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorsiFiguraDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documenti Figura Dialog */}
      <Dialog open={showDocumentiFiguraDialog} onOpenChange={setShowDocumentiFiguraDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Documenti - {selectedFigura?.nome} {selectedFigura?.cognome} ({selectedFigura?.tipo.toUpperCase()})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Upload */}
            <div className="p-4 border border-dashed border-border rounded-lg text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Carica documenti (PDF, Word, Immagini)
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Seleziona File
              </Button>
            </div>

            {/* Lista Documenti */}
            <div>
              <h3 className="font-medium mb-4">Documenti Caricati</h3>
              {selectedFigura?.documentiUrl.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nessun documento caricato</p>
              ) : (
                <div className="space-y-2">
                  {selectedFigura?.documentiUrl.map(doc => (
                    <div key={doc.id} className="p-3 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Caricato: {formatDateFull(doc.dataCaricamento)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} download={doc.nome}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteDocumento(selectedFigura.id, doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentiFiguraDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDocumentiFiguraDialog} onOpenChange={setShowDocumentiFiguraDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Documenti - {selectedFigura?.nome} {selectedFigura?.cognome} ({selectedFigura?.tipo.toUpperCase()})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Upload */}
            <div className="p-4 border border-dashed border-border rounded-lg text-center">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Carica documenti (PDF, Word, Immagini)
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Seleziona File
              </Button>
            </div>

            {/* Lista Documenti */}
            <div>
              <h3 className="font-medium mb-4">Documenti Caricati</h3>
              {selectedFigura?.documentiUrl.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nessun documento caricato</p>
              ) : (
                <div className="space-y-2">
                  {selectedFigura?.documentiUrl.map(doc => (
                    <div key={doc.id} className="p-3 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Caricato: {formatDateFull(doc.dataCaricamento)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} download={doc.nome}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteDocumento(selectedFigura.id, doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentiFiguraDialog(false)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Infortunio Dialog - COMPLETE */}
      <Dialog open={showNewInfortunioDialog} onOpenChange={setShowNewInfortunioDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Registrazione Infortunio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Dati Lavoratore */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium mb-4 text-sm text-muted-foreground">DATI LAVORATORE</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Lavoratore *</Label>
                  <Select 
                    value={newInfortunio.lavoratoreId} 
                    onValueChange={(v) => {
                      const lav = lavoratori.find(l => l.id === v);
                      setNewInfortunio(prev => ({ 
                        ...prev, 
                        lavoratoreId: v, 
                        lavoratoreNome: lav ? `${lav.nome} ${lav.cognome}` : '',
                        impresaId: lav?.impresaId || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona lavoratore" />
                    </SelectTrigger>
                    <SelectContent>
                      {lavoratori.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.nome} {l.cognome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Impresa</Label>
                  <Select value={newInfortunio.impresaId} onValueChange={(v) => setNewInfortunio(prev => ({ ...prev, impresaId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona impresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {imprese.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dati Evento */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium mb-4 text-sm text-muted-foreground">DATI EVENTO</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Data Infortunio *</Label>
                  <Input 
                    type="date"
                    value={newInfortunio.dataInfortunio}
                    onChange={(e) => setNewInfortunio(prev => ({ ...prev, dataInfortunio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Ora Infortunio *</Label>
                  <Input 
                    type="time"
                    value={newInfortunio.oraInfortunio}
                    onChange={(e) => setNewInfortunio(prev => ({ ...prev, oraInfortunio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Cantiere/Luogo *</Label>
                  <Select value={newInfortunio.cantiereId} onValueChange={(v) => {
                    const c = cantieri.find(c => c.id === v);
                    setNewInfortunio(prev => ({ ...prev, cantiereId: v, luogo: c ? `${c.codiceCommessa} - ${c.nome}` : '' }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona cantiere" />
                    </SelectTrigger>
                    <SelectContent>
                      {cantieri.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label>Descrizione Evento *</Label>
                <Textarea 
                  value={newInfortunio.descrizioneEvento}
                  onChange={(e) => setNewInfortunio(prev => ({ ...prev, descrizioneEvento: e.target.value }))}
                  placeholder="Descrizione dettagliata di come si è verificato l'infortunio..."
                  rows={3}
                />
              </div>
            </div>

            {/* Dati Lesione */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium mb-4 text-sm text-muted-foreground">DATI LESIONE</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Natura Lesione *</Label>
                  <Select value={newInfortunio.natureLesioni} onValueChange={(v) => setNewInfortunio(prev => ({ ...prev, natureLesioni: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo di lesione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contusione">Contusione</SelectItem>
                      <SelectItem value="ferita">Ferita</SelectItem>
                      <SelectItem value="frattura">Frattura</SelectItem>
                      <SelectItem value="lussazione">Lussazione</SelectItem>
                      <SelectItem value="distorsione">Distorsione</SelectItem>
                      <SelectItem value="ustione">Ustione</SelectItem>
                      <SelectItem value="amputazione">Amputazione</SelectItem>
                      <SelectItem value="intossicazione">Intossicazione</SelectItem>
                      <SelectItem value="schiacciamento">Schiacciamento</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sede Lesione *</Label>
                  <Select value={newInfortunio.sedeLesioni} onValueChange={(v) => setNewInfortunio(prev => ({ ...prev, sedeLesioni: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Parte del corpo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="testa">Testa</SelectItem>
                      <SelectItem value="collo">Collo</SelectItem>
                      <SelectItem value="spalla">Spalla</SelectItem>
                      <SelectItem value="braccio">Braccio</SelectItem>
                      <SelectItem value="mano">Mano</SelectItem>
                      <SelectItem value="dita_mano">Dita mano</SelectItem>
                      <SelectItem value="torace">Torace</SelectItem>
                      <SelectItem value="schiena">Schiena</SelectItem>
                      <SelectItem value="addome">Addome</SelectItem>
                      <SelectItem value="bacino">Bacino</SelectItem>
                      <SelectItem value="gamba">Gamba</SelectItem>
                      <SelectItem value="ginocchio">Ginocchio</SelectItem>
                      <SelectItem value="piede">Piede</SelectItem>
                      <SelectItem value="dita_piede">Dita piede</SelectItem>
                      <SelectItem value="multiple">Lesioni multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giorni Prognosi *</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={newInfortunio.giorniPrognosi}
                    onChange={(e) => setNewInfortunio(prev => ({ ...prev, giorniPrognosi: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Giorni Assenza</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={newInfortunio.giorniAssenza}
                    onChange={(e) => setNewInfortunio(prev => ({ ...prev, giorniAssenza: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Denuncia INAIL */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium mb-4 text-sm text-muted-foreground">DENUNCIA INAIL</h4>
              <div className="flex items-center gap-3 mb-4">
                <input 
                  type="checkbox"
                  id="denunciaINAIL"
                  checked={newInfortunio.denunciaINAIL}
                  onChange={(e) => setNewInfortunio(prev => ({ ...prev, denunciaINAIL: e.target.checked }))}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="denunciaINAIL">Infortunio denunciato all'INAIL</Label>
              </div>
              {newInfortunio.denunciaINAIL && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Numero Denuncia</Label>
                    <Input 
                      value={newInfortunio.denunciaINAILNumero}
                      onChange={(e) => setNewInfortunio(prev => ({ ...prev, denunciaINAILNumero: e.target.value }))}
                      placeholder="Numero protocollo INAIL"
                    />
                  </div>
                  <div>
                    <Label>Data Denuncia</Label>
                    <Input 
                      type="date"
                      value={newInfortunio.denunciaINAILData}
                      onChange={(e) => setNewInfortunio(prev => ({ ...prev, denunciaINAILData: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Altri Dati */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium mb-4 text-sm text-muted-foreground">INFORMAZIONI AGGIUNTIVE</h4>
              <div className="space-y-4">
                <div>
                  <Label>Testimoni</Label>
                  <Input 
                    value={newInfortunio.testimoni}
                    onChange={(e) => setNewInfortunio(prev => ({ ...prev, testimoni: e.target.value }))}
                    placeholder="Nomi dei testimoni separati da virgola"
                  />
                </div>
                <div>
                  <Label>Misure Correttive Adottate</Label>
                  <Textarea 
                    value={newInfortunio.misureCorrettive}
                    onChange={(e) => setNewInfortunio(prev => ({ ...prev, misureCorrettive: e.target.value }))}
                    placeholder="Descrivere le misure correttive adottate a seguito dell'infortunio..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewInfortunioDialog(false);
              setNewInfortunio({
                lavoratoreId: '', lavoratoreNome: '', cantiereId: '', impresaId: '',
                dataInfortunio: '', oraInfortunio: '', luogo: '', descrizioneEvento: '',
                natureLesioni: '', sedeLesioni: '', giorniPrognosi: 0, giorniAssenza: 0,
                denunciaINAIL: false, denunciaINAILNumero: '', denunciaINAILData: '',
                testimoni: '', misureCorrettive: '', note: ''
              });
            }}>
              Annulla
            </Button>
            <Button 
              onClick={() => {
                if (!newInfortunio.lavoratoreId || !newInfortunio.dataInfortunio || !newInfortunio.descrizioneEvento) {
                  toast({ title: 'Errore', description: 'Compila i campi obbligatori', variant: 'destructive' });
                  return;
                }

                const infortunio: RegistroInfortuni = {
                  id: generateId(),
                  cantiereId: newInfortunio.cantiereId || undefined,
                  impresaId: newInfortunio.impresaId || undefined,
                  lavoratoreId: newInfortunio.lavoratoreId,
                  lavoratoreNome: newInfortunio.lavoratoreNome,
                  dataInfortunio: newInfortunio.dataInfortunio,
                  oraInfortunio: newInfortunio.oraInfortunio,
                  luogo: newInfortunio.luogo || getCantiereName(newInfortunio.cantiereId),
                  descrizioneEvento: newInfortunio.descrizioneEvento,
                  natureLesioni: newInfortunio.natureLesioni,
                  sedeLesioni: newInfortunio.sedeLesioni,
                  giorniPrognosi: newInfortunio.giorniPrognosi,
                  giorniAssenza: newInfortunio.giorniAssenza,
                  denunciaINAIL: newInfortunio.denunciaINAIL ? {
                    numero: newInfortunio.denunciaINAILNumero,
                    data: newInfortunio.denunciaINAILData
                  } : undefined,
                  testimoni: newInfortunio.testimoni ? newInfortunio.testimoni.split(',').map(t => t.trim()) : [],
                  misureCorrettive: newInfortunio.misureCorrettive ? newInfortunio.misureCorrettive.split('\n').filter(Boolean) : [],
                  allegatiUrl: []
                };

                setInfortuni(prev => [...prev, infortunio]);
                toast({ title: 'Infortunio registrato', description: 'L\'infortunio è stato aggiunto al registro' });
                setShowNewInfortunioDialog(false);
                setNewInfortunio({
                  lavoratoreId: '', lavoratoreNome: '', cantiereId: '', impresaId: '',
                  dataInfortunio: '', oraInfortunio: '', luogo: '', descrizioneEvento: '',
                  natureLesioni: '', sedeLesioni: '', giorniPrognosi: 0, giorniAssenza: 0,
                  denunciaINAIL: false, denunciaINAILNumero: '', denunciaINAILData: '',
                  testimoni: '', misureCorrettive: '', note: ''
                });
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Registra Infortunio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New POS Dialog - ENHANCED */}
      <Dialog open={showNewPOSDialog} onOpenChange={(open) => {
        setShowNewPOSDialog(open);
        if (!open) {
          setPosStep(1);
          setNewPOSData({ cantiereId: '', impresaId: '', versione: '1.0', rischioGenerico: [], rischioSpecifico: [], misurePrevenzione: [], dpiRichiesti: [], newRischio: '', newMisura: '' });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo POS Digitale - Step {posStep}/3</DialogTitle>
          </DialogHeader>
          
          {/* Step 1: Dati Base */}
          {posStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium mb-4">Dati Generali</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cantiere *</Label>
                    <Select value={newPOSData.cantiereId} onValueChange={(v) => setNewPOSData(prev => ({ ...prev, cantiereId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona cantiere" />
                      </SelectTrigger>
                      <SelectContent>
                        {cantieri.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Impresa *</Label>
                    <Select value={newPOSData.impresaId} onValueChange={(v) => setNewPOSData(prev => ({ ...prev, impresaId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona impresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {imprese.map(i => (
                          <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Versione</Label>
                  <Input 
                    value={newPOSData.versione} 
                    onChange={(e) => setNewPOSData(prev => ({ ...prev, versione: e.target.value }))}
                    placeholder="1.0" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Rischi */}
          {posStep === 2 && (
            <div className="space-y-4 py-4">
              {/* Rischi Generici */}
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium mb-4">Rischi Generici di Cantiere</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['Caduta dall\'alto', 'Caduta materiali', 'Elettrocuzione', 'Rumore', 'Vibrazioni', 'Polveri', 'Movimentazione carichi', 'Investimento', 'Schiacciamento', 'Incendio'].map(rischio => (
                    <label key={rischio} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPOSData.rischioGenerico.includes(rischio)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPOSData(prev => ({ ...prev, rischioGenerico: [...prev.rischioGenerico, rischio] }));
                          } else {
                            setNewPOSData(prev => ({ ...prev, rischioGenerico: prev.rischioGenerico.filter(r => r !== rischio) }));
                          }
                        }}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm">{rischio}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rischi Specifici */}
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium mb-4">Rischi Specifici dell'Attività</h4>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newPOSData.newRischio}
                    onChange={(e) => setNewPOSData(prev => ({ ...prev, newRischio: e.target.value }))}
                    placeholder="Descrivi rischio specifico..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPOSData.newRischio.trim()) {
                        setNewPOSData(prev => ({ 
                          ...prev, 
                          rischioSpecifico: [...prev.rischioSpecifico, prev.newRischio.trim()],
                          newRischio: '' 
                        }));
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (newPOSData.newRischio.trim()) {
                        setNewPOSData(prev => ({ 
                          ...prev, 
                          rischioSpecifico: [...prev.rischioSpecifico, prev.newRischio.trim()],
                          newRischio: '' 
                        }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newPOSData.rischioSpecifico.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newPOSData.rischioSpecifico.map((r, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        {r}
                        <button 
                          onClick={() => setNewPOSData(prev => ({ ...prev, rischioSpecifico: prev.rischioSpecifico.filter((_, idx) => idx !== i) }))}
                          className="ml-1 hover:text-red-500"
                        >×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Misure e DPI */}
          {posStep === 3 && (
            <div className="space-y-4 py-4">
              {/* Misure Prevenzione */}
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium mb-4">Misure di Prevenzione e Protezione</h4>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newPOSData.newMisura}
                    onChange={(e) => setNewPOSData(prev => ({ ...prev, newMisura: e.target.value }))}
                    placeholder="Descrivi misura di prevenzione..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPOSData.newMisura.trim()) {
                        setNewPOSData(prev => ({ 
                          ...prev, 
                          misurePrevenzione: [...prev.misurePrevenzione, prev.newMisura.trim()],
                          newMisura: '' 
                        }));
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (newPOSData.newMisura.trim()) {
                        setNewPOSData(prev => ({ 
                          ...prev, 
                          misurePrevenzione: [...prev.misurePrevenzione, prev.newMisura.trim()],
                          newMisura: '' 
                        }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newPOSData.misurePrevenzione.length > 0 && (
                  <div className="space-y-1">
                    {newPOSData.misurePrevenzione.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                        <span>{m}</span>
                        <button 
                          onClick={() => setNewPOSData(prev => ({ ...prev, misurePrevenzione: prev.misurePrevenzione.filter((_, idx) => idx !== i) }))}
                          className="text-red-500 hover:text-red-600"
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DPI Richiesti */}
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium mb-4">DPI Richiesti</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['Casco protettivo', 'Guanti', 'Occhiali protettivi', 'Scarpe antinfortunistiche', 'Gilet alta visibilità', 'Imbracatura', 'Mascherina FFP2', 'Cuffie antirumore', 'Tuta protettiva', 'Stivali di sicurezza'].map(dpi => (
                    <label key={dpi} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPOSData.dpiRichiesti.includes(dpi)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPOSData(prev => ({ ...prev, dpiRichiesti: [...prev.dpiRichiesti, dpi] }));
                          } else {
                            setNewPOSData(prev => ({ ...prev, dpiRichiesti: prev.dpiRichiesti.filter(d => d !== dpi) }));
                          }
                        }}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm">{dpi}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {posStep > 1 && (
                <Button variant="outline" onClick={() => setPosStep(s => s - 1)}>
                  Indietro
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowNewPOSDialog(false);
                setPosStep(1);
              }}>Annulla</Button>
              
              {posStep < 3 ? (
                <Button onClick={() => {
                  if (posStep === 1 && (!newPOSData.cantiereId || !newPOSData.impresaId)) {
                    toast({ title: 'Errore', description: 'Seleziona cantiere e impresa', variant: 'destructive' });
                    return;
                  }
                  setPosStep(s => s + 1);
                }}>
                  Avanti
                </Button>
              ) : (
                <Button onClick={() => {
                  // Crea nuovo POS con tutti i dati
                  const newPOS: POSDigitale = {
                    id: generateId(),
                    cantiereId: newPOSData.cantiereId,
                    impresaId: newPOSData.impresaId,
                    versione: newPOSData.versione || '1.0',
                    dataEmissione: new Date().toISOString().split('T')[0],
                    stato: 'bozza',
                    rischioGenerico: newPOSData.rischioGenerico,
                    rischioSpecifico: newPOSData.rischioSpecifico,
                    misurePrevenzione: newPOSData.misurePrevenzione,
                    dpiRichiesti: newPOSData.dpiRichiesti,
                    allegatiUrl: [],
                  };
                  
                  const defaultContent = `<h2>Piano Operativo di Sicurezza</h2>
<p><strong>Cantiere:</strong> ${getCantiereName(newPOSData.cantiereId)}</p>
<p><strong>Impresa:</strong> ${getImpresaName(newPOSData.impresaId)}</p>
<p><strong>Versione:</strong> ${newPOSData.versione || '1.0'}</p>
<p><strong>Data Emissione:</strong> ${new Date().toLocaleDateString('it-IT')}</p>

<h3>1. Dati Generali dell'Impresa</h3>
<p>Inserire qui i dati identificativi dell'impresa esecutrice...</p>

<h3>2. Rischi Generici Identificati</h3>
<ul>
${newPOSData.rischioGenerico.map(r => `<li>${r}</li>`).join('\n')}
</ul>

<h3>3. Rischi Specifici dell'Attività</h3>
<ul>
${newPOSData.rischioSpecifico.map(r => `<li>${r}</li>`).join('\n')}
</ul>

<h3>4. Misure di Prevenzione e Protezione</h3>
<ul>
${newPOSData.misurePrevenzione.map(m => `<li>${m}</li>`).join('\n')}
</ul>

<h3>5. DPI Richiesti</h3>
<ul>
${newPOSData.dpiRichiesti.map(d => `<li>${d}</li>`).join('\n')}
</ul>

<h3>6. Procedure di Emergenza</h3>
<p>Descrivere le procedure da seguire in caso di emergenza...</p>

<h3>7. Allegati</h3>
<p>Elencare eventuali allegati al presente documento...</p>`;
                  
                  setPosContents(prev => ({ ...prev, [newPOS.id]: defaultContent }));
                  setPosDigitali(prev => [...prev, newPOS]);
                  setEditingPOS(newPOS);
                  setEditingPOSContent(defaultContent);
                  setShowNewPOSDialog(false);
                  setShowPOSEditorDialog(true);
                  setNewPOSData({ cantiereId: '', impresaId: '', versione: '1.0', rischioGenerico: [], rischioSpecifico: [], misurePrevenzione: [], dpiRichiesti: [], newRischio: '', newMisura: '' });
                  setPosStep(1);
                  toast({ title: 'POS creato', description: 'Ora puoi modificare il documento nel rich editor' });
                }}>
                  Crea e Modifica
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POS Editor Dialog */}
      <DocumentEditorDialog
        open={showPOSEditorDialog}
        onOpenChange={(open) => {
          setShowPOSEditorDialog(open);
          if (!open) {
            setEditingPOS(null);
            setEditingPOSContent('');
          }
        }}
        title={editingPOS ? `POS v${editingPOS.versione} - ${getCantiereName(editingPOS.cantiereId)}` : 'Editor POS'}
        initialContent={editingPOSContent}
        documentName={editingPOS ? `POS_${editingPOS.versione}_${getCantiereName(editingPOS.cantiereId).replace(/[^a-zA-Z0-9]/g, '_')}` : ''}
        onSave={(data) => {
          if (editingPOS) {
            setPosContents(prev => ({ ...prev, [editingPOS.id]: data.content }));
            toast({ title: 'POS salvato', description: 'Le modifiche sono state salvate' });
          }
        }}
      />
    </div>
  );
}