import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "lumen-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item === "light" || item === "dark" || item === "system") {
      return item;
    }
  } catch (e) {
    // Local storage access may be blocked
  }
  return "system";
}

// Briefly disable CSS transitions on the page during a theme swap to avoid awkward intermediate flashes
function withDisabledTransitions(fn: () => void) {
  if (typeof document === "undefined") return fn();
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
    )
  );
  document.head.appendChild(css);
  try {
    fn();
  } finally {
    // Force DOM reflow before removing the transition suppression
    (() => window.getComputedStyle(document.body))();
    setTimeout(() => {
      if (document.head.contains(css)) {
        document.head.removeChild(css);
      }
    }, 1);
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = getStoredTheme();
    return stored || defaultTheme;
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const [, startTransition] = useTransition();

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  // Listen to OS system color-scheme changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Update DOM classes and styles
  useEffect(() => {
    if (typeof document === "undefined") return;

    withDisabledTransitions(() => {
      const root = document.documentElement;
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    });
  }, [resolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      // Storage unavailable
    }
    startTransition(() => {
      setThemeState(newTheme);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
