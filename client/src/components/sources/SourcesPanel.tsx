import React, { useState } from "react";
import {
  useSources,
  useDeleteSource,
  useBulkDeleteSources,
  type SourceFilters,
} from "@/api/sources";
import type { Source, SourceType, SourceStatus } from "@/types";
import { AddSourceModal } from "./AddSourceModal";
import { SourcePreviewDrawer } from "./SourcePreviewDrawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
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
        return <FileText className="h-3.5 w-3.5 text-rose-500" />;
      case "WEBSITE":
        return <Globe className="h-3.5 w-3.5 text-blue-500" />;
      case "YOUTUBE":
        return <Video className="h-3.5 w-3.5 text-red-500" />;
      case "MARKDOWN":
      case "TEXT":
      default:
        return <FileCode className="h-3.5 w-3.5 text-accent" />;
    }
  };

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-success-subtle px-1.5 py-0.5 text-[9px] font-mono font-medium text-success border border-success/20">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Ready
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary-subtle px-1.5 py-0.5 text-[9px] font-mono font-medium text-primary border border-primary/25">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Indexing
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-error-subtle px-1.5 py-0.5 text-[9px] font-mono font-medium text-error border border-error/20">
            <AlertTriangle className="h-2.5 w-2.5" />
            Failed
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-warning-subtle px-1.5 py-0.5 text-[9px] font-mono font-medium text-warning border border-warning/20">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Queued
          </span>
        );
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface/40 text-foreground overflow-hidden">
      {/* Top Header & Action */}
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3.5 py-2.5 bg-surface/90 shrink-0 shadow-2xs">
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
            <button
              type="button"
              onClick={() => setShowBulkDeleteConfirm(true)}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex items-center gap-1 h-7 rounded-lg bg-error/10 border border-error/20 px-2 text-[10px] font-medium text-error hover:bg-error/20 transition-colors cursor-pointer subtle-focus"
              title="Delete selected sources"
              aria-label={`Delete ${selectedIds.length} selected sources`}
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1 h-7 rounded-lg bg-primary px-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer subtle-focus"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
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
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary border border-border text-accent mb-2.5 shadow-2xs">
              <FileUp className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">No sources added</h4>
            <p className="mt-1 text-[11px] text-foreground-secondary leading-tight max-w-[200px]">
              Ingest a PDF paper, web article, or video transcript to ground your research.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 h-7 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer subtle-focus"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Source</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && sources && sources.length > 0 && (
          <>
            {/* Grounding Selection Bar */}
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-surface-secondary/40 border border-border/60 text-[10px] font-mono text-muted mb-1">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 hover:text-foreground cursor-pointer subtle-focus rounded"
                title={allSelected ? "Deselect all sources" : "Select all sources for chat grounding"}
              >
                {allSelected ? (
                  <CheckSquare className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-muted" />
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
                  className="text-[10px] text-accent hover:underline cursor-pointer font-sans font-medium"
                >
                  Reset to all
                </button>
              )}
            </div>

            {sources.map((src) => {
              const isSelected = selectedIds.includes(src.id);
              return (
                <div
                  key={src.id}
                  className={`@container group relative flex flex-col rounded-lg border p-2.5 transition-all text-xs ${
                    isSelected
                      ? "border-accent/60 bg-accent-subtle/40 ring-1 ring-accent/30"
                      : "border-border/80 bg-surface hover:border-border hover:bg-surface-secondary/40 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(src.id)}
                      className="text-muted hover:text-foreground mt-0.5 shrink-0 cursor-pointer subtle-focus rounded p-0.5"
                      aria-label={`Select source ${src.title} for chat grounding`}
                      title={isSelected ? "Remove from active chat context" : "Select to chat specifically with this source"}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-accent" />
                      ) : (
                        <Square className="h-4 w-4 text-muted hover:text-foreground" />
                      )}
                    </button>

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary border border-border/70">
                      {getSourceIcon(src.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewSource(src)}
                          className="font-medium text-foreground hover:text-accent truncate text-left transition-colors text-xs cursor-pointer block max-w-[160px] subtle-focus"
                          title={src.title}
                        >
                          {src.title}
                        </button>

                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewSource(src);
                            }}
                            className="flex items-center justify-center h-6 w-6 rounded text-muted hover:text-foreground hover:bg-surface-secondary cursor-pointer subtle-focus"
                            title="Preview document"
                            aria-label={`Preview document ${src.title}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSourceToDelete({ id: src.id, title: src.title });
                            }}
                            className="flex items-center justify-center h-6 w-6 rounded text-muted hover:text-error hover:bg-error/10 cursor-pointer subtle-focus"
                            title="Delete source"
                            aria-label={`Delete source ${src.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-muted">
                        <span className="rounded bg-surface-secondary px-1 py-0.2 border border-border/70">
                          {src.type}
                        </span>

                        {getStatusBadge(src.status)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Add Source Modal */}
      <AddSourceModal
        workspaceId={workspaceId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Source Preview Drawer */}
      <SourcePreviewDrawer
        source={previewSource}
        isOpen={Boolean(previewSource)}
        onClose={() => setPreviewSource(null)}
      />

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
