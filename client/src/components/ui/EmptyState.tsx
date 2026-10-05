import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[var(--radius-base)] border border-dashed border-border bg-card/50 p-8 sm:p-12 text-center transition-colors ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-base)] bg-card border border-border text-foreground mb-4 shadow-none">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-[100px] border border-foreground/90 bg-transparent px-5 py-2 text-xs font-semibold text-foreground hover:border-foreground/70 transition-all cursor-pointer min-h-[38px] outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {actionIcon}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
