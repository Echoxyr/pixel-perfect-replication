import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  LayoutDashboard,
  Construction,
  ShieldCheck,
  FolderKanban,
  Settings,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'onboarding_completed';

interface TourStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route?: string;
  tip: string;
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    title: 'Benvenuto in E-gest!',
    description: 'Questo è il tuo nuovo sistema integrato per la gestione di cantieri, sicurezza e conformità. Ti guideremo attraverso le funzionalità principali.',
    icon: Sparkles,
    tip: 'Puoi riaprire questo tour dalle Impostazioni in qualsiasi momento.',
  },
  {
    id: 2,
    title: 'Dashboard Principale',
    description: 'La Dashboard ti offre una panoramica immediata di tutti i cantieri attivi, task aperti, alert sicurezza e scadenze importanti.',
    icon: LayoutDashboard,
    route: '/dashboard',
    tip: 'Usa il selettore cantiere per vedere i dati filtrati per ogni singolo cantiere.',
  },
  {
    id: 3,
    title: 'Gestione Cantieri',
    description: 'Crea e gestisci i tuoi cantieri con tutte le informazioni: committente, date, imprese coinvolte, lavoratori e documentazione.',
    icon: Construction,
    route: '/cantieri',
    tip: 'Ogni cantiere ha una sua dashboard dedicata con tutti i dettagli.',
  },
  {
    id: 4,
    title: 'Sicurezza & HSE',
    description: 'Monitora documenti, formazioni, DPI e visite mediche. Il sistema ti avvisa automaticamente delle scadenze critiche.',
    icon: ShieldCheck,
    route: '/hse',
    tip: 'I colori Rosso/Giallo/Verde indicano lo stato di conformità immediato.',
  },
  {
    id: 5,
    title: 'Progetti & Task',
    description: 'Organizza il lavoro con Kanban, timeline Gantt e tabelle. Assegna priorità e monitora lo stato di avanzamento.',
    icon: FolderKanban,
    route: '/progetti',
    tip: 'Premi Ctrl+K per cercare rapidamente in tutto il sistema.',
  },
  {
    id: 6,
    title: 'Personalizzazione',
    description: 'Nelle Impostazioni puoi personalizzare la sidebar, il tema colori, e molto altro per adattare E-gest alle tue esigenze.',
    icon: Settings,
    route: '/impostazioni',
    tip: 'Nascondi i moduli che non usi dalla sezione "Moduli Sidebar".',
  },
];

export function OnboardingTour() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay to let the app load
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = tourSteps[currentStep + 1];
      if (nextStep.route) {
        navigate(nextStep.route);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = tourSteps[currentStep - 1];
      if (prevStep.route) {
        navigate(prevStep.route);
      }
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    navigate('/dashboard');
  };

  const skipTour = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg [&>button]:hidden" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <step.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle>{step.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Passo {currentStep + 1} di {tourSteps.length}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Progress value={progress} className="h-1" />
          
          <DialogDescription className="text-base">
            {step.description}
          </DialogDescription>

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">Suggerimento:</strong> {step.tip}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Indietro
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={skipTour}>
              Salta
            </Button>
            <Button onClick={handleNext} className="gap-1">
              {currentStep === tourSteps.length - 1 ? (
                'Inizia!'
              ) : (
                <>
                  Avanti
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Button to restart tour from settings
export function RestartOnboardingButton() {
  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <Button variant="outline" onClick={handleRestart} className="gap-2">
      <Sparkles className="w-4 h-4" />
      Riavvia Tour Guidato
    </Button>
  );
}
