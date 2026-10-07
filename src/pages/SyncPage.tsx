import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Controls';
import { Badge } from '@/components/ui/Badge';
import { Lock, Play, RotateCcw, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export const SyncPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'race' | 'mutex' | 'pc' | 'rw'>('race');

  // Race Condition Demo State
  const [sharedCounter, setSharedCounter] = useState<number>(0);
  const [expectedCounter, setExpectedCounter] = useState<number>(0);
  const [raceRunning, setRaceRunning] = useState<boolean>(false);
  const [syncProtected, setSyncProtected] = useState<boolean>(false);

  // Producer Consumer State
  const [buffer, setBuffer] = useState<string[]>(['Data A', 'Data B']);
  const bufferCapacity = 4;

  const runRaceSimulation = () => {
    setRaceRunning(true);
    let current = 0;
    const target = 1000;
    setExpectedCounter(target);

    setTimeout(() => {
      if (syncProtected) {
        // Mutex protected: exact 1000
        setSharedCounter(target);
      } else {
        // Race condition: lost updates due to interleaving
        setSharedCounter(Math.floor(target * (0.65 + Math.random() * 0.25)));
      }
      setRaceRunning(false);
    }, 400);
  };

  const handleProduce = () => {
    if (buffer.length < bufferCapacity) {
      setBuffer([...buffer, `Item ${String.fromCharCode(65 + buffer.length)}`]);
    }
  };

  const handleConsume = () => {
    if (buffer.length > 0) {
      setBuffer(buffer.slice(1));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Concurrency Primitives & Race Conditions</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Synchronization Demonstration
          </h1>
          <p className="text-xs text-muted-foreground">
            Interactive laboratories: Lost-update race conditions, POSIX mutex critical sections, Producer–Consumer, and Readers–Writers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as any)}
        items={[
          { id: 'race', label: '1. Lost Update Race Condition' },
          { id: 'mutex', label: '2. Critical Section & Mutex' },
          { id: 'pc', label: '3. Producer–Consumer (Bounded Buffer)' },
          { id: 'rw', label: '4. Readers–Writers Preference' },
        ]}
      />

      {/* Tab 1: Race Condition */}
      {activeTab === 'race' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Shared Counter Increment Race
              </h3>
              <Badge variant={syncProtected ? 'success' : 'danger'}>
                {syncProtected ? 'Mutex Locked (Protected)' : 'Unprotected (Race Hazard)'}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              When multiple threads execute <code className="text-primary font-mono">counter++</code> without mutual exclusion, 
              the three assembly instructions (<strong>LOAD</strong>, <strong>ADD</strong>, <strong>STORE</strong>) interleave, 
              causing lost updates.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSyncProtected(!syncProtected)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  syncProtected ? 'bg-primary text-white border-primary' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {syncProtected ? 'Disable Mutex (Expose Race)' : 'Enable pthread_mutex_lock'}
              </button>
            </div>

            <Button
              size="md"
              variant="glow"
              disabled={raceRunning}
              onClick={runRaceSimulation}
              className="w-full gap-2 text-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {raceRunning ? 'Simulating 1,000 Concurrent Increments...' : 'Run 1,000 Concurrent Increments'}
            </Button>
          </Card>

          {/* Race Results Card */}
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-semibold text-sm text-foreground border-b border-border/40 pb-3">
              Actual vs Expected Outcome
            </h3>

            <div className="grid grid-cols-2 gap-4 font-mono text-center">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/40">
                <div className="text-xs text-muted-foreground">Expected Value</div>
                <div className="text-3xl font-bold text-foreground mt-1">{expectedCounter}</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/40">
                <div className="text-xs text-muted-foreground">Actual Result</div>
                <div
                  className={`text-3xl font-bold mt-1 ${
                    sharedCounter === expectedCounter && expectedCounter > 0
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  }`}
                >
                  {sharedCounter}
                </div>
              </div>
            </div>

            {expectedCounter > 0 && sharedCounter !== expectedCounter && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Data Corruption!</strong> Lost {expectedCounter - sharedCounter} increments due to concurrent instruction interleaving.
                </span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Mutex & Critical Section */}
      {activeTab === 'mutex' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-foreground">
            Critical Section Anatomy (Entry, Critical, Exit, Remainder)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <div className="font-bold mb-1">1. Entry Section</div>
              <p className="text-[11px] text-muted-foreground">Requests permission via pthread_mutex_lock(&m). Spins or sleeps on futex.</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <div className="font-bold mb-1">2. Critical Section</div>
              <p className="text-[11px] text-muted-foreground">Exclusive access: Only ONE thread at a time modifies shared data.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <div className="font-bold mb-1">3. Exit Section</div>
              <p className="text-[11px] text-muted-foreground">Releases lock via pthread_mutex_unlock(&m). Wakes queued threads.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/30 text-slate-400">
              <div className="font-bold mb-1">4. Remainder Section</div>
              <p className="text-[11px] text-muted-foreground">Independent local calculations outside mutual exclusion scope.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Producer-Consumer */}
      {activeTab === 'pc' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Bounded Buffer Producer–Consumer (Empty / Full Semaphores)
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              Slots: {buffer.length} / {bufferCapacity}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 py-2">
            {Array.from({ length: bufferCapacity }, (_, i) => {
              const item = buffer[i];
              return (
                <div
                  key={i}
                  className={`h-20 rounded-xl border flex flex-col items-center justify-center font-mono text-xs ${
                    item ? 'bg-primary/20 border-primary text-primary font-bold' : 'bg-secondary/40 border-border/40 text-muted-foreground italic'
                  }`}
                >
                  {item || 'Empty Slot'}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button
              size="sm"
              variant="primary"
              disabled={buffer.length >= bufferCapacity}
              onClick={handleProduce}
              className="flex-1"
            >
              Produce Item (sem_wait empty)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={buffer.length === 0}
              onClick={handleConsume}
              className="flex-1"
            >
              Consume Item (sem_wait full)
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 4: Readers-Writers */}
      {activeTab === 'rw' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-foreground">
            Readers–Writers Problem (Concurrency Rule)
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            • <strong>Multiple Readers Allowed:</strong> Any number of reader threads can simultaneously read shared memory.<br />
            • <strong>Exclusive Writers:</strong> When a writer enters, no other reader or writer may access memory.<br />
            • <strong>Starvation Hazard:</strong> In readers-preference, incoming readers can indefinitely starve waiting writers.
          </p>
        </Card>
      )}
    </div>
  );
};
