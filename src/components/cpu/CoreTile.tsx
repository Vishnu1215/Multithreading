import React from 'react';
import { CoreStatus } from '@/types/simulation';
import { cn } from '@/lib/utils';
import { Cpu, Zap } from 'lucide-react';

interface CoreTileProps {
  core: CoreStatus;
  threadColor?: string;
  threadName?: string;
}

export const CoreTile: React.FC<CoreTileProps> = ({ core, threadColor, threadName }) => {
  const isBusy = core.threadId !== null;

  return (
    <div
      className={cn(
        'relative rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between overflow-hidden',
        isBusy
          ? 'bg-gradient-to-b from-card to-card/90 border-primary/40 shadow-lg shadow-primary/10'
          : 'bg-card/40 border-border/30 opacity-70'
      )}
    >
      {/* Background glow when core is active */}
      {isBusy && (
        <div
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ backgroundColor: threadColor || '#6366F1' }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border',
              isBusy
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-secondary text-muted-foreground border-border/40'
            )}
          >
            C{core.id}
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">Core {core.id}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
              <Zap className="w-2.5 h-2.5 text-amber-500" />
              {core.frequencyGhz} GHz
            </div>
          </div>
        </div>

        {/* State Badge */}
        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider border',
            isBusy
              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
              : 'bg-slate-500/10 text-muted-foreground border-border/30'
          )}
        >
          {isBusy ? 'BUSY' : core.cState}
        </span>
      </div>

      {/* Middle: Active Thread Assignment */}
      <div className="my-3 py-2 px-3 rounded-xl bg-secondary/60 border border-border/30 flex items-center justify-between z-10">
        <span className="text-[11px] text-muted-foreground">Assigned Task:</span>
        {isBusy ? (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: threadColor }}
            />
            <span className="font-mono text-xs font-bold" style={{ color: threadColor }}>
              {threadName || `Thread ${core.threadId}`}
            </span>
          </div>
        ) : (
          <span className="text-xs font-mono text-muted-foreground italic">Idle (Waiting cfs_rq)</span>
        )}
      </div>

      {/* Footer: Utilization Bar */}
      <div className="z-10 space-y-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-muted-foreground">Load</span>
          <span className="font-semibold text-foreground">{core.utilization}%</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${core.utilization}%`,
              backgroundColor: isBusy ? (threadColor || '#6366F1') : '#64748B',
            }}
          />
        </div>
      </div>
    </div>
  );
};
