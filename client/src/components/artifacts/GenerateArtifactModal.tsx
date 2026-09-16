import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useCreateArtifact } from "@/api/artifacts";
import { useSources } from "@/api/sources";
import { getErrorMessage } from "@/api/client";
import type { ArtifactType } from "@/types";
import {
  X,
  Sparkles,
  BookOpen,
  ListChecks,
  HelpCircle,
  Network,
  FileText,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";

interface GenerateArtifactModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ARTIFACT_OPTIONS: Array<{
  type: ArtifactType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    type: "SUMMARY",
    title: "Executive Summary",
    description: "Structured overview synthesizing all key themes.",
    icon: BookOpen,
  },
  {
    type: "TAKEAWAYS",
    title: "Key Takeaways",
    description: "Actionable high-impact takeaways distilled into bullets.",
    icon: ListChecks,
  },
  {
    type: "FLASHCARDS",
    title: "3D Flashcard Deck",
    description: "Active recall study cards with question fronts & answer backs.",
    icon: Sparkles,
  },
  {
    type: "QUIZ",
    title: "Multiple-Choice Quiz",
    description: "Interactive assessment with detailed answer explanations.",
    icon: HelpCircle,
  },
  {
    type: "MINDMAP",
    title: "Conceptual Mind Map",
    description: "Visual node graph mapping relationships between topics.",
    icon: Network,
  },
  {
    type: "REPORT",
    title: "Comprehensive Report",
    description: "In-depth multi-section academic report with full markdown.",
    icon: FileText,
  },
];

export function GenerateArtifactModal({
  workspaceId,
  isOpen,
  onClose,
}: GenerateArtifactModalProps) {
  const [selectedType, setSelectedType] = useState<ArtifactType>("FLASHCARDS");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: sources } = useSources(workspaceId, { status: "READY" });
  const createMutation = useCreateArtifact(workspaceId);

  if (!isOpen) return null;

  const toggleSource = (id: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAllSources = () => {
    if (sources && selectedSourceIds.length === sources.length) {
      setSelectedSourceIds([]);
    } else {
      setSelectedSourceIds(sources?.map((s) => s.id) || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createMutation.mutateAsync({
        type: selectedType,
        title: customTitle.trim() || undefined,
        sourceIds: selectedSourceIds.length > 0 ? selectedSourceIds : undefined,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-subtle text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Generate Learning Artifact
              </h3>
              <p className="text-xs text-muted">
                Synthesize your sources into structured study tools.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-error/10 border border-error/25 px-3 py-2 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Artifact Type Selection */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">
              Select Format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ARTIFACT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedType(opt.type)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-accent bg-accent-subtle shadow-2xs"
                        : "border-border bg-surface-secondary/40 hover:bg-surface-secondary"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mb-2 ${
                        isSelected ? "text-accent" : "text-muted"
                      }`}
                    />
                    <span className="text-xs font-bold text-foreground line-clamp-1">
                      {opt.title}
                    </span>
                    <span className="text-[10px] text-muted mt-1 line-clamp-2 leading-tight">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Custom Title <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={120}
              placeholder="e.g. Transformers & Attention Study Deck"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          {/* Target Source Selection */}
          {sources && sources.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-foreground">
                  Target Sources{" "}
                  <span className="text-muted font-normal">
                    ({selectedSourceIds.length || "All Ready"} selected)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllSources}
                  className="text-[11px] text-accent hover:underline cursor-pointer"
                >
                  {selectedSourceIds.length === sources.length
                    ? "Deselect All"
                    : "Select All Ready"}
                </button>
              </div>

              <div className="max-h-28 overflow-y-auto space-y-1 rounded-xl border border-border bg-surface-secondary/30 p-2 text-xs">
                {sources.map((src) => {
                  const isChecked = selectedSourceIds.includes(src.id);
                  return (
                    <div
                      key={src.id}
                      onClick={() => toggleSource(src.id)}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-secondary cursor-pointer text-foreground"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-muted" />
                      )}
                      <span className="truncate flex-1 text-xs">{src.title}</span>
                      <span className="text-[10px] font-mono text-muted">
                        {src.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <span>Generate Artifact</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
