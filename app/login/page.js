"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { 
  Zap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight, 
  CheckCircle2,
  Loader2
} from 'lucide-react';

/**
 * TheraFlow Premium Login Page - Production Component
 * Optimized for Next.js 14 App Router & Tailwind CSS
 * Features: Obsidian aesthetic, Glassmorphism, Google SSO, Responsive Layout
 */

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect already-authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        default:
          setError('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show spinner while checking auth state
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1326]">
        <span className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              Welcome Back !
            </h1>
            <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
              Your journey to mental clarity begins here. Welcome back to your sanctuary.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] space-y-8">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-4 py-3 rounded-2xl text-center">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <form className="space-y-6" onSubmit={handleEmailLogin}>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || googleLoading}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-teal-400/30 transition-all placeholder:text-slate-700 text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-teal-400 hover:underline uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || googleLoading}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-teal-400/30 transition-all placeholder:text-slate-700 text-white disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-teal-400 text-slate-950 font-bold py-4 rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-300 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Signing In...</>
                ) : (
                  <>Sign In<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 text-slate-700">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">OR CONTINUE WITH</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            {/* SSO Options */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="text-center space-y-6 pb-12">
            <p className="text-sm text-slate-500">
              New to the flow?{' '}
              <Link href="/signup" className="text-teal-400 font-bold hover:underline">Create account</Link>
            </p>
            
           
          </div>

        </div>
      </main>

    </div>
  );
}
