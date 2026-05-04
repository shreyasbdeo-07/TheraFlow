"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, updateEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { deleteAllUserData, getUserPrefs, saveUserPrefs } from "@/lib/firestore";
import { useAuth } from "@/lib/AuthContext";
import { useTheme, THEMES } from "@/lib/ThemeContext";

export default function SettingsPage() {
  const { user }   = useAuth();
  const router     = useRouter();

  const { theme, setTheme } = useTheme();

  // ── Profile state (seeded from real Firebase user) ─────────
  const [profile, setProfile] = useState({ name: "", email: "", bio: "" });
  const [prefs, setPrefs]     = useState({
    notifications: true, soundEffects: false,
    crisisReminder: true, aiPersonality: "warm",
  });

  const [saved, setSaved]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [profileError, setProfileError] = useState("");

  // ── Delete account modal state ──────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword]   = useState("");
  const [deleteError, setDeleteError]         = useState("");
  const [deleting, setDeleting]               = useState(false);

  // Seed profile from real Firebase user on load, also load saved prefs
  useEffect(() => {
    if (user) {
      setProfile({
        name:  user.displayName || "",
        email: user.email       || "",
        bio:   "",
      });
      // Load preferences from Firestore
      getUserPrefs(user.uid).then((saved) => {
        if (saved) setPrefs((p) => ({ ...p, ...saved }));
      }).catch(() => {});
    }
  }, [user]);

  function handleProfileChange(e) {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSaved(false);
    setProfileError("");
  }

  function handlePref(key, val) {
    setPrefs((p) => ({ ...p, [key]: val }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setProfileError("");
    try {
      // Update display name in Firebase Auth
      if (profile.name !== user.displayName) {
        await updateProfile(user, { displayName: profile.name });
      }
      // Update email in Firebase Auth (requires recent login)
      if (profile.email !== user.email) {
        await updateEmail(user, profile.email);
      }
      setSaved(true);
      // Also save preferences to Firestore
      await saveUserPrefs(user.uid, prefs);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msgs = {
        "auth/requires-recent-login": "Please log out and log back in before changing your email.",
        "auth/email-already-in-use":  "That email is already used by another account.",
        "auth/invalid-email":         "Please enter a valid email address.",
      };
      setProfileError(msgs[err.code] || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete Account ──────────────────────────────────────────
  async function handleDeleteAccount() {
    if (!user) return;
    setDeleting(true);
    setDeleteError("");
    try {
      // Re-authenticate before deleting (Firebase security requirement)
      const isPasswordUser = user.providerData.some((p) => p.providerId === "password");
      if (isPasswordUser) {
        if (!deletePassword) {
          setDeleteError("Please enter your password to confirm.");
          setDeleting(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, credential);
      }
      // 1. Delete all Firestore data
      await deleteAllUserData(user.uid);
      // 2. Delete the Firebase Auth account
      await deleteUser(user);
      // 3. Redirect to home
      router.push("/");
    } catch (err) {
      const msgs = {
        "auth/wrong-password":        "Incorrect password. Please try again.",
        "auth/requires-recent-login": "Please log out and log back in, then try again.",
        "auth/too-many-requests":     "Too many attempts. Please try again later.",
      };
      setDeleteError(msgs[err.code] || "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const displayName  = user?.displayName || user?.email?.split("@")[0] || "User";
  const initial      = displayName[0]?.toUpperCase() || "U";
  const isGoogleUser = user?.providerData?.some((p) => p.providerId === "google.com");

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">Settings</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ── Profile ── */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>👤</span> Profile
            </h2>
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sage-200 to-lavender-200 flex items-center justify-center text-2xl font-bold text-stone-600 shadow-soft">
                  {initial}
                </div>
                <div>
                  <div className="font-medium text-stone-700">{displayName}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{user?.email}</div>
                  {isGoogleUser && (
                    <span className="inline-flex items-center gap-1 text-xs text-stone-400 mt-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Signed in with Google
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Display name</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Email
                  {isGoogleUser && <span className="ml-2 text-xs text-stone-400 font-normal">(managed by Google)</span>}
                </label>
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled={isGoogleUser}
                  className={`input-field ${isGoogleUser ? "opacity-60 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Bio <span className="text-stone-400">(optional)</span>
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  rows={2}
                  placeholder="Tell us a little about yourself…"
                  className="input-field resize-none"
                />
              </div>

              {profileError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blush-50 border border-blush-200 text-blush-500 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {profileError}
                </div>
              )}
            </div>
          </section>

          {/* ── Appearance ── */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>🎨</span> Appearance
            </h2>
            <p className="text-xs text-stone-400 mb-4">Changes apply instantly across the whole app.</p>
            <div className="grid grid-cols-4 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    theme === t.id
                      ? "border-2 shadow-soft scale-105"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                  style={theme === t.id ? { borderColor: "var(--theme-primary)" } : {}}
                >
                  <div className={`w-full h-10 rounded-xl ${t.preview}`} />
                  <span className="text-xs text-stone-600 font-medium">{t.label}</span>
                  {theme === t.id && (
                    <span className="text-xs font-semibold" style={{ color: "var(--theme-primary)" }}>✓ Active</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* ── AI Personality ── */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-2 flex items-center gap-2">
              <span>🌿</span> AI Personality
            </h2>
            <p className="text-xs text-stone-400 mb-4">Choose how TheraFlow communicates with you.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "warm",         label: "Warm & Gentle",   desc: "Nurturing and empathetic"  },
                { id: "motivational", label: "Motivational",    desc: "Encouraging and uplifting" },
                { id: "calm",         label: "Calm & Grounded", desc: "Steady and reflective"     },
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

          {/* ── Preferences ── */}
          <section className="glass rounded-3xl p-6 shadow-soft">
            <h2 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>🔔</span> Preferences
            </h2>
            <div className="space-y-4">
              {[
                { key: "notifications",  label: "Daily check-in reminders",  desc: "Get a gentle nudge to log your mood each day" },
                { key: "soundEffects",   label: "Sound effects",              desc: "Subtle sounds when messages are sent" },
                { key: "crisisReminder", label: "Show crisis resources",      desc: "Always display the mental health helpline at the bottom of chat" },
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

          {/* ── Danger Zone ── */}
          <section className="rounded-3xl p-6 border-2 border-blush-100 bg-blush-50/50">
            <h2 className="font-semibold text-blush-600 mb-3 flex items-center gap-2">
              <span>⚠️</span> Danger Zone
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-stone-700">Delete account</div>
                <div className="text-xs text-stone-400">Permanently remove your account and all data</div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-2xl border-2 border-blush-300 text-blush-500 text-sm font-medium hover:bg-blush-100 transition-all"
              >
                Delete Account
              </button>
            </div>
          </section>

          {/* ── Save button ── */}
          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-60">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
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

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}
          />

          {/* Modal */}
          <div className="relative glass rounded-3xl p-8 shadow-float w-full max-w-sm animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-3xl bg-blush-100 flex items-center justify-center text-2xl mx-auto mb-4">
                🗑️
              </div>
              <h2 className="font-display text-xl font-bold text-stone-800 mb-1">Delete Account</h2>
              <p className="text-sm text-stone-500">
                This will permanently delete your account, all journal entries, mood logs, and chat history. <strong>This cannot be undone.</strong>
              </p>
            </div>

            {/* Password confirmation (only for email/password users) */}
            {!isGoogleUser && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                  placeholder="Your password"
                  className="input-field"
                  autoFocus
                />
              </div>
            )}

            {deleteError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blush-50 border border-blush-200 text-blush-500 text-sm mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}
                className="btn-secondary flex-1 justify-center"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white text-sm font-medium transition-all disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
