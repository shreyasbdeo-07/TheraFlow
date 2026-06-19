"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Smile, 
  MessageSquare, 
  Shield, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Eye, 
  TrendingUp, 
  CreditCard,
  Search,
  Menu,
  X,
  Play,
  BarChart2,
  Users,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

/**
 * TheraFlow Premium About Page - 2026 Edition
 * Optimized for Next.js 14 App Router & Tailwind CSS
 */

// --- Internal UI Components ---

const NavLink = ({ href, children }) => (
  <Link href={href} className="text-slate-400 hover:text-teal-400 font-medium transition-colors text-sm tracking-tight">
    {children}
  </Link>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h4 className="text-white font-bold mb-2 tracking-tight group-hover:text-teal-400 transition-colors">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center space-y-4">
    <div className="w-14 h-14 rounded-full border border-teal-500/30 bg-teal-500/5 flex items-center justify-center text-teal-400 text-xl font-bold shadow-[0_0_15px_rgba(45,212,191,0.1)]">
      {number}
    </div>
    <h4 className="text-white font-bold text-lg">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">{description}</p>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl text-center space-y-1">
    <div className="text-2xl font-bold text-white tracking-tighter">{value}</div>
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
  </div>
);

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-[#0b1326]/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shadow-lg border border-teal-500/20">
              <Zap size={22} fill="currentColor" className="text-teal-400" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">TheraFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <NavLink href="/about">Features</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/privacy">Privacy</NavLink>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-white hover:text-teal-400 transition-colors">Log In</Link>
            <Link href="/signup" className="bg-teal-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg shadow-teal-500/20 hover:bg-teal-300 transition-all active:scale-95">Get Started</Link>
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 relative z-10">
        
        {/* Hero Section */}
        <section className="px-6 text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-5 py-2">
            <Sparkles size={14} className="text-teal-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">The Future of Support</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            Mental Wellness, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-blue-500">Reimagined with AI</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover a private sanctuary where cutting-edge technology meets deep therapeutic insight. TheraFlow is your 24/7 AI companion designed to help you navigate life's complexities with clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="w-full sm:w-auto bg-teal-400 text-slate-950 font-bold py-5 px-12 rounded-2xl text-lg shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all">
              Start Your Journey
            </Link>
            <Link href="/features" className="w-full sm:w-auto bg-slate-800/50 text-white border border-white/10 font-bold py-5 px-12 rounded-2xl text-lg backdrop-blur-md hover:bg-slate-700/50 transition-all">
              Explore Features
            </Link>
          </div>
        </section>

        {/* Mission Section */}
        <section className="px-6 mt-32 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Our Human-Centric Mission</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  We believe mental support should be accessible to everyone, everywhere, at any time. TheraFlow was born from the vision that AI shouldn't replace human connection, but rather bridge the gap for those who need immediate, judgment-free reflection.
                </p>
                <p className="text-slate-400 text-lg leading-relaxed">
                  By combining advanced natural language processing with psychological frameworks, we provide a safe harbor for your thoughts and a roadmap for your emotional growth.
                </p>
              </div>
              <div className="w-full md:w-[400px] aspect-square rounded-[2rem] overflow-hidden bg-slate-950 border border-white/5 relative group">
                <img 
                  src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&h=600&auto=format&fit=crop" 
                  alt="Abstract growth" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-teal-400/20 backdrop-blur-xl border border-teal-500/30 p-4 rounded-2xl">
                    <p className="text-teal-400 text-xs font-bold uppercase tracking-widest text-center">Rooted in Compassion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section className="px-6 mt-32 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          
          {/* Why AI Support? */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Smile className="text-teal-400" size={24} />
                <h3 className="text-3xl font-bold text-white tracking-tight">Why AI Support?</h3>
              </div>
              <p className="text-slate-500 max-w-md">Immediate, scalable, and private care designed for the modern world.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard icon={TrendingUp} title="Growing Demand" description="Global mental health needs are at an all-time high, requiring scalable solutions." />
              <FeatureCard icon={Clock} title="Always Available" description="Instant support at 3 AM or 3 PM. No waitlists, no appointments, just care." />
              <FeatureCard icon={CreditCard} title="Affordable" description="Premium therapeutic frameworks at a fraction of the cost of traditional sessions." />
              <FeatureCard icon={ShieldCheck} title="Judgment-Free" description="A safe space to express anything without fear of bias or social stigma." />
            </div>
          </div>

          {/* Why TheraFlow? */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="text-teal-400" size={24} />
                <h3 className="text-3xl font-bold text-white tracking-tight">Why TheraFlow?</h3>
              </div>
              <p className="text-slate-500 max-w-md">Advanced intelligence mapped to your unique emotional landscape.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard icon={Sparkles} title="Personalized AI" description="Our models learn your communication style to provide deeply relevant responses." />
              <FeatureCard icon={Smile} title="Mood Tracking" description="Visualize your emotional journey with biometric-inspired data visualization." />
              <FeatureCard icon={BookOpen} title="Journal Insights" description="Convert free-form thoughts into actionable psychological patterns." />
              <FeatureCard icon={Users} title="Reflection Paths" description="Guided sessions based on CBT, DBT, and mindfulness practices." />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="px-6 mt-32 max-w-5xl mx-auto text-center space-y-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">The Path to <span className="text-teal-400">Flow</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-7 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
            
            <StepCard number="1" title="Share Your Thoughts" description="Chat naturally with Flow, our advanced AI trained to listen and reflect." />
            <StepCard number="2" title="Track Your Emotions" description="Identify core feelings and triggers through intuitive daily check-ins." />
            <StepCard number="3" title="Discover Insights" description="Receive monthly reports that uncover deep-seated emotional patterns." />
          </div>
        </section>

        {/* Privacy & Safety */}
        <section className="px-6 mt-32 max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">Your Mind is Your Most Private Space.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              We've built TheraFlow from the ground up with a radical commitment to security. In an era of data harvesting, we believe mental health data should be a vault.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {[
              { icon: Lock, title: "End-to-End Encryption", desc: "Your conversations are yours alone. Not even our developers can read them." },
              { icon: Eye, title: "Anonymized Processing", desc: "AI analysis happens on secured local instances to protect your identity." },
              { icon: Shield, title: "No Personal Data Resale", desc: "We will never sell your emotional or mental data to third parties. Ever." },
              { icon: CheckCircle2, title: "GDPR & HIPAA Compliant", desc: "Rigorous standards applied to every layer of our cloud infrastructure." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-[2rem] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-400/10 flex items-center justify-center text-teal-400 shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          
        </section>

        

        {/* Final CTA Banner */}
        <section className="px-6 mt-32 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-teal-400/20 to-blue-500/20 backdrop-blur-3xl border border-teal-400/30 rounded-[3rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">Ready to find <br className="hidden md:block" /> your flow?</h2>
              <p className="text-slate-300 text-lg md:text-xl max-w-xl mx-auto opacity-80">
              Your path to better mental wellness starts here..
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link href="/signup" className="w-full sm:w-auto bg-teal-400 text-slate-950 font-bold py-5 px-16 rounded-2xl text-xl shadow-2xl shadow-teal-500/40 hover:scale-105 active:scale-95 transition-all">
                  Create Account
                </Link>
                <Link href="/login" className="w-full sm:w-auto bg-white/5 text-white border border-white/10 font-bold py-5 px-16 rounded-2xl text-xl backdrop-blur-md hover:bg-white/10 transition-all">
                  Sign In to Account
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>



    </div>
  );
}
