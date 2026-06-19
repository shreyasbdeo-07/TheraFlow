"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Search, History, MessageSquare, Trash2,
  X, AlertTriangle, Loader2, BarChart2, Clock,
  Plus, Zap, ArrowRight, MessagesSquare,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { subscribeConversations, deleteConversation } from "@/lib/firestore";

// ─────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────

function toDate(ts) {
  if (!ts) return new Date(0);
  if (ts.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

/**
 * Returns a human-friendly relative timestamp label.
 */
function formatRelativeTime(ts) {
  const date = toDate(ts);
  const now  = new Date();
  const diff = now - date; // ms

  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  <  1)  return "Just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  ===  1) return "Yesterday";
  if (days  <  7)  return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Groups conversations by relative day label.
 */
function groupByDay(convos) {
  const groups = new Map();
  const now    = new Date();
  const sod    = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const todayMs     = sod(now);
  const yesterdayMs = todayMs - 86_400_000;

  for (const c of convos) {
    const d   = toDate(c.createdAt);
    const dMs = sod(d);
    let key;
    if (dMs === todayMs)     key = "Today";
    else if (dMs === yesterdayMs) key = "Yesterday";
    else key = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  return groups;
}

// ─────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────

const Spinner = ({ size = 18, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

// ─────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────

function DeleteModal({ convo, onCancel, onConfirm, isDeleting }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-[#0e1a2e] border border-red-500/20 rounded-[2rem] p-6 space-y-5 shadow-2xl animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Delete Conversation?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              "<span className="text-slate-300">{convo.title || "Untitled"}</span>" and all its messages will be permanently deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500 disabled:opacity-50 transition-all"
          >
            {isDeleting ? <Spinner size={14} /> : <Trash2 size={14} />}
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CONVERSATION CARD
// ─────────────────────────────────────────────────────────

function ConversationCard({ convo, onDelete, deletingId }) {
  const isDeleting = deletingId === convo.id;
  const preview    = convo.lastMessage?.trim() || "No messages yet.";
  const isLong     = preview.length > 100;

  return (
    <div className={`group relative bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden transition-all duration-200 hover:bg-slate-800/40 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Teal left accent stripe — visible on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center rounded-r-full" />

      <Link
        href={`/dashboard?conv=${convo.id}`}
        className="block p-5 pr-16 focus:outline-none"
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar icon */}
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
              <MessageSquare size={18} />
            </div>
            {/* Title */}
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors truncate leading-snug">
                {convo.title || "Untitled conversation"}
              </h4>
              <p className="text-[10px] font-semibold text-slate-600 mt-0.5 flex items-center gap-1">
                <Clock size={9} />
                {formatRelativeTime(convo.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pl-13 italic">
          {isLong ? `"${preview.slice(0, 100)}…"` : `"${preview}"`}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pl-13">
          <span className="text-[10px] font-semibold text-teal-400/70 flex items-center gap-1.5 group-hover:text-teal-400 transition-colors">
            Continue chat <ArrowRight size={10} />
          </span>
        </div>
      </Link>

      {/* Delete button — floats top-right, appears on hover */}
      <button
        onClick={(e) => { e.preventDefault(); onDelete(convo); }}
        className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 hover:!text-red-400 hover:!border-red-400/20 hover:!bg-red-400/5 transition-all"
        title="Delete conversation"
      >
        {isDeleting ? <Spinner size={13} /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────

function EmptyState({ hasSearch, searchQuery }) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center text-center py-16 space-y-4 px-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-600">
          <Search size={24} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">No results found</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
            No conversations match{" "}
            <span className="text-slate-400">&ldquo;{searchQuery}&rdquo;</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-16 space-y-6 px-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-[2rem] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.1)]">
          <MessagesSquare size={36} strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/30">
          <Zap size={12} fill="currentColor" className="text-slate-950" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white tracking-tight">No Conversations Yet</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
          Start chatting with TheraFlow. Each session is saved here automatically.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 bg-teal-400 text-slate-950 font-bold py-3 px-6 rounded-2xl text-sm hover:bg-teal-300 active:scale-95 transition-all shadow-xl shadow-teal-500/20"
      >
        <Plus size={16} />
        Start a Conversation
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-8 pt-2">
      {[1, 2].map((g) => (
        <div key={g} className="space-y-3">
          <div className="h-2.5 w-16 bg-slate-800/80 rounded-full animate-pulse" />
          {[1, 2, 3].slice(0, g + 1).map((c) => (
            <div
              key={c}
              className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-2/3 bg-slate-800/80 rounded-full" />
                  <div className="h-2 w-20 bg-slate-800/50 rounded-full" />
                </div>
              </div>
              <div className="space-y-2 pl-13">
                <div className="h-2.5 bg-slate-800/50 rounded-full" />
                <div className="h-2.5 w-4/5 bg-slate-800/50 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────────────────

function StatsBar({ conversations }) {
  const total = conversations.length;

  // Conversations started today
  const todayStr = new Date().toDateString();
  const todayCount = conversations.filter(
    (c) => toDate(c.createdAt).toDateString() === todayStr
  ).length;

  // Oldest conversation date → total days using app
  const oldest = conversations.length
    ? toDate(conversations[conversations.length - 1].createdAt)
    : null;
  const daysActive = oldest
    ? Math.max(1, Math.round((new Date() - oldest) / 86_400_000))
    : 0;

  const stats = [
    { icon: History,     label: "Total",        value: total      },
    { icon: MessageSquare, label: "Today",      value: todayCount },
    { icon: BarChart2,   label: "Days Active",  value: daysActive },
  ];

  return (
    <section className="flex gap-3">
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex-1 backdrop-blur-md"
        >
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 w-fit mb-2">
            <Icon size={13} />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">{value}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            {label}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function ChatHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ── Data ──
  const [conversations, setConversations]     = useState([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);

  // ── Search ──
  const [searchQuery, setSearchQuery]         = useState("");
  const [searchOpen, setSearchOpen]           = useState(false);
  const searchRef = useRef(null);

  // ── Delete modal ──
  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [deletingId, setDeletingId]           = useState(null);

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Real-time Firestore subscription ──
  useEffect(() => {
    if (!user) return;
    setFirestoreLoading(true);
    const unsub = subscribeConversations(user.uid, (data) => {
      setConversations(data);
      setFirestoreLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ── Auto-focus search ──
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // ── Filtered conversations ──
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        (c.title ?? "").toLowerCase().includes(q) ||
        (c.lastMessage ?? "").toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  // ── Delete handler ──
  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !user) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      await deleteConversation(user.uid, deleteTarget.id);
    } catch (err) {
      console.error("Delete conversation error:", err);
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, user]);

  // ── Loading / auth ──
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1326]">
        <span className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasSearch  = searchQuery.trim().length > 0;
  const isEmpty    = filtered.length === 0;

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-400/30 overflow-x-hidden pb-12">

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          convo={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={!!deletingId}
        />
      )}

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-blue-400/5 blur-[120px] rounded-full" />
      </div>

      {/* ── Header ── */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0b1326]/80 backdrop-blur-md z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-[0.1em] uppercase leading-none">
              History
            </h1>
            {!firestoreLoading && (
              <span className="text-[9px] text-slate-500 font-medium tracking-wide mt-0.5">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search toggle */}
          <button
            onClick={() => {
              setSearchOpen((o) => !o);
              if (searchOpen) setSearchQuery("");
            }}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
              searchOpen
                ? "bg-teal-400/10 border-teal-400/20 text-teal-400"
                : "bg-slate-900/80 border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Search size={18} />
          </button>
          {/* New chat */}
          <Link
            href="/dashboard"
            className="ml-1 flex items-center gap-2 bg-teal-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs hover:bg-teal-300 active:scale-95 transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Chat</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 pt-6 space-y-6 relative z-10">

        {/* Search bar (expandable) */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="relative group pb-2">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors"
              size={16}
            />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or message preview…"
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-10 text-sm focus:outline-none focus:border-teal-500/30 focus:ring-1 focus:ring-teal-400/20 transition-all placeholder-slate-600 backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Stats bar (only when data is loaded and there are conversations) */}
        {!firestoreLoading && conversations.length > 0 && (
          <StatsBar conversations={conversations} />
        )}

        {/* ── Content ── */}
        {firestoreLoading ? (
          <Skeleton />
        ) : isEmpty ? (
          <EmptyState hasSearch={hasSearch} searchQuery={searchQuery} />
        ) : (
          <section className="space-y-8 pb-6">
            {Array.from(grouped.entries()).map(([day, dayConvos]) => {
              const isToday = day === "Today";
              return (
                <div key={day} className="space-y-3">
                  {/* Day group header */}
                  <div className="flex items-center gap-3 px-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                        isToday ? "text-teal-400" : "text-slate-500"
                      }`}
                    >
                      {day}
                    </span>
                    <div
                      className={`h-[1px] flex-1 bg-gradient-to-r ${
                        isToday ? "from-teal-400/20" : "from-white/5"
                      } to-transparent`}
                    />
                    <span className="text-[9px] font-semibold text-slate-700">
                      {dayConvos.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {dayConvos.map((convo) => (
                      <ConversationCard
                        key={convo.id}
                        convo={convo}
                        onDelete={setDeleteTarget}
                        deletingId={deletingId}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Search result count */}
            {hasSearch && (
              <p className="text-center text-[11px] text-slate-600 font-medium pb-2">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;
                {searchQuery}&rdquo;
              </p>
            )}

            {/* Growth CTA — only shown when there are real conversations and no active search */}
            {!hasSearch && conversations.length >= 3 && (
              <section className="bg-gradient-to-br from-teal-400/10 to-blue-500/5 border border-teal-400/20 rounded-[2.5rem] p-7 text-center space-y-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-teal-400/10 blur-[40px] rounded-full pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 mx-auto">
                  <BarChart2 size={26} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white tracking-tight">Reflect on Your Growth</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-[240px] mx-auto">
                    You have{" "}
                    <span className="text-teal-400 font-semibold">{conversations.length} conversations</span>{" "}
                    logged. Every session is a step toward a more resilient you.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white/5 text-white font-bold text-xs border border-white/10 hover:bg-white/10 transition-all"
                >
                  Start New Session <ArrowRight size={13} />
                </Link>
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
