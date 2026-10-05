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
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border ${className}`}
    >
      <div className="min-w-0 flex-1">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-2 text-xs text-muted-foreground">
            {breadcrumbs}
          </nav>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          {badge !== undefined && (
            <span className="inline-flex items-center rounded-[var(--radius-base)] bg-secondary px-2.5 py-0.5 text-xs font-mono font-medium text-muted-foreground border border-border shadow-none">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
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
