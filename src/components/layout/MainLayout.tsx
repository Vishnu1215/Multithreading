import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { useRafSimulation } from '@/hooks/useRafSimulation';
import { useSimulationStore } from '@/store/simulationStore';
import { cn } from '@/lib/utils';

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const presentationMode = useSimulationStore((s) => s.presentationMode);

  // Activate continuous 60fps RAF simulation clock
  useRafSimulation();

  return (
    <div className={cn('min-h-screen flex bg-background text-foreground', presentationMode && 'text-lg')}>
      {/* Sidebar */}
      {!presentationMode && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out',
          !presentationMode && (sidebarCollapsed ? 'pl-20' : 'pl-64')
        )}
      >
        <Topbar
          onOpenCommand={() => setCommandOpen(true)}
          onOpenHelp={() => {}}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
};
