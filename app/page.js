"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── Feature card data ─────────────────────────────────────
const features = [
  {
    icon: "💬",
    title: "Compassionate Conversations",
    desc: "Talk freely with an AI trained to listen without judgment, validate your emotions, and guide you toward clarity.",
  },
  {
    icon: "📊",
    title: "Mood Tracking",
    desc: "Log how you feel daily and visualize your emotional patterns over time with a gentle, intuitive tracker.",
  },
  {
    icon: "📓",
    title: "Personal Journal",
    desc: "Capture your thoughts in a private, secure space. Reflect, process, and grow at your own pace.",
  },
  {
    icon: "🌿",
    title: "Coping Suggestions",
    desc: "Receive gentle, evidence-inspired strategies for stress, anxiety, and difficult emotions — personalized to you.",
  },
];

const testimonials = [
  {
    quote: "TheraFlow feels like a warm conversation rather than a clinical tool. It helped me understand my anxiety patterns.",
    name: "Priya M.",
    role: "Graphic Designer",
  },
  {
    quote: "I was skeptical at first, but the daily check-ins became a habit. It's like journaling but with a kind voice guiding me.",
    name: "James T.",
    role: "Software Engineer",
  },
  {
    quote: "Having a safe space available at 2 AM when anxiety peaks has been life-changing for me.",
    name: "Sofia R.",
    role: "Graduate Student",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sage-100 opacity-50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-lavender-100 opacity-40 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto animate-fade-in">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-sage-100 text-sage-700 text-sm font-medium tracking-wide">
            🌱 Your Mental Wellness Companion
          </span>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-800 leading-tight mb-6">
            A Safe Space to{" "}
            <span className="italic text-sage-600">Talk</span>, Reflect &amp;
            Heal
          </h1>

          <p className="text-lg md:text-xl text-stone-500 font-body font-light max-w-xl mx-auto mb-10 leading-relaxed">
            TheraFlow is a calm, private AI therapist available anytime. Share
            what&apos;s on your mind — no appointments, no judgment, just
            compassionate support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-base px-8 py-4">
              Start Your Journey
            </Link>
            <Link href="/about" className="btn-secondary text-base px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>

        {/* ── Mini chat preview ── */}
        <div className="relative mt-16 max-w-lg w-full glass rounded-4xl shadow-float p-6 text-left">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-sage-100 flex items-center justify-center text-lg flex-shrink-0">🌿</div>
            <div className="bg-sage-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-700 leading-relaxed">
              Hi there 👋 I&apos;m <strong>TheraFlow</strong>. How are you feeling today? You can share as much or as little as you&apos;d like.
            </div>
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-stone-700 border border-stone-100 leading-relaxed shadow-sm">
              I&apos;ve been feeling a bit overwhelmed lately...
            </div>
            <div className="w-9 h-9 rounded-2xl bg-lavender-100 flex items-center justify-center text-lg flex-shrink-0">😌</div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-stone-800 mb-3">
            Everything you need to feel better
          </h2>
          <p className="text-center text-stone-500 mb-14 max-w-xl mx-auto">
            TheraFlow combines gentle AI therapy, emotional tracking, and
            private journaling in one calm space.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass rounded-3xl p-7 shadow-soft hover:shadow-card transition-shadow duration-300"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">
                  {f.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-stone-800 mb-14">
            What people are saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass rounded-3xl p-7 shadow-soft">
                <p className="text-stone-600 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-stone-800 text-sm">{t.name}</div>
                  <div className="text-stone-400 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto glass rounded-4xl p-12 text-center shadow-float">
          <div className="text-4xl mb-5">🌸</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            You don&apos;t have to carry it alone
          </h2>
          <p className="text-stone-500 mb-8 leading-relaxed">
            TheraFlow is here whenever you need a compassionate presence. Start
            for free — no credit card, no commitments.
          </p>
          <Link href="/signup" className="btn-primary text-base px-10 py-4">
            Begin Your Healing Journey
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-stone-100 text-center">
        <div className="text-stone-800 font-display text-xl font-bold mb-2">
          TheraFlow
        </div>
        <div className="flex justify-center gap-6 text-sm text-stone-400 mb-4">
          <Link href="/about" className="hover:text-sage-600 transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-sage-600 transition-colors">Privacy</Link>
          <Link href="/login" className="hover:text-sage-600 transition-colors">Login</Link>
        </div>
        <p className="text-xs text-stone-300">
          © {new Date().getFullYear()} TheraFlow. For support &amp; wellness only — not a replacement for professional mental health care.
        </p>
      </footer>
    </div>
  );
}
