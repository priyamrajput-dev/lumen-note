import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCreateWorkspace } from "@/api/workspaces";
import { getErrorMessage } from "@/api/client";
import type { ChatModel } from "@/types";
import { X, AlertCircle, Loader2 } from "lucide-react";

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (workspaceId: string) => void;
}

const EMOJI_OPTIONS = ["🧠", "📚", "🔬", "💻", "⚡", "📑", "💡", "🎯", "🌐", "📈"];

export function CreateWorkspaceDialog({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🧠");
  const [defaultModel, setDefaultModel] = useState<ChatModel>("gpt-4o-mini");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateWorkspace();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createMutation.isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, createMutation.isPending, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a workspace title");
      return;
    }

    setError(null);
    try {
      const created = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        icon,
        defaultModel,
      });
      setTitle("");
      setDescription("");
      onClose();
      onCreated?.(created.id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={createMutation.isPending ? undefined : onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <div>
              <h3 id="create-workspace-title" className="fluid-h3 text-foreground tracking-tight">
                New Research Workspace
              </h3>
              <p className="text-xs text-foreground-secondary">
                Group sources, grounded chats, and synthesized notes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer subtle-focus"
            aria-label="Close dialog"
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Workspace Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-all cursor-pointer subtle-focus ${
                    icon === emoji
                      ? "border-accent bg-accent-subtle shadow-xs scale-105"
                      : "border-border/80 bg-surface-secondary/60 hover:bg-surface-secondary text-foreground"
                  }`}
                  aria-label={`Select icon ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="workspace-title" className="block text-xs font-semibold text-foreground mb-1">
              Title <span className="text-accent">*</span>
            </label>
            <input
              id="workspace-title"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Distributed Systems & AI Research"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 rounded-lg border border-border/80 bg-surface px-3 text-xs text-foreground placeholder:text-muted subtle-focus transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="workspace-desc" className="block text-xs font-semibold text-foreground mb-1">
              Description <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="workspace-desc"
              rows={2}
              maxLength={500}
              placeholder="What are you researching in this workspace?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-surface p-3 text-xs text-foreground placeholder:text-muted subtle-focus transition-colors resize-none"
            />
          </div>

          {/* Default Model */}
          <div>
            <span className="block text-xs font-semibold text-foreground mb-1.5">
              Default LLM Engine
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o-mini")}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer subtle-focus ${
                  defaultModel === "gpt-4o-mini"
                    ? "border-accent bg-accent-subtle shadow-2xs"
                    : "border-border/80 bg-surface-secondary/40 hover:bg-surface-secondary"
                }`}
              >
                <span className="text-xs font-semibold text-foreground">gpt-4o-mini</span>
                <span className="text-[10px] text-muted">Fast &amp; cost-efficient</span>
              </button>

              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o")}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer subtle-focus ${
                  defaultModel === "gpt-4o"
                    ? "border-accent bg-accent-subtle shadow-2xs"
                    : "border-border/80 bg-surface-secondary/40 hover:bg-surface-secondary"
                }`}
              >
                <span className="text-xs font-semibold text-foreground">gpt-4o</span>
                <span className="text-[10px] text-muted">Deep reasoning</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/70">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="h-9 px-4 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer subtle-focus"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !title.trim()}
              className="inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xs cursor-pointer subtle-focus"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Workspace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
