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
const FlashcardDeck = React.lazy(() =>
  import("./FlashcardDeck").then((m) => ({ default: m.FlashcardDeck }))
);
const QuizView = React.lazy(() =>
  import("./QuizView").then((m) => ({ default: m.QuizView }))
);
const MindmapView = React.lazy(() =>
  import("./MindmapView").then((m) => ({ default: m.MindmapView }))
);
import {
  X,
  Copy,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

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
                className="flex items-start gap-3 rounded-[var(--radius-base)] border border-border bg-surface p-4 text-xs leading-relaxed text-foreground"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-secondary text-category-workspaces text-[10px] font-mono font-bold mt-0.5">
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
            <div className="rounded-[var(--radius-base)] border border-border bg-surface p-6 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap selection:bg-accent-subtle">
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
                  className="rounded-[var(--radius-base)] border border-border bg-surface p-6 space-y-2"
                >
                  <h4 className="text-sm font-bold text-foreground">
                    {sec.title}
                  </h4>
                  <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {sec.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-base)] border border-border bg-surface p-6 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-[var(--radius-base)] border border-border bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-secondary/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "rounded bg-secondary border border-border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase",
                artifact.type === "MINDMAP"
                  ? "text-category-sources"
                  : artifact.type === "FLASHCARDS"
                  ? "text-category-artifacts"
                  : artifact.type === "QUIZ"
                  ? "text-category-memories"
                  : "text-category-workspaces"
              )}
            >
              {artifact.type}
            </span>
            <StatusBadge status={artifact.status} />
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
          <React.Suspense
            fallback={
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                Loading artifact view...
              </div>
            }
          >
            {renderContent()}
          </React.Suspense>
        </div>
      </div>
    </div>,
    document.body
  );
}
