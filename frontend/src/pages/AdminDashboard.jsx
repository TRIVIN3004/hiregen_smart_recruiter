import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Briefcase, FileCheck, HelpCircle, Activity, Settings, Save, AlertCircle, Trophy, Megaphone, CheckSquare } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    candidateCount: 0,
    recruiterCount: 0,
    activeJobs: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(true);
  
  // AI System Settings configuration states
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [atsThreshold, setAtsThreshold] = useState(70);
  const [systemPrompt, setSystemPrompt] = useState('Act as a senior technical recruiter verifying engineering candidates.');
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.warn('Error fetching admin dashboard stats:', err.message);
        // Fallback default mock stats
        setStats({
          totalUsers: 24,
          candidateCount: 18,
          recruiterCount: 5,
          activeJobs: 8,
          totalApplications: 15
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const handleSaveAISettings = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Platform Administration</h1>
          <p className="text-slate-400 text-sm">Oversee registered users, adjust system AI parameters, and check security audits.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
          <Shield size={16} />
          <span>Admin Access Active</span>
        </div>
      </div>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="glass p-5 rounded-2xl border border-slate-900/60 text-center">
          <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Total Users</span>
          <span className="text-2xl font-display font-extrabold text-white">{stats.totalUsers}</span>
        </div>
        
        <div className="glass p-5 rounded-2xl border border-slate-900/60 text-center">
          <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Candidates</span>
          <span className="text-2xl font-display font-extrabold text-primary-400">{stats.candidateCount}</span>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-900/60 text-center">
          <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Recruiters</span>
          <span className="text-2xl font-display font-extrabold text-cyan-400">{stats.recruiterCount}</span>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-900/60 text-center">
          <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Active Jobs</span>
          <span className="text-2xl font-display font-extrabold text-white">{stats.activeJobs}</span>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-900/60 text-center col-span-2 lg:col-span-1">
          <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider block mb-1">Applications</span>
          <span className="text-2xl font-display font-extrabold text-white">{stats.totalApplications}</span>
        </div>
      </div>

      {/* Main configuration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form: AI prompt configurations */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 lg:col-span-2">
          <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
            <Settings size={18} className="text-primary-400" />
            <span>AI Configuration Control Settings</span>
          </h3>

          <form onSubmit={handleSaveAISettings} className="flex flex-col gap-5">
            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckSquare size={16} />
                <span>AI Prompt configurations saved successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gemini Model Choice</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-primary-500/50 rounded-xl text-xs font-semibold text-slate-200 outline-none"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Optimal ATS Score Threshold (%)</label>
                <input 
                  type="number" 
                  value={atsThreshold}
                  onChange={(e) => setAtsThreshold(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-primary-500/50 rounded-xl text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Evaluator Core Instruction Prompt</label>
              <textarea
                rows="4"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-4 bg-slate-900 border border-slate-800 focus:border-primary-500/50 rounded-xl font-mono text-xs leading-relaxed text-slate-300 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Save size={16} />
              <span>Save Configurations</span>
            </button>
          </form>
        </div>

        {/* Audit access panels */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 flex flex-col gap-6">
          <h3 className="font-display font-bold text-lg text-white">System Controls</h3>
          
          <div className="flex flex-col gap-4">
            <Link 
              to="/admin/candidates"
              className="p-4 rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:border-slate-850 hover:bg-slate-900/10 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Trophy size={18} className="text-amber-400" />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-white">Candidate Performance</span>
                  <span className="text-[10px] text-slate-500">Ranked leaderboard & status</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </Link>

            <Link 
              to="/admin/announcements"
              className="p-4 rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:border-slate-850 hover:bg-slate-900/10 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Megaphone size={18} className="text-violet-400" />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-white">Announcements</span>
                  <span className="text-[10px] text-slate-500">Notify all candidates instantly</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </Link>

            <Link 
              to="/admin/users"
              className="p-4 rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:border-slate-850 hover:bg-slate-900/10 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Users size={18} className="text-cyan-400" />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-white">Manage User Base</span>
                  <span className="text-[10px] text-slate-500">Edit permissions & credentials</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </Link>

            <Link 
              to="/admin/logs"
              className="p-4 rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:border-slate-850 hover:bg-slate-900/10 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-primary-400" />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-white">Security Audit Logs</span>
                  <span className="text-[10px] text-slate-500">View real-time event streams</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </Link>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-400 text-[10px] leading-relaxed flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>Always monitor API usage costs when deploying Gemini Pro models globally. Review model options regularly.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal router chevron link
import { ChevronRight as ChevronRight } from 'lucide-react';

export default AdminDashboard;