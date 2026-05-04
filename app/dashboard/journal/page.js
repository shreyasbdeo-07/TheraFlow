"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { saveJournalEntry, getJournalEntries, deleteJournalEntry } from "@/lib/firestore";

const PROMPTS = [
  "What made me smile today?",
  "What am I finding difficult right now?",
  "What am I grateful for this week?",
  "What do I need more of in my life?",
  "What would I tell my past self?",
];

const MOODS = ["😄", "🙂", "😐", "😔", "😞"];

export default function JournalPage() {
  const { user }                          = useAuth();
  const [entries, setEntries]             = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [writing, setWriting]             = useState(false);
  const [title, setTitle]                 = useState("");
  const [content, setContent]             = useState("");
  const [selectedMood, setMood]           = useState("");
  const [viewId, setViewId]               = useState(null);
  const [prompt, setPrompt]               = useState("");
  const [saving, setSaving]               = useState(false);

  // Load journal entries from Firestore
  useEffect(() => {
    if (!user) return;
    setLoadingEntries(true);
    getJournalEntries(user.uid)
      .then((data) => setEntries(data))
      .catch(console.error)
      .finally(() => setLoadingEntries(false));
  }, [user]);

  function startNew() {
    setTitle("");
    setContent("");
    setMood("");
    setPrompt("");
    setWriting(true);
    setViewId(null);
  }

  async function save() {
    if (!content.trim() || !user) return;
    setSaving(true);
    try {
      await saveJournalEntry(user.uid, {
        title: title.trim() || "Untitled entry",
        body:  content.trim(),
      });
      // Reload entries from Firestore
      const updated = await getJournalEntries(user.uid);
      setEntries(updated);
      setWriting(false);
    } catch (err) {
      console.error("Failed to save journal entry:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id) {
    if (!user) return;
    try {
      await deleteJournalEntry(user.uid, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (viewId === id) setViewId(null);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  }

  const viewed = entries.find((e) => e.id === viewId);

  // Format Firestore timestamp to readable date
  function formatDate(createdAt) {
    if (!createdAt) return "";
    const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone-100 bg-white/60 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-800">Journal</h1>
          <p className="text-stone-400 text-xs">
            {loadingEntries ? "Loading…" : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
          </p>
        </div>
        <button onClick={startNew} className="btn-primary text-sm py-2 px-4">
          + New Entry
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Entries list */}
        <div className={`${viewId || writing ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 border-r border-stone-100 overflow-y-auto bg-white/40`}>
          {loadingEntries ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 text-stone-400">
              <div className="text-4xl mb-3">📓</div>
              <p className="text-sm">No entries yet. Start writing!</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {entries.map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setViewId(e.id); setWriting(false); }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${viewId === e.id ? "bg-sage-50 border-sage-200" : "bg-white border-stone-100 hover:border-stone-200"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-stone-400">{formatDate(e.createdAt)}</span>
                  </div>
                  <div className="font-medium text-stone-700 text-sm truncate">{e.title}</div>
                  <div className="text-xs text-stone-400 mt-1 line-clamp-2">{e.body}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail / write area */}
        <div className={`${viewId || writing ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-y-auto`}>
          {writing ? (
            <div className="flex-1 p-6 max-w-2xl w-full mx-auto">
              {/* Prompt suggestion */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    const p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
                    setPrompt(p);
                    if (!title) setTitle(p);
                  }}
                  className="text-xs text-sage-500 hover:text-sage-700 underline transition-colors"
                >
                  ✨ Give me a writing prompt
                </button>
                {prompt && <p className="text-xs text-stone-400 mt-1 italic">{prompt}</p>}
              </div>

              {/* Mood */}
              <div className="flex gap-2 mb-4">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`text-2xl p-1 rounded-xl transition-all ${selectedMood === m ? "scale-125" : "opacity-50 hover:opacity-80"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title…"
                className="w-full text-xl font-display font-bold text-stone-800 bg-transparent border-none outline-none placeholder-stone-300 mb-4"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely. This is your safe space…"
                rows={14}
                className="w-full bg-transparent border-none outline-none resize-none text-sm text-stone-700 leading-relaxed placeholder-stone-300"
                autoFocus
              />

              <div className="flex gap-3 pt-4 border-t border-stone-100 mt-4">
                <button
                  onClick={save}
                  disabled={!content.trim() || saving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Entry"
                  )}
                </button>
                <button onClick={() => setWriting(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : viewed ? (
            <div className="flex-1 p-6 max-w-2xl w-full mx-auto">
              <button
                onClick={() => setViewId(null)}
                className="md:hidden inline-flex items-center gap-1 text-sm text-stone-400 hover:text-sage-600 mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-stone-400">{formatDate(viewed.createdAt)}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-stone-800">{viewed.title}</h2>
                </div>
                <button
                  onClick={() => deleteEntry(viewed.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:bg-blush-50 hover:text-blush-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{viewed.body}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-stone-300">
              <div className="text-5xl mb-3">📓</div>
              <p className="text-sm">Select an entry or write something new</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
