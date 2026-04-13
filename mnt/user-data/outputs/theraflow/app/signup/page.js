"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocument } from "@/lib/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Attach display name to the Firebase Auth user
      await updateProfile(credential.user, { displayName: name });
      // Create Firestore user document
      await createUserDocument(credential.user.uid, { name, email });
      router.push("/dashboard");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email":        "Please enter a valid email address.",
        "auth/weak-password":        "Password should be at least 6 characters.",
      };
      setError(msgs[err.code] ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-lavender-100 opacity-40 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full bg-sage-100 opacity-30 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl font-bold text-stone-800">TheraFlow</span>
          </Link>
          <p className="text-stone-400 text-sm mt-1">Start your wellness journey 🌸</p>
        </div>

        <div className="glass rounded-4xl p-8 shadow-float">
          <h1 className="font-display text-2xl font-bold text-stone-800 mb-6 text-center">
            Create your safe space
          </h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-blush-50 border border-blush-200 text-blush-500 text-sm rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should TheraFlow call you?"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating…
                </span>
              ) : (
                "Create My Account"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 mt-4 leading-relaxed">
            By signing up you agree that TheraFlow is a wellness tool, not a
            licensed therapy service.
          </p>

          <p className="text-center text-sm text-stone-400 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-sage-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
