import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Construction,
  ShieldCheck,
  LayoutDashboard,
  GraduationCap,
  Play,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tutorials, Tutorial } from './tutorials/TutorialData';
import { InteractiveTutorial } from './InteractiveTutorial';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Construction,
  ShieldCheck,
  LayoutDashboard,
};

interface TutorialLauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialLauncher({ isOpen, onClose }: TutorialLauncherProps) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tutti', count: tutorials.length },
    { id: 'beginner', label: 'Base', count: 2 },
    { id: 'advanced', label: 'Avanzato', count: 1 },
  ];

  const startTutorial = (tutorial: Tutorial) => {
    onClose();
    // Small delay to let the dialog close
    setTimeout(() => {
      setActiveTutorial(tutorial);
    }, 300);
  };

  const handleTutorialClose = () => {
    setActiveTutorial(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Tutorial Interattivi</DialogTitle>
                <DialogDescription>
                  Impara a usare E-gest con guide passo-passo animate
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Categories */}
          <div className="flex gap-2 py-2 border-b border-border">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="gap-1"
              >
                {cat.label}
                <span className="text-xs opacity-60">({cat.count})</span>
              </Button>
            ))}
          </div>

          {/* Tutorial List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {tutorials.map((tutorial) => {
              const Icon = iconMap[tutorial.icon] || LayoutDashboard;
              
              return (
                <div
                  key={tutorial.id}
                  className={cn(
                    "group p-4 rounded-xl border border-border bg-card/50",
                    "hover:bg-card hover:border-primary/30 hover:shadow-lg",
                    "transition-all duration-200 cursor-pointer"
                  )}
                  onClick={() => startTutorial(tutorial)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {tutorial.estimatedTime}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {tutorial.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {tutorial.steps.length} passaggi
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span className="text-xs text-primary/80">
                            Interattivo
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-3 h-3" />
                          Inizia
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              💡 Suggerimento: usa le frecce ← → per navigare e Spazio per mettere in pausa
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Tutorial */}
      {activeTutorial && (
        <InteractiveTutorial
          tutorial={activeTutorial}
          onClose={handleTutorialClose}
        />
      )}
    </>
  );
}

// Export a hook to trigger tutorials programmatically
export function useTutorialLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    TutorialLauncherDialog: () => (
      <TutorialLauncher isOpen={isOpen} onClose={() => setIsOpen(false)} />
    ),
  };
}
