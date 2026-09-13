import React, { useState } from "react";
import type { Source } from "@/types";
import {
  X,
  FileText,
  Globe,
  Video,
  ExternalLink,
  Calendar,
  Activity,
  Layers,
  Copy,
  Check,
  FileCode,
} from "lucide-react";

interface SourcePreviewDrawerProps {
  source: Source | null;
  onClose: () => void;
}

export function SourcePreviewDrawer({
  source,
  onClose,
}: SourcePreviewDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!source) return null;

  const handleCopy = () => {
    if (source.content) {
      navigator.clipboard.writeText(source.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-secondary/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border">
              {source.type === "PDF" && <FileText className="h-3.5 w-3.5 text-rose-500" />}
              {source.type === "WEBSITE" && <Globe className="h-3.5 w-3.5 text-blue-500" />}
              {source.type === "YOUTUBE" && <Video className="h-3.5 w-3.5 text-red-500" />}
              {(source.type === "TEXT" || source.type === "MARKDOWN") && (
                <FileCode className="h-3.5 w-3.5 text-accent" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono font-medium rounded bg-surface-secondary px-1.5 py-0.5 text-foreground border border-border">
                {source.type}
              </span>
              <span className="ml-2 text-xs font-mono text-muted">
                {source.status.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {source.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-surface text-xs text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
                title="Copy full content"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-success" />
                    <span className="text-[11px] text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted hover:bg-surface-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {source.title}
            </h2>
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent hover:underline font-mono"
              >
                <span className="truncate max-w-sm">{source.url}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl border border-border bg-surface-secondary/40 p-3">
              <span className="text-[10px] font-mono text-muted block uppercase">Added On</span>
              <span className="text-foreground mt-1 flex items-center gap-1.5 font-medium text-xs">
                <Calendar className="h-3.5 w-3.5 text-muted" />
                {new Date(source.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface-secondary/40 p-3">
              <span className="text-[10px] font-mono text-muted block uppercase">Status</span>
              <span className="text-foreground mt-1 flex items-center gap-1.5 font-medium text-xs capitalize">
                <Activity className="h-3.5 w-3.5 text-success" />
                {source.status.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Extracted Text Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase font-bold text-muted tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-accent" />
                Extracted Document Content
              </span>
              <span className="text-[11px] font-mono text-muted">
                {source.content ? `${source.content.length.toLocaleString()} characters` : "No text"}
              </span>
            </div>

            {source.content ? (
              <div className="rounded-xl border border-border bg-surface-secondary/30 p-4 font-mono text-xs text-foreground leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap selection:bg-accent-subtle">
                {source.content}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-secondary/20 p-8 text-center text-xs text-muted">
                {source.status === "PROCESSING" || source.status === "PENDING"
                  ? "Extracting document content and indexing vectors..."
                  : "No extracted text available for this source."}
              </div>
            )}
          </div>

          {/* Raw Metadata if any */}
          {source.metadata && Object.keys(source.metadata).length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase font-bold text-muted tracking-wider block mb-2">
                Indexing & Ingestion Metadata
              </span>
              <pre className="rounded-xl border border-border bg-surface-secondary/40 p-3 text-[11px] font-mono text-foreground-secondary overflow-x-auto">
                {JSON.stringify(source.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
