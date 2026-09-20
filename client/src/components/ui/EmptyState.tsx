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
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/40 p-8 sm:p-12 text-center transition-colors ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-secondary border border-border/70 text-accent mb-4 shadow-2xs">
        {icon}
      </div>

      <h3 className="fluid-h3 text-foreground tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-foreground-secondary leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-accent-glow transition-all active:scale-[0.98] cursor-pointer subtle-focus min-h-[38px]"
        >
          {actionIcon}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
