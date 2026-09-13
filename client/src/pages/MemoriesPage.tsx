import React, { useState } from "react";
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-background text-foreground transition-colors">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Personal Knowledge & Memories
              </h1>
              <span className="text-xs font-mono font-medium rounded-full bg-surface-secondary text-muted border border-border px-2 py-0.5">
                {memories?.length || 0}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-foreground-secondary">
              Lumen Note uses Mem0 to recall your research preferences, citation habits, and persistent context.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Guideline / Rule</span>
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
              className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 rounded-xl border border-border/60 bg-surface animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && memories?.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-accent mb-3">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-foreground">No memories recorded yet</h4>
            <p className="mt-1 max-w-xs text-xs text-foreground-secondary leading-relaxed">
              Memories are learned automatically during research chats, or you can add custom rules here.
            </p>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Rule</span>
            </button>
          </div>
        )}

        {/* Memories List */}
        {!isLoading && !isError && filteredMemories && filteredMemories.length > 0 && (
          <div className="mt-6 space-y-2.5">
            {filteredMemories.map((mem) => {
              const isEditing = editingId === mem.id;

              return (
                <div
                  key={mem.id}
                  className="group rounded-2xl border border-border bg-surface p-4 transition-all hover:border-accent/40 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium ${
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
                        <div className="mt-2 space-y-2">
                          <textarea
                            rows={2}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full rounded-xl border border-accent bg-surface-secondary/40 p-2 text-xs text-foreground focus:outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(mem.id)}
                              disabled={updateMutation.isPending}
                              className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent-hover cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-muted hover:text-foreground cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-foreground leading-relaxed font-sans">
                          {mem.memory}
                        </p>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(mem)}
                          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                          title="Edit memory"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(mem.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                          title="Delete memory"
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
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
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
                  className="w-full rounded-xl border border-border bg-surface-secondary/40 p-3 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none resize-none transition-colors"
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {createMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Save Guideline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
