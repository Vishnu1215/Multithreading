import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Activity, Play, RotateCcw, ArrowRight, Zap, Code } from 'lucide-react';
import { ThreadState } from '@/types/simulation';

interface StateInfo {
  name: ThreadState;
  linuxState: string;
  desc: string;
  color: string;
  apiCall: string;
}

const STATES: Record<ThreadState, StateInfo> = {
  New: {
    name: 'New',
    linuxState: 'TASK_NEW / clone() setup',
    desc: 'Thread task struct has been allocated in kernel memory, stack virtual memory mapped, but not yet placed on runqueue.',
    color: '#64748B',
    apiCall: 'pthread_create(&tid, NULL, worker_func, arg);',
  },
  Ready: {
    name: 'Ready',
    linuxState: 'TASK_RUNNING (in cfs_rq)',
    desc: 'Thread is ready and waiting for an available CPU core. Inserted into CFS red-black tree keyed by vruntime.',
    color: '#F59E0B',
    apiCall: 'wake_up_process(task); // Enqueued into runqueue',
  },
  Running: {
    name: 'Running',
    linuxState: 'TASK_RUNNING (executing on core)',
    desc: 'Thread instructions are being actively executed on physical silicon. Registers and program counter (PC) loaded.',
    color: '#10B981',
    apiCall: 'context_switch(prev, next); // Dispatched by CFS',
  },
  Waiting: {
    name: 'Waiting',
    linuxState: 'TASK_INTERRUPTIBLE / TASK_UNINTERRUPTIBLE',
    desc: 'Thread blocked waiting on I/O completion, futex mutex unlock, condition variable, or sleeping.',
    color: '#0284C7',
    apiCall: 'pthread_mutex_lock(&lock); // Or read(fd, buf, size);',
  },
  Terminated: {
    name: 'Terminated',
    linuxState: 'EXIT_ZOMBIE -> EXIT_DEAD',
    desc: 'Thread finished execution. Resources freed; exit code preserved until joined by parent.',
    color: '#EF4444',
    apiCall: 'pthread_exit(NULL); // Reaped by pthread_join()',
  },
};

export const LifecyclePage: React.FC = () => {
  const [currentState, setCurrentState] = useState<ThreadState>('New');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transitions Map
  const validTransitions: Record<ThreadState, ThreadState[]> = {
    New: ['Ready'],
    Ready: ['Running'],
    Running: ['Waiting', 'Ready', 'Terminated'],
    Waiting: ['Ready'],
    Terminated: ['New'], // reset
  };

  const handleTransition = (next: ThreadState) => {
    if (validTransitions[currentState].includes(next)) {
      setCurrentState(next);
      setErrorMessage(null);
    } else {
      setErrorMessage(`Illegal Transition: Cannot go from ${currentState} directly to ${next}. In Linux OS, states must follow the hardware lifecycle.`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleAutoPlay = () => {
    const sequence: ThreadState[] = ['New', 'Ready', 'Running', 'Waiting', 'Ready', 'Running', 'Terminated'];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < sequence.length) {
        setCurrentState(sequence[idx]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 900);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>State Machine & Kernel PCB / TCB Transitions</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Thread Lifecycle</h1>
          <p className="text-xs text-muted-foreground">
            Explore state transitions between New, Ready, Running, Waiting, and Terminated, and their Linux kernel mappings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="glow" onClick={handleAutoPlay} className="gap-1.5 text-xs">
            <Play className="w-3.5 h-3.5 fill-white" /> Auto-Play Lifecycle
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCurrentState('New')} className="text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* State Machine Diagram Area */}
      <Card className="p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-heading font-bold text-sm text-foreground">
            Interactive Finite State Machine (Click a State Node to Transition)
          </h3>
          <span className="text-xs font-mono">
            Active State: <strong style={{ color: STATES[currentState].color }}>{currentState}</strong>
          </span>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4">
          {(Object.keys(STATES) as ThreadState[]).map((stateKey) => {
            const st = STATES[stateKey];
            const isCurrent = currentState === stateKey;
            const isValidNext = validTransitions[currentState].includes(stateKey);

            return (
              <button
                key={stateKey}
                onClick={() => handleTransition(stateKey)}
                className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-3 relative ${
                  isCurrent
                    ? 'border-2 scale-105 shadow-xl shadow-primary/20 bg-card'
                    : isValidNext
                    ? 'border-dashed border-primary/50 bg-secondary/30 hover:bg-secondary/70'
                    : 'border-border/30 opacity-40 bg-card/40'
                }`}
                style={{
                  borderColor: isCurrent ? st.color : undefined,
                }}
              >
                {isCurrent && (
                  <span
                    className="w-3 h-3 rounded-full animate-ping absolute -top-1.5 -right-1.5"
                    style={{ backgroundColor: st.color }}
                  />
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                  style={{ backgroundColor: st.color }}
                >
                  {stateKey[0]}
                </div>
                <div className="space-y-0.5">
                  <div className="font-heading font-bold text-sm text-foreground">{st.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">
                    {st.linuxState.split(' ')[0]}
                  </div>
                </div>
                {isValidNext && (
                  <span className="text-[9px] font-mono text-primary font-bold">Valid Next →</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error / Feedback Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono animate-bounce">
            {errorMessage}
          </div>
        )}
      </Card>

      {/* State Detail Inspection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linux Kernel Mapping */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading font-bold text-base text-foreground">
              Kernel Perspective: {STATES[currentState].linuxState}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {STATES[currentState].desc}
          </p>

          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="text-xs font-semibold text-foreground">Valid Outgoing Transitions:</div>
            <div className="flex gap-2">
              {validTransitions[currentState].map((next) => (
                <button
                  key={next}
                  onClick={() => handleTransition(next)}
                  className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-primary/20 text-xs font-mono font-medium text-foreground border border-border/50 flex items-center gap-1.5"
                >
                  <span>Transition to <strong>{next}</strong></span>
                  <ArrowRight className="w-3 h-3 text-primary" />
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* System Call / POSIX Code Snippet */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h3 className="font-heading font-bold text-base text-foreground">
              Corresponding POSIX / Linux C Code
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            The C API function that triggers or resolves this lifecycle event:
          </p>
          <div className="p-4 rounded-xl bg-secondary/80 border border-border/50 font-mono text-xs text-primary overflow-x-auto">
            <code>{STATES[currentState].apiCall}</code>
          </div>
        </Card>
      </div>
    </div>
  );
};
