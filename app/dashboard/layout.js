"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard,
  Smile,
  Edit3,
  History,
  Settings,
  Bell,
  Zap,
  Menu,
  X,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

/**
 * TheraFlow Dashboard Layout - layout.js
 * Collapsible sidebar (WhatsApp Web style) on desktop.
 * Mobile preserves existing drawer behaviour.
 */

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────
const Tooltip = ({ label, children, disabled }) => {
  const [show, setShow] = useState(false);

  if (disabled) return children;

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          className="
            pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2
            whitespace-nowrap rounded-lg bg-slate-800 border border-white/10
            px-3 py-1.5 text-xs font-semibold text-white shadow-xl z-[200]
            animate-in fade-in slide-in-from-left-1 duration-150
          "
        >
          {label}
          {/* caret */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
        </span>
      )}
    </div>
  );
};

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
const SidebarItem = ({ icon: Icon, label, href, active, collapsed, onClick }) => (
  <Tooltip label={label} disabled={!collapsed}>
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        flex items-center gap-3 rounded-xl cursor-pointer
        transition-all duration-300 group relative overflow-hidden
        ${collapsed ? "justify-center px-0 py-3 w-full" : "px-4 py-3"}
        ${
          active
            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      {/* Active indicator bar */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-400 rounded-r-full shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
      )}

      <Icon
        size={20}
        className={`shrink-0 ${
          active
            ? "text-teal-400"
            : "text-inherit group-hover:text-white group-hover:scale-110 transition-transform"
        }`}
      />

      {/* Label — hidden when collapsed */}
      <span
        className={`
          font-medium text-sm tracking-tight whitespace-nowrap
          transition-all duration-300 origin-left
          ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
        `}
      >
        {label}
      </span>

      {active && !collapsed && (
        <ChevronRight size={14} className="ml-auto opacity-50 shrink-0" />
      )}
    </Link>
  </Tooltip>
);

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // ── Restore collapse state from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theraflow-sidebar-collapsed");
      if (saved !== null) setIsCollapsed(JSON.parse(saved));
    } catch (_) {}
  }, []);

  // ── Persist collapse state ──
  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("theraflow-sidebar-collapsed", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  const navigation = [
    { label: "Platform", type: "header" },
    { icon: LayoutDashboard, label: "New Chat", href: "/dashboard" },
    { icon: Smile, label: "Mood Tracker", href: "/dashboard/mood" },
    { icon: Edit3, label: "Journal", href: "/dashboard/journal" },
    { icon: History, label: "Chat History", href: "/dashboard/history" },
    { label: "System", type: "header" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  // ─── Desktop sidebar content ─────────────────────────────────────────────
  const DesktopSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Header / Logo + Toggle ── */}
      <div
        className={`flex items-center h-16 shrink-0 border-b border-white/5 transition-all duration-300 ${
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        }`}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 group overflow-hidden transition-all duration-300 ${
            isCollapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100"
          }`}
          tabIndex={isCollapsed ? -1 : 0}
        >
          <div className="w-9 h-9 shrink-0 rounded-xl bg-teal-500/20 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:rotate-6 transition-transform">
            <Zap size={20} fill="currentColor" className="text-teal-400" />
          </div>
          <span className="text-lg font-bold tracking-tighter text-white whitespace-nowrap">
            TheraFlow
          </span>
        </Link>

        {/* Collapsed state — just the icon, links to dashboard */}
        {isCollapsed && (
          <Tooltip label="TheraFlow" disabled={false}>
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center shadow-lg shadow-teal-500/10 hover:rotate-6 transition-transform"
            >
              <Zap size={20} fill="currentColor" className="text-teal-400" />
            </Link>
          </Tooltip>
        )}

        {/* Toggle button — visible when expanded */}
        {!isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-90 shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Toggle button — centred when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center py-3 border-b border-white/5">
          <Tooltip label="Expand sidebar" disabled={false}>
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-90"
            >
              <PanelLeftOpen size={18} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar space-y-1 py-4 transition-all duration-300 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        {navigation.map((item, idx) =>
          item.type === "header" ? (
            <div
              key={idx}
              className={`
                pt-6 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]
                transition-all duration-300 overflow-hidden
                ${isCollapsed ? "opacity-0 h-0 pt-0 pb-0" : "px-4 opacity-100"}
              `}
            >
              {item.label}
            </div>
          ) : (
            <SidebarItem
              key={item.href}
              {...item}
              collapsed={isCollapsed}
              active={
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              }
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )
        )}
      </nav>

      {/* ── User / Profile Section ── */}
      <div className={`shrink-0 p-3 mt-auto transition-all duration-300`}>
        {isCollapsed ? (
          /* Collapsed: just avatar + sign-out icon */
          <div className="flex flex-col items-center gap-2">
            <Tooltip label={user?.displayName || "User"} disabled={false}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 p-[1.5px] shadow-lg shadow-teal-500/10">
                <div className="w-full h-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center text-sm font-bold text-teal-400">
                  {user?.photoURL ? (
                    <img
                      className="w-full h-full object-cover opacity-90"
                      src={user.photoURL}
                      alt="Profile"
                    />
                  ) : (
                    user?.displayName?.charAt(0) || "U"
                  )}
                </div>
              </div>
            </Tooltip>
            <Tooltip label="Sign Out" disabled={false}>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group active:scale-90"
              >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </Tooltip>
          </div>
        ) : (
          /* Expanded: full card */
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 p-[1.5px] shadow-lg shadow-teal-500/10 shrink-0">
                <div className="w-full h-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center text-sm font-bold text-teal-400">
                  {user?.photoURL ? (
                    <img
                      className="w-full h-full object-cover opacity-90"
                      src={user.photoURL}
                      alt="Profile"
                    />
                  ) : (
                    user?.displayName?.charAt(0) || "U"
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.displayName || "Alex Rivers"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-bold border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all group"
            >
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Mobile sidebar content (unchanged behaviour) ─────────────────────────
  const MobileSidebarContent = () => (
    <>
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:rotate-6 transition-transform">
            <Zap size={22} fill="currentColor" className="text-teal-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-white">TheraFlow</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {navigation.map((item, idx) =>
          item.type === "header" ? (
            <div
              key={idx}
              className="pt-8 pb-3 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]"
            >
              {item.label}
            </div>
          ) : (
            <SidebarItem
              key={item.href}
              {...item}
              collapsed={false}
              active={
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              }
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 p-[1.5px] shadow-lg shadow-teal-500/10">
              <div className="w-full h-full rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center text-sm font-bold text-teal-400">
                {user?.photoURL ? (
                  <img
                    className="w-full h-full object-cover opacity-90"
                    src={user.photoURL}
                    alt="Profile"
                  />
                ) : (
                  user?.displayName?.charAt(0) || "U"
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.displayName || "Alex Rivers"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs font-bold border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all group"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );

  // ─── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#071226]">
        <span className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#071226] text-slate-200 font-sans selection:bg-teal-500/30 overflow-hidden">

      {/* ── Decorative Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`
          hidden md:flex flex-col
          border-r border-white/5
          bg-[#071226]/80 backdrop-blur-3xl
          sticky top-0 h-screen z-[60]
          transition-all duration-300 ease-in-out
          overflow-hidden shrink-0
          ${isCollapsed ? "w-[80px]" : "w-[280px]"}
        `}
      >
        <DesktopSidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[70] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar (Drawer) ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-72 bg-[#071226] border-r border-white/10
          z-[80] flex flex-col md:hidden
          transition-transform duration-500 ease-in-out shadow-2xl
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <MobileSidebarContent />
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 -right-12 w-10 h-10 bg-teal-400 text-slate-950 rounded-xl flex items-center justify-center shadow-2xl md:hidden active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50 bg-[#071226]/80 backdrop-blur-xl">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white active:scale-90 transition-all"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={18} fill="currentColor" className="text-teal-400" />
            <span className="font-bold text-white tracking-tighter">TheraFlow</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 shadow-inner">
            <Bell size={16} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar h-full">
          {children}
        </main>
      </div>

    </div>
  );
}
