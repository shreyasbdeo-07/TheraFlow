"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_HISTORY = [
  {
    id: "1",
    title: "Dealing with exam anxiety",
    preview: "I've been feeling really overwhelmed with all the exams coming up...",
    date: "Today, 9:14 AM",
    messages: 12,
    mood: "😔",
  },
  {
    id: "2",
    title: "Processing a difficult conversation",
    preview: "My friend said something that really hurt me yesterday and I can't stop thinking about it...",
    date: "Yesterday, 11:32 PM",
    messages: 8,
    mood: "😐",
  },
  {
    id: "3",
    title: "Celebrating small wins",
    preview: "I wanted to share that I finally submitted my project on time! It felt impossible but I did it.",
    date: "Apr 4, 2:00 PM",
    messages: 5,
    mood: "😄",
  },
  {
    id: "4",
    title: "Sleep and overthinking",
    preview: "I lie awake every night and my brain just won't turn off. I keep replaying scenarios...",
    date: "Apr 2, 1:15 AM",
    messages: 15,
    mood: "😞",
  },
  {
    id: "5",
    title: "First session — Hello!",
    preview: "Hi there, I'm TheraFlow. How are you feeling today? You can share as much or as little...",
    date: "Mar 31, 3:45 PM",
    messages: 6,
    mood: "🙂",
  },
];

export default function HistoryPage() {
  const router  = useRouter();
  const [items, setItems] = useState(MOCK_HISTORY);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const filtered = items.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.preview.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id) {
    setItems((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-stone-300 py-16">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-sm">No conversations found.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {filtered.map((convo) => (
              <div
                key={convo.id}
                className="glass rounded-3xl p-5 shadow-soft border border-white/60 hover:border-sage-200 hover:shadow-card transition-all group cursor-pointer"
                onClick={() => router.push("/dashboard")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{convo.mood}</div>
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-700 truncate">{convo.title}</div>
                      <div className="text-xs text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">{convo.preview}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs text-stone-300 whitespace-nowrap">{convo.date}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleting(convo.id); }}
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
                  <span className="text-xs text-stone-300">{convo.messages} messages</span>
                  <span className="ml-auto text-xs text-sage-500 group-hover:underline">Continue →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm">
          <div className="glass rounded-4xl p-8 max-w-sm w-full shadow-float text-center animate-fade-in">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="font-display text-xl font-bold text-stone-800 mb-2">Delete conversation?</h3>
            <p className="text-stone-400 text-sm mb-6">This can&apos;t be undone. Your chat history will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleting)} className="flex-1 justify-center btn-primary bg-blush-500 hover:bg-blush-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
