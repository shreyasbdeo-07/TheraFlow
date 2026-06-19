"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  Zap, 
  Mail, 
  ArrowRight, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

/**
 * TheraFlow Premium Forgot Password Page
 * Optimized for Next.js 14 App Router & Tailwind CSS
 * Features: Obsidian aesthetic, Glassmorphism, Success States
 */

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitted(true);
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          // For security, show success even if email doesn't exist
          setIsSubmitted(true);
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please wait a moment and try again.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitted(false);
    setError('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-teal-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header / Brand */}
      <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:rotate-6 transition-transform border border-teal-500/20">
            <Zap size={22} fill="currentColor" className="text-teal-400" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">TheraFlow</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        
        <div className="w-full max-w-md space-y-10">
          
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              {isSubmitted ? "Link Dispatched" : "Reset Your Password"}
            </h1>
            <p className="text-slate-400 text-sm max-w-[300px] mx-auto leading-relaxed">
              {isSubmitted 
                ? "We've sent a secure reset link to your email. Please check your inbox and follow the instructions." 
                : "Enter your email address and we'll send you a secure link to regain access to your sanctuary."}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {!isSubmitted ? (
              <form className="space-y-8" onSubmit={handleSubmit}>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-4 py-3 rounded-2xl text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      disabled={loading}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-teal-400/30 transition-all placeholder:text-slate-700 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-400 text-slate-950 font-bold py-4 rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-300 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending Link...</>
                  ) : (
                    <>Send Reset Link<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-8 py-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-teal-400/10 rounded-full flex items-center justify-center mx-auto border border-teal-400/20 shadow-[0_0_30px_rgba(45,212,191,0.1)]">
                  <CheckCircle2 size={40} className="text-teal-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">Email Sent Successfully</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                    Didn't receive it? Check your spam folder or try another email.
                  </p>
                </div>
                <button 
                  onClick={handleResend}
                  className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all text-sm active:scale-95"
                >
                  Resend Email
                </button>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="text-center space-y-8 pb-12">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
            
            <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
              <Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link>
              <Link href="/" className="hover:text-teal-400 transition-colors">Security</Link>
              <Link href="/" className="hover:text-teal-400 transition-colors">Help</Link>
            </div>
          </div>

        </div>
      </main>

      {/* Trust Badge */}
      <div className="fixed bottom-6 w-full flex justify-center z-20">
        <div className="bg-[#0b1326]/80 backdrop-blur-md border border-teal-500/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
          <ShieldCheck size={12} className="text-teal-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">End-to-End Encrypted & Private</span>
        </div>
      </div>

    </div>
  );
}
