"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Zap, TrendingUp, ChevronLeft, Check, Loader2,
  AlertCircle, RotateCcw, CalendarDays, BarChart2,
  Flame, Sparkles, Clock,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { saveMood, subscribeMoods } from "@/lib/firestore";

// ─────────────────────────────────────────────────────────
// MOOD CATALOGUE  (emoji + label + numeric score for charting)
// ─────────────────────────────────────────────────────────

const MOODS = [
  { key: "Radiant",  emoji: "😁", score: 100, color: "from-yellow-400/20 to-amber-400/10",  ring: "border-yellow-400/40",  text: "text-yellow-400",  bg: "bg-yellow-400/10" },
  { key: "Content",  emoji: "😊", score: 80,  color: "from-teal-400/20 to-emerald-400/10", ring: "border-teal-400/40",   text: "text-teal-400",   bg: "bg-teal-400/10"  },
  { key: "Neutral",  emoji: "😐", score: 60,  color: "from-blue-400/20 to-sky-400/10",     ring: "border-blue-400/40",   text: "text-blue-400",   bg: "bg-blue-400/10"  },
  { key: "Down",     emoji: "😔", score: 40,  color: "from-slate-400/20 to-slate-500/10",  ring: "border-slate-400/30",  text: "text-slate-400",  bg: "bg-slate-400/10" },
  { key: "Anxious",  emoji: "😰", score: 25,  color: "from-orange-400/20 to-amber-500/10", ring: "border-orange-400/40", text: "text-orange-400", bg: "bg-orange-400/10" },
  { key: "Upset",    emoji: "😤", score: 10,  color: "from-red-400/20 to-rose-500/10",     ring: "border-red-400/40",    text: "text-red-400",    bg: "bg-red-400/10"   },
];

const MOOD_BY_KEY = Object.fromEntries(MOODS.map((m) => [m.key, m]));

const TAGS = [
  "Productive", "Peaceful", "Social", "Restless",
  "Creative",   "Exhausted","Focused", "Uninspired",
  "Grateful",   "Energised","Stressed","Hopeful",
];

// ─────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────

function toDate(ts) {
  if (!ts) return new Date();
  if (ts.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns an array of the last N days (inclusive today), newest last.
 */
function lastNDays(n) {
  const days = [];
  const today = startOfDay(new Date());
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * From a list of entries, build weekly chart data for the last 7 days.
 * Each bucket = average score for that day (null if no entries).
 */
function buildWeeklyChart(entries) {
  const days = lastNDays(7);
  return days.map((day) => {
    const dayStr = day.toDateString();
    const dayEntries = entries.filter(
      (e) => toDate(e.createdAt).toDateString() === dayStr
    );
    if (!dayEntries.length) return { label: DAY_LABELS[day.getDay()], score: null, date: day, count: 0 };
    const avg = dayEntries.reduce((sum, e) => sum + (MOOD_BY_KEY[e.mood]?.score ?? 50), 0) / dayEntries.length;
    return { label: DAY_LABELS[day.getDay()], score: Math.round(avg), date: day, count: dayEntries.length };
  });
}

/**
 * Build monthly statistics: counts per mood, overall avg score.
 */
function buildMonthlyStats(entries) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = entries.filter((e) => toDate(e.createdAt) >= monthStart);

  const counts = {};
  MOODS.forEach((m) => (counts[m.key] = 0));
  thisMonth.forEach((e) => { if (counts[e.mood] !== undefined) counts[e.mood]++; });

  const total = thisMonth.length;
  const avgScore = total
    ? Math.round(thisMonth.reduce((s, e) => s + (MOOD_BY_KEY[e.mood]?.score ?? 50), 0) / total)
    : null;

  return { counts, total, avgScore };
}

/**
 * Compute consecutive-day logging streak.
 */
function computeStreak(entries) {
  const daySet = new Set(entries.map((e) => toDate(e.createdAt).toDateString()));
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (daySet.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function formatTime(ts) {
  return toDate(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────
// UI ATOMS
// ─────────────────────────────────────────────────────────

const Spinner = ({ size = 18, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

// ─────────────────────────────────────────────────────────
// MOOD SELECTOR CARD
// ─────────────────────────────────────────────────────────

function MoodCard({ mood, selected, onSelect }) {
  const isSelected = selected === mood.key;
  return (
    <button
      onClick={() => onSelect(mood.key)}
      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border transition-all duration-300 outline-none active:scale-95 select-none ${
        isSelected
          ? `bg-gradient-to-br ${mood.color} ${mood.ring} shadow-[0_0_24px_rgba(0,0,0,0.3)]`
          : "bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10"
      }`}
    >
      <span className={`text-4xl transition-transform duration-200 ${isSelected ? "scale-125" : "scale-100"}`}>
        {mood.emoji}
      </span>
      <span className={`text-xs font-bold tracking-tight transition-colors ${isSelected ? mood.text : "text-slate-400"}`}>
        {mood.key}
      </span>
      {isSelected && (
        <div className={`w-5 h-5 rounded-full ${mood.bg} ${mood.ring} border flex items-center justify-center`}>
          <Check size={11} className={mood.text} strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// DRIVER TAG
// ─────────────────────────────────────────────────────────

function DriverTag({ label, active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 select-none ${
        active
          ? "bg-teal-400 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20"
          : "bg-slate-900/60 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/10"
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// WEEKLY CHART  (bar chart from real data)
// ─────────────────────────────────────────────────────────

function WeeklyChart({ chartData, avgScore }) {
  const maxScore = 100;
  const today = new Date().toDateString();

  return (
    <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Weekly Trends</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            {avgScore !== null
              ? `7-day avg score: ${avgScore}%`
              : "No entries this week yet"}
          </p>
        </div>
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
          <TrendingUp size={16} />
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between px-2 h-24 gap-2">
        {chartData.map((d, i) => {
          const isToday = d.date.toDateString() === today;
          const heightPct = d.score !== null ? `${Math.max(d.score, 8)}%` : "8%";
          const isEmpty   = d.score === null;
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full flex-1 flex items-end justify-center">
                {/* Background track */}
                <div className="w-2.5 bg-white/5 rounded-full h-full absolute inset-x-1/2 -translate-x-1/2" />
                {/* Score bar */}
                <div
                  className={`relative w-2.5 rounded-full transition-all duration-700 ${
                    isEmpty
                      ? "bg-white/5"
                      : isToday
                      ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                      : "bg-white/25"
                  }`}
                  style={{ height: heightPct }}
                />
              </div>
              <span className={`text-[9px] font-bold uppercase ${isToday ? "text-teal-400" : "text-slate-600"}`}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Count labels row */}
      <div className="flex justify-between px-2">
        {chartData.map((d, i) => (
          <div key={i} className="flex-1 flex justify-center">
            {d.count > 0 && (
              <span className="text-[8px] font-bold text-slate-700">{d.count}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// MONTHLY STATS
// ─────────────────────────────────────────────────────────

function MonthlyStats({ stats }) {
  const { counts, total, avgScore } = stats;
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });

  if (total === 0) {
    return (
      <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">{monthName} Overview</h3>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><BarChart2 size={16} /></div>
        </div>
        <p className="text-xs text-slate-600 font-medium">No entries logged this month yet.</p>
      </section>
    );
  }

  const topMoods = MOODS
    .filter((m) => counts[m.key] > 0)
    .sort((a, b) => counts[b.key] - counts[a.key]);

  return (
    <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-white">{monthName} Overview</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            {total} {total === 1 ? "entry" : "entries"} · avg {avgScore}%
          </p>
        </div>
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><BarChart2 size={16} /></div>
      </div>

      {/* Mood percentage bars */}
      <div className="space-y-3">
        {topMoods.map((m) => {
          const pct = Math.round((counts[m.key] / total) * 100);
          return (
            <div key={m.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{m.emoji}</span>
                  <span className={`text-xs font-bold ${m.text}`}>{m.key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500">{counts[m.key]}×</span>
                  <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.bg.replace("/10", "/60")} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// RECENT HISTORY
// ─────────────────────────────────────────────────────────

function RecentHistory({ entries }) {
  const recent = entries.slice(0, 8);
  if (!recent.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Recent Entries</h3>
        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">{entries.length} total</span>
      </div>
      <div className="space-y-2">
        {recent.map((entry) => {
          const m = MOOD_BY_KEY[entry.mood];
          if (!m) return null;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/5"
            >
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${m.text}`}>{m.key}</p>
                {entry.tags?.length > 0 && (
                  <p className="text-[10px] text-slate-600 truncate mt-0.5">
                    {entry.tags.join(" · ")}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                  <Clock size={9} />
                  {formatTime(entry.createdAt)}
                </p>
                <p className="text-[9px] text-slate-700 mt-0.5">
                  {toDate(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function MoodTrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ── Firestore data ──
  const [entries, setEntries]               = useState([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);

  // ── Form state ──
  const [selectedMood, setSelectedMood]     = useState(null);
  const [selectedTags, setSelectedTags]     = useState([]);
  const [isSaving, setIsSaving]             = useState(false);
  const [saveError, setSaveError]           = useState(null);
  const [savedFlash, setSavedFlash]         = useState(false); // success flash

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Real-time Firestore listener ──
  useEffect(() => {
    if (!user) return;
    setFirestoreLoading(true);
    const unsub = subscribeMoods(user.uid, (data) => {
      setEntries(data);
      setFirestoreLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ── Derived stats (memoised) ──
  const chartData    = useMemo(() => buildWeeklyChart(entries), [entries]);
  const monthlyStats = useMemo(() => buildMonthlyStats(entries), [entries]);
  const streak       = useMemo(() => computeStreak(entries), [entries]);

  const weekAvg = useMemo(() => {
    const scored = chartData.filter((d) => d.score !== null);
    if (!scored.length) return null;
    return Math.round(scored.reduce((s, d) => s + d.score, 0) / scored.length);
  }, [chartData]);

  // ── Tag toggle ──
  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // ── Save handler ──
  async function handleLog() {
    if (!selectedMood || !user || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveMood(user.uid, { mood: selectedMood, tags: selectedTags });
      setSavedFlash(true);
      setSelectedMood(null);
      setSelectedTags([]);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      console.error("Mood save error:", err);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Today's mood (most recent entry today) ──
  const todayMood = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayEntries = entries.filter((e) => toDate(e.createdAt).toDateString() === todayStr);
    return todayEntries[0] ?? null;
  }, [entries]);

  const activeMoodMeta = selectedMood ? MOOD_BY_KEY[selectedMood] : null;

  // ── Loading ──
  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1326]">
        <span className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden pb-12">

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-blue-500/5 blur-[120px] rounded-full" />
        {/* Dynamic glow that follows selected mood */}
        {activeMoodMeta && (
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] opacity-20 transition-all duration-1000 pointer-events-none"
            style={{ background: `radial-gradient(circle, var(--mood-color, #2dd4bf), transparent 70%)` }}
          />
        )}
      </div>

      {/* ── Header ── */}
      <header className="h-16 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-md bg-[#0b1326]/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors active:scale-95">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-[0.1em] uppercase leading-none">Mood Tracker</h1>
            {!firestoreLoading && (
              <span className="text-[9px] text-slate-500 font-medium tracking-wide mt-0.5">
                {entries.length} total entries
              </span>
            )}
          </div>
        </div>
        {/* Streak badge */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-1.5">
            <Flame size={13} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{streak} day streak</span>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 pt-6 space-y-8 relative z-10">

        {/* ── Welcome greeting ── */}
        <section className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
            How are you feeling,{" "}
            <span className="text-teal-400">
              {user.displayName?.split(" ")[0] ?? "there"}
            </span>
            ?
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Honesty is the foundation of emotional intelligence. Let's record your state.
          </p>
          {/* Today's last log badge */}
          {todayMood && (
            <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 mt-1">
              <span className="text-base">{MOOD_BY_KEY[todayMood.mood]?.emoji}</span>
              <span className="text-[11px] font-semibold text-slate-400">
                Last logged: <span className="text-white">{MOOD_BY_KEY[todayMood.mood]?.key}</span> at {formatTime(todayMood.createdAt)}
              </span>
            </div>
          )}
        </section>

        {/* ── Weekly chart ── */}
        {firestoreLoading ? (
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 h-44 flex items-center justify-center">
            <Spinner size={22} className="text-teal-400" />
          </div>
        ) : (
          <WeeklyChart chartData={chartData} avgScore={weekAvg} />
        )}

        {/* ── Mood Selection Grid ── */}
        <section className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Mood Selection</h3>
            <span className="text-[10px] font-bold text-teal-400">Pick one</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MOODS.map((mood) => (
              <MoodCard
                key={mood.key}
                mood={mood}
                selected={selectedMood}
                onSelect={setSelectedMood}
              />
            ))}
          </div>
        </section>

        {/* ── Contextual Driver Tags ── */}
        <section className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Contextual Drivers</h3>
            <span className="text-[10px] font-bold text-teal-400">Select multiple</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {TAGS.map((tag) => (
              <DriverTag
                key={tag}
                label={tag}
                active={selectedTags.includes(tag)}
                onToggle={() => toggleTag(tag)}
              />
            ))}
          </div>
        </section>

        {/* ── Log CTA Card ── */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-teal-500/20 rounded-[2.5rem] p-7 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[40px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Dynamic AI-style message */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5">
              <Sparkles size={13} className="text-teal-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">
                {selectedMood ? "Ready to log" : "Select a mood to begin"}
              </span>
            </div>

            {selectedMood ? (
              <p className="text-base font-medium text-slate-200 leading-relaxed">
                You're feeling{" "}
                <span className={`font-bold ${activeMoodMeta?.text}`}>
                  {activeMoodMeta?.emoji} {selectedMood}
                </span>
                {selectedTags.length > 0 && (
                  <>
                    {" "}with{" "}
                    <span className="text-teal-300 font-semibold">
                      {selectedTags.join(", ")}
                    </span>
                  </>
                )}
                . Log this entry to track your emotional journey.
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Select one of the moods above, then optionally pick contextual drivers before logging.
              </p>
            )}

            {/* Error banner */}
            {saveError && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} />
                {saveError}
              </div>
            )}

            {/* Success flash */}
            {savedFlash && (
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-3 animate-fade-in">
                <Check size={14} strokeWidth={3} />
                Mood logged successfully!
              </div>
            )}

            {/* Log button */}
            <button
              onClick={handleLog}
              disabled={!selectedMood || isSaving}
              className="w-full py-5 rounded-2xl bg-teal-400 text-slate-950 font-bold text-base hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3"
            >
              {isSaving ? (
                <><Spinner size={18} /> Saving…</>
              ) : (
                <><Check size={18} strokeWidth={3} /> Log Mood Entry</>
              )}
            </button>

            {/* Reset selection */}
            {(selectedMood || selectedTags.length > 0) && !isSaving && (
              <button
                onClick={() => { setSelectedMood(null); setSelectedTags([]); }}
                className="w-full py-3 rounded-2xl bg-transparent text-slate-600 font-semibold text-xs hover:text-slate-400 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={12} />
                Clear selection
              </button>
            )}
          </div>
        </section>

        {/* ── Monthly Stats ── */}
        {!firestoreLoading && (
          <MonthlyStats stats={monthlyStats} />
        )}

        {/* ── Recent History ── */}
        {!firestoreLoading && entries.length > 0 && (
          <RecentHistory entries={entries} />
        )}

        {/* ── Overall stats row ── */}
        {!firestoreLoading && entries.length > 0 && (
          <section className="grid grid-cols-3 gap-3 pb-4">
            {[
              { label: "All Time",   value: entries.length,        sub: "entries",  icon: CalendarDays, color: "text-teal-400",  bg: "bg-teal-500/10"  },
              { label: "This Month", value: monthlyStats.total,    sub: "entries",  icon: BarChart2,    color: "text-blue-400",  bg: "bg-blue-500/10"  },
              { label: "Streak",     value: `${streak}d`,          sub: "in a row", icon: Flame,        color: "text-amber-400", bg: "bg-amber-500/10" },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
                <div className={`p-1.5 rounded-lg ${bg} ${color} w-fit mb-2`}>
                  <Icon size={13} />
                </div>
                <div className="text-lg font-bold text-white tracking-tight">{value}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 leading-tight">
                  {label}<br />{sub}
                </div>
              </div>
            ))}
          </section>
        )}

      </main>
    </div>
  );
}
