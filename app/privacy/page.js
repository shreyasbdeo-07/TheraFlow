import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — TheraFlow",
  description:
    "Learn how TheraFlow collects, uses, and protects your personal data and mental wellness information.",
};

const sections = [
  {
    icon: "🔒",
    title: "Your Privacy Comes First",
    content: `TheraFlow is built on a foundation of trust. We understand that what you share here is deeply personal — your thoughts, feelings, and emotional struggles. We treat every piece of information you provide with the highest level of care and discretion.

We will never sell, rent, or trade your personal data to third parties. Your mental health conversations are yours alone.`,
  },
  {
    icon: "📋",
    title: "What We Collect",
    content: `We collect only what is necessary to provide you with a personalized, secure experience:`,
    list: [
      "**Account information** — your name and email address when you sign up",
      "**Chat messages** — your conversations with the TheraFlow AI companion, stored securely in your private account",
      "**Mood logs** — daily emotional check-in data you choose to record",
      "**Journal entries** — personal notes you write within the app",
      "**App preferences** — your chosen theme, AI personality, and notification settings",
    ],
  },
  {
    icon: "🚫",
    title: "What We Don't Collect",
    content: `We are intentional about what we do NOT collect:`,
    list: [
      "We do not collect your location",
      "We do not track your browsing activity outside of TheraFlow",
      "We do not use advertising trackers or sell data to advertisers",
      "We do not share your conversations with any human (except as required by law)",
      "We do not use your data to train AI models without your explicit consent",
    ],
  },
  {
    icon: "🤖",
    title: "How the AI Works",
    content: `Your messages are sent to a third-party AI provider (Google Gemini) to generate responses. These messages are transmitted securely over HTTPS. The AI provider processes your message to generate a reply and does not permanently store your conversation on their end beyond what is needed for the request.

TheraFlow's backend acts as a secure proxy — your API keys and credentials are never exposed to the browser.`,
  },
  {
    icon: "🔐",
    title: "How We Protect Your Data",
    content: `We use industry-standard security practices to keep your data safe:`,
    list: [
      "All data is stored in Google Firebase (Firestore), a SOC 2 compliant cloud platform",
      "Your data is protected by Firestore Security Rules — only you can read or write your own data",
      "All communication between your device and our servers uses HTTPS/TLS encryption",
      "Passwords are managed by Firebase Authentication and are never stored in plaintext",
      "API keys and secrets are stored server-side only and never exposed to the browser",
    ],
  },
  {
    icon: "👤",
    title: "Your Rights & Controls",
    content: `You are in full control of your data at all times:`,
    list: [
      "**Access** — You can view all your data within the app at any time",
      "**Delete** — You can permanently delete your account and all associated data from Settings → Danger Zone",
      "**Export** — Contact us if you'd like a copy of your data",
      "**Correction** — You can update your name and email in Settings at any time",
    ],
  },
  {
    icon: "🍪",
    title: "Cookies & Local Storage",
    content: `TheraFlow uses minimal browser storage:`,
    list: [
      "Firebase Authentication uses cookies to keep you securely logged in",
      "Your theme preference is stored in localStorage so it persists across visits",
      "We do not use third-party advertising or tracking cookies",
    ],
  },
  {
    icon: "🧒",
    title: "Children's Privacy",
    content: `TheraFlow is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately and we will delete it.`,
  },
  {
    icon: "📝",
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the bottom of this page. We encourage you to review this page periodically. Continued use of TheraFlow after changes constitutes your acceptance of the updated policy.`,
  },
  {
    icon: "✉️",
    title: "Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please reach out to us. We take every privacy concern seriously and will respond promptly.

You can also reach us through the TheraFlow app by visiting Settings.`,
  },
];

function renderContent(text) {
  return text.split("\n\n").map((para, i) => (
    <p key={i} className="text-stone-600 text-sm leading-relaxed mb-3 last:mb-0">
      {para.split(/\*\*(.*?)\*\*/g).map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="text-stone-700 font-semibold">{part}</strong> : part
      )}
    </p>
  ));
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-stone-800 hover:opacity-80 transition-opacity">
            TheraFlow
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">About</Link>
            <Link href="/login" className="btn-primary text-sm px-4 py-2">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sage-100 to-lavender-100 flex items-center justify-center text-3xl mx-auto mb-6 shadow-soft">
          🔒
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-4">
          Privacy Policy
        </h1>
        <p className="text-stone-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Your mental health data deserves the highest level of protection. Here&apos;s exactly how we handle your information — no jargon, no fine print.
        </p>
        <p className="text-xs text-stone-400 mt-4">Last updated: May 7, 2026</p>
      </div>

      {/* Crisis notice */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="glass rounded-3xl p-5 border border-sage-200/60 flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">💚</span>
          <div>
            <div className="font-semibold text-stone-700 text-sm mb-1">A note on crisis situations</div>
            <p className="text-xs text-stone-500 leading-relaxed">
              TheraFlow is an AI wellness companion, not a licensed mental health service. If you are in crisis or danger, please contact emergency services or a crisis helpline immediately.
              <span className="font-semibold text-stone-600"> iCall India: 9152987821 · Vandrevala Foundation: 1860-2662-345 (24/7)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-6">
        {sections.map((section, i) => (
          <section key={i} className="glass rounded-3xl p-7 shadow-soft">
            <h2 className="font-display text-xl font-bold text-stone-800 mb-4 flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              {section.title}
            </h2>
            {renderContent(section.content)}
            {section.list && (
              <ul className="mt-3 space-y-2">
                {section.list.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-stone-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0 mt-2" style={{ backgroundColor: "var(--theme-primary)" }} />
                    <span>
                      {item.split(/\*\*(.*?)\*\*/g).map((part, k) =>
                        k % 2 === 1 ? <strong key={k} className="text-stone-700 font-semibold">{part}</strong> : part
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-100 bg-white/60 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <span>© 2026 TheraFlow. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-stone-600 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-stone-600 transition-colors">About</Link>
            <Link href="/login" className="hover:text-stone-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
