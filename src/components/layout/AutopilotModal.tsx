import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimulationStore } from '@/store/simulationStore';
import { Play, Pause, X, FastForward, Cpu, Sparkles } from 'lucide-react';

interface AutopilotStage {
  route: string;
  durationMs: number;
  caption: string;
  action?: 'simulate';
}

const AUTOPILOT_STAGES: AutopilotStage[] = [
  {
    route: '/',
    durationMs: 4000,
    caption: '1. Welcome to ThreadLab: Demonstrating single-thread baseline vs 4-worker parallel execution on modern Linux x86_64 SMP.',
  },
  {
    route: '/simulator',
    durationMs: 6000,
    caption: '2. Interactive Simulator: Partitioning Matrix Multiplication into 4 chunks, invoking sys_clone(), and executing concurrently.',
    action: 'simulate',
  },
  {
    route: '/cpu',
    durationMs: 5000,
    caption: '3. CPU Core Visualization: 4 virtual execution cores saturated in C0 state with real-time CFS vruntime dispatching.',
  },
  {
    route: '/sync',
    durationMs: 5000,
    caption: '4. Concurrency Laboratories: Visualizing lost updates during uncoordinated memory writes, restored via futex mutex locking.',
  },
  {
    route: '/deadlock',
    durationMs: 5000,
    caption: '5. Resource Allocation Graph (RAG): Cycle detection and Coffman condition validation under lock ordering inversion.',
  },
  {
    route: '/dashboard',
    durationMs: 5000,
    caption: '6. Telemetry Dashboard: Real-time hardware arc gauges, Amdahl speedup yields, and context switch overhead metrics.',
  },
  {
    route: '/report',
    durationMs: 5000,
    caption: '7. Academic Technical Report: Printable A4 case study documentation with PDF and CSV export ready for faculty review.',
  },
];

export const AutopilotModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const navigate = useNavigate();
  const startSimulation = useSimulationStore((s) => s.startSimulation);

  useEffect(() => {
    if (!open) return;
    const stage = AUTOPILOT_STAGES[currentIdx];
    navigate(stage.route);
    if (stage.action === 'simulate') {
      startSimulation();
    }
  }, [currentIdx, open, navigate, startSimulation]);

  useEffect(() => {
    if (!open || !isRunning) return;
    const timer = setTimeout(() => {
      if (currentIdx < AUTOPILOT_STAGES.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        onClose();
      }
    }, AUTOPILOT_STAGES[currentIdx].durationMs);

    return () => clearTimeout(timer);
  }, [currentIdx, open, isRunning, onClose]);

  if (!open) return null;

  const currentStage = AUTOPILOT_STAGES[currentIdx];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-6">
      <Card className="p-4 bg-card/95 border-primary/50 shadow-2xl glass-panel-glow space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Autopilot ({currentIdx + 1} / {AUTOPILOT_STAGES.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsRunning(!isRunning)}
              className="text-xs h-7 px-2"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (currentIdx < AUTOPILOT_STAGES.length - 1) setCurrentIdx((prev) => prev + 1);
                else onClose();
              }}
              className="text-xs h-7 px-2"
            >
              <FastForward className="w-3.5 h-3.5" />
            </Button>
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-foreground font-medium leading-relaxed">
          {currentStage.caption}
        </p>

        {/* Stage progress bar */}
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / AUTOPILOT_STAGES.length) * 100}%` }}
          />
        </div>
      </Card>
    </div>
  );
};
