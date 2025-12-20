import { useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResizableCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  defaultWidth?: number | string;
  defaultHeight?: number | string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  storageKey?: string; // For persisting size to localStorage
  resizable?: boolean;
  showResizeHandle?: boolean;
}

export function ResizableCard({
  children,
  title,
  description,
  defaultWidth = 'auto',
  defaultHeight = 'auto',
  minWidth = 200,
  minHeight = 150,
  maxWidth,
  maxHeight,
  className,
  headerClassName,
  contentClassName,
  storageKey,
  resizable = true,
  showResizeHandle = true,
}: ResizableCardProps) {
  // Load saved size from localStorage
  const getSavedSize = () => {
    if (!storageKey) return { width: defaultWidth, height: defaultHeight };
    const saved = localStorage.getItem(`resizable_card_${storageKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { width: defaultWidth, height: defaultHeight };
      }
    }
    return { width: defaultWidth, height: defaultHeight };
  };

  const [size, setSize] = useState<{ width: number | string; height: number | string }>(getSavedSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeMode, setResizeMode] = useState<'se' | 'e' | 's' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Save size to localStorage
  useEffect(() => {
    if (storageKey && typeof size.width === 'number' && typeof size.height === 'number') {
      localStorage.setItem(`resizable_card_${storageKey}`, JSON.stringify(size));
    }
  }, [size, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent, mode: 'se' | 'e' | 's') => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };
    setResizeMode(mode);
    setIsResizing(true);
  }, [resizable]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;

      if (resizeMode === 'se' || resizeMode === 'e') {
        newWidth = Math.max(minWidth, startPos.current.width + deltaX);
        if (maxWidth) newWidth = Math.min(maxWidth, newWidth);
      }

      if (resizeMode === 'se' || resizeMode === 's') {
        newHeight = Math.max(minHeight, startPos.current.height + deltaY);
        if (maxHeight) newHeight = Math.min(maxHeight, newHeight);
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeMode(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeMode, minWidth, minHeight, maxWidth, maxHeight]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        'relative border-2 border-primary/50 transition-shadow',
        isResizing && 'shadow-lg ring-2 ring-primary/30',
        className
      )}
      style={{
        width: typeof size.width === 'number' ? `${size.width}px` : size.width,
        height: typeof size.height === 'number' ? `${size.height}px` : size.height,
      }}
    >
      {(title || description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn('overflow-auto', contentClassName)}>
        {children}
      </CardContent>

      {/* Resize handles */}
      {resizable && showResizeHandle && (
        <>
          {/* Bottom-right corner handle (SE) */}
          <div
            className={cn(
              'absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10 group',
              'hover:bg-primary/20 transition-colors rounded-tl'
            )}
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          >
            <svg
              className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 20L12 20M20 20L20 12M20 20L8 8" />
            </svg>
          </div>

          {/* Right edge handle (E) */}
          <div
            className={cn(
              'absolute top-1/2 right-0 w-2 h-12 -translate-y-1/2 cursor-ew-resize z-10',
              'hover:bg-primary/30 transition-colors rounded-l'
            )}
            onMouseDown={(e) => handleMouseDown(e, 'e')}
          />

          {/* Bottom edge handle (S) */}
          <div
            className={cn(
              'absolute bottom-0 left-1/2 w-12 h-2 -translate-x-1/2 cursor-ns-resize z-10',
              'hover:bg-primary/30 transition-colors rounded-t'
            )}
            onMouseDown={(e) => handleMouseDown(e, 's')}
          />
        </>
      )}
    </Card>
  );
}
