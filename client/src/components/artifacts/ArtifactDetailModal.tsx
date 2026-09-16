import React, { useState } from "react";
import { createPortal } from "react-dom";
import type {
  LearningArtifact,
  ArtifactFlashcardsContent,
  ArtifactQuizContent,
  ArtifactMindmapContent,
  ArtifactTakeawaysContent,
  ArtifactSummaryContent,
  ArtifactReportContent,
} from "@/types";
import { FlashcardDeck } from "./FlashcardDeck";
import { QuizView } from "./QuizView";
import { MindmapView } from "./MindmapView";
import {
  X,
  Copy,
  Check,
} from "lucide-react";

interface ArtifactDetailModalProps {
  artifact: LearningArtifact | null;
  onClose: () => void;
}

export function ArtifactDetailModal({
  artifact,
  onClose,
}: ArtifactDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (!artifact.content) {
      return (
        <div className="p-12 text-center text-xs text-muted">
          No synthesized content found in this artifact.
        </div>
      );
    }

    switch (artifact.type) {
      case "FLASHCARDS": {
        const fc = artifact.content as ArtifactFlashcardsContent;
        return <FlashcardDeck cards={fc.cards || []} />;
      }
      case "QUIZ": {
        const quiz = artifact.content as ArtifactQuizContent;
        return <QuizView questions={quiz.questions || []} />;
      }
      case "MINDMAP": {
        const mm = artifact.content as ArtifactMindmapContent;
        return <MindmapView nodes={mm.nodes || []} edges={mm.edges || []} />;
      }
      case "TAKEAWAYS": {
        const takeaways = artifact.content as ArtifactTakeawaysContent;
        return (
          <div className="max-w-2xl mx-auto p-6 space-y-2.5">
            {takeaways.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-foreground shadow-2xs"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent text-[10px] font-mono font-bold mt-0.5">
                  {idx + 1}
                </div>
                <p>{item}</p>
              </div>
            ))}
          </div>
        );
      }
      case "SUMMARY": {
        const sum = artifact.content as ArtifactSummaryContent;
        return (
          <div className="max-w-3xl mx-auto p-6">
            <div className="rounded-2xl border border-border bg-surface p-6 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap selection:bg-accent-subtle shadow-xs">
              {sum.markdown || JSON.stringify(artifact.content, null, 2)}
            </div>
          </div>
        );
      }
      case "REPORT": {
        const rep = artifact.content as ArtifactReportContent;
        return (
          <div className="max-w-3xl mx-auto p-6 space-y-4">
            {rep.sections && rep.sections.length > 0 ? (
              rep.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-surface p-6 space-y-2 shadow-xs"
                >
                  <h4 className="text-sm font-bold text-accent">
                    {sec.title}
                  </h4>
                  <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {sec.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-6 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap shadow-xs">
                {rep.markdown || JSON.stringify(artifact.content, null, 2)}
              </div>
            )}
          </div>
        );
      }
      default:
        return (
          <pre className="p-6 text-xs font-mono text-foreground overflow-auto">
            {JSON.stringify(artifact.content, null, 2)}
          </pre>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-secondary/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="rounded bg-accent-subtle text-accent border border-accent/25 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase">
              {artifact.type}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground truncate max-w-md">
              {artifact.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(JSON.stringify(artifact.content, null, 2))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-surface text-xs text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
              title="Copy artifact content"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  <span className="text-[11px] text-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto bg-background/50">
          {renderContent()}
        </div>
      </div>
    </div>,
    document.body
  );
}
