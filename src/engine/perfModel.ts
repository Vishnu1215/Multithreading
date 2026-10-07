import { SimulationConfig, SimulationMetrics, WorkloadType } from '../types/simulation';
import { createRNG, seededNoise } from '../lib/rng';

export interface WorkloadProfile {
  name: string;
  category: 'CPU-bound' | 'I/O-bound' | 'Mixed';
  parallelFraction: number; // p
  description: string;
  unitName: string;
  baseWorkUnits: Record<'Small' | 'Medium' | 'Large', number>;
  baseSerialTimeMs: Record<'Small' | 'Medium' | 'Large', number>;
  baseMemoryMb: number;
}

export const WORKLOAD_PROFILES: Record<WorkloadType, WorkloadProfile> = {
  matrix: {
    name: 'Matrix Multiplication',
    category: 'CPU-bound',
    parallelFraction: 0.95,
    description: 'Row-block decomposition of C = A × B (O(N³) complexity). High cache pressure and floating-point intensity.',
    unitName: 'blocks',
    baseWorkUnits: { Small: 256, Medium: 1024, Large: 4096 },
    baseSerialTimeMs: { Small: 1200, Medium: 3800, Large: 9600 },
    baseMemoryMb: 42,
  },
  prime: {
    name: 'Prime Number Search',
    category: 'CPU-bound',
    parallelFraction: 0.97,
    description: 'Sieve of Eratosthenes & trial division across ranges. Demonstrates load imbalance as larger ranges require more test cycles.',
    unitName: 'ranges',
    baseWorkUnits: { Small: 50000, Medium: 250000, Large: 1000000 },
    baseSerialTimeMs: { Small: 1400, Medium: 4200, Large: 11000 },
    baseMemoryMb: 24,
  },
  file: {
    name: 'File Processing (Log Grep)',
    category: 'I/O-bound',
    parallelFraction: 0.70,
    description: 'Log record indexing and regex matching. Significant time spent in TASK_UNINTERRUPTIBLE waiting on virtual disk read I/O.',
    unitName: 'chunks',
    baseWorkUnits: { Small: 500, Medium: 2000, Large: 8000 },
    baseSerialTimeMs: { Small: 900, Medium: 2600, Large: 6500 },
    baseMemoryMb: 85,
  },
  image: {
    name: 'Image Processing (Gaussian Blur)',
    category: 'Mixed',
    parallelFraction: 0.92,
    description: '2D Convolution filter split into horizontal strips with final barrier synchronization and border stitch merge.',
    unitName: 'tiles',
    baseWorkUnits: { Small: 64, Medium: 256, Large: 1024 },
    baseSerialTimeMs: { Small: 1100, Medium: 3200, Large: 8200 },
    baseMemoryMb: 68,
  },
};

export const THREAD_COLORS = [
  '#6366F1', // T1 Indigo
  '#EC4899', // T2 Pink
  '#10B981', // T3 Emerald
  '#F59E0B', // T4 Amber
  '#06B6D4', // T5 Cyan
  '#8B5CF6', // T6 Purple
  '#F97316', // T7 Orange
  '#14B8A6', // T8 Teal
];

export function calculateMetrics(config: SimulationConfig): SimulationMetrics {
  const profile = WORKLOAD_PROFILES[config.workload];
  const p = profile.parallelFraction;
  const tSerial = profile.baseSerialTimeMs[config.problemSize];
  const n = config.threadCount;
  const cores = config.cores;

  const rng = createRNG(config.seed + n * 13 + (config.workload.charCodeAt(0) * 7));
  const noise = seededNoise(rng, -0.025, 0.025);

  // Effective parallel cores executing at any moment
  const effectiveCores = Math.min(n, cores);

  // Amdahl theoretical calculation
  // S_theoretical = 1 / ((1 - p) + (p / n))
  const theoreticalSpeedup = 1 / ((1 - p) + (p / Math.min(n, cores)));

  // Realistic Linux Overheads:
  // 1. Thread creation cost: clone() syscall + NPTL stack allocation (~0.8ms per thread)
  const overheadCreate = n > 1 ? 2.5 + (n * 0.8) : 0;

  // 2. Context switch overhead: if n > cores, involuntary switches explode due to CFS timeslice preemption
  const isOversubscribed = n > cores;
  const oversubscriptionRatio = isOversubscribed ? n / cores : 1.0;
  
  // Context switches count
  const voluntaryCtxSwitches = Math.floor(
    (config.workload === 'file' ? 140 * n : 20 * n) + (config.syncMode !== 'None' ? 35 * n : 0)
  );
  
  const involuntaryCtxSwitches = Math.floor(
    isOversubscribed ? (n - cores) * 240 * (100 / config.quantum) : n * 12
  );
  const totalCtxSwitches = voluntaryCtxSwitches + involuntaryCtxSwitches;

  // Context switch time cost (~2.5 microseconds per switch in user+kernel space)
  const overheadCtx = (totalCtxSwitches * 0.0035);

  // 3. Contention overhead based on sync mode
  let contention = 0;
  if (config.syncMode === 'Mutex') {
    // futex lock contention scales with threads trying to acquire
    contention = n > 1 ? (Math.pow(n, 1.4) * 8.5) : 0;
  } else if (config.syncMode === 'Semaphore') {
    contention = n > 1 ? (Math.pow(n, 1.2) * 5.0) : 0;
  }

  // 4. Barrier & Merge phase overhead (stitching results)
  const overheadMerge = n > 1 ? (4.0 + (n * 1.5)) : 0;

  // 5. Workload-specific penalty: I/O bound disk saturation
  let ioSaturationPenalty = 0;
  if (config.workload === 'file' && n > 2) {
    // Disk queue saturation
    ioSaturationPenalty = (n - 2) * 120;
  }

  // 6. Prime load-imbalance tail penalty (some threads finish earlier, barrier wait)
  let loadImbalanceWait = 0;
  if (config.workload === 'prime' && n > 1) {
    loadImbalanceWait = (tSerial * p / effectiveCores) * 0.04;
  }

  // Total execution time formula:
  // T(n) = (Serial Part) + (Parallel Part / min(n, cores)) + Overheads
  let executionTimeMs = (
    (tSerial * (1 - p)) +
    ((tSerial * p) / effectiveCores) +
    overheadCreate +
    overheadCtx +
    contention +
    overheadMerge +
    ioSaturationPenalty +
    loadImbalanceWait
  ) * noise;

  // Ensure Single Thread has no multithreading overheads
  if (n === 1) {
    executionTimeMs = tSerial * noise;
  }

  // Baseline time (1 thread under default conditions)
  const baselineTimeMs = tSerial;

  // Derived metrics
  const speedup = n === 1 ? 1.0 : Math.max(0.1, Number((baselineTimeMs / executionTimeMs).toFixed(2)));
  const efficiency = n === 1 ? 100 : Math.min(100, Math.max(5, Number(((speedup / n) * 100).toFixed(1))));

  const totalWorkUnits = profile.baseWorkUnits[config.problemSize];
  const throughput = Math.round((totalWorkUnits / (executionTimeMs / 1000)));
  const latencyMs = Number((executionTimeMs / totalWorkUnits * (config.workload === 'file' ? 10 : 1)).toFixed(2));

  // CPU utilization: on oversubscription or heavy sync, some core cycles are lost to kernel futex/sched
  let cpuUtilization = 0;
  if (n === 1) {
    cpuUtilization = Math.round(100 / cores); // 1 core saturated on 4 cores = 25%
  } else {
    const rawUtil = (Math.min(n, cores) / cores) * 100;
    const efficiencyFactor = efficiency / 100;
    cpuUtilization = Math.min(99.4, Math.round(rawUtil * (0.65 + 0.35 * efficiencyFactor)));
  }

  // Memory calculation: Virtual and RSS (Resident Set Size)
  // Shared base memory + (n * 8MB virtual pthread stack)
  const threadStackVirtBytes = 8 * 1024 * 1024; // 8MB Linux default stack limit
  const memoryVirtualBytes = (profile.baseMemoryMb * 1024 * 1024) + (n * threadStackVirtBytes);
  // RSS is actual committed pages: shared data + ~350KB per active thread stack
  const memoryRssBytes = (profile.baseMemoryMb * 1024 * 1024 * 0.7) + (n * 380 * 1024);

  // Scalability score (0 - 100): based on efficiency retention and Amdahl adherence
  const scalabilityScore = Math.min(100, Math.max(10, Math.round(
    (efficiency * 0.7) + ((speedup / Math.min(n, cores)) * 30)
  )));

  return {
    executionTimeMs: Math.round(executionTimeMs),
    baselineTimeMs: Math.round(baselineTimeMs),
    speedup,
    efficiency,
    throughput,
    latencyMs,
    cpuUtilization,
    memoryRssBytes: Math.round(memoryRssBytes),
    memoryVirtualBytes: Math.round(memoryVirtualBytes),
    voluntaryCtxSwitches,
    involuntaryCtxSwitches,
    totalCtxSwitches,
    scalabilityScore,
    parallelFraction: p,
    serialFraction: Number((1 - p).toFixed(2)),
    idealSpeedup: Number(theoreticalSpeedup.toFixed(2)),
  };
}
