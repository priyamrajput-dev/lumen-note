import React from "react";

interface LumenLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "wordmark" | "full";
  className?: string;
}

const SIZES = {
  xs: { icon: "h-5 w-5", text: "text-xs", badge: "text-[9px]" },
  sm: { icon: "h-6 w-6", text: "text-sm", badge: "text-[10px]" },
  md: { icon: "h-8 w-8", text: "text-base", badge: "text-[11px]" },
  lg: { icon: "h-10 w-10", text: "text-xl", badge: "text-xs" },
  xl: { icon: "h-14 w-14", text: "text-2xl sm:text-3xl", badge: "text-sm" },
};

export function LumenLogo({
  size = "md",
  variant = "full",
  className = "",
}: LumenLogoProps) {
  const config = SIZES[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Scalable SVG Emblem */}
      {variant !== "wordmark" && (
        <div className={`relative shrink-0 flex items-center justify-center ${config.icon}`}>
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="lumen-brand-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="20.74%" stopColor="var(--category-chat)" />
                <stop offset="65.5%" stopColor="var(--category-link)" />
              </linearGradient>
            </defs>

            {/* Ambient hairline ring */}
            <circle cx="18" cy="18" r="16" stroke="var(--border)" strokeWidth="1" />
            
            {/* Outer Geometric Knowledge Diamond */}
            <rect
              x="18"
              y="5"
              width="18.5"
              height="18.5"
              rx="4"
              transform="rotate(45 18 5)"
              fill="url(#lumen-brand-grad)"
              opacity="0.95"
            />

            {/* Radiant Inner Star Prism */}
            <path
              d="M18 7C18 13.075 13.075 18 7 18C13.075 18 18 22.925 18 29C18 22.925 22.925 18 29 18C22.925 18 18 13.075 18 7Z"
              fill="var(--background)"
              opacity="0.9"
            />

            {/* Core Luminary Focus Dot */}
            <circle cx="18" cy="18" r="2.5" fill="var(--foreground)" />
          </svg>
        </div>
      )}

      {/* Typography Wordmark */}
      {variant !== "icon" && (
        <div className="flex items-center gap-2">
          <span className={`font-semibold tracking-[-0.02em] text-foreground font-sans ${config.text}`}>
            Lumen<span className="text-category-chat font-semibold">Note</span>
          </span>
          <span className={`hidden sm:inline-flex items-center rounded-[var(--radius-base)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-card border border-border ${config.badge}`}>
            Research AI
          </span>
        </div>
      )}
    </div>
  );
}

export default LumenLogo;
