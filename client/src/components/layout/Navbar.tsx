import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthSession, useSignOut } from "@/api/auth";
import {
  FolderOpen,
  BrainCircuit,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { CommandPalette } from "./CommandPalette";

export function Navbar() {
  const { data: session } = useAuthSession();
  const signOutMutation = useSignOut();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Brand & Primary Navigation */}
          <div className="flex items-center gap-6">
            <Link
              to={session?.user ? "/dashboard" : "/"}
              className="flex items-center gap-2.5 font-semibold text-foreground hover:opacity-90 transition-opacity select-none"
            >
              {/* Custom Lumen Note Monogram Identity */}
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-surface-secondary border border-border text-accent shadow-xs">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3" />
                  <path d="M12 19v3" />
                  <path d="m4.93 4.93 2.12 2.12" />
                  <path d="m16.95 16.95 2.12 2.12" />
                  <path d="M2 12h3" />
                  <path d="M19 12h3" />
                  <path d="m4.93 19.07 2.12-2.12" />
                  <path d="m16.95 7.05 2.12-2.12" />
                </svg>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                  Lumen Note
                </span>
                <span className="hidden sm:inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-medium tracking-wider uppercase text-muted bg-surface-secondary border border-border">
                  Research
                </span>
              </div>
            </Link>

            {session?.user && (
              <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-foreground-secondary">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname === "/dashboard" || location.pathname.startsWith("/workspace")
                      ? "bg-surface-secondary text-foreground font-semibold border border-border/60"
                      : "hover:text-foreground hover:bg-surface-secondary/60"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5 text-accent" />
                  <span>Workspaces</span>
                </Link>

                <Link
                  to="/memories"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname === "/memories"
                      ? "bg-surface-secondary text-foreground font-semibold border border-border/60"
                      : "hover:text-foreground hover:bg-surface-secondary/60"
                  }`}
                >
                  <BrainCircuit className="h-3.5 w-3.5 text-accent" />
                  <span>Memories</span>
                </Link>
              </nav>
            )}
          </div>

          {/* Right: Search, Theme Toggle, Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Command Palette Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted hover:text-foreground hover:bg-surface-secondary transition-all cursor-pointer shadow-2xs"
              title="Quick Search (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-sans">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-surface-secondary px-1.5 py-0.2 text-[10px] font-mono text-muted">
                ⌘K
              </kbd>
            </button>

            <ModeToggle />

            {session?.user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-border bg-surface">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="h-5 w-5 rounded-full ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-xs font-medium text-foreground max-w-[110px] truncate">
                    {session.user.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => signOutMutation.mutate()}
                  disabled={signOutMutation.isPending}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>

                {/* Mobile menu button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 rounded-lg border border-border bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-accent hover:bg-accent-hover text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {session?.user && (
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="h-7 w-7 rounded-full ring-1 ring-border"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {session.user.name}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary"
              >
                <FolderOpen className="h-4 w-4 text-accent" />
                <span>Workspaces Library</span>
              </Link>

              <Link
                to="/memories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary"
              >
                <BrainCircuit className="h-4 w-4 text-accent" />
                <span>Knowledge Memories</span>
              </Link>
            </div>

            {session?.user && (
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOutMutation.mutate();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-surface-secondary"
                >
                  <LogOut className="h-4 w-4 text-error" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
}
