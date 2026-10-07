import { create } from 'zustand';
import { 
  SimulationConfig, 
  ThreadTask, 
  CoreStatus, 
  SimulationEvent, 
  SimulationMetrics, 
  RunResult 
} from '../types/simulation';
import { calculateMetrics, WORKLOAD_PROFILES } from '../engine/perfModel';
import { SimulationEventGenerator } from '../engine/eventGenerator';
import { BENCHMARK_RUNS } from '../engine/benchmarkSeed';

export interface AuthorProfile {
  studentName: string;
  rollNo: string;
  guideName: string;
  courseName: string;
}

interface SimulationState {
  // Theme & presentation
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  presentationMode: boolean;
  setPresentationMode: (val: boolean) => void;

  // Author details
  author: AuthorProfile;
  setAuthor: (author: Partial<AuthorProfile>) => void;

  // Active Simulation Config
  config: SimulationConfig;
  setConfig: (config: Partial<SimulationConfig>) => void;

  // Simulation Execution State
  status: 'idle' | 'running' | 'paused' | 'completed';
  progress: number; // 0 to 100
  elapsedSimMs: number;
  totalSimDurationMs: number;

  // Live entities
  threads: ThreadTask[];
  cores: CoreStatus[];
  events: SimulationEvent[];
  currentPhase: number; // 1 to 5 (Task Splitting, Creation, Exec, Sync, Merge)
  explanationText: string;
  explanationMode: 'beginner' | 'expert';
  setExplanationMode: (mode: 'beginner' | 'expert') => void;

  // Metrics
  currentMetrics: SimulationMetrics;
  history: RunResult[];
  selectedHistoryId: string | null;

  // Tour & Autopilot
  tourActive: boolean;
  setTourActive: (active: boolean) => void;
  autopilotOpen: boolean;
  setAutopilotOpen: (open: boolean) => void;

  // Quiz persistence
  quizBestScore: number;
  setQuizBestScore: (score: number) => void;

  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  setSelectedHistoryId: (id: string | null) => void;
  clearHistory: () => void;

  // Live tick driver
  tick: (deltaRealMs: number) => void;
}

const defaultConfig: SimulationConfig = {
  threadCount: 4,
  workload: 'matrix',
  problemSize: 'Medium',
  cores: 4,
  schedulerPolicy: 'RR',
  quantum: 20,
  syncMode: 'Mutex',
  speed: 1,
  seed: 42,
};

const initialMetrics = calculateMetrics(defaultConfig);

export const useSimulationStore = create<SimulationState>((set, get) => ({
  theme: (localStorage.getItem('threadlab_theme') as 'dark' | 'light') || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('threadlab_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  presentationMode: false,
  setPresentationMode: (val) => set({ presentationMode: val }),

  tourActive: false,
  setTourActive: (active) => set({ tourActive: active }),

  autopilotOpen: false,
  setAutopilotOpen: (open) => set({ autopilotOpen: open }),

  quizBestScore: parseInt(localStorage.getItem('threadlab_quiz_best') || '0', 10),
  setQuizBestScore: (score) => {
    localStorage.setItem('threadlab_quiz_best', score.toString());
    set({ quizBestScore: score });
  },

  author: {
    studentName: 'Hariprasad S.',
    rollNo: 'CS-2026-M042',
    guideName: 'Dr. V. K. Ramanathan, Dept of Computer Science',
    courseName: 'CS402: Operating Systems & Advanced Architecture',
  },
  setAuthor: (newFields) => set((s) => ({ author: { ...s.author, ...newFields } })),

  config: defaultConfig,
  setConfig: (partial) => {
    const updated = { ...get().config, ...partial };
    const metrics = calculateMetrics(updated);
    set({
      config: updated,
      currentMetrics: metrics,
      threads: SimulationEventGenerator.initializeThreads(updated),
      cores: SimulationEventGenerator.initializeCores(updated.cores),
    });
  },

  status: 'idle',
  progress: 0,
  elapsedSimMs: 0,
  totalSimDurationMs: 1200,

  threads: SimulationEventGenerator.initializeThreads(defaultConfig),
  cores: SimulationEventGenerator.initializeCores(defaultConfig.cores),
  events: [],
  currentPhase: 1,
  explanationText: 'Ready to launch. Click "Run Simulation" or choose a benchmark preset to begin.',
  explanationMode: 'beginner',
  setExplanationMode: (mode) => set({ explanationMode: mode }),

  currentMetrics: initialMetrics,
  history: [...BENCHMARK_RUNS],
  selectedHistoryId: null,
  setSelectedHistoryId: (id) => set({ selectedHistoryId: id }),
  clearHistory: () => set({ history: [] }),

  startSimulation: () => {
    const { config } = get();
    const metrics = calculateMetrics(config);
    const duration = Math.min(3500, Math.max(900, metrics.executionTimeMs * 0.4));
    const allEvents = SimulationEventGenerator.generateEvents(config, duration);

    set({
      status: 'running',
      progress: 0,
      elapsedSimMs: 0,
      totalSimDurationMs: duration,
      currentMetrics: metrics,
      events: allEvents.slice(0, 4),
      threads: SimulationEventGenerator.initializeThreads(config),
      cores: SimulationEventGenerator.initializeCores(config.cores),
      currentPhase: 1,
      explanationText: getExplanation(1, config, get().explanationMode),
    });
  },

  pauseSimulation: () => set({ status: 'paused' }),
  resumeSimulation: () => set({ status: 'running' }),

  resetSimulation: () => {
    const { config } = get();
    set({
      status: 'idle',
      progress: 0,
      elapsedSimMs: 0,
      currentPhase: 1,
      threads: SimulationEventGenerator.initializeThreads(config),
      cores: SimulationEventGenerator.initializeCores(config.cores),
      events: [],
      explanationText: 'Simulation reset. Ready for new configuration.',
    });
  },

  stepSimulation: () => {
    const { progress } = get();
    if (progress >= 100) return;
    get().tick(150);
  },

  tick: (deltaRealMs: number) => {
    const state = get();
    if (state.status !== 'running') return;

    const simDelta = deltaRealMs * state.config.speed;
    const newElapsed = state.elapsedSimMs + simDelta;
    const duration = state.totalSimDurationMs;
    const newProgress = Math.min(100, (newElapsed / duration) * 100);

    // Determine current phase: 1 to 5
    let phase = 1;
    if (newProgress < 15) phase = 1; // Splitting
    else if (newProgress < 30) phase = 2; // Creation
    else if (newProgress < 80) phase = 3; // Exec
    else if (newProgress < 95) phase = 4; // Sync
    else phase = 5; // Merge

    // Update threads progress
    const updatedThreads = state.threads.map((t, idx) => {
      let tProgress = 0;
      let tState: ThreadTask['state'] = 'Ready';
      let lState: ThreadTask['linuxState'] = 'TASK_RUNNING';

      if (phase === 1) {
        tProgress = 0;
        tState = 'New';
        lState = 'TASK_INTERRUPTIBLE';
      } else if (phase === 2) {
        tProgress = 5;
        tState = 'Ready';
        lState = 'TASK_RUNNING';
      } else if (phase === 3) {
        const baseNorm = (newProgress - 30) / 50; // 0 to 1
        // Add thread slight variance
        const variance = (idx % 2 === 0 ? 0.05 : -0.05);
        tProgress = Math.min(95, Math.max(0, Math.round((baseNorm + variance) * 100)));
        tState = 'Running';
        lState = 'TASK_RUNNING';
        if (state.config.workload === 'file' && idx % 2 === 1 && newProgress > 45 && newProgress < 65) {
          tState = 'Waiting';
          lState = 'TASK_UNINTERRUPTIBLE';
        }
      } else if (phase === 4) {
        tProgress = 98;
        tState = 'Waiting';
        lState = 'TASK_INTERRUPTIBLE';
      } else {
        tProgress = 100;
        tState = 'Terminated';
        lState = 'EXIT_DEAD';
      }

      return {
        ...t,
        progress: tProgress,
        workUnitsDone: Math.round((tProgress / 100) * t.totalWorkUnits),
        state: tState,
        linuxState: lState,
      };
    });

    // Update Cores
    const activeRunningCount = updatedThreads.filter(t => t.state === 'Running').length;
    const updatedCores = state.cores.map((c) => {
      const isCoreBusy = c.id < activeRunningCount;
      const assignedThread = updatedThreads.find(t => t.coreId === c.id && t.state === 'Running');
      return {
        ...c,
        threadId: assignedThread ? assignedThread.threadId : null,
        utilization: isCoreBusy ? Math.min(99, 85 + (c.id * 3)) : 0,
        cState: isCoreBusy ? ('C0' as const) : ('C6' as const),
      };
    });

    // Generate events stream based on progress
    const allEvents = SimulationEventGenerator.generateEvents(state.config, duration);
    const visibleEvents = allEvents.filter(e => e.timestamp <= newElapsed);

    if (newProgress >= 100) {
      // Completed! Save to history
      const newResult: RunResult = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        config: state.config,
        metrics: state.currentMetrics,
        eventsCount: allEvents.length,
        workloadName: WORKLOAD_PROFILES[state.config.workload].name,
        notes: `Simulated run with ${state.config.threadCount} threads on ${state.config.cores} cores.`,
      };

      set({
        status: 'completed',
        progress: 100,
        elapsedSimMs: duration,
        currentPhase: 5,
        threads: updatedThreads,
        cores: updatedCores,
        events: allEvents,
        explanationText: getExplanation(5, state.config, state.explanationMode),
        history: [newResult, ...state.history],
      });
    } else {
      set({
        progress: newProgress,
        elapsedSimMs: newElapsed,
        currentPhase: phase,
        threads: updatedThreads,
        cores: updatedCores,
        events: visibleEvents,
        explanationText: getExplanation(phase, state.config, state.explanationMode),
      });
    }
  },
}));

function getExplanation(phase: number, config: SimulationConfig, mode: 'beginner' | 'expert'): string {
  const n = config.threadCount;
  const name = WORKLOAD_PROFILES[config.workload].name;

  if (mode === 'beginner') {
    switch (phase) {
      case 1:
        return `Step 1: The computer divides the ${name} into ${n} equal pieces so workers can tackle them together.`;
      case 2:
        return `Step 2: Operating system starts ${n} threads. Each gets its own tiny scratchpad (stack) but shares memory.`;
      case 3:
        return `Step 3: Workers run simultaneously on available CPU cores. Watch how work finishes in parallel!`;
      case 4:
        return `Step 4: Faster workers wait at the finish barrier for slower ones to catch up before combining results.`;
      case 5:
        return `Step 5: All pieces are merged into the final answer. Resources are freed. Done!`;
      default:
        return '';
    }
  } else {
    switch (phase) {
      case 1:
        return `Partitioning: Parent PID splits data buffer into ${n} contiguous chunks. Cache lines aligned to 64 bytes.`;
      case 2:
        return `sys_clone: Calling clone(CLONE_VM|CLONE_FS|CLONE_FILES|CLONE_SIGHAND|CLONE_THREAD). NPTL allocates 8MB virtual stacks.`;
      case 3:
        return `CFS Scheduling: Linux Completely Fair Scheduler assigns tasks to cfs_rq. Priority and vruntime determine timeslices.`;
      case 4:
        return `futex & Barrier: Threads invoke pthread_barrier_wait(). Contended locks call sys_futex(FUTEX_WAIT).`;
      case 5:
        return `sys_exit_group: Child TIDs terminated. Parent executes pthread_join() and reclaims stack VMA pages.`;
      default:
        return '';
    }
  }
}
