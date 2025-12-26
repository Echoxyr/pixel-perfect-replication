import { useSidebarModules, SIDEBAR_MODULES, SECTIONS } from '@/hooks/useSidebarModules';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RotateCcw, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarModuleSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarModuleSettings({ open, onOpenChange }: SidebarModuleSettingsProps) {
  const {
    isModuleVisible,
    toggleModule,
    toggleSection,
    resetToDefaults,
    isSectionFullyVisible,
    isSectionPartiallyVisible,
  } = useSidebarModules();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Personalizza Menu
          </DialogTitle>
          <DialogDescription>
            Scegli quali moduli visualizzare nella barra laterale
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Default
          </Button>
        </div>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {SECTIONS.map(section => {
              const sectionModules = SIDEBAR_MODULES.filter(m => m.section === section.id);
              const isFullyVisible = isSectionFullyVisible(section.id);
              
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
          </div>
        </ScrollArea>
        
        <p className="text-xs text-muted-foreground pt-4 border-t">
          Le modifiche vengono salvate automaticamente e applicate immediatamente alla sidebar.
        </p>
      </DialogContent>
    </Dialog>
  );
}
