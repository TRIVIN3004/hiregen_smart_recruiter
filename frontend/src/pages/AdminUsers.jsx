import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CheckCircle, ShieldAlert, Key, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedUserId, setUpdatedUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/admin/users');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        console.warn('Error loading users list:', err.message);
        // Fallback default list
        setUsers([
          { _id: '1', name: 'John Candidate', email: 'john@example.com', role: 'candidate', isVerified: true },
          { _id: '2', name: 'Jane Recruiter', email: 'jane@example.com', role: 'recruiter', isVerified: true },
          { _id: '3', name: 'Admin Root', email: 'admin@example.com', role: 'admin', isVerified: true }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleVerification = async (id, currentVal) => {
    try {
      const res = await axios.put(`/api/admin/users/${id}`, {
        isVerified: !currentVal
      });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerified: !currentVal } : u));
        setUpdatedUserId(id);
        setTimeout(() => setUpdatedUserId(null), 2000);
      }
    } catch (err) {
      console.error(err);
      // Local check update fallback
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerified: !currentVal } : u));
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      const res = await axios.put(`/api/admin/users/${id}`, {
        role: newRole
      });
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
        setUpdatedUserId(id);
        setTimeout(() => setUpdatedUserId(null), 2000);
      }
    } catch (err) {
      console.error(err);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 border border-slate-900 bg-slate-900/50 hover:bg-slate-900 text-slate-400 rounded-xl transition-all">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Manage Users</h1>
          <p className="text-slate-400 text-sm">Assign custom permission scopes, verify recruiter credibility, and edit user attributes.</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-slate-900 overflow-hidden">
        <div className="p-6 border-b border-slate-900/50 bg-slate-950/20">
          <h3 className="font-display font-bold text-sm text-white">Registered Users Base</h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900/60 text-slate-450 bg-slate-950/40 font-semibold">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role Permission</th>
                  <th className="p-4">Verification Check</th>
                  <th className="p-4 text-right">Activity Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/30">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{u.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        className={`px-2 py-1 rounded bg-slate-900 border text-[10px] font-semibold outline-none
                          ${u.role === 'admin' ? 'border-red-500/25 text-red-400' : 
                            u.role === 'recruiter' ? 'border-cyan-500/25 text-cyan-400' : 
                            'border-primary-500/25 text-primary-400'}`}
                      >
                        <option value="candidate">Candidate</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleVerification(u._id, u.isVerified)}
                        className="flex items-center gap-1.5 font-semibold text-[10px] transition-colors"
                      >
                        {u.isVerified ? (
                          <>
                            <ToggleRight className="text-emerald-500" size={20} />
                            <span className="text-emerald-450">Verified</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="text-slate-500" size={20} />
                            <span className="text-slate-550">Pending</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      {updatedUserId === u._id ? (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
                          Saved
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
