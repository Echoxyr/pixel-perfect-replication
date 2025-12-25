import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Plus,
  FileText,
  Users,
  Building2,
  ClipboardCheck,
  Truck,
  Calendar,
  AlertTriangle,
  Calculator,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
}

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'new-rapportino',
      label: 'Nuovo Rapportino',
      description: 'Crea un rapportino giornaliero',
      icon: FileText,
      action: () => navigate('/rapportini'),
      color: 'text-blue-500',
    },
    {
      id: 'new-checkin',
      label: 'Check-in Sicurezza',
      description: 'Registra un check-in di cantiere',
      icon: ClipboardCheck,
      action: () => navigate('/checkin-sicurezza'),
      color: 'text-green-500',
    },
    {
      id: 'new-worker',
      label: 'Aggiungi Lavoratore',
      description: 'Inserisci un nuovo dipendente',
      icon: Users,
      action: () => navigate('/lavoratori'),
      color: 'text-purple-500',
    },
    {
      id: 'new-company',
      label: 'Nuova Impresa',
      description: 'Registra impresa esterna',
      icon: Building2,
      action: () => navigate('/imprese'),
      color: 'text-orange-500',
    },
    {
      id: 'new-deadline',
      label: 'Nuova Scadenza',
      description: 'Aggiungi scadenza a calendario',
      icon: Calendar,
      action: () => navigate('/scadenzario'),
      color: 'text-red-500',
    },
    {
      id: 'new-resource',
      label: 'Nuova Risorsa',
      description: 'Aggiungi mezzo o attrezzatura',
      icon: Truck,
      action: () => navigate('/risorse'),
      color: 'text-teal-500',
    },
    {
      id: 'report-issue',
      label: 'Segnala Problema',
      description: 'Apri segnalazione HSE',
      icon: AlertTriangle,
      action: () => navigate('/hse'),
      color: 'text-amber-500',
    },
    {
      id: 'new-computo',
      label: 'Nuovo Computo',
      description: 'Crea computo metrico',
      icon: Calculator,
      action: () => navigate('/computo-metrico'),
      color: 'text-indigo-500',
    },
  ];

  const handleAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn('gap-2', className)}>
          <Zap className="w-4 h-4" />
          Azioni Rapide
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-md">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Azioni Rapide
          </DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border-none">
          <CommandInput placeholder="Cerca azione..." />
          <CommandList>
            <CommandEmpty>Nessuna azione trovata</CommandEmpty>
            <CommandGroup heading="Operazioni Frequenti">
              {quickActions.map(action => (
                <CommandItem
                  key={action.id}
                  onSelect={() => handleAction(action.action)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                >
                  <div className={cn('p-2 rounded-lg bg-muted', action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
