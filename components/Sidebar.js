"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getConversations, deleteConversation } from "@/lib/firestore";

// ── Nav items ─────────────────────────────────────────────
const NAV = [
  { icon: "✨", label: "New Chat",    href: "/dashboard",          exact: true },
  { icon: "🌤️", label: "Daily Check-In", href: "/dashboard/mood"  },
  { icon: "📊", label: "Mood Tracker",href: "/dashboard/mood"     },
  { icon: "📓", label: "Journal",     href: "/dashboard/journal"  },
  { icon: "💬", label: "Chat History",href: "/dashboard/history"  },
  { icon: "⚙️", label: "Settings",   href: "/dashboard/settings" },
];

export default function Sidebar({ user, onClose }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const activeConvo  = searchParams.get("convo");

  const [convos, setConvos]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Load recent conversations for the sidebar list
  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getConversations(user.uid);
      setConvos(data.slice(0, 15));
      setLoading(false);
    })();
  }, [user]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  async function handleDeleteConvo(e, convoId) {
    e.stopPropagation();
    await deleteConversation(user.uid, convoId);
    setConvos((prev) => prev.filter((c) => c.id !== convoId));
    if (activeConvo === convoId) router.push("/dashboard");
  }

  function isActive(href, exact = false) {
    if (exact) return pathname === href && !activeConvo;
    return pathname.startsWith(href) && pathname !== "/dashboard";
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-white/80 backdrop-blur-xl border-r border-stone-100 shadow-soft">
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-stone-100">
        <Link href="/" className="font-display text-lg font-bold text-stone-800">
          TheraFlow
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── User greeting ──────────────────────────────────── */}
      {user && (
        <div className="px-5 py-3 border-b border-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-sage-200 to-lavender-200 flex items-center justify-center text-sm font-bold text-stone-600">
              {user.displayName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-stone-700 truncate">
                {user.displayName ?? "You"}
              </div>
              <div className="text-xs text-stone-400 truncate">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main nav ───────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            onClick={onClose}
            className={`sidebar-link ${isActive(item.href, item.exact) ? "active" : ""}`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {/* ── Recent conversations ────────────────────────── */}
        {convos.length > 0 && (
          <div className="pt-4 pb-1">
            <div className="px-3 text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Recent
            </div>
            <div className="space-y-0.5">
              {convos.map((convo) => (
                <div key={convo.id} className="group relative">
                  <Link
                    href={`/dashboard?convo=${convo.id}`}
                    onClick={onClose}
                    className={`sidebar-link pr-8 ${activeConvo === convo.id ? "active" : ""}`}
                  >
                    <span className="text-base w-5 text-center">💬</span>
                    <span className="truncate">{convo.title || "Conversation"}</span>
                  </Link>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteConvo(e, convo.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blush-100 transition-all text-stone-300 hover:text-blush-400"
                    aria-label="Delete conversation"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── Logout ────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-stone-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-blush-400 hover:bg-blush-50 hover:text-blush-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
