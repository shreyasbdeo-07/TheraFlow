"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { 
  Zap, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';

/**
 * TheraFlow Premium Signup Page - Production Component
 * Optimized for Next.js 14 App Router & Tailwind CSS
 * Aesthetic: Obsidian Dark, Glassmorphism, Teal Accents
 */

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const validate = () => {
    if (!displayName.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!email) {
      setError('Please enter your email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name on the Firebase profile
      await updateProfile(userCredential.user, { displayName: displayName.trim() });
      router.push('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Try logging in.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Please try again.');
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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        
        <div className="w-full max-w-md space-y-8">
          
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Begin Your Healing Journey
            </h1>
            <p className="text-slate-400 text-sm max-w-[300px] mx-auto leading-relaxed">
              Step into a sanctuary of mental clarity and personalized support.
            </p>
          </div>

          {/* Signup Card */}
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] space-y-8">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-4 py-3 rounded-2xl text-center">
                {error}
              </div>
            )}

            {/* Form Fields */}
            <form className="space-y-5" onSubmit={handleSignup}>
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                  
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={loading || googleLoading}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-teal-400/30 transition-all placeholder:text-slate-700 text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                  
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || googleLoading}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-teal-400/30 transition-all placeholder:text-slate-700 text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-1">Create Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                   
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] ml-1">Confirm Password</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading || googleLoading}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-teal-400/30 transition-all placeholder:text-slate-700 text-white disabled:opacity-50"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-teal-400 text-slate-950 font-bold py-4 mt-2 rounded-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-300 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 text-slate-700">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">OR</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            {/* SSO Options */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
              className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="bg-white/10 p-1 rounded-md">
                {googleLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
              </div>
              <span>{googleLoading ? 'Signing up...' : 'Continue with Google'}</span>
            </button>

            {/* Privacy Reassurance */}
            <div className="flex justify-center items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5 opacity-60">
                <Lock size={10} className="text-teal-400" />
                <span className="text-[8px] font-bold uppercase tracking-widest">Private</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-60">
                <CheckCircle2 size={10} className="text-teal-400" />
                <span className="text-[8px] font-bold uppercase tracking-widest">Secure</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-60">
                <Zap size={10} className="text-teal-400" />
                <span className="text-[8px] font-bold uppercase tracking-widest">Encrypted</span>
              </div>
            </div>
          </div>

         

        </div>
      </main>

     

    </div>
  );
}
