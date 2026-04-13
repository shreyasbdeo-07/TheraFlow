"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveJournalEntry, getJournalEntries, deleteJournalEntry } from "@/lib/firestore";
import { format } from "date-fns";

export default function JournalPage() {
  const [user, setUser]       = useState(null);
  const [text, setText]       = useState("");
  const [title, setTitle]     = useState("");
  const [entries, setEntries] = useState([]);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // for read view

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getJournalEntries(user.uid);
      setEntries(data);
      setLoading(false);
    })();
  }, [user]);

  async function handleSave() {
    if (!text.trim() || !user) return;
    setSaving(true);
    try {
      await saveJournalEntry(user.uid, {
        title: title.trim() || "Untitled reflection",
        body: text.trim(),
        createdAt: new Date(),
      });
      setText("");
      setTitle("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      const data = await getJournalEntries(user.uid);
      setEntries(data);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entryId) {
    if (!user) return;
    await deleteJournalEntry(user.uid, entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    if (selected?.id === entryId) setSelected(null);
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-stone-800">
          Personal Journal
        </h1>
        <p className="text-stone-400 text-sm -mt-3">
          A private space for your thoughts. Write freely — no one else can read this.
        </p>

        {/* ── New entry ──────────────────────────────────── */}
        <div className="glass rounded-4xl p-7 shadow-soft animate-fade-in">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this reflection a title… (optional)"
            className="input-field mb-3 font-display text-lg font-semibold placeholder:font-body placeholder:font-normal"
          />
          <textarea
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind? There's no right or wrong way to journal — just let it flow…"
            className="input-field resize-none leading-relaxed mb-4"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-300">
              {text.length > 0 ? `${text.length} characters` : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Reflection"}
            </button>
          </div>
        </div>

        {/* ── Previous entries ────────────────────────────── */}
        <div className="glass rounded-4xl p-7 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-stone-800 mb-4">
            Previous Reflections
          </h2>

          {loading ? (
            <p className="text-stone-300 text-sm">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-stone-400 text-sm">
              No entries yet. Write your first reflection above!
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id}>
                  <button
                    onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                    className="w-full text-left flex items-start justify-between gap-3 bg-stone-50 hover:bg-sage-50 rounded-2xl px-4 py-4 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-800 text-sm truncate">
                        {entry.title}
                      </div>
                      <div className="text-stone-400 text-xs mt-0.5">
                        {entry.createdAt
                          ? format(entry.createdAt.toDate?.() ?? new Date(entry.createdAt), "MMMM d, yyyy · h:mm a")
                          : ""}
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-stone-300 flex-shrink-0 mt-0.5 transition-transform ${selected?.id === entry.id ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded entry */}
                  {selected?.id === entry.id && (
                    <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4 mt-1 animate-fade-in">
                      <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                        {entry.body}
                      </p>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-blush-400 hover:text-blush-600 transition-colors"
                      >
                        Delete this entry
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
