import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EgestLogo } from './EgestLogo';
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
  User,
  ChevronRight,
  ChevronDown,
  Command,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hseStats, tasks, cantieri, imprese, lavoratori } = useWorkHub();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cantieriExpanded, setCantieriExpanded] = useState(true);

  const formatCurrentDate = () => {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

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
      case 'cantiere': navigate(`/cantieri/${id}`); break;
      case 'impresa': navigate('/imprese'); break;
      case 'lavoratore': navigate('/lavoratori'); break;
      case 'task': navigate('/progetti'); break;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const NavItem = ({ 
    to, 
    icon: Icon, 
    label, 
    badge, 
    badgeColor = 'primary',
    isActive 
  }: { 
    to: string; 
    icon: any; 
    label: string; 
    badge?: number; 
    badgeColor?: 'primary' | 'warning' | 'danger';
    isActive: boolean;
  }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary-foreground" />
            )}
            <Icon className={cn('w-5 h-5 flex-shrink-0', sidebarCollapsed && 'mx-auto')} />
            {!sidebarCollapsed && (
              <>
                <span className="font-medium text-sm">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className={cn(
                    'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center',
                    isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : badgeColor === 'danger' 
                        ? 'bg-red-500/15 text-red-500' 
                        : badgeColor === 'warning'
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'bg-primary/15 text-primary'
                  )}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </Link>
        </TooltipTrigger>
        {sidebarCollapsed && (
          <TooltipContent side="right" className="font-medium">
            {label} {badge !== undefined && badge > 0 && `(${badge})`}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        'hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}>
        {/* Logo Header */}
        <div className={cn(
          'h-16 flex items-center border-b border-sidebar-border',
          sidebarCollapsed ? 'justify-center px-2' : 'px-4'
        )}>
          <Link to="/dashboard" className="flex items-center">
            {sidebarCollapsed ? <EgestLogo size="sm" showText={false} /> : <EgestLogo size="md" />}
          </Link>
        </div>

        {/* Search - Only when expanded */}
        {!sidebarCollapsed && (
          <div className="p-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground bg-muted/50 rounded-xl hover:bg-muted transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Cerca...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin space-y-6">
          {/* Main Section */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Principale
              </p>
            )}
            <div className="space-y-1">
              <NavItem 
                to="/dashboard" 
                icon={LayoutDashboard} 
                label="Dashboard" 
                isActive={location.pathname === '/dashboard'} 
              />
              <NavItem 
                to="/progetti" 
                icon={FolderKanban} 
                label="Progetti & Task" 
                badge={openTasks}
                isActive={location.pathname === '/progetti' || location.pathname.startsWith('/progetti/')} 
              />
              <NavItem 
                to="/sal" 
                icon={TrendingUp} 
                label="SAL" 
                isActive={location.pathname === '/sal'} 
              />
            </div>
          </div>

          {/* Cantieri Section */}
          <div>
            {!sidebarCollapsed ? (
              <button
                onClick={() => setCantieriExpanded(!cantieriExpanded)}
                className="w-full flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2 hover:text-foreground transition-colors"
              >
                <span>Cantieri</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform', !cantieriExpanded && '-rotate-90')} />
              </button>
            ) : (
              <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
            )}
            
            <div className="space-y-1">
              <NavItem 
                to="/cantieri" 
                icon={Construction} 
                label="Tutti i Cantieri" 
                badge={cantieri.length}
                isActive={location.pathname === '/cantieri'} 
              />
              
              {!sidebarCollapsed && cantieriExpanded && (
                <div className="ml-4 pl-3 border-l border-sidebar-border space-y-0.5 mt-2">
                  {activeCantieri.slice(0, 5).map((cantiere) => {
                    const isActive = location.pathname === `/cantieri/${cantiere.id}`;
                    return (
                      <Link
                        key={cantiere.id}
                        to={`/cantieri/${cantiere.id}`}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        )}
                      >
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          cantiere.stato === 'attivo' ? 'bg-emerald-500' : 'bg-amber-500'
                        )} />
                        <span className="truncate">{cantiere.codiceCommessa}</span>
                      </Link>
                    );
                  })}
                  {activeCantieri.length > 5 && (
                    <Link
                      to="/cantieri"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:underline"
                    >
                      +{activeCantieri.length - 5} altri
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* HSE Section */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Sicurezza & HSE
              </p>
            )}
            <div className="space-y-1">
              <NavItem 
                to="/imprese" 
                icon={Building2} 
                label="Imprese Esterne" 
                badge={hseStats.impreseCritical}
                badgeColor="danger"
                isActive={location.pathname === '/imprese'} 
              />
              <NavItem 
                to="/lavoratori" 
                icon={HardHat} 
                label="Dipendenti" 
                badge={hseStats.lavoratoriCritical + hseStats.lavoratoriWarning}
                badgeColor={hseStats.lavoratoriCritical > 0 ? 'danger' : 'warning'}
                isActive={location.pathname === '/lavoratori'} 
              />
              <NavItem 
                to="/hse" 
                icon={ShieldCheck} 
                label="Dashboard HSE" 
                badge={totalAlerts}
                badgeColor="danger"
                isActive={location.pathname === '/hse'} 
              />
            </div>
          </div>
        </nav>

        {/* HSE Status Widget */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-sidebar-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-foreground">Stato Sicurezza</span>
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  hseStats.impreseCritical > 0 || hseStats.lavoratoriCritical > 0 
                    ? 'bg-red-500 animate-pulse' 
                    : hseStats.impreseWarning > 0 || hseStats.lavoratoriWarning > 0 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                )} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                  <p className="text-lg font-bold text-emerald-500">{hseStats.impreseOk + hseStats.lavoratoriOk}</p>
                  <p className="text-[10px] text-muted-foreground">OK</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-500/10">
                  <p className="text-lg font-bold text-amber-500">{hseStats.impreseWarning + hseStats.lavoratoriWarning}</p>
                  <p className="text-[10px] text-muted-foreground">Alert</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-500/10">
                  <p className="text-lg font-bold text-red-500">{hseStats.impreseCritical + hseStats.lavoratoriCritical}</p>
                  <p className="text-[10px] text-muted-foreground">Critico</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <NavItem 
            to="/impostazioni" 
            icon={Settings} 
            label="Impostazioni" 
            isActive={location.pathname === '/impostazioni'} 
          />
          
          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className={cn('w-4 h-4 transition-transform', sidebarCollapsed ? '' : 'rotate-180')} />
            {!sidebarCollapsed && <span>Comprimi</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border animate-slide-in-left overflow-y-auto">
            <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <EgestLogo size="md" />
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-6">
              {/* Mobile Nav Items - Same structure as desktop */}
              <div className="space-y-1">
                {[
                  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                  { to: '/progetti', icon: FolderKanban, label: 'Progetti & Task', badge: openTasks },
                  { to: '/sal', icon: TrendingUp, label: 'SAL' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                      location.pathname === item.to
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">{item.badge}</Badge>
                    )}
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-sidebar-border" />
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Cantieri</p>
                <Link
                  to="/cantieri"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                    location.pathname === '/cantieri'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <Construction className="w-5 h-5" />
                  <span className="font-medium">Tutti i Cantieri</span>
                  <Badge variant="secondary" className="ml-auto">{cantieri.length}</Badge>
                </Link>
              </div>
              
              <div className="h-px bg-sidebar-border" />
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Sicurezza</p>
                {[
                  { to: '/imprese', icon: Building2, label: 'Imprese Esterne' },
                  { to: '/lavoratori', icon: HardHat, label: 'Dipendenti' },
                  { to: '/hse', icon: ShieldCheck, label: 'Dashboard HSE', badge: totalAlerts },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                      location.pathname === item.to
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto">{item.badge}</Badge>
                    )}
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-sidebar-border" />
              
              <Link
                to="/impostazioni"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                  location.pathname === '/impostazioni'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/50'
                )}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Impostazioni</span>
              </Link>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Breadcrumb / Page Title could go here */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatCurrentDate()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Button - Desktop */}
            <Button 
              variant="outline" 
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Cerca</span>
              <kbd className="ml-2 h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] hidden lg:inline-flex">
                <Command className="w-3 h-3" />K
              </kbd>
            </Button>
            
            {/* Search Button - Mobile */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isDark ? 'Tema chiaro' : 'Tema scuro'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {totalAlerts > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {totalAlerts}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Notifiche</h3>
                    {totalAlerts > 0 && (
                      <Badge variant="destructive">{totalAlerts} nuove</Badge>
                    )}
                  </div>
                  {totalAlerts > 0 ? (
                    <div className="space-y-2">
                      {hseStats.documentiScaduti > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/15 transition-colors cursor-pointer">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Documenti scaduti</p>
                            <p className="text-xs text-muted-foreground">{hseStats.documentiScaduti} documenti richiedono attenzione</p>
                          </div>
                        </div>
                      )}
                      {hseStats.formazioniScadute > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/15 transition-colors cursor-pointer">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Formazioni scadute</p>
                            <p className="text-xs text-muted-foreground">{hseStats.formazioniScadute} formazioni da rinnovare</p>
                          </div>
                        </div>
                      )}
                      {hseStats.visiteMedicheScadute > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 transition-colors cursor-pointer">
                          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Visite mediche scadute</p>
                            <p className="text-xs text-muted-foreground">{hseStats.visiteMedicheScadute} visite da programmare</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Tutto in ordine!</p>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/hse')} className="cursor-pointer justify-center">
                  Vai alla Dashboard HSE
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">admin@e-gest.it</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" /> Profilo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/impostazioni')}>
                  <Settings className="w-4 h-4 mr-2" /> Impostazioni
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" /> Aiuto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <LogOut className="w-4 h-4 mr-2" /> Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Ricerca Globale
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Cerca cantieri, imprese, lavoratori, task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-base"
              autoFocus
            />
            {searchResults && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin">
                {searchResults.cantieri.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Cantieri
                    </p>
                    <div className="space-y-1">
                      {searchResults.cantieri.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSearchSelect('cantiere', c.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted flex items-center gap-3 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Construction className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{c.nome}</p>
                            <p className="text-xs text-muted-foreground">{c.codiceCommessa}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.imprese.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Imprese
                    </p>
                    <div className="space-y-1">
                      {searchResults.imprese.map(i => (
                        <button
                          key={i.id}
                          onClick={() => handleSearchSelect('impresa', i.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted flex items-center gap-3 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-medium">{i.ragioneSociale}</p>
                            <p className="text-xs text-muted-foreground capitalize">{i.tipo}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.lavoratori.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Lavoratori
                    </p>
                    <div className="space-y-1">
                      {searchResults.lavoratori.map(l => (
                        <button
                          key={l.id}
                          onClick={() => handleSearchSelect('lavoratore', l.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted flex items-center gap-3 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <HardHat className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">{l.cognome} {l.nome}</p>
                            <p className="text-xs text-muted-foreground">{l.mansione}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.tasks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      Task
                    </p>
                    <div className="space-y-1">
                      {searchResults.tasks.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleSearchSelect('task', t.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-muted flex items-center gap-3 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{t.title}</p>
                            <p className="text-xs text-muted-foreground">{t.status}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {searchQuery && 
                  searchResults.cantieri.length === 0 && 
                  searchResults.imprese.length === 0 && 
                  searchResults.lavoratori.length === 0 && 
                  searchResults.tasks.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nessun risultato per "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}
            {!searchQuery && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <p>Digita per cercare in cantieri, imprese, lavoratori e task</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
