import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle, Loader, UserSquare, ShieldCheck } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate'); // candidate, admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);

    if (result.success) {
      if (role === 'admin') navigate('/admin');
      else navigate('/candidate');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-6 relative selection:bg-primary-500/30">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 py-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-amber-600 flex items-center justify-center font-display font-bold text-white text-xl shadow-lg shadow-primary-600/30">
              H
            </div>
            <span className="font-display font-bold text-2xl text-white">HireGen AI</span>
          </Link>
          <p className="text-slate-400 text-sm">Create an account to join the platform</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-900 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">Select Your Profile Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all duration-200
                    ${role === 'candidate' 
                      ? 'bg-primary-600/10 border-primary-500 text-primary-400 shadow-lg shadow-primary-500/5' 
                      : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-900'}`}
                >
                  <UserSquare size={18} />
                  <span>Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all duration-200
                    ${role === 'admin' 
                      ? 'bg-red-600/10 border-red-500 text-red-400 shadow-lg shadow-red-500/5' 
                      : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-350 hover:bg-slate-900'}`}
                >
                  <ShieldCheck size={18} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 text-white text-sm transition-all outline-none"
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 text-white text-sm transition-all outline-none"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-900 border border-slate-800 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 text-white text-sm transition-all outline-none"
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;