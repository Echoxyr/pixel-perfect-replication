import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Building2,
  Users,
  FileText,
  Truck,
  Receipt,
  FolderKanban,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface EntityLink {
  type: EntityType;
  id: string;
  label: string;
  subLabel?: string;
}

interface EntityLinksProps {
  links: EntityLink[];
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const ENTITY_CONFIG: Record<EntityType, { icon: React.ElementType; color: string; route: string }> = {
  cantiere: { icon: Building2, color: 'text-purple-500 bg-purple-500/10', route: '/cantieri' },
  fornitore: { icon: Briefcase, color: 'text-amber-500 bg-amber-500/10', route: '/reparto-commerciale?tab=fornitori' },
  impresa: { icon: Building2, color: 'text-blue-500 bg-blue-500/10', route: '/imprese' },
  lavoratore: { icon: Users, color: 'text-green-500 bg-green-500/10', route: '/lavoratori' },
  preventivo: { icon: FileText, color: 'text-blue-500 bg-blue-500/10', route: '/reparto-commerciale?tab=preventivi' },
  ordine: { icon: FolderKanban, color: 'text-amber-500 bg-amber-500/10', route: '/reparto-commerciale?tab=ordini' },
  ddt: { icon: Truck, color: 'text-purple-500 bg-purple-500/10', route: '/reparto-amministrazione?tab=ddt' },
  fattura: { icon: Receipt, color: 'text-emerald-500 bg-emerald-500/10', route: '/reparto-amministrazione?tab=fatture' },
  contratto: { icon: FileText, color: 'text-primary bg-primary/10', route: '/reparto-commerciale?tab=contratti' },
};

export function EntityLinks({ links, direction = 'horizontal', size = 'sm', showIcon = true, className }: EntityLinksProps) {
  if (!links || links.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={cn(
        "flex gap-2 flex-wrap",
        direction === 'vertical' && 'flex-col',
        className
      )}>
        {links.map((link, index) => {
          const config = ENTITY_CONFIG[link.type];
          const Icon = config.icon;
          
          return (
            <Tooltip key={`${link.type}-${link.id}-${index}`}>
              <TooltipTrigger asChild>
                <Link
                  to={`${config.route}${link.id ? `&id=${link.id}` : ''}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border transition-all hover:border-primary/50",
                    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
                    config.color.split(' ')[1]
                  )}
                >
                  {showIcon && <Icon className={cn("flex-shrink-0", size === 'sm' ? 'w-3 h-3' : 'w-4 h-4', config.color.split(' ')[0])} />}
                  <span className="truncate max-w-[120px]">{link.label}</span>
                  <ExternalLink className={cn("flex-shrink-0 opacity-50", size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{link.label}</p>
                {link.subLabel && <p className="text-xs text-muted-foreground">{link.subLabel}</p>}
                <p className="text-xs text-primary mt-1">Clicca per aprire</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// Component to show the full document chain/flow
interface DocumentFlowChainProps {
  preventivo?: { id: string; numero: string };
  ordine?: { id: string; numero: string };
  ddt?: { id: string; numero: string };
  fattura?: { id: string; numero: string };
  cantiere?: { id: string; nome: string; codice?: string };
  fornitore?: { id: string; nome: string };
  contratto?: { id: string; numero: string };
  className?: string;
}

export function DocumentFlowChain({
  preventivo,
  ordine,
  ddt,
  fattura,
  cantiere,
  fornitore,
  contratto,
  className,
}: DocumentFlowChainProps) {
  const flowSteps = useMemo(() => {
    const steps: { type: EntityType; data: { id: string; label: string } }[] = [];
    
    if (preventivo) steps.push({ type: 'preventivo', data: { id: preventivo.id, label: preventivo.numero } });
    if (ordine) steps.push({ type: 'ordine', data: { id: ordine.id, label: ordine.numero } });
    if (ddt) steps.push({ type: 'ddt', data: { id: ddt.id, label: ddt.numero } });
    if (fattura) steps.push({ type: 'fattura', data: { id: fattura.id, label: fattura.numero } });
    
    return steps;
  }, [preventivo, ordine, ddt, fattura]);

  const contextLinks = useMemo(() => {
    const links: EntityLink[] = [];
    if (cantiere) links.push({ type: 'cantiere', id: cantiere.id, label: cantiere.codice || cantiere.nome });
    if (fornitore) links.push({ type: 'fornitore', id: fornitore.id, label: fornitore.nome });
    if (contratto) links.push({ type: 'contratto', id: contratto.id, label: contratto.numero });
    return links;
  }, [cantiere, fornitore, contratto]);

  if (flowSteps.length === 0 && contextLinks.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Document Flow */}
      {flowSteps.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <Link2 className="w-4 h-4 text-muted-foreground mr-1" />
          {flowSteps.map((step, index) => {
            const config = ENTITY_CONFIG[step.type];
            const Icon = config.icon;
            return (
              <div key={step.data.id} className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className={cn("gap-1 cursor-pointer hover:border-primary/50", config.color.split(' ')[1])}
                >
                  <Icon className={cn("w-3 h-3", config.color.split(' ')[0])} />
                  {step.data.label}
                </Badge>
                {index < flowSteps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Context Links */}
      {contextLinks.length > 0 && (
        <EntityLinks links={contextLinks} size="sm" />
      )}
    </div>
  );
}

export default EntityLinks;
