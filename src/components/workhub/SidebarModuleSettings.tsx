import { useSidebarModules, SIDEBAR_MODULES, SECTIONS } from '@/hooks/useSidebarModules';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RotateCcw, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarModuleSettings() {
  const {
    isModuleVisible,
    toggleModule,
    toggleSection,
    resetToDefaults,
    isSectionFullyVisible,
    isSectionPartiallyVisible,
  } = useSidebarModules();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Moduli Sidebar
          </CardTitle>
          <CardDescription>
            Personalizza quali moduli vedere nella barra laterale
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={resetToDefaults}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {SECTIONS.map(section => {
          const sectionModules = SIDEBAR_MODULES.filter(m => m.section === section.id);
          const isFullyVisible = isSectionFullyVisible(section.id);
          const isPartiallyVisible = isSectionPartiallyVisible(section.id);
          
          return (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold uppercase text-muted-foreground">
                  {section.label}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => toggleSection(section.id, !isFullyVisible)}
                >
                  {isFullyVisible ? 'Nascondi tutti' : 'Mostra tutti'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sectionModules.map(module => (
                  <div
                    key={module.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border transition-colors',
                      isModuleVisible(module.id) 
                        ? 'bg-card border-border' 
                        : 'bg-muted/30 border-transparent'
                    )}
                  >
                    <span className={cn(
                      'text-sm',
                      !isModuleVisible(module.id) && 'text-muted-foreground'
                    )}>
                      {module.label}
                    </span>
                    <Switch
                      checked={isModuleVisible(module.id)}
                      onCheckedChange={() => toggleModule(module.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        <p className="text-xs text-muted-foreground pt-4 border-t">
          Le modifiche vengono salvate automaticamente e applicate immediatamente alla sidebar.
        </p>
      </CardContent>
    </Card>
  );
}
