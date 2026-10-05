import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  size?: "default" | "large";
}

export const GradientCard = forwardRef<HTMLDivElement, GradientCardProps>(
  ({ className, active, size = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-[var(--radius-base)] border border-border bg-card transition-all duration-200",
          active
            ? "gradient-border-active"
            : size === "large"
            ? "gradient-border-hover-lg"
            : "gradient-border-hover",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GradientCard.displayName = "GradientCard";
