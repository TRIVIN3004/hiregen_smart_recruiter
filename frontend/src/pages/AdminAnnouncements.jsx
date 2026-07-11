import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Loader2, CheckCircle2, Users, Clock } from 'lucide-react';
import axios from 'axios';

const AdminAnnouncements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/admin/announcements');
      if (res.data.success) setAnnouncements(res.data.data);
    } catch (err) {
      console.warn('Failed to load announcements:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title.trim() || !message.trim()) {
      setError('Please provide both a title and a message.');
      return;
    }

    setSending(true);
    try {
      const res = await axios.post('/api/admin/announcements', { title, message });
      if (res.data.success) {
        setSuccessMsg(`Announcement sent to ${res.data.data.recipientCount} candidate(s)!`);
        setTitle('');
        setMessage('');
        fetchAnnouncements();
      }
    } catch (err) {
      setError('Failed to send announcement: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Announcements</h1>
        <p className="text-slate-400 text-sm">Send a platform-wide announcement that instantly notifies every candidate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose form */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-900/60 lg:col-span-1 h-fit">
          <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
            <Megaphone size={18} className="text-primary-400" />
            <span>Compose Announcement</span>
          </h3>

          <form onSubmit={handleSend} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Platform Maintenance Notice"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-primary-500/50 rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the announcement message for all candidates..."
                className="w-full p-4 bg-slate-900 border border-slate-800 focus:border-primary-500/50 rounded-xl text-xs leading-relaxed text-slate-300 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-600 hover:from-primary-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send to All Candidates</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sent history */}
        <div className="glass rounded-3xl border border-slate-900/60 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-900/60">
            <h3 className="font-display font-bold text-lg text-white">Sent Announcements</h3>
          </div>

          <div className="flex flex-col divide-y divide-slate-900/40 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs">Loading announcement history...</span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">No announcements sent yet.</div>
            ) : (
              announcements.map(a => (
                <div key={a._id} className="p-6 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-semibold text-sm text-white">{a.title}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock size={12} />
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{a.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Users size={12} />
                      Sent to {a.recipientCount} candidate(s)
                    </span>
                    {a.createdBy?.name && (
                      <span className="text-[10px] text-slate-600">by {a.createdBy.name}</span>
                    )}
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

export default AdminAnnouncements;