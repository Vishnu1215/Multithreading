import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GLOSSARY_TERMS, GlossaryTerm } from '@/data/glossaryData';
import { HelpCircle, Search, BookOpen, Layers, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = GLOSSARY_TERMS.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Documentation & Faculty Walkthrough Guide</span>
        </div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Help & OS Glossary
        </h1>
        <p className="text-xs text-muted-foreground">
          Searchable reference dictionary of operating systems, Linux kernel internals, and threading terms.
        </p>
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
            <strong>1. Landing Hero (0:00 - 0:45):</strong> Show the side-by-side race between 1 Worker and 4 Workers. Explain the motivation of Dennard scaling and multi-core parallelism.
          </li>
          <li>
            <strong>2. Interactive Simulator (0:45 - 2:00):</strong> Run a 4T run on Matrix. Highlight the 5-phase pipeline stepper (Splitting → clone() creation → Parallel execution → Barrier → Merge).
          </li>
          <li>
            <strong>3. CPU Visualizer & Oversubscription (2:00 - 3:00):</strong> Switch to 8 threads on 4 cores. Point out the involuntary CFS context switches and C-state idle indicators.
          </li>
          <li>
            <strong>4. Concurrency Labs (3:00 - 4:00):</strong> Demonstrate the Lost-Update Race condition on /sync (1,000 increments corrupted to ~700 without mutex, fixed with pthread_mutex_lock). Then show the Deadlock RAG graph.
          </li>
          <li>
            <strong>5. Report & Verification (4:00 - 5:00):</strong> Visit /report and export the complete multi-page PDF with empirical tables and Amdahl's Law calculations.
          </li>
        </ol>
      </Card>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 20+ terms (e.g., clone, futex, CFS, Amdahl)..."
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

      {/* Terminology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <Card key={idx} className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <span className="font-heading font-bold text-sm text-foreground">{item.term}</span>
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.definition}
            </p>
            <div className="p-2.5 rounded-lg bg-secondary/50 font-mono text-[11px] text-primary truncate border border-border/30">
              {item.example}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
