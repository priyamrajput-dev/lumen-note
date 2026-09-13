import React, { useState } from "react";
import { signInWithGoogle } from "@/api/auth";
import { Footer } from "@/components/layout/Footer";
import {
  FileText,
  Globe,
  Video,
  FileCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  BookOpen,
  HelpCircle,
  Network,
  Cpu,
  Bot,
  User,
  Quote,
  Zap,
} from "lucide-react";

export function LandingPage() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-accent-subtle selection:text-foreground">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-technical-grid opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-radial from-accent/10 via-accent/3 to-transparent blur-3xl pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6 lg:px-8">
        {/* Top Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-medium text-foreground-secondary shadow-xs">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="tracking-wide uppercase text-[11px] font-mono">
              AI-POWERED RESEARCH WORKSPACE
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mt-7 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-foreground max-w-4xl mx-auto leading-[1.08]">
            Turn your sources into <span className="text-accent">understanding.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-foreground-secondary leading-relaxed">
            Bring your documents, notes, and research into one workspace. Ask questions, discover connections, and build knowledge with AI grounded in your sources.
          </p>

          {/* Primary Call to Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="group relative inline-flex items-center justify-center gap-3 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white hover:bg-accent-hover shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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
              )}
              <span>Continue with Google</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-muted" />
              Isolated Workspace Security
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-success" />
              Verifiable Source Citations
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-accent" />
              GPT-4o & Real-Time RAG
            </span>
          </div>
        </div>

        {/* Interactive Miniature Product Visual */}
        <div className="mt-14 rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-secondary/70">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
              </div>
              <span className="ml-2 text-[11px] font-mono font-medium text-muted">
                workspace / attention-mechanisms-research
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 text-[10px] font-mono text-muted border border-border">
                <Cpu className="h-2.5 w-2.5 text-accent" />
                gpt-4o-mini
              </span>
            </div>
          </div>

          {/* Three-Panel Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border min-h-[360px] text-xs">
            {/* Panel 1: Sources */}
            <div className="md:col-span-3 p-3 bg-surface-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border mb-2.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-muted tracking-wider">
                    Sources (3)
                  </span>
                  <span className="text-[10px] font-semibold text-accent">+ Ingest</span>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg border border-border bg-surface shadow-2xs">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        Attention-Is-All-You-Need.pdf
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-muted">
                      <span>15 pages</span>
                      <span className="text-success">Ready</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg border border-border bg-surface shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        distill.pub/transformers
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-muted">
                      <span>Interactive Article</span>
                      <span className="text-success">Ready</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg border border-border bg-surface shadow-2xs">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="font-semibold text-foreground truncate">
                        Lab-Hypotheses.md
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-muted">
                      <span>Markdown Note</span>
                      <span className="text-success">Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border mt-3 text-[10px] font-mono text-muted">
                3 sources indexed • Pinecone Vector Store
              </div>
            </div>

            {/* Panel 2: AI Research Chat */}
            <div className="md:col-span-6 p-4 flex flex-col justify-between bg-surface">
              <div className="space-y-3.5">
                {/* User Message */}
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-md bg-surface-secondary border border-border flex items-center justify-center text-foreground font-mono text-[10px] mt-0.5">
                    <User className="h-3 w-3 text-muted" />
                  </div>
                  <div className="flex-1 rounded-xl bg-surface-secondary/70 border border-border p-2.5 text-foreground leading-relaxed text-[11px]">
                    How does multi-head self-attention overcome sequential bottlenecks in recurrence?
                  </div>
                </div>

                {/* AI Grounded Response */}
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-mono text-[10px] mt-0.5">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="flex-1 rounded-xl bg-surface border border-border p-3 text-foreground-secondary leading-relaxed text-[11px] shadow-2xs space-y-2">
                    <p>
                      Multi-head attention dispenses entirely with recurrence, computing representations in parallel across sequence positions.
                    </p>
                    <p>
                      By mapping queries, keys, and values into <span className="font-mono text-foreground font-medium">h</span> distinct projection subspaces, the model jointly attends to information from different representation positions <span className="inline-flex items-center px-1 rounded bg-accent/10 text-accent font-mono text-[9px] font-semibold border border-accent/20 cursor-pointer">[1]</span>.
                    </p>

                    {/* Grounded Citation Preview */}
                    <div className="mt-2 pt-2 border-t border-border/60 flex items-center gap-2 text-[10px] font-mono text-muted">
                      <Quote className="h-3 w-3 text-accent" />
                      <span className="truncate">
                        [1] Attention-Is-All-You-Need.pdf — Page 4 (94% match)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Command Input Box Mockup */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-muted">
                  <Search className="h-3.5 w-3.5 text-muted" />
                  <span className="text-[11px] flex-1">Ask anything about your sources...</span>
                  <span className="text-[10px] font-mono rounded bg-surface px-1.5 py-0.5 border border-border text-foreground font-semibold">
                    Ask →
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 3: Notes & Learning Artifacts */}
            <div className="md:col-span-3 p-3 bg-surface-secondary/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border mb-2.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-muted tracking-wider">
                    Notes & Artifacts
                  </span>
                  <span className="text-[10px] font-semibold text-accent">+ Generate</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-border bg-surface shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-accent font-semibold uppercase">
                      <Sparkles className="h-3 w-3" />
                      <span>3D Flashcards</span>
                    </div>
                    <p className="font-semibold text-foreground text-[11px] mt-1 line-clamp-1">
                      Scaled Dot-Product vs Additive
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">8 study cards generated</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-surface shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-success font-semibold uppercase">
                      <HelpCircle className="h-3 w-3" />
                      <span>Interactive Quiz</span>
                    </div>
                    <p className="font-semibold text-foreground text-[11px] mt-1 line-clamp-1">
                      Self-Attention Mechanics
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">5 questions • Explanations</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-surface shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-500 font-semibold uppercase">
                      <Network className="h-3 w-3" />
                      <span>Concept Mind Map</span>
                    </div>
                    <p className="font-semibold text-foreground text-[11px] mt-1 line-clamp-1">
                      Transformer Architecture Graph
                    </p>
                    <p className="text-[10px] text-muted mt-0.5">12 interconnected nodes</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border mt-3 text-[10px] font-mono text-muted">
                Synthesized by Lumen Engine
              </div>
            </div>
          </div>
        </div>

        {/* Section: How It Works */}
        <section className="mt-24 pt-8 border-t border-border">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How Lumen Note Works
            </h2>
            <p className="mt-2 text-sm text-foreground-secondary">
              A frictionless workflow designed for serious research and sustained reading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-3xl font-mono font-bold text-accent">01</span>
              <h3 className="text-base font-bold text-foreground">Bring your sources</h3>
              <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                Upload PDFs, research papers, web links, YouTube video transcripts, and custom markdown notes. Everything is indexed for semantic retrieval.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-3xl font-mono font-bold text-accent">02</span>
              <h3 className="text-base font-bold text-foreground">Ask and explore</h3>
              <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                Interrogate your knowledge with streaming AI chat. Every response is verified with exact document excerpts, page citations, and similarity scores.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-3xl font-mono font-bold text-accent">03</span>
              <h3 className="text-base font-bold text-foreground">Build knowledge</h3>
              <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                Turn discoveries into lasting understanding with auto-generated 3D study flashcards, interactive quizzes, conceptual mindmaps, and research notes.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Features Grid */}
        <section className="mt-24 pt-8 border-t border-border">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built for Deep Knowledge Work
            </h2>
            <p className="mt-2 text-sm text-foreground-secondary">
              Engineered with modern AI primitives to ensure precision, grounding, and memory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-xl border border-border bg-surface space-y-2.5 transition-colors hover:border-accent/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Quote className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Source-Grounded AI</h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Answers are grounded directly in your uploaded material, preventing hallucinations and giving you traceable evidence.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-xl border border-border bg-surface space-y-2.5 transition-colors hover:border-accent/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Verifiable Citations</h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Click any citation tag to jump directly to the relevant document passage, review exact page numbers, and inspect excerpts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-xl border border-border bg-surface space-y-2.5 transition-colors hover:border-accent/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Layers className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Multi-Modal Ingestion</h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Ingest PDF papers up to 10MB, scrape documentation websites, pull YouTube lecture transcripts, or draft live markdown notes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-xl border border-border bg-surface space-y-2.5 transition-colors hover:border-accent/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">3D Study Flashcards</h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Active recall study flashcards automatically generated from your sources with smooth 3D flipping and keyboard navigation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 rounded-xl border border-border bg-surface space-y-2.5 transition-colors hover:border-accent/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Interactive Assessments</h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Self-test your comprehension with multiple-choice quizzes complete with immediate scoring and pedagogical feedback.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 rounded-xl border border-border bg-surface space-y-2.5 transition-colors hover:border-accent/40">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Network className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Persistent Memory</h4>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Powered by Mem0. Lumen Note remembers your research habits, focus areas, and guidelines across sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-24 p-8 sm:p-12 rounded-2xl border border-border bg-surface text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Ready to research with clarity?
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary max-w-md mx-auto leading-relaxed">
            Create your research workspace in seconds. Connect your sources and unlock grounded understanding.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover text-white px-6 py-3 text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <span>Get Started with Google</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
