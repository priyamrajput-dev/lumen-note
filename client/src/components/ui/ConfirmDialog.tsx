import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { dialogOverlayVariants, dialogContentVariants } from "@/lib/motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            variants={dialogOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-overlay backdrop-blur-xs"
            onClick={isLoading ? undefined : onClose}
          />

          {/* Dialog Card */}
          <motion.div
            variants={dialogContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md rounded-[var(--radius-base)] border border-border bg-card p-6 shadow-none"
          >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close confirmation dialog"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-4">
          {actualIsDestructive && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-base)] bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-6">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-foreground tracking-tight"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={actualIsDestructive ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
            loadingText={actualIsDestructive ? "Deleting…" : "Processing…"}
          >
            {actualConfirmText}
          </Button>
        </div>
      </motion.div>
    </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
