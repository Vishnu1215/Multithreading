import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md hover:shadow-indigo-500/25 hover:brightness-110 focus:ring-primary',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-slate-400',
      outline: 'border border-border bg-transparent hover:bg-secondary/50 text-foreground focus:ring-primary',
      ghost: 'bg-transparent hover:bg-secondary/60 text-foreground focus:ring-primary',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-rose-500/25 focus:ring-rose-500',
      glow: 'bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:brightness-110 focus:ring-primary',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
      md: 'text-sm px-4 py-2 gap-2 rounded-xl',
      lg: 'text-base px-6 py-3 gap-2.5 rounded-xl',
      icon: 'p-2 w-9 h-9 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
