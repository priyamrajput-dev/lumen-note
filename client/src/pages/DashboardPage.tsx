import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useWorkspaces, useDeleteWorkspace } from "@/api/workspaces";
import { useAuthSession } from "@/api/auth";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";
import { WorkspaceSettingsModal } from "@/components/workspaces/WorkspaceSettingsModal";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Eyebrow } from "@/components/brand/Eyebrow";
import {
  fadeUpVariants,
  staggerContainerVariants,
  floatingBlobAnimation,
} from "@/lib/motion";
import type { Workspace } from "@/types";
import {
  Plus,
  Trash2,
  Calendar,
  ArrowUpRight,
  Cpu,
  AlertCircle,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: session } = useAuthSession();
  const { data: workspaces, isLoading, isError, refetch } = useWorkspaces();
  const deleteMutation = useDeleteWorkspace();

  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
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
    <div className="min-h-[calc(100dvh-3.5rem)] bg-background text-foreground transition-colors flex flex-col justify-between">
      <main className="page-container py-8 sm:py-10 w-full flex-1">
        {/* Eyebrow Header */}
        <div className="mb-2">
          <Eyebrow category="workspaces">Workspaces</Eyebrow>
        </div>

        {/* Page Header */}
        <PageHeader
          title="Research Workspaces"
          description={`Welcome, ${session?.user?.name || "Researcher"}. Open an existing investigation or create a new grounded notebook.`}
          badge={workspaces?.length ?? 0}
          actions={
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="h-9 px-5 text-xs font-semibold gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Workspace</span>
            </Button>
          }
        />

        {/* Filter Controls Bar */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search workspaces by title or notes..."
            className="w-full sm:max-w-md"
          />

          {/* Model Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-[100px] border border-border bg-card p-1 text-xs shadow-none self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setModelFilter("all")}
              className={`px-3 py-1 rounded-[100px] text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                modelFilter === "all"
                  ? "bg-background text-foreground border border-border font-semibold"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              All Engines
            </button>
            <button
              type="button"
              onClick={() => setModelFilter("gpt-4o-mini")}
              className={`px-3 py-1 rounded-[100px] text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                modelFilter === "gpt-4o-mini"
                  ? "bg-background text-foreground border border-border font-semibold"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              gpt-4o-mini
            </button>
            <button
              type="button"
              onClick={() => setModelFilter("gpt-4o")}
              className={`px-3 py-1 rounded-[100px] text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                modelFilter === "gpt-4o"
                  ? "bg-background text-foreground border border-border font-semibold"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              gpt-4o
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 rounded-[var(--radius-base)] border border-border bg-card animate-pulse p-6 flex flex-col justify-between shadow-none"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[var(--radius-base)] bg-muted border border-border" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/3 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                  </div>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Banner */}
        {isError && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-[var(--radius-base)] border border-destructive/60 bg-card p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <h3 className="text-sm font-semibold text-foreground">Failed to load workspaces</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              We encountered an issue communicating with the backend. Please verify your connection.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-[100px] border border-border bg-transparent px-4 py-2 text-xs font-semibold text-foreground hover:border-foreground/80 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Tasteful Empty State with Gradient Blob */}
        {!isLoading && !isError && workspaces?.length === 0 && (
          <div className="mt-12 rounded-[var(--radius-base)] border border-border bg-card p-10 sm:p-16 text-center shadow-none flex flex-col items-center">
            {/* Luminous Soft 3D Blob with gentle floating loop */}
            <motion.div
              animate={floatingBlobAnimation}
              className="relative w-40 h-40 mb-6"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="dash-blob" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.8" />
                    <stop offset="30%" stopColor="var(--category-workspaces)" />
                    <stop offset="70%" stopColor="var(--secondary)" />
                    <stop offset="100%" stopColor="var(--card)" />
                  </radialGradient>
                  <filter id="dash-blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="var(--category-workspaces)" opacity="0.15" filter="url(#dash-blur)" />
                <path
                  d="M 100,30 C 145,25 170,55 170,100 C 170,145 140,170 95,170 C 50,170 30,140 30,95 C 30,50 55,35 100,30 Z"
                  fill="url(#dash-blob)"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
                <ellipse cx="78" cy="68" rx="28" ry="18" transform="rotate(-25 78 68)" fill="var(--foreground)" opacity="0.3" filter="url(#dash-blur)" />
              </svg>
            </motion.div>

            <Eyebrow category="workspaces">First Notebook</Eyebrow>

            <h3 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight mt-3">
              Your research journey starts here
            </h3>

            <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Create a dedicated workspace to ingest PDFs, documentation, and notes. Ask questions grounded in exact source citations.
            </p>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 gradient-border inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:opacity-90 transition-all cursor-pointer shadow-none"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Workspace</span>
            </button>
          </div>
        )}

        {/* Empty Search Results */}
        {!isLoading && !isError && workspaces && workspaces.length > 0 && filteredWorkspaces?.length === 0 && (
          <div className="mt-12 rounded-[var(--radius-base)] border border-border bg-card p-10 text-center shadow-none">
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              No matching workspaces found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              No notebooks matched "{searchQuery}". Try a different search query or reset engine filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setModelFilter("all");
              }}
              className="mt-5 rounded-[100px] border border-border bg-transparent px-4 py-1.5 text-xs font-semibold text-foreground hover:border-foreground/80 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Workspaces Card Grid: 8px radius, 24px padding, card surface, 24px gap, no shadows */}
        {!isLoading && !isError && filteredWorkspaces && filteredWorkspaces.length > 0 && (
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            layout
            className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cards-grid"
          >
            {filteredWorkspaces.map((ws) => (
              <motion.div
                key={ws.id}
                layout
                variants={fadeUpVariants}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/workspace/${ws.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/workspace/${ws.id}`);
                  }
                }}
                className="group relative flex flex-col justify-between rounded-[var(--radius-base)] border border-border bg-card p-6 transition-all cursor-pointer shadow-none gradient-border-hover hover:border-category-workspaces/50 outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-base)] bg-background border border-border text-xl shrink-0 shadow-none card-icon-tile">
                        {ws.icon || "🧠"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-category-workspaces transition-colors truncate tracking-tight">
                          <span className="card-title-underline">{ws.title}</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 rounded-[4px] bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                            <Cpu className="h-2.5 w-2.5 text-category-workspaces" />
                            {ws.defaultModel || "gpt-4o-mini"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingWorkspace(ws);
                        }}
                        className="flex items-center justify-center min-h-[36px] min-w-[36px] h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all cursor-pointer subtle-focus"
                        title="Edit workspace"
                        aria-label={`Edit workspace ${ws.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingWorkspace({ id: ws.id, title: ws.title });
                        }}
                        className="flex items-center justify-center min-h-[36px] min-w-[36px] h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-all cursor-pointer subtle-focus"
                        title="Delete workspace"
                        aria-label={`Delete workspace ${ws.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {ws.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono text-[10px]">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {new Date(ws.createdAt).toLocaleDateString()}
                  </span>

                  <span className="inline-flex items-center gap-1 text-category-workspaces group-hover:translate-x-0.5 transition-transform font-medium text-xs card-arrow">
                    Open Studio
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Create Workspace Modal */}
      <CreateWorkspaceDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Edit Workspace Modal */}
      <WorkspaceSettingsModal
        workspace={editingWorkspace}
        isOpen={Boolean(editingWorkspace)}
        onClose={() => setEditingWorkspace(null)}
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

export default DashboardPage;
