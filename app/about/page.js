"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const values = [
  {
    icon: "🛡️",
    title: "Privacy First",
    desc: "Your conversations are yours alone. We never sell your data or share your sessions with third parties.",
  },
  {
    icon: "🤝",
    title: "Judgment-Free",
    desc: "No topic is off-limits here. TheraFlow is designed to listen with empathy, never criticism.",
  },
  {
    icon: "🧪",
    title: "Evidence-Inspired",
    desc: "Our approach draws from Cognitive Behavioral Therapy (CBT), mindfulness, and positive psychology.",
  },
  {
    icon: "🌍",
    title: "Accessible to All",
    desc: "Mental wellness support shouldn't be a luxury. TheraFlow is free to start, anytime, anywhere.",
  },
];

const team = [
  {
    emoji: "🧠",
    name: "Shreyas",
    role: "Co-Founder & AI Lead",
    bio: "Passionate about making mental health support accessible through thoughtful AI design.",
  },
  {
    emoji: "🎨",
    name: "Priya",
    role: "Co-Founder & Design Lead",
    bio: "Crafting calm, human-centered experiences that feel safe and inviting.",
  },
  {
    emoji: "💻",
    name: "Arjun",
    role: "Full-Stack Engineer",
    bio: "Building the secure, reliable infrastructure that keeps TheraFlow running 24/7.",
  },
];

const stats = [
  { number: "10K+", label: "Sessions Completed" },
  { number: "4.9★", label: "Average Rating" },
  { number: "24/7", label: "Always Available" },
  { number: "100%", label: "Private & Secure" },
];

const faqs = [
  {
    q: "Is TheraFlow a replacement for a real therapist?",
    a: "No. TheraFlow is a supportive companion tool for everyday emotional wellness. If you are experiencing a mental health crisis, please reach out to a licensed professional or a crisis helpline.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your conversations are encrypted and stored securely. We never sell your data. You can delete your account and all associated data at any time.",
  },
  {
    q: "How does the AI work?",
    a: "TheraFlow uses a large language model fine-tuned with principles from CBT and mindfulness-based therapy. It is designed to validate emotions, ask reflective questions, and gently suggest coping strategies.",
  },
  {
    q: "Is TheraFlow free?",
    a: "Yes — you can start for free with no credit card required. We believe quality mental wellness support should be accessible to everyone.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sage-100 opacity-50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-lavender-100 opacity-40 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto animate-fade-in">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-sage-100 text-sage-700 text-sm font-medium tracking-wide">
            🌿 Our Story
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-stone-800 leading-tight mb-6">
            Built with{" "}
            <span className="italic text-sage-600">compassion</span> in mind
          </h1>
          <p className="text-lg md:text-xl text-stone-500 font-body font-light max-w-2xl mx-auto leading-relaxed">
            TheraFlow was created because we believe everyone deserves a safe,
            private space to process their emotions — without waiting weeks for
            an appointment or worrying about being judged.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="glass rounded-3xl p-6 text-center shadow-soft"
            >
              <div className="font-display text-3xl font-bold text-sage-600 mb-1">
                {s.number}
              </div>
              <div className="text-stone-500 text-xs font-medium uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block mb-3 px-3 py-1 rounded-full bg-lavender-100 text-lavender-700 text-xs font-medium tracking-wide">
              Our Mission
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-800 mb-5 leading-snug">
              Making mental wellness{" "}
              <span className="italic text-sage-600">radically accessible</span>
            </h2>
            <p className="text-stone-500 leading-relaxed mb-4">
              One in four people globally will experience a mental health
              challenge, yet most never receive support. Long wait times,
              stigma, and cost remain the biggest barriers.
            </p>
            <p className="text-stone-500 leading-relaxed mb-6">
              TheraFlow bridges that gap — offering a compassionate, always-on
              AI companion that helps you understand your emotions, build
              healthy habits, and feel heard without judgment.
            </p>
            <Link href="/signup" className="btn-primary text-sm px-7 py-3">
              Start for Free
            </Link>
          </div>

          {/* Visual card */}
          <div className="glass rounded-4xl p-8 shadow-float">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center text-xl flex-shrink-0">
                🌿
              </div>
              <div className="bg-sage-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-700 leading-relaxed">
                I&apos;m here with you. What&apos;s been on your mind lately?
              </div>
            </div>
            <div className="flex items-start gap-3 justify-end mb-5">
              <div className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-stone-700 border border-stone-100 shadow-sm leading-relaxed">
                Work has been really stressful. I can&apos;t seem to switch off.
              </div>
              <div className="w-10 h-10 rounded-2xl bg-lavender-100 flex items-center justify-center text-xl flex-shrink-0">
                😔
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center text-xl flex-shrink-0">
                🌿
              </div>
              <div className="bg-sage-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-700 leading-relaxed">
                That sounds exhausting. Let&apos;s explore what&apos;s driving
                that feeling together — there&apos;s no rush. 💙
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-stone-800 mb-3">
            What we stand for
          </h2>
          <p className="text-center text-stone-500 mb-14 max-w-lg mx-auto">
            Every decision at TheraFlow is guided by a commitment to your
            wellbeing, safety, and dignity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="glass rounded-3xl p-7 shadow-soft hover:shadow-card transition-shadow duration-300"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-display text-xl font-semibold text-stone-800 mb-2">
                  {v.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-stone-800 mb-3">
            Meet the team
          </h2>
          <p className="text-center text-stone-500 mb-14 max-w-lg mx-auto">
            We&apos;re a small, passionate group of developers, designers, and
            mental-health advocates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className="glass rounded-3xl p-7 shadow-soft text-center">
                <div className="w-16 h-16 rounded-2xl bg-sage-50 flex items-center justify-center text-4xl mx-auto mb-4">
                  {member.emoji}
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-800 mb-0.5">
                  {member.name}
                </h3>
                <div className="text-sage-600 text-xs font-medium mb-3 uppercase tracking-wider">
                  {member.role}
                </div>
                <p className="text-stone-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-stone-800 mb-3">
            Common questions
          </h2>
          <p className="text-center text-stone-500 mb-14">
            Everything you&apos;d want to know before getting started.
          </p>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-3xl p-7 shadow-soft">
                <h3 className="font-display text-base font-semibold text-stone-800 mb-2">
                  {faq.q}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto glass rounded-4xl p-12 text-center shadow-float">
          <div className="text-4xl mb-5">🌸</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Ready to begin?
          </h2>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Join thousands of people who have already found a little more peace
            with TheraFlow. Start for free — no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-base px-10 py-4">
              Create Free Account
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-stone-100 text-center">
        <div className="text-stone-800 font-display text-xl font-bold mb-2">
          TheraFlow
        </div>
        <div className="flex justify-center gap-6 text-sm text-stone-400 mb-4">
          <Link href="/about" className="hover:text-sage-600 transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-sage-600 transition-colors">
            Privacy
          </Link>
          <Link href="/login" className="hover:text-sage-600 transition-colors">
            Login
          </Link>
        </div>
        <p className="text-xs text-stone-300">
          © {new Date().getFullYear()} TheraFlow. For support &amp; wellness only — not a replacement for professional mental health care.
        </p>
      </footer>
    </div>
  );
}
