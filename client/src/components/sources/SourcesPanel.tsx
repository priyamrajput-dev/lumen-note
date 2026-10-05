import React, { useState } from "react";
import { motion } from "motion/react";
import {
  useSources,
  useDeleteSource,
  useBulkDeleteSources,
  type SourceFilters,
} from "@/api/sources";
import type { Source, SourceType, SourceStatus } from "@/types";
const AddSourceModal = React.lazy(() =>
  import("./AddSourceModal").then((m) => ({ default: m.AddSourceModal }))
);
const SourcePreviewDrawer = React.lazy(() =>
  import("./SourcePreviewDrawer").then((m) => ({ default: m.SourcePreviewDrawer }))
);
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/status-badge";
import { fadeUpVariants, staggerContainerVariants } from "@/lib/motion";
import {
  Plus,
  FileUp,
  FileText,
  Globe,
  Video,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SourcesPanelProps {
  workspaceId: string;
  isCompact?: boolean;
  selectedSourceIds?: string[];
  onToggleSourceSelect?: (id: string) => void;
  onSelectAllSources?: () => void;
  onClearSourceSelection?: () => void;
}

export function SourcesPanel({
  workspaceId,
  isCompact = false,
  selectedSourceIds: propSelectedIds,
  onToggleSourceSelect,
  onSelectAllSources,
  onClearSourceSelection,
}: SourcesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<SourceType | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<SourceStatus | undefined>(undefined);

  const filters: SourceFilters = {
    q: searchQuery.trim() || undefined,
    type: typeFilter,
    status: statusFilter,
  };

  const { data: sources, isLoading, isError } = useSources(workspaceId, filters);
  const deleteSourceMutation = useDeleteSource(workspaceId);
  const bulkDeleteMutation = useBulkDeleteSources(workspaceId);

  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  const selectedIds = propSelectedIds !== undefined ? propSelectedIds : internalSelectedIds;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<Source | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const allSelected =
    sources && sources.length > 0 && selectedIds.length === sources.length;

  const toggleSelectAll = () => {
    if (onSelectAllSources) {
      onSelectAllSources();
    } else {
      if (allSelected) {
        setInternalSelectedIds([]);
      } else {
        setInternalSelectedIds(sources?.map((s) => s.id) || []);
      }
    }
  };

  const toggleSelectOne = (id: string) => {
    if (onToggleSourceSelect) {
      onToggleSourceSelect(id);
    } else {
      setInternalSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    }
  };

  const handleConfirmSingleDelete = async () => {
    if (!sourceToDelete) return;
    const targetId = sourceToDelete.id;
    try {
      await deleteSourceMutation.mutateAsync(targetId);
      if (selectedIds.includes(targetId) && onToggleSourceSelect) {
        onToggleSourceSelect(targetId);
      }
      setInternalSelectedIds((prev) => prev.filter((id) => id !== targetId));
      if (previewSource?.id === targetId) {
        setPreviewSource(null);
      }
    } catch (err) {
      console.error("Failed to delete source:", err);
    } finally {
      setSourceToDelete(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteMutation.mutateAsync({ sourceIds: selectedIds });
      if (previewSource && selectedIds.includes(previewSource.id)) {
        setPreviewSource(null);
      }
      if (onClearSourceSelection) {
        onClearSourceSelection();
      }
      setInternalSelectedIds([]);
    } catch (err) {
      console.error("Failed to bulk delete sources:", err);
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-3.5 w-3.5 text-category-memories" />;
      case "WEBSITE":
        return <Globe className="h-3.5 w-3.5 text-category-sources" />;
      case "YOUTUBE":
        return <Video className="h-3.5 w-3.5 text-category-artifacts" />;
      case "MARKDOWN":
      case "TEXT":
      default:
        return <FileCode className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getSourceTypeTextColor = (type: SourceType) => {
    switch (type) {
      case "PDF":
        return "text-category-memories";
      case "WEBSITE":
        return "text-category-sources";
      case "YOUTUBE":
        return "text-category-artifacts";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface/40 text-foreground overflow-hidden">
      {/* Top Header & Action */}
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3.5 py-2.5 bg-surface/90 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
            Sources
          </span>
          <span className="text-[10px] font-mono font-medium rounded-md bg-surface-secondary text-muted px-1.5 py-0.5 border border-border/70">
            {sources?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              disabled={bulkDeleteMutation.isPending}
              className="h-7 px-2 text-[10px] gap-1"
              title="Delete selected sources"
              aria-label={`Delete ${selectedIds.length} selected sources`}
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="border-b border-border/70 p-2 space-y-2 bg-surface/40 shrink-0">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter sources..."
          className="w-full text-xs"
        />

        <div className="flex items-center gap-1 text-[10px]">
          <select
            value={typeFilter || ""}
            onChange={(e) =>
              setTypeFilter(
                (e.target.value as SourceType) || undefined,
              )
            }
            className="flex-1 h-7 rounded-lg border border-border/80 bg-surface px-2 text-[10px] font-mono text-foreground subtle-focus"
            aria-label="Filter by source type"
          >
            <option value="">All Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="WEBSITE">Websites</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="MARKDOWN">Markdown Notes</option>
            <option value="TEXT">Plain Text</option>
          </select>

          <select
            value={statusFilter || ""}
            onChange={(e) =>
              setStatusFilter(
                (e.target.value as SourceStatus) || undefined,
              )
            }
            className="h-7 rounded-lg border border-border/80 bg-surface px-2 text-[10px] font-mono text-foreground subtle-focus"
            aria-label="Filter by source status"
          >
            <option value="">All Status</option>
            <option value="READY">Ready</option>
            <option value="PROCESSING">Indexing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scroll-fade-edges">
        {isLoading && (
          <div className="space-y-2 p-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg border border-border/60 bg-surface/50 animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
            Failed to load workspace sources.
          </div>
        )}

        {!isLoading && !isError && sources?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/40 py-10 px-4 text-center my-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary border border-border text-category-sources mb-2.5">
              <FileUp className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">No sources added</h4>
            <p className="mt-1 text-[11px] text-foreground-secondary leading-tight max-w-[200px]">
              Ingest a PDF paper, web article, or video transcript to ground your research.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 h-7 rounded-[100px] gradient-border bg-card hover:bg-secondary px-3 text-xs font-semibold text-foreground hover:text-category-sources transition-colors cursor-pointer subtle-focus"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Source</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && sources && sources.length > 0 && (
          <>
            {/* Grounding Selection Bar */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-secondary/40 border border-border text-[10px] font-mono text-muted-foreground mb-1">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 hover:text-foreground cursor-pointer subtle-focus rounded"
                title={allSelected ? "Deselect all sources" : "Select all sources for chat grounding"}
              >
                {allSelected ? (
                  <CheckSquare className="h-3.5 w-3.5 text-category-sources" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span>
                  {selectedIds.length > 0 && selectedIds.length < sources.length
                    ? `${selectedIds.length} of ${sources.length} active for chat`
                    : `All sources active (${sources.length})`}
                </span>
              </button>

              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClearSourceSelection) onClearSourceSelection();
                    else setInternalSelectedIds([]);
                  }}
                  className="text-[10px] text-category-sources hover:underline cursor-pointer font-sans font-medium"
                >
                  Reset to all
                </button>
              )}
            </div>

            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              layout
              className="space-y-1.5"
            >
              {sources.map((src) => {
                const isSelected = selectedIds.includes(src.id);
                return (
                  <motion.div
                    key={src.id}
                    layout
                    variants={fadeUpVariants}
                    className={`@container group relative flex flex-col rounded-lg border p-2.5 transition-all text-xs gradient-border-hover panel-card ${
                      src.status === "PROCESSING" ? "gradient-border-active " : ""
                    }${
                      isSelected
                        ? "border-category-sources/50 bg-secondary/50"
                        : "border-border bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(src.id)}
                        className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 cursor-pointer subtle-focus rounded p-0.5"
                        aria-label={`Select source ${src.title} for chat grounding`}
                        title={isSelected ? "Remove from active chat context" : "Select to chat specifically with this source"}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-category-sources" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary border border-border">
                        {getSourceIcon(src.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewSource(src)}
                            className="font-medium text-foreground hover:text-category-sources truncate text-left transition-colors text-xs cursor-pointer block max-w-[160px] subtle-focus"
                            title={src.title}
                          >
                            {src.title}
                          </button>

                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewSource(src);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                              title="Preview document"
                              aria-label={`Preview document ${src.title}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSourceToDelete({ id: src.id, title: src.title });
                              }}
                              className="text-muted-foreground hover:text-destructive"
                              title="Delete source"
                              aria-label={`Delete source ${src.title}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
                          <span className={`rounded bg-secondary px-1.5 py-0.5 border border-border font-semibold ${getSourceTypeTextColor(src.type)}`}>
                            {src.type}
                          </span>

                          <StatusBadge status={src.status} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>

      {/* Add Source Modal */}
      {isAddModalOpen && (
        <React.Suspense fallback={null}>
          <AddSourceModal
            workspaceId={workspaceId}
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Source Preview Drawer */}
      {Boolean(previewSource) && (
        <React.Suspense fallback={null}>
          <SourcePreviewDrawer
            source={previewSource}
            isOpen={Boolean(previewSource)}
            onClose={() => setPreviewSource(null)}
          />
        </React.Suspense>
      )}

      {/* Single Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(sourceToDelete)}
        title="Delete Source Document"
        description={`Are you sure you want to remove "${sourceToDelete?.title}"? All vector embeddings and semantic citations associated with this document will be purged.`}
        confirmLabel="Delete Source"
        variant="danger"
        isLoading={deleteSourceMutation.isPending}
        onConfirm={handleConfirmSingleDelete}
        onClose={() => setSourceToDelete(null)}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title="Delete Multiple Sources"
        description={`Are you sure you want to delete all ${selectedIds.length} selected source documents? This action cannot be reversed.`}
        confirmLabel="Delete Selected"
        variant="danger"
        isLoading={bulkDeleteMutation.isPending}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setShowBulkDeleteConfirm(false)}
      />
    </div>
  );
}
