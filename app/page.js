"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Menu, 
  X, 
  Smile, 
  MessageSquare, 
  Play, 
  ChevronRight,
  Shield,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';


const NavLink = ({ href, children }) => (
  <Link href={href} className="text-slate-400 hover:text-teal-400 font-medium transition-colors text-sm tracking-tight">
    {children}
  </Link>
);

const FeatureCard = ({ icon: Icon, title, description, badge }) => (
  <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] hover:bg-slate-800/60 transition-all duration-500 overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/10 transition-all"></div>
    <div className="relative z-10 space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform duration-500">
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-teal-400 transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
      {badge && (
        <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest border border-teal-500/20">
          {badge}
        </span>
      )}
    </div>
  </div>
);

const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-2xl transition-all active:scale-[0.98]";
  const variants = {
    primary: "bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30",
    secondary: "bg-slate-800/50 text-white border border-white/10 hover:bg-slate-700/50 backdrop-blur-md",
    outline: "border border-white/10 text-white hover:bg-white/5"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Main Page Component ---

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0b1326] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-[100] bg-[#0b1326]/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:rotate-6 transition-transform">
              <Zap size={22} fill="currentColor" className="text-teal-400" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">TheraFlow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#method">Method</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/privacy">Privacy</NavLink>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-white hover:text-teal-400 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 font-bold py-2.5 px-6 rounded-2xl transition-all active:scale-[0.98] bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 text-sm">
              Sign Up
            </Link>
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
         
          
          <h1 className="text-5xl md:text-8xl font-bold text-white leading-[1.1] tracking-tight">
            A Safe Space to Talk, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-blue-500">Reflect & Heal</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
           Your safe space to reflect, grow, and feel better..
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold py-5 px-12 rounded-2xl transition-all active:scale-[0.98] bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-2xl shadow-teal-500/40 text-lg">
              Start Your Journey
            </Link>
            <Link href="/about" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold py-5 px-12 rounded-2xl transition-all active:scale-[0.98] bg-slate-800/50 text-white border border-white/10 hover:bg-slate-700/50 backdrop-blur-md text-lg">
              Explore Method
            </Link>
          </div>
        </div>

        {/* Abstract Hero Visual (Simulating the App Interface) */}
        <div className="mt-24 max-w-6xl mx-auto relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-4 md:p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
            
            
            <div className="p-6 md:p-12 space-y-10 min-h-[400px] flex flex-col justify-center">
              <div className="flex gap-4 max-w-xl">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 shrink-0 flex items-center justify-center text-teal-400 border border-teal-500/20">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div className="bg-slate-900/80 border border-white/5 p-6 rounded-[2rem] rounded-tl-none text-slate-300 leading-relaxed shadow-xl">
                  Hello, User. I've noticed you've been a bit more active today. How are you feeling in this moment?
                </div>
              </div>

              <div className="flex gap-4 max-w-xl self-end flex-row-reverse">
              <div className="bg-teal-400 text-slate-950 font-semibold p-6 rounded-[2rem] rounded-tr-none shadow-xl shadow-teal-500/10">
                  I'm feeling a bit overwhelmed with work, but trying to stay calm.
                </div>
              </div>

              <div className="flex gap-4 max-w-xl animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 shrink-0 flex items-center justify-center text-teal-400 border border-teal-500/20">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div className="bg-slate-900/40 border border-teal-500/30 p-6 rounded-[2rem] rounded-tl-none text-teal-400 italic font-medium">
                  TheraFlow is typing...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">Toolkit</span>
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Personalized Wellness</h2>
            </div>
            <p className="text-slate-400 max-w-md text-lg">
              Scientifically-backed tools adapted to your unique emotional patterns and daily needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Smile}
              title="Mood Tracker"
              description="Visualize your emotional landscape over time with advanced sentiment mapping and correlation analysis."
              badge="Insight Ready"
            />
            <FeatureCard 
              icon={MessageSquare}
              title="Smart Journal"
              description="Intelligent prompts and NLP-driven insights to unlock deeper self-reflection and identify hidden triggers."
              badge="AI Enhanced"
            />
            <FeatureCard 
              icon={Zap}
              title="Guided Meditation"
              description="Binaural beats and immersive soundscapes for reaching deep states of calm and mental clarity."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Quote */}
      <section className="py-32 px-6 border-y border-white/5 bg-slate-950/20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="text-teal-500/20">
            <MessageSquare size={64} fill="currentColor" className="mx-auto" />
          </div>
          <blockquote className="text-3xl md:text-5xl font-medium text-white italic leading-tight tracking-tight">
            "TheraFlow didn't just track my mood; it helped me <span className="text-teal-400">understand the rhythm</span> of my soul and provided tools I didn't know I needed."
          </blockquote>
          
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 to-transparent"></div>
        <div className="max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 md:p-24 text-center space-y-12 shadow-2xl relative z-10">
          <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
            Ready to start your <br/> healing journey?
          </h2>
          <p className="text-slate-400 text-xl max-w-xl mx-auto">
            Your path to better mental wellness starts here..
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold py-6 px-16 rounded-2xl transition-all active:scale-[0.98] bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-lg shadow-teal-500/20 text-xl group">
              Get Started for Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
        </div>
      </section>

    
    </div>
  );
}
