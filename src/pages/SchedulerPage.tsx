import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ProcessItem, 
  scheduleFCFS, 
  scheduleRR, 
  schedulePriority, 
  scheduleSJF, 
  SchedulerResult 
} from '@/engine/schedulers';
import { GitBranch, Plus, Shuffle, Play, RotateCcw, Award } from 'lucide-react';

const INITIAL_PROCESSES: ProcessItem[] = [
  { id: 'p1', name: 'Task 1 (Worker)', arrivalTime: 0, burstTime: 8, priority: 3, color: '#6366F1' },
  { id: 'p2', name: 'Task 2 (Worker)', arrivalTime: 1, burstTime: 4, priority: 1, color: '#EC4899' },
  { id: 'p3', name: 'Task 3 (Worker)', arrivalTime: 2, burstTime: 9, priority: 4, color: '#10B981' },
  { id: 'p4', name: 'Task 4 (Worker)', arrivalTime: 3, burstTime: 5, priority: 2, color: '#F59E0B' },
];

export const SchedulerPage: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_PROCESSES);
  const [activePolicy, setActivePolicy] = useState<'FCFS' | 'RR' | 'Priority' | 'SJF'>('RR');
  const [quantum, setQuantum] = useState<number>(4);
  const [compareMode, setCompareMode] = useState<boolean>(false);

  // Compute Active Result
  let currentResult: SchedulerResult;
  if (activePolicy === 'FCFS') currentResult = scheduleFCFS(processes);
  else if (activePolicy === 'SJF') currentResult = scheduleSJF(processes);
  else if (activePolicy === 'Priority') currentResult = schedulePriority(processes);
  else currentResult = scheduleRR(processes, quantum);

  // Compute all 4 for comparison
  const allResults = {
    FCFS: scheduleFCFS(processes),
    SJF: scheduleSJF(processes),
    Priority: schedulePriority(processes),
    RR: scheduleRR(processes, quantum),
  };

  const handleRandomize = () => {
    const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6'];
    const randomized: ProcessItem[] = Array.from({ length: 4 }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Task ${i + 1}`,
      arrivalTime: Math.floor(Math.random() * 4),
      burstTime: Math.floor(Math.random() * 8) + 2,
      priority: Math.floor(Math.random() * 5) + 1,
      color: colors[i % colors.length],
    }));
    setProcesses(randomized);
  };

  const totalTime = currentResult.gantt.length > 0 
    ? currentResult.gantt[currentResult.gantt.length - 1].endTime 
    : 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Kernel Scheduling Theory vs Linux CFS</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Scheduler Visualization</h1>
          <p className="text-xs text-muted-foreground">
            Interactive Gantt timeline execution of textbook scheduling algorithms compared against Linux Completely Fair Scheduler (CFS).
          </p>
        </div>

        {/* Policy Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {(['FCFS', 'RR', 'Priority', 'SJF'] as const).map((policy) => (
            <button
              key={policy}
              onClick={() => setActivePolicy(policy)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activePolicy === policy
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-secondary/60 border-border/40 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {policy}
            </button>
          ))}
          <Button
            size="sm"
            variant={compareMode ? 'primary' : 'outline'}
            onClick={() => setCompareMode(!compareMode)}
            className="text-xs"
          >
            Compare All 4
          </Button>
        </div>
      </div>

      {/* Gantt Chart Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm text-foreground">
              Gantt Execution Timeline ({activePolicy} Policy)
            </h3>
            {activePolicy === 'RR' && (
              <span className="text-xs font-mono text-muted-foreground">Quantum = {quantum}ms</span>
            )}
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Total Cycle: <strong className="text-foreground">{totalTime} units</strong>
          </div>
        </div>

        {/* Visual Gantt Bar */}
        <div className="space-y-2">
          <div className="relative h-14 w-full bg-secondary/50 rounded-xl overflow-hidden flex border border-border/50">
            {currentResult.gantt.map((seg, idx) => {
              const segDuration = seg.endTime - seg.startTime;
              const widthPct = (segDuration / totalTime) * 100;
              return (
                <div
                  key={idx}
                  className="h-full flex flex-col items-center justify-center text-white border-r border-background/20 relative group transition-all hover:brightness-110"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: seg.color,
                  }}
                  title={`${seg.processName}: [${seg.startTime} - ${seg.endTime}]`}
                >
                  <span className="text-xs font-mono font-bold truncate px-1">{seg.processName}</span>
                  <span className="text-[9px] opacity-80">{segDuration}ms</span>
                </div>
              );
            })}
          </div>

          {/* Time axis marks */}
          <div className="relative h-4 w-full flex justify-between text-[10px] font-mono text-muted-foreground px-1">
            <span>0</span>
            {currentResult.gantt.map((s, i) => (
              <span key={i} style={{ left: `${(s.endTime / totalTime) * 100}%` }}>
                {s.endTime}
              </span>
            ))}
          </div>
        </div>

        {/* Round Robin Quantum Slider */}
        {activePolicy === 'RR' && (
          <div className="flex items-center gap-4 pt-2 max-w-sm">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Adjust Time Quantum:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={quantum}
              onChange={(e) => setQuantum(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <span className="text-xs font-mono font-bold text-primary">{quantum}ms</span>
          </div>
        )}
      </Card>

      {/* Metrics & Editable Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Computed Metrics (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Scheduler Performance Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/40">
                <div className="text-muted-foreground text-[10px]">Avg Waiting Time</div>
                <div className="text-base font-bold text-foreground mt-0.5">
                  {currentResult.metrics.avgWaitingTime} ms
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/40">
                <div className="text-muted-foreground text-[10px]">Avg Turnaround</div>
                <div className="text-base font-bold text-primary mt-0.5">
                  {currentResult.metrics.avgTurnaroundTime} ms
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/40">
                <div className="text-muted-foreground text-[10px]">CPU Utilization</div>
                <div className="text-base font-bold text-emerald-500 mt-0.5">
                  {currentResult.metrics.cpuUtilization}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/40">
                <div className="text-muted-foreground text-[10px]">Context Switches</div>
                <div className="text-base font-bold text-amber-500 mt-0.5">
                  {currentResult.metrics.contextSwitches}
                </div>
              </div>
            </div>

            {/* Linux CFS relationship box */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-1">How Linux CFS Compares:</strong>
              Linux does not use strict fixed quantum Round Robin. Instead, CFS assigns proportional slices 
              calculated as: <code className="text-primary font-mono">vruntime += delta_exec * (NICE_0_LOAD / se-&gt;load.weight)</code>. 
              The process with the lowest virtual runtime is dispatched next.
            </div>
          </Card>
        </div>

        {/* Editable Process Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Process Workload Table
              </h3>
              <Button size="sm" variant="outline" onClick={handleRandomize} className="gap-1.5 text-xs">
                <Shuffle className="w-3.5 h-3.5" /> Randomize
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground text-left">
                    <th className="p-2">Task</th>
                    <th className="p-2">Arrival (ms)</th>
                    <th className="p-2">Burst (ms)</th>
                    <th className="p-2">Priority (1-5)</th>
                    <th className="p-2 text-right">Waiting Time</th>
                    <th className="p-2 text-right">Turnaround</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p, idx) => (
                    <tr key={p.id} className="border-b border-border/20 hover:bg-secondary/20">
                      <td className="p-2 font-bold flex items-center gap-1.5" style={{ color: p.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={p.arrivalTime}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setProcesses(processes.map((x) => (x.id === p.id ? { ...x, arrivalTime: val } : x)));
                          }}
                          className="w-14 p-1 rounded bg-secondary border border-border text-foreground"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={p.burstTime}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setProcesses(processes.map((x) => (x.id === p.id ? { ...x, burstTime: val } : x)));
                          }}
                          className="w-14 p-1 rounded bg-secondary border border-border text-foreground"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={p.priority}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setProcesses(processes.map((x) => (x.id === p.id ? { ...x, priority: val } : x)));
                          }}
                          className="w-14 p-1 rounded bg-secondary border border-border text-foreground"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold text-foreground">
                        {currentResult.metrics.waitingTimes[p.id] ?? 0} ms
                      </td>
                      <td className="p-2 text-right font-semibold text-primary">
                        {currentResult.metrics.turnaroundTimes[p.id] ?? 0} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Side-by-side comparison mode across all 4 policies */}
      {compareMode && (
        <Card className="p-6 space-y-4 border-primary/40 bg-card glow">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading font-bold text-base text-foreground">
              Side-by-Side Policy Benchmark Ranking
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {Object.entries(allResults).map(([pol, res]) => (
              <div key={pol} className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{pol}</span>
                  {pol === 'SJF' && <Badge variant="success">Lowest Wait</Badge>}
                </div>
                <div className="text-xs font-mono space-y-1 text-muted-foreground">
                  <div>Avg Wait: <strong className="text-foreground">{res.metrics.avgWaitingTime} ms</strong></div>
                  <div>Avg Turnaround: <strong className="text-foreground">{res.metrics.avgTurnaroundTime} ms</strong></div>
                  <div>Context Switches: <strong className="text-foreground">{res.metrics.contextSwitches}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
