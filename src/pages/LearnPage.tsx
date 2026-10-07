import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Controls';
import { Badge } from '@/components/ui/Badge';
import { Layers, Cpu, Server, Database, GitMerge, Zap } from 'lucide-react';

export const LearnPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'memory' | 'concurrency' | 'linux'>('memory');
  const [selectedEntity, setSelectedEntity] = useState<'process' | 'thread'>('thread');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Concepts Primer & Memory Architecture</span>
        </div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Process vs. Thread: Under the Hood
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Master the foundational concepts of the Linux process and execution model. Explore virtual address 
          spaces, kernel task structures, and the difference between concurrency and true hardware parallelism.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as any)}
        items={[
          { id: 'memory', label: 'Virtual Memory & Address Space Layout', icon: <Database className="w-4 h-4" /> },
          { id: 'concurrency', label: 'Concurrency vs Parallelism', icon: <Cpu className="w-4 h-4" /> },
          { id: 'linux', label: 'Linux 1:1 NPTL Kernel Model', icon: <Server className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Interactive Memory Layout */}
      {activeTab === 'memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Controls */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Select Execution Unit
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedEntity('process')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedEntity === 'process'
                      ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                      : 'bg-secondary/40 border-border/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">Process</div>
                  <div className="text-[11px] leading-tight">
                    Created via <code className="text-primary">fork()</code>. Completely isolated virtual address space.
                  </div>
                </button>

                <button
                  onClick={() => setSelectedEntity('thread')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedEntity === 'thread'
                      ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                      : 'bg-secondary/40 border-border/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">Thread</div>
                  <div className="text-[11px] leading-tight">
                    Created via <code className="text-primary">clone()</code>. Shares Heap, Data, and Code with siblings.
                  </div>
                </button>
              </div>

              {/* Explanatory bullet points */}
              <div className="pt-2 space-y-2 text-xs text-muted-foreground leading-relaxed">
                {selectedEntity === 'process' ? (
                  <>
                    <p>
                      • <strong>Memory Isolation:</strong> Processes have separate page tables (CR3 register swapped on context switch).
                    </p>
                    <p>
                      • <strong>IPC Requirement:</strong> Inter-process communication requires pipes, sockets, or shared memory segments.
                    </p>
                    <p>
                      • <strong>Switching Overhead:</strong> TLB (Translation Lookaside Buffer) must be flushed unless tagged with PCID.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      • <strong>Shared Address Space:</strong> All threads in the process share the exact same Heap, Static Data, and Code.
                    </p>
                    <p>
                      • <strong>Private Stack:</strong> Each thread gets an independent execution stack (default 8MB virtual, small RSS) and registers/PC.
                    </p>
                    <p>
                      • <strong>Fast Context Switch:</strong> No TLB shootdown or page directory switch needed. Fast user-space synchronization via futex.
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Memory Visualizer Canvas */}
          <div className="lg:col-span-7">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-mono font-semibold uppercase text-foreground">
                  Virtual Address Space: {selectedEntity === 'process' ? 'Isolated Process Layout' : 'Multi-Threaded Process Layout'}
                </span>
                <Badge variant={selectedEntity === 'thread' ? 'info' : 'outline'}>
                  {selectedEntity === 'thread' ? 'Shared + Private Stacks' : 'Isolated Address Space'}
                </Badge>
              </div>

              {/* Stack Diagram */}
              <div className="flex flex-col gap-2 max-w-md mx-auto py-2">
                {/* Kernel Space */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center font-mono text-xs text-slate-300">
                  <div className="font-bold">Kernel Space (0xFFFF800000000000)</div>
                  <div className="text-[10px] text-slate-400">Task structs, kernel stacks, page tables</div>
                </div>

                {/* Stacks */}
                {selectedEntity === 'process' ? (
                  <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-center font-mono text-xs text-amber-500">
                    <div className="font-bold">User Stack (Grows Downward ↓)</div>
                    <div className="text-[10px]">Local variables, call stack frames</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {['Thread 1', 'Thread 2', 'Thread 3', 'Thread 4'].map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-center font-mono text-[11px] text-indigo-400"
                      >
                        <div className="font-bold">{t}</div>
                        <div className="text-[9px] text-muted-foreground">Private Stack</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Shared Heap */}
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center font-mono text-xs text-emerald-500">
                  <div className="font-bold">
                    Shared Heap (malloc / new) {selectedEntity === 'thread' && '← Shared by all threads'}
                  </div>
                  <div className="text-[10px]">Dynamic memory buffers, shared matrices</div>
                </div>

                {/* Data Segment */}
                <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-center font-mono text-xs text-blue-500">
                  <div className="font-bold">BSS & Initialized Data (Global Variables)</div>
                </div>

                {/* Text / Code */}
                <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-center font-mono text-xs text-purple-400">
                  <div className="font-bold">Text Segment (Executable Machine Instructions)</div>
                  <div className="text-[10px]">Read-only shared instructions</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Concurrency vs Parallelism */}
      {activeTab === 'concurrency' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <Zap className="w-5 h-5" />
              <h3 className="font-heading font-bold text-base text-foreground">Concurrency (Interleaving)</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Single-core multitasking:</strong> Two or more tasks make progress by sharing a single 
              CPU core. The OS scheduler interrupts tasks periodically using timer interrupts (context switching).
            </p>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 font-mono text-xs space-y-2">
              <div className="text-muted-foreground text-[11px]">Core 0 Time Allocation:</div>
              <div className="flex rounded-lg overflow-hidden h-7 border border-border/60">
                <div className="w-1/4 bg-indigo-500 flex items-center justify-center text-white text-[10px]">T1</div>
                <div className="w-1/4 bg-pink-500 flex items-center justify-center text-white text-[10px]">T2</div>
                <div className="w-1/4 bg-indigo-500 flex items-center justify-center text-white text-[10px]">T1</div>
                <div className="w-1/4 bg-pink-500 flex items-center justify-center text-white text-[10px]">T2</div>
              </div>
              <div className="text-[10px] text-muted-foreground text-center">Interleaving creates illusion of simultaneous execution</div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Cpu className="w-5 h-5" />
              <h3 className="font-heading font-bold text-base text-foreground">Parallelism (True Simultaneous)</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Multi-core execution:</strong> Multiple tasks literally execute their machine instructions 
              at the exact same nanosecond on physically distinct processor execution units.
            </p>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 font-mono text-xs space-y-2">
              <div className="text-muted-foreground text-[11px]">Multiple Physical Cores:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-between">
                  <span>Core 0:</span> <span className="font-bold">Executing T1</span>
                </div>
                <div className="p-2 rounded bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-between">
                  <span>Core 1:</span> <span className="font-bold">Executing T2</span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground text-center">True simultaneous execution with 2× potential hardware speedup</div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Linux 1:1 NPTL Kernel Model */}
      {activeTab === 'linux' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-foreground">
            Linux NPTL (Native POSIX Thread Library) & clone() Syscall
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In modern Linux, user threads are mapped <strong>1:1 to kernel schedulable entities</strong> (known as 
            <code className="text-primary font-mono">struct task_struct</code>). There is no complex user-level 
            scheduler (M:N) like in old Solaris or green threads.
          </p>

          <div className="p-4 rounded-xl bg-secondary/70 border border-border/60 font-mono text-xs overflow-x-auto">
            <pre className="text-foreground">
{`/* How pthread_create() invokes sys_clone in Linux NPTL */
int tid = clone(
    child_function,
    child_stack + STACK_SIZE,
    CLONE_VM      | // Share virtual memory (address space)
    CLONE_FS      | // Share filesystem info (cwd, root)
    CLONE_FILES   | // Share file descriptor table
    CLONE_SIGHAND | // Share signal handlers
    CLONE_THREAD  | // Place into same thread group (shared TGID / PID)
    arg
);`}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
};
