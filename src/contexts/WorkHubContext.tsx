import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkHubData } from '@/hooks/useWorkHubData';

type WorkHubContextType = ReturnType<typeof useWorkHubData>;

const WorkHubContext = createContext<WorkHubContextType | null>(null);

export function WorkHubProvider({ children }: { children: ReactNode }) {
  const workHubData = useWorkHubData();
  
  return (
    <WorkHubContext.Provider value={workHubData}>
      {children}
    </WorkHubContext.Provider>
  );
}

export function useWorkHub() {
  const context = useContext(WorkHubContext);
  if (!context) {
    throw new Error('useWorkHub must be used within a WorkHubProvider');
  }
  return context;
}
