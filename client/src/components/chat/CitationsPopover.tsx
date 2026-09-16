import React, { useState, useMemo } from "react";
import type { Citation } from "@/types";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Quote,
  BookOpen,
  Sparkles,
  Video,
  FileCode,
} from "lucide-react";

interface CitationsPopoverProps {
  citations: Citation[];
  onSelectSource?: (sourceId: string) => void;
}

interface GroupedCitation {
  key: string;
  sourceId?: string;
  sourceTitle: string;
  sourceType: string;
  url?: string;
  maxScore: number;
  passages: Array<{
    originalIndex: number;
    page?: number;
    score?: number;
    excerpt?: string;
  }>;
}

export function CitationsPopover({ citations, onSelectSource }: CitationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group citations by source document
  const groupedCitations = useMemo(() => {
    if (!citations || citations.length === 0) return [];

    const groupMap = new Map<string, GroupedCitation>();

    citations.forEach((cite, idx) => {
      const key = cite.sourceId || cite.url || cite.sourceTitle || `cite-${idx}`;
      const existing = groupMap.get(key);
      const score = cite.score ?? 0.8;

      if (existing) {
        existing.maxScore = Math.max(existing.maxScore, score);
        existing.passages.push({
          originalIndex: idx + 1,
          page: cite.page,
          score: cite.score,
          excerpt: cite.excerpt,
        });
      } else {
        groupMap.set(key, {
          key,
          sourceId: cite.sourceId,
          sourceTitle: cite.sourceTitle || (cite.sourceType === "WEB" ? "Web Search Result" : "Source Document"),
          sourceType: cite.sourceType || "DOCUMENT",
          url: cite.url,
          maxScore: score,
          passages: [
            {
              originalIndex: idx + 1,
              page: cite.page,
              score: cite.score,
              excerpt: cite.excerpt,
            },
          ],
        });
      }
    });

    return Array.from(groupMap.values()).sort((a, b) => b.maxScore - a.maxScore);
  }, [citations]);

  if (!citations || citations.length === 0) return null;

  const getSourceIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF":
        return <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />;
      case "WEB":
      case "WEBSITE":
        return <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
      case "YOUTUBE":
        return <Video className="h-3.5 w-3.5 text-red-500 shrink-0" />;
      default:
        return <FileCode className="h-3.5 w-3.5 text-accent shrink-0" />;
    }
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-mono font-semibold text-muted hover:text-foreground hover:bg-surface-secondary/70 transition-all cursor-pointer"
      >
        <Quote className="h-3 w-3 text-accent" />
        <span>
          {citations.length} Citation{citations.length > 1 ? "s" : ""} from {groupedCitations.length} Source{groupedCitations.length > 1 ? "s" : ""}
        </span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 text-muted" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          {groupedCitations.map((group) => (
            <div
              key={group.key}
              className="rounded-xl border border-border bg-surface p-3 text-xs leading-relaxed transition-all hover:border-accent/40 shadow-2xs"
            >
              {/* Document Header */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-secondary border border-border">
                    {getSourceIcon(group.sourceType)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground truncate text-xs">
                      {group.sourceTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                  <span className="rounded bg-surface-secondary px-1.5 py-0.5 text-foreground-secondary border border-border uppercase font-medium">
                    {group.sourceType}
                  </span>
                  {group.maxScore > 0 && (
                    <span className="rounded bg-success/10 text-success border border-success/20 px-1.5 py-0.5 font-semibold">
                      {(group.maxScore * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
              </div>

              {/* Cited Passages */}
              <div className="space-y-1.5">
                {group.passages.map((passage, pIdx) => (
                  <div
                    key={pIdx}
                    className="rounded-lg bg-surface-secondary/40 p-2 border border-border/50 text-[11px]"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1 text-[10px] font-mono text-muted">
                      <span className="inline-flex items-center gap-1 font-semibold text-accent">
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded bg-accent/15 text-[9px] font-bold">
                          {passage.originalIndex}
                        </span>
                        Passage {pIdx + 1}
                      </span>

                      {passage.page !== undefined && passage.page !== null && (
                        <span className="text-foreground-secondary">
                          Page {passage.page}
                        </span>
                      )}
                    </div>

                    {passage.excerpt && (
                      <p className="text-foreground-secondary text-[11px] leading-relaxed line-clamp-3 bg-surface/50 p-1.5 rounded border border-border/40 font-sans">
                        "{passage.excerpt
                          .replace(/^#+\s+/gm, "")
                          .replace(/\*\*(.*?)\*\*/g, "$1")
                          .replace(/\*(.*?)\*/g, "$1")
                          .replace(/_{1,2}(.*?)_{1,2}/g, "$1")
                          .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
                          .trim()}"
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="mt-2.5 flex items-center justify-between pt-1 text-[10px] font-mono">
                {group.url ? (
                  <a
                    href={group.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                  >
                    <span>Visit web reference</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-accent" />
                    Indexed Knowledge Base
                  </span>
                )}

                {group.sourceId && onSelectSource && (
                  <button
                    type="button"
                    onClick={() => onSelectSource(group.sourceId!)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-accent hover:bg-accent/10 transition-colors font-semibold cursor-pointer"
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Open in Reader →</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
