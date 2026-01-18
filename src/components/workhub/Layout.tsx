import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { useUser } from '@/contexts/UserContext';
import { useSidebarModules } from '@/hooks/useSidebarModules';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearch } from './GlobalSearch';
import { CriticalDeadlinesAlert } from './CriticalDeadlinesAlert';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { OnboardingTour } from './OnboardingTour';
import { TutorialLauncher } from './TutorialLauncher';
import { WorkHubSidebar } from './WorkHubSidebar';
import { Menu, Moon, Sun, User, Calendar, HelpCircle, Settings, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hseStats, tasks, cantieri, imprese, lavoratori } = useWorkHub();
  const { profile } = useUser();
  const { isModuleVisible } = useSidebarModules();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Desktop & mobile condividono lo stesso stato delle sezioni (così l'esperienza resta identica)
  const [principaleExpanded, setPrincipaleExpanded] = useState(false);
  const [commesseExpanded, setCommesseExpanded] = useState(false);
  const [hseExpanded, setHseExpanded] = useState(false);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const [commercialeExpanded, setCommercialeExpanded] = useState(false);
  const [amministrazioneExpanded, setAmministrazioneExpanded] = useState(false);
  const [logisticaExpanded, setLogisticaExpanded] = useState(false);

  const [tutorialOpen, setTutorialOpen] = useState(false);

  const formatCurrentDate = () => {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleTheme = () => setIsDark((v) => !v);

  // Ensure dark mode is the default on first load, and keep DOM in sync with state
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const totalAlerts = hseStats.documentiScaduti + hseStats.formazioniScadute + hseStats.visiteMedicheScadute;
  const openTasks = tasks.filter(t => t.status !== 'fatto').length;
  const lavoratoriAlerts = hseStats.lavoratoriCritical + hseStats.lavoratoriWarning;
  const impreseCritical = hseStats.impreseCritical;

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

  // Shared section state object for WorkHubSidebar
  const sectionState = {
    principaleExpanded,
    setPrincipaleExpanded,
    commesseExpanded,
    setCommesseExpanded,
    hseExpanded,
    setHseExpanded,
    complianceExpanded,
    setComplianceExpanded,
    commercialeExpanded,
    setCommercialeExpanded,
    amministrazioneExpanded,
    setAmministrazioneExpanded,
    logisticaExpanded,
    setLogisticaExpanded,
  };

  // Shared data for WorkHubSidebar
  const sidebarData = {
    totalAlerts,
    openTasks,
    lavoratoriAlerts,
    impreseCritical,
    cantieriCount: cantieri.length,
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        'hidden md:flex flex-col border-r border-sidebar-border transition-all duration-300 relative z-10 h-screen',
        'bg-sidebar',
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}>
        <WorkHubSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenTutorial={() => setTutorialOpen(true)}
          sectionState={sectionState}
          data={sidebarData}
          isModuleVisible={isModuleVisible}
          currentPath={location.pathname}
          onNavigate={() => {}}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border animate-slide-in-left overflow-y-auto flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <WorkHubSidebar
              collapsed={false}
              onToggleCollapse={() => {}}
              onOpenSearch={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              onOpenTutorial={() => {
                setMobileMenuOpen(false);
                setTutorialOpen(true);
              }}
              sectionState={sectionState}
              data={sidebarData}
              isModuleVisible={isModuleVisible}
              currentPath={location.pathname}
              onNavigate={() => setMobileMenuOpen(false)}
              isMobile={true}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
        <main className="flex-1 p-4 md:p-6 overflow-auto overscroll-contain scrollbar-thin bg-content-glass backdrop-blur-sm">
          <Outlet />
        </main>
      </div>

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
      
      {/* Interactive Tutorial Launcher */}
      <TutorialLauncher isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
}
