import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Briefcase, MapPin, DollarSign, Clock, FileUp, CheckCircle, AlertCircle, Loader, Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';

const JobListings = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search parameters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  // Selected job details modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState({ success: null, text: '' });

  // Recruiter Job Creation States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newExperience, setNewExperience] = useState('Mid');
  const [newLocation, setNewLocation] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newType, setNewType] = useState('Full-time');
  
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let url = '/api/jobs?';
      if (search) url += `search=${search}&`;
      if (location) url += `location=${location}&`;
      if (type) url += `type=${type}&`;
      
      const res = await axios.get(url);
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
    setApplyMessage({ success: null, text: '' });
  };

  const handleApplyJob = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setApplyMessage({ success: false, text: 'Please attach a resume PDF or DOCX file.' });
      return;
    }

    setApplyLoading(true);
    setApplyMessage({ success: null, text: '' });

    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      const res = await axios.post(`/api/jobs/${selectedJob._id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setApplyMessage({
          success: true,
          text: `Applied successfully! ATS Match Score: ${res.data.data?.atsScore || 75}%`
        });
        setResumeFile(null);
      }
    } catch (err) {
      setApplyMessage({
        success: false,
        text: err.response?.data?.error || 'Apply failed. Please verify resume PDF structure.'
      });
    } finally {
      setApplyLoading(false);
    }
  };

  // Job creation handler
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newLocation.trim()) {
      setCreateError('Title, Description, and Location are required fields.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess(false);

    // Format list structures
    const skillsArray = newSkills.split(',').map(s => s.trim()).filter(Boolean);
    const requirementsArray = newRequirements.split(',').map(r => r.trim()).filter(Boolean);

    try {
      const res = await axios.post('/api/jobs', {
        title: newTitle,
        description: newDescription,
        location: newLocation,
        experience: newExperience,
        salary: newSalary || 'Competitive',
        type: newType,
        skills: skillsArray,
        requirements: requirementsArray
      });

      if (res.data.success) {
        setCreateSuccess(true);
        // Clear fields
        setNewTitle('');
        setNewDescription('');
        setNewSkills('');
        setNewRequirements('');
        setNewLocation('');
        setNewSalary('');
        
        // Reload openings
        fetchJobs();
        setTimeout(() => {
          setShowCreateForm(false);
          setCreateSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Could not post new job description.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Job deletion handler
  const handleDeleteJob = async (id, e) => {
    e.stopPropagation(); // Avoid triggering details select
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const res = await axios.delete(`/api/jobs/${id}`);
      if (res.data.success) {
        setJobs(prev => prev.filter(j => j._id !== id));
        if (selectedJob?._id === id) {
          setSelectedJob(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete job posting.');
    }
  };

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Job Search Board</h1>
          <p className="text-slate-400 text-sm">Discover openings matching your qualifications or analyze ATS scores in real-time.</p>
        </div>
        
        {user?.role === 'recruiter' && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-sm font-semibold shadow-lg shadow-primary-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Create New Job</span>
          </button>
        )}
      </div>

      {/* RECRUITER MODAL: Job Creation Form */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass w-full max-w-2xl rounded-3xl border border-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-900/60 bg-slate-950/80 flex justify-between items-center">
              <span className="font-display font-bold text-white text-lg">Post a New Job Opening</span>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 overflow-y-auto flex flex-col gap-4 flex-1 text-left">
              {createError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}
              {createSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>Job posted successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Title *</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lead React Developer"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Location *</label>
                  <input 
                    type="text" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Remote / New York"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Experience Level</label>
                  <select
                    value={newExperience}
                    onChange={(e) => setNewExperience(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-slate-300 outline-none"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Salary Range</label>
                  <input 
                    type="text" 
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. $80k - $100k / Competitive"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Description *</label>
                <textarea
                  rows="4"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline the core responsibilities and team objectives..."
                  className="w-full p-3 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Skills Required (comma separated)</label>
                <input 
                  type="text" 
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Redux"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Core Requirements (comma separated)</label>
                <input 
                  type="text" 
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="e.g. BS in CS, 3+ years experience, Strong analytical skill"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-600/15 flex justify-center items-center gap-2"
                >
                  {createLoading ? <Loader size={14} className="animate-spin" /> : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Panel */}
      <form onSubmit={handleSearchSubmit} className="glass p-5 rounded-2xl border border-slate-900/60 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search roles or keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900 border border-slate-855 focus:border-primary-500/50 text-white text-xs outline-none"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <div className="w-full md:w-56 relative">
          <input 
            type="text" 
            placeholder="City or Remote..." 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900 border border-slate-855 focus:border-primary-500/50 text-white text-xs outline-none"
          />
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full md:w-44 px-3 py-3 bg-slate-900 border border-slate-855 focus:border-primary-500/50 rounded-xl text-xs font-semibold text-slate-400 outline-none"
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Remote">Remote</option>
          <option value="Internship">Internship</option>
        </select>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-primary-600/15"
        >
          Find Jobs
        </button>
      </form>

      {/* Main listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Jobs list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading openings...</div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No jobs matching your filter parameters.</div>
          ) : (
            jobs.map(job => (
              <div 
                key={job._id}
                onClick={() => {
                  setSelectedJob(job);
                  setApplyMessage({ success: null, text: '' });
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3
                  ${selectedJob?._id === job._id 
                    ? 'bg-slate-900/40 border-primary-500/40 shadow-lg shadow-primary-500/5' 
                    : 'bg-slate-900/10 border-slate-900/60 hover:border-slate-850'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{job.title}</span>
                      {user?.role === 'recruiter' && (job.recruiter === user.id || job.recruiter?._id === user.id || typeof job.recruiter === 'string') && (
                        <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-semibold border border-cyan-500/15">
                          My Post
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-455">{job.company?.name || 'Company Core'}</span>
                  </div>
                  
                  {/* Delete button for Recruiters/Admins */}
                  {(user?.role === 'admin' || (user?.role === 'recruiter' && (job.recruiter === user.id || job.recruiter?._id === user.id))) ? (
                    <button
                      onClick={(e) => handleDeleteJob(job._id, e)}
                      className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {job.type}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.skills?.slice(0, 4).map((s, i) => (
                    <span key={i} className="text-[9px] bg-slate-950 px-2 py-0.5 rounded text-slate-455 border border-slate-900">{s}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Job details and apply workspace */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 flex flex-col h-[550px]">
          {selectedJob ? (
            <div className="flex flex-col gap-5 h-full overflow-y-auto pr-2">
              <div className="flex flex-col gap-1.5 border-b border-slate-900/50 pb-4">
                <span className="font-display font-bold text-lg text-white">{selectedJob.title}</span>
                <span className="text-xs text-primary-400 font-semibold">{selectedJob.company?.name || 'Company Profile'}</span>
                <span className="text-[10px] text-slate-500">{selectedJob.location} &bull; {selectedJob.type}</span>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Job Description</span>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-455 uppercase tracking-wider">Requirements</span>
                <ul className="list-disc pl-4 text-xs text-slate-400 flex flex-col gap-1.5">
                  {selectedJob.requirements?.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Candidate Application Workspace */}
              {user?.role === 'candidate' && (
                <div className="border-t border-slate-900/50 pt-5 mt-auto flex flex-col gap-4 bg-slate-950/20 p-4 rounded-2xl border border-slate-900">
                  <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Apply with Resume</span>
                  
                  {applyMessage.text && (
                    <div className={`p-3 rounded-lg border text-[10px] flex items-center gap-2
                      ${applyMessage.success 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                    >
                      {applyMessage.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      <span>{applyMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleApplyJob} className="flex flex-col gap-3">
                    <label className="border border-dashed border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 p-4 rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-2">
                      <FileUp size={18} className="text-slate-500" />
                      <span className="text-[10px] text-slate-400 font-medium">
                        {resumeFile ? resumeFile.name : 'Attach PDF Resume (Max 10MB)'}
                      </span>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={applyLoading}
                      className="w-full py-3 bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-primary-600/15 flex justify-center items-center gap-2"
                    >
                      {applyLoading ? <Loader size={14} className="animate-spin" /> : 'Submit Application'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center flex flex-col items-center justify-center gap-3 text-slate-500">
              <Briefcase size={28} className="text-slate-700" />
              <span className="text-xs">Select a job post from the listing board to review requirements.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;
