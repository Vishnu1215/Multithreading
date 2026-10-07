import { RunResult, SimulationConfig, WorkloadType } from '../types/simulation';
import { calculateMetrics, WORKLOAD_PROFILES } from './perfModel';

export const BENCHMARK_RUNS: RunResult[] = [];

const workloads: WorkloadType[] = ['matrix', 'prime', 'file', 'image'];
const threadCounts: (1 | 2 | 4 | 8)[] = [1, 2, 4, 8];

let idCounter = 1;

for (const workload of workloads) {
  for (const threadCount of threadCounts) {
    const config: SimulationConfig = {
      threadCount,
      workload,
      problemSize: 'Medium',
      cores: 4,
      schedulerPolicy: 'RR',
      quantum: 20,
      syncMode: 'Mutex',
      speed: 1,
      seed: 42 + threadCount * 7,
    };

    const metrics = calculateMetrics(config);

    BENCHMARK_RUNS.push({
      id: `bench-${idCounter++}`,
      timestamp: new Date(Date.now() - (1000 * 60 * 60 * 24 * (5 - threadCount))).toISOString(),
      config,
      metrics,
      eventsCount: 45 + threadCount * 12,
      workloadName: WORKLOAD_PROFILES[workload].name,
      notes: `Pre-computed benchmark baseline on 4-Core Linux kernel 6.6 with NPTL.`,
    });
  }
}
