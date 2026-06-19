"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  ChevronLeft,
  Camera,
  Mail,
  Lock,
  LogOut,
  ChevronRight,
  Shield,
  Eye,
  Trash2,
  CheckCircle2,
  User,
  AlertTriangle,
  X,
  Loader2,
  Check,
  Bell,
  Smartphone,
  KeyRound,
  ImageIcon,
} from "lucide-react";
import {
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { deleteAllUserData } from "@/lib/firestore";

// ─────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────

const SettingsSection = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1">
      {title}
    </h3>
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ icon: Icon, label, value, last = false, onClick, children, accent = "teal" }) => {
  const accentMap = {
    teal: "group-hover:text-teal-400",
    red: "group-hover:text-red-400",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center justify-between p-5 group transition-colors hover:bg-white/5 focus:outline-none ${!last ? "border-b border-white/5" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 transition-colors ${accentMap[accent]}`}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-white">{label}</span>
          {value && <span className="text-[11px] text-slate-500 font-medium">{value}</span>}
        </div>
      </div>
      {children ?? <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />}
    </button>
  );
};

/* Inline expandable form panel */
const ExpandPanel = ({ isOpen, children }) => (
  <div
    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
  >
    <div className="px-5 pb-5 space-y-3">{children}</div>
  </div>
);

/* Shared input style */
const Input = ({ label, id, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
    )}
    <input
      id={id}
      {...props}
      className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/30 transition-all"
    />
  </div>
);

/* Status banner */
const StatusBanner = ({ type, message, onDismiss }) => {
  if (!message) return null;
  const styles = {
    success: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
  const icons = { success: Check, error: AlertTriangle, info: Bell };
  const Icon = icons[type] ?? Bell;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border text-sm font-medium ${styles[type]}`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

/* Spinner */
const Spinner = ({ size = 16 }) => (
  <Loader2 size={size} className="animate-spin" />
);

// ─────────────────────────────────────────────────────────
// DELETE ACCOUNT MODAL
// ─────────────────────────────────────────────────────────

function DeleteAccountModal({ onClose, onConfirm, isDeleting }) {
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const valid = confirmText === "DELETE" && password.length >= 6;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* panel */}
      <div className="relative w-full max-w-md bg-[#0e1a2e] border border-red-500/20 rounded-[2rem] p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Delete Account</h2>
              <p className="text-[11px] text-slate-500 font-medium">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4 space-y-1.5 text-sm text-slate-400">
          <p className="font-semibold text-red-400">This will permanently delete:</p>
          <ul className="space-y-1 list-disc list-inside text-[13px]">
            <li>Your account & login credentials</li>
            <li>All chat history & conversations</li>
            <li>All mood logs & journal entries</li>
            <li>All personal data from our servers</li>
          </ul>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Input
            id="delete-password"
            label="Current Password (to verify identity)"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            id="delete-confirm"
            label='Type "DELETE" to confirm'
            type="text"
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800/50 border border-white/5 text-slate-300 font-semibold text-sm hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(password)}
            disabled={!valid || isDeleting}
            className="flex-1 py-3 rounded-2xl bg-red-500/80 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isDeleting ? <Spinner /> : <Trash2 size={16} />}
            {isDeleting ? "Deleting…" : "Delete Everything"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ── Panel open states ──
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Profile form ──
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null); // { type, message }

  // ── Password form ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // ── Logout ──
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Account deletion ──
  const [deleting, setDeleting] = useState(false);

  // Sync local form state when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
      setPhotoURL(user.photoURL ?? "");
    }
  }, [user]);

  // ── Auth guard ──
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1326]">
        <span className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Helpers ──
  const clearAfter = (setter, ms = 4000) =>
    setTimeout(() => setter(null), ms);

  // ── Handlers ──
  async function handleUpdateProfile(e) {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setProfileStatus({ type: "error", message: "Display name cannot be empty." });
      return;
    }
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoURL.trim() || null,
      });
      setProfileStatus({ type: "success", message: "Profile updated successfully!" });
      setEditProfileOpen(false);
      clearAfter(setProfileStatus);
    } catch (err) {
      setProfileStatus({ type: "error", message: err.message });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    setPasswordStatus(null);
    try {
      // Re-authenticate before sensitive operation
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordStatus({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePasswordOpen(false);
      clearAfter(setPasswordStatus);
    } catch (err) {
      const msg =
        err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
          ? "Current password is incorrect."
          : err.code === "auth/requires-recent-login"
          ? "Session expired. Please log out and log back in, then try again."
          : err.message;
      setPasswordStatus({ type: "error", message: msg });
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      setLoggingOut(false);
    }
  }

  async function handleDeleteAccount(password) {
    setDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteAllUserData(user.uid);
      await deleteUser(auth.currentUser);
      router.push("/");
    } catch (err) {
      setDeleting(false);
      setShowDeleteModal(false);
      // Surface error to user via a brief banner
      setProfileStatus({
        type: "error",
        message:
          err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
            ? "Incorrect password. Account deletion aborted."
            : err.message,
      });
      clearAfter(setProfileStatus, 6000);
    }
  }

  // ── Avatar helpers ──
  const avatarSrc = user.photoURL;
  const initials = (user.displayName ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col min-h-full bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden pb-16">

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          isDeleting={deleting}
        />
      )}

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-md bg-[#0b1326]/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-sm font-bold text-white tracking-[0.1em] uppercase">Settings</h1>
        </div>
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
          <Zap size={18} fill="currentColor" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-8 space-y-8 relative z-10">

        {/* Global status banners */}
        {profileStatus && (
          <StatusBanner
            type={profileStatus.type}
            message={profileStatus.message}
            onDismiss={() => setProfileStatus(null)}
          />
        )}

        {/* ── Profile Card ── */}
        <section className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden border-2 border-teal-400/30 shadow-2xl shadow-teal-400/10 bg-slate-800">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-teal-400 bg-gradient-to-br from-teal-500/20 to-blue-500/20">
                  {initials}
                </div>
              )}
            </div>
            {/* Edit overlay */}
            <button
              onClick={() => { setEditProfileOpen((o) => !o); setChangePasswordOpen(false); }}
              className="absolute bottom-1 right-1 w-10 h-10 rounded-2xl bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="Edit profile"
            >
              <Camera size={18} />
            </button>
          </div>

          {/* Name & email */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {user.displayName || "Your Name"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-teal-400 mt-2 bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/20">
              <CheckCircle2 size={12} />
              Verified Account
            </div>
          </div>
        </section>

        {/* ── Edit Profile Section ── */}
        <SettingsSection title="Profile">
          <SettingsRow
            icon={User}
            label="Edit Display Name"
            value={user.displayName || "Not set"}
            onClick={() => { setEditProfileOpen((o) => !o); setChangePasswordOpen(false); }}
          >
            <ChevronRight
              size={18}
              className={`text-slate-600 transition-all ${editProfileOpen ? "rotate-90 text-teal-400" : ""}`}
            />
          </SettingsRow>

          {/* Edit Profile Form */}
          <ExpandPanel isOpen={editProfileOpen}>
            <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
              <Input
                id="displayName"
                label="Display Name"
                type="text"
                placeholder="Your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
              <Input
                id="photoURL"
                label="Profile Photo URL (optional)"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
              {/* Preview */}
              {photoURL && (
                <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5">
                  <img
                    src={photoURL}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                    onError={(e) => { e.currentTarget.src = ""; e.currentTarget.style.display = "none"; }}
                  />
                  <span className="text-xs text-slate-400 font-medium">Photo preview</span>
                </div>
              )}
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-3 rounded-2xl bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {profileSaving ? <Spinner /> : <Check size={16} />}
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </ExpandPanel>

          {/* Email (read-only) */}
          <SettingsRow icon={Mail} label="Email Address" value={user.email} last onClick={() => {}}>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Read-only</span>
          </SettingsRow>
        </SettingsSection>

        {/* ── Security Section ── */}
        <SettingsSection title="Security">
          <SettingsRow
            icon={KeyRound}
            label="Change Password"
            value="Update your login password"
            onClick={() => { setChangePasswordOpen((o) => !o); setEditProfileOpen(false); }}
          >
            <ChevronRight
              size={18}
              className={`text-slate-600 transition-all ${changePasswordOpen ? "rotate-90 text-teal-400" : ""}`}
            />
          </SettingsRow>

          {/* Change Password Form */}
          <ExpandPanel isOpen={changePasswordOpen}>
            <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
              {passwordStatus && (
                <StatusBanner
                  type={passwordStatus.type}
                  message={passwordStatus.message}
                  onDismiss={() => setPasswordStatus(null)}
                />
              )}
              <Input
                id="currentPassword"
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Input
                id="newPassword"
                label="New Password"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {/* Password match indicator */}
              {newPassword && confirmPassword && (
                <div className={`flex items-center gap-2 text-[12px] font-semibold ${newPassword === confirmPassword ? "text-teal-400" : "text-red-400"}`}>
                  {newPassword === confirmPassword
                    ? <><Check size={12} /> Passwords match</>
                    : <><X size={12} /> Passwords do not match</>}
                </div>
              )}
              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-3 rounded-2xl bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {passwordSaving ? <Spinner /> : <Lock size={16} />}
                {passwordSaving ? "Updating…" : "Update Password"}
              </button>
            </form>
          </ExpandPanel>

          <SettingsRow icon={Shield} label="Account Provider" value="Email & Password" last onClick={() => {}}>
            <span className="text-[10px] font-bold text-teal-400/80 uppercase tracking-wider bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">Active</span>
          </SettingsRow>
        </SettingsSection>

        {/* ── Danger Zone ── */}
        <div className="pt-2 space-y-3">
          {/* Sign Out */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-5 rounded-[2rem] bg-slate-900/40 border border-white/5 text-slate-400 font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/5 hover:text-white disabled:opacity-50 transition-all"
          >
            {loggingOut ? <Spinner size={18} /> : <LogOut size={18} />}
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-5 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all group"
          >
            <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
            Delete Account &amp; Purge Data
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-8 space-y-2">
          <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Support</Link>
          </div>
          <p className="text-[10px] text-slate-700 font-medium">v2.4.1-premium • TheraFlow Intelligence 2026</p>
        </div>

      </main>
    </div>
  );
}
