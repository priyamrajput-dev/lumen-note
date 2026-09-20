import React, { useState, useEffect, useRef } from "react";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useMessages,
  streamChat,
} from "@/api/chat";
import { useSource } from "@/api/sources";
import type { ChatModel, Source } from "@/types";
import { CitationsPopover } from "./CitationsPopover";
import { MarkdownMessage } from "./MarkdownMessage";
import { SourcePreviewDrawer } from "@/components/sources/SourcePreviewDrawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSmoothStream } from "@/hooks/useSmoothStream";
import {
  Sparkles,
  Plus,
  Send,
  Trash2,
  Globe,
  Bot,
  User,
  Copy,
  Check,
  Loader2,
  Cpu,
  MessageSquare,
  Square,
  CornerDownLeft,
  ChevronDown,
} from "lucide-react";

interface ChatStudioProps {
  workspaceId: string;
  defaultModel?: ChatModel;
  sourcesCount?: number;
  sources?: Source[];
  selectedSourceIds?: string[];
  onToggleSourceSelect?: (id: string) => void;
  onClearSourceSelection?: () => void;
  onNavigateToSources?: () => void;
}

export function ChatStudio({
  workspaceId,
  defaultModel = "gpt-4o-mini",
  sourcesCount = 0,
  sources,
  selectedSourceIds = [],
  onClearSourceSelection,
  onNavigateToSources,
}: ChatStudioProps) {
  const { data: conversations, refetch: refetchConversations } = useConversations(workspaceId);
  const createConversationMutation = useCreateConversation(workspaceId);
  const deleteConversationMutation = useDeleteConversation(workspaceId);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [convDropdownOpen, setConvDropdownOpen] = useState(false);
  const [convToDelete, setConvToDelete] = useState<{ id: string; title: string } | null>(null);
  const convDropdownRef = useRef<HTMLDivElement>(null);

  // Selective grounding helpers
  const selectedSources = (sources || []).filter((s) => selectedSourceIds.includes(s.id));
  const totalSourcesCount = sources?.length || sourcesCount;
  const isSelective = selectedSourceIds.length > 0 && selectedSourceIds.length < totalSourcesCount;
  const selectedTitles = selectedSources.map((s) => s.title).join(", ");

  // Model & search settings
  const [selectedModel, setSelectedModel] = useState<ChatModel>(defaultModel);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  // Smooth Streaming State
  const {
    displayedText: streamingText,
    isStreaming,
    startStream,
    pushChunk,
    finishStream,
    stopStream,
  } = useSmoothStream({ tickIntervalMs: 20 });
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Citation document preview modal state
  const [inspectSourceId, setInspectSourceId] = useState<string | null>(null);
  const { data: inspectedSource, isLoading: isInspectingSource } = useSource(
    workspaceId,
    inspectSourceId || undefined,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load messages for the active conversation
  const { data: serverMessages, refetch: refetchMessages } = useMessages(
    workspaceId,
    activeConversationId || undefined,
  );

  // Default to the first conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Close conversation switcher dropdown on outside click
  useEffect(() => {
    if (!convDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (convDropdownRef.current && !convDropdownRef.current.contains(event.target as Node)) {
        setConvDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [convDropdownOpen]);

  // Auto scroll down (smooth when idle, instant auto during active streaming to prevent jitter)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [serverMessages, streamingText, optimisticUserMsg, isStreaming]);

  const handleCreateNewConversation = async () => {
    const newConv = await createConversationMutation.mutateAsync();
    setActiveConversationId(newConv.id);
  };

  const handleConfirmDeleteConversation = async () => {
    if (!convToDelete) return;
    const targetId = convToDelete.id;
    try {
      await deleteConversationMutation.mutateAsync(targetId);
      if (activeConversationId === targetId) {
        setActiveConversationId(null);
      }
    } finally {
      setConvToDelete(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopStream();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageText = inputMessage.trim();
    if (!messageText || isStreaming) return;

    setInputMessage("");
    setOptimisticUserMsg(messageText);
    startStream();

    const currentMessages = [
      ...(serverMessages?.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
      })) || []),
      { role: "user" as const, content: messageText },
    ];

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamChat({
        workspaceId,
        conversationId: activeConversationId || undefined,
        messages: currentMessages,
        model: selectedModel,
        webSearch: webSearchEnabled,
        sourceIds: selectedSourceIds.length > 0 ? selectedSourceIds : undefined,
        signal: controller.signal,
        onChunk: (chunk) => {
          pushChunk(chunk);
        },
        onConversationResolved: (resolvedId) => {
          if (!activeConversationId) {
            setActiveConversationId(resolvedId);
          }
        },
        onFinish: async () => {
          finishStream(async () => {
            await refetchMessages();
            await refetchConversations();
            setOptimisticUserMsg(null);
          });
        },
        onError: (err) => {
          console.error("Stream error:", err);
          stopStream();
        },
      });
    } catch (err) {
      console.error(err);
      stopStream();
    }
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden">
      {/* Main Research Conversation Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Chat Control Toolbar */}
        <div className="flex items-center justify-between border-b border-border px-3 sm:px-4 py-2 bg-surface/90 backdrop-blur-md shrink-0 gap-2">
          {/* Left: New Chat CTA & Conversation Switcher Dropdown */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Prominent "+ New Chat" Button */}
            <button
              type="button"
              onClick={handleCreateNewConversation}
              disabled={createConversationMutation.isPending}
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover transition-all cursor-pointer shadow-2xs subtle-focus shrink-0"
              title="Start a new chat thread"
            >
              {createConversationMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Conversation Switcher Dropdown */}
            <div className="relative min-w-0" ref={convDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConvDropdownOpen((prev) => !prev);
                }}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border/80 bg-surface hover:bg-surface-secondary text-xs font-medium text-foreground transition-all cursor-pointer subtle-focus max-w-[160px] xs:max-w-[200px] sm:max-w-xs"
                aria-expanded={convDropdownOpen}
                aria-haspopup="listbox"
                title="Switch active conversation thread"
              >
                <MessageSquare className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="truncate">
                  {conversations?.find((c) => c.id === activeConversationId)?.title || "Active Thread"}
                </span>
                <ChevronDown className={`h-3 w-3 text-muted shrink-0 ml-0.5 transition-transform duration-150 ${convDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {convDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1.5 w-72 max-w-[90vw] rounded-xl border border-border bg-surface p-1.5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/60 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
                      Threads ({conversations?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setConvDropdownOpen(false);
                        handleCreateNewConversation();
                      }}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-0.5">
                    {conversations && conversations.length > 0 ? (
                      conversations.map((conv) => {
                        const isActive = activeConversationId === conv.id;
                        return (
                          <div
                            key={conv.id}
                            onClick={() => {
                              setActiveConversationId(conv.id);
                              setConvDropdownOpen(false);
                            }}
                            className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                              isActive
                                ? "bg-accent-subtle text-accent font-semibold"
                                : "text-foreground-secondary hover:bg-surface-secondary hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                              )}
                              <span className="truncate">{conv.title || "Untitled Chat"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConvToDelete({ id: conv.id, title: conv.title || "Untitled Chat" });
                                setConvDropdownOpen(false);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-error rounded transition-opacity"
                              title="Delete thread"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="px-3 py-4 text-center text-xs text-muted">No conversations yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selective Grounding Header Pill */}
            {isSelective && (
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-accent-subtle/80 border border-accent/30 px-2 py-1 text-[11px] text-accent font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                <span className="shrink-0 font-semibold">Grounding:</span>
                <span className="truncate max-w-[120px] md:max-w-[180px]" title={selectedTitles}>
                  {selectedTitles}
                </span>
                {onClearSourceSelection && (
                  <button
                    type="button"
                    onClick={onClearSourceSelection}
                    className="hover:text-foreground text-muted cursor-pointer font-bold ml-0.5 text-xs"
                    title="Reset to all sources"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Model Selector & Web Search */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Model Selector */}
            <div className="flex items-center rounded-lg border border-border/80 bg-surface p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedModel("gpt-4o-mini")}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                  selectedModel === "gpt-4o-mini"
                    ? "bg-surface-secondary text-foreground font-semibold border border-border/70"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Cpu className="h-2.5 w-2.5 text-accent" />
                gpt-4o-mini
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("gpt-4o")}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                  selectedModel === "gpt-4o"
                    ? "bg-surface-secondary text-foreground font-semibold border border-border/70"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Cpu className="h-2.5 w-2.5 text-accent" />
                gpt-4o
              </button>
            </div>

            {/* Web Search Toggle */}
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-all cursor-pointer subtle-focus ${
                webSearchEnabled
                  ? "border-accent/40 bg-accent-subtle text-accent font-semibold"
                  : "border-border/80 bg-surface text-muted hover:text-foreground hover:bg-surface-secondary"
              }`}
              title="Toggle real-time web search"
            >
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Web Search</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Contextual guidance banner when 0 sources are loaded */}
          {sourcesCount === 0 && (
            <div className="mx-auto max-w-3xl rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0" aria-hidden="true">💡</span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-xs">Step 1: Add knowledge sources</p>
                  <p className="text-foreground-secondary text-[11px] truncate">
                    Upload PDFs, docs, or web links so Lumen Note can ground answers with citations.
                  </p>
                </div>
              </div>
              {onNavigateToSources && (
                <button
                  type="button"
                  onClick={onNavigateToSources}
                  className="shrink-0 rounded-lg bg-surface border border-border px-3 py-1 text-xs font-semibold text-accent hover:bg-surface-secondary hover:border-accent/40 transition-colors cursor-pointer subtle-focus"
                >
                  Add Sources →
                </button>
              )}
            </div>
          )}

          {(!serverMessages || serverMessages.length === 0) &&
            !optimisticUserMsg &&
            !streamingText && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Ask Your Sources
                </h3>
                <p className="mt-1.5 max-w-md text-xs text-foreground-secondary leading-relaxed">
                  Lumen Note retrieves exact document passages and cites them directly in its answers.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMessage("What are the key conclusions across these sources?")}
                    className="rounded-lg border border-border bg-surface px-3 py-1 text-[11px] text-foreground-secondary hover:text-foreground hover:border-accent/50 transition-colors cursor-pointer"
                  >
                    "What are the key conclusions?"
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMessage("Synthesize the main methodology and any limitations.")}
                    className="rounded-lg border border-border bg-surface px-3 py-1 text-[11px] text-foreground-secondary hover:text-foreground hover:border-accent/50 transition-colors cursor-pointer"
                  >
                    "Synthesize the methodology & limitations."
                  </button>
                </div>
              </div>
            )}

          {/* Render Saved Messages */}
          {serverMessages?.map((msg) => (
            <div key={msg.id} className="space-y-1 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-1">
                {msg.role === "USER" ? (
                  <>
                    <div className="h-5 w-5 rounded-md bg-surface-secondary border border-border flex items-center justify-center text-foreground text-[10px]">
                      <User className="h-3 w-3 text-muted" />
                    </div>
                    <span className="font-semibold text-foreground">You</span>
                  </>
                ) : (
                  <>
                    <div className="h-5 w-5 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-[10px]">
                      <Bot className="h-3 w-3" />
                    </div>
                    <span className="font-semibold text-foreground">Lumen Assistant</span>
                  </>
                )}
                <span className="text-[10px] text-muted ml-auto">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div
                className={`group relative rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === "USER"
                    ? "bg-surface-secondary/70 border border-border text-foreground"
                    : "bg-surface border border-border text-foreground shadow-2xs"
                }`}
              >
                {msg.role === "USER" ? (
                  <div className="whitespace-pre-wrap selection:bg-accent-subtle leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <MarkdownMessage content={msg.content} />
                )}

                {msg.role === "ASSISTANT" && msg.citations && (
                  <CitationsPopover
                    citations={msg.citations}
                    onSelectSource={(sourceId) => setInspectSourceId(sourceId)}
                  />
                )}

                {msg.role === "ASSISTANT" && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-surface-secondary text-muted hover:text-foreground transition-opacity cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Optimistic User Message while streaming */}
          {optimisticUserMsg && (
            <div className="space-y-1 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-1">
                <div className="h-5 w-5 rounded-md bg-surface-secondary border border-border flex items-center justify-center text-foreground text-[10px]">
                  <User className="h-3 w-3 text-muted" />
                </div>
                <span className="font-semibold text-foreground">You</span>
              </div>
              <div className="rounded-2xl p-4 text-xs leading-relaxed bg-surface-secondary/70 border border-border text-foreground">
                <div className="whitespace-pre-wrap">{optimisticUserMsg}</div>
              </div>
            </div>
          )}

          {/* Live Streaming Assistant Message */}
          {isStreaming && (
            <div className="space-y-1 max-w-3xl mx-auto animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted mb-1">
                <div className="h-5 w-5 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-[10px]">
                  <Bot className="h-3 w-3 animate-pulse" />
                </div>
                <span className="font-semibold text-foreground">Lumen Assistant</span>
                <span className="text-[10px] text-accent font-mono ml-auto animate-pulse">
                  Synthesizing...
                </span>
              </div>

              <div className="rounded-2xl border border-accent/30 bg-surface p-4 text-xs leading-relaxed text-foreground shadow-sm">
                {streamingText ? (
                  <MarkdownMessage content={streamingText} isStreaming={true} />
                ) : (
                  <span className="flex items-center gap-2 text-muted font-mono text-xs">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                    Analyzing sources & generating grounded response...
                  </span>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Command Box Chat Input */}
        <div className="border-t border-border p-3 sm:p-4 bg-surface/90 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto relative rounded-2xl border border-border bg-surface-secondary/40 p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-2xs"
          >
            {isSelective && (
              <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] border-b border-border/40 mb-1">
                <div className="flex items-center gap-1.5 text-accent min-w-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                  <span className="truncate">
                    Chatting with: <strong className="font-semibold">{selectedTitles}</strong>
                  </span>
                </div>
                {onClearSourceSelection && (
                  <button
                    type="button"
                    onClick={onClearSourceSelection}
                    className="text-[10px] text-muted hover:text-foreground underline cursor-pointer shrink-0 ml-2"
                  >
                    Chat with all
                  </button>
                )}
              </div>
            )}

            <textarea
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isSelective
                  ? `Ask questions focused on ${selectedTitles}...`
                  : "Ask anything about your sources (Enter to send, Shift+Enter for newline)..."
              }
              className="w-full resize-none border-none bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none"
            />

            <div className="flex items-center justify-between pt-1 px-2">
              <div className="flex items-center gap-2 text-[10px] font-mono">
                {isSelective ? (
                  <span className="inline-flex items-center gap-1.5 text-accent font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Focused on {selectedSourceIds.length} of {totalSourcesCount} {totalSourcesCount === 1 ? "source" : "sources"}
                  </span>
                ) : totalSourcesCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Grounded in all {totalSourcesCount} sources
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                    ⚠️ 0 sources loaded
                  </span>
                )}
                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-surface-secondary px-1.5 py-0.5 text-[9px] border border-border text-muted">
                  <CornerDownLeft className="h-2.5 w-2.5" /> Enter
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStreaming}
                    className="inline-flex items-center gap-1 rounded-xl bg-error/10 border border-error/30 text-error px-3 py-1 text-xs font-semibold hover:bg-error/20 transition-colors cursor-pointer"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isStreaming}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent transition-all shadow-2xs cursor-pointer"
                    title="Send message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Direct Source Reading Drawer when Citation is clicked */}
      <SourcePreviewDrawer
        source={inspectedSource || null}
        isOpen={Boolean(inspectSourceId)}
        isLoading={isInspectingSource && !inspectedSource}
        onClose={() => setInspectSourceId(null)}
      />

      {/* Confirm Delete Conversation Modal */}
      <ConfirmDialog
        isOpen={Boolean(convToDelete)}
        title="Delete Conversation"
        description={`Are you sure you want to delete "${convToDelete?.title}"? All messages in this thread will be permanently removed.`}
        confirmLabel="Delete Conversation"
        variant="danger"
        isLoading={deleteConversationMutation.isPending}
        onConfirm={handleConfirmDeleteConversation}
        onClose={() => setConvToDelete(null)}
      />
    </div>
  );
}
