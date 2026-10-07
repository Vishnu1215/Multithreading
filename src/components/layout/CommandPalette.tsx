import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Home, 
  Cpu, 
  Play, 
  GitBranch, 
  Activity, 
  BarChart2, 
  Layers, 
  Clock, 
  Database, 
  ShieldAlert, 
  Lock, 
  Terminal, 
  LineChart, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const toggleTheme = useSimulationStore((s) => s.toggleTheme);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const setTourActive = useSimulationStore((s) => s.setTourActive);
  const setAutopilotOpen = useSimulationStore((s) => s.setAutopilotOpen);
  const setConfig = useSimulationStore((s) => s.setConfig);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const items = [
    { title: 'Overview & Hero', category: 'Navigation', icon: Home, action: () => navigate('/') },
    { title: 'Concepts Primer (Process vs Thread)', category: 'Navigation', icon: Sparkles, action: () => navigate('/learn') },
    { title: 'Interactive Simulator', category: 'Navigation', icon: Play, action: () => navigate('/simulator') },
    { title: 'CPU Core Visualizer', category: 'Navigation', icon: Cpu, action: () => navigate('/cpu') },
    { title: 'Scheduler & CFS (Gantt)', category: 'Navigation', icon: GitBranch, action: () => navigate('/scheduler') },
    { title: 'Thread Lifecycle Diagram', category: 'Navigation', icon: Activity, action: () => navigate('/lifecycle') },
    { title: 'Performance Dashboard', category: 'Navigation', icon: BarChart2, action: () => navigate('/dashboard') },
    { title: 'Comparison Dashboard', category: 'Navigation', icon: Layers, action: () => navigate('/compare') },
    { title: 'Live Timeline Swim-lane', category: 'Navigation', icon: Clock, action: () => navigate('/timeline') },
    { title: 'Memory & Resource Allocator', category: 'Navigation', icon: Database, action: () => navigate('/resources') },
    { title: 'Deadlock & RAG Demo', category: 'Navigation', icon: ShieldAlert, action: () => navigate('/deadlock') },
    { title: 'Synchronization Demonstrations', category: 'Navigation', icon: Lock, action: () => navigate('/sync') },
    { title: 'Linux Monitor (htop/top CLI)', category: 'Navigation', icon: Terminal, action: () => navigate('/monitor') },
    { title: 'Interactive Graphs & Amdahl Curve', category: 'Navigation', icon: LineChart, action: () => navigate('/graphs') },
    { title: 'Case Study Article', category: 'Navigation', icon: BookOpen, action: () => navigate('/case-study') },
    { title: 'Assessment Quiz Module', category: 'Navigation', icon: CheckCircle2, action: () => navigate('/quiz') },
    { title: 'Report Export (PDF / CSV)', category: 'Navigation', icon: FileText, action: () => navigate('/report') },
    { title: 'Start Simulation Run Now', category: 'Action', icon: Play, action: () => { startSimulation(); navigate('/simulator'); } },
    { title: 'Launch Guided Onboarding Tour', category: 'Action', icon: Sparkles, action: () => setTourActive(true) },
    { title: 'Launch Demo Autopilot (Hands-Free)', category: 'Action', icon: Sparkles, action: () => setAutopilotOpen(true) },
    { title: 'Load Optimal Preset (4T / 4C Matrix)', category: 'Preset', icon: Play, action: () => { setConfig({ threadCount: 4, cores: 4, workload: 'matrix', syncMode: 'Mutex' }); navigate('/simulator'); } },
    { title: 'Load Oversubscribed Preset (8T / 2C Prime)', category: 'Preset', icon: Play, action: () => { setConfig({ threadCount: 8, cores: 2, workload: 'prime', syncMode: 'Mutex' }); navigate('/simulator'); } },
    { title: 'Load I/O Heavy Preset (4T File Grep)', category: 'Preset', icon: Play, action: () => { setConfig({ threadCount: 4, cores: 4, workload: 'file', syncMode: 'None' }); navigate('/simulator'); } },
    { title: 'Toggle Theme (Dark / Light)', category: 'Action', icon: Sun, action: () => toggleTheme() },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl rounded-2xl glass-panel-glow bg-card/95 border border-border shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to module..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No matching pages or actions found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-secondary/70 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border/40">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
