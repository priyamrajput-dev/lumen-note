import React from "react";
import { Check, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type NormalizedStatus = "pending" | "processing" | "ready" | "failed";

export interface StatusBadgeProps {
  status: string | undefined | null;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function normalizeStatus(rawStatus?: string | null): NormalizedStatus {
  if (!rawStatus) return "pending";
  const s = rawStatus.toLowerCase().trim();
  if (s === "ready" || s === "completed" || s === "done" || s === "success") {
    return "ready";
  }
  if (
    s === "processing" ||
    s === "indexing" ||
    s === "generating" ||
    s === "in_progress" ||
    s === "active"
  ) {
    return "processing";
  }
  if (s === "failed" || s === "error" || s === "rejected") {
    return "failed";
  }
  // pending / queued / unknown
  return "pending";
}

const statusConfig: Record<
  NormalizedStatus,
  {
    defaultLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    pillClasses: string;
    iconClasses: string;
  }
> = {
  pending: {
    defaultLabel: "Pending",
    icon: Clock,
    pillClasses: "bg-status-pending-bg text-status-pending border-status-pending-border",
    iconClasses: "text-status-pending",
  },
  processing: {
    defaultLabel: "Indexing",
    icon: Loader2,
    pillClasses: "bg-status-processing-bg text-status-processing border-status-processing-border",
    iconClasses: "text-status-processing animate-spin",
  },
  ready: {
    defaultLabel: "Ready",
    icon: Check,
    pillClasses: "bg-status-ready-bg text-status-ready border-status-ready-border",
    iconClasses: "text-status-ready",
  },
  failed: {
    defaultLabel: "Failed",
    icon: AlertCircle,
    pillClasses: "bg-status-failed-bg text-status-failed border-status-failed-border",
    iconClasses: "text-status-failed",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  showIcon = true,
}) => {
  const norm = normalizeStatus(status);
  const config = statusConfig[norm];
  const Icon = config.icon;

  // Derive sensible display label if not explicitly provided
  let displayLabel = label;
  if (!displayLabel) {
    if (status) {
      const lower = status.toLowerCase();
      if (lower === "processing" || lower === "indexing") {
        displayLabel = "Indexing";
      } else if (lower === "generating") {
        displayLabel = "Generating";
      } else if (lower === "ready" || lower === "completed") {
        displayLabel = "Ready";
      } else if (lower === "failed" || lower === "error") {
        displayLabel = "Failed";
      } else if (lower === "pending" || lower === "queued") {
        displayLabel = "Queued";
      } else {
        displayLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      }
    } else {
      displayLabel = config.defaultLabel;
    }
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[100px] text-[10px] font-mono font-medium border transition-colors duration-200 select-none leading-none",
        config.pillClasses,
        className
      )}
    >
      {showIcon && <Icon className={cn("h-2.5 w-2.5 shrink-0", config.iconClasses)} aria-hidden="true" />}
      <span className="leading-none">{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
