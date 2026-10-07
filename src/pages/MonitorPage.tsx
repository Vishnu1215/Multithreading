import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Controls';
import { useSimulationStore } from '@/store/simulationStore';
import { Terminal as TerminalIcon, Search, ListFilter, Activity, Play, RotateCcw } from 'lucide-react';

const HOT_FUNCTIONS = [
  { overhead: '42.8%', symbol: 'compute_matrix_block', sharedObj: 'threadlab_engine', dso: '[.]' },
  { overhead: '18.4%', symbol: '__pthread_mutex_lock', sharedObj: 'libc.so.6', dso: '[k]' },
  { overhead: '14.2%', symbol: 'futex_wait_queue_me', sharedObj: '[kernel.kallsyms]', dso: '[k]' },
  { overhead: '9.6%', symbol: '__kthread_worker_fn', sharedObj: '[kernel.kallsyms]', dso: '[k]' },
  { overhead: '6.1%', symbol: 'finish_task_switch', sharedObj: '[kernel.kallsyms]', dso: '[k]' },
  { overhead: '4.5%', symbol: 'native_queued_spin_lock_slowpath', sharedObj: '[kernel.kallsyms]', dso: '[k]' },
  { overhead: '2.4%', symbol: 'syscall_enter_from_user_mode', sharedObj: '[kernel.kallsyms]', dso: '[k]' },
  { overhead: '2.0%', symbol: 'do_futex', sharedObj: '[kernel.kallsyms]', dso: '[k]' },
];

export const MonitorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'htop' | 'top' | 'perf' | 'dmesg' | 'shell'>('htop');
  const [commandInput, setCommandInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [executedCommands, setExecutedCommands] = useState<string[]>([]);
  const [dmesgSearch, setDmesgSearch] = useState('');
  const [dmesgLevelFilter, setDmesgLevelFilter] = useState<'all' | 'info' | 'warn' | 'success'>('all');

  const [shellHistory, setShellHistory] = useState<string[]>([
    'Linux threadlab-node 6.6.14-generic #22-Ubuntu SMP PREEMPT_DYNAMIC x86_64',
    'ThreadLab Linux interactive terminal environment initialized.',
    'Type "help" to inspect supported Linux diagnostic utilities or "run --threads 4" to launch.',
  ]);

  const cores = useSimulationStore((s) => s.cores);
  const threads = useSimulationStore((s) => s.threads);
  const config = useSimulationStore((s) => s.config);
  const currentMetrics = useSimulationStore((s) => s.currentMetrics);
  const events = useSimulationStore((s) => s.events);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const setConfig = useSimulationStore((s) => s.setConfig);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [shellHistory]);

  const handleShellCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    setExecutedCommands((prev) => [...prev, cmd]);
    setHistoryIndex(null);

    const newHistory = [...shellHistory, `$ ${cmd}`];
    const lowerCmd = cmd.toLowerCase();

    if (cmd === 'clear') {
      setShellHistory([]);
      setCommandInput('');
      return;
    } else if (lowerCmd === 'help') {
      newHistory.push(
        'Available Linux telemetric utilities & builtins:',
        '  help                       - Show this command reference table',
        '  clear                      - Flush screen buffer',
        '  nproc                      - Print active CPU core count',
        '  lscpu                      - Detailed CPU architecture, cache hierarchy & flags',
        '  free -h                    - Memory pool allocation (RAM & swap)',
        '  uptime                     - System uptime, user sessions, and 1/5/15m load averages',
        '  top                        - Instantaneous Linux task manager snapshot',
        '  htop                       - Switch to full ANSI-colored htop visualizer',
        '  ps -eLf                    - Display all active lightweight processes (LWP/threads)',
        '  perf stat                  - Print Linux hardware performance counters (cycles, insn, ctx switches)',
        '  cat /proc/cpuinfo          - Inspect CPU model name, stepping, MHz, cache & microcode',
        '  cat /proc/self/status      - View current task voluntary/nonvoluntary context switches & threads',
        '  cat /proc/2840/status      - View PID 2840 thread group task status',
        '  dmesg                      - Dump kernel ring buffer log events',
        '  compare                    - View comparative thread scalability metrics',
        '  export                     - Trigger system report generation',
        '  run [--threads N] [--workload W] - Launch simulation (threads: 1, 2, 4, 8; workload: matrix, prime, file, image)'
      );
    } else if (lowerCmd === 'nproc') {
      newHistory.push(`${config.cores}`);
    } else if (lowerCmd === 'uptime') {
      newHistory.push(' 22:36:12 up 14 days,  3:18,  1 user,  load average: 3.82, 2.14, 1.05');
    } else if (lowerCmd === 'free -h') {
      newHistory.push(
        '               total        used        free      shared  buff/cache   available',
        'Mem:            15Gi       3.8Gi       8.2Gi       412Mi       3.9Gi        11Gi',
        'Swap:          4.0Gi          0B       4.0Gi'
      );
    } else if (lowerCmd === 'lscpu') {
      newHistory.push(
        'Architecture:                    x86_64',
        'CPU op-mode(s):                  32-bit, 64-bit',
        'Address sizes:                   48 bits physical, 48 bits virtual',
        'Byte Order:                      Little Endian',
        `CPU(s):                          ${config.cores}`,
        'On-line CPU(s) list:             0-' + (config.cores - 1),
        'Vendor ID:                       AuthenticAMD',
        'Model name:                      AMD EPYC 7763 64-Core Processor',
        'CPU family:                      25',
        'Model:                           1',
        'Thread(s) per core:              1',
        'Core(s) per socket:              ' + config.cores,
        'Socket(s):                       1',
        'Stepping:                        1',
        'BogoMIPS:                        4890.86',
        'Flags:                           fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx mmxext fxsr_opt pdpe1gb rdtscp lm constant_tsc rep_good nopl nonstop_tsc cpuid extd_apicid aperfmperf pni pclmulqdq monitor ssse3 fma cx16 sse4_1 sse4_2 movbe popcnt aes xsave avx f16c rdrand hypervisor lahf_lm cmp_legacy svm cr8_legacy abm sse4a misalignsse 3dnowprefetch osvw topoext perfctr_core invpcid avx2 vaes vpclmulqdq rdpid fsgsbase bmi1 avx2 smep bmi2 erms invpcid rdseed adx smap clflushopt clwb sha_ni xsaveopt xsavec xgetbv1 xsaves clzero xsaveerptr arat umip vaes vpclmulqdq rdpid',
        'Virtualization features:         AMD-V',
        'L1d cache:                       128 KiB (' + config.cores + ' instances)',
        'L1i cache:                       128 KiB (' + config.cores + ' instances)',
        'L2 cache:                        2 MiB (' + config.cores + ' instances)',
        'L3 cache:                        32 MiB (1 instance)'
      );
    } else if (lowerCmd === 'cat /proc/cpuinfo') {
      newHistory.push(
        'processor       : 0',
        'vendor_id       : AuthenticAMD',
        'cpu family      : 25',
        'model           : 1',
        'model name      : AMD EPYC 7763 64-Core Processor',
        'stepping        : 1',
        'microcode       : 0x0a0011cf',
        'cpu MHz         : 3241.850',
        'cache size      : 32768 KB',
        'physical id     : 0',
        'siblings        : ' + config.cores,
        'core id         : 0',
        'cpu cores       : ' + config.cores,
        'apicid          : 0',
        'initial apicid  : 0',
        'fpu             : yes',
        'fpu_exception   : yes',
        'cpuid level     : 16',
        'wp              : yes',
        'bogomips        : 4890.86',
        'clflush size    : 64',
        'cache_alignment : 64',
        'address sizes   : 48 bits physical, 48 bits virtual'
      );
    } else if (lowerCmd.startsWith('cat /proc/') && lowerCmd.endsWith('/status')) {
      newHistory.push(
        'Name:   threadlab_engine',
        'Umask:  0022',
        'State:  S (sleeping)',
        'Tgid:   2840',
        'Ngid:   0',
        'Pid:    2840',
        'PPid:   1420',
        'TracerPid:      0',
        'Uid:    1000    1000    1000    1000',
        'Gid:    1000    1000    1000    1000',
        'FDSize: 64',
        'Groups: 4 24 27 30 46 122 1000',
        'NStgid: 2840',
        'NSpid:  2840',
        'NSpgid: 2840',
        'NSsid:  2840',
        'VmPeak:    85240 kB',
        'VmSize:    84980 kB',
        'VmLck:         0 kB',
        'VmPin:         0 kB',
        'VmHWM:     42890 kB',
        'VmRSS:     42100 kB',
        'RssAnon:   38910 kB',
        'RssFile:    3190 kB',
        'RssShmem:      0 kB',
        `Threads:        ${threads.length + 1}`,
        'SigQ:   0/63012',
        'SigPnd: 0000000000000000',
        'ShdPnd: 0000000000000000',
        'SigBlk: 0000000000000000',
        'SigIgn: 0000000000001000',
        'SigCgt: 0000000180010002',
        'CapInh: 0000000000000000',
        'CapPrm: 0000000000000000',
        'CapEff: 0000000000000000',
        'CapBnd: 000001ffffffffff',
        'CapAmb: 0000000000000000',
        'NoNewPrivs:     0',
        'Seccomp:        0',
        'voluntary_ctxt_switches:    ' + (currentMetrics.totalCtxSwitches * 3),
        'nonvoluntary_ctxt_switches: ' + Math.max(12, currentMetrics.totalCtxSwitches)
      );
    } else if (lowerCmd === 'ps -elf' || lowerCmd === 'ps -elf') {
      newHistory.push(
        'UID          PID    PPID     LWP  C NLWP STIME TTY          TIME CMD',
        'root        2840    1420    2840  1    ' + (threads.length + 1) + ' 22:30 pts/1    00:00:02 ./threadlab_engine'
      );
      threads.forEach((t) => {
        newHistory.push(
          `root        2840    1420    ${t.tid}  9    ${threads.length + 1} 22:30 pts/1    00:00:01  \\_ [${t.name}]`
        );
      });
    } else if (lowerCmd === 'top') {
      newHistory.push(
        `top - 22:36:12 up 14 days,  3:18,  1 user,  load average: 3.82, 2.14, 1.05`,
        `Tasks: ${threads.length + 1} total, ${threads.filter(t => t.state === 'Running').length} running, ${threads.filter(t => t.state === 'Waiting').length + 1} sleeping`,
        `%Cpu(s): 88.4 us,  7.2 sy,  0.0 ni,  3.8 id,  0.2 wa,  0.0 hi,  0.4 si,  0.0 st`,
        `MiB Mem :  15872.4 total,   8214.2 free,   3824.1 used,   3834.1 buff/cache`,
        `MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  11280.4 avail Mem`,
        '',
        '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
        `   2840 root      20   0   85240  42100   8420 S  12.5   0.3   0:02.14 threadlab_engine`,
        ...threads.map(t => 
          `   ${t.tid} root      20   0   85240   8192   8420 ${t.state === 'Running' ? 'R' : 'S'}  ${t.state === 'Running' ? '96.4' : '0.0'}   0.1   0:01.42  \\_ ${t.name}`
        )
      );
    } else if (lowerCmd === 'htop') {
      setActiveTab('htop');
      newHistory.push('Switched to interactive htop view tab.');
    } else if (lowerCmd === 'perf stat') {
      newHistory.push(
        ' Performance counter stats for process PID 2840 (threads: ' + threads.length + '):',
        '',
        `      ${(currentMetrics.executionTimeMs * 3.8).toFixed(0)} msec task-clock                       #    3.784 CPUs utilized`,
        `          ${currentMetrics.totalCtxSwitches}      context-switches                 #    0.082 K/sec`,
        `              18      cpu-migrations                   #    0.012 K/sec`,
        `           1,420      page-faults                      #    0.950 K/sec`,
        `   ${(currentMetrics.executionTimeMs * 3200000).toLocaleString()}      cycles                           #    3.200 GHz`,
        `   ${(currentMetrics.executionTimeMs * 4800000).toLocaleString()}      instructions                     #    1.50  insn per cycle`,
        '',
        `       ${(currentMetrics.executionTimeMs / 1000).toFixed(4)} seconds time elapsed`
      );
    } else if (lowerCmd === 'dmesg') {
      newHistory.push(
        ...events.slice(-15).map(e => `[${e.timestamp.toFixed(4)}] kernel: [TID ${e.tid}] ${e.message}`)
      );
    } else if (lowerCmd === 'compare') {
      newHistory.push(
        `Comparative Telemetry Summary:`,
        `  Execution Time:    ${currentMetrics.executionTimeMs} ms`,
        `  Speedup Factor:    ${currentMetrics.speedup}x vs single-thread baseline`,
        `  Parallel Efficiency: ${currentMetrics.efficiency}%`,
        `  Context Switches:  ${currentMetrics.totalCtxSwitches}`
      );
    } else if (lowerCmd === 'export') {
      newHistory.push('[INFO] Report dataset compiled. Navigate to /report for full PDF/CSV export.');
    } else if (lowerCmd.startsWith('run')) {
      let tCount = config.threadCount;
      let wType = config.workload;

      const tMatch = cmd.match(/--threads\s+(\d+)/i);
      if (tMatch) {
        const val = parseInt(tMatch[1], 10);
        if ([1, 2, 4, 8].includes(val)) {
          tCount = val as any;
        } else {
          newHistory.push(`[WARN] Thread count ${val} invalid; defaulting to ${tCount}. Valid values: 1, 2, 4, 8.`);
        }
      }

      const wMatch = cmd.match(/--workload\s+([a-zA-Z]+)/i);
      if (wMatch) {
        const wStr = wMatch[1].toLowerCase();
        if (['matrix', 'prime', 'file', 'image'].includes(wStr)) {
          wType = wStr as any;
        } else {
          newHistory.push(`[WARN] Workload ${wStr} invalid; defaulting to ${wType}. Valid values: matrix, prime, file, image.`);
        }
      }

      setConfig({ threadCount: tCount, workload: wType });
      startSimulation();
      newHistory.push(`[OK] Simulation started: ${tCount} threads, workload=${wType}, cores=${config.cores}.`);
    } else {
      newHistory.push(`bash: ${cmd}: command not found. Type "help" for a list of valid commands.`);
    }

    setShellHistory(newHistory);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (executedCommands.length === 0) return;
      const nextIdx = historyIndex === null ? executedCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCommandInput(executedCommands[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (executedCommands.length === 0 || historyIndex === null) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= executedCommands.length) {
        setHistoryIndex(null);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIdx);
        setCommandInput(executedCommands[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = commandInput.trim();
      const candidates = [
        'help', 'clear', 'nproc', 'lscpu', 'free -h', 'uptime', 'top', 'htop', 
        'ps -eLf', 'perf stat', 'cat /proc/cpuinfo', 'cat /proc/self/status', 
        'dmesg', 'compare', 'export', 'run --threads '
      ];
      const match = candidates.find(c => c.startsWith(current));
      if (match) {
        setCommandInput(match);
      }
    }
  };

  const filteredDmesg = events.filter((e) => {
    const matchesSearch = dmesgSearch === '' || 
      e.message.toLowerCase().includes(dmesgSearch.toLowerCase()) || 
      e.type.toLowerCase().includes(dmesgSearch.toLowerCase());
    const matchesLevel = dmesgLevelFilter === 'all' || e.level === dmesgLevelFilter;
    return matchesSearch && matchesLevel;
  });

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
            Faithfully recreated htop CPU meters, top task manager, Linux perf stat hardware counters, dmesg ring buffer, and interactive bash shell.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          items={[
            { id: 'htop', label: '1. htop' },
            { id: 'top', label: '2. top' },
            { id: 'perf', label: '3. perf stat & top' },
            { id: 'dmesg', label: '4. dmesg logs' },
            { id: 'shell', label: '5. Bash Shell' },
          ]}
        />
      </div>

      {/* Terminal Window Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs shadow-2xl overflow-hidden flex flex-col min-h-[460px]">
        {/* macOS / Linux style Window Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400 font-mono ml-2">root@threadlab-node:~# {activeTab}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>PID: 2840</span>
            <span className="uppercase text-slate-500">Kernel 6.6.14</span>
          </div>
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
                  <div key={c.id} className="flex items-center gap-2 font-mono">
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
              <div className="text-[11px] text-slate-400 flex flex-wrap justify-between pb-1 gap-2">
                <span>Tasks: {threads.length + 1} total, {threads.filter(t => t.state === 'Running').length} running</span>
                <span>Load average: 3.82 2.14 1.05</span>
                <span>Uptime: 14 days, 03:18:22</span>
              </div>

              {/* Process Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left font-mono">
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

        {/* Tab 2: Classic Linux top */}
        {activeTab === 'top' && (
          <div className="p-5 space-y-4 font-mono text-xs">
            <div className="text-slate-300 leading-relaxed border-b border-slate-800 pb-3">
              <div>top - 22:36:12 up 14 days,  3:18,  1 user,  load average: 3.82, 2.14, 1.05</div>
              <div>Tasks: {threads.length + 1} total, {threads.filter(t => t.state === 'Running').length} running, {threads.filter(t => t.state === 'Waiting').length + 1} sleeping, 0 stopped, 0 zombie</div>
              <div>%Cpu(s): 88.4 us,  7.2 sy,  0.0 ni,  3.8 id,  0.2 wa,  0.0 hi,  0.4 si,  0.0 st</div>
              <div>MiB Mem :  15872.4 total,   8214.2 free,   3824.1 used,   3834.1 buff/cache</div>
              <div>MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.  11280.4 avail Mem</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-slate-900 text-slate-300">
                    <th className="p-1.5">PID</th>
                    <th className="p-1.5">USER</th>
                    <th className="p-1.5">PR</th>
                    <th className="p-1.5">NI</th>
                    <th className="p-1.5">VIRT</th>
                    <th className="p-1.5">RES</th>
                    <th className="p-1.5">SHR</th>
                    <th className="p-1.5">S</th>
                    <th className="p-1.5">%CPU</th>
                    <th className="p-1.5">%MEM</th>
                    <th className="p-1.5">TIME+</th>
                    <th className="p-1.5">COMMAND</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-slate-900 border-b border-slate-900">
                    <td className="p-1.5 text-slate-200">2840</td>
                    <td className="p-1.5 text-slate-400">root</td>
                    <td className="p-1.5">20</td>
                    <td className="p-1.5">0</td>
                    <td className="p-1.5">85240</td>
                    <td className="p-1.5">42100</td>
                    <td className="p-1.5">8420</td>
                    <td className="p-1.5 text-emerald-400">S</td>
                    <td className="p-1.5 font-bold text-amber-400">12.5</td>
                    <td className="p-1.5">0.3</td>
                    <td className="p-1.5">0:02.14</td>
                    <td className="p-1.5 text-indigo-400">threadlab_engine</td>
                  </tr>
                  {threads.map((t) => (
                    <tr key={t.threadId} className="hover:bg-slate-900 border-b border-slate-900">
                      <td className="p-1.5 text-slate-200">{t.tid}</td>
                      <td className="p-1.5 text-slate-400">root</td>
                      <td className="p-1.5">20</td>
                      <td className="p-1.5">0</td>
                      <td className="p-1.5">85240</td>
                      <td className="p-1.5">8192</td>
                      <td className="p-1.5">8420</td>
                      <td className="p-1.5 text-emerald-400">{t.state === 'Running' ? 'R' : 'S'}</td>
                      <td className="p-1.5 font-bold text-emerald-400">{t.state === 'Running' ? '96.4' : '0.0'}</td>
                      <td className="p-1.5">0.1</td>
                      <td className="p-1.5">0:01.42</td>
                      <td className="p-1.5 text-slate-300">\_ {t.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Linux perf stat & perf top */}
        {activeTab === 'perf' && (
          <div className="p-6 space-y-6">
            <div>
              <div className="text-emerald-400 font-bold mb-2">
                $ perf stat -e task-clock,context-switches,cpu-migrations,cycles,instructions ./threadlab_run
              </div>
              <pre className="text-slate-300 leading-relaxed text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
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

            {/* perf top hot symbols */}
            <div className="space-y-3">
              <div className="text-cyan-400 font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>$ perf top -p 2840 --sort overhead,symbol (Kernel Hotspot Profiler)</span>
              </div>
              <div className="overflow-x-auto border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-2">Overhead</th>
                      <th className="p-2">Shared Object</th>
                      <th className="p-2">DSO</th>
                      <th className="p-2">Symbol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HOT_FUNCTIONS.map((fn, idx) => (
                      <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/50">
                        <td className="p-2 font-bold text-emerald-400">{fn.overhead}</td>
                        <td className="p-2 text-slate-400">{fn.sharedObj}</td>
                        <td className="p-2 text-slate-500">{fn.dso}</td>
                        <td className="p-2 text-indigo-300 font-bold">{fn.symbol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: dmesg Kernel Ring Buffer Log Viewer */}
        {activeTab === 'dmesg' && (
          <div className="p-5 flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter dmesg kernel logs..."
                  value={dmesgSearch}
                  onChange={(e) => setDmesgSearch(e.target.value)}
                  className="bg-transparent text-slate-200 placeholder-slate-500 text-xs focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                {(['all', 'info', 'warn', 'success'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDmesgLevelFilter(lvl)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all ${
                      dmesgLevelFilter === lvl
                        ? 'bg-primary text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-80 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              {filteredDmesg.length === 0 ? (
                <div className="text-slate-500 italic p-4 text-center">
                  No matching kernel ring buffer events found. Run a simulation to populate.
                </div>
              ) : (
                filteredDmesg.map((e) => (
                  <div key={e.id} className="text-[11px] font-mono flex items-start gap-2">
                    <span className="text-slate-500 whitespace-nowrap">[{e.timestamp.toFixed(4)}]</span>
                    <span className="text-indigo-400 font-bold whitespace-nowrap">kernel:[TID {e.tid}]</span>
                    <span className={
                      e.level === 'warn' ? 'text-amber-400' :
                      e.level === 'success' ? 'text-emerald-400' : 'text-slate-300'
                    }>
                      {e.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Interactive Bash Shell */}
        {activeTab === 'shell' && (
          <div className="p-5 flex flex-col justify-between min-h-[380px]">
            <div className="space-y-1.5 overflow-y-auto max-h-80">
              {shellHistory.map((line, idx) => (
                <div key={idx} className={line.startsWith('$') ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleShellCommand} className="flex items-center gap-2 pt-4 border-t border-slate-800">
              <span className="text-emerald-400 font-bold whitespace-nowrap">root@threadlab:~#</span>
              <input
                type="text"
                autoFocus
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type command (e.g. lscpu, ps -eLf, top, perf stat, run --threads 4)..."
                className="w-full bg-transparent text-slate-100 focus:outline-none font-mono"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
