import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Plus, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: string;
  titolo: string;
  url: string;
  createdAt: string;
}

const STORAGE_KEY = 'user_favorites';

const getPageTitle = (path: string): string => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/progetti': 'Progetti',
    '/cantieri': 'Cantieri',
    '/lavoratori': 'Lavoratori',
    '/imprese': 'Imprese',
    '/hse': 'Dashboard HSE',
    '/formazione': 'Formazione',
    '/impostazioni': 'Impostazioni',
    '/sal': 'SAL',
    '/dpi': 'DPI',
    '/magazzino': 'Magazzino',
    '/risorse': 'Risorse',
    '/rapportini': 'Rapportini',
    '/timbrature': 'Timbrature',
    '/scadenzario': 'Scadenzario',
    '/contatti': 'Contatti',
    '/utente': 'Area Personale',
  };
  return titles[path] || path;
};

export function FavoritesManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  // Save to localStorage
  const saveFavorites = (newFavorites: Favorite[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
  };

  const isCurrentPageFavorite = favorites.some(f => f.url === location.pathname);

  const addCurrentPageToFavorites = () => {
    setNewTitle(getPageTitle(location.pathname));
    setShowAddDialog(true);
  };

  const confirmAddFavorite = () => {
    if (!newTitle.trim()) return;
    
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      titolo: newTitle.trim(),
      url: location.pathname,
      createdAt: new Date().toISOString(),
    };
    
    saveFavorites([...favorites, newFavorite]);
    setShowAddDialog(false);
    setNewTitle('');
    toast({ title: 'Preferito aggiunto', description: newTitle });
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    saveFavorites(updated);
    toast({ title: 'Preferito rimosso' });
  };

  const toggleCurrentPageFavorite = () => {
    if (isCurrentPageFavorite) {
      const fav = favorites.find(f => f.url === location.pathname);
      if (fav) removeFavorite(fav.id);
    } else {
      addCurrentPageToFavorites();
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Star className={cn(
              'w-4 h-4',
              favorites.length > 0 && 'text-amber-500 fill-amber-500'
            )} />
            <span className="hidden sm:inline">Preferiti</span>
            {favorites.length > 0 && (
              <Badge variant="secondary" className="ml-1">{favorites.length}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          <div className="p-3 border-b flex items-center justify-between">
            <h4 className="font-semibold text-sm">I Miei Preferiti</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCurrentPageFavorite}
              className="h-8 gap-1"
            >
              {isCurrentPageFavorite ? (
                <>
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Rimuovi
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  Aggiungi
                </>
              )}
            </Button>
          </div>
          
          {favorites.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nessun preferito</p>
              <p className="text-xs mt-1">Clicca "Aggiungi" per salvare questa pagina</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="p-2 space-y-1">
                {favorites.map(fav => (
                  <div
                    key={fav.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group',
                      location.pathname === fav.url && 'bg-primary/10'
                    )}
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                    <button
                      className="flex-1 text-left text-sm truncate hover:text-primary"
                      onClick={() => navigate(fav.url)}
                    >
                      {fav.titolo}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFavorite(fav.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Aggiungi ai Preferiti</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Nome del preferito"
              autoFocus
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              {location.pathname}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annulla
            </Button>
            <Button onClick={confirmAddFavorite}>
              <Star className="w-4 h-4 mr-2" />
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
