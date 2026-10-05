import React, { useState } from "react";
import type { Flashcard } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto">
      {/* Top Deck Info */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-muted-foreground mb-4 px-2">
        <span className="flex items-center gap-1.5 text-category-artifacts font-semibold">
          <BookOpen className="h-4 w-4" />
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span className="text-[11px] text-muted-foreground">Click card or spacebar to flip</span>
      </div>

      {/* 3D Flippable Card Container */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Flashcard: ${isFlipped ? "showing answer" : "showing question"}. Click or press Enter to flip.`}
        onClick={toggleFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleFlip();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            handleNext();
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            handlePrev();
          }
        }}
        className="w-full h-72 cursor-pointer perspective-1000 group select-none outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-[var(--radius-base)]"
      >
        <div className={`flashcard-inner ${isFlipped ? "is-flipped" : ""}`}>
          {/* Front Face (Question / Concept) */}
          <div
            className="flashcard-face flashcard-front rounded-[var(--radius-base)] bg-card p-8 flex flex-col justify-between border border-border shadow-none"
            aria-hidden={isFlipped}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium rounded-full bg-secondary text-category-artifacts border border-border px-2.5 py-0.5">
                QUESTION / CONCEPT
              </span>
              <RotateCw className="h-4 w-4 text-muted-foreground group-hover:text-category-artifacts transition-colors" />
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            <div className="text-center text-[11px] font-mono text-muted-foreground">
              Tap to reveal answer
            </div>
          </div>

          {/* Back Face (Answer / Explanation) */}
          <div
            className="flashcard-face flashcard-back rounded-[var(--radius-base)] bg-secondary p-8 flex flex-col justify-between border border-border shadow-none"
            aria-hidden={!isFlipped}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium rounded-full bg-status-ready-bg text-status-ready border border-status-ready-border px-2.5 py-0.5">
                ANSWER
              </span>
              <RotateCw className="h-4 w-4 text-category-artifacts" />
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-base sm:text-lg font-semibold text-foreground leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center text-[11px] font-mono text-muted-foreground">
              Tap to return to question
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePrev}
          title="Previous card (Left Arrow)"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={toggleFlip}
          className="gap-2"
          aria-label="Flip card"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Flip Card</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleNext}
          title="Next card (Right Arrow)"
          aria-label="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
