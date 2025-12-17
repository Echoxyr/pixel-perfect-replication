import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LayoutDashboard,
  FolderKanban,
  Construction,
  Building2,
  HardHat,
  ShieldCheck,
  TrendingUp,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/progetti', label: 'Progetti & Task', icon: FolderKanban },
  { path: '/cantieri', label: 'Cantieri', icon: Construction },
  { path: '/imprese', label: 'Imprese', icon: Building2 },
  { path: '/lavoratori', label: 'Lavoratori', icon: HardHat },
  { path: '/hse', label: 'HSE Dashboard', icon: ShieldCheck },
  { path: '/sal', label: 'SAL', icon: TrendingUp },
  { path: '/impostazioni', label: 'Impostazioni', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hseStats, tasks, cantieri, imprese, lavoratori, documenti } = useWorkHub();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Global search results
  const searchResults = searchQuery.trim() ? {
    cantieri: cantieri.filter(c => 
      c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.codiceCommessa.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    imprese: imprese.filter(i => 
      i.ragioneSociale.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    lavoratori: lavoratori.filter(l => 
      `${l.nome} ${l.cognome}`.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    tasks: tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  } : null;

  const totalAlerts = hseStats.documentiScaduti + hseStats.formazioniScadute + hseStats.visiteMedicheScadute;

  const handleSearchSelect = (type: string, id: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    switch (type) {
      case 'cantiere':
        navigate(`/cantieri/${id}`);
        break;
      case 'impresa':
        navigate('/imprese');
        break;
      case 'lavoratore':
        navigate('/lavoratori');
        break;
      case 'task':
        navigate('/progetti');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        'hidden md:flex flex-col bg-card border-r border-border transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Construction className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">E-gest</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            const showBadge = item.path === '/hse' && totalAlerts > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors relative',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {showBadge && (
                  <span className={cn(
                    'absolute bg-red-500 text-white text-xs font-medium rounded-full',
                    sidebarOpen ? 'right-3 px-1.5 py-0.5' : 'top-1 right-1 w-2 h-2'
                  )}>
                    {sidebarOpen ? totalAlerts : ''}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground">E-gest v1.0</p>
            <p className="text-xs text-muted-foreground">Gestione Cantieri HSE</p>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Construction className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">E-gest</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="py-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
              <span>Cerca...</span>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs">
                ⌘K
              </kbd>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {totalAlerts > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2">
                  <p className="font-medium mb-2">Notifiche</p>
                  {totalAlerts > 0 ? (
                    <div className="space-y-2">
                      {hseStats.documentiScaduti > 0 && (
                        <div className="p-2 rounded bg-red-500/10 text-sm">
                          <span className="text-red-500 font-medium">{hseStats.documentiScaduti}</span> documenti scaduti
                        </div>
                      )}
                      {hseStats.formazioniScadute > 0 && (
                        <div className="p-2 rounded bg-red-500/10 text-sm">
                          <span className="text-red-500 font-medium">{hseStats.formazioniScadute}</span> formazioni scadute
                        </div>
                      )}
                      {hseStats.visiteMedicheScadute > 0 && (
                        <div className="p-2 rounded bg-red-500/10 text-sm">
                          <span className="text-red-500 font-medium">{hseStats.visiteMedicheScadute}</span> visite mediche scadute
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nessuna notifica</p>
                  )}
                </div>
                <DropdownMenuItem onClick={() => navigate('/hse')}>
                  Vai alla Dashboard HSE
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ricerca Globale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Cerca cantieri, imprese, lavoratori, task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchResults && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.cantieri.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Cantieri</p>
                    {searchResults.cantieri.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSearchSelect('cantiere', c.id)}
                        className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-2"
                      >
                        <Construction className="w-4 h-4 text-muted-foreground" />
                        <span>{c.codiceCommessa} - {c.nome}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.imprese.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Imprese</p>
                    {searchResults.imprese.map(i => (
                      <button
                        key={i.id}
                        onClick={() => handleSearchSelect('impresa', i.id)}
                        className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{i.ragioneSociale}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.lavoratori.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Lavoratori</p>
                    {searchResults.lavoratori.map(l => (
                      <button
                        key={l.id}
                        onClick={() => handleSearchSelect('lavoratore', l.id)}
                        className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-2"
                      >
                        <HardHat className="w-4 h-4 text-muted-foreground" />
                        <span>{l.cognome} {l.nome}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.tasks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Task</p>
                    {searchResults.tasks.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleSearchSelect('task', t.id)}
                        className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-2"
                      >
                        <FolderKanban className="w-4 h-4 text-muted-foreground" />
                        <span>{t.title}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery && 
                  searchResults.cantieri.length === 0 && 
                  searchResults.imprese.length === 0 && 
                  searchResults.lavoratori.length === 0 && 
                  searchResults.tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nessun risultato per "{searchQuery}"
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
