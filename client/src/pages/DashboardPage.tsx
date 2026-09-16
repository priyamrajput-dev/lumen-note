import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaces, useDeleteWorkspace } from "@/api/workspaces";
import { useAuthSession } from "@/api/auth";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";
import { Footer } from "@/components/layout/Footer";
import {
  Plus,
  Search,
  FolderOpen,
  Trash2,
  Calendar,
  ArrowUpRight,
  Loader2,
  Cpu,
  Sparkles,
  X,
} from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: session } = useAuthSession();
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const deleteMutation = useDeleteWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredWorkspaces = workspaces?.filter((ws) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ws.title.toLowerCase().includes(q) ||
      (ws.description && ws.description.toLowerCase().includes(q));
    const matchesModel =
      modelFilter === "all" || ws.defaultModel === modelFilter;
    return matchesSearch && matchesModel;
  });

  const handleDelete = async (e: React.MouseEvent, workspaceId: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete workspace "${title}" and all its sources?`)) {
      setDeletingId(workspaceId);
      try {
        await deleteMutation.mutateAsync(workspaceId);
      } catch (err) {
        console.error("Failed to delete workspace:", err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background text-foreground transition-colors flex flex-col justify-between">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Research Workspaces
              </h1>
              <span className="text-xs font-mono font-medium rounded-full bg-surface-secondary text-muted border border-border px-2.5 py-0.5">
                {workspaces?.length ?? 0}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-foreground-secondary">
              Welcome, {session?.user?.name || "Researcher"}. Open an existing notebook or start a new investigation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-accent-hover hover:shadow-accent-glow transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </button>
        </div>

        {/* Search & Model Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search workspaces by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Model Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setModelFilter("all")}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                modelFilter === "all"
                  ? "bg-accent-subtle text-accent font-bold border border-accent/30 shadow-2xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              All Engines
            </button>
            <button
              type="button"
              onClick={() => setModelFilter("gpt-4o-mini")}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                modelFilter === "gpt-4o-mini"
                  ? "bg-accent-subtle text-accent font-bold border border-accent/30 shadow-2xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              gpt-4o-mini
            </button>
            <button
              type="button"
              onClick={() => setModelFilter("gpt-4o")}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                modelFilter === "gpt-4o"
                  ? "bg-accent-subtle text-accent font-bold border border-accent/30 shadow-2xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              gpt-4o
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl border border-border bg-surface animate-pulse p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-surface-secondary" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-surface-secondary" />
                    <div className="h-3 w-1/2 rounded bg-surface-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="mt-8 rounded-2xl border border-error/30 bg-error/10 p-6 text-center text-xs text-error">
            Failed to load workspaces. Please check your backend connection.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && workspaces?.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
              <FolderOpen className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">Your research starts here</h3>
            <p className="mt-1.5 max-w-sm text-xs text-foreground-secondary leading-relaxed">
              Create a notebook and bring your sources together to start asking grounded questions.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent-hover shadow-md hover:shadow-accent-glow transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Workspace</span>
            </button>
          </div>
        )}

        {/* Workspaces Grid */}
        {!isLoading && !isError && filteredWorkspaces && filteredWorkspaces.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkspaces.map((ws) => (
              <div
                key={ws.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/workspace/${ws.id}`);
                  }
                }}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-all card-hover cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary border border-border text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {ws.icon || "🧠"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
                          {ws.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-1.5 py-0.2 text-[10px] font-mono text-muted border border-border">
                            <Cpu className="h-2.5 w-2.5 text-accent" />
                            {ws.defaultModel || "gpt-4o-mini"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, ws.id, ws.title)}
                      disabled={deletingId === ws.id}
                      className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-all cursor-pointer z-10 shrink-0"
                      title="Delete workspace"
                    >
                      {deletingId === ws.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-error" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-3.5 text-xs text-foreground-secondary line-clamp-2 leading-relaxed">
                    {ws.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-[11px] text-muted font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(ws.createdAt).toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-1 text-accent group-hover:translate-x-0.5 transition-transform font-sans font-semibold text-xs">
                    Open Studio
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <Footer />
    </div>
  );
}
