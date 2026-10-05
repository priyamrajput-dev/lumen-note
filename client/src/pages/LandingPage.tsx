import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { signInWithGoogle } from "@/api/auth";
import { Footer } from "@/components/layout/Footer";
import { Eyebrow } from "@/components/brand/Eyebrow";
import {
  FileText,
  Globe,
  FileCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  HelpCircle,
  Network,
  Cpu,
  Video,
  ChevronDown,
  ArrowUp,
  Loader2,
  Zap,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
} from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Procedural Soft 3D Blob in category colors with luminous multi-stop gradients.
 * Uses CSS variables so it flips automatically between light and dark themes.
 */
function Soft3DBlob({
  category,
}: {
  category: "sources" | "chat" | "artifacts" | "memories" | "workspaces";
}) {
  const configs = {
    sources: {
      id: "blob-sources",
      c1: "var(--category-sources)",
      c2: "#004860",
      c3: "#5eead4",
      highlight: "#e0f9fe",
      glow: "rgba(0, 186, 226, 0.2)",
    },
    chat: {
      id: "blob-chat",
      c1: "var(--category-chat)",
      c2: "#044415",
      c3: "#86efac",
      highlight: "#f0fdf4",
      glow: "rgba(10, 228, 72, 0.2)",
    },
    artifacts: {
      id: "blob-artifacts",
      c1: "var(--category-artifacts)",
      c2: "#6a2e00",
      c3: "#fde047",
      highlight: "#fffbeb",
      glow: "rgba(255, 135, 9, 0.2)",
    },
    memories: {
      id: "blob-memories",
      c1: "var(--category-memories)",
      c2: "#5b0c53",
      c3: "#f472b6",
      highlight: "#fdf2f8",
      glow: "rgba(254, 197, 251, 0.2)",
    },
    workspaces: {
      id: "blob-workspaces",
      c1: "var(--category-workspaces)",
      c2: "#2d266e",
      c3: "#a78bfa",
      highlight: "#f5f3ff",
      glow: "rgba(157, 149, 255, 0.2)",
    },
  };

  const c = configs[category];

  return (
    <div className="relative w-full aspect-square max-w-[360px] sm:max-w-[400px] mx-auto flex items-center justify-center p-6 select-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id={`${c.id}-sphere`}
            cx="35%"
            cy="32%"
            r="65%"
            fx="30%"
            fy="25%"
          >
            <stop offset="0%" stopColor={c.highlight} stopOpacity="0.9" />
            <stop offset="25%" stopColor={c.c1} />
            <stop offset="70%" stopColor={c.c2} />
            <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
          </radialGradient>

          <filter id={`${c.id}-ambient`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="24" result="blur" />
          </filter>

          <filter id={`${c.id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* Ambient colored shadow aura */}
        <ellipse
          cx="200"
          cy="210"
          rx="140"
          ry="130"
          fill={c.glow}
          filter={`url(#${c.id}-ambient)`}
        />

        {/* Organic 3D Form */}
        <path
          d="M 200,60 
             C 275,55 340,115 345,190 
             C 350,265 295,335 220,340 
             C 145,345 65,295 60,220 
             C 55,145 125,65 200,60 Z"
          fill={`url(#${c.id}-sphere)`}
        />

        {/* Specular Glint Highlight */}
        <ellipse
          cx="155"
          cy="135"
          rx="50"
          ry="34"
          transform="rotate(-25 155 135)"
          fill="var(--foreground)"
          opacity="0.3"
          filter={`url(#${c.id}-blur)`}
        />
      </svg>
    </div>
  );
}

/**
 * Word-by-word scroll-linked highlight for the manifesto statement.
 */
function ManifestoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.4"],
  });

  const statement =
    "Most AI tools summarize the entire public web. LumenNote synthesizes your own research. Every claim links to verifiable passages from documents you uploaded, so you can explore deeper hypotheses without losing the thread of truth.";

  const words = statement.split(" ");

  return (
    <section ref={containerRef} className="py-24 sm:py-32 px-4 sm:px-6 border-t border-border">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <Eyebrow category="chat">Grounded research</Eyebrow>
        </div>
        <p className="text-23px sm:text-34px font-semibold text-foreground tracking-[-0.02em] leading-relaxed select-none">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return <ManifestoWord key={i} word={word} progress={scrollYProgress} range={[start, end]} />;
          })}
        </p>
      </div>
    </section>
  );
}

function ManifestoWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: any;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-2.5 transition-opacity">
      {word}
    </motion.span>
  );
}

/**
 * Word-by-word reveal heading with clip-path mask
 */
function WordRevealHeading({
  children,
  className,
  as: Component = "h2",
  align = "center",
}: {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  align?: "center" | "left";
}) {
  const words = children.split(" ");
  return (
    <Component
      className={cn(
        "flex flex-wrap gap-x-2 gap-y-1 w-full",
        align === "center" ? "justify-center text-center mx-auto" : "justify-start text-left",
        className
      )}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ clipPath: "inset(100% 0% 0% 0%)", y: "30%", opacity: 0 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)", y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.45,
              delay: i * 0.03,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}

/**
 * Real numbers count-up animation
 */
function CountUpNumber({
  target,
  prefix = "",
  suffix = "",
}: {
  target: number;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frameId: number;
    let startTime: number | null = null;
    const duration = 1000;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const tick = (now: number) => {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(ease * target));
            if (progress < 1) {
              frameId = requestAnimationFrame(tick);
            }
          };
          frameId = requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

/**
 * Floating scroll progress indicator with section dots in side margin on desktop
 */
function ScrollProgressDots() {
  const sections = [
    { id: "hero", label: "Overview" },
    { id: "how-it-works", label: "Steps" },
    { id: "preview", label: "Workspace" },
    { id: "showcase", label: "Artifacts" },
    { id: "audience", label: "Audience" },
    { id: "faq", label: "FAQ" },
  ];
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 bg-card/85 backdrop-blur-sm border border-border/80 p-2.5 rounded-full pointer-events-auto shadow-none">
      {sections.map((sec) => (
        <a
          key={sec.id}
          href={`#${sec.id}`}
          title={sec.label}
          aria-label={sec.label}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-ring",
            activeSection === sec.id
              ? "bg-foreground scale-125"
              : "bg-muted-foreground/40 hover:bg-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Horizontal scroll-linked showcase for Artifact types
 */
function ArtifactsHorizontalShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end start"],
  });

  // Start translating right-to-left smoothly as soon as the cards enter view at this position
  const x = useTransform(scrollYProgress, [0, 0.85], ["0%", "-28%"]);

  const artifactsList = [
    {
      type: "Mind Map",
      icon: Network,
      tag: "Spatial synthesis",
      title: "Interactive Concept Graph",
      desc: "Force-directed clustering that maps semantic relationships between your uploaded papers and lecture transcripts.",
    },
    {
      type: "Flashcards",
      icon: Layers,
      tag: "Spaced repetition",
      title: "3D Flip Knowledge Deck",
      desc: "Active recall cards with front questions and back answers tied directly to exact paragraph page numbers.",
    },
    {
      type: "Quiz",
      icon: Sparkles,
      tag: "Comprehension test",
      title: "Self-Testing Assessment",
      desc: "Multiple-choice questions with instantaneous rationales detailing why answers are correct or incorrect.",
    },
    {
      type: "Executive Summary",
      icon: FileText,
      tag: "Grounded briefing",
      title: "Verifiable Research Brief",
      desc: "Structured bulleted synthesis organized by themes with interactive source citations for every single assertion.",
    },
  ];

  return (
    <section id="showcase" className="border-t border-border py-20 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Eyebrow category="artifacts">Artifact studio</Eyebrow>
          <WordRevealHeading className="text-subheading font-semibold text-foreground tracking-[-0.02em] justify-center">
            Four powerful synthesis artifact formats
          </WordRevealHeading>
          <p className="text-body text-muted-foreground max-w-xl mx-auto">
            Transform static reading into active, retained mastery with automated study tools.
          </p>
        </div>

        {/* Desktop horizontal scroll-linked showcase */}
        <div ref={containerRef} className="hidden md:block relative min-h-[340px] overflow-hidden">
          <motion.div style={{ x }} className="flex gap-6 w-max cursor-grab active:cursor-grabbing cards-grid py-4">
            {artifactsList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="w-[340px] shrink-0 rounded-[var(--radius-base)] border border-border bg-card p-6 space-y-4 gradient-border-hover group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {item.tag}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-foreground card-icon-tile">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    <span className="card-title-underline">{item.title}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile vertical stack fallback */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {artifactsList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-[var(--radius-base)] border border-border bg-card p-5 space-y-3 gradient-border-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground">
                    {item.tag}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Interactive FAQ Accordion Item with smooth height animation
 */
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-[var(--radius-base)] bg-card overflow-hidden transition-colors gradient-border-hover">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-foreground hover:opacity-90 transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-foreground" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const ctaCardRef = useRef<HTMLDivElement>(null);

  // Top scroll progress bar - tween only, no spring
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = scrollYProgress;

  // Parallax offsets (limits ±40px, transform only)
  const heroBlobY = useTransform(scrollY, [0, 600], [0, -35]);
  const previewMockY = useTransform(scrollY, [200, 1000], [35, -25]);
  const bgGridY = useTransform(scrollY, [0, 1000], [0, -25]);

  // Scroll velocity marquee speedup
  const [isScrollingFast, setIsScrollingFast] = useState(false);
  useEffect(() => {
    let timeoutId: any;
    return scrollY.on("change", () => {
      setIsScrollingFast(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrollingFast(false), 250);
    });
  }, [scrollY]);

  // Three steps section scroll tracking
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsProgress } = useScroll({
    target: stepsContainerRef,
    offset: ["start 0.85", "end 0.35"],
  });
  const stepsLineScaleX = useTransform(stepsProgress, [0, 0.85], [0, 1]);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    return stepsProgress.on("change", (latest) => {
      if (latest < 0.33) setActiveStep(1);
      else if (latest < 0.66) setActiveStep(2);
      else setActiveStep(3);
    });
  }, [stepsProgress]);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthError(err?.message || "Sign-in could not be completed. Please try again.");
      setLoading(false);
    }
  };

  // IntersectionObserver to pause bottom CTA continuous border animation when off-screen
  useEffect(() => {
    if (!ctaCardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCtaVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(ctaCardRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const checkScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const faqData = [
    {
      question: "What types of source materials can I add to a workspace?",
      answer:
        "You can upload PDF research papers and books with page-level tracking, scrape live web documentation and articles via Firecrawl, extract timestamped transcripts directly from YouTube video URLs, and paste raw markdown or text notes.",
    },
    {
      question: "Do AI answers include citations I can verify?",
      answer:
        "Yes. Every answer cites exact source documents, chunk snippets, page numbers, and vector similarity ranks. Clicking any inline citation chip highlights the exact passage used from your source material.",
    },
    {
      question: "How is my research data handled and secured?",
      answer:
        "All documents, semantic chunks, Pinecone vector embeddings, and conversation histories are strictly isolated and scoped to your authenticated account and individual workspace containers.",
    },
    {
      question: "What are learning artifacts?",
      answer:
        "Artifacts are structured study tools generated directly from your sources on demand: interactive 3D flip flashcards with keyboard navigation, self-grading multiple-choice quizzes with rationales, and dynamic conceptual mind maps.",
    },
    {
      question: "How do I sign in?",
      answer:
        "LumenNote uses secure authentication powered by Better Auth supporting Google OAuth. You can sign in with one click without creating separate passwords.",
    },
    {
      question: "What happens after I upload a source?",
      answer:
        "An asynchronous Inngest pipeline extracts the text, splits the document into semantic chunks with token counts, generates embeddings, and indexes them in Pinecone so your workspace is instantly ready for grounded questions.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors selection:bg-accent selection:text-foreground">
      {/* 2px Scroll Progress Bar */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-brand origin-left z-50 pointer-events-none"
      />

      {/* Back to top floating button with circular scroll progress ring */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 relative flex items-center justify-center h-11 w-11 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40 shadow-none cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
            title="Back to top"
            aria-label="Scroll to top"
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="1.5" />
              <motion.circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="var(--category-chat)"
                strokeWidth="2"
                style={{
                  pathLength: scrollYProgress,
                }}
              />
            </svg>
            <ArrowUp className="h-4 w-4 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Background Architectural Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-line-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line-color) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <main className="relative z-10 w-full pt-12 sm:pt-16 pb-24">
        {/* SECTION 1: Full-Viewport Hero Section (First Fold) */}
        <section className="min-h-[calc(100dvh-3.5rem)] flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
          {/* Top Announcement Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <Eyebrow category="chat">Research workspace</Eyebrow>
          </motion.div>

          {/* Centered Display Headline */}
          <div className="text-center max-w-5xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="text-display font-semibold text-foreground tracking-[-0.02em] text-center"
            >
              Turn your sources into
              <br className="hidden sm:inline" />{" "}
              <span className="text-gradient-understanding">understanding.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-6 sm:mt-8 max-w-2xl text-body sm:text-body-lg text-muted-foreground leading-[1.4]"
            >
              Add PDFs, YouTube videos, and web pages to a workspace, then ask questions and get answers with citations you can check.
            </motion.p>

            {/* CTAs: Primary + Secondary Ghost */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={loading}
                loadingText="Redirecting…"
                onClick={handleSignIn}
                className="inline-flex items-center justify-center gap-3 h-12 px-8"
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
                <span>Get started</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <a
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                <span>See how it works</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </a>
            </motion.div>

            {/* Trust Hairline Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground font-mono"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-muted-foreground" />
                Isolated Workspace Security
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-category-chat" />
                Verifiable Citations
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-category-link" />
                Vector RAG Retrieval
              </span>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: Sources Strip (Works with your material) */}
        <section className="border-t border-border py-14 overflow-hidden bg-card/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6 text-center">
            <Eyebrow category="sources">Works with your material</Eyebrow>
          </div>

          {/* Continuous scrolling marquee with scroll-velocity speedup */}
          <div className="relative w-full flex overflow-x-hidden">
            <div
              className={cn(
                "flex shrink-0 items-center gap-4 py-2 hover:[animation-play-state:paused]",
                isScrollingFast ? "animate-marquee-fast" : "animate-marquee"
              )}
            >
              {[
                { icon: FileText, label: "PDF Research Papers", cat: "sources" },
                { icon: Video, label: "YouTube Transcripts", cat: "artifacts" },
                { icon: Globe, label: "Live Web Pages & Docs", cat: "sources" },
                { icon: FileCode, label: "Markdown & Text Notes", cat: "chat" },
                { icon: Search, label: "Tavily Real-Time Web", cat: "workspaces" },
                { icon: Cpu, label: "Pinecone Vector Chunks", cat: "chat" },
                { icon: FileText, label: "PDF Research Papers", cat: "sources" },
                { icon: Video, label: "YouTube Transcripts", cat: "artifacts" },
                { icon: Globe, label: "Live Web Pages & Docs", cat: "sources" },
                { icon: FileCode, label: "Markdown & Text Notes", cat: "chat" },
                { icon: Search, label: "Tavily Real-Time Web", cat: "workspaces" },
                { icon: Cpu, label: "Pinecone Vector Chunks", cat: "chat" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[100px] border border-border bg-card text-xs font-medium text-foreground whitespace-nowrap shadow-none"
                  >
                    <Icon className="h-3.5 w-3.5 text-category-sources" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: How It Works */}
        <section id="how-it-works" ref={stepsContainerRef} className="border-t border-border py-24 px-4 sm:px-6 scroll-mt-14">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <Eyebrow category="chat">How it works</Eyebrow>
              <WordRevealHeading className="text-subheading font-semibold text-foreground tracking-[-0.02em] justify-center">
                Three steps from raw sources to grounded clarity
              </WordRevealHeading>
              <p className="text-body sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                No complex configuration. Add your files, query with natural language, and generate study artifacts.
              </p>
            </div>

            <div className="relative">
              {/* Connector line between steps on desktop: hairline bg + progressive draw */}
              <div className="hidden md:block absolute top-10 left-20 right-20 h-[1px] bg-border z-0 pointer-events-none" />
              <motion.div
                style={{ scaleX: stepsLineScaleX, transformOrigin: "left center" }}
                className="hidden md:block absolute top-10 left-20 right-20 h-[1px] bg-category-chat z-0 pointer-events-none"
              />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 cards-grid">
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  animate={{ scale: activeStep === 1 ? 1.02 : 1 }}
                  className="rounded-[var(--radius-base)] border border-border bg-card p-6 sm:p-8 space-y-4 gradient-border-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold tracking-wider uppercase transition-colors",
                        activeStep === 1 ? "text-category-sources font-extrabold" : "text-category-sources/60"
                      )}
                    >
                      Step 01
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-category-sources card-icon-tile">
                      <FileText className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
                    <span className="card-title-underline">Add sources</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Upload PDF articles or paste web documentation and YouTube links. Content is extracted and indexed into semantic vector chunks in the background.
                  </p>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                  animate={{ scale: activeStep === 2 ? 1.02 : 1 }}
                  className="rounded-[var(--radius-base)] border border-border bg-card p-6 sm:p-8 space-y-4 gradient-border-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold tracking-wider uppercase transition-colors",
                        activeStep === 2 ? "text-category-chat font-extrabold" : "text-category-chat/60"
                      )}
                    >
                      Step 02
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-category-chat card-icon-tile">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
                    <span className="card-title-underline">Ask questions</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Chat with your research in natural language. Every answer is substantiated with inline citations pointing to original passages and page numbers.
                  </p>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  animate={{ scale: activeStep === 3 ? 1.02 : 1 }}
                  className="rounded-[var(--radius-base)] border border-border bg-card p-6 sm:p-8 space-y-4 gradient-border-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold tracking-wider uppercase transition-colors",
                        activeStep === 3 ? "text-category-artifacts font-extrabold" : "text-category-artifacts/60"
                      )}
                    >
                      Step 03
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-category-artifacts card-icon-tile">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
                    <span className="card-title-underline">Turn into study material</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Synthesize key concepts into active study tools: 3D flip flashcards, comprehension quizzes with instant rationales, and visual concept mind maps.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Product Preview Mockup */}
        <section id="preview" className="py-16 page-container px-4 sm:px-6 scroll-mt-14">
          <div className="text-center space-y-3 mb-10">
            <Eyebrow category="workspaces">Interactive workspace</Eyebrow>
            <WordRevealHeading className="text-subheading font-semibold text-foreground tracking-[-0.02em] justify-center">
              Interactive research workspace designed for retention
            </WordRevealHeading>
            <p className="text-body text-muted-foreground max-w-xl mx-auto">
              A tripartite studio: documents on the left, natural language query in the center, generated recall artifacts on the right.
            </p>
          </div>

          <motion.div
            style={{ y: previewMockY }}
            initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.03, opacity: 0 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[var(--radius-base)] border border-border bg-card overflow-hidden shadow-none gradient-border-hover"
          >
            {/* Mock Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex gap-1.5 shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full border border-border bg-muted-foreground/30" />
                  <span className="h-2.5 w-2.5 rounded-full border border-border bg-muted-foreground/30" />
                  <span className="h-2.5 w-2.5 rounded-full border border-border bg-muted-foreground/30" />
                </div>
                <span className="ml-2 text-[11px] font-mono text-muted-foreground truncate">
                  workspace / attention-mechanisms-research
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 rounded-[var(--radius-base)] bg-background px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                  <Cpu className="h-2.5 w-2.5 text-category-chat" />
                  gpt-4o-mini
                </span>
              </div>
            </div>

            {/* Three-Panel Mockup Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border min-h-[380px] text-xs">
              {/* Panel 1: Sources */}
              <div className="md:col-span-3 p-4 bg-background flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Sources (3)
                    </span>
                    <span className="text-[10px] font-semibold text-category-sources">+ Add</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-[var(--radius-base)] border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-category-sources shrink-0" />
                        <span className="font-semibold text-foreground truncate">
                          Attention-Is-All-You-Need.pdf
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-muted-foreground">
                        <span>15 pages</span>
                        <span className="text-category-chat font-medium">Ready</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-[var(--radius-base)] border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-category-sources shrink-0" />
                        <span className="font-semibold text-foreground truncate">
                          distill.pub/transformers
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-muted-foreground">
                        <span>Article</span>
                        <span className="text-category-chat font-medium">Ready</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-[var(--radius-base)] border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <Video className="h-3.5 w-3.5 text-category-artifacts shrink-0" />
                        <span className="font-semibold text-foreground truncate">
                          Stanford-CS224N-Lecture5.yt
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-muted-foreground">
                        <span>Transcript</span>
                        <span className="text-category-chat font-medium">Ready</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>3 sources indexed</span>
                  <span className="flex items-center gap-1 text-category-chat">
                    <span className="h-1.5 w-1.5 rounded-full bg-category-chat" />
                    Vector RAG
                  </span>
                </div>
              </div>

              {/* Panel 2: Chat Studio */}
              <div className="md:col-span-6 p-4 bg-card flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* User Query */}
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background border border-border text-[10px] font-semibold text-foreground">
                      U
                    </div>
                    <div className="rounded-[var(--radius-base)] bg-background px-3 py-2 border border-border text-foreground text-xs leading-relaxed max-w-[85%]">
                      How does multi-head self-attention overcome sequential bottlenecks in recurrence?
                    </div>
                  </div>

                  {/* Assistant Answer with Citations */}
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-category-chat/10 border border-category-chat/30 text-category-chat text-[10px] font-bold">
                      L
                    </div>
                    <div className="rounded-[var(--radius-base)] bg-background px-3.5 py-3 border border-border text-foreground text-xs leading-relaxed space-y-2 max-w-[95%]">
                      <p>
                        Multi-head attention dispenses entirely with recurrence, computing pairwise token representations in parallel across all sequence positions.
                      </p>
                      <p>
                        By projecting queries, keys, and values into <span className="font-mono text-category-artifacts font-medium">h</span> distinct projection subspaces, the model attends jointly to information from different representation subspaces{" "}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] border border-category-chat/40 bg-category-chat/10 font-mono text-[10px] text-category-chat font-semibold cursor-pointer">
                          [1]
                        </span>
                        .
                      </p>

                      {/* Citation Preview Bubble */}
                      <div className="mt-2 p-2.5 rounded-[var(--radius-base)] border border-border bg-card text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span className="font-semibold text-foreground">Attention-Is-All-You-Need.pdf</span>
                          <span>Page 4</span>
                        </div>
                        <p className="text-muted-foreground italic text-[10px] line-clamp-2">
                          "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-[100px] border border-border bg-background">
                    <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                      <Search className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate text-xs">Ask anything about your sources...</span>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-[100px] bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition-opacity shrink-0"
                    >
                      Send →
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel 3: Artifacts */}
              <div className="md:col-span-3 p-4 bg-background flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                    <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Artifacts
                    </span>
                    <span className="text-[10px] font-semibold text-category-artifacts">+ Generate</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-[var(--radius-base)] border border-border bg-card">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-category-artifacts font-semibold uppercase">
                        <Sparkles className="h-3 w-3" />
                        <span>Flashcard Deck</span>
                      </div>
                      <p className="font-semibold text-foreground text-[11px] mt-1 line-clamp-1">
                        Scaled Dot-Product Mechanics
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">8 study cards</p>
                    </div>

                    <div className="p-3 rounded-[var(--radius-base)] border border-border bg-card">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-category-chat font-semibold uppercase">
                        <HelpCircle className="h-3 w-3" />
                        <span>Comprehension Quiz</span>
                      </div>
                      <p className="font-semibold text-foreground text-[11px] mt-1 line-clamp-1">
                        Self-Attention Math
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">5 questions</p>
                    </div>

                    <div className="p-3 rounded-[var(--radius-base)] border border-border bg-card">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-category-workspaces font-semibold uppercase">
                        <Network className="h-3 w-3" />
                        <span>Concept Mind Map</span>
                      </div>
                      <p className="font-semibold text-foreground text-[11px] mt-1 line-clamp-1">
                        Transformer Graph
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">12 nodes</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border mt-3 text-[10px] font-mono text-muted-foreground">
                  Synthesized by LumenNote
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Horizontal scroll-linked showcase of artifact types */}
        <ArtifactsHorizontalShowcase />

        {/* SECTION 5: Category Feature Blocks with Soft 3D Blobs */}
        <div id="features" className="mt-20 space-y-0 scroll-mt-14">
          {/* Feature 1: Multi-Modal Sources */}
          <motion.section
            className="border-t border-border py-20 px-4 sm:px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 sm:gap-16">
              <div className="order-2 md:order-1 flex justify-center">
                <motion.div
                  animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
                  transition={{ duration: 9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                >
                  <Soft3DBlob category="sources" />
                </motion.div>
              </div>

              <div className="order-1 md:order-2 space-y-4">
                <Eyebrow category="sources">Multi-modal sources</Eyebrow>
                <WordRevealHeading
                  as="h2"
                  align="left"
                  className="text-subheading font-semibold text-foreground tracking-[-0.02em] leading-tight"
                >
                  Ingest research papers, transcripts, and web documentation
                </WordRevealHeading>
                <p className="text-body-lg text-muted-foreground leading-[1.38]">
                  Upload PDF articles, technical documentation URLs, and YouTube transcripts. Content is partitioned and vectorized into semantic chunks with paragraph-level precision.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleSignIn}
                    className="gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <span>Connect source materials</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Feature 2: Grounded Citations */}
          <motion.section
            className="border-t border-border py-20 px-4 sm:px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 sm:gap-16">
              <div className="order-1 space-y-4">
                <Eyebrow category="chat">Grounded citations</Eyebrow>
                <WordRevealHeading
                  as="h2"
                  align="left"
                  className="text-subheading font-semibold text-foreground tracking-[-0.02em] leading-tight"
                >
                  Answers substantiated with verifiable evidence
                </WordRevealHeading>
                <p className="text-body-lg text-muted-foreground leading-[1.38]">
                  Every insight links directly to original page numbers, document snippets, and similarity ranks. Click any inline citation to view exact source passages.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleSignIn}
                    className="gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <span>Explore citation grounding</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="order-2 flex justify-center">
                <motion.div
                  animate={{ y: [6, -6, 6], x: [3, -3, 3] }}
                  transition={{ duration: 11, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                >
                  <Soft3DBlob category="chat" />
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Feature 3: Synthesis Artifacts */}
          <motion.section
            className="border-t border-border py-20 px-4 sm:px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 sm:gap-16">
              <div className="order-2 md:order-1 flex justify-center">
                <motion.div
                  animate={{ y: [-5, 7, -5], x: [-4, 2, -4] }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                >
                  <Soft3DBlob category="artifacts" />
                </motion.div>
              </div>

              <div className="order-1 md:order-2 space-y-4">
                <Eyebrow category="artifacts">Synthesis artifacts</Eyebrow>
                <WordRevealHeading
                  as="h2"
                  align="left"
                  className="text-subheading font-semibold text-foreground tracking-[-0.02em] leading-tight"
                >
                  Turn discoveries into active recall decks and mind maps
                </WordRevealHeading>
                <p className="text-body-lg text-muted-foreground leading-[1.38]">
                  Cement understanding with structured study materials automatically generated from your sources. Test comprehension with interactive quizzes and conceptual graphs.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleSignIn}
                    className="gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <span>Review learning artifacts</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Feature 4: Persistent Memory */}
          <motion.section
            className="border-t border-border py-20 px-4 sm:px-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 sm:gap-16">
              <div className="order-1 space-y-4">
                <Eyebrow category="memories">Persistent memory</Eyebrow>
                <WordRevealHeading
                  as="h2"
                  align="left"
                  className="text-subheading font-semibold text-foreground tracking-[-0.02em] leading-tight"
                >
                  A research notebook that remembers context across sessions
                </WordRevealHeading>
                <p className="text-body-lg text-muted-foreground leading-[1.38]">
                  Powered by Mem0. LumenNote preserves your ongoing hypotheses, research goals, and feedback instructions across workspace sessions.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleSignIn}
                    className="gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <span>Examine memory engine</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="order-2 flex justify-center">
                <motion.div
                  animate={{ y: [4, -8, 4], x: [-2, 5, -2] }}
                  transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                >
                  <Soft3DBlob category="memories" />
                </motion.div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* SECTION 6: Manifesto Line */}
        <ManifestoSection />

        {/* SECTION 7: Who It's For */}
        <section className="border-t border-border py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <Eyebrow category="workspaces">Built for depth</Eyebrow>
              <WordRevealHeading
                as="h2"
                className="text-subheading font-semibold text-foreground tracking-[-0.02em]"
              >
                Engineered for serious knowledge work
              </WordRevealHeading>
              <p className="text-body text-muted-foreground max-w-xl mx-auto">
                No superficial chat. Built for people who need verifiable answers and structured retention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cards-grid">
              {/* Audience 1: Students */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[var(--radius-base)] border border-border bg-card p-6 sm:p-8 space-y-4 gradient-border-hover cursor-default"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-category-sources card-icon-tile">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
                  <span className="card-title-underline">Students</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Turn dense lecture transcripts, textbook chapters, and syllabus PDFs into active recall flashcards, multiple-choice quizzes, and conceptual summaries.
                </p>
              </motion.div>

              {/* Audience 2: Researchers */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[var(--radius-base)] border border-border bg-card p-6 sm:p-8 space-y-4 gradient-border-hover cursor-default"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-category-chat card-icon-tile">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
                  <span className="card-title-underline">Researchers</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Interrogate academic literature, cross-reference preprint PDFs, and verify evidence with exact paragraph citations and similarity scores.
                </p>
              </motion.div>

              {/* Audience 3: Professionals & Creators */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[var(--radius-base)] border border-border bg-card p-6 sm:p-8 space-y-4 gradient-border-hover cursor-default"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-category-artifacts card-icon-tile">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-[-0.01em]">
                  <span className="card-title-underline">Creators &amp; Professionals</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Synthesize technical documentation, web articles, and video transcripts into clear research briefs and structured mind maps.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 8: FAQ Accordion */}
        <section id="faq" className="border-t border-border py-24 px-4 sm:px-6 scroll-mt-14">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <Eyebrow category="artifacts">Frequently asked questions</Eyebrow>
              <WordRevealHeading
                as="h2"
                className="text-subheading font-semibold text-foreground tracking-[-0.02em]"
              >
                Everything you need to know
              </WordRevealHeading>
            </div>

            <div className="space-y-3">
              {faqData.map((item, index) => (
                <FAQItem
                  key={index}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFAQ === index}
                  onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: Bottom CTA Banner */}
        <section className="border-t border-border mt-12 pt-20 pb-16 px-4 sm:px-6">
          <div
            ref={ctaCardRef}
            className={cn(
              "max-w-4xl mx-auto rounded-[var(--radius-base)] border border-border bg-card p-8 sm:p-14 text-center space-y-6 shadow-none relative overflow-hidden gradient-border-active",
              !isCtaVisible && "anim-paused"
            )}
          >
            <div className="cta-drifting-glow" aria-hidden="true" />
            <div className="relative z-10 space-y-6">
              <Eyebrow category="chat">Get started</Eyebrow>
              <WordRevealHeading
                as="h2"
                className="text-[clamp(2rem,4.5vw,3.75rem)] font-semibold text-foreground tracking-[-0.02em] leading-tight"
              >
                Ready to research with clarity?
              </WordRevealHeading>
              <p className="text-body sm:text-lg text-foreground/80 max-w-xl mx-auto leading-relaxed">
                Create your workspace in seconds. Connect your sources and unlock grounded AI synthesis.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  loading={loading}
                  loadingText="Redirecting…"
                  onClick={handleSignIn}
                  className="min-w-[240px]"
                >
                  <span>Get started with Google</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <a
                  href="#features"
                  className={cn(buttonVariants({ variant: "default", size: "lg" }))}
                >
                  <span>Review features</span>
                </a>
              </div>
              {authError && (
                <p className="text-xs text-destructive text-center font-medium mt-2" role="alert">
                  {authError}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Floating scroll progress dots for desktop */}
      <ScrollProgressDots />

      {/* SECTION 10: Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
