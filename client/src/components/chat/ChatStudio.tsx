import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
const MarkdownMessage = React.lazy(() =>
  import("./MarkdownMessage").then((m) => ({ default: m.MarkdownMessage }))
);
const SourcePreviewDrawer = React.lazy(() =>
  import("@/components/sources/SourcePreviewDrawer").then((m) => ({ default: m.SourcePreviewDrawer }))
);
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSmoothStream } from "@/hooks/useSmoothStream";
import { popoverVariants } from "@/lib/motion";
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
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Auto scroll down
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
        const remaining = (conversations || []).filter((c) => c.id !== targetId);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
      setConvToDelete(null);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopStream();
    setOptimisticUserMsg(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const prompt = inputMessage.trim();
    if (!prompt || isStreaming) return;

    setInputMessage("");
    setErrorMessage(null);
    setOptimisticUserMsg(prompt);
    startStream();

    const currentMessages = [
      ...(serverMessages?.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
      })) || []),
      { role: "user" as const, content: prompt },
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
        sourceIds: isSelective ? selectedSourceIds : undefined,
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
          console.error("Chat error:", err);
          stopStream();
          setOptimisticUserMsg(null);
          abortControllerRef.current = null;
          setErrorMessage(err.message || "An unexpected error occurred while generating a response.");
        },
      });
    } catch (err: any) {
      console.error("Stream initialization error:", err);
      stopStream();
      setOptimisticUserMsg(null);
      abortControllerRef.current = null;
      setErrorMessage(err.message || "Failed to start streaming session.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden text-foreground">
      {/* Studio Top Control Strip */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-3 sm:px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Conversation Switcher Dropdown */}
          <div className="relative min-w-0" ref={convDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConvDropdownOpen((prev) => !prev);
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[100px] border border-border bg-card hover:border-foreground/50 text-xs font-medium text-foreground transition-all cursor-pointer shadow-none max-w-[160px] xs:max-w-[200px] sm:max-w-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-expanded={convDropdownOpen}
              aria-haspopup="listbox"
              title="Switch active conversation thread"
            >
              <MessageSquare className="h-3.5 w-3.5 text-category-chat shrink-0" />
              <span className="truncate">
                {conversations?.find((c) => c.id === activeConversationId)?.title || "Active Thread"}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-muted-foreground shrink-0 ml-0.5 transition-transform duration-150 ${
                  convDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {convDropdownOpen && (
                <motion.div
                  variants={popoverVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 top-full mt-1.5 w-72 max-w-[90vw] rounded-[var(--radius-base)] border border-border bg-card p-1.5 shadow-none z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Threads ({conversations?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setConvDropdownOpen(false);
                        handleCreateNewConversation();
                      }}
                      className="text-[11px] text-category-chat hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
                            className={`group flex items-center justify-between rounded-[var(--radius-base)] px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                              isActive
                                ? "bg-background text-foreground border border-border font-semibold"
                                : "text-muted-foreground hover:bg-background hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-category-chat shrink-0" />
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
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded transition-opacity"
                              title="Delete thread"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="px-3 py-4 text-center text-xs text-muted-foreground">No conversations yet.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selective Grounding Header Pill */}
          {isSelective && (
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-[100px] bg-card border border-category-chat/30 px-2.5 py-1 text-[11px] text-category-chat font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-category-chat animate-pulse shrink-0" />
              <span className="shrink-0 font-semibold">Grounding:</span>
              <span className="truncate max-w-[120px] md:max-w-[180px]" title={selectedTitles}>
                {selectedTitles}
              </span>
              {onClearSourceSelection && (
                <button
                  type="button"
                  onClick={onClearSourceSelection}
                  className="hover:text-foreground text-muted-foreground cursor-pointer font-bold ml-0.5 text-xs"
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
          <div className="flex items-center rounded-[100px] border border-border bg-card p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedModel("gpt-4o-mini")}
              className={`flex items-center gap-1 rounded-[100px] px-2.5 py-1 text-[10px] font-mono transition-colors cursor-pointer ${
                selectedModel === "gpt-4o-mini"
                  ? "bg-background text-foreground font-semibold border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="h-2.5 w-2.5 text-category-chat" />
              gpt-4o-mini
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("gpt-4o")}
              className={`flex items-center gap-1 rounded-[100px] px-2.5 py-1 text-[10px] font-mono transition-colors cursor-pointer ${
                selectedModel === "gpt-4o"
                  ? "bg-background text-foreground font-semibold border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="h-2.5 w-2.5 text-category-chat" />
              gpt-4o
            </button>
          </div>

          {/* Web Search Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={webSearchEnabled}
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`flex items-center gap-1.5 rounded-[100px] border px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer shadow-none ${
              webSearchEnabled
                ? "border-category-sources/60 bg-category-sources/10 text-category-sources font-semibold"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40"
            }`}
            title={`Web search is currently ${webSearchEnabled ? "ENABLED" : "DISABLED"}. Click to toggle.`}
          >
            <Globe className="h-3 w-3" />
            <span className="hidden sm:inline">Web Search</span>
            <span className={`text-[9px] font-mono px-1 rounded ${webSearchEnabled ? "bg-category-sources text-primary-foreground font-bold" : "text-muted-foreground"}`}>
              {webSearchEnabled ? "ON" : "OFF"}
            </span>
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-fade-edges">
        {/* Contextual guidance banner when 0 sources are loaded */}
        {sourcesCount === 0 && (
          <div className="mx-auto max-w-3xl rounded-[var(--radius-base)] border border-border bg-card p-4 flex items-center justify-between gap-3 text-xs shadow-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base shrink-0" aria-hidden="true">💡</span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-xs">Step 1: Add knowledge sources</p>
                <p className="text-muted-foreground text-[11px] truncate">
                  Upload PDFs, docs, or web links so Lumen Note can ground answers with citations.
                </p>
              </div>
            </div>
            {onNavigateToSources && (
              <button
                type="button"
                onClick={onNavigateToSources}
                className="shrink-0 rounded-[100px] bg-transparent border border-border px-3 py-1 text-xs font-semibold text-category-chat hover:border-category-chat/50 transition-colors cursor-pointer"
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
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-base)] bg-card border border-border text-category-chat mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                Ask Your Sources
              </h3>
              <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
                Lumen Note retrieves exact document passages and cites them directly in its answers.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMessage("What are the key conclusions across these sources?")}
                  className="rounded-[100px] border border-border bg-card px-3.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                >
                  "What are the key conclusions?"
                </button>
                <button
                  type="button"
                  onClick={() => setInputMessage("Synthesize the main methodology and any limitations.")}
                  className="rounded-[100px] border border-border bg-card px-3.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                >
                  "Synthesize methodology &amp; limitations."
                </button>
              </div>
            </div>
          )}

        {/* Render Saved Messages */}
        {serverMessages?.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-1">
              {msg.role === "USER" ? (
                <>
                  <div className="h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-foreground text-[10px]">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="font-semibold text-foreground">You</span>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-category-chat text-[10px]">
                    <Bot className="h-3 w-3" />
                  </div>
                  <span className="font-semibold text-foreground">Lumen Assistant</span>
                </>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* User message: foreground text in a bg-card 8px-radius block. Assistant: plain foreground text on canvas, no bubble */}
            {msg.role === "USER" ? (
              <div className="rounded-[var(--radius-base)] border border-border bg-card p-4 text-xs leading-relaxed text-foreground shadow-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="group relative pt-1 pb-3 text-xs leading-relaxed text-foreground">
                <React.Suspense
                  fallback={
                    <div className="text-xs text-muted-foreground animate-pulse py-1">
                      Loading message...
                    </div>
                  }
                >
                  <MarkdownMessage content={msg.content} />
                </React.Suspense>

                {msg.citations && (
                  <CitationsPopover
                    citations={msg.citations}
                    onSelectSource={(sourceId) => setInspectSourceId(sourceId)}
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 p-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition-opacity cursor-pointer shadow-none min-h-[32px] min-w-[32px] flex items-center justify-center subtle-focus"
                  title="Copy message"
                  aria-label="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="h-3 w-3 text-category-chat" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            )}
          </motion.div>
        ))}

        {/* Optimistic User Message while streaming */}
        {optimisticUserMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-1">
              <div className="h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-foreground text-[10px]">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="font-semibold text-foreground">You</span>
            </div>
            <div className="rounded-[var(--radius-base)] border border-border bg-card p-4 text-xs leading-relaxed text-foreground shadow-none">
              <div className="whitespace-pre-wrap">{optimisticUserMsg}</div>
            </div>
          </motion.div>
        )}

        {/* Live Streaming Assistant Message */}
        {isStreaming && (
          <div className="space-y-1 max-w-3xl mx-auto animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-1">
              <div className="h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center text-category-chat text-[10px]">
                <Bot className="h-3 w-3 animate-pulse" />
              </div>
              <span className="font-semibold text-foreground">Lumen Assistant</span>
              <span className="text-[10px] text-category-chat font-mono ml-auto animate-pulse">
                Synthesizing...
              </span>
            </div>

            {/* Plain text on canvas, no bubble */}
            <div className="pt-1 pb-3 text-xs leading-relaxed text-foreground">
              {streamingText ? (
                <React.Suspense
                  fallback={
                    <div className="text-xs text-muted-foreground animate-pulse py-1">
                      Loading message...
                    </div>
                  }
                >
                  <MarkdownMessage content={streamingText} isStreaming={true} />
                </React.Suspense>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-category-chat" />
                  Analyzing sources &amp; generating grounded response...
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Area: Pill input with hairline border and primary gradient-stroke send button */}
      <div className="border-t border-border p-3 sm:p-4 bg-background shrink-0">
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-2.5 p-3 rounded-[var(--radius-base)] bg-card border border-destructive/60 text-destructive flex items-start sm:items-center justify-between text-xs gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start sm:items-center gap-2 min-w-0">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5 sm:mt-0" />
              <span className="leading-snug break-words">{errorMessage}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {selectedModel === "gpt-4o" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel("gpt-4o-mini");
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-0.5 text-[11px] font-semibold rounded-[100px] border border-border bg-card text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                >
                  Use gpt-4o-mini
                </button>
              )}
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 text-muted-foreground hover:text-foreground text-xs cursor-pointer rounded"
                title="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto relative rounded-[28px] border border-border bg-card p-2 focus-within:border-foreground/70 transition-all shadow-none"
        >
          {isSelective && (
            <div className="flex items-center justify-between px-3 pb-1.5 text-[11px] border-b border-border mb-1">
              <div className="flex items-center gap-1.5 text-category-chat min-w-0">
                <span className="h-1.5 w-1.5 rounded-full bg-category-chat animate-pulse shrink-0" />
                <span className="truncate">
                  Chatting with: <strong className="font-semibold">{selectedTitles}</strong>
                </span>
              </div>
              {onClearSourceSelection && (
                <button
                  type="button"
                  onClick={onClearSourceSelection}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer shrink-0 ml-2"
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
            className="w-full resize-none border-0 bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none"
          />

          <div className="flex items-center justify-between pt-1 px-2">
            <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
              {isSelective ? (
                <span className="inline-flex items-center gap-1.5 text-category-chat font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-category-chat animate-pulse" />
                  Focused on {selectedSourceIds.length} of {totalSourcesCount} {totalSourcesCount === 1 ? "source" : "sources"}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Grounded across all {totalSourcesCount} {totalSourcesCount === 1 ? "source" : "sources"}
                </span>
              )}

              {webSearchEnabled && (
                <span className="inline-flex items-center gap-1 text-category-sources font-medium border-l border-border pl-2">
                  <Globe className="h-2.5 w-2.5" />
                  <span>+ Web Search</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleStopGeneration}
                  className="h-8 px-3.5 gap-1.5"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Stop</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!inputMessage.trim()}
                  className="h-8 px-4 gap-1.5"
                >
                  <span>Send</span>
                  <Send className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Delete Conversation Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(convToDelete)}
        onClose={() => setConvToDelete(null)}
        onConfirm={handleConfirmDeleteConversation}
        title="Delete Thread?"
        description={`Are you sure you want to delete "${convToDelete?.title}"? All messages in this thread will be permanently deleted.`}
        confirmText="Delete Thread"
        isDestructive={true}
        isLoading={deleteConversationMutation.isPending}
      />

      {/* Citation Source Inspection Drawer */}
      {Boolean(inspectSourceId) && (
        <React.Suspense fallback={null}>
          <SourcePreviewDrawer
            isOpen={Boolean(inspectSourceId)}
            onClose={() => setInspectSourceId(null)}
            source={inspectedSource || null}
            isLoading={isInspectingSource}
          />
        </React.Suspense>
      )}
    </div>
  );
}
