import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/api/workspaces";
import { useSources } from "@/api/sources";
import { useArtifacts } from "@/api/artifacts";
import { ChatStudio } from "@/components/chat/ChatStudio";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ArtifactsPanel } from "@/components/artifacts/ArtifactsPanel";
import { WorkspaceSettingsModal } from "@/components/workspaces/WorkspaceSettingsModal";
import { useMediaQuery } from "@/hooks/use-mobile";
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
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Mobile segmented tab state
  const [mobileTab, setMobileTab] = useState<MobileTabType>("chat");

  // Desktop panel collapsible state
  const [showSourcesPanel, setShowSourcesPanel] = useState(true);
  const [showArtifactsPanel, setShowArtifactsPanel] = useState(true);

  // Selective chat grounding state
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId);
  const { data: sources } = useSources(workspaceId);
  const { data: artifacts } = useArtifacts(workspaceId);

  // Sync selectedSourceIds if sources are deleted
  useEffect(() => {
    if (sources && selectedSourceIds.length > 0) {
      const existingIds = new Set(sources.map((s) => s.id));
      const valid = selectedSourceIds.filter((id) => existingIds.has(id));
      if (valid.length !== selectedSourceIds.length) {
        setSelectedSourceIds(valid);
      }
    }
  }, [sources, selectedSourceIds]);

  const handleToggleSourceSelect = (id: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSelectAllSources = () => {
    if (sources && sources.length > 0) {
      if (selectedSourceIds.length === sources.length) {
        setSelectedSourceIds([]);
      } else {
        setSelectedSourceIds(sources.map((s) => s.id));
      }
    }
  };

  const handleClearSourceSelection = () => {
    setSelectedSourceIds([]);
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh md:h-[calc(100dvh-3.5rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="text-xs text-muted font-mono">Opening research workspace...</p>
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="flex h-dvh md:h-[calc(100dvh-3.5rem)] flex-col items-center justify-center bg-background text-center p-6">
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
    <div className="flex h-dvh md:h-[calc(100dvh-3.5rem)] flex-col bg-background text-foreground overflow-hidden">
      {/* 1. Main Workspace Top Bar */}
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-3 sm:px-4 py-2 bg-surface/90 backdrop-blur-md shrink-0 shadow-2xs z-30">
        {/* Left: Back button & Workspace Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 h-8 px-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary border border-border/60 hover:border-border transition-all cursor-pointer shrink-0 subtle-focus text-xs font-medium"
            title="Back to Workspaces Library"
            aria-label="Back to Workspaces Library"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Workspaces</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg shrink-0" aria-hidden="true">{workspace.icon || "🧠"}</span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {workspace.title}
              </h1>
            </div>
            <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-surface-secondary px-2 py-0.5 text-[10px] font-mono text-muted border border-border/70 shrink-0">
              <Cpu className="h-2.5 w-2.5 text-accent" />
              {workspace.defaultModel || "gpt-4o-mini"}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
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
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border/80 bg-surface text-muted hover:text-foreground hover:bg-surface-secondary hover:border-accent/40 transition-all cursor-pointer shadow-2xs subtle-focus text-xs font-medium"
            title="Edit Workspace Settings"
            aria-label="Edit Workspace Settings"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* 2. Mobile / Tablet View Switcher Tabs (Visible < lg screens) */}
      <nav
        aria-label="Workspace Views"
        className="lg:hidden border-b border-border/70 bg-surface px-2 py-1.5 shrink-0 shadow-2xs"
      >
        <div
          role="tablist"
          aria-label="Workspace View Switcher"
          className="grid grid-cols-3 gap-1 rounded-xl bg-surface-secondary/70 p-1 border border-border/60"
        >
          <button
            type="button"
            role="tab"
            id="tab-sources"
            aria-selected={mobileTab === "sources"}
            aria-controls="panel-sources"
            onClick={() => setMobileTab("sources")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer subtle-focus ${
              mobileTab === "sources"
                ? "bg-surface text-foreground shadow-2xs border border-border/80 font-bold"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface/50"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Sources</span>
            <span className="rounded-full bg-surface-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted shrink-0">
              {sources?.length || 0}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-chat"
            aria-selected={mobileTab === "chat"}
            aria-controls="panel-chat"
            onClick={() => setMobileTab("chat")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer subtle-focus ${
              mobileTab === "chat"
                ? "bg-surface text-foreground shadow-2xs border border-border/80 font-bold"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface/50"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="truncate">Chat</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-artifacts"
            aria-selected={mobileTab === "artifacts"}
            aria-controls="panel-artifacts"
            onClick={() => setMobileTab("artifacts")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer subtle-focus ${
              mobileTab === "artifacts"
                ? "bg-surface text-foreground shadow-2xs border border-border/80 font-bold"
                : "text-foreground-secondary hover:text-foreground hover:bg-surface/50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Artifacts</span>
            <span className="rounded-full bg-surface-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted shrink-0">
              {artifacts?.length || 0}
            </span>
          </button>
        </div>
      </nav>

      {/* 3. Main Workspace Body */}
      {isDesktop ? (
        /* DESKTOP VIEW: Three-Panel Research Layout (lg and above) */
        <div className="flex flex-1 overflow-hidden divide-x divide-border">
          {/* Panel 1: Sources (Left) */}
          {showSourcesPanel && (
            <aside aria-label="Research Sources" className="w-80 shrink-0 flex flex-col bg-surface-secondary/20 overflow-hidden">
              <SourcesPanel
                workspaceId={workspace.id}
                isCompact
                selectedSourceIds={selectedSourceIds}
                onToggleSourceSelect={handleToggleSourceSelect}
                onSelectAllSources={handleSelectAllSources}
                onClearSourceSelection={handleClearSourceSelection}
              />
            </aside>
          )}

          {/* Panel 2: AI Research Chat (Center) */}
          <main aria-label="Research Dialogue" className="flex-1 min-w-0 flex flex-col bg-background overflow-hidden">
            <ChatStudio
              workspaceId={workspace.id}
              defaultModel={workspace.defaultModel}
              sourcesCount={sources?.length || 0}
              sources={sources}
              selectedSourceIds={selectedSourceIds}
              onToggleSourceSelect={handleToggleSourceSelect}
              onClearSourceSelection={handleClearSourceSelection}
              onNavigateToSources={() => setMobileTab("sources")}
            />
          </main>

          {/* Panel 3: Notes & Learning Artifacts (Right) */}
          {showArtifactsPanel && (
            <aside aria-label="Learning Artifacts" className="w-84 xl:w-96 shrink-0 flex flex-col bg-surface-secondary/20 overflow-hidden">
              <ArtifactsPanel workspaceId={workspace.id} isCompact />
            </aside>
          )}
        </div>
      ) : (
        /* MOBILE & TABLET VIEW: Single Panel Switching (below lg) */
        <div className="flex flex-1 overflow-hidden">
          {mobileTab === "sources" && (
            <div id="panel-sources" role="tabpanel" aria-labelledby="tab-sources" className="w-full h-full overflow-hidden">
              <SourcesPanel
                workspaceId={workspace.id}
                selectedSourceIds={selectedSourceIds}
                onToggleSourceSelect={handleToggleSourceSelect}
                onSelectAllSources={handleSelectAllSources}
                onClearSourceSelection={handleClearSourceSelection}
              />
            </div>
          )}
          {mobileTab === "chat" && (
            <div id="panel-chat" role="tabpanel" aria-labelledby="tab-chat" className="w-full h-full overflow-hidden">
              <ChatStudio
                workspaceId={workspace.id}
                defaultModel={workspace.defaultModel}
                sourcesCount={sources?.length || 0}
                sources={sources}
                selectedSourceIds={selectedSourceIds}
                onToggleSourceSelect={handleToggleSourceSelect}
                onClearSourceSelection={handleClearSourceSelection}
                onNavigateToSources={() => setMobileTab("sources")}
              />
            </div>
          )}
          {mobileTab === "artifacts" && (
            <div id="panel-artifacts" role="tabpanel" aria-labelledby="tab-artifacts" className="w-full h-full overflow-hidden">
              <ArtifactsPanel workspaceId={workspace.id} />
            </div>
          )}
        </div>
      )}

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
