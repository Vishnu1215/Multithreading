export type WorkloadType = 'matrix' | 'prime' | 'file' | 'image';
export type ProblemSize = 'Small' | 'Medium' | 'Large';
export type SchedulerPolicy = 'FCFS' | 'RR' | 'Priority' | 'SJF';
export type SyncMode = 'None' | 'Mutex' | 'Semaphore';

export type ThreadState = 'New' | 'Ready' | 'Running' | 'Waiting' | 'Terminated';

export interface SimulationConfig {
  threadCount: 1 | 2 | 4 | 8;
  workload: WorkloadType;
  problemSize: ProblemSize;
  cores: 2 | 4 | 8;
  schedulerPolicy: SchedulerPolicy;
  quantum: number; // for Round Robin in ms
  syncMode: SyncMode;
  speed: number; // 0.25 | 0.5 | 1 | 2 | 4
  seed: number;
}

export interface ThreadTask {
  threadId: number; // 1 to 8
  tid: number; // simulated Linux TID, e.g., 2048 + id
  coreId: number; // 0 to cores-1, or -1 if unassigned
  state: ThreadState;
  linuxState: 'TASK_RUNNING' | 'TASK_INTERRUPTIBLE' | 'TASK_UNINTERRUPTIBLE' | 'TASK_STOPPED' | 'EXIT_ZOMBIE' | 'EXIT_DEAD';
  progress: number; // 0 to 100
  workUnitsDone: number;
  totalWorkUnits: number;
  voluntaryCtxSwitches: number;
  involuntaryCtxSwitches: number;
  color: string;
  name: string;
  currentFunction: string;
}

export type LifecycleEventType =
  | 'THREAD_CREATE'
  | 'THREAD_READY'
  | 'SCHEDULED_ON_CORE'
  | 'RUNNING'
  | 'BLOCKED_IO'
  | 'LOCK_WAIT'
  | 'LOCK_ACQUIRE'
  | 'LOCK_RELEASE'
  | 'PREEMPTED'
  | 'BARRIER_SYNC'
  | 'MERGE'
  | 'THREAD_EXIT'
  | 'RESOURCE_RELEASE';

export interface SimulationEvent {
  id: string;
  timestamp: number; // relative simulated ms, e.g., 14.50
  threadId: number;
  tid: number;
  coreId: number;
  type: LifecycleEventType;
  message: string;
  level: 'info' | 'warn' | 'success' | 'debug';
}

export interface CoreStatus {
  id: number;
  threadId: number | null; // null if idle
  utilization: number; // 0 to 100
  frequencyGhz: number; // e.g., 3.2
  temperatureC: number;
  cState: 'C0' | 'C1' | 'C6';
}

export interface SimulationMetrics {
  executionTimeMs: number;
  baselineTimeMs: number;
  speedup: number;
  efficiency: number; // 0 to 100%
  throughput: number; // ops/s
  latencyMs: number;
  cpuUtilization: number; // aggregate 0 to 100%
  memoryRssBytes: number;
  memoryVirtualBytes: number;
  voluntaryCtxSwitches: number;
  involuntaryCtxSwitches: number;
  totalCtxSwitches: number;
  scalabilityScore: number; // 0 to 100
  parallelFraction: number; // p
  serialFraction: number; // 1 - p
  idealSpeedup: number; // Amdahl limit
}

export interface RunResult {
  id: string;
  timestamp: string;
  config: SimulationConfig;
  metrics: SimulationMetrics;
  eventsCount: number;
  workloadName: string;
  notes?: string;
}
