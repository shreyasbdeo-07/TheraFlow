"use client";
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Zap, Send, History, Smile, AlertCircle,
  RotateCcw, Sparkles, Plus, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  createConversation,
  saveMessage,
  subscribeMessages,
  updateConversationTitle,
  updateConversationLastMessage,
  getUserPrefs,
} from "@/lib/firestore";

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────

const GREETING = `Hello! I'm TheraFlow, your personal wellness companion. I'm here to listen without judgment and support you through whatever you're experiencing. How are you feeling today?`;

const SUGGESTIONS = [
  "I've been feeling anxious lately…",
  "I need help managing stress",
  "I'm struggling to sleep",
  "I feel overwhelmed at work",
];

// ─────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────

function toDate(ts) {
  if (!ts) return new Date();
  if (ts.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

function formatTime(ts) {
  return toDate(ts).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });
}

function formatDateLabel(ts) {
  const d   = toDate(ts);
  const now = new Date();
  const isSameDay = d.toDateString() === now.toDateString();
  if (isSameDay) return `Today, ${d.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/**
 * Generate a short conversation title from the first user message.
 */
function makeTitleFromMessage(text) {
  const trimmed = text.trim();
  if (trimmed.length <= 40) return trimmed;
  return trimmed.slice(0, 37) + "…";
}

/**
 * Call the /api/chat backend route with the full message history.
 * Returns the AI reply string.
 * @throws on network or API error
 */
async function generateAIResponse(messages, personality = "warm") {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role:    m.role,
        content: m.content,
      })),
      personality,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.reply;
}

// ─────────────────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex gap-3 max-w-[85%]">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-teal-500/20 text-teal-400">
          <Zap size={15} fill="currentColor" />
        </div>
        {/* Bubble */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl px-4 py-3.5 flex items-center gap-1.5">
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-teal-400/60 animate-bounce"
              style={{ animationDelay: `${delay}s`, animationDuration: "0.9s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────

function MessageBubble({ message, userName }) {
  const isUser = message.role === "user";
  const ts     = message.timestamp ?? message._optimisticTs;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}>
      <div className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center self-end mb-6 ${
            isUser
              ? "bg-slate-800 text-slate-400 border border-white/5"
              : "bg-teal-500/20 text-teal-400"
          }`}
        >
          {isUser ? <Smile size={15} /> : <Zap size={15} fill="currentColor" />}
        </div>

        {/* Content */}
        <div className="space-y-1.5 min-w-0">
          <div
            className={`px-4 py-3.5 rounded-2xl text-sm leading-relaxed break-words ${
              isUser
                ? "bg-teal-400 text-slate-950 font-semibold shadow-lg shadow-teal-500/10 rounded-tr-md"
                : "bg-slate-900/80 backdrop-blur-md border border-white/5 text-slate-200 rounded-tl-md"
            }`}
          >
            {message.content}
          </div>
          {/* Meta */}
          <div
            className={`flex items-center gap-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <span>{isUser ? (userName ?? "You") : "TheraFlow"}</span>
            <span>·</span>
            <span>{ts ? formatTime(ts) : "…"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ERROR BANNER
// ─────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 mx-4 mb-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-semibold text-red-400">
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle size={14} className="flex-shrink-0" />
        <span className="truncate">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[11px] font-bold text-red-300 hover:text-white transition-colors flex-shrink-0 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5 hover:bg-red-500/20"
        >
          <RotateCcw size={11} /> Retry
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCROLL-TO-BOTTOM FAB
// ─────────────────────────────────────────────────────────

function ScrollToBottomFAB({ onClick, visible }) {
  return (
    <button
      onClick={onClick}
      className={`absolute bottom-4 right-4 w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white shadow-xl transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ChevronDown size={18} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function AIChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Conversation state ──
  const [conversationId, setConversationId] = useState(null); // null = no convo yet
  const [messages, setMessages]             = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const convInitialized = useRef(false); // prevent double-init

  // ── Input state ──
  const [input, setInput]     = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [error, setError]     = useState(null);
  const [lastUserMsg, setLastUserMsg] = useState(null); // for retry

  // ── AI Personality (loaded from Firestore user prefs) ──
  const [personality, setPersonality] = useState("warm");

  // ── Scroll ──
  const bottomRef    = useRef(null);
  const chatAreaRef  = useRef(null);
  const [showScrollFAB, setShowScrollFAB] = useState(false);
  const isNearBottom = useRef(true);

  // ── Input ref ──
  const inputRef = useRef(null);

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Load saved personality from Firestore ──
  useEffect(() => {
    if (!user) return;
    getUserPrefs(user.uid)
      .then((prefs) => { if (prefs?.personality) setPersonality(prefs.personality); })
      .catch(() => {});
  }, [user]);

  // ─────────────────────────────────────────────────────────
  // INIT: resolve conversation from URL param or create new
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || convInitialized.current) return;

    const convParam = searchParams.get("conv");

    if (convParam) {
      // Resume existing conversation — load its history
      convInitialized.current = true;
      setConversationId(convParam);
    } else {
      // No conv param — wait for user to send first message before creating
      convInitialized.current = true;
    }
  }, [user, searchParams]);

  // ─────────────────────────────────────────────────────────
  // REAL-TIME MESSAGES subscription
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !conversationId) return;

    setLoadingHistory(true);
    const unsub = subscribeMessages(user.uid, conversationId, (msgs) => {
      setMessages(msgs);
      setLoadingHistory(false);
    });
    return () => unsub();
  }, [user, conversationId]);

  // ─────────────────────────────────────────────────────────
  // SCROLL MANAGEMENT
  // ─────────────────────────────────────────────────────────
  const scrollToBottom = useCallback((behavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // Auto-scroll on new messages only if already near bottom
  useEffect(() => {
    if (isNearBottom.current) scrollToBottom("smooth");
  }, [messages, isAITyping, scrollToBottom]);

  // Track whether user has scrolled up
  const handleScroll = useCallback(() => {
    const el = chatAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isNearBottom.current = nearBottom;
    setShowScrollFAB(!nearBottom);
  }, []);

  // ─────────────────────────────────────────────────────────
  // SEND MESSAGE FLOW
  // ─────────────────────────────────────────────────────────

  /**
   * Core send: saves user msg, calls AI, saves AI reply.
   * @param {string} text  — the message text to send
   * @param {string|null} existingConvoId — pass if conversation already exists
   */
  const sendMessage = useCallback(async (text, existingConvoId) => {
    if (!user || !text.trim() || isAITyping) return;

    const messageText = text.trim();
    setInput("");
    setError(null);
    setLastUserMsg(messageText);
    isNearBottom.current = true;

    // ── 1. Ensure conversation exists ──
    let convoId = existingConvoId ?? conversationId;
    if (!convoId) {
      try {
        convoId = await createConversation(user.uid, makeTitleFromMessage(messageText));
        setConversationId(convoId);
        // Update URL so refreshing resumes the same convo
        window.history.replaceState(null, "", `/dashboard?conv=${convoId}`);
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setError("Couldn't start a new session. Please try again.");
        return;
      }
    }

    // ── 2. Optimistic UI: add user bubble immediately ──
    const optimisticUserMsg = {
      id:             `opt-u-${Date.now()}`,
      role:           "user",
      content:        messageText,
      _optimisticTs:  new Date(),
      _optimistic:    true,
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsAITyping(true);
    scrollToBottom("smooth");

    // ── 3. Persist user message to Firestore ──
    try {
      await saveMessage(user.uid, convoId, { role: "user", content: messageText });
    } catch (err) {
      console.error("Failed to save user message:", err);
      // Non-fatal: continue to AI call; Firestore will sync later
    }

    // ── 4. Build conversation history for AI context ──
    // Use the real messages array (pre-optimistic) + our new message
    const historyForAI = [
      ...messages
        .filter((m) => !m._optimistic)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: messageText },
    ];

    // ── 5. Call AI ──
    let aiReply;
    try {
      aiReply = await generateAIResponse(historyForAI, personality);
    } catch (err) {
      console.error("AI error:", err);
      setIsAITyping(false);
      // Remove the optimistic bubble so user can retry
      setMessages((prev) => prev.filter((m) => !m._optimistic));
      const isKeyError = err.message?.includes("API key") || err.message?.includes("not configured");
      setError(
        isKeyError
          ? "AI is not configured yet. Set LLM_API_KEY in .env.local to enable responses."
          : `Couldn't reach TheraFlow: ${err.message}. Try again.`
      );
      return;
    } finally {
      setIsAITyping(false);
    }

    // ── 6. Persist AI reply ──
    try {
      await saveMessage(user.uid, convoId, { role: "assistant", content: aiReply });

      // ── 7. Update lastMessage preview on conversation doc ──
      await updateConversationLastMessage(user.uid, convoId, aiReply.slice(0, 120));

      // ── 8. Auto-title: set conversation title from first user message ──
      if (messages.filter((m) => m.role === "user").length === 0) {
        await updateConversationTitle(user.uid, convoId, makeTitleFromMessage(messageText));
      }
    } catch (err) {
      console.error("Failed to save AI reply:", err);
    }
  }, [user, conversationId, messages, isAITyping, scrollToBottom, personality]);

  // ── Handle form submit ──
  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      if (input.trim()) sendMessage(input, conversationId);
    },
    [input, conversationId, sendMessage]
  );

  // ── Handle Enter key (Shift+Enter = newline) ──
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // ── Retry last message ──
  const handleRetry = useCallback(() => {
    if (!lastUserMsg) return;
    setError(null);
    sendMessage(lastUserMsg, conversationId);
  }, [lastUserMsg, conversationId, sendMessage]);

  // ── New conversation ──
  const handleNewConversation = useCallback(() => {
    convInitialized.current = false;
    setConversationId(null);
    setMessages([]);
    setError(null);
    setLastUserMsg(null);
    setInput("");
    window.history.replaceState(null, "", "/dashboard");
    convInitialized.current = true;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // ── Suggestion click ──
  const handleSuggestion = useCallback((text) => {
    setInput(text);
    inputRef.current?.focus();
  }, []);

  // ─────────────────────────────────────────────────────────
  // DATE SEPARATORS — injected between messages of different days
  // ─────────────────────────────────────────────────────────
  const messagesWithSeparators = useMemo(() => {
    const result = [];
    let lastDay  = null;
    for (const msg of messages) {
      const ts  = msg.timestamp ?? msg._optimisticTs;
      const day = ts ? toDate(ts).toDateString() : null;
      if (day && day !== lastDay) {
        result.push({ _separator: true, id: `sep-${day}`, ts });
        lastDay = day;
      }
      result.push(msg);
    }
    return result;
  }, [messages]);

  // ─────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────
  const userName   = user?.displayName?.split(" ")[0] ?? "You";
  const isNewChat  = !conversationId && messages.length === 0;
  const canSend    = input.trim().length > 0 && !isAITyping;

  // ─────────────────────────────────────────────────────────
  // LOADING AUTH
  // ─────────────────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1326]">
        <span className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-hidden">

      {/* ── Header ── */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0b1326]/90 backdrop-blur-md z-50 shrink-0">
        <div className="flex items-center gap-3">
          {/* TheraFlow branding */}
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Zap size={17} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              {conversationId ? "AI Session" : "TheraFlow"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isAITyping ? (
                <span className="text-[9px] font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-teal-400 animate-pulse" />
                  Thinking…
                </span>
              ) : (
                <span className="text-[9px] font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-teal-400 animate-pulse" />
                  Online
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New chat */}
          <button
            onClick={handleNewConversation}
            className="p-2 rounded-xl bg-slate-900/80 border border-white/5 text-slate-400 hover:text-teal-400 hover:border-teal-400/20 transition-all active:scale-95"
            title="New conversation"
          >
            <Plus size={18} />
          </button>
          {/* History link */}
          <Link
            href="/dashboard/history"
            className="p-2 rounded-xl bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Chat history"
          >
            <History size={18} />
          </Link>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400/30 to-blue-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white ml-1 select-none">
            {user?.photoURL
              ? <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
              : (user?.displayName?.charAt(0) ?? "U")}
          </div>
        </div>
      </header>

      {/* ── Chat area ── */}
      <main
        ref={chatAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-2 bg-gradient-to-b from-[#0b1326] to-[#060e20] relative"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Loading history skeleton */}
        {loadingHistory && (
          <div className="flex flex-col gap-4 pt-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className="flex gap-3 max-w-[70%]">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex-shrink-0 self-end" />
                  <div
                    className="rounded-2xl bg-slate-800/60"
                    style={{ height: "52px", width: `${120 + i * 40}px` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Welcome screen — shown before any message is sent */}
        {!loadingHistory && isNewChat && (
          <div className="flex flex-col items-center justify-center min-h-full py-12 space-y-6 text-center px-4">
            {/* Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-[2rem] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(45,212,191,0.15)]">
                <Zap size={36} fill="currentColor" className="text-teal-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center shadow-lg">
                <Sparkles size={12} className="text-slate-950" />
              </div>
            </div>
            <div className="space-y-2 max-w-[280px]">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Hi, {userName} 👋
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                I&apos;m TheraFlow, your compassionate wellness companion. I&apos;m here to listen.
              </p>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="w-full text-left px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border-white/10 transition-all active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {!loadingHistory && !isNewChat && (
          <div className="space-y-0 pb-2">
            {messagesWithSeparators.map((item) => {
              if (item._separator) {
                return (
                  <div key={item.id} className="flex justify-center my-5">
                    <span className="bg-slate-900/60 px-3 py-1 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-white/5">
                      {formatDateLabel(item.ts)}
                    </span>
                  </div>
                );
              }
              return (
                <MessageBubble
                  key={item.id}
                  message={item}
                  userName={userName}
                />
              );
            })}

            {/* AI typing indicator */}
            {isAITyping && <TypingIndicator />}

            {/* Anchor for auto-scroll */}
            <div ref={bottomRef} className="h-1" />
          </div>
        )}

        {/* Scroll to bottom FAB */}
        <ScrollToBottomFAB
          onClick={() => scrollToBottom("smooth")}
          visible={showScrollFAB}
        />
      </main>

      {/* ── Error banner ── */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={lastUserMsg ? handleRetry : null}
        />
      )}

      {/* ── Input area ── */}
      <footer className="px-4 pt-3 pb-4 bg-[#0b1326] border-t border-white/5 shrink-0">
        {/* Quick suggestions — only show when chat has started and no error */}
        {!isNewChat && messages.length <= 2 && !error && (
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
            {SUGGESTIONS.slice(0, 2).map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-slate-900/50 border border-white/5 text-[11px] text-slate-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <form onSubmit={handleSubmit}>
          <div className="relative group">
            {/* Glow backdrop */}
            <div className="absolute inset-0 bg-teal-400/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />

            <div className="relative flex items-end bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-2xl group-focus-within:border-teal-400/30 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-grow
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind…"
                rows={1}
                disabled={isAITyping}
                className="flex-1 bg-transparent py-3 pl-3 text-sm focus:outline-none text-white placeholder:text-slate-600 resize-none leading-relaxed max-h-[120px] disabled:opacity-60"
                style={{ minHeight: "44px" }}
              />
              <button
                type="submit"
                disabled={!canSend}
                className="w-10 h-10 rounded-xl bg-teal-400 text-slate-950 flex items-center justify-center hover:bg-teal-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg shadow-teal-500/20 flex-shrink-0"
              >
                <Send size={17} fill="currentColor" />
              </button>
            </div>
          </div>
          <p className="text-center text-[9px] text-slate-700 font-medium mt-2 tracking-wide">
            TheraFlow is not a substitute for professional mental health care.
          </p>
        </form>
      </footer>
    </div>
  );
}
