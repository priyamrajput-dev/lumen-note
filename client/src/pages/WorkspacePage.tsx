import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useWorkspace } from "@/api/workspaces";
import { useSources } from "@/api/sources";
import { useArtifacts } from "@/api/artifacts";
import { ChatStudio } from "@/components/chat/ChatStudio";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ArtifactsPanel } from "@/components/artifacts/ArtifactsPanel";
import { useMediaQuery } from "@/hooks/use-mobile";
const WorkspaceSettingsModal = React.lazy(() =>
  import("@/components/workspaces/WorkspaceSettingsModal").then((m) => ({ default: m.WorkspaceSettingsModal }))
);
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
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-base)] bg-card border border-border">
            <Loader2 className="h-5 w-5 animate-spin text-category-chat" />
          </div>
          <p className="text-xs text-muted-foreground font-mono">Opening research workspace...</p>
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="flex h-dvh md:h-[calc(100dvh-3.5rem)] flex-col items-center justify-center bg-background text-center p-6">
        <div className="h-12 w-12 rounded-[var(--radius-base)] bg-card border border-border flex items-center justify-center mb-4">
          <span className="text-xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Workspace not found</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          This workspace may have been removed or you may not have access permissions.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mt-5 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workspaces</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh md:h-[calc(100dvh-3.5rem)] flex-col bg-background text-foreground overflow-hidden">
      {/* 1. Main Workspace Top Bar */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-3 sm:px-4 py-2 bg-background shrink-0 shadow-none z-30">
        {/* Left: Back button & Workspace Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="h-8 px-2.5 gap-1.5"
            title="Back to Workspaces Library"
            aria-label="Back to Workspaces Library"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Workspaces</span>
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg shrink-0" aria-hidden="true">{workspace.icon || "🧠"}</span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {workspace.title}
              </h1>
            </div>
            <span className="hidden md:inline-flex items-center gap-1 rounded-[4px] bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border shrink-0">
              <Cpu className="h-2.5 w-2.5 text-category-workspaces" />
              {workspace.defaultModel || "gpt-4o-mini"}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Desktop Left Panel (Sources) Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSourcesPanel(!showSourcesPanel)}
            className={`hidden lg:inline-flex h-8 px-3 text-[11px] gap-1.5 ${
              showSourcesPanel
                ? "border-category-sources/50 text-category-sources font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={showSourcesPanel ? "Hide Sources Panel" : "Show Sources Panel"}
            aria-label={showSourcesPanel ? "Hide Sources Panel" : "Show Sources Panel"}
          >
            {showSourcesPanel ? (
              <PanelLeftClose className="h-3.5 w-3.5 text-category-sources" />
            ) : (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            )}
            <span>Sources</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              ({sources?.length || 0})
            </span>
          </Button>

          {/* Desktop Right Panel (Artifacts) Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowArtifactsPanel(!showArtifactsPanel)}
            className={`hidden lg:inline-flex h-8 px-3 text-[11px] gap-1.5 ${
              showArtifactsPanel
                ? "border-category-artifacts/50 text-category-artifacts font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={showArtifactsPanel ? "Hide Artifacts Panel" : "Show Artifacts Panel"}
            aria-label={showArtifactsPanel ? "Hide Artifacts Panel" : "Show Artifacts Panel"}
          >
            {showArtifactsPanel ? (
              <PanelRightClose className="h-3.5 w-3.5 text-category-artifacts" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
            <span>Artifacts</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              ({artifacts?.length || 0})
            </span>
          </Button>

          {/* Quick link to Knowledge Memories */}
          <Link
            to="/memories"
            className="inline-flex items-center justify-center h-8 px-2 sm:px-2.5 rounded-[var(--radius-base)] border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors gap-1.5"
            title="Knowledge Memories"
            aria-label="Knowledge Memories"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-category-memories shrink-0" />
            <span>Memories</span>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 px-2.5 gap-1.5"
            title="Edit Workspace Settings"
            aria-label="Edit Workspace Settings"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </header>

      {/* 2. Mobile View Switcher Tabs (Visible < lg screens) */}
      <nav
        aria-label="Workspace Views"
        className="lg:hidden border-b border-border bg-background px-2 py-1.5 shrink-0 shadow-none"
      >
        <div
          role="tablist"
          aria-label="Workspace View Switcher"
          className="grid grid-cols-3 gap-1 rounded-[var(--radius-base)] bg-card p-1 border border-border"
        >
          <button
            type="button"
            role="tab"
            id="tab-sources"
            aria-selected={mobileTab === "sources"}
            aria-controls="panel-sources"
            onClick={() => setMobileTab("sources")}
            className={`flex items-center justify-center gap-1.5 rounded-[var(--radius-base)] py-2 text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === "sources"
                ? "bg-background text-foreground border border-border font-bold"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-category-sources shrink-0" />
            <span className="truncate">Sources</span>
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shrink-0">
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
            className={`flex items-center justify-center gap-1.5 rounded-[var(--radius-base)] py-2 text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === "chat"
                ? "bg-background text-foreground border border-border font-bold"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-category-chat shrink-0" />
            <span className="truncate">Chat</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-artifacts"
            aria-selected={mobileTab === "artifacts"}
            aria-controls="panel-artifacts"
            onClick={() => setMobileTab("artifacts")}
            className={`flex items-center justify-center gap-1.5 rounded-[var(--radius-base)] py-2 text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === "artifacts"
                ? "bg-background text-foreground border border-border font-bold"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-category-artifacts shrink-0" />
            <span className="truncate">Artifacts</span>
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shrink-0">
              {artifacts?.length || 0}
            </span>
          </button>
        </div>
      </nav>

      {/* 3. Main Workspace Body with 1px Hairline Handles */}
      {isDesktop ? (
        /* DESKTOP VIEW: Three-Panel Research Layout with Hairline Separators */
        <div className="flex flex-1 overflow-hidden divide-x divide-border">
          {/* Panel 1: Sources (Left) */}
          {showSourcesPanel && (
            <aside aria-label="Research Sources" className="w-80 shrink-0 flex flex-col bg-background overflow-hidden">
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
              onNavigateToSources={() => setShowSourcesPanel(true)}
            />
          </main>

          {/* Panel 3: Notes & Artifacts (Right) */}
          {showArtifactsPanel && (
            <aside aria-label="Synthesis Artifacts" className="w-80 xl:w-96 shrink-0 flex flex-col bg-background overflow-hidden">
              <ArtifactsPanel workspaceId={workspace.id} />
            </aside>
          )}
        </div>
      ) : (
        /* MOBILE VIEW: Segmented Tab View */
        <div className="flex-1 overflow-hidden relative">
          <div
            id="panel-sources"
            role="tabpanel"
            aria-labelledby="tab-sources"
            hidden={mobileTab !== "sources"}
            className="h-full overflow-hidden"
          >
            {mobileTab === "sources" && (
              <SourcesPanel
                workspaceId={workspace.id}
                selectedSourceIds={selectedSourceIds}
                onToggleSourceSelect={handleToggleSourceSelect}
                onSelectAllSources={handleSelectAllSources}
                onClearSourceSelection={handleClearSourceSelection}
              />
            )}
          </div>

          <div
            id="panel-chat"
            role="tabpanel"
            aria-labelledby="tab-chat"
            hidden={mobileTab !== "chat"}
            className="h-full overflow-hidden"
          >
            {mobileTab === "chat" && (
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
            )}
          </div>

          <div
            id="panel-artifacts"
            role="tabpanel"
            aria-labelledby="tab-artifacts"
            hidden={mobileTab !== "artifacts"}
            className="h-full overflow-hidden"
          >
            {mobileTab === "artifacts" && (
              <ArtifactsPanel workspaceId={workspace.id} />
            )}
          </div>
        </div>
      )}

      {/* Workspace Settings Dialog */}
      {isSettingsOpen && (
        <React.Suspense fallback={null}>
          <WorkspaceSettingsModal
            workspace={workspace}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onDeleted={() => navigate("/dashboard")}
          />
        </React.Suspense>
      )}
    </div>
  );
}

export default WorkspacePage;
