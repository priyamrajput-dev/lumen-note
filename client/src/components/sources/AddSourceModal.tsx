import React, { useState } from "react";
import {
  useCreateTextSource,
  useImportWebsiteSource,
  useImportYoutubeSource,
  useUploadPdfSource,
} from "@/api/sources";
import { getErrorMessage } from "@/api/client";
import {
  X,
  FileUp,
  Globe,
  Video,
  FileCode,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface AddSourceModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "pdf" | "website" | "youtube" | "note";

export function AddSourceModal({
  workspaceId,
  isOpen,
  onClose,
}: AddSourceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pdf");
  const [error, setError] = useState<string | null>(null);

  // PDF Form State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");

  // Website Form State
  const [webUrl, setWebUrl] = useState("");
  const [webTitle, setWebTitle] = useState("");

  // YouTube Form State
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");

  // Note Form State
  const [noteType, setNoteType] = useState<"TEXT" | "MARKDOWN">("MARKDOWN");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const uploadPdfMutation = useUploadPdfSource(workspaceId);
  const importWebMutation = useImportWebsiteSource(workspaceId);
  const importYtMutation = useImportYoutubeSource(workspaceId);
  const createNoteMutation = useCreateTextSource(workspaceId);

  const isPending =
    uploadPdfMutation.isPending ||
    importWebMutation.isPending ||
    importYtMutation.isPending ||
    createNoteMutation.isPending;

  if (!isOpen) return null;

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setError("Please select a PDF file (max 10MB)");
      return;
    }
    setError(null);
    try {
      await uploadPdfMutation.mutateAsync({
        file: pdfFile,
        title: pdfTitle.trim() || undefined,
      });
      setPdfFile(null);
      setPdfTitle("");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleWebSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim()) {
      setError("Please provide a valid website URL");
      return;
    }
    setError(null);
    try {
      await importWebMutation.mutateAsync({
        url: webUrl.trim(),
        title: webTitle.trim() || undefined,
      });
      setWebUrl("");
      setWebTitle("");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleYtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl.trim()) {
      setError("Please enter a YouTube video URL");
      return;
    }
    setError(null);
    try {
      await importYtMutation.mutateAsync({
        url: ytUrl.trim(),
        title: ytTitle.trim() || undefined,
      });
      setYtUrl("");
      setYtTitle("");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      setError("Title and content are both required");
      return;
    }
    setError(null);
    try {
      await createNoteMutation.mutateAsync({
        type: noteType,
        title: noteTitle.trim(),
        content: noteContent.trim(),
      });
      setNoteTitle("");
      setNoteContent("");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">Add Knowledge Source</h3>
            <p className="text-xs text-foreground-secondary mt-0.5">
              Ingest content into your research notebook for grounded AI and study tools.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-surface-secondary/70 p-1 border border-border">
          <button
            type="button"
            onClick={() => {
              setActiveTab("pdf");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "pdf"
                ? "bg-surface text-accent shadow-2xs border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <FileUp className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("website");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "website"
                ? "bg-surface text-accent shadow-2xs border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Website</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("youtube");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "youtube"
                ? "bg-surface text-accent shadow-2xs border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("note");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "note"
                ? "bg-surface text-accent shadow-2xs border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-error/10 border border-error/25 px-3 py-2 text-xs text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PDF Upload Tab */}
        {activeTab === "pdf" && (
          <form onSubmit={handlePdfSubmit} className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/60 bg-surface-secondary/20 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                id="pdf-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPdfFile(file);
                    if (!pdfTitle) setPdfTitle(file.name.replace(/\.pdf$/i, ""));
                  }
                }}
              />
              <label htmlFor="pdf-input" className="cursor-pointer block">
                {pdfFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success border border-success/20">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground line-clamp-1">
                      {pdfFile.name}
                    </span>
                    <span className="text-[11px] font-mono text-muted">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="text-[11px] text-accent underline">Choose different PDF</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                      <FileUp className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      Drop research paper or PDF here
                    </span>
                    <span className="text-[11px] text-muted">Up to 10MB per document</span>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Custom Title <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. Attention Is All You Need (Vaswani et al.)"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!pdfFile || isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Upload & Index PDF</span>
              </button>
            </div>
          </form>
        )}

        {/* Website Import Tab */}
        {activeTab === "website" && (
          <form onSubmit={handleWebSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Website URL <span className="text-accent">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/article-or-documentation"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Custom Title <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. Distributed Consensus Explained"
                value={webTitle}
                onChange={(e) => setWebTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!webUrl.trim() || isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Scrape & Index Website</span>
              </button>
            </div>
          </form>
        )}

        {/* YouTube Import Tab */}
        {activeTab === "youtube" && (
          <form onSubmit={handleYtSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                YouTube Video URL <span className="text-accent">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Custom Title <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. Stanford CS229 Lecture 1"
                value={ytTitle}
                onChange={(e) => setYtTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!ytUrl.trim() || isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Import Transcript</span>
              </button>
            </div>
          </form>
        )}

        {/* Raw Note / Markdown Tab */}
        {activeTab === "note" && (
          <form onSubmit={handleNoteSubmit} className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-foreground">
                Title <span className="text-accent">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNoteType("MARKDOWN")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                    noteType === "MARKDOWN"
                      ? "bg-accent-subtle text-accent border border-accent/30"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType("TEXT")}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                    noteType === "TEXT"
                      ? "bg-accent-subtle text-accent border border-accent/30"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Plain Text
                </button>
              </div>
            </div>

            <input
              type="text"
              required
              maxLength={200}
              placeholder="Note Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            />

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Content <span className="text-accent">*</span>
              </label>
              <textarea
                rows={6}
                required
                placeholder="Paste or write your research notes here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-secondary/40 px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted focus:border-accent focus:outline-none resize-none transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-muted hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!noteTitle.trim() || !noteContent.trim() || isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Note</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
