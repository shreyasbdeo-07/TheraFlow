"use client";
import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "No account found with that email.",
        "auth/invalid-email":  "Please enter a valid email address.",
      };
      setError(msgs[err.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-16">
      <div className="pointer-events-none fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-sage-100 opacity-40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-lavender-100 opacity-30 blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-in">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-sage-600 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        <div className="glass rounded-4xl p-8 shadow-float">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sage-100 to-lavender-100 flex items-center justify-center text-3xl mx-auto mb-5 shadow-soft">
                📬
              </div>
              <h1 className="font-display text-2xl font-bold text-stone-800 mb-2">Check your inbox</h1>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/login" className="btn-primary justify-center w-full py-3">
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-sage-100 to-lavender-100 flex items-center justify-center text-2xl mx-auto mb-4 shadow-soft">
                  🔑
                </div>
                <h1 className="font-display text-3xl font-bold text-stone-800 mb-1">Reset password</h1>
                <p className="text-stone-400 text-sm">We&apos;ll send a reset link to your email</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5" htmlFor="reset-email">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blush-50 border border-blush-200 text-blush-500 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
