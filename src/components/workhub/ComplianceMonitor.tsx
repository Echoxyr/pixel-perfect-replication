import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileWarning,
  Ban,
  Euro,
  Bell,
  RefreshCw,
  Eye,
  Calendar,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { differenceInDays, format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface ComplianceMonitorProps {
  className?: string;
}

interface Fornitore {
  id: string;
  ragione_sociale: string;
  stato: string;
}

interface DocumentoFornitore {
  id: string;
  fornitore_id: string;
  tipo_documento: string;
  data_scadenza: string | null;
  stato: string;
  obbligatorio: boolean;
}

interface ComplianceStatus {
  fornitoreId: string;
  fornitoreNome: string;
  documentiValidi: number;
  documentiInScadenza: number;
  documentiScaduti: number;
  documentiMancanti: string[];
  pagabile: boolean;
  bloccoMotivo: string | null;
  percentualeCompliance: number;
}

const DOCUMENTI_OBBLIGATORI = ['DURC', 'VISURA_CAMERALE', 'POLIZZA_RCT_RCO', 'DICH_ANTIMAFIA', 'DVR'];

const DOCUMENTO_LABELS: Record<string, string> = {
  'DURC': 'DURC',
  'VISURA_CAMERALE': 'Visura Camerale',
  'POLIZZA_RCT_RCO': 'Polizza RCT/RCO',
  'DICH_ANTIMAFIA': 'Antimafia',
  'DVR': 'DVR',
  'CERT_ISO_9001': 'ISO 9001',
  'CERT_ISO_14001': 'ISO 14001',
  'CERT_ISO_45001': 'ISO 45001',
  'ATTESTAZIONE_SOA': 'SOA',
};

export default function ComplianceMonitor({ className }: ComplianceMonitorProps) {
  const queryClient = useQueryClient();
  const [selectedFornitore, setSelectedFornitore] = useState<ComplianceStatus | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch fornitori
  const { data: fornitori = [] } = useQuery({
    queryKey: ['fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fornitori')
        .select('*')
        .eq('stato', 'attivo')
        .order('ragione_sociale');
      if (error) throw error;
      return data as Fornitore[];
    }
  });

  // Fetch documenti fornitori
  const { data: documenti = [] } = useQuery({
    queryKey: ['documenti_fornitori'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documenti_fornitori')
        .select('*');
      if (error) throw error;
      return data as DocumentoFornitore[];
    }
  });

  // Calculate compliance status for each fornitore
  const complianceStatuses = useMemo(() => {
    return fornitori.map(fornitore => {
      const fornitoreDocumenti = documenti.filter(d => d.fornitore_id === fornitore.id);
      const today = new Date();
      
      let validi = 0;
      let inScadenza = 0;
      let scaduti = 0;
      const mancanti: string[] = [];

      // Check each mandatory document
      DOCUMENTI_OBBLIGATORI.forEach(tipoDoc => {
        const doc = fornitoreDocumenti.find(d => d.tipo_documento === tipoDoc);
        if (!doc) {
          mancanti.push(tipoDoc);
        } else if (doc.data_scadenza) {
          const scadenza = new Date(doc.data_scadenza);
          const giorniRimanenti = differenceInDays(scadenza, today);
          
          if (giorniRimanenti < 0) {
            scaduti++;
            mancanti.push(tipoDoc); // Scaduto = mancante ai fini pagamento
          } else if (giorniRimanenti <= 30) {
            inScadenza++;
          } else {
            validi++;
          }
        }
      });

      const pagabile = mancanti.length === 0;
      const totaleObbligatori = DOCUMENTI_OBBLIGATORI.length;
      const percentuale = Math.round(((totaleObbligatori - mancanti.length) / totaleObbligatori) * 100);

      return {
        fornitoreId: fornitore.id,
        fornitoreNome: fornitore.ragione_sociale,
        documentiValidi: validi,
        documentiInScadenza: inScadenza,
        documentiScaduti: scaduti,
        documentiMancanti: mancanti,
        pagabile,
        bloccoMotivo: mancanti.length > 0 ? mancanti.map(m => DOCUMENTO_LABELS[m] || m).join(', ') : null,
        percentualeCompliance: percentuale,
      } as ComplianceStatus;
    });
  }, [fornitori, documenti]);

  // Summary stats
  const stats = useMemo(() => {
    const totale = complianceStatuses.length;
    const pagabili = complianceStatuses.filter(c => c.pagabile).length;
    const bloccati = complianceStatuses.filter(c => !c.pagabile).length;
    const inScadenza = complianceStatuses.filter(c => c.documentiInScadenza > 0).length;
    const critici = complianceStatuses.filter(c => c.documentiScaduti > 0).length;

    return { totale, pagabili, bloccati, inScadenza, critici };
  }, [complianceStatuses]);

  // Refresh compliance
  const refreshCompliance = useMutation({
    mutationFn: async () => {
      // Clear and recalculate compliance_checks table
      for (const status of complianceStatuses) {
        // Delete existing checks
        await supabase
          .from('compliance_checks')
          .delete()
          .eq('fornitore_id', status.fornitoreId);

        // Insert new checks for each document type
        for (const tipoDoc of DOCUMENTI_OBBLIGATORI) {
          const doc = documenti.find(d => 
            d.fornitore_id === status.fornitoreId && d.tipo_documento === tipoDoc
          );

          let stato = 'mancante';
          let giorniRimanenti = null;
          let dataScadenza = null;

          if (doc && doc.data_scadenza) {
            dataScadenza = doc.data_scadenza;
            giorniRimanenti = differenceInDays(new Date(doc.data_scadenza), new Date());
            
            if (giorniRimanenti < 0) {
              stato = 'scaduto';
            } else if (giorniRimanenti <= 30) {
              stato = 'in_scadenza';
            } else {
              stato = 'valido';
            }
          }

          await supabase.from('compliance_checks').insert({
            fornitore_id: status.fornitoreId,
            fornitore_nome: status.fornitoreNome,
            tipo_check: tipoDoc,
            stato,
            data_scadenza: dataScadenza,
            giorni_rimanenti: giorniRimanenti,
            blocco_pagamento: stato === 'scaduto' || stato === 'mancante',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance_checks'] });
      toast.success('Compliance aggiornata!');
    }
  });

  const getStatusIcon = (status: ComplianceStatus) => {
    if (status.pagabile && status.documentiInScadenza === 0) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status.pagabile && status.documentiInScadenza > 0) {
      return <Clock className="w-5 h-5 text-amber-500" />;
    } else {
      return <Ban className="w-5 h-5 text-red-500" />;
    }
  };

  const getPaymentBadge = (pagabile: boolean) => {
    if (pagabile) {
      return <Badge className="bg-green-100 text-green-800"><Euro className="w-3 h-3 mr-1" />Pagabile</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800"><Ban className="w-3 h-3 mr-1" />Blocco Pagamento</Badge>;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{stats.totale}</p>
            <p className="text-sm text-muted-foreground">Fornitori Attivi</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-700">{stats.pagabili}</p>
            <p className="text-sm text-green-600">Pagabili</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <Ban className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold text-red-700">{stats.bloccati}</p>
            <p className="text-sm text-red-600">Bloccati</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-amber-700">{stats.inScadenza}</p>
            <p className="text-sm text-amber-600">In Scadenza</p>
          </CardContent>
        </Card>
        <Card className="border-red-300 bg-red-100/50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-700">{stats.critici}</p>
            <p className="text-sm text-red-600">Critici</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Monitoraggio Compliance Fornitori
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => refreshCompliance.mutate()}
          >
            <RefreshCw className="w-4 h-4" />
            Aggiorna
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornitore</TableHead>
                <TableHead className="text-center">Compliance</TableHead>
                <TableHead className="text-center">DURC</TableHead>
                <TableHead className="text-center">Visura</TableHead>
                <TableHead className="text-center">Polizza</TableHead>
                <TableHead className="text-center">Antimafia</TableHead>
                <TableHead className="text-center">DVR</TableHead>
                <TableHead className="text-center">Pagamento</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceStatuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nessun fornitore attivo
                  </TableCell>
                </TableRow>
              ) : (
                complianceStatuses.map((status) => {
                  const fornitoreDocumenti = documenti.filter(d => d.fornitore_id === status.fornitoreId);
                  
                  const getDocStatus = (tipoDoc: string) => {
                    const doc = fornitoreDocumenti.find(d => d.tipo_documento === tipoDoc);
                    if (!doc) return { status: 'mancante', icon: <XCircle className="w-4 h-4 text-red-500" />, label: 'Mancante' };
                    
                    if (doc.data_scadenza) {
                      const giorni = differenceInDays(new Date(doc.data_scadenza), new Date());
                      if (giorni < 0) return { status: 'scaduto', icon: <XCircle className="w-4 h-4 text-red-500" />, label: `Scaduto ${Math.abs(giorni)}gg` };
                      if (giorni <= 30) return { status: 'in_scadenza', icon: <Clock className="w-4 h-4 text-amber-500" />, label: `${giorni}gg` };
                      return { status: 'valido', icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: `${giorni}gg` };
                    }
                    return { status: 'valido', icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: 'OK' };
                  };

                  return (
                    <TableRow key={status.fornitoreId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="font-medium">{status.fornitoreNome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={status.percentualeCompliance} className="w-20 h-2" />
                          <span className="text-sm font-medium">{status.percentualeCompliance}%</span>
                        </div>
                      </TableCell>
                      {['DURC', 'VISURA_CAMERALE', 'POLIZZA_RCT_RCO', 'DICH_ANTIMAFIA', 'DVR'].map(tipoDoc => {
                        const docStatus = getDocStatus(tipoDoc);
                        return (
                          <TableCell key={tipoDoc} className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {docStatus.icon}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {DOCUMENTO_LABELS[tipoDoc]}: {docStatus.label}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        {getPaymentBadge(status.pagabile)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedFornitore(status);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedFornitore?.fornitoreNome}
            </DialogTitle>
          </DialogHeader>

          {selectedFornitore && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Compliance</span>
                      <span className="text-lg font-bold">{selectedFornitore.percentualeCompliance}%</span>
                    </div>
                    <Progress value={selectedFornitore.percentualeCompliance} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stato Pagamento</span>
                      {getPaymentBadge(selectedFornitore.pagabile)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedFornitore.documentiMancanti.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Documenti Mancanti/Scaduti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedFornitore.documentiMancanti.map(doc => (
                        <Badge key={doc} variant="destructive">
                          {DOCUMENTO_LABELS[doc] || doc}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-red-600 mt-3">
                      <strong>Azione richiesta:</strong> Caricare i documenti mancanti per sbloccare i pagamenti.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-3 gap-3">
                <Card className="border-green-200">
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-1" />
                    <p className="text-xl font-bold text-green-700">{selectedFornitore.documentiValidi}</p>
                    <p className="text-xs text-green-600">Validi</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-200">
                  <CardContent className="p-3 text-center">
                    <Clock className="w-6 h-6 mx-auto text-amber-500 mb-1" />
                    <p className="text-xl font-bold text-amber-700">{selectedFornitore.documentiInScadenza}</p>
                    <p className="text-xs text-amber-600">In Scadenza</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200">
                  <CardContent className="p-3 text-center">
                    <XCircle className="w-6 h-6 mx-auto text-red-500 mb-1" />
                    <p className="text-xl font-bold text-red-700">{selectedFornitore.documentiScaduti}</p>
                    <p className="text-xs text-red-600">Scaduti</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
