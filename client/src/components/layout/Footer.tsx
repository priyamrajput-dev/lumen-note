import React from "react";
import { Link } from "react-router-dom";
import { useAuthSession } from "@/api/auth";
import { LumenLogo } from "@/components/brand/LumenLogo";

export function Footer() {
  const { data: session } = useAuthSession();

  return (
    <footer className="border-t border-border bg-card transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3.5">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <LumenLogo size="md" variant="full" />
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Your research workspace. Ingest PDFs, web pages, and video transcripts into grounded understanding.
            </p>

            {/* Operational Status Pill */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 rounded-[100px] border border-border bg-background px-3 py-1 text-[11px] font-mono text-muted-foreground shadow-none">
                <span className="flex h-2 w-2 rounded-full bg-category-chat" />
                <span>All Research Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Nav Col 1: Platform */}
          <div className="space-y-2.5 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Workspace
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  to={session?.user ? "/dashboard" : "/login"}
                  className="hover:text-foreground transition-colors"
                >
                  Workspaces Library
                </Link>
              </li>
              <li>
                <Link
                  to={session?.user ? "/memories" : "/login"}
                  className="hover:text-foreground transition-colors"
                >
                  Knowledge Memories
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Research Tools */}
          <div className="space-y-2.5 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Capabilities
            </span>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <span className="cursor-default">Source Grounding</span>
              </li>
              <li>
                <span className="cursor-default">Verifiable Citations</span>
              </li>
              <li>
                <span className="cursor-default">Study Flashcards</span>
              </li>
              <li>
                <span className="cursor-default">Comprehension Quizzes</span>
              </li>
              <li>
                <span className="cursor-default">Concept Mind Maps</span>
              </li>
              <li>
                <span className="cursor-default">Persistent Memories</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground font-mono">
          <p>© {new Date().getFullYear()} LumenNote. Grounded research workspace.</p>
          <div className="flex items-center gap-3">
            <span>Readability &gt; Decoration</span>
            <span>•</span>
            <span>Grounding &gt; Hallucination</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
