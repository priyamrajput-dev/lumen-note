import React, { useState } from "react";
import type { Flashcard } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  BookOpen,
} from "lucide-react";

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        No flashcards generated yet.
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto">
      {/* Top Deck Info */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-muted mb-4 px-2">
        <span className="flex items-center gap-1.5 text-accent font-semibold">
          <BookOpen className="h-4 w-4" />
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span className="text-[11px] text-muted">Click card or button to flip</span>
      </div>

      {/* 3D Flippable Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-72 cursor-pointer perspective-1000 group select-none"
      >
        <div
          className={`relative w-full h-full rounded-2xl border border-border transition-transform duration-500 transform-style-3d shadow-xl ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Face (Question / Concept) */}
          <div className="absolute inset-0 backface-hidden rounded-2xl bg-surface p-8 flex flex-col justify-between border border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium rounded-full bg-accent-subtle text-accent border border-accent/20 px-2.5 py-0.5">
                QUESTION / CONCEPT
              </span>
              <RotateCw className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
            </div>

            <div className="my-auto text-center">
              <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            <div className="text-center text-[11px] font-mono text-muted">
              Tap to reveal answer
            </div>
          </div>

          {/* Back Face (Answer / Explanation) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-surface-secondary/80 p-8 flex flex-col justify-between border border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium rounded-full bg-success/10 text-success border border-success/20 px-2.5 py-0.5">
                ANSWER
              </span>
              <RotateCw className="h-4 w-4 text-accent" />
            </div>

            <div className="my-auto text-center">
              <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center text-[11px] font-mono text-muted">
              Tap to return to question
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handlePrev}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:bg-surface-secondary hover:text-foreground transition-colors cursor-pointer"
          title="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-subtle px-4 py-2 text-xs font-semibold text-accent hover:opacity-90 transition-colors cursor-pointer"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Flip Card</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:bg-surface-secondary hover:text-foreground transition-colors cursor-pointer"
          title="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
