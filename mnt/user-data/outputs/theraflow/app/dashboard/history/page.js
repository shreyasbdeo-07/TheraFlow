"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getConversations, deleteConversation } from "@/lib/firestore";
import { format } from "date-fns";

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser]             = useState(null);
  const [conversations, setConvos]  = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getConversations(user.uid);
      setConvos(data);
      setLoading(false);
    })();
  }, [user]);

  async function handleDelete(convoId) {
    if (!user) return;
    await deleteConversation(user.uid, convoId);
    setConvos((prev) => prev.filter((c) => c.id !== convoId));
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-stone-800">
            Chat History
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-primary text-sm py-2 px-4"
          >
            + New Chat
          </button>
        </div>

        {loading ? (
          <div className="text-stone-300 text-sm">Loading…</div>
        ) : conversations.length === 0 ? (
          <div className="glass rounded-4xl p-10 text-center shadow-soft animate-fade-in">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-stone-500 mb-4">You haven&apos;t had any conversations yet.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary"
            >
              Start your first chat
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className="glass rounded-3xl px-5 py-4 shadow-soft flex items-center justify-between gap-4 group hover:shadow-card transition-shadow duration-200"
              >
                <button
                  className="flex-1 text-left min-w-0"
                  onClick={() => router.push(`/dashboard?convo=${convo.id}`)}
                >
                  <div className="font-medium text-stone-800 text-sm truncate">
                    {convo.title || "Conversation"}
                  </div>
                  <div className="text-stone-400 text-xs mt-0.5">
                    {convo.createdAt
                      ? format(
                          convo.createdAt.toDate?.() ?? new Date(convo.createdAt),
                          "MMMM d, yyyy · h:mm a"
                        )
                      : ""}
                  </div>
                </button>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => router.push(`/dashboard?convo=${convo.id}`)}
                    className="btn-ghost text-xs py-1.5 px-3"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(convo.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:text-blush-400 hover:bg-blush-50 transition-colors"
                    aria-label="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
