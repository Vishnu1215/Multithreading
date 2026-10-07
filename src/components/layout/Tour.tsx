import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';
import { useSimulationStore } from '@/store/simulationStore';

interface TourStep {
  title: string;
  description: string;
  route: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to ThreadLab Linux',
    description: 'An interactive laboratory for evaluating single-threaded vs multi-threaded performance on modern Linux systems.',
    route: '/',
  },
  {
    title: 'Process vs Thread Memory Layout',
    description: 'Master how Linux processes maintain isolated page tables while threads share the heap and data with private stacks.',
    route: '/learn',
  },
  {
    title: 'The 5-Phase Interactive Simulator',
    description: 'Watch tasks split, clone() spawn kernel tasks, execute on cores, synchronize at barriers, and merge memory.',
    route: '/simulator',
  },
  {
    title: 'CPU Silicon Die & CFS Runqueue',
    description: 'Inspect per-core hardware frequencies, C-states, context switch microsecond costs, and oversubscription.',
    route: '/cpu',
  },
  {
    title: 'Scheduler & CFS Gantt Charts',
    description: 'Explore textbook scheduling algorithms (FCFS, RR, SJF, Priority) and compare them with Linux CFS virtual runtime.',
    route: '/scheduler',
  },
  {
    title: 'Concurrency & Race Condition Labs',
    description: 'Observe shared variables corrupted by instruction interleaving, and fix them using futex-backed mutexes and semaphores.',
    route: '/sync',
  },
  {
    title: 'Deadlock & Cycle Detection (RAG)',
    description: 'Analyze directed resource allocation graphs with automated DFS cycle discovery and Coffman condition verification.',
    route: '/deadlock',
  },
  {
    title: 'Live Telemetry & Formal Reports',
    description: 'Review empirical scaling data, Amdahl speedup limits, and export multi-page PDFs or CSVs for faculty review.',
    route: '/report',
  },
];

export const GuidedTour: React.FC = () => {
  const tourActive = useSimulationStore((s) => s.tourActive);
  const setTourActive = useSimulationStore((s) => s.setTourActive);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (tourActive) {
      navigate(TOUR_STEPS[currentStep].route);
    }
  }, [currentStep, tourActive, navigate]);

  if (!tourActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setTourActive(false);
      localStorage.setItem('threadlab_tour_completed', 'true');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDismiss = () => {
    setTourActive(false);
    localStorage.setItem('threadlab_tour_completed', 'true');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5">
      <Card className="p-5 glass-panel-glow border-primary/50 shadow-2xl space-y-4 bg-card/95">
        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guided Tour ({currentStep + 1}/{TOUR_STEPS.length})</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-heading font-bold text-base text-foreground">
            {step.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={currentStep === 0}
            onClick={handlePrev}
            className="text-xs gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </Button>

          <Button
            size="sm"
            variant={isLast ? 'primary' : 'glow'}
            onClick={handleNext}
            className="text-xs gap-1.5"
          >
            {isLast ? (
              <>
                Finish Tour <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
