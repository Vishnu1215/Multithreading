import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CoreTile } from '@/components/cpu/CoreTile';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSimulationStore } from '@/store/simulationStore';
import { Cpu, Zap, RotateCcw, Play, Pause, Activity, ArrowRightLeft, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const CpuPage: React.FC = () => {
  const cores = useSimulationStore((s) => s.cores);
  const threads = useSimulationStore((s) => s.threads);
  const config = useSimulationStore((s) => s.config);
  const setConfig = useSimulationStore((s) => s.setConfig);
  const status = useSimulationStore((s) => s.status);
  const currentMetrics = useSimulationStore((s) => s.currentMetrics);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const pauseSimulation = useSimulationStore((s) => s.pauseSimulation);
  const resumeSimulation = useSimulationStore((s) => s.resumeSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  const [viewMode, setViewMode] = useState<'parallel' | 'concurrency'>('parallel');

  // Ready Queue: threads that are Ready or Waiting
  const readyQueue = threads.filter((t) => t.state === 'Ready' || (status === 'running' && t.state === 'Waiting'));

  const chartData = cores.map((c) => ({
    name: `Core ${c.id}`,
    utilization: c.utilization,
    temp: c.temperatureC,
  }));

  const activeCoresCount = viewMode === 'concurrency' ? 1 : config.cores;
  const displayedCores = cores.slice(0, activeCoresCount);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Silicon Architecture & Sched Dispatches</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">CPU Core Visualizer</h1>
          <p className="text-xs text-muted-foreground">
            Physical processor die mapping, active thread affinity, CFS ready-queue stack, and context switch costs.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-secondary p-1 rounded-xl border border-border/40 text-xs">
            <button
              onClick={() => {
                setViewMode('parallel');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'parallel' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
              }`}
            >
              Multi-Core Parallelism ({config.cores} Cores)
            </button>
            <button
              onClick={() => {
                setViewMode('concurrency');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'concurrency' ? 'bg-card text-foreground shadow-sm font-semibold' : 'text-muted-foreground'
              }`}
            >
              Single-Core Concurrency (1 Core)
            </button>
          </div>

          {/* Core count adjuster */}
          {viewMode === 'parallel' && (
            <div className="flex bg-secondary p-1 rounded-xl border border-border/40 text-xs">
              {[2, 4, 8].map((c) => (
                <button
                  key={c}
                  onClick={() => setConfig({ cores: c as any })}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-colors ${
                    config.cores === c ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {c}C
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Concurrency vs Parallelism Educational Banner */}
      {viewMode === 'concurrency' && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30 text-amber-500 flex items-start gap-3">
          <Layers className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs leading-relaxed">
            <strong className="font-bold">Concurrency Mode Active (Single Core):</strong>
            <p className="text-foreground">
              In single-core concurrency, multiple threads do NOT execute simultaneously on hardware. Instead, 
              the kernel performs rapid time slicing. Each switch incurs a ~3.5µs register save/restore overhead 
              plus L1 cache evictions. No true hardware speedup occurs.
            </p>
          </div>
        </Card>
      )}

      {/* Main Processor Die & Ready Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Silicon Die Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-heading font-bold text-sm text-foreground">
                  Host CPU Die: AMD EPYC / Intel Xeon (Virtual SMP Cores)
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-muted-foreground">Governor: <strong className="text-foreground">performance</strong></span>
                <span className="text-muted-foreground">Freq: <strong className="text-foreground">3.20 GHz</strong></span>
                <span className="text-muted-foreground">
                  Total Switches: <strong className="text-amber-500">{currentMetrics.totalCtxSwitches}</strong>
                </span>
              </div>
            </div>

            {/* Processor Die Cores Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {displayedCores.map((c) => {
                const assignedThread = threads.find((t) => t.threadId === c.threadId);
                return (
                  <CoreTile
                    key={c.id}
                    core={c}
                    threadColor={assignedThread?.color}
                    threadName={assignedThread?.name}
                  />
                );
              })}
            </div>

            {/* Context Switch Indicator & Cost Breakdown */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Linux Context Switch Latency: </span>
                  <span className="text-muted-foreground">
                    ~3.5µs per preemptive switch (x86_64 CR3 flush + segment/GPR save & restore)
                  </span>
                </div>
              </div>
              <div className="text-right font-mono shrink-0">
                <span className="text-muted-foreground">Overhead Penalty: </span>
                <strong className="text-amber-500">
                  {(currentMetrics.totalCtxSwitches * 0.0035).toFixed(3)} ms
                </strong>
              </div>
            </div>
          </Card>

          {/* Core Load Chart */}
          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-muted-foreground">
              Core Utilization Breakdown (%)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.utilization > 0 ? '#6366F1' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Ready Queue & Scheduler Dispatch (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  CFS Runqueue (cfs_rq)
                </h3>
              </div>
              <Badge variant="outline">{readyQueue.length} In Queue</Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Linux CFS organizes ready tasks in a time-ordered red-black tree indexed by <code>vruntime</code>.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {readyQueue.length === 0 ? (
                <div className="p-6 rounded-xl bg-secondary/30 border border-border/30 text-center text-xs text-muted-foreground italic">
                  Runqueue empty. All tasks are currently assigned to cores or sleeping.
                </div>
              ) : (
                readyQueue.map((t) => (
                  <div
                    key={t.threadId}
                    className="p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <div>
                        <div className="text-xs font-bold text-foreground">{t.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">TID: {t.tid}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      WAITING CORE
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Simulation controls */}
          <Card className="p-5 space-y-3">
            <div className="text-xs font-bold text-foreground">Core Simulation Actions</div>
            <div className="flex gap-2">
              {status === 'running' ? (
                <Button size="sm" variant="outline" onClick={pauseSimulation} className="flex-1 gap-1.5">
                  <Pause className="w-3.5 h-3.5" /> Pause
                </Button>
              ) : (
                <Button size="sm" variant="glow" onClick={status === 'paused' ? resumeSimulation : startSimulation} className="flex-1 gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-white" /> Run
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={resetSimulation}>
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
