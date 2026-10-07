import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QUIZ_QUESTIONS, Question } from '@/data/quizData';
import { useSimulationStore } from '@/store/simulationStore';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  HelpCircle, 
  ArrowRight,
  Flame,
  Lightbulb,
  Clock,
  Layers
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export const QuizPage: React.FC = () => {
  const [quizMode, setQuizMode] = useState<'quick' | 'standard' | 'challenge'>('standard');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter and slice questions based on mode
  const getQuestions = () => {
    let pool = QUIZ_QUESTIONS;
    if (selectedCategory !== 'All') {
      pool = pool.filter(q => q.category === selectedCategory);
    }
    const count = quizMode === 'quick' ? 5 : quizMode === 'standard' ? 10 : 20;
    return pool.slice(0, count);
  };

  const [activeQuestions, setActiveQuestions] = useState<Question[]>(getQuestions());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);

  // Persistent best score
  const quizBestScore = useSimulationStore((s) => s.quizBestScore);
  const setQuizBestScore = useSimulationStore((s) => s.setQuizBestScore);

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
      setMissedQuestions([...missedQuestions, currentQ]);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      setIsCompleted(true);
      if (score > quizBestScore) {
        setQuizBestScore(score);
      }
    }
  };

  const handleRestart = (newMode?: 'quick' | 'standard' | 'challenge') => {
    const m = newMode || quizMode;
    setQuizMode(m);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
    setMissedQuestions([]);

    let pool = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    if (selectedCategory !== 'All') {
      pool = pool.filter(q => q.category === selectedCategory);
    }
    const count = m === 'quick' ? 5 : m === 'standard' ? 10 : 20;
    setActiveQuestions(pool.slice(0, count));
  };

  // Category breakdown data for radar chart
  const categories = ['Process vs Thread', 'Scheduling', 'Synchronization', 'Deadlock', 'Linux Internals'];
  const radarData = categories.map(cat => {
    const totalInCat = activeQuestions.filter(q => q.category === cat).length;
    const missedInCat = missedQuestions.filter(q => q.category === cat).length;
    const correct = totalInCat > 0 ? ((totalInCat - missedInCat) / totalInCat) * 100 : 100;
    return {
      category: cat.replace(' vs ', '/').replace(' Internals', ''),
      score: Math.round(correct),
    };
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Knowledge Assessment & OS Evaluation</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Quiz Module</h1>
          <p className="text-xs text-muted-foreground">
            Test your comprehension across 20+ questions: NPTL 1:1, CFS scheduler, futex, race conditions, and deadlocks.
          </p>
        </div>

        {/* Mode Selector */}
        {!isCompleted && (
          <div className="flex bg-secondary p-1 rounded-xl border border-border/40 text-xs">
            {(['quick', 'standard', 'challenge'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleRestart(m)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  quizMode === m ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {m === 'quick' ? 'Quick (5)' : m === 'standard' ? 'Standard (10)' : 'Challenge (20)'}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isCompleted ? (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentQ.category}</Badge>
              <Badge variant="info">{currentQ.difficulty}</Badge>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              {streak >= 2 && (
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" /> {streak} Streak!
                </span>
              )}
              <span className="text-muted-foreground">
                Score: <strong className="text-emerald-500">{score}</strong> / {activeQuestions.length}
              </span>
            </div>
          </div>

          <h2 className="text-base font-bold font-heading text-foreground leading-snug">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-secondary/40 border-border/40 text-foreground hover:bg-secondary';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold';
                } else {
                  btnStyle = 'opacity-40 border-border/20';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left transition-all text-xs font-medium flex items-center justify-between ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Hint Toggle */}
          {!isAnswered && (
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
              </button>
            </div>
          )}

          {showHint && !isAnswered && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
              💡 Hint: {currentQ.hint}
            </div>
          )}

          {/* Explanation Box upon answering */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 animate-in fade-in">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-primary" /> Explanation:
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentQ.explanation}
              </p>
              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={handleNext} className="gap-1.5 text-xs">
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* Completion Screen with Radar Chart Breakdown */
        <Card className="p-8 text-center space-y-6 glow border-primary/40">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto shadow-xl">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-heading text-foreground">Assessment Completed!</h2>
            <p className="text-xs text-muted-foreground">
              You scored <strong className="text-primary font-mono text-base">{score} / {activeQuestions.length}</strong> ({Math.round((score / activeQuestions.length) * 100)}%)
            </p>
            <div className="text-[11px] font-mono text-muted-foreground">
              Personal Best: {Math.max(score, quizBestScore)} correct
            </div>
          </div>

          {/* Category Radar Chart */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 max-w-sm mx-auto space-y-2">
            <h4 className="text-xs font-bold font-mono uppercase text-muted-foreground">
              Per-Category Competency Breakdown
            </h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" opacity={0.4} />
                  <PolarAngleAxis dataKey="category" stroke="#94A3B8" fontSize={9} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#94A3B8" fontSize={8} />
                  <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Missed Questions Review */}
          {missedQuestions.length > 0 && (
            <div className="text-left space-y-2 max-w-lg mx-auto pt-2">
              <h4 className="text-xs font-bold text-foreground">Review Missed Questions ({missedQuestions.length}):</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {missedQuestions.map((q) => (
                  <div key={q.id} className="p-2.5 rounded-lg bg-card border border-border/40 text-xs text-muted-foreground">
                    <div className="font-semibold text-foreground">Q: {q.question}</div>
                    <div className="text-[11px] text-emerald-500 font-mono mt-0.5">
                      Correct: {q.options[q.correctIndex]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button size="md" variant="glow" onClick={() => handleRestart()} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Retry Assessment
          </Button>
        </Card>
      )}
    </div>
  );
};
