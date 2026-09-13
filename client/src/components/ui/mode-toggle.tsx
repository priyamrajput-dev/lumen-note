import { useTheme } from "@/components/provider/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center p-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-muted hover:text-foreground transition-all cursor-pointer"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-accent transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-accent transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}