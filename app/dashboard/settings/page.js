"use client";
import { useState } from "react";

const THEMES = [
  { id: "calm",     label: "Calm Sage",   preview: "bg-gradient-to-br from-sage-100 to-stone-50" },
  { id: "lavender", label: "Lavender",    preview: "bg-gradient-to-br from-lavender-100 to-stone-50" },
  { id: "sky",      label: "Clear Sky",   preview: "bg-gradient-to-br from-sky-100 to-stone-50" },
  { id: "blush",    label: "Warm Blush",  preview: "bg-gradient-to-br from-blush-100 to-stone-50" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Alex",
    email: "alex@example.com",
    bio: "Working on my mental wellness, one day at a time.",
  });

  const [prefs, setPrefs] = useState({
    theme: "calm",
    notifications: true,
    soundEffects: false,
    crisisReminder: true,
    aiPersonality: "warm",
  });

  const [saved, setSaved] = useState(false);

  function handleProfileChange(e) {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handlePref(key, val) {
    setPrefs((p) => ({ ...p, [key]: val }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Settings</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>👤</span> Profile
            </h2>
            <div className="space-y-4">
              {/* Avatar placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sage-200 to-lavender-200 flex items-center justify-center text-2xl font-bold text-stone-600 shadow-soft">
                  {profile.name[0]}
                </div>
                <div>
                  <div className="font-medium text-stone-700">{profile.name}</div>
                  <button type="button" className="text-xs text-sage-500 hover:text-sage-700 underline transition-colors mt-0.5">
                    Change photo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Display name</label>
                <input name="name" value={profile.name} onChange={handleProfileChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
                <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Bio <span className="text-stone-400">(optional)</span></label>
                <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows={2} className="input-field resize-none" />
              </div>
            </div>
          </section>

          {/* Theme */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>🎨</span> Appearance
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handlePref("theme", t.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    prefs.theme === t.id ? "border-sage-400 shadow-soft scale-105" : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className={`w-full h-10 rounded-xl ${t.preview}`} />
                  <span className="text-xs text-stone-600 font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* AI personality */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-2 flex items-center gap-2">
              <span>🌿</span> AI Personality
            </h2>
            <p className="text-xs text-stone-400 mb-4">Choose how TheraFlow communicates with you.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "warm",        label: "Warm & Gentle",    desc: "Nurturing and empathetic"  },
                { id: "motivational", label: "Motivational",    desc: "Encouraging and uplifting" },
                { id: "calm",        label: "Calm & Grounded",  desc: "Steady and reflective"     },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePref("aiPersonality", p.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    prefs.aiPersonality === p.id ? "border-sage-400 bg-sage-50" : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="font-medium text-stone-700 text-sm">{p.label}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>🔔</span> Preferences
            </h2>
            <div className="space-y-4">
              {[
                { key: "notifications",  label: "Daily check-in reminders",       desc: "Get a gentle nudge to log your mood each day" },
                { key: "soundEffects",   label: "Sound effects",                   desc: "Subtle sounds when messages are sent" },
                { key: "crisisReminder", label: "Show crisis resources",           desc: "Always display the mental health helpline at the bottom of chat" },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-stone-700">{item.label}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePref(item.key, !prefs[item.key])}
                    className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${prefs[item.key] ? "bg-sage-500" : "bg-stone-200"}`}
                    aria-checked={prefs[item.key]}
                    role="switch"
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${prefs[item.key] ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-3xl p-6 border-2 border-blush-100 bg-blush-50/50">
            <h2 className="font-semibold text-blush-600 mb-3 flex items-center gap-2">
              <span>⚠️</span> Danger Zone
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-stone-700">Delete account</div>
                <div className="text-xs text-stone-400">Permanently remove all your data</div>
              </div>
              <button type="button" className="px-4 py-2 rounded-2xl border-2 border-blush-300 text-blush-500 text-sm font-medium hover:bg-blush-100 transition-all">
                Delete Account
              </button>
            </div>
          </section>

          {/* Save */}
          <div className="flex items-center gap-4">
            <button type="submit" className="btn-primary px-8">
              Save Changes
            </button>
            {saved && (
              <span className="text-sm text-sage-600 flex items-center gap-1.5 animate-fade-in">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
