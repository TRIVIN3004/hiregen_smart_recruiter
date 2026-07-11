import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Users, CheckCircle2, Clock, XCircle, Award, ShieldAlert, Loader2 } from 'lucide-react';
import axios from 'axios';

const statusStyle = (status) => {
  switch (status) {
    case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'In Progress': return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    default: return 'bg-slate-900/60 text-slate-450 border-slate-800';
  }
};

const rankBadge = (rank) => {
  if (rank === 1) return { icon: <Trophy size={16} />, style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  if (rank === 2) return { icon: <Medal size={16} />, style: 'bg-slate-400/10 text-slate-300 border-slate-400/30' };
  if (rank === 3) return { icon: <Medal size={16} />, style: 'bg-orange-700/10 text-orange-400 border-orange-700/30' };
  return { icon: <span className="text-xs font-bold">#{rank}</span>, style: 'bg-slate-900/60 text-slate-400 border-slate-800' };
};

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get('/api/admin/candidates');
        if (res.data.success) {
          setCandidates(res.data.data);
          setTotalCandidates(res.data.totalCandidates);
        }
      } catch (err) {
        setError('Failed to load candidate performance data: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const completedCount = candidates.filter(c => c.status === 'Completed').length;
  const inProgressCount = candidates.filter(c => c.status === 'In Progress').length;
  const notStartedCount = candidates.filter(c => c.status === 'Not Started').length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Candidate Performance</h1>
          <p className="text-slate-400 text-sm">All signed-up candidates ranked by overall assessment performance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl text-xs font-semibold">
          <Users size={16} />
          <span>{totalCandidates} Candidates Signed Up</span>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass p-5 rounded-2xl border border-slate-900/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-xl font-display font-bold text-white block">{completedCount}</span>
            <span className="text-[11px] text-slate-450">Completed all assessments</span>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-900/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-xl font-display font-bold text-white block">{inProgressCount}</span>
            <span className="text-[11px] text-slate-450">In progress</span>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-900/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-center text-slate-450 shrink-0">
            <XCircle size={18} />
          </div>
          <div>
            <span className="text-xl font-display font-bold text-white block">{notStartedCount}</span>
            <span className="text-[11px] text-slate-450">Not started yet</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Leaderboard */}
      <div className="glass rounded-3xl border border-slate-900/60 overflow-hidden">
        <div className="p-6 border-b border-slate-900/60 flex items-center gap-2">
          <Award size={18} className="text-primary-400" />
          <h3 className="font-display font-bold text-lg text-white">Performance Leaderboard</h3>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-xs">Loading candidate rankings...</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">No candidates have signed up yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-900/60">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Aptitude</th>
                  <th className="px-6 py-3">Coding</th>
                  <th className="px-6 py-3">Interview</th>
                  <th className="px-6 py-3">ATS</th>
                  <th className="px-6 py-3">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {candidates.map(c => {
                  const badge = rankBadge(c.rank);
                  return (
                    <tr key={c._id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`w-8 h-8 rounded-lg border flex items-center justify-center ${badge.style}`}>
                          {badge.icon}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{c.name}</span>
                          <span className="text-[11px] text-slate-500">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold ${statusStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {c.aptitude ? (
                          <span className={c.aptitude.passed ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                            {c.aptitude.correctAnswers}/{c.aptitude.totalQuestions}
                          </span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {c.coding ? (
                          <span className="flex items-center gap-1.5">
                            {c.coding.avgScore}/100
                            {c.coding.cheatingFlags > 0 && <ShieldAlert size={12} className="text-red-400" />}
                          </span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {c.interview ? `${c.interview.avgScore}/100` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {c.atsScore > 0 ? `${c.atsScore}%` : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-display font-bold text-white">{c.overallScore}</span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCandidates;