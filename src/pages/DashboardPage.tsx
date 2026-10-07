import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Gauge } from '@/components/charts/Gauge';
import { useSimulationStore } from '@/store/simulationStore';
import { formatBytes, formatThroughput } from '@/lib/utils';
import { 
  BarChart2, 
  Play, 
  Clock, 
  Cpu, 
  Database, 
  TrendingUp, 
  Zap, 
  Shuffle,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage: React.FC = () => {
  const currentMetrics = useSimulationStore((s) => s.currentMetrics);
  const status = useSimulationStore((s) => s.status);
  const config = useSimulationStore((s) => s.config);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const history = useSimulationStore((s) => s.history);
  const selectedHistoryId = useSimulationStore((s) => s.selectedHistoryId);
  const setSelectedHistoryId = useSimulationStore((s) => s.setSelectedHistoryId);

  // Generate dynamic live streaming chart points
  const cpuStreamData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 100}ms`,
    load: Math.min(100, Math.max(10, currentMetrics.cpuUtilization + (Math.sin(i) * 8))),
    mem: Math.round(currentMetrics.memoryRssBytes / 1024 / 1024 + (i * 0.4)),
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Mission Control Performance Telemetry</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Performance Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Bento-style metrics grid, hardware arc gauges, real-time CPU & memory streaming plots, and run history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* History selector */}
          <select
            value={selectedHistoryId || ''}
            onChange={(e) => setSelectedHistoryId(e.target.value || null)}
            className="p-2 rounded-xl bg-secondary border border-border/50 text-xs font-mono text-foreground"
          >
            <option value="">Live Active Run ({config.threadCount}T / {config.cores}C)</option>
            {history.slice(0, 5).map((h) => (
              <option key={h.id} value={h.id}>
                {h.workloadName} ({h.config.threadCount}T) - {h.metrics.executionTimeMs}ms
              </option>
            ))}
          </select>

          <Button size="sm" variant="glow" onClick={startSimulation} className="gap-1.5 text-xs">
            <Play className="w-3.5 h-3.5 fill-white" /> Run Quick Demo
          </Button>
        </div>
      </div>

      {/* 4 Arc Gauges Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Gauge
          value={currentMetrics.cpuUtilization}
          title="CPU Utilization"
          unit="%"
          color={currentMetrics.cpuUtilization > 85 ? '#10B981' : '#6366F1'}
          subtitle={`Across ${config.cores} Virtual Cores`}
        />
        <Gauge
          value={currentMetrics.efficiency}
          title="Efficiency"
          unit="%"
          color={currentMetrics.efficiency > 75 ? '#10B981' : currentMetrics.efficiency > 50 ? '#F59E0B' : '#EF4444'}
          subtitle="Amdahl Retained Yield"
        />
        <Gauge
          value={currentMetrics.scalabilityScore}
          title="Scalability Score"
          unit="/100"
          color="#06B6D4"
          subtitle="Linear Scaling Adherence"
        />
        <Gauge
          value={Math.round((currentMetrics.memoryRssBytes / currentMetrics.memoryVirtualBytes) * 100)}
          title="RSS / VIRT Ratio"
          unit="%"
          color="#8B5CF6"
          subtitle="Committed Physical Pages"
        />
      </div>

      {/* Bento Grid: Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-mono">
            <span>Execution Time</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {currentMetrics.executionTimeMs} <span className="text-sm font-normal text-muted-foreground">ms</span>
          </div>
          <div className="text-[11px] text-emerald-500 font-mono">
            Baseline (1T): {currentMetrics.baselineTimeMs} ms
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-mono">
            <span>Speedup Multiplier</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500">
            {currentMetrics.speedup}× <span className="text-sm font-normal text-muted-foreground">/ {config.threadCount}× ideal</span>
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            Theoretical limit: {currentMetrics.idealSpeedup}×
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-mono">
            <span>Throughput Rate</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {formatThroughput(currentMetrics.throughput)}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            Avg Latency: {currentMetrics.latencyMs} ms
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex justify-between items-center text-muted-foreground text-xs font-mono">
            <span>Context Switches</span>
            <Shuffle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {currentMetrics.totalCtxSwitches}
          </div>
          <div className="text-[11px] text-amber-500 font-mono">
            Voluntary: {currentMetrics.voluntaryCtxSwitches} | Involuntary: {currentMetrics.involuntaryCtxSwitches}
          </div>
        </Card>
      </div>

      {/* Streaming Charts: CPU & Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Dynamic CPU Core Load History (%)
            </h3>
            <span className="text-xs font-mono text-emerald-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Telemetry
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuStreamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="load" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#cpuGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Memory Allocation (Resident Set Size MB)
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              Virtual: {formatBytes(currentMetrics.memoryVirtualBytes)}
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuStreamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="mem" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#memGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
