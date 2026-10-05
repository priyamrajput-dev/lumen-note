import React, { useState } from "react";
import { motion } from "motion/react";
import { useArtifacts, useDeleteArtifact } from "@/api/artifacts";
import type { LearningArtifact, ArtifactType, ArtifactStatus } from "@/types";
const GenerateArtifactModal = React.lazy(() =>
  import("./GenerateArtifactModal").then((m) => ({ default: m.GenerateArtifactModal }))
);
const ArtifactDetailModal = React.lazy(() =>
  import("./ArtifactDetailModal").then((m) => ({ default: m.ArtifactDetailModal }))
);
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { fadeUpVariants, staggerContainerVariants } from "@/lib/motion";
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
import { Button } from "@/components/ui/button";

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
  const [artifactToDelete, setArtifactToDelete] = useState<{ id: string; title: string } | null>(null);

  const filteredArtifacts = artifacts?.filter((art) => {
    if (filterType === "ALL") return true;
    if (filterType === "STUDY") return art.type === "FLASHCARDS" || art.type === "QUIZ" || art.type === "MINDMAP";
    if (filterType === "DOCS") return art.type === "SUMMARY" || art.type === "TAKEAWAYS" || art.type === "REPORT";
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!artifactToDelete) return;
    const targetId = artifactToDelete.id;
    try {
      await deleteMutation.mutateAsync(targetId);
      if (selectedArtifact?.id === targetId) {
        setSelectedArtifact(null);
      }
    } finally {
      setArtifactToDelete(null);
    }
  };

  const getArtifactIcon = (type: ArtifactType) => {
    switch (type) {
      case "FLASHCARDS":
        return <Sparkles className="h-3.5 w-3.5 text-category-artifacts" />;
      case "QUIZ":
        return <HelpCircle className="h-3.5 w-3.5 text-category-memories" />;
      case "MINDMAP":
        return <Network className="h-3.5 w-3.5 text-category-sources" />;
      case "TAKEAWAYS":
        return <ListChecks className="h-3.5 w-3.5 text-category-workspaces" />;
      case "SUMMARY":
      case "REPORT":
      default:
        return <BookOpen className="h-3.5 w-3.5 text-category-workspaces" />;
    }
  };

  const getArtifactTypeColor = (type: ArtifactType) => {
    switch (type) {
      case "MINDMAP":
        return "text-category-sources";
      case "FLASHCARDS":
        return "text-category-artifacts";
      case "SUMMARY":
      case "REPORT":
      case "TAKEAWAYS":
        return "text-category-workspaces";
      case "QUIZ":
        return "text-category-memories";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface/40 text-foreground overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3.5 py-2.5 bg-surface/90 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
            Notes &amp; Artifacts
          </span>
          <span className="text-[10px] font-mono font-medium rounded-md bg-surface-secondary text-muted px-1.5 py-0.5 border border-border/70">
            {artifacts?.length || 0}
          </span>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setIsGenerateOpen(true)}
          className="h-7 px-2.5 text-xs gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Generate</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border/70 p-2 bg-surface/40 shrink-0">
        <div className="flex items-center rounded-lg bg-surface-secondary/70 p-0.5 border border-border/70 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`flex-1 rounded-md py-1 text-center transition-colors cursor-pointer subtle-focus ${
              filterType === "ALL"
                ? "bg-surface text-foreground font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            All ({artifacts?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("STUDY")}
            className={`flex-1 rounded-md py-1 text-center transition-colors cursor-pointer subtle-focus ${
              filterType === "STUDY"
                ? "bg-surface text-foreground font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Study Tools
          </button>
          <button
            type="button"
            onClick={() => setFilterType("DOCS")}
            className={`flex-1 rounded-md py-1 text-center transition-colors cursor-pointer subtle-focus ${
              filterType === "DOCS"
                ? "bg-surface text-foreground font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Summaries
          </button>
        </div>
      </div>

      {/* Artifacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scroll-fade-edges">
        {isLoading && (
          <div className="space-y-2 p-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-lg border border-border/60 bg-surface/50 animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
            Failed to load workspace artifacts.
          </div>
        )}

        {!isLoading && !isError && artifacts?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/40 py-10 px-4 text-center my-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary border border-border text-category-artifacts mb-2.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">No artifacts generated</h4>
            <p className="mt-1 text-[11px] text-foreground-secondary leading-tight max-w-[200px]">
              Synthesize your indexed sources into 3D flashcards, quizzes, mindmaps, or executive summaries.
            </p>
            <button
              type="button"
              onClick={() => setIsGenerateOpen(true)}
              className="mt-3 inline-flex items-center gap-1 h-7 rounded-[100px] gradient-border bg-card hover:bg-secondary px-3 text-xs font-semibold text-foreground hover:text-category-artifacts transition-colors cursor-pointer subtle-focus"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate First Artifact</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredArtifacts && filteredArtifacts.length > 0 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            layout
            className="space-y-1.5"
          >
            {filteredArtifacts.map((art) => (
              <motion.div
                key={art.id}
                layout
                variants={fadeUpVariants}
                onClick={() => {
                  if (art.status === "READY") {
                    setSelectedArtifact(art);
                  }
                }}
                className={`@container group relative flex flex-col justify-between rounded-lg border p-3 transition-all text-xs gradient-border-hover panel-card ${
                  art.status === "PROCESSING" ? "gradient-border-active " : ""
                }${
                  art.status === "READY"
                    ? "cursor-pointer border-border bg-card hover:bg-muted/30"
                    : "border-border/60 bg-muted/20 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary border border-border">
                        {getArtifactIcon(art.type)}
                      </div>
                      <div className="min-w-0">
                        <span className={cn("text-[9px] font-mono font-bold uppercase tracking-wider block", getArtifactTypeColor(art.type))}>
                          {art.type}
                        </span>
                        <h4 className="text-xs font-bold text-foreground line-clamp-1 transition-colors">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setArtifactToDelete({ id: art.id, title: art.title });
                      }}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 text-muted-foreground hover:text-destructive"
                      title="Delete artifact"
                      aria-label={`Delete artifact ${art.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                  <StatusBadge status={art.status} />

                  {art.status === "READY" ? (
                    <span className={cn("flex items-center gap-1 font-semibold group-hover:underline", getArtifactTypeColor(art.type))}>
                      <Eye className="h-3 w-3" />
                      Open Tool
                    </span>
                  ) : (
                    <span className="font-mono text-muted-foreground">
                      Inngest Pipeline
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Generate Artifact Modal */}
      {isGenerateOpen && (
        <React.Suspense fallback={null}>
          <GenerateArtifactModal
            workspaceId={workspaceId}
            isOpen={isGenerateOpen}
            onClose={() => setIsGenerateOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Interactive Detail Viewer Modal */}
      {selectedArtifact && (
        <React.Suspense fallback={null}>
          <ArtifactDetailModal
            artifact={selectedArtifact}
            onClose={() => setSelectedArtifact(null)}
          />
        </React.Suspense>
      )}

      {/* Delete Artifact Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(artifactToDelete)}
        title="Delete Artifact"
        description={`Are you sure you want to delete "${artifactToDelete?.title}"? This study tool or summary will be permanently removed.`}
        confirmLabel="Delete Artifact"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setArtifactToDelete(null)}
      />
    </div>
  );
}
