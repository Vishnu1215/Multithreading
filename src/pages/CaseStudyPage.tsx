import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookOpen, CheckCircle2, Cpu, Database, Activity, FileText } from 'lucide-react';

export const CaseStudyPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-4xl mx-auto py-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-3 border-b border-border/40 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Department of Information Technology • Technical Report</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
          Analysis of Multithreading in Linux: Performance Evaluation of Single-Threaded and Multi-Threaded Applications
        </h1>
        <div className="text-xs font-mono text-muted-foreground flex flex-wrap gap-4 pt-1">
          <span>Author: Vishnu Teja (160124737112)</span>
          <span>Advisor: Dr.T.Prathima</span>
          <span>Target: Linux Kernel 6.6 NPTL</span>
        </div>
      </div>

      {/* Article Body */}
      <article className="prose dark:prose-invert max-w-none space-y-8 text-foreground text-sm leading-relaxed">
        {/* 1. Problem Statement */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading text-foreground border-b border-border/30 pb-2">
            1. Problem Statement
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            With the end of Dennard scaling and the physical constraints of processor clock frequencies, modern 
            computing throughput relies predominantly on multi-core parallelism. However, transitioning from 
            single-threaded sequential programming to multithreaded concurrent execution introduces profound 
            operating system overheads: thread creation latency via <code className="text-primary font-mono">sys_clone()</code>, 
            cache invalidation, involuntary CFS context switches, and synchronization contention through kernel futexes.
          </p>
        </section>

        {/* 2. Objectives */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading text-foreground border-b border-border/30 pb-2">
            2. Objectives
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>Quantify the real-world speedup and parallel efficiency of multi-threading across 1, 2, 4, and 8 threads.</li>
            <li>Evaluate workload sensitivity across CPU-bound (Matrix multiplication, Primes) and I/O-bound (File Grep) domains.</li>
            <li>Investigate the oversubscription threshold where worker thread count exceeds physical CPU cores (n &gt; cores).</li>
            <li>Analyze Linux 1:1 kernel thread scheduling behavior via Completely Fair Scheduler (CFS).</li>
          </ul>
        </section>

        {/* 3. Methodology & Mathematical Formulas */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading text-foreground border-b border-border/30 pb-2">
            3. Methodology & Performance Formulations
          </h2>
          <p className="text-muted-foreground">
            The study utilizes Amdahl's Law to establish theoretical upper limits and compares empirical timing against the model:
          </p>
          <div className="p-4 rounded-xl bg-secondary/60 border border-border/50 font-mono text-xs space-y-2">
            <div>• <strong>Amdahl's Speedup:</strong> {"S(n) = 1 / [ (1 - p) + (p / n) ]"}</div>
            <div>• <strong>Parallel Efficiency:</strong> {"E(n) = (S(n) / n) × 100%"}</div>
            <div>• <strong>Total Execution Time:</strong> {"T(n) = T_serial·(1 - p) + (T_serial·p / min(n, cores)) + Overhead_clone + Overhead_ctx"}</div>
          </div>
        </section>

        {/* 4. Experimental Setup */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading text-foreground border-b border-border/30 pb-2">
            4. Experimental Platform Specification
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border border-border/40 rounded-xl overflow-hidden">
              <thead className="bg-secondary/60">
                <tr className="text-left text-muted-foreground">
                  <th className="p-2.5">Component</th>
                  <th className="p-2.5">Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <tr><td className="p-2.5 font-bold">CPU Architecture</td><td className="p-2.5">x86_64 SMP, 4 Virtual Cores @ 3.20 GHz</td></tr>
                <tr><td className="p-2.5 font-bold">Operating System</td><td className="p-2.5">Ubuntu 22.04 LTS (Linux Kernel 6.6.14)</td></tr>
                <tr><td className="p-2.5 font-bold">Threading Model</td><td className="p-2.5">NPTL 1:1 (Native POSIX Thread Library)</td></tr>
                <tr><td className="p-2.5 font-bold">Compiler Flags</td><td className="p-2.5">gcc -O2 -pthread -Wall -mavx2</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Results & Conclusion */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading text-foreground border-b border-border/30 pb-2">
            5. Key Findings & Conclusion
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            1. <strong>CPU-Bound Scaling:</strong> Matrix multiplication achieved <strong>3.72× speedup</strong> on 4 cores (93% efficiency).<br />
            2. <strong>I/O Bottlenecks:</strong> File processing plateaued at 2 threads (~1.4× speedup) due to disk request queue saturation.<br />
            3. <strong>Oversubscription Penalty:</strong> At 8 threads on 4 cores, involuntary CFS context switches increased by over 300%, causing a 35% drop in parallel efficiency.
          </p>
        </section>

        {/* References */}
        <section className="space-y-3 pt-4 border-t border-border/40">
          <h3 className="font-heading font-semibold text-sm text-foreground">References</h3>
          <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-1 font-mono">
            <li>Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). <em>Operating System Concepts</em> (10th ed.). Wiley.</li>
            <li>Drepper, U. & Molnar, I. (2003). <em>The Native POSIX Thread Library for Linux</em>. Red Hat Inc.</li>
            <li>Linux man-pages: clone(2), futex(2), pthread_create(3), sched(7).</li>
          </ol>
        </section>
      </article>
    </div>
  );
};
