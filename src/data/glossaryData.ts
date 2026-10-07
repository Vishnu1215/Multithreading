export interface GlossaryTerm {
  term: string;
  category: 'OS Core' | 'Threading' | 'Linux Internals';
  definition: string;
  example: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'clone()',
    category: 'Linux Internals',
    definition: 'A Linux-specific system call that creates a new child execution context, controlling whether the parent address space, file table, and signals are shared.',
    example: 'clone(child_fn, stack, CLONE_VM | CLONE_FILES | CLONE_THREAD, arg);',
  },
  {
    term: 'NPTL',
    category: 'Linux Internals',
    definition: 'Native POSIX Thread Library: The standard 1:1 threading implementation for Linux replacing LinuxThreads, offering high performance via kernel futexes.',
    example: 'Integrated into glibc on all modern Linux distributions.',
  },
  {
    term: 'CFS',
    category: 'Linux Internals',
    definition: 'Completely Fair Scheduler: The default Linux process scheduler utilizing a red-black tree indexed by virtual runtime (vruntime) to allocate CPU proportions.',
    example: 'kernel/sched/fair.c in Linux source tree.',
  },
  {
    term: 'futex',
    category: 'Linux Internals',
    definition: 'Fast Userspace Mutex: An OS primitive providing user-space atomic lock acquisition without syscall overhead, falling back to sys_futex() only on contention.',
    example: 'Powers pthread_mutex_lock() and sem_wait().',
  },
  {
    term: 'PCB / TCB',
    category: 'OS Core',
    definition: 'Process Control Block and Thread Control Block: Kernel data structures storing PID, registers, stack pointer, priority, and state (struct task_struct in Linux).',
    example: 'Stored in kernel slab allocators.',
  },
  {
    term: 'Context Switch',
    category: 'OS Core',
    definition: 'The hardware and kernel procedure of saving the CPU register state of a currently executing thread and loading the saved register state of another thread.',
    example: 'Takes ~1.5 to 4 microseconds on modern x86_64 cores.',
  },
  {
    term: 'Amdahl\'s Law',
    category: 'Threading',
    definition: 'A formula determining the maximum theoretical speedup of an algorithm when partitioned across multiple execution units, limited by the sequential fraction.',
    example: 'S(n) = 1 / ((1 - p) + (p / n)).',
  },
  {
    term: 'Oversubscription',
    category: 'Threading',
    definition: 'Running more active, computationally intensive runnable threads than available physical/virtual hardware processor cores, resulting in scheduling degradation.',
    example: 'Running 8 CPU-bound threads on a 4-core machine.',
  },
  {
    term: 'Race Condition',
    category: 'Threading',
    definition: 'A software bug where the output is dependent on the nondeterministic interleaving and timing of multiple concurrent threads accessing shared memory.',
    example: 'Two threads concurrently executing g_counter++ without a mutex.',
  },
  {
    term: 'Deadlock',
    category: 'OS Core',
    definition: 'A permanent standstill where a set of processes or threads are blocked because each holds a resource and waits for another resource held by another member.',
    example: 'Thread 1 holds R1 and wants R2; Thread 2 holds R2 and wants R1.',
  },
  {
    term: 'Coffman Conditions',
    category: 'OS Core',
    definition: 'Four conditions that must hold simultaneously for a deadlock to exist: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
    example: 'Breaking any single condition prevents system deadlock.',
  },
  {
    term: 'Resource Allocation Graph',
    category: 'OS Core',
    definition: 'A directed graph consisting of thread vertices and resource vertices, where request edges and assignment edges indicate allocation dependencies.',
    example: 'A cycle in a single-instance RAG indicates a guaranteed deadlock.',
  },
  {
    term: 'Memory Barrier',
    category: 'Threading',
    definition: 'A CPU hardware instruction that enforces an ordering constraint on memory operations issued before and after the barrier.',
    example: 'mfence / sfence / lfence instructions on x86_64.',
  },
  {
    term: 'False Sharing',
    category: 'Threading',
    definition: 'A performance degradation where threads on separate cores modify independent variables that reside within the same 64-byte CPU cache line.',
    example: 'Solved by aligning thread-local variables to alignas(64).',
  },
  {
    term: 'Thundering Herd',
    category: 'OS Core',
    definition: 'A scenario where a large number of waiting processes or threads are awakened simultaneously by an event, but only one can win the resource.',
    example: 'Mitigated by EPOLLEXCLUSIVE in modern Linux epoll.',
  },
  {
    term: 'C-States',
    category: 'OS Core',
    definition: 'Processor power-saving idle states ranging from C0 (active execution) to C6/C7 (deep sleep with power gates).',
    example: 'Idle cores enter C6 to save thermal budget and power.',
  },
  {
    term: 'TLS (Thread-Local Storage)',
    category: 'Threading',
    definition: 'A static or dynamic memory storage duration where each thread has its own dedicated copy of a variable.',
    example: '__thread int per_thread_buffer in C/C++.',
  },
  {
    term: 'cgroups',
    category: 'Linux Internals',
    definition: 'Control Groups: A Linux kernel feature that isolates, prioritizes, and limits the resource usage (CPU, memory, disk I/O) of task collections.',
    example: 'Forms the architectural foundation of Docker and Kubernetes.',
  },
  {
    term: 'vruntime',
    category: 'Linux Internals',
    definition: 'Virtual Runtime: A 64-bit nanosecond counter maintained by Linux CFS tracking how much CPU time a task has consumed, scaled by nice priority.',
    example: 'Tasks with smaller vruntime are placed leftmost in the CFS rbtree.',
  },
  {
    term: 'taskset',
    category: 'Linux Internals',
    definition: 'A Linux utility used to retrieve or set the CPU affinity of an active process or thread, pinning it to designated silicon cores.',
    example: 'taskset -c 0,1 ./threadlab_engine pins tasks to cores 0 and 1.',
  },
];
