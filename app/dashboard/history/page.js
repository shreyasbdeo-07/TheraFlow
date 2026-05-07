"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getConversations, deleteConversation } from "@/lib/firestore";

export default function HistoryPage() {
  const { user }                  = useAuth();
  const router                    = useRouter();
  const [convos, setConvos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fsError, setFsError]     = useState("");
  const [search, setSearch]       = useState("");
  const [deleting, setDeleting]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setFsError("");
    getConversations(user.uid)
      .then(setConvos)
      .catch((err) => {
        console.error("[History] Firestore error:", err);
        setFsError(err.message || "Failed to load history.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id) {
    if (!user) return;
    setDeleting(id);
    try {
      await deleteConversation(user.uid, id);
      setConvos((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  }

  // Format Firestore timestamp
  function formatDate(createdAt) {
    if (!createdAt) return "";
    const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const filtered = convos.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone-100 bg-white/60 backdrop-blur-sm flex-shrink-0">
        <h1 className="font-display text-2xl font-bold text-stone-800 mb-3">Chat History</h1>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="w-8 h-8 border-4 border-stone-100 border-t-sage-400 rounded-full animate-spin"
              style={{ borderTopColor: "var(--theme-primary)" }} />
          </div>
        ) : fsError ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="text-sm font-medium text-red-400 mb-1">Couldn't load history</p>
            <p className="text-xs text-stone-400 max-w-xs">{fsError}</p>
            <p className="text-xs text-stone-300 mt-2">Check your Firestore security rules in the Firebase Console.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-stone-300 py-16">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-sm font-medium text-stone-400 mb-1">
              {search ? "No conversations match your search." : "No conversations yet."}
            </p>
            {!search && (
              <p className="text-xs text-stone-300">
                Start a chat and your conversations will appear here.
              </p>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {filtered.map((convo) => (
              <div
                key={convo.id}
                className="glass rounded-3xl p-5 shadow-soft border border-white/60 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => router.push(`/dashboard?convoId=${convo.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sage-100 to-lavender-100 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                      🌿
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-700 truncate">{convo.title || "Untitled conversation"}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{formatDate(convo.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmId(convo.id); }}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:bg-blush-50 hover:text-blush-400 transition-all"
                      aria-label="Delete conversation"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                  <svg className="w-3.5 h-3.5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs text-stone-300">Tap to continue</span>
                  <span className="ml-auto text-xs group-hover:underline transition-colors"
                    style={{ color: "var(--theme-primary)" }}>
                    Continue →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm">
          <div className="glass rounded-4xl p-8 max-w-sm w-full shadow-float text-center animate-fade-in">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="font-display text-xl font-bold text-stone-800 mb-2">Delete conversation?</h3>
            <p className="text-stone-400 text-sm mb-6">This can&apos;t be undone. All messages in this chat will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="btn-secondary flex-1 justify-center"
                disabled={!!deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={!!deleting}
                className="flex-1 justify-center flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white text-sm font-medium transition-all disabled:opacity-60"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
