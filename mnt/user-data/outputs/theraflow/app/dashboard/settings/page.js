"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, updateProfile, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { deleteAllUserData } from "@/lib/firestore";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [name, setName]       = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setName(u?.displayName ?? "");
    });
    return unsub;
  }, []);

  async function handleSaveName() {
    if (!user) return;
    setSaving(true);
    await updateProfile(user, { displayName: name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (!user) return;
    await deleteAllUserData(user.uid);
    await deleteUser(user);
    router.push("/");
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-stone-800">Settings</h1>

        {/* Profile */}
        <div className="glass rounded-4xl p-7 shadow-soft animate-fade-in">
          <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Account actions */}
        <div className="glass rounded-4xl p-7 shadow-soft">
          <h2 className="font-display text-lg font-semibold text-stone-800 mb-4">
            Account
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="btn-secondary w-full justify-center"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-4xl p-7 border border-blush-200 bg-blush-50/50">
          <h2 className="font-display text-lg font-semibold text-stone-800 mb-2">
            Danger Zone
          </h2>
          <p className="text-stone-500 text-sm mb-4 leading-relaxed">
            Permanently delete your account and all associated data — chats,
            mood logs, and journal entries. This action cannot be undone.
          </p>

          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              className="px-5 py-2.5 rounded-2xl border border-blush-300 bg-white text-blush-500 text-sm font-medium hover:bg-blush-50 transition-colors"
            >
              Delete my account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-stone-700 text-sm font-medium">
                Are you absolutely sure? All your data will be lost forever.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="px-5 py-2.5 rounded-2xl bg-blush-500 text-white text-sm font-medium hover:bg-blush-600 transition-colors"
                >
                  Yes, delete everything
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
