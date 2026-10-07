import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GLOSSARY_TERMS, GlossaryTerm } from '@/data/glossaryData';
import { useSimulationStore } from '@/store/simulationStore';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Sparkles, 
  Keyboard, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLetter, setActiveLetter] = useState<string>('All');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const setTourActive = useSimulationStore((s) => s.setTourActive);
  const setAutopilotOpen = useSimulationStore((s) => s.setAutopilotOpen);

  // Alphabet list for jump bar
  const alphabet = ['All', ...Array.from(new Set(GLOSSARY_TERMS.map(t => t.term[0].toUpperCase()))).sort()];

  const filtered = GLOSSARY_TERMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesLetter = activeLetter === 'All' || item.term[0].toUpperCase() === activeLetter;
    return matchesSearch && matchesCat && matchesLetter;
  });

  const faqs = [
    {
      q: 'How does ThreadLab Linux simulate Linux kernel behaviors in the browser?',
      a: 'ThreadLab incorporates a deterministic mathematical execution model calibrated against empirical Linux kernel 6.6 benchmarks. It models NPTL 1:1 kernel thread structures, Amdahl’s Law theoretical speedup, CFS vruntime timeslices, involuntary context switch penalties for oversubscribed cores, and realistic page RSS memory growth without requiring any remote server.',
    },
    {
      q: 'Why does speedup diminish or drop when running 8 threads on 4 cores?',
      a: 'This illustrates CPU oversubscription. When active runnable threads exceed physical processor execution cores (n > cores), threads must time-share the silicon. The Linux Completely Fair Scheduler periodically interrupts executing tasks, producing thousands of involuntary context switches (saving and restoring CPU registers, flushing pipeline states) which wastes processor cycles.',
    },
    {
      q: 'What is the role of futex in POSIX mutex performance?',
      a: 'A futex (Fast Userspace Mutex) allows uncontended lock acquisitions to complete entirely in user space using atomic compare-and-swap (CAS) instructions with zero system call overhead. Only when two or more threads contend for the lock does the kernel intervene via sys_futex() to put the waiting thread to sleep.',
    },
    {
      q: 'Can I export reports for academic course submission?',
      a: 'Yes. Navigate to /report to generate a multi-page PDF document complete with cover sheet, executive summary, empirical benchmark tables, and mathematical formulas, or export raw CSV run records.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Documentation & Faculty Walkthrough Guide</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Help & OS Glossary ({GLOSSARY_TERMS.length}+ Terms)
          </h1>
          <p className="text-xs text-muted-foreground">
            Comprehensive reference dictionary of operating systems, Linux kernel internals, and threading terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="glow" onClick={() => setTourActive(true)} className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 fill-white" /> Restart Guided Tour
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAutopilotOpen(true)} className="gap-1.5 text-xs">
            <Play className="w-3.5 h-3.5" /> Demo Autopilot
          </Button>
        </div>
      </div>

      {/* Suggested 5-Minute Faculty Demo Script */}
      <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-heading font-bold text-base text-foreground">
            Suggested 5-Minute Faculty Demonstration Walkthrough
          </h3>
        </div>
        <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-2 leading-relaxed">
          <li>
            <strong>1. Landing Hero (0:00 - 0:45):</strong> Showcase the side-by-side race between 1 Worker and 4 Workers. Explain the motivation of Dennard scaling and multi-core parallelism.
          </li>
          <li>
            <strong>2. Interactive Simulator (0:45 - 2:00):</strong> Run a 4T run on Matrix Multiplication. Highlight the 5-phase pipeline stepper (Splitting → clone() creation → Parallel execution → Barrier → Merge).
          </li>
          <li>
            <strong>3. CPU Visualizer & Oversubscription (2:00 - 3:00):</strong> Switch to 8 threads on 4 cores. Point out involuntary CFS context switches and C-state idle indicators.
          </li>
          <li>
            <strong>4. Concurrency Labs (3:00 - 4:00):</strong> Demonstrate the Lost-Update Race condition on /sync (1,000 increments corrupted to ~700 without mutex, fixed with pthread_mutex_lock). Then show the Deadlock RAG graph and DFS cycle detection.
          </li>
          <li>
            <strong>5. Report & Verification (4:00 - 5:00):</strong> Visit /report and export the complete multi-page PDF with empirical tables and Amdahl's Law calculations.
          </li>
        </ol>
      </Card>

      {/* Keyboard Shortcuts Cheat Sheet */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm text-foreground">
            Keyboard Shortcuts Cheat Sheet
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/40 flex justify-between items-center">
            <span className="text-muted-foreground">Command Palette</span>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-foreground font-bold">⌘K / Ctrl+K</kbd>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/40 flex justify-between items-center">
            <span className="text-muted-foreground">Close Modals</span>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-foreground font-bold">ESC</kbd>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/40 flex justify-between items-center">
            <span className="text-muted-foreground">Print Report</span>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-foreground font-bold">⌘P / Ctrl+P</kbd>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/40 flex justify-between items-center">
            <span className="text-muted-foreground">Toggle Theme</span>
            <span className="text-[11px] text-primary">Topbar Icon</span>
          </div>
        </div>
      </Card>

      {/* FAQ Accordion */}
      <Card className="p-6 space-y-4">
        <h3 className="font-heading font-semibold text-base text-foreground">
          Frequently Asked Questions (FAQ)
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="rounded-xl border border-border/40 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left bg-secondary/30 hover:bg-secondary/60 flex items-center justify-between text-xs font-semibold text-foreground transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {isOpen && (
                  <div className="p-3.5 text-xs text-muted-foreground bg-card leading-relaxed border-t border-border/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 60+ terms (e.g., clone, futex, CFS, Amdahl, NUMA)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex bg-secondary p-1 rounded-xl border border-border/40 text-xs">
            {['All', 'OS Core', 'Threading', 'Linux Internals'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-card text-foreground font-semibold shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* A-Z Jump Bar */}
        <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-secondary/40 border border-border/40 text-xs font-mono">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setActiveLetter(letter)}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeLetter === letter
                  ? 'bg-primary text-white font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Terminology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-xs text-muted-foreground italic">
            No terms matching search criteria.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isExpanded = expandedTerm === item.term;
            return (
              <Card
                key={idx}
                className="p-5 space-y-3 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setExpandedTerm(isExpanded ? null : item.term)}
              >
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <span className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                    {item.term}
                  </span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.definition}
                </p>
                <div className="p-2.5 rounded-lg bg-secondary/50 font-mono text-[11px] text-primary truncate border border-border/30">
                  {item.example}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
