import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useUpdateWorkspace, useDeleteWorkspace } from "@/api/workspaces";
import { getErrorMessage } from "@/api/client";
import { dialogOverlayVariants, dialogContentVariants } from "@/lib/motion";
import type { Workspace, ChatModel } from "@/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { X, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (!workspace || typeof document === "undefined") return null;

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
    <>
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workspace-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            variants={dialogOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-overlay backdrop-blur-xs"
            onClick={updateMutation.isPending ? undefined : onClose}
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
              <h3 id="workspace-settings-title" className="text-base font-semibold text-foreground tracking-tight">
                Workspace Settings
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure defaults and metadata.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={updateMutation.isPending}
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

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
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
            <label htmlFor="settings-title-input" className="block text-xs font-semibold text-foreground mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="settings-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-9 rounded-[var(--radius-base)] border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground transition-colors outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
            />
          </div>

          <div>
            <label htmlFor="settings-desc-input" className="block text-xs font-semibold text-foreground mb-1.5">
              Description
            </label>
            <textarea
              id="settings-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                <span className="font-mono text-xs font-semibold text-foreground block mb-0.5">gpt-4o-mini</span>
                <span className="text-[11px] text-muted-foreground">High-speed retrieval.</span>
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
                <span className="font-mono text-xs font-semibold text-foreground block mb-0.5">gpt-4o</span>
                <span className="text-[11px] text-muted-foreground">Deep synthesis.</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={updateMutation.isPending}
                loadingText="Saving…"
                disabled={!title.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
      )}
    </AnimatePresence>

    <ConfirmDialog
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleConfirmDelete}
      title="Delete Workspace?"
      description={`Are you sure you want to delete "${workspace.title}"? All research sources, chat messages, and learning artifacts will be permanently lost.`}
      confirmText="Delete Workspace"
      isDestructive={true}
      isLoading={deleteMutation.isPending}
    />
    </>,
    document.body
  );
}
