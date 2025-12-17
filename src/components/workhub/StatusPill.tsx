import { cn } from '@/lib/utils';

type StatusPillType = 'task' | 'priority' | 'document' | 'cantiere';

interface StatusPillProps {
  type: StatusPillType;
  value: string;
  size?: 'xs' | 'sm' | 'md';
}

const statusConfig: Record<StatusPillType, Record<string, { label: string; className: string }>> = {
  task: {
    da_iniziare: { label: 'Da iniziare', className: 'bg-gray-500/20 text-gray-500' },
    in_corso: { label: 'In corso', className: 'bg-sky-500/20 text-sky-500' },
    in_attesa: { label: 'In attesa', className: 'bg-amber-500/20 text-amber-500' },
    bloccato: { label: 'Bloccato', className: 'bg-red-500/20 text-red-500' },
    fatto: { label: 'Completato', className: 'bg-emerald-500/20 text-emerald-500' },
  },
  priority: {
    urgente: { label: 'Urgente', className: 'bg-red-600/20 text-red-500' },
    critica: { label: 'Critica', className: 'bg-red-500/20 text-red-400' },
    alta: { label: 'Alta', className: 'bg-orange-500/20 text-orange-500' },
    media: { label: 'Media', className: 'bg-amber-500/20 text-amber-500' },
    bassa: { label: 'Bassa', className: 'bg-green-500/20 text-green-500' },
    nessuna: { label: 'Nessuna', className: 'bg-gray-500/20 text-gray-500' },
  },
  document: {
    approvato: { label: 'Approvato', className: 'bg-emerald-500/20 text-emerald-500' },
    in_scadenza: { label: 'In scadenza', className: 'bg-amber-500/20 text-amber-500' },
    scaduto: { label: 'Scaduto', className: 'bg-red-500/20 text-red-500' },
    da_richiedere: { label: 'Da richiedere', className: 'bg-gray-500/20 text-gray-500' },
    in_revisione: { label: 'In revisione', className: 'bg-blue-500/20 text-blue-500' },
  },
  cantiere: {
    attivo: { label: 'Attivo', className: 'bg-emerald-500/20 text-emerald-500' },
    sospeso: { label: 'Sospeso', className: 'bg-amber-500/20 text-amber-500' },
    chiuso: { label: 'Chiuso', className: 'bg-gray-500/20 text-gray-500' },
  }
};

export function StatusPill({ type, value, size = 'sm' }: StatusPillProps) {
  const config = statusConfig[type]?.[value] || { label: value, className: 'bg-gray-500/20 text-gray-500' };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={cn(
      'rounded-full font-medium whitespace-nowrap',
      config.className,
      sizeClasses[size]
    )}>
      {config.label}
    </span>
  );
}

interface TrafficLightProps {
  status: 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export function TrafficLight({ status, size = 'md', pulse = false }: TrafficLightProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500'
  };

  return (
    <div className={cn(
      'rounded-full',
      sizeClasses[size],
      colorClasses[status],
      pulse && 'animate-pulse'
    )} />
  );
}
