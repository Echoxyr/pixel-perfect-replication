import { useState, useEffect } from 'react';
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
  User
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

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hseStats, tasks, cantieri, imprese, lavoratori } = useWorkHub();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);

  // Format current date in Italian
  const formatCurrentDate = () => {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
  };

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
  const openTasks = tasks.filter(t => t.status !== 'fatto').length;
  const activeCantieri = cantieri.filter(c => c.stato === 'attivo');

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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const mainNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/progetti', label: 'Progetti & Task', icon: FolderKanban, badge: openTasks },
    { path: '/sal', label: 'SAL', icon: TrendingUp },
  ];

  const hseNavItems = [
    { path: '/imprese', label: 'Imprese Esterne', icon: Building2, badge: imprese.length },
    { path: '/lavoratori', label: 'Dipendenti', icon: HardHat, badge: hseStats.lavoratoriWarning + hseStats.lavoratoriCritical > 0 ? hseStats.lavoratoriWarning + hseStats.lavoratoriCritical : undefined },
    { path: '/hse', label: 'Dashboard HSE', icon: ShieldCheck, badge: totalAlerts > 0 ? totalAlerts : undefined },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-sidebar-background border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Construction className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg text-sidebar-foreground">E-gest</span>
              <p className="text-[10px] text-muted-foreground leading-none">la commessa a portata di mano</p>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="p-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-sidebar-accent rounded-lg hover:bg-sidebar-accent/80 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Cerca...</span>
          </button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Principale</p>
          </div>
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg transition-colors text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Cantieri Section */}
          <div className="px-3 mt-4 mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cantieri</p>
          </div>
          <Link
            to="/cantieri"
            className={cn(
              'flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg transition-colors text-sm',
              location.pathname === '/cantieri'
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <div className="flex items-center gap-3">
              <Construction className="w-4 h-4" />
              <span>Tutti i Cantieri</span>
            </div>
            <span className={cn(
              'text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
              location.pathname === '/cantieri' 
                ? 'bg-primary-foreground/20 text-primary-foreground' 
                : 'bg-primary/10 text-primary'
            )}>
              {cantieri.length}
            </span>
          </Link>
          
          {/* Individual Cantieri */}
          {activeCantieri.map((cantiere) => {
            const isActive = location.pathname === `/cantieri/${cantiere.id}`;
            return (
              <Link
                key={cantiere.id}
                to={`/cantieri/${cantiere.id}`}
                className={cn(
                  'flex items-center px-3 py-2 mx-2 ml-6 rounded-lg transition-colors text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <span className="truncate">{cantiere.codiceCommessa}</span>
              </Link>
            );
          })}

          {/* HSE Section */}
          <div className="px-3 mt-4 mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sicurezza & HSE</p>
          </div>
          {hseNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const hasAlert = item.badge !== undefined && item.badge > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 mx-2 rounded-lg transition-colors text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {hasAlert && (
                  <span className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 
                    item.path === '/hse' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* HSE Status Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="p-3 rounded-lg bg-sidebar-accent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-sidebar-foreground">Stato Sicurezza</span>
              <div className={cn(
                'w-2.5 h-2.5 rounded-full',
                hseStats.impreseCritical > 0 || hseStats.lavoratoriCritical > 0 ? 'bg-red-500 animate-pulse' :
                hseStats.impreseWarning > 0 || hseStats.lavoratoriWarning > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              )} />
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center">
                <p className="font-bold text-emerald-500">{hseStats.impreseOk + hseStats.lavoratoriOk}</p>
                <p className="text-muted-foreground">OK</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-amber-500">{hseStats.impreseWarning + hseStats.lavoratoriWarning}</p>
                <p className="text-muted-foreground">Attenzione</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-red-500">{hseStats.impreseCritical + hseStats.lavoratoriCritical}</p>
                <p className="text-muted-foreground">Critico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-2 border-t border-sidebar-border">
          <Link
            to="/impostazioni"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
              location.pathname === '/impostazioni'
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Impostazioni</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border overflow-y-auto">
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
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
              {mainNavItems.map((item) => {
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
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="px-4 my-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Cantieri</p>
              </div>
              <Link
                to="/cantieri"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                  location.pathname === '/cantieri'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Construction className="w-5 h-5" />
                <span>Tutti i Cantieri</span>
              </Link>
              <div className="px-4 my-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Sicurezza & HSE</p>
              </div>
              {hseNavItems.map((item) => {
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
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/impostazioni"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                  location.pathname === '/impostazioni'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Settings className="w-5 h-5" />
                <span>Impostazioni</span>
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{formatCurrentDate()}</span>
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
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalAlerts}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3">
                  <p className="font-semibold mb-3">Notifiche</p>
                  {totalAlerts > 0 ? (
                    <div className="space-y-2">
                      {hseStats.documentiScaduti > 0 && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span><span className="text-red-500 font-semibold">{hseStats.documentiScaduti}</span> documenti scaduti</span>
                        </div>
                      )}
                      {hseStats.formazioniScadute > 0 && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span><span className="text-red-500 font-semibold">{hseStats.formazioniScadute}</span> formazioni scadute</span>
                        </div>
                      )}
                      {hseStats.visiteMedicheScadute > 0 && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span><span className="text-red-500 font-semibold">{hseStats.visiteMedicheScadute}</span> visite mediche scadute</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nessuna notifica</p>
                  )}
                </div>
                <DropdownMenuItem onClick={() => navigate('/hse')} className="cursor-pointer">
                  Vai alla Dashboard HSE
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
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
