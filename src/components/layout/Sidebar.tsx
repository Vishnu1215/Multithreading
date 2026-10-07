import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Play, 
  Cpu, 
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
  HelpCircle, 
  FileText, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Overview & Hero', icon: Home },
      { to: '/learn', label: 'Concepts Primer', icon: Sparkles, badge: 'Learn' },
      { to: '/simulator', label: 'Interactive Simulator', icon: Play, badge: 'Core' },
    ],
  },
  {
    title: 'Visualizers',
    items: [
      { to: '/cpu', label: 'CPU Cores Die', icon: Cpu },
      { to: '/scheduler', label: 'Scheduler & CFS', icon: GitBranch },
      { to: '/lifecycle', label: 'Thread Lifecycle', icon: Activity },
      { to: '/timeline', label: 'Live Timeline', icon: Clock },
      { to: '/resources', label: 'Memory & Resources', icon: Database },
    ],
  },
  {
    title: 'Concurrency Labs',
    items: [
      { to: '/sync', label: 'Synchronization', icon: Lock },
      { to: '/deadlock', label: 'Deadlock & RAG', icon: ShieldAlert },
      { to: '/monitor', label: 'Linux Monitor (htop)', icon: Terminal, badge: 'CLI' },
    ],
  },
  {
    title: 'Analysis & Evaluation',
    items: [
      { to: '/dashboard', label: 'Performance Dashboard', icon: BarChart2 },
      { to: '/compare', label: 'Workload Comparison', icon: Layers },
      { to: '/graphs', label: 'Interactive Graphs', icon: LineChart },
      { to: '/case-study', label: 'Case Study Article', icon: BookOpen },
    ],
  },
  {
    title: 'Assessment & Reports',
    items: [
      { to: '/quiz', label: 'Knowledge Quiz', icon: CheckCircle2 },
      { to: '/report', label: 'Report & Export', icon: FileText },
      { to: '/help', label: 'Glossary & Guide', icon: HelpCircle },
    ],
  },
];

export const Sidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({
  collapsed,
  onToggle,
}) => {
  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
        'border-r border-border/40 bg-card/85 backdrop-blur-xl flex flex-col justify-between select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-border/30">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                  ThreadLab
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                  Linux v6.6 NPTL
                </span>
              </div>
            )}
          </NavLink>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary/70 hover:text-foreground transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-130px)]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 font-semibold mb-1">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative',
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] rounded-md font-mono bg-secondary/80 text-foreground border border-border/50">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile badge */}
      {!collapsed && (
        <div className="p-3 border-t border-border/30 bg-secondary/30">
          <div className="text-[11px] text-muted-foreground truncate">OS Case Study Prototype</div>
          <div className="text-[10px] font-mono text-primary font-semibold">Linux Kernel 6.6 • x86_64</div>
        </div>
      )}
    </aside>
  );
};
