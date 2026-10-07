# ThreadLab Linux 🐧
> **Analysis of Multithreading in Linux: Performance Evaluation of Single-Threaded and Multi-Threaded Applications**

ThreadLab Linux is an interactive, production-quality operating systems web platform and performance evaluation suite for Linux multithreading. It models the **Linux Native POSIX Thread Library (NPTL 1:1 kernel model)**, the **Completely Fair Scheduler (CFS)**, **futex** synchronization primitives, and **Amdahl's Law** scaling limits.

Built with **React 18, TypeScript, Tailwind CSS, Recharts, and Vitest**.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The app will launch locally at `http://localhost:3000`.

### 3. Run Unit Tests (Vitest)
```bash
npm run test
```
Executes tests covering:
- Amdahl's Law mathematical formulations & speedup monotonicity
- Oversubscription degradation & involuntary context switch counting
- FCFS, Round Robin (RR), Priority, and Shortest Job First (SJF) scheduling algorithms
- Directed cycle detection (DFS) on Resource Allocation Graphs (RAG)

### 4. Build for Production
```bash
npm run build
```

---

## 🗺️ Architectural Map & Module Breakdown

1. **`/` — Overview & Hero**: Animated silicon preview, side-by-side single vs multi-thread race, and bento grid.
2. **`/learn` — Concepts Primer**: Interactive memory-layout explainer (isolated process address spaces vs shared heap/data with private thread stacks).
3. **`/simulator` — Interactive Simulator**: 5-phase pipeline stepper (Splitting → `clone()` creation → Execution → Barrier Sync → Merge), presets, and real-time dmesg logs.
4. **`/cpu` — CPU Core Visualization**: Stylized processor die with C-states, core frequency, CFS runqueue stack, and context switch telemetry.
5. **`/scheduler` — Scheduler & CFS**: Interactive Gantt charts for FCFS, RR (quantum slider), Priority, and SJF with computed wait and turnaround metrics.
6. **`/lifecycle` — Thread Lifecycle**: Interactive finite-state machine (New, Ready, Running, Waiting, Terminated) mapped to Linux kernel `TASK_RUNNING`, `TASK_UNINTERRUPTIBLE`, and `EXIT_ZOMBIE`.
7. **`/dashboard` — Performance Dashboard**: Bento metrics grid with hardware SVG arc gauges, live streaming CPU/Memory area charts, and baseline deltas.
8. **`/compare` — Workload Comparison**: Side-by-side scaling comparison across 1T, 2T, 4T, and 8T, Amdahl linear references, and automated scaling insights.
9. **`/timeline` — Live Timeline**: Horizontal swim-lanes per thread and timestamped lifecycle event stream.
10. **`/resources` — Memory & Resources**: Live `pthread_mutex_t` and `sem_t` permit counters and waiting queue inspection.
11. **`/deadlock` — Deadlock & RAG**: Directed SVG graph with cycle detection, the 4 Coffman conditions checklist, and recovery methods.
12. **`/sync` — Synchronization Labs**: Lost-update race condition simulation (corrupting 1,000 increments without mutex), critical sections, and bounded buffers.
13. **`/monitor` — Linux Monitor (CLI)**: Terminal window featuring authentic `htop` CPU meters, `perf stat` hardware counters, and interactive bash commands (`help`, `uptime`, `run --threads 4`).
14. **`/graphs` — Interactive Graphs**: Amdahl's Law formula explorer with interactive sliders for parallel fraction `p` and core counts.
15. **`/case-study` — Academic Technical Report**: Long-form typeset article covering problem statement, methodology, experimental setup, and references.
16. **`/quiz` — Knowledge Quiz**: 10-question evaluation engine with instant feedback, explanations, and score review.
17. **`/report` — Report Export**: Live A4 printable document preview with multi-page PDF generation via `jsPDF` and CSV data export.
18. **`/help` — Help & Glossary**: Searchable 20+ term OS dictionary with a recommended 5-minute faculty walkthrough demo script.

---

## 🎓 Faculty 5-Minute Demonstration Script

- **Minute 0:00 - 0:45**: Visit `/` (Landing Page). Highlight the side-by-side race showing the sequential worker vs 4 simultaneous workers.
- **Minute 0:45 - 2:00**: Navigate to `/simulator`. Select **Matrix Multiplication** with 4 threads. Press **Run Simulation** and trace the 5 execution phases.
- **Minute 2:00 - 3:00**: Switch to `/cpu`. Increase thread count to 8 to trigger **Oversubscription** and point out the involuntary context switch indicator and C-state idle indicators.
- **Minute 3:00 - 4:00**: Open `/sync`. Run the **1,000 Concurrent Increments** with mutex disabled to demonstrate data corruption, then enable `pthread_mutex_lock` to verify the fix. Open `/deadlock` to show cycle detection on the RAG.
- **Minute 4:00 - 5:00**: Go to `/report` and click **Download PDF Report** to produce the multi-page academic document.
