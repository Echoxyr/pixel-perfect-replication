import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileUp,
  Bell,
  CheckCircle,
  Building2,
  Users,
  FileText,
  Truck,
  Receipt,
  FolderKanban,
  X,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type EntityType = 
  | 'cantiere' 
  | 'fornitore' 
  | 'impresa' 
  | 'lavoratore' 
  | 'preventivo' 
  | 'ordine' 
  | 'ddt' 
  | 'fattura' 
  | 'contratto';

interface PostCreationActionsProps {
  open: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  entityData?: Record<string, unknown>;
}

interface ActionOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const ENTITY_ICONS: Record<EntityType, React.ElementType> = {
  cantiere: Building2,
  fornitore: Briefcase,
  impresa: Building2,
  lavoratore: Users,
  preventivo: FileText,
  ordine: FolderKanban,
  ddt: Truck,
  fattura: Receipt,
  contratto: FileText,
};

const getActionsForEntity = (entityType: EntityType): ActionOption[] => {
  const commonActions: ActionOption[] = [
    { id: 'upload', label: 'Carica Allegati', description: 'Aggiungi documenti, file PDF o immagini', icon: FileUp, color: 'text-blue-500' },
    { id: 'notify', label: 'Invia Notifica', description: 'Notifica i responsabili coinvolti', icon: Bell, color: 'text-amber-500' },
  ];

  const specificActions: Record<EntityType, ActionOption[]> = {
    cantiere: [
      { id: 'link_impresa', label: 'Collega Impresa', description: 'Associa imprese esecutrici al cantiere', icon: Building2, color: 'text-purple-500' },
      { id: 'link_lavoratore', label: 'Assegna Lavoratori', description: 'Aggiungi lavoratori al cantiere', icon: Users, color: 'text-green-500' },
      { id: 'create_contratto', label: 'Crea Contratto', description: 'Nuovo contratto per questo cantiere', icon: FileText, color: 'text-primary' },
      { id: 'create_preventivo', label: 'Richiedi Preventivo', description: 'Nuova richiesta preventivo fornitore', icon: FileText, color: 'text-blue-500' },
    ],
    fornitore: [
      { id: 'link_cantiere', label: 'Associa a Commessa', description: 'Collega il fornitore a una commessa', icon: Building2, color: 'text-purple-500' },
      { id: 'create_preventivo', label: 'Richiedi Preventivo', description: 'Nuova richiesta preventivo', icon: FileText, color: 'text-blue-500' },
      { id: 'create_ordine', label: 'Crea Ordine', description: 'Nuovo ordine di acquisto', icon: FolderKanban, color: 'text-amber-500' },
    ],
    impresa: [
      { id: 'link_cantiere', label: 'Associa a Commessa', description: 'Collega l\'impresa a un cantiere', icon: Building2, color: 'text-purple-500' },
      { id: 'link_lavoratore', label: 'Collega Lavoratori', description: 'Associa dipendenti all\'impresa', icon: Users, color: 'text-green-500' },
      { id: 'create_contratto', label: 'Crea Contratto', description: 'Nuovo contratto di subappalto', icon: FileText, color: 'text-primary' },
    ],
    lavoratore: [
      { id: 'link_cantiere', label: 'Assegna a Cantiere', description: 'Collega il lavoratore a un cantiere', icon: Building2, color: 'text-purple-500' },
      { id: 'link_impresa', label: 'Associa a Impresa', description: 'Collega a un\'impresa', icon: Building2, color: 'text-green-500' },
    ],
    preventivo: [
      { id: 'link_cantiere', label: 'Associa a Commessa', description: 'Collega il preventivo a una commessa', icon: Building2, color: 'text-purple-500' },
      { id: 'convert_ordine', label: 'Converti in Ordine', description: 'Trasforma il preventivo in ordine', icon: ArrowRight, color: 'text-emerald-500' },
    ],
    ordine: [
      { id: 'link_cantiere', label: 'Associa a Commessa', description: 'Collega l\'ordine a una commessa', icon: Building2, color: 'text-purple-500' },
      { id: 'convert_ddt', label: 'Genera DDT', description: 'Crea documento di trasporto', icon: Truck, color: 'text-emerald-500' },
    ],
    ddt: [
      { id: 'link_cantiere', label: 'Associa a Commessa', description: 'Collega il DDT a una commessa', icon: Building2, color: 'text-purple-500' },
      { id: 'convert_fattura', label: 'Genera Fattura', description: 'Crea fattura dal DDT', icon: Receipt, color: 'text-emerald-500' },
    ],
    fattura: [
      { id: 'link_cantiere', label: 'Associa a Commessa', description: 'Collega la fattura a una commessa', icon: Building2, color: 'text-purple-500' },
      { id: 'link_contratto', label: 'Collega a Contratto', description: 'Associa a un contratto esistente', icon: FileText, color: 'text-blue-500' },
    ],
    contratto: [
      { id: 'link_cantiere', label: 'Associa a Commessa', description: 'Collega il contratto a una commessa', icon: Building2, color: 'text-purple-500' },
      { id: 'create_fattura', label: 'Genera Fattura', description: 'Crea fattura dal contratto', icon: Receipt, color: 'text-emerald-500' },
    ],
  };

  return [...(specificActions[entityType] || []), ...commonActions];
};

export function PostCreationActions({
  open,
  onClose,
  entityType,
  entityId,
  entityName,
  entityData = {},
}: PostCreationActionsProps) {
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [linkTargetId, setLinkTargetId] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const actions = getActionsForEntity(entityType);
  const EntityIcon = ENTITY_ICONS[entityType];

  // Fetch data for linking
  const { data: cantieri = [] } = useQuery({
    queryKey: ['cantieri_for_link'],
    queryFn: async () => {
      const { data } = await supabase.from('cantieri').select('id, nome, codice_commessa').eq('stato', 'attivo').order('nome');
      return data || [];
    },
    enabled: open,
  });

  const { data: imprese = [] } = useQuery({
    queryKey: ['imprese_for_link'],
    queryFn: async () => {
      const { data } = await supabase.from('imprese').select('id, ragione_sociale').order('ragione_sociale');
      return data || [];
    },
    enabled: open,
  });

  const { data: lavoratori = [] } = useQuery({
    queryKey: ['lavoratori_for_link'],
    queryFn: async () => {
      const { data } = await supabase.from('lavoratori').select('id, nome, cognome').order('cognome');
      return data || [];
    },
    enabled: open,
  });

  const { data: contratti = [] } = useQuery({
    queryKey: ['contratti_for_link'],
    queryFn: async () => {
      const { data } = await supabase.from('contratti').select('id, numero, titolo').order('data_inizio', { ascending: false });
      return data || [];
    },
    enabled: open,
  });

  // Link mutations
  const linkCantiereMutation = useMutation({
    mutationFn: async ({ cantiereId }: { cantiereId: string }) => {
      // Update based on entity type
      switch (entityType) {
        case 'preventivo':
          await supabase.from('preventivi_fornitori').update({ cantiere_id: cantiereId }).eq('id', entityId);
          break;
        case 'ordine':
          await supabase.from('ordini_fornitori').update({ cantiere_id: cantiereId }).eq('id', entityId);
          break;
        case 'ddt':
          await supabase.from('ddt').update({ commessa_id: cantiereId }).eq('id', entityId);
          break;
        case 'fattura':
          await supabase.from('fatture').update({ cantiere_id: cantiereId }).eq('id', entityId);
          break;
        case 'contratto':
          await supabase.from('contratti').update({ cantiere_id: cantiereId }).eq('id', entityId);
          break;
        default:
          throw new Error('Tipo entità non supportato');
      }

      // Log the link
      await supabase.from('document_conversions').insert({
        documento_origine_tipo: entityType,
        documento_origine_id: entityId,
        documento_destinazione_tipo: 'cantiere',
        documento_destinazione_id: cantiereId,
        note: `Collegamento ${entityType} → commessa`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Collegamento a commessa completato');
      setCompletedActions(prev => [...prev, 'link_cantiere']);
      setSelectedAction(null);
      setLinkTargetId('');
    },
    onError: (e) => toast.error('Errore: ' + (e as Error).message),
  });

  const linkImpresaMutation = useMutation({
    mutationFn: async ({ impresaId }: { impresaId: string }) => {
      if (entityType === 'cantiere') {
        await supabase.from('cantieri_imprese').insert({
          cantiere_id: entityId,
          impresa_id: impresaId,
          ruolo: 'esecutrice',
          data_inizio: new Date().toISOString().split('T')[0],
        });
      } else if (entityType === 'lavoratore') {
        await supabase.from('lavoratori').update({ impresa_id: impresaId }).eq('id', entityId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Impresa collegata');
      setCompletedActions(prev => [...prev, 'link_impresa']);
      setSelectedAction(null);
    },
    onError: (e) => toast.error('Errore: ' + (e as Error).message),
  });

  const linkLavoratoreMutation = useMutation({
    mutationFn: async ({ lavoratoreId }: { lavoratoreId: string }) => {
      if (entityType === 'cantiere') {
        await supabase.from('lavoratori_cantieri').insert({
          cantiere_id: entityId,
          lavoratore_id: lavoratoreId,
          attivo: true,
          data_inizio: new Date().toISOString().split('T')[0],
        });
      } else if (entityType === 'impresa') {
        await supabase.from('lavoratori').update({ impresa_id: entityId }).eq('id', lavoratoreId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Lavoratore collegato');
      setCompletedActions(prev => [...prev, 'link_lavoratore']);
      setSelectedAction(null);
    },
    onError: (e) => toast.error('Errore: ' + (e as Error).message),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      await supabase.from('workflow_notifications').insert({
        tipo: 'info',
        entita_tipo: entityType,
        entita_id: entityId,
        titolo: `Nuova ${entityType}: ${entityName}`,
        messaggio: notifyMessage || `È stata creata una nuova ${entityType}: ${entityName}`,
        priorita: 'media',
        letta: false,
        archiviata: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_notifications'] });
      toast.success('Notifica inviata');
      setCompletedActions(prev => [...prev, 'notify']);
      setSelectedAction(null);
      setNotifyMessage('');
    },
    onError: (e) => toast.error('Errore: ' + (e as Error).message),
  });

  const handleActionClick = (actionId: string) => {
    if (completedActions.includes(actionId)) return;
    setSelectedAction(actionId);
    setLinkTargetId('');
  };

  const handleConfirmAction = () => {
    switch (selectedAction) {
      case 'link_cantiere':
        if (linkTargetId) linkCantiereMutation.mutate({ cantiereId: linkTargetId });
        break;
      case 'link_impresa':
        if (linkTargetId) linkImpresaMutation.mutate({ impresaId: linkTargetId });
        break;
      case 'link_lavoratore':
        if (linkTargetId) linkLavoratoreMutation.mutate({ lavoratoreId: linkTargetId });
        break;
      case 'notify':
        sendNotificationMutation.mutate();
        break;
      default:
        toast.info('Azione in sviluppo');
        setSelectedAction(null);
    }
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'link_cantiere':
        return (
          <div className="space-y-4">
            <Label>Seleziona Commessa</Label>
            <Select value={linkTargetId} onValueChange={setLinkTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli commessa..." />
              </SelectTrigger>
              <SelectContent>
                {cantieri.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.codice_commessa} - {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'link_impresa':
        return (
          <div className="space-y-4">
            <Label>Seleziona Impresa</Label>
            <Select value={linkTargetId} onValueChange={setLinkTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli impresa..." />
              </SelectTrigger>
              <SelectContent>
                {imprese.map(i => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.ragione_sociale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'link_lavoratore':
        return (
          <div className="space-y-4">
            <Label>Seleziona Lavoratore</Label>
            <Select value={linkTargetId} onValueChange={setLinkTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli lavoratore..." />
              </SelectTrigger>
              <SelectContent>
                {lavoratori.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.cognome} {l.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'link_contratto':
        return (
          <div className="space-y-4">
            <Label>Seleziona Contratto</Label>
            <Select value={linkTargetId} onValueChange={setLinkTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Scegli contratto..." />
              </SelectTrigger>
              <SelectContent>
                {contratti.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.numero} - {c.titolo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'notify':
        return (
          <div className="space-y-4">
            <Label>Messaggio Notifica (opzionale)</Label>
            <Textarea
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              placeholder={`È stata creata una nuova ${entityType}: ${entityName}`}
              rows={3}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setCompletedActions([]);
    setLinkTargetId('');
    setNotifyMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <span className="block">{entityName}</span>
              <span className="text-sm font-normal text-muted-foreground">Creato con successo!</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Vuoi completare altre operazioni per questa {entityType}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map(action => {
              const isCompleted = completedActions.includes(action.id);
              const isSelected = selectedAction === action.id;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  disabled={isCompleted}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all",
                    isCompleted
                      ? "bg-emerald-500/10 border-emerald-500/30 cursor-default"
                      : isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", isCompleted ? "bg-emerald-500/20" : "bg-muted")}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <action.icon className={cn("w-5 h-5", action.color)} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-medium text-sm", isCompleted && "line-through text-muted-foreground")}>
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 text-wrap-responsive">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Form */}
          {selectedAction && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{actions.find(a => a.id === selectedAction)?.label}</h4>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAction(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {renderActionForm()}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedAction(null)}>Annulla</Button>
                <Button onClick={handleConfirmAction} disabled={
                  (selectedAction.startsWith('link_') && !linkTargetId)
                }>
                  Conferma
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            {completedActions.length > 0 ? 'Chiudi' : 'Salta'}
          </Button>
          {completedActions.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              {completedActions.length} azioni completate
            </Badge>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PostCreationActions;
