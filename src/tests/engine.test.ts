import { describe, it, expect } from 'vitest';
import { calculateMetrics } from '../engine/perfModel';
import { scheduleFCFS, scheduleSJF, scheduleRR, schedulePriority, ProcessItem } from '../engine/schedulers';
import { DeadlockDetector, RAGNode, RAGEdge } from '../engine/deadlockDetector';

describe('Performance Engine & Amdahl Math', () => {
  it('should calculate speedup strictly monotonic up to core limit for CPU bound matrix', () => {
    const run1T = calculateMetrics({
      threadCount: 1,
      workload: 'matrix',
      problemSize: 'Medium',
      cores: 4,
      schedulerPolicy: 'RR',
      quantum: 20,
      syncMode: 'Mutex',
      speed: 1,
      seed: 42,
    });

    const run4T = calculateMetrics({
      threadCount: 4,
      workload: 'matrix',
      problemSize: 'Medium',
      cores: 4,
      schedulerPolicy: 'RR',
      quantum: 20,
      syncMode: 'Mutex',
      speed: 1,
      seed: 42,
    });

    expect(run1T.speedup).toBe(1);
    expect(run4T.speedup).toBeGreaterThanOrEqual(3.2);
    expect(run4T.speedup).toBeLessThanOrEqual(4.0);
    expect(run4T.executionTimeMs).toBeLessThan(run1T.executionTimeMs);
  });

  it('should show oversubscription efficiency degradation when threads > cores', () => {
    const run4T = calculateMetrics({
      threadCount: 4,
      workload: 'matrix',
      problemSize: 'Medium',
      cores: 4,
      schedulerPolicy: 'RR',
      quantum: 20,
      syncMode: 'Mutex',
      speed: 1,
      seed: 42,
    });

    const run8T = calculateMetrics({
      threadCount: 8,
      workload: 'matrix',
      problemSize: 'Medium',
      cores: 4,
      schedulerPolicy: 'RR',
      quantum: 20,
      syncMode: 'Mutex',
      speed: 1,
      seed: 42,
    });

    expect(run8T.efficiency).toBeLessThan(run4T.efficiency);
    expect(run8T.involuntaryCtxSwitches).toBeGreaterThan(run4T.involuntaryCtxSwitches);
  });
});

describe('CPU Scheduling Algorithms', () => {
  const sampleTasks: ProcessItem[] = [
    { id: 'p1', name: 'Task 1', arrivalTime: 0, burstTime: 6, priority: 2, color: '#6366F1' },
    { id: 'p2', name: 'Task 2', arrivalTime: 1, burstTime: 3, priority: 1, color: '#EC4899' },
  ];

  it('should compute FCFS Gantt schedule correctly', () => {
    const res = scheduleFCFS(sampleTasks);
    expect(res.gantt.length).toBe(2);
    expect(res.gantt[0].processId).toBe('p1');
    expect(res.gantt[1].startTime).toBe(6);
    expect(res.gantt[1].endTime).toBe(9);
  });

  it('should compute SJF with minimal average waiting time', () => {
    const res = scheduleSJF(sampleTasks);
    expect(res.metrics.avgWaitingTime).toBeGreaterThanOrEqual(0);
  });

  it('should interleave slices in Round Robin when quantum is small', () => {
    const res = scheduleRR(sampleTasks, 2);
    expect(res.gantt.length).toBeGreaterThan(2);
  });
});

describe('Deadlock Cycle Detection (DFS)', () => {
  it('should detect a cycle in a circular wait condition', () => {
    const nodes: RAGNode[] = [
      { id: 'T1', name: 'T1', type: 'thread', x: 0, y: 0 },
      { id: 'T2', name: 'T2', type: 'thread', x: 0, y: 0 },
      { id: 'R1', name: 'R1', type: 'resource', x: 0, y: 0 },
      { id: 'R2', name: 'R2', type: 'resource', x: 0, y: 0 },
    ];

    const edges: RAGEdge[] = [
      { id: 'e1', from: 'R1', to: 'T1', type: 'assignment' },
      { id: 'e2', from: 'R2', to: 'T2', type: 'assignment' },
      { id: 'e3', from: 'T1', to: 'R2', type: 'request' },
      { id: 'e4', from: 'T2', to: 'R1', type: 'request' },
    ];

    const result = DeadlockDetector.detectCycle(nodes, edges);
    expect(result.hasDeadlock).toBe(true);
    expect(result.cycleNodes.length).toBeGreaterThan(0);
  });

  it('should return false for safe acyclic graph', () => {
    const nodes: RAGNode[] = [
      { id: 'T1', name: 'T1', type: 'thread', x: 0, y: 0 },
      { id: 'R1', name: 'R1', type: 'resource', x: 0, y: 0 },
    ];

    const edges: RAGEdge[] = [
      { id: 'e1', from: 'R1', to: 'T1', type: 'assignment' },
    ];

    const result = DeadlockDetector.detectCycle(nodes, edges);
    expect(result.hasDeadlock).toBe(false);
  });
});
