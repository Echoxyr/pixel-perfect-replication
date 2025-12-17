import { cn } from '@/lib/utils';

interface EgestLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function EgestLogo({ size = 'md', showText = true, className }: EgestLogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-sm' },
    md: { icon: 36, text: 'text-lg' },
    lg: { icon: 48, text: 'text-2xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Icon: Building with crane */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle */}
        <rect width="48" height="48" rx="10" className="fill-primary" />
        
        {/* Building - glass facade */}
        <rect x="10" y="18" width="18" height="22" rx="1" className="fill-primary-foreground/90" />
        
        {/* Building windows grid */}
        <rect x="12" y="20" width="4" height="4" rx="0.5" className="fill-primary/60" />
        <rect x="18" y="20" width="4" height="4" rx="0.5" className="fill-primary/60" />
        <rect x="12" y="26" width="4" height="4" rx="0.5" className="fill-primary/60" />
        <rect x="18" y="26" width="4" height="4" rx="0.5" className="fill-primary/60" />
        <rect x="12" y="32" width="4" height="4" rx="0.5" className="fill-primary/60" />
        <rect x="18" y="32" width="4" height="4" rx="0.5" className="fill-primary/60" />
        
        {/* Crane tower */}
        <rect x="30" y="12" width="3" height="28" rx="0.5" className="fill-amber-400" />
        
        {/* Crane arm horizontal */}
        <rect x="24" y="12" width="16" height="2.5" rx="0.5" className="fill-amber-400" />
        
        {/* Crane hook cable */}
        <line x1="27" y1="14.5" x2="27" y2="24" stroke="currentColor" strokeWidth="1.5" className="stroke-amber-400" />
        
        {/* Hook */}
        <path d="M25 24 L29 24 L29 27 C29 28.5 28 29.5 27 29.5 C26 29.5 25 28.5 25 27 L25 24Z" className="fill-amber-400" />
        
        {/* Crane counterweight */}
        <rect x="35" y="14.5" width="4" height="3" rx="0.5" className="fill-amber-500" />
        
        {/* Crane base */}
        <rect x="28" y="38" width="7" height="2" rx="0.5" className="fill-amber-500" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold leading-tight', text)}>E-gest</span>
          <span className="text-[9px] text-muted-foreground leading-none tracking-tight">
            la commessa a portata di mano
          </span>
        </div>
      )}
    </div>
  );
}
