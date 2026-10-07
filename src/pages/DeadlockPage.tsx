import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Controls';
import { 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Scissors,
  Lock,
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  RAGNode, 
  RAGEdge, 
  DeadlockDetector, 
  DeadlockCycleResult 
} from '@/engine/deadlockDetector';

export const DeadlockPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guided' | 'recovery' | 'prevention' | 'freeform'>('guided');
  const [step, setStep] = useState<number>(0);

  // Recovery state
  const [recoveryMethod, setRecoveryMethod] = useState<'none' | 'terminate' | 'preempt' | 'rollback'>('none');

  // Prevention Banker's algorithm demo state
  const [availableUnits, setAvailableUnits] = useState<number>(3);
  const [allocatedT1, setAllocatedT1] = useState<number>(2);
  const [allocatedT2, setAllocatedT2] = useState<number>(1);
  const [maxT1] = useState<number>(4);
  const [maxT2] = useState<number>(3);

  // Free-form RAG state
  const [freeNodes, setFreeNodes] = useState<RAGNode[]>([
    { id: 'T1', name: 'Thread 1', type: 'thread', x: 100, y: 150 },
    { id: 'T2', name: 'Thread 2', type: 'thread', x: 400, y: 150 },
    { id: 'R1', name: 'Resource 1', type: 'resource', x: 250, y: 80 },
    { id: 'R2', name: 'Resource 2', type: 'resource', x: 250, y: 220 },
  ]);
  const [freeEdges, setFreeEdges] = useState<RAGEdge[]>([
    { id: 'fe1', from: 'R1', to: 'T1', type: 'assignment' },
    { id: 'fe2', from: 'R2', to: 'T2', type: 'assignment' },
  ]);

  // Guided RAG nodes
  const nodes: RAGNode[] = [
    { id: 'T1', name: 'Thread 1', type: 'thread', x: 120, y: 150 },
    { id: 'T2', name: 'Thread 2', type: 'thread', x: 440, y: 150 },
    { id: 'R1', name: 'Mutex R1', type: 'resource', x: 280, y: 80 },
    { id: 'R2', name: 'Mutex R2', type: 'resource', x: 280, y: 220 },
  ];

  const getEdges = (): RAGEdge[] => {
    let edges: RAGEdge[] = [];
    if (step >= 1) edges.push({ id: 'e1', from: 'R1', to: 'T1', type: 'assignment' });
    if (step >= 2) edges.push({ id: 'e2', from: 'R2', to: 'T2', type: 'assignment' });
    if (step >= 3) edges.push({ id: 'e3', from: 'T1', to: 'R2', type: 'request' });
    if (step >= 4) edges.push({ id: 'e4', from: 'T2', to: 'R1', type: 'request' });

    // Handle Recovery options breaking cycle
    if (recoveryMethod === 'terminate') {
      // Thread 2 killed -> removes e2 and e4
      edges = edges.filter(e => e.to !== 'T2' && e.from !== 'T2');
    } else if (recoveryMethod === 'preempt') {
      // Preempt R1 from T1 -> removes e1
      edges = edges.filter(e => e.id !== 'e1');
    } else if (recoveryMethod === 'rollback') {
      // Rollback T2 request -> removes e4
      edges = edges.filter(e => e.id !== 'e4');
    }

    return edges;
  };

  const currentEdges = getEdges();
  const detectionResult: DeadlockCycleResult = DeadlockDetector.detectCycle(nodes, currentEdges);
  const freeDetectionResult: DeadlockCycleResult = DeadlockDetector.detectCycle(freeNodes, freeEdges);

  // Freeform handlers
  const handleAddEdge = (from: string, to: string) => {
    const fromNode = freeNodes.find(n => n.id === from);
    const toNode = freeNodes.find(n => n.id === to);
    if (!fromNode || !toNode) return;
    const type = fromNode.type === 'thread' ? 'request' : 'assignment';
    const newEdge: RAGEdge = {
      id: `fe-${Date.now()}`,
      from,
      to,
      type,
    };
    setFreeEdges([...freeEdges, newEdge]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Resource Allocation Graph (RAG) & Coffman Conditions</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Deadlock Demonstration</h1>
          <p className="text-xs text-muted-foreground">
            Step through lock inversion, run DFS cycle discovery on the RAG, examine Recovery, and test Banker's algorithm prevention.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          items={[
            { id: 'guided', label: '1. Guided RAG Cycle' },
            { id: 'recovery', label: '2. Deadlock Recovery' },
            { id: 'prevention', label: '3. Prevention & Banker\'s' },
            { id: 'freeform', label: '4. Free-Form RAG Editor' },
          ]}
        />
      </div>

      {/* Tab 1: Guided Classic RAG Cycle */}
      {activeTab === 'guided' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  Resource Allocation Graph (SVG Directed Digraph)
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  Circles = Threads • Rectangles = Resources
                </span>
              </div>

              {/* SVG Diagram Canvas */}
              <div className="relative h-80 w-full bg-secondary/30 rounded-2xl flex items-center justify-center border border-border/40">
                <svg width="560" height="300" viewBox="0 0 560 300" className="overflow-visible">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366F1" />
                    </marker>
                    <marker id="arrow-deadlock" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {currentEdges.map((e) => {
                    const fromNode = nodes.find((n) => n.id === e.from)!;
                    const toNode = nodes.find((n) => n.id === e.to)!;
                    const isCycleEdge = detectionResult.hasDeadlock && detectionResult.cycleEdges.includes(e.id);

                    return (
                      <line
                        key={e.id}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isCycleEdge ? '#EF4444' : '#6366F1'}
                        strokeWidth={isCycleEdge ? '3.5' : '2'}
                        strokeDasharray={e.type === 'request' ? '5,5' : 'none'}
                        markerEnd={isCycleEdge ? 'url(#arrow-deadlock)' : 'url(#arrow)'}
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((node) => {
                    const isThread = node.type === 'thread';
                    const isCycleNode = detectionResult.hasDeadlock && detectionResult.cycleNodes.includes(node.id);

                    return (
                      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                        {isThread ? (
                          <circle
                            r="28"
                            fill={isCycleNode ? '#EF4444' : '#0F172A'}
                            stroke={isCycleNode ? '#EF4444' : '#6366F1'}
                            strokeWidth="2.5"
                            filter={isCycleNode ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))' : 'none'}
                          />
                        ) : (
                          <rect
                            x="-28"
                            y="-24"
                            width="56"
                            height="48"
                            rx="8"
                            fill={isCycleNode ? '#EF4444' : '#1E293B'}
                            stroke={isCycleNode ? '#EF4444' : '#22D3EE'}
                            strokeWidth="2.5"
                            filter={isCycleNode ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))' : 'none'}
                          />
                        )}
                        <text
                          textAnchor="middle"
                          dy=".3em"
                          fill="#FFFFFF"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {detectionResult.hasDeadlock && (
                  <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div className="p-4 rounded-2xl bg-card border border-rose-500 shadow-2xl flex items-center gap-3 animate-in zoom-in">
                      <ShieldAlert className="w-8 h-8 text-rose-500" />
                      <div>
                        <div className="font-heading font-bold text-sm text-foreground">
                          DEADLOCK CONFIRMED (Circular Wait Cycle)
                        </div>
                        <div className="text-[11px] font-mono text-rose-400">
                          Cycle path: {detectionResult.cycleNodes.join(' → ')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Classic Lock-Inversion Scenario
              </h3>

              <div className="space-y-2 text-xs">
                <Button size="sm" variant={step === 1 ? 'primary' : 'outline'} onClick={() => { setStep(1); setRecoveryMethod('none'); }} className="w-full justify-start">
                  1. Thread 1 acquires Mutex R1
                </Button>
                <Button size="sm" variant={step === 2 ? 'primary' : 'outline'} onClick={() => { setStep(2); setRecoveryMethod('none'); }} className="w-full justify-start">
                  2. Thread 2 acquires Mutex R2
                </Button>
                <Button size="sm" variant={step === 3 ? 'primary' : 'outline'} onClick={() => { setStep(3); setRecoveryMethod('none'); }} className="w-full justify-start">
                  3. Thread 1 requests Mutex R2 (Blocks)
                </Button>
                <Button size="sm" variant={step === 4 ? 'danger' : 'outline'} onClick={() => { setStep(4); setRecoveryMethod('none'); }} className="w-full justify-start">
                  4. Thread 2 requests Mutex R1 (Deadlock!)
                </Button>
              </div>

              <Button size="sm" variant="secondary" onClick={() => { setStep(0); setRecoveryMethod('none'); }} className="w-full gap-2 text-xs">
                <RotateCcw className="w-3.5 h-3.5" /> Reset Scenario
              </Button>
            </Card>

            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase text-muted-foreground">
                The 4 Coffman Conditions
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Mutual Exclusion', met: step >= 1, desc: 'Non-shareable resource' },
                  { name: 'Hold and Wait', met: step >= 2, desc: 'Thread holds one, requests another' },
                  { name: 'No Preemption', met: step >= 1, desc: 'Resource cannot be forcibly taken' },
                  { name: 'Circular Wait', met: step >= 4, desc: 'Closed loop of waiting dependencies' },
                ].map((cond, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/40 border border-border/30">
                    <div className="flex items-center gap-2">
                      {cond.met ? <CheckCircle2 className="w-4 h-4 text-rose-500" /> : <span className="w-4 h-4 rounded-full border border-border" />}
                      <span className="font-semibold text-foreground">{cond.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{cond.desc}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Recovery Visualizer */}
      {activeTab === 'recovery' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-bold text-base text-foreground">
              Deadlock Recovery Strategies
            </h3>
            <Badge variant={recoveryMethod !== 'none' ? 'success' : 'danger'}>
              {recoveryMethod !== 'none' ? `Cycle Broken via ${recoveryMethod}` : 'Deadlock Unresolved'}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            When a deadlock cycle is discovered by the kernel or watchdog timer, the system can break the cycle using one of three standard OS mechanisms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`p-4 space-y-3 border transition-all ${recoveryMethod === 'terminate' ? 'border-emerald-500 bg-emerald-500/10' : ''}`}>
              <div className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-rose-500" /> 1. Process Termination
              </div>
              <p className="text-xs text-muted-foreground">
                Abort Thread 2 via <code className="text-primary">pthread_cancel()</code> / SIGKILL. Releases all resources held by T2.
              </p>
              <Button size="sm" variant={recoveryMethod === 'terminate' ? 'primary' : 'outline'} onClick={() => { setStep(4); setRecoveryMethod('terminate'); }} className="w-full text-xs">
                Kill Thread 2
              </Button>
            </Card>

            <Card className={`p-4 space-y-3 border transition-all ${recoveryMethod === 'preempt' ? 'border-emerald-500 bg-emerald-500/10' : ''}`}>
              <div className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-amber-500" /> 2. Resource Preemption
              </div>
              <p className="text-xs text-muted-foreground">
                Forcibly seize Mutex R1 from Thread 1 and allocate it to Thread 2 to allow T2 to complete.
              </p>
              <Button size="sm" variant={recoveryMethod === 'preempt' ? 'primary' : 'outline'} onClick={() => { setStep(4); setRecoveryMethod('preempt'); }} className="w-full text-xs">
                Preempt Mutex R1
              </Button>
            </Card>

            <Card className={`p-4 space-y-3 border transition-all ${recoveryMethod === 'rollback' ? 'border-emerald-500 bg-emerald-500/10' : ''}`}>
              <div className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-blue-500" /> 3. Checkpoint Rollback
              </div>
              <p className="text-xs text-muted-foreground">
                Rollback Thread 2 to its checkpoint state prior to requesting Mutex R1, yielding the lock.
              </p>
              <Button size="sm" variant={recoveryMethod === 'rollback' ? 'primary' : 'outline'} onClick={() => { setStep(4); setRecoveryMethod('rollback'); }} className="w-full text-xs">
                Rollback T2 Request
              </Button>
            </Card>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 font-mono text-xs text-foreground">
            Current Status: {recoveryMethod !== 'none' ? (
              <span className="text-emerald-500 font-bold">Cycle Broken! RAG graph is now acyclic and remaining threads can proceed to termination.</span>
            ) : (
              <span className="text-rose-500">Threads are permanently frozen. Select a recovery action above.</span>
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Prevention & Banker's Algorithm */}
      {activeTab === 'prevention' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-foreground">
              Lock Ordering & pthread_mutex_trylock
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>1. Strict Lock Ordering:</strong> Always acquire mutexes in identical numerical or memory address order across all threads (e.g. acquire R1 before R2 everywhere). Circular wait becomes mathematically impossible.
            </p>
            <div className="p-3.5 rounded-xl bg-secondary/70 border border-border/50 font-mono text-xs text-primary">
              <pre>{`// Deadlock-free pattern:
pthread_mutex_t *first = (m1 < m2) ? m1 : m2;
pthread_mutex_t *second = (m1 < m2) ? m2 : m1;
pthread_mutex_lock(first);
pthread_mutex_lock(second);`}</pre>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>2. Timeout with trylock:</strong> If a thread fails to acquire the second lock within a timeout, it releases the first lock, sleeps, and retries.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="font-heading font-bold text-base text-foreground">
                Banker's Algorithm (Safe State Demo)
              </h3>
              <Badge variant={availableUnits >= (maxT1 - allocatedT1) ? 'success' : 'warning'}>
                {availableUnits >= (maxT1 - allocatedT1) ? 'Safe State' : 'Unsafe State'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-secondary/50">
                <span>Total Available Resource Units:</span>
                <strong className="text-foreground">{availableUnits}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/40 space-y-1">
                <div className="flex justify-between">
                  <span>Thread 1: Allocated={allocatedT1}, Max={maxT1}</span>
                  <span className="text-primary font-bold">Need={maxT1 - allocatedT1}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border/40 space-y-1">
                <div className="flex justify-between">
                  <span>Thread 2: Allocated={allocatedT2}, Max={maxT2}</span>
                  <span className="text-primary font-bold">Need={maxT2 - allocatedT2}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setAvailableUnits(Math.max(0, availableUnits - 1))} className="flex-1 text-xs">
                Request Unit (-1)
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setAvailableUnits(availableUnits + 1)} className="flex-1 text-xs">
                Release Unit (+1)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Free-form RAG Editor */}
      {activeTab === 'freeform' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-bold text-base text-foreground">
              Free-Form RAG Graph Builder
            </h3>
            <Badge variant={freeDetectionResult.hasDeadlock ? 'danger' : 'success'}>
              {freeDetectionResult.hasDeadlock ? 'CYCLE DETECTED' : 'NO CYCLE (SAFE)'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Add Edge:</span>
            <Button size="sm" variant="outline" onClick={() => handleAddEdge('T1', 'R2')} className="text-xs">
              T1 requests R2
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddEdge('T2', 'R1')} className="text-xs">
              T2 requests R1 (Causes cycle)
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setFreeEdges([])} className="text-xs text-rose-500">
              Clear All Edges
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 font-mono text-xs space-y-1">
            <div className="font-bold text-foreground">Active RAG Edges ({freeEdges.length}):</div>
            {freeEdges.length === 0 ? (
              <span className="text-muted-foreground italic">No edges defined.</span>
            ) : (
              freeEdges.map(e => (
                <div key={e.id} className="text-muted-foreground">
                  • {e.from} {e.type === 'request' ? '--- requests --->' : '=== allocated to ===>'} {e.to}
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
