import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileUp, ListChecks } from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();

  const atsScore = user?.profile?.atsScore || 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Candidate Dashboard</h1>
          <p className="text-slate-400 text-sm">Monitor your resume evaluations, active applications, and practice interviews.</p>
        </div>
        <Link 
          to="/profile" 
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-sm font-semibold shadow-lg shadow-primary-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <FileUp size={16} />
          <span>Upload Resume</span>
        </Link>
      </div>

      {/* Main Grid: ATS and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ATS score gauge */}
        <div className="glass p-6 rounded-3xl flex flex-col justify-between h-64 border border-slate-900/60">
          <span className="text-sm font-semibold text-slate-400 block">Overall ATS Score Compatibility</span>
          <div className="flex items-center gap-6 my-auto">
            {/* Circle gauge representation */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="56" cy="56" r="48" 
                  stroke={atsScore > 75 ? "#10b981" : atsScore > 50 ? "#8b5cf6" : "#f43f5e"} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - atsScore / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute font-display font-extrabold text-2xl text-white">
                {atsScore}%
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400">Score Range:</span>
              <span className={`text-sm font-bold uppercase tracking-wider
                ${atsScore > 75 ? 'text-emerald-400' : atsScore > 50 ? 'text-primary-400' : 'text-red-400'}`}
              >
                {atsScore > 75 ? 'Excellent' : atsScore > 50 ? 'Average Match' : 'Action Required'}
              </span>
              <span className="text-[11px] text-slate-500 leading-normal">Score computed based on skills matched, text structure, and layout formatting.</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-450 border-t border-slate-900/60 pt-3">
            Last evaluated: {user?.profile?.resumePath ? 'Evaluated' : 'No Resume Uploaded'}
          </div>
        </div>

        {/* Info card 2 */}
        <div className="glass p-6 rounded-3xl flex flex-col justify-between h-64 border border-slate-900/60">
          <span className="text-sm font-semibold text-slate-400">Mock Interview Readiness</span>
          <div className="my-auto">
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Practice realistic technical interviews with our custom conversational AI to boost confidence and rating outputs.</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-display font-bold text-white">Ready</span>
            </div>
          </div>
          <Link 
            to="/candidate/interview" 
            className="w-full py-3 rounded-xl border border-slate-800 bg-slate-900/35 hover:bg-slate-900 text-center text-xs font-semibold text-primary-400 transition-colors"
          >
            Start Practice Interview
          </Link>
        </div>

        {/* Info card 3 */}
        <div className="glass p-6 rounded-3xl flex flex-col justify-between h-64 border border-slate-900/60">
          <span className="text-sm font-semibold text-slate-400">Assessments Taken</span>
          <div className="my-auto flex flex-col gap-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-900/30 pb-2 text-slate-355">
              <span>Javascript check</span>
              <span className="text-emerald-400 font-semibold">Passed (90%)</span>
            </div>
            <div className="flex justify-between border-b border-slate-900/30 pb-2 text-slate-355">
              <span>Python assessment</span>
              <span className="text-primary-400 font-semibold">Attempted (80%)</span>
            </div>
          </div>
          <Link 
            to="/candidate/coding" 
            className="w-full py-3 rounded-xl border border-slate-800 bg-slate-900/35 hover:bg-slate-900 text-center text-xs font-semibold text-primary-400 transition-colors"
          >
            Open Coding Assessment
          </Link>
        </div>

        {/* Info card 4: Aptitude Test */}
        <div className="glass p-6 rounded-3xl flex flex-col justify-between h-64 border border-slate-900/60">
          <span className="text-sm font-semibold text-slate-400">Aptitude Assessment</span>
          <div className="my-auto">
            <p className="text-xs text-slate-400 leading-relaxed mb-4">30 AI-generated MCQs covering logical reasoning, quantitative, verbal, and pattern recognition. 40-minute timer.</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-display font-bold text-white">15/30</span>
              <span className="text-xs text-slate-500">to pass</span>
            </div>
          </div>
          <Link 
            to="/candidate/aptitude" 
            className="w-full py-3 rounded-xl border border-slate-800 bg-slate-900/35 hover:bg-slate-900 text-center text-xs font-semibold text-primary-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <ListChecks size={14} />
            <span>Start Aptitude Test</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;