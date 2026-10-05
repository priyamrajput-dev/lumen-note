import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useCreateWorkspace } from "@/api/workspaces";
import { getErrorMessage } from "@/api/client";
import { dialogOverlayVariants, dialogContentVariants } from "@/lib/motion";
import type { ChatModel } from "@/types";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (typeof document === "undefined") return null;

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
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-workspace-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={dialogOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-overlay backdrop-blur-xs"
            onClick={createMutation.isPending ? undefined : onClose}
          />
          <motion.div
            variants={dialogContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md rounded-[var(--radius-base)] border border-border bg-card p-6 shadow-none"
          >
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <div>
              <h3 id="create-workspace-title" className="text-base font-semibold text-foreground tracking-tight">
                New Research Workspace
              </h3>
              <p className="text-xs text-muted-foreground">
                Group sources, grounded chats, and synthesized notes.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-[var(--radius-base)] bg-card border border-destructive/50 text-destructive flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Workspace Icon
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-[var(--radius-base)] border border-border bg-background">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`h-8 w-8 rounded-[var(--radius-base)] text-base flex items-center justify-center transition-all cursor-pointer ${
                    icon === emoji
                      ? "border border-foreground/60 bg-secondary"
                      : "border border-transparent hover:bg-secondary"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="workspace-title-input" className="block text-xs font-semibold text-foreground mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="workspace-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Research"
              required
              className="w-full h-9 rounded-[var(--radius-base)] border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground transition-colors outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div>
            <label htmlFor="workspace-desc-input" className="block text-xs font-semibold text-foreground mb-1.5">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="workspace-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key hypotheses, research goals, or reading objectives..."
              className="w-full rounded-[var(--radius-base)] border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground transition-colors outline-none focus:border-foreground focus:ring-1 focus:ring-foreground resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Default LLM Synthesis Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o-mini")}
                className={`p-3 rounded-[var(--radius-base)] border text-left transition-all cursor-pointer ${
                  defaultModel === "gpt-4o-mini"
                    ? "border-foreground/80 bg-background"
                    : "border-border bg-background/50 hover:border-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-foreground">gpt-4o-mini</span>
                  <span className="text-[10px] rounded-[100px] border border-border px-1.5 text-muted-foreground">Fast</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  High-speed retrieval &amp; study deck generation.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDefaultModel("gpt-4o")}
                className={`p-3 rounded-[var(--radius-base)] border text-left transition-all cursor-pointer ${
                  defaultModel === "gpt-4o"
                    ? "border-foreground/80 bg-background"
                    : "border-border bg-background/50 hover:border-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-foreground">gpt-4o</span>
                  <span className="text-[10px] rounded-[100px] border border-category-workspaces/40 px-1.5 text-category-workspaces">Deep</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Complex reasoning &amp; multi-source synthesis.
                </p>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={createMutation.isPending}
              loadingText="Saving…"
              disabled={!title.trim()}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
