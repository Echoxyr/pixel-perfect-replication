import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { useUser } from '@/contexts/UserContext';
import { useSidebarModules, SIDEBAR_MODULES, SECTIONS } from '@/hooks/useSidebarModules';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EgestLogo } from './EgestLogo';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearch } from './GlobalSearch';
import { CriticalDeadlinesAlert } from './CriticalDeadlinesAlert';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { OnboardingTour } from './OnboardingTour';
import { QuickActions } from './QuickActions';
import {
  LayoutDashboard,
  FolderKanban,
  Construction,
  Building2,
  HardHat,
  ShieldCheck,
  ShieldAlert,
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
  HelpCircle,
  Shield,
  Award,
  Leaf,
  BarChart3,
  FileCheck,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Calculator,
  Truck,
  ClipboardList,
  Boxes,
  Euro,
  UserCircle,
  Cog
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
// SidebarModuleSettings removed - now in Impostazioni page

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hseStats, tasks, cantieri, imprese, lavoratori } = useWorkHub();
  const { profile } = useUser();
  const { isModuleVisible } = useSidebarModules();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [principaleExpanded, setPrincipaleExpanded] = useState(false);
  const [cantieriExpanded, setCantieriExpanded] = useState(false);
  const [hseExpanded, setHseExpanded] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const [commercialeExpanded, setCommercialeExpanded] = useState(false);
  const [amministrazioneExpanded, setAmministrazioneExpanded] = useState(false);
  const [logisticaExpanded, setLogisticaExpanded] = useState(false);

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
                : 'text-white hover:text-white hover:bg-white/10'
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary-foreground" />
            )}
            <Icon className={cn('w-5 h-5 flex-shrink-0', sidebarCollapsed && 'mx-auto')} />
            {!sidebarCollapsed && (
              <>
                <span className="font-medium text-sm text-white">{label}</span>
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
          <TooltipContent side="right" className="font-medium z-[100] bg-popover text-popover-foreground border border-border shadow-lg">
            {label} {badge !== undefined && badge > 0 && `(${badge})`}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop with Glass Effect */}
      <aside className={cn(
        'hidden md:flex flex-col border-r border-sidebar-border transition-all duration-300 relative z-10',
        'bg-sidebar',
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
          {/* User Section - First */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider px-3 mb-2">
                Utente
              </p>
            )}
            <div className="space-y-1">
              <NavItem 
                to="/utente" 
                icon={UserCircle} 
                label="Area Personale" 
                isActive={location.pathname === '/utente'} 
              />
            </div>
          </div>

          {/* Main Section - Collapsible */}
          {(isModuleVisible('dashboard') || isModuleVisible('progetti') || isModuleVisible('sal')) && (
            <div>
              {!sidebarCollapsed ? (
                <button
                  onClick={() => setPrincipaleExpanded(!principaleExpanded)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-wider px-3 mb-2 hover:text-white transition-colors"
                >
                  <span>Principale</span>
                  <ChevronDown className={cn('w-3 h-3 text-white/70 transition-transform', !principaleExpanded && '-rotate-90')} />
                </button>
              ) : (
                <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
              )}
              
              {(sidebarCollapsed || principaleExpanded) && (
                <div className="space-y-1">
                  {isModuleVisible('dashboard') && (
                    <NavItem 
                      to="/dashboard" 
                      icon={LayoutDashboard} 
                      label="Dashboard" 
                      isActive={location.pathname === '/dashboard'} 
                    />
                  )}
                  {isModuleVisible('progetti') && (
                    <NavItem 
                      to="/progetti" 
                      icon={FolderKanban} 
                      label="Progetti & Task" 
                      badge={openTasks}
                      isActive={location.pathname === '/progetti' || location.pathname.startsWith('/progetti/')} 
                    />
                  )}
                  {isModuleVisible('sal') && (
                    <NavItem 
                      to="/sal" 
                      icon={TrendingUp} 
                      label="Consuntivo" 
                      isActive={location.pathname === '/sal'} 
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cantieri Section - Solo il link diretto senza header di sezione */}
          {isModuleVisible('cantieri') && (
            <div>
              {sidebarCollapsed && (
                <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
              )}
              
              <div className="space-y-1">
                <NavItem 
                  to="/cantieri" 
                  icon={Construction} 
                  label="Cantieri" 
                  badge={cantieri.length}
                  isActive={location.pathname === '/cantieri' || location.pathname.startsWith('/cantieri/')} 
                />
              </div>
            </div>
          )}

          {/* HSE Section - Collapsible */}
          {(isModuleVisible('hse') || isModuleVisible('sicurezza') || isModuleVisible('imprese') || isModuleVisible('lavoratori') || isModuleVisible('formazione') || isModuleVisible('dpi') || isModuleVisible('sorveglianza') || isModuleVisible('checkin')) && (
            <div>
              {!sidebarCollapsed ? (
                <button
                  onClick={() => setHseExpanded(!hseExpanded)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-wider px-3 mb-2 hover:text-white transition-colors"
                >
                  <span>Sicurezza & HSE</span>
                  <ChevronDown className={cn('w-3 h-3 text-white/70 transition-transform', !hseExpanded && '-rotate-90')} />
                </button>
              ) : (
                <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
              )}
              
              {(sidebarCollapsed || hseExpanded) && (
                <div className="space-y-1">
                  {isModuleVisible('hse') && (
                    <NavItem 
                      to="/hse" 
                      icon={ShieldCheck} 
                      label="Dashboard HSE" 
                      badge={totalAlerts}
                      badgeColor="danger"
                      isActive={location.pathname === '/hse'} 
                    />
                  )}
                  {isModuleVisible('sicurezza') && (
                    <NavItem 
                      to="/compliance/sicurezza" 
                      icon={FileCheck} 
                      label="D.Lgs 81/2008" 
                      isActive={location.pathname === '/compliance/sicurezza'} 
                    />
                  )}
                  {isModuleVisible('imprese') && (
                    <NavItem 
                      to="/imprese" 
                      icon={Building2} 
                      label="Imprese Esterne" 
                      badge={hseStats.impreseCritical}
                      badgeColor="danger"
                      isActive={location.pathname === '/imprese'} 
                    />
                  )}
                  {isModuleVisible('lavoratori') && (
                    <NavItem 
                      to="/lavoratori" 
                      icon={HardHat} 
                      label="Dipendenti" 
                      badge={hseStats.lavoratoriCritical + hseStats.lavoratoriWarning}
                      badgeColor={hseStats.lavoratoriCritical > 0 ? 'danger' : 'warning'}
                      isActive={location.pathname === '/lavoratori'} 
                    />
                  )}
                  {isModuleVisible('formazione') && (
                    <NavItem 
                      to="/formazione" 
                      icon={GraduationCap} 
                      label="Formazione" 
                      isActive={location.pathname === '/formazione'} 
                    />
                  )}
                  {isModuleVisible('dpi') && (
                    <NavItem 
                      to="/dpi" 
                      icon={ShieldAlert} 
                      label="DPI" 
                      isActive={location.pathname === '/dpi'} 
                    />
                  )}
                  {isModuleVisible('sorveglianza') && (
                    <NavItem 
                      to="/sorveglianza-sanitaria" 
                      icon={Stethoscope} 
                      label="Sorveglianza Sanitaria" 
                      isActive={location.pathname === '/sorveglianza-sanitaria'} 
                    />
                  )}
                  {isModuleVisible('checkin') && (
                    <NavItem 
                      to="/checkin-sicurezza" 
                      icon={ClipboardList} 
                      label="Check-in Sicurezza" 
                      isActive={location.pathname === '/checkin-sicurezza'} 
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Conformità Section - Collapsible */}
          {(isModuleVisible('gdpr') || isModuleVisible('qualita') || isModuleVisible('ambiente') || isModuleVisible('bi')) && (
            <div>
              {!sidebarCollapsed ? (
                <button
                  onClick={() => setComplianceExpanded(!complianceExpanded)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-wider px-3 mb-2 hover:text-white transition-colors"
                >
                  <span>Conformità & Certificazioni</span>
                  <ChevronDown className={cn('w-3 h-3 text-white/70 transition-transform', !complianceExpanded && '-rotate-90')} />
                </button>
              ) : (
                <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
              )}
              
              {(sidebarCollapsed || complianceExpanded) && (
                <div className="space-y-1">
                  {isModuleVisible('gdpr') && (
                    <NavItem 
                      to="/compliance/gdpr" 
                      icon={Shield} 
                      label="GDPR Privacy" 
                      isActive={location.pathname === '/compliance/gdpr'} 
                    />
                  )}
                  {isModuleVisible('qualita') && (
                    <NavItem 
                      to="/compliance/qualita" 
                      icon={Award} 
                      label="ISO 9001 Qualità" 
                      isActive={location.pathname === '/compliance/qualita'} 
                    />
                  )}
                  {isModuleVisible('ambiente') && (
                    <NavItem 
                      to="/compliance/ambiente" 
                      icon={Leaf} 
                      label="ISO 14001 Ambiente" 
                      isActive={location.pathname === '/compliance/ambiente'} 
                    />
                  )}
                  {isModuleVisible('bi') && (
                    <NavItem 
                      to="/compliance/bi" 
                      icon={BarChart3} 
                      label="Business Intelligence" 
                      isActive={location.pathname === '/compliance/bi'} 
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reparto Commerciale Section - Collapsible */}
          {(isModuleVisible('commerciale') || isModuleVisible('computo') || isModuleVisible('listino')) && (
            <div>
              {!sidebarCollapsed ? (
                <button
                  onClick={() => setCommercialeExpanded(!commercialeExpanded)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-wider px-3 mb-2 hover:text-white transition-colors"
                >
                  <span>Commerciale</span>
                  <ChevronDown className={cn('w-3 h-3 text-white/70 transition-transform', !commercialeExpanded && '-rotate-90')} />
                </button>
              ) : (
                <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
              )}
              
              {(sidebarCollapsed || commercialeExpanded) && (
                <div className="space-y-1">
                  {isModuleVisible('commerciale') && (
                    <NavItem 
                      to="/reparto-commerciale" 
                      icon={Briefcase} 
                      label="Reparto Commerciale" 
                      isActive={location.pathname === '/reparto-commerciale'} 
                    />
                  )}
                  {isModuleVisible('computo') && (
                    <NavItem 
                      to="/computo-metrico" 
                      icon={Calculator} 
                      label="Computo Metrico" 
                      isActive={location.pathname === '/computo-metrico'} 
                    />
                  )}
                  {isModuleVisible('listino') && (
                    <NavItem 
                      to="/listino-prezzi" 
                      icon={Euro} 
                      label="Listino Prezzi" 
                      isActive={location.pathname === '/listino-prezzi'} 
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reparto Amministrazione Section - Collapsible */}
          {(isModuleVisible('amministrazione') || isModuleVisible('timbrature') || isModuleVisible('scadenzario') || isModuleVisible('rapportini') || isModuleVisible('contatti')) && (
            <div>
              {!sidebarCollapsed ? (
                <button
                  onClick={() => setAmministrazioneExpanded(!amministrazioneExpanded)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-wider px-3 mb-2 hover:text-white transition-colors"
                >
                  <span>Amministrazione</span>
                  <ChevronDown className={cn('w-3 h-3 text-white/70 transition-transform', !amministrazioneExpanded && '-rotate-90')} />
                </button>
              ) : (
                <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
              )}
              
              {(sidebarCollapsed || amministrazioneExpanded) && (
                <div className="space-y-1">
                  {isModuleVisible('amministrazione') && (
                    <NavItem 
                      to="/reparto-amministrazione" 
                      icon={FileText} 
                      label="Reparto Amministrazione" 
                      isActive={location.pathname === '/reparto-amministrazione'} 
                    />
                  )}
                  {isModuleVisible('timbrature') && (
                    <NavItem 
                      to="/timbrature" 
                      icon={Clock} 
                      label="Timbrature" 
                      isActive={location.pathname === '/timbrature'} 
                    />
                  )}
                  {isModuleVisible('scadenzario') && (
                    <NavItem 
                      to="/scadenzario" 
                      icon={Calendar} 
                      label="Scadenzario" 
                      isActive={location.pathname === '/scadenzario'} 
                    />
                  )}
                  {isModuleVisible('rapportini') && (
                    <NavItem 
                      to="/rapportini" 
                      icon={ClipboardList} 
                      label="Rapportini" 
                      isActive={location.pathname === '/rapportini'} 
                    />
                  )}
                  {isModuleVisible('contatti') && (
                    <NavItem 
                      to="/contatti" 
                      icon={User} 
                      label="Contatti" 
                      isActive={location.pathname === '/contatti'} 
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logistica Section - Collapsible */}
          {(isModuleVisible('risorse') || isModuleVisible('magazzino')) && (
            <div>
              {!sidebarCollapsed ? (
                <button
                  onClick={() => setLogisticaExpanded(!logisticaExpanded)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-wider px-3 mb-2 hover:text-white transition-colors"
                >
                  <span>Logistica</span>
                  <ChevronDown className={cn('w-3 h-3 text-white/70 transition-transform', !logisticaExpanded && '-rotate-90')} />
                </button>
              ) : (
                <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />
              )}
              
              {(sidebarCollapsed || logisticaExpanded) && (
                <div className="space-y-1">
                  {isModuleVisible('risorse') && (
                    <NavItem 
                      to="/risorse" 
                      icon={Truck} 
                      label="Risorse & Mezzi" 
                      isActive={location.pathname === '/risorse'} 
                    />
                  )}
                  {isModuleVisible('magazzino') && (
                    <NavItem 
                      to="/magazzino" 
                      icon={Boxes} 
                      label="Magazzino" 
                      isActive={location.pathname === '/magazzino'} 
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Removed HSE Status Widget as per user request */}

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {/* Investor Guide Link */}
          <a
            href="/guida-investitori.html"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              'text-white hover:text-white hover:bg-white/10'
            )}
          >
            <HelpCircle className={cn('w-5 h-5 flex-shrink-0', sidebarCollapsed && 'mx-auto')} />
            {!sidebarCollapsed && (
              <span className="font-medium text-sm text-white">Guida Investitori</span>
            )}
          </a>
          
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
                  { to: '/utente', icon: UserCircle, label: 'Utente' },
                  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                  { to: '/progetti', icon: FolderKanban, label: 'Progetti & Task', badge: openTasks },
                  { to: '/sal', icon: TrendingUp, label: 'Consuntivo' },
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
                  <span className="font-medium">Cantieri</span>
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
                  { to: '/formazione', icon: GraduationCap, label: 'Formazione' },
                  { to: '/dpi', icon: ShieldAlert, label: 'DPI' },
                  { to: '/sorveglianza-sanitaria', icon: Stethoscope, label: 'Sorveglianza Sanitaria' },
                  { to: '/checkin-sicurezza', icon: ClipboardList, label: 'Check-in Sicurezza' },
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
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Compliance</p>
                {[
                  { to: '/compliance/gdpr', icon: Shield, label: 'GDPR Privacy' },
                  { to: '/compliance/qualita', icon: Award, label: 'ISO 9001 Qualità' },
                  { to: '/compliance/sicurezza', icon: FileCheck, label: 'D.Lgs 81/2008' },
                  { to: '/compliance/ambiente', icon: Leaf, label: 'ISO 14001 Ambiente' },
                  { to: '/compliance/bi', icon: BarChart3, label: 'Business Intelligence' },
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
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-sidebar-border" />
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Commerciale</p>
                {[
                  { to: '/reparto-commerciale', icon: Briefcase, label: 'Ufficio Commerciale' },
                  { to: '/computo-metrico', icon: Calculator, label: 'Computo Metrico' },
                  { to: '/listino-prezzi', icon: Euro, label: 'Listino Prezzi' },
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
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-sidebar-border" />
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Amministrazione</p>
                {[
                  { to: '/reparto-amministrazione', icon: FileText, label: 'Amministrazione' },
                  { to: '/timbrature', icon: Clock, label: 'Timbrature' },
                  { to: '/scadenzario', icon: Calendar, label: 'Scadenzario' },
                  { to: '/rapportini', icon: ClipboardList, label: 'Rapportini' },
                  { to: '/contatti', icon: User, label: 'Contatti' },
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
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-sidebar-border" />
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Logistica</p>
                {[
                  { to: '/risorse', icon: Truck, label: 'Risorse & Mezzi' },
                  { to: '/magazzino', icon: Boxes, label: 'Magazzino' },
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

            {/* Critical Deadlines Alert */}
            <CriticalDeadlinesAlert />

            {/* Notifications */}
            <NotificationCenter />

            {/* User Info + Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full flex items-center gap-2 pl-2 pr-3 py-1 h-auto">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{profile.nome[0]}{profile.cognome[0]}</span>
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left max-w-[120px]">
                    <span className="text-sm font-semibold text-foreground truncate w-full">{profile.nome} {profile.cognome}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight truncate w-full">{profile.ruolo}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">Direttore Tecnico</p>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto scrollbar-thin bg-content-glass backdrop-blur-sm">
          <Outlet />
        </main>
      </div>

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
}
