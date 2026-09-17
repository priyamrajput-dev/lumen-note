import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthSession, useSignOut, signInWithGoogle } from "@/api/auth";
import {
  FolderOpen,
  BrainCircuit,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { CommandPalette } from "./CommandPalette";
import { LumenLogo } from "@/components/brand/LumenLogo";

export function Navbar() {
  const { data: session } = useAuthSession();
  const signOutMutation = useSignOut();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign in error:", err);
      setSigningIn(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors shadow-2xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Brand & Primary Navigation */}
          <div className="flex items-center gap-7">
            <Link
              to={session?.user ? "/dashboard" : "/"}
              className="hover:opacity-90 transition-opacity subtle-focus rounded-lg"
              aria-label="Lumen Note Home"
            >
              <LumenLogo size="sm" variant="full" />
            </Link>

            {session?.user && (
              <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    location.pathname === "/dashboard" || location.pathname.startsWith("/workspace")
                      ? "bg-accent-subtle text-accent font-semibold shadow-2xs"
                      : "text-foreground-secondary hover:text-foreground hover:bg-surface-secondary/70"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>Workspaces</span>
                </Link>

                <Link
                  to="/memories"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    location.pathname === "/memories"
                      ? "bg-accent-subtle text-accent font-semibold shadow-2xs"
                      : "text-foreground-secondary hover:text-foreground hover:bg-surface-secondary/70"
                  }`}
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>Memories</span>
                </Link>
              </nav>
            )}
          </div>

          {/* Right: Search, Theme Toggle, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Command Palette Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface-secondary/50 px-2.5 sm:px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-surface-secondary hover:border-border transition-all cursor-pointer shadow-2xs"
              title="Quick Search (⌘K)"
              aria-label="Open Command Palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-sans">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted">
                ⌘K
              </kbd>
            </button>

            <ModeToggle />

            {session?.user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border/80 bg-surface hover:bg-surface-secondary hover:border-border transition-all cursor-pointer shadow-2xs group subtle-focus"
                  title="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      className="h-6 w-6 rounded-full ring-1 ring-border/80 object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white shadow-xs">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-foreground max-w-[110px] truncate hidden sm:inline">
                    {session.user.name}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-muted transition-transform duration-150 ${
                      profileMenuOpen ? "rotate-180 text-foreground" : "group-hover:text-foreground"
                    }`}
                  />
                </button>

                {/* Profile Popover / Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                    {/* User Header Details */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-secondary/70 border border-border/60 mb-1.5">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User avatar"}
                          className="h-9 w-9 rounded-full ring-1 ring-border object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-xs">
                          {session.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">
                          {session.user.name}
                        </p>
                        <p className="text-[11px] text-muted truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="space-y-0.5 py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
                      >
                        <FolderOpen className="h-4 w-4 text-accent" />
                        <span>Workspaces Library</span>
                      </Link>

                      <Link
                        to="/memories"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
                      >
                        <BrainCircuit className="h-4 w-4 text-accent" />
                        <span>Knowledge Memories</span>
                      </Link>
                    </div>

                    <div className="my-1 border-t border-border/60" />

                    {/* Sign Out Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        signOutMutation.mutate();
                      }}
                      disabled={signOutMutation.isPending}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-error hover:bg-error/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-error" />
                      <span>{signOutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={signingIn}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:shadow-accent-glow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75"
              >
                {signingIn && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg border border-border/80 bg-surface text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg">
            {session?.user ? (
              <>
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/70">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      className="h-8 w-8 rounded-full ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
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

                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
                  >
                    <FolderOpen className="h-4 w-4 text-accent" />
                    <span>Workspaces Library</span>
                  </Link>

                  <Link
                    to="/memories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors"
                  >
                    <BrainCircuit className="h-4 w-4 text-accent" />
                    <span>Knowledge Memories</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-border/70">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOutMutation.mutate();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-error hover:bg-error/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-error" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignIn();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover shadow-xs"
                >
                  <span>Sign In with Google</span>
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
