import { useState, useRef, useCallback, useEffect } from "react";

interface UseSmoothStreamOptions {
  /**
   * Interval in milliseconds between each rendering tick.
   * Defaults to 20ms (~50 updates per second), creating a fluid, human-readable stream.
   */
  tickIntervalMs?: number;
}

export function useSmoothStream(options: UseSmoothStreamOptions = {}) {
  const { tickIntervalMs = 20 } = options;

  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const queueRef = useRef("");
  const currentTextRef = useRef("");
  const isNetworkDoneRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTicksRef = useRef(0);
  const onFinishCallbackRef = useRef<((finalText: string) => void) | null>(null);

  const tick = useCallback(() => {
    // Handle punctuation micro-pauses for natural human cadence
    if (pauseTicksRef.current > 0) {
      pauseTicksRef.current -= 1;
      return;
    }

    if (queueRef.current.length === 0) {
      if (isNetworkDoneRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsStreaming(false);
        const finalContent = currentTextRef.current;
        const cb = onFinishCallbackRef.current;
        onFinishCallbackRef.current = null;
        if (cb) {
          cb(finalContent);
        }
      }
      return;
    }

    // Adaptive step sizing to keep pace with the LLM while maintaining smoothness:
    // - Low backlog (< 15 chars): 1-2 chars per tick (~50-100 chars/sec)
    // - Medium backlog (15-60 chars): 2-4 chars per tick
    // - High backlog (60-150 chars): 5-8 chars per tick
    // - Massive burst (> 150 chars): accelerates smoothly up to 14 chars per tick
    const backlog = queueRef.current.length;
    let step = 1;
    if (backlog > 200) {
      step = Math.min(16, Math.ceil(backlog / 8));
    } else if (backlog > 80) {
      step = Math.min(8, Math.ceil(backlog / 10));
    } else if (backlog > 30) {
      step = Math.min(4, Math.ceil(backlog / 14));
    } else if (backlog > 10) {
      step = 2;
    } else {
      step = 1;
    }

    const nextSlice = queueRef.current.slice(0, step);
    queueRef.current = queueRef.current.slice(step);
    currentTextRef.current += nextSlice;
    setDisplayedText(currentTextRef.current);

    // Natural micro-pause at sentence terminals (. ! ? followed by space, or double newline)
    if (
      /[.!?]\s$/.test(currentTextRef.current) ||
      /\n\n$/.test(currentTextRef.current)
    ) {
      pauseTicksRef.current = 2; // ~40ms micro-pause
    }
  }, []);

  const ensureTimer = useCallback(() => {
    if (!timerRef.current) {
      timerRef.current = setInterval(tick, tickIntervalMs);
    }
  }, [tick, tickIntervalMs]);

  const startStream = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    queueRef.current = "";
    currentTextRef.current = "";
    isNetworkDoneRef.current = false;
    pauseTicksRef.current = 0;
    onFinishCallbackRef.current = null;
    setDisplayedText("");
    setIsStreaming(true);
    ensureTimer();
  }, [ensureTimer]);

  const pushChunk = useCallback(
    (chunk: string) => {
      if (!chunk) return;
      queueRef.current += chunk;
      ensureTimer();
    },
    [ensureTimer],
  );

  const finishStream = useCallback(
    (onComplete?: (finalText: string) => void) => {
      isNetworkDoneRef.current = true;
      if (onComplete) {
        onFinishCallbackRef.current = onComplete;
      }
      // If queue is already empty, finalize immediately
      if (queueRef.current.length === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsStreaming(false);
        const finalContent = currentTextRef.current;
        if (onComplete) {
          onComplete(finalContent);
        }
      } else {
        ensureTimer();
      }
    },
    [ensureTimer],
  );

  const stopStream = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Flush whatever was in the queue immediately
    currentTextRef.current += queueRef.current;
    queueRef.current = "";
    setDisplayedText(currentTextRef.current);
    setIsStreaming(false);
    const finalContent = currentTextRef.current;
    const cb = onFinishCallbackRef.current;
    onFinishCallbackRef.current = null;
    if (cb) {
      cb(finalContent);
    }
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    queueRef.current = "";
    currentTextRef.current = "";
    isNetworkDoneRef.current = false;
    pauseTicksRef.current = 0;
    onFinishCallbackRef.current = null;
    setDisplayedText("");
    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isStreaming,
    startStream,
    pushChunk,
    finishStream,
    stopStream,
    reset,
  };
}
