import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signInWithGoogle } from "@/api/auth";
import { Eyebrow } from "@/components/brand/Eyebrow";
import { LumenLogo } from "@/components/brand/LumenLogo";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      import("@/pages/DashboardPage");
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Sign in failed:", err);
      setError(err?.message || "Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)] flex items-center justify-center bg-background px-4 py-16">
      {/* Centered Minimal Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="mb-4">
          <Eyebrow category="chat">Authentication</Eyebrow>
        </div>

        {/* Brand Logo */}
        <div className="mb-6">
          <LumenLogo size="lg" variant="icon" />
        </div>

        {/* Heading */}
        <h1 className="text-34px sm:text-44px font-semibold text-foreground tracking-[-0.02em] leading-tight">
          Enter Your Workspace
        </h1>

        <p className="mt-3 text-body-sm sm:text-body text-muted-foreground max-w-sm leading-relaxed">
          Ground your research papers, notes, and sources in intelligent synthesis.
        </p>

        {/* Card Panel */}
        <div className="mt-8 w-full rounded-[var(--radius-base)] border border-border bg-card p-8 shadow-none space-y-6">
          {/* Main Action: Gradient-Stroked Pill Button */}
          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={loading}
            loadingText="Redirecting…"
            onClick={handleSignIn}
            onMouseEnter={() => import("@/pages/DashboardPage")}
            onFocus={() => import("@/pages/DashboardPage")}
            className="w-full flex items-center justify-center gap-3 h-12"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </Button>

          {error && (
            <p className="text-xs text-destructive text-center font-medium" role="alert">
              {error}
            </p>
          )}

          {/* Hairline Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-3 font-mono text-[10px] uppercase text-muted-foreground">
              Protected &amp; Private
            </span>
          </div>

          {/* Privacy Note */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            By continuing, you agree to access isolated workspaces with strict RAG source attribution.
          </p>
        </div>

        {/* Ghost Pill: Return Home */}
        <div className="mt-6">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground hover:text-foreground")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
