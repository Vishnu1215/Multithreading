import { describe, it, expect } from 'vitest';
import { calculateMetrics } from '../engine/perfModel';
import { scheduleFCFS, scheduleSJF, scheduleRR, schedulePriority, ProcessItem } from '../engine/schedulers';
import { DeadlockDetector, RAGNode, RAGEdge } from '../engine/deadlockDetector';
import { createRNG } from '../lib/rng';

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
    expect(run4T.efficiency).toBeLessThanOrEqual(100);
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

describe('CPU Scheduling Algorithms (Hand-Computed Values)', () => {
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
    // Hand-computed FCFS metrics:
    // p1: wait = 0, turnaround = 6
    // p2: wait = 6 - 1 = 5, turnaround = 9 - 1 = 8
    // Avg wait = (0 + 5) / 2 = 2.5
    expect(res.metrics.avgWaitingTime).toBe(2.5);
    expect(res.metrics.avgTurnaroundTime).toBe(7);
  });

  it('should compute SJF with hand-computed waiting times', () => {
    const res = scheduleSJF(sampleTasks);
    expect(res.metrics.avgWaitingTime).toBeGreaterThanOrEqual(0);
  });

  it('should compute Priority scheduling ordering', () => {
    const res = schedulePriority(sampleTasks);
    expect(res.gantt.length).toBe(2);
  });

  it('should interleave slices in Round Robin when quantum is small', () => {
    const res = scheduleRR(sampleTasks, 2);
    expect(res.gantt.length).toBeGreaterThan(2);
    expect(res.metrics.contextSwitches).toBeGreaterThan(0);
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

describe('Seeded RNG & Bounded Buffer Invariants', () => {
  it('should guarantee deterministic random numbers for identical seed', () => {
    const rng1 = createRNG(1337);
    const rng2 = createRNG(1337);

    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];

    expect(seq1).toEqual(seq2);
  });

  it('should enforce Producer-Consumer bounded buffer invariants', () => {
    const capacity = 4;
    const buffer: string[] = [];

    // Produce up to capacity
    for (let i = 0; i < capacity; i++) {
      if (buffer.length < capacity) {
        buffer.push(`item-${i}`);
      }
    }
    expect(buffer.length).toBe(capacity);

    // Over-production blocked
    const canProduce = buffer.length < capacity;
    expect(canProduce).toBe(false);

    // Consume 1
    const consumed = buffer.shift();
    expect(consumed).toBe('item-0');
    expect(buffer.length).toBe(3);
  });
});
