import React from "react";

interface LumenLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "wordmark" | "full";
  className?: string;
}

const SIZES = {
  xs: { icon: "h-5 w-5", text: "text-xs", badge: "text-[8px]" },
  sm: { icon: "h-6 w-6", text: "text-sm", badge: "text-[9px]" },
  md: { icon: "h-8 w-8", text: "text-base", badge: "text-[10px]" },
  lg: { icon: "h-10 w-10", text: "text-xl", badge: "text-[11px]" },
  xl: { icon: "h-14 w-14", text: "text-2xl sm:text-3xl", badge: "text-xs" },
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
            className="w-full h-full drop-shadow-xs"
          >
            <defs>
              <linearGradient id="lumen-accent-grad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnBox">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="var(--accent-hover)" />
              </linearGradient>
              <linearGradient id="lumen-glow-grad" x1="18" y1="2" x2="18" y2="34" gradientUnits="userSpaceOnBox">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Ambient aura ring */}
            <circle cx="18" cy="18" r="16" stroke="url(#lumen-glow-grad)" strokeWidth="1.5" opacity="0.6" />
            
            {/* Outer Geometric Knowledge Diamond */}
            <rect
              x="18"
              y="4.5"
              width="19"
              height="19"
              rx="4"
              transform="rotate(45 18 4.5)"
              fill="url(#lumen-accent-grad)"
              opacity="0.95"
            />

            {/* Radiant Inner Star Prism */}
            <path
              d="M18 7C18 13.075 13.075 18 7 18C13.075 18 18 22.925 18 29C18 22.925 22.925 18 29 18C22.925 18 18 13.075 18 7Z"
              fill="#FFFFFF"
              opacity="0.9"
            />

            {/* Core Luminary Focus Dot */}
            <circle cx="18" cy="18" r="2" fill="var(--accent-hover)" />
            <circle cx="18" cy="18" r="0.8" fill="#FFFFFF" />
          </svg>
        </div>
      )}

      {/* Typography Wordmark */}
      {variant !== "icon" && (
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight text-foreground font-sans ${config.text}`}>
            Lumen<span className="text-accent font-extrabold">Note</span>
          </span>
          <span className={`hidden sm:inline-flex items-center rounded-md px-1.5 py-0.5 font-mono font-medium uppercase tracking-wider text-muted bg-surface-secondary border border-border ${config.badge}`}>
            Research AI
          </span>
        </div>
      )}
    </div>
  );
}
