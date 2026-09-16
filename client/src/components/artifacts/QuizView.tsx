import React, { useState } from "react";
import type { QuizQuestion } from "@/types";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
} from "lucide-react";

interface QuizViewProps {
  questions: QuizQuestion[];
}

export function QuizView({ questions }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        No quiz questions found in this artifact.
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const hasAnswered = selectedOption !== null;

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: idx }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(
        userAnswers[currentIndex + 1] !== undefined
          ? userAnswers[currentIndex + 1]
          : null,
      );
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setIsCompleted(false);
  };

  const score = Object.entries(userAnswers).reduce((acc, [qIdx, ansIdx]) => {
    return ansIdx === questions[Number(qIdx)].correctIndex ? acc + 1 : acc;
  }, 0);

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center animate-in zoom-in-95 duration-200">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-accent mb-3">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Quiz Completed!</h3>
        <p className="mt-1 text-xs sm:text-sm text-foreground-secondary">
          You scored <span className="font-semibold text-accent">{score}</span> out of{" "}
          <span className="font-semibold text-foreground">{questions.length}</span> ({percentage}%)
        </p>

        <div className="mt-5 w-full rounded-xl bg-surface border border-border p-4 text-xs space-y-2 text-left shadow-2xs">
          {percentage >= 80 ? (
            <p className="text-success font-medium">
              Excellent mastery of the source material!
            </p>
          ) : percentage >= 50 ? (
            <p className="text-warning font-medium">
              Good comprehension. Review highlighted sources to solidify understanding.
            </p>
          ) : (
            <p className="text-error font-medium">
              Review your flashcards or summaries and try again.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-mono text-muted mb-4">
        <span className="text-accent font-semibold">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-muted">
          Score: {score}/{currentIndex + (hasAnswered ? 1 : 0)}
        </span>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-md">
        <h3 className="text-sm sm:text-base font-bold text-foreground leading-relaxed mb-6">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let btnStyle = "border-border bg-surface-secondary/40 hover:border-border/80 text-foreground";
            if (hasAnswered) {
              if (isCorrect) {
                btnStyle = "border-success/60 bg-success/15 text-success font-semibold";
              } else if (isSelected) {
                btnStyle = "border-error/60 bg-error/15 text-error font-semibold";
              } else {
                btnStyle = "opacity-50 border-border bg-surface text-muted";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={hasAnswered}
                className={`w-full flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border text-[10px] font-mono font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>

                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 ml-2" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="h-4 w-4 text-error shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {hasAnswered && (
          <div className="mt-4 rounded-xl border border-border bg-surface-secondary/50 p-3.5 text-xs text-foreground leading-relaxed animate-in fade-in duration-150">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-1">
              Explanation
            </span>
            {currentQ.explanation}
          </div>
        )}

        {/* Next Button */}
        {hasAnswered && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover transition-colors shadow-2xs cursor-pointer"
            >
              <span>
                {currentIndex < questions.length - 1 ? "Next Question" : "See Final Score"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
