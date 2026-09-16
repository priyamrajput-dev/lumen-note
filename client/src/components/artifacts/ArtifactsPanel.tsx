import React, { useState } from "react";
import { useArtifacts, useDeleteArtifact } from "@/api/artifacts";
import type { LearningArtifact, ArtifactType, ArtifactStatus } from "@/types";
import { GenerateArtifactModal } from "./GenerateArtifactModal";
import { ArtifactDetailModal } from "./ArtifactDetailModal";
import {
  Plus,
  Sparkles,
  BookOpen,
  ListChecks,
  HelpCircle,
  Network,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";

interface ArtifactsPanelProps {
  workspaceId: string;
  isCompact?: boolean;
}

export function ArtifactsPanel({ workspaceId, isCompact = false }: ArtifactsPanelProps) {
  const { data: artifacts, isLoading, isError } = useArtifacts(workspaceId);
  const deleteMutation = useDeleteArtifact(workspaceId);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<LearningArtifact | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredArtifacts = artifacts?.filter((art) => {
    if (filterType === "ALL") return true;
    if (filterType === "STUDY") return art.type === "FLASHCARDS" || art.type === "QUIZ" || art.type === "MINDMAP";
    if (filterType === "DOCS") return art.type === "SUMMARY" || art.type === "TAKEAWAYS" || art.type === "REPORT";
    return true;
  });

  const handleDelete = async (e: React.MouseEvent, artifactId: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete artifact "${title}"?`)) {
      await deleteMutation.mutateAsync(artifactId);
      if (selectedArtifact?.id === artifactId) {
        setSelectedArtifact(null);
      }
    }
  };

  const getArtifactIcon = (type: ArtifactType) => {
    switch (type) {
      case "FLASHCARDS":
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case "QUIZ":
        return <HelpCircle className="h-3.5 w-3.5 text-success" />;
      case "MINDMAP":
        return <Network className="h-3.5 w-3.5 text-blue-500" />;
      case "TAKEAWAYS":
        return <ListChecks className="h-3.5 w-3.5 text-purple-500" />;
      case "SUMMARY":
        return <BookOpen className="h-3.5 w-3.5 text-accent" />;
      case "REPORT":
      default:
        return <FileText className="h-3.5 w-3.5 text-rose-500" />;
    }
  };

  const getStatusBadge = (status: ArtifactStatus) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.2 text-[9px] font-mono font-medium text-success border border-success/20">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Ready
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.2 text-[9px] font-mono font-medium text-accent border border-accent/25">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Synthesizing
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-1.5 py-0.2 text-[9px] font-mono font-medium text-error border border-error/20">
            <AlertCircle className="h-2.5 w-2.5" />
            Failed
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-1.5 py-0.2 text-[9px] font-mono font-medium text-warning border border-warning/20">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Queued
          </span>
        );
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface/40 text-foreground overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5 bg-surface/90 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
            Notes & Artifacts
          </span>
          <span className="text-[10px] font-mono font-medium rounded-full bg-surface-secondary text-muted px-1.5 py-0.2 border border-border">
            {artifacts?.length || 0}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsGenerateOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Generate</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border p-2 bg-surface/40 shrink-0">
        <div className="flex items-center rounded-lg bg-surface-secondary/70 p-0.5 border border-border text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`flex-1 rounded py-1 text-center transition-colors cursor-pointer ${
              filterType === "ALL"
                ? "bg-surface text-foreground font-semibold shadow-2xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            All ({artifacts?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("STUDY")}
            className={`flex-1 rounded py-1 text-center transition-colors cursor-pointer ${
              filterType === "STUDY"
                ? "bg-surface text-foreground font-semibold shadow-2xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Study Tools
          </button>
          <button
            type="button"
            onClick={() => setFilterType("DOCS")}
            className={`flex-1 rounded py-1 text-center transition-colors cursor-pointer ${
              filterType === "DOCS"
                ? "bg-surface text-foreground font-semibold shadow-2xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Summaries
          </button>
        </div>
      </div>

      {/* Artifacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {isLoading && (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-xl border border-border/60 bg-surface animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">
            Failed to load workspace artifacts.
          </div>
        )}

        {!isLoading && !isError && artifacts?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 py-10 px-4 text-center my-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent mb-2.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">No artifacts generated</h4>
            <p className="mt-1 text-[11px] text-muted leading-tight">
              Synthesize your indexed sources into 3D flashcards, quizzes, mindmaps, or executive summaries.
            </p>
            <button
              type="button"
              onClick={() => setIsGenerateOpen(true)}
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate First Artifact</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredArtifacts && filteredArtifacts.length > 0 && (
          <div className="space-y-1.5">
            {filteredArtifacts.map((art) => (
              <div
                key={art.id}
                onClick={() => {
                  if (art.status === "READY") {
                    setSelectedArtifact(art);
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-xl border p-3 transition-all text-xs ${
                  art.status === "READY"
                    ? "cursor-pointer border-border bg-surface hover:border-accent/50 hover:shadow-2xs"
                    : "border-border/60 bg-surface-secondary/30 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-secondary border border-border">
                        {getArtifactIcon(art.type)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-accent font-bold uppercase tracking-wider block">
                          {art.type}
                        </span>
                        <h4 className="text-xs font-bold text-foreground group-hover:text-accent line-clamp-1 transition-colors">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, art.id, art.title)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted hover:text-error hover:bg-error/10 transition-all cursor-pointer"
                      title="Delete artifact"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px]">
                  {getStatusBadge(art.status)}

                  {art.status === "READY" ? (
                    <span className="flex items-center gap-1 font-semibold text-accent group-hover:underline">
                      <Eye className="h-3 w-3" />
                      Open Tool
                    </span>
                  ) : (
                    <span className="font-mono text-muted">
                      Inngest Pipeline
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Artifact Modal */}
      <GenerateArtifactModal
        workspaceId={workspaceId}
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
      />

      {/* Interactive Detail Viewer Modal */}
      <ArtifactDetailModal
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </div>
  );
}
