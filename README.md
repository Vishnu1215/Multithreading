# ThreadLab Linux 🐧
> **Analysis of Multithreading in Linux: Performance Evaluation of Single-Threaded and Multi-Threaded Applications**

ThreadLab Linux is an interactive, production-quality operating systems web platform and performance evaluation suite for Linux multithreading. It models the **Linux Native POSIX Thread Library (NPTL 1:1 kernel model)**, the **Completely Fair Scheduler (CFS)** and **EEVDF**, **futex** synchronization primitives, and **Amdahl's Law** scaling limits.

Built with **React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, and Vitest**.

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
Executes comprehensive unit tests covering:
- Amdahl's Law mathematical bounds & speedup monotonicity
- Oversubscription efficiency degradation & involuntary context switch counting
- Hand-computed waiting and turnaround times for FCFS, Round Robin (RR), Priority, and Shortest Job First (SJF / SRTF)
- Directed cycle detection (DFS) on Resource Allocation Graphs (RAG)
- Seeded pseudo-random number generator (Mulberry32) determinism
- Bounded-buffer producer-consumer capacity and invariant assertions

### 4. Run Code Linter (ESLint 9 Flat Config)
```bash
npm run lint
```
Strict type-checking and accessibility compliance (`eslint-plugin-jsx-a11y`, `eslint-plugin-react-hooks`, `@typescript-eslint`) with zero errors and zero warnings.

### 5. Build for Production
```bash
npm run build
```
Generates production bundles with code splitting and lazy loading via Vite 6.4.4.

---

## 🗺️ Architectural Map & Module Breakdown

1. **`/` — Overview & Hero**: Animated silicon preview, side-by-side single vs multi-thread race, and interactive author modal.
2. **`/learn` — Concepts Primer**: Interactive memory-layout explainer (isolated process address spaces vs shared heap/data with private 8MB thread stacks).
3. **`/simulator` — Interactive Simulator**: 5-phase pipeline stepper (Splitting → `clone()` creation → Execution → Barrier Sync → Merge), presets, and real-time dmesg kernel logs.
4. **`/cpu` — CPU Core Visualization**: Stylized processor die with C-states, core frequency, CFS runqueue stack, Concurrency vs Parallelism toggle, and context switch µs cost telemetry.
5. **`/scheduler` — Scheduler & CFS**: Interactive Gantt charts for FCFS, RR (quantum slider), Priority (Preemptive & Non-preemptive), and SJF / SRTF with computed wait and turnaround metrics, plus side-by-side policy ranking.
6. **`/lifecycle` — Thread Lifecycle**: Interactive finite-state machine (New, Ready, Running, Waiting, Terminated) mapped to Linux kernel `TASK_RUNNING`, `TASK_UNINTERRUPTIBLE`, and `EXIT_ZOMBIE`.
7. **`/dashboard` — Performance Dashboard**: Bento metrics grid with hardware SVG arc gauges, live streaming CPU/Memory area charts, and baseline deltas.
8. **`/compare` — Workload Comparison**: Side-by-side scaling comparison across 1T, 2T, 4T, and 8T, Amdahl linear references, and automated scaling bottleneck insights.
9. **`/timeline` — Live Timeline**: Horizontal swim-lanes per thread with replay scrubber, zoom controls (0.75x–2x), follow-live toggle, and searchable event stream.
10. **`/resources` — Memory & Resources**: Live `pthread_mutex_t` and `sem_t` permit counters, address space visualizer, and waiting queue inspection.
11. **`/deadlock` — Deadlock & RAG**: Guided 4-step lock inversion, animated DFS cycle detection, Coffman checklist, Recovery tab (Kill, Preempt, Rollback), Prevention tab (Lock Ordering & Banker's Algorithm), and Free-form RAG graph editor.
12. **`/sync` — Synchronization Labs (All 6 Labs)**: 1) Lost-Update Race Condition, 2) Critical Section Anatomy, 3) Mutex & C routine line highlights, 4) Counting & Binary Semaphores, 5) Bounded Buffer Producer-Consumer with corruption mode, 6) Readers-Writers preference.
13. **`/monitor` — Linux Monitor (CLI)**: Terminal window featuring authentic `htop` CPU meters, classic `top` task manager, `perf stat` hardware counters, `perf top` hotspot symbols, `dmesg` search/filter viewer, and interactive bash commands with command history (Up/Down) and Tab auto-completion.
14. **`/graphs` — Interactive Graphs (All 6 Telemetry Metrics)**: Execution Time, Speedup, CPU Utilization, Efficiency, Memory RSS, and Scalability Score vs Threads with data table toggle and Amdahl asymptote explorer.
15. **`/case-study` — Academic Technical Report**: Long-form typeset article covering problem statement, methodology, experimental setup, formulas, and references.
16. **`/quiz` — Knowledge Assessment**: 21-question evaluation engine with Quick (5), Standard (10), and Challenge (20) modes, streak counter, hints, and per-category radar chart.
17. **`/report` — Report Export**: Live A4 printable document preview with multi-page PDF generation via `jsPDF`, CSV export, PNG screenshot capture, and JSZip bundle download.
18. **`/help` — Help & Glossary**: Searchable 63-term OS dictionary with A-Z jump bar, category filters, FAQ accordion, keyboard shortcuts cheat sheet, and 5-minute faculty walkthrough demo script.

---

## 🎓 Faculty 5-Minute Demonstration Script

- **Minute 0:00 - 0:45**: Visit `/` (Landing Page). Highlight the side-by-side race showing the sequential worker vs 4 simultaneous workers. Open the **Autopilot Demo** from the top bar for automated hands-free narration.
- **Minute 0:45 - 2:00**: Navigate to `/simulator`. Select **Matrix Multiplication** with 4 threads. Press **Run Simulation** and trace the 5 execution phases.
- **Minute 2:00 - 3:00**: Switch to `/cpu`. Increase thread count to 8 to trigger **Oversubscription** and point out the involuntary context switch indicator and C-state idle indicators. Toggle **Concurrency vs Parallelism** to see time slicing on a single core.
- **Minute 3:00 - 4:00**: Open `/sync`. Run the **1,000 Concurrent Increments** with mutex disabled to demonstrate data corruption, then enable `pthread_mutex_lock` to verify the fix. Open `/deadlock` to show cycle detection on the RAG and test recovery.
- **Minute 4:00 - 5:00**: Switch to `/monitor` to demonstrate `htop`, `perf top`, and the interactive bash shell (`lscpu`, `ps -eLf`, `run --threads 4`). Finish on `/report` and click **Download PDF Report** or **Download ZIP** for the complete export bundle.

---

## 📋 Comprehensive Audit Verification
See [`AUDIT.md`](file:///c:/Users/harip_new/Multithreading/AUDIT.md) for the complete item-by-item verification matrix and evidence records.
