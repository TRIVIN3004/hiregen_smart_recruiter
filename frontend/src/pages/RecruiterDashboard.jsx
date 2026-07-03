import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Briefcase, FileCheck, CheckSquare, Search, 
  ArrowUpRight, Award, Plus, Calendar, Star, Eye, Edit3, Trash2 
} from 'lucide-react';
import axios from 'axios';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard overall totals
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    hired: 0
  });

  // Fetch recruiter jobs and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          axios.get('/api/jobs'),
          axios.get('/api/applications')
        ]);
        
        if (jobsRes.data.success) {
          // Filter jobs posted by this recruiter
          const recruiterJobs = jobsRes.data.data.filter(j => j.recruiter === user?.id || j.recruiter?._id === user?.id);
          setJobs(recruiterJobs);
          
          if (appsRes.data.success) {
            // Applications matching recruiter's jobs
            const recruiterJobIds = recruiterJobs.map(j => j._id);
            const recruiterApps = appsRes.data.data.filter(app => recruiterJobIds.includes(app.job?._id));
            setApplications(recruiterApps);

            // Compute Stats
            const shortlisted = recruiterApps.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length;
            const hired = recruiterApps.filter(a => a.status === 'Hired').length;
            setStats({
              totalJobs: recruiterJobs.length,
              totalApplicants: recruiterApps.length,
              shortlisted,
              hired
            });
          }
        }
      } catch (err) {
        console.warn('Error loading recruiter stats:', err.message);
        // Fallback mockup details
        setStats({
          totalJobs: 4,
          totalApplicants: 12,
          shortlisted: 5,
          hired: 2
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Recruiter Command Board</h1>
          <p className="text-slate-400 text-sm">Post target openings, evaluate matching applicants, and monitor hiring pipeline progress.</p>
        </div>
        <Link 
          to="/jobs" 
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-sm font-semibold shadow-lg shadow-primary-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass p-6 rounded-2xl border border-slate-900/60 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Briefcase size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-450 uppercase tracking-wider block">Active Openings</span>
            <span className="text-2xl font-display font-bold text-white">{stats.totalJobs}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-900/60 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-450 uppercase tracking-wider block">Total Candidates</span>
            <span className="text-2xl font-display font-bold text-white">{stats.totalApplicants}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-900/60 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center text-yellow-450">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-450 uppercase tracking-wider block">Shortlisted</span>
            <span className="text-2xl font-display font-bold text-white">{stats.shortlisted}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-900/60 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileCheck size={20} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-450 uppercase tracking-wider block">Offers Hired</span>
            <span className="text-2xl font-display font-bold text-white">{stats.hired}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom SVG Funnel Chart */}
        <div className="glass p-6 rounded-3xl border border-slate-900/60 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white mb-2">Hiring Funnel Analytics</h3>
            <p className="text-xs text-slate-450 mb-6">Status tracking of active candidate application pools.</p>
          </div>
          
          <div className="flex flex-col gap-4 my-auto">
            {/* Custom visual progress bars for funnel stages */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">1. Applied Candidates</span>
                <span className="font-bold text-white">{stats.totalApplicants}</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-amber-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">2. Shortlisted & Scheduled</span>
                <span className="font-bold text-white">{stats.shortlisted}</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" 
                     style={{ width: `${stats.totalApplicants ? (stats.shortlisted / stats.totalApplicants) * 100 : 40}%` }} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">3. Successfully Hired</span>
                <span className="font-bold text-white">{stats.hired}</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full" 
                     style={{ width: `${stats.totalApplicants ? (stats.hired / stats.totalApplicants) * 100 : 15}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ATS average distribution info card */}
        <div className="glass p-6 rounded-3xl border border-slate-900/60 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white mb-2">ATS Score Breakdown</h3>
            <p className="text-xs text-slate-450 mb-6">Distribution check of candidate qualification levels.</p>
          </div>

          <div className="flex flex-col gap-3.5 my-auto">
            <div className="flex justify-between items-center text-xs text-slate-350">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 80% to 100% (High Match)</span>
              <span className="font-bold text-white">4 Candidates</span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-350">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> 60% to 79% (Medium Match)</span>
              <span className="font-bold text-white">6 Candidates</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-350">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Below 60% (Poor Match)</span>
              <span className="font-bold text-white">2 Candidates</span>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-500 border-t border-slate-900/50 pt-3">
            Recruiter profile reference: {user?.name || 'Recruiter'}
          </div>
        </div>
      </div>

      {/* Recruiter Job Listings & Applications review */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recruiter active postings */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg text-white">Your Job Openings</h3>
            <span className="text-xs text-slate-450 font-mono">Total postings: {stats.totalJobs}</span>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                You haven't posted any jobs yet. Post one to receive candidates!
              </div>
            ) : (
              jobs.map(job => (
                <div 
                  key={job._id}
                  className="p-5 rounded-2xl border border-slate-900/60 bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-850 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm text-white">{job.title}</span>
                    <span className="text-xs text-slate-450">{job.location} &bull; {job.type}</span>
                    <span className="text-[10px] text-slate-550">Created on: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => alert('Editing job status logic details...')}
                      className="p-2 text-slate-450 hover:text-violet-400 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Candidate Applicants rankings */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg text-white">AI Candidate Ranks</h3>
            <span className="text-xs text-violet-400 font-semibold flex items-center gap-1">
              <span>Shortlist</span>
              <Award size={14} />
            </span>
          </div>

          <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active applicants yet.
              </div>
            ) : (
              applications
                .sort((a, b) => b.matchPercentage - a.matchPercentage)
                .map(app => (
                  <div 
                    key={app._id}
                    className="p-4 rounded-xl border border-slate-900/50 bg-slate-950/20 hover:border-slate-800 transition-all flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-white">{app.candidate?.name}</span>
                        <span className="text-[10px] text-slate-500">{app.job?.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold
                        ${app.matchPercentage >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-violet-500/10 text-violet-400'}`}
                      >
                        {app.matchPercentage}% Match
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] border-t border-slate-900/60 pt-2 text-slate-450 mt-1">
                      <span>Status: {app.status}</span>
                      <button 
                        onClick={() => alert(`Reviewing details for candidate: ${app.candidate?.name}`)}
                        className="text-violet-450 hover:text-violet-400 font-semibold"
                      >
                        Review Profile
                      </button>
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

export default RecruiterDashboard;
