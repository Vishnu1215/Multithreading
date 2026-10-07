import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSimulationStore } from '@/store/simulationStore';
import { Clock, Play, Pause, RotateCcw, Filter, Search, ZoomIn, ZoomOut, Compass } from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const threads = useSimulationStore((s) => s.threads);
  const events = useSimulationStore((s) => s.events);
  const progress = useSimulationStore((s) => s.progress);
  const status = useSimulationStore((s) => s.status);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const pauseSimulation = useSimulationStore((s) => s.pauseSimulation);
  const resumeSimulation = useSimulationStore((s) => s.resumeSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  const [scrubberProgress, setScrubberProgress] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [followLive, setFollowLive] = useState<boolean>(true);
  const [eventSearch, setEventSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  const activeProgress = scrubberProgress !== null ? scrubberProgress : progress;

  const filteredEvents = events.filter((e) => {
    const matchesSearch = eventSearch === '' || 
      e.message.toLowerCase().includes(eventSearch.toLowerCase()) || 
      e.type.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesType = filterType === 'all' || e.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

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
            Horizontal swim-lane timeline mapping task assignment, clone() fork, active execution, kernel synchronization, and join barriers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status === 'running' ? (
            <Button size="sm" variant="outline" onClick={pauseSimulation} className="gap-1.5 text-xs">
              <Pause className="w-3.5 h-3.5 text-amber-500" /> Pause Trace
            </Button>
          ) : (
            <Button size="sm" variant="glow" onClick={status === 'paused' ? resumeSimulation : startSimulation} className="gap-1.5 text-xs">
              <Play className="w-3.5 h-3.5 fill-white" /> {status === 'paused' ? 'Resume' : 'Start Trace'}
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => { resetSimulation(); setScrubberProgress(null); }} className="text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          {/* Zoom & Follow live */}
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl border border-border/40 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1">{zoomLevel}x</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2, z + 0.25))}
              className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setFollowLive(!followLive);
              if (!followLive) setScrubberProgress(null);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 ${
              followLive && scrubberProgress === null
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold'
                : 'bg-card border-border text-muted-foreground'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${followLive && scrubberProgress === null ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            Live Scrubber
          </button>
        </div>
      </div>

      {/* Scrubber Navigation & Minimap Bar */}
      <Card className="p-4 space-y-3 bg-secondary/30">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-bold">Trace Scrubber:</span>
            <span className="text-foreground font-bold">{Math.round(activeProgress)}%</span>
            {scrubberProgress !== null && (
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 text-[10px] font-bold">
                MANUAL REPLAY SCRUB
              </span>
            )}
          </div>
          {scrubberProgress !== null && (
            <button
              onClick={() => setScrubberProgress(null)}
              className="text-[11px] text-primary hover:underline font-mono"
            >
              Resume live playback &rarr;
            </button>
          )}
        </div>

        {/* Interactive Scrub slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={activeProgress}
            onChange={(e) => {
              setScrubberProgress(parseInt(e.target.value, 10));
              setFollowLive(false);
            }}
            className="w-full accent-primary cursor-pointer"
          />

          {/* Minimap tick indicators */}
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
            <span>0% (Split)</span>
            <span>25% (Spawn)</span>
            <span>50% (Parallel Work)</span>
            <span>75% (Barrier)</span>
            <span>100% (Join)</span>
          </div>
        </div>
      </Card>

      {/* Swim-Lanes Visualizer Card */}
      <Card className="p-6 space-y-6 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-border/40 pb-3 min-w-[600px]">
          <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
            <span>Parallel Thread Swim-Lanes (Simulated Time Stream)</span>
            <Badge variant="outline">{threads.length + 1} Channels</Badge>
          </h3>
          <span className="text-xs font-mono text-muted-foreground">
            Current Position: <strong className="text-foreground">{Math.round(activeProgress)}%</strong>
          </span>
        </div>

        {/* Lanes container with zoom scaling */}
        <div 
          className="space-y-4 transition-all duration-200 origin-left"
          style={{ transform: `scaleX(${zoomLevel})`, minWidth: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%' }}
        >
          {/* Main Orchestrator Thread Lane */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-foreground font-bold">Main Process (PID 2840)</span>
              <span className="text-muted-foreground">Thread Orchestrator</span>
            </div>
            <div className="h-9 w-full bg-secondary/50 rounded-xl overflow-hidden relative border border-border/40 flex">
              <div
                className="h-full bg-indigo-600/70 border-r border-indigo-400 flex items-center px-2 text-[10px] text-white font-mono truncate"
                style={{ width: `${Math.min(100, Math.max(15, activeProgress * 0.2))}%` }}
              >
                Task Partitioning
              </div>
              {activeProgress > 85 && (
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
          {threads.map((t) => {
            const laneProgress = Math.min(100, Math.max(0, (activeProgress / 100) * 100));
            return (
              <div key={t.threadId} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-bold text-foreground">{t.name} (TID {t.tid})</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">Core {t.coreId} • {t.currentFunction}</span>
                </div>

                <div className="h-10 w-full bg-secondary/50 rounded-xl overflow-hidden relative border border-border/40 flex">
                  {/* Spawn block */}
                  <div
                    className="h-full bg-slate-600/50 flex items-center px-2 text-[9px] text-slate-200 font-mono truncate"
                    style={{ width: '12%' }}
                  >
                    clone()
                  </div>

                  {/* Main parallel computation */}
                  <div
                    className="h-full transition-all duration-150 flex items-center px-2 text-[10px] text-white font-mono truncate shadow-inner"
                    style={{
                      width: `${Math.min(75, Math.max(0, (laneProgress / 100) * 75))}%`,
                      backgroundColor: t.color,
                    }}
                  >
                    Compute Chunk ({Math.round(laneProgress)}%)
                  </div>

                  {/* Barrier wait */}
                  {laneProgress >= 95 && (
                    <div className="h-full bg-sky-500/70 flex items-center px-2 text-[9px] text-white font-mono flex-1">
                      Barrier Wait (futex)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Event Stream Log Table with Filter & Search */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Timestamped Lifecycle Kernel Events
            </h3>
            <Badge variant="outline">{filteredEvents.length} Events</Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search trace events..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="pl-8 pr-3 py-1 bg-secondary rounded-lg text-xs font-mono focus:outline-none border border-border/50"
              />
            </div>

            <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-lg border border-border/40 text-[11px] font-mono">
              {(['all', 'dispatch', 'sync', 'cfs'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 rounded capitalize ${
                    filterType === t ? 'bg-card text-foreground font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
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
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground italic">
                    No matching timeline events. Run a simulation or clear search filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e) => (
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
