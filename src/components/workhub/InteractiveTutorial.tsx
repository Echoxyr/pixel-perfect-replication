import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, MousePointer2, Play, Pause, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tutorial, TutorialStep } from './tutorials/TutorialData';

interface InteractiveTutorialProps {
  tutorial: Tutorial;
  onClose: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Calcola il tempo di lettura in base al numero di parole
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 150; // Lettura lenta per tutorial
  const words = text.split(/\s+/).length;
  const seconds = Math.ceil((words / wordsPerMinute) * 60);
  return Math.max(4, Math.min(seconds, 15)); // Min 4s, max 15s
}

export function InteractiveTutorial({ tutorial, onClose }: InteractiveTutorialProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [showCursor, setShowCursor] = useState(false);
  const [isAnimatingCursor, setIsAnimatingCursor] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = tutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;

  // Tempo di lettura per lo step corrente
  const stepReadingTime = currentStep.readingTime || calculateReadingTime(currentStep.description);

  // Find and highlight target element
  const updateSpotlight = useCallback(() => {
    if (!currentStep.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = currentStep.highlightPadding || 12;
      setSpotlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    } else {
      // Se l'elemento non esiste, usa un fallback centrale
      setSpotlightRect(null);
    }
  }, [currentStep]);

  // Navigate to route if needed
  useEffect(() => {
    if (currentStep.route && location.pathname !== currentStep.route) {
      navigate(currentStep.route);
      // Wait for navigation and DOM update
      const timer = setTimeout(updateSpotlight, 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(updateSpotlight, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, navigate, location.pathname, updateSpotlight]);

  // Animate cursor to target
  useEffect(() => {
    if (!spotlightRect || isPaused) {
      setShowCursor(false);
      return;
    }

    // Se non c'è azione, non mostrare il cursore
    if (!currentStep.action || currentStep.action === 'wait') {
      setShowCursor(false);
      return;
    }

    setIsAnimatingCursor(true);
    setShowCursor(true);

    // Start cursor from edge of screen based on position
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight - 100;

    // Calculate target position (center of highlighted element)
    const targetX = spotlightRect.left + spotlightRect.width / 2 + (currentStep.cursorOffset?.x || 0);
    const targetY = spotlightRect.top + spotlightRect.height / 2 + (currentStep.cursorOffset?.y || 0);

    setCursorPosition({ x: startX, y: startY });

    // Delay before starting animation
    const delay = currentStep.actionDelay || 500;

    const animationTimer = setTimeout(() => {
      // Animate cursor movement
      const animationDuration = 1200;
      const startTime = Date.now();

      const animateCursor = () => {
        const elapsed = Date.now() - startTime;
        const animProgress = Math.min(elapsed / animationDuration, 1);
        
        // Easing function (ease-out-cubic for smooth deceleration)
        const eased = 1 - Math.pow(1 - animProgress, 3);
        
        const currentX = startX + (targetX - startX) * eased;
        const currentY = startY + (targetY - startY) * eased;
        
        setCursorPosition({ x: currentX, y: currentY });

        if (animProgress < 1) {
          requestAnimationFrame(animateCursor);
        } else {
          // Cursor reached target - show click effect
          setTimeout(() => {
            setIsAnimatingCursor(false);
          }, 500);
        }
      };

      requestAnimationFrame(animateCursor);
    }, delay);

    return () => clearTimeout(animationTimer);
  }, [spotlightRect, currentStep, isPaused]);

  // Auto-advance timer
  useEffect(() => {
    // Clear existing timers
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (isPaused) {
      return;
    }

    setAutoAdvanceProgress(0);

    const totalTime = stepReadingTime * 1000;
    const updateInterval = 50; // Update progress every 50ms

    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += updateInterval;
      const progress = Math.min((elapsed / totalTime) * 100, 100);
      setAutoAdvanceProgress(progress);
    }, updateInterval);

    autoAdvanceTimerRef.current = setTimeout(() => {
      if (currentStepIndex < tutorial.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    }, totalTime);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentStepIndex, isPaused, stepReadingTime, tutorial.steps.length]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => updateSpotlight();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [updateSpotlight]);

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentStepIndex, tutorial.steps.length, onClose]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' || e.key === 'Enter') goToNextStep();
    if (e.key === 'ArrowLeft') goToPrevStep();
    if (e.key === ' ') {
      e.preventDefault();
      setIsPaused(p => !p);
    }
  }, [onClose, goToNextStep, goToPrevStep]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 20;
    const isMobile = window.innerWidth < 640;
    const tooltipWidth = isMobile ? Math.min(340, window.innerWidth - padding * 2) : 400;

    if (currentStep.position === 'center' || !spotlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: tooltipWidth,
        maxWidth: `calc(100vw - ${padding * 2}px)`,
      };
    }

    // On mobile, position at bottom
    if (isMobile) {
      return {
        bottom: padding,
        left: '50%',
        transform: 'translateX(-50%)',
        width: tooltipWidth,
        maxWidth: `calc(100vw - ${padding * 2}px)`,
      };
    }

    const tooltipHeight = 220;

    switch (currentStep.position) {
      case 'top':
        return {
          top: Math.max(padding, spotlightRect.top - tooltipHeight - padding),
          left: Math.min(
            Math.max(padding, spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2),
            window.innerWidth - tooltipWidth - padding
          ),
          width: tooltipWidth,
        };
      case 'bottom':
        return {
          top: Math.min(spotlightRect.top + spotlightRect.height + padding, window.innerHeight - tooltipHeight - padding),
          left: Math.min(
            Math.max(padding, spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2),
            window.innerWidth - tooltipWidth - padding
          ),
          width: tooltipWidth,
        };
      case 'left':
        return {
          top: Math.max(padding, Math.min(spotlightRect.top + spotlightRect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding)),
          left: Math.max(padding, spotlightRect.left - tooltipWidth - padding),
          width: tooltipWidth,
        };
      case 'right':
        return {
          top: Math.max(padding, Math.min(spotlightRect.top + spotlightRect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding)),
          left: Math.min(spotlightRect.left + spotlightRect.width + padding, window.innerWidth - tooltipWidth - padding),
          width: tooltipWidth,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: tooltipWidth,
        };
    }
  };

  // Get action label
  const getActionLabel = (action?: string): string => {
    switch (action) {
      case 'click': return '👆 Clicca qui';
      case 'hover': return '👀 Osserva';
      case 'type': return '⌨️ Digita';
      case 'drag': return '✋ Trascina';
      case 'scroll': return '📜 Scorri';
      default: return '';
    }
  };

  const overlayContent = (
    <div className="fixed inset-0 z-[9999]" onClick={(e) => e.stopPropagation()}>
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.8)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow with pulsing animation */}
      {spotlightRect && (
        <>
          {/* Outer glow */}
          <div
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: spotlightRect.top - 4,
              left: spotlightRect.left - 4,
              width: spotlightRect.width + 8,
              height: spotlightRect.height + 8,
              boxShadow: '0 0 30px 10px rgba(var(--primary), 0.4)',
            }}
          />
          {/* Inner border */}
          <div
            className="absolute rounded-xl border-2 border-primary pointer-events-none animate-pulse"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
          />
          {/* Action indicator */}
          {currentStep.action && currentStep.action !== 'wait' && (
            <div
              className="absolute pointer-events-none text-xs font-medium text-primary bg-background/90 px-2 py-1 rounded-full border border-primary/50 animate-bounce"
              style={{
                top: spotlightRect.top - 32,
                left: spotlightRect.left + spotlightRect.width / 2,
                transform: 'translateX(-50%)',
              }}
            >
              {getActionLabel(currentStep.action)}
            </div>
          )}
        </>
      )}

      {/* Animated cursor */}
      {showCursor && (
        <div
          className="absolute pointer-events-none z-[10001] transition-all duration-75"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: 'translate(-8px, -8px)',
          }}
        >
          <MousePointer2 
            className={cn(
              "w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]",
              isAnimatingCursor && "animate-pulse"
            )} 
            fill="currentColor"
          />
          {/* Click ripple effect */}
          {!isAnimatingCursor && currentStep.action === 'click' && (
            <>
              <div className="absolute top-7 left-7 w-6 h-6 bg-primary/50 rounded-full animate-ping" />
              <div className="absolute top-8 left-8 w-4 h-4 bg-primary rounded-full animate-pulse" />
            </>
          )}
        </div>
      )}

      {/* Main Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-[10002] bg-card border-2 border-primary/30 rounded-2xl shadow-2xl animate-fade-in overflow-hidden"
        style={getTooltipStyle()}
      >
        {/* Auto-advance progress bar */}
        <div className="h-1.5 bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-75"
            style={{ width: `${autoAdvanceProgress}%` }}
          />
        </div>

        <div className="p-4">
          {/* Header with step counter and controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {currentStepIndex + 1} / {tutorial.steps.length}
              </span>
              <span className="text-xs text-muted-foreground">
                ~{stepReadingTime}s
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setIsPaused(p => !p)}
                title={isPaused ? 'Riprendi' : 'Pausa'}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={goToNextStep}
                title="Salta step"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={onClose}
                title="Chiudi tutorial"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2 leading-tight text-foreground">
            {currentStep.title}
          </h3>

          {/* Description - scrollable if too long */}
          <div className="max-h-[140px] overflow-y-auto mb-4 pr-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="h-9 px-3 shrink-0"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Indietro
            </Button>

            {/* Step dots - show only first 12 */}
            <div className="flex gap-1 shrink-0 overflow-hidden">
              {tutorial.steps.slice(0, 12).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all shrink-0",
                    idx === currentStepIndex
                      ? "bg-primary scale-125"
                      : idx < currentStepIndex
                      ? "bg-primary/50"
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
              {tutorial.steps.length > 12 && (
                <span className="text-xs text-muted-foreground ml-1">+{tutorial.steps.length - 12}</span>
              )}
            </div>

            <Button
              size="sm"
              onClick={goToNextStep}
              className="h-9 px-4 shrink-0"
            >
              {currentStepIndex === tutorial.steps.length - 1 ? (
                '✓ Fine'
              ) : (
                <>
                  Avanti
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hints - hidden on mobile */}
          <div className="hidden sm:flex mt-3 pt-2 border-t border-border/50 items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>← → navigazione</span>
            <span>Spazio = pausa</span>
            <span>Enter = avanti</span>
            <span>Esc = esci</span>
          </div>

          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-2xl">
              <div className="bg-card border border-primary rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
                <Pause className="w-5 h-5 text-primary" />
                <span className="font-medium">In Pausa</span>
                <Button size="sm" onClick={() => setIsPaused(false)}>
                  Riprendi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial title badge - top of screen */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10003] pointer-events-none">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
          <span>🎓</span>
          <span>{tutorial.title}</span>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}
