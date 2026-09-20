import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string | number;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/70 ${className}`}
    >
      <div className="min-w-0 flex-1">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-2 text-xs text-muted">
            {breadcrumbs}
          </nav>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="fluid-h1 text-foreground tracking-tight">
            {title}
          </h1>
          {badge !== undefined && (
            <span className="inline-flex items-center rounded-md bg-surface-secondary px-2.5 py-0.5 text-xs font-mono font-medium text-foreground-secondary border border-border/70 shadow-2xs">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1.5 text-xs sm:text-sm text-foreground-secondary max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {actions}
        </div>
      )}
    </header>
  );
}
