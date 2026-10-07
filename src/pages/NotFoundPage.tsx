import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Cpu, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
        <Cpu className="w-10 h-10 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h1 className="text-5xl font-black font-heading text-foreground">404</h1>
        <h2 className="text-xl font-bold font-heading text-foreground">
          Thread Terminated (SIGSEGV / Page Fault)
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          The requested memory page or module address could not be translated by the MMU. 
          Return to the safe kernel address space.
        </p>
      </div>

      <Link to="/">
        <Button variant="glow" className="gap-2 text-xs">
          <Home className="w-4 h-4" /> Return to Mission Control
        </Button>
      </Link>
    </div>
  );
};
