import React from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "@/api/auth";
import { Sparkles, ArrowUpRight } from "lucide-react";

export function Footer() {
  const { data: session } = useAuthSession();

  return (
    <footer className="border-t border-border bg-surface/80 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-border">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 font-bold text-foreground hover:opacity-90 transition-opacity"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-secondary border border-border text-accent shadow-2xs">
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
              <span className="text-base tracking-tight text-foreground font-extrabold">
                Lumen Note
              </span>
            </Link>

            <p className="text-xs text-foreground-secondary leading-relaxed max-w-sm">
              Your personal AI-powered research workspace. Bring documents, notes, and sources together into grounded understanding.
            </p>

            {/* Operational Status Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary/70 px-3 py-1 text-[11px] font-mono text-muted">
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                <span>All Research Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Nav Col 1: Platform */}
          <div className="space-y-2.5 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-muted tracking-wider block">
              Workspace
            </span>
            <ul className="space-y-2 text-foreground-secondary">
              <li>
                <Link
                  to={session?.user ? "/dashboard" : "/login"}
                  className="hover:text-accent transition-colors"
                >
                  Workspaces Library
                </Link>
              </li>
              <li>
                <Link
                  to={session?.user ? "/memories" : "/login"}
                  className="hover:text-accent transition-colors"
                >
                  Knowledge Memories
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  Research Overview
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Research Tools */}
          <div className="space-y-2.5 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-muted tracking-wider block">
              Capabilities
            </span>
            <ul className="space-y-2 text-foreground-secondary">
              <li>
                <span className="text-muted">Source Grounding</span>
              </li>
              <li>
                <span className="text-muted">Verifiable Citations</span>
              </li>
              <li>
                <span className="text-muted">3D Active Recall Decks</span>
              </li>
              <li>
                <span className="text-muted">Interactive Quizzes</span>
              </li>
              <li>
                <span className="text-muted">Concept Mind Maps</span>
              </li>
            </ul>
          </div>

          {/* Nav Col 3: Architecture & Security */}
          <div className="space-y-2.5 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-muted tracking-wider block">
              Architecture
            </span>
            <ul className="space-y-2 text-foreground-secondary font-mono text-[11px]">
              <li className="flex items-center gap-1 text-muted">
                <span>Pinecone Vector RAG</span>
              </li>
              <li className="flex items-center gap-1 text-muted">
                <span>Mem0 Memory Engine</span>
              </li>
              <li className="flex items-center gap-1 text-muted">
                <span>Tavily Real-Time Web</span>
              </li>
              <li className="flex items-center gap-1 text-muted">
                <span>Better Auth Security</span>
              </li>
              <li className="flex items-center gap-1 text-muted">
                <span>Inngest Step Workflows</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted font-mono">
          <p>© {new Date().getFullYear()} Lumen Note. Built for deep knowledge work.</p>
          <div className="flex items-center gap-4 text-foreground-secondary">
            <span>Readability &gt; Decoration</span>
            <span>•</span>
            <span>Information Hierarchy &gt; Chrome</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
