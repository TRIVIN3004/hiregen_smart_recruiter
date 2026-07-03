import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, FileText, CheckCircle, Save, Plus, Trash2, Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { user, updateLocalProfile } = useAuth();
  
  // State for Candidate profiles
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);

  // States for Recruiter profiles
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load active details
  useEffect(() => {
    if (user) {
      if (user.role === 'candidate' && user.profile) {
        const p = user.profile;
        setTitle(p.title || 'Software Engineer');
        setPhone(p.phone || '');
        setLocation(p.location || '');
        setBio(p.bio || '');
        setSkills(p.skills || []);
        setExperience(p.experience || []);
        setEducation(p.education || []);
      } else if (user.role === 'recruiter' && user.profile) {
        setDesignation(user.profile.designation || 'Recruiter Manager');
        if (user.profile.company) {
          const c = user.profile.company;
          setCompanyName(c.name || '');
          setCompanyWebsite(c.website || '');
          setCompanyIndustry(c.industry || '');
        }
      }
    }
  }, [user]);

  // Skill tags helpers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Education helpers
  const handleAddEducation = () => {
    setEducation([...education, { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }]);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  const handleEducationChange = (index, field, value) => {
    setEducation(prev => prev.map((edu, idx) => idx === index ? { ...edu, [field]: value } : edu));
  };

  // Experience helpers
  const handleAddExperience = () => {
    setExperience([...experience, { company: '', role: '', startDate: '', endDate: '', description: '', current: false }]);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    setExperience(prev => prev.map((exp, idx) => idx === index ? { ...exp, [field]: value } : exp));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (user.role === 'candidate') {
        const payload = { title, phone, location, bio, skills, experience, education };
        const res = await axios.put('/api/candidate/profile', payload);
        if (res.data.success) {
          updateLocalProfile(res.data.data);
          setMessage('Candidate profile successfully updated!');
        }
      } else {
        // Recruiter profile edit mock
        setMessage('Recruiter profile settings saved!');
      }
    } catch (err) {
      setMessage('Failed to save profile configurations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Resume & Profile Builder</h1>
          <p className="text-slate-400 text-sm">Design details that recruiters see when reviewing your applications.</p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
        {message && (
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* SECTION 1: Personal Details */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 flex flex-col gap-5">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <User size={16} className="text-violet-400" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Professional Headline</label>
              <input 
                type="text" 
                value={user?.role === 'candidate' ? title : designation}
                onChange={(e) => user?.role === 'candidate' ? setTitle(e.target.value) : setDesignation(e.target.value)}
                placeholder="e.g. Lead Frontend Developer"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-850/80 focus:border-violet-500/50 rounded-xl text-xs text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location (City, Country)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Paris, France"
                  className="w-full px-4 py-3 pl-11 bg-slate-900 border border-slate-850/80 focus:border-violet-500/50 rounded-xl text-xs text-slate-200 outline-none"
                />
                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Phone</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 612 3456"
                  className="w-full px-4 py-3 pl-11 bg-slate-900 border border-slate-850/80 focus:border-violet-500/50 rounded-xl text-xs text-slate-200 outline-none"
                />
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full px-4 py-3 pl-11 bg-slate-900/50 border border-slate-850/40 rounded-xl text-xs text-slate-500 outline-none cursor-not-allowed"
                />
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Short Bio</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell recruiters about your background, interests and goals..."
              className="w-full p-4 bg-slate-900 border border-slate-850/80 focus:border-violet-500/50 rounded-xl text-xs text-slate-200 outline-none resize-none"
            />
          </div>
        </div>

        {/* CANDIDATE SPECIFIC FIELDS */}
        {user?.role === 'candidate' && (
          <>
            {/* SECTION 2: Skills Tags */}
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 flex flex-col gap-5">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <FileText size={16} className="text-violet-400" />
                <span>Expertise Skills</span>
              </h3>

              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. JavaScript"
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-850/80 focus:border-violet-500/50 rounded-xl text-xs text-slate-200 outline-none"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {skills.length === 0 ? (
                  <span className="text-xs text-slate-500">No skills added yet.</span>
                ) : (
                  skills.map((s, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/5 border border-violet-500/25 text-violet-400 text-xs font-semibold"
                    >
                      <span>{s}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(s)}
                        className="text-violet-500 hover:text-red-400 font-bold ml-1.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 3: Experience Cards */}
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Briefcase size={16} className="text-violet-400" />
                  <span>Work Experience</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="text-xs text-violet-450 hover:text-violet-400 font-bold flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {experience.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500">No work experience listed yet.</div>
                ) : (
                  experience.map((exp, idx) => (
                    <div key={idx} className="p-5 bg-slate-950/30 rounded-2xl border border-slate-900 flex flex-col gap-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="absolute right-4 top-4 p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Company Name</label>
                          <input 
                            type="text" 
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Role Title</label>
                          <input 
                            type="text" 
                            value={exp.role}
                            onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                            placeholder="e.g. Frontend Intern"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Start Date</label>
                          <input 
                            type="text" 
                            value={exp.startDate}
                            onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
                            placeholder="e.g. Jan 2023"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">End Date</label>
                          <input 
                            type="text" 
                            value={exp.endDate}
                            onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
                            placeholder="e.g. Present"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Work Description</label>
                        <textarea
                          rows="2"
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                          placeholder="Outline core actions, technologies used and milestones met..."
                          className="w-full p-3 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none resize-none"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 4: Education Cards */}
            <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <GraduationCap size={16} className="text-violet-400" />
                  <span>Education Profile</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="text-xs text-violet-455 hover:text-violet-400 font-bold flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {education.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500">No education profiles listed yet.</div>
                ) : (
                  education.map((edu, idx) => (
                    <div key={idx} className="p-5 bg-slate-950/30 rounded-2xl border border-slate-900 flex flex-col gap-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="absolute right-4 top-4 p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Institution / University</label>
                          <input 
                            type="text" 
                            value={edu.institution}
                            onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                            placeholder="e.g. Paris University"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Degree / Course</label>
                          <input 
                            type="text" 
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                            placeholder="e.g. Master of Science"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Field of Study</label>
                          <input 
                            type="text" 
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)}
                            placeholder="e.g. Artificial Intelligence"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">Start Year</label>
                            <input 
                              type="text" 
                              value={edu.startYear}
                              onChange={(e) => handleEducationChange(idx, 'startYear', e.target.value)}
                              placeholder="2018"
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1.5">End Year</label>
                            <input 
                              type="text" 
                              value={edu.endYear}
                              onChange={(e) => handleEducationChange(idx, 'endYear', e.target.value)}
                              placeholder="2022"
                              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-850/60 focus:border-violet-500/40 rounded-lg text-xs text-slate-200 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Save size={16} />
          <span>Save Profile Details</span>
        </button>
      </form>
    </div>
  );
};

export default Profile;
