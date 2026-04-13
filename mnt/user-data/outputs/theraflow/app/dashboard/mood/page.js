"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { saveMoodLog, getMoodLogs } from "@/lib/firestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

// ── Mood options ───────────────────────────────────────────
export const MOODS = [
  { emoji: "😁", label: "Great",   value: 5, color: "#507f50" },
  { emoji: "🙂", label: "Good",    value: 4, color: "#74a874" },
  { emoji: "😌", label: "Calm",    value: 3, color: "#8b5cf6" },
  { emoji: "😔", label: "Sad",     value: 2, color: "#94a3b8" },
  { emoji: "😰", label: "Anxious", value: 1.5, color: "#fbbf24" },
  { emoji: "😣", label: "Stressed",value: 1, color: "#f43f5e" },
];

const moodByValue = Object.fromEntries(MOODS.map((m) => [m.value, m]));

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const m = MOODS.find((x) => x.value === payload[0].value) ?? MOODS[2];
  return (
    <div className="glass rounded-2xl px-3 py-2 shadow-soft text-sm">
      <span className="text-lg">{m.emoji}</span>{" "}
      <span className="text-stone-700 font-medium">{m.label}</span>
    </div>
  );
}

export default function MoodPage() {
  const [user, setUser]             = useState(null);
  const [selectedMood, setSelected] = useState(null);
  const [saved, setSaved]           = useState(false);
  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [note, setNote]             = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await getMoodLogs(user.uid, 14);
      setLogs(data);
      setLoading(false);
    })();
  }, [user]);

  async function handleSave() {
    if (!selectedMood || !user) return;
    await saveMoodLog(user.uid, {
      mood:      selectedMood.label,
      value:     selectedMood.value,
      emoji:     selectedMood.emoji,
      note:      note.trim(),
      date:      new Date().toISOString().split("T")[0],
    });
    setSaved(true);
    // Refresh
    const data = await getMoodLogs(user.uid, 14);
    setLogs(data);
  }

  // Build chart data — last 14 days
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d   = format(subDays(new Date(), 13 - i), "yyyy-MM-dd");
    const log = logs.find((l) => l.date === d);
    return {
      day:   format(subDays(new Date(), 13 - i), "EEE d"),
      value: log?.value ?? null,
      emoji: log?.emoji ?? null,
    };
  });

  const todayLogged = logs.some(
    (l) => l.date === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-stone-800">
          Mood Tracker
        </h1>

        {/* ── Daily Check-In Card ─────────────────────────── */}
        {!todayLogged && !saved ? (
          <div className="glass rounded-4xl p-7 shadow-soft animate-fade-in">
            <h2 className="font-display text-xl font-semibold text-stone-800 mb-1">
              How are you feeling today?
            </h2>
            <p className="text-stone-400 text-sm mb-6">
              {format(new Date(), "EEEE, MMMM d")}
            </p>

            {/* Mood grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelected(m)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-3xl border-2 transition-all duration-150
                    ${selectedMood?.label === m.label
                      ? "border-sage-400 bg-sage-50 scale-105 shadow-sm"
                      : "border-stone-100 bg-white hover:border-sage-200 hover:bg-sage-50"}`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs text-stone-500 font-medium">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Optional note */}
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any thoughts to add? (optional)"
              className="input-field text-sm resize-none mb-4"
            />

            <button
              onClick={handleSave}
              disabled={!selectedMood}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Today&apos;s Mood
            </button>
          </div>
        ) : (
          <div className="glass rounded-4xl p-7 shadow-soft animate-fade-in text-center">
            <div className="text-5xl mb-3">{selectedMood?.emoji ?? logs[0]?.emoji ?? "🙂"}</div>
            <h2 className="font-display text-xl font-semibold text-stone-800 mb-1">
              Today&apos;s mood logged!
            </h2>
            <p className="text-stone-400 text-sm">
              Come back tomorrow for your next check-in.
            </p>
          </div>
        )}

        {/* ── 14-day chart ────────────────────────────────── */}
        <div className="glass rounded-4xl p-7 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-stone-800 mb-5">
            Your past 14 days
          </h2>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-stone-300 text-sm">
              Loading…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#a8a29e" }} />
                <YAxis
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(v) => MOODS.find((m) => m.value === v)?.emoji ?? ""}
                  tick={{ fontSize: 14 }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#507f50"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: "#507f50", strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Log list ────────────────────────────────────── */}
        <div className="glass rounded-4xl p-7 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-stone-800 mb-4">
            Recent entries
          </h2>
          {logs.length === 0 ? (
            <p className="text-stone-400 text-sm">No entries yet. Log your first mood above!</p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log, i) => (
                <div key={i} className="flex items-center gap-4 bg-stone-50 rounded-2xl px-4 py-3">
                  <span className="text-2xl">{log.emoji}</span>
                  <div className="flex-1">
                    <div className="text-stone-700 font-medium text-sm">{log.label ?? log.mood}</div>
                    {log.note && (
                      <div className="text-stone-400 text-xs mt-0.5">{log.note}</div>
                    )}
                  </div>
                  <span className="text-stone-400 text-xs">
                    {log.date ? format(parseISO(log.date), "MMM d") : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
