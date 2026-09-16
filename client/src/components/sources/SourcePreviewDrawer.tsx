import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Source } from "@/types";
import { useDeleteSource } from "@/api/sources";
import {
  X,
  FileText,
  Globe,
  Video,
  ExternalLink,
  Calendar,
  Layers,
  Copy,
  Check,
  FileCode,
  Search,
  Download,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";

export interface SourcePreviewDrawerProps {
  source: Source | null;
  isOpen?: boolean;
  isLoading?: boolean;
  onClose: () => void;
}

type FontSize = "sm" | "md" | "lg";
type FontStyle = "sans" | "mono" | "serif";

export function SourcePreviewDrawer({
  source,
  isOpen,
  isLoading = false,
  onClose,
}: SourcePreviewDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [fontStyle, setFontStyle] = useState<FontStyle>("sans");
  const [isDeleting, setIsDeleting] = useState(false);

  const shouldShow = isOpen !== undefined ? isOpen : Boolean(source);

  // Close on Escape key press
  useEffect(() => {
    if (!shouldShow) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldShow, onClose]);

  const deleteMutation = useDeleteSource(source?.workspaceId || "");

  const handleDelete = async () => {
    if (!source) return;
    if (window.confirm(`Are you sure you want to delete source "${source.title}"?`)) {
      setIsDeleting(true);
      try {
        await deleteMutation.mutateAsync(source.id);
        onClose();
      } catch (err) {
        console.error("Failed to delete source:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCopy = () => {
    if (source?.content) {
      navigator.clipboard.writeText(source.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!source?.content) return;
    const blob = new Blob([source.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${source.title.replace(/[^a-z0-9_-]/gi, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Compute text statistics
  const stats = useMemo(() => {
    if (!source?.content) {
      return { words: 0, chars: 0, readTimeMinutes: 0 };
    }
    const chars = source.content.length;
    const words = source.content.trim().split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readTimeMinutes };
  }, [source?.content]);

  // Highlight search matches
  const formattedContent = useMemo(() => {
    if (!source?.content) return [];
    return source.content.split("\n");
  }, [source?.content]);

  const searchMatchesCount = useMemo(() => {
    if (!searchQuery.trim() || !source?.content) return 0;
    const regex = new RegExp(searchQuery.replace(/[^a-zA-Z0-9]/g, "\\$&"), "gi");
    const matches = source.content.match(regex);
    return matches ? matches.length : 0;
  }, [searchQuery, source?.content]);

  if (!shouldShow) return null;

  const getSourceIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return <FileText className="h-4 w-4 text-rose-500" />;
      case "WEBSITE":
        return <Globe className="h-4 w-4 text-blue-500" />;
      case "YOUTUBE":
        return <Video className="h-4 w-4 text-red-500" />;
      default:
        return <FileCode className="h-4 w-4 text-accent" />;
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "text-xs leading-relaxed";
      case "lg":
        return "text-base leading-loose";
      default:
        return "text-sm leading-relaxed";
    }
  };

  const getFontStyleClass = () => {
    switch (fontStyle) {
      case "mono":
        return "font-mono";
      case "serif":
        return "font-serif";
      default:
        return "font-sans";
    }
  };

  const contentElement = (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex h-full w-full max-w-2xl sm:max-w-3xl flex-col border-l border-border bg-surface shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editorial Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-surface-secondary/50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border shrink-0 shadow-2xs">
              {getSourceIcon(source?.type)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase rounded bg-surface px-1.5 py-0.5 text-foreground border border-border">
                  {source?.type || "SOURCE"}
                </span>
                {source && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-success font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    {source.status.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {source?.content && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                  title="Export Markdown"
                >
                  <Download className="h-3.5 w-3.5 text-muted" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                  title="Copy full document text"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span className="text-success font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-error/20 bg-error/10 text-xs font-medium text-error hover:bg-error/20 transition-colors cursor-pointer"
                  title="Delete this source"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-error" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-error" />
                  )}
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-secondary hover:text-foreground transition-colors cursor-pointer"
              title="Close Reader"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Reader Toolbar: Search, Typography & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 py-2.5 bg-surface text-xs">
          {/* Search in Document */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading || !source}
              className="w-full rounded-lg border border-border bg-surface-secondary/40 pl-8 pr-12 py-1 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans disabled:opacity-50"
            />
            {searchQuery && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-accent font-semibold">
                {searchMatchesCount} found
              </span>
            )}
          </div>

          {/* Typography Controls */}
          <div className="flex items-center gap-3">
            {/* Font Style */}
            <div className="flex items-center rounded-lg border border-border bg-surface-secondary/40 p-0.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setFontStyle("sans")}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  fontStyle === "sans" ? "bg-surface text-foreground font-bold shadow-2xs" : "text-muted hover:text-foreground"
                }`}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => setFontStyle("serif")}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer font-serif ${
                  fontStyle === "serif" ? "bg-surface text-foreground font-bold shadow-2xs" : "text-muted hover:text-foreground"
                }`}
              >
                Serif
              </button>
              <button
                type="button"
                onClick={() => setFontStyle("mono")}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  fontStyle === "mono" ? "bg-surface text-foreground font-bold shadow-2xs" : "text-muted hover:text-foreground"
                }`}
              >
                Mono
              </button>
            </div>

            {/* Font Size */}
            <div className="flex items-center rounded-lg border border-border bg-surface-secondary/40 p-0.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  fontSize === "sm" ? "bg-surface text-foreground font-bold shadow-2xs" : "text-muted hover:text-foreground"
                }`}
                title="Small text"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize("md")}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  fontSize === "md" ? "bg-surface text-foreground font-bold shadow-2xs" : "text-muted hover:text-foreground"
                }`}
                title="Medium text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  fontSize === "lg" ? "bg-surface text-foreground font-bold shadow-2xs" : "text-muted hover:text-foreground"
                }`}
                title="Large text"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Reader Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-6">
          {isLoading || !source ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-xs font-mono text-muted">Opening document reader...</p>
            </div>
          ) : (
            <>
              {/* Document Title Header */}
              <div className="border-b border-border/60 pb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-tight">
                  {source.title}
                </h1>

                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline font-mono"
                  >
                    <span>{source.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Reader Stats Bar */}
                <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs font-mono text-muted">
                  <span className="flex items-center gap-1 bg-surface-secondary/60 rounded-md px-2 py-0.5 border border-border/50">
                    <Clock className="h-3 w-3 text-accent" />
                    {stats.readTimeMinutes} min read
                  </span>
                  <span className="flex items-center gap-1 bg-surface-secondary/60 rounded-md px-2 py-0.5 border border-border/50">
                    <Layers className="h-3 w-3 text-accent" />
                    {stats.words.toLocaleString()} words ({stats.chars.toLocaleString()} chars)
                  </span>
                  <span className="flex items-center gap-1 bg-surface-secondary/60 rounded-md px-2 py-0.5 border border-border/50">
                    <Calendar className="h-3 w-3 text-muted" />
                    {new Date(source.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Reading Surface */}
              <div className="min-h-[300px]">
                {source.content ? (
                  <div
                    className={`rounded-2xl border border-border/70 bg-surface-secondary/20 p-5 sm:p-7 text-foreground selection:bg-accent-subtle selection:text-foreground ${getFontSizeClass()} ${getFontStyleClass()}`}
                  >
                    <div className="space-y-3">
                      {formattedContent.map((line, idx) => {
                        const isHeading = line.startsWith("#");
                        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");

                        // If searching and this line matches
                        if (searchQuery.trim() && line.toLowerCase().includes(searchQuery.toLowerCase())) {
                          const parts = line.split(new RegExp(`(${searchQuery.replace(/[^a-zA-Z0-9]/g, "\\$&")})`, "gi"));
                          return (
                            <p key={idx} className="bg-accent/10 -mx-2 px-2 py-0.5 rounded border-l-2 border-accent">
                              {parts.map((part, pIdx) =>
                                part.toLowerCase() === searchQuery.toLowerCase() ? (
                                  <mark key={pIdx} className="bg-accent text-white font-semibold rounded px-1 py-0.2">
                                    {part}
                                  </mark>
                                ) : (
                                  <span key={pIdx}>{part}</span>
                                ),
                              )}
                            </p>
                          );
                        }

                        if (isHeading) {
                          return (
                            <h3 key={idx} className="text-base sm:text-lg font-bold text-foreground pt-2 text-accent">
                              {line.replace(/^#+\s*/, "")}
                            </h3>
                          );
                        }

                        if (isBullet) {
                          return (
                            <div key={idx} className="flex items-start gap-2 pl-2">
                              <span className="text-accent font-bold mt-0.5">•</span>
                              <span>{line.replace(/^[\s•-]+/, "")}</span>
                            </div>
                          );
                        }

                        if (!line.trim()) {
                          return <div key={idx} className="h-2" />;
                        }

                        return <p key={idx}>{line}</p>;
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/20 p-12 text-center text-xs text-muted">
                    {source.status === "PROCESSING" || source.status === "PENDING"
                      ? "Extracting document content and indexing passages..."
                      : "No extracted text available for this source."}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(contentElement, document.body)
    : contentElement;
}
