import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, Bell, Shield, BarChart3 } from 'lucide-react';
import DocumentFlowManager from '@/components/workhub/DocumentFlowManager';
import ComplianceMonitor from '@/components/workhub/ComplianceMonitor';
import WorkflowNotifications from '@/components/workhub/WorkflowNotifications';

export default function FlussoDocumentale() {
  const [activeTab, setActiveTab] = useState('flusso');

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="truncate">Flusso Documentale & Workflow</span>
          </h1>
          <p className="text-sm text-muted-foreground line-clamp-2">
            Gestione completa del ciclo: Computo → Preventivo → Ordine → DDT → Fattura
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max h-auto gap-1 p-1">
            <TabsTrigger value="flusso" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Flusso
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="notifiche" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Notifiche
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="flusso" className="mt-6">
          <DocumentFlowManager />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <ComplianceMonitor />
        </TabsContent>

        <TabsContent value="notifiche" className="mt-6">
          <WorkflowNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
}
