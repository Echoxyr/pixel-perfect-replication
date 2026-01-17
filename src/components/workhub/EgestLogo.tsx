import { cn } from '@/lib/utils';

interface EgestLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  inSidebar?: boolean; // When true, uses white for "-e" to be visible on dark sidebar
}

export function EgestLogo({ size = 'md', showText = true, className, inSidebar = false }: EgestLogoProps) {
  const sizes = {
    sm: { text: 'text-lg', tagline: 'text-[8px]' },
    md: { text: 'text-2xl', tagline: 'text-[9px]' },
    lg: { text: 'text-4xl', tagline: 'text-xs' }
  };

  const { text, tagline } = sizes[size];

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn('font-bold leading-tight tracking-tight', text)}>
        <span className={inSidebar ? 'text-white' : 'text-foreground'}>Gest</span>
        <span className="text-primary">-e</span>
      </span>
      {showText && (
        <span className={cn('leading-none tracking-tight', tagline, inSidebar ? 'text-white/70' : 'text-muted-foreground')}>
          gestione commesse e sicurezza
        </span>
      )}
    </div>
  );
}
