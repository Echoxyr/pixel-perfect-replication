import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, MousePointer2, Play, Pause } from 'lucide-react';
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

export function InteractiveTutorial({ tutorial, onClose }: InteractiveTutorialProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [showCursor, setShowCursor] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;

  // Find and highlight target element
  const updateSpotlight = useCallback(() => {
    if (!currentStep.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = currentStep.highlightPadding || 8;
      setSpotlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep]);

  // Navigate to route if needed
  useEffect(() => {
    if (currentStep.route && location.pathname !== currentStep.route) {
      navigate(currentStep.route);
      // Wait for navigation and DOM update
      setTimeout(updateSpotlight, 500);
    } else {
      updateSpotlight();
    }
  }, [currentStep, navigate, location.pathname, updateSpotlight]);

  // Animate cursor to target
  useEffect(() => {
    if (!spotlightRect || !currentStep.action || isPaused) {
      setShowCursor(false);
      return;
    }

    setIsAnimating(true);
    setShowCursor(true);

    // Start cursor from center of screen
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    setCursorPosition({ x: startX, y: startY });

    // Calculate target position (center of highlighted element)
    const targetX = spotlightRect.left + spotlightRect.width / 2 + (currentStep.cursorOffset?.x || 0);
    const targetY = spotlightRect.top + spotlightRect.height / 2 + (currentStep.cursorOffset?.y || 0);

    // Animate cursor movement
    const animationDuration = 800;
    const startTime = Date.now();

    const animateCursor = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentX = startX + (targetX - startX) * eased;
      const currentY = startY + (targetY - startY) * eased;
      
      setCursorPosition({ x: currentX, y: currentY });

      if (progress < 1) {
        requestAnimationFrame(animateCursor);
      } else {
        // Cursor reached target
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateCursor);
    }, 300);

    return () => clearTimeout(timer);
  }, [spotlightRect, currentStep, isPaused]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => updateSpotlight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateSpotlight]);

  const goToNextStep = () => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') goToNextStep();
    if (e.key === 'ArrowLeft') goToPrevStep();
    if (e.key === ' ') {
      e.preventDefault();
      setIsPaused(p => !p);
    }
  }, [onClose, currentStepIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (currentStep.position === 'center' || !spotlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const isMobile = window.innerWidth < 640;
    const tooltipWidth = isMobile ? Math.min(320, window.innerWidth - padding * 2) : 360;
    const tooltipHeight = 180;

    // On mobile, always center horizontally
    if (isMobile) {
      return {
        bottom: padding,
        left: '50%',
        transform: 'translateX(-50%)',
        width: tooltipWidth,
      };
    }

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
          top: Math.max(padding, spotlightRect.top + spotlightRect.height / 2 - tooltipHeight / 2),
          left: Math.max(padding, spotlightRect.left - tooltipWidth - padding),
          width: tooltipWidth,
        };
      case 'right':
        return {
          top: Math.max(padding, spotlightRect.top + spotlightRect.height / 2 - tooltipHeight / 2),
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

  const overlayContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="8"
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
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {spotlightRect && (
        <div
          className="absolute rounded-lg border-2 border-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] animate-pulse pointer-events-none"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}

      {/* Animated cursor */}
      {showCursor && (
        <div
          className="absolute pointer-events-none z-[10001] transition-all duration-75"
          style={{
            left: cursorPosition.x,
            top: cursorPosition.y,
            transform: 'translate(-4px, -4px)',
          }}
        >
          <MousePointer2 
            className={cn(
              "w-8 h-8 text-primary drop-shadow-lg",
              isAnimating && "animate-pulse"
            )} 
            fill="currentColor"
          />
          {currentStep.action === 'click' && !isAnimating && (
            <div className="absolute top-6 left-6 w-4 h-4 bg-primary rounded-full animate-ping" />
          )}
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute z-[10002] bg-card border border-border rounded-xl shadow-2xl animate-fade-in max-w-[calc(100vw-32px)]"
        style={getTooltipStyle()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-t-xl overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {currentStepIndex + 1}/{tutorial.steps.length}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setIsPaused(p => !p)}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold mb-1.5 leading-tight">{currentStep.title}</h3>

          {/* Description - scrollable if too long */}
          <div className="max-h-[120px] overflow-y-auto mb-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Navigation - always visible and contained */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className="h-8 px-2 shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Indietro</span>
            </Button>

            <div className="flex gap-1 shrink-0 overflow-hidden max-w-[100px]">
              {tutorial.steps.length <= 10 ? (
                tutorial.steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all shrink-0",
                      idx === currentStepIndex
                        ? "bg-primary w-3"
                        : idx < currentStepIndex
                        ? "bg-primary/50"
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  {currentStepIndex + 1}/{tutorial.steps.length}
                </span>
              )}
            </div>

            <Button
              size="sm"
              onClick={goToNextStep}
              className="h-8 px-2 shrink-0"
            >
              {currentStepIndex === tutorial.steps.length - 1 ? (
                'Fine'
              ) : (
                <>
                  <span className="hidden sm:inline mr-1">Avanti</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hints - hidden on mobile */}
          <div className="hidden sm:flex mt-3 pt-2 border-t border-border/50 items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <span>← → naviga</span>
            <span>Spazio = pausa</span>
            <span>Esc = esci</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}
