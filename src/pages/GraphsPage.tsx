import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, Slider } from '@/components/ui/Controls';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { LineChart as LineChartIcon, Sparkles } from 'lucide-react';

export const GraphsPage: React.FC = () => {
  const [parallelFraction, setParallelFraction] = useState<number>(0.95);
  const [maxCores, setMaxCores] = useState<number>(8);

  // Generate Amdahl's Law curve: S = 1 / ((1 - p) + (p / n))
  const amdahlData = Array.from({ length: maxCores }, (_, i) => {
    const n = i + 1;
    const sTheoretical = 1 / ((1 - parallelFraction) + (parallelFraction / n));
    return {
      threads: `${n}C`,
      theoretical: Number(sTheoretical.toFixed(2)),
      idealLinear: n,
    };
  });

  const maxTheoreticalSpeedup = (1 / (1 - parallelFraction)).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
          <LineChartIcon className="w-3.5 h-3.5" />
          <span>Theoretical Limits & Mathematical Modeling</span>
        </div>
        <h1 className="text-3xl font-bold font-heading text-foreground">
          Interactive Graphs & Amdahl's Law
        </h1>
        <p className="text-xs text-muted-foreground">
          Explore theoretical limits of multithreading speedup as defined by Amdahl's Law and Gustafson's Law.
        </p>
      </div>

      {/* Amdahl Interactive Formula Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-5">
            <h3 className="font-heading font-semibold text-sm text-foreground">
              Amdahl's Law Parameter Controls
            </h3>

            {/* Formula Block */}
            <div className="p-4 rounded-xl bg-secondary/70 border border-border/50 text-center font-mono text-xs">
              <div className="text-muted-foreground text-[10px] mb-1">Theoretical Speedup Formula:</div>
              <div className="text-sm font-bold text-primary">
                S(n) = 1 / [ (1 - p) + (p / n) ]
              </div>
            </div>

            {/* Parallel Fraction Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Parallel Fraction (p):</span>
                <span className="font-bold text-foreground">{(parallelFraction * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={parallelFraction}
                onChange={(e) => setParallelFraction(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>Serial Fraction: {((1 - parallelFraction) * 100).toFixed(0)}%</span>
                <span>Max Asymptotic Speedup: {maxTheoreticalSpeedup}×</span>
              </div>
            </div>

            {/* Core limit slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Max Evaluated Cores (n):</span>
                <span className="font-bold text-foreground">{maxCores} Cores</span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={maxCores}
                onChange={(e) => setMaxCores(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </Card>
        </div>

        {/* Amdahl Plot Canvas (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-heading font-semibold text-sm text-foreground">
                Speedup Curve vs Ideal Linear Scaling
              </h3>
              <span className="text-xs font-mono text-emerald-500 font-bold">
                Asymptote: {maxTheoreticalSpeedup}× Maximum
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={amdahlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="threads" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="theoretical" name="Amdahl Speedup S(n)" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="idealLinear" name="Linear Ideal (n)" stroke="#64748B" strokeDasharray="4 4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
