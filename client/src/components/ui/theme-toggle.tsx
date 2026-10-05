import React from "react";
import { useTheme } from "@/components/provider/ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isSmall = size === "sm";

  return (
    <Button
      type="button"
      variant="outline"
      size={isSmall ? "icon-sm" : "icon"}
      onClick={cycleTheme}
      className={cn("bg-card text-muted-foreground hover:text-foreground", isSmall ? "size-7" : "size-8", className)}
      title={`Theme: ${theme} (click to toggle)`}
      aria-label={`Current theme is ${theme}. Click to toggle theme.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme === "system" ? "system" : resolvedTheme}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          {theme === "system" ? (
            <Laptop className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
          ) : resolvedTheme === "dark" ? (
            <Moon className={isSmall ? "h-3.5 w-3.5 text-category-artifacts" : "h-4 w-4 text-category-artifacts"} />
          ) : (
            <Sun className={isSmall ? "h-3.5 w-3.5 text-category-artifacts" : "h-4 w-4 text-category-artifacts"} />
          )}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

export default ThemeToggle;
