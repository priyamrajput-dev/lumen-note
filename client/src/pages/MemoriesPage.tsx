import React, { useState } from "react";
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
import {
  BrainCircuit,
  Plus,
  Trash2,
  Edit3,
  Search,
  Loader2,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export function MemoriesPage() {
  const { data: memories, isLoading, isError } = useMemories();
  const createMutation = useCreateMemory();
  const updateMutation = useUpdateMemory();
  const deleteMutation = useDeleteMemory();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this memory rule?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background text-foreground transition-colors flex flex-col justify-between">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Knowledge Memories & Guidelines
              </h1>
              <span className="text-xs font-mono font-medium rounded-full bg-surface-secondary text-muted border border-border px-2.5 py-0.5">
                {memories?.length || 0}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-foreground-secondary">
              Lumen Note recalls your research habits, citation guidelines, and personal knowledge preferences across conversations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-accent-hover hover:shadow-accent-glow transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Guideline</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-error/10 border border-error/25 p-3 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search recalled memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl border border-border/60 bg-surface animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && memories?.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface py-16 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-foreground">No memories recorded yet</h4>
            <p className="mt-1.5 max-w-xs text-xs text-foreground-secondary leading-relaxed">
              Guidelines are automatically extracted from your research chats, or you can add custom rules here.
            </p>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent-hover shadow-md hover:shadow-accent-glow transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Guideline</span>
            </button>
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
                  className={`group relative rounded-2xl border bg-surface p-4 sm:p-5 transition-all shadow-xs ${
                    isEditing
                      ? "border-accent/50 ring-1 ring-accent/20 shadow-md"
                      : "border-border card-hover"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-medium ${
                            mem.source === "learned"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-accent-subtle text-accent border border-accent/20"
                          }`}
                        >
                          {mem.source === "learned" ? "AI Learned" : "Manual Preference"}
                        </span>
                        <span className="text-[11px] font-mono text-muted">
                          {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-3">
                          <textarea
                            rows={5}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            placeholder="Edit guideline text..."
                            className="w-full min-h-[130px] rounded-xl border border-accent/70 bg-surface-secondary/40 p-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all leading-relaxed resize-y"
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
                                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Cancel</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(mem.id)}
                                disabled={updateMutation.isPending || !editingText.trim()}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
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
                          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-subtle/50 transition-colors cursor-pointer border border-transparent hover:border-accent/20"
                          title="Edit guideline"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(mem.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer border border-transparent hover:border-error/20"
                          title="Delete guideline"
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
      </div>

      {/* Add Memory Modal */}
      {isAddOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3.5 border-b border-border">
                <h3 className="text-base font-bold text-foreground">
                  Add Knowledge Guideline
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 text-muted hover:text-foreground rounded-lg hover:bg-surface-secondary cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Guideline or Preference <span className="text-accent">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Always format equations in LaTeX. Focus on practical implementation details in Python."
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-secondary/40 p-3 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none resize-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !newMemoryText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-md hover:shadow-accent-glow cursor-pointer"
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

      <Footer />
    </div>
  );
}
