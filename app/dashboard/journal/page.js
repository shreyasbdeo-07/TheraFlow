"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Zap, Search, ChevronLeft, Plus, Edit3, BookOpen,
  Trash2, X, Check, Loader2, AlertTriangle, Sparkles,
  Calendar, Clock, FileText, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import {
  saveJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  subscribeJournalEntries,
} from "@/lib/firestore";

// ─────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────

/**
 * Convert a Firestore Timestamp or JS Date to a JS Date safely.
 */
function toDate(ts) {
  if (!ts) return new Date();
  if (ts.toDate) return ts.toDate();          // Firestore Timestamp
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

function formatRelativeGroup(date) {
  const d = toDate(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday - 86400000);
  const startOfEntry = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (startOfEntry.getTime() === startOfToday.getTime()) return "Today";
  if (startOfEntry.getTime() === startOfYesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(date) {
  const d = toDate(date);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatFullDate(date) {
  const d = toDate(date);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function groupEntriesByDay(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const key = formatRelativeGroup(entry.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return groups;
}

// ─────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────

const Spinner = ({ size = 18, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

/** Word count for a plain text body */
function wordCount(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─────────────────────────────────────────────────────────
// CONFIRM DELETE MODAL
// ─────────────────────────────────────────────────────────

function DeleteModal({ entry, onCancel, onConfirm, isDeleting }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-[#0e1a2e] border border-red-500/20 rounded-[2rem] p-6 space-y-5 shadow-2xl animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Delete Entry?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              "<span className="text-slate-300">{entry.title || "Untitled"}</span>" will be permanently deleted.
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
// ENTRY EDITOR (create / edit)
// ─────────────────────────────────────────────────────────

function EntryEditor({ entry, onClose, onSave, isSaving }) {
  const isNew = !entry;
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const titleRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Focus the right field on mount
    if (isNew) titleRef.current?.focus();
    else textareaRef.current?.focus();
  }, [isNew]);

  const canSave = title.trim().length > 0 || body.trim().length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSave || isSaving) return;
    onSave({ title: title.trim() || "Untitled", body: body.trim() });
  }

  // Auto-grow textarea
  function handleBodyChange(e) {
    setBody(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  const wc = wordCount(body);

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-[#0b1326]">
      {/* Editor Header */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 backdrop-blur-md bg-[#0b1326]/80 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
          disabled={isSaving}
        >
          <X size={22} />
        </button>
        <span className="text-sm font-bold text-white tracking-[0.08em] uppercase">
          {isNew ? "New Entry" : "Edit Entry"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!canSave || isSaving}
          className="flex items-center gap-2 bg-teal-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg shadow-teal-500/20"
        >
          {isSaving ? <Spinner size={13} /> : <Check size={13} />}
          {isSaving ? "Saving…" : "Save"}
        </button>
      </header>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 space-y-4 relative">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Meta info for existing entries */}
        {!isNew && entry?.createdAt && (
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            <Calendar size={10} />
            <span>{formatFullDate(entry.createdAt)}</span>
            {entry.updatedAt && (
              <>
                <span className="text-slate-700">·</span>
                <Clock size={10} />
                <span>Updated {formatTime(entry.updatedAt)}</span>
              </>
            )}
          </div>
        )}

        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title…"
          maxLength={120}
          style={{ color: 'white' }}
          className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-700 focus:outline-none leading-snug"
        />

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-white/10 to-transparent" />

        {/* Body */}
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleBodyChange}
          placeholder="Start writing your thoughts…"
          rows={10}
          style={{ color: 'rgb(203 213 225)' }}
          className="w-full bg-transparent text-[15px] text-slate-300 placeholder-slate-700 focus:outline-none leading-relaxed resize-none min-h-[200px]"
        />
      </div>

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 h-10 flex items-center justify-between px-5 border-t border-white/5 bg-[#0b1326]/90 backdrop-blur-md text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
        <span>{wc} {wc === 1 ? "word" : "words"}</span>
        <span>{body.length} chars</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// JOURNAL ENTRY CARD
// ─────────────────────────────────────────────────────────

function JournalCard({ entry, onEdit, onDelete }) {
  const preview = (entry.body ?? "").slice(0, 140);
  const hasMore = (entry.body ?? "").length > 140;
  const wc = wordCount(entry.body);

  return (
    <div className="group bg-slate-900/40 border border-white/5 rounded-[1.75rem] overflow-hidden hover:bg-slate-800/40 hover:border-white/10 transition-all duration-200">
      {/* Card Top */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">
              {formatTime(entry.createdAt)} · {formatFullDate(entry.createdAt)}
            </p>
            <h4 className="text-sm font-bold text-white leading-snug truncate">
              {entry.title || "Untitled"}
            </h4>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(entry)}
              className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-400/20 transition-all"
              title="Edit entry"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-400/20 transition-all"
              title="Delete entry"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <p className="text-xs text-slate-400 leading-relaxed mt-3 italic">
            &ldquo;{preview}{hasMore ? "…" : ""}&rdquo;
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
        <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1.5">
          <FileText size={9} />
          {wc} {wc === 1 ? "word" : "words"}
        </span>
        <button
          onClick={() => onEdit(entry)}
          className="text-[10px] font-bold text-slate-600 hover:text-teal-400 transition-colors flex items-center gap-1 uppercase tracking-wider"
        >
          Read more <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────

function EmptyState({ hasSearch, searchQuery, onNew }) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center text-center py-20 space-y-4 px-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-600">
          <Search size={28} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">No results found</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
            No entries match &ldquo;<span className="text-slate-400">{searchQuery}</span>&rdquo;. Try a different keyword.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-20 space-y-6 px-6">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-[2rem] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.1)]">
          <BookOpen size={36} strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/30">
          <Sparkles size={12} className="text-slate-950" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white tracking-tight">Start Your Journey</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
          Your journal is empty. Write your first entry — thoughts, reflections, anything on your mind.
        </p>
      </div>

      <button
        onClick={onNew}
        className="flex items-center gap-2 bg-teal-400 text-slate-950 font-bold py-3 px-6 rounded-2xl text-sm hover:bg-teal-300 active:scale-95 transition-all shadow-xl shadow-teal-500/20"
      >
        <Plus size={16} />
        Write First Entry
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ── State ──
  const [entries, setEntries]               = useState([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchOpen, setSearchOpen]         = useState(false);
  const searchRef = useRef(null);

  // Editor
  const [editorOpen, setEditorOpen]         = useState(false);
  const [editingEntry, setEditingEntry]     = useState(null); // null = new
  const [isSaving, setIsSaving]             = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [isDeleting, setIsDeleting]         = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Real-time Firestore listener ──
  useEffect(() => {
    if (!user) return;
    setFirestoreLoading(true);
    const unsubscribe = subscribeJournalEntries(user.uid, (data) => {
      setEntries(data);
      setFirestoreLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // ── Search auto-focus ──
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // ── Filtered + grouped entries ──
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        (e.title ?? "").toLowerCase().includes(q) ||
        (e.body ?? "").toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  const groupedEntries = useMemo(
    () => groupEntriesByDay(filteredEntries),
    [filteredEntries]
  );

  // ── Stats ──
  const totalEntries = entries.length;
  const totalWords   = entries.reduce((sum, e) => sum + wordCount(e.body), 0);

  // Compute writing streak (days with at least 1 entry)
  const streak = useMemo(() => {
    const daySet = new Set(
      entries.map((e) => {
        const d = toDate(e.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      if (daySet.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) {
        count++;
      } else if (i > 0) break; // Allow today to be missed
    }
    return count;
  }, [entries]);

  // ── Handlers ──
  function openNew() {
    setEditingEntry(null);
    setEditorOpen(true);
  }

  function openEdit(entry) {
    setEditingEntry(entry);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingEntry(null);
  }

  async function handleSave({ title, body }) {
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingEntry) {
        await updateJournalEntry(user.uid, editingEntry.id, { title, body });
      } else {
        await saveJournalEntry(user.uid, { title, body });
      }
      closeEditor();
    } catch (err) {
      console.error("Journal save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteJournalEntry(user.uid, deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Journal delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Loading / auth ──
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1326]">
        <span className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLoading = firestoreLoading;
  const hasSearch = searchQuery.trim().length > 0;

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden pb-28">

      {/* Full-screen editor overlay */}
      {editorOpen && (
        <EntryEditor
          entry={editingEntry}
          onClose={closeEditor}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          entry={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/5 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full" style={{ animationDelay: "2s" }} />
      </div>

      {/* ── Header ── */}
      <header className="h-16 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-md bg-[#0b1326]/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors active:scale-95">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-[0.1em] uppercase leading-none">Journal</h1>
            {!isLoading && (
              <span className="text-[9px] text-slate-500 font-medium tracking-wide mt-0.5">
                {totalEntries} {totalEntries === 1 ? "entry" : "entries"} · {totalWords.toLocaleString()} words
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
          {/* New entry */}
          <button
            onClick={openNew}
            className="ml-1 flex items-center gap-2 bg-teal-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs hover:bg-teal-300 active:scale-95 transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 pt-6 space-y-6 relative z-10">

        {/* Search bar (expandable) */}
        <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="relative group pb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={16} />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or content…"
              style={{ color: 'white' }}
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-teal-500/30 focus:ring-1 focus:ring-teal-400/20 transition-all placeholder-slate-600 backdrop-blur-sm"
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

        {/* Stats bar */}
        {!isLoading && totalEntries > 0 && (
          <section className="flex gap-3">
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex-1 backdrop-blur-md">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 w-fit mb-2">
                <BookOpen size={13} />
              </div>
              <div className="text-lg font-bold text-white tracking-tight">{totalEntries}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Total Entries</div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex-1 backdrop-blur-md">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 w-fit mb-2">
                <FileText size={13} />
              </div>
              <div className="text-lg font-bold text-white tracking-tight">{totalWords.toLocaleString()}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Words Written</div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex-1 backdrop-blur-md">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 w-fit mb-2">
                <Zap size={13} fill="currentColor" />
              </div>
              <div className="text-lg font-bold text-white tracking-tight">{streak}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Day Streak</div>
            </div>
          </section>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-8 pt-4">
            {[1, 2].map((g) => (
              <div key={g} className="space-y-4">
                <div className="h-3 w-20 bg-slate-800/80 rounded-full animate-pulse" />
                {[1, 2].map((c) => (
                  <div key={c} className="bg-slate-900/40 border border-white/5 rounded-[1.75rem] p-5 space-y-3 animate-pulse">
                    <div className="h-2.5 w-24 bg-slate-800/80 rounded-full" />
                    <div className="h-4 w-3/4 bg-slate-800/60 rounded-full" />
                    <div className="space-y-2 pt-1">
                      <div className="h-2.5 bg-slate-800/50 rounded-full" />
                      <div className="h-2.5 w-4/5 bg-slate-800/50 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          /* Empty state */
          <EmptyState hasSearch={hasSearch} searchQuery={searchQuery} onNew={openNew} />
        ) : (
          /* Journal timeline */
          <section className="space-y-8">
            {Array.from(groupedEntries.entries()).map(([day, dayEntries]) => {
              const isToday = day === "Today";
              return (
                <div key={day} className="space-y-4">
                  {/* Day group header */}
                  <div className="flex items-center gap-3 px-1">
                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isToday ? "text-teal-400" : "text-slate-500"}`}>
                      {day}
                    </span>
                    <div className={`h-[1px] flex-1 bg-gradient-to-r ${isToday ? "from-teal-400/20" : "from-white/5"} to-transparent`} />
                    <span className="text-[9px] font-semibold text-slate-700">
                      {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                  {/* Entry cards */}
                  <div className="space-y-3">
                    {dayEntries.map((entry) => (
                      <JournalCard
                        key={entry.id}
                        entry={entry}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Search result count */}
            {hasSearch && (
              <p className="text-center text-[11px] text-slate-600 font-medium pb-4">
                {filteredEntries.length} result{filteredEntries.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </section>
        )}

      </main>

      {/* ── Floating Action Button ── */}
      {!editorOpen && (
        <button
          onClick={openNew}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-teal-400 text-slate-950 shadow-2xl shadow-teal-500/40 flex items-center justify-center hover:scale-110 hover:bg-teal-300 active:scale-90 transition-all z-50"
          title="New journal entry"
        >
          <Plus size={28} />
        </button>
      )}

    </div>
  );
}
