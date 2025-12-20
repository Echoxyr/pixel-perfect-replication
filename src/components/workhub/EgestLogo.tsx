import { cn } from '@/lib/utils';
import gestELogo from '@/assets/gest-e-logo.png';

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
      <img
        src={gestELogo}
        alt="Gest-e Logo"
        width={icon}
        height={icon}
        className="flex-shrink-0 object-contain"
      />

      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold leading-tight', text)}>Gest-e</span>
          <span className="text-[9px] text-muted-foreground leading-none tracking-tight">
            la commessa a portata di mano
          </span>
        </div>
      )}
    </div>
  );
}
