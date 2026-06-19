"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Mail, 
  Trash2, 
  History, 
  Download, 
  AlertCircle,
  ChevronLeft,
  Settings,
  Smile,
  LayoutDashboard,
  FileText,
  UserCheck,
  Cpu
} from 'lucide-react';

/**
 * TheraFlow Premium Privacy Policy Page
 * Optimized for Next.js 14 App Router & Tailwind CSS
 * Aesthetic: Obsidian Dark, Glassmorphism, Teal Accents
 */

// --- Internal UI Components ---

const PolicySection = ({ title, icon: Icon, children }) => (
  <section className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-4">
      {children}
    </div>
  </section>
);

const UserRightCard = ({ title, description, icon: Icon }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
    <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-teal-400 transition-colors">
      <Icon size={18} />
    </div>
    <div className="flex-1 space-y-1">
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md bg-[#0b1326]/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center shadow-lg border border-teal-500/20">
              <Zap size={18} fill="currentColor" className="text-teal-400" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">TheraFlow</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-12 max-w-4xl mx-auto space-y-16 relative z-10">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-5 py-2">
            <Shield size={14} className="text-teal-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Privacy Commitment</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">Your Privacy <span className="text-teal-400">Matters</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            At TheraFlow, we believe vulnerability requires absolute safety. Our platform is designed as a sanctuary where your thoughts, moods, and journeys are shielded by world-class security and ethical AI practices.
          </p>
        </section>

        {/* Information We Collect */}
        <PolicySection title="Information We Collect" icon={Database}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-teal-400">Account Information</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Name, email address, and authentication credentials used to secure your personal vault.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-teal-400">Wellness Data</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Daily mood logs, sleep patterns, and focus areas you voluntarily provide for tracking.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-teal-400">Journal Entries</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Private reflections and written notes stored with end-to-end encryption protocols.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-teal-400">AI Chat Logs</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Anonymized interactions with our wellness AI to improve your personalized guidance.</p>
            </div>
          </div>
        </PolicySection>

        {/* How We Use Information */}
        <PolicySection title="How We Use Information" icon={Cpu}>
          <p className="text-sm text-slate-400 leading-relaxed">
            We use your data strictly to facilitate your wellness journey. This includes providing tailored insights, mood predictions, and relevant mindfulness exercises that align with your current state of mind.
          </p>
          <div className="pt-4 space-y-3">
            {[
              "Personalizing your therapeutic AI interactions.",
              "Visualizing emotional trends and resilience metrics.",
              "Ensuring the security and integrity of your account.",
              "Aggregating de-identified data to improve our wellness models."
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Data Security */}
        <PolicySection title="Data Security & Protection" icon={Lock}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/10 flex items-center justify-center text-teal-400 mx-auto">
                <Shield size={24} />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">AES-256 Encryption</h4>
              <p className="text-[10px] text-slate-500">Your data is encrypted at rest and in transit using military-grade protocols.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/10 flex items-center justify-center text-teal-400 mx-auto">
                <Eye size={24} />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Biometric Auth</h4>
              <p className="text-[10px] text-slate-500">Support for FaceID and Fingerprint locking for secure mobile access.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-400/10 flex items-center justify-center text-teal-400 mx-auto">
                <Lock size={24} />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Zero-Access</h4>
              <p className="text-[10px] text-slate-500">Our engineers cannot read your private journal entries or specific mood details.</p>
            </div>
          </div>
        </PolicySection>

        {/* User Rights */}
        <PolicySection title="Your Rights & Control" icon={UserCheck}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UserRightCard 
              icon={Download} 
              title="Request Data Export" 
              description="Download a machine-readable copy of your entire history at any time." 
            />
            <UserRightCard 
              icon={Trash2} 
              title="Right to Erasure" 
              description="Permanently delete your account and all associated data from our servers." 
            />
            <UserRightCard 
              icon={FileText} 
              title="Data Correction" 
              description="Update or rectify any inaccurate personal information on your profile." 
            />
            <UserRightCard 
              icon={History} 
              title="Retention Control" 
              description="Set custom durations for how long we store specific types of interaction data." 
            />
          </div>
        </PolicySection>

        {/* AI Processing Callout */}
        <section className="bg-gradient-to-br from-teal-400/20 to-blue-500/10 border border-teal-400/30 rounded-[3rem] p-10 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-teal-400/20 flex items-center justify-center text-teal-400 shadow-inner shrink-0">
               <Cpu size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Privacy-First AI</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                TheraFlow uses Generative AI to facilitate wellness conversations. These interactions are processed using <span className="text-teal-400 font-bold underline decoration-teal-400/30">Private Compute Instances</span>. Your conversations are NOT used to train global AI models without your explicit, separate opt-in.
              </p>
            </div>
          </div>
        </section>

        {/* Contact & Legal Footer */}
        <section className="space-y-12 pb-12">
          <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-sm font-bold text-white">Contact Privacy Team</h4>
              <p className="text-xs text-slate-500">Questions about your data? Reach out to our dedicated privacy officers.</p>
            </div>
            <button className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-sm font-bold text-teal-400 hover:bg-white/10 transition-all active:scale-95">
              <Mail size={18} />
              privacy@theraflow.ai
            </button>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 flex items-start gap-4">
            <AlertCircle className="text-blue-400 shrink-0 mt-1" size={20} />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Medical Disclaimer</h4>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                TheraFlow is a wellness tool and supportive resource. It is <span className="text-blue-400 font-bold">not</span> a substitute for professional clinical therapy, psychiatric diagnosis, or emergency crisis intervention. If you are in immediate danger, please contact local emergency services or a crisis hotline.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Meta */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950/50 text-center relative z-10">
        <div className="flex justify-center gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
          <Link href="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="text-teal-400">Privacy Policy</Link>
          <Link href="/cookies" className="hover:text-teal-400 transition-colors">Cookie Policy</Link>
        </div>
        <p className="text-[10px] text-slate-700 font-medium uppercase tracking-[0.1em]">
          © 2026 TheraFlow Wellness Platform. All rights reserved.
        </p>
      </footer>

      {/* Mobile Nav Placeholder (to match dashboard) */}
      <nav className="fixed bottom-0 w-full z-[100] bg-[#0b1326]/80 backdrop-blur-2xl border-t border-white/5 px-6 pt-4 pb-8 flex items-center justify-between md:hidden">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-slate-500">
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Dash</span>
        </Link>
        <Link href="/dashboard/mood" className="flex flex-col items-center gap-1.5 text-slate-500">
          <Smile size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Mood</span>
        </Link>
        <Link href="/dashboard/history" className="flex flex-col items-center gap-1.5 text-slate-500">
          <History size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">History</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1.5 text-teal-400">
          <Settings size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Settings</span>
        </Link>
      </nav>

    </div>
  );
}
