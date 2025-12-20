import { cn } from '@/lib/utils';

interface EgestLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function EgestLogo({ size = 'md', showText = true, className }: EgestLogoProps) {
  const sizes = {
    sm: { text: 'text-lg', tagline: 'text-[8px]' },
    md: { text: 'text-2xl', tagline: 'text-[9px]' },
    lg: { text: 'text-4xl', tagline: 'text-xs' }
  };

  const { text, tagline } = sizes[size];

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn('font-bold leading-tight tracking-tight', text)}>
        <span className="text-primary">Gest</span>
        <span className="text-foreground">-e</span>
      </span>
      {showText && (
        <span className={cn('text-muted-foreground leading-none tracking-tight', tagline)}>
          gestione commesse e sicurezza
        </span>
      )}
    </div>
  );
}
