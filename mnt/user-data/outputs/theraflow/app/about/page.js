"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-lavender-100 text-lavender-700 text-sm font-medium">
            About TheraFlow
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-5 leading-tight">
            Therapy, reimagined for the{" "}
            <span className="italic text-sage-600">digital age</span>
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed">
            TheraFlow combines compassionate AI with evidence-inspired
            approaches to help you navigate life&apos;s emotional landscape —
            at your own pace, on your own terms.
          </p>
        </div>

        {/* How it works */}
        <section className="glass rounded-4xl p-8 shadow-soft mb-8 animate-fade-in">
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-4">
            How AI therapy conversations work
          </h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            When you type a message to TheraFlow, it is sent securely to our
            server where an AI language model crafts a thoughtful, empathetic
            response. The AI is guided by a carefully designed prompt that
            instructs it to:
          </p>
          <ul className="space-y-3">
            {[
              "Listen actively and reflect back what you share",
              "Validate your emotions without judgment",
              "Ask gentle, reflective questions to help you explore your feelings",
              "Offer evidence-inspired coping strategies when appropriate",
              "Encourage professional support when situations warrant it",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-stone-600 text-sm">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Mental wellness support */}
        <section className="glass rounded-4xl p-8 shadow-soft mb-8">
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-4">
            Mental wellness support
          </h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            TheraFlow draws on principles from Cognitive Behavioural Therapy
            (CBT), mindfulness, and motivational interviewing to offer
            structured, compassionate guidance. The platform helps you:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🧘", label: "Reduce anxiety & stress" },
              { icon: "🌱", label: "Build emotional resilience" },
              { icon: "💡", label: "Gain self-awareness" },
              { icon: "📓", label: "Process thoughts through journaling" },
              { icon: "📊", label: "Track mood patterns over time" },
              { icon: "🤝", label: "Feel heard and supported" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-sage-50 rounded-2xl px-4 py-3 text-sm text-stone-700">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ethical disclaimer */}
        <section className="bg-blush-50 border border-blush-100 rounded-4xl p-8 shadow-soft mb-8">
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-4">
            ⚠️ Important Disclaimer
          </h2>
          <div className="space-y-3 text-stone-600 text-sm leading-relaxed">
            <p>
              <strong>TheraFlow is not a replacement for professional mental
              health care.</strong> It is a supportive wellness tool, not a
              licensed therapist, psychologist, or psychiatrist.
            </p>
            <p>
              The AI does <strong>not</strong> provide clinical diagnoses,
              prescribe treatment, or offer emergency crisis intervention.
            </p>
            <p>
              If you are experiencing a mental health crisis, thoughts of
              self-harm, or require urgent support, please contact a licensed
              professional or emergency services immediately.
            </p>
            <p className="font-medium text-stone-700">
              🇮🇳 India: iCall — 9152987821 &nbsp;|&nbsp; Vandrevala Foundation — 1860-2662-345
              <br />🌍 International: findahelpline.com
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup" className="btn-primary text-base px-8 py-4">
            Start Your Journey with TheraFlow
          </Link>
        </div>
      </main>
    </div>
  );
}
