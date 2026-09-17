import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  isDestructive?: boolean;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmLabel,
  cancelText = "Cancel",
  isDestructive,
  variant,
  isLoading = false,
}: ConfirmDialogProps) {
  const actualConfirmText = confirmLabel || confirmText || "Delete";
  const actualIsDestructive = variant !== undefined ? variant === "danger" : isDestructive !== undefined ? isDestructive : true;
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {actualIsDestructive && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10 border border-error/20 text-error">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}

          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-base font-bold text-foreground tracking-tight"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-xs text-foreground-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-border/80 bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-75 shadow-xs ${
              actualIsDestructive
                ? "bg-error hover:bg-error/90 hover:shadow-error/20"
                : "bg-accent hover:bg-accent-hover hover:shadow-accent-glow"
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{actualConfirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
