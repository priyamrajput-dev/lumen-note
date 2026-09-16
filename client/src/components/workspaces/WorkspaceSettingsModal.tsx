import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/api/workspaces";
import { getErrorMessage } from "@/api/client";
import type { Workspace, ChatModel } from "@/types";
import { X, Settings, Trash2, AlertCircle, Loader2 } from "lucide-react";

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

  if (!isOpen || !workspace) return null;

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

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you completely sure you want to delete "${workspace.title}"? This cannot be undone.`,
      )
    ) {
      try {
        await deleteMutation.mutateAsync(workspace.id);
        onClose();
        onDeleted?.();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-secondary text-muted">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Workspace Settings
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-error/10 border border-error/25 px-3 py-2 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Workspace Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-all cursor-pointer ${
                    icon === em
                      ? "border-accent bg-accent-subtle shadow-xs scale-105"
                      : "border-border bg-surface-secondary/60 hover:bg-surface-secondary text-foreground"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Title
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3.5 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3.5 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Default LLM Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o-mini")}
                className={`p-2 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                  defaultModel === "gpt-4o-mini"
                    ? "border-accent bg-accent-subtle font-semibold text-foreground"
                    : "border-border bg-surface-secondary/40 text-muted hover:text-foreground"
                }`}
              >
                gpt-4o-mini
              </button>
              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o")}
                className={`p-2 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                  defaultModel === "gpt-4o"
                    ? "border-accent bg-accent-subtle font-semibold text-foreground"
                    : "border-border bg-surface-secondary/40 text-muted hover:text-foreground"
                }`}
              >
                gpt-4o
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5 border-t border-border">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1.5 text-xs text-error hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Workspace</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors shadow-xs cursor-pointer"
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
