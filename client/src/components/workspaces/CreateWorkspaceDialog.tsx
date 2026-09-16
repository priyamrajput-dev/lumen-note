import React, { useState } from "react";
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h3 className="text-base font-bold text-foreground">
                New Research Workspace
              </h3>
              <p className="text-[11px] text-muted">
                Group sources, grounded chats, and synthesized notes.
              </p>
            </div>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Workspace Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-all cursor-pointer ${
                    icon === emoji
                      ? "border-accent bg-accent-subtle shadow-xs scale-105"
                      : "border-border bg-surface-secondary/60 hover:bg-surface-secondary text-foreground"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Distributed Systems & AI Research"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3.5 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="What are you researching in this workspace?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3.5 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Default Model */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Default LLM Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o-mini")}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  defaultModel === "gpt-4o-mini"
                    ? "border-accent bg-accent-subtle"
                    : "border-border bg-surface-secondary/40 hover:bg-surface-secondary"
                }`}
              >
                <span className="text-xs font-semibold text-foreground">gpt-4o-mini</span>
                <span className="text-[10px] text-muted">Fast & cost-efficient</span>
              </button>

              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o")}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  defaultModel === "gpt-4o"
                    ? "border-accent bg-accent-subtle"
                    : "border-border bg-surface-secondary/40 hover:bg-surface-secondary"
                }`}
              >
                <span className="text-xs font-semibold text-foreground">gpt-4o</span>
                <span className="text-[10px] text-muted">Deep reasoning</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3.5 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-3.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !title.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
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
