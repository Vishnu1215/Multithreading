import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSimulationStore } from '@/store/simulationStore';
import { Clock, Play, Pause, RotateCcw, Filter } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const threads = useSimulationStore((s) => s.threads);
  const events = useSimulationStore((s) => s.events);
  const progress = useSimulationStore((s) => s.progress);
  const status = useSimulationStore((s) => s.status);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const pauseSimulation = useSimulationStore((s) => s.pauseSimulation);
  const resumeSimulation = useSimulationStore((s) => s.resumeSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Execution Trace & Swim-Lanes</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Live Timeline</h1>
          <p className="text-xs text-muted-foreground">
            Horizontal swim-lane timeline mapping task assignment, active execution, kernel synchronization, and join barriers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === 'running' ? (
            <Button size="sm" variant="outline" onClick={pauseSimulation} className="gap-1.5 text-xs">
              <Pause className="w-3.5 h-3.5 text-amber-500" /> Pause Trace
            </Button>
          ) : (
            <Button size="sm" variant="glow" onClick={status === 'paused' ? resumeSimulation : startSimulation} className="gap-1.5 text-xs">
              <Play className="w-3.5 h-3.5 fill-white" /> {status === 'paused' ? 'Resume' : 'Start Trace'}
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={resetSimulation} className="text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Swim-Lanes Visualizer Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-heading font-semibold text-sm text-foreground">
            Parallel Thread Swim-Lanes (Simulated Time Stream)
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            Elapsed: <strong className="text-foreground">{Math.round(progress)}%</strong>
          </span>
        </div>

        {/* Lanes */}
        <div className="space-y-4">
          {/* Main Thread Lane */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-foreground font-bold">Main Process (PID 2840)</span>
              <span className="text-muted-foreground">Orchestrator</span>
            </div>
            <div className="h-8 w-full bg-secondary/50 rounded-xl overflow-hidden relative border border-border/40 flex">
              <div
                className="h-full bg-indigo-600/70 border-r border-indigo-400 flex items-center px-2 text-[10px] text-white font-mono truncate"
                style={{ width: `${Math.min(100, Math.max(15, progress * 0.2))}%` }}
              >
                Task Partitioning
              </div>
              {progress > 85 && (
                <div
                  className="h-full bg-emerald-500/80 ml-auto flex items-center px-2 text-[10px] text-white font-mono"
                  style={{ width: '20%' }}
                >
                  Merge & pthread_join
                </div>
              )}
            </div>
          </div>

          {/* Worker Thread Lanes */}
          {threads.map((t) => (
            <div key={t.threadId} className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="font-bold text-foreground">{t.name} (TID {t.tid})</span>
                </div>
                <span className="text-muted-foreground text-[11px]">Core {t.coreId}</span>
              </div>

              <div className="h-9 w-full bg-secondary/50 rounded-xl overflow-hidden relative border border-border/40 flex">
                {/* Spawn block */}
                <div
                  className="h-full bg-slate-600/50 flex items-center px-2 text-[9px] text-slate-200 font-mono truncate"
                  style={{ width: '12%' }}
                >
                  clone()
                </div>

                {/* Main parallel computation */}
                <div
                  className="h-full transition-all duration-300 flex items-center px-2 text-[10px] text-white font-mono truncate shadow-inner"
                  style={{
                    width: `${Math.min(75, Math.max(0, (t.progress / 100) * 75))}%`,
                    backgroundColor: t.color,
                  }}
                >
                  Compute Chunk ({t.progress}%)
                </div>

                {/* Barrier wait */}
                {t.progress >= 95 && (
                  <div className="h-full bg-sky-500/70 flex items-center px-2 text-[9px] text-white font-mono flex-1">
                    Barrier Wait
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Event Stream Log Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-heading font-semibold text-sm text-foreground">
            Timestamped Lifecycle Events
          </h3>
          <Badge variant="outline">{events.length} Recorded Events</Badge>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground text-left">
                <th className="p-2">Timestamp</th>
                <th className="p-2">Task</th>
                <th className="p-2">Core</th>
                <th className="p-2">Event Type</th>
                <th className="p-2">Kernel Description</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground italic">
                    No timeline events yet. Run a simulation to populate.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-secondary/30">
                    <td className="p-2 text-muted-foreground">+{e.timestamp.toFixed(2)} ms</td>
                    <td className="p-2 font-bold text-indigo-400">T{e.threadId} (TID {e.tid})</td>
                    <td className="p-2 text-foreground">Core {e.coreId}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded bg-secondary text-primary font-bold text-[10px]">
                        {e.type}
                      </span>
                    </td>
                    <td className="p-2 text-foreground truncate max-w-md">{e.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
