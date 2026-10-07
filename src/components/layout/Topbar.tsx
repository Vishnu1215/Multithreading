import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Command, 
  Play, 
  Pause, 
  RotateCcw, 
  HelpCircle,
  Activity,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onOpenCommand: () => void;
  onOpenHelp: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommand, onOpenHelp }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useSimulationStore((s) => s.theme);
  const toggleTheme = useSimulationStore((s) => s.toggleTheme);
  const status = useSimulationStore((s) => s.status);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const pauseSimulation = useSimulationStore((s) => s.pauseSimulation);
  const resumeSimulation = useSimulationStore((s) => s.resumeSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const config = useSimulationStore((s) => s.config);
  const progress = useSimulationStore((s) => s.progress);
  const presentationMode = useSimulationStore((s) => s.presentationMode);
  const setPresentationMode = useSimulationStore((s) => s.setPresentationMode);

  // Format breadcrumb path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathSegments.length === 0 ? 'Home' : pathSegments[0].replace('-', ' ');

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-border/40 bg-card/75 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Breadcrumbs & Path */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground font-mono">ThreadLab</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        <span className="font-semibold capitalize text-foreground">{currentTitle}</span>

        {/* Global Live status pill */}
        <div
          className={cn(
            'ml-4 hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all',
            status === 'running'
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-sm shadow-emerald-500/20'
              : status === 'paused'
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
              : status === 'completed'
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-secondary text-muted-foreground border-border/40'
          )}
        >
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              status === 'running' ? 'bg-emerald-500 animate-pulse' : status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'
            )}
          />
          <span className="uppercase font-bold tracking-wider">{status}</span>
          <span className="text-border">|</span>
          <span>{config.threadCount}T / {config.cores}C</span>
          {status === 'running' && (
            <span className="text-foreground font-bold">{Math.round(progress)}%</span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Quick simulation mini-controller */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border/50">
          {status === 'running' ? (
            <Button size="sm" variant="ghost" onClick={pauseSimulation} title="Pause">
              <Pause className="w-3.5 h-3.5 text-amber-500" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={status === 'paused' ? resumeSimulation : startSimulation}
              title="Run / Resume"
            >
              <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={resetSimulation} title="Reset">
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommand}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/40 text-xs transition-colors"
        >
          <Command className="w-3.5 h-3.5" />
          <span>Quick Jump</span>
          <kbd className="font-mono text-[10px] bg-card px-1.5 py-0.5 rounded border border-border/60">⌘K</kbd>
        </button>

        {/* Presentation Mode Toggle */}
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          className={cn(
            'p-2 rounded-xl transition-colors border',
            presentationMode
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground bg-secondary/50 border-border/40'
          )}
          title="Toggle Presentation Mode (Projector optimized)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors border border-border/40"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Help & Tour */}
        <button
          onClick={() => navigate('/help')}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors border border-border/40"
          title="Help & Faculty Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
