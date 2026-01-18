import { Link } from "react-router-dom";
import {
  Award,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Command,
  Euro,
  FileCheck,
  FileText,
  GraduationCap,
  HardHat,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Truck,
  User,
  UserCircle,
  X,
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

export type WorkHubSidebarProps = {
  variant: "desktop" | "mobile";
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onClose?: () => void;

  pathname: string;
  isModuleVisible: (moduleId: string) => boolean;

  openTasks: number;
  cantieriCount: number;
  totalAlerts: number;
  impreseCritical: number;
  lavoratoriAlerts: number;

  sections: SectionState;

  onOpenSearch: () => void;
  onOpenTutorials: () => void;
};

export function WorkHubSidebar({
  variant,
  collapsed,
  onToggleCollapsed,
  onClose,
  pathname,
  isModuleVisible,
  openTasks,
  cantieriCount,
  totalAlerts,
  impreseCritical,
  lavoratoriAlerts,
  sections,
  onOpenSearch,
  onOpenTutorials,
}: WorkHubSidebarProps) {
  const isMobile = variant === "mobile";

  const isActive = (path: string) => pathname === path;
  const isActiveStartsWith = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

  const handleNav = () => {
    if (isMobile) onClose?.();
  };

  const NavItem = ({
    to,
    icon: Icon,
    label,
    badge,
    badgeTone = "primary",
    active,
    tutorialId,
  }: {
    to: string;
    icon: any;
    label: string;
    badge?: number;
    badgeTone?: BadgeTone;
    active: boolean;
    tutorialId?: string;
  }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            data-tutorial={tutorialId}
            onClick={handleNav}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
            )}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary-foreground" />
            )}
            <Icon className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
            {!collapsed && (
              <>
                <span className="font-medium text-[11px]">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className={cn(
                      "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                      active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : badgeTone === "danger"
                          ? "bg-danger/light text-danger"
                          : badgeTone === "warning"
                            ? "bg-warning/light text-warning"
                            : "bg-primary/15 text-primary",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </Link>
        </TooltipTrigger>
        {collapsed && (
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

  const SectionHeader = ({
    label,
    expanded,
    onToggle,
  }: {
    label: string;
    expanded: boolean;
    onToggle: () => void;
  }) => {
    if (collapsed) {
      return <div className="w-8 h-px bg-sidebar-border mx-auto mb-3" />;
    }

    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-[11px] font-medium text-sidebar-foreground/70 uppercase tracking-wider px-3 mb-2 hover:text-sidebar-foreground transition-colors"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-sidebar-foreground/60 transition-transform",
            !expanded && "-rotate-90",
          )}
        />
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo Header */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-4 justify-between",
        )}
      >
        <Link to="/dashboard" onClick={handleNav} className="flex items-center">
          {collapsed ? (
            <EgestLogo size="sm" showText={false} inSidebar />
          ) : (
            <EgestLogo size="md" inSidebar />
          )}
        </Link>

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
            aria-label="Chiudi menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Bar in Sidebar */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <button
            onClick={() => {
              onOpenSearch();
              if (isMobile) onClose?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/40 text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Cerca...</span>
            <kbd className="ml-auto h-5 items-center gap-1 rounded border border-sidebar-border bg-sidebar-accent/40 px-1.5 font-mono text-[10px] hidden lg:inline-flex">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto overscroll-contain scrollbar-thin space-y-6">
        {/* User Section - First */}
        <div>
          {!collapsed && (
            <p className="text-[11px] font-medium text-sidebar-foreground/70 uppercase tracking-wider px-3 mb-2">
              Utente
            </p>
          )}
          <div className="space-y-1">
            <NavItem
              to="/utente"
              icon={UserCircle}
              label="Area Personale"
              active={isActive("/utente")}
            />
          </div>
        </div>

        {/* Principale */}
        {(isModuleVisible("dashboard") || isModuleVisible("progetti") || isModuleVisible("sal")) && (
          <div>
            <SectionHeader
              label="Principale"
              expanded={sections.principaleExpanded}
              onToggle={() => sections.setPrincipaleExpanded(!sections.principaleExpanded)}
            />
            {(collapsed || sections.principaleExpanded) && (
              <div className="space-y-1">
                {isModuleVisible("dashboard") && (
                  <NavItem
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={isActive("/dashboard")}
                  />
                )}
                {isModuleVisible("progetti") && (
                  <NavItem
                    to="/progetti"
                    icon={FolderKanban}
                    label="Progetti & Task"
                    badge={openTasks}
                    active={isActiveStartsWith("/progetti")}
                  />
                )}
                {isModuleVisible("sal") && (
                  <NavItem
                    to="/sal"
                    icon={TrendingUp}
                    label="Consuntivo"
                    active={isActive("/sal")}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Commesse */}
        {isModuleVisible("cantieri") && (
          <div>
            <SectionHeader
              label="Commesse"
              expanded={sections.commesseExpanded}
              onToggle={() => sections.setCommesseExpanded(!sections.commesseExpanded)}
            />
            {(collapsed || sections.commesseExpanded) && (
              <div className="space-y-1">
                <NavItem
                  to="/cantieri"
                  icon={Building2}
                  label="Elenco Commesse"
                  badge={cantieriCount}
                  active={isActiveStartsWith("/cantieri")}
                  tutorialId="nav-cantieri"
                />
              </div>
            )}
          </div>
        )}

        {/* Sicurezza & HSE */}
        {(isModuleVisible("hse") ||
          isModuleVisible("sicurezza") ||
          isModuleVisible("imprese") ||
          isModuleVisible("lavoratori") ||
          isModuleVisible("formazione") ||
          isModuleVisible("dpi") ||
          isModuleVisible("sorveglianza") ||
          isModuleVisible("checkin")) && (
          <div>
            <SectionHeader
              label="Sicurezza & HSE"
              expanded={sections.hseExpanded}
              onToggle={() => sections.setHseExpanded(!sections.hseExpanded)}
            />
            {(collapsed || sections.hseExpanded) && (
              <div className="space-y-1">
                {isModuleVisible("hse") && (
                  <NavItem
                    to="/hse"
                    icon={ShieldCheck}
                    label="Dashboard HSE"
                    badge={totalAlerts}
                    badgeTone="danger"
                    active={isActive("/hse")}
                    tutorialId="nav-hse"
                  />
                )}
                {isModuleVisible("sicurezza") && (
                  <NavItem
                    to="/compliance/sicurezza"
                    icon={FileCheck}
                    label="D.Lgs 81/2008"
                    active={isActive("/compliance/sicurezza")}
                  />
                )}
                {isModuleVisible("imprese") && (
                  <NavItem
                    to="/imprese"
                    icon={Building2}
                    label="Imprese Esterne"
                    badge={impreseCritical}
                    badgeTone="danger"
                    active={isActive("/imprese")}
                  />
                )}
                {isModuleVisible("lavoratori") && (
                  <NavItem
                    to="/lavoratori"
                    icon={HardHat}
                    label="Dipendenti"
                    badge={lavoratoriAlerts}
                    badgeTone={lavoratoriAlerts > 0 ? "warning" : "primary"}
                    active={isActive("/lavoratori")}
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
                  />
                )}
                {isModuleVisible("checkin") && (
                  <NavItem
                    to="/checkin-sicurezza"
                    icon={ClipboardList}
                    label="Check-in Sicurezza"
                    active={isActive("/checkin-sicurezza")}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Conformità & Certificazioni */}
        {(isModuleVisible("gdpr") || isModuleVisible("qualita") || isModuleVisible("ambiente") || isModuleVisible("bi")) && (
          <div>
            <SectionHeader
              label="Conformità & Certificazioni"
              expanded={sections.complianceExpanded}
              onToggle={() => sections.setComplianceExpanded(!sections.complianceExpanded)}
            />
            {(collapsed || sections.complianceExpanded) && (
              <div className="space-y-1">
                {isModuleVisible("gdpr") && (
                  <NavItem
                    to="/compliance/gdpr"
                    icon={Shield}
                    label="GDPR Privacy"
                    active={isActive("/compliance/gdpr")}
                  />
                )}
                {isModuleVisible("qualita") && (
                  <NavItem
                    to="/compliance/qualita"
                    icon={Award}
                    label="ISO 9001 Qualità"
                    active={isActive("/compliance/qualita")}
                  />
                )}
                {isModuleVisible("ambiente") && (
                  <NavItem
                    to="/compliance/ambiente"
                    icon={Leaf}
                    label="ISO 14001 Ambiente"
                    active={isActive("/compliance/ambiente")}
                  />
                )}
                {isModuleVisible("bi") && (
                  <NavItem
                    to="/compliance/bi"
                    icon={BarChart3}
                    label="Business Intelligence"
                    active={isActive("/compliance/bi")}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Commerciale */}
        {(isModuleVisible("commerciale") || isModuleVisible("computo") || isModuleVisible("listino")) && (
          <div>
            <SectionHeader
              label="Commerciale"
              expanded={sections.commercialeExpanded}
              onToggle={() => sections.setCommercialeExpanded(!sections.commercialeExpanded)}
            />
            {(collapsed || sections.commercialeExpanded) && (
              <div className="space-y-1">
                {isModuleVisible("commerciale") && (
                  <NavItem
                    to="/reparto-commerciale"
                    icon={Briefcase}
                    label="Reparto Commerciale"
                    active={isActive("/reparto-commerciale")}
                  />
                )}
                {isModuleVisible("computo") && (
                  <NavItem
                    to="/computo-metrico"
                    icon={Calculator}
                    label="Computo Metrico"
                    active={isActive("/computo-metrico")}
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
              </div>
            )}
          </div>
        )}

        {/* Amministrazione */}
        {(isModuleVisible("amministrazione") ||
          isModuleVisible("timbrature") ||
          isModuleVisible("scadenzario") ||
          isModuleVisible("rapportini") ||
          isModuleVisible("contatti")) && (
          <div>
            <SectionHeader
              label="Amministrazione"
              expanded={sections.amministrazioneExpanded}
              onToggle={() => sections.setAmministrazioneExpanded(!sections.amministrazioneExpanded)}
            />
            {(collapsed || sections.amministrazioneExpanded) && (
              <div className="space-y-1">
                {isModuleVisible("amministrazione") && (
                  <NavItem
                    to="/reparto-amministrazione"
                    icon={FileText}
                    label="Reparto Amministrazione"
                    active={isActive("/reparto-amministrazione")}
                  />
                )}
                {isModuleVisible("timbrature") && (
                  <NavItem to="/timbrature" icon={Clock} label="Timbrature" active={isActive("/timbrature")} />
                )}
                {isModuleVisible("scadenzario") && (
                  <NavItem to="/scadenzario" icon={Calendar} label="Scadenzario" active={isActive("/scadenzario")} />
                )}
                {isModuleVisible("rapportini") && (
                  <NavItem to="/rapportini" icon={ClipboardList} label="Rapportini" active={isActive("/rapportini")} />
                )}
                {isModuleVisible("contatti") && (
                  <NavItem to="/contatti" icon={User} label="Contatti" active={isActive("/contatti")} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Logistica */}
        {(isModuleVisible("risorse") || isModuleVisible("magazzino")) && (
          <div>
            <SectionHeader
              label="Logistica"
              expanded={sections.logisticaExpanded}
              onToggle={() => sections.setLogisticaExpanded(!sections.logisticaExpanded)}
            />
            {(collapsed || sections.logisticaExpanded) && (
              <div className="space-y-1">
                {isModuleVisible("risorse") && (
                  <NavItem to="/risorse" icon={Truck} label="Risorse & Mezzi" active={isActive("/risorse")} />
                )}
                {isModuleVisible("magazzino") && (
                  <NavItem to="/magazzino" icon={Boxes} label="Magazzino" active={isActive("/magazzino")} />
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => {
            onOpenTutorials();
            if (isMobile) onClose?.();
          }}
          className={cn(
            "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
          )}
        >
          <GraduationCap className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="font-medium text-[11px]">Tutorial Interattivi</span>}
        </button>

        <a
          href="/guida-investitori.html"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
            "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
          )}
        >
          <HelpCircle className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="font-medium text-[11px]">Guida Investitori</span>}
        </a>

        <NavItem
          to="/impostazioni"
          icon={Settings}
          label="Impostazioni"
          active={isActive("/impostazioni")}
        />

        {variant === "desktop" && (
          <button
            onClick={onToggleCollapsed}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent/30 transition-colors"
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", collapsed ? "" : "rotate-180")} />
            {!collapsed && <span>Comprimi</span>}
          </button>
        )}
      </div>
    </div>
  );
}
