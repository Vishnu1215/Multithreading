import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, Play, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { 
  RAGNode, 
  RAGEdge, 
  DeadlockDetector, 
  DeadlockCycleResult 
} from '@/engine/deadlockDetector';

export const DeadlockPage: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'guided' | 'conditions' | 'prevention'>('guided');

  // Guided RAG state
  const nodes: RAGNode[] = [
    { id: 'T1', name: 'Thread 1', type: 'thread', x: 120, y: 150 },
    { id: 'T2', name: 'Thread 2', type: 'thread', x: 440, y: 150 },
    { id: 'R1', name: 'Mutex R1', type: 'resource', x: 280, y: 80 },
    { id: 'R2', name: 'Mutex R2', type: 'resource', x: 280, y: 220 },
  ];

  // Dynamic edges based on step (0 to 4)
  const getEdges = (): RAGEdge[] => {
    const edges: RAGEdge[] = [];
    if (step >= 1) {
      // Step 1: T1 locks R1 (Assignment R1 -> T1)
      edges.push({ id: 'e1', from: 'R1', to: 'T1', type: 'assignment' });
    }
    if (step >= 2) {
      // Step 2: T2 locks R2 (Assignment R2 -> T2)
      edges.push({ id: 'e2', from: 'R2', to: 'T2', type: 'assignment' });
    }
    if (step >= 3) {
      // Step 3: T1 requests R2 (Request T1 -> R2)
      edges.push({ id: 'e3', from: 'T1', to: 'R2', type: 'request' });
    }
    if (step >= 4) {
      // Step 4: T2 requests R1 (Request T2 -> R1) => CYCLE CREATED!
      edges.push({ id: 'e4', from: 'T2', to: 'R1', type: 'request' });
    }
    return edges;
  };

  const currentEdges = getEdges();
  const detectionResult: DeadlockCycleResult = DeadlockDetector.detectCycle(nodes, currentEdges);

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
            Step through circular wait lock inversion, visualize DFS cycle discovery on the RAG, and learn prevention techniques.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {detectionResult.hasDeadlock ? (
            <Badge variant="danger" className="animate-pulse">DEADLOCK DETECTED</Badge>
          ) : (
            <Badge variant="success">Safe State (No Cycle)</Badge>
          )}
        </div>
      </div>

      {/* Main Guided Scenario Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG RAG Canvas (8 cols) */}
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
                {/* Arrowhead marker */}
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
                        // Circle for Thread
                        <circle
                          r="28"
                          fill={isCycleNode ? '#EF4444' : '#0F172A'}
                          stroke={isCycleNode ? '#EF4444' : '#6366F1'}
                          strokeWidth="2.5"
                          filter={isCycleNode ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))' : 'none'}
                        />
                      ) : (
                        // Rectangle for Resource
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

              {/* Deadlock Overlay Banner */}
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

        {/* Guided Step-by-Step Controller (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Guided Classic Lock-Inversion Scenario
            </h3>

            <div className="space-y-2 text-xs">
              <Button
                size="sm"
                variant={step === 1 ? 'primary' : 'outline'}
                onClick={() => setStep(1)}
                className="w-full justify-start text-xs"
              >
                1. Thread 1 acquires Mutex R1
              </Button>
              <Button
                size="sm"
                variant={step === 2 ? 'primary' : 'outline'}
                onClick={() => setStep(2)}
                className="w-full justify-start text-xs"
              >
                2. Thread 2 acquires Mutex R2
              </Button>
              <Button
                size="sm"
                variant={step === 3 ? 'primary' : 'outline'}
                onClick={() => setStep(3)}
                className="w-full justify-start text-xs"
              >
                3. Thread 1 requests Mutex R2 (Blocks)
              </Button>
              <Button
                size="sm"
                variant={step === 4 ? 'danger' : 'outline'}
                onClick={() => setStep(4)}
                className="w-full justify-start text-xs"
              >
                4. Thread 2 requests Mutex R1 (Deadlock!)
              </Button>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStep(0)}
              className="w-full gap-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Scenario
            </Button>
          </Card>

          {/* 4 Coffman Conditions Checklist */}
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
                    {cond.met ? (
                      <CheckCircle2 className="w-4 h-4 text-rose-500" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-border" />
                    )}
                    <span className="font-semibold text-foreground">{cond.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{cond.desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
