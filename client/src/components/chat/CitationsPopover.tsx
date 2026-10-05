import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Citation } from "@/types";
import { popoverVariants } from "@/lib/motion";
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
        return <FileText className="h-3.5 w-3.5 text-category-sources shrink-0" />;
      case "WEB":
      case "WEBSITE":
        return <Globe className="h-3.5 w-3.5 text-category-sources shrink-0" />;
      case "YOUTUBE":
        return <Video className="h-3.5 w-3.5 text-category-artifacts shrink-0" />;
      default:
        return <FileCode className="h-3.5 w-3.5 text-category-workspaces shrink-0" />;
    }
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-[100px] border border-border bg-card px-2.5 py-1 text-[11px] font-mono font-medium text-foreground hover:border-foreground/50 transition-all cursor-pointer shadow-none"
      >
        <Quote className="h-3 w-3 text-category-chat" />
        <span>
          {citations.length} Citation{citations.length > 1 ? "s" : ""} from {groupedCitations.length} Source{groupedCitations.length > 1 ? "s" : ""}
        </span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-2.5 space-y-2.5"
          >
            {groupedCitations.map((group) => (
              <div
                key={group.key}
                className="rounded-[var(--radius-base)] border border-border bg-card p-3 text-xs leading-relaxed transition-all shadow-none"
              >
                {/* Document Header */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-base)] bg-background border border-border">
                      {getSourceIcon(group.sourceType)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground truncate text-xs">
                        {group.sourceTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                    <span className="rounded-[4px] bg-secondary px-1.5 py-0.5 text-muted-foreground border border-border uppercase font-medium">
                      {group.sourceType}
                    </span>
                    {group.maxScore > 0 && (
                      <span className="rounded-[4px] bg-category-chat/10 text-category-chat border border-category-chat/30 px-1.5 py-0.5 font-semibold">
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
                      className="rounded-[var(--radius-base)] bg-background p-2.5 border border-border text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1 text-[10px] font-mono text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-semibold text-category-chat">
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-category-chat/15 text-[10px] font-bold">
                            {passage.originalIndex}
                          </span>
                          Passage {pIdx + 1}
                        </span>

                        {passage.page !== undefined && passage.page !== null && (
                          <span className="text-muted-foreground">
                            Page {passage.page}
                          </span>
                        )}
                      </div>

                      {passage.excerpt && (
                        <p className="text-foreground/90 text-[11px] leading-relaxed line-clamp-3 bg-card p-2 rounded border border-border font-sans mt-1.5">
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
                      className="inline-flex items-center gap-1 text-category-chat hover:underline font-semibold"
                    >
                      <span>Visit web reference</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-category-chat" />
                      Indexed Knowledge Base
                    </span>
                  )}

                  {group.sourceId && onSelectSource && (
                    <button
                      type="button"
                      onClick={() => onSelectSource(group.sourceId!)}
                      className="inline-flex items-center gap-1 rounded-[100px] border border-border bg-transparent px-2.5 py-0.5 text-category-chat hover:border-category-chat/50 transition-colors font-semibold cursor-pointer"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Open in Reader →</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
