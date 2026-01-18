import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, Bell, Shield, BarChart3 } from 'lucide-react';
import DocumentFlowManager from '@/components/workhub/DocumentFlowManager';
import ComplianceMonitor from '@/components/workhub/ComplianceMonitor';
import WorkflowNotifications from '@/components/workhub/WorkflowNotifications';

export default function FlussoDocumentale() {
  const [activeTab, setActiveTab] = useState('flusso');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="w-6 h-6 text-primary" />
            Flusso Documentale & Workflow
          </h1>
          <p className="text-muted-foreground">
            Gestione completa del ciclo: Computo → Preventivo → Ordine → DDT → Fattura
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full h-auto flex-nowrap justify-start gap-1 p-1">
          <TabsTrigger value="flusso" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Flusso Documentale
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance Fornitori
          </TabsTrigger>
          <TabsTrigger value="notifiche" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifiche Workflow
          </TabsTrigger>
        </TabsList>

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
