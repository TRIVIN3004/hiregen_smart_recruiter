import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Terminal, Briefcase, Award, Shield, CheckCircle, ArrowRight, Zap, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-primary-500/30 selection:text-primary-200">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Landing Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-amber-600 flex items-center justify-center font-display font-bold text-white text-xl shadow-lg shadow-primary-600/30">
            H
          </div>
          <span className="font-display font-bold text-2xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            HireGen <span className="text-primary-500 font-medium">AI</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#platform" className="hover:text-white transition-colors">Workflows</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to={user.role === 'admin' ? '/admin' : user.role === 'recruiter' ? '/recruiter' : '/candidate'} 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-sm font-semibold shadow-lg shadow-primary-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-white text-sm font-semibold transition-all hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-20 pb-16 text-center flex flex-col items-center">
        {/* Badge alert */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-400 text-xs font-semibold mb-6 animate-pulse-slow">
          <Zap size={12} className="fill-primary-400" />
          <span>Next-Gen Hiring Driven by Gemini Pro</span>
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-tight max-w-4xl tracking-tight text-white mb-6">
          Automate Your Entire Hiring Pipeline With <span className="bg-gradient-to-r from-primary-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">HireGen AI</span>
        </h1>

        <p className="text-slate-400 text-base md:text-xl max-w-2xl leading-relaxed mb-10">
          Unlock instant resume parsing, accurate ATS scores, mock voice interviews, programming assessments, and visual candidate ranking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link 
            to="/register" 
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] group"
          >
            <span>Start Hiring Now</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a 
            href="#features" 
            className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.03]"
          >
            Explore Features
          </a>
        </div>

        {/* Dashboard Mockup Representation */}
        <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-2xl shadow-primary-600/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950 pointer-events-none z-10" />
          <div className="h-6 flex items-center gap-1.5 px-4 mb-4 border-b border-slate-900/60 pb-3">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <div className="h-4 w-40 bg-slate-900 rounded-md mx-auto text-[9px] text-slate-600 flex items-center justify-center font-mono">
              hiregen-ai.com/candidate/dashboard
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            <div className="border border-slate-900 bg-slate-900/30 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">ATS Resume Compatibility</span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">Optimal</span>
              </div>
              <div className="text-3xl font-display font-bold text-white">85%</div>
              <div className="w-full bg-slate-850 h-2.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-normal">Top matched tags: React, NodeJS, Mongo, REST API</p>
            </div>
            
            <div className="border border-slate-900 bg-slate-900/30 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium block mb-2">AI Interview Assistant</span>
              <p className="text-xs italic text-slate-300 font-medium mb-3">"How would you handle state management across deeply nested components?"</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-primary-500/10 text-primary-400 text-[10px] font-semibold border border-primary-500/20">Listening</span>
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold">01:42</span>
              </div>
            </div>

            <div className="border border-slate-900 bg-slate-900/30 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium block mb-2">Platform Activity Log</span>
              <div className="flex flex-col gap-2 font-mono text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>Candidate Jane applied</span>
                  <span className="text-emerald-400">92% match</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ATS parse completed</span>
                  <span className="text-primary-400">Success</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Interview scheduled</span>
                  <span className="text-cyan-400">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto w-full px-6 py-24 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-4">
            Advanced Intelligence at Every Stage
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Experience our complete suite of AI-driven capabilities structured to make recruitment seamless and reliable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6">
              <Bot size={22} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-3">AI Resume Parser</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Extract experience history, education details, contact information, and skills automatically from PDFs using Gemini and standard parsing engines.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <Terminal size={22} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-3">Coding Assessments</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Assess candidates with coding sandboxes that test Javascript, Python, Go, and C++ with timers, automated checks, and ranking tables.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Briefcase size={22} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-3">Matching & Scoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Directly match resumes with job descriptions to compute ATS percentages, identify missing skills, and suggest improvements.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 relative z-10">
        <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-amber-600 flex items-center justify-center font-display font-bold text-white text-sm">
              H
            </div>
            <span className="font-semibold text-slate-300">HireGen AI</span>
          </div>
          <span>&copy; {new Date().getFullYear()} HireGen AI Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
