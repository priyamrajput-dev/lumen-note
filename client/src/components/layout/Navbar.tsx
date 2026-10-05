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
const CommandPalette = React.lazy(() =>
  import("./CommandPalette").then((m) => ({ default: m.CommandPalette }))
);
import { LumenLogo } from "@/components/brand/LumenLogo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

const prefetchDashboard = () => {
  import("@/pages/DashboardPage");
};
const prefetchMemories = () => {
  import("@/pages/MemoriesPage");
};

export function Navbar() {
  const { data: session } = useAuthSession();
  const signOutMutation = useSignOut();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

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

  // Scroll detection for header transparency and auto-hide on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 24);

      if (currentY > 140) {
        if (currentY > lastScrollY.current + 8) {
          setVisible(false); // scrolling down
        } else if (currentY < lastScrollY.current - 8) {
          setVisible(true); // scrolling up
        }
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isInsideWorkspace = location.pathname.startsWith("/workspace");
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isInsideWorkspace ? "hidden md:block" : "block"
        } ${visible ? "translate-y-0" : "-translate-y-full"} ${
          scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Brand & Primary Navigation */}
          <div className="flex items-center gap-7">
            <Link
              to={session?.user ? "/dashboard" : "/"}
              className="hover:opacity-90 transition-opacity outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-[var(--radius-base)]"
              aria-label="LumenNote Home"
            >
              <LumenLogo size="sm" variant="full" />
            </Link>

            {/* In-app navigation for logged in users */}
            {session?.user && (
              <nav aria-label="Main Navigation" className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
                <Link
                  to="/dashboard"
                  onMouseEnter={prefetchDashboard}
                  onFocus={prefetchDashboard}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[100px] border transition-all outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    location.pathname === "/dashboard" || location.pathname.startsWith("/workspace")
                      ? "border-category-workspaces/40 bg-card text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5 text-category-workspaces" />
                  <span>Workspaces</span>
                </Link>

                <Link
                  to="/memories"
                  onMouseEnter={prefetchMemories}
                  onFocus={prefetchMemories}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[100px] border transition-all outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    location.pathname === "/memories"
                      ? "border-category-memories/40 bg-card text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <BrainCircuit className="h-3.5 w-3.5 text-category-memories" />
                  <span>Memories</span>
                </Link>
              </nav>
            )}

            {/* Landing anchor navigation for public visitors */}
            {!session?.user && isLandingPage && (
              <nav aria-label="Landing Page Navigation" className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <a
                  href="#how-it-works"
                  className="px-2.5 py-1 rounded-[100px] hover:text-foreground hover:bg-card/50 transition-colors"
                >
                  How it works
                </a>
                <a
                  href="#features"
                  className="px-2.5 py-1 rounded-[100px] hover:text-foreground hover:bg-card/50 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#faq"
                  className="px-2.5 py-1 rounded-[100px] hover:text-foreground hover:bg-card/50 transition-colors"
                >
                  FAQ
                </a>
              </nav>
            )}
          </div>

          {/* Right: Search, Theme Toggle, Profile / Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Command Palette Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 font-normal text-muted-foreground hover:text-foreground"
              title="Quick Search (⌘K)"
              aria-label="Open Command Palette"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline font-sans">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-[4px] border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </Button>

            {/* Accessible Theme Toggle */}
            <ThemeToggle size="md" />

            {session?.user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-[100px] border border-border bg-card hover:border-foreground/50 transition-all cursor-pointer shadow-none group outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  title="Open user profile menu"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      loading="lazy"
                      decoding="async"
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-[11px] font-semibold text-foreground">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-foreground max-w-[110px] truncate hidden sm:inline">
                    {session.user.name}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${
                      profileMenuOpen ? "rotate-180 text-foreground" : "group-hover:text-foreground"
                    }`}
                  />
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius-base)] border border-border bg-popover p-1.5 shadow-none z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-border mb-1">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User avatar"}
                          loading="lazy"
                          decoding="async"
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border text-sm font-semibold text-foreground">
                          {session.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {session.user.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="space-y-0.5 py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-[var(--radius-base)] px-2.5 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <FolderOpen className="h-4 w-4 text-category-workspaces" />
                        <span>Workspaces Library</span>
                      </Link>

                      <Link
                        to="/memories"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-[var(--radius-base)] px-2.5 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <BrainCircuit className="h-4 w-4 text-category-memories" />
                        <span>Knowledge Memories</span>
                      </Link>
                    </div>

                    <div className="border-t border-border my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        signOutMutation.mutate();
                      }}
                      disabled={signOutMutation.isPending}
                      className="flex w-full items-center gap-2.5 rounded-[var(--radius-base)] px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <LogOut className="h-4 w-4 text-destructive" />
                      <span>{signOutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={signingIn}
                loadingText="Signing in…"
                onClick={handleSignIn}
                className="h-8 px-4"
              >
                Sign in
              </Button>
            )}

            {/* Mobile menu hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-none">
            {session?.user ? (
              <>
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      loading="lazy"
                      decoding="async"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-xs font-semibold text-foreground">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-[var(--radius-base)] px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
                  >
                    <FolderOpen className="h-4 w-4 text-category-workspaces" />
                    <span>Workspaces Library</span>
                  </Link>

                  <Link
                    to="/memories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-[var(--radius-base)] px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
                  >
                    <BrainCircuit className="h-4 w-4 text-category-memories" />
                    <span>Knowledge Memories</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOutMutation.mutate();
                    }}
                    className="flex w-full items-center gap-2 rounded-[var(--radius-base)] px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-destructive" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-[var(--radius-base)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background"
                >
                  How it works
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-[var(--radius-base)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background"
                >
                  Features
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-[var(--radius-base)] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background"
                >
                  FAQ
                </a>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    loading={signingIn}
                    loadingText="Signing in…"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignIn();
                    }}
                    className="w-full h-10 px-4"
                  >
                    <span>Sign in with Google</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      {commandPaletteOpen && (
        <React.Suspense fallback={null}>
          <CommandPalette
            open={commandPaletteOpen}
            onOpenChange={setCommandPaletteOpen}
          />
        </React.Suspense>
      )}
    </>
  );
}

export default Navbar;
