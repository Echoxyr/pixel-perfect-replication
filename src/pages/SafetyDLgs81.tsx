import { useState, useMemo } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import {
  POSDigitale,
  DUVRI,
  RegistroInfortuni,
  ScadenzarioVisiteMediche,
  generateComplianceId
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
  UserCheck,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Building2,
  HardHat
} from 'lucide-react';

export default function SafetyDLgs81() {
  const { cantieri, imprese, lavoratori } = useWorkHub();
  const { toast } = useToast();
  
  const [posDigitali, setPosDigitali] = useState<POSDigitale[]>([
    {
      id: '1',
      cantiereId: cantieri[0]?.id || '',
      impresaId: imprese[0]?.id || '',
      versione: '1.0',
      dataEmissione: '2024-01-15',
      stato: 'approvato',
      allegatiUrl: [],
      rischioGenerico: ['Caduta dall\'alto', 'Elettrocuzione'],
      rischioSpecifico: ['Lavori in quota', 'Impianti elettrici'],
      misurePrevenzione: ['Uso DPI', 'Formazione specifica'],
      dpiRichiesti: ['Casco', 'Imbracatura', 'Scarpe antinfortunistiche']
    }
  ]);

  const [duvri, setDuvri] = useState<DUVRI[]>([
    {
      id: '1',
      cantiereId: cantieri[0]?.id || '',
      impreseInterferenti: imprese.slice(0, 2).map(i => i.id),
      dataRedazione: '2024-01-20',
      rischInterferenza: [
        {
          descrizione: 'Interferenza tra lavori elettrici e meccanici',
          impreseCoinvolte: imprese.slice(0, 2).map(i => i.id),
          misurePreviste: ['Coordinamento lavori', 'Delimitazione aree'],
          responsabile: 'CSE'
        }
      ],
      costiSicurezza: 15000,
      firme: [],
      stato: 'approvato'
    }
  ]);

  const [infortuni, setInfortuni] = useState<RegistroInfortuni[]>([]);

  const [visiteMediche, setVisiteMediche] = useState<ScadenzarioVisiteMediche[]>(
    lavoratori.slice(0, 5).map((l, i) => ({
      id: generateId(),
      lavoratoreId: l.id,
      lavoratoreNome: `${l.nome} ${l.cognome}`,
      tipoVisita: 'periodica',
      dataVisita: new Date(Date.now() - (i * 90 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
      dataScadenza: new Date(Date.now() + ((365 - i * 30) * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
      medicoCompetente: 'Dr. Bianchi',
      idoneitaGiudizio: i % 3 === 0 ? 'idoneo_con_prescrizioni' : 'idoneo',
      prescrizioni: i % 3 === 0 ? 'Evitare sollevamento carichi > 15kg' : undefined
    }))
  );

  const [showNewPOSDialog, setShowNewPOSDialog] = useState(false);
  const [showNewInfortunioDialog, setShowNewInfortunioDialog] = useState(false);

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
      visiteOk: visiteMediche.length - visiteScadute - visiteInScadenza
    };
  }, [posDigitali, duvri, infortuni, visiteMediche]);

  const getCantiereName = (id: string) => {
    const c = cantieri.find(c => c.id === id);
    return c ? `${c.codiceCommessa} - ${c.nome}` : '-';
  };

  const getImpresaName = (id: string) => {
    const i = imprese.find(i => i.id === id);
    return i?.ragioneSociale || '-';
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
          <p className="text-muted-foreground">POS digitali, DUVRI, Registro infortuni e Visite mediche</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
        <TabsList>
          <TabsTrigger value="pos">POS Digitali</TabsTrigger>
          <TabsTrigger value="duvri">DUVRI</TabsTrigger>
          <TabsTrigger value="infortuni">Registro Infortuni</TabsTrigger>
          <TabsTrigger value="visite">Visite Mediche</TabsTrigger>
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
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">Gestisci</Button>
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
      </Tabs>

      {/* New POS Dialog */}
      <Dialog open={showNewPOSDialog} onOpenChange={setShowNewPOSDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo POS Digitale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Cantiere</Label>
              <Select>
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
              <Label>Impresa</Label>
              <Select>
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
            <div>
              <Label>Versione</Label>
              <Input placeholder="1.0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPOSDialog(false)}>Annulla</Button>
            <Button onClick={() => {
              toast({ title: 'POS creato', description: 'Completa la compilazione' });
              setShowNewPOSDialog(false);
            }}>Crea POS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
