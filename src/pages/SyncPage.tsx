import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Controls';
import { Badge } from '@/components/ui/Badge';
import { 
  Lock, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  FastForward,
  Pause,
  Layers,
  Users
} from 'lucide-react';

export const SyncPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'race' | 'critical' | 'mutex' | 'semaphore' | 'pc' | 'rw'>('race');

  // Play / Pause / Step global to current tab
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [eventLogs, setEventLogs] = useState<string[]>([
    '[INIT] POSIX threads initialized with NPTL futex synchronization.',
  ]);

  const addLog = (msg: string) => {
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // 1. Race Condition Demo State
  const [sharedCounter, setSharedCounter] = useState<number>(0);
  const [expectedCounter, setExpectedCounter] = useState<number>(0);
  const [syncProtected, setSyncProtected] = useState<boolean>(false);
  const [microStep, setMicroStep] = useState<'idle' | 'read' | 'modify' | 'write'>('idle');

  // 2. Critical Section State
  const [activeThreadInCS, setActiveThreadInCS] = useState<number | null>(null);

  // 3. Mutex Code Line Highlight
  const [highlightLine, setHighlightLine] = useState<number>(1);
  const [mutexLocked, setMutexLocked] = useState<boolean>(false);

  // 4. Semaphore State
  const [semPermits, setSemPermits] = useState<number>(2);
  const [semType, setSemType] = useState<'counting' | 'binary'>('counting');

  // 5. Producer Consumer State
  const [buffer, setBuffer] = useState<string[]>(['Data A', 'Data B']);
  const [producersCount, setProducersCount] = useState<number>(2);
  const [consumersCount, setConsumersCount] = useState<number>(2);
  const [bufferCapacity, setBufferCapacity] = useState<number>(4);
  const [syncCorruptMode, setSyncCorruptMode] = useState<boolean>(false);

  // 6. Readers Writers State
  const [activeReaders, setActiveReaders] = useState<number>(0);
  const [activeWriter, setActiveWriter] = useState<boolean>(false);
  const [rwPreference, setRwPreference] = useState<'readers' | 'writers'>('readers');
  const [waitingWriters, setWaitingWriters] = useState<number>(0);

  // Race action
  const runRaceSimulation = () => {
    setSimRunning(true);
    const target = 1000;
    setExpectedCounter(target);
    addLog(`Running 1,000 increments (Mutex: ${syncProtected ? 'ENABLED' : 'DISABLED'})`);

    setTimeout(() => {
      if (syncProtected) {
        setSharedCounter(target);
        addLog(`[PASS] Value is ${target}. Mutual exclusion preserved atomic increment.`);
      } else {
        const val = Math.floor(target * (0.65 + Math.random() * 0.25));
        setSharedCounter(val);
        addLog(`[FAIL] Value is ${val} (Lost ${target - val} increments due to race hazard!)`);
      }
      setSimRunning(false);
    }, 400);
  };

  // Producer-Consumer handlers
  const handleProduce = () => {
    if (buffer.length < bufferCapacity || syncCorruptMode) {
      const newItem = `Item ${String.fromCharCode(65 + buffer.length)}`;
      setBuffer([...buffer, newItem]);
      addLog(`Producer added ${newItem} to bounded buffer. Slots: ${buffer.length + 1}/${bufferCapacity}`);
    } else {
      addLog(`[BLOCKED] Buffer full! Producer calling sem_wait(&empty).`);
    }
  };

  const handleConsume = () => {
    if (buffer.length > 0) {
      const consumed = buffer[0];
      setBuffer(buffer.slice(1));
      addLog(`Consumer pulled ${consumed}. Slots: ${buffer.length - 1}/${bufferCapacity}`);
    } else {
      addLog(`[BLOCKED] Buffer empty! Consumer calling sem_wait(&full).`);
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
            Synchronization Demonstration (All 6 Labs)
          </h1>
          <p className="text-xs text-muted-foreground">
            Interactive laboratories: Lost-update race, Critical Section, Mutex C code, Semaphores, Producer–Consumer, and Readers–Writers.
          </p>
        </div>

        {/* Global speed and step bar */}
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl border border-border/40 text-xs">
          <span className="text-muted-foreground px-2">Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSimSpeed(s)}
              className={`px-2 py-0.5 rounded font-mono ${simSpeed === s ? 'bg-primary text-white font-bold' : 'text-muted-foreground'}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as any)}
        items={[
          { id: 'race', label: '1. Race Condition' },
          { id: 'critical', label: '2. Critical Section' },
          { id: 'mutex', label: '3. Mutex & C Code' },
          { id: 'semaphore', label: '4. Semaphore' },
          { id: 'pc', label: '5. Producer–Consumer' },
          { id: 'rw', label: '6. Readers–Writers' },
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

            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono text-xs">
              <div className={`p-2 rounded-lg border ${microStep === 'read' ? 'bg-primary text-white border-primary' : 'bg-secondary/40'}`}>
                1. LOAD reg, [counter]
              </div>
              <div className={`p-2 rounded-lg border ${microStep === 'modify' ? 'bg-primary text-white border-primary' : 'bg-secondary/40'}`}>
                2. ADD reg, 1
              </div>
              <div className={`p-2 rounded-lg border ${microStep === 'write' ? 'bg-primary text-white border-primary' : 'bg-secondary/40'}`}>
                3. STORE [counter], reg
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSyncProtected(!syncProtected)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  syncProtected ? 'bg-primary text-white border-primary' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {syncProtected ? 'Disable Mutex (Expose Race)' : 'Enable pthread_mutex_lock'}
              </button>
            </div>

            <Button size="md" variant="glow" disabled={simRunning} onClick={runRaceSimulation} className="w-full gap-2 text-xs">
              <Play className="w-3.5 h-3.5 fill-white" />
              {simRunning ? 'Simulating 1,000 Concurrent Increments...' : 'Run 1,000 Concurrent Increments'}
            </Button>
          </Card>

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
                <div className={`text-3xl font-bold mt-1 ${sharedCounter === expectedCounter && expectedCounter > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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

      {/* Tab 2: Critical Section */}
      {activeTab === 'critical' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-bold text-base text-foreground">
              Critical Section Anatomy (Entry, Critical, Exit, Remainder)
            </h3>
            <span className="text-xs font-mono text-primary font-bold">
              Active in CS: {activeThreadInCS ? `Thread ${activeThreadInCS}` : 'None'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <div className="font-bold mb-1">1. Entry Section</div>
              <p className="text-[11px] text-muted-foreground">pthread_mutex_lock(&m). Spins or blocks in futex hash bucket.</p>
            </div>
            <div className={`p-4 rounded-xl border ${activeThreadInCS ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}>
              <div className="font-bold mb-1">2. Critical Section</div>
              <p className="text-[11px]">{activeThreadInCS ? `Thread ${activeThreadInCS} modifying memory exclusively!` : 'Exclusive access region.'}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <div className="font-bold mb-1">3. Exit Section</div>
              <p className="text-[11px] text-muted-foreground">pthread_mutex_unlock(&m). Wakes sleeping waiters.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-500/10 border border-slate-500/30 text-slate-400">
              <div className="font-bold mb-1">4. Remainder Section</div>
              <p className="text-[11px] text-muted-foreground">Independent local calculations.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {[1, 2, 3].map((tid) => (
              <Button
                key={tid}
                size="sm"
                variant={activeThreadInCS === tid ? 'primary' : 'outline'}
                onClick={() => {
                  if (activeThreadInCS === null) {
                    setActiveThreadInCS(tid);
                    addLog(`Thread ${tid} entered Critical Section.`);
                  } else if (activeThreadInCS === tid) {
                    setActiveThreadInCS(null);
                    addLog(`Thread ${tid} exited Critical Section.`);
                  }
                }}
                className="flex-1 text-xs"
              >
                {activeThreadInCS === tid ? `T${tid} Exit Critical Section` : `T${tid} Enter Critical Section`}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Mutex & Pseudo-C Code */}
      {activeTab === 'mutex' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-foreground">
              POSIX Mutex (futex Fast User-Space Path)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When uncontended, <code className="text-primary font-mono">pthread_mutex_lock()</code> performs an atomic 
              compare-and-swap (CAS) instruction in user space with <strong>0 syscalls</strong>. When contended, it calls 
              <code className="text-primary font-mono">sys_futex(FUTEX_WAIT)</code> to put the calling thread to sleep.
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={mutexLocked ? 'danger' : 'primary'}
                onClick={() => {
                  setMutexLocked(!mutexLocked);
                  setHighlightLine(mutexLocked ? 5 : 2);
                  addLog(mutexLocked ? 'pthread_mutex_unlock called. Lock released.' : 'pthread_mutex_lock acquired.');
                }}
                className="text-xs"
              >
                {mutexLocked ? 'Call pthread_mutex_unlock()' : 'Call pthread_mutex_lock()'}
              </Button>
            </div>
          </Card>

          <Card className="p-5 font-mono text-xs bg-slate-950 text-slate-300 border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-500 pb-2 border-b border-slate-800 font-sans font-semibold">
              Worker Thread C Routine:
            </div>
            {[
              { line: 1, code: 'void *worker(void *arg) {' },
              { line: 2, code: '    pthread_mutex_lock(&lock); // futex CAS' },
              { line: 3, code: '    // CRITICAL SECTION' },
              { line: 4, code: '    g_shared_total += work_units;' },
              { line: 5, code: '    pthread_mutex_unlock(&lock);' },
              { line: 6, code: '    return NULL;' },
              { line: 7, code: '}' },
            ].map((l) => (
              <div
                key={l.line}
                className={`px-2 py-1 rounded transition-colors ${
                  highlightLine === l.line ? 'bg-primary/30 text-white font-bold border-l-2 border-primary' : ''
                }`}
              >
                <span className="text-slate-600 mr-3">{l.line}</span>
                <code>{l.code}</code>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Tab 4: Counting & Binary Semaphores */}
      {activeTab === 'semaphore' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-foreground">
                {semType === 'counting' ? 'Counting Semaphore' : 'Binary Semaphore'} (sem_t)
              </h3>
              <Badge variant="info">Permits: {semPermits}</Badge>
            </div>

            <div className="flex bg-secondary p-1 rounded-xl text-xs">
              <button
                onClick={() => { setSemType('counting'); setSemPermits(3); }}
                className={`px-3 py-1 rounded-lg ${semType === 'counting' ? 'bg-card font-bold text-foreground' : 'text-muted-foreground'}`}
              >
                Counting (Max 3)
              </button>
              <button
                onClick={() => { setSemType('binary'); setSemPermits(1); }}
                className={`px-3 py-1 rounded-lg ${semType === 'binary' ? 'bg-card font-bold text-foreground' : 'text-muted-foreground'}`}
              >
                Binary (0 or 1)
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              size="sm"
              variant="primary"
              disabled={semPermits === 0}
              onClick={() => {
                setSemPermits(semPermits - 1);
                addLog(`sem_wait() decremented permits to ${semPermits - 1}.`);
              }}
              className="flex-1 text-xs"
            >
              sem_wait() (Acquire Permit)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={semType === 'binary' && semPermits >= 1}
              onClick={() => {
                const next = semType === 'binary' ? 1 : semPermits + 1;
                setSemPermits(next);
                addLog(`sem_post() incremented permits to ${next}.`);
              }}
              className="flex-1 text-xs"
            >
              sem_post() (Release Permit)
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 5: Producer-Consumer */}
      {activeTab === 'pc' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Bounded Buffer Producer–Consumer
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                <input
                  type="checkbox"
                  checked={syncCorruptMode}
                  onChange={(e) => setSyncCorruptMode(e.target.checked)}
                  className="rounded text-rose-500"
                />
                <span className="text-rose-500 font-semibold">Disable Semaphores (Corruption Mode)</span>
              </label>
              <Badge variant="outline">{buffer.length} / {bufferCapacity} Slots Filled</Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 py-2">
            {Array.from({ length: bufferCapacity }, (_, i) => {
              const item = buffer[i];
              return (
                <div
                  key={i}
                  className={`h-20 rounded-xl border flex flex-col items-center justify-center font-mono text-xs ${
                    item ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm' : 'bg-secondary/40 border-border/40 text-muted-foreground italic'
                  }`}
                >
                  {item || 'Empty Slot'}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button size="sm" variant="primary" onClick={handleProduce} className="flex-1 text-xs">
              Produce Item (sem_wait empty)
            </Button>
            <Button size="sm" variant="outline" onClick={handleConsume} className="flex-1 text-xs">
              Consume Item (sem_wait full)
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 6: Readers-Writers */}
      {activeTab === 'rw' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-bold text-base text-foreground">
              Readers–Writers Problem (Concurrency Rule)
            </h3>
            <Badge variant={activeWriter ? 'danger' : activeReaders > 0 ? 'info' : 'outline'}>
              {activeWriter ? 'Writer Active (Exclusive)' : activeReaders > 0 ? `${activeReaders} Readers Reading` : 'Memory Idle'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 space-y-2 text-xs">
              <span className="font-bold text-foreground">Readers Actions:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={activeWriter}
                  onClick={() => {
                    setActiveReaders(activeReaders + 1);
                    addLog(`Reader joined. Total active readers: ${activeReaders + 1}`);
                  }}
                  className="flex-1 text-xs"
                >
                  Reader Enter (+1)
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={activeReaders === 0}
                  onClick={() => {
                    setActiveReaders(Math.max(0, activeReaders - 1));
                    addLog(`Reader exited. Active readers: ${Math.max(0, activeReaders - 1)}`);
                  }}
                  className="flex-1 text-xs"
                >
                  Reader Exit (-1)
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 space-y-2 text-xs">
              <span className="font-bold text-foreground">Writer Actions:</span>
              <Button
                size="sm"
                variant={activeWriter ? 'danger' : 'primary'}
                disabled={activeReaders > 0 && !activeWriter}
                onClick={() => {
                  if (activeWriter) {
                    setActiveWriter(false);
                    addLog('Writer finished and exited.');
                  } else {
                    setActiveWriter(true);
                    addLog('Writer acquired exclusive lock.');
                  }
                }}
                className="w-full text-xs"
              >
                {activeWriter ? 'Writer Exit' : 'Writer Enter (Requires 0 Readers)'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Live Event Log & "Why It Matters" panel for all tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <h4 className="text-xs font-bold font-mono uppercase text-muted-foreground">
            Synchronization Event Log
          </h4>
          <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-muted-foreground">
            {eventLogs.map((log, i) => (
              <div key={i} className="truncate">• {log}</div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-2 bg-primary/5 border-primary/20">
          <h4 className="text-xs font-bold font-heading text-foreground">
            Why Synchronization Matters
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In symmetric multiprocessing, independent CPU cores have private L1/L2 caches and out-of-order execution pipelines. 
            Without proper synchronization barriers and mutexes, instruction reordering and race conditions cause silent data 
            corruption that is notoriously non-reproducible in production.
          </p>
        </Card>
      </div>
    </div>
  );
};
