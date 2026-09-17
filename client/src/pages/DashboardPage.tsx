import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaces, useDeleteWorkspace } from "@/api/workspaces";
import { useAuthSession } from "@/api/auth";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Plus,
  FolderOpen,
  Trash2,
  Calendar,
  ArrowUpRight,
  Loader2,
  Cpu,
  AlertCircle,
} from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: session } = useAuthSession();
  const { data: workspaces, isLoading, isError, refetch } = useWorkspaces();
  const deleteMutation = useDeleteWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<{ id: string; title: string } | null>(null);

  const filteredWorkspaces = workspaces?.filter((ws) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ws.title.toLowerCase().includes(q) ||
      Boolean(ws.description && ws.description.toLowerCase().includes(q));
    const matchesModel =
      modelFilter === "all" || ws.defaultModel === modelFilter;
    return matchesSearch && matchesModel;
  });

  const handleDeleteConfirm = async () => {
    if (!deletingWorkspace) return;
    try {
      await deleteMutation.mutateAsync(deletingWorkspace.id);
      setDeletingWorkspace(null);
    } catch (err) {
      console.error("Failed to delete workspace:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background text-foreground transition-colors flex flex-col justify-between">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        {/* Page Header */}
        <PageHeader
          title="Research Workspaces"
          description={`Welcome, ${session?.user?.name || "Researcher"}. Open an existing notebook or start a new investigation.`}
          badge={workspaces?.length ?? 0}
          actions={
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover hover:shadow-accent-glow transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Workspace</span>
            </button>
          }
        />

        {/* Filter Controls Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search workspaces by title or description..."
            className="flex-1 min-w-[240px] max-w-md"
          />

          {/* Model Filter Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-surface p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setModelFilter("all")}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                modelFilter === "all"
                  ? "bg-accent-subtle text-accent font-semibold shadow-2xs"
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
                  ? "bg-accent-subtle text-accent font-semibold shadow-2xs"
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
                  ? "bg-accent-subtle text-accent font-semibold shadow-2xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              gpt-4o
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl border border-border/60 bg-surface/60 animate-pulse p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface-secondary" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 rounded bg-surface-secondary" />
                      <div className="h-3 w-1/3 rounded bg-surface-secondary" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="h-3 w-full rounded bg-surface-secondary/70" />
                    <div className="h-3 w-4/5 rounded bg-surface-secondary/70" />
                  </div>
                </div>
                <div className="pt-3 border-t border-border/40 flex justify-between">
                  <div className="h-3 w-20 rounded bg-surface-secondary" />
                  <div className="h-3 w-16 rounded bg-surface-secondary" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Banner */}
        {isError && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-error/25 bg-error/5 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-error mb-2" />
            <h3 className="text-sm font-semibold text-foreground">Failed to load workspaces</h3>
            <p className="mt-1 text-xs text-muted max-w-sm">
              We encountered an issue communicating with the backend. Please verify your connection.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl border border-border bg-surface px-4 py-1.5 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && workspaces?.length === 0 && (
          <div className="mt-10">
            <EmptyState
              icon={<FolderOpen className="h-6 w-6" />}
              title="Your research starts here"
              description="Create a notebook and bring your sources together to start asking grounded questions."
              actionLabel="Create First Workspace"
              actionIcon={<Plus className="h-4 w-4" />}
              onAction={() => setIsCreateOpen(true)}
            />
          </div>
        )}

        {/* Empty Search Results */}
        {!isLoading && !isError && workspaces && workspaces.length > 0 && filteredWorkspaces?.length === 0 && (
          <div className="mt-10">
            <EmptyState
              icon={<FolderOpen className="h-6 w-6" />}
              title="No matching workspaces found"
              description={`No notebooks matched "${searchQuery}". Try a different keyword or reset filters.`}
              actionLabel="Clear Search"
              onAction={() => {
                setSearchQuery("");
                setModelFilter("all");
              }}
            />
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
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 transition-all card-hover cursor-pointer subtle-focus shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary border border-border/60 text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {ws.icon || "🧠"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate tracking-tight">
                          {ws.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted border border-border/60">
                            <Cpu className="h-2.5 w-2.5 text-accent" />
                            {ws.defaultModel || "gpt-4o-mini"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingWorkspace({ id: ws.id, title: ws.title });
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-all cursor-pointer shrink-0 z-10"
                      title="Delete workspace"
                      aria-label={`Delete workspace ${ws.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-3.5 text-xs text-foreground-secondary line-clamp-2 leading-relaxed">
                    {ws.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted">
                  <span className="flex items-center gap-1.5 font-mono text-[10px]">
                    <Calendar className="h-3 w-3 text-muted" />
                    {new Date(ws.createdAt).toLocaleDateString()}
                  </span>

                  <span className="inline-flex items-center gap-1 text-accent group-hover:translate-x-0.5 transition-transform font-medium text-xs">
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

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingWorkspace)}
        onClose={() => setDeletingWorkspace(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Workspace?"
        description={`Are you sure you want to permanently delete "${deletingWorkspace?.title}"? All uploaded sources, chat messages, and generated artifacts will be removed.`}
        confirmText="Delete Workspace"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />

      <Footer />
    </div>
  );
}
