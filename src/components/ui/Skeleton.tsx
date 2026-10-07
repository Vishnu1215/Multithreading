import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-secondary/80 border border-border/30', className)}
      {...props}
    />
  );
}

export function CpuDieLoader({ message = 'Initializing NPTL Thread Subsystem...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 p-8">
      {/* 4-core pulsing silicon die graphic */}
      <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border-2 border-primary/40 shadow-xl shadow-primary/20 flex flex-wrap p-2.5 gap-2 items-center justify-center">
        <div className="w-6 h-6 rounded-md bg-indigo-500/80 animate-ping opacity-75" />
        <div className="w-6 h-6 rounded-md bg-pink-500/80 animate-pulse" />
        <div className="w-6 h-6 rounded-md bg-emerald-500/80 animate-pulse" />
        <div className="w-6 h-6 rounded-md bg-amber-500/80 animate-ping opacity-75" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-3 h-3 rounded-full bg-white shadow-md shadow-white/80" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <div className="text-sm font-heading font-semibold text-foreground tracking-tight">
          ThreadLab Linux
        </div>
        <div className="text-xs font-mono text-muted-foreground animate-pulse">
          {message}
        </div>
      </div>
    </div>
  );
}
