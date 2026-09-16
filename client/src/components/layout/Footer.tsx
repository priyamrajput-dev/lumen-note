import React from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "@/api/auth";
import { LumenLogo } from "@/components/brand/LumenLogo";

export function Footer() {
  const { data: session } = useAuthSession();

  return (
    <footer className="border-t border-border bg-surface/70 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-border">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3.5">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <LumenLogo size="md" variant="full" />
            </Link>

            <p className="text-xs text-foreground-secondary leading-relaxed max-w-sm">
              Your personal AI-powered research workspace. Ingest PDFs, web pages, and video transcripts into grounded understanding.
            </p>

            {/* Operational Status Pill */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary/70 px-3 py-1 text-[11px] font-mono text-muted shadow-2xs">
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
          <div className="flex items-center gap-3 text-foreground-secondary">
            <span>Readability &gt; Decoration</span>
            <span>•</span>
            <span>Grounding &gt; Hallucination</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
