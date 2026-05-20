import React, { useState, useEffect } from 'react';
import { Music, Guitar, Piano, Loader2, Code2, Layers, BookOpen, PenTool } from 'lucide-react';
import { signInWithGoogle, auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from '../lib/utils';

interface LoginScreenProps {
  onSelectInstrument: (instrument: string) => void;
}

export function LoginScreen({ onSelectInstrument }: LoginScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'fretboard' | 'lilypond' | 'custom'>('library');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const features = {
    library: {
      title: "Comprehensive Scale Library",
      description: "Access a massive database of scales and modes. From standard major/minor to exotic modes. View spelling, intervals, and related information instantly.",
      icon: <BookOpen className="w-6 h-6 text-amber-500" />
    },
    fretboard: {
      title: "Interactive Visualization",
      description: "See scales mapped out on full interactive fretboards for Guitar and Bass, or a traditional 88-key Piano. Understand fingering and patterns visually.",
      icon: <Layers className="w-6 h-6 text-indigo-400" />
    },
    lilypond: {
      title: "Instant Sheet Music & Tab",
      description: "Auto-generate beautiful standard notation and tablature using VexFlow. Export standard LilyPond (.ly) source files for professional engraving.",
      icon: <Code2 className="w-6 h-6 text-emerald-400" />
    },
    custom: {
      title: "Custom Composer",
      description: "Click notes on the fretboard or keyboard to build your own custom scales, runs, or riffs. Play them back and export the generated notation.",
      icon: <PenTool className="w-6 h-6 text-rose-400" />
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F11] flex flex-col md:flex-row text-gray-200 font-sans">
      
      {/* Left Column - Features & Overview */}
      <div className="flex-1 p-8 md:p-16 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center relative overflow-hidden bg-[#161618]">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-xl mx-auto md:mx-0 w-full relative z-10">
          <div className="flex items-center space-x-3 text-white font-bold text-3xl tracking-tight mb-10">
            <Music className="w-8 h-8 text-amber-500" />
            <span>LowEnd<span className="text-amber-500">Library</span></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Master your instrument's <br/>
            <span className="text-amber-500">harmonic landscape.</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-12 max-w-lg">
            Scale catalogs, interactive fretboards, and professional notation exports for string and keyboard instruments.
          </p>

          <div className="flex flex-col space-y-2 mb-8">
            <div className="flex space-x-2 md:space-x-4 mb-4 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
              {(Object.keys(features) as Array<keyof typeof features>).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors",
                    activeTab === key 
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="bg-black/20 border border-white/5 rounded-xl p-6 min-h-[140px] transition-all">
              <div className="flex items-center mb-3 space-x-3">
                {features[activeTab].icon}
                <h3 className="text-xl font-bold text-gray-100">{features[activeTab].title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                {features[activeTab].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login / Instrument Select */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-[#0F0F11]">
        <div className="max-w-md w-full bg-[#161618] border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col">
          
          {!user ? (
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Sign in to access the comprehensive library and custom composer tools.</p>
              </div>

              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Instrument</h2>
                <p className="text-gray-400 text-sm">Select an instrument to start exploring.</p>
              </div>

              <div className="w-full space-y-4">
                <button
                  onClick={() => onSelectInstrument('bass4')}
                  className="w-full flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded bg-black/40 flex items-center justify-center mr-4 group-hover:bg-amber-500/20">
                    <Guitar className="w-6 h-6 text-gray-400 group-hover:text-amber-500" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium text-lg">Bass Guitar</div>
                    <div className="text-xs text-gray-500">Standard 4-String (EADG)</div>
                  </div>
                </button>
      
                <button
                  onClick={() => onSelectInstrument('guitar6')}
                  className="w-full flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded bg-black/40 flex items-center justify-center mr-4 group-hover:bg-amber-500/20">
                    <Guitar className="w-6 h-6 text-gray-400 group-hover:text-amber-500" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium text-lg">Guitar</div>
                    <div className="text-xs text-gray-500">Standard 6-String (EADGBE)</div>
                  </div>
                </button>
      
                <button
                  onClick={() => onSelectInstrument('piano')}
                  className="w-full flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded bg-black/40 flex items-center justify-center mr-4 group-hover:bg-amber-500/20">
                    <Piano className="w-6 h-6 text-gray-400 group-hover:text-amber-500" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-medium text-lg">Piano</div>
                    <div className="text-xs text-gray-500">Standard 88-Key Keyboard</div>
                  </div>
                </button>
              </div>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 w-full text-center">
            <p className="text-xs text-gray-600 font-medium">
              Made with VexFlow & LilyPond Support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

