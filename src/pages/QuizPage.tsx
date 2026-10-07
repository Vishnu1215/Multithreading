import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QUIZ_QUESTIONS, Question } from '@/data/quizData';
import { CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

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
            Test your comprehension of Linux multithreading, CFS scheduling, synchronization, and deadlocks.
          </p>
        </div>

        {!isCompleted && (
          <div className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded-xl border border-border/40">
            Question <strong>{currentIndex + 1}</strong> of {QUIZ_QUESTIONS.length}
          </div>
        )}
      </div>

      {!isCompleted ? (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <Badge variant="outline">{currentQ.category}</Badge>
            <span className="text-xs font-mono text-emerald-500">Current Score: {score}</span>
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
        /* Completion Score Screen */
        <Card className="p-8 text-center space-y-6 glow border-primary/40">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto shadow-xl">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-heading text-foreground">Quiz Completed!</h2>
            <p className="text-xs text-muted-foreground">
              You scored <strong className="text-primary font-mono text-base">{score} / {QUIZ_QUESTIONS.length}</strong> ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40 max-w-sm mx-auto text-xs text-foreground">
            {score >= 8 ? (
              <span className="text-emerald-500 font-bold">Excellent Mastery of Operating Systems & Linux Architecture!</span>
            ) : score >= 5 ? (
              <span className="text-amber-500 font-bold">Good foundation! Review the CFS scheduler and Deadlock RAG sections.</span>
            ) : (
              <span className="text-rose-500 font-bold">Consider exploring the Process vs Thread primer before re-testing.</span>
            )}
          </div>

          <Button size="md" variant="glow" onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
        </Card>
      )}
    </div>
  );
};
