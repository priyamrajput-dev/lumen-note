import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useMemories,
  useCreateMemory,
  useUpdateMemory,
  useDeleteMemory,
} from "@/api/memories";
import type { AppMemory } from "@/types";
import { getErrorMessage } from "@/api/client";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  BrainCircuit,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Check,
  X,
  AlertCircle,
  Calendar,
  RotateCcw,
} from "lucide-react";

export function MemoriesPage() {
  const { data: memories, isLoading, isError, refetch } = useMemories();
  const createMutation = useCreateMemory();
  const updateMutation = useUpdateMemory();
  const deleteMutation = useDeleteMemory();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAddOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createMutation.isPending) {
        setIsAddOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddOpen, createMutation.isPending]);

  const filteredMemories = memories?.filter((m) =>
    m.memory.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    setError(null);
    try {
      await createMutation.mutateAsync({ memory: newMemoryText.trim() });
      setNewMemoryText("");
      setIsAddOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleStartEdit = (mem: AppMemory) => {
    setEditingId(mem.id);
    setEditingText(mem.memory);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) return;
    try {
      await updateMutation.mutateAsync({
        memoryId: id,
        input: { memory: editingText.trim() },
      });
      setEditingId(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-background text-foreground transition-colors flex flex-col justify-between">
      <main className="page-container py-6 sm:py-8 max-w-4xl w-full flex-1">
        {/* Header */}
        <PageHeader
          title="Knowledge Memories & Guidelines"
          description="Lumen Note recalls your research habits, citation guidelines, and personal knowledge preferences across conversations."
          badge={memories?.length || 0}
          actions={
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-accent-glow transition-all active:scale-[0.98] cursor-pointer subtle-focus"
            >
              <Plus className="h-4 w-4" />
              <span>Add Guideline</span>
            </button>
          }
        />

        {/* Error Banner */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-error/10 border border-error/25 p-3.5 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-error/70 hover:text-error cursor-pointer p-0.5 subtle-focus rounded"
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mt-6 flex items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search recalled memories..."
            className="w-full sm:max-w-md"
          />
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-24 rounded-xl border border-border/60 bg-surface/50 animate-pulse p-4 flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 rounded bg-surface-secondary" />
                  <div className="h-3 w-16 rounded bg-surface-secondary" />
                </div>
                <div className="space-y-1.5 mt-2">
                  <div className="h-3 w-full rounded bg-surface-secondary/70" />
                  <div className="h-3 w-3/4 rounded bg-surface-secondary/70" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load Error State */}
        {isError && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-error/25 bg-error/5 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-error mb-2" />
            <h3 className="text-sm font-semibold text-foreground">Failed to load memories</h3>
            <p className="mt-1 text-xs text-foreground-secondary max-w-sm">
              We encountered an issue communicating with the backend.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors cursor-pointer subtle-focus"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && memories?.length === 0 && (
          <div className="mt-10">
            <EmptyState
              icon={<BrainCircuit className="h-6 w-6" />}
              title="No memories recorded yet"
              description="Guidelines are automatically extracted from your research chats, or you can add custom rules here."
              actionLabel="Add First Guideline"
              actionIcon={<Plus className="h-4 w-4" />}
              onAction={() => setIsAddOpen(true)}
            />
          </div>
        )}

        {/* Empty Search Results */}
        {!isLoading && !isError && memories && memories.length > 0 && filteredMemories?.length === 0 && (
          <div className="mt-10">
            <EmptyState
              icon={<BrainCircuit className="h-6 w-6" />}
              title="No matching memories found"
              description={`No guidelines matched "${searchQuery}".`}
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
            />
          </div>
        )}

        {/* Memories List */}
        {!isLoading && !isError && filteredMemories && filteredMemories.length > 0 && (
          <div className="mt-6 space-y-3">
            {filteredMemories.map((mem) => {
              const isEditing = editingId === mem.id;

              return (
                <div
                  key={mem.id}
                  className={`group relative rounded-xl border bg-surface p-4 sm:p-5 transition-all shadow-2xs ${
                    isEditing
                      ? "border-accent/60 ring-2 ring-accent/15 shadow-sm"
                      : "border-border/80 card-hover"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-medium ${
                            mem.source === "learned"
                              ? "bg-surface-secondary text-foreground-secondary border border-border/80"
                              : "bg-accent-subtle text-accent border border-accent/20"
                          }`}
                        >
                          {mem.source === "learned" ? "AI Learned" : "Manual Preference"}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-mono text-muted">
                          <Calendar className="h-3 w-3" />
                          {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-3">
                          <textarea
                            rows={4}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            placeholder="Edit guideline text..."
                            className="w-full rounded-lg border border-accent/70 bg-surface-secondary/40 p-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted subtle-focus transition-all leading-relaxed resize-y"
                            autoFocus
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] font-mono text-muted">
                              {editingText.length} characters
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                disabled={updateMutation.isPending}
                                className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-border/80 bg-surface px-3 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors cursor-pointer subtle-focus"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Cancel</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(mem.id)}
                                disabled={updateMutation.isPending || !editingText.trim()}
                                className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-xs subtle-focus"
                              >
                                {updateMutation.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-foreground leading-relaxed font-sans">
                          {mem.memory}
                        </p>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(mem)}
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-accent hover:bg-accent-subtle/50 transition-colors cursor-pointer border border-transparent hover:border-accent/20 subtle-focus"
                          title="Edit guideline"
                          aria-label="Edit guideline"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(mem.id)}
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer border border-transparent hover:border-error/20 subtle-focus"
                          title="Delete guideline"
                          aria-label="Delete guideline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Memory Modal */}
      {isAddOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-memory-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
              onClick={() => setIsAddOpen(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3.5 border-b border-border/70">
                <h3 id="add-memory-title" className="fluid-h3 text-foreground tracking-tight">
                  Add Knowledge Guideline
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex items-center justify-center h-8 w-8 text-muted hover:text-foreground rounded-lg hover:bg-surface-secondary cursor-pointer transition-colors subtle-focus"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="guideline-text" className="block text-xs font-semibold text-foreground mb-1.5">
                    Guideline or Preference <span className="text-accent">*</span>
                  </label>
                  <textarea
                    id="guideline-text"
                    rows={4}
                    required
                    placeholder="e.g. Always format equations in LaTeX. Focus on practical implementation details in Python."
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    className="w-full rounded-lg border border-border/80 bg-surface-secondary/40 p-3 text-xs text-foreground placeholder:text-muted subtle-focus resize-none transition-colors shadow-2xs"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-border/70">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="h-9 rounded-lg border border-border/80 bg-surface px-4 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors cursor-pointer subtle-focus"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !newMemoryText.trim()}
                    className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs hover:shadow-accent-glow cursor-pointer subtle-focus"
                  >
                    {createMutation.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    <span>Save Guideline</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Guideline?"
        description="Are you sure you want to delete this memory guideline? Lumen Note will no longer apply this rule in research chats."
        confirmText="Delete Guideline"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />

      <Footer />
    </div>
  );
}
