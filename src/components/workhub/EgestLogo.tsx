import { cn } from '@/lib/utils';

interface EgestLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function EgestLogo({ size = 'md', showText = true, className }: EgestLogoProps) {
  const sizes = {
    sm: { text: 'text-base', tagline: 'text-[8px]' },
    md: { text: 'text-xl', tagline: 'text-[9px]' },
    lg: { text: 'text-3xl', tagline: 'text-xs' }
  };

  const { text, tagline } = sizes[size];

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn('font-bold leading-tight tracking-tight', text)}>
        <span className="text-primary">Commess</span>
        <span className="text-foreground">APP</span>
      </span>
      {showText && (
        <span className={cn('text-muted-foreground leading-none tracking-tight', tagline)}>
          la commessa a portata di mano
        </span>
      )}
    </div>
  );
}
