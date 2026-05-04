"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

// ── Nav items ──────────────────────────────────────────────
const NAV = [
  { icon: "✨", label: "New Chat",       href: "/dashboard",          exact: true },
  { icon: "🌤️", label: "Daily Check-In", href: "/dashboard/mood"               },
  { icon: "📊", label: "Mood Tracker",   href: "/dashboard/mood"               },
  { icon: "📓", label: "Journal",        href: "/dashboard/journal"            },
  { icon: "💬", label: "Chat History",   href: "/dashboard/history"            },
  { icon: "⚙️", label: "Settings",      href: "/dashboard/settings"           },
];

function SidebarContent({ onClose }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const { user }    = useAuth();

  function isActive(href, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && pathname !== "/dashboard";
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  // Derive display info from the real Firebase user
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const email       = user?.email || "";
  const initial     = displayName[0]?.toUpperCase() || "U";

  return (
    <aside className="w-64 h-screen flex flex-col bg-white/80 backdrop-blur-xl border-r border-stone-100 shadow-soft flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-stone-100">
        <Link href="/" className="font-display text-lg font-bold text-stone-800">
          TheraFlow
        </Link>
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

      {/* User greeting */}
      <div className="px-5 py-3 border-b border-stone-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-sage-200 to-lavender-200 flex items-center justify-center text-sm font-bold text-stone-600">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-stone-700 truncate">{displayName}</div>
            <div className="text-xs text-stone-400 truncate">{email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
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
      </nav>

      {/* Logout */}
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

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <span className="w-8 h-8 border-4 border-sage-200 border-t-sage-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <SidebarContent onClose={() => {}} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display text-lg font-bold text-stone-800">TheraFlow</span>
        </header>

        <Suspense>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
