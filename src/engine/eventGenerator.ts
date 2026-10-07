import { SimulationEvent, SimulationConfig, ThreadTask, CoreStatus, LifecycleEventType } from '../types/simulation';
import { WORKLOAD_PROFILES, THREAD_COLORS } from './perfModel';

export class SimulationEventGenerator {
  public static generateEvents(config: SimulationConfig, durationMs: number): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    let eventId = 1;
    const n = config.threadCount;
    const cores = config.cores;
    const profile = WORKLOAD_PROFILES[config.workload];

    const addEvent = (
      relTime: number,
      threadId: number,
      type: LifecycleEventType,
      message: string,
      level: 'info' | 'warn' | 'success' | 'debug' = 'info'
    ) => {
      const coreId = (threadId - 1) % cores;
      events.push({
        id: `ev-${eventId++}`,
        timestamp: Math.round(relTime * 100) / 100,
        threadId,
        tid: 2840 + threadId,
        coreId,
        type,
        message,
        level,
      });
    };

    // Phase 1: Main process splitting
    addEvent(0.0, 1, 'THREAD_READY', `PID 2840 (main): Task splitting initialized for ${profile.name}. Work units: ${profile.baseWorkUnits[config.problemSize]}`);

    // Phase 2: clone() calls
    for (let i = 1; i <= n; i++) {
      const cloneTime = 0.5 + (i * 0.8);
      if (i === 1) {
        addEvent(cloneTime, i, 'THREAD_CREATE', `Main thread T1 (TID 2841) designated worker`);
      } else {
        addEvent(
          cloneTime,
          i,
          'THREAD_CREATE',
          `sys_clone(CLONE_VM|CLONE_FS|CLONE_FILES|CLONE_SIGHAND|CLONE_THREAD) spawned T${i} (TID ${2840 + i})`
        );
      }
      addEvent(cloneTime + 0.3, i, 'THREAD_READY', `Thread T${i} enqueued to CFS red-black tree (cfs_rq)`);
    }

    // Phase 3: Scheduling onto virtual cores
    for (let i = 1; i <= n; i++) {
      const coreId = (i - 1) % cores;
      const schedTime = 2.0 + (i * 0.4);
      addEvent(
        schedTime,
        i,
        'SCHEDULED_ON_CORE',
        `CFS pick_next_task: Thread T${i} dispatched to CPU Core ${coreId} (vruntime normalized)`
      );
      addEvent(schedTime + 0.2, i, 'RUNNING', `Thread T${i} entered user space execution loop`);
    }

    // Phase 4: Mid-execution events (I/O, locks, or context preemption)
    const midDuration = durationMs * 0.4;
    if (config.workload === 'file') {
      for (let i = 1; i <= n; i++) {
        const ioTime = midDuration + (i * 8.0);
        addEvent(ioTime, i, 'BLOCKED_IO', `T${i} executed sys_read: block device wait -> state TASK_UNINTERRUPTIBLE`, 'warn');
        addEvent(ioTime + 18.0, i, 'RUNNING', `T${i} disk DMA buffer ready: irq delivered -> state TASK_RUNNING`);
      }
    } else if (config.syncMode === 'Mutex' && n > 1) {
      for (let i = 1; i <= Math.min(n, 4); i++) {
        const lockTime = midDuration + (i * 12.0);
        if (i % 2 === 0) {
          addEvent(lockTime, i, 'LOCK_WAIT', `T${i} futex wait: contention on mutex &g_lock -> sleep in futex_hash_bucket`, 'warn');
          addEvent(lockTime + 10.0, i, 'LOCK_ACQUIRE', `T${i} futex_wake: acquired mutex &g_lock`);
          addEvent(lockTime + 14.0, i, 'LOCK_RELEASE', `T${i} unlocked mutex &g_lock -> zero syscall overhead (uncontended exit)`);
        }
      }
    }

    if (n > cores) {
      // Oversubscription preemption events
      for (let i = cores + 1; i <= n; i++) {
        const preemptTime = midDuration + (i * 6.5);
        addEvent(preemptTime, i - cores, 'PREEMPTED', `CFS tick: T${i - cores} time quantum expired. Context switch (save regs)`, 'debug');
        addEvent(preemptTime + 0.1, i, 'SCHEDULED_ON_CORE', `CPU context switched: T${i} scheduled (load regs)`, 'info');
      }
    }

    // Phase 5: Barrier & pthread_join
    const barrierStart = durationMs * 0.85;
    for (let i = 1; i <= n; i++) {
      const exitTime = barrierStart + (i * (config.workload === 'prime' ? 6.0 : 2.5));
      addEvent(exitTime, i, 'BARRIER_SYNC', `T${i} reached pthread_barrier_wait() / completion`);
    }

    addEvent(durationMs * 0.94, 1, 'MERGE', `pthread_join completed across all ${n} worker threads. Aggregating chunks.`);

    for (let i = 1; i <= n; i++) {
      addEvent(durationMs * 0.97 + (i * 0.3), i, 'THREAD_EXIT', `T${i} returned 0: sys_exit_group() clean cleanup`);
    }

    addEvent(durationMs, 1, 'RESOURCE_RELEASE', `Address space reclaimed. Execution finished successfully.`, 'success');

    return events.sort((a, b) => a.timestamp - b.timestamp);
  }

  public static initializeThreads(config: SimulationConfig): ThreadTask[] {
    const profile = WORKLOAD_PROFILES[config.workload];
    const totalUnits = profile.baseWorkUnits[config.problemSize];
    const perThreadUnits = Math.floor(totalUnits / config.threadCount);

    return Array.from({ length: config.threadCount }, (_, i) => {
      const id = i + 1;
      return {
        threadId: id,
        tid: 2840 + id,
        coreId: (id - 1) % config.cores,
        state: 'Ready',
        linuxState: 'TASK_RUNNING',
        progress: 0,
        workUnitsDone: 0,
        totalWorkUnits: perThreadUnits,
        voluntaryCtxSwitches: config.workload === 'file' ? 14 : 2,
        involuntaryCtxSwitches: config.threadCount > config.cores ? 24 : 1,
        color: THREAD_COLORS[(id - 1) % THREAD_COLORS.length],
        name: `Thread ${id}`,
        currentFunction: config.workload === 'matrix' ? 'matmul_worker()' : config.workload === 'prime' ? 'sieve_range()' : config.workload === 'file' ? 'grep_block()' : 'convolve_strip()',
      };
    });
  }

  public static initializeCores(coresCount: number): CoreStatus[] {
    return Array.from({ length: coresCount }, (_, i) => ({
      id: i,
      threadId: null,
      utilization: 0,
      frequencyGhz: 3.2,
      temperatureC: 42,
      cState: 'C1',
    }));
  }
}
