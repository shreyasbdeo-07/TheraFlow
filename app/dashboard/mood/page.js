"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { saveMoodLog, getMoodLogs } from "@/lib/firestore";

const MOODS = [
  { emoji: "😄", label: "Great",      color: "bg-sage-100 border-sage-300 text-sage-700",     score: 5 },
  { emoji: "🙂", label: "Good",       color: "bg-sky-100 border-sky-300 text-sky-700",         score: 4 },
  { emoji: "😐", label: "Okay",       color: "bg-amber-100 border-amber-300 text-amber-700",   score: 3 },
  { emoji: "😔", label: "Low",        color: "bg-lavender-100 border-lavender-300 text-lavender-700", score: 2 },
  { emoji: "😞", label: "Struggling", color: "bg-blush-100 border-blush-300 text-blush-700",   score: 1 },
];

const FEELINGS = ["Anxious", "Calm", "Hopeful", "Tired", "Overwhelmed", "Grateful", "Lonely", "Motivated", "Sad", "Content", "Irritable", "Peaceful"];

const barHeight = (score) => `${Math.round((score / 5) * 100)}%`;
const barColor  = (score) => {
  if (score >= 4) return "bg-sage-400";
  if (score === 3) return "bg-amber-400";
  return "bg-blush-400";
};

export default function MoodPage() {
  const { user }                        = useAuth();
  const [selected, setSelected]         = useState(null);
  const [feelings, setFeelings]         = useState([]);
  const [note, setNote]                 = useState("");
  const [submitted, setSubmitted]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [history, setHistory]           = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load last 7 days of mood logs from Firestore
  useEffect(() => {
    if (!user) return;
    getMoodLogs(user.uid, 7)
      .then((logs) => setHistory(logs))
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [user, submitted]);

  function toggleFeeling(f) {
    setFeelings((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  async function handleSubmit() {
    if (!selected || !user) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      await saveMoodLog(user.uid, {
        mood:  selected.label,
        value: selected.score,
        emoji: selected.emoji,
        note:  note.trim(),
        date:  today,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to save mood:", err);
    } finally {
      setSaving(false);
    }
  }

  // Build chart: last 7 days + today placeholder
  const chartDays = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = history.find((h) => h.date === dateStr);
      days.push({
        label: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
        score: log?.value ?? null,
      });
    }
    return days;
  })();

  if (submitted) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-lg mx-auto text-center animate-slide-up">
          <div className="text-6xl mb-4">{selected.emoji}</div>
          <h2 className="font-display text-3xl font-bold text-stone-800 mb-2">Check-in logged! 🌸</h2>
          <p className="text-stone-500 mb-6">
            You&apos;re feeling <strong>{selected.label}</strong> today.
            {feelings.length > 0 && ` Emotions noted: ${feelings.join(", ")}.`}
          </p>
          <div className="glass rounded-3xl p-6 mb-6 text-left shadow-soft">
            <p className="text-sm text-stone-600 leading-relaxed">
              {selected.score >= 4
                ? "Wonderful! Carry that positive energy with you. Consider journaling what made today feel good so you can revisit it."
                : selected.score === 3
                ? "It's okay to have neutral days. Small acts of self-care can help — a walk, a warm drink, or a few deep breaths."
                : "I'm sorry you're going through a tough time. You're brave for checking in. Would you like to talk it through in the chat?"}
            </p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setSelected(null); setFeelings([]); setNote(""); }}
            className="btn-secondary"
          >
            Log another check-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-800 mb-1">Daily Check-In</h1>
          <p className="text-stone-400 text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Mood chart */}
        <div className="glass rounded-3xl p-6 mb-6 shadow-soft">
          <h2 className="font-semibold text-stone-700 mb-4 text-sm">Your week at a glance</h2>
          {loadingHistory ? (
            <div className="h-24 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-sage-200 border-t-sage-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex items-end gap-3 h-24">
              {chartDays.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center h-16 relative">
                    {d.score !== null ? (
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${barColor(d.score)}`}
                        style={{ height: barHeight(d.score) }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-t-xl border-2 border-dashed border-stone-200 flex items-center justify-center">
                        <span className="text-xs text-stone-300">?</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-stone-400">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mood picker */}
        <div className="glass rounded-3xl p-6 mb-6 shadow-soft">
          <h2 className="font-semibold text-stone-700 mb-4">How are you feeling right now?</h2>
          <div className="grid grid-cols-5 gap-3">
            {MOODS.map((m) => (
              <button
                key={m.label}
                onClick={() => setSelected(m)}
                className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                  selected?.label === m.label
                    ? m.color + " scale-105 shadow-soft"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-medium text-stone-600">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feelings tags */}
        <div className="glass rounded-3xl p-6 mb-6 shadow-soft">
          <h2 className="font-semibold text-stone-700 mb-3">What emotions are present? <span className="text-stone-400 font-normal">(optional)</span></h2>
          <div className="flex flex-wrap gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFeeling(f)}
                className={`px-3 py-1.5 rounded-2xl text-sm border transition-all ${
                  feelings.includes(f)
                    ? "bg-sage-100 border-sage-300 text-sage-700"
                    : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="glass rounded-3xl p-6 mb-6 shadow-soft">
          <h2 className="font-semibold text-stone-700 mb-3">Anything you want to note? <span className="text-stone-400 font-normal">(optional)</span></h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind today…"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selected || saving}
          className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            "Log Check-In"
          )}
        </button>
      </div>
    </div>
  );
}
