import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

export function KeyboardShortcuts({ 
  onOpenSearch 
}: { 
  onOpenSearch?: () => void;
}) {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = [
    { keys: ['Ctrl', 'K'], description: 'Apri ricerca globale', action: () => onOpenSearch?.() },
    { keys: ['Ctrl', 'H'], description: 'Vai a Dashboard', action: () => navigate('/dashboard') },
    { keys: ['Ctrl', 'P'], description: 'Vai a Progetti', action: () => navigate('/progetti') },
    { keys: ['Ctrl', 'C'], description: 'Vai a Cantieri', action: () => navigate('/cantieri') },
    { keys: ['Ctrl', 'L'], description: 'Vai a Lavoratori', action: () => navigate('/lavoratori') },
    { keys: ['Ctrl', 'I'], description: 'Vai a Impostazioni', action: () => navigate('/impostazioni') },
    { keys: ['?'], description: 'Mostra scorciatoie', action: () => setShowHelp(true) },
    { keys: ['Esc'], description: 'Chiudi dialoghi', action: () => setShowHelp(false) },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Show help with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Handle Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            onOpenSearch?.();
            break;
          case 'h':
            e.preventDefault();
            navigate('/dashboard');
            break;
          case 'p':
            e.preventDefault();
            navigate('/progetti');
            break;
          case 'c':
            e.preventDefault();
            navigate('/cantieri');
            break;
          case 'l':
            e.preventDefault();
            navigate('/lavoratori');
            break;
          case 'i':
            e.preventDefault();
            navigate('/impostazioni');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onOpenSearch]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Scorciatoie da Tastiera
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, j) => (
                  <Badge key={j} variant="outline" className="font-mono text-xs">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
          Premi <Badge variant="outline" className="font-mono text-xs">?</Badge> in qualsiasi momento per vedere questa guida
        </p>
      </DialogContent>
    </Dialog>
  );
}
