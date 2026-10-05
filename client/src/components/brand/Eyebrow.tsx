import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type EyebrowCategory = "sources" | "chat" | "artifacts" | "memories" | "workspaces" | "default";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  category?: EyebrowCategory;
  className?: string;
  as?: "span" | "div" | "h2" | "h3";
}

const CATEGORY_CLASSES: Record<EyebrowCategory, string> = {
  sources: "text-category-sources",
  chat: "text-category-chat",
  artifacts: "text-category-artifacts",
  memories: "text-category-memories",
  workspaces: "text-category-workspaces",
  default: "text-foreground",
};

export function Eyebrow({
  children,
  category = "default",
  className,
  as: Component = "span",
  ...props
}: EyebrowProps) {
  const colorClass = CATEGORY_CLASSES[category] || "text-foreground";

  return (
    <Component
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-body-sm sm:text-body font-normal tracking-[-0.01em] select-none text-foreground",
        className
      )}
      {...props}
    >
      <motion.span
        initial={{ x: -8, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-muted-foreground font-normal"
        aria-hidden="true"
      >
        &#123;
      </motion.span>
      <span className={cn("px-1 font-medium", colorClass)}>{children}</span>
      <motion.span
        initial={{ x: 8, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="text-muted-foreground font-normal"
        aria-hidden="true"
      >
        &#125;
      </motion.span>
    </Component>
  );
}

export default Eyebrow;
