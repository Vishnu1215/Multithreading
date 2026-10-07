import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, Progress } from '@/components/ui/Badge';
import { Slider, Switch } from '@/components/ui/Controls';
import { useSimulationStore } from '@/store/simulationStore';
import { WORKLOAD_PROFILES } from '@/engine/perfModel';
import { WorkloadType, SchedulerPolicy, SyncMode } from '@/types/simulation';

export const SimulatorPage: React.FC = () => {
  const config = useSimulationStore((s) => s.config);
  const setConfig = useSimulationStore((s) => s.setConfig);
  const status = useSimulationStore((s) => s.status);
  const progress = useSimulationStore((s) => s.progress);
  const threads = useSimulationStore((s) => s.threads);
  const currentPhase = useSimulationStore((s) => s.currentPhase);
  const explanationText = useSimulationStore((s) => s.explanationText);
  const explanationMode = useSimulationStore((s) => s.explanationMode);
  const setExplanationMode = useSimulationStore((s) => s.setExplanationMode);
  const currentMetrics = useSimulationStore((s) => s.currentMetrics);
  const events = useSimulationStore((s) => s.events);

  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const pauseSimulation = useSimulationStore((s) => s.pauseSimulation);
  const resumeSimulation = useSimulationStore((s) => s.resumeSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const stepSimulation = useSimulationStore((s) => s.stepSimulation);

  // Presets
  const applyPreset = (preset: 'best' | 'oversubscribed' | 'io') => {
    if (preset === 'best') {
      setConfig({ threadCount: 4, cores: 4, workload: 'matrix', syncMode: 'Mutex', problemSize: 'Medium' });
    } else if (preset === 'oversubscribed') {
      setConfig({ threadCount: 8, cores: 2, workload: 'prime', syncMode: 'Mutex', problemSize: 'Medium' });
    } else {
      setConfig({ threadCount: 4, cores: 4, workload: 'file', syncMode: 'None', problemSize: 'Medium' });
    }
  };

  const phases = [
    { num: 1, label: 'Task Splitting' },
    { num: 2, label: 'Thread Creation' },
    { num: 3, label: 'Parallel Execution' },
    { num: 4, label: 'Barrier / Sync' },
    { num: 5, label: 'Merge & Cleanup' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Core Interactive Engine</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Interactive Simulator</h1>
          <p className="text-xs text-muted-foreground">
            Configure Linux thread counts, workload types, scheduling policies, and run the deterministic performance engine.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Presets:</span>
          <Button size="sm" variant="outline" onClick={() => applyPreset('best')}>
            Optimal (4T / 4C)
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyPreset('oversubscribed')}>
            Oversubscribed (8T / 2C)
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyPreset('io')}>
            I/O Heavy
          </Button>
        </div>
      </div>

      {/* 5-Phase Pipeline Stepper */}
      <Card className="p-4 bg-secondary/30">
        <div className="grid grid-cols-5 gap-2">
          {phases.map((p) => {
            const isActive = currentPhase === p.num;
            const isCompleted = currentPhase > p.num || status === 'completed';
            return (
              <div
                key={p.num}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 font-semibold'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-card/40 border-border/30 text-muted-foreground'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">Phase 0{p.num}</div>
                <div className="text-xs font-medium truncate mt-0.5">{p.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT CONFIGURATION PANEL (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-5">
            <h3 className="font-heading font-semibold text-sm text-foreground flex items-center justify-between">
              <span>Simulation Controls</span>
              <Badge variant="outline">{config.threadCount} Threads / {config.cores} Cores</Badge>
            </h3>

            {/* Thread Count Segmented Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Worker Threads (n)</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 8].map((count) => (
                  <button
                    key={count}
                    onClick={() => setConfig({ threadCount: count as any })}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      config.threadCount === count
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-secondary/60 text-muted-foreground border-border/40 hover:bg-secondary'
                    }`}
                  >
                    {count}T
                  </button>
                ))}
              </div>
            </div>

            {/* Workload Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Workload Character</label>
              <div className="grid grid-cols-2 gap-2">
                {(['matrix', 'prime', 'file', 'image'] as WorkloadType[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setConfig({ workload: w })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      config.workload === w
                        ? 'bg-primary/10 border-primary text-foreground font-semibold'
                        : 'bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="text-xs capitalize font-medium">{WORKLOAD_PROFILES[w].name.split(' ')[0]}</div>
                    <div className="text-[10px] text-muted-foreground">{WORKLOAD_PROFILES[w].category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Cores & Problem Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Virtual Cores</label>
                <div className="flex rounded-xl bg-secondary p-1 border border-border/40">
                  {[2, 4, 8].map((c) => (
                    <button
                      key={c}
                      onClick={() => setConfig({ cores: c as any })}
                      className={`flex-1 py-1 text-xs font-mono rounded-lg ${
                        config.cores === c ? 'bg-card font-bold text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      {c}C
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Problem Size</label>
                <div className="flex rounded-xl bg-secondary p-1 border border-border/40">
                  {['Small', 'Medium', 'Large'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setConfig({ problemSize: s as any })}
                      className={`flex-1 py-1 text-xs rounded-lg ${
                        config.problemSize === s ? 'bg-card font-bold text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      {s[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sync Mode */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Synchronization Mode</span>
                {config.syncMode === 'None' && (
                  <span className="text-rose-500 text-[10px] font-mono">Race Condition!</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['None', 'Mutex', 'Semaphore'] as SyncMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setConfig({ syncMode: mode })}
                    className={`py-1.5 text-xs rounded-xl border transition-all ${
                      config.syncMode === mode
                        ? mode === 'None'
                          ? 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold'
                          : 'bg-primary/10 border-primary text-foreground font-bold'
                        : 'bg-secondary/40 border-border/40 text-muted-foreground'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Simulation Speed</span>
                <span className="font-mono">{config.speed}x</span>
              </div>
              <div className="flex gap-2">
                {[0.25, 0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setConfig({ speed: spd })}
                    className={`flex-1 py-1 text-xs font-mono rounded-lg border ${
                      config.speed === spd ? 'bg-primary text-white border-primary' : 'bg-secondary border-border/30 text-muted-foreground'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Master Action Buttons */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {status === 'running' ? (
                  <Button variant="outline" onClick={pauseSimulation} className="w-full gap-2">
                    <Pause className="w-4 h-4 text-amber-500" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="glow" onClick={status === 'paused' ? resumeSimulation : startSimulation} className="w-full gap-2">
                    <Play className="w-4 h-4 fill-white" />
                    {status === 'paused' ? 'Resume' : 'Run Simulation'}
                  </Button>
                )}
                <Button variant="secondary" onClick={resetSimulation} className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={stepSimulation} className="w-full text-xs gap-1.5 text-muted-foreground">
                <FastForward className="w-3.5 h-3.5" />
                Step Forward (150ms)
              </Button>
            </div>
          </Card>
        </div>

        {/* RIGHT EXECUTION & PROGRESS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Explanation Banner */}
          <Card className="p-5 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-primary">
                  Phase {currentPhase} Explanation
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Mode:</span>
                <button
                  onClick={() => setExplanationMode(explanationMode === 'beginner' ? 'expert' : 'beginner')}
                  className="px-2 py-0.5 rounded-lg bg-secondary text-foreground font-mono text-[11px] border border-border"
                >
                  {explanationMode === 'beginner' ? 'Beginner (Intuitive)' : 'Expert (Kernel / Syscalls)'}
                </button>
              </div>
            </div>
            <p className="text-xs text-foreground leading-relaxed">{explanationText}</p>
          </Card>

          {/* Active Thread Progress Lanes */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                Thread Execution Lanes ({threads.length} Active Workers)
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Progress: <strong className="text-foreground">{Math.round(progress)}%</strong>
              </span>
            </div>

            <div className="space-y-3">
              {threads.map((t) => (
                <div key={t.threadId} className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="font-mono font-bold" style={{ color: t.color }}>
                        {t.name} (TID {t.tid})
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        Core {t.coreId} • {t.currentFunction}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        t.state === 'Running' ? 'bg-emerald-500/15 text-emerald-500' :
                        t.state === 'Waiting' ? 'bg-sky-500/15 text-sky-500' :
                        t.state === 'Terminated' ? 'bg-slate-500/15 text-slate-400' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {t.linuxState}
                      </span>
                      <span className="text-foreground font-bold">{t.progress}%</span>
                    </div>
                  </div>

                  <Progress value={t.progress} color={`bg-[${t.color}]`} />
                </div>
              ))}
            </div>
          </Card>

          {/* Completion Summary Card (If completed) */}
          {status === 'completed' && (
            <Card className="p-6 border-emerald-500/30 bg-emerald-500/5 glow space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-heading font-bold text-base text-foreground">Run Completed Successfully!</h3>
                </div>
                <Link to="/compare">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    Compare Across Threads <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-card border border-border/40">
                  <div className="text-muted-foreground text-[10px]">Execution Time</div>
                  <div className="text-base font-bold text-foreground mt-0.5">{currentMetrics.executionTimeMs} ms</div>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/40">
                  <div className="text-muted-foreground text-[10px]">Speedup vs 1T</div>
                  <div className="text-base font-bold text-emerald-500 mt-0.5">{currentMetrics.speedup}×</div>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/40">
                  <div className="text-muted-foreground text-[10px]">Parallel Efficiency</div>
                  <div className="text-base font-bold text-primary mt-0.5">{currentMetrics.efficiency}%</div>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/40">
                  <div className="text-muted-foreground text-[10px]">Context Switches</div>
                  <div className="text-base font-bold text-foreground mt-0.5">{currentMetrics.totalCtxSwitches}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Mini Real-time Syslog Stream */}
          <Card className="p-4 bg-slate-950 text-slate-300 font-mono text-xs space-y-2 border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="uppercase tracking-wider font-bold">Linux Kernel Ring Buffer (dmesg)</span>
              <span>Events: {events.length}</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {events.length === 0 ? (
                <div className="text-slate-600 italic">No events emitted yet. Press Run to begin.</div>
              ) : (
                events.slice(-6).map((e) => (
                  <div key={e.id} className="text-[11px] flex gap-2">
                    <span className="text-slate-500">[{e.timestamp.toFixed(2)}ms]</span>
                    <span className="text-indigo-400 font-bold">[T{e.threadId}]</span>
                    <span className={e.level === 'warn' ? 'text-amber-400' : e.level === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                      {e.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
