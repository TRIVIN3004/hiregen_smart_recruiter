import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileUp, Search, Eye, AlertCircle, ArrowUpRight, CheckCircle2, Clock, Check, HelpCircle } from 'lucide-react';
import axios from 'axios';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          axios.get('/api/applications'),
          axios.get('/api/jobs')
        ]);
        if (appsRes.data.success) setApplications(appsRes.data.data);
        if (jobsRes.data.success) setJobs(jobsRes.data.data.slice(0, 3)); // show top 3 jobs
      } catch (err) {
        console.warn('Error loading dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied': return <Clock size={16} className="text-slate-450" />;
      case 'Under Review': return <Search size={16} className="text-cyan-400" />;
      case 'Interview Scheduled': return <HelpCircle size={16} className="text-primary-400 animate-pulse" />;
      case 'Shortlisted': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'Hired': return <Check size={16} className="text-green-500 font-bold" />;
      default: return <AlertCircle size={16} className="text-red-400" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Applied': return 'bg-slate-900/60 text-slate-400 border-slate-800';
      case 'Under Review': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Interview Scheduled': return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
      case 'Shortlisted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Hired': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Recommended Jobs and Application History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recommended Jobs */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg text-white">Recommended Job Openings</h3>
            <Link to="/jobs" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No jobs posted yet. Check back later!</div>
            ) : (
              jobs.map(job => (
                <div 
                  key={job._id}
                  className="p-4 rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:border-slate-850 hover:bg-slate-900/10 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm text-white">{job.title}</span>
                    <span className="text-xs text-slate-450">{job.company?.name} &bull; {job.location}</span>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">{job.type}</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">{job.experience}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/jobs/${job._id}`}
                    className="self-start sm:self-center px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white"
                  >
                    View Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Application Status tracker */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60">
          <h3 className="font-display font-bold text-lg text-white mb-6">Application History Status</h3>
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                <AlertCircle size={24} className="text-slate-600" />
                <span>You haven't submitted any job applications yet. Go to Search Jobs to get started!</span>
              </div>
            ) : (
              applications.map(app => (
                <div 
                  key={app._id}
                  className="p-4 rounded-2xl border border-slate-900/60 bg-slate-950/20 flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-sm text-white">{app.job?.title}</span>
                    <span className="text-xs text-slate-450">{app.job?.company?.name || 'Company Details'}</span>
                    <span className="text-[10px] text-slate-500">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold flex items-center gap-1.5 ${getStatusStyle(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span>{app.status}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-300">ATS Match: {app.matchPercentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
