import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/api/workspaces";
import { getErrorMessage } from "@/api/client";
import type { Workspace, ChatModel } from "@/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { X, Settings, Pencil, Trash2, AlertCircle, Loader2 } from "lucide-react";

interface WorkspaceSettingsModalProps {
  workspace: Workspace | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

const EMOJI_OPTIONS = ["🧠", "📚", "🔬", "💻", "⚡", "📑", "💡", "🎯", "🌐", "📈"];

export function WorkspaceSettingsModal({
  workspace,
  isOpen,
  onClose,
  onDeleted,
}: WorkspaceSettingsModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🧠");
  const [defaultModel, setDefaultModel] = useState<ChatModel>("gpt-4o-mini");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();

  useEffect(() => {
    if (workspace) {
      setTitle(workspace.title);
      setDescription(workspace.description || "");
      setIcon(workspace.icon || "🧠");
      setDefaultModel(workspace.defaultModel || "gpt-4o-mini");
    }
  }, [workspace]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !updateMutation.isPending && !showDeleteConfirm) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, updateMutation.isPending, showDeleteConfirm, onClose]);

  if (!isOpen || !workspace || typeof document === "undefined") return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError(null);
    try {
      await updateMutation.mutateAsync({
        id: workspace.id,
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
          icon,
          defaultModel,
        },
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(workspace.id);
      setShowDeleteConfirm(false);
      onClose();
      onDeleted?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="workspace-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={updateMutation.isPending ? undefined : onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-border/70">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-subtle text-accent">
              <Pencil className="h-3.5 w-3.5" />
            </div>
            <h3 id="workspace-settings-title" className="fluid-h3 text-foreground tracking-tight">
              Edit Workspace
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer subtle-focus"
            aria-label="Close settings dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-error/10 border border-error/25 px-3 py-2 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Workspace Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-all cursor-pointer subtle-focus ${
                    icon === em
                      ? "border-accent bg-accent-subtle shadow-xs scale-105"
                      : "border-border/80 bg-surface-secondary/60 hover:bg-surface-secondary text-foreground"
                  }`}
                  aria-label={`Select icon ${em}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="settings-title" className="block text-xs font-semibold text-foreground mb-1">
              Title
            </label>
            <input
              id="settings-title"
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 rounded-lg border border-border/80 bg-surface px-3 text-xs text-foreground placeholder:text-muted subtle-focus transition-colors"
            />
          </div>

          <div>
            <label htmlFor="settings-desc" className="block text-xs font-semibold text-foreground mb-1">
              Description
            </label>
            <textarea
              id="settings-desc"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-surface p-3 text-xs text-foreground placeholder:text-muted subtle-focus transition-colors resize-none"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-foreground mb-1.5">
              Default LLM Engine
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o-mini")}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer subtle-focus ${
                  defaultModel === "gpt-4o-mini"
                    ? "border-accent bg-accent-subtle font-semibold text-foreground shadow-2xs"
                    : "border-border/80 bg-surface-secondary/40 text-muted hover:text-foreground"
                }`}
              >
                <div className="text-xs font-semibold text-foreground">gpt-4o-mini</div>
                <div className="text-[10px] text-muted">Fast &amp; cost-efficient</div>
              </button>
              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o")}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer subtle-focus ${
                  defaultModel === "gpt-4o"
                    ? "border-accent bg-accent-subtle font-semibold text-foreground shadow-2xs"
                    : "border-border/80 bg-surface-secondary/40 text-muted hover:text-foreground"
                }`}
              >
                <div className="text-xs font-semibold text-foreground">gpt-4o</div>
                <div className="text-[10px] text-muted">Deep reasoning</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/70">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer subtle-focus"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Workspace</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3.5 text-xs text-muted hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer subtle-focus"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer subtle-focus"
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </form>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Workspace"
          description={`Are you completely sure you want to delete "${workspace.title}"? All sources, vectors, chat sessions, and notes within it will be permanently deleted.`}
          confirmLabel="Delete Workspace"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>,
    document.body
  );
}
