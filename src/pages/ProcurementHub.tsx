import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Briefcase, GitBranch, AlertTriangle } from 'lucide-react';
import RFQManager from '@/components/workhub/RFQManager';
import SubappaltiManager from '@/components/workhub/SubappaltiManager';

export default function ProcurementHub() {
  const [activeTab, setActiveTab] = useState('rfq');

  return (
    <div className="space-y-6 animate-fade-in min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <span className="truncate">Procurement & Subappalti</span>
          </h1>
          <p className="text-sm text-muted-foreground line-clamp-2">
            RFQ, comparazione offerte, gestione subappalti, varianti e NC/CAPA
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="tabs-scrollable-header -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max h-auto gap-1 p-1">
            <TabsTrigger value="rfq" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              RFQ & Offerte
            </TabsTrigger>
            <TabsTrigger value="subappalti" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Subappalti
            </TabsTrigger>
            <TabsTrigger value="varianti" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Varianti
            </TabsTrigger>
            <TabsTrigger value="nccapa" className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              NC & CAPA
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rfq" className="mt-6 tab-content-fixed">
          <RFQManager />
        </TabsContent>

        <TabsContent value="subappalti" className="mt-6 tab-content-fixed">
          <SubappaltiManager />
        </TabsContent>

        <TabsContent value="varianti" className="mt-6 tab-content-fixed">
          <div className="text-center py-12 text-muted-foreground">
            Modulo Varianti in sviluppo - Gestione change order con storicizzazione
          </div>
        </TabsContent>

        <TabsContent value="nccapa" className="mt-6 tab-content-fixed">
          <div className="text-center py-12 text-muted-foreground">
            Modulo NC/CAPA in sviluppo - Non conformità e azioni correttive
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
