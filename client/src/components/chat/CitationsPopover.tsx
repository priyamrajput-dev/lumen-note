import React, { useState } from "react";
import type { Citation } from "@/types";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Quote,
} from "lucide-react";

interface CitationsPopoverProps {
  citations: Citation[];
  onSelectSource?: (sourceId: string) => void;
}

export function CitationsPopover({ citations, onSelectSource }: CitationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-2.5 border-t border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-muted hover:text-accent transition-colors cursor-pointer"
      >
        <Quote className="h-3 w-3 text-accent" />
        <span>
          {citations.length} Grounded Citation{citations.length > 1 ? "s" : ""}
        </span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2 animate-in fade-in duration-150">
          {citations.map((cite, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface p-3 text-xs leading-relaxed transition-all hover:border-accent/40 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-accent/15 text-accent text-[9px] font-mono font-bold">
                    {idx + 1}
                  </span>
                  {cite.sourceType === "WEB" || cite.sourceType === "WEBSITE" ? (
                    <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  )}
                  <span className="truncate">{cite.sourceTitle || "Source Document"}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-muted">
                  {cite.page !== undefined && cite.page !== null && (
                    <span className="rounded bg-surface-secondary px-1.5 py-0.2 text-foreground border border-border">
                      p. {cite.page}
                    </span>
                  )}
                  {cite.score !== undefined && (
                    <span className="rounded bg-success/10 text-success border border-success/20 px-1.5 py-0.2">
                      {(cite.score * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
              </div>

              {cite.excerpt && (
                <p className="text-[11px] text-foreground-secondary bg-surface-secondary/50 rounded-lg p-2.5 font-mono border border-border/60 italic leading-relaxed">
                  "{cite.excerpt}"
                </p>
              )}

              <div className="mt-2 flex items-center justify-between pt-1 text-[10px] font-mono">
                {cite.url ? (
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <span>Visit source link</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ) : (
                  <span className="text-muted">Direct Workspace Document</span>
                )}

                {cite.sourceId && onSelectSource && (
                  <button
                    type="button"
                    onClick={() => onSelectSource(cite.sourceId!)}
                    className="text-accent hover:underline cursor-pointer"
                  >
                    Open in reader →
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
