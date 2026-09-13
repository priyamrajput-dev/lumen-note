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
import {
  Plus,
  Search,
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
}

export function SourcesPanel({ workspaceId, isCompact = false }: SourcesPanelProps) {
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<Source | null>(null);

  const allSelected =
    sources && sources.length > 0 && selectedIds.length === sources.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sources?.map((s) => s.id) || []);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteSingle = async (sourceId: string, title: string) => {
    if (window.confirm(`Delete source "${title}"?`)) {
      await deleteSourceMutation.mutateAsync(sourceId);
      setSelectedIds((prev) => prev.filter((id) => id !== sourceId));
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Delete ${selectedIds.length} selected source${
          selectedIds.length > 1 ? "s" : ""
        }?`,
      )
    ) {
      await bulkDeleteMutation.mutateAsync({ sourceIds: selectedIds });
      setSelectedIds([]);
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
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.2 text-[9px] font-mono font-medium text-success border border-success/20">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Ready
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.2 text-[9px] font-mono font-medium text-accent border border-accent/25">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Indexing
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-1.5 py-0.2 text-[9px] font-mono font-medium text-error border border-error/20">
            <AlertTriangle className="h-2.5 w-2.5" />
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
      {/* Top Header & Action */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2.5 bg-surface/90 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
            Sources
          </span>
          <span className="text-[10px] font-mono font-medium rounded-full bg-surface-secondary text-muted px-1.5 py-0.2 border border-border">
            {sources?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex items-center gap-1 rounded-lg bg-error/10 border border-error/20 px-2 py-1 text-[10px] font-medium text-error hover:bg-error/20 transition-colors cursor-pointer"
              title="Delete selected sources"
            >
              <Trash2 className="h-3 w-3" />
              <span>{selectedIds.length}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="border-b border-border p-2 space-y-1.5 bg-surface/40 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted" />
          <input
            type="text"
            placeholder="Filter sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface pl-7 pr-2.5 py-1 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 text-[10px]">
          <select
            value={typeFilter || ""}
            onChange={(e) =>
              setTypeFilter(
                (e.target.value as SourceType) || undefined,
              )
            }
            className="flex-1 rounded border border-border bg-surface px-2 py-1 text-[10px] font-mono text-foreground focus:border-accent focus:outline-none"
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
            className="rounded border border-border bg-surface px-1.5 py-1 text-[10px] font-mono text-foreground focus:border-accent focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="READY">Ready</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {isLoading && (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl border border-border/60 bg-surface animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">
            Failed to load workspace sources.
          </div>
        )}

        {!isLoading && !isError && sources?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 py-10 px-4 text-center my-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent mb-2.5">
              <FileUp className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">No sources added</h4>
            <p className="mt-1 text-[11px] text-muted leading-tight">
              Ingest a PDF paper, web article, or video transcript to ground your research.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Source</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && sources && sources.length > 0 && (
          <>
            {/* Select All Toggle Bar */}
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-muted">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 hover:text-foreground cursor-pointer"
              >
                {allSelected ? (
                  <CheckSquare className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-muted" />
                )}
                <span>Select All ({sources.length})</span>
              </button>
            </div>

            {sources.map((src) => {
              const isSelected = selectedIds.includes(src.id);
              return (
                <div
                  key={src.id}
                  className={`group relative flex flex-col rounded-xl border p-2.5 transition-all text-xs ${
                    isSelected
                      ? "border-accent/60 bg-accent-subtle/50"
                      : "border-border bg-surface hover:border-border/80 hover:bg-surface-secondary/40 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(src.id)}
                      className="text-muted hover:text-foreground mt-0.5 shrink-0 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-muted" />
                      )}
                    </button>

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-secondary border border-border">
                      {getSourceIcon(src.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewSource(src)}
                          className="font-medium text-foreground hover:text-accent truncate text-left transition-colors text-xs cursor-pointer block max-w-[160px]"
                          title={src.title}
                        >
                          {src.title}
                        </button>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setPreviewSource(src)}
                            className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-secondary"
                            title="Preview document"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(src.id, src.title)}
                            className="p-1 rounded text-muted hover:text-error hover:bg-error/10"
                            title="Delete source"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-muted">
                        <span className="rounded bg-surface-secondary px-1 py-0.2 border border-border">
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
        onClose={() => setPreviewSource(null)}
      />
    </div>
  );
}
