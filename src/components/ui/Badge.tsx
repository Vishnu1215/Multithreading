import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/15 text-primary border-primary/20',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
    info: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
    outline: 'border-border text-muted-foreground bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Progress({ value = 0, className, color = 'bg-primary' }: { value: number; className?: string; color?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary/80 border border-border/40', className)}>
      <div
        className={cn('h-full transition-all duration-300 ease-out rounded-full', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
