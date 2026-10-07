export interface Question {
  id: number;
  question: string;
  category: 'Process vs Thread' | 'Scheduling' | 'Synchronization' | 'Deadlock' | 'Linux Internals';
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'In the Linux operating system, which system call is used under the hood to implement pthread_create()?',
    category: 'Linux Internals',
    options: ['fork()', 'clone()', 'vfork()', 'execve()'],
    correctIndex: 1,
    explanation: 'The NPTL implementation of pthread_create() invokes the clone() system call with flags like CLONE_VM, CLONE_FS, CLONE_FILES, and CLONE_THREAD to create a thread sharing the parent address space.',
  },
  {
    id: 2,
    question: 'What is the primary difference in memory layout between two processes versus two threads in the same process?',
    category: 'Process vs Thread',
    options: [
      'Threads share CPU registers, processes do not',
      'Threads share the heap and data segments, but each has a private stack',
      'Processes share the heap, threads have isolated address spaces',
      'Threads share their execution stacks but isolate the heap'
    ],
    correctIndex: 1,
    explanation: 'Threads within the same process share the Text, Data, BSS, and Heap segments, but maintain independent private stacks and register contexts (including the program counter).',
  },
  {
    id: 3,
    question: 'What does Amdahl’s Law predict when the parallel portion of an algorithm (p) is 90% and infinite CPU cores are available?',
    category: 'Scheduling',
    options: ['Infinite speedup', '10× maximum theoretical speedup', '90× maximum theoretical speedup', '100× maximum theoretical speedup'],
    correctIndex: 1,
    explanation: 'As n approaches infinity, S = 1 / (1 - p). With p = 0.90, S_max = 1 / (1 - 0.90) = 1 / 0.10 = 10×.',
  },
  {
    id: 4,
    question: 'Which of the following is NOT one of the four Coffman conditions necessary for a deadlock to occur?',
    category: 'Deadlock',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Aging and Preemption', 'Circular Wait'],
    correctIndex: 2,
    explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Aging is a scheduling starvation prevention technique.',
  },
  {
    id: 5,
    question: 'What is a "futex" in modern Linux multithreading synchronization?',
    category: 'Linux Internals',
    options: [
      'A hardware instruction exclusively on ARM processors',
      'Fast User-space Mutex: uncontended locks require zero syscalls, sleeping only when contended',
      'A replacement for the CPU Translation Lookaside Buffer',
      'A real-time kernel thread scheduler'
    ],
    correctIndex: 1,
    explanation: 'futex (Fast Userspace muTEX) allows user-space atomic CAS operations for uncontended acquisitions without kernel context switches, invoking the sys_futex() system call only upon lock contention.',
  },
  {
    id: 6,
    question: 'What causes the phenomenon of "oversubscription" in multithreaded systems?',
    category: 'Scheduling',
    options: [
      'Allocating more virtual memory than swap space',
      'Running more active runnable threads than available physical/virtual CPU cores',
      'Creating more semaphores than mutexes',
      'Compiling with -O3 instead of -O2'
    ],
    correctIndex: 1,
    explanation: 'Oversubscription occurs when the number of active runnable threads exceeds the number of physical CPU execution cores, inducing heavy involuntary context switching.',
  },
  {
    id: 7,
    question: 'In Linux CFS (Completely Fair Scheduler), how does the kernel determine which task to pick next?',
    category: 'Linux Internals',
    options: [
      'The task with the highest PID',
      'The task with the lowest vruntime (virtual runtime) in the red-black tree',
      'Strict round-robin with fixed 10ms quantum',
      'The task with the largest RSS memory'
    ],
    correctIndex: 1,
    explanation: 'CFS tracks each task virtual execution time (vruntime) in a red-black tree and always dispatches the leftmost node (the task that has executed least).',
  },
  {
    id: 8,
    question: 'Why does an I/O-bound workload (like file grep) experience flat scaling beyond 2 threads on typical storage?',
    category: 'Process vs Thread',
    options: [
      'Threads refuse to run on odd-numbered cores',
      'The storage hardware queue and disk bandwidth saturate, causing threads to block in TASK_UNINTERRUPTIBLE',
      'Linux kernel disallows multithreading on files',
      'Context switches drop to zero'
    ],
    correctIndex: 1,
    explanation: 'Disk controllers and physical block I/O have bounded throughput. Adding threads saturates the I/O request queue, leaving threads blocked in wait states rather than executing computations.',
  },
  {
    id: 9,
    question: 'What is the threading model implemented by Linux NPTL?',
    category: 'Linux Internals',
    options: ['1:1 Kernel-Level Threading', 'M:N Hybrid Threading', 'M:1 User-Level Threading (Green threads)', 'None of the above'],
    correctIndex: 0,
    explanation: 'Modern Linux NPTL uses a 1:1 model where each pthread corresponds directly to a kernel-scheduled task_struct entity.',
  },
  {
    id: 10,
    question: 'In a counting semaphore with an initial value of 3, what happens when 4 consecutive threads call sem_wait()?',
    category: 'Synchronization',
    options: [
      'The program aborts with SIGSEGV',
      'The first 3 threads proceed immediately; the 4th thread blocks until sem_post() is called',
      'All 4 threads proceed concurrently with degraded priority',
      'The semaphore value becomes -1 and returns an error'
    ],
    correctIndex: 1,
    explanation: 'A counting semaphore decrements its permit count. When the count reaches 0, subsequent calling threads are placed on the sleep wait queue until another thread posts a permit.',
  },
];
