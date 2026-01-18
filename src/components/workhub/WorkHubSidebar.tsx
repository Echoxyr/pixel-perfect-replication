import { Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  Calculator,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Command,
  Euro,
  FileCheck,
  FileText,
  FolderKanban,
  GraduationCap,
  HardHat,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  Link2,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Truck,
  UserCircle,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { EgestLogo } from "./EgestLogo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BadgeTone = "primary" | "warning" | "danger";

type SectionState = {
  principaleExpanded: boolean;
  setPrincipaleExpanded: (v: boolean) => void;
  commesseExpanded: boolean;
  setCommesseExpanded: (v: boolean) => void;
  hseExpanded: boolean;
  setHseExpanded: (v: boolean) => void;
  complianceExpanded: boolean;
  setComplianceExpanded: (v: boolean) => void;
  commercialeExpanded: boolean;
  setCommercialeExpanded: (v: boolean) => void;
  amministrazioneExpanded: boolean;
  setAmministrazioneExpanded: (v: boolean) => void;
  logisticaExpanded: boolean;
  setLogisticaExpanded: (v: boolean) => void;
};

type SidebarData = {
  totalAlerts: number;
  openTasks: number;
  lavoratoriAlerts: number;
  impreseCritical: number;
  cantieriCount: number;
};

interface WorkHubSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
  onOpenTutorial: () => void;
  sectionState: SectionState;
  data: SidebarData;
  isModuleVisible: (id: string) => boolean;
  currentPath: string;
  onNavigate: () => void;
  isMobile?: boolean;
}

export function WorkHubSidebar({
  collapsed,
  onToggleCollapse,
  onOpenSearch,
  onOpenTutorial,
  sectionState,
  data,
  isModuleVisible,
  currentPath,
  onNavigate,
  isMobile = false,
}: WorkHubSidebarProps) {
  const {
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
  } = sectionState;

  const { totalAlerts, openTasks, lavoratoriAlerts, impreseCritical, cantieriCount } = data;

  const isActive = (path: string) => currentPath === path;
  const isActiveStartsWith = (path: string) => currentPath.startsWith(path);

  // NavItem Component
  const NavItem = ({
    to,
    icon: Icon,
    label,
    badge,
    badgeColor = "primary",
    active,
    tutorialId,
  }: {
    to: string;
    icon: any;
    label: string;
    badge?: number;
    badgeColor?: BadgeTone;
    active: boolean;
    tutorialId?: string;
  }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            onClick={onNavigate}
            data-tutorial={tutorialId}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-white hover:text-white hover:bg-white/10"
            )}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary-foreground" />
            )}
            <Icon className={cn("w-5 h-5 flex-shrink-0", collapsed && !isMobile && "mx-auto")} />
            {(!collapsed || isMobile) && (
              <>
                <span className="font-medium text-[11px] text-white">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className={cn(
                      "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : badgeColor === "danger"
                        ? "bg-red-500/15 text-red-500"
                        : badgeColor === "warning"
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-primary/15 text-primary"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </Link>
        </TooltipTrigger>
        {collapsed && !isMobile && (
          <TooltipContent
            side="right"
            className="font-medium z-[100] bg-popover text-popover-foreground border border-border shadow-lg"
          >
            {label} {badge !== undefined && badge > 0 && `(${badge})`}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  // Section Header Component
  const SectionHeader = ({
    label,
    expanded,
    onToggle,
  }: {
    label: string;
    expanded: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-white/70 uppercase tracking-wider hover:text-white transition-colors",
        collapsed && !isMobile && "justify-center"
      )}
    >
      {(!collapsed || isMobile) && <span>{label}</span>}
      <ChevronDown
        className={cn(
          "w-4 h-4 transition-transform",
          expanded ? "rotate-180" : "",
          collapsed && !isMobile && "mx-auto"
        )}
      />
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-sidebar-border",
          collapsed && !isMobile ? "justify-center px-2" : "px-4"
        )}
      >
        <Link to="/dashboard" onClick={onNavigate} className="flex items-center">
          {collapsed && !isMobile ? (
            <EgestLogo size="sm" showText={false} inSidebar />
          ) : (
            <EgestLogo size="md" inSidebar />
          )}
        </Link>
      </div>

      {/* Search Bar in Sidebar */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 text-white/70 hover:bg-sidebar-accent hover:text-white transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Cerca...</span>
            <kbd className="ml-auto h-5 items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] hidden lg:inline-flex">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto overscroll-contain scrollbar-thin space-y-2">
        {/* User Section */}
        <div>
          <NavItem
            to="/utente"
            icon={UserCircle}
            label="Area Personale"
            active={isActive("/utente")}
          />
        </div>

        {/* Principale Section */}
        <div>
          <SectionHeader
            label="Principale"
            expanded={principaleExpanded}
            onToggle={() => setPrincipaleExpanded(!principaleExpanded)}
          />
          {principaleExpanded && (
            <div className="space-y-1 mt-1">
              <NavItem
                to="/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
                active={isActive("/dashboard")}
                tutorialId="nav-dashboard"
              />
              {isModuleVisible("progetti") && (
                <NavItem
                  to="/progetti"
                  icon={FolderKanban}
                  label="Progetti & Task"
                  badge={openTasks}
                  active={isActiveStartsWith("/progetti")}
                  tutorialId="nav-progetti"
                />
              )}
              {isModuleVisible("sal") && (
                <NavItem
                  to="/sal"
                  icon={TrendingUp}
                  label="Consuntivo"
                  active={isActive("/sal")}
                  tutorialId="nav-sal"
                />
              )}
            </div>
          )}
        </div>

        {/* Commesse Section */}
        <div>
          <SectionHeader
            label="Commesse"
            expanded={commesseExpanded}
            onToggle={() => setCommesseExpanded(!commesseExpanded)}
          />
          {commesseExpanded && (
            <div className="space-y-1 mt-1">
              {isModuleVisible("cantieri") && (
                <NavItem
                  to="/cantieri"
                  icon={Building2}
                  label="Elenco Commesse"
                  badge={cantieriCount}
                  active={isActiveStartsWith("/cantieri")}
                  tutorialId="nav-cantieri"
                />
              )}
            </div>
          )}
        </div>

        {/* Sicurezza & HSE Section */}
        <div>
          <SectionHeader
            label="Sicurezza & HSE"
            expanded={hseExpanded}
            onToggle={() => setHseExpanded(!hseExpanded)}
          />
          {hseExpanded && (
            <div className="space-y-1 mt-1">
              {isModuleVisible("hse") && (
                <NavItem
                  to="/hse-dashboard"
                  icon={ShieldCheck}
                  label="Dashboard HSE"
                  badge={totalAlerts}
                  badgeColor="danger"
                  active={isActive("/hse-dashboard")}
                  tutorialId="nav-hse"
                />
              )}
              {isModuleVisible("checkin") && (
                <NavItem
                  to="/checkin-sicurezza"
                  icon={FileCheck}
                  label="Check-in Sicurezza"
                  active={isActive("/checkin-sicurezza")}
                />
              )}
              {isModuleVisible("imprese") && (
                <NavItem
                  to="/imprese"
                  icon={Building2}
                  label="Imprese Esterne"
                  badge={impreseCritical}
                  badgeColor="danger"
                  active={isActive("/imprese")}
                  tutorialId="nav-imprese"
                />
              )}
              {isModuleVisible("lavoratori") && (
                <NavItem
                  to="/lavoratori"
                  icon={HardHat}
                  label="Lavoratori"
                  badge={lavoratoriAlerts}
                  badgeColor="warning"
                  active={isActive("/lavoratori")}
                  tutorialId="nav-lavoratori"
                />
              )}
              {isModuleVisible("formazione") && (
                <NavItem
                  to="/formazione"
                  icon={GraduationCap}
                  label="Formazione"
                  active={isActive("/formazione")}
                  tutorialId="nav-formazione"
                />
              )}
              {isModuleVisible("dpi") && (
                <NavItem
                  to="/dpi"
                  icon={ShieldAlert}
                  label="DPI"
                  active={isActive("/dpi")}
                  tutorialId="nav-dpi"
                />
              )}
              {isModuleVisible("sorveglianza") && (
                <NavItem
                  to="/sorveglianza-sanitaria"
                  icon={Stethoscope}
                  label="Sorveglianza Sanitaria"
                  active={isActive("/sorveglianza-sanitaria")}
                  tutorialId="nav-sorveglianza"
                />
              )}
              {isModuleVisible("scadenzario") && (
                <NavItem
                  to="/scadenzario"
                  icon={ClipboardList}
                  label="Scadenzario"
                  active={isActive("/scadenzario")}
                  tutorialId="nav-scadenzario"
                />
              )}
            </div>
          )}
        </div>

        {/* Commerciale Section */}
        <div>
          <SectionHeader
            label="Commerciale"
            expanded={commercialeExpanded}
            onToggle={() => setCommercialeExpanded(!commercialeExpanded)}
          />
          {commercialeExpanded && (
            <div className="space-y-1 mt-1">
              {isModuleVisible("commerciale") && (
                <NavItem
                  to="/ufficio-commerciale"
                  icon={Briefcase}
                  label="Ufficio Commerciale"
                  active={isActive("/ufficio-commerciale")}
                  tutorialId="nav-commerciale"
                />
              )}
              {isModuleVisible("computo") && (
                <NavItem
                  to="/computo-metrico"
                  icon={Calculator}
                  label="Computo Metrico"
                  active={isActive("/computo-metrico")}
                  tutorialId="nav-computo"
                />
              )}
              {isModuleVisible("listino") && (
                <NavItem
                  to="/listino-prezzi"
                  icon={Euro}
                  label="Listino Prezzi"
                  active={isActive("/listino-prezzi")}
                />
              )}
              <NavItem
                to="/flusso-documentale"
                icon={Link2}
                label="Flusso Documentale"
                active={isActive("/flusso-documentale")}
              />
            </div>
          )}
        </div>

        {/* Amministrazione Section */}
        <div>
          <SectionHeader
            label="Amministrazione"
            expanded={amministrazioneExpanded}
            onToggle={() => setAmministrazioneExpanded(!amministrazioneExpanded)}
          />
          {amministrazioneExpanded && (
            <div className="space-y-1 mt-1">
              {isModuleVisible("amministrazione") && (
                <NavItem
                  to="/reparto-amministrazione"
                  icon={FileText}
                  label="Reparto Amministrazione"
                  active={isActive("/reparto-amministrazione")}
                  tutorialId="nav-amministrazione"
                />
              )}
              {isModuleVisible("timbrature") && (
                <NavItem
                  to="/timbrature"
                  icon={Clock}
                  label="Timbrature"
                  active={isActive("/timbrature")}
                  tutorialId="nav-timbrature"
                />
              )}
              {isModuleVisible("rapportini") && (
                <NavItem
                  to="/rapportini"
                  icon={ClipboardList}
                  label="Rapportini"
                  active={isActive("/rapportini")}
                  tutorialId="nav-rapportini"
                />
              )}
            </div>
          )}
        </div>

        {/* Logistica Section */}
        <div>
          <SectionHeader
            label="Logistica"
            expanded={logisticaExpanded}
            onToggle={() => setLogisticaExpanded(!logisticaExpanded)}
          />
          {logisticaExpanded && (
            <div className="space-y-1 mt-1">
              {isModuleVisible("risorse") && (
                <NavItem
                  to="/risorse"
                  icon={Truck}
                  label="Risorse"
                  active={isActive("/risorse")}
                  tutorialId="nav-risorse"
                />
              )}
              {isModuleVisible("magazzino") && (
                <NavItem
                  to="/magazzino"
                  icon={Boxes}
                  label="Magazzino"
                  active={isActive("/magazzino")}
                  tutorialId="nav-magazzino"
                />
              )}
            </div>
          )}
        </div>

        {/* Conformità & Certificazioni Section */}
        <div>
          <SectionHeader
            label="Conformità & Certificazioni"
            expanded={complianceExpanded}
            onToggle={() => setComplianceExpanded(!complianceExpanded)}
          />
          {complianceExpanded && (
            <div className="space-y-1 mt-1">
              {isModuleVisible("sicurezza81") && (
                <NavItem
                  to="/safety-dlgs81"
                  icon={Shield}
                  label="D.Lgs. 81/08"
                  active={isActive("/safety-dlgs81")}
                />
              )}
              {isModuleVisible("qualita") && (
                <NavItem
                  to="/quality-iso"
                  icon={Award}
                  label="ISO 9001 - Qualità"
                  active={isActive("/quality-iso")}
                />
              )}
              {isModuleVisible("ambiente") && (
                <NavItem
                  to="/environmental-iso"
                  icon={Leaf}
                  label="ISO 14001 - Ambiente"
                  active={isActive("/environmental-iso")}
                />
              )}
              {isModuleVisible("bi") && (
                <NavItem
                  to="/business-intelligence"
                  icon={BarChart3}
                  label="Business Intelligence"
                  active={isActive("/business-intelligence")}
                />
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {/* Tutorial Button */}
        <button
          onClick={onOpenTutorial}
          className={cn(
            "w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            "text-white hover:text-white hover:bg-white/10"
          )}
        >
          <GraduationCap className={cn("w-5 h-5 flex-shrink-0", collapsed && !isMobile && "mx-auto")} />
          {(!collapsed || isMobile) && (
            <span className="font-medium text-sm text-white">Tutorial Interattivi</span>
          )}
        </button>

        {/* Guida Investitori */}
        <a
          href="/guida-investitori.html"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            "text-white hover:text-white hover:bg-white/10"
          )}
        >
          <HelpCircle className={cn("w-5 h-5 flex-shrink-0", collapsed && !isMobile && "mx-auto")} />
          {(!collapsed || isMobile) && (
            <span className="font-medium text-sm text-white">Guida Investitori</span>
          )}
        </a>

        {/* Settings */}
        <NavItem
          to="/impostazioni"
          icon={Settings}
          label="Impostazioni"
          active={isActive("/impostazioni")}
        />

        {/* Collapse Button - Only on desktop */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ChevronRight
              className={cn("w-4 h-4 transition-transform", collapsed ? "" : "rotate-180")}
            />
            {!collapsed && <span>Comprimi</span>}
          </button>
        )}
      </div>
    </div>
  );
}
