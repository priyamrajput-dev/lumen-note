import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/api/workspaces";
import { useSources } from "@/api/sources";
import { useArtifacts } from "@/api/artifacts";
import { ChatStudio } from "@/components/chat/ChatStudio";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ArtifactsPanel } from "@/components/artifacts/ArtifactsPanel";
import { WorkspaceSettingsModal } from "@/components/workspaces/WorkspaceSettingsModal";
import {
  MessageSquare,
  FileText,
  Sparkles,
  Settings,
  ArrowLeft,
  Loader2,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

type MobileTabType = "chat" | "sources" | "artifacts";

export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  // Mobile segmented tab state
  const [mobileTab, setMobileTab] = useState<MobileTabType>("chat");

  // Desktop panel collapsible state
  const [showSourcesPanel, setShowSourcesPanel] = useState(true);
  const [showArtifactsPanel, setShowArtifactsPanel] = useState(true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId);
  const { data: sources } = useSources(workspaceId);
  const { data: artifacts } = useArtifacts(workspaceId);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-xs text-muted font-mono">Opening research workspace...</p>
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] flex-col items-center justify-center bg-background text-center p-6">
        <div className="h-12 w-12 rounded-xl bg-surface-secondary flex items-center justify-center mb-3 shadow-2xs">
          <span className="text-xl">⚠️</span>
        </div>
        <h2 className="fluid-h3 text-foreground">Workspace not found</h2>
        <p className="mt-1 text-xs text-foreground-secondary max-w-sm">
          This workspace may have been removed or you may not have access permissions.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors cursor-pointer subtle-focus"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workspaces</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-background text-foreground overflow-hidden">
      {/* Workspace Header Bar */}
      <header className="flex items-center justify-between gap-2 sm:gap-3 border-b border-border/70 px-3 sm:px-4 py-2 bg-surface/85 backdrop-blur-md shrink-0 shadow-2xs">
        {/* Left: Back button & Workspace Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary border border-transparent hover:border-border transition-all cursor-pointer shrink-0 subtle-focus"
            title="Back to Workspaces Library"
            aria-label="Back to Workspaces Library"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0" aria-hidden="true">{workspace.icon || "🧠"}</span>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {workspace.title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-0.5 text-[10px] font-mono text-muted border border-border/70 shrink-0">
                <Cpu className="h-2.5 w-2.5 text-accent" />
                {workspace.defaultModel || "gpt-4o-mini"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mobile Segmented Controls (Visible on < lg screens) */}
        <div
          role="tablist"
          aria-label="Workspace View Switcher"
          className="flex lg:hidden items-center rounded-lg bg-surface-secondary/70 p-1 border border-border/70 text-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "sources"}
            onClick={() => setMobileTab("sources")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer subtle-focus ${
              mobileTab === "sources"
                ? "bg-surface text-foreground font-bold shadow-2xs border border-border/70"
                : "text-muted hover:text-foreground"
            }`}
          >
            <FileText className="h-3 w-3 text-rose-500" />
            <span className="hidden sm:inline">Sources</span>
            <span className="rounded-full bg-surface-secondary px-1.5 py-0.2 text-[9px] font-mono text-muted">
              {sources?.length || 0}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "chat"}
            onClick={() => setMobileTab("chat")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-medium transition-all cursor-pointer subtle-focus ${
              mobileTab === "chat"
                ? "bg-surface text-foreground font-bold shadow-2xs border border-border/70"
                : "text-muted hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3 w-3 text-accent" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "artifacts"}
            onClick={() => setMobileTab("artifacts")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer subtle-focus ${
              mobileTab === "artifacts"
                ? "bg-surface text-foreground font-bold shadow-2xs border border-border/70"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="hidden sm:inline">Notes</span>
            <span className="rounded-full bg-surface-secondary px-1.5 py-0.2 text-[9px] font-mono text-muted">
              {artifacts?.length || 0}
            </span>
          </button>
        </div>

        {/* Right: Panel Toggles for Desktop + Workspace Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Desktop Left Panel (Sources) Toggle */}
          <button
            type="button"
            onClick={() => setShowSourcesPanel(!showSourcesPanel)}
            className={`hidden lg:inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium rounded-lg border transition-all cursor-pointer shadow-2xs subtle-focus ${
              showSourcesPanel
                ? "border-accent/40 bg-accent-subtle text-foreground font-semibold"
                : "border-border/80 bg-surface text-muted hover:text-foreground hover:bg-surface-secondary"
            }`}
            title={showSourcesPanel ? "Hide Sources Panel" : "Show Sources Panel"}
            aria-label={showSourcesPanel ? "Hide Sources Panel" : "Show Sources Panel"}
          >
            {showSourcesPanel ? (
              <PanelLeftClose className="h-3.5 w-3.5 text-accent" />
            ) : (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            )}
            <span>Sources</span>
            <span className="text-[10px] font-mono text-muted">
              ({sources?.length || 0})
            </span>
          </button>

          {/* Desktop Right Panel (Notes & Artifacts) Toggle */}
          <button
            type="button"
            onClick={() => setShowArtifactsPanel(!showArtifactsPanel)}
            className={`hidden lg:inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-medium rounded-lg border transition-all cursor-pointer shadow-2xs subtle-focus ${
              showArtifactsPanel
                ? "border-accent/40 bg-accent-subtle text-foreground font-semibold"
                : "border-border/80 bg-surface text-muted hover:text-foreground hover:bg-surface-secondary"
            }`}
            title={showArtifactsPanel ? "Hide Notes & Artifacts" : "Show Notes & Artifacts"}
            aria-label={showArtifactsPanel ? "Hide Notes & Artifacts" : "Show Notes & Artifacts"}
          >
            {showArtifactsPanel ? (
              <PanelRightClose className="h-3.5 w-3.5 text-accent" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
            <span>Artifacts</span>
            <span className="text-[10px] font-mono text-muted">
              ({artifacts?.length || 0})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-border/80 bg-surface text-muted hover:text-foreground hover:bg-surface-secondary hover:border-accent/40 transition-all cursor-pointer shadow-2xs subtle-focus"
            title="Workspace Settings"
            aria-label="Workspace Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      {/* 1. DESKTOP VIEW: Three-Panel Research Layout (lg and above) */}
      <div className="hidden lg:flex flex-1 overflow-hidden divide-x divide-border">
        {/* Panel 1: Sources (Left) */}
        {showSourcesPanel && (
          <aside aria-label="Research Sources" className="w-80 shrink-0 flex flex-col bg-surface-secondary/20 overflow-hidden">
            <SourcesPanel workspaceId={workspace.id} isCompact />
          </aside>
        )}

        {/* Panel 2: AI Research Chat (Center) */}
        <main aria-label="Research Dialogue" className="flex-1 min-w-0 flex flex-col bg-background overflow-hidden">
          <ChatStudio
            workspaceId={workspace.id}
            defaultModel={workspace.defaultModel}
          />
        </main>

        {/* Panel 3: Notes & Learning Artifacts (Right) */}
        {showArtifactsPanel && (
          <aside aria-label="Learning Artifacts" className="w-84 xl:w-96 shrink-0 flex flex-col bg-surface-secondary/20 overflow-hidden">
            <ArtifactsPanel workspaceId={workspace.id} isCompact />
          </aside>
        )}
      </div>

      {/* 2. MOBILE & TABLET VIEW: Single Panel Switching (below lg) */}
      <div className="flex lg:hidden flex-1 overflow-hidden">
        {mobileTab === "sources" && (
          <div className="w-full h-full overflow-hidden">
            <SourcesPanel workspaceId={workspace.id} />
          </div>
        )}
        {mobileTab === "chat" && (
          <div className="w-full h-full overflow-hidden">
            <ChatStudio
              workspaceId={workspace.id}
              defaultModel={workspace.defaultModel}
            />
          </div>
        )}
        {mobileTab === "artifacts" && (
          <div className="w-full h-full overflow-hidden">
            <ArtifactsPanel workspaceId={workspace.id} />
          </div>
        )}
      </div>

      {/* Workspace Settings Dialog */}
      <WorkspaceSettingsModal
        workspace={workspace}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDeleted={() => navigate("/dashboard")}
      />
    </div>
  );
}
