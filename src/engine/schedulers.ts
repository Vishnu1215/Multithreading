export interface ProcessItem {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number; // lower number = higher priority
  color: string;
}

export interface GanttSegment {
  processId: string;
  processName: string;
  startTime: number;
  endTime: number;
  color: string;
}

export interface SchedulerMetrics {
  waitingTimes: Record<string, number>;
  turnaroundTimes: Record<string, number>;
  responseTimes: Record<string, number>;
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  throughput: number; // processes per unit time
  contextSwitches: number;
}

export interface SchedulerResult {
  gantt: GanttSegment[];
  metrics: SchedulerMetrics;
  policy: 'FCFS' | 'RR' | 'Priority' | 'SJF';
}

// 1. First-Come First-Served
export function scheduleFCFS(processes: ProcessItem[]): SchedulerResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttSegment[] = [];
  let currentTime = 0;
  const waitingTimes: Record<string, number> = {};
  const turnaroundTimes: Record<string, number> = {};
  const responseTimes: Record<string, number> = {};
  let contextSwitches = 0;

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    if (currentTime < p.arrivalTime) {
      currentTime = p.arrivalTime;
    }
    const startTime = currentTime;
    const endTime = startTime + p.burstTime;
    
    responseTimes[p.id] = startTime - p.arrivalTime;
    waitingTimes[p.id] = startTime - p.arrivalTime;
    turnaroundTimes[p.id] = endTime - p.arrivalTime;

    gantt.push({
      processId: p.id,
      processName: p.name,
      startTime,
      endTime,
      color: p.color,
    });

    currentTime = endTime;
    if (i < sorted.length - 1) contextSwitches++;
  }

  return computeResult(gantt, waitingTimes, turnaroundTimes, responseTimes, contextSwitches, 'FCFS', processes.length);
}

// 2. Shortest Job First (Supports Preemptive SRTF and Non-preemptive)
export function scheduleSJF(processes: ProcessItem[], preemptive: boolean = false): SchedulerResult {
  const n = processes.length;
  if (!preemptive) {
    const completed = new Set<string>();
    const gantt: GanttSegment[] = [];
    let currentTime = 0;
    const waitingTimes: Record<string, number> = {};
    const turnaroundTimes: Record<string, number> = {};
    const responseTimes: Record<string, number> = {};
    let contextSwitches = 0;

    while (completed.size < n) {
      const available = processes.filter(p => !completed.has(p.id) && p.arrivalTime <= currentTime);
      if (available.length === 0) {
        const uncompleted = processes.filter(p => !completed.has(p.id));
        currentTime = Math.min(...uncompleted.map(p => p.arrivalTime));
        continue;
      }

      available.sort((a, b) => a.burstTime - b.burstTime);
      const p = available[0];

      const startTime = currentTime;
      const endTime = startTime + p.burstTime;
      responseTimes[p.id] = startTime - p.arrivalTime;
      waitingTimes[p.id] = startTime - p.arrivalTime;
      turnaroundTimes[p.id] = endTime - p.arrivalTime;

      gantt.push({
        processId: p.id,
        processName: p.name,
        startTime,
        endTime,
        color: p.color,
      });

      completed.add(p.id);
      currentTime = endTime;
      if (completed.size < n) contextSwitches++;
    }

    return computeResult(gantt, waitingTimes, turnaroundTimes, responseTimes, contextSwitches, 'SJF', n);
  }

  // Preemptive SJF (Shortest Remaining Time First)
  const remaining = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  processes.forEach(p => remaining.set(p.id, p.burstTime));

  const gantt: GanttSegment[] = [];
  const waitingTimes: Record<string, number> = {};
  const turnaroundTimes: Record<string, number> = {};
  const responseTimes: Record<string, number> = {};
  let currentTime = 0;
  let completed = 0;
  let contextSwitches = 0;
  let lastProcessId: string | null = null;

  while (completed < n) {
    const available = processes.filter(p => p.arrivalTime <= currentTime && (remaining.get(p.id) ?? 0) > 0);
    if (available.length === 0) {
      currentTime++;
      continue;
    }

    available.sort((a, b) => (remaining.get(a.id) ?? 0) - (remaining.get(b.id) ?? 0));
    const curr = available[0];

    if (!firstSeen.has(curr.id)) {
      firstSeen.set(curr.id, currentTime);
      responseTimes[curr.id] = currentTime - curr.arrivalTime;
    }

    if (lastProcessId !== null && lastProcessId !== curr.id) {
      contextSwitches++;
    }
    lastProcessId = curr.id;

    const lastSeg = gantt[gantt.length - 1];
    if (lastSeg && lastSeg.processId === curr.id) {
      lastSeg.endTime += 1;
    } else {
      gantt.push({
        processId: curr.id,
        processName: curr.name,
        startTime: currentTime,
        endTime: currentTime + 1,
        color: curr.color,
      });
    }

    remaining.set(curr.id, (remaining.get(curr.id) ?? 0) - 1);
    currentTime++;

    if ((remaining.get(curr.id) ?? 0) === 0) {
      completed++;
      turnaroundTimes[curr.id] = currentTime - curr.arrivalTime;
      waitingTimes[curr.id] = turnaroundTimes[curr.id] - curr.burstTime;
    }
  }

  return computeResult(gantt, waitingTimes, turnaroundTimes, responseTimes, contextSwitches, 'SJF', n);
}

// 3. Priority Scheduling (Supports Preemptive and Non-preemptive)
export function schedulePriority(processes: ProcessItem[], preemptive: boolean = false): SchedulerResult {
  const n = processes.length;
  if (!preemptive) {
    const completed = new Set<string>();
    const gantt: GanttSegment[] = [];
    let currentTime = 0;
    const waitingTimes: Record<string, number> = {};
    const turnaroundTimes: Record<string, number> = {};
    const responseTimes: Record<string, number> = {};
    let contextSwitches = 0;

    while (completed.size < n) {
      const available = processes.filter(p => !completed.has(p.id) && p.arrivalTime <= currentTime);
      if (available.length === 0) {
        const uncompleted = processes.filter(p => !completed.has(p.id));
        currentTime = Math.min(...uncompleted.map(p => p.arrivalTime));
        continue;
      }

      available.sort((a, b) => a.priority - b.priority);
      const p = available[0];

      const startTime = currentTime;
      const endTime = startTime + p.burstTime;
      responseTimes[p.id] = startTime - p.arrivalTime;
      waitingTimes[p.id] = startTime - p.arrivalTime;
      turnaroundTimes[p.id] = endTime - p.arrivalTime;

      gantt.push({
        processId: p.id,
        processName: p.name,
        startTime,
        endTime,
        color: p.color,
      });

      completed.add(p.id);
      currentTime = endTime;
      if (completed.size < n) contextSwitches++;
    }

    return computeResult(gantt, waitingTimes, turnaroundTimes, responseTimes, contextSwitches, 'Priority', n);
  }

  // Preemptive Priority
  const remaining = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  processes.forEach(p => remaining.set(p.id, p.burstTime));

  const gantt: GanttSegment[] = [];
  const waitingTimes: Record<string, number> = {};
  const turnaroundTimes: Record<string, number> = {};
  const responseTimes: Record<string, number> = {};
  let currentTime = 0;
  let completed = 0;
  let contextSwitches = 0;
  let lastProcessId: string | null = null;

  while (completed < n) {
    const available = processes.filter(p => p.arrivalTime <= currentTime && (remaining.get(p.id) ?? 0) > 0);
    if (available.length === 0) {
      currentTime++;
      continue;
    }

    available.sort((a, b) => a.priority - b.priority);
    const curr = available[0];

    if (!firstSeen.has(curr.id)) {
      firstSeen.set(curr.id, currentTime);
      responseTimes[curr.id] = currentTime - curr.arrivalTime;
    }

    if (lastProcessId !== null && lastProcessId !== curr.id) {
      contextSwitches++;
    }
    lastProcessId = curr.id;

    const lastSeg = gantt[gantt.length - 1];
    if (lastSeg && lastSeg.processId === curr.id) {
      lastSeg.endTime += 1;
    } else {
      gantt.push({
        processId: curr.id,
        processName: curr.name,
        startTime: currentTime,
        endTime: currentTime + 1,
        color: curr.color,
      });
    }

    remaining.set(curr.id, (remaining.get(curr.id) ?? 0) - 1);
    currentTime++;

    if ((remaining.get(curr.id) ?? 0) === 0) {
      completed++;
      turnaroundTimes[curr.id] = currentTime - curr.arrivalTime;
      waitingTimes[curr.id] = turnaroundTimes[curr.id] - curr.burstTime;
    }
  }

  return computeResult(gantt, waitingTimes, turnaroundTimes, responseTimes, contextSwitches, 'Priority', n);
}

// 4. Round Robin
export function scheduleRR(processes: ProcessItem[], quantum: number = 4): SchedulerResult {
  const remainingBurst: Record<string, number> = {};
  processes.forEach(p => {
    remainingBurst[p.id] = p.burstTime;
  });

  const gantt: GanttSegment[] = [];
  const waitingTimes: Record<string, number> = {};
  const turnaroundTimes: Record<string, number> = {};
  const responseTimes: Record<string, number> = {};
  const firstSeen: Record<string, number> = {};

  let currentTime = 0;
  const readyQueue: ProcessItem[] = [];
  const inQueue = new Set<string>();
  let contextSwitches = 0;
  let completedCount = 0;
  const n = processes.length;

  const checkArrivals = (time: number) => {
    processes.forEach(p => {
      if (p.arrivalTime <= time && remainingBurst[p.id] > 0 && !inQueue.has(p.id) && !readyQueue.some(x => x.id === p.id)) {
        readyQueue.push(p);
      }
    });
  };

  checkArrivals(currentTime);

  while (completedCount < n) {
    if (readyQueue.length === 0) {
      const uncompleted = processes.filter(p => remainingBurst[p.id] > 0);
      if (uncompleted.length === 0) break;
      currentTime = Math.min(...uncompleted.map(p => p.arrivalTime));
      checkArrivals(currentTime);
      continue;
    }

    const currentProcess = readyQueue.shift()!;
    inQueue.delete(currentProcess.id);

    if (firstSeen[currentProcess.id] === undefined) {
      firstSeen[currentProcess.id] = currentTime;
      responseTimes[currentProcess.id] = currentTime - currentProcess.arrivalTime;
    }

    const execTime = Math.min(quantum, remainingBurst[currentProcess.id]);
    const startTime = currentTime;
    const endTime = startTime + execTime;

    gantt.push({
      processId: currentProcess.id,
      processName: currentProcess.name,
      startTime,
      endTime,
      color: currentProcess.color,
    });

    currentTime = endTime;
    remainingBurst[currentProcess.id] -= execTime;

    checkArrivals(currentTime);

    if (remainingBurst[currentProcess.id] > 0) {
      readyQueue.push(currentProcess);
      inQueue.add(currentProcess.id);
      contextSwitches++;
    } else {
      completedCount++;
      turnaroundTimes[currentProcess.id] = currentTime - currentProcess.arrivalTime;
      waitingTimes[currentProcess.id] = turnaroundTimes[currentProcess.id] - currentProcess.burstTime;
      if (completedCount < n) contextSwitches++;
    }
  }

  return computeResult(gantt, waitingTimes, turnaroundTimes, responseTimes, contextSwitches, 'RR', n);
}

function computeResult(
  gantt: GanttSegment[],
  waitingTimes: Record<string, number>,
  turnaroundTimes: Record<string, number>,
  responseTimes: Record<string, number>,
  contextSwitches: number,
  policy: 'FCFS' | 'RR' | 'Priority' | 'SJF',
  n: number
): SchedulerResult {
  const waitArr = Object.values(waitingTimes);
  const turnArr = Object.values(turnaroundTimes);
  const respArr = Object.values(responseTimes);

  const avgWaitingTime = Number((waitArr.reduce((a, b) => a + b, 0) / (n || 1)).toFixed(2));
  const avgTurnaroundTime = Number((turnArr.reduce((a, b) => a + b, 0) / (n || 1)).toFixed(2));
  const avgResponseTime = Number((respArr.reduce((a, b) => a + b, 0) / (n || 1)).toFixed(2));

  const totalTime = gantt.length > 0 ? gantt[gantt.length - 1].endTime : 1;
  const busyTime = gantt.reduce((acc, seg) => acc + (seg.endTime - seg.startTime), 0);
  const cpuUtilization = Number(Math.min(100, (busyTime / totalTime) * 100).toFixed(1));
  const throughput = Number((n / (totalTime || 1)).toFixed(3));

  return {
    gantt,
    policy,
    metrics: {
      waitingTimes,
      turnaroundTimes,
      responseTimes,
      avgWaitingTime,
      avgTurnaroundTime,
      avgResponseTime,
      cpuUtilization,
      throughput,
      contextSwitches,
    },
  };
}
