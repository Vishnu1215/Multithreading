import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Controls';
import { useSimulationStore } from '@/store/simulationStore';
import { Terminal as TerminalIcon, Play, RotateCcw, Cpu } from 'lucide-react';

export const MonitorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'htop' | 'perf' | 'shell'>('htop');
  const [commandInput, setCommandInput] = useState('');
  const [shellHistory, setShellHistory] = useState<string[]>([
    'Linux threadlab-node 6.6.14-generic #22-Ubuntu SMP PREEMPT_DYNAMIC x86_64',
    'Type "help" for available commands or "run --threads 4" to launch simulation.',
  ]);

  const cores = useSimulationStore((s) => s.cores);
  const threads = useSimulationStore((s) => s.threads);
  const currentMetrics = useSimulationStore((s) => s.currentMetrics);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const setConfig = useSimulationStore((s) => s.setConfig);

  const handleShellCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    const newHistory = [...shellHistory, `$ ${cmd}`];

    if (cmd === 'clear') {
      setShellHistory([]);
      setCommandInput('');
      return;
    } else if (cmd === 'help') {
      newHistory.push(
        'Available commands:',
        '  help                 - Show this help summary',
        '  clear                - Clear the terminal screen',
        '  nproc                - Print number of processing units available (4)',
        '  lscpu                - Display CPU architecture info',
        '  free -h              - Display free and used physical memory',
        '  uptime               - Show system uptime and load average',
        '  run --threads <N>    - Launch simulation with N worker threads (1, 2, 4, 8)',
        '  cat /proc/cpuinfo    - View Linux virtual cpuinfo model details'
      );
    } else if (cmd === 'nproc') {
      newHistory.push('4');
    } else if (cmd === 'uptime') {
      newHistory.push(' 22:36:12 up 14 days,  3:18,  1 user,  load average: 3.82, 2.14, 1.05');
    } else if (cmd === 'free -h') {
      newHistory.push(
        '               total        used        free      shared  buff/cache   available',
        'Mem:            15Gi       3.8Gi       8.2Gi       412Mi       3.9Gi        11Gi',
        'Swap:          4.0Gi          0B       4.0Gi'
      );
    } else if (cmd.startsWith('run')) {
      const match = cmd.match(/--threads\s+(\d+)/);
      const t = match ? parseInt(match[1]) : 4;
      if ([1, 2, 4, 8].includes(t)) {
        setConfig({ threadCount: t as any });
        startSimulation();
        newHistory.push(`[OK] Launched simulation with ${t} worker threads on CFS scheduler.`);
      } else {
        newHistory.push(`[ERR] Invalid thread count. Choose 1, 2, 4, or 8.`);
      }
    } else {
      newHistory.push(`bash: ${cmd}: command not found`);
    }

    setShellHistory(newHistory);
    setCommandInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Interactive Linux Telemetry Terminal</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Linux Monitor (CLI)</h1>
          <p className="text-xs text-muted-foreground">
            Faithfully recreated htop CPU meters, Linux perf stat hardware counters, and interactive bash shell.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          items={[
            { id: 'htop', label: '1. htop Monitor' },
            { id: 'perf', label: '2. perf stat Counters' },
            { id: 'shell', label: '3. Interactive Bash Shell' },
          ]}
        />
      </div>

      {/* Terminal Window Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs shadow-2xl overflow-hidden flex flex-col">
        {/* macOS / Linux style Window Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400 font-mono ml-2">root@threadlab-node:~#</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono uppercase">Linux Kernel 6.6.14</span>
        </div>

        {/* Tab 1: htop UI */}
        {activeTab === 'htop' && (
          <div className="p-5 space-y-5">
            {/* CPU Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {cores.map((c) => {
                const barWidth = Math.round(c.utilization / 4); // max 25 chars
                const barStr = '|'.repeat(barWidth) + ' '.repeat(25 - barWidth);
                return (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">{c.id}</span>
                    <span className="text-slate-500">[</span>
                    <span className="text-emerald-400 font-bold">{barStr}</span>
                    <span className="text-slate-500">]</span>
                    <span className="text-slate-300 font-bold">{c.utilization}%</span>
                  </div>
                );
              })}
            </div>

            {/* Task list header */}
            <div className="border-t border-slate-800 pt-3">
              <div className="text-[11px] text-slate-400 flex justify-between pb-1">
                <span>Tasks: {threads.length + 1} total, {threads.filter(t => t.state === 'Running').length} running</span>
                <span>Load average: 3.82 2.14 1.05</span>
                <span>Uptime: 14 days, 03:18:22</span>
              </div>

              {/* Process Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-cyan-950 text-cyan-400">
                      <th className="p-1.5">PID</th>
                      <th className="p-1.5">USER</th>
                      <th className="p-1.5">PRI</th>
                      <th className="p-1.5">NI</th>
                      <th className="p-1.5">VIRT</th>
                      <th className="p-1.5">RES</th>
                      <th className="p-1.5">S</th>
                      <th className="p-1.5">CPU%</th>
                      <th className="p-1.5">MEM%</th>
                      <th className="p-1.5">COMMAND</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-slate-900 border-b border-slate-900">
                      <td className="p-1.5 text-slate-300">2840</td>
                      <td className="p-1.5 text-slate-400">root</td>
                      <td className="p-1.5">20</td>
                      <td className="p-1.5">0</td>
                      <td className="p-1.5">85M</td>
                      <td className="p-1.5">42M</td>
                      <td className="p-1.5 text-emerald-400">S</td>
                      <td className="p-1.5 font-bold">12.5</td>
                      <td className="p-1.5">0.3</td>
                      <td className="p-1.5 text-indigo-400">./threadlab_engine (main)</td>
                    </tr>
                    {threads.map((t) => (
                      <tr key={t.threadId} className="hover:bg-slate-900 border-b border-slate-900">
                        <td className="p-1.5 text-slate-300">{t.tid}</td>
                        <td className="p-1.5 text-slate-400">root</td>
                        <td className="p-1.5">20</td>
                        <td className="p-1.5">0</td>
                        <td className="p-1.5">85M</td>
                        <td className="p-1.5">8M</td>
                        <td className="p-1.5 text-emerald-400">
                          {t.state === 'Running' ? 'R' : t.state === 'Waiting' ? 'D' : 'S'}
                        </td>
                        <td className="p-1.5 font-bold text-emerald-400">
                          {t.state === 'Running' ? '96.2' : '0.0'}
                        </td>
                        <td className="p-1.5">0.1</td>
                        <td className="p-1.5 text-slate-300">
                          \_ {t.name} (worker)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Linux perf stat */}
        {activeTab === 'perf' && (
          <div className="p-6 space-y-4">
            <div className="text-emerald-400 font-bold">
              $ perf stat -e task-clock,context-switches,cpu-migrations,cycles,instructions ./threadlab_run
            </div>

            <pre className="text-slate-300 leading-relaxed text-xs">
{` Performance counter stats for process PID 2840 (threads: ${threads.length}):

      ${(currentMetrics.executionTimeMs * 3.8).toFixed(0)} msec task-clock                       #    3.784 CPUs utilized          
          ${currentMetrics.totalCtxSwitches}      context-switches                 #    0.082 K/sec                  
              18      cpu-migrations                   #    0.012 K/sec                  
           1,420      page-faults                      #    0.950 K/sec                  
   ${(currentMetrics.executionTimeMs * 3200000).toLocaleString()}      cycles                           #    3.200 GHz                    
   ${(currentMetrics.executionTimeMs * 4800000).toLocaleString()}      instructions                     #    1.50  insn per cycle         

       ${(currentMetrics.executionTimeMs / 1000).toFixed(4)} seconds time elapsed`}
            </pre>
          </div>
        )}

        {/* Tab 3: Interactive Bash Shell */}
        {activeTab === 'shell' && (
          <div className="p-5 flex flex-col justify-between min-h-[340px]">
            <div className="space-y-1.5 overflow-y-auto max-h-72">
              {shellHistory.map((line, idx) => (
                <div key={idx} className={line.startsWith('$') ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                  {line}
                </div>
              ))}
            </div>

            <form onSubmit={handleShellCommand} className="flex items-center gap-2 pt-4 border-t border-slate-800">
              <span className="text-emerald-400 font-bold">root@threadlab:~#</span>
              <input
                type="text"
                autoFocus
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Type command (e.g., help, run --threads 4)..."
                className="w-full bg-transparent text-slate-100 focus:outline-none font-mono"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
