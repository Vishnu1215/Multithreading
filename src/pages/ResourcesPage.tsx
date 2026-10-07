import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Database, Lock, Unlock, Server, ShieldCheck, Plus, Minus } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [mutexOwner, setMutexOwner] = useState<number | null>(1); // Thread 1 holds mutex
  const [mutexQueue, setMutexQueue] = useState<number[]>([2, 3]); // Threads 2, 3 waiting
  const [semaphorePermits, setSemaphorePermits] = useState<number>(2); // 2 permits out of 3
  const [semaphoreQueue, setSemaphoreQueue] = useState<number[]>([4]); // Thread 4 waiting

  // Mutex Actions
  const handleAcquireMutex = (threadId: number) => {
    if (mutexOwner === null) {
      setMutexOwner(threadId);
    } else if (mutexOwner !== threadId && !mutexQueue.includes(threadId)) {
      setMutexQueue([...mutexQueue, threadId]);
    }
  };

  const handleReleaseMutex = () => {
    if (mutexQueue.length > 0) {
      const next = mutexQueue[0];
      setMutexOwner(next);
      setMutexQueue(mutexQueue.slice(1));
    } else {
      setMutexOwner(null);
    }
  };

  // Semaphore Actions
  const handleWaitSemaphore = (threadId: number) => {
    if (semaphorePermits > 0) {
      setSemaphorePermits(semaphorePermits - 1);
    } else if (!semaphoreQueue.includes(threadId)) {
      setSemaphoreQueue([...semaphoreQueue, threadId]);
    }
  };

  const handlePostSemaphore = () => {
    if (semaphoreQueue.length > 0) {
      setSemaphoreQueue(semaphoreQueue.slice(1));
    } else {
      setSemaphorePermits(Math.min(3, semaphorePermits + 1));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Memory Segments & Concurrency Synchronization</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            Resource Allocation Visualizer
          </h1>
          <p className="text-xs text-muted-foreground">
            Observe shared memory blocks, thread-local private stacks, futex mutex ownership, and counting semaphores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="info">Linux futex(2) Backed</Badge>
        </div>
      </div>

      {/* Memory Space & Locking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MUTEX LOCK CONTROLLER */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <h3 className="font-heading font-semibold text-sm text-foreground">
                POSIX Mutex Lock (pthread_mutex_t)
              </h3>
            </div>
            <Badge variant={mutexOwner !== null ? 'warning' : 'success'}>
              {mutexOwner !== null ? 'Locked' : 'Unlocked'}
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Current Lock Holder:</div>
              <div className="text-base font-bold font-mono text-foreground mt-0.5">
                {mutexOwner !== null ? (
                  <span className="text-indigo-400">Thread {mutexOwner} (Holding lock &g_mutex)</span>
                ) : (
                  <span className="text-emerald-500 font-normal">None (Uncontended)</span>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant={mutexOwner !== null ? 'danger' : 'outline'}
              disabled={mutexOwner === null}
              onClick={handleReleaseMutex}
              className="gap-1.5 text-xs"
            >
              <Unlock className="w-3.5 h-3.5" /> pthread_mutex_unlock()
            </Button>
          </div>

          {/* Waiting Queue */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>futex Waiting Queue:</span>
              <span>{mutexQueue.length} Threads Sleeping</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/40 min-h-12 flex items-center gap-2 overflow-x-auto">
              {mutexQueue.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">No threads waiting in hash bucket</span>
              ) : (
                mutexQueue.map((tid) => (
                  <span
                    key={tid}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 font-mono text-xs font-bold"
                  >
                    Thread {tid} (Sleeping)
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Trigger Request Buttons */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Request Lock as:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((id) => (
                <button
                  key={id}
                  onClick={() => handleAcquireMutex(id)}
                  disabled={mutexOwner === id}
                  className="flex-1 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-mono font-medium border border-border/50 disabled:opacity-40"
                >
                  T{id} Request
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* COUNTING SEMAPHORE */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Counting Semaphore (sem_t)
              </h3>
            </div>
            <Badge variant="info">Capacity: 3 Max</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Available Token Permits:</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">
                {semaphorePermits} <span className="text-xs text-muted-foreground font-normal">/ 3 permits</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePostSemaphore} className="gap-1 text-xs">
                <Plus className="w-3.5 h-3.5" /> sem_post()
              </Button>
            </div>
          </div>

          {/* Semaphore Wait Queue */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>Blocked Threads:</span>
              <span>{semaphoreQueue.length} Blocked</span>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/40 min-h-12 flex items-center gap-2 overflow-x-auto">
              {semaphoreQueue.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">No threads blocked</span>
              ) : (
                semaphoreQueue.map((tid) => (
                  <span
                    key={tid}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 font-mono text-xs font-bold"
                  >
                    Thread {tid} (sem_wait blocked)
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Trigger Wait Buttons */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Call sem_wait() as:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((id) => (
                <button
                  key={id}
                  onClick={() => handleWaitSemaphore(id)}
                  className="flex-1 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-mono font-medium border border-border/50"
                >
                  T{id} Wait
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
