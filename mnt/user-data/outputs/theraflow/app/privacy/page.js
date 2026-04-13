"use client";
import Navbar from "@/components/Navbar";

const sections = [
  {
    icon: "🔒",
    title: "Your conversations are private",
    body: "All chat messages are stored securely in Firebase Firestore under your authenticated user account. Only you can access your conversations. We do not share, sell, or use your conversation data for advertising.",
  },
  {
    icon: "🛡️",
    title: "Data security",
    body: "TheraFlow uses Firebase Authentication for secure login with encrypted credentials. All data is transmitted over HTTPS. Firebase Firestore applies row-level security rules so only the authenticated user can read or write their own data.",
  },
  {
    icon: "🤖",
    title: "AI processing",
    body: "When you send a message, it is transmitted to our secure backend API route — never directly to any external LLM provider from your browser. Your API key is stored only in server-side environment variables and is never exposed to the client.",
  },
  {
    icon: "🗑️",
    title: "Your right to delete",
    body: "You can delete individual conversations or your entire account at any time from the Settings page. Deletion is permanent and irreversible — all associated messages, mood logs, and journal entries are removed.",
  },
  {
    icon: "🍪",
    title: "Cookies & analytics",
    body: "TheraFlow does not use third-party advertising cookies or behavioral tracking. We may use minimal session cookies required for Firebase Authentication to keep you logged in.",
  },
  {
    icon: "👶",
    title: "Age requirement",
    body: "TheraFlow is intended for users aged 18 and older. We do not knowingly collect data from minors. If you believe a minor has created an account, please contact us immediately.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-sky-100 text-sky-700 text-sm font-medium">
            Privacy & Safety
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-5 leading-tight">
            Your privacy is our{" "}
            <span className="italic text-sage-600">foundation</span>
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed">
            We understand that emotional conversations require absolute trust.
            Here is exactly how TheraFlow protects your data and your dignity.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((s, i) => (
            <div key={i} className="glass rounded-3xl p-7 shadow-soft animate-fade-in">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-stone-800 mb-2">
                    {s.title}
                  </h2>
                  <p className="text-stone-600 text-sm leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 glass rounded-3xl p-7 text-center shadow-soft">
          <p className="text-stone-500 text-sm">
            Questions about privacy?{" "}
            <a
              href="mailto:privacy@theraflow.app"
              className="text-sage-600 hover:underline font-medium"
            >
              privacy@theraflow.app
            </a>
          </p>
          <p className="text-stone-400 text-xs mt-2">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </main>
    </div>
  );
}
