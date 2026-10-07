import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  BookOpen, 
  Cpu, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Activity, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Clock,
  Terminal,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useSimulationStore } from '@/store/simulationStore';

export const LandingPage: React.FC = () => {
  const author = useSimulationStore((s) => s.author);
  const setAuthor = useSimulationStore((s) => s.setAuthor);
  const [showAuthorModal, setShowAuthorModal] = React.useState(false);

  return (
    <div className="space-y-16 py-4 animate-in fade-in duration-500">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl p-8 lg:p-14 overflow-hidden border border-border/40 bg-gradient-to-br from-card via-card/90 to-primary/5 shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Operating Systems Research & Case Study</span>
          </div>

          <h1 className="font-heading text-4xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Analysis of Multithreading <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              in Modern Linux
            </span>
          </h1>

          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
            Performance evaluation of single-threaded and multi-threaded applications across CPU-bound, 
            memory-bound, and I/O-intensive workloads. Interactive simulation of the Linux 1:1 NPTL model, 
            CFS scheduler, futex primitives, and Amdahl's Law limits.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/simulator">
              <Button size="lg" variant="glow" className="gap-2">
                <Play className="w-4 h-4 fill-white" />
                Launch Simulator
              </Button>
            </Link>
            <Link to="/case-study">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Explore Case Study
              </Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="secondary" className="gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Process vs Thread Primer
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Mini-Demo Strip in Hero */}
        <div className="mt-10 p-5 rounded-2xl bg-secondary/60 border border-border/40 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold font-mono uppercase tracking-wider text-foreground">
                Active 4-Core Die Preview (NPTL 1:1 Model)
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-muted-foreground">Workload: Matrix C = A × B</span>
              <span className="text-emerald-500 font-bold">Speedup: ~3.72× on 4C</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            {[
              { id: 0, thread: 'T1 (Main)', load: '94%', color: '#6366F1' },
              { id: 1, thread: 'T2 (Worker)', load: '96%', color: '#EC4899' },
              { id: 2, thread: 'T3 (Worker)', load: '93%', color: '#10B981' },
              { id: 3, thread: 'T4 (Worker)', load: '95%', color: '#F59E0B' },
            ].map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-card border border-border/50 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="font-bold text-foreground">Core {c.id}</span>
                  <span className="text-emerald-500 font-medium">BUSY</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-mono font-medium truncate" style={{ color: c.color }}>
                    {c.thread}
                  </span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: c.load }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SINGLE VS MULTI-THREAD AT A GLANCE (RACE) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight font-heading text-foreground">
            Single-Threaded vs Multi-Threaded: Side-by-Side Race
          </h2>
          <p className="text-xs text-muted-foreground">
            How dividing work across symmetric cores transforms execution time and system throughput.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Single thread card */}
          <Card className="p-6 space-y-4 border-slate-500/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-500">
                  Single-Threaded (1 Worker)
                </span>
                <h3 className="font-semibold text-foreground text-sm">Sequential Execution</h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">1 Core Active</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              A single thread of execution processes all data chunks one by one in serial order. 
              Remaining 3 CPU cores sit in low-power idle states (C6). Speedup is baseline 1.0×.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Chunk 1 → 4 Sequential</span>
                <span className="text-amber-500 font-bold">Time: ~3800 ms</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 w-1/4 rounded-full" />
              </div>
            </div>
          </Card>

          {/* Multi thread card */}
          <Card className="p-6 space-y-4 border-primary/30 glow">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary">
                  Multi-Threaded (4 Workers)
                </span>
                <h3 className="font-semibold text-foreground text-sm">Parallel Execution (1:1 NPTL)</h3>
              </div>
              <span className="font-mono text-xs text-emerald-500 font-bold">4 Cores Saturated</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Task partitioned into 4 row-blocks. <code className="text-primary font-mono">sys_clone()</code> spawns 
              4 kernel tasks. All 4 cores simultaneously compute their partitions. Amdahl speedup is ~3.7×!
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Chunks 1, 2, 3, 4 Simultaneous</span>
                <span className="text-emerald-500 font-bold">Time: ~1050 ms (3.62× faster)</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-cyan-400 w-full rounded-full" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. WHAT YOU'LL EXPLORE (BENTO GRID) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight font-heading text-foreground">
            What You'll Explore in ThreadLab
          </h2>
          <p className="text-xs text-muted-foreground">
            A complete suite of hardware simulations, kernel scheduling algorithms, concurrency labs, and benchmark analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Interactive Simulator',
              desc: '5-phase pipeline stepper: Task splitting, clone() creation, parallel execution, barrier sync, and memory merge.',
              to: '/simulator',
              icon: Play,
              badge: 'Engine',
            },
            {
              title: 'CPU Core Visualizer',
              desc: 'Physical processor die with live core frequency, C-states, ready-queue stack, and microsecond context switch flashes.',
              to: '/cpu',
              icon: Cpu,
              badge: 'Hardware',
            },
            {
              title: 'Scheduler & CFS Gantt',
              desc: 'Interactive comparison of FCFS, Round Robin, Priority, and SJF with computed turnaround and waiting times.',
              to: '/scheduler',
              icon: Layers,
              badge: 'Kernel',
            },
            {
              title: 'Concurrency & Race Labs',
              desc: 'Watch race conditions corrupt shared variables, then fix them with futex-backed Mutex and POSIX Semaphores.',
              to: '/sync',
              icon: Zap,
              badge: 'Synchronization',
            },
            {
              title: 'Deadlock & RAG Detection',
              desc: 'Interactive Resource Allocation Graph with automated DFS cycle discovery, 4 Coffman conditions, and recovery mechanisms.',
              to: '/deadlock',
              icon: ShieldAlert,
              badge: 'Deadlock',
            },
            {
              title: 'Linux htop / top Terminal',
              desc: 'Monospace CLI monitor with live process table, perf stat hardware counter outputs, and interactive bash commands.',
              to: '/monitor',
              icon: Terminal,
              badge: 'CLI',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} to={item.to} className="group">
                <Card className="p-5 h-full flex flex-col justify-between hover:border-primary/50 transition-all duration-200 hover:-translate-y-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/40">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span>Explore module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FOOTER & ACADEMIC CREDITS */}
      <footer className="rounded-3xl p-6 lg:p-8 border border-border/40 bg-card/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="text-xs font-mono uppercase text-primary font-bold tracking-wider">
            {author.courseName}
          </div>
          <div className="text-sm font-semibold text-foreground">
            Student: {author.studentName} ({author.rollNo})
          </div>
          <div className="text-xs text-muted-foreground">
            Faculty Guide: {author.guideName}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAuthorModal(true)}
          className="gap-2 shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
          Edit Academic Meta
        </Button>
      </footer>

      {/* Edit Author Dialog */}
      {showAuthorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 bg-card border border-border shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-lg text-foreground">Edit Case Study Metadata</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Student Name</label>
                <input
                  type="text"
                  value={author.studentName}
                  onChange={(e) => setAuthor({ studentName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-secondary border border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Roll / ID Number</label>
                <input
                  type="text"
                  value={author.rollNo}
                  onChange={(e) => setAuthor({ rollNo: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-secondary border border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Faculty Guide</label>
                <input
                  type="text"
                  value={author.guideName}
                  onChange={(e) => setAuthor({ guideName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-secondary border border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Course Code & Title</label>
                <input
                  type="text"
                  value={author.courseName}
                  onChange={(e) => setAuthor({ courseName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-secondary border border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" onClick={() => setShowAuthorModal(false)}>
                Save & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
